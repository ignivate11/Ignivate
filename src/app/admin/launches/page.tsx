export const dynamic = 'force-dynamic'
import { prisma } from '@/lib/prisma'
import { formatCurrency, formatDate } from '@/lib/utils'
import Link from 'next/link'
import Image from 'next/image'
import { TogglePublishButton, DeleteLaunchButton } from './LaunchActions'

export default async function LaunchesPage() {
  const launches = await prisma.launch.findMany({ orderBy: { createdAt: 'desc' } })

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <p className="text-xs font-mono text-orange-400 uppercase tracking-widest mb-1">Admin</p>
          <h1 className="text-3xl font-bold text-white">Launches</h1>
        </div>
        <Link href="/admin/launches/new" className="px-5 py-2.5 bg-orange-500 hover:bg-orange-400 text-black font-semibold rounded-xl text-sm transition-colors">
          + New Launch
        </Link>
      </div>

      {launches.length === 0 ? (
        <div className="bg-[#111] border border-white/8 rounded-2xl p-16 text-center">
          <p className="text-gray-500 text-sm mb-4">No launches yet</p>
          <Link href="/admin/launches/new" className="text-orange-400 hover:text-orange-300 text-sm">Create your first launch →</Link>
        </div>
      ) : (
        <div className="space-y-4">
          {launches.map(launch => (
            <div key={launch.id} className="bg-[#111] border border-white/8 rounded-2xl p-5 flex gap-5 items-start">
              {launch.images[0] && (
                <div className="relative w-20 h-20 rounded-xl overflow-hidden flex-shrink-0 bg-white/5">
                  <Image src={launch.images[0]} alt={launch.productName} fill className="object-cover" />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <div className="flex items-start gap-3 flex-wrap">
                  <h3 className="font-semibold text-white text-base">{launch.productName}</h3>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-mono font-semibold ${launch.launchType === 'LIVE' ? 'bg-orange-500/15 text-orange-400 border border-orange-500/20' : 'bg-amber-500/15 text-amber-400 border border-amber-500/20'}`}>
                    {launch.launchType === 'LIVE' ? 'Live' : 'Pre-order'}
                  </span>
                </div>
                <p className="text-sm text-gray-400 mt-1">by {launch.creatorName}</p>
                <p className="text-xs text-gray-600 mt-0.5">{formatDate(launch.createdAt)} · {formatCurrency(launch.price)}</p>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <TogglePublishButton id={launch.id} isPublished={launch.isPublished} />
                <Link href={`/admin/launches/${launch.id}/edit`} className="px-3 py-1.5 rounded-lg text-xs font-mono font-semibold bg-white/5 text-gray-300 hover:bg-white/10 border border-white/10 transition-colors">
                  Edit
                </Link>
                <DeleteLaunchButton id={launch.id} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
