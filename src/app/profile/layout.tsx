import Navbar from '@/components/layout/Navbar'

export default function ProfileLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Navbar />
      <main className="pt-16 min-h-screen bg-[#0a0a0a]">
        {children}
      </main>
    </>
  )
}
