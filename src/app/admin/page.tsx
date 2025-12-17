'use client'

import { useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'

export default function AdminRoot() {
  const session = useSession()
  const router = useRouter()

  useEffect(() => {
    if (session?.status === 'loading') return
    
    if (session?.status === 'authenticated') {
      router.push('/admin/dashboard')
    } else {
      router.push('/admin/login')
    }
  }, [session?.status, router])

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Redirecting...</p>
      </div>
    </div>
  )
}