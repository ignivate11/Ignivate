'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'

declare global {
  interface Window {
    Razorpay: new (options: Record<string, unknown>) => { open: () => void }
  }
}

function loadRazorpayScript(): Promise<boolean> {
  return new Promise(resolve => {
    if (typeof window !== 'undefined' && window.Razorpay) return resolve(true)
    const script = document.createElement('script')
    script.src = 'https://checkout.razorpay.com/v1/checkout.js'
    script.async = true
    script.onload = () => resolve(true)
    script.onerror = () => resolve(false)
    document.body.appendChild(script)
  })
}

interface Props {
  productId: string
  displayPrice: number
  userName: string
  userEmail: string
  isPreorder: boolean
}

export default function BuyNowButton({ productId, displayPrice, userName, userEmail, isPreorder }: Props) {
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleBuyNow = async () => {
    setLoading(true)

    // Load Razorpay SDK
    const loaded = await loadRazorpayScript()
    if (!loaded) {
      toast.error('Payment gateway failed to load. Check your connection.')
      setLoading(false)
      return
    }

    // Step 1 — Create order on backend (price fetched from DB, never trusted from frontend)
    let orderData: {
      orderId: string; razorpayOrderId: string; amount: number;
      currency: string; keyId: string; productTitle: string
    }

    try {
      const res = await fetch('/api/payments/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId, quantity: 1 }),
      })
      const data = await res.json()
      if (!res.ok) {
        toast.error(data.error || 'Could not create order. Please try again.')
        setLoading(false)
        return
      }
      orderData = data
    } catch {
      toast.error('Network error. Please check your connection.')
      setLoading(false)
      return
    }

    // Step 2 — Open Razorpay modal
    const options = {
      key: orderData.keyId,
      amount: orderData.amount,        // in paise
      currency: orderData.currency,
      name: 'Ignivate',
      description: orderData.productTitle,
      order_id: orderData.razorpayOrderId,
      image: '/ignivate-logo.png',

      // Step 3 — Verify after payment
      handler: async (response: {
        razorpay_order_id: string
        razorpay_payment_id: string
        razorpay_signature: string
      }) => {
        try {
          const verifyRes = await fetch('/api/payments/verify', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              razorpayOrderId: response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature,
              orderId: orderData.orderId,
            }),
          })
          const verifyData = await verifyRes.json()

          if (verifyRes.ok && verifyData.success) {
            toast.success(isPreorder ? '🚀 Pre-order confirmed!' : '✅ Payment successful!')
            router.push('/orders')
          } else {
            toast.error(verifyData.error || 'Payment verification failed. Contact support.')
          }
        } catch {
          toast.error('Verification error. Contact support with your payment ID.')
        }
        setLoading(false)
      },

      prefill: { name: userName, email: userEmail },
      theme: { color: '#E8651A' },

      modal: {
        ondismiss: () => {
          toast('Payment cancelled', { icon: 'ℹ️' })
          setLoading(false)
        },
      },
    }

    try {
      const rzp = new window.Razorpay(options)

      // Handle payment failures (e.g. card declined)
      rzp.on?.('payment.failed', (response: { error: { description: string } }) => {
        toast.error(`Payment failed: ${response.error.description}`)
        setLoading(false)
      })

      rzp.open()
    } catch {
      toast.error('Failed to open payment window')
      setLoading(false)
    }
  }

  return (
    <button
      onClick={handleBuyNow}
      disabled={loading}
      className="w-full bg-gradient-to-r from-orange-600 to-orange-400 text-white font-semibold py-3.5 rounded-xl hover:-translate-y-0.5 transition-all shadow-lg shadow-orange-500/25 disabled:opacity-60 disabled:translate-y-0 disabled:cursor-not-allowed flex items-center justify-center gap-2"
    >
      {loading ? (
        <>
          <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
          </svg>
          Processing...
        </>
      ) : (
        <>
          {isPreorder ? '🚀 Pre-order Now' : '⚡ Buy Now'} — ₹{displayPrice.toLocaleString('en-IN')}
        </>
      )}
    </button>
  )
}
