'use client'
import { Suspense, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import toast from 'react-hot-toast'
import Input from '@/components/ui/Input'
import Button from '@/components/ui/Button'

function ResetPasswordForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const token = searchParams.get('token')
  const [form, setForm] = useState({ password: '', confirmPassword: '' })
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)

  if (!token) {
    return (
      <div className="text-center space-y-3">
        <p className="text-red-400">Invalid or missing reset token.</p>
        <Link href="/forgot-password" className="text-orange-400 hover:text-orange-300 text-sm">Request a new link →</Link>
      </div>
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (form.password.length < 8) { toast.error('Password must be at least 8 characters'); return }
    if (form.password !== form.confirmPassword) { toast.error("Passwords don't match"); return }

    setLoading(true)
    const res = await fetch('/api/auth/reset-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token, password: form.password }),
    })
    setLoading(false)

    if (res.ok) {
      setDone(true)
      setTimeout(() => router.push('/login'), 2000)
    } else {
      const data = await res.json()
      toast.error(data.error || 'Reset failed. Link may have expired.')
    }
  }

  return done ? (
    <div className="text-center space-y-3">
      <div className="w-14 h-14 rounded-full bg-green-500/10 border border-green-500/20 flex items-center justify-center text-2xl mx-auto">✅</div>
      <p className="text-white font-semibold">Password updated!</p>
      <p className="text-gray-500 text-sm">Redirecting to login...</p>
    </div>
  ) : (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        label="New Password"
        type="password"
        placeholder="Min 8 characters"
        value={form.password}
        onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
        required
      />
      <Input
        label="Confirm Password"
        type="password"
        placeholder="Repeat your password"
        value={form.confirmPassword}
        onChange={e => setForm(f => ({ ...f, confirmPassword: e.target.value }))}
        required
      />
      <Button type="submit" loading={loading} className="w-full">Set New Password</Button>
    </form>
  )
}

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2.5 mb-6">
            <Image src="/ignivate-logo.png" alt="Ignivate" width={36} height={36} style={{ objectFit: 'contain' }} />
            <span className="font-bold text-xl text-white">Ignivate</span>
          </Link>
          <h1 className="text-2xl font-bold text-white">Set New Password</h1>
          <p className="text-gray-500 text-sm mt-1">Choose a strong password for your account</p>
        </div>
        <div className="bg-[#111] border border-white/8 rounded-2xl p-8">
          <Suspense fallback={<div className="text-center text-gray-500">Loading...</div>}>
            <ResetPasswordForm />
          </Suspense>
        </div>
        <p className="text-center text-sm text-gray-500 mt-6">
          <Link href="/login" className="text-orange-400 hover:text-orange-300">Back to login</Link>
        </p>
      </div>
    </div>
  )
}
