import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const services = await prisma.service.findMany({
      where: { isActive: true },
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