'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import toast from 'react-hot-toast'
import Input from '@/components/ui/Input'
import Button from '@/components/ui/Button'

export default function ChangePasswordPage() {
  const router = useRouter()
  const [form, setForm] = useState({ current: '', password: '', confirm: '' })
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (form.password.length < 8) { toast.error('New password must be at least 8 characters'); return }
    if (form.password !== form.confirm) { toast.error("Passwords don't match"); return }
    setLoading(true)
    const res = await fetch('/api/auth/change-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ currentPassword: form.current, newPassword: form.password }),
    })
    setLoading(false)
    if (res.ok) { toast.success('Password changed!'); router.push('/profile') }
    else { const d = await res.json(); toast.error(d.error || 'Failed to change password') }
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center px-4 pt-16">
      <div className="w-full max-w-md">
        <div className="mb-8">
          <p className="text-xs font-mono text-orange-400 uppercase tracking-widest mb-1">Account</p>
          <h1 className="text-2xl font-bold text-white">Change Password</h1>
          <p className="text-sm text-gray-500 mt-1">Update your account password</p>
        </div>
        <div className="bg-[#111] border border-white/8 rounded-2xl p-8 space-y-4">
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input label="Current Password" type="password" placeholder="Your current password"
              value={form.current} onChange={e => setForm(f => ({ ...f, current: e.target.value }))} required />
            <Input label="New Password" type="password" placeholder="Min 8 characters"
              value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} required />
            <Input label="Confirm New Password" type="password" placeholder="Repeat new password"
              value={form.confirm} onChange={e => setForm(f => ({ ...f, confirm: e.target.value }))} required />
            <Button type="submit" loading={loading} className="w-full">Update Password</Button>
          </form>
        </div>
        <div className="text-center mt-6">
          <Link href="/profile" className="text-sm text-gray-500 hover:text-orange-400 transition-colors">← Back to profile</Link>
        </div>
      </div>
    </div>
  )
}
