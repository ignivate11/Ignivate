import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { getRazorpay } from '@/lib/razorpay'
import { calculateFees } from '@/lib/utils'
import { createPaymentOrderSchema } from '@/schemas/payment'

export async function POST(req: Request) {
  const session = await auth()
  if (!session || session.user.role !== 'CUSTOMER') {
    return NextResponse.json({ error: 'Login as a customer to purchase' }, { status: 401 })
  }

  const body = await req.json()
  const parsed = createPaymentOrderSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }

  // ALWAYS fetch price from DB — never trust frontend
  const product = await prisma.product.findUnique({
    where: { id: parsed.data.productId, status: 'APPROVED' },
  })
  if (!product) {
    return NextResponse.json({ error: 'Product not available' }, { status: 400 })
  }

  // Use preorder price if product is PREORDER
  const unitPrice = product.saleCategory === 'PREORDER' && product.preorderPrice
    ? product.preorderPrice
    : product.price

  const totalAmount = unitPrice * parsed.data.quantity

  // Razorpay requires minimum 100 paise (₹1)
  if (totalAmount * 100 < 100) {
    return NextResponse.json({ error: 'Amount too small (minimum ₹1)' }, { status: 400 })
  }

  const { platformFee, creatorEarnings } = calculateFees(totalAmount)

  // Create Razorpay order — amount in paise
  const razorpayOrder = await getRazorpay().orders.create({
    amount: Math.round(totalAmount * 100),
    currency: 'INR',
    receipt: `rcpt_${Date.now()}`,
    notes: {
      productId: product.id,
      userId: session.user.id,
      creatorId: product.creatorId,
    },
  })

  // Save order in DB with PENDING status
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
    amount: razorpayOrder.amount,        // in paise
    currency: razorpayOrder.currency,
    keyId: process.env.RAZORPAY_KEY_ID,  // safe to send key_id (not secret)
    productTitle: product.title,
  })
}
