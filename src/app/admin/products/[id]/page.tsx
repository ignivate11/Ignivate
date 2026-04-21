export const dynamic = 'force-dynamic'
import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import { formatCurrency, formatDate } from '@/lib/utils'
import Image from 'next/image'
import Link from 'next/link'
import ApprovalActions from '../ApprovalActions'

export default async function AdminProductDetailPage({ params }: { params: { id: string } }) {
  const product = await prisma.product.findUnique({
    where: { id: params.id },
    include: { creator: { select: { id: true, name: true, email: true, createdAt: true, status: true } } },
  })

  if (!product) notFound()

  const isPreorder = product.saleCategory === 'PREORDER'
  const fundingPct = isPreorder && product.fundingGoal && product.fundingGoal > 0
    ? Math.min(100, Math.round(((product.currentFunding || 0) / product.fundingGoal) * 100))
    : 0

  const row = (label: string, value: string | null | undefined) =>
    value ? (
      <div className="flex gap-3 py-3 border-b border-white/5 last:border-0">
        <span className="text-xs font-mono text-gray-500 uppercase tracking-widest min-w-[160px] pt-0.5">{label}</span>
        <span className="text-sm text-gray-300 leading-relaxed">{value}</span>
      </div>
    ) : null

  return (
    <div className="max-w-4xl">
      <div className="flex items-center gap-4 mb-8">
        <Link href="/admin/products" className="text-xs text-gray-500 hover:text-white border border-white/10 px-3 py-1.5 rounded-full transition-all">
          ← Back
        </Link>
        <div>
          <p className="text-xs font-mono text-orange-400 uppercase tracking-widest mb-1">Admin · Product Detail</p>
          <h1 className="text-2xl font-bold text-white">{product.title}</h1>
        </div>
        <div className="ml-auto flex items-center gap-3">
          <span className={`text-xs px-3 py-1.5 rounded-full font-semibold border ${
            product.status === 'APPROVED' ? 'bg-green-500/10 text-green-400 border-green-500/20' :
            product.status === 'PENDING' ? 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20' :
            'bg-red-500/10 text-red-400 border-red-500/20'
          }`}>
            {product.status}
          </span>
          {product.status === 'PENDING' && <ApprovalActions productId={product.id} />}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Images */}
        <div className="lg:col-span-1 space-y-3">
          <div className="relative h-56 bg-[#111] rounded-2xl overflow-hidden border border-white/8">
            {product.images[0]
              ? <Image src={product.images[0]} alt={product.title} fill className="object-cover" />
              : <div className="absolute inset-0 flex items-center justify-center text-4xl">📦</div>
            }
            <div className="absolute top-3 left-3">
              <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${isPreorder ? 'bg-amber-500/90 text-black' : 'bg-green-500/80 text-black'}`}>
                {isPreorder ? '🚀 Pre-order' : '✅ Ready'}
              </span>
            </div>
          </div>
          <div className="grid grid-cols-4 gap-2">
            {product.images.slice(1).map((img, i) => (
              <div key={i} className="relative h-14 rounded-xl overflow-hidden bg-[#111] border border-white/8">
                <Image src={img} alt={`Image ${i + 2}`} fill className="object-cover" />
              </div>
            ))}
          </div>

          {/* Creator info */}
          <div className="bg-[#111] border border-white/8 rounded-2xl p-4 space-y-2">
            <p className="text-xs font-mono text-orange-400 uppercase tracking-widest mb-3">Creator</p>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-orange-500 to-amber-400 flex items-center justify-center text-white font-bold text-xs shrink-0">
                {product.creator.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <p className="text-sm font-semibold text-white">{product.creator.name}</p>
                <p className="text-xs text-gray-500">{product.creator.email}</p>
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-2">Joined {formatDate(product.creator.createdAt)}</p>
            <span className={`inline-block text-xs px-2 py-0.5 rounded-full ${product.creator.status === 'ACTIVE' ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'}`}>
              {product.creator.status}
            </span>
          </div>
        </div>

        {/* Details */}
        <div className="lg:col-span-2 space-y-5">
          {/* Pricing */}
          <div className="bg-[#111] border border-white/8 rounded-2xl p-5">
            <p className="text-xs font-mono text-orange-400 uppercase tracking-widest mb-4">Pricing</p>
            <div className="flex gap-6">
              <div>
                <p className="text-xs text-gray-500 mb-1">Full Price</p>
                <p className="text-2xl font-bold text-white">{formatCurrency(product.price)}</p>
              </div>
              {isPreorder && product.preorderPrice && (
                <div>
                  <p className="text-xs text-gray-500 mb-1">Pre-order Price</p>
                  <p className="text-2xl font-bold text-amber-400">{formatCurrency(product.preorderPrice)}</p>
                </div>
              )}
            </div>
          </div>

          {/* Funding (preorder only) */}
          {isPreorder && product.fundingGoal && (
            <div className="bg-[#111] border border-amber-500/15 rounded-2xl p-5">
              <p className="text-xs font-mono text-amber-400 uppercase tracking-widest mb-4">Funding Progress</p>
              <div className="flex justify-between text-sm mb-2">
                <span className="font-bold text-white">{formatCurrency(product.currentFunding || 0)} raised</span>
                <span className="text-gray-500">of {formatCurrency(product.fundingGoal)} goal</span>
              </div>
              <div className="h-3 bg-white/8 rounded-full overflow-hidden mb-1">
                <div className="h-full rounded-full bg-gradient-to-r from-orange-600 to-amber-400" style={{ width: `${fundingPct}%` }} />
              </div>
              <p className="text-xs text-amber-400 font-semibold">{fundingPct}% funded</p>
              {product.launchDate && (
                <p className="text-xs text-gray-500 mt-3">Launch date: {formatDate(product.launchDate)}</p>
              )}
              {product.estimatedCompletion && (
                <p className="text-xs text-gray-500">Est. completion: {formatDate(product.estimatedCompletion)}</p>
              )}
            </div>
          )}

          {/* Product details */}
          <div className="bg-[#111] border border-white/8 rounded-2xl p-5">
            <p className="text-xs font-mono text-orange-400 uppercase tracking-widest mb-4">Product Info</p>
            {row('Category', product.category)}
            {row('Description', product.description)}
            {row('Problem Statement', product.problemStatement)}
            {row('USP', product.usp)}
            {row('Created', formatDate(product.createdAt))}
          </div>

          {/* Founder / Team */}
          {(product.founderName || product.teamDescription || product.creatorStory) && (
            <div className="bg-[#111] border border-white/8 rounded-2xl p-5">
              <p className="text-xs font-mono text-orange-400 uppercase tracking-widest mb-4">Founder & Team</p>
              {row('Founder Name', product.founderName)}
              {row('Team', product.teamDescription)}
              {row('Creator Story', product.creatorStory)}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
