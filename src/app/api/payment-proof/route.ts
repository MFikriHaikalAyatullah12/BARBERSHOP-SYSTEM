import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    const { paymentId, proofImageUrl, amount } = await request.json()

    // Verify payment exists
    const payment = await prisma.payment.findUnique({
      where: { id: paymentId },
      include: { booking: true },
    })

    if (!payment) {
      return NextResponse.json(
        { success: false, error: 'Payment not found' },
        { status: 404 }
      )
    }

    // Create payment proof
    const paymentProof = await prisma.paymentProof.create({
      data: {
        paymentId,
        proofImageUrl,
        amount: Number(amount),
        status: 'PENDING',
      },
    })

    return NextResponse.json({ success: true, data: paymentProof })
  } catch (error) {
    console.error('Error uploading payment proof:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to upload payment proof' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')

    const paymentProofs = await prisma.paymentProof.findMany({
      where: status ? { status: status as any } : {},
      include: {
        payment: {
          include: {
            booking: {
              include: {
                barber: true,
                service: true,
              },
            },
          },
        },
      },
      orderBy: { uploadedAt: 'desc' },
    })

    return NextResponse.json({ success: true, data: paymentProofs })
  } catch (error) {
    console.error('Error fetching payment proofs:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch payment proofs' },
      { status: 500 }
    )
  }
}