'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import { formatCurrency, formatDate } from '@/lib/utils'

interface Order {
  id: string; totalAmount: number; paymentStatus: string; createdAt: string
  product: { title: string }
}

export function CustomerActions({ id, name }: { id: string; name: string }) {
  const router = useRouter()
  const [deleting, setDeleting] = useState(false)
  const [orders, setOrders] = useState<Order[] | null>(null)
  const [loadingOrders, setLoadingOrders] = useState(false)
  const [showOrders, setShowOrders] = useState(false)

  async function handleDelete() {
    if (!confirm(`Delete customer "${name}"? This cannot be undone.`)) return
    setDeleting(true)
    const res = await fetch(`/api/admin/users/${id}`, { method: 'DELETE' })
    setDeleting(false)
    if (res.ok) { toast.success('Customer deleted'); router.refresh() }
    else { const data = await res.json(); toast.error(data.error ?? 'Failed to delete customer') }
  }

  async function toggleOrders() {
    if (showOrders) { setShowOrders(false); return }
    if (!orders) {
      setLoadingOrders(true)
      const res = await fetch(`/api/admin/users/${id}`)
      setLoadingOrders(false)
      if (res.ok) setOrders(await res.json())
      else toast.error('Failed to load orders')
    }
    setShowOrders(true)
  }

  return (
    <div>
      <div className="flex items-center gap-2">
        <button onClick={toggleOrders} disabled={loadingOrders}
          className="px-3 py-1.5 rounded-lg text-xs font-mono font-semibold bg-white/5 text-gray-300 hover:bg-white/10 border border-white/10 transition-colors disabled:opacity-50">
          {loadingOrders ? '...' : showOrders ? 'Hide Orders' : 'View Orders'}
        </button>
        <button onClick={handleDelete} disabled={deleting}
          className="px-3 py-1.5 rounded-lg text-xs font-mono font-semibold bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/20 transition-colors disabled:opacity-50">
          {deleting ? '...' : 'Delete'}
        </button>
      </div>
      {showOrders && orders !== null && (
        <div className="mt-4 border-t border-white/8 pt-4">
          {orders.length === 0 ? <p className="text-xs text-gray-600">No orders found</p> : (
            <div className="space-y-2">
              {orders.map(order => (
                <div key={order.id} className="flex items-center justify-between bg-white/3 rounded-lg px-3 py-2">
                  <div>
                    <p className="text-xs text-white font-medium">{order.product.title}</p>
                    <p className="text-xs text-gray-500">{formatDate(new Date(order.createdAt))}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-white">{formatCurrency(order.totalAmount)}</p>
                    <span className={`text-xs font-mono ${order.paymentStatus === 'PAID' ? 'text-green-400' : 'text-gray-500'}`}>{order.paymentStatus}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
