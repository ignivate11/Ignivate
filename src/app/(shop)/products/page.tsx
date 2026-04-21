export const dynamic = 'force-dynamic'
import { prisma } from '@/lib/prisma'
import ProductCard from '@/components/products/ProductCard'
import { PRODUCT_CATEGORIES } from '@/lib/constants'
import Link from 'next/link'

interface SearchParams { category?: string; search?: string; page?: string }

export default async function ProductsPage({ searchParams }: { searchParams: SearchParams }) {
  const { category, search, page = '1' } = searchParams
  const pageNum = parseInt(page)
  const limit = 12
  const where = {
    status: 'APPROVED' as const,
    ...(category && { category }),
    ...(search && { OR: [{ title: { contains: search, mode: 'insensitive' as const } }, { description: { contains: search, mode: 'insensitive' as const } }] }),
  }
  const [products, total] = await Promise.all([
    prisma.product.findMany({ where, include: { creator: { select: { id: true, name: true } } }, orderBy: { createdAt: 'desc' }, skip: (pageNum - 1) * limit, take: limit }),
    prisma.product.count({ where }),
  ])
  const totalPages = Math.ceil(total / limit)

  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      <div className="mb-8">
        <p className="text-xs font-mono text-orange-400 uppercase tracking-widest mb-2">Marketplace</p>
        <h1 className="text-4xl font-bold text-white mb-4">Products</h1>
        <div className="flex flex-col sm:flex-row gap-4">
          <form className="flex gap-2 flex-1">
            <input type="text" name="search" defaultValue={search} placeholder="Search products..."
              className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white placeholder-gray-500 text-sm outline-none focus:border-orange-500 transition-colors" />
            <button type="submit" className="bg-orange-500 text-white px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-orange-400 transition-colors">Search</button>
          </form>
          <div className="flex gap-2 flex-wrap">
            <Link href="/products" className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${!category ? 'bg-orange-500 text-white' : 'border border-white/15 text-gray-400 hover:text-white'}`}>All</Link>
            {PRODUCT_CATEGORIES.slice(0, 6).map(cat => (
              <Link key={cat} href={`/products?category=${cat}`} className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${category === cat ? 'bg-orange-500 text-white' : 'border border-white/15 text-gray-400 hover:text-white'}`}>{cat}</Link>
            ))}
          </div>
        </div>
      </div>
      {products.length === 0 ? (
        <div className="text-center py-24 text-gray-500"><p className="text-5xl mb-4">📦</p><p className="text-lg">No products found</p><p className="text-sm mt-1">Try a different search or category</p></div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {products.map((product: { id: string; title: string; description: string; price: number; images: string[]; category: string; creator: { id: string; name: string } }) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
          {totalPages > 1 && (
            <div className="flex justify-center gap-2 mt-10">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                <Link key={p} href={`/products?page=${p}${category ? `&category=${category}` : ''}${search ? `&search=${search}` : ''}`}
                  className={`w-9 h-9 flex items-center justify-center rounded-xl text-sm font-semibold transition-all ${p === pageNum ? 'bg-orange-500 text-white' : 'border border-white/15 text-gray-400 hover:text-white'}`}>{p}</Link>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  )
}
