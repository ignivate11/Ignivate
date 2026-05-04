'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import Button from '@/components/ui/Button'
import { useCart } from '@/hooks/useCart'
import { formatCurrency } from '@/lib/utils'

interface RazorpayButtonProps {
  productId: string
  quantity: number        // ← now required, passed from checkout
  amount: number         // display only (unit price × qty) — backend recalculates
  productTitle: string
  userName: string
  userEmail: string
}

declare global {
  interface Window {
    Razorpay: new (options: Record<string, unknown>) => {
      open: () => void
      on?: (event: string, handler: (res: { error: { description: string } }) => void) => void
    }
  }
}

function loadRazorpay(): Promise<boolean> {
  return new Promise(resolve => {
    if (window.Razorpay) return resolve(true)
    const script = document.createElement('script')
    script.src = 'https://checkout.razorpay.com/v1/checkout.js'
    script.async = true
    script.onload = () => resolve(true)
    script.onerror = () => resolve(false)
    document.body.appendChild(script)
  })
}

export default function RazorpayButton({
  productId, quantity, amount, productTitle, userName, userEmail,
}: RazorpayButtonProps) {
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const removeItem = useCart(s => s.removeItem)

  const handlePayment = async () => {
    setLoading(true)

    const loaded = await loadRazorpay()
    if (!loaded) {
      toast.error('Payment gateway failed to load. Check your connection.')
      setLoading(false)
      return
    }

    // Backend fetches price from DB and multiplies by quantity — never trust frontend price
    const orderRes = await fetch('/api/payments/create-order', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ productId, quantity }),
    })

    if (!orderRes.ok) {
      const d = await orderRes.json()
      toast.error(d.error || 'Failed to create order. Please try again.')
      setLoading(false)
      return
    }

    const { orderId, razorpayOrderId, amount: orderAmount, currency, keyId } = await orderRes.json()

    const options = {
      key: keyId,
      amount: orderAmount,          // paise — from backend
      currency,
      name: 'Ignivate',
      description: `${productTitle}${quantity > 1 ? ` × ${quantity}` : ''}`,
      order_id: razorpayOrderId,
      image: '/ignivate-logo.png',

      handler: async (response: {
        razorpay_order_id: string
        razorpay_payment_id: string
        razorpay_signature: string
      }) => {
        const verifyRes = await fetch('/api/payments/verify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            razorpayOrderId: response.razorpay_order_id,
            razorpayPaymentId: response.razorpay_payment_id,
            razorpaySignature: response.razorpay_signature,
            orderId,
          }),
        })

        if (verifyRes.ok) {
          removeItem(productId)
          toast.success('Payment successful! 🎉')
          router.push('/orders')
        } else {
          const d = await verifyRes.json()
          toast.error(d.error || 'Payment verification failed. Contact support.')
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

    const rzp = new window.Razorpay(options)
    rzp.on?.('payment.failed', (res) => {
      toast.error(`Payment failed: ${res.error.description}`)
      setLoading(false)
    })
    rzp.open()
  }

  return (
    <Button onClick={handlePayment} loading={loading} size="lg" className="w-full">
      Pay {formatCurrency(amount)}
      {quantity > 1 && (
        <span className="ml-1.5 text-xs opacity-75 font-normal">
          ({quantity} items)
        </span>
      )}
    </Button>
  )
}
