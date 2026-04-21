'use client'
import Image from 'next/image'
import Link from 'next/link'
import { formatCurrency } from '@/lib/utils'
import { useCart } from '@/hooks/useCart'
import { useSession } from 'next-auth/react'
import toast from 'react-hot-toast'

interface ProductCardProps {
  product: {
    id: string
    title: string
    description: string
    price: number
    images: string[]
    category: string
    creator: { name: string }
  }
}

export default function ProductCard({ product }: ProductCardProps) {
  const { data: session } = useSession()
  const addItem = useCart(s => s.addItem)

  const handleAddToCart = () => {
    if (!session) {
      toast.error('Please login to add to cart')
      return
    }
    if (session.user.role !== 'CUSTOMER') {
      toast.error('Only customers can purchase products')
      return
    }
    addItem({
      productId: product.id,
      title: product.title,
      price: product.price,
      image: product.images[0] || '',
      creatorName: product.creator.name,
      quantity: 1,
    })
    toast.success('Added to cart!')
  }

  return (
    <div className="group bg-[#111] border border-white/8 rounded-2xl overflow-hidden hover:border-orange-500/30 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-orange-500/10">
      <Link href={`/products/${product.id}`}>
        <div className="relative h-48 bg-[#1a1a1a] overflow-hidden">
          {product.images[0] ? (
            <Image
              src={product.images[0]}
              alt={product.title}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-500"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-4xl">📦</span>
            </div>
          )}
          <div className="absolute top-3 left-3">
            <span className="text-xs bg-orange-500/10 text-orange-300 border border-orange-500/20 px-2 py-0.5 rounded-full font-mono uppercase tracking-wide">
              {product.category}
            </span>
          </div>
        </div>
      </Link>

      <div className="p-4">
        <Link href={`/products/${product.id}`}>
          <h3 className="font-semibold text-white mb-1 group-hover:text-orange-300 transition-colors line-clamp-1">
            {product.title}
          </h3>
          <p className="text-xs text-gray-500 mb-3 line-clamp-2">{product.description}</p>
        </Link>

        <div className="flex items-center justify-between">
          <div>
            <p className="text-lg font-bold text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-amber-400">
              {formatCurrency(product.price)}
            </p>
            <p className="text-xs text-gray-500">by {product.creator.name}</p>
          </div>
          <button
            onClick={handleAddToCart}
            className="bg-gradient-to-r from-orange-600 to-orange-400 text-white text-xs font-semibold px-3 py-2 rounded-full hover:-translate-y-0.5 transition-all shadow-md shadow-orange-500/20"
          >
            Add to Cart
          </button>
        </div>
      </div>
    </div>
  )
}
