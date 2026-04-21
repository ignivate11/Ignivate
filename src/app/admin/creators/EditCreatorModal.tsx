'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'

interface Props {
  creator: { id: string; name: string; email: string; status: string }
}

export default function EditCreatorModal({ creator }: Props) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    name: creator.name,
    email: creator.email,
    password: '',
    status: creator.status,
  })

  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }))

  const handleSave = async () => {
    if (!form.name.trim() || !form.email.trim()) {
      toast.error('Name and email are required')
      return
    }
    setLoading(true)
    const payload: Record<string, string> = { name: form.name, email: form.email, status: form.status }
    if (form.password.length > 0) {
      if (form.password.length < 8) { toast.error('Password must be at least 8 characters'); setLoading(false); return }
      payload.password = form.password
    }
    const res = await fetch(`/api/admin/creators/${creator.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
    setLoading(false)
    if (res.ok) {
      toast.success('Creator updated')
      setOpen(false)
      router.refresh()
    } else {
      const data = await res.json()
      toast.error(data.error || 'Update failed')
    }
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="px-3 py-1.5 rounded-lg text-xs font-mono font-semibold bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 border border-blue-500/20 transition-colors"
      >
        Edit
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4" onClick={() => setOpen(false)}>
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
          <div
            className="relative bg-[#111] border border-white/10 rounded-2xl p-6 w-full max-w-md shadow-2xl"
            onClick={e => e.stopPropagation()}
          >
            <h2 className="text-lg font-bold text-white mb-5">Edit Creator</h2>

            <div className="space-y-4">
              <div>
                <label className="text-xs font-medium text-gray-400 block mb-1.5">Name</label>
                <input
                  value={form.name}
                  onChange={e => set('name', e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm outline-none focus:border-orange-500 transition-colors"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-400 block mb-1.5">Email</label>
                <input
                  type="email"
                  value={form.email}
                  onChange={e => set('email', e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm outline-none focus:border-orange-500 transition-colors"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-400 block mb-1.5">New Password <span className="text-gray-600">(leave blank to keep current)</span></label>
                <input
                  type="password"
                  value={form.password}
                  onChange={e => set('password', e.target.value)}
                  placeholder="Min 8 characters"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm outline-none focus:border-orange-500 transition-colors"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-400 block mb-1.5">Status</label>
                <select
                  value={form.status}
                  onChange={e => set('status', e.target.value)}
                  className="w-full bg-[#0a0a0a] border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm outline-none focus:border-orange-500 transition-colors"
                >
                  <option value="ACTIVE">Active</option>
                  <option value="SUSPENDED">Suspended</option>
                </select>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={handleSave}
                disabled={loading}
                className="flex-1 bg-gradient-to-r from-orange-600 to-orange-400 text-white font-semibold py-2.5 rounded-xl text-sm hover:-translate-y-0.5 transition-all disabled:opacity-50"
              >
                {loading ? 'Saving...' : 'Save Changes'}
              </button>
              <button
                onClick={() => setOpen(false)}
                className="px-5 border border-white/15 text-gray-400 hover:text-white rounded-xl text-sm transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
