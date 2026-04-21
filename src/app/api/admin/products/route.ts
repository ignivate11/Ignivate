import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { productSchema } from '@/schemas/product'

export async function POST(req: Request) {
  const session = await auth()
  if (!session || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await req.json()
  const { autoApprove = false, ...productData } = body

  if (Array.isArray(productData.images)) {
    productData.images = productData.images.filter((url: unknown) => typeof url === 'string' && url.length > 0)
  }
  if (productData.fundingGoal) productData.fundingGoal = Number(productData.fundingGoal)
  if (productData.preorderPrice) productData.preorderPrice = Number(productData.preorderPrice)

  const parsed = productSchema.safeParse(productData)
  if (!parsed.success) {
    const firstError = Object.values(parsed.error.flatten().fieldErrors).flat()[0]
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
      status: autoApprove ? 'APPROVED' : 'PENDING',
    },
  })

  return NextResponse.json(product, { status: 201 })
}
