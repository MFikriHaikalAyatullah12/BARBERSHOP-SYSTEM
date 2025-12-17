import BookingForm from '@/components/BookingForm'
import Link from 'next/link'

export default function BookingPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="text-2xl font-bold text-blue-600">
              Modern Barbershop
            </Link>
            <nav className="hidden md:flex space-x-6">
              <Link href="/" className="text-gray-600 hover:text-blue-600">
                Beranda
              </Link>
              <Link href="/#services" className="text-gray-600 hover:text-blue-600">
                Layanan
              </Link>
              <Link href="/admin" className="text-gray-600 hover:text-blue-600">
                Admin
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-4">
              Booking Layanan Barbershop
            </h1>
            <p className="text-gray-600 text-lg">
              Isi form di bawah untuk melakukan booking. Prosesnya mudah dan cepat!
            </p>
          </div>

          <BookingForm />

          {/* Additional Info */}
          <div className="mt-12 grid md:grid-cols-2 gap-8">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-xl font-semibold mb-4 text-gray-800">
                📋 Syarat & Ketentuan
              </h3>
              <ul className="space-y-2 text-gray-600">
                <li>• Booking hanya bisa dilakukan untuk hari kerja (Senin-Sabtu)</li>
                <li>• Jam operasional: 09:00 - 19:00 WIB</li>
                <li>• Pembayaran harus dilakukan dalam 30 menit setelah booking</li>
                <li>• Booking akan otomatis dibatalkan jika tidak ada pembayaran</li>
                <li>• Datang tepat waktu sesuai jadwal booking</li>
              </ul>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-xl font-semibold mb-4 text-gray-800">
                💳 Metode Pembayaran
              </h3>
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    🏦
                  </div>
                  <div>
                    <h4 className="font-medium">Transfer Bank</h4>
                    <p className="text-sm text-gray-600">BCA - Modern Barbershop</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                    📱
                  </div>
                  <div>
                    <h4 className="font-medium">QRIS</h4>
                    <p className="text-sm text-gray-600">Semua e-wallet & mobile banking</p>
                  </div>
                </div>
              </div>
            </div>
          </div>


        </div>
      </main>
    </div>
  )
}