import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const payoutSchema = z.object({
  creatorId: z.string().min(1),
  amount: z.number().positive(),
  razorpayOrderIds: z.array(z.string()),
  note: z.string().max(500).optional(),
})

export async function POST(req: Request) {
  const session = await auth()
  if (!session || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await req.json()
  const parsed = payoutSchema.safeParse(body)
  if (!parsed.success) {
    const firstError = Object.values(parsed.error.flatten().fieldErrors).flat()[0]
    return NextResponse.json({ error: firstError || 'Invalid data' }, { status: 400 })
  }

  const { creatorId, amount, razorpayOrderIds, note } = parsed.data

  // Verify creator exists
  const creator = await prisma.user.findUnique({
    where: { id: creatorId, role: 'CREATOR' },
  })
  if (!creator) return NextResponse.json({ error: 'Creator not found' }, { status: 404 })

  const payout = await prisma.payout.create({
    data: {
      creatorId,
      amount,
      status: 'PAID',
      note: note ?? null,
      ordersIncluded: razorpayOrderIds,
      paidAt: new Date(),
    },
  })

  return NextResponse.json(payout, { status: 201 })
}

export async function GET() {
  const session = await auth()
  if (!session || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const payouts = await prisma.payout.findMany({
    include: { creator: { select: { name: true, email: true } } },
    orderBy: { createdAt: 'desc' },
  })

  return NextResponse.json(payouts)
}
