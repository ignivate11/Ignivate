import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { createCreatorSchema } from '@/schemas/auth'

export async function GET() {
  const session = await auth()
  if (!session || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const creators = await prisma.user.findMany({
    where: { role: 'CREATOR' },
    select: {
      id: true, name: true, email: true, status: true, createdAt: true,
      _count: { select: { products: true, orders: true } },
    },
    orderBy: { createdAt: 'desc' },
  })

  return NextResponse.json(creators)
}

export async function POST(req: Request) {
  const session = await auth()
  if (!session || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await req.json()
  const parsed = createCreatorSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
  }

  const existing = await prisma.user.findUnique({ where: { email: parsed.data.email } })
  if (existing) {
    return NextResponse.json({ error: 'Email already registered' }, { status: 409 })
  }

  const hashed = await bcrypt.hash(parsed.data.password, 12)
  const creator = await prisma.user.create({
    data: { name: parsed.data.name, email: parsed.data.email, password: hashed, role: 'CREATOR', status: 'ACTIVE' },
  })

  return NextResponse.json(
    { id: creator.id, name: creator.name, email: creator.email, password: parsed.data.password },
    { status: 201 }
  )
}

export async function PATCH(req: Request) {
  const session = await auth()
  if (!session || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id, status } = await req.json()
  const updated = await prisma.user.update({ where: { id }, data: { status } })
  return NextResponse.json(updated)
}
