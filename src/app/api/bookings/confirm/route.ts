import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { emailService } from '@/lib/email'
import { calendarService } from '@/lib/calendar'
import { z } from 'zod'

const confirmBookingSchema = z.object({
  bookingId: z.string().min(1, 'Booking ID diperlukan'),
  action: z.enum(['confirm', 'cancel']),
  notes: z.string().optional()
})

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { bookingId, action, notes } = confirmBookingSchema.parse(body)

    // Get booking with related data
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        barber: true,
        service: true,
        payments: true
      }
    })

    if (!booking) {
      return NextResponse.json(
        { error: 'Booking tidak ditemukan' },
        { status: 404 }
      )
    }

    if (booking.status === 'CONFIRMED' && action === 'confirm') {
      return NextResponse.json(
        { error: 'Booking sudah dikonfirmasi' },
        { status: 400 }
      )
    }

    if (booking.status === 'CANCELLED' && action === 'cancel') {
      return NextResponse.json(
        { error: 'Booking sudah dibatalkan' },
        { status: 400 }
      )
    }

    // Perform action in transaction
    const result = await prisma.$transaction(async (tx) => {
      let updatedBooking
      let calendarEventId = booking.eventId

      if (action === 'confirm') {
        // Update booking status to CONFIRMED
        updatedBooking = await tx.booking.update({
          where: { id: bookingId },
          data: {
            status: 'CONFIRMED',
            notes: notes || booking.notes
          },
          include: {
            barber: true,
            service: true,
            payments: true
          }
        })

        // Update payment status to PAID (for manual confirmation)
        await tx.payment.updateMany({
          where: {
            bookingId: bookingId,
            status: 'PENDING'
          },
          data: {
            status: 'PAID',
            paidAt: new Date()
          }
        })

        // Create calendar event if not exists
        if (!booking.eventId) {
          const eventId = await calendarService.createCalendarEvent({
            ...updatedBooking,
            service: {
              ...updatedBooking.service,
              price: Number(updatedBooking.service.price)
            }
          })
          if (eventId) {
            calendarEventId = eventId
            await tx.booking.update({
              where: { id: bookingId },
              data: { eventId }
            })
          }
        }

      } else if (action === 'cancel') {
        // Update booking status to CANCELLED
        updatedBooking = await tx.booking.update({
          where: { id: bookingId },
          data: {
            status: 'CANCELLED',
            notes: notes || booking.notes
          },
          include: {
            barber: true,
            service: true,
            payments: true
          }
        })

        // Update payment status to CANCELLED
        await tx.payment.updateMany({
          where: {
            bookingId: bookingId,
            status: 'PENDING'
          },
          data: {
            status: 'CANCELLED'
          }
        })

        // Delete calendar event if exists
        if (booking.eventId) {
          await calendarService.deleteCalendarEvent(booking.eventId)
        }
      }

      return { updatedBooking, calendarEventId }
    })

    // Send email notification (don't wait)
    if (action === 'confirm') {
      emailService.sendBookingEmailToCustomer({
        ...result.updatedBooking!,
        service: {
          ...result.updatedBooking!.service,
          price: Number(result.updatedBooking!.service.price)
        }
      }, 'confirmed').catch(error => {
        console.error('Error sending confirmation email:', error)
      })
    }

    return NextResponse.json({
      success: true,
      message: action === 'confirm' ? 'Booking berhasil dikonfirmasi' : 'Booking berhasil dibatalkan',
      booking: result.updatedBooking,
      calendarEventId: result.calendarEventId
    })

  } catch (error) {
    console.error(`Error processing booking:`, error)

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { 
          error: 'Data tidak valid',
          details: error.issues
        },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: `Terjadi kesalahan saat memproses booking` },
      { status: 500 }
    )
  }
}