import { prisma } from '@/lib/prisma'
import nodemailer from 'nodemailer'

interface BookingEmailData {
  id: string
  customerName: string
  email: string
  phone: string
  startTime: Date
  endTime: Date
  barber: { name: string }
  service: { name: string; price: number }
  status: string
  duration: number
}

class EmailService {
  private transporter: nodemailer.Transporter | null = null

  constructor() {
    // Initialize transporter on creation
    this.setupTransporter()
  }

  private hasValidEmailConfig(): boolean {
    return !!(process.env.GMAIL_USER && 
              process.env.GMAIL_PASSWORD &&
              process.env.GMAIL_USER !== '' &&
              process.env.GMAIL_PASSWORD !== '')
  }

  private async setupTransporter() {
    try {
      if (!this.hasValidEmailConfig()) {
        console.log('📧 Gmail credentials not configured - email notifications will be logged to console')
        // Use a dummy transporter for development
        this.transporter = nodemailer.createTransport({
          jsonTransport: true
        })
        return
      }

      // Use Gmail SMTP with App Password (simpler than OAuth2)
      this.transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST || 'smtp.gmail.com',
        port: parseInt(process.env.SMTP_PORT || '587'),
        secure: false, // Use STARTTLS
        auth: {
          user: process.env.GMAIL_USER,
          pass: process.env.GMAIL_PASSWORD // Gmail App Password
        }
      })

