'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useParams } from 'next/navigation'
import Link from 'next/link'

interface BookingDetail {
  id: string
  customerName: string
  email: string
  phone: string
  startTime: string
  status: string
  notes?: string
  createdAt: string
  barber: {
    id: string
    name: string
    specialty: string
  }
  service: {
    id: string
    name: string
    price: number
    duration: number
  }
  payments: Array<{
    id: string
    amount: number
    method: string
    status: string
    paidAt: string | null
    orderIdGateway?: string
    createdAt: string
    paymentProof: Array<{
      id: string
      proofImageUrl: string
      amount: number
      status: string
      uploadedAt: string
      notes?: string
    }>
  }>
}

export default function BookingDetail() {
  const session = useSession()
  const router = useRouter()
  const params = useParams()
  const [booking, setBooking] = useState<BookingDetail | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [selectedImage, setSelectedImage] = useState<string | null>(null)
  const [quickActions, setQuickActions] = useState(false)

  // Keyboard shortcut for modal
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && selectedImage) {
        setSelectedImage(null)
      }
    }
    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [selectedImage])

  useEffect(() => {
    if (session?.status === 'loading') return
    if (session?.status === 'unauthenticated') {
      router.push('/admin/login')
      return
    }

    if (params?.id) {
      fetchBookingDetail()
    }
  }, [session?.status, router, params])

  const fetchBookingDetail = async () => {
    try {
      // Shorter timeout for faster feedback
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 5000)
      
      const response = await fetch(`/api/admin/bookings/${params.id}`, {
        signal: controller.signal,
        cache: 'no-cache'
      })
      
      clearTimeout(timeoutId)
      
      if (response.ok) {
        const data = await response.json()
        setBooking(data.booking)
        setQuickActions(true) // Enable quick actions immediately
      } else {
        console.error('Failed to fetch booking detail')
      }
    } catch (error) {
      if (error instanceof Error && error.name !== 'AbortError') {
        console.error('Error fetching booking detail:', error)
      }
    } finally {
      setIsLoading(false)
    }
  }

  const updateBookingStatus = async (newStatus: string) => {
    // Optimistic update for instant feedback
    if (booking) {
      const updatedBooking = { ...booking, status: newStatus }
      setBooking(updatedBooking)
    }
    
    try {
      const response = await fetch(`/api/admin/bookings/${params.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: newStatus })
      })

      if (response.ok) {
        // Only refresh if needed
        setTimeout(() => fetchBookingDetail(), 500)
      } else {
        // Revert optimistic update on failure
        fetchBookingDetail()
        alert('Failed to update booking status')
      }
    } catch (error) {
      console.error('Error updating booking:', error)
      fetchBookingDetail() // Revert on error
      alert('Error updating booking status')
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount)
  }

  const formatDateTime = (dateString: string) => {
    return new Intl.DateTimeFormat('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(new Date(dateString))
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'CONFIRMED':
        return 'bg-green-100 text-green-800'
      case 'PENDING_PAYMENT':
        return 'bg-yellow-100 text-yellow-800'
      case 'CANCELLED':
        return 'bg-red-100 text-red-800'
      case 'COMPLETED':
        return 'bg-blue-100 text-blue-800'
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
      case 'COMPLETED':
        return 'Selesai'
      default:
        return status
    }
  }

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case 'PAID':
        return 'bg-green-100 text-green-800'
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800'
      case 'FAILED':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getPaymentStatusText = (status: string) => {
    switch (status) {
      case 'PAID':
        return 'Lunas'
      case 'PENDING':
        return 'Pending'
      case 'FAILED':
        return 'Gagal'
      default:
        return status
    }
  }

  if (session.status === 'loading' || isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        {/* Quick Header Skeleton */}
        <header className="bg-white shadow-sm">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="h-6 bg-gray-200 rounded w-48 animate-pulse"></div>
              </div>
              <div className="h-4 bg-gray-200 rounded w-32 animate-pulse"></div>
            </div>
          </div>
        </header>
        
        <main className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            <div className="mb-6">
              <div className="h-8 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 rounded w-64 mb-2 animate-pulse bg-[length:200%_100%] animate-[shimmer_1.2s_ease-in-out_infinite]"></div>
              <div className="h-4 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 rounded w-32 animate-pulse bg-[length:200%_100%] animate-[shimmer_1.2s_ease-in-out_infinite]"></div>
            </div>
            
            <div className="grid lg:grid-cols-2 gap-8">
              {/* Optimized Booking Info Skeleton */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="h-6 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 rounded w-48 mb-4 animate-pulse bg-[length:200%_100%] animate-[shimmer_1s_ease-in-out_infinite]"></div>
                <div className="space-y-3">
                  {[1,2,3,4].map(i => (
                    <div key={i} className="animate-pulse" style={{animationDelay: `${i * 100}ms`}}>
                      <div className="h-3 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 rounded w-20 mb-1 bg-[length:200%_100%] animate-[shimmer_0.8s_ease-in-out_infinite]"></div>
                      <div className="h-4 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 rounded w-full bg-[length:200%_100%] animate-[shimmer_0.8s_ease-in-out_infinite]"></div>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Optimized Payment Info Skeleton */}
              <div className="space-y-4">
                <div className="bg-white rounded-lg shadow-md p-6">
                  <div className="h-6 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 rounded w-40 mb-4 bg-[length:200%_100%] animate-[shimmer_1s_ease-in-out_infinite]"></div>
                  <div className="h-24 bg-gradient-to-r from-gray-100 via-gray-50 to-gray-100 rounded bg-[length:200%_100%] animate-[shimmer_1.2s_ease-in-out_infinite]"></div>
                </div>
                <div className="bg-white rounded-lg shadow-md p-6">
                  <div className="h-6 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 rounded w-20 mb-4 bg-[length:200%_100%] animate-[shimmer_1s_ease-in-out_infinite]"></div>
                  <div className="space-y-2">
                    <div className="h-8 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 rounded bg-[length:200%_100%] animate-[shimmer_0.9s_ease-in-out_infinite]"></div>
                    <div className="h-8 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 rounded bg-[length:200%_100%] animate-[shimmer_0.9s_ease-in-out_infinite]"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    )
  }

  if (session.status === 'unauthenticated') {
    return null
  }

  if (!booking) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Booking not found</h2>
          <Link 
            href="/admin/bookings"
            className="text-blue-600 hover:text-blue-700"
          >
            ← Back to Bookings
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
            <div className="flex items-center space-x-4">
              <Link href="/" className="text-2xl font-bold text-blue-600">
                Modern Barbershop
              </Link>
              <span className="text-gray-400">|</span>
              <span className="text-gray-600">Admin Panel</span>
            </div>
            <Link href="/admin/bookings" className="text-blue-600 hover:text-blue-700">
              ← Back to Bookings
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-800 mb-2">
              Booking Detail
            </h1>
            <p className="text-gray-600">ID: {booking.id}</p>
          </div>

          <div className="grid lg:grid-cols-2 gap-8">
            {/* Booking Information */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">
                Booking Information
              </h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Customer Name
                  </label>
                  <p className="text-gray-900">{booking.customerName}</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <p className="text-gray-900">{booking.email}</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Phone
                  </label>
                  <p className="text-gray-900">{booking.phone}</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Service
                  </label>
                  <p className="text-gray-900">{booking.service.name}</p>
                  <p className="text-sm text-gray-600">
                    {booking.service.duration} minutes - {formatCurrency(booking.service.price)}
                  </p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Barber
                  </label>
                  <p className="text-gray-900">{booking.barber.name}</p>
                  <p className="text-sm text-gray-600">{booking.barber.specialty}</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Appointment Time
                  </label>
                  <p className="text-gray-900">{formatDateTime(booking.startTime)}</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Status
                  </label>
                  <span className={`px-3 py-1 text-sm font-medium rounded-full ${getStatusColor(booking.status)}`}>
                    {getStatusText(booking.status)}
                  </span>
                </div>

                {booking.notes && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Notes
                    </label>
                    <p className="text-gray-900">{booking.notes}</p>
                  </div>
                )}
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Created At
                  </label>
                  <p className="text-gray-900">{formatDateTime(booking.createdAt)}</p>
                </div>
              </div>
            </div>

            {/* Payment Information & Actions */}
            <div className="space-y-6">
              {/* Payment History */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-xl font-semibold text-gray-800 mb-4">
                  Payment History
                </h2>
                
                {booking.payments.length > 0 ? (
                  <div className="space-y-4">
                    {booking.payments.map((payment) => (
                      <div key={payment.id} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <p className="font-medium text-gray-900">
                              {formatCurrency(payment.amount)}
                            </p>
                            <p className="text-sm text-gray-600">
                              {payment.method} • {formatDateTime(payment.createdAt)}
                            </p>
                            {payment.orderIdGateway && (
                              <p className="text-xs text-gray-500">
                                Order ID: {payment.orderIdGateway}
                              </p>
                            )}
                          </div>
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${getPaymentStatusColor(payment.status)}`}>
                            {getPaymentStatusText(payment.status)}
                          </span>
                        </div>
                        {payment.paidAt && (
                          <p className="text-sm text-gray-600">
                            Paid at: {formatDateTime(payment.paidAt)}
                          </p>
                        )}
                        
                        {/* Payment Proof Section - Optimized Display */}
                        {payment.paymentProof && payment.paymentProof.length > 0 ? (
                          <div className="mt-3 border-t border-gray-100 pt-3">
                            <p className="text-sm font-medium text-gray-700 mb-2">
                              Bukti Pembayaran: ({payment.paymentProof.length} file)
                            </p>
                            <div className="space-y-3">
                              {payment.paymentProof.map((proof) => (
                                <div key={proof.id} className="border border-gray-100 rounded-lg p-3 bg-gray-50 hover:bg-gray-100 transition-colors">
                                  <div className="flex items-start justify-between mb-3">
                                    <div>
                                      <p className="text-sm font-medium text-gray-700">
                                        Amount: {formatCurrency(proof.amount)}
                                      </p>
                                      <p className="text-xs text-gray-500">
                                        Uploaded: {formatDateTime(proof.uploadedAt)}
                                      </p>
                                    </div>
                                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                                      proof.status === 'APPROVED' ? 'bg-green-100 text-green-800' :
                                      proof.status === 'REJECTED' ? 'bg-red-100 text-red-800' :
                                      'bg-yellow-100 text-yellow-800'
                                    }`}>
                                      {proof.status === 'APPROVED' ? 'Disetujui' :
                                       proof.status === 'REJECTED' ? 'Ditolak' : 'Pending'}
                                    </span>
                                  </div>
                                  
                                  {/* Optimized Image Display */}
                                  <div className="mt-2">
                                    <div className="relative group">
                                      {/* Loading placeholder */}
                                      <div className="flex items-center justify-center h-40 bg-gray-200 rounded-lg animate-pulse absolute inset-0">
                                        <div className="text-gray-400">
                                          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                          </svg>
                                        </div>
                                      </div>
                                      
                                      <img 
                                        src={proof.proofImageUrl} 
                                        alt="Payment Proof"
                                        loading="lazy"
                                        className="relative z-10 w-full h-auto max-h-48 object-contain rounded-lg border-2 border-blue-200 cursor-pointer hover:border-blue-400 hover:shadow-md transition-all duration-300 bg-white"
                                        onClick={() => setSelectedImage(proof.proofImageUrl)}
                                        onLoad={(e) => {
                                          const target = e.target as HTMLImageElement;
                                          const placeholder = target.previousElementSibling as HTMLElement;
                                          if (placeholder) placeholder.style.display = 'none';
                                        }}
                                        onError={(e) => {
                                          const target = e.target as HTMLImageElement;
                                          const container = target.parentElement;
                                          if (container) {
                                            container.innerHTML = `
                                              <div class="flex items-center justify-center h-40 bg-red-50 rounded-lg border-2 border-red-200">
                                                <div class="text-center p-4">
                                                  <svg class="w-12 h-12 text-red-400 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                                                  </svg>
                                                  <p class="text-sm text-red-600 font-medium mb-1">Gambar tidak dapat dimuat</p>
                                                  <p class="text-xs text-red-400">File mungkin sudah dihapus atau rusak</p>
                                                  <button class="mt-2 px-3 py-1 bg-red-100 hover:bg-red-200 text-red-700 text-xs rounded-md transition-colors" onclick="window.open('${proof.proofImageUrl}', '_blank')">Coba buka langsung</button>
                                                </div>
                                              </div>
                                            `;
                                          }
                                        }}
                                      />
                                      
                                      {/* Hover overlay */}
                                      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 rounded-lg transition-all duration-300 flex items-center justify-center">
                                        <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                          <div className="bg-white bg-opacity-90 rounded-full p-2">
                                            <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                            </svg>
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                    <p className="text-xs text-gray-500 mt-2 text-center">
                                      Klik gambar untuk memperbesar
                                    </p>
                                  </div>
                                  
                                  {proof.notes && (
                                    <div className="mt-3 pt-2 border-t border-gray-200">
                                      <p className="text-sm text-gray-700">
                                        <span className="font-medium text-gray-800">Catatan:</span> {proof.notes}
                                      </p>
                                    </div>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        ) : (
                          <div className="mt-3 border-t border-gray-100 pt-3">
                            <p className="text-sm text-gray-500 italic">
                              Belum ada bukti pembayaran yang di-upload
                            </p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500">No payment records found</p>
                )}
              </div>

              {/* Status Actions */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-xl font-semibold text-gray-800 mb-4">
                  Actions
                </h2>
                
                <div className="space-y-3">
                  {booking.status === 'PENDING_PAYMENT' && (
                    <>
                      <button
                        onClick={() => updateBookingStatus('CONFIRMED')}
                        className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                      >
                        Confirm Booking
                      </button>
                      <button
                        onClick={() => updateBookingStatus('CANCELLED')}
                        className="w-full px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                      >
                        Cancel Booking
                      </button>
                    </>
                  )}
                  
                  {booking.status === 'CONFIRMED' && (
                    <>
                      <button
                        onClick={() => updateBookingStatus('COMPLETED')}
                        className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        Mark as Completed
                      </button>
                      <button
                        onClick={() => updateBookingStatus('CANCELLED')}
                        className="w-full px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                      >
                        Cancel Booking
                      </button>
                    </>
                  )}
                  
                  {booking.status === 'COMPLETED' && (
                    <div className="text-center py-4 text-gray-500">
                      <p>✅ Booking completed</p>
                    </div>
                  )}
                  
                  {booking.status === 'CANCELLED' && (
                    <div className="text-center py-4 text-gray-500">
                      <p>❌ Booking cancelled</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Enhanced Image Modal */}
      {selectedImage && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50 p-4"
          onClick={() => setSelectedImage(null)}
        >
          <div className="relative max-w-5xl max-h-full" onClick={(e) => e.stopPropagation()}>
            {/* Close Button */}
            <button
              onClick={() => setSelectedImage(null)}
              className="absolute -top-12 right-0 bg-white bg-opacity-20 hover:bg-opacity-30 text-white rounded-full p-3 transition-all duration-200 z-10"
              title="Tutup (ESC)"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            
            {/* Loading placeholder */}
            <div className="flex items-center justify-center min-h-[40vh] bg-gray-800 rounded-lg">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
            </div>
            
            <img 
              src={selectedImage} 
              alt="Payment Proof - Full View"
              className="absolute inset-0 w-full h-full object-contain rounded-lg shadow-2xl"
              style={{ maxHeight: 'calc(100vh - 4rem)' }}
              onLoad={(e) => {
                const target = e.target as HTMLImageElement;
                const placeholder = target.previousElementSibling as HTMLElement;
                if (placeholder) placeholder.style.display = 'none';
              }}
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                const container = target.parentElement;
                if (container) {
                  container.innerHTML = `
                    <div class="flex items-center justify-center min-h-[40vh] bg-red-900 rounded-lg text-white">
                      <div class="text-center p-8">
                        <svg class="w-16 h-16 text-red-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                        </svg>
                        <p class="text-lg font-medium mb-2">Gambar tidak dapat dimuat</p>
                        <p class="text-sm text-gray-300 mb-4">File mungkin sudah dihapus atau mengalami kerusakan</p>
                        <button class="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg transition-colors" onclick="window.open('${selectedImage}', '_blank')">Coba buka di tab baru</button>
                      </div>
                    </div>
                  `;
                }
              }}
            />
            
            {/* Info Bar */}
            <div className="absolute bottom-4 left-4 right-4 flex justify-between items-center">
              <div className="bg-black bg-opacity-70 text-white px-4 py-2 rounded-lg">
                <p className="font-medium">Bukti Pembayaran</p>
                <p className="text-xs text-gray-300">Klik di luar gambar untuk menutup</p>
              </div>
              <button
                onClick={() => window.open(selectedImage, '_blank')}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors flex items-center space-x-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
                <span>Buka di tab baru</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}