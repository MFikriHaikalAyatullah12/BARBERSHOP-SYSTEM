import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const bookings = await prisma.booking.findMany({
      include: {
        service: true,
        barber: true,
        payments: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    return NextResponse.json({ bookings })
  } catch (error) {
    console.error('Error fetching bookings:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // This could be used to create manual bookings from admin panel
    const data = await request.json()
    
    const booking = await prisma.booking.create({
      data: {
        customerName: data.customerName,
        email: data.customerEmail,
        phone: data.customerPhone,
        startTime: new Date(data.startTime),
        endTime: new Date(data.endTime),
        duration: data.duration,
        serviceId: data.serviceId,
        barberId: data.barberId,
        notes: data.notes || '',
        status: 'CONFIRMED', // Manual bookings are auto-confirmed
      },
      include: {
        service: true,
        barber: true,
      },
    })

    return NextResponse.json({ booking })
  } catch (error) {
    console.error('Error creating booking:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}