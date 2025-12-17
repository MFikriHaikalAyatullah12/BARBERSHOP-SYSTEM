import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || (session.user as any).role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const data = await request.json()

    const service = await prisma.service.update({
      where: { id },
      data
    })

    return NextResponse.json({
      success: true,
      data: service
    })
  } catch (error) {
    console.error('Error updating service:', error)
    return NextResponse.json(
      { error: 'Terjadi kesalahan saat memperbarui layanan' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || (session.user as any).role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params

    // Check if service has any bookings
    const bookingsCount = await prisma.booking.count({
      where: { serviceId: id }
    })

    if (bookingsCount > 0) {
      return NextResponse.json(
        { error: `Cannot delete service. There are ${bookingsCount} bookings using this service. Please reassign or cancel the bookings first.` },
        { status: 400 }
      )
    }

    await prisma.service.delete({
      where: { id }
    })

    return NextResponse.json({
      success: true,
      message: 'Layanan berhasil dihapus'
    })
  } catch (error) {
    console.error('Error deleting service:', error)
    return NextResponse.json(
      { error: 'Terjadi kesalahan saat menghapus layanan' },
      { status: 500 }
    )
  }
}