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

    const barbers = await prisma.barber.findMany({
      orderBy: { name: 'asc' }
    })

    return NextResponse.json({
      success: true,
      data: barbers
    })
  } catch (error) {
    console.error('Error fetching barbers:', error)
    return NextResponse.json(
      { error: 'Terjadi kesalahan saat mengambil data barber' },
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

    const { name, specialty, description, isActive } = await request.json()

    const barber = await prisma.barber.create({
      data: {
        name,
        specialty,
        description,
        imageUrl: '', // Default empty string for imageUrl
        isActive
      }
    })

    return NextResponse.json({
      success: true,
      data: barber
    })
  } catch (error) {
    console.error('Error creating barber:', error)
    return NextResponse.json(
      { error: 'Terjadi kesalahan saat membuat barber' },
      { status: 500 }
    )
  }
}