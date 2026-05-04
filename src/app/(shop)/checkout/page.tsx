'use client'
import { useState } from 'react'
import { useCart } from '@/hooks/useCart'
import { useSession } from 'next-auth/react'
import { formatCurrency } from '@/lib/utils'
import Image from 'next/image'
import Link from 'next/link'
import RazorpayButton from '@/components/checkout/RazorpayButton'

/* ── Quantity stepper ───────────────────────────────────────────────────── */
function QuantityStepper({
  productId,
  quantity,
  onUpdate,
  loading,
}: {
  productId: string
  quantity: number
  onUpdate: (productId: string, qty: number) => void
  loading: boolean
}) {
  return (
    <div className="flex items-center gap-1">
      <button
        onClick={() => onUpdate(productId, quantity - 1)}
        disabled={loading}
        className="w-7 h-7 rounded-lg bg-white/8 hover:bg-orange-500/20 border border-white/10 hover:border-orange-500/30 text-white font-bold text-base flex items-center justify-center transition-all disabled:opacity-40 disabled:cursor-not-allowed"
        aria-label="Decrease quantity"
      >
        −
      </button>
      <span className="w-8 text-center text-sm font-semibold text-white tabular-nums">
        {loading ? '…' : quantity}
      </span>
      <button
        onClick={() => onUpdate(productId, quantity + 1)}
        disabled={loading}
        className="w-7 h-7 rounded-lg bg-white/8 hover:bg-orange-500/20 border border-white/10 hover:border-orange-500/30 text-white font-bold text-base flex items-center justify-center transition-all disabled:opacity-40 disabled:cursor-not-allowed"
        aria-label="Increase quantity"
      >
        +
      </button>
    </div>
  )
}

