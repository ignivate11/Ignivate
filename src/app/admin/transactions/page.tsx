export const dynamic = 'force-dynamic'
import { prisma } from '@/lib/prisma'
import { formatCurrency, formatDate } from '@/lib/utils'
import Link from 'next/link'

const STATUS_STYLES: Record<string, string> = {
  PAID:    'bg-green-500/10 text-green-400 border-green-500/20',
  PENDING: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
  FAILED:  'bg-red-500/10 text-red-400 border-red-500/20',
  REFUNDED:'bg-blue-500/10 text-blue-400 border-blue-500/20',
}

export default async function AdminTransactionsPage() {
  const [orders, totals] = await Promise.all([
    prisma.order.findMany({
      include: {
        user: { select: { name: true, email: true } },
        product: { select: { title: true, saleCategory: true } },
      },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.order.aggregate({
      where: { paymentStatus: 'PAID' },
      _sum: { totalAmount: true, platformFee: true, creatorEarnings: true },
      _count: true,
    }),
  ])

  const creatorBreakdown = await prisma.order.groupBy({
    by: ['creatorId'],
    where: { paymentStatus: 'PAID' },
    _sum: { totalAmount: true, creatorEarnings: true },
    _count: true,
  })
  const creatorIds = creatorBreakdown.map(c => c.creatorId)
  const creators = await prisma.user.findMany({
    where: { id: { in: creatorIds } },
    select: { id: true, name: true, email: true },
  })
  const creatorMap = Object.fromEntries(creators.map(c => [c.id, c]))

  return (
    <div>
      <div className="mb-8">
        <p className="text-xs font-mono text-orange-400 uppercase tracking-widest mb-1">Admin</p>
        <h1 className="text-3xl font-bold text-white">Transactions</h1>
        <p className="text-gray-500 text-sm mt-1">{orders.length} total orders</p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Total Revenue', value: formatCurrency(totals._sum.totalAmount ?? 0), sub: `${totals._count} paid orders` },
          { label: 'Platform Commission', value: formatCurrency(totals._sum.platformFee ?? 0), sub: '10% of gross' },
          { label: 'Creator Earnings', value: formatCurrency(totals._sum.creatorEarnings ?? 0), sub: '90% of gross — awaiting payout' },
          { label: 'Pending Orders', value: String(orders.filter(o => o.paymentStatus === 'PENDING').length), sub: 'Not yet paid' },
        ].map(s => (
          <div key={s.label} className="bg-[#111] border border-white/8 rounded-2xl p-5">
            <p className="text-xs font-mono text-orange-400 uppercase tracking-widest mb-2">{s.label}</p>
            <p className="text-2xl font-bold text-white">{s.value}</p>
            <p className="text-xs text-gray-500 mt-1">{s.sub}</p>
          </div>
        ))}
      </div>

      {/* Full transaction table */}
      <div className="bg-[#111] border border-white/8 rounded-2xl overflow-hidden mb-8">
        <div className="px-6 py-4 border-b border-white/8 flex items-center justify-between">
          <h2 className="font-semibold text-white">All Transactions</h2>
          <Link href="/admin/payouts" className="text-xs text-orange-400 hover:text-orange-300 border border-orange-500/20 px-3 py-1.5 rounded-full transition-colors">
            Manage Payouts →
          </Link>
        </div>

        {orders.length === 0 ? (
          <div className="p-12 text-center text-gray-500">No transactions yet</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/5">
                  {['Customer', 'Product', 'Amount', 'Platform Fee', 'Creator Earnings', 'Status', 'Date'].map(h => (
                    <th key={h} className="text-left px-6 py-3 text-xs font-mono text-gray-500 uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {orders.map(order => (
                  <tr key={order.id} className="border-b border-white/4 hover:bg-white/2 transition-colors">
                    <td className="px-6 py-4">
                      <p className="font-medium text-white">{order.user.name}</p>
                      <p className="text-xs text-gray-500">{order.user.email}</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-white">{order.product.title}</p>
                      <span className={`inline-block text-xs px-1.5 py-0.5 rounded-full ${order.product.saleCategory === 'PREORDER' ? 'bg-amber-500/10 text-amber-400' : 'bg-green-500/10 text-green-400'}`}>
                        {order.product.saleCategory}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-bold text-orange-400">{formatCurrency(order.totalAmount)}</td>
                    <td className="px-6 py-4 text-red-400">{formatCurrency(order.platformFee)}</td>
                    <td className="px-6 py-4 text-green-400">{formatCurrency(order.creatorEarnings)}</td>
                    <td className="px-6 py-4">
                      <span className={`text-xs px-2.5 py-1 rounded-full border font-semibold ${STATUS_STYLES[order.paymentStatus] ?? 'bg-gray-500/10 text-gray-400'}`}>
                        {order.paymentStatus}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-500 text-xs whitespace-nowrap">{formatDate(order.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Creator breakdown */}
      {creatorBreakdown.length > 0 && (
        <div className="bg-[#111] border border-white/8 rounded-2xl overflow-hidden">
          <div className="px-6 py-4 border-b border-white/8">
            <h2 className="font-semibold text-white">Earnings by Creator</h2>
          </div>
          <div className="divide-y divide-white/4">
            {creatorBreakdown.map(cb => {
              const creator = creatorMap[cb.creatorId]
              return (
                <div key={cb.creatorId} className="px-6 py-4 flex items-center gap-4">
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-orange-500 to-amber-400 flex items-center justify-center text-white font-bold text-sm shrink-0">
                    {creator?.name?.charAt(0) ?? '?'}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-white">{creator?.name ?? 'Unknown'}</p>
                    <p className="text-xs text-gray-500">{creator?.email} · {cb._count} orders</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-green-400">{formatCurrency(cb._sum.creatorEarnings ?? 0)}</p>
                    <p className="text-xs text-gray-500">gross: {formatCurrency(cb._sum.totalAmount ?? 0)}</p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
