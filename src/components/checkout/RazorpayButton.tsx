'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import Button from '@/components/ui/Button'
import { useCart } from '@/hooks/useCart'

interface RazorpayButtonProps {
  productId: string
  amount: number
  productTitle: string
  userName: string
  userEmail: string
}

declare global {
  interface Window {
    Razorpay: new (options: Record<string, unknown>) => { open: () => void }
  }
}

function loadRazorpay(): Promise<boolean> {
  return new Promise(resolve => {
    if (window.Razorpay) return resolve(true)
    const script = document.createElement('script')
    script.src = 'https://checkout.razorpay.com/v1/checkout.js'
    script.onload = () => resolve(true)
    script.onerror = () => resolve(false)
    document.body.appendChild(script)
  })
}

export default function RazorpayButton({ productId, amount, productTitle, userName, userEmail }: RazorpayButtonProps) {
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const removeItem = useCart(s => s.removeItem)

  const handlePayment = async () => {
    setLoading(true)
    const loaded = await loadRazorpay()
    if (!loaded) {
      toast.error('Payment gateway failed to load')
      setLoading(false)
      return
    }

    const orderRes = await fetch('/api/payments/create-order', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ productId, quantity: 1 }),
    })

    if (!orderRes.ok) {
      toast.error('Failed to create order')
      setLoading(false)
      return
    }

    const { orderId, razorpayOrderId, amount: orderAmount, currency, keyId } = await orderRes.json()

    const options = {
      key: keyId,
      amount: orderAmount,
      currency,
      name: 'Ignivate',
      description: productTitle,
      order_id: razorpayOrderId,
      handler: async (response: { razorpay_order_id: string; razorpay_payment_id: string; razorpay_signature: string }) => {
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
          toast.success('Payment successful!')
          router.push('/orders')
        } else {
          toast.error('Payment verification failed')
        }
      },
      prefill: { name: userName, email: userEmail },
      theme: { color: '#E8651A' },
      modal: { ondismiss: () => setLoading(false) },
    }

    const rzp = new window.Razorpay(options)
    rzp.open()
    setLoading(false)
  }

  return (
    <Button onClick={handlePayment} loading={loading} size="lg" className="w-full">
      Pay ₹{amount.toLocaleString('en-IN')}
    </Button>
  )
}
