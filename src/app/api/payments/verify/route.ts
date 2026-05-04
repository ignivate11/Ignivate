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
    return NextResponse.json({ error: 'Invalid verification data' }, { status: 400 })
  }

  const { razorpayOrderId, razorpayPaymentId, razorpaySignature, orderId } = parsed.data

  // ALWAYS verify HMAC-SHA256 signature — never skip this step
  const isValid = verifyRazorpaySignature(razorpayOrderId, razorpayPaymentId, razorpaySignature)
  if (!isValid) {
    // Mark as failed in DB
    await prisma.order.updateMany({
      where: { id: orderId, paymentStatus: 'PENDING' },
      data: { paymentStatus: 'FAILED' },
    })
    return NextResponse.json({ error: 'Payment signature invalid — possible tampering' }, { status: 400 })
  }

  // Fetch and validate order belongs to this user
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { product: true },
  })

  if (!order) return NextResponse.json({ error: 'Order not found' }, { status: 404 })
  if (order.userId !== session.user.id) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  if (order.paymentStatus === 'PAID') {
    return NextResponse.json({ success: true, orderId: order.id }) // idempotent
  }

  // Mark order as PAID
  const updatedOrder = await prisma.order.update({
    where: { id: orderId },
    data: { paymentStatus: 'PAID', razorpayPaymentId },
  })

  // If PREORDER — increment currentFunding
  if (order.product.saleCategory === 'PREORDER') {
    await prisma.product.update({
      where: { id: order.productId },
      data: { currentFunding: { increment: order.totalAmount } },
    })
  }

  // Clear from cart
  await prisma.cart.deleteMany({
    where: { userId: session.user.id, productId: order.productId },
  })

  return NextResponse.json({ success: true, orderId: updatedOrder.id })
}
