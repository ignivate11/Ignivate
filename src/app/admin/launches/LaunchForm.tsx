'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import ImageUploader from '@/components/products/ImageUploader'

interface LaunchFormData {
  productName: string; creatorName: string; creatorDescription: string
  productDescription: string; usp: string; problemStatement: string
  price: string; images: string[]; launchType: 'LIVE' | 'PREORDER'; isPublished: boolean
}

interface Props { initialData?: Partial<LaunchFormData> & { id?: string } }

const inputClass = "w-full bg-[#0d0d0d] border border-white/10 rounded-xl px-4 py-3 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-orange-500/50 transition-colors"
const labelClass = "block text-xs font-mono text-gray-400 uppercase tracking-widest mb-2"

export default function LaunchForm({ initialData }: Props) {
  const router = useRouter()
  const isEdit = !!initialData?.id
  const [form, setForm] = useState<LaunchFormData>({
    productName: initialData?.productName ?? '',
    creatorName: initialData?.creatorName ?? '',
    creatorDescription: initialData?.creatorDescription ?? '',
    productDescription: initialData?.productDescription ?? '',
    usp: initialData?.usp ?? '',
    problemStatement: initialData?.problemStatement ?? '',
    price: String(initialData?.price ?? ''),
    images: initialData?.images ?? [],
    launchType: initialData?.launchType ?? 'LIVE',
    isPublished: initialData?.isPublished ?? true,
  })
  const [saving, setSaving] = useState(false)

  function set(field: keyof LaunchFormData, value: unknown) {
    setForm(f => ({ ...f, [field]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (form.images.length === 0) { toast.error('Add at least one image'); return }
    setSaving(true)
    const payload = { ...form, price: parseFloat(form.price) }
    const url = isEdit ? `/api/admin/launches/${initialData!.id}` : '/api/admin/launches'
    const res = await fetch(url, {
      method: isEdit ? 'PATCH' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
    setSaving(false)
    if (res.ok) {
      toast.success(isEdit ? 'Launch updated' : 'Launch created')
      router.push('/admin/launches')
      router.refresh()
    } else {
      const data = await res.json()
      toast.error(data.error?.message ?? 'Failed to save launch')
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div>
          <label className={labelClass}>Product Name</label>
          <input className={inputClass} value={form.productName} onChange={e => set('productName', e.target.value)} placeholder="e.g. Ignivate Pro" required />
        </div>
        <div>
          <label className={labelClass}>Creator Name</label>
          <input className={inputClass} value={form.creatorName} onChange={e => set('creatorName', e.target.value)} placeholder="e.g. John Doe" required />
        </div>
      </div>
      <div>
        <label className={labelClass}>Creator Description</label>
        <textarea className={inputClass} rows={2} value={form.creatorDescription} onChange={e => set('creatorDescription', e.target.value)} placeholder="Brief bio of the creator..." required />
      </div>
      <div>
        <label className={labelClass}>Product Description</label>
        <textarea className={inputClass} rows={3} value={form.productDescription} onChange={e => set('productDescription', e.target.value)} placeholder="What is this product about?" required />
      </div>
      <div>
        <label className={labelClass}>Unique Selling Point (USP)</label>
        <textarea className={inputClass} rows={2} value={form.usp} onChange={e => set('usp', e.target.value)} placeholder="What makes this product special?" required />
      </div>
      <div>
        <label className={labelClass}>Problem Statement</label>
        <textarea className={inputClass} rows={2} value={form.problemStatement} onChange={e => set('problemStatement', e.target.value)} placeholder="What problem does this solve?" required />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div>
          <label className={labelClass}>Price (INR)</label>
          <input className={inputClass} type="number" min="0" step="0.01" value={form.price} onChange={e => set('price', e.target.value)} placeholder="999" required />
        </div>
        <div>
          <label className={labelClass}>Launch Type</label>
          <select className={inputClass} value={form.launchType} onChange={e => set('launchType', e.target.value as 'LIVE' | 'PREORDER')}>
            <option value="LIVE">Live</option>
            <option value="PREORDER">Pre-order</option>
          </select>
        </div>
        <div>
          <label className={labelClass}>Status</label>
          <select className={inputClass} value={form.isPublished ? 'published' : 'draft'} onChange={e => set('isPublished', e.target.value === 'published')}>
            <option value="published">Published</option>
            <option value="draft">Draft</option>
          </select>
        </div>
      </div>
      <div>
        <label className={labelClass}>Product Images (up to 5)</label>
        <ImageUploader images={form.images} onChange={urls => set('images', urls)} maxImages={5} />
      </div>
      <div className="flex gap-3 pt-2">
        <button type="submit" disabled={saving} className="px-6 py-3 bg-orange-500 hover:bg-orange-400 text-black font-semibold rounded-xl text-sm transition-colors disabled:opacity-50">
          {saving ? 'Saving...' : isEdit ? 'Update Launch' : 'Create Launch'}
        </button>
        <button type="button" onClick={() => router.back()} className="px-6 py-3 bg-white/5 hover:bg-white/10 text-gray-300 font-semibold rounded-xl text-sm transition-colors border border-white/10">
          Cancel
        </button>
      </div>
    </form>
  )
}
