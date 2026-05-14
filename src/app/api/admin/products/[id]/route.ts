import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { updateProductStatusSchema } from '@/schemas/product'

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const session = await auth()
  if (!session || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await req.json()
  const parsed = updateProductStatusSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
  }

  const product = await prisma.product.update({
    where: { id: params.id },
    data: { status: parsed.data.status },
  })

  return NextResponse.json(product)
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const session = await auth()
  if (!session || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const productId = params.id

  // Verify product exists
  const product = await prisma.product.findUnique({ where: { id: productId } })
  if (!product) {
    return NextResponse.json({ error: 'Product not found' }, { status: 404 })
  }

  // Delete ALL dependent records in a transaction — order matters for FK constraints
  await prisma.$transaction([
    // 1. Cart items referencing this product
    prisma.cart.deleteMany({ where: { productId } }),
    // 2. Ratings for this product
    prisma.rating.deleteMany({ where: { productId } }),
    // 3. Orders linked to this product (payment records kept for audit via razorpayPaymentId)
    prisma.order.deleteMany({ where: { productId } }),
    // 4. Finally delete the product itself
    prisma.product.delete({ where: { id: productId } }),
  ])

  return NextResponse.json({ success: true })
}
