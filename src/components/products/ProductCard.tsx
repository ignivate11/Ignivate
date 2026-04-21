import Image from 'next/image'
import Link from 'next/link'
import { formatCurrency } from '@/lib/utils'

interface Product {
  id: string
  title: string
  description: string
  price: number
  images: string[]
  category: string
  saleCategory?: string
  preorderPrice?: number | null
  fundingGoal?: number | null
  currentFunding?: number | null
  creator: { id: string; name: string }
}

export default function ProductCard({ product }: { product: Product }) {
  const isPreorder = product.saleCategory === 'PREORDER'
  const displayPrice = isPreorder && product.preorderPrice ? product.preorderPrice : product.price
  const fundingPct = isPreorder && product.fundingGoal && product.fundingGoal > 0
    ? Math.min(100, Math.round(((product.currentFunding || 0) / product.fundingGoal) * 100))
    : null

  return (
    <Link href={`/products/${product.id}`} className="group block bg-[#111] border border-white/8 rounded-2xl overflow-hidden hover:border-orange-500/30 hover:-translate-y-1 transition-all duration-300">
      <div className="relative h-48 bg-white/5">
        {product.images[0] ? (
          <Image src={product.images[0]} alt={product.title} fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-4xl">📦</div>
        )}
        {/* Badge */}
        <div className="absolute top-3 left-3">
          {isPreorder ? (
            <span className="flex items-center gap-1 bg-amber-500/90 text-black text-xs font-bold px-2.5 py-1 rounded-full">
              🚀 PRE-ORDER
            </span>
          ) : (
            <span className="flex items-center gap-1 bg-green-500/80 text-black text-xs font-bold px-2.5 py-1 rounded-full">
              ✅ READY
            </span>
          )}
        </div>
      </div>

      <div className="p-4 space-y-3">
        <div>
          <p className="text-xs text-gray-500 mb-1">{product.category} · by {product.creator.name}</p>
          <h3 className="font-semibold text-white text-sm leading-snug line-clamp-2 group-hover:text-orange-300 transition-colors">
            {product.title}
          </h3>
          <p className="text-xs text-gray-500 mt-1.5 line-clamp-2 leading-relaxed">{product.description}</p>
        </div>

        {/* Funding progress for preorders */}
        {fundingPct !== null && (
          <div className="space-y-1.5">
            <div className="relative h-2 bg-white/8 rounded-full overflow-hidden">
              <div
                className="absolute left-0 top-0 h-full rounded-full bg-gradient-to-r from-orange-600 to-amber-400"
                style={{ width: `${fundingPct}%` }}
              />
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-orange-400 font-semibold">{fundingPct}% funded</span>
              <span className="text-gray-500">{formatCurrency(product.currentFunding || 0)}</span>
            </div>
          </div>
        )}

        <div className="flex items-center justify-between pt-1 border-t border-white/5">
          <div>
            {isPreorder && product.preorderPrice ? (
              <div className="flex items-baseline gap-2">
                <span className="font-bold text-orange-400">{formatCurrency(product.preorderPrice)}</span>
                <span className="text-xs text-gray-600 line-through">{formatCurrency(product.price)}</span>
              </div>
            ) : (
              <span className="font-bold text-orange-400">{formatCurrency(displayPrice)}</span>
            )}
          </div>
          <span className="text-xs text-orange-400 font-semibold group-hover:translate-x-1 transition-transform">
            {isPreorder ? 'Pre-order →' : 'View →'}
          </span>
        </div>
      </div>
    </Link>
  )
}