/* ── Checkout page ──────────────────────────────────────────────────────── */
export default function CheckoutPage() {
  const { data: session } = useSession()
  const items = useCart(s => s.items)
  const total = useCart(s => s.total)()
  const removeItem = useCart(s => s.removeItem)
  const updateQuantity = useCart(s => s.updateQuantity)

  // Per-item loading state for optimistic UI
  const [loadingIds, setLoadingIds] = useState<Set<string>>(new Set())

  const setLoading = (productId: string, val: boolean) =>
    setLoadingIds(prev => {
      const next = new Set(prev)
      val ? next.add(productId) : next.delete(productId)
      return next
    })

  const handleQuantityUpdate = async (productId: string, newQty: number) => {
    // Optimistic update — instant UI response
    updateQuantity(productId, newQty)

    setLoading(productId, true)
    try {
      await fetch('/api/cart', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId, quantity: newQty }),
      })
    } catch {
      // Silent — local state already updated, sync next visit
    } finally {
      setLoading(productId, false)
    }
  }

  const platformFee = total * 0.1
  const itemCount = items.reduce((s, i) => s + i.quantity, 0)

  if (items.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-6 py-24 text-center">
        <p className="text-5xl mb-4">🛒</p>
        <h2 className="text-2xl font-bold text-white mb-2">Your cart is empty</h2>
        <p className="text-gray-500 mb-6">Add some products to get started</p>
        <Link
          href="/products"
          className="bg-gradient-to-r from-orange-600 to-orange-400 text-white px-6 py-3 rounded-full font-semibold hover:-translate-y-0.5 transition-all shadow-lg shadow-orange-500/20"
        >
          Browse Products
        </Link>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto px-6 py-12">
      <div className="mb-8">
        <p className="text-xs font-mono text-orange-400 uppercase tracking-widest mb-1">Checkout</p>
        <h1 className="text-3xl font-bold text-white">Your Cart</h1>
        <p className="text-gray-500 text-sm mt-1">{itemCount} item{itemCount !== 1 ? 's' : ''}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">

        {/* ── Cart items ─────────────────────────────────────────────────── */}
        <div className="lg:col-span-3 space-y-3">
          {items.map(item => {
            const isLoading = loadingIds.has(item.productId)
            const itemTotal = item.price * item.quantity

            return (
              <div
                key={item.productId}
                className={`bg-[#111] border rounded-2xl p-4 transition-all ${
                  isLoading ? 'border-orange-500/20 opacity-80' : 'border-white/8'
                }`}
              >
                <div className="flex gap-4 items-start">
                  {/* Image */}
                  {item.image && (
                    <div className="relative w-16 h-16 rounded-xl overflow-hidden shrink-0 bg-white/5">
                      <Image src={item.image} alt={item.title} fill className="object-cover" />
                    </div>
                  )}

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-white text-sm leading-snug mb-0.5 truncate">
                      {item.title}
                    </h3>
                    <p className="text-xs text-gray-500 mb-3">by {item.creatorName}</p>

                    {/* Quantity controls */}
                    <div className="flex items-center gap-3 flex-wrap">
                      <QuantityStepper
                        productId={item.productId}
                        quantity={item.quantity}
                        onUpdate={handleQuantityUpdate}
                        loading={isLoading}
                      />
                      <span className="text-xs text-gray-500">
                        {formatCurrency(item.price)} × {item.quantity}
                      </span>
                    </div>
                  </div>

                  {/* Price + Remove */}
                  <div className="text-right shrink-0">
                    <p className="font-bold text-orange-400 text-base">
                      {formatCurrency(itemTotal)}
                    </p>
                    <button
                      onClick={() => handleQuantityUpdate(item.productId, 0)}
                      className="text-xs text-red-400 hover:text-red-300 mt-2 transition-colors"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* ── Order summary ──────────────────────────────────────────────── */}
        <div className="lg:col-span-2">
          <div className="bg-[#111] border border-white/8 rounded-2xl p-6 sticky top-20">
            <h3 className="font-semibold text-white mb-5">Order Summary</h3>

            {/* Per-item breakdown */}
            <div className="space-y-2 mb-4">
              {items.map(item => (
                <div key={item.productId} className="flex justify-between text-xs text-gray-500">
                  <span className="truncate max-w-[150px]">
                    {item.title} × {item.quantity}
                  </span>
                  <span className="ml-2 font-medium text-gray-400">
                    {formatCurrency(item.price * item.quantity)}
                  </span>
                </div>
              ))}
            </div>

            {/* Totals */}
            <div className="border-t border-white/8 pt-4 space-y-2 text-sm text-gray-400 mb-4">
              <div className="flex justify-between">
                <span>Subtotal ({itemCount} item{itemCount !== 1 ? 's' : ''})</span>
                <span>{formatCurrency(total)}</span>
              </div>
              <div className="flex justify-between">
                <span>Platform fee (10%)</span>
                <span className="text-red-400/70">+{formatCurrency(platformFee)}</span>
              </div>
            </div>

            <div className="border-t border-white/8 pt-4 mb-6">
              <div className="flex justify-between font-bold text-white text-base">
                <span>Total</span>
                <span className="text-orange-400">{formatCurrency(total)}</span>
              </div>
              <p className="text-xs text-gray-600 mt-1">Platform fee included in total</p>
            </div>

            {/* Payment button */}
            {items.length === 1 ? (
              <RazorpayButton
                productId={items[0].productId}
                quantity={items[0].quantity}
                amount={items[0].price * items[0].quantity}
                productTitle={items[0].title}
                userName={session?.user?.name || ''}
                userEmail={session?.user?.email || ''}
              />
            ) : (
              <div className="space-y-3">
                <p className="text-center text-xs text-gray-500 bg-white/5 rounded-xl p-3">
                  Checkout one product at a time
                </p>
                {items.map(item => (
                  <RazorpayButton
                    key={item.productId}
                    productId={item.productId}
                    quantity={item.quantity}
                    amount={item.price * item.quantity}
                    productTitle={item.title}
                    userName={session?.user?.name || ''}
                    userEmail={session?.user?.email || ''}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
