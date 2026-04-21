export const dynamic = 'force-dynamic'
import { prisma } from '@/lib/prisma'
import { formatCurrency, formatDate } from '@/lib/utils'
import Badge from '@/components/ui/Badge'
import ApprovalActions from './ApprovalActions'
import Image from 'next/image'

export default async function AdminProductsPage() {
  const products = await prisma.product.findMany({
    include: { creator: { select: { name: true, email: true } } },
    orderBy: [{ status: 'asc' }, { createdAt: 'desc' }],
  })

  const pending = products.filter(p => p.status === 'PENDING')
  const others = products.filter(p => p.status !== 'PENDING')

  return (
    <div>
      <div className="mb-8">
        <p className="text-xs font-mono text-orange-400 uppercase tracking-widest mb-1">Admin</p>
        <h1 className="text-3xl font-bold text-white">Products</h1>
        <p className="text-gray-500 text-sm mt-1">{pending.length} pending approval</p>
      </div>

      {pending.length > 0 && (
        <div className="mb-8">
          <h2 className="text-sm font-mono text-yellow-400 uppercase tracking-widest mb-4">Pending Review</h2>
          <div className="space-y-3">
            {pending.map(p => (
              <div key={p.id} className="bg-[#111] border border-yellow-500/20 rounded-2xl p-5 flex gap-4 items-center">
                <div className="relative w-16 h-16 rounded-xl overflow-hidden shrink-0 bg-white/5">
                  {p.images[0] ? <Image src={p.images[0]} alt={p.title} fill className="object-cover" /> : <div className="absolute inset-0 flex items-center justify-center text-2xl">📦</div>}
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-white">{p.title}</h3>
                  <p className="text-xs text-gray-500">{p.creator.name} · {p.creator.email} · {formatDate(p.createdAt)}</p>
                  <p className="text-xs text-gray-400 mt-1 line-clamp-1">{p.description}</p>
                </div>
                <div className="text-right shrink-0">
                  <p className="font-bold text-orange-400 mb-2">{formatCurrency(p.price)}</p>
                  <ApprovalActions productId={p.id} />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div>
        <h2 className="text-sm font-mono text-gray-500 uppercase tracking-widest mb-4">All Products</h2>
        <div className="space-y-3">
          {others.map(p => (
            <div key={p.id} className="bg-[#111] border border-white/8 rounded-2xl p-4 flex gap-4 items-center">
              <div className="relative w-12 h-12 rounded-xl overflow-hidden shrink-0 bg-white/5">
                {p.images[0] ? <Image src={p.images[0]} alt={p.title} fill className="object-cover" /> : <div className="absolute inset-0 flex items-center justify-center">📦</div>}
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-white text-sm">{p.title}</h3>
                <p className="text-xs text-gray-500">{p.creator.name} · {formatDate(p.createdAt)}</p>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-sm font-bold text-orange-400">{formatCurrency(p.price)}</span>
                <Badge variant={p.status.toLowerCase() as 'approved' | 'rejected'}>{p.status}</Badge>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
