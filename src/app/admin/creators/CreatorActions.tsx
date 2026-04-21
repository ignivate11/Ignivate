'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'

export function CreatorActions({ id, name, status }: { id: string; name: string; status: string }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const isSuspended = status === 'SUSPENDED'

  async function toggleBan() {
    setLoading(true)
    const res = await fetch('/api/admin/creators', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, status: isSuspended ? 'ACTIVE' : 'SUSPENDED' }),
    })
    setLoading(false)
    if (res.ok) { toast.success(isSuspended ? `${name} unbanned` : `${name} banned`); router.refresh() }
    else toast.error('Failed to update status')
  }

  async function handleDelete() {
    if (!confirm(`Delete creator "${name}"? All their products and data will be removed. This cannot be undone.`)) return
    setLoading(true)
    const res = await fetch(`/api/admin/users/${id}`, { method: 'DELETE' })
    setLoading(false)
    if (res.ok) { toast.success('Creator deleted'); router.refresh() }
    else { const data = await res.json(); toast.error(data.error ?? 'Failed to delete creator') }
  }

  return (
    <div className="flex items-center gap-2">
      <button onClick={toggleBan} disabled={loading}
        className={`px-3 py-1.5 rounded-lg text-xs font-mono font-semibold transition-colors disabled:opacity-50 ${isSuspended ? 'bg-green-500/10 text-green-400 hover:bg-green-500/20 border border-green-500/20' : 'bg-yellow-500/10 text-yellow-400 hover:bg-yellow-500/20 border border-yellow-500/20'}`}>
        {loading ? '...' : isSuspended ? 'Unban' : 'Ban'}
      </button>
      <button onClick={handleDelete} disabled={loading}
        className="px-3 py-1.5 rounded-lg text-xs font-mono font-semibold bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/20 transition-colors disabled:opacity-50">
        Delete
      </button>
    </div>
  )
}
