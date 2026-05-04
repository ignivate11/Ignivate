'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'

interface Props {
  creatorId: string
  amount: number
  razorpayOrderIds: string[]
}

export default function PayoutActions({ creatorId, amount, razorpayOrderIds }: Props) {
  const [note, setNote] = useState('')
  const [loading, setLoading] = useState(false)
  const [showNote, setShowNote] = useState(false)
  const router = useRouter()

  const handleMarkPaid = async () => {
    if (!confirm(`Mark ₹${amount.toLocaleString('en-IN')} as paid to this creator?`)) return
    setLoading(true)
    const res = await fetch('/api/admin/payouts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ creatorId, amount, razorpayOrderIds, note: note || undefined }),
    })
    setLoading(false)
    if (res.ok) {
      toast.success('Payout recorded!')
      router.refresh()
    } else {
      const d = await res.json()
      toast.error(d.error || 'Failed to record payout')
    }
  }

  return (
    <div className="space-y-2">
      {showNote && (
        <input
          value={note}
          onChange={e => setNote(e.target.value)}
          placeholder="Add note (e.g. Bank transfer ref, UPI ID...)"
          className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm outline-none focus:border-orange-500 transition-colors"
        />
      )}
      <div className="flex gap-2">
        <button
          onClick={handleMarkPaid}
          disabled={loading}
          className="flex-1 bg-gradient-to-r from-green-700 to-green-500 text-white text-sm font-semibold py-2.5 rounded-xl hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:translate-y-0"
        >
          {loading ? 'Saving...' : '✓ Mark as Paid'}
        </button>
        <button
          onClick={() => setShowNote(n => !n)}
          className="px-4 py-2.5 border border-white/10 text-gray-400 hover:text-white text-sm rounded-xl transition-colors"
        >
          {showNote ? 'Hide' : '+ Note'}
        </button>
      </div>
    </div>
  )
}
