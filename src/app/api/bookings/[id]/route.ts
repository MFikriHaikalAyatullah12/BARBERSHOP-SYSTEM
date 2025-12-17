import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params
    const bookingId = resolvedParams.id

    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        barber: {
          select: {
            id: true,
            name: true,
            specialty: true
          }
        },
        service: {
          select: {
            id: true,
            name: true,
            price: true,
            duration: true
          }
        },
        payments: {
          select: {
            id: true,
            amount: true,
            method: true,
            status: true,
            paidAt: true,
            orderIdGateway: true,
            createdAt: true,
            paymentProof: {
              select: {
                id: true,
                proofImageUrl: true,
                amount: true,
                status: true,
                uploadedAt: true,
                notes: true
              },
              orderBy: {
                uploadedAt: 'desc'
              }
            }
          },
          orderBy: {
            createdAt: 'desc'
          }
        }
      }
    })

    if (!booking) {
      return NextResponse.json(
        { error: 'Booking not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: booking
    })

  } catch (error) {
    console.error('Error fetching booking detail:', error)
    return NextResponse.json(
      { error: 'Failed to fetch booking detail' },
      { status: 500 }
    )
  }
}