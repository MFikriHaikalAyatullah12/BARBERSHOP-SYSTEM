'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

interface Booking {
  id: string
  customerName: string
  email: string
  phone: string
  startTime: string
  status: string
  notes?: string
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
  }>
}

interface BookingsData {
  bookings: Booking[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
    hasNext: boolean
    hasPrev: boolean
  }
}

export default function AdminBookings() {
  const session = useSession()
  const router = useRouter()
  const [bookingsData, setBookingsData] = useState<BookingsData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [filters, setFilters] = useState({
    status: '',
    search: '',
    date: ''
  })
  const [editCustomerModal, setEditCustomerModal] = useState<{
    isOpen: boolean
    booking: Booking | null
    newName: string
  }>({ isOpen: false, booking: null, newName: '' })
  const [deleteModal, setDeleteModal] = useState<{
    isOpen: boolean
    booking: Booking | null
  }>({ isOpen: false, booking: null })

  useEffect(() => {
    if (session?.status === 'loading') return
    if (session?.status === 'unauthenticated') {
      router.push('/admin/login')
      return
    }
    if (session?.data?.user?.role !== 'admin') {
      router.push('/')
      return
    }
    
    fetchBookings()
  }, [session, currentPage, filters])

  const fetchBookings = async () => {
    try {
      setIsLoading(true)
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '10',
        ...(filters.status && { status: filters.status }),
        ...(filters.search && { search: filters.search }),
        ...(filters.date && { date: filters.date })
      })

      const response = await fetch(`/api/admin/bookings?${params}`)
      if (response.ok) {
        const data = await response.json()
        setBookingsData(data)
      }
    } catch (error) {
      console.error('Error fetching bookings:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const updateBookingStatus = async (bookingId: string, newStatus: string) => {
    try {
      const response = await fetch(`/api/bookings/${bookingId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: newStatus })
      })

      if (response.ok) {
        fetchBookings()
      } else {
        alert('Failed to update booking status')
      }
    } catch (error) {
      console.error('Error updating booking:', error)
      alert('Error updating booking status')
    }
  }

  const updateCustomerName = async () => {
    if (!editCustomerModal.booking || !editCustomerModal.newName.trim()) {
      alert('Customer name is required')
      return
    }

    try {
      const response = await fetch(`/api/admin/bookings/${editCustomerModal.booking.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ customerName: editCustomerModal.newName.trim() })
      })

      if (response.ok) {
        fetchBookings()
        setEditCustomerModal({ isOpen: false, booking: null, newName: '' })
        alert('Customer name updated successfully')
      } else {
        alert('Failed to update customer name')
      }
    } catch (error) {
      console.error('Error updating customer name:', error)
      alert('Error updating customer name')
    }
  }

  const deleteBooking = async () => {
    if (!deleteModal.booking) return

    try {
      const response = await fetch(`/api/admin/bookings/${deleteModal.booking.id}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        fetchBookings()
        setDeleteModal({ isOpen: false, booking: null })
        alert('Booking deleted successfully')
      } else {
        alert('Failed to delete booking')
      }
    } catch (error) {
      console.error('Error deleting booking:', error)
      alert('Error deleting booking')
    }
  }

  const openEditCustomerModal = (booking: Booking) => {
    setEditCustomerModal({
      isOpen: true,
      booking,
      newName: booking.customerName
    })
  }

  const closeEditCustomerModal = () => {
    setEditCustomerModal({ isOpen: false, booking: null, newName: '' })
  }

  const openDeleteModal = (booking: Booking) => {
    setDeleteModal({
      isOpen: true,
      booking: booking
    })
  }

  const closeDeleteModal = () => {
    setDeleteModal({ isOpen: false, booking: null })
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
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(new Date(dateString))
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING_PAYMENT':
        return 'bg-yellow-100 text-yellow-800'
      case 'CONFIRMED':
        return 'bg-green-100 text-green-800'
      case 'COMPLETED':
        return 'bg-blue-100 text-blue-800'
      case 'CANCELLED':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'PENDING_PAYMENT':
        return 'Menunggu Pembayaran'
      case 'CONFIRMED':
        return 'Dikonfirmasi'
      case 'COMPLETED':
        return 'Selesai'
      case 'CANCELLED':
        return 'Dibatalkan'
      default:
        return status
    }
  }

  const getPaymentStatus = (payments: Booking['payments']) => {
    if (!payments || payments.length === 0) {
      return { text: 'Belum Bayar', color: 'bg-red-100 text-red-800' }
    }
    
    const latestPayment = payments[0]
    switch (latestPayment.status) {
      case 'completed':
        return { text: 'Lunas', color: 'bg-green-100 text-green-800' }
      case 'pending':
        return { text: 'Menunggu', color: 'bg-yellow-100 text-yellow-800' }
      case 'failed':
        return { text: 'Gagal', color: 'bg-red-100 text-red-800' }
      default:
        return { text: 'Unknown', color: 'bg-gray-100 text-gray-800' }
    }
  }

  if (session?.status === 'loading' || isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-black">Loading bookings...</p>
        </div>
      </div>
    )
  }

  if (session?.status === 'unauthenticated') {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link href="/" className="text-2xl font-bold text-blue-600">
                Modern Barbershop
              </Link>
              <span className="text-black">|</span>
              <span className="text-black">Admin Panel</span>
            </div>
            <Link href="/admin/dashboard" className="text-blue-600 hover:text-blue-700">
              ← Back to Dashboard
            </Link>
          </div>
        </div>
      </header>

      <nav className="bg-blue-600 text-white">
        <div className="container mx-auto px-4">
          <div className="flex space-x-8">
            <Link 
              href="/admin/dashboard"
              className="py-4 px-2 border-b-2 border-transparent hover:border-blue-400"
            >
              Dashboard
            </Link>
            <Link 
              href="/admin/bookings"
              className="py-4 px-2 border-b-2 border-blue-400 font-medium"
            >
              Bookings
            </Link>
            <Link 
              href="/admin/barbers"
              className="py-4 px-2 border-b-2 border-transparent hover:border-blue-400"
            >
              Barbers
            </Link>
            <Link 
              href="/admin/services"
              className="py-4 px-2 border-b-2 border-transparent hover:border-blue-400"
            >
              Services
            </Link>
            <Link 
              href="/admin/qr-settings"
              className="py-4 px-2 border-b-2 border-transparent hover:border-blue-400 font-medium text-yellow-300"
            >
              📱 QR Settings
            </Link>
            <Link 
              href="/admin/payment-proofs"
              className="py-4 px-2 border-b-2 border-transparent hover:border-blue-400"
            >
              Payment Proofs
            </Link>
          </div>
        </div>
      </nav>

      <main className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">Booking Management</h1>
          
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <div className="grid md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Status
                </label>
                <select
                  value={filters.status}
                  onChange={(e) => {
                    setFilters(prev => ({ ...prev, status: e.target.value }))
                    setCurrentPage(1)
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">All Status</option>
                  <option value="PENDING_PAYMENT">Menunggu Pembayaran</option>
                  <option value="CONFIRMED">Dikonfirmasi</option>
                  <option value="COMPLETED">Selesai</option>
                  <option value="CANCELLED">Dibatalkan</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Date
                </label>
                <input
                  type="date"
                  value={filters.date}
                  onChange={(e) => {
                    setFilters(prev => ({ ...prev, date: e.target.value }))
                    setCurrentPage(1)
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Search
                </label>
                <input
                  type="text"
                  placeholder="Search customer, email, phone..."
                  value={filters.search}
                  onChange={(e) => {
                    setFilters(prev => ({ ...prev, search: e.target.value }))
                    setCurrentPage(1)
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Customer
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Service & Barber
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Time
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Price
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Payment
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {bookingsData?.bookings.map((booking) => {
                    const paymentStatus = getPaymentStatus(booking.payments)
                    return (
                      <tr key={booking.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <div className="text-sm font-medium text-gray-900">
                                {booking.customerName}
                              </div>
                              <div className="text-sm text-black">
                                {booking.email}
                              </div>
                              <div className="text-sm text-black">
                                {booking.phone}
                              </div>
                            </div>
                            <button
                              onClick={() => openEditCustomerModal(booking)}
                              className="ml-2 text-blue-600 hover:text-blue-700 p-1 rounded"
                              title="Edit customer name"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                              </svg>
                            </button>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {booking.service.name}
                            </div>
                            <div className="text-sm text-black">
                              {booking.barber.name}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {formatDateTime(booking.startTime)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {formatCurrency(booking.service.price)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(booking.status)}`}>
                            {getStatusText(booking.status)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${paymentStatus.color}`}>
                            {paymentStatus.text}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <div className="flex space-x-2">
                            {booking.status === 'PENDING_PAYMENT' && (
                              <button
                                onClick={() => updateBookingStatus(booking.id, 'CONFIRMED')}
                                className="text-green-600 hover:text-green-700 font-medium"
                              >
                                Confirm
                              </button>
                            )}
                            {booking.status === 'CONFIRMED' && (
                              <button
                                onClick={() => updateBookingStatus(booking.id, 'COMPLETED')}
                                className="text-blue-600 hover:text-blue-700 font-medium"
                              >
                                Complete
                              </button>
                            )}
                            {(booking.status === 'PENDING_PAYMENT' || booking.status === 'CONFIRMED') && (
                              <button
                                onClick={() => updateBookingStatus(booking.id, 'CANCELLED')}
                                className="text-red-600 hover:text-red-700 font-medium"
                              >
                                Cancel
                              </button>
                            )}
                            <Link 
                              href={`/admin/bookings/${booking.id}`}
                              className="text-blue-600 hover:text-blue-700 font-medium"
                            >
                              View
                            </Link>
                            <button
                              onClick={() => openDeleteModal(booking)}
                              className="text-red-600 hover:text-red-700 font-medium"
                              title="Delete booking"
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>

            {bookingsData?.bookings?.length === 0 && (
              <div className="p-6 text-center text-black font-medium">
                No bookings found
              </div>
            )}

            {bookingsData?.pagination?.totalPages && bookingsData.pagination.totalPages > 1 && (
              <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
                <div className="text-sm text-gray-700">
                  Showing {((bookingsData?.pagination?.page || 1) - 1) * (bookingsData?.pagination?.limit || 10) + 1} to{' '}
                  {Math.min((bookingsData?.pagination?.page || 1) * (bookingsData?.pagination?.limit || 10), bookingsData?.pagination?.total || 0)} of{' '}
                  {bookingsData?.pagination?.total || 0} results
                </div>
                <div className="flex space-x-1">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={!bookingsData?.pagination?.hasPrev}
                    className="px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Previous
                  </button>
                  
                  {Array.from({ length: Math.min(5, bookingsData?.pagination?.totalPages || 1) }, (_, i) => {
                    const pageNum = i + Math.max(1, (bookingsData?.pagination?.page || 1) - 2)
                    if (pageNum <= (bookingsData?.pagination?.totalPages || 1)) {
                      return (
                        <button
                          key={pageNum}
                          onClick={() => setCurrentPage(pageNum)}
                          className={`px-3 py-2 text-sm font-medium rounded-md ${
                            pageNum === (bookingsData?.pagination?.page || 1)
                              ? 'text-white bg-blue-600'
                              : 'text-gray-700 bg-white border border-gray-300 hover:bg-gray-50'
                          }`}
                        >
                          {pageNum}
                        </button>
                      )
                    }
                  })}
                  
                  <button
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, bookingsData?.pagination?.totalPages || 1))}
                    disabled={!bookingsData?.pagination?.hasNext}
                    className="px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      {editCustomerModal.isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">
                Edit Customer Name
              </h3>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Current Name: <span className="text-gray-500">{editCustomerModal.booking?.customerName}</span>
                  </label>
                  <input
                    type="text"
                    value={editCustomerModal.newName}
                    onChange={(e) => setEditCustomerModal(prev => ({
                      ...prev,
                      newName: e.target.value
                    }))}
                    placeholder="Enter new customer name"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-black"
                  />
                </div>
              </div>
            </div>
            <div className="px-6 py-4 border-t border-gray-200 flex justify-end space-x-3">
              <button
                onClick={closeEditCustomerModal}
                className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={updateCustomerName}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Update Name
              </button>
            </div>
          </div>
        </div>
      )}

      {deleteModal.isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">
                Delete Booking
              </h3>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                <div className="text-sm text-gray-700">
                  <p className="mb-2">Are you sure you want to delete this booking?</p>
                  <div className="bg-gray-100 p-3 rounded-md">
                    <p><strong>Customer:</strong> {deleteModal.booking?.customerName}</p>
                    <p><strong>Service:</strong> {deleteModal.booking?.service.name}</p>
                    <p><strong>Barber:</strong> {deleteModal.booking?.barber.name}</p>
                    <p><strong>Time:</strong> {deleteModal.booking && formatDateTime(deleteModal.booking.startTime)}</p>
                  </div>
                  <p className="mt-2 text-red-600 font-medium">
                    This action cannot be undone.
                  </p>
                </div>
              </div>
            </div>
            <div className="px-6 py-4 border-t border-gray-200 flex justify-end space-x-3">
              <button
                onClick={closeDeleteModal}
                className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={deleteBooking}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
              >
                Delete Booking
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}