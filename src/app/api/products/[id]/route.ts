import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { productSchema } from '@/schemas/product'
import { calculateFees } from '@/lib/utils'

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const product = await prisma.product.findUnique({
    where: { id: params.id },
    include: { creator: { select: { id: true, name: true } } },
  })
  if (!product) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(product)
}

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const product = await prisma.product.findUnique({ where: { id: params.id } })
  if (!product) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  if (session.user.role === 'CREATOR' && product.creatorId !== session.user.id) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }
  if (session.user.role === 'CUSTOMER') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const body = await req.json()

  // Resubmit for approval (no full validation needed — just reset status)
  if (body._resubmit) {
    const updated = await prisma.product.update({
      where: { id: params.id },
      data: { status: 'PENDING' },
    })
    return NextResponse.json(updated)
  }

  if (body.fundingGoal) body.fundingGoal = Number(body.fundingGoal)
  if (body.preorderPrice) body.preorderPrice = Number(body.preorderPrice)

  const parsed = productSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
  }

  const data = parsed.data
  const updated = await prisma.product.update({
    where: { id: params.id },
    data: {
      title: data.title,
      description: data.description,
      price: data.price,
      images: data.images,
      category: data.category,
      saleCategory: data.saleCategory,
      problemStatement: data.problemStatement,
      usp: data.usp,
      founderName: data.founderName,
      teamDescription: data.teamDescription,
      creatorStory: data.creatorStory,
      estimatedCompletion: data.estimatedCompletion ? new Date(data.estimatedCompletion) : null,
      fundingGoal: data.fundingGoal,
      launchDate: data.launchDate ? new Date(data.launchDate) : null,
      preorderPrice: data.preorderPrice,
      status: 'PENDING',
    },
  })

  return NextResponse.json(updated)
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const product = await prisma.product.findUnique({ where: { id: params.id } })
  if (!product) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  if (session.user.role === 'CREATOR' && product.creatorId !== session.user.id) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }
  if (session.user.role === 'CUSTOMER') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  await prisma.product.delete({ where: { id: params.id } })
  return NextResponse.json({ success: true })
}
