import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const PatchSchema = z.object({
  productName: z.string().min(1).optional(),
  creatorName: z.string().min(1).optional(),
  creatorDescription: z.string().min(1).optional(),
  productDescription: z.string().min(1).optional(),
  usp: z.string().min(1).optional(),
  problemStatement: z.string().min(1).optional(),
  price: z.number().positive().optional(),
  images: z.array(z.string()).optional(),
  launchType: z.enum(['LIVE', 'PREORDER']).optional(),
  isPublished: z.boolean().optional(),
})

async function requireAdmin() {
  const session = await auth()
  if (!session?.user || (session.user as { role?: string }).role !== 'ADMIN') return null
  return session
}

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const session = await requireAdmin()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const launch = await prisma.launch.findUnique({ where: { id: params.id } })
  if (!launch) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(launch)
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await requireAdmin()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const parsed = PatchSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
  }

  const launch = await prisma.launch.update({ where: { id: params.id }, data: parsed.data })
  return NextResponse.json(launch)
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const session = await requireAdmin()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  await prisma.launch.delete({ where: { id: params.id } })
  return NextResponse.json({ success: true })
}
