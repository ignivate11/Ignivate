'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import Input from '@/components/ui/Input'
import Button from '@/components/ui/Button'

export default function CreateCreatorForm() {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({ name: '', email: '', password: '' })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    const res = await fetch('/api/admin/creators', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })
    setLoading(false)
    if (res.ok) {
      const data = await res.json()
      toast.success(`Creator created! Share credentials:\nEmail: ${data.email}\nPassword: ${data.password}`, { duration: 10000 })
      setOpen(false)
      setForm({ name: '', email: '', password: '' })
      router.refresh()
    } else {
      const data = await res.json()
      toast.error(data.error || 'Failed to create creator')
    }
  }

  return (
    <>
      <Button onClick={() => setOpen(true)}>+ Add Creator</Button>
      {open && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#111] border border-white/10 rounded-2xl p-8 w-full max-w-md">
            <h2 className="text-xl font-bold text-white mb-6">Create Creator Account</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input label="Full Name" placeholder="John Doe" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required />
              <Input label="Email" type="email" placeholder="creator@example.com" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} required />
              <Input label="Password" type="text" placeholder="Min 8 characters" value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} required />
              <p className="text-xs text-gray-500">The password will be shown once — share it securely with the creator.</p>
              <div className="flex gap-3 pt-2">
                <Button type="submit" loading={loading}>Create Creator</Button>
                <Button type="button" variant="secondary" onClick={() => setOpen(false)}>Cancel</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}
