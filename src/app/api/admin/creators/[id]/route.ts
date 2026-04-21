import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const updateCreatorSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').optional(),
  email: z.string().email('Invalid email').optional(),
  password: z.string().min(8, 'Password must be at least 8 characters').optional(),
  status: z.enum(['ACTIVE', 'SUSPENDED']).optional(),
})

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const session = await auth()
  if (!session || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await req.json()
  const parsed = updateCreatorSchema.safeParse(body)
  if (!parsed.success) {
    const firstError = Object.values(parsed.error.flatten().fieldErrors).flat()[0]
    return NextResponse.json({ error: firstError || 'Invalid data' }, { status: 400 })
  }

  const { name, email, password, status } = parsed.data

  // Check email uniqueness if changing
  if (email) {
    const existing = await prisma.user.findFirst({ where: { email, NOT: { id: params.id } } })
    if (existing) return NextResponse.json({ error: 'Email already in use' }, { status: 409 })
  }

  const updateData: Record<string, unknown> = {}
  if (name) updateData.name = name
  if (email) updateData.email = email
  if (status) updateData.status = status
  if (password) updateData.password = await bcrypt.hash(password, 12)

  const updated = await prisma.user.update({ where: { id: params.id }, data: updateData })
  return NextResponse.json({ id: updated.id, name: updated.name, email: updated.email, status: updated.status })
}