      // Verify connection
      await this.transporter.verify()
      console.log('📧 Gmail SMTP transporter ready for sending emails')
    } catch (error) {
      console.error('❌ Error setting up email transporter:', error)
      console.log('📧 Fallback to console logging mode')
      // Fallback to dummy transporter
      this.transporter = nodemailer.createTransport({
        jsonTransport: true
      })
    }
  }

  private formatCurrency(amount: number): string {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount)
  }

  private formatDate(date: Date): string {
    return new Intl.DateTimeFormat('id-ID', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      timeZone: 'Asia/Jakarta'
    }).format(date)
  }

  async sendBookingEmailToAdmin(bookingData: BookingEmailData): Promise<boolean> {
    try {
      // Get admin email from settings
      const emailSettings = await prisma.emailSettings.findFirst({
        where: { isActive: true }
      })
      
      const adminEmail = emailSettings?.adminEmail || process.env.ADMIN_EMAIL_ADDRESS || 'admin@barbershop.com'
      
      await this.setupTransporter()

      const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <title>Booking Baru - ${process.env.APP_NAME || 'Modern Barbershop'}</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #2563eb; color: white; padding: 20px; text-align: center; }
            .content { padding: 20px; background: #f8fafc; }
            .booking-details { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; }
            .detail-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #e5e7eb; }
            .status { padding: 5px 10px; border-radius: 20px; font-size: 12px; font-weight: bold; }
            .status.pending { background: #fbbf24; color: #92400e; }
            .footer { text-align: center; padding: 20px; color: #6b7280; font-size: 14px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🔔 Booking Baru</h1>
              <p>${process.env.APP_NAME || 'Modern Barbershop'}</p>
            </div>
            <div class="content">
              <h2>Detail Booking Baru</h2>
              <div class="booking-details">
                <div class="detail-row">
                  <strong>ID Booking:</strong>
                  <span>${bookingData.id}</span>
                </div>
                <div class="detail-row">
                  <strong>Nama Pelanggan:</strong>
                  <span>${bookingData.customerName}</span>
                </div>
                <div class="detail-row">
                  <strong>Email:</strong>
                  <span>${bookingData.email}</span>
                </div>
                <div class="detail-row">
                  <strong>WhatsApp:</strong>
                  <span>${bookingData.phone}</span>
                </div>
                <div class="detail-row">
                  <strong>Barber:</strong>
                  <span>${bookingData.barber.name}</span>
                </div>
                <div class="detail-row">
                  <strong>Layanan:</strong>
                  <span>${bookingData.service.name}</span>
                </div>
                <div class="detail-row">
                  <strong>Harga:</strong>
                  <span>${this.formatCurrency(bookingData.service.price)}</span>
                </div>
                <div class="detail-row">
                  <strong>Tanggal & Waktu:</strong>
                  <span>${this.formatDate(bookingData.startTime)}</span>
                </div>
                <div class="detail-row">
                  <strong>Estimasi Selesai:</strong>
                  <span>${this.formatDate(bookingData.endTime)}</span>
                </div>
                <div class="detail-row">
                  <strong>Durasi:</strong>
                  <span>${bookingData.duration} menit</span>
                </div>
                <div class="detail-row">
                  <strong>Status:</strong>
                  <span class="status pending">${bookingData.status}</span>
                </div>
              </div>
              <p><strong>Tindakan yang diperlukan:</strong></p>
              <ul>
                <li>Periksa ketersediaan barber</li>
                <li>Pantau pembayaran pelanggan</li>
                <li>Konfirmasi booking setelah pembayaran diterima</li>
              </ul>
              <p><a href="${process.env.APP_URL || 'http://localhost:3000'}/admin/bookings/${bookingData.id}" style="background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">Lihat Detail Booking</a></p>
            </div>
            <div class="footer">
              <p>&copy; 2025 ${process.env.APP_NAME || 'Modern Barbershop'}. Semua hak dilindungi.</p>
            </div>
          </div>
        </body>
        </html>
      `

      // For development/testing - just log the email content
      if (!this.hasValidEmailConfig()) {
        console.log('📧 BOOKING NOTIFICATION EMAIL (Development Mode - No Gmail Setup)')
        console.log('===================================================')
        console.log(`To: ${adminEmail}`)
        console.log(`Subject: 🔔 Booking Baru - ${bookingData.customerName} (${bookingData.id})`)
        console.log('---------------------------------------------------')
        console.log(`Customer: ${bookingData.customerName}`)
        console.log(`Email: ${bookingData.email}`)
        console.log(`Phone: ${bookingData.phone}`)
        console.log(`Service: ${bookingData.service.name}`)
        console.log(`Barber: ${bookingData.barber.name}`)
        console.log(`Price: ${this.formatCurrency(bookingData.service.price)}`)
        console.log(`Date & Time: ${this.formatDate(bookingData.startTime)}`)
        console.log(`Duration: ${bookingData.duration} minutes`)
        console.log(`Status: ${bookingData.status}`)
        console.log('===================================================')
        console.log('💡 Untuk menerima email nyata, setup Gmail App Password di .env.production')
        return true
      }

      const mailOptions = {
        from: `"${process.env.APP_NAME || 'Modern Barbershop'}" <${process.env.EMAIL_FROM || process.env.GMAIL_USER}>`,
        to: adminEmail,
        subject: `🔔 Booking Baru - ${bookingData.customerName} (${bookingData.id})`,
        html: htmlContent
      }

      const result = await this.transporter!.sendMail(mailOptions)
      console.log(`✅ Admin notification email sent successfully to ${adminEmail}`)
      console.log(`📧 Message ID: ${result.messageId}`)
      return true
    } catch (error) {
      console.error('Error sending admin email:', error)
      return false
    }
  }

  async sendBookingEmailToCustomer(
    bookingData: BookingEmailData,
    type: 'confirmation' | 'confirmed'
  ): Promise<boolean> {
    try {
      await this.setupTransporter()

      const isConfirmation = type === 'confirmation'
      const title = isConfirmation ? 'Konfirmasi Booking' : 'Booking Dikonfirmasi'
      const statusText = isConfirmation ? 'Menunggu Pembayaran' : 'Dikonfirmasi'
      const statusClass = isConfirmation ? 'pending' : 'confirmed'

      const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <title>${title} - ${process.env.APP_NAME}</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #2563eb; color: white; padding: 20px; text-align: center; }
            .content { padding: 20px; background: #f8fafc; }
            .booking-details { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; }
            .detail-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #e5e7eb; }
            .status { padding: 5px 10px; border-radius: 20px; font-size: 12px; font-weight: bold; }
            .status.pending { background: #fbbf24; color: #92400e; }
            .status.confirmed { background: #22c55e; color: #15803d; }
            .payment-info { background: #fee2e2; border: 1px solid #fca5a5; padding: 15px; border-radius: 6px; margin: 20px 0; }
            .footer { text-align: center; padding: 20px; color: #6b7280; font-size: 14px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>✂️ ${title}</h1>
              <p>${process.env.APP_NAME}</p>
            </div>
            <div class="content">
              <h2>Halo, ${bookingData.customerName}!</h2>
              ${isConfirmation 
                ? '<p>Terima kasih telah melakukan booking di barbershop kami. Berikut adalah detail booking Anda:</p>'
                : '<p>Booking Anda telah dikonfirmasi! Kami menunggu kedatangan Anda di barbershop.</p>'
              }
              
              <div class="booking-details">
                <div class="detail-row">
                  <strong>ID Booking:</strong>
                  <span>${bookingData.id}</span>
                </div>
                <div class="detail-row">
                  <strong>Barber:</strong>
                  <span>${bookingData.barber.name}</span>
                </div>
                <div class="detail-row">
                  <strong>Layanan:</strong>
                  <span>${bookingData.service.name}</span>
                </div>
                <div class="detail-row">
                  <strong>Harga:</strong>
                  <span>${this.formatCurrency(bookingData.service.price)}</span>
                </div>
                <div class="detail-row">
                  <strong>Tanggal & Waktu:</strong>
                  <span>${this.formatDate(bookingData.startTime)}</span>
                </div>
                <div class="detail-row">
                  <strong>Estimasi Selesai:</strong>
                  <span>${this.formatDate(bookingData.endTime)}</span>
                </div>
                <div class="detail-row">
                  <strong>Durasi:</strong>
                  <span>${bookingData.duration} menit</span>
                </div>
                <div class="detail-row">
                  <strong>Status:</strong>
                  <span class="status ${statusClass}">${statusText}</span>
                </div>
              </div>

              ${isConfirmation ? `
                <div class="payment-info">
                  <h3>🏦 Informasi Pembayaran</h3>
                  <p><strong>Untuk menyelesaikan booking, silakan lakukan pembayaran ke:</strong></p>
                  <ul>
                    <li><strong>Bank:</strong> ${process.env.BANK_NAME}</li>
                    <li><strong>No. Rekening:</strong> ${process.env.BANK_ACCOUNT_NUMBER}</li>
                    <li><strong>Atas Nama:</strong> ${process.env.BANK_ACCOUNT_NAME}</li>
                    <li><strong>Jumlah:</strong> ${this.formatCurrency(bookingData.service.price)}</li>
                  </ul>
                  <p><strong>Atau gunakan QRIS untuk pembayaran digital.</strong></p>
                  <p><a href="${process.env.APP_URL}/payment/${bookingData.id}" style="background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">Bayar Sekarang</a></p>
                </div>
              ` : `
                <p><strong>Apa yang perlu Anda siapkan:</strong></p>
                <ul>
                  <li>Datang tepat waktu sesuai jadwal</li>
                  <li>Bawa ID booking ini jika diperlukan</li>
                  <li>Siap untuk mendapatkan gaya rambut yang fresh!</li>
                </ul>
              `}

              <p><strong>Kontak:</strong></p>
              <p>Jika ada pertanyaan, hubungi kami melalui WhatsApp di nomor yang tertera di website kami.</p>
            </div>
            <div class="footer">
              <p>&copy; 2025 ${process.env.APP_NAME}. Semua hak dilindungi.</p>
              <p>Email ini dikirim otomatis, mohon jangan membalas.</p>
            </div>
          </div>
        </body>
        </html>
      `

      const subject = isConfirmation 
        ? `✂️ Konfirmasi Booking - ${bookingData.id}`
        : `🎉 Booking Dikonfirmasi - ${bookingData.id}`

      // For development - just log the email content
      if (!this.hasValidEmailConfig()) {
        console.log('📧 CUSTOMER EMAIL (Development Mode - No Gmail Setup)')
        console.log('===================================================')
        console.log(`To: ${bookingData.email}`)
        console.log(`Subject: ${subject}`)
        console.log('---------------------------------------------------')
        console.log(`Customer: ${bookingData.customerName}`)
        console.log(`Type: ${title}`)
        console.log(`Service: ${bookingData.service.name}`)
        console.log(`Date & Time: ${this.formatDate(bookingData.startTime)}`)
        console.log('===================================================')
        console.log('💡 Untuk mengirim email nyata, setup Gmail App Password di .env.production')
        return true
      }

      const mailOptions = {
        from: `"${process.env.APP_NAME || 'Modern Barbershop'}" <${process.env.EMAIL_FROM || process.env.GMAIL_USER}>`,
        to: bookingData.email,
        subject,
        html: htmlContent
      }

      const result = await this.transporter!.sendMail(mailOptions)
      console.log(`✅ Customer ${type} email sent successfully to ${bookingData.email}`)
      console.log(`📧 Message ID: ${result.messageId}`)
      return true
    } catch (error) {
      console.error(`Error sending customer ${type} email:`, error)
      return false
    }
  }

  // Additional methods for admin notifications
  async sendBookingConfirmation(data: {
    to: string
    customerName: string
    serviceName: string
    barberName: string
    date: string
    time: string
    totalPrice: number
  }) {
    try {
      await this.setupTransporter()

      const mailOptions = {
        from: `"${process.env.APP_NAME || 'Modern Barbershop'}" <${process.env.EMAIL_FROM || process.env.GMAIL_USER}>`,
        to: data.to,
        subject: 'Booking Confirmed - Modern Barbershop',
        html: `
          <h2>Booking Anda Telah Dikonfirmasi!</h2>
          <p>Halo ${data.customerName},</p>
          <p>Booking Anda telah dikonfirmasi dengan detail berikut:</p>
          <ul>
            <li><strong>Layanan:</strong> ${data.serviceName}</li>
            <li><strong>Barber:</strong> ${data.barberName}</li>
            <li><strong>Tanggal:</strong> ${data.date}</li>
            <li><strong>Waktu:</strong> ${data.time}</li>
            <li><strong>Total:</strong> Rp ${data.totalPrice.toLocaleString('id-ID')}</li>
          </ul>
          <p>Silakan datang 10 menit sebelum waktu booking Anda.</p>
          <p>Terima kasih telah memilih Modern Barbershop!</p>
        `,
      }

      await this.transporter!.sendMail(mailOptions)
    } catch (error) {
      console.error('Error sending booking confirmation:', error)
      throw error
    }
  }

  async sendBookingCancellation(data: {
    to: string
    customerName: string
    serviceName: string
    date: string
    time: string
  }) {
    try {
      await this.setupTransporter()

      const mailOptions = {
        from: `"${process.env.APP_NAME || 'Modern Barbershop'}" <${process.env.EMAIL_FROM || process.env.GMAIL_USER}>`,
        to: data.to,
        subject: 'Booking Dibatalkan - Modern Barbershop',
        html: `
          <h2>Booking Anda Telah Dibatalkan</h2>
          <p>Halo ${data.customerName},</p>
          <p>Maaf, booking Anda dengan detail berikut telah dibatalkan:</p>
          <ul>
            <li><strong>Layanan:</strong> ${data.serviceName}</li>
            <li><strong>Tanggal:</strong> ${data.date}</li>
            <li><strong>Waktu:</strong> ${data.time}</li>
          </ul>
          <p>Jika Anda memiliki pertanyaan, silakan hubungi kami.</p>
          <p>Terima kasih atas pengertian Anda.</p>
        `,
      }

      await this.transporter!.sendMail(mailOptions)
    } catch (error) {
      console.error('Error sending booking cancellation:', error)
      throw error
    }
  }

  async sendBookingCompletion(data: {
    to: string
    customerName: string
    serviceName: string
    barberName: string
  }) {
    try {
      await this.setupTransporter()

      const mailOptions = {
        from: `"${process.env.APP_NAME || 'Modern Barbershop'}" <${process.env.EMAIL_FROM || process.env.GMAIL_USER}>`,
        to: data.to,
        subject: 'Terima Kasih - Modern Barbershop',
        html: `
          <h2>Terima Kasih Telah Berkunjung!</h2>
          <p>Halo ${data.customerName},</p>
          <p>Terima kasih telah menggunakan layanan ${data.serviceName} dengan ${data.barberName}.</p>
          <p>Kami harap Anda puas dengan layanan kami!</p>
          <p>Jangan ragu untuk booking lagi kapan saja.</p>
          <p>Modern Barbershop - Styling with Passion</p>
        `,
      }

      await this.transporter!.sendMail(mailOptions)
    } catch (error) {
      console.error('Error sending booking completion:', error)
      throw error
    }
  }

  async sendNewBookingNotification(data: {
    customerName: string
    serviceName: string
    barberName: string
    date: string
    time: string
    totalPrice: number
  }) {
    try {
      await this.setupTransporter()

      const mailOptions = {
        from: `"${process.env.APP_NAME || 'Modern Barbershop'}" <${process.env.EMAIL_FROM || process.env.GMAIL_USER}>`,
        to: process.env.ADMIN_EMAIL,
        subject: 'Booking Baru - Modern Barbershop Admin',
        html: `
          <h2>Booking Baru Masuk!</h2>
          <p>Ada booking baru yang perlu dikonfirmasi:</p>
          <ul>
            <li><strong>Customer:</strong> ${data.customerName}</li>
            <li><strong>Layanan:</strong> ${data.serviceName}</li>
            <li><strong>Barber:</strong> ${data.barberName}</li>
            <li><strong>Tanggal:</strong> ${data.date}</li>
            <li><strong>Waktu:</strong> ${data.time}</li>
            <li><strong>Total:</strong> Rp ${data.totalPrice.toLocaleString('id-ID')}</li>
          </ul>
          <p>Silakan login ke admin panel untuk mengkonfirmasi booking ini.</p>
        `,
      }

      await this.transporter!.sendMail(mailOptions)
    } catch (error) {
      console.error('Error sending new booking notification:', error)
      throw error
    }
  }
}

export const emailService = new EmailService()