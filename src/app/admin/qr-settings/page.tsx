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

export default function QRSettingsPage() {
  const [qrSetting, setQrSetting] = useState<QRCodeSetting | null>(null)
  const [loading, setLoading] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    instructions: 'Silakan scan QRIS di atas dan transfer sesuai nominal yang tertera. Setelah transfer, mohon upload bukti pembayaran.'
  })

  useEffect(() => {
    fetchQRSetting()
  }, [])

  const fetchQRSetting = async () => {
    try {
      const response = await fetch('/api/admin/qr-settings')
      if (response.ok) {
        const result = await response.json()
        if (result.data) {
          setQrSetting(result.data)
          setFormData({
            instructions: result.data.instructions || 'Silakan scan QRIS di atas dan transfer sesuai nominal yang tertera. Setelah transfer, mohon upload bukti pembayaran.'
          })
          setPreviewUrl(result.data.qrisImageUrl || null)
        }
      }
    } catch (error) {
      console.error('Error fetching QR settings:', error)
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setSelectedFile(file)
      
      // Create preview URL
      const reader = new FileReader()
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      let qrisImageUrl = qrSetting?.qrisImageUrl || ''

      // If there's a new file, convert to base64
      if (selectedFile) {
        const reader = new FileReader()
        reader.onloadend = async () => {
          qrisImageUrl = reader.result as string
          
          const response = await fetch('/api/admin/qr-settings', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              qrisImageUrl,
              instructions: formData.instructions
            })
          })

          if (response.ok) {
            const result = await response.json()
            setQrSetting(result.data)
            setSelectedFile(null)
            alert('QR settings saved successfully!')
          } else {
            alert('Error saving QR settings')
          }
          setLoading(false)
        }
        reader.readAsDataURL(selectedFile)
      } else {
        // Save without new image
        const response = await fetch('/api/admin/qr-settings', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            qrisImageUrl: qrSetting?.qrisImageUrl || '',
            instructions: formData.instructions
          })
        })

        if (response.ok) {
          const result = await response.json()
          setQrSetting(result.data)
          alert('QR settings saved successfully!')
        } else {
          alert('Error saving QR settings')
        }
        setLoading(false)
      }
    } catch (error) {
      console.error('Error saving QR settings:', error)
      alert('Error saving QR settings')
      setLoading(false)
    }
  }

  return (
    <div className="bg-gray-50 py-4 sm:py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-md p-4 sm:p-6">
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mb-6">QRIS Payment Settings</h1>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Upload QRIS Image
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black text-base"
              />
              <p className="text-sm text-gray-600 mt-2">
                Upload your QRIS code image (JPG, PNG, max 5MB)
              </p>
            </div>

            {/* QR Code Preview */}
            {previewUrl && (
              <div className="flex flex-col lg:flex-row gap-6">
                <div className="lg:w-1/2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Current QR Code
                  </label>
                  <div className="border border-gray-300 rounded-lg p-4 bg-gray-50">
                    <img
                      src={previewUrl}
                      alt="QR Code Preview"
                      className="w-full max-w-sm mx-auto h-auto"
                    />
                  </div>
                </div>

                <div className="lg:w-1/2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Payment Instructions
                  </label>
                  <textarea
                    value={formData.instructions}
                    onChange={(e) => setFormData({ instructions: e.target.value })}
                    rows={6}
                    className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black text-base resize-none"
                    placeholder="Enter payment instructions for customers..."
                  />
                </div>
              </div>
            )}

            {/* Current QRIS Settings */}
            {qrSetting && (
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <h3 className="text-lg font-semibold text-green-800 mb-2">Current QRIS Settings</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center">
                    <span className="font-medium text-green-700">Status:</span>
                    <span className="ml-2 text-green-600">
                      {qrSetting.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  <div className="flex items-center">
                    <span className="font-medium text-green-700">Last Updated:</span>
                    <span className="ml-2 text-green-600">
                      {new Date(qrSetting.updatedAt).toLocaleDateString('id-ID')}
                    </span>
                  </div>
                </div>
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-4">
              <button
                type="submit"
                disabled={loading}
                className="w-full sm:w-auto bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 disabled:bg-gray-400 transition-colors font-medium touch-manipulation"
              >
                {loading ? 'Saving...' : 'Save Settings'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}