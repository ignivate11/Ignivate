import Navbar from '@/components/layout/Navbar'
import BackBar from '@/components/layout/BackBar'

export default function ShopLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Navbar />
      <main className="pt-16">
        <BackBar />
        {children}
      </main>
    </>
  )
}
