export const dynamic = 'force-dynamic'
import { prisma } from '@/lib/prisma'
import HomeClient from './HomeClient'

export default async function HomePage() {
  const [launches, preorderProducts] = await Promise.all([
    prisma.launch.findMany({
      where: { isPublished: true },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        productName: true,
        creatorName: true,
        creatorDescription: true,
        productDescription: true,
        usp: true,
        price: true,
        images: true,
        launchType: true,
      },
    }),
    prisma.product.findMany({
      where: { status: 'APPROVED', saleCategory: 'PREORDER' },
      orderBy: { createdAt: 'desc' },
      take: 6,
      select: {
        id: true,
        title: true,
        description: true,
        price: true,
        preorderPrice: true,
        fundingGoal: true,
        currentFunding: true,
        launchDate: true,
        estimatedCompletion: true,
        images: true,
        founderName: true,
        usp: true,
        creator: { select: { name: true } },
      },
    }),
  ])

  return <HomeClient launches={launches} preorderProducts={preorderProducts} />
}
