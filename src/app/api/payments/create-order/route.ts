import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { getRazorpay } from '@/lib/razorpay'
import { calculateFees } from '@/lib/utils'
import { createPaymentOrderSchema } from '@/schemas/payment'

export async function POST(req: Request) {
  const session = await auth()
  if (!session || session.user.role !== 'CUSTOMER') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await req.json()
  const parsed = createPaymentOrderSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
  }

  const product = await prisma.product.findUnique({ where: { id: parsed.data.productId } })
  if (!product || product.status !== 'APPROVED') {
    return NextResponse.json({ error: 'Product not available' }, { status: 400 })
  }

  const totalAmount = product.price * parsed.data.quantity
  const { platformFee, creatorEarnings } = calculateFees(totalAmount)

  const razorpayOrder = await getRazorpay().orders.create({
    amount: Math.round(totalAmount * 100),
    currency: 'INR',
    notes: { productId: product.id, userId: session.user.id },
  })

  const order = await prisma.order.create({
    data: {
      userId: session.user.id,
      productId: product.id,
      creatorId: product.creatorId,
      totalAmount,
      platformFee,
      creatorEarnings,
      paymentStatus: 'PENDING',
      razorpayOrderId: razorpayOrder.id,
    },
  })

  return NextResponse.json({
    orderId: order.id,
    razorpayOrderId: razorpayOrder.id,
    amount: razorpayOrder.amount,
    currency: razorpayOrder.currency,
    keyId: process.env.RAZORPAY_KEY_ID,
  })
}
