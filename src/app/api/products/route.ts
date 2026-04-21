import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { productSchema } from '@/schemas/product'

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const category = searchParams.get('category') || undefined
  const search = searchParams.get('search') || undefined
  const saleCategory = searchParams.get('saleCategory') || undefined
  const page = parseInt(searchParams.get('page') || '1')
  const limit = parseInt(searchParams.get('limit') || '12')

  const where = {
    status: 'APPROVED' as const,
    ...(category && { category }),
    ...(saleCategory && { saleCategory: saleCategory as 'READY' | 'PREORDER' }),
    ...(search && {
      OR: [
        { title: { contains: search, mode: 'insensitive' as const } },
        { description: { contains: search, mode: 'insensitive' as const } },
      ],
    }),
  }

  const [products, total] = await Promise.all([
    prisma.product.findMany({
      where,
      include: { creator: { select: { id: true, name: true } } },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.product.count({ where }),
  ])

  return NextResponse.json({ products, total, page, pageSize: limit })
}

export async function POST(req: Request) {
  const session = await auth()
  if (!session) {
    return NextResponse.json({ error: 'Not logged in. Please sign in and try again.' }, { status: 401 })
  }
  if (session.user.role !== 'CREATOR') {
    return NextResponse.json({ error: `Only creators can submit products.` }, { status: 403 })
  }

  const body = await req.json()
  if (Array.isArray(body.images)) {
    body.images = body.images.filter((url: unknown) => typeof url === 'string' && url.length > 0)
  }
  // Convert numeric strings from form
  if (body.fundingGoal) body.fundingGoal = Number(body.fundingGoal)
  if (body.preorderPrice) body.preorderPrice = Number(body.preorderPrice)

  const parsed = productSchema.safeParse(body)
  if (!parsed.success) {
    const fieldErrors = parsed.error.flatten().fieldErrors
    const firstError = Object.values(fieldErrors).flat()[0]
    return NextResponse.json({ error: firstError || 'Invalid product data' }, { status: 400 })
  }

  const data = parsed.data
  const product = await prisma.product.create({
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
      creatorId: session.user.id,
      status: 'PENDING',
    },
  })

  return NextResponse.json(product, { status: 201 })
}
