'use client'

import { useState, useEffect } from 'react'

interface QRCodeSetting {
  id: string
  qrisImageUrl: string
  instructions: string | null
  isActive: boolean
  createdAt: string
  updatedAt: string
}

interface PaymentInfo {
  id: string
  amount: number
  bookingId: string
  expiredAt: string
}

interface QRPaymentProps {
  paymentInfo: PaymentInfo
  onPaymentSubmit: (proofImageUrl: string) => Promise<void>
}

export default function QRPayment({ paymentInfo, onPaymentSubmit }: QRPaymentProps) {
  const [qrSetting, setQrSetting] = useState<QRCodeSetting | null>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [proofImage, setProofImage] = useState<File | null>(null)
  const [proofImagePreview, setProofImagePreview] = useState('')
  const [proofImageData, setProofImageData] = useState('')
  const [timeLeft, setTimeLeft] = useState<string>('')
  const [uploadError, setUploadError] = useState('')
  const [fastLoading, setFastLoading] = useState(true)

  useEffect(() => {
    fetchQRSetting()
    const timer = setInterval(updateTimeLeft, 1000)
    
    // Cleanup function
    return () => {
      clearInterval(timer)
      // Clean up any preview URLs
      if (proofImagePreview) {
        URL.revokeObjectURL(proofImagePreview)
      }
    }
  }, [proofImagePreview])

  const fetchQRSetting = async () => {
    try {
      // Fast loading feedback
      setTimeout(() => setFastLoading(false), 800)
      
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 3000)
      
      const response = await fetch('/api/admin/qr-settings', {
        signal: controller.signal,
        cache: 'force-cache'
      })
      
      clearTimeout(timeoutId)
      const data = await response.json()
      
      if (data.success) {
        setQrSetting(data.data)
      }
    } catch (error) {
      if (error.name !== 'AbortError') {
        console.error('Error fetching QR setting:', error)
      }
    } finally {
      setLoading(false)
      setFastLoading(false)
    }
  }

  const updateTimeLeft = () => {
    const now = new Date()
    const expiry = new Date(paymentInfo.expiredAt)
    const diff = expiry.getTime() - now.getTime()

    if (diff <= 0) {
      setTimeLeft('Expired')
      return
    }

    const hours = Math.floor(diff / (1000 * 60 * 60))
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
    const seconds = Math.floor((diff % (1000 * 60)) / 1000)

    setTimeLeft(`${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`)
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) {
      setProofImage(null)
      setProofImagePreview('')
      setProofImageData('')
      setUploadError('')
      return
    }

    // Validate file type
    if (!file.type.match(/^image\/(jpeg|jpg|png|gif|webp)$/)) {
      setUploadError('Format file tidak didukung. Gunakan JPG, PNG, GIF, atau WebP.')
      return
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024 // 5MB
    if (file.size > maxSize) {
      setUploadError('Ukuran file terlalu besar. Maksimal 5MB.')
      return
    }

    setUploadError('')
    setProofImage(file)

    try {
      // Create preview URL
      const previewUrl = URL.createObjectURL(file)
      setProofImagePreview(previewUrl)

      // Convert to base64 for storage
      const reader = new FileReader()
      reader.onloadend = () => {
        const result = reader.result as string
        setProofImageData(result)
      }
      reader.onerror = () => {
        setUploadError('Gagal membaca file. Coba lagi.')
      }
      reader.readAsDataURL(file)
    } catch (error) {
      console.error('Error processing file:', error)
      setUploadError('Terjadi kesalahan saat memproses file.')
    }
  }

  const handleSubmitProof = async () => {
    if (!proofImage || !proofImageData) {
      setUploadError('Silakan pilih file bukti pembayaran.')
      return
    }

    setSubmitting(true)
    setUploadError('')
    
    try {
      // Submit with base64 data
      await onPaymentSubmit(proofImageData)
      
      // Clean up preview URL
      if (proofImagePreview) {
        URL.revokeObjectURL(proofImagePreview)
      }
    } catch (error) {
      console.error('Error submitting payment proof:', error)
      setUploadError('Gagal mengunggah bukti pembayaran. Coba lagi.')
    } finally {
      setSubmitting(false)
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
    }).format(amount)
  }

  if (fastLoading) {
    return (
      <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-lg p-6">
        <div className="text-center mb-6">
          <div className="h-8 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 rounded w-64 mx-auto mb-2 bg-[length:200%_100%] animate-[shimmer_0.8s_ease-in-out_infinite]"></div>
          <div className="h-4 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 rounded w-48 mx-auto bg-[length:200%_100%] animate-[shimmer_0.8s_ease-in-out_infinite]"></div>
        </div>
        <div className="grid md:grid-cols-2 gap-6">
          <div className="text-center">
            <div className="h-6 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 rounded w-32 mx-auto mb-4 bg-[length:200%_100%] animate-[shimmer_0.8s_ease-in-out_infinite]"></div>
            <div className="w-64 h-64 bg-gradient-to-r from-gray-100 via-gray-50 to-gray-100 rounded-lg mx-auto bg-[length:200%_100%] animate-[shimmer_1s_ease-in-out_infinite]"></div>
          </div>
          <div>
            <div className="h-6 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 rounded w-40 mb-4 bg-[length:200%_100%] animate-[shimmer_0.8s_ease-in-out_infinite]"></div>
            <div className="space-y-3">
              <div className="h-10 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 rounded bg-[length:200%_100%] animate-[shimmer_0.8s_ease-in-out_infinite]"></div>
              <div className="h-24 bg-gradient-to-r from-gray-100 via-gray-50 to-gray-100 rounded bg-[length:200%_100%] animate-[shimmer_1s_ease-in-out_infinite]"></div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (loading) {
    return <div className="text-center py-4"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div></div>
  }

  if (!qrSetting) {
    return (
      <div className="text-center py-8">
        <p className="text-red-600">QR code payment is not configured. Please contact the administrator.</p>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-lg p-6">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-black mb-2">Complete Your Payment</h2>
        <p className="text-black">Scan QR code and upload payment proof</p>
      </div>

      {/* Payment Timer */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
        <div className="flex items-center justify-between">
          <span className="text-yellow-800 font-medium">Payment expires in:</span>
          <span className="text-yellow-900 font-bold text-lg">{timeLeft}</span>
        </div>
      </div>

      {/* Payment Amount */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
        <div className="text-center">
          <p className="text-blue-800 text-sm">Total Payment</p>
          <p className="text-blue-900 text-3xl font-bold">{formatCurrency(paymentInfo.amount)}</p>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6 mb-6">
        {/* QR Code */}
        <div className="text-center">
          <h3 className="text-lg font-medium mb-4 text-black">Scan QRIS Code</h3>
          <div className="flex justify-center mb-4">
            <img
              src={qrSetting.qrisImageUrl}
              alt="Payment QR Code"
              className="w-64 h-64 object-contain border rounded-lg"
            />
          </div>
          
          <div className="text-left bg-gray-50 p-4 rounded-lg">
            <h4 className="font-medium mb-2 text-black">Payment Instructions:</h4>
            {qrSetting.instructions ? (
              <p className="text-sm text-black">{qrSetting.instructions}</p>
            ) : (
              <div className="text-sm text-black">
                <ol className="list-decimal list-inside space-y-1">
                  <li>Scan QRIS code above using your banking app</li>
                  <li>Enter the payment amount: <strong>{formatCurrency(paymentInfo.amount)}</strong></li>
                  <li>Complete the payment</li>
                  <li>Upload payment proof screenshot below</li>
                </ol>
              </div>
            )}
          </div>
        </div>

        {/* Upload Proof */}
        <div>
          <h3 className="text-lg font-medium mb-4 text-black">Upload Payment Proof</h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-black mb-2">
                Upload Screenshot/Photo of Payment
              </label>
              <input
                type="file"
                accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                onChange={handleFileUpload}
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 transition-colors"
              />
              <p className="text-xs text-gray-500 mt-1">
                Format: JPG, PNG, GIF, WebP. Maksimal 5MB.
              </p>
              {uploadError && (
                <p className="text-sm text-red-600 mt-2 bg-red-50 p-2 rounded-md border border-red-200">
                  {uploadError}
                </p>
              )}
            </div>

            {proofImagePreview && (
              <div>
                <p className="text-sm font-medium text-black mb-2">Preview:</p>
                <div className="relative">
                  <img
                    src={proofImagePreview}
                    alt="Payment Proof Preview"
                    className="w-full h-48 object-contain border-2 border-gray-200 rounded-lg bg-gray-50"
                  />
                  {proofImage && (
                    <div className="absolute top-2 left-2 bg-black bg-opacity-70 text-white text-xs px-2 py-1 rounded">
                      {(proofImage.size / 1024 / 1024).toFixed(1)}MB
                    </div>
                  )}
                </div>
              </div>
            )}

            <button
              onClick={handleSubmitProof}
              disabled={!proofImage || !proofImageData || submitting || !!uploadError}
              className="w-full bg-green-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
            >
              {submitting ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Mengupload...
                </div>
              ) : (
                'Submit Payment Proof'
              )}
            </button>

            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-medium mb-2 text-black">Important Notes:</h4>
              <ul className="text-sm text-black space-y-1">
                <li>• Make sure the payment amount matches exactly</li>
                <li>• Upload clear, readable screenshots</li>
                <li>• Payment will be verified manually by our team</li>
                <li>• You will receive confirmation within 1-2 hours</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}