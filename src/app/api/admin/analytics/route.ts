import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const session = await auth()
  if (!session || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const [
    totalCreators, totalCustomers, totalProducts, pendingProducts, totalOrders, revenueData,
  ] = await Promise.all([
    prisma.user.count({ where: { role: 'CREATOR' } }),
    prisma.user.count({ where: { role: 'CUSTOMER' } }),
    prisma.product.count({ where: { status: 'APPROVED' } }),
    prisma.product.count({ where: { status: 'PENDING' } }),
    prisma.order.count({ where: { paymentStatus: 'PAID' } }),
    prisma.order.aggregate({
      where: { paymentStatus: 'PAID' },
      _sum: { totalAmount: true, platformFee: true, creatorEarnings: true },
    }),
  ])

  return NextResponse.json({
    totalCreators, totalCustomers, totalProducts, pendingProducts, totalOrders,
    totalRevenue: revenueData._sum.totalAmount ?? 0,
    platformCommission: revenueData._sum.platformFee ?? 0,
    totalCreatorEarnings: revenueData._sum.creatorEarnings ?? 0,
  })
}
