import './globals.css'
import type { Metadata } from 'next'
import { LanguageProvider } from './_components/LanguageProvider'
import LanguageSwitcher from './_components/LanguageSwitcher'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Mini Games',
  description: 'Party-Spiele Hub'
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <LanguageProvider>
          {/* GLOBAL HEADER */}
          <header
            style={{
              position: 'sticky',
              top: 0,
              zIndex: 50,
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '12px 16px',
              borderBottom: '1px solid rgba(255,255,255,.1)',
              background:
                'linear-gradient(180deg, rgba(0,0,0,.45), rgba(0,0,0,.25))'
            }}
          >
            <Link href="/" style={{ textDecoration: 'none', color: 'inherit' }}>
              <strong style={{ letterSpacing: 0.4 }}>🎉 Mini Games</strong>
            </Link>
            <LanguageSwitcher />
          </header>

          {children}
        </LanguageProvider>
      </body>
    </html>
  )
}
