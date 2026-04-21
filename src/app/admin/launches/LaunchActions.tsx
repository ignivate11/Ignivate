'use client'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import toast from 'react-hot-toast'

export function TogglePublishButton({ id, isPublished }: { id: string; isPublished: boolean }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  async function toggle() {
    setLoading(true)
    const res = await fetch(`/api/admin/launches/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isPublished: !isPublished }),
    })
    setLoading(false)
    if (res.ok) { toast.success(isPublished ? 'Launch unpublished' : 'Launch published'); router.refresh() }
    else toast.error('Failed to update launch')
  }

  return (
    <button onClick={toggle} disabled={loading}
      className={`px-3 py-1.5 rounded-lg text-xs font-mono font-semibold transition-colors disabled:opacity-50 ${isPublished ? 'bg-green-500/10 text-green-400 hover:bg-green-500/20 border border-green-500/20' : 'bg-gray-500/10 text-gray-400 hover:bg-gray-500/20 border border-gray-500/20'}`}>
      {loading ? '...' : isPublished ? 'Published' : 'Draft'}
    </button>
  )
}

export function DeleteLaunchButton({ id }: { id: string }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  async function handleDelete() {
    if (!confirm('Delete this launch? This cannot be undone.')) return
    setLoading(true)
    const res = await fetch(`/api/admin/launches/${id}`, { method: 'DELETE' })
    setLoading(false)
    if (res.ok) { toast.success('Launch deleted'); router.refresh() }
    else toast.error('Failed to delete launch')
  }

  return (
    <button onClick={handleDelete} disabled={loading}
      className="px-3 py-1.5 rounded-lg text-xs font-mono font-semibold bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/20 transition-colors disabled:opacity-50">
      {loading ? '...' : 'Delete'}
    </button>
  )
}
