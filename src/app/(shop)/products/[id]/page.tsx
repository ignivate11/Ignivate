export const dynamic = 'force-dynamic'
import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import { auth } from '@/auth'
import Image from 'next/image'
import { formatCurrency, formatDate } from '@/lib/utils'
import AddToCartButton from './AddToCartButton'

export async function generateMetadata({ params }: { params: { id: string } }) {
  const product = await prisma.product.findUnique({ where: { id: params.id } })
  return { title: product ? `${product.title} — Ignivate` : 'Product Not Found' }
}

export default async function ProductDetailPage({ params }: { params: { id: string } }) {
  const [product, session] = await Promise.all([
    prisma.product.findUnique({
      where: { id: params.id },
      include: { creator: { select: { id: true, name: true } } },
    }),
    auth(),
  ])

  if (!product || product.status !== 'APPROVED') notFound()

  return (
    <div className="max-w-6xl mx-auto px-6 py-12">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        <div className="space-y-4">
          {product.images[0] && (
            <div className="relative h-96 rounded-2xl overflow-hidden bg-[#111]">
              <Image src={product.images[0]} alt={product.title} fill className="object-cover" />
            </div>
          )}
          <div className="grid grid-cols-4 gap-2">
            {product.images.slice(1).map((img: string, i: number) => (
              <div key={i} className="relative h-20 rounded-xl overflow-hidden bg-[#111]">
                <Image src={img} alt={`${product.title} ${i + 2}`} fill className="object-cover" />
              </div>
            ))}
          </div>
        </div>

        <div>
          <span className="text-xs font-mono text-orange-400 uppercase tracking-widest">{product.category}</span>
          <h1 className="text-3xl font-bold text-white mt-2 mb-3">{product.title}</h1>
          <p className="text-gray-500 text-sm mb-6">by {product.creator.name} · {formatDate(product.createdAt)}</p>

          <div className="bg-[#111] border border-white/8 rounded-2xl p-6 mb-6">
            <p className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-amber-400 mb-4">
              {formatCurrency(product.price)}
            </p>
            <AddToCartButton product={product} session={session} />
          </div>

          <div className="bg-[#111] border border-white/8 rounded-2xl p-6">
            <h3 className="font-semibold text-white mb-3">About this product</h3>
            <p className="text-gray-400 text-sm leading-relaxed whitespace-pre-wrap">{product.description}</p>
          </div>
        </div>
      </div>
    </div>
  )
}
