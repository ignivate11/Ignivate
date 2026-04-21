import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const where =
    session.user.role === 'CUSTOMER'
      ? { userId: session.user.id }
      : session.user.role === 'CREATOR'
      ? { creatorId: session.user.id }
      : {}

  const orders = await prisma.order.findMany({
    where,
    include: {
      product: { select: { id: true, title: true, images: true } },
      user: { select: { id: true, name: true, email: true } },
    },
    orderBy: { createdAt: 'desc' },
  })

  return NextResponse.json(orders)
}
