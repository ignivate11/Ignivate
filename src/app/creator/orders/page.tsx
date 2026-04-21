export const dynamic = 'force-dynamic'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { formatCurrency, formatDate } from '@/lib/utils'
import Badge from '@/components/ui/Badge'

export default async function CreatorOrdersPage() {
  const session = await auth()
  const orders = await prisma.order.findMany({
    where: { creatorId: session!.user.id },
    include: {
      product: { select: { title: true } },
      user: { select: { name: true, email: true } },
    },
    orderBy: { createdAt: 'desc' },
  })

  const totalEarnings = orders
    .filter(o => o.paymentStatus === 'PAID')
    .reduce((sum, o) => sum + o.creatorEarnings, 0)

  return (
    <div>
      <div className="mb-8">
        <p className="text-xs font-mono text-orange-400 uppercase tracking-widest mb-1">Creator</p>
        <h1 className="text-3xl font-bold text-white">Orders</h1>
        <p className="text-gray-500 text-sm mt-1">
          Total earned: <span className="text-orange-400 font-semibold">{formatCurrency(totalEarnings)}</span>
        </p>
      </div>

      {orders.length === 0 ? (
        <div className="text-center py-16 text-gray-500">
          <p className="text-5xl mb-3">📋</p>
          <p>No orders yet. Get your products approved to start selling!</p>
        </div>
      ) : (
        <div className="bg-[#111] border border-white/8 rounded-2xl overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/8">
                {['Product', 'Customer', 'Date', 'Amount', 'Your Cut', 'Status'].map((h, i) => (
                  <th key={h} className={`text-xs text-gray-500 font-mono uppercase tracking-widest px-5 py-3 ${i >= 3 ? 'text-right' : 'text-left'}`}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {orders.map(order => (
                <tr key={order.id} className="border-b border-white/5 last:border-0 hover:bg-white/[0.02] transition-colors">
                  <td className="px-5 py-3 text-sm text-white font-medium">{order.product.title}</td>
                  <td className="px-5 py-3 text-sm text-gray-400">{order.user.name}</td>
                  <td className="px-5 py-3 text-sm text-gray-500">{formatDate(order.createdAt)}</td>
                  <td className="px-5 py-3 text-sm text-right text-gray-300">{formatCurrency(order.totalAmount)}</td>
                  <td className="px-5 py-3 text-sm text-right font-semibold text-orange-400">{formatCurrency(order.creatorEarnings)}</td>
                  <td className="px-5 py-3 text-right">
                    <Badge variant={order.paymentStatus.toLowerCase() as 'paid' | 'pending' | 'failed'}>{order.paymentStatus}</Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
