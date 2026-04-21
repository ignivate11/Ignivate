'use client'
import Link from 'next/link'
import { useSession, signOut } from 'next-auth/react'
import { useCart } from '@/hooks/useCart'
import Image from 'next/image'

export default function Navbar() {
  const { data: session } = useSession()
  const count = useCart(s => s.count)()

  const getDashboardLink = () => {
    if (!session) return null
    if (session.user.role === 'ADMIN') return { href: '/admin', label: 'Dashboard' }
    if (session.user.role === 'CREATOR') return { href: '/creator', label: 'Dashboard' }
    return null
  }

  const dashLink = getDashboardLink()

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-xl border-b border-white/8">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5">
          <Image src="/ignivate-logo.png" alt="Ignivate" width={32} height={32} style={{ objectFit: 'contain' }} />
          <span className="font-bold text-white text-lg">Ignivate</span>
        </Link>

        <div className="hidden md:flex items-center gap-8">
          <Link href="/products" className="text-sm text-gray-400 hover:text-white transition-colors">Products</Link>
          <Link href="/#contact" className="text-sm text-gray-400 hover:text-white transition-colors">Contact Us</Link>
          {dashLink && (
            <Link href={dashLink.href} className="text-sm text-gray-400 hover:text-white transition-colors">
              {dashLink.label}
            </Link>
          )}
        </div>

        <div className="flex items-center gap-3">
          {session?.user.role === 'CUSTOMER' && (
            <Link href="/checkout" className="relative p-2 text-gray-400 hover:text-white transition-colors">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-10H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              {count > 0 && (
                <span className="absolute -top-1 -right-1 bg-orange-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center font-bold">
                  {count}
                </span>
              )}
            </Link>
          )}

          {session ? (
            <div className="flex items-center gap-3">
              <span className="text-sm text-gray-400 hidden md:block">{session.user.name}</span>
              <button
                onClick={() => signOut({ callbackUrl: '/' })}
                className="text-sm border border-white/15 text-gray-300 hover:border-orange-400 hover:text-orange-300 px-4 py-2 rounded-full transition-all"
              >
                Sign out
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link href="/login" className="text-sm text-gray-400 hover:text-white px-4 py-2 transition-colors">Log in</Link>
              <Link href="/signup" className="text-sm bg-gradient-to-r from-orange-600 to-orange-400 text-white px-5 py-2 rounded-full font-semibold hover:-translate-y-0.5 transition-all shadow-lg shadow-orange-500/25">
                Sign up
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  )
}
