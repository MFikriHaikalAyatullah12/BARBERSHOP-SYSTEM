'use client'

import { useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter, usePathname } from 'next/navigation'
import AdminLayout from '@/components/admin/AdminLayout'

interface AdminLayoutWrapperProps {
  children: React.ReactNode
}

export default function AdminLayoutWrapper({ children }: AdminLayoutWrapperProps) {
  const { data: session, status } = useSession()
  const router = useRouter()
  const pathname = usePathname()

  // Don't apply layout for login page
  const isLoginPage = pathname === '/admin/login'

  useEffect(() => {
    if (status === 'loading') return
    
    // If not login page and no session, redirect to login
    if (!isLoginPage && status === 'unauthenticated') {
      router.push('/admin/login')
      return
    }
    
    // If not admin and not login page, redirect to login
    if (!isLoginPage && session && (!session.user || (session.user as any).role !== 'admin')) {
      router.push('/admin/login')
      return
    }
  }, [session, status, router, isLoginPage])

  // Show loading spinner while checking auth
  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  // Render login page without layout
  if (isLoginPage) {
    return children
  }

  // Render admin pages with layout
  return <AdminLayout>{children}</AdminLayout>
}