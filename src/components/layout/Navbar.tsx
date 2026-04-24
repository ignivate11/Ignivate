'use client'
import Link from 'next/link'
import { useSession, signOut } from 'next-auth/react'
import { useCart } from '@/hooks/useCart'
import Image from 'next/image'
import { useState, useRef, useEffect } from 'react'

function ProfileDropdown({ session }: { session: { user: { name?: string | null; role: string } } }) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const count = useCart(s => s.count)()
  const initials = session.user.name
    ? session.user.name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)
    : '?'

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const isCreator = session.user.role === 'CREATOR'
  const isCustomer = session.user.role === 'CUSTOMER'
  const isAdmin = session.user.role === 'ADMIN'

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(o => !o)}
        className="w-9 h-9 rounded-full bg-gradient-to-br from-orange-500 to-amber-400 flex items-center justify-center text-white font-bold text-sm hover:scale-105 transition-transform focus:outline-none focus:ring-2 focus:ring-orange-500/50"
      >
        {initials}
      </button>

      {open && (
        <div className="absolute right-0 top-11 w-52 bg-[#111] border border-white/10 rounded-2xl shadow-2xl shadow-black/50 overflow-hidden z-50">
          {/* User info header */}
          <div className="px-4 py-3 border-b border-white/8">
            <p className="text-sm font-semibold text-white truncate">{session.user.name}</p>
            <p className="text-xs text-gray-500 capitalize">{session.user.role.toLowerCase()}</p>
          </div>

          <div className="py-1.5">
            {isAdmin && (
              <DropdownLink href="/admin" onClick={() => setOpen(false)}>Dashboard</DropdownLink>
            )}
            {isCreator && (
              <>
                <DropdownLink href="/creator" onClick={() => setOpen(false)}>Dashboard</DropdownLink>
                <DropdownLink href="/creator/profile" onClick={() => setOpen(false)}>Profile Info</DropdownLink>
                <DropdownLink href="/creator/change-password" onClick={() => setOpen(false)}>Change Password</DropdownLink>
              </>
            )}
            {isCustomer && (
              <>
                <DropdownLink href="/orders" onClick={() => setOpen(false)}>
                  My Orders
                </DropdownLink>
                <DropdownLink href="/profile" onClick={() => setOpen(false)}>My Profile</DropdownLink>
                <DropdownLink href="/checkout" onClick={() => setOpen(false)}>
                  My Cart {count > 0 && <span className="ml-auto bg-orange-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center font-bold">{count}</span>}
                </DropdownLink>
                <DropdownLink href="/change-password" onClick={() => setOpen(false)}>Change Password</DropdownLink>
              </>
            )}
          </div>

          <div className="border-t border-white/8 py-1.5">
            <button
              onClick={() => { setOpen(false); signOut({ callbackUrl: '/' }) }}
              className="w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-red-500/10 transition-colors flex items-center gap-2"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              Sign Out
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

function DropdownLink({ href, onClick, children }: { href: string; onClick: () => void; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className="flex items-center gap-2 px-4 py-2 text-sm text-gray-300 hover:text-white hover:bg-white/5 transition-colors"
    >
      {children}
    </Link>
  )
}

export default function Navbar() {
  const { data: session } = useSession()

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
        </div>

        <div className="flex items-center gap-3">
          {/* Cart icon for customers — always visible */}
          {session?.user.role === 'CUSTOMER' && (
            <CartIcon />
          )}

          {session ? (
            <ProfileDropdown session={session} />
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

function CartIcon() {
  const count = useCart(s => s.count)()
  return (
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
  )
}
