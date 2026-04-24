import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const ratingSchema = z.object({
  productId: z.string().min(1),
  rating: z.number().int().min(1).max(5),
  review: z.string().max(1000).optional(),
})

export async function POST(req: Request) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Login to rate products' }, { status: 401 })
  if (session.user.role !== 'CUSTOMER') {
    return NextResponse.json({ error: 'Only customers can rate products' }, { status: 403 })
  }

  const body = await req.json()
  const parsed = ratingSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid rating data' }, { status: 400 })
  }

  const { productId, rating, review } = parsed.data

  // Check product exists and is approved
  const product = await prisma.product.findUnique({ where: { id: productId, status: 'APPROVED' } })
  if (!product) return NextResponse.json({ error: 'Product not found' }, { status: 404 })

  // Upsert — one rating per user per product
  const result = await prisma.rating.upsert({
    where: { userId_productId: { userId: session.user.id, productId } },
    update: { rating, review: review || null },
    create: { userId: session.user.id, productId, rating, review: review || null },
  })

  // Return updated average
  const stats = await prisma.rating.aggregate({
    where: { productId },
    _avg: { rating: true },
    _count: { rating: true },
  })

  return NextResponse.json({
    rating: result,
    average: Math.round((stats._avg.rating ?? 0) * 10) / 10,
    count: stats._count.rating,
  })
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const productId = searchParams.get('productId')
  if (!productId) return NextResponse.json({ error: 'productId required' }, { status: 400 })

  const [stats, userRating] = await Promise.all([
    prisma.rating.aggregate({
      where: { productId },
      _avg: { rating: true },
      _count: { rating: true },
    }),
    (async () => {
      const session = await auth()
      if (!session) return null
      return prisma.rating.findUnique({
        where: { userId_productId: { userId: session.user.id, productId } },
      })
    })(),
  ])

  return NextResponse.json({
    average: Math.round((stats._avg.rating ?? 0) * 10) / 10,
    count: stats._count.rating,
    userRating: userRating?.rating ?? null,
  })
}
