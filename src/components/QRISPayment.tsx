'use client'

import { useState, useEffect } from 'react'
import QRCode from 'react-qr-code'

interface QRISPaymentProps {
  bookingId: string
  amount: number
  onPaymentSuccess: () => void
}

interface PaymentData {
  id: string
  orderId: string
  qrString: string
  amount: number
  expiredAt: string
}

export default function QRISPayment({ bookingId, amount, onPaymentSuccess }: QRISPaymentProps) {
  const [paymentData, setPaymentData] = useState<PaymentData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [timeLeft, setTimeLeft] = useState(0)
  const [isCheckingStatus, setIsCheckingStatus] = useState(false)

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount)
  }

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`
  }

  // Create QRIS payment
  useEffect(() => {
    const createQRISPayment = async () => {
      try {
        const response = await fetch('/api/payment/qris/create', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ bookingId })
        })

        const data = await response.json()

        if (response.ok) {
          setPaymentData(data.payment)
          
          // Calculate time left
          const expiredAt = new Date(data.payment.expiredAt)
          const now = new Date()
          const timeDiff = Math.max(0, Math.floor((expiredAt.getTime() - now.getTime()) / 1000))
          setTimeLeft(timeDiff)
        } else {
          setError(data.error || 'Gagal membuat pembayaran QRIS')
        }
      } catch (error) {
        setError('Terjadi kesalahan saat membuat pembayaran QRIS')
        console.error('Error creating QRIS payment:', error)
      } finally {
        setIsLoading(false)
      }
    }

    createQRISPayment()
  }, [bookingId])

  // Countdown timer
  useEffect(() => {
    if (timeLeft <= 0) return

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          setError('Pembayaran telah kedaluwarsa. Silakan buat booking baru.')
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [timeLeft])

  // Check payment status periodically
  useEffect(() => {
    if (!paymentData || timeLeft <= 0) return

    const checkStatus = async () => {
      if (isCheckingStatus) return

      setIsCheckingStatus(true)
      try {
        const response = await fetch(`/api/payment/qris/status?orderId=${paymentData.orderId}`)
        const data = await response.json()

        if (response.ok) {
          if (data.data.paymentStatus === 'PAID') {
            onPaymentSuccess()
          }
        }
      } catch (error) {
        console.error('Error checking payment status:', error)
      } finally {
        setIsCheckingStatus(false)
      }
    }

    // Check immediately, then every 5 seconds
    checkStatus()
    const interval = setInterval(checkStatus, 5000)

    return () => clearInterval(interval)
  }, [paymentData, timeLeft, isCheckingStatus, onPaymentSuccess])

  const handleManualCheck = async () => {
    if (!paymentData || isCheckingStatus) return

    setIsCheckingStatus(true)
    try {
      const response = await fetch('/api/payment/qris/status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId: paymentData.orderId })
      })

      const data = await response.json()

      if (response.ok) {
        if (data.data.paymentStatus === 'PAID') {
          onPaymentSuccess()
        } else {
          // Show status message
          alert(data.data.updated 
            ? 'Status pembayaran telah diperbarui' 
            : 'Pembayaran belum diterima')
        }
      } else {
        alert(data.error || 'Gagal mengecek status pembayaran')
      }
    } catch (error) {
      alert('Terjadi kesalahan saat mengecek status pembayaran')
      console.error('Error checking payment status:', error)
    } finally {
      setIsCheckingStatus(false)
    }
  }

  if (isLoading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Membuat pembayaran QRIS...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      </div>
    )
  }

  if (!paymentData) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-600">Data pembayaran tidak ditemukan</p>
      </div>
    )
  }

  return (
    <div className="max-w-md mx-auto">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="text-center mb-6">
          <div className="bg-blue-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Pembayaran QRIS</h2>
          <p className="text-gray-600">Scan QR code dengan aplikasi e-wallet atau mobile banking Anda</p>
        </div>

        {/* QR Code */}
        <div className="bg-white p-4 rounded-lg border-2 border-gray-200 mb-6">
          <div className="flex justify-center">
            <QRCode
              value={paymentData.qrString}
              size={200}
              style={{ height: "auto", maxWidth: "100%", width: "100%" }}
            />
          </div>
        </div>

        {/* Payment Details */}
        <div className="space-y-3 mb-6">
          <div className="flex justify-between">
            <span className="text-gray-600">Order ID:</span>
            <span className="font-mono text-sm">{paymentData.orderId}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Jumlah:</span>
            <span className="font-semibold text-lg">{formatCurrency(paymentData.amount)}</span>
          </div>
        </div>

        {/* Timer */}
        {timeLeft > 0 ? (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-yellow-800 font-medium">Waktu tersisa:</p>
                <p className="text-yellow-600 text-sm">QR code akan kedaluwarsa dalam</p>
              </div>
              <div className="text-2xl font-bold text-yellow-800">
                {formatTime(timeLeft)}
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-800 font-medium">QR code telah kedaluwarsa</p>
            <p className="text-red-600 text-sm">Silakan buat booking baru</p>
          </div>
        )}

        {/* Instructions */}
        <div className="bg-gray-50 rounded-lg p-4 mb-6">
          <h3 className="font-medium text-gray-800 mb-2">Cara Pembayaran:</h3>
          <ol className="text-sm text-gray-600 space-y-1 list-decimal list-inside">
            <li>Buka aplikasi e-wallet atau mobile banking</li>
            <li>Pilih menu "Scan QR" atau "QRIS"</li>
            <li>Arahkan kamera ke QR code di atas</li>
            <li>Konfirmasi pembayaran</li>
            <li>Simpan bukti pembayaran</li>
          </ol>
        </div>

        {/* Status Check */}
        <div className="space-y-3">
          <button
            onClick={handleManualCheck}
            disabled={isCheckingStatus || timeLeft <= 0}
            className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {isCheckingStatus ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Mengecek Status...
              </div>
            ) : (
              'Cek Status Pembayaran'
            )}
          </button>

          <div className="text-center">
            <div className="flex items-center justify-center text-sm text-gray-500">
              <div className={`w-2 h-2 rounded-full mr-2 ${isCheckingStatus ? 'bg-yellow-400 animate-pulse' : 'bg-green-400'}`}></div>
              {isCheckingStatus ? 'Mengecek pembayaran...' : 'Status akan dicek otomatis'}
            </div>
          </div>
        </div>

        {/* Support */}
        <div className="mt-6 pt-4 border-t border-gray-200">
          <p className="text-xs text-gray-500 text-center">
            Mengalami kesulitan? Hubungi customer service kami untuk bantuan.
          </p>
        </div>
      </div>
    </div>
  )
}