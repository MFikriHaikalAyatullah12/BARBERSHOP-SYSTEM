import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const listBookingsSchema = z.object({
  page: z.string().optional().default('1'),
  limit: z.string().optional().default('10'),
  barberId: z.string().optional(),
  status: z.enum(['PENDING_PAYMENT', 'CONFIRMED', 'CANCELLED', 'COMPLETED']).optional(),
  date: z.string().optional(),
  search: z.string().optional()
})

export async function GET(request: NextRequest) {
  try {
    // Note: For admin dashboard, we'll skip auth check and rely on frontend auth

    const { searchParams } = new URL(request.url)
    const queryParams = Object.fromEntries(searchParams.entries())
    
    const {
      page,
      limit,
      barberId,
      status,
      date,
      search
    } = listBookingsSchema.parse(queryParams)

    const pageNum = parseInt(page)
    const limitNum = parseInt(limit)
    const skip = (pageNum - 1) * limitNum

    // Build where clause
    const where: any = {}

    if (barberId) {
      where.barberId = barberId
    }

    if (status) {
      where.status = status
    }

    if (date) {
      const startDate = new Date(date + 'T00:00:00.000Z')
      const endDate = new Date(date + 'T23:59:59.999Z')
      where.startTime = {
        gte: startDate,
        lte: endDate
      }
    }

    if (search) {
      where.OR = [
        { id: { contains: search, mode: 'insensitive' } },
        { customerName: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { phone: { contains: search, mode: 'insensitive' } }
      ]
    }

    // Get bookings and total count
    const [bookings, totalCount] = await Promise.all([
      prisma.booking.findMany({
        where,
        include: {
          barber: {
            select: {
              id: true,
              name: true,
              specialty: true
            }
          },
          service: {
            select: {
              id: true,
              name: true,
              price: true,
              duration: true
            }
          },
          payments: {
            select: {
              id: true,
              amount: true,
              method: true,
              status: true,
              paidAt: true,
              orderIdGateway: true
            }
          }
        },
        orderBy: {
          startTime: 'desc'
        },
        skip,
        take: limitNum
      }),
      prisma.booking.count({ where })
    ])

    const totalPages = Math.ceil(totalCount / limitNum)

    return NextResponse.json({
      success: true,
      data: {
        bookings,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total: totalCount,
          totalPages,
          hasNext: pageNum < totalPages,
          hasPrev: pageNum > 1
        }
      }
    })

  } catch (error) {
    console.error('Error listing bookings:', error)

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { 
          error: 'Query parameters tidak valid',
          details: error.issues
        },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Terjadi kesalahan saat mengambil data booking' },
      { status: 500 }
    )
  }
}