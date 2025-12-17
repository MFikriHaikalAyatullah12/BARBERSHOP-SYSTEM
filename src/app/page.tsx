import Link from 'next/link'
import Image from 'next/image'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 to-blue-800 text-white">
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Modern Barbershop
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-blue-100">
              Tempat terbaik untuk mendapatkan gaya rambut yang sempurna
            </p>
            <div className="space-y-4 md:space-y-0 md:space-x-4 md:flex md:justify-center">
              <Link
                href="/booking"
                className="inline-block bg-white text-blue-600 px-8 py-4 rounded-lg font-semibold text-lg hover:bg-blue-50 transition-colors"
              >
                Booking Sekarang
              </Link>
              <Link
                href="#services"
                className="inline-block border-2 border-white text-white px-8 py-4 rounded-lg font-semibold text-lg hover:bg-white hover:text-blue-600 transition-colors"
              >
                Lihat Layanan
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-800 mb-4">Mengapa Pilih Kami?</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Kami memberikan pengalaman barbershop terbaik dengan layanan profesional dan kualitas terjamin
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center p-6">
              <div className="bg-blue-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-3">Booking Online Mudah</h3>
              <p className="text-gray-600">
                Sistem booking online yang mudah dan praktis. Pilih barber, layanan, dan waktu sesuai keinginan Anda.
              </p>
            </div>
            
            <div className="text-center p-6">
              <div className="bg-green-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-3">Barber Profesional</h3>
              <p className="text-gray-600">
                Tim barber berpengalaman dengan keahlian dalam berbagai gaya potongan rambut klasik dan modern.
              </p>
            </div>
            
            <div className="text-center p-6">
              <div className="bg-purple-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-3">Pembayaran Digital</h3>
              <p className="text-gray-600">
                Mendukung pembayaran digital melalui QRIS untuk kemudahan dan keamanan transaksi Anda.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section id="services" className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-800 mb-4">Layanan Kami</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Berbagai layanan grooming profesional untuk membuat Anda tampil percaya diri
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
              <div className="text-center">
                <div className="text-4xl mb-4">✂️</div>
                <h3 className="text-xl font-semibold mb-2">Basic Haircut</h3>
                <p className="text-gray-600 text-sm mb-4">Professional haircut with basic styling</p>
                <div className="text-2xl font-bold text-blue-600 mb-2">Rp 50.000</div>
                <div className="text-sm text-gray-500">30 menit</div>
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
              <div className="text-center">
                <div className="text-4xl mb-4">💇‍♂️</div>
                <h3 className="text-xl font-semibold mb-2">Premium Cut & Style</h3>
                <p className="text-gray-600 text-sm mb-4">Premium haircut with wash, cut, and styling</p>
                <div className="text-2xl font-bold text-blue-600 mb-2">Rp 75.000</div>
                <div className="text-sm text-gray-500">45 menit</div>
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
              <div className="text-center">
                <div className="text-4xl mb-4">🧔</div>
                <h3 className="text-xl font-semibold mb-2">Full Service Package</h3>
                <p className="text-gray-600 text-sm mb-4">Haircut, beard trim, hot towel treatment, and styling</p>
                <div className="text-2xl font-bold text-blue-600 mb-2">Rp 100.000</div>
                <div className="text-sm text-gray-500">60 menit</div>
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
              <div className="text-center">
                <div className="text-4xl mb-4">🪒</div>
                <h3 className="text-xl font-semibold mb-2">Beard Trim Only</h3>
                <p className="text-gray-600 text-sm mb-4">Professional beard trimming and shaping</p>
                <div className="text-2xl font-bold text-blue-600 mb-2">Rp 30.000</div>
                <div className="text-sm text-gray-500">20 menit</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Barbers Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-800 mb-4">Tim Barber Kami</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Bertemu dengan tim barber profesional kami yang siap memberikan pelayanan terbaik
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-32 h-32 bg-gray-200 rounded-full mx-auto mb-4 flex items-center justify-center">
                <span className="text-4xl">👨‍💼</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">John Smith</h3>
              <p className="text-blue-600 font-medium mb-2">Classic Cuts & Beard Styling</p>
              <p className="text-gray-600 text-sm">
                Expert barber dengan 10+ tahun pengalaman dalam classic dan modern cuts
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-32 h-32 bg-gray-200 rounded-full mx-auto mb-4 flex items-center justify-center">
                <span className="text-4xl">👨‍💼</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Mike Johnson</h3>
              <p className="text-blue-600 font-medium mb-2">Fade Specialist</p>
              <p className="text-gray-600 text-sm">
                Master of fades dan modern styling techniques
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-32 h-32 bg-gray-200 rounded-full mx-auto mb-4 flex items-center justify-center">
                <span className="text-4xl">👨‍💼</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">David Wilson</h3>
              <p className="text-blue-600 font-medium mb-2">Traditional & Premium Services</p>
              <p className="text-gray-600 text-sm">
                Specialist dalam traditional barbering dan luxury grooming
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-800 mb-4">Apa Kata Pelanggan</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Testimoni dari pelanggan yang telah merasakan layanan terbaik kami
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mr-4">
                  <span className="text-xl">👤</span>
                </div>
                <div>
                  <h4 className="font-semibold">Ahmad Rizki</h4>
                  <div className="flex text-yellow-400">
                    ⭐⭐⭐⭐⭐
                  </div>
                </div>
              </div>
              <p className="text-gray-600 italic">
                "Pelayanan sangat memuaskan! Barbernya profesional dan hasilnya sesuai harapan. Sistem booking online-nya juga praktis."
              </p>
            </div>
            
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mr-4">
                  <span className="text-xl">👤</span>
                </div>
                <div>
                  <h4 className="font-semibold">Budi Santoso</h4>
                  <div className="flex text-yellow-400">
                    ⭐⭐⭐⭐⭐
                  </div>
                </div>
              </div>
              <p className="text-gray-600 italic">
                "Tempat favorit untuk potong rambut. Atmosfernya nyaman dan hasilnya selalu rapi. Highly recommended!"
              </p>
            </div>
            
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mr-4">
                  <span className="text-xl">👤</span>
                </div>
                <div>
                  <h4 className="font-semibold">Doni Pratama</h4>
                  <div className="flex text-yellow-400">
                    ⭐⭐⭐⭐⭐
                  </div>
                </div>
              </div>
              <p className="text-gray-600 italic">
                "Pembayaran pakai QRIS sangat memudahkan. Pelayanannya cepat dan berkualitas. Pasti akan kembali lagi!"
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-blue-600 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Siap untuk Tampil Berbeda?</h2>
          <p className="text-xl mb-8 text-blue-100">
            Booking sekarang dan rasakan pengalaman barbershop terbaik di kota
          </p>
          <Link
            href="/booking"
            className="inline-block bg-white text-blue-600 px-8 py-4 rounded-lg font-semibold text-lg hover:bg-blue-50 transition-colors"
          >
            Booking Sekarang Juga
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-8">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8">
            <div>
              <h3 className="text-xl font-semibold mb-4">Modern Barbershop</h3>
              <p className="text-gray-400">
                Tempat terbaik untuk mendapatkan gaya rambut yang sempurna dengan pelayanan profesional.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Jam Operasional</h4>
              <div className="text-gray-400 space-y-2">
                <p>Senin - Sabtu: 09:00 - 19:00</p>
                <p>Minggu: Tutup</p>
              </div>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Kontak</h4>
              <div className="text-gray-400 space-y-2">
                <p>📍 Jl. Barbershop No. 123, Jakarta</p>
                <p>📞 +62 812 3456 7890</p>
                <p>📧 info@modernbarbershop.com</p>
              </div>
            </div>
          </div>
          
          <div className="border-t border-gray-700 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2025 Modern Barbershop. Semua hak dilindungi.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
