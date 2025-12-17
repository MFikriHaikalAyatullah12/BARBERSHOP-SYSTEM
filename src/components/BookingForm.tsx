'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { z } from 'zod'

interface Barber {
  id: string
  name: string
  specialty: string
  description: string
  imageUrl: string
}

interface Service {
  id: string
  name: string
  description: string
  duration: number
  price: number
}

const bookingSchema = z.object({
  customerName: z.string().min(2, 'Nama minimal 2 karakter'),
  email: z.string().email('Email tidak valid'),
  phone: z.string()
    .min(10, 'Nomor WhatsApp minimal 10 karakter')
    .max(15, 'Nomor WhatsApp maksimal 15 karakter')
    .regex(/^[0-9+\-\s()]+$/, 'Format nomor WhatsApp tidak valid'),
  barberId: z.string().min(1, 'Pilih barber'),
  serviceId: z.string().min(1, 'Pilih layanan'),
  date: z.string().min(1, 'Pilih tanggal'),
  time: z.string().min(1, 'Pilih waktu'),
  paymentMethod: z.enum(['QRIS', 'CASH'], 'Pilih metode pembayaran'),
  notes: z.string().optional()
})

export default function BookingForm() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(1)
  const [isLoading, setIsLoading] = useState(false)
  const [dataLoading, setDataLoading] = useState(true)
  const [barbers, setBarbers] = useState<Barber[]>([])
  const [services, setServices] = useState<Service[]>([])
  const [formData, setFormData] = useState({
    customerName: '',
    email: '',
    phone: '',
    barberId: '',
    serviceId: '',
    date: '',
    time: '',
    paymentMethod: 'QRIS' as 'QRIS' | 'CASH',
    notes: ''
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [availability, setAvailability] = useState<{
    checking: boolean
    available: boolean
    message: string
  }>({
    checking: false,
    available: true,
    message: ''
  })

  // Fetch barbers and services on mount
  useEffect(() => {
    const fetchData = async () => {
      setDataLoading(true)
      try {
        const [barbersRes, servicesRes] = await Promise.all([
          fetch('/api/barbers'),
          fetch('/api/services')
        ])

        if (barbersRes.ok) {
          const barbersData = await barbersRes.json()
          setBarbers(barbersData.data || [])
        } else {
          console.error('Failed to fetch barbers')
        }

        if (servicesRes.ok) {
          const servicesData = await servicesRes.json()
          setServices(servicesData.data || [])
        } else {
          console.error('Failed to fetch services')
        }
      } catch (error) {
        console.error('Error fetching data:', error)
      } finally {
        setDataLoading(false)
      }
    }

    fetchData()
  }, [])

  // Check availability when barberId, serviceId, date, or time changes
  useEffect(() => {
    const checkAvailability = async () => {
      if (!formData.barberId || !formData.serviceId || !formData.date || !formData.time) {
        return
      }

      setAvailability({ checking: true, available: true, message: '' })

      try {
        const response = await fetch('/api/availability', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            barberId: formData.barberId,
            serviceId: formData.serviceId,
            date: formData.date,
            time: formData.time
          })
        })

        const data = await response.json()
        
        if (response.ok) {
          setAvailability({
            checking: false,
            available: data.available,
            message: data.message
          })
        } else {
          setAvailability({
            checking: false,
            available: false,
            message: data.error || 'Error checking availability'
          })
        }
      } catch (error) {
        setAvailability({
          checking: false,
          available: false,
          message: 'Error checking availability'
        })
      }
    }

    const debounce = setTimeout(checkAvailability, 500)
    return () => clearTimeout(debounce)
  }, [formData.barberId, formData.serviceId, formData.date, formData.time])

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount)
  }

  const generateTimeSlots = () => {
    const slots = []
    for (let hour = 9; hour < 19; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        const time = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`
        slots.push(time)
      }
    }
    return slots
  }

  const getMinDate = () => {
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    return tomorrow.toISOString().split('T')[0]
  }

  const getMaxDate = () => {
    const maxDate = new Date()
    maxDate.setDate(maxDate.getDate() + 30)
    return maxDate.toISOString().split('T')[0]
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  const validateStep = (step: number) => {
    const stepErrors: Record<string, string> = {}

    if (step === 1) {
      if (!formData.customerName.trim()) {
        stepErrors.customerName = 'Nama diperlukan'
      } else if (formData.customerName.trim().length < 2) {
        stepErrors.customerName = 'Nama minimal 2 karakter'
      }
      
      if (!formData.email.trim()) {
        stepErrors.email = 'Email diperlukan'
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
        stepErrors.email = 'Format email tidak valid'
      }
      
      if (!formData.phone.trim()) {
        stepErrors.phone = 'Nomor WhatsApp diperlukan'
      } else if (formData.phone.trim().length < 10) {
        stepErrors.phone = 'Nomor WhatsApp minimal 10 karakter'
      } else if (formData.phone.trim().length > 15) {
        stepErrors.phone = 'Nomor WhatsApp maksimal 15 karakter'
      } else if (!/^[0-9+\-\s()]+$/.test(formData.phone.trim())) {
        stepErrors.phone = 'Format nomor WhatsApp tidak valid'
      }
    } else if (step === 2) {
      if (!formData.barberId) stepErrors.barberId = 'Pilih barber'
      if (!formData.serviceId) stepErrors.serviceId = 'Pilih layanan'
    } else if (step === 3) {
      if (!formData.date) stepErrors.date = 'Pilih tanggal'
      if (!formData.time) stepErrors.time = 'Pilih waktu'
      if (!availability.available) stepErrors.time = availability.message
    } else if (step === 4) {
      if (!formData.paymentMethod) {
        stepErrors.paymentMethod = 'Pilih metode pembayaran'
      }
    }

    setErrors(stepErrors)
    return stepErrors
  }

  const handleNext = () => {
    const stepErrors = validateStep(currentStep)
    if (Object.keys(stepErrors).length === 0) {
      setCurrentStep(prev => prev + 1)
    }
  }

  const handlePrevious = () => {
    setCurrentStep(prev => prev - 1)
  }

  const handleSubmit = async () => {
    // Validate all steps first
    const step1Valid = validateStep(1)
    const step2Valid = validateStep(2) 
    const step3Valid = validateStep(3)
    const step4Valid = validateStep(4)
    
    const allStepErrors = { ...step1Valid, ...step2Valid, ...step3Valid, ...step4Valid }
    
    if (Object.keys(allStepErrors).length > 0) {
      setErrors(allStepErrors)
      const firstError = Object.values(allStepErrors)[0]
      alert(`Validasi gagal: ${firstError}`)
      console.log('Validation failed - all errors:', allStepErrors)
      return
    }

    if (!availability.available) {
      alert('Slot waktu tidak tersedia. Pilih waktu lain.')
      console.log('Availability check failed:', availability)
      return
    }

    setIsLoading(true)
    console.log('Submitting booking with data:', formData)

    try {
      const result = bookingSchema.parse(formData)
      console.log('Schema validation passed:', result)
      
      const response = await fetch('/api/bookings/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(result)
      })

      const data = await response.json()
      console.log('API Response:', { status: response.status, data })

      if (response.ok) {
        console.log('Booking created successfully:', data)
        
        if (formData.paymentMethod === 'CASH') {
          alert('Booking berhasil dibuat! Anda dapat datang ke lokasi sesuai jadwal dan membayar di tempat.')
          router.push(`/success/${data.booking.id}`)
        } else {
          alert('Booking berhasil dibuat! Mengarahkan ke halaman pembayaran QRIS...')
          router.push(`/payment/${data.booking.id}`)
        }
      } else {
        console.error('Booking creation failed:', data)
        setErrors({ submit: data.error || 'Terjadi kesalahan' })
        alert('Error: ' + (data.error || 'Terjadi kesalahan'))
      }
    } catch (error) {
      console.error('Error in handleSubmit:', error)
      if (error instanceof z.ZodError) {
        const fieldErrors: Record<string, string> = {}
        error.issues.forEach((err: any) => {
          if (err.path[0]) {
            fieldErrors[err.path[0] as string] = err.message
          }
        })
        setErrors(fieldErrors)
        const firstError = Object.values(fieldErrors)[0]
        alert(`Validasi gagal: ${firstError}`)
        console.log('Validation errors:', fieldErrors)
      } else {
        setErrors({ submit: 'Terjadi kesalahan' })
        alert('Error: Terjadi kesalahan tak terduga')
      }
    } finally {
      setIsLoading(false)
    }
  }

  const selectedService = services.find(s => s.id === formData.serviceId)

  return (
    <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-lg p-6">
      {/* Progress Bar */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-blue-600">Step {currentStep} of 4</span>
          <span className="text-sm text-gray-500">
            {currentStep === 1 && 'Informasi Personal'}
            {currentStep === 2 && 'Pilih Barber & Layanan'}
            {currentStep === 3 && 'Pilih Waktu'}
            {currentStep === 4 && 'Metode Pembayaran'}
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${(currentStep / 4) * 100}%` }}
          />
        </div>
      </div>

      {/* Step 1: Personal Information */}
      {currentStep === 1 && (
        <div className="space-y-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Informasi Personal</h2>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nama Lengkap *
            </label>
            <input
              type="text"
              value={formData.customerName}
              onChange={(e) => handleInputChange('customerName', e.target.value)}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black bg-white ${
                errors.customerName ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Masukkan nama lengkap"
            />
            {errors.customerName && (
              <p className="text-red-500 text-sm mt-1">{errors.customerName}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email *
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black bg-white ${
                errors.email ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="contoh@email.com"
            />
            {errors.email && (
              <p className="text-red-500 text-sm mt-1">{errors.email}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nomor WhatsApp *
            </label>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => handleInputChange('phone', e.target.value)}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black bg-white ${
                errors.phone ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="08123456789 (minimal 10 karakter)"
            />
            <p className="text-xs text-gray-500 mt-1">
              Contoh: 08123456789, 021-12345678, atau +62812345678
            </p>
            {errors.phone && (
              <p className="text-red-500 text-sm mt-1">{errors.phone}</p>
            )}
          </div>
        </div>
      )}

      {/* Step 2: Barber & Service Selection */}
      {currentStep === 2 && (
        <div className="space-y-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Pilih Barber & Layanan</h2>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Pilih Barber *
            </label>
            {dataLoading ? (
              <div className="flex items-center justify-center p-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <span className="ml-3 text-gray-600">Memuat data barber...</span>
              </div>
            ) : barbers.length === 0 ? (
              <div className="p-4 text-center text-gray-500 border border-gray-300 rounded-lg">
                Tidak ada barber tersedia. Silakan hubungi admin.
              </div>
            ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {barbers.map((barber) => (
                <div
                  key={barber.id}
                  onClick={() => handleInputChange('barberId', barber.id)}
                  className={`p-4 border rounded-lg cursor-pointer transition-all ${
                    formData.barberId === barber.id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-300 hover:border-blue-300'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                      <span className="text-xl">👨‍💼</span>
                    </div>
                    <div>
                      <h3 className="font-medium text-black">{barber.name}</h3>
                      <p className="text-sm text-gray-700">{barber.specialty}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            )}
            {errors.barberId && (
              <p className="text-red-500 text-sm mt-1">{errors.barberId}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Pilih Layanan *
            </label>
            {dataLoading ? (
              <div className="flex items-center justify-center p-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <span className="ml-3 text-gray-600">Memuat data layanan...</span>
              </div>
            ) : services.length === 0 ? (
              <div className="p-4 text-center text-gray-500 border border-gray-300 rounded-lg">
                Tidak ada layanan tersedia. Silakan hubungi admin.
              </div>
            ) : (
            <div className="space-y-3">
              {services.map((service) => (
                <div
                  key={service.id}
                  onClick={() => handleInputChange('serviceId', service.id)}
                  className={`p-4 border rounded-lg cursor-pointer transition-all ${
                    formData.serviceId === service.id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-300 hover:border-blue-300'
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="font-medium text-black">{service.name}</h3>
                      <p className="text-sm text-gray-700">{service.description}</p>
                      <p className="text-sm text-gray-600">{service.duration} menit</p>
                    </div>
                    <div className="text-right">
                      <span className="text-lg font-semibold text-blue-600">
                        {formatCurrency(service.price)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            )}
            {errors.serviceId && (
              <p className="text-red-500 text-sm mt-1">{errors.serviceId}</p>
            )}
          </div>
        </div>
      )}

      {/* Step 3: Date & Time Selection */}
      {currentStep === 3 && (
        <div className="space-y-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Pilih Tanggal & Waktu</h2>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tanggal *
            </label>
            <input
              type="date"
              value={formData.date}
              onChange={(e) => handleInputChange('date', e.target.value)}
              min={getMinDate()}
              max={getMaxDate()}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black bg-white ${
                errors.date ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.date && (
              <p className="text-red-500 text-sm mt-1">{errors.date}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Waktu *
            </label>
            <div className="grid grid-cols-4 gap-2">
              {generateTimeSlots().map((time) => (
                <button
                  key={time}
                  type="button"
                  onClick={() => handleInputChange('time', time)}
                  className={`p-2 text-sm border rounded-md transition-all ${
                    formData.time === time
                      ? 'border-blue-500 bg-blue-500 text-white'
                      : 'border-gray-300 hover:border-blue-300 text-black bg-white'
                  }`}
                >
                  {time}
                </button>
              ))}
            </div>
            {errors.time && (
              <p className="text-red-500 text-sm mt-1">{errors.time}</p>
            )}
            
            {/* Availability Status */}
            {formData.barberId && formData.serviceId && formData.date && formData.time && (
              <div className="mt-3 p-3 rounded-md">
                {availability.checking ? (
                  <div className="flex items-center text-blue-600">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
                    Mengecek ketersediaan...
                  </div>
                ) : (
                  <div className={`flex items-center ${
                    availability.available ? 'text-green-600' : 'text-red-600'
                  }`}>
                    <span className="mr-2">
                      {availability.available ? '✓' : '✕'}
                    </span>
                    {availability.message}
                  </div>
                )}
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Catatan (Opsional)
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => handleInputChange('notes', e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black bg-white"
              placeholder="Catatan khusus untuk barber (opsional)"
            />
          </div>

          {/* Booking Summary */}
          {selectedService && (
            <div className="p-4 bg-gray-50 rounded-lg">
              <h3 className="font-medium text-gray-800 mb-2">Ringkasan Booking</h3>
              <div className="space-y-1 text-sm text-gray-600">
                <div className="flex justify-between">
                  <span>Layanan:</span>
                  <span>{selectedService.name}</span>
                </div>
                <div className="flex justify-between">
                  <span>Durasi:</span>
                  <span>{selectedService.duration} menit</span>
                </div>
                <div className="flex justify-between">
                  <span>Harga:</span>
                  <span className="font-semibold">{formatCurrency(selectedService.price)}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Step 4: Payment Method Selection */}
      {currentStep === 4 && (
        <div className="space-y-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Pilih Metode Pembayaran</h2>
          
          <div className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              {/* QRIS Payment */}
              <div
                onClick={() => handleInputChange('paymentMethod', 'QRIS')}
                className={`p-4 border rounded-lg cursor-pointer transition-all ${
                  formData.paymentMethod === 'QRIS'
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-300 hover:border-blue-300'
                }`}
              >
                <div className="flex items-center mb-3">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="QRIS"
                    checked={formData.paymentMethod === 'QRIS'}
                    onChange={(e) => handleInputChange('paymentMethod', e.target.value as 'QRIS' | 'CASH')}
                    className="text-blue-600"
                  />
                  <label className="ml-3 font-medium text-gray-800">QRIS / Transfer Bank</label>
                </div>
                <div className="text-sm text-gray-600">
                  <p>• Bayar menggunakan QRIS</p>
                  <p>• Upload bukti pembayaran</p>
                  <p>• Konfirmasi otomatis</p>
                </div>
              </div>

              {/* Cash Payment */}
              <div
                onClick={() => handleInputChange('paymentMethod', 'CASH')}
                className={`p-4 border rounded-lg cursor-pointer transition-all ${
                  formData.paymentMethod === 'CASH'
                    ? 'border-green-500 bg-green-50'
                    : 'border-gray-300 hover:border-green-300'
                }`}
              >
                <div className="flex items-center mb-3">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="CASH"
                    checked={formData.paymentMethod === 'CASH'}
                    onChange={(e) => handleInputChange('paymentMethod', e.target.value as 'QRIS' | 'CASH')}
                    className="text-green-600"
                  />
                  <label className="ml-3 font-medium text-gray-800">Bayar di Lokasi (Cash)</label>
                </div>
                <div className="text-sm text-gray-600">
                  <p>• Bayar saat datang ke lokasi</p>
                  <p>• Tidak perlu transfer dulu</p>
                  <p>• Lebih fleksibel</p>
                </div>
              </div>
            </div>
            
            {errors.paymentMethod && (
              <p className="text-red-500 text-sm mt-1">{errors.paymentMethod}</p>
            )}

            {/* Payment Method Info */}
            <div className="p-4 bg-gray-50 rounded-lg">
              <h4 className="font-medium text-gray-800 mb-2">
                {formData.paymentMethod === 'QRIS' ? 'Informasi Pembayaran QRIS' : 'Informasi Pembayaran Cash'}
              </h4>
              {formData.paymentMethod === 'QRIS' ? (
                <div className="text-sm text-gray-600">
                  <p>Setelah booking dikonfirmasi, Anda akan diarahkan ke halaman pembayaran untuk scan QRIS dan upload bukti transfer.</p>
                </div>
              ) : (
                <div className="text-sm text-gray-600">
                  <p>Anda dapat langsung datang ke lokasi sesuai jadwal yang dipilih dan membayar di tempat. Pastikan datang 5-10 menit sebelum waktu booking.</p>
                </div>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Catatan Tambahan (Opsional)
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => handleInputChange('notes', e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black bg-white"
              placeholder="Catatan khusus untuk barber (opsional)"
            />
          </div>

          {/* Summary */}
          {selectedService && (
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-medium text-gray-800 mb-2">Ringkasan Booking</h4>
              <div className="space-y-1 text-sm text-gray-600">
                <p><span className="font-medium">Layanan:</span> {selectedService.name}</p>
                <p><span className="font-medium">Durasi:</span> {selectedService.duration} menit</p>
                <p><span className="font-medium">Harga:</span> {formatCurrency(selectedService.price)}</p>
                <p><span className="font-medium">Metode Pembayaran:</span> {formData.paymentMethod === 'QRIS' ? 'QRIS (Online)' : 'Cash (Di lokasi)'}</p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Navigation Buttons */}
      <div className="flex justify-between mt-8">
        {currentStep > 1 && (
          <button
            type="button"
            onClick={handlePrevious}
            className="px-6 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
          >
            Sebelumnya
          </button>
        )}
        
        <div className="flex-1" />

        {currentStep < 4 ? (
          <button
            type="button"
            onClick={handleNext}
            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Selanjutnya
          </button>
        ) : (
          <button
            type="button"
            onClick={handleSubmit}
            disabled={isLoading || !availability.available}
            className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <div className="flex items-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Memproses...
              </div>
            ) : (
              'Konfirmasi Booking'
            )}
          </button>
        )}
      </div>

      {errors.submit && (
        <div className="mt-4 p-3 bg-red-50 border border-red-300 rounded-md">
          <p className="text-red-700 text-sm">{errors.submit}</p>
        </div>
      )}
    </div>
  )
}