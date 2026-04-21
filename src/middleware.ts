import { auth } from '@/auth'
import { NextResponse } from 'next/server'

export default auth((req) => {
  const session = req.auth
  const { pathname } = req.nextUrl

  if (!session) {
    return NextResponse.redirect(new URL(`/login?callbackUrl=${pathname}`, req.url))
  }

  const role = (session.user as { role?: string })?.role

  if (role === 'SUSPENDED') {
    return NextResponse.redirect(new URL('/login?error=suspended', req.url))
  }

  if (pathname.startsWith('/admin') && role !== 'ADMIN') {
    return NextResponse.redirect(new URL('/', req.url))
  }

  if (pathname.startsWith('/creator') && role !== 'CREATOR') {
    return NextResponse.redirect(new URL('/', req.url))
  }

  if (
    (pathname.startsWith('/checkout') || pathname.startsWith('/orders')) &&
    role !== 'CUSTOMER'
  ) {
    return NextResponse.redirect(new URL('/', req.url))
  }

  return NextResponse.next()
})

export const config = {
  matcher: ['/admin/:path*', '/creator/:path*', '/checkout/:path*', '/orders/:path*'],
}
