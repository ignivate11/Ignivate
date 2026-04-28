'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'

interface NavItem { href: string; label: string; icon: React.ReactNode }
interface SidebarProps { navItems: NavItem[]; title: string }

export default function Sidebar({ navItems, title }: SidebarProps) {
  const pathname = usePathname()
  return (
    <aside className="w-64 shrink-0 bg-[#0d0d0d] border-r border-white/8 min-h-screen flex flex-col">
      <div className="p-6 border-b border-white/8">
        <p className="text-xs font-mono text-orange-400 uppercase tracking-widest mb-1">Panel</p>
        <h2 className="font-bold text-white">{title}</h2>
      </div>
      <nav className="flex-1 p-4 space-y-1">
        {navItems.map(item => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all',
              pathname === item.href
                ? 'bg-orange-500/10 text-orange-400 border border-orange-500/20'
                : 'text-gray-400 hover:text-white hover:bg-white/5'
            )}
          >
            {item.icon}
            {item.label}
          </Link>
        ))}
      </nav>
      <div className="p-4 border-t border-white/8">
        <Link
          href="/"
          className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm text-gray-400 hover:text-white hover:bg-white/5 transition-all"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
          </svg>
          Home
        </Link>
      </div>
    </aside>
  )
}
