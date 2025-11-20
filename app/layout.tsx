import './globals.css'
import type { Metadata } from 'next'
import { LanguageProvider } from './_components/LanguageProvider'
import LanguageSwitcher from './_components/LanguageSwitcher'
import Link from 'next/link'
import FooterAds from './_components/FooterAds'

export const metadata: Metadata = {
  title: 'Mini Games',
  description: 'Party-Spiele Hub'
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta name="google-adsense-account" content="ca-pub-1491307703797021"></meta>
      </head>
      <body
        style={{
          display: 'flex',
          flexDirection: 'column',
          minHeight: '100vh',
        }}
      >
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
                'linear-gradient(180deg, rgba(0,0,0,.45), rgba(0,0,0,.25))',
            }}
          >
            <Link
              href="/"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                textDecoration: 'none',
                color: 'inherit',
              }}
            >
              <img
                src="/Logo.png"
                alt="HevalPlay Logo"
                style={{ width: 28, height: 28, objectFit: 'contain' }}
              />
              <strong style={{ letterSpacing: 0.4 }}>HevalPlay</strong>
            </Link>

            <LanguageSwitcher />
          </header>

          {/* MAIN CONTENT */}
          <main
            style={{
              flex: 1,
              paddingBottom: 60, // Footerhöhe -> verhindert Überlappung
              width: '100%',
            }}
          >
            {children}
          </main>
        </LanguageProvider>

        <FooterAds />
      </body>
    </html>
  )
}
