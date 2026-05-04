import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const cart = await prisma.cart.findMany({
    where: { userId: session.user.id },
    include: {
      product: {
        select: {
          id: true, title: true, price: true, images: true,
          saleCategory: true, preorderPrice: true,
          creator: { select: { name: true } },
        },
      },
    },
  })

  // Return shaped response with unit price and total per item
  const items = cart.map(item => {
    const unitPrice = item.product.saleCategory === 'PREORDER' && item.product.preorderPrice
      ? item.product.preorderPrice
      : item.product.price
    return {
      productId: item.productId,
      title: item.product.title,
      price: unitPrice,
      image: item.product.images[0] ?? '',
      creatorName: item.product.creator.name,
      quantity: item.quantity,
      itemTotal: unitPrice * item.quantity,
    }
  })

  return NextResponse.json(items)
}

export async function POST(req: Request) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { productId, quantity = 1 } = await req.json()
  if (!productId) return NextResponse.json({ error: 'productId required' }, { status: 400 })

  const product = await prisma.product.findUnique({
    where: { id: productId, status: 'APPROVED' },
  })
  if (!product) return NextResponse.json({ error: 'Product not available' }, { status: 400 })

  const item = await prisma.cart.upsert({
    where: { userId_productId: { userId: session.user.id, productId } },
    update: { quantity },
    create: { userId: session.user.id, productId, quantity },
  })

  return NextResponse.json(item, { status: 201 })
}

// PATCH — update quantity for an existing cart item
export async function PATCH(req: Request) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { productId, quantity } = await req.json()
  if (!productId || quantity === undefined) {
    return NextResponse.json({ error: 'productId and quantity required' }, { status: 400 })
  }
  if (typeof quantity !== 'number' || !Number.isInteger(quantity)) {
    return NextResponse.json({ error: 'quantity must be an integer' }, { status: 400 })
  }

  if (quantity <= 0) {
    // Remove item
    await prisma.cart.deleteMany({
      where: { userId: session.user.id, productId },
    })
    return NextResponse.json({ removed: true })
  }

  const item = await prisma.cart.update({
    where: { userId_productId: { userId: session.user.id, productId } },
    data: { quantity },
  })

  return NextResponse.json(item)
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
