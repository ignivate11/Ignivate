export const dynamic = 'force-dynamic'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { formatCurrency } from '@/lib/utils'
import Link from 'next/link'

export default async function CreatorDashboard() {
  const session = await auth()

  const [products, orders, earnings] = await Promise.all([
    prisma.product.findMany({
      where: { creatorId: session!.user.id },
      orderBy: { createdAt: 'desc' },
      take: 5,
    }),
    prisma.order.count({
      where: { creatorId: session!.user.id, paymentStatus: 'PAID' },
    }),
    prisma.order.aggregate({
      where: { creatorId: session!.user.id, paymentStatus: 'PAID' },
      _sum: { creatorEarnings: true },
    }),
  ])

  const pending = products.filter(p => p.status === 'PENDING').length
  const approved = products.filter(p => p.status === 'APPROVED').length

  return (
    <div>
      <div className="mb-8">
        <p className="text-xs font-mono text-orange-400 uppercase tracking-widest mb-1">Creator</p>
        <h1 className="text-3xl font-bold text-white">Welcome, {session!.user.name?.split(' ')[0]}!</h1>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        {[
          { label: 'Total Earnings', value: formatCurrency(earnings._sum.creatorEarnings ?? 0), sub: '90% of sales' },
          { label: 'Total Orders', value: String(orders), sub: 'Paid orders' },
          { label: 'Live Products', value: String(approved), sub: 'Approved' },
          { label: 'Pending', value: String(pending), sub: 'Awaiting approval' },
        ].map(stat => (
          <div key={stat.label} className="bg-[#111] border border-white/8 rounded-2xl p-6">
            <p className="text-xs font-mono text-orange-400 uppercase tracking-widest mb-2">{stat.label}</p>
            <p className="text-3xl font-bold text-white">{stat.value}</p>
            <p className="text-xs text-gray-500 mt-1">{stat.sub}</p>
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between mb-4">
        <h2 className="font-semibold text-white">Recent Products</h2>
        <Link href="/creator/products/new" className="text-sm bg-gradient-to-r from-orange-600 to-orange-400 text-white px-4 py-2 rounded-full font-semibold hover:-translate-y-0.5 transition-all">
          + New Product
        </Link>
      </div>

      {products.length === 0 ? (
        <div className="bg-[#111] border border-white/8 rounded-2xl p-12 text-center">
          <p className="text-4xl mb-3">🚀</p>
          <p className="text-white font-semibold mb-1">No products yet</p>
          <p className="text-gray-500 text-sm mb-4">Create your first product listing</p>
          <Link href="/creator/products/new" className="text-sm text-orange-400 hover:text-orange-300">Create now →</Link>
        </div>
      ) : (
        <div className="space-y-3">
          {products.map(p => (
            <div key={p.id} className="bg-[#111] border border-white/8 rounded-xl p-4 flex items-center gap-4">
              <div className="flex-1">
                <h3 className="font-medium text-white text-sm">{p.title}</h3>
                <p className="text-xs text-gray-500">{formatCurrency(p.price)}</p>
              </div>
              <span className={`text-xs px-2.5 py-1 rounded-full font-semibold uppercase tracking-wide ${
                p.status === 'APPROVED' ? 'bg-green-500/10 text-green-400' :
                p.status === 'PENDING' ? 'bg-yellow-500/10 text-yellow-400' :
                'bg-red-500/10 text-red-400'
              }`}>{p.status}</span>
              {p.status !== 'APPROVED' && (
                <Link href={`/creator/products/${p.id}/edit`} className="text-xs text-gray-500 hover:text-white transition-colors">Edit →</Link>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
