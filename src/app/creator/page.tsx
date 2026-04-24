export const dynamic = 'force-dynamic'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { formatCurrency } from '@/lib/utils'
import Link from 'next/link'

export default async function CreatorDashboard() {
  const session = await auth()

  const [products, orderStats, revenueData] = await Promise.all([
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
      _sum: { totalAmount: true, platformFee: true, creatorEarnings: true },
    }),
  ])

  const totalRevenue = revenueData._sum.totalAmount ?? 0
  const platformFee = revenueData._sum.platformFee ?? 0
  const netEarnings = revenueData._sum.creatorEarnings ?? 0
  const pending = products.filter(p => p.status === 'PENDING').length
  const approved = products.filter(p => p.status === 'APPROVED').length

  return (
    <div>
      <div className="mb-8">
        <p className="text-xs font-mono text-orange-400 uppercase tracking-widest mb-1">Creator</p>
        <h1 className="text-3xl font-bold text-white">Welcome, {session!.user.name?.split(' ')[0]}!</h1>
      </div>

      {/* ── Product Stats ─────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-5">
        {[
          { label: 'Live Products', value: String(approved), sub: 'Approved & live' },
          { label: 'Pending', value: String(pending), sub: 'Awaiting approval' },
          { label: 'Total Orders', value: String(orderStats), sub: 'Paid orders' },
          { label: 'Net Earnings', value: formatCurrency(netEarnings), sub: '90% of sales' },
        ].map(stat => (
          <div key={stat.label} className="bg-[#111] border border-white/8 rounded-2xl p-6">
            <p className="text-xs font-mono text-orange-400 uppercase tracking-widest mb-2">{stat.label}</p>
            <p className="text-3xl font-bold text-white">{stat.value}</p>
            <p className="text-xs text-gray-500 mt-1">{stat.sub}</p>
          </div>
        ))}
      </div>

      {/* ── Payment Details ───────────────────────────────────────── */}
      <div className="bg-[#111] border border-white/8 rounded-2xl p-6 mb-8">
        <div className="flex items-center justify-between mb-5">
          <div>
            <p className="text-xs font-mono text-orange-400 uppercase tracking-widest mb-1">Payment Details</p>
            <p className="text-sm text-gray-500">Your earnings breakdown from all paid orders</p>
          </div>
          <Link href="/creator/orders" className="text-xs text-orange-400 hover:text-orange-300 border border-orange-500/20 px-3 py-1.5 rounded-full transition-colors">
            View all orders →
          </Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white/3 border border-white/6 rounded-xl p-4">
            <p className="text-xs text-gray-500 mb-1 font-mono uppercase tracking-wider">Total Revenue</p>
            <p className="text-2xl font-bold text-white">{formatCurrency(totalRevenue)}</p>
            <p className="text-xs text-gray-600 mt-1">Gross from all orders</p>
          </div>
          <div className="bg-white/3 border border-white/6 rounded-xl p-4">
            <p className="text-xs text-gray-500 mb-1 font-mono uppercase tracking-wider">Platform Fee</p>
            <p className="text-2xl font-bold text-red-400">−{formatCurrency(platformFee)}</p>
            <p className="text-xs text-gray-600 mt-1">10% commission</p>
          </div>
          <div className="bg-orange-500/5 border border-orange-500/15 rounded-xl p-4">
            <p className="text-xs text-orange-400 mb-1 font-mono uppercase tracking-wider">Net Earnings</p>
            <p className="text-2xl font-bold text-orange-400">{formatCurrency(netEarnings)}</p>
            <p className="text-xs text-gray-600 mt-1">Your take-home (90%)</p>
          </div>
        </div>
        {totalRevenue === 0 && (
          <p className="text-center text-sm text-gray-600 mt-4">No paid orders yet — get your products approved to start earning!</p>
        )}
      </div>

      {/* ── Recent Products ───────────────────────────────────────── */}
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
              <Link href={`/creator/products/${p.id}/edit`} className="text-xs text-gray-500 hover:text-white transition-colors">Edit →</Link>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
