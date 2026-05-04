export const dynamic = 'force-dynamic'
import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import { auth } from '@/auth'
import Image from 'next/image'
import { formatCurrency, formatDate } from '@/lib/utils'
import AddToCartButton from './AddToCartButton'
import BuyNowButton from './BuyNowButton'
import StarRating from '@/components/products/StarRating'

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
        <div className="absolute left-0 top-0 h-full rounded-full bg-gradient-to-r from-orange-600 to-amber-400 transition-all" style={{ width: `${pct}%` }} />
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
      include: {
        creator: {
          select: {
            id: true, name: true, avatar: true,
            bio: true, founderStory: true, teamDetails: true,
            linkedinUrl: true, twitterUrl: true, websiteUrl: true,
            experienceLevel: true, skills: true, location: true,
          }
        },
        ratings: { select: { rating: true } },
      },
    }),
    auth(),
  ])

  if (!product || product.status !== 'APPROVED') notFound()

  const isPreorder = product.saleCategory === 'PREORDER'
  const isCustomer = session?.user.role === 'CUSTOMER'

  // Rating stats
  const ratingCount = product.ratings.length
  const ratingAverage = ratingCount > 0
    ? Math.round((product.ratings.reduce((s, r) => s + r.rating, 0) / ratingCount) * 10) / 10
    : 0
  const userRating = session
    ? (await prisma.rating.findUnique({
        where: { userId_productId: { userId: session.user.id, productId: params.id } },
        select: { rating: true },
      }))?.rating ?? null
    : null

  return (
    <div className="max-w-6xl mx-auto px-6 py-12">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">

        {/* ── LEFT ──────────────────────────────────────────────── */}
        <div className="space-y-4">
          {product.images[0] && (
            <div className="relative h-96 rounded-2xl overflow-hidden bg-[#111]">
              <Image src={product.images[0]} alt={product.title} fill className="object-cover" />
              {isPreorder && (
                <div className="absolute top-4 left-4 bg-amber-500/90 text-black text-xs font-bold px-3 py-1.5 rounded-full">
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

          {/* ── Creator Info Card ──────────────────────────────── */}
          <div className="bg-[#111] border border-white/8 rounded-2xl p-5 space-y-4">
            <p className="text-xs font-mono text-orange-400 uppercase tracking-widest">About the Creator</p>
            <div className="flex items-center gap-3">
              {product.creator.avatar ? (
                <div className="relative w-12 h-12 rounded-full overflow-hidden shrink-0">
                  <Image src={product.creator.avatar} alt={product.creator.name} fill className="object-cover" />
                </div>
              ) : (
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-orange-500 to-amber-400 flex items-center justify-center text-white font-bold text-sm shrink-0">
                  {product.creator.name.charAt(0).toUpperCase()}
                </div>
              )}
              <div className="flex-1">
                <p className="font-semibold text-white">{product.founderName || product.creator.name}</p>
                {product.creator.experienceLevel && (
                  <span className="inline-block text-xs bg-orange-500/10 text-orange-400 border border-orange-500/20 px-2 py-0.5 rounded-full mt-0.5">
                    {product.creator.experienceLevel}
                  </span>
                )}
                {product.creator.location && (
                  <p className="text-xs text-gray-500 mt-0.5">📍 {product.creator.location}</p>
                )}
              </div>
            </div>
            {product.creator.bio && (
              <p className="text-sm text-gray-400 leading-relaxed">{product.creator.bio}</p>
            )}
            {(product.teamDescription || product.creator.teamDetails) && (
              <div className="border-t border-white/6 pt-3">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-2">The Team</p>
                <p className="text-sm text-gray-400 leading-relaxed">{product.teamDescription || product.creator.teamDetails}</p>
              </div>
            )}
            {(product.creatorStory || product.creator.founderStory) && (
              <div className="border-t border-white/6 pt-3">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-2">Why they&apos;re building this</p>
                <p className="text-sm text-gray-400 leading-relaxed italic">&ldquo;{product.creatorStory || product.creator.founderStory}&rdquo;</p>
              </div>
            )}
            {product.creator.skills && product.creator.skills.length > 0 && (
              <div className="border-t border-white/6 pt-3 flex flex-wrap gap-1.5">
                {product.creator.skills.map((skill: string) => (
                  <span key={skill} className="text-xs bg-white/5 border border-white/10 text-gray-400 px-2.5 py-1 rounded-full">
                    {skill}
                  </span>
                ))}
              </div>
            )}
            {(product.creator.linkedinUrl || product.creator.twitterUrl || product.creator.websiteUrl) && (
              <div className="border-t border-white/6 pt-3 flex gap-3">
                {product.creator.linkedinUrl && (
                  <a href={product.creator.linkedinUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-gray-500 hover:text-orange-400 transition-colors">
                    LinkedIn →
                  </a>
                )}
                {product.creator.twitterUrl && (
                  <a href={product.creator.twitterUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-gray-500 hover:text-orange-400 transition-colors">
                    Twitter →
                  </a>
                )}
                {product.creator.websiteUrl && (
                  <a href={product.creator.websiteUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-gray-500 hover:text-orange-400 transition-colors">
                    Website →
                  </a>
                )}
              </div>
            )}
          </div>
        </div>

        {/* ── RIGHT ─────────────────────────────────────────────── */}
        <div className="space-y-5">
          <div>
            <span className="text-xs font-mono text-orange-400 uppercase tracking-widest">{product.category}</span>
            <h1 className="text-3xl font-bold text-white mt-2 mb-2">{product.title}</h1>
            <p className="text-gray-500 text-sm">by {product.creator.name} · {formatDate(product.createdAt)}</p>
          </div>

          {/* ── Ratings ───────────────────────────────────────── */}
          <div className="bg-[#111] border border-white/8 rounded-2xl p-5">
            <p className="text-xs font-mono text-orange-400 uppercase tracking-widest mb-3">Ratings</p>
            <StarRating
              productId={product.id}
              initialAverage={ratingAverage}
              initialCount={ratingCount}
              initialUserRating={userRating}
              isCustomer={!!isCustomer}
            />
            {!session && (
              <p className="text-xs text-gray-600 mt-2">
                <a href="/login" className="text-orange-400 hover:text-orange-300">Login</a> to rate this product
              </p>
            )}
          </div>

          {/* ── Pricing ───────────────────────────────────────── */}
          <div className="bg-[#111] border border-white/8 rounded-2xl p-6 space-y-4">
            {isPreorder && product.preorderPrice ? (
              <>
                <div className="flex items-end gap-3">
                  <p className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-amber-400">
                    {formatCurrency(product.preorderPrice)}
                  </p>
                  <p className="text-gray-500 line-through text-lg mb-1">{formatCurrency(product.price)}</p>
                  <span className="mb-1 text-xs bg-green-500/15 text-green-400 border border-green-500/20 px-2 py-0.5 rounded-full font-semibold">Early bird</span>
                </div>
                <p className="text-xs text-gray-500">Pre-order at a discounted price. Full price {formatCurrency(product.price)} after launch.</p>
              </>
            ) : (
              <p className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-amber-400">
                {formatCurrency(product.price)}
              </p>
            )}

            {isPreorder && product.fundingGoal && (
              <FundingBar current={product.currentFunding || 0} goal={product.fundingGoal} />
            )}

            {session?.user.role === 'CUSTOMER' ? (
              <div className="space-y-2">
                <BuyNowButton
                  productId={product.id}
                  displayPrice={isPreorder && product.preorderPrice ? product.preorderPrice : product.price}
                  userName={session.user.name ?? ''}
                  userEmail={session.user.email ?? ''}
                  isPreorder={isPreorder}
                />
                <AddToCartButton
                  product={{ ...product, creator: product.creator }}
                  session={session}
                  isPreorder={isPreorder}
                />
              </div>
            ) : (
              <AddToCartButton
                product={{ ...product, creator: product.creator }}
                session={session}
                isPreorder={isPreorder}
              />
            )}
          </div>

          {/* ── Timeline (preorder) ───────────────────────────── */}
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

          {/* ── Problem + USP ─────────────────────────────────── */}
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

          {/* ── Description ───────────────────────────────────── */}
          <div className="bg-[#111] border border-white/8 rounded-2xl p-6">
            <h3 className="font-semibold text-white mb-3">About this product</h3>
            <p className="text-gray-400 text-sm leading-relaxed whitespace-pre-wrap">{product.description}</p>
          </div>

          {/* ── Preorder disclaimer ───────────────────────────── */}
          {isPreorder && (
            <div className="bg-amber-500/5 border border-amber-500/15 rounded-xl p-4">
              <p className="text-xs text-amber-400/80 leading-relaxed">
                ⚠️ <strong className="text-amber-400">Pre-order notice:</strong> This product is still in development. The creator is committed to full refunds if delivery fails.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
