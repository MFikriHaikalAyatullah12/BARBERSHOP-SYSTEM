'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'

interface BookingData {
  id: string
  customerName: string
  email: string
  phone: string
  startTime: string
  endTime: string
  duration: number
  status: string
  barber: {
    name: string
    specialty: string
  }
  service: {
    name: string
    description: string
    price: number
    duration: number
  }
  payments: Array<{
    id: string
    amount: number
    method: string
    status: string
    paidAt: string | null
  }>
}

export default function SuccessPage() {
  const params = useParams()
  const bookingId = params.id as string
  
  const [booking, setBooking] = useState<BookingData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount)
  }

  const formatDateTime = (dateString: string) => {
    return new Intl.DateTimeFormat('id-ID', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      timeZone: 'Asia/Jakarta'
    }).format(new Date(dateString))
  }

  useEffect(() => {
    const fetchBooking = async () => {
      try {
        const response = await fetch(`/api/bookings/${bookingId}`)
        const data = await response.json()

        if (response.ok && data.success) {
          setBooking(data.data)
        } else {
          setError('Booking tidak ditemukan')
        }
      } catch (error) {
        setError('Terjadi kesalahan saat mengambil data booking')
        console.error('Error fetching booking:', error)
      } finally {
        setIsLoading(false)
      }
    }

    if (bookingId) {
      fetchBooking()
    }
  }, [bookingId])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'CONFIRMED':
        return 'bg-green-100 text-green-800'
      case 'PENDING_PAYMENT':
        return 'bg-yellow-100 text-yellow-800'
      case 'CANCELLED':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'CONFIRMED':
        return 'Dikonfirmasi'
      case 'PENDING_PAYMENT':
        return 'Menunggu Pembayaran'
      case 'CANCELLED':
        return 'Dibatalkan'
      default:
        return status
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Memuat data booking...</p>
        </div>
      </div>
    )
  }

  if (error || !booking) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error || 'Booking tidak ditemukan'}
          </div>
          <Link 
            href="/"
            className="inline-block bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Kembali ke Beranda
          </Link>
        </div>
      </div>
    )
  }

  const paidPayment = booking.payments.find(p => p.status === 'PAID')

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="text-2xl font-bold text-blue-600">
              Modern Barbershop
            </Link>
            <div className="text-sm text-gray-600">
              Booking ID: <span className="font-mono">{bookingId}</span>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          
          {/* Success Message */}
          <div className="text-center mb-8">
            <div className="bg-green-100 rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-6">
              <svg className="w-12 h-12 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h1 className="text-3xl font-bold text-gray-800 mb-4">
              {booking.status === 'CONFIRMED' ? 'Booking Berhasil!' : 'Booking Diterima!'}
            </h1>
            <p className="text-lg text-gray-600">
              {booking.status === 'CONFIRMED' 
                ? 'Terima kasih! Booking Anda telah dikonfirmasi.'
                : 'Booking Anda telah diterima dan menunggu konfirmasi pembayaran.'
              }
            </p>
          </div>

          {/* Booking Details */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-gray-800">Detail Booking</h2>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(booking.status)}`}>
                {getStatusText(booking.status)}
              </span>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-gray-500">Nama Pelanggan</label>
                  <p className="font-medium">{booking.customerName}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-500">Email</label>
                  <p className="font-medium">{booking.email}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-gray-500">Barber</label>
                  <p className="font-medium">{booking.barber.name}</p>
                  <p className="text-sm text-gray-600">{booking.barber.specialty}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-500">Layanan</label>
                  <p className="font-medium">{booking.service.name}</p>
                  <p className="text-sm text-gray-600">{booking.duration} menit</p>
                </div>
              </div>

              <div>
                <label className="text-sm text-gray-500">Tanggal & Waktu</label>
                <p className="font-medium">{formatDateTime(booking.startTime)}</p>
                <p className="text-sm text-gray-600">
                  Estimasi selesai: {formatDateTime(booking.endTime)}
                </p>
              </div>

              <div className="pt-4 border-t border-gray-200">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-medium text-gray-700">Total Biaya:</span>
                  <span className="text-2xl font-bold text-blue-600">
                    {formatCurrency(booking.service.price)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Payment Info */}
          {paidPayment && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-6">
              <h3 className="text-lg font-semibold text-green-800 mb-4">Informasi Pembayaran</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-green-700">Metode Pembayaran:</span>
                  <span className="font-medium text-green-800">
                    {paidPayment.method === 'QRIS' ? 'QRIS' : 'Transfer Bank'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-green-700">Jumlah Dibayar:</span>
                  <span className="font-medium text-green-800">{formatCurrency(paidPayment.amount)}</span>
                </div>
                {paidPayment.paidAt && (
                  <div className="flex justify-between">
                    <span className="text-green-700">Waktu Pembayaran:</span>
                    <span className="font-medium text-green-800">
                      {formatDateTime(paidPayment.paidAt)}
                    </span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-green-700">Status:</span>
                  <span className="font-medium text-green-800">✓ Lunas</span>
                </div>
              </div>
            </div>
          )}

          {/* Instructions */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
            <h3 className="text-lg font-semibold text-blue-800 mb-4">Apa Selanjutnya?</h3>
            <div className="space-y-3 text-blue-700">
              {booking.status === 'CONFIRMED' ? (
                <>
                  <div className="flex items-start space-x-3">
                    <span className="text-xl">📅</span>
                    <div>
                      <p className="font-medium">Datang Tepat Waktu</p>
                      <p className="text-sm">Datang sesuai jadwal booking: {formatDateTime(booking.startTime)}</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <span className="text-xl">📧</span>
                    <div>
                      <p className="font-medium">Check Email</p>
                      <p className="text-sm">Kami telah mengirim konfirmasi ke email Anda</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <span className="text-xl">📞</span>
                    <div>
                      <p className="font-medium">Hubungi Jika Ada Perubahan</p>
                      <p className="text-sm">Jika perlu reschedule, hubungi kami minimal 2 jam sebelumnya</p>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <div className="flex items-start space-x-3">
                    <span className="text-xl">💳</span>
                    <div>
                      <p className="font-medium">Selesaikan Pembayaran</p>
                      <p className="text-sm">Booking akan dikonfirmasi setelah pembayaran diverifikasi</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <span className="text-xl">⏰</span>
                    <div>
                      <p className="font-medium">Batas Waktu 30 Menit</p>
                      <p className="text-sm">Booking akan otomatis dibatalkan jika tidak ada pembayaran</p>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            {booking.status === 'PENDING_PAYMENT' && (
              <Link 
                href={`/payment/${bookingId}`}
                className="block w-full bg-blue-600 text-white text-center py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                Lanjut ke Pembayaran
              </Link>
            )}
            
            <div className="grid grid-cols-2 gap-3">
              <Link 
                href="/"
                className="block bg-gray-100 text-gray-700 text-center py-3 px-4 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Kembali ke Beranda
              </Link>
              <Link 
                href="/booking"
                className="block bg-blue-100 text-blue-700 text-center py-3 px-4 rounded-lg hover:bg-blue-200 transition-colors"
              >
                Booking Lagi
              </Link>
            </div>
          </div>


        </div>
      </div>
    </div>
  )
}