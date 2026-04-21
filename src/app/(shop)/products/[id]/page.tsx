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

function FundingBar({ current, goal }: { current: number; goal: number }) {
  const pct = Math.min(100, Math.round((current / goal) * 100))
  return (
    <div className="space-y-2">
      <div className="flex justify-between text-sm">
        <span className="font-bold text-white">{formatCurrency(current)} raised</span>
        <span className="text-gray-500">of {formatCurrency(goal)} goal</span>
      </div>
      <div className="relative h-3 bg-white/8 rounded-full overflow-hidden">
        <div
          className="absolute left-0 top-0 h-full rounded-full bg-gradient-to-r from-orange-600 to-amber-400 transition-all"
          style={{ width: `${pct}%` }}
        />
      </div>
      <p className="text-xs text-orange-400 font-semibold">{pct}% funded</p>
    </div>
  )
}

function DaysRemaining({ date }: { date: Date }) {
  const days = Math.ceil((new Date(date).getTime() - Date.now()) / 86400000)
  if (days < 0) return <span className="text-red-400 text-sm">Launch date passed</span>
  return (
    <div className="text-center">
      <p className="text-3xl font-bold text-white">{days}</p>
      <p className="text-xs text-gray-500 mt-0.5">days to go</p>
    </div>
  )
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

  const isPreorder = product.saleCategory === 'PREORDER'
  const fundingPct = isPreorder && product.fundingGoal
    ? Math.min(100, Math.round(((product.currentFunding || 0) / product.fundingGoal) * 100))
    : 0

  return (
    <div className="max-w-6xl mx-auto px-6 py-12">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">

        {/* ── LEFT: Images ─────────────────────────────────────────── */}
        <div className="space-y-4">
          {product.images[0] && (
            <div className="relative h-96 rounded-2xl overflow-hidden bg-[#111]">
              <Image src={product.images[0]} alt={product.title} fill className="object-cover" />
              {isPreorder && (
                <div className="absolute top-4 left-4 flex items-center gap-2 bg-amber-500/90 text-black text-xs font-bold px-3 py-1.5 rounded-full">
                  🚀 PRE-ORDER
                </div>
              )}
            </div>
          )}
          <div className="grid grid-cols-4 gap-2">
            {product.images.slice(1).map((img: string, i: number) => (
              <div key={i} className="relative h-20 rounded-xl overflow-hidden bg-[#111]">
                <Image src={img} alt={`${product.title} ${i + 2}`} fill className="object-cover" />
              </div>
            ))}
          </div>

          {/* Founder card on desktop */}
          {(product.founderName || product.creatorStory) && (
            <div className="hidden lg:block bg-[#111] border border-white/8 rounded-2xl p-6 space-y-3">
              <h3 className="font-semibold text-white text-sm">👤 About the Founder</h3>
              {product.founderName && (
                <p className="text-orange-400 font-semibold text-sm">{product.founderName}</p>
              )}
              {product.teamDescription && (
                <p className="text-gray-400 text-sm leading-relaxed">{product.teamDescription}</p>
              )}
              {product.creatorStory && (
                <>
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-widest mt-3">Why they&apos;re building this</p>
                  <p className="text-gray-400 text-sm leading-relaxed italic">&ldquo;{product.creatorStory}&rdquo;</p>
                </>
              )}
            </div>
          )}
        </div>

        {/* ── RIGHT: Details ───────────────────────────────────────── */}
        <div className="space-y-5">
          <div>
            <span className="text-xs font-mono text-orange-400 uppercase tracking-widest">{product.category}</span>
            <h1 className="text-3xl font-bold text-white mt-2 mb-2">{product.title}</h1>
            <p className="text-gray-500 text-sm">by {product.creator.name} · {formatDate(product.createdAt)}</p>
          </div>

          {/* Pricing card */}
          <div className="bg-[#111] border border-white/8 rounded-2xl p-6 space-y-4">
            {isPreorder && product.preorderPrice ? (
              <>
                <div className="flex items-end gap-3">
                  <p className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-amber-400">
                    {formatCurrency(product.preorderPrice)}
                  </p>
                  <p className="text-gray-500 line-through text-lg mb-1">{formatCurrency(product.price)}</p>
                  <span className="mb-1 text-xs bg-green-500/15 text-green-400 border border-green-500/20 px-2 py-0.5 rounded-full font-semibold">
                    Early bird
                  </span>
                </div>
                <p className="text-xs text-gray-500">Pre-order at a discounted price. Pay full price {formatCurrency(product.price)} after launch.</p>
              </>
            ) : (
              <p className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-amber-400">
                {formatCurrency(product.price)}
              </p>
            )}

            {/* Funding progress for preorders */}
            {isPreorder && product.fundingGoal && (
              <FundingBar current={product.currentFunding || 0} goal={product.fundingGoal} />
            )}

            <AddToCartButton
              product={{ ...product, creator: product.creator }}
              session={session}
              isPreorder={isPreorder}
            />
          </div>

          {/* Launch timeline */}
          {isPreorder && (product.launchDate || product.estimatedCompletion) && (
            <div className="bg-[#111] border border-orange-500/15 rounded-2xl p-5">
              <p className="text-xs font-mono text-orange-400 uppercase tracking-widest mb-4">Timeline</p>
              <div className="grid grid-cols-2 gap-4 text-center">
                {product.launchDate && (
                  <div className="bg-white/3 rounded-xl p-4">
                    <DaysRemaining date={product.launchDate} />
                    <p className="text-xs text-gray-500 mt-2">Launch: {formatDate(product.launchDate)}</p>
                  </div>
                )}
                {product.estimatedCompletion && (
                  <div className="bg-white/3 rounded-xl p-4">
                    <p className="text-xs text-gray-500 mb-1">Est. Completion</p>
                    <p className="font-bold text-white text-sm">{formatDate(product.estimatedCompletion)}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Problem + USP */}
          {(product.problemStatement || product.usp) && (
            <div className="bg-[#111] border border-white/8 rounded-2xl p-6 space-y-4">
              {product.problemStatement && (
                <div>
                  <p className="text-xs font-mono text-orange-400 uppercase tracking-widest mb-2">The Problem</p>
                  <p className="text-gray-400 text-sm leading-relaxed">{product.problemStatement}</p>
                </div>
              )}
              {product.usp && (
                <div>
                  <p className="text-xs font-mono text-orange-400 uppercase tracking-widest mb-2">Why This Product</p>
                  <p className="text-gray-400 text-sm leading-relaxed">{product.usp}</p>
                </div>
              )}
            </div>
          )}

          {/* About */}
          <div className="bg-[#111] border border-white/8 rounded-2xl p-6">
            <h3 className="font-semibold text-white mb-3">About this product</h3>
            <p className="text-gray-400 text-sm leading-relaxed whitespace-pre-wrap">{product.description}</p>
          </div>

          {/* Founder on mobile */}
          {(product.founderName || product.creatorStory) && (
            <div className="lg:hidden bg-[#111] border border-white/8 rounded-2xl p-6 space-y-3">
              <h3 className="font-semibold text-white text-sm">👤 About the Founder</h3>
              {product.founderName && <p className="text-orange-400 font-semibold text-sm">{product.founderName}</p>}
              {product.teamDescription && <p className="text-gray-400 text-sm leading-relaxed">{product.teamDescription}</p>}
              {product.creatorStory && (
                <>
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-widest mt-3">Why they&apos;re building this</p>
                  <p className="text-gray-400 text-sm leading-relaxed italic">&ldquo;{product.creatorStory}&rdquo;</p>
                </>
              )}
            </div>
          )}

          {/* Preorder disclaimer */}
          {isPreorder && (
            <div className="bg-amber-500/5 border border-amber-500/15 rounded-xl p-4">
              <p className="text-xs text-amber-400/80 leading-relaxed">
                ⚠️ <strong className="text-amber-400">Pre-order notice:</strong> This is a pre-order product still in development. Delivery is estimated by {product.estimatedCompletion ? formatDate(product.estimatedCompletion) : 'the stated timeline'}. The creator is committed to full refunds if delivery fails.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
