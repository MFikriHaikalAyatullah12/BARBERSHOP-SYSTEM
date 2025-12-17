'use client'

import { useState, useEffect } from 'react'

interface EmailSettings {
  id: string
  adminEmail: string
  createdAt: string
  updatedAt: string
}

export default function EmailSettingsPage() {
  const [settings, setSettings] = useState<EmailSettings | null>(null)
  const [loading, setLoading] = useState(false)
  const [saved, setSaved] = useState(false)
  const [formData, setFormData] = useState({
    adminEmail: ''
  })

  useEffect(() => {
    fetchSettings()
  }, [])

  const fetchSettings = async () => {
    try {
      const response = await fetch('/api/admin/email-settings')
      if (response.ok) {
        const result = await response.json()
        if (result.success && result.data) {
          setSettings(result.data)
          setFormData({ adminEmail: result.data.adminEmail })
        } else {
          // No settings found yet, keep empty form
          setSettings(null)
          setFormData({ adminEmail: '' })
        }
      } else {
        console.error('Failed to fetch email settings')
      }
    } catch (error) {
      console.error('Error fetching email settings:', error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      console.log('Sending email settings request:', {
        adminEmail: formData.adminEmail,
        skipOAuth: true
      })

      const response = await fetch('/api/admin/email-settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          adminEmail: formData.adminEmail,
          skipOAuth: true  // Use simple email setup without Google OAuth
        })
      })

      const result = await response.json()
      console.log('Response status:', response.status)
      console.log('Response data:', result)
      
      if (result.success) {
        setSettings(result.data)
        setSaved(true)
        setTimeout(() => setSaved(false), 3000)
      } else {
        console.error('Error:', result.error)
        alert(`Error: ${result.error || 'Failed to save email settings'}`)
      }
    } catch (error) {
      console.error('Error saving email settings:', error)
      alert('Error saving email settings. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-8">
        <h1 className="text-xl sm:text-2xl font-bold text-black mb-2">Email Notification Settings</h1>
        <p className="text-black">
          Set your email address to receive booking notifications
        </p>
      </div>

      {/* Success Message */}
      {saved && (
        <div className="p-4 rounded-lg mb-6 bg-green-50 border border-green-200">
          <div className="flex items-center">
            <div className="w-3 h-3 rounded-full mr-3 bg-green-500"></div>
            <span className="font-medium text-green-800">
              ✅ Email address saved successfully!
            </span>
          </div>
        </div>
      )}

      {/* Current Email Status */}
      {settings && (
        <div className="p-4 rounded-lg mb-6 bg-blue-50 border border-blue-200">
          <div className="flex items-center">
            <div className="w-3 h-3 rounded-full mr-3 bg-blue-500"></div>
            <span className="font-medium text-blue-800">
              Current admin email: {settings.adminEmail}
            </span>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="adminEmail" className="block text-sm font-medium text-black mb-2">
            Admin Email Address
          </label>
          <input
            type="email"
            id="adminEmail"
            name="adminEmail"
            required
            value={formData.adminEmail}
            onChange={(e) => setFormData({ adminEmail: e.target.value })}
            className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black text-base"
            placeholder="admin@barbershop.com"
          />
          <p className="text-sm text-gray-600 mt-2">
            This email will receive notifications for new bookings and payments
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4">
          <button
            type="submit"
            disabled={loading}
            className="w-full sm:w-auto bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 disabled:bg-gray-400 transition-colors font-medium touch-manipulation"
          >
            {loading ? 'Saving...' : 'Save Email Settings'}
          </button>
        </div>

        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-800">
            💡 <strong>Note:</strong> No Google OAuth required - simple email notification system
          </p>
        </div>
      </form>
    </div>
  )
}