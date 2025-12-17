'use client'

import { useState, useEffect } from 'react'

interface Payment {
  id: string
  bookingId: string
  amount: number
  status: string
  method: string
  createdAt: string
  booking: {
    customerName: string
    email: string
    service: {
      name: string
    }
  }
}

export default function PaymentsPage() {
  const [payments, setPayments] = useState<Payment[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchPayments()
  }, [])

  const fetchPayments = async () => {
    try {
      // Since there's no API endpoint yet, we'll show mock data for now
      // In the future, this would fetch from /api/admin/payments
      setPayments([])
    } catch (error) {
      console.error('Error fetching payments:', error)
    } finally {
      setLoading(false)
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
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(new Date(dateString))
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'SUCCESS':
        return 'bg-green-100 text-green-800'
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800'
      case 'FAILED':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'SUCCESS':
        return 'Berhasil'
      case 'PENDING':
        return 'Menunggu'
      case 'FAILED':
        return 'Gagal'
      default:
        return status
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-black">Loading payments...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-black">Manajemen Pembayaran</h1>
          <p className="text-black">Monitor transaksi pembayaran</p>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-black">Riwayat Pembayaran</h2>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase">
                  ID Transaksi
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase">
                  Customer
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase">
                  Layanan
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase">
                  Jumlah
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase">
                  Metode
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase">
                  Tanggal
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {payments.map((payment) => (
                <tr key={payment.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-black">{payment.id}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-black">{payment.booking.customerName}</div>
                      <div className="text-sm text-gray-500">{payment.booking.email}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-black">{payment.booking.service.name}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-black">{formatCurrency(payment.amount)}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-black">{payment.method}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(payment.status)}`}>
                      {getStatusText(payment.status)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-black">{formatDateTime(payment.createdAt)}</div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {payments.length === 0 && (
          <div className="p-6 text-center text-black">
            Belum ada data pembayaran
          </div>
        )}
      </div>
    </div>
  )
}