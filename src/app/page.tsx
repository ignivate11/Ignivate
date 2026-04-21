export const dynamic = 'force-dynamic'
import { prisma } from '@/lib/prisma'
import HomeClient from './HomeClient'

export default async function HomePage() {
  const launches = await prisma.launch.findMany({
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
  })

  return <HomeClient launches={launches} />
}
