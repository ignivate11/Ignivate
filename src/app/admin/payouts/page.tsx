export const dynamic = 'force-dynamic'
import { prisma } from '@/lib/prisma'
import { formatCurrency, formatDate } from '@/lib/utils'
import PayoutActions from './PayoutActions'

export default async function AdminPayoutsPage() {
  // Get pending earnings per creator (paid orders not yet paid out)
  const paidOrders = await prisma.order.findMany({
    where: { paymentStatus: 'PAID' },
    select: {
      id: true, creatorId: true, creatorEarnings: true,
      totalAmount: true, createdAt: true, razorpayOrderId: true,
      product: { select: { title: true } },
    },
    orderBy: { createdAt: 'desc' },
  })

  const existingPayouts = await prisma.payout.findMany({
    select: { ordersIncluded: true, status: true },
  })
  const paidOutOrderIds = new Set(existingPayouts.flatMap(p => p.ordersIncluded))

  // Group pending orders by creator
  const pendingByCreator: Record<string, {
    creatorId: string
    totalEarnings: number
    orderIds: string[]
    razorpayOrderIds: string[]
    orders: Array<{ id: string; product: string; amount: number; date: Date }>
  }> = {}

  for (const order of paidOrders) {
    if (paidOutOrderIds.has(order.razorpayOrderId ?? '')) continue // already paid out
    if (!pendingByCreator[order.creatorId]) {
      pendingByCreator[order.creatorId] = {
        creatorId: order.creatorId,
        totalEarnings: 0,
        orderIds: [],
        razorpayOrderIds: [],
        orders: [],
      }
    }
    pendingByCreator[order.creatorId].totalEarnings += order.creatorEarnings
    pendingByCreator[order.creatorId].orderIds.push(order.id)
    pendingByCreator[order.creatorId].razorpayOrderIds.push(order.razorpayOrderId ?? '')
    pendingByCreator[order.creatorId].orders.push({
      id: order.id,
      product: order.product.title,
      amount: order.creatorEarnings,
      date: order.createdAt,
    })
  }

  const creatorIds = Object.keys(pendingByCreator)
  const creators = await prisma.user.findMany({
    where: { id: { in: creatorIds } },
    select: { id: true, name: true, email: true, phone: true },
  })
  const creatorMap = Object.fromEntries(creators.map(c => [c.id, c]))

  // Completed payouts history
  const completedPayouts = await prisma.payout.findMany({
    where: { status: 'PAID' },
    include: { creator: { select: { name: true, email: true } } },
    orderBy: { paidAt: 'desc' },
    take: 20,
  })

  const pendingGroups = Object.values(pendingByCreator)
  const totalPending = pendingGroups.reduce((s, g) => s + g.totalEarnings, 0)

  return (
    <div>
      <div className="mb-8">
        <p className="text-xs font-mono text-orange-400 uppercase tracking-widest mb-1">Admin</p>
        <h1 className="text-3xl font-bold text-white">Creator Payouts</h1>
        <p className="text-gray-500 text-sm mt-1">Manual payout tracking — money collected in platform account</p>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <div className="bg-[#111] border border-orange-500/20 rounded-2xl p-5">
          <p className="text-xs font-mono text-orange-400 uppercase tracking-widest mb-2">Total Pending Payouts</p>
          <p className="text-3xl font-bold text-orange-400">{formatCurrency(totalPending)}</p>
          <p className="text-xs text-gray-500 mt-1">Owed to {pendingGroups.length} creator{pendingGroups.length !== 1 ? 's' : ''}</p>
        </div>
        <div className="bg-[#111] border border-white/8 rounded-2xl p-5">
          <p className="text-xs font-mono text-orange-400 uppercase tracking-widest mb-2">Paid Out</p>
          <p className="text-3xl font-bold text-white">{formatCurrency(completedPayouts.reduce((s, p) => s + p.amount, 0))}</p>
          <p className="text-xs text-gray-500 mt-1">{completedPayouts.length} payouts completed</p>
        </div>
        <div className="bg-[#111] border border-white/8 rounded-2xl p-5">
          <p className="text-xs font-mono text-orange-400 uppercase tracking-widest mb-2">How Payouts Work</p>
          <p className="text-xs text-gray-400 leading-relaxed mt-1">
            Money sits in the platform Razorpay account. Transfer manually via bank/UPI, then click "Mark as Paid" here.
          </p>
        </div>
      </div>

      {/* Pending payouts */}
      <div className="bg-[#111] border border-white/8 rounded-2xl overflow-hidden mb-8">
        <div className="px-6 py-4 border-b border-white/8">
          <h2 className="font-semibold text-white">Pending Payouts</h2>
          <p className="text-xs text-gray-500 mt-0.5">Transfer these amounts to creators, then mark as paid</p>
        </div>

        {pendingGroups.length === 0 ? (
          <div className="p-12 text-center">
            <p className="text-3xl mb-2">✅</p>
            <p className="text-gray-500">All creators have been paid out</p>
          </div>
        ) : (
          <div className="divide-y divide-white/5">
            {pendingGroups.map(group => {
              const creator = creatorMap[group.creatorId]
              return (
                <div key={group.creatorId} className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-500 to-amber-400 flex items-center justify-center text-white font-bold text-sm shrink-0">
                      {creator?.name?.charAt(0) ?? '?'}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <p className="font-semibold text-white">{creator?.name ?? 'Unknown Creator'}</p>
                          <p className="text-xs text-gray-500">{creator?.email}</p>
                          {creator?.phone && <p className="text-xs text-gray-500">📞 {creator.phone}</p>}
                        </div>
                        <div className="text-right">
                          <p className="text-2xl font-bold text-green-400">{formatCurrency(group.totalEarnings)}</p>
                          <p className="text-xs text-gray-500">{group.orders.length} order{group.orders.length !== 1 ? 's' : ''}</p>
                        </div>
                      </div>

                      {/* Order breakdown */}
                      <div className="bg-white/3 rounded-xl p-3 mb-4 space-y-1.5">
                        {group.orders.map(o => (
                          <div key={o.id} className="flex justify-between text-xs">
                            <span className="text-gray-400 truncate max-w-[200px]">{o.product}</span>
                            <span className="text-green-400 font-semibold ml-4">{formatCurrency(o.amount)}</span>
                          </div>
                        ))}
                      </div>

                      <PayoutActions
                        creatorId={group.creatorId}
                        amount={group.totalEarnings}
                        razorpayOrderIds={group.razorpayOrderIds}
                      />
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Payout history */}
      {completedPayouts.length > 0 && (
        <div className="bg-[#111] border border-white/8 rounded-2xl overflow-hidden">
          <div className="px-6 py-4 border-b border-white/8">
            <h2 className="font-semibold text-white">Payout History</h2>
          </div>
          <div className="divide-y divide-white/4">
            {completedPayouts.map(payout => (
              <div key={payout.id} className="px-6 py-4 flex items-center gap-4">
                <div className="flex-1">
                  <p className="font-medium text-white">{payout.creator.name}</p>
                  <p className="text-xs text-gray-500">{payout.creator.email}</p>
                  {payout.note && <p className="text-xs text-gray-600 mt-0.5 italic">{payout.note}</p>}
                </div>
                <div className="text-right">
                  <p className="font-bold text-green-400">{formatCurrency(payout.amount)}</p>
                  <p className="text-xs text-gray-500">Paid {payout.paidAt ? formatDate(payout.paidAt) : '—'}</p>
                </div>
                <span className="text-xs bg-green-500/10 text-green-400 border border-green-500/20 px-2.5 py-1 rounded-full font-semibold">
                  PAID
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
