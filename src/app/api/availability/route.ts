import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { parseDateTimeString, calculateEndTime, isTimeSlotAvailable, isValidBookingTime } from '@/lib/utils'

const availabilitySchema = z.object({
  barberId: z.string().min(1, 'Barber ID diperlukan'),
  serviceId: z.string().min(1, 'Service ID diperlukan'),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Format tanggal tidak valid'),
  time: z.string().regex(/^\d{2}:\d{2}$/, 'Format waktu tidak valid')
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { barberId, serviceId, date, time } = availabilitySchema.parse(body)

    // Parse datetime
    const startTime = parseDateTimeString(date, time)

    // Check if time is valid for booking
    if (!isValidBookingTime(startTime)) {
      return NextResponse.json({
        success: false,
        available: false,
        message: 'Waktu tidak valid. Pilih hari kerja (Senin-Sabtu) jam 09:00-19:00 dan minimal besok.'
      })
    }

    // Get service to calculate end time
    const service = await prisma.service.findFirst({
      where: { id: serviceId, isActive: true }
    })

    if (!service) {
      return NextResponse.json(
        { error: 'Layanan tidak ditemukan' },
        { status: 404 }
      )
    }

    // Calculate end time
    const endTime = calculateEndTime(startTime, service.duration)

    // Check for conflicts with existing bookings
    const existingBookings = await prisma.booking.findMany({
      where: {
        barberId,
        startTime: {
          gte: new Date(date + 'T00:00:00.000Z'),
          lt: new Date(date + 'T23:59:59.999Z')
        },
        status: {
          in: ['PENDING_PAYMENT', 'CONFIRMED']
        }
      },
      select: {
        startTime: true,
        endTime: true
      }
    })

    const available = isTimeSlotAvailable(startTime, endTime, existingBookings)

    return NextResponse.json({
      success: true,
      available,
      message: available 
        ? 'Slot waktu tersedia' 
        : 'Slot waktu sudah terbooked. Pilih waktu lain.',
      details: {
        startTime,
        endTime,
        duration: service.duration,
        conflicts: available ? [] : existingBookings.filter((booking: any) =>
          (startTime < booking.endTime && endTime > booking.startTime)
        )
      }
    })

  } catch (error) {
    console.error('Error checking availability:', error)

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { 
          error: 'Data tidak valid',
          details: error.issues
        },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Terjadi kesalahan saat mengecek ketersediaan' },
      { status: 500 }
    )
  }
}