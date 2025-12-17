import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const barbers = await prisma.barber.findMany({
      where: { isActive: true },
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