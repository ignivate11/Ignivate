import type { Metadata } from 'next'
import './globals.css'
import { SessionProvider } from 'next-auth/react'
import { Toaster } from 'react-hot-toast'

export const metadata: Metadata = {
  title: 'Ignivate — Where Ideas Ignite',
  description: "India's creator launch platform — from idea to first customers.",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-[#0a0a0a] text-gray-100 antialiased">
        <SessionProvider>
          {children}
          <Toaster
            position="top-right"
            toastOptions={{
              style: {
                background: '#1a1a1a',
                color: '#f5f5f5',
                border: '1px solid rgba(255,255,255,0.08)',
              },
            }}
          />
        </SessionProvider>
      </body>
    </html>
  )
}
