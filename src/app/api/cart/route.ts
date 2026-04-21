import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const cart = await prisma.cart.findMany({
    where: { userId: session.user.id },
    include: { product: { include: { creator: { select: { name: true } } } } },
  })

  return NextResponse.json(cart)
}

export async function POST(req: Request) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { productId, quantity = 1 } = await req.json()
  if (!productId) return NextResponse.json({ error: 'productId required' }, { status: 400 })

  const product = await prisma.product.findUnique({ where: { id: productId } })
  if (!product || product.status !== 'APPROVED') {
    return NextResponse.json({ error: 'Product not available' }, { status: 400 })
  }

  const item = await prisma.cart.upsert({
    where: { userId_productId: { userId: session.user.id, productId } },
    update: { quantity },
    create: { userId: session.user.id, productId, quantity },
  })

  return NextResponse.json(item, { status: 201 })
}

export async function DELETE(req: Request) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { productId } = await req.json()
  await prisma.cart.deleteMany({
    where: { userId: session.user.id, productId },
  })

  return NextResponse.json({ success: true })
}
