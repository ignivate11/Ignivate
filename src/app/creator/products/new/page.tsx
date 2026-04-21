import ProductForm from '@/components/products/ProductForm'

export default function NewProductPage() {
  return (
    <div>
      <div className="mb-8">
        <p className="text-xs font-mono text-orange-400 uppercase tracking-widest mb-1">Creator</p>
        <h1 className="text-3xl font-bold text-white">New Product</h1>
        <p className="text-gray-500 text-sm mt-1">Fill in the details. Your product will be reviewed before going live.</p>
      </div>
      <ProductForm />
    </div>
  )
}
