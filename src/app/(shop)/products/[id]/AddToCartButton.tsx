'use client'
import { useCart } from '@/hooks/useCart'
import toast from 'react-hot-toast'
import Link from 'next/link'

interface Props {
  product: { id: string; title: string; price: number; images: string[]; creator: { name: string } }
  session: { user: { role: string } } | null
}

export default function AddToCartButton({ product, session }: Props) {
  const addItem = useCart(s => s.addItem)

  if (!session) {
    return (
      <Link href="/login" className="block w-full text-center bg-gradient-to-r from-orange-600 to-orange-400 text-white font-semibold py-3.5 rounded-xl hover:-translate-y-0.5 transition-all shadow-lg shadow-orange-500/25">
        Login to Purchase
      </Link>
    )
  }

  if (session.user.role !== 'CUSTOMER') {
    return <p className="text-center text-sm text-gray-500 py-3.5">Only customers can purchase products</p>
  }

  return (
    <button
      onClick={() => {
        addItem({ productId: product.id, title: product.title, price: product.price, image: product.images[0] || '', creatorName: product.creator.name, quantity: 1 })
        toast.success('Added to cart!')
      }}
      className="w-full bg-gradient-to-r from-orange-600 to-orange-400 text-white font-semibold py-3.5 rounded-xl hover:-translate-y-0.5 transition-all shadow-lg shadow-orange-500/25"
    >
      Add to Cart
    </button>
  )
}
