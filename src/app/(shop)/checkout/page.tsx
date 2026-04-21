'use client'
import { useCart } from '@/hooks/useCart'
import { useSession } from 'next-auth/react'
import { formatCurrency } from '@/lib/utils'
import Image from 'next/image'
import Link from 'next/link'
import RazorpayButton from '@/components/checkout/RazorpayButton'

export default function CheckoutPage() {
  const { data: session } = useSession()
  const items = useCart(s => s.items)
  const total = useCart(s => s.total)()
  const removeItem = useCart(s => s.removeItem)

  if (items.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-6 py-24 text-center">
        <p className="text-5xl mb-4">🛒</p>
        <h2 className="text-2xl font-bold text-white mb-2">Your cart is empty</h2>
        <p className="text-gray-500 mb-6">Add some products to get started</p>
        <Link href="/products" className="bg-gradient-to-r from-orange-600 to-orange-400 text-white px-6 py-3 rounded-full font-semibold">
          Browse Products
        </Link>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto px-6 py-12">
      <h1 className="text-3xl font-bold text-white mb-8">Checkout</h1>
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        <div className="lg:col-span-3 space-y-4">
          {items.map(item => (
            <div key={item.productId} className="bg-[#111] border border-white/8 rounded-2xl p-4 flex gap-4 items-center">
              {item.image && (
                <div className="relative w-16 h-16 rounded-xl overflow-hidden shrink-0">
                  <Image src={item.image} alt={item.title} fill className="object-cover" />
                </div>
              )}
              <div className="flex-1">
                <h3 className="font-semibold text-white text-sm">{item.title}</h3>
                <p className="text-xs text-gray-500">by {item.creatorName}</p>
              </div>
              <div className="text-right">
                <p className="font-bold text-orange-400">{formatCurrency(item.price * item.quantity)}</p>
                <button onClick={() => removeItem(item.productId)} className="text-xs text-red-400 hover:text-red-300 mt-1">Remove</button>
              </div>
            </div>
          ))}
        </div>

        <div className="lg:col-span-2">
          <div className="bg-[#111] border border-white/8 rounded-2xl p-6 sticky top-20">
            <h3 className="font-semibold text-white mb-4">Order Summary</h3>
            <div className="space-y-2 text-sm text-gray-400 mb-4">
              <div className="flex justify-between">
                <span>Subtotal ({items.length} item{items.length > 1 ? 's' : ''})</span>
                <span>{formatCurrency(total)}</span>
              </div>
              <div className="flex justify-between">
                <span>Platform fee (10%)</span>
                <span>{formatCurrency(total * 0.1)}</span>
              </div>
            </div>
            <div className="border-t border-white/8 pt-4 mb-6">
              <div className="flex justify-between font-bold text-white">
                <span>Total</span>
                <span className="text-orange-400">{formatCurrency(total)}</span>
              </div>
            </div>
            {items.length === 1 ? (
              <RazorpayButton
                productId={items[0].productId}
                amount={items[0].price}
                productTitle={items[0].title}
                userName={session?.user?.name || ''}
                userEmail={session?.user?.email || ''}
              />
            ) : (
              <p className="text-center text-xs text-gray-500 bg-white/5 rounded-xl p-3">
                Please checkout one product at a time
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
