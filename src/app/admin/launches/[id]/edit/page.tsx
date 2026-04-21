export const dynamic = 'force-dynamic'
import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import LaunchForm from '../../LaunchForm'

export default async function EditLaunchPage({ params }: { params: { id: string } }) {
  const launch = await prisma.launch.findUnique({ where: { id: params.id } })
  if (!launch) notFound()

  return (
    <div>
      <div className="mb-8">
        <p className="text-xs font-mono text-orange-400 uppercase tracking-widest mb-1">Admin / Launches</p>
        <h1 className="text-3xl font-bold text-white">Edit Launch</h1>
      </div>
      <LaunchForm initialData={{
        id: launch.id,
        productName: launch.productName,
        creatorName: launch.creatorName,
        creatorDescription: launch.creatorDescription,
        productDescription: launch.productDescription,
        usp: launch.usp,
        problemStatement: launch.problemStatement,
        price: String(launch.price),
        images: launch.images,
        launchType: launch.launchType,
        isPublished: launch.isPublished,
      }} />
    </div>
  )
}
