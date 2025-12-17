'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { signOut } from 'next-auth/react'

interface AdminLayoutProps {
  children: React.ReactNode
}

const navigation = [
  {
    name: 'Dashboard',
    href: '/admin',
    icon: '🏠'
  },
  {
    name: 'Booking',
    href: '/admin/bookings',
    icon: '📅'
  },
  {
    name: 'Barbers',
    href: '/admin/barbers',
    icon: '✂️'
  },
  {
    name: 'Services',
    href: '/admin/services',
    icon: '💼'
  },
  {
    name: 'Payments',
    href: '/admin/payments',
    icon: '💰'
  },
  {
    name: 'QR Settings',
    href: '/admin/qr-settings',
    icon: '📱'
  },
  {
    name: 'Email Settings',
    href: '/admin/email-settings',
    icon: '📧'
  }
]

export default function AdminLayout({ children }: AdminLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const pathname = usePathname()

  const handleLogout = async () => {
    await signOut({ callbackUrl: '/admin/login' })
  }

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 lg:hidden" 
          onClick={() => setSidebarOpen(false)}
        >
          <div className="absolute inset-0 bg-gray-600 opacity-75"></div>
        </div>
      )}

      {/* Sidebar */}
      <div className={`
        fixed inset-y-0 left-0 z-50 w-72 sm:w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out flex flex-col
        lg:translate-x-0 lg:static lg:inset-0
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        {/* Header */}
        <div className="flex items-center justify-center h-16 px-4 bg-blue-600 flex-shrink-0">
          <h1 className="text-xl font-bold text-white">Admin Panel</h1>
        </div>
        
        {/* Scrollable navigation */}
        <div className="flex-1 overflow-hidden flex flex-col">
          <nav className="flex-1 overflow-y-auto py-4">
            <div className="px-3 space-y-1">
              {navigation.map((item) => {
                const isActive = pathname === item.href
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`
                      block w-full px-4 py-4 text-sm font-medium rounded-lg transition-all duration-200 cursor-pointer touch-manipulation
                      ${isActive 
                        ? 'bg-blue-100 text-blue-700 border-l-4 border-blue-700 shadow-sm' 
                        : 'text-gray-700 hover:bg-gray-50 hover:text-blue-600 active:bg-gray-100'
                      }
                    `}
                    onClick={(e) => {
                      e.stopPropagation()
                      setSidebarOpen(false)
                    }}
                  >
                    <div className="flex items-center">
                      <span className="mr-4 text-lg flex-shrink-0">{item.icon}</span>
                      <span className="truncate font-medium">{item.name}</span>
                    </div>
                  </Link>
                )
              })}
            </div>
          </nav>
        </div>

        {/* User info and logout */}
        <div className="flex-shrink-0 bg-white border-t border-gray-200 p-4">
          {/* Admin Info */}
          <div className="flex items-center space-x-3 mb-3">
            <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-white text-sm font-bold">A</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-900 truncate">Admin</p>
              <p className="text-xs text-gray-500 truncate">Administrator</p>
            </div>
          </div>
          
          {/* Logout button */}
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center px-4 py-2 text-sm font-semibold text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors"
          >
            <span className="mr-2">🚪</span>
            Logout
          </button>
        </div>
      </div>

      {/* Main content area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top header with hamburger menu */}
        <header className="bg-white shadow-sm border-b border-gray-200 lg:hidden">
          <div className="flex items-center justify-between px-4 py-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="text-gray-600 hover:text-gray-900 focus:outline-none focus:text-gray-900"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <h1 className="text-lg font-semibold text-gray-800">Admin Panel</h1>
            <button
              onClick={handleLogout}
              className="flex items-center px-3 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors"
            >
              <span className="mr-1">🚪</span>
              Logout
            </button>
          </div>
        </header>

        {/* Main content */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6">
          {children}
        </main>
      </div>
    </div>
  )
}