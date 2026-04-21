import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const LaunchSchema = z.object({
  productName: z.string().min(1),
  creatorName: z.string().min(1),
  creatorDescription: z.string().min(1),
  productDescription: z.string().min(1),
  usp: z.string().min(1),
  problemStatement: z.string().min(1),
  price: z.number().positive(),
  images: z.array(z.string()).min(1),
  launchType: z.enum(['LIVE', 'PREORDER']),
  isPublished: z.boolean().optional(),
})

async function requireAdmin() {
  const session = await auth()
  if (!session?.user || (session.user as { role?: string }).role !== 'ADMIN') return null
  return session
}

export async function GET() {
  const session = await requireAdmin()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const launches = await prisma.launch.findMany({ orderBy: { createdAt: 'desc' } })
  return NextResponse.json(launches)
}

export async function POST(req: NextRequest) {
  const session = await requireAdmin()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const parsed = LaunchSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
  }

  const launch = await prisma.launch.create({
    data: { ...parsed.data, isPublished: parsed.data.isPublished ?? true },
  })

  return NextResponse.json(launch, { status: 201 })
}
