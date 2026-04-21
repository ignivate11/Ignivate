'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'

interface NavItem {
  href: string
  label: string
  icon: React.ReactNode
}

interface SidebarProps {
  navItems: NavItem[]
  title: string
}

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
        <Link href="/" className="flex items-center gap-2 text-xs text-gray-500 hover:text-gray-300 transition-colors">
          ← Back to site
        </Link>
      </div>
    </aside>
  )
}
