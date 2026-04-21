export const dynamic = 'force-dynamic'
import { prisma } from '@/lib/prisma'
import { formatCurrency, formatDate } from '@/lib/utils'
import { CustomerActions } from './CustomerActions'

export default async function CustomersPage() {
  const customers = await prisma.user.findMany({
    where: { role: 'CUSTOMER' },
    include: { orders: { where: { paymentStatus: 'PAID' }, select: { totalAmount: true } } },
    orderBy: { createdAt: 'desc' },
  })

  const totalSpend = customers.reduce((sum, c) => sum + c.orders.reduce((s, o) => s + o.totalAmount, 0), 0)

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <p className="text-xs font-mono text-orange-400 uppercase tracking-widest mb-1">Admin</p>
          <h1 className="text-3xl font-bold text-white">Customers</h1>
        </div>
        <div className="flex gap-4">
          <div className="bg-[#111] border border-white/8 rounded-xl px-5 py-3 text-center">
            <p className="text-xs font-mono text-gray-500 uppercase tracking-widest">Total</p>
            <p className="text-xl font-bold text-white">{customers.length}</p>
          </div>
          <div className="bg-[#111] border border-white/8 rounded-xl px-5 py-3 text-center">
            <p className="text-xs font-mono text-gray-500 uppercase tracking-widest">Total Spend</p>
            <p className="text-xl font-bold text-white">{formatCurrency(totalSpend)}</p>
          </div>
        </div>
      </div>

      {customers.length === 0 ? (
        <div className="bg-[#111] border border-white/8 rounded-2xl p-16 text-center">
          <p className="text-gray-500 text-sm">No customers yet</p>
        </div>
      ) : (
        <div className="space-y-3">
          {customers.map(customer => {
            const spent = customer.orders.reduce((s, o) => s + o.totalAmount, 0)
            return (
              <div key={customer.id} className="bg-[#111] border border-white/8 rounded-2xl p-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-orange-500/15 border border-orange-500/20 flex items-center justify-center text-orange-400 font-bold text-sm flex-shrink-0">
                      {customer.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-semibold text-white text-sm">{customer.name}</p>
                      <p className="text-xs text-gray-500">{customer.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-6 text-right">
                    <div><p className="text-xs text-gray-500 font-mono uppercase tracking-widest">Purchases</p><p className="text-sm font-semibold text-white">{customer.orders.length}</p></div>
                    <div><p className="text-xs text-gray-500 font-mono uppercase tracking-widest">Total Spend</p><p className="text-sm font-semibold text-white">{formatCurrency(spent)}</p></div>
                    <div><p className="text-xs text-gray-500 font-mono uppercase tracking-widest">Joined</p><p className="text-sm font-semibold text-white">{formatDate(customer.createdAt)}</p></div>
                    <span className={`px-2.5 py-1 rounded-full text-xs font-mono font-semibold ${customer.status === 'ACTIVE' ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'}`}>{customer.status}</span>
                  </div>
                </div>
                <div className="mt-4"><CustomerActions id={customer.id} name={customer.name} /></div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
