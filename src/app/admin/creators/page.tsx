export const dynamic = 'force-dynamic'
import { prisma } from '@/lib/prisma'
import { formatDate } from '@/lib/utils'
import Badge from '@/components/ui/Badge'
import CreateCreatorForm from './CreateCreatorForm'
import { CreatorActions } from './CreatorActions'

export default async function AdminCreatorsPage() {
  const creators = await prisma.user.findMany({
    where: { role: 'CREATOR' },
    include: { _count: { select: { products: true, orders: true } } },
    orderBy: { createdAt: 'desc' },
  })

  return (
    <div>
      <div className="flex items-start justify-between mb-8">
        <div>
          <p className="text-xs font-mono text-orange-400 uppercase tracking-widest mb-1">Admin</p>
          <h1 className="text-3xl font-bold text-white">Creators</h1>
          <p className="text-gray-500 text-sm mt-1">{creators.length} creators on the platform</p>
        </div>
        <CreateCreatorForm />
      </div>

      {creators.length === 0 ? (
        <div className="text-center py-16 text-gray-500">
          <p className="text-4xl mb-3">👤</p>
          <p>No creators yet. Create one to get started.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {creators.map(creator => (
            <div key={creator.id} className="bg-[#111] border border-white/8 rounded-2xl p-5 flex gap-4 items-center">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-500 to-amber-400 flex items-center justify-center text-white font-bold text-sm shrink-0">
                {creator.name.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-white">{creator.name}</h3>
                <p className="text-xs text-gray-500">{creator.email} · Joined {formatDate(creator.createdAt)}</p>
              </div>
              <div className="flex items-center gap-6 text-center">
                <div><p className="text-lg font-bold text-white">{creator._count.products}</p><p className="text-xs text-gray-500">Products</p></div>
                <div><p className="text-lg font-bold text-white">{creator._count.orders}</p><p className="text-xs text-gray-500">Orders</p></div>
                <Badge variant={creator.status.toLowerCase() as 'active' | 'suspended'}>{creator.status}</Badge>
                <CreatorActions id={creator.id} name={creator.name} status={creator.status} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
