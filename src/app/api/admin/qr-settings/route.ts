import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function GET() {
  try {
    const qrSettings = await prisma.qRCodeSetting.findFirst({
      where: { isActive: true },
    })
    
    if (!qrSettings) {
      return NextResponse.json(
        { success: true, data: null, message: 'No QR code settings configured yet' },
        { status: 200 }
      )
    }

    return NextResponse.json({ success: true, data: qrSettings })
  } catch (error) {
    console.error('Error fetching QR settings:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch QR settings' },
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

    const body = await request.json()
    console.log('Received body:', body)
    
    const { qrisImageUrl, instructions } = body

    if (!qrisImageUrl) {
      return NextResponse.json(
        { success: false, error: 'QRIS image URL is required' },
        { status: 400 }
      )
    }

    console.log('Creating QR setting with data:', {
      qrisImageUrl: qrisImageUrl ? 'present' : 'missing',
      instructions
    })

    // Deactivate all existing QR settings
    await prisma.qRCodeSetting.updateMany({
      where: { isActive: true },
      data: { isActive: false },
    })

    // Create new active QR setting
    const qrSetting = await prisma.qRCodeSetting.create({
      data: {
        qrisImageUrl,
        instructions,
        isActive: true,
      },
    })

    console.log('QR setting created successfully:', qrSetting.id)
    return NextResponse.json({ success: true, data: qrSetting })
  } catch (error) {
    console.error('Error creating QR settings:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to create QR settings: ' + (error as Error).message },
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

    const { id, qrisImageUrl, instructions } = await request.json()

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'ID is required for updating QR settings' },
        { status: 400 }
      )
    }

    if (!qrisImageUrl) {
      return NextResponse.json(
        { success: false, error: 'QRIS image URL is required' },
        { status: 400 }
      )
    }

    const qrSetting = await prisma.qRCodeSetting.update({
      where: { id },
      data: {
        qrisImageUrl,
        instructions,
        updatedAt: new Date(),
      },
    })

    return NextResponse.json({ success: true, data: qrSetting })
  } catch (error) {
    console.error('Error updating QR settings:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to update QR settings' },
      { status: 500 }
    )
  }
}