'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import AdminLayout from '@/components/admin/AdminLayout'

interface PaymentProof {
  id: string
  paymentId: string
  proofImageUrl: string
  amount: number
  status: 'PENDING' | 'APPROVED' | 'REJECTED'
  notes: string | null
  uploadedAt: string
  reviewedAt: string | null
  reviewedBy: string | null
  payment: {
    id: string
    amount: number
    booking: {
      id: string
      customerName: string
      customerPhone: string
      bookingDate: string
      barber: {
        name: string
      }
      services: Array<{
        name: string
        price: number
      }>
    }
  }
}

export default function PaymentProofsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [paymentProofs, setPaymentProofs] = useState<PaymentProof[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'ALL' | 'PENDING' | 'APPROVED' | 'REJECTED'>('PENDING')
  const [selectedProof, setSelectedProof] = useState<PaymentProof | null>(null)
  const [reviewModal, setReviewModal] = useState(false)
  const [reviewNotes, setReviewNotes] = useState('')

  useEffect(() => {
    if (status === 'loading') return
    if (!session || session.user.role !== 'admin') {
      router.push('/admin/login')
      return
    }
    fetchPaymentProofs()
  }, [session, status, router, filter])

  const fetchPaymentProofs = async () => {
    try {
      const url = filter === 'ALL' 
        ? '/api/payment-proof'
        : `/api/payment-proof?status=${filter}`
      
      const response = await fetch(url)
      const data = await response.json()
      
      if (data.success) {
        setPaymentProofs(data.data)
      }
    } catch (error) {
      console.error('Error fetching payment proofs:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleReview = async (status: 'APPROVED' | 'REJECTED') => {
    if (!selectedProof) return

    try {
      const response = await fetch(`/api/payment-proof/${selectedProof.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status,
          notes: reviewNotes,
        }),
      })

      const data = await response.json()
      
      if (data.success) {
        setReviewModal(false)
        setSelectedProof(null)
        setReviewNotes('')
        fetchPaymentProofs()
        alert('Payment proof reviewed successfully!')
      } else {
        alert('Failed to review payment proof: ' + data.error)
      }
    } catch (error) {
      console.error('Error reviewing payment proof:', error)
      alert('Failed to review payment proof')
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800'
      case 'APPROVED':
        return 'bg-green-100 text-green-800'
      case 'REJECTED':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  if (status === 'loading') {
    return <div>Loading...</div>
  }

  if (!session || session.user.role !== 'admin') {
    return null
  }

  return (
    <AdminLayout>
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Payment Proofs Review</h1>
          <p className="text-black">Review and approve customer payment proofs</p>
        </div>

        {/* Filter tabs */}
        <div className="mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              {['ALL', 'PENDING', 'APPROVED', 'REJECTED'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setFilter(tab as any)}
                  className={`py-2 px-1 border-b-2 font-medium text-sm ${
                    filter === tab
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-black hover:text-blue-600 hover:border-gray-300'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-8">Loading...</div>
        ) : paymentProofs.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-black font-medium">No payment proofs found</p>
          </div>
        ) : (
          <div className="bg-white shadow overflow-hidden sm:rounded-md">
            <ul className="divide-y divide-gray-200">
              {paymentProofs.map((proof) => (
                <li key={proof.id}>
                  <div className="px-4 py-4 sm:px-6">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-blue-600 truncate">
                              Booking #{proof.payment.booking.id}
                            </p>
                            <p className="text-sm text-gray-500">
                              Customer: {proof.payment.booking.customerName}
                            </p>
                          </div>
                          <div className="flex items-center space-x-2">
                            <span
                              className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(
                                proof.status
                              )}`}
                            >
                              {proof.status}
                            </span>
                          </div>
                        </div>

                        <div className="mt-2 sm:flex sm:justify-between">
                          <div className="sm:flex">
                            <div className="mr-6">
                              <p className="text-sm text-gray-900">
                                Amount: {formatCurrency(proof.amount)}
                              </p>
                              <p className="text-sm text-gray-500">
                                Barber: {proof.payment.booking.barber.name}
                              </p>
                            </div>
                            <div>
                              <p className="text-sm text-gray-900">
                                Services: {proof.payment.booking.services.map(s => s.name).join(', ')}
                              </p>
                              <p className="text-sm text-gray-500">
                                Uploaded: {formatDate(proof.uploadedAt)}
                              </p>
                            </div>
                          </div>

                          <div className="mt-2 sm:mt-0 flex space-x-2">
                            <button
                              onClick={() => window.open(proof.proofImageUrl, '_blank')}
                              className="text-blue-600 hover:text-blue-900 text-sm font-medium"
                            >
                              View Proof
                            </button>
                            {proof.status === 'PENDING' && (
                              <button
                                onClick={() => {
                                  setSelectedProof(proof)
                                  setReviewModal(true)
                                }}
                                className="text-green-600 hover:text-green-900 text-sm font-medium"
                              >
                                Review
                              </button>
                            )}
                          </div>
                        </div>

                        {proof.notes && (
                          <div className="mt-2">
                            <p className="text-sm text-gray-700">
                              <span className="font-medium">Notes:</span> {proof.notes}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Review Modal */}
        {reviewModal && selectedProof && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4">
              <h3 className="text-lg font-medium mb-4">Review Payment Proof</h3>
              
              <div className="grid md:grid-cols-2 gap-4 mb-6">
                <div>
                  <h4 className="font-medium mb-2">Payment Details</h4>
                  <p className="text-sm text-black">Customer: {selectedProof.payment.booking.customerName}</p>
                  <p className="text-sm text-black">Amount: {formatCurrency(selectedProof.amount)}</p>
                  <p className="text-sm text-black">Barber: {selectedProof.payment.booking.barber.name}</p>
                  <p className="text-sm text-black">
                    Services: {selectedProof.payment.booking.services.map(s => s.name).join(', ')}
                  </p>
                </div>
                <div>
                  <h4 className="font-medium mb-2">Payment Proof</h4>
                  <img
                    src={selectedProof.proofImageUrl}
                    alt="Payment Proof"
                    className="w-full h-48 object-contain border rounded"
                  />
                </div>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Review Notes (optional)
                </label>
                <textarea
                  value={reviewNotes}
                  onChange={(e) => setReviewNotes(e.target.value)}
                  rows={3}
                  className="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Add any notes about this review..."
                />
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => {
                    setReviewModal(false)
                    setSelectedProof(null)
                    setReviewNotes('')
                  }}
                  className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleReview('REJECTED')}
                  className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                >
                  Reject
                </button>
                <button
                  onClick={() => handleReview('APPROVED')}
                  className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                >
                  Approve
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  )
}