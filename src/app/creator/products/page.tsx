export const dynamic = 'force-dynamic'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { formatCurrency, formatDate } from '@/lib/utils'
import Badge from '@/components/ui/Badge'
import Image from 'next/image'
import Link from 'next/link'
import DeleteProductButton from './DeleteProductButton'

export default async function CreatorProductsPage() {
  const session = await auth()
  const products = await prisma.product.findMany({
    where: { creatorId: session!.user.id },
    orderBy: { createdAt: 'desc' },
  })

  return (
    <div>
      <div className="flex items-start justify-between mb-8">
        <div>
          <p className="text-xs font-mono text-orange-400 uppercase tracking-widest mb-1">Creator</p>
          <h1 className="text-3xl font-bold text-white">My Products</h1>
          <p className="text-gray-500 text-sm mt-1">{products.length} total</p>
        </div>
        <Link href="/creator/products/new" className="bg-gradient-to-r from-orange-600 to-orange-400 text-white px-5 py-2.5 rounded-full font-semibold text-sm hover:-translate-y-0.5 transition-all shadow-lg shadow-orange-500/25">
          + New Product
        </Link>
      </div>

      {products.length === 0 ? (
        <div className="text-center py-16 text-gray-500">
          <p className="text-5xl mb-3">📦</p>
          <p className="text-white mb-1">No products yet</p>
          <Link href="/creator/products/new" className="text-sm text-orange-400 hover:text-orange-300">Create your first product →</Link>
        </div>
      ) : (
        <div className="space-y-3">
          {products.map(p => (
            <div key={p.id} className="bg-[#111] border border-white/8 rounded-2xl p-5 flex gap-4 items-center">
              <div className="relative w-14 h-14 rounded-xl overflow-hidden shrink-0 bg-white/5">
                {p.images[0]
                  ? <Image src={p.images[0]} alt={p.title} fill className="object-cover" />
                  : <div className="absolute inset-0 flex items-center justify-center">📦</div>
                }
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-white">{p.title}</h3>
                <p className="text-xs text-gray-500">{p.category} · {formatDate(p.createdAt)}</p>
              </div>
              <div className="flex items-center gap-4">
                <span className="font-bold text-orange-400">{formatCurrency(p.price)}</span>
                <Badge variant={p.status.toLowerCase() as 'pending' | 'approved' | 'rejected'}>{p.status}</Badge>
                <div className="flex gap-2">
                  {p.status !== 'APPROVED' && (
                    <Link href={`/creator/products/${p.id}/edit`} className="text-xs border border-white/15 text-gray-400 hover:text-white hover:border-white/30 px-3 py-1.5 rounded-full transition-all">
                      Edit
                    </Link>
                  )}
                  <DeleteProductButton productId={p.id} />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
