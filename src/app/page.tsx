export const dynamic = 'force-dynamic'
import { prisma } from '@/lib/prisma'
import HomeClient from './HomeClient'

export default async function HomePage() {
  const [readyProducts, preorderProducts] = await Promise.all([
    // Only APPROVED READY products from the Product table — no fallbacks, no mock data
    prisma.product.findMany({
      where: { status: 'APPROVED', saleCategory: 'READY' },
      orderBy: { createdAt: 'desc' },
      take: 6,
      select: {
        id: true,
        title: true,
        description: true,
        price: true,
        images: true,
        category: true,
        usp: true,
        founderName: true,
        creator: { select: { name: true } },
      },
    }),
    // Only APPROVED PREORDER products
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

  return <HomeClient launches={[]} readyProducts={readyProducts} preorderProducts={preorderProducts} />
}
