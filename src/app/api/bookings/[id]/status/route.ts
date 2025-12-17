import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const updateStatusSchema = z.object({
  status: z.enum(['PENDING_PAYMENT', 'CONFIRMED', 'CANCELLED', 'COMPLETED'])
})

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params
    const bookingId = resolvedParams.id
    const body = await request.json()
    
    const { status } = updateStatusSchema.parse(body)

    // Check if booking exists
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        barber: true,
        service: true
      }
    })

    if (!booking) {
      return NextResponse.json(
        { error: 'Booking not found' },
        { status: 404 }
      )
    }

    // Update booking status
    const updatedBooking = await prisma.booking.update({
      where: { id: bookingId },
      data: { 
        status,
        updatedAt: new Date()
      },
      include: {
        barber: true,
        service: true,
        payments: true
      }
    })

    return NextResponse.json({
      success: true,
      data: updatedBooking,
      message: `Booking status updated to ${status}`
    })

  } catch (error) {
    console.error('Error updating booking status:', error)

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { 
          error: 'Invalid status value',
          details: error.issues
        },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to update booking status' },
      { status: 500 }
    )
  }
}