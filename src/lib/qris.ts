import midtransClient from 'midtrans-client'
import crypto from 'crypto'

interface QRISPaymentData {
  orderId: string
  amount: number
  customerName: string
  email: string
  phone: string
  bookingId: string
}

interface MidtransQRISResponse {
  qr_string?: string
  acquirer?: string
  merchant_id?: string
  order_id?: string
  gross_amount?: string
  currency?: string
  payment_type?: string
  transaction_time?: string
  transaction_status?: string
  transaction_id?: string
  status_code?: string
  status_message?: string
  actions?: Array<{
    name: string
    method: string
    url: string
  }>
}

class QRISService {
  private snap: any
  private core: any

  constructor() {
    const isProduction = process.env.MIDTRANS_IS_PRODUCTION === 'true'
    
    this.snap = new midtransClient.Snap({
      isProduction,
      serverKey: process.env.MIDTRANS_SERVER_KEY,
      clientKey: process.env.MIDTRANS_CLIENT_KEY
    })

    this.core = new midtransClient.CoreApi({
      isProduction,
      serverKey: process.env.MIDTRANS_SERVER_KEY,
      clientKey: process.env.MIDTRANS_CLIENT_KEY
    })
  }

  async createQRISPayment(paymentData: QRISPaymentData): Promise<{
    success: boolean
    qrString?: string
    orderId?: string
    error?: string
    response?: any
  }> {
    try {
      const parameter = {
        payment_type: 'qris',
        transaction_details: {
          order_id: paymentData.orderId,
          gross_amount: paymentData.amount
        },
        customer_details: {
          first_name: paymentData.customerName,
          email: paymentData.email,
          phone: paymentData.phone
        },
        item_details: [
          {
            id: paymentData.bookingId,
            price: paymentData.amount,
            quantity: 1,
            name: 'Layanan Barbershop',
            category: 'Service'
          }
        ],
        custom_field1: paymentData.bookingId,
        custom_expiry: {
          expiry_duration: parseInt(process.env.BOOKING_EXPIRY_MINUTES || '30'),
          unit: 'minute'
        }
      }

      const response: MidtransQRISResponse = await this.core.charge(parameter)

      if (response.qr_string) {
        return {
          success: true,
          qrString: response.qr_string,
          orderId: response.order_id,
          response
        }
      } else {
        return {
          success: false,
          error: response.status_message || 'Failed to create QRIS payment',
          response
        }
      }
    } catch (error: any) {
      console.error('Error creating QRIS payment:', error)
      return {
        success: false,
        error: error.message || 'Failed to create QRIS payment'
      }
    }
  }

  async checkPaymentStatus(orderId: string): Promise<{
    success: boolean
    status?: string
    transactionStatus?: string
    paymentType?: string
    transactionTime?: string
    error?: string
    response?: any
  }> {
    try {
      const response = await this.core.transaction.status(orderId)

      return {
        success: true,
        status: response.transaction_status,
        transactionStatus: response.transaction_status,
        paymentType: response.payment_type,
        transactionTime: response.transaction_time,
        response
      }
    } catch (error: any) {
      console.error('Error checking payment status:', error)
      return {
        success: false,
        error: error.message || 'Failed to check payment status'
      }
    }
  }

  verifyNotification(notification: any): boolean {
    try {
      const orderId = notification.order_id
      const statusCode = notification.status_code
      const grossAmount = notification.gross_amount
      const serverKey = process.env.MIDTRANS_SERVER_KEY

      const signatureKey = crypto
        .createHash('sha512')
        .update(orderId + statusCode + grossAmount + serverKey)
        .digest('hex')

      return signatureKey === notification.signature_key
    } catch (error) {
      console.error('Error verifying notification:', error)
      return false
    }
  }

  parsePaymentStatus(transactionStatus: string, fraudStatus?: string): {
    isPaid: boolean
    isFailed: boolean
    isExpired: boolean
    isPending: boolean
  } {
    const status = {
      isPaid: false,
      isFailed: false,
      isExpired: false,
      isPending: false
    }

    switch (transactionStatus) {
      case 'capture':
        if (fraudStatus === 'accept') {
          status.isPaid = true
        } else if (fraudStatus === 'challenge') {
          status.isPending = true
        } else {
          status.isFailed = true
        }
        break
      case 'settlement':
        status.isPaid = true
        break
      case 'pending':
        status.isPending = true
        break
      case 'deny':
      case 'cancel':
      case 'failure':
        status.isFailed = true
        break
      case 'expire':
        status.isExpired = true
        break
      default:
        status.isPending = true
    }

    return status
  }

  generateOrderId(bookingId: string): string {
    const timestamp = Date.now()
    const random = Math.random().toString(36).substring(2, 8).toUpperCase()
    return `BOOK-${bookingId}-${timestamp}-${random}`
  }
}

export const qrisService = new QRISService()