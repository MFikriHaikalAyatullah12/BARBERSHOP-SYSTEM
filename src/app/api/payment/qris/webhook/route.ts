import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { qrisService } from '@/lib/qris'
import { emailService } from '@/lib/email'
import { calendarService } from '@/lib/calendar'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Log the incoming notification for debugging
    console.log('Webhook notification received:', JSON.stringify(body, null, 2))

    // Verify notification signature
    if (!qrisService.verifyNotification(body)) {
      console.error('Invalid webhook signature')
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 400 }
      )
    }

    const { order_id, transaction_status, fraud_status } = body
    
    if (!order_id) {
      return NextResponse.json(
        { error: 'Order ID not found' },
        { status: 400 }
      )
    }

    // Find payment by order ID
    const payment = await prisma.payment.findFirst({
      where: { orderIdGateway: order_id },
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
      console.error(`Payment not found for order ID: ${order_id}`)
      return NextResponse.json(
        { error: 'Payment not found' },
        { status: 404 }
      )
    }

    // Parse payment status
    const statusResult = qrisService.parsePaymentStatus(transaction_status, fraud_status)
    
    // Update payment and booking in transaction
    await prisma.$transaction(async (tx) => {
      let newPaymentStatus = payment.status
      let newBookingStatus = payment.booking.status

      if (statusResult.isPaid) {
        newPaymentStatus = 'PAID'
        newBookingStatus = 'CONFIRMED'
      } else if (statusResult.isFailed) {
        newPaymentStatus = 'FAILED'
      } else if (statusResult.isExpired) {
        newPaymentStatus = 'EXPIRED'
      }

      // Update payment
      const updatedPayment = await tx.payment.update({
        where: { id: payment.id },
        data: {
          status: newPaymentStatus,
          paidAt: statusResult.isPaid ? new Date() : null,
          gatewayData: {
            ...payment.gatewayData as any,
            webhook: body
          }
        }
      })

      // Update booking if payment is successful
      let updatedBooking = payment.booking
      if (statusResult.isPaid && payment.booking.status !== 'CONFIRMED') {
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

    console.log(`Webhook processed successfully for order ${order_id}: ${transaction_status}`)

    return NextResponse.json({ 
      success: true,
      message: 'Notification processed successfully'
    })

  } catch (error) {
    console.error('Error processing webhook:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}