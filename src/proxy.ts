import { withAuth } from 'next-auth/middleware'

export default withAuth(
  function middleware(req) {
    // Additional middleware logic can be added here if needed
    return
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        // Allow access to login page without token
        if (req.nextUrl.pathname === '/admin/login') {
          return true
        }
        // For other admin routes, require valid token
        return !!token
      }
    },
    pages: {
      signIn: '/admin/login'
    }
  }
)

export const config = {
  matcher: ['/admin/:path*']
}