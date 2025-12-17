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

    const barber = await prisma.barber.update({
      where: { id },
      data
    })

    return NextResponse.json({
      success: true,
      data: barber
    })
  } catch (error) {
    console.error('Error updating barber:', error)
    return NextResponse.json(
      { error: 'Terjadi kesalahan saat memperbarui barber' },
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

    // Check if barber has any bookings
    const bookingsCount = await prisma.booking.count({
      where: { barberId: id }
    })

    if (bookingsCount > 0) {
      return NextResponse.json(
        { error: `Cannot delete barber. There are ${bookingsCount} bookings associated with this barber. Please reassign or cancel the bookings first.` },
        { status: 400 }
      )
    }

    await prisma.barber.delete({
      where: { id }
    })

    return NextResponse.json({
      success: true,
      message: 'Barber berhasil dihapus'
    })
  } catch (error) {
    console.error('Error deleting barber:', error)
    return NextResponse.json(
      { error: 'Terjadi kesalahan saat menghapus barber' },
      { status: 500 }
    )
  }
}