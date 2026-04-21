'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'

export default function ApprovalActions({ productId }: { productId: string }) {
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const update = async (status: 'APPROVED' | 'REJECTED') => {
    setLoading(true)
    const res = await fetch(`/api/admin/products/${productId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    })
    setLoading(false)
    if (res.ok) { toast.success(`Product ${status.toLowerCase()}!`); router.refresh() }
    else toast.error('Action failed')
  }

  return (
    <div className="flex gap-2">
      <button disabled={loading} onClick={() => update('APPROVED')}
        className="px-3 py-1.5 text-xs font-semibold rounded-full bg-green-500/10 text-green-400 border border-green-500/20 hover:bg-green-500/20 transition-all disabled:opacity-50">
        Approve
      </button>
      <button disabled={loading} onClick={() => update('REJECTED')}
        className="px-3 py-1.5 text-xs font-semibold rounded-full bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20 transition-all disabled:opacity-50">
        Reject
      </button>
    </div>
  )
}
