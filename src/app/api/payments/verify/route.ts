import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { verifyRazorpaySignature } from '@/lib/razorpay'
import { verifyPaymentSchema } from '@/schemas/payment'

export async function POST(req: Request) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const parsed = verifyPaymentSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
  }

  const { razorpayOrderId, razorpayPaymentId, razorpaySignature, orderId } = parsed.data

  const isValid = verifyRazorpaySignature(razorpayOrderId, razorpayPaymentId, razorpaySignature)
  if (!isValid) {
    return NextResponse.json({ error: 'Invalid payment signature' }, { status: 400 })
  }

  const order = await prisma.order.update({
    where: { id: orderId },
    data: { paymentStatus: 'PAID', razorpayPaymentId },
  })

  await prisma.cart.deleteMany({
    where: { userId: session.user.id, productId: order.productId },
  })

  return NextResponse.json({ success: true, orderId: order.id })
}
