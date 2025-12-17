import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { qrisService } from '@/lib/qris'
import { emailService } from '@/lib/email'
import { calendarService } from '@/lib/calendar'

const statusSchema = z.object({
  orderId: z.string().min(1, 'Order ID diperlukan')
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { orderId } = statusSchema.parse(body)

    // Find payment by order ID
    const payment = await prisma.payment.findFirst({
      where: { orderIdGateway: orderId },
      include: {
        booking: {
          include: {
            barber: true,
            service: true
          }
        }
      }
    })

    if (!payment) {
      return NextResponse.json(
        { error: 'Payment tidak ditemukan' },
        { status: 404 }
      )
    }

    // Check payment status from Midtrans
    const statusResult = await qrisService.checkPaymentStatus(orderId)

    if (!statusResult.success) {
      return NextResponse.json(
        { error: statusResult.error || 'Gagal mengecek status pembayaran' },
        { status: 500 }
      )
    }

    // Parse payment status
    const paymentStatus = qrisService.parsePaymentStatus(
      statusResult.transactionStatus!,
      statusResult.response?.fraud_status
    )

    // Update payment and booking if status changed
    let shouldUpdate = false
    let newPaymentStatus = payment.status
    let newBookingStatus = payment.booking.status

    if (paymentStatus.isPaid && payment.status !== 'PAID') {
      newPaymentStatus = 'PAID'
      newBookingStatus = 'CONFIRMED'
      shouldUpdate = true
    } else if (paymentStatus.isFailed && payment.status !== 'FAILED') {
      newPaymentStatus = 'FAILED'
      shouldUpdate = true
    } else if (paymentStatus.isExpired && payment.status !== 'EXPIRED') {
      newPaymentStatus = 'EXPIRED'
      shouldUpdate = true
    }

    if (shouldUpdate) {
      await prisma.$transaction(async (tx) => {
        // Update payment
        await tx.payment.update({
          where: { id: payment.id },
          data: {
            status: newPaymentStatus,
            paidAt: paymentStatus.isPaid ? new Date() : null,
            gatewayData: {
              ...payment.gatewayData as any,
              statusCheck: statusResult.response
            }
          }
        })

        // Update booking if payment is successful
        let updatedBooking = payment.booking
        if (paymentStatus.isPaid && payment.booking.status !== 'CONFIRMED') {
          updatedBooking = await tx.booking.update({
            where: { id: payment.booking.id },
            data: { status: 'CONFIRMED' },
            include: {
              barber: true,
              service: true
            }
          })

          // Create calendar event if not exists
          if (!updatedBooking.eventId) {
            const eventId = await calendarService.createCalendarEvent({
              ...updatedBooking,
              service: {
                ...updatedBooking.service,
                price: Number(updatedBooking.service.price)
              }
            })
            if (eventId) {
              await tx.booking.update({
                where: { id: updatedBooking.id },
                data: { eventId }
              })
            }
          }

          // Send confirmation email (don't wait)
          emailService.sendBookingEmailToCustomer({
            ...updatedBooking,
            service: {
              ...updatedBooking.service,
              price: Number(updatedBooking.service.price)
            }
          }, 'confirmed').catch(error => {
            console.error('Error sending confirmation email:', error)
          })
        }
      })
    }

    return NextResponse.json({
      success: true,
      data: {
        paymentStatus: newPaymentStatus,
        bookingStatus: newBookingStatus,
        transactionStatus: statusResult.transactionStatus,
        transactionTime: statusResult.transactionTime,
        updated: shouldUpdate
      }
    })

  } catch (error) {
    console.error('Error checking payment status:', error)

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
      { error: 'Terjadi kesalahan saat mengecek status pembayaran' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const orderId = searchParams.get('orderId')

    if (!orderId) {
      return NextResponse.json(
        { error: 'Order ID diperlukan' },
        { status: 400 }
      )
    }

    // Find payment by order ID
    const payment = await prisma.payment.findFirst({
      where: { orderIdGateway: orderId },
      select: {
        id: true,
        status: true,
        paidAt: true,
        expiredAt: true,
        booking: {
          select: {
            id: true,
            status: true
          }
        }
      }
    })

    if (!payment) {
      return NextResponse.json(
        { error: 'Payment tidak ditemukan' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: {
        paymentStatus: payment.status,
        bookingStatus: payment.booking.status,
        paidAt: payment.paidAt,
        expiredAt: payment.expiredAt
      }
    })

  } catch (error) {
    console.error('Error getting payment status:', error)
    return NextResponse.json(
      { error: 'Terjadi kesalahan saat mengambil status pembayaran' },
      { status: 500 }
    )
  }
}