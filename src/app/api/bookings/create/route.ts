import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { emailService } from '@/lib/email'
import GoogleCalendarService from '@/lib/google-calendar'
import { calculateEndTime, parseDateTimeString, isValidBookingTime, isTimeSlotAvailable } from '@/lib/utils'

const createBookingSchema = z.object({
  customerName: z.string().min(2, 'Nama minimal 2 karakter'),
  email: z.string().email('Email tidak valid'),
  phone: z.string().min(10, 'Nomor WhatsApp tidak valid'),
  barberId: z.string().min(1, 'Pilih barber'),
  serviceId: z.string().min(1, 'Pilih layanan'),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Format tanggal tidak valid'),
  time: z.string().regex(/^\d{2}:\d{2}$/, 'Format waktu tidak valid'),
  paymentMethod: z.enum(['QRIS', 'CASH'], 'Pilih metode pembayaran'),
  notes: z.string().optional()
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validatedData = createBookingSchema.parse(body)

    // Parse datetime
    const startTime = parseDateTimeString(validatedData.date, validatedData.time)

    // Validate booking time
    if (!isValidBookingTime(startTime)) {
      return NextResponse.json(
        { error: 'Waktu booking tidak valid. Pilih waktu di hari kerja (Senin-Sabtu) jam 09:00-19:00 dan minimal besok.' },
        { status: 400 }
      )
    }

    // Get barber and service data
    const [barber, service] = await Promise.all([
      prisma.barber.findFirst({
        where: { id: validatedData.barberId, isActive: true }
      }),
      prisma.service.findFirst({
        where: { id: validatedData.serviceId, isActive: true }
      })
    ])

    if (!barber) {
      return NextResponse.json(
        { error: 'Barber tidak ditemukan' },
        { status: 404 }
      )
    }

    if (!service) {
      return NextResponse.json(
        { error: 'Layanan tidak ditemukan' },
        { status: 404 }
      )
    }

    // Calculate end time
    const endTime = calculateEndTime(startTime, service.duration)

    // Check for conflicts with existing bookings
    const existingBookings = await prisma.booking.findMany({
      where: {
        barberId: validatedData.barberId,
        startTime: {
          gte: new Date(validatedData.date + 'T00:00:00.000Z'),
          lt: new Date(validatedData.date + 'T23:59:59.999Z')
        },
        status: {
          in: ['PENDING_PAYMENT', 'CONFIRMED']
        }
      },
      select: {
        startTime: true,
        endTime: true
      }
    })

    if (!isTimeSlotAvailable(startTime, endTime, existingBookings)) {
      return NextResponse.json(
        { error: 'Slot waktu sudah terboking. Pilih waktu lain.' },
        { status: 409 }
      )
    }

    // Create booking using transaction
    const result = await prisma.$transaction(async (tx) => {
      // Create booking
      const booking = await tx.booking.create({
        data: {
          customerName: validatedData.customerName,
          email: validatedData.email,
          phone: validatedData.phone,
          barberId: validatedData.barberId,
          serviceId: validatedData.serviceId,
          startTime,
          endTime,
          duration: service.duration,
          status: validatedData.paymentMethod === 'CASH' ? 'CONFIRMED' : 'PENDING_PAYMENT',
          notes: validatedData.notes
        },
        include: {
          barber: true,
          service: true
        }
      })

      // Create payment record
      const payment = await tx.payment.create({
        data: {
          bookingId: booking.id,
          amount: service.price,
          method: validatedData.paymentMethod === 'CASH' ? 'CASH' : 'QRIS',
          status: validatedData.paymentMethod === 'CASH' ? 'PENDING' : 'PENDING'
        }
      })

      return { booking, payment }
    })

    // Send notification email and create calendar event (don't wait for completion)
    Promise.all([
      sendBookingNotifications(result.booking),
      createCalendarEvent(result.booking)
    ]).catch(error => {
      console.error('Error sending notifications or creating calendar event:', error)
    })

    return NextResponse.json({
      success: true,
      booking: {
        id: result.booking.id,
        customerName: result.booking.customerName,
        email: result.booking.email,
        phone: result.booking.phone,
        startTime: result.booking.startTime,
        endTime: result.booking.endTime,
        duration: result.booking.duration,
        status: result.booking.status,
        barber: result.booking.barber,
        service: result.booking.service
      },
      payment: {
        id: result.payment.id,
        amount: result.payment.amount,
        method: result.payment.method,
        status: result.payment.status
      }
    })

  } catch (error) {
    console.error('Error creating booking:', error)

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { 
          error: 'Data tidak valid', 
          details: error.issues.map((e: any) => ({
            field: e.path.join('.'),
            message: e.message
          }))
        },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Terjadi kesalahan saat membuat booking' },
      { status: 500 }
    )
  }
}

// Helper function to send booking notifications
async function sendBookingNotifications(bookingData: any) {
  try {
    // Send notification to admin
    await emailService.sendBookingEmailToAdmin({
      ...bookingData,
      service: {
        ...bookingData.service,
        price: Number(bookingData.service.price)
      }
    })

    // Send confirmation to customer
    await emailService.sendBookingEmailToCustomer({
      ...bookingData,
      service: {
        ...bookingData.service,
        price: Number(bookingData.service.price)
      }
    }, 'confirmation')

    console.log('Booking notifications sent successfully')
  } catch (error) {
    console.error('Error sending booking notification:', error)
  }
}

// Helper function to create Google Calendar event
async function createCalendarEvent(bookingData: any) {
  try {
    // Get email settings
    const settings = await prisma.emailSettings.findFirst({
      where: { isActive: true }
    })

    if (!settings?.googleAccessToken || !settings?.googleRefreshToken) {
      console.log('Google Calendar not configured - skipping calendar event creation')
      return
    }

    const calendarService = new GoogleCalendarService()
    calendarService.setCredentials(settings.googleAccessToken, settings.googleRefreshToken)

    const event = {
      title: `${bookingData.service.name} - ${bookingData.customerName}`,
      description: `
Booking Details:
- Customer: ${bookingData.customerName}
- Email: ${bookingData.email}
- Phone: ${bookingData.phone}
- Service: ${bookingData.service.name}
- Barber: ${bookingData.barber.name}
- Price: Rp ${Number(bookingData.service.price).toLocaleString('id-ID')}
- Notes: ${bookingData.notes || 'None'}
- Booking ID: ${bookingData.id}
      `.trim(),
      startTime: new Date(bookingData.startTime),
      endTime: new Date(bookingData.endTime),
      attendeeEmail: bookingData.email,
      location: 'Modern Barbershop'
    }

    await calendarService.createCalendarEvent(event, settings.calendarId || 'primary')
    console.log('Calendar event created successfully')
  } catch (error) {
    console.error('Error creating calendar event:', error)
  }
}