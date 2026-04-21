import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyWebhookSignature } from '@/lib/razorpay'

export async function POST(req: Request) {
  const body = await req.text()
  const signature = req.headers.get('x-razorpay-signature') ?? ''

  if (!verifyWebhookSignature(body, signature)) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  const event = JSON.parse(body)

  if (event.event === 'payment.captured') {
    const razorpayOrderId = event.payload.payment.entity.order_id
    const razorpayPaymentId = event.payload.payment.entity.id

    const order = await prisma.order.findUnique({ where: { razorpayOrderId } })
    if (order && order.paymentStatus !== 'PAID') {
      await prisma.order.update({
        where: { razorpayOrderId },
        data: { paymentStatus: 'PAID', razorpayPaymentId },
      })
      await prisma.cart.deleteMany({
        where: { userId: order.userId, productId: order.productId },
      })
    }
  }

  return NextResponse.json({ received: true })
}
