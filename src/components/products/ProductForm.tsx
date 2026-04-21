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
  }
}

export default function ProductForm({ product }: ProductFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    title: product?.title || '',
    description: product?.description || '',
    price: product?.price?.toString() || '',
    category: product?.category || 'General',
    images: product?.images || [],
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

  const validate = () => {
    const e: Record<string, string> = {}
    if (!form.title || form.title.length < 3) e.title = 'Title must be at least 3 characters'
    if (!form.description || form.description.length < 10) e.description = 'Description must be at least 10 characters'
    if (!form.price || isNaN(Number(form.price)) || Number(form.price) <= 0) e.price = 'Enter a valid price'
    if (form.images.length === 0) e.images = 'At least one image is required'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) return

    setLoading(true)
    const payload = { ...form, price: Number(form.price) }
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
      toast.error(typeof data.error === 'string' ? data.error : data.error?.message || 'Something went wrong')
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">
      <Input
        label="Product Title"
        placeholder="e.g. Ignivate Pro Template"
        value={form.title}
        onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
        error={errors.title}
      />

      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-gray-300">Description</label>
        <textarea
          placeholder="Describe your product..."
          value={form.description}
          onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
          rows={5}
          className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 text-sm outline-none transition-all focus:border-orange-500 focus:ring-1 focus:ring-orange-500/30 resize-none"
        />
        {errors.description && <p className="text-xs text-red-400">{errors.description}</p>}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Input
          label="Price (INR)"
          type="number"
          placeholder="999"
          value={form.price}
          onChange={e => setForm(f => ({ ...f, price: e.target.value }))}
          error={errors.price}
        />
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-gray-300">Category</label>
          <select
            value={form.category}
            onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm outline-none transition-all focus:border-orange-500"
          >
            {PRODUCT_CATEGORIES.map(cat => (
              <option key={cat} value={cat} className="bg-[#111]">{cat}</option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label className="text-sm font-medium text-gray-300 block mb-2">Product Images</label>
        <ImageUploader
          images={form.images}
          onChange={urls => setForm(f => ({ ...f, images: urls }))}
        />
        {errors.images && <p className="text-xs text-red-400 mt-1">{errors.images}</p>}
      </div>

      <div className="flex gap-3">
        <Button type="submit" loading={loading}>
          {product ? 'Update Product' : 'Submit for Approval'}
        </Button>
        <Button type="button" variant="secondary" onClick={() => router.back()}>
          Cancel
        </Button>
      </div>
    </form>
  )
}
