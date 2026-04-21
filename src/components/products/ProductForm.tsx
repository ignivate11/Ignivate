'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import Input from '@/components/ui/Input'
import Button from '@/components/ui/Button'
import ImageUploader from './ImageUploader'
import { PRODUCT_CATEGORIES } from '@/lib/constants'

interface ProductFormProps {
  product?: {
    id: string
    title: string
    description: string
    price: number
    images: string[]
    category: string
    saleCategory?: string
    problemStatement?: string | null
    usp?: string | null
    founderName?: string | null
    teamDescription?: string | null
    creatorStory?: string | null
    estimatedCompletion?: Date | string | null
    fundingGoal?: number | null
    launchDate?: Date | string | null
    preorderPrice?: number | null
  }
}

const inputClass = "w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 text-sm outline-none transition-all focus:border-orange-500 focus:ring-1 focus:ring-orange-500/30 resize-none"
const labelClass = "text-sm font-medium text-gray-300 block mb-2"
const sectionClass = "bg-white/3 border border-white/8 rounded-2xl p-6 space-y-5"
const sectionTitle = "text-base font-semibold text-white mb-1"
const sectionSub = "text-xs text-gray-500 mb-4"

export default function ProductForm({ product }: ProductFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [termsAccepted, setTermsAccepted] = useState(false)

  const toDateStr = (d?: Date | string | null) => {
    if (!d) return ''
    const date = new Date(d)
    return date.toISOString().split('T')[0]
  }

  const [form, setForm] = useState({
    title: product?.title || '',
    description: product?.description || '',
    price: product?.price?.toString() || '',
    category: product?.category || 'General',
    images: product?.images || [],
    saleCategory: (product?.saleCategory || 'READY') as 'READY' | 'PREORDER',
    // All products
    problemStatement: product?.problemStatement || '',
    usp: product?.usp || '',
    founderName: product?.founderName || '',
    teamDescription: product?.teamDescription || '',
    creatorStory: product?.creatorStory || '',
    // Preorder only
    estimatedCompletion: toDateStr(product?.estimatedCompletion),
    fundingGoal: product?.fundingGoal?.toString() || '',
    launchDate: toDateStr(product?.launchDate),
    preorderPrice: product?.preorderPrice?.toString() || '',
  })

  const [errors, setErrors] = useState<Record<string, string>>({})
  const isPreorder = form.saleCategory === 'PREORDER'

  const set = (field: string, value: string) => setForm(f => ({ ...f, [field]: value }))

  const validate = () => {
    const e: Record<string, string> = {}
    if (!form.title || form.title.length < 3) e.title = 'Title must be at least 3 characters'
    if (!form.description || form.description.length < 10) e.description = 'Description must be at least 10 characters'
    if (!form.price || isNaN(Number(form.price)) || Number(form.price) <= 0) e.price = 'Enter a valid price'
    if (form.images.length === 0) e.images = 'At least one image is required'
    if (!form.problemStatement || form.problemStatement.length < 10) e.problemStatement = 'Problem statement is required'
    if (!form.usp || form.usp.length < 10) e.usp = 'USP is required'
    if (!form.founderName || form.founderName.length < 2) e.founderName = 'Founder name is required'
    if (!form.teamDescription || form.teamDescription.length < 10) e.teamDescription = 'Team description is required'
    if (!form.creatorStory || form.creatorStory.length < 10) e.creatorStory = 'Creator story is required'
    if (isPreorder) {
      if (!form.estimatedCompletion) e.estimatedCompletion = 'Estimated completion date is required'
      if (!form.fundingGoal || isNaN(Number(form.fundingGoal)) || Number(form.fundingGoal) <= 0) e.fundingGoal = 'Funding goal is required'
      if (!form.launchDate) e.launchDate = 'Launch date is required'
      if (!form.preorderPrice || isNaN(Number(form.preorderPrice)) || Number(form.preorderPrice) <= 0) e.preorderPrice = 'Pre-order price is required'
    }
    if (!termsAccepted) e.terms = 'You must accept the terms and conditions'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) {
      toast.error('Please fill in all required fields')
      return
    }

    setLoading(true)
    const payload: Record<string, unknown> = {
      title: form.title,
      description: form.description,
      price: Number(form.price),
      category: form.category,
      images: form.images,
      saleCategory: form.saleCategory,
      problemStatement: form.problemStatement,
      usp: form.usp,
      founderName: form.founderName,
      teamDescription: form.teamDescription,
      creatorStory: form.creatorStory,
    }
    if (isPreorder) {
      payload.estimatedCompletion = form.estimatedCompletion
      payload.fundingGoal = Number(form.fundingGoal)
      payload.launchDate = form.launchDate
      payload.preorderPrice = Number(form.preorderPrice)
    }

    const url = product ? `/api/products/${product.id}` : '/api/products'
    const method = product ? 'PATCH' : 'POST'

    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })

    setLoading(false)
    if (res.ok) {
      toast.success(product ? 'Product updated! Pending re-approval.' : 'Product submitted for approval!')
      router.push('/creator/products')
      router.refresh()
    } else {
      const data = await res.json()
      toast.error(typeof data.error === 'string' ? data.error : 'Something went wrong')
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8 max-w-2xl">

      {/* ── SALE CATEGORY ───────────────────────────────────────────── */}
      <div className={sectionClass}>
        <p className={sectionTitle}>Sale Type</p>
        <p className={sectionSub}>Choose how you want to sell your product</p>
        <div className="grid grid-cols-2 gap-3">
          {(['READY', 'PREORDER'] as const).map(cat => (
            <button
              key={cat}
              type="button"
              onClick={() => set('saleCategory', cat)}
              className={`p-4 rounded-xl border text-left transition-all ${
                form.saleCategory === cat
                  ? 'border-orange-500 bg-orange-500/10'
                  : 'border-white/10 bg-white/3 hover:border-white/20'
              }`}
            >
              <p className={`font-semibold text-sm mb-1 ${form.saleCategory === cat ? 'text-orange-400' : 'text-white'}`}>
                {cat === 'READY' ? '✅ Ready Product' : '🚀 Pre-order Product'}
              </p>
              <p className="text-xs text-gray-500">
                {cat === 'READY'
                  ? 'Product is ready. Customers can buy immediately after approval.'
                  : 'Product is in development. Collect pre-orders and funding.'}
              </p>
            </button>
          ))}
        </div>
      </div>

      {/* ── BASIC INFO ──────────────────────────────────────────────── */}
      <div className={sectionClass}>
        <p className={sectionTitle}>Product Details</p>

        <Input
          label="Product Title"
          placeholder="e.g. Ignivate Pro Template"
          value={form.title}
          onChange={e => set('title', e.target.value)}
          error={errors.title}
        />

        <div>
          <label className={labelClass}>Description</label>
          <textarea
            placeholder="Describe your product in detail..."
            value={form.description}
            onChange={e => set('description', e.target.value)}
            rows={4}
            className={inputClass}
          />
          {errors.description && <p className="text-xs text-red-400 mt-1">{errors.description}</p>}
        </div>

        <div>
          <label className={labelClass}>What problem are you solving?</label>
          <textarea
            placeholder="Describe the problem your product addresses..."
            value={form.problemStatement}
            onChange={e => set('problemStatement', e.target.value)}
            rows={3}
            className={inputClass}
          />
          {errors.problemStatement && <p className="text-xs text-red-400 mt-1">{errors.problemStatement}</p>}
        </div>

        <div>
          <label className={labelClass}>What makes your product unique? (USP)</label>
          <textarea
            placeholder="What sets your product apart from alternatives..."
            value={form.usp}
            onChange={e => set('usp', e.target.value)}
            rows={3}
            className={inputClass}
          />
          {errors.usp && <p className="text-xs text-red-400 mt-1">{errors.usp}</p>}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>{isPreorder ? 'Full Price (INR)' : 'Price (INR)'}</label>
            <input
              type="number"
              placeholder="999"
              value={form.price}
              onChange={e => set('price', e.target.value)}
              className={inputClass}
            />
            {errors.price && <p className="text-xs text-red-400 mt-1">{errors.price}</p>}
          </div>
          <div>
            <label className={labelClass}>Category</label>
            <select
              value={form.category}
              onChange={e => set('category', e.target.value)}
              className={inputClass}
            >
              {PRODUCT_CATEGORIES.map(cat => (
                <option key={cat} value={cat} className="bg-[#111]">{cat}</option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className={labelClass}>Product Images</label>
          <ImageUploader images={form.images} onChange={urls => setForm(f => ({ ...f, images: urls }))} />
          {errors.images && <p className="text-xs text-red-400 mt-1">{errors.images}</p>}
        </div>
      </div>

      {/* ── PRE-ORDER FIELDS ─────────────────────────────────────────── */}
      {isPreorder && (
        <div className={`${sectionClass} border-orange-500/20`}>
          <p className={sectionTitle}>🚀 Pre-order Details</p>
          <p className={sectionSub}>These fields are shown to customers on your pre-order page</p>

          <Input
            label="Pre-order Price (INR) — discounted early price"
            type="number"
            placeholder="699"
            value={form.preorderPrice}
            onChange={e => set('preorderPrice', e.target.value)}
            error={errors.preorderPrice}
          />

          <Input
            label="Target Funding Amount (INR)"
            type="number"
            placeholder="500000"
            value={form.fundingGoal}
            onChange={e => set('fundingGoal', e.target.value)}
            error={errors.fundingGoal}
          />

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Estimated Completion Date</label>
              <input
                type="date"
                value={form.estimatedCompletion}
                onChange={e => set('estimatedCompletion', e.target.value)}
                className={inputClass}
              />
              {errors.estimatedCompletion && <p className="text-xs text-red-400 mt-1">{errors.estimatedCompletion}</p>}
            </div>
            <div>
              <label className={labelClass}>Planned Launch Date</label>
              <input
                type="date"
                value={form.launchDate}
                onChange={e => set('launchDate', e.target.value)}
                className={inputClass}
              />
              {errors.launchDate && <p className="text-xs text-red-400 mt-1">{errors.launchDate}</p>}
            </div>
          </div>
        </div>
      )}

      {/* ── FOUNDER / TEAM ───────────────────────────────────────────── */}
      <div className={sectionClass}>
        <p className={sectionTitle}>Founder & Team</p>
        <p className={sectionSub}>Help customers trust you by sharing your story</p>

        <Input
          label="Founder Name"
          placeholder="Your full name"
          value={form.founderName}
          onChange={e => set('founderName', e.target.value)}
          error={errors.founderName}
        />

        <div>
          <label className={labelClass}>Team Description</label>
          <textarea
            placeholder="Who is building this? What are your backgrounds?"
            value={form.teamDescription}
            onChange={e => set('teamDescription', e.target.value)}
            rows={3}
            className={inputClass}
          />
          {errors.teamDescription && <p className="text-xs text-red-400 mt-1">{errors.teamDescription}</p>}
        </div>

        <div>
          <label className={labelClass}>Why are you building this? (Creator Story)</label>
          <textarea
            placeholder="Share your personal motivation and journey..."
            value={form.creatorStory}
            onChange={e => set('creatorStory', e.target.value)}
            rows={4}
            className={inputClass}
          />
          {errors.creatorStory && <p className="text-xs text-red-400 mt-1">{errors.creatorStory}</p>}
        </div>
      </div>

      {/* ── TERMS ────────────────────────────────────────────────────── */}
      <div className={`${sectionClass} border-yellow-500/20 bg-yellow-500/3`}>
        <label className="flex items-start gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={termsAccepted}
            onChange={e => setTermsAccepted(e.target.checked)}
            className="mt-1 w-4 h-4 accent-orange-500 cursor-pointer"
          />
          <span className="text-sm text-gray-300 leading-relaxed">
            <span className="font-semibold text-white">Terms & Conditions — </span>
            I agree that if I fail to deliver the product within the promised timeline, I will issue full refunds to all customers who pre-ordered. I understand this is a binding commitment to my backers.
          </span>
        </label>
        {errors.terms && <p className="text-xs text-red-400 mt-2">{errors.terms}</p>}
      </div>

      {/* ── SUBMIT ───────────────────────────────────────────────────── */}
      <div className="flex gap-3">
        <Button type="submit" loading={loading} disabled={!termsAccepted}>
          {product ? 'Update Product' : 'Submit for Approval'}
        </Button>
        <Button type="button" variant="secondary" onClick={() => router.back()}>
          Cancel
        </Button>
      </div>
    </form>
  )
}
