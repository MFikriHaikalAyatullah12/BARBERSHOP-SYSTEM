import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'
import { emailService } from '@/lib/email'
import { calendarService } from '@/lib/calendar'

const updateBookingSchema = z.object({
  status: z.enum(['PENDING_PAYMENT', 'CONFIRMED', 'COMPLETED', 'CANCELLED']),
  notes: z.string().optional(),
})

const updateCustomerSchema = z.object({
  customerName: z.string().min(1, 'Customer name is required'),
})

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const resolvedParams = await params
    const body = await request.json()

    // Check if this is a customer name update or status update
    if (body.customerName !== undefined) {
      const { customerName } = updateCustomerSchema.parse(body)

      const updatedBooking = await prisma.booking.update({
        where: { id: resolvedParams.id },
        data: {
          customerName,
          updatedAt: new Date(),
        },
        include: {
          service: true,
          barber: true,
          payments: true,
        },
      })

      return NextResponse.json({
        success: true,
        data: updatedBooking,
      })
    }

    // Original status update logic
    const { status, notes } = updateBookingSchema.parse(body)

    // Get the booking first
    const existingBooking = await prisma.booking.findUnique({
      where: { id: resolvedParams.id },
      include: {
        service: true,
        barber: true,
      },
    })

    if (!existingBooking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 })
    }

    // Update booking status
    const updatedBooking = await prisma.booking.update({
      where: { id: resolvedParams.id },
      data: {
        status,
        notes: notes || existingBooking.notes,
        updatedAt: new Date(),
      },
      include: {
        service: true,
        barber: true,
      },
    })

    // Send notification email based on status change
    try {
      switch (status) {
        case 'CONFIRMED':
          await emailService.sendBookingConfirmation({
            to: existingBooking.email,
            customerName: existingBooking.customerName,
            serviceName: existingBooking.service.name,
            barberName: existingBooking.barber.name,
            date: existingBooking.startTime.toLocaleDateString('id-ID'),
            time: existingBooking.startTime.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
            totalPrice: Number(existingBooking.service.price),
          })

          // Add to Google Calendar if not exists
          if (!existingBooking.eventId) {
            const eventId = await calendarService.createCalendarEvent({
              ...existingBooking,
              service: {
                ...existingBooking.service,
                price: Number(existingBooking.service.price)
              }
            })
            if (eventId) {
              await prisma.booking.update({
                where: { id: resolvedParams.id },
                data: { eventId }
              })
            }
          }
          break

        case 'CANCELLED':
          await emailService.sendBookingCancellation({
            to: existingBooking.email,
            customerName: existingBooking.customerName,
            serviceName: existingBooking.service.name,
            date: existingBooking.startTime.toLocaleDateString('id-ID'),
            time: existingBooking.startTime.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
          })
          break

        case 'COMPLETED':
          await emailService.sendBookingCompletion({
            to: existingBooking.email,
            customerName: existingBooking.customerName,
            serviceName: existingBooking.service.name,
            barberName: existingBooking.barber.name,
          })
          break
      }
    } catch (emailError) {
      console.error('Error sending notification email:', emailError)
      // Don't fail the request if email fails
    }

    return NextResponse.json({ 
      booking: updatedBooking,
      message: 'Booking updated successfully' 
    })
  } catch (error) {
    console.error('Error updating booking:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid data', details: error.issues },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const resolvedParams = await params

    // Check if booking exists
    const existingBooking = await prisma.booking.findUnique({
      where: { id: resolvedParams.id },
      include: {
        payments: true,
      },
    })

    if (!existingBooking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 })
    }

    // Don't delete if payment is completed
    if (existingBooking.payments?.some(p => p.status === 'PAID')) {
      return NextResponse.json(
        { error: 'Cannot delete booking with completed payment' },
        { status: 400 }
      )
    }

    // Delete booking (this will cascade to delete payment if exists)
    await prisma.booking.delete({
      where: { id: resolvedParams.id },
    })

    return NextResponse.json({ 
      message: 'Booking deleted successfully' 
    })
  } catch (error) {
    console.error('Error deleting booking:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const resolvedParams = await params

    const booking = await prisma.booking.findUnique({
      where: { id: resolvedParams.id },
      include: {
        service: true,
        barber: true,
        payments: {
          include: {
            paymentProof: true,
          },
        },
      },
    })

    if (!booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 })
    }

    return NextResponse.json({ booking })
  } catch (error) {
    console.error('Error fetching booking:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}