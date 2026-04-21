import Navbar from '@/components/layout/Navbar'
export default function ShopLayout({ children }: { children: React.ReactNode }) {
  return (<><Navbar /><main className="pt-16">{children}</main></>)
}
