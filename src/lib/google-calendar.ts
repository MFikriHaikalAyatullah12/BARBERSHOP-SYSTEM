import { google } from 'googleapis'
import { OAuth2Client } from 'google-auth-library'

interface CalendarEvent {
  title: string
  description: string
  startTime: Date
  endTime: Date
  attendeeEmail?: string
  location?: string
}

export class GoogleCalendarService {
  private oauth2Client: OAuth2Client

  constructor() {
    this.oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.GOOGLE_REDIRECT_URI
    )
  }

  setCredentials(accessToken: string, refreshToken: string) {
    this.oauth2Client.setCredentials({
      access_token: accessToken,
      refresh_token: refreshToken,
    })
  }

  getAuthUrl(): string {
    const scopes = [
      'https://www.googleapis.com/auth/calendar',
      'https://www.googleapis.com/auth/gmail.send'
    ]

    return this.oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: scopes,
      prompt: 'consent'
    })
  }

  async getTokensFromCode(code: string) {
    const { tokens } = await this.oauth2Client.getToken(code)
    return tokens
  }

  async createCalendarEvent(event: CalendarEvent, calendarId: string = 'primary') {
    const calendar = google.calendar({ version: 'v3', auth: this.oauth2Client })

    const googleEvent = {
      summary: event.title,
      description: event.description,
      start: {
        dateTime: event.startTime.toISOString(),
        timeZone: 'Asia/Jakarta',
      },
      end: {
        dateTime: event.endTime.toISOString(),
        timeZone: 'Asia/Jakarta',
      },
      attendees: event.attendeeEmail ? [{ email: event.attendeeEmail }] : [],
      location: event.location,
      reminders: {
        useDefault: false,
        overrides: [
          { method: 'email', minutes: 24 * 60 }, // 1 day before
          { method: 'popup', minutes: 30 }, // 30 minutes before
        ],
      },
    }

    try {
      const response = await calendar.events.insert({
        calendarId: calendarId,
        requestBody: googleEvent,
      })
      return response.data
    } catch (error) {
      console.error('Error creating calendar event:', error)
      throw error
    }
  }

  async listCalendars() {
    const calendar = google.calendar({ version: 'v3', auth: this.oauth2Client })
    
    try {
      const response = await calendar.calendarList.list()
      return response.data.items || []
    } catch (error) {
      console.error('Error listing calendars:', error)
      throw error
    }
  }
}

export default GoogleCalendarService