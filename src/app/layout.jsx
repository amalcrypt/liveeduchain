import { Inter } from 'next/font/google'
import './globals.css'
import { Providers } from '../components/Providers'
import Navbar from '../components/Navbar'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'EduChain - Blockchain Secured Validation',
  description: 'Eliminate credential fraud by securing academic certificates on an immutable blockchain ledger.',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${inter.className} min-h-screen bg-slate-50`}>
        <Providers>
          <Navbar />
          <main>
            {children}
          </main>
        </Providers>
      </body>
    </html>
  )
}
