export const dynamic = 'force-dynamic'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import { formatCurrency, formatDate } from '@/lib/utils'
import Badge from '@/components/ui/Badge'
import Image from 'next/image'
import Link from 'next/link'

export default async function OrdersPage() {
  const session = await auth()
  if (!session) redirect('/login')

  const orders = await prisma.order.findMany({
    where: { userId: session.user.id },
    include: { product: { select: { id: true, title: true, images: true } } },
    orderBy: { createdAt: 'desc' },
  })

  return (
    <div className="max-w-4xl mx-auto px-6 py-12">
      <h1 className="text-3xl font-bold text-white mb-8">My Orders</h1>
      {orders.length === 0 ? (
        <div className="text-center py-24">
          <p className="text-5xl mb-4">📋</p>
          <p className="text-lg text-white mb-2">No orders yet</p>
          <p className="text-sm text-gray-500 mb-6">Start shopping to see your orders here</p>
          <Link href="/products" className="bg-gradient-to-r from-orange-600 to-orange-400 text-white px-6 py-3 rounded-full font-semibold">
            Browse Products
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map(order => (
            <div key={order.id} className="bg-[#111] border border-white/8 rounded-2xl p-5 flex gap-4 items-center">
              {order.product.images[0] && (
                <div className="relative w-16 h-16 rounded-xl overflow-hidden shrink-0">
                  <Image src={order.product.images[0]} alt={order.product.title} fill className="object-cover" />
                </div>
              )}
              <div className="flex-1">
                <h3 className="font-semibold text-white">{order.product.title}</h3>
                <p className="text-xs text-gray-500 mt-0.5">{formatDate(order.createdAt)}</p>
              </div>
              <div className="text-right">
                <p className="font-bold text-orange-400">{formatCurrency(order.totalAmount)}</p>
                <Badge variant={order.paymentStatus.toLowerCase() as 'paid' | 'pending' | 'failed'} className="mt-1">
                  {order.paymentStatus}
                </Badge>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
