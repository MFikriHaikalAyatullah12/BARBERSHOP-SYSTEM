import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { id } = await params
    const { status, notes } = await request.json()

    if (!['APPROVED', 'REJECTED'].includes(status)) {
      return NextResponse.json(
        { success: false, error: 'Invalid status' },
        { status: 400 }
      )
    }

    // Update payment proof status
    const paymentProof = await prisma.paymentProof.update({
      where: { id },
      data: {
        status,
        notes,
        reviewedAt: new Date(),
        reviewedBy: session.user.id,
      },
      include: {
        payment: {
          include: { booking: true },
        },
      },
    })

    // If approved, update payment and booking status
    if (status === 'APPROVED') {
      await prisma.payment.update({
        where: { id: paymentProof.paymentId },
        data: {
          status: 'PAID',
          paidAt: new Date(),
        },
      })

      await prisma.booking.update({
        where: { id: paymentProof.payment.bookingId },
        data: {
          status: 'CONFIRMED',
        },
      })
    }

    return NextResponse.json({ success: true, data: paymentProof })
  } catch (error) {
    console.error('Error reviewing payment proof:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to review payment proof' },
      { status: 500 }
    )
  }
}