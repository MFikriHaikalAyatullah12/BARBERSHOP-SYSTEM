'use client'

import Link from 'next/link'
import { useState } from 'react'

export default function HomePage() {
  const [showMobileMenu, setShowMobileMenu] = useState(false)

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Navigation */}
      <nav className="bg-white shadow-sm sticky top-0 z-50 border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link 
              href="/" 
              className="text-xl sm:text-2xl font-bold text-blue-600 hover:text-blue-700 transition-colors flex-shrink-0"
            >
              Modern Barbershop
            </Link>
            
            {/* Mobile Menu Button */}
            <button
              onClick={() => setShowMobileMenu(!showMobileMenu)}
              className="md:hidden inline-flex items-center justify-center p-2 rounded-md text-gray-700 hover:text-blue-600 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500 transition-colors touch-manipulation"
              aria-expanded={showMobileMenu}
              aria-label="Toggle menu"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d={showMobileMenu ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} 
                />
              </svg>
            </button>
            
            {/* Desktop Menu */}
            <div className="hidden md:flex md:items-center md:space-x-6">
              <Link 
                href="/booking" 
                className="text-gray-700 hover:text-blue-600 px-4 py-2 rounded-lg text-sm font-medium transition-colors hover:bg-blue-50"
              >
                Booking
              </Link>
              <Link 
                href="/admin" 
                className="text-gray-700 hover:text-blue-600 px-4 py-2 rounded-lg text-sm font-medium transition-colors hover:bg-blue-50"
              >
                Admin
              </Link>
            </div>
          </div>
          
          {/* Mobile Menu */}
          {showMobileMenu && (
            <div className="md:hidden border-t border-gray-200 bg-white">
              <div className="px-2 pt-2 pb-3 space-y-1">
                <Link 
                  href="/booking" 
                  className="text-gray-700 hover:text-blue-600 hover:bg-blue-50 block px-4 py-3 rounded-lg text-base font-medium transition-colors touch-manipulation"
                  onClick={() => setShowMobileMenu(false)}
                >
                  📅 Booking
                </Link>
                <Link 
                  href="/admin" 
                  className="text-gray-700 hover:text-blue-600 hover:bg-blue-50 block px-4 py-3 rounded-lg text-base font-medium transition-colors touch-manipulation"
                  onClick={() => setShowMobileMenu(false)}
                >
                  ⚙️ Admin
                </Link>
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <main className="flex-1 flex items-center justify-center">
        <section className="relative bg-gradient-to-br from-blue-600 via-blue-700 to-blue-800 text-white w-full min-h-[calc(100vh-4rem)] flex items-center overflow-hidden">
          {/* Background Overlay */}
          <div className="absolute inset-0 bg-black/20"></div>
          <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent"></div>
          
          <div className="relative w-full px-4 sm:px-6 lg:px-8 py-8 sm:py-12 lg:py-16">
            <div className="max-w-4xl mx-auto text-center">
              <div className="space-y-6 sm:space-y-8 lg:space-y-12">
                {/* Main Heading */}
                <div className="space-y-4">
                  <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-extrabold tracking-tight leading-tight">
                    <span className="block">Modern</span>
                    <span className="block text-blue-200 mt-2">Barbershop</span>
                  </h1>
                </div>
                
                {/* Subtitle */}
                <p className="max-w-3xl mx-auto text-lg sm:text-xl md:text-2xl lg:text-3xl text-blue-100 font-light leading-relaxed px-4">
                  Tempat terbaik untuk mendapatkan gaya rambut yang sempurna
                </p>
                
                {/* CTA Button */}
                <div className="pt-4 sm:pt-8">
                  <Link
                    href="/booking"
                    className="inline-flex items-center justify-center w-full sm:w-auto px-8 sm:px-12 py-4 sm:py-6 text-lg sm:text-xl font-bold bg-white text-blue-600 rounded-xl sm:rounded-2xl hover:bg-blue-50 active:bg-blue-100 transition-all duration-200 transform hover:scale-105 active:scale-95 focus:outline-none focus:ring-4 focus:ring-white/50 shadow-2xl hover:shadow-white/25 touch-manipulation"
                  >
                    <span>Booking Sekarang</span>
                    <svg className="ml-3 w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-white border-t border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
            <div className="space-y-4 text-center md:text-left">
              <h3 className="text-xl sm:text-2xl font-bold text-white">Modern Barbershop</h3>
              <p className="text-gray-300 text-base sm:text-lg leading-relaxed max-w-md mx-auto md:mx-0">
                Tempat terbaik untuk mendapatkan gaya rambut yang sempurna dengan pelayanan profesional.
              </p>
            </div>
            
            <div className="space-y-4 text-center md:text-left">
              <h4 className="text-lg sm:text-xl font-semibold text-white">Jam Operasional</h4>
              <div className="space-y-3 text-gray-300">
                <div className="flex justify-between items-center py-2 border-b border-gray-700 max-w-md mx-auto md:mx-0">
                  <span className="font-medium text-sm sm:text-base">Senin - Sabtu</span>
                  <span className="text-sm sm:text-base">09:00 - 19:00</span>
                </div>
                <div className="flex justify-between items-center py-2 max-w-md mx-auto md:mx-0">
                  <span className="font-medium text-sm sm:text-base">Minggu</span>
                  <span className="text-red-400 text-sm sm:text-base">Tutup</span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="mt-8 sm:mt-12 pt-6 sm:pt-8 border-t border-gray-700 text-center">
            <p className="text-gray-400 text-sm sm:text-base">
              &copy; 2025 Modern Barbershop. Semua hak dilindungi.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
