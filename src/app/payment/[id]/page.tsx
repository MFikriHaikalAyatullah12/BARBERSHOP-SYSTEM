'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import QRPayment from '@/components/QRPayment'

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
  }>
}

export default function PaymentPage() {
  const params = useParams()
  const router = useRouter()
  const bookingId = params.id as string
  
  const [booking, setBooking] = useState<BookingData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [paymentSuccess, setPaymentSuccess] = useState(false)
  const [quickLoad, setQuickLoad] = useState(true)

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
      // Fast UI feedback
      setTimeout(() => setQuickLoad(false), 600)
      
      try {
        const controller = new AbortController()
        const timeoutId = setTimeout(() => controller.abort(), 4000)
        
        const response = await fetch(`/api/bookings/${bookingId}`, {
          signal: controller.signal,
          cache: 'no-cache'
        })
        
        clearTimeout(timeoutId)
        const data = await response.json()

        if (response.ok && data.success) {
          setBooking(data.data)
          
          // Check if already confirmed
          if (data.data.status === 'CONFIRMED') {
            setPaymentSuccess(true)
          }
        } else {
          const errorMessage = data.error || data.message || 'Booking tidak ditemukan'
          setError(errorMessage)
          console.log('Booking fetch failed:', data)
        }
      } catch (error) {
        if (error instanceof Error && error.name !== 'AbortError') {
          setError('Terjadi kesalahan saat mengambil data booking')
          console.error('Error fetching booking:', error)
        }
      } finally {
        setIsLoading(false)
        setQuickLoad(false)
      }
    }

    if (bookingId) {
      fetchBooking()
    }
  }, [bookingId])

  const handlePaymentSuccess = () => {
    setPaymentSuccess(true)
    // Redirect to success page after a short delay
    setTimeout(() => {
      router.push(`/success/${bookingId}`)
    }, 2000)
  }

  const handlePaymentProofSubmit = async (proofImageUrl: string) => {
    try {
      if (!booking || !booking.payments[0]) {
        throw new Error('Payment information not available')
      }

      const response = await fetch('/api/payment-proof', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          paymentId: booking.payments[0].id,
          proofImageUrl,
          amount: booking.payments[0].amount,
        }),
      })

      const data = await response.json()

      if (data.success) {
        alert('Payment proof uploaded successfully! Your payment will be verified within 1-2 hours.')
        router.push(`/success/${bookingId}`)
      } else {
        throw new Error(data.error || 'Failed to upload payment proof')
      }
    } catch (error) {
      console.error('Error submitting payment proof:', error)
      throw error
    }
  }

  if (quickLoad) {
    return (
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white shadow-sm">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="h-8 bg-gradient-to-r from-blue-200 via-blue-100 to-blue-200 rounded w-48 bg-[length:200%_100%] animate-[shimmer_0.8s_ease-in-out_infinite]"></div>
              <div className="h-4 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 rounded w-32 bg-[length:200%_100%] animate-[shimmer_0.8s_ease-in-out_infinite]"></div>
            </div>
          </div>
        </header>
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto space-y-6">
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="h-6 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 rounded w-32 mb-4 bg-[length:200%_100%] animate-[shimmer_0.8s_ease-in-out_infinite]"></div>
              <div className="grid md:grid-cols-2 gap-6">
                {[1,2].map(i => (
                  <div key={i} className="space-y-3">
                    <div className="h-5 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 rounded w-24 bg-[length:200%_100%] animate-[shimmer_0.8s_ease-in-out_infinite]"></div>
                    {[1,2,3].map(j => (
                      <div key={j} className="space-y-1">
                        <div className="h-3 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 rounded w-16 bg-[length:200%_100%] animate-[shimmer_0.8s_ease-in-out_infinite]"></div>
                        <div className="h-4 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 rounded w-full bg-[length:200%_100%] animate-[shimmer_0.8s_ease-in-out_infinite]"></div>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-black text-sm">Finalizing...</p>
        </div>
      </div>
    )
  }

  if (error || !booking) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="bg-red-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-black mb-4">Booking Tidak Ditemukan</h2>
          <p className="text-red-600 mb-2 font-medium">
            {error || 'Data booking tidak ditemukan atau mungkin telah dihapus'}
          </p>
          <p className="text-gray-600 text-sm mb-6">
            ID Booking: <span className="font-mono">{bookingId}</span>
          </p>
          <div className="space-y-3">
            <button
              onClick={() => window.location.reload()}
              className="w-full bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Coba Lagi
            </button>
            <Link 
              href="/booking"
              className="block bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors text-center"
            >
              Buat Booking Baru
            </Link>
            <Link 
              href="/"
              className="block bg-gray-600 text-white px-6 py-2 rounded-lg hover:bg-gray-700 transition-colors text-center"
            >
              Kembali ke Beranda
            </Link>
          </div>
        </div>
      </div>
    )
  }

  if (paymentSuccess || booking.status === 'CONFIRMED') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="bg-green-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-black mb-4">Pembayaran Berhasil!</h2>
          <p className="text-black mb-6">
            Booking Anda telah dikonfirmasi. Terima kasih telah menggunakan layanan kami.
          </p>
          <Link 
            href={`/success/${bookingId}`}
            className="inline-block bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Lihat Detail Booking
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="text-2xl font-bold text-blue-600">
              Modern Barbershop
            </Link>
            <div className="text-sm text-black">
              Booking ID: <span className="font-mono">{bookingId}</span>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          
          {/* Booking Summary */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <h2 className="text-xl font-semibold mb-4 text-black">Detail Booking</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-medium text-black mb-3">Informasi Pelanggan</h3>
                <div className="space-y-2 text-sm">
                  <div><span className="text-black font-medium">Nama:</span> <span className="text-black">{booking.customerName}</span></div>
                  <div><span className="text-black font-medium">Email:</span> <span className="text-black">{booking.email}</span></div>
                  <div><span className="text-black font-medium">WhatsApp:</span> <span className="text-black">{booking.phone}</span></div>
                </div>
              </div>
              <div>
                <h3 className="font-medium text-black mb-3">Detail Layanan</h3>
                <div className="space-y-2 text-sm">
                  <div><span className="text-black font-medium">Barber:</span> <span className="text-black">{booking.barber.name}</span></div>
                  <div><span className="text-black font-medium">Layanan:</span> <span className="text-black">{booking.service.name}</span></div>
                  <div><span className="text-black font-medium">Durasi:</span> <span className="text-black">{booking.duration} menit</span></div>
                  <div><span className="text-black font-medium">Waktu:</span> <span className="text-black">{formatDateTime(booking.startTime)}</span></div>
                </div>
              </div>
            </div>
            <div className="mt-6 pt-4 border-t border-gray-200">
              <div className="flex justify-between items-center">
                <span className="text-lg font-medium text-black">Total Pembayaran:</span>
                <span className="text-2xl font-bold text-blue-600">
                  {formatCurrency(booking.service.price)}
                </span>
              </div>
            </div>
          </div>

          {/* Payment Methods */}
          <QRPayment
            paymentInfo={{
              id: booking.payments[0]?.id || '',
              amount: booking.service.price,
              bookingId: bookingId,
              expiredAt: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(),
            }}
            onPaymentSubmit={handlePaymentProofSubmit}
          />


        </div>
      </div>
    </div>
  )
}