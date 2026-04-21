'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'

export default function DeleteProductButton({ productId }: { productId: string }) {
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleDelete = async () => {
    if (!confirm('Delete this product? This cannot be undone.')) return
    setLoading(true)
    const res = await fetch(`/api/products/${productId}`, { method: 'DELETE' })
    setLoading(false)
    if (res.ok) { toast.success('Product deleted'); router.refresh() }
    else toast.error('Delete failed')
  }

  return (
    <button
      onClick={handleDelete}
      disabled={loading}
      className="text-xs border border-red-500/20 text-red-400 hover:bg-red-500/10 px-3 py-1.5 rounded-full transition-all disabled:opacity-50"
    >
      {loading ? '...' : 'Delete'}
    </button>
  )
}
