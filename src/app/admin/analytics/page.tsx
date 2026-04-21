export const dynamic = 'force-dynamic'
import { prisma } from '@/lib/prisma'
import { formatCurrency, formatDate } from '@/lib/utils'

export default async function AnalyticsPage() {
  const [revenue, recentOrders] = await Promise.all([
    prisma.order.aggregate({
      where: { paymentStatus: 'PAID' },
      _sum: { totalAmount: true, platformFee: true, creatorEarnings: true },
      _count: true,
    }),
    prisma.order.findMany({
      where: { paymentStatus: 'PAID' },
      include: {
        product: { select: { title: true } },
        user: { select: { name: true, email: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: 10,
    }),
  ])

  return (
    <div>
      <div className="mb-8">
        <p className="text-xs font-mono text-orange-400 uppercase tracking-widest mb-1">Admin</p>
        <h1 className="text-3xl font-bold text-white">Analytics</h1>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-8">
        {[
          { label: 'Total Revenue', value: formatCurrency(revenue._sum.totalAmount ?? 0), sub: `${revenue._count} paid orders` },
          { label: 'Platform Commission', value: formatCurrency(revenue._sum.platformFee ?? 0), sub: '10% of total' },
          { label: 'Creator Earnings', value: formatCurrency(revenue._sum.creatorEarnings ?? 0), sub: '90% of total' },
        ].map(stat => (
          <div key={stat.label} className="bg-[#111] border border-white/8 rounded-2xl p-6">
            <p className="text-xs font-mono text-orange-400 uppercase tracking-widest mb-2">{stat.label}</p>
            <p className="text-3xl font-bold text-white">{stat.value}</p>
            <p className="text-xs text-gray-500 mt-1">{stat.sub}</p>
          </div>
        ))}
      </div>

      <div className="bg-[#111] border border-white/8 rounded-2xl p-6">
        <h2 className="font-semibold text-white mb-4">Recent Transactions</h2>
        {recentOrders.length === 0 ? (
          <p className="text-gray-500 text-sm">No transactions yet</p>
        ) : (
          <div className="space-y-3">
            {recentOrders.map(order => (
              <div key={order.id} className="flex items-center justify-between py-2.5 border-b border-white/5 last:border-0">
                <div>
                  <p className="text-sm font-medium text-white">{order.product.title}</p>
                  <p className="text-xs text-gray-500">{order.user.name} · {formatDate(order.createdAt)}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-orange-400">{formatCurrency(order.totalAmount)}</p>
                  <p className="text-xs text-gray-500">Fee: {formatCurrency(order.platformFee)}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
