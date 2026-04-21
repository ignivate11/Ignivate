'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import ProductForm from '@/components/products/ProductForm'

export default function AdminNewProductPage() {
  const router = useRouter()
  const [autoApprove, setAutoApprove] = useState(true)

  return (
    <div>
      <div className="mb-8">
        <p className="text-xs font-mono text-orange-400 uppercase tracking-widest mb-1">Admin</p>
        <h1 className="text-3xl font-bold text-white">Create Product</h1>
        <p className="text-gray-500 text-sm mt-1">Admin-created products can be auto-approved.</p>
      </div>

      <div className="max-w-2xl mb-6">
        <label className="flex items-center gap-3 bg-[#111] border border-green-500/20 rounded-xl px-5 py-4 cursor-pointer hover:border-green-500/40 transition-colors">
          <input
            type="checkbox"
            checked={autoApprove}
            onChange={e => setAutoApprove(e.target.checked)}
            className="w-4 h-4 accent-orange-500"
          />
          <div>
            <p className="text-sm font-semibold text-white">Auto-approve this product</p>
            <p className="text-xs text-gray-500 mt-0.5">Product will go live immediately without review</p>
          </div>
          <span className={`ml-auto text-xs font-semibold px-2.5 py-1 rounded-full ${autoApprove ? 'bg-green-500/15 text-green-400' : 'bg-gray-500/15 text-gray-400'}`}>
            {autoApprove ? 'Auto-approved' : 'Needs review'}
          </span>
        </label>
      </div>

      <ProductForm isAdmin autoApprove={autoApprove} />
    </div>
  )
}
