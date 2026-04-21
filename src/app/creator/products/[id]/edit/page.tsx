import { prisma } from '@/lib/prisma'
import { auth } from '@/auth'
import { notFound, redirect } from 'next/navigation'
import ProductForm from '@/components/products/ProductForm'

export default async function EditProductPage({ params }: { params: { id: string } }) {
  const session = await auth()
  const product = await prisma.product.findUnique({ where: { id: params.id } })

  if (!product) notFound()
  if (product.creatorId !== session!.user.id) redirect('/creator/products')

  return (
    <div>
      <div className="mb-8">
        <p className="text-xs font-mono text-orange-400 uppercase tracking-widest mb-1">Creator</p>
        <h1 className="text-3xl font-bold text-white">Edit Product</h1>
        <p className="text-gray-500 text-sm mt-1">Changes will reset status to Pending for re-review.</p>
      </div>
      <ProductForm product={product} />
    </div>
  )
}
