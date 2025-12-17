import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { qrisService } from '@/lib/qris'

const createQRISSchema = z.object({
  bookingId: z.string().min(1, 'Booking ID diperlukan')
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { bookingId } = createQRISSchema.parse(body)

    // Get booking with related data
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        service: true,
        payments: {
          where: { method: 'QRIS' },
          orderBy: { createdAt: 'desc' },
          take: 1
        }
      }
    })

    if (!booking) {
      return NextResponse.json(
        { error: 'Booking tidak ditemukan' },
        { status: 404 }
      )
    }

    if (booking.status === 'CONFIRMED') {
      return NextResponse.json(
        { error: 'Booking sudah dikonfirmasi' },
        { status: 400 }
      )
    }

    if (booking.status === 'CANCELLED') {
      return NextResponse.json(
        { error: 'Booking sudah dibatalkan' },
        { status: 400 }
      )
    }

    // Check if there's already a pending QRIS payment
    const existingQRISPayment = booking.payments.find((p: any) => 
      p.method === 'QRIS' && p.status === 'PENDING'
    )

    if (existingQRISPayment && existingQRISPayment.qrCodeData) {
      return NextResponse.json({
        success: true,
        payment: {
          id: existingQRISPayment.id,
          orderId: existingQRISPayment.orderIdGateway,
          qrString: existingQRISPayment.qrCodeData,
          amount: existingQRISPayment.amount,
          expiredAt: existingQRISPayment.expiredAt
        }
      })
    }

    // Generate order ID
    const orderId = qrisService.generateOrderId(bookingId)

    // Create QRIS payment
    const qrisResult = await qrisService.createQRISPayment({
      orderId,
      amount: Number(booking.service.price),
      customerName: booking.customerName,
      email: booking.email,
      phone: booking.phone,
      bookingId: booking.id
    })

    if (!qrisResult.success) {
      return NextResponse.json(
        { error: qrisResult.error || 'Gagal membuat pembayaran QRIS' },
        { status: 500 }
      )
    }

    // Calculate expiry time (30 minutes from now)
    const expiryMinutes = parseInt(process.env.BOOKING_EXPIRY_MINUTES || '30')
    const expiredAt = new Date(Date.now() + (expiryMinutes * 60 * 1000))

    // Save payment to database
    const payment = await prisma.payment.create({
      data: {
        bookingId: booking.id,
        orderIdGateway: orderId,
        amount: booking.service.price,
        method: 'QRIS',
        status: 'PENDING',
        qrCodeData: qrisResult.qrString,
        qrCodeUrl: qrisResult.qrString, // For QR display
        expiredAt,
        gatewayData: qrisResult.response
      }
    })

    return NextResponse.json({
      success: true,
      payment: {
        id: payment.id,
        orderId: payment.orderIdGateway,
        qrString: qrisResult.qrString,
        amount: payment.amount,
        expiredAt: payment.expiredAt
      }
    })

  } catch (error) {
    console.error('Error creating QRIS payment:', error)

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
      { error: 'Terjadi kesalahan saat membuat pembayaran QRIS' },
      { status: 500 }
    )
  }
}