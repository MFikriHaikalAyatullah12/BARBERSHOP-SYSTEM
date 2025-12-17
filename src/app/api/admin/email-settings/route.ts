import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import GoogleCalendarService from '@/lib/google-calendar'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const settings = await prisma.emailSettings.findFirst({
      where: { isActive: true },
      select: {
        id: true,
        adminEmail: true,
        calendarId: true,
        googleAccessToken: true,
        googleRefreshToken: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      }
    })

    // Don't send sensitive tokens to client
    if (settings) {
      const { googleAccessToken, googleRefreshToken, ...safeSettings } = settings
      return NextResponse.json({ 
        success: true, 
        data: safeSettings,
        isConfigured: !!(googleAccessToken && googleRefreshToken)
      })
    } else {
      // No settings found yet
      return NextResponse.json({ 
        success: true, 
        data: null,
        isConfigured: false
      })
    }
  } catch (error) {
    console.error('Error fetching email settings:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch email settings' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { adminEmail, skipOAuth } = await request.json()

    if (!adminEmail || !adminEmail.includes('@')) {
      return NextResponse.json(
        { success: false, error: 'Valid email address is required' },
        { status: 400 }
      )
    }

    // Simple email save without OAuth
    if (skipOAuth) {
      try {
        // First check if there's an existing record
        const existingSettings = await prisma.emailSettings.findFirst({
          where: { isActive: true }
        })

        let settings
        if (existingSettings) {
          // Update existing record
          settings = await prisma.emailSettings.update({
            where: { id: existingSettings.id },
            data: {
              adminEmail,
              isActive: true,
              updatedAt: new Date()
            },
            select: {
              id: true,
              adminEmail: true,
              isActive: true,
              createdAt: true,
              updatedAt: true,
            }
          })
        } else {
          // Create new record
          settings = await prisma.emailSettings.create({
            data: {
              adminEmail,
              isActive: true,
            },
            select: {
              id: true,
              adminEmail: true,
              isActive: true,
              createdAt: true,
              updatedAt: true,
            }
          })
        }

        console.log('Email settings saved successfully:', settings)
        return NextResponse.json({ 
          success: true, 
          data: settings
        })
      } catch (error) {
        console.error('Error saving email settings:', error)
        return NextResponse.json(
          { success: false, error: 'Failed to save email settings' },
          { status: 500 }
        )
      }
    }

    // Original OAuth flow (disabled for now)
    return NextResponse.json(
      { success: false, error: 'Google OAuth is temporarily disabled. Use skipOAuth=true for simple email setup.' },
      { status: 400 }
    )
  } catch (error) {
    console.error('Error saving email settings:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to save email settings' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { code } = await request.json()

    if (!code) {
      return NextResponse.json(
        { success: false, error: 'Authorization code is required' },
        { status: 400 }
      )
    }

    const calendarService = new GoogleCalendarService()
    const tokens = await calendarService.getTokensFromCode(code)

    if (!tokens.access_token || !tokens.refresh_token) {
      return NextResponse.json(
        { success: false, error: 'Failed to get valid tokens from Google' },
        { status: 400 }
      )
    }

    // Update email settings with tokens
    const settings = await prisma.emailSettings.findFirst({
      where: { isActive: true }
    })

    if (!settings) {
      return NextResponse.json(
        { success: false, error: 'Email settings not found. Please configure email first.' },
        { status: 404 }
      )
    }

    const updatedSettings = await prisma.emailSettings.update({
      where: { id: settings.id },
      data: {
        googleAccessToken: tokens.access_token,
        googleRefreshToken: tokens.refresh_token,
      },
      select: {
        id: true,
        adminEmail: true,
        calendarId: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      }
    })

    return NextResponse.json({ 
      success: true, 
      data: updatedSettings,
      message: 'Google account connected successfully!'
    })
  } catch (error) {
    console.error('Error processing Google OAuth callback:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to connect Google account' },
      { status: 500 }
    )
  }
}