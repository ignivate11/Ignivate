import Navbar from '@/components/layout/Navbar'

export default function ChangePasswordLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-[#0a0a0a]">
        {children}
      </main>
    </>
  )
}
