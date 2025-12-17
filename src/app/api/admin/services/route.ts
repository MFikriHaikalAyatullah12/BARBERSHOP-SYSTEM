import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const services = await prisma.service.findMany({
      orderBy: { duration: 'asc' }
    })

    return NextResponse.json({
      success: true,
      data: services
    })
  } catch (error) {
    console.error('Error fetching services:', error)
    return NextResponse.json(
      { error: 'Terjadi kesalahan saat mengambil data layanan' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { name, description, duration, price, isActive } = await request.json()

    const service = await prisma.service.create({
      data: {
        name,
        description,
        duration,
        price,
        isActive
      }
    })

    return NextResponse.json({
      success: true,
      data: service
    })
  } catch (error) {
    console.error('Error creating service:', error)
    return NextResponse.json(
      { error: 'Terjadi kesalahan saat membuat layanan' },
      { status: 500 }
    )
  }
}