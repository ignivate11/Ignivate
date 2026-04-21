'use client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function BackBar() {
  const router = useRouter()
  return (
    <div className="w-full bg-[#0d0d0d] border-b border-white/5 px-6 py-2 flex items-center justify-between">
      <button
        onClick={() => router.back()}
        className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-orange-400 transition-colors"
      >
        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Back
      </button>
      <Link href="/" className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-orange-400 transition-colors">
        Home
        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
      </Link>
    </div>
  )
}
