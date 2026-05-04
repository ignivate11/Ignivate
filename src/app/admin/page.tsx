export const dynamic = 'force-dynamic'
import { prisma } from '@/lib/prisma'
import { formatCurrency } from '@/lib/utils'
import Link from 'next/link'

async function getStats() {
  const [totalCreators, totalCustomers, totalProducts, pendingProducts, revenueData, totalOrders, readyProducts, preorderProducts] =
    await Promise.all([
      prisma.user.count({ where: { role: 'CREATOR' } }),
      prisma.user.count({ where: { role: 'CUSTOMER' } }),
      prisma.product.count({ where: { status: 'APPROVED' } }),
      prisma.product.count({ where: { status: 'PENDING' } }),
      prisma.order.aggregate({ where: { paymentStatus: 'PAID' }, _sum: { totalAmount: true, platformFee: true } }),
      prisma.order.count({ where: { paymentStatus: 'PAID' } }),
      prisma.product.count({ where: { status: 'APPROVED', saleCategory: 'READY' } }),
      prisma.product.count({ where: { status: 'APPROVED', saleCategory: 'PREORDER' } }),
    ])
  return {
    totalCreators, totalCustomers, totalProducts, pendingProducts, totalOrders,
    totalRevenue: revenueData._sum.totalAmount ?? 0,
    platformCommission: revenueData._sum.platformFee ?? 0,
    readyProducts, preorderProducts,
  }
}

const StatCard = ({ label, value, sub, href }: { label: string; value: string; sub?: string; href?: string }) => (
  <div className="bg-[#111] border border-white/8 rounded-2xl p-6">
    <p className="text-xs font-mono text-orange-400 uppercase tracking-widest mb-2">{label}</p>
    <p className="text-4xl font-bold text-white">{value}</p>
    {sub && <p className="text-xs text-gray-500 mt-1">{sub}</p>}
    {href && <Link href={href} className="text-xs text-orange-400 hover:text-orange-300 mt-3 block">View all →</Link>}
  </div>
)

export default async function AdminDashboard() {
  const stats = await getStats()
  return (
    <div>
      <div className="flex items-start justify-between mb-8">
        <div>
          <p className="text-xs font-mono text-orange-400 uppercase tracking-widest mb-1">Admin</p>
          <h1 className="text-3xl font-bold text-white">Dashboard</h1>
        </div>
        <Link
          href="/admin/products/new"
          className="bg-gradient-to-r from-orange-600 to-orange-400 text-white px-5 py-2.5 rounded-full font-semibold text-sm hover:-translate-y-0.5 transition-all shadow-lg shadow-orange-500/25"
        >
          + Create Product
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-5">
        <StatCard label="Total Revenue" value={formatCurrency(stats.totalRevenue)} sub={`${stats.totalOrders} orders`} href="/admin/analytics" />
        <StatCard label="Platform Commission" value={formatCurrency(stats.platformCommission)} sub="7% of total revenue" />
        <StatCard label="Creators" value={String(stats.totalCreators)} href="/admin/creators" />
        <StatCard label="Customers" value={String(stats.totalCustomers)} href="/admin/customers" />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-5">
        <StatCard label="Approved Products" value={String(stats.totalProducts)} href="/admin/products" />
        <div className="bg-[#111] border border-orange-500/20 rounded-2xl p-6">
          <p className="text-xs font-mono text-orange-400 uppercase tracking-widest mb-2">Pending Approvals</p>
          <p className="text-4xl font-bold text-orange-400">{stats.pendingProducts}</p>
          <p className="text-xs text-gray-500 mt-1">Products awaiting review</p>
          <Link href="/admin/products" className="text-xs text-orange-400 hover:text-orange-300 mt-3 block">Review now →</Link>
        </div>
        <div className="bg-[#111] border border-white/8 rounded-2xl p-6">
          <p className="text-xs font-mono text-orange-400 uppercase tracking-widest mb-2">Live Products</p>
          <p className="text-4xl font-bold text-white">{stats.readyProducts}</p>
          <p className="text-xs text-gray-500 mt-1">Ready to buy</p>
          <Link href="/admin/products" className="text-xs text-orange-400 hover:text-orange-300 mt-3 block">Manage →</Link>
        </div>
        <div className="bg-[#111] border border-white/8 rounded-2xl p-6">
          <p className="text-xs font-mono text-orange-400 uppercase tracking-widest mb-2">Pre-order Products</p>
          <p className="text-4xl font-bold text-white">{stats.preorderProducts}</p>
          <p className="text-xs text-gray-500 mt-1">Funding in progress</p>
          <Link href="/admin/products" className="text-xs text-orange-400 hover:text-orange-300 mt-3 block">Manage →</Link>
        </div>
      </div>
    </div>
  )
}
