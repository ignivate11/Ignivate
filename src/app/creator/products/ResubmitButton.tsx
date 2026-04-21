'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'

export default function ResubmitButton({ productId }: { productId: string }) {
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleResubmit = async () => {
    setLoading(true)
    const res = await fetch(`/api/products/${productId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      // Sending minimal PATCH just to trigger status → PENDING
      body: JSON.stringify({ _resubmit: true }),
    })
    setLoading(false)
    if (res.ok) {
      toast.success('Submitted for re-approval!')
      router.refresh()
    } else {
      toast.error('Failed to resubmit')
    }
  }

  return (
    <button
      onClick={handleResubmit}
      disabled={loading}
      className="text-xs border border-orange-500/30 text-orange-400 hover:bg-orange-500/10 px-3 py-1.5 rounded-full transition-all disabled:opacity-50"
    >
      {loading ? '...' : 'Re-submit'}
    </button>
  )
}
