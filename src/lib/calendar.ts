import { google } from 'googleapis'

interface CalendarEventData {
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

class CalendarService {
  private oauth2Client: any
  private calendar: any

  constructor() {
    this.oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.GOOGLE_REDIRECT_URI
    )

    this.oauth2Client.setCredentials({
      refresh_token: process.env.GOOGLE_REFRESH_TOKEN
    })

    this.calendar = google.calendar({ version: 'v3', auth: this.oauth2Client })
  }

  private async refreshToken() {
    try {
      await this.oauth2Client.getAccessToken()
    } catch (error) {
      console.error('Error refreshing access token:', error)
      throw error
    }
  }

  private formatCurrency(amount: number): string {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount)
  }

  async createCalendarEvent(bookingData: CalendarEventData): Promise<string | null> {
    try {
      await this.refreshToken()

      const event = {
        summary: `${bookingData.customerName} - ${bookingData.service.name}`,
        description: `
Booking Barbershop - ${process.env.APP_NAME}

📋 DETAIL BOOKING:
• ID: ${bookingData.id}
• Nama: ${bookingData.customerName}
• Email: ${bookingData.email}
• WhatsApp: ${bookingData.phone}
• Barber: ${bookingData.barber.name}
• Layanan: ${bookingData.service.name}
• Harga: ${this.formatCurrency(bookingData.service.price)}
• Durasi: ${bookingData.duration} menit
• Status: ${bookingData.status}

📞 KONTAK:
• Email: ${bookingData.email}
• WhatsApp: ${bookingData.phone}

🔗 LINK ADMIN:
${process.env.APP_URL}/admin/bookings/${bookingData.id}
        `.trim(),
        start: {
          dateTime: bookingData.startTime.toISOString(),
          timeZone: 'Asia/Jakarta'
        },
        end: {
          dateTime: bookingData.endTime.toISOString(),
          timeZone: 'Asia/Jakarta'
        },
        attendees: [
          {
            email: bookingData.email,
            displayName: bookingData.customerName,
            optional: true
          }
        ],
        reminders: {
          useDefault: false,
          overrides: [
            { method: 'email', minutes: 60 },
            { method: 'popup', minutes: 30 }
          ]
        },
        colorId: '2', // Green for confirmed bookings
        location: process.env.APP_NAME || 'Barbershop'
      }

      const response = await this.calendar.events.insert({
        calendarId: process.env.GOOGLE_CALENDAR_ID || 'primary',
        resource: event,
        sendUpdates: 'all'
      })

      console.log('Calendar event created:', response.data.id)
      return response.data.id
    } catch (error) {
      console.error('Error creating calendar event:', error)
      return null
    }
  }

  async updateCalendarEvent(
    eventId: string,
    bookingData: CalendarEventData
  ): Promise<boolean> {
    try {
      await this.refreshToken()

      const event = {
        summary: `${bookingData.customerName} - ${bookingData.service.name}`,
        description: `
Booking Barbershop - ${process.env.APP_NAME}

📋 DETAIL BOOKING:
• ID: ${bookingData.id}
• Nama: ${bookingData.customerName}
• Email: ${bookingData.email}
• WhatsApp: ${bookingData.phone}
• Barber: ${bookingData.barber.name}
• Layanan: ${bookingData.service.name}
• Harga: ${this.formatCurrency(bookingData.service.price)}
• Durasi: ${bookingData.duration} menit
• Status: ${bookingData.status}

📞 KONTAK:
• Email: ${bookingData.email}
• WhatsApp: ${bookingData.phone}

🔗 LINK ADMIN:
${process.env.APP_URL}/admin/bookings/${bookingData.id}
        `.trim(),
        start: {
          dateTime: bookingData.startTime.toISOString(),
          timeZone: 'Asia/Jakarta'
        },
        end: {
          dateTime: bookingData.endTime.toISOString(),
          timeZone: 'Asia/Jakarta'
        },
        attendees: [
          {
            email: bookingData.email,
            displayName: bookingData.customerName,
            optional: true
          }
        ]
      }

      await this.calendar.events.update({
        calendarId: process.env.GOOGLE_CALENDAR_ID || 'primary',
        eventId: eventId,
        resource: event,
        sendUpdates: 'all'
      })

      console.log('Calendar event updated:', eventId)
      return true
    } catch (error) {
      console.error('Error updating calendar event:', error)
      return false
    }
  }

  async deleteCalendarEvent(eventId: string): Promise<boolean> {
    try {
      await this.refreshToken()

      await this.calendar.events.delete({
        calendarId: process.env.GOOGLE_CALENDAR_ID || 'primary',
        eventId: eventId,
        sendUpdates: 'all'
      })

      console.log('Calendar event deleted:', eventId)
      return true
    } catch (error) {
      console.error('Error deleting calendar event:', error)
      return false
    }
  }
}

export const calendarService = new CalendarService()