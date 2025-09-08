import './globals.css'

export const metadata = {
  title: 'My Supabase App',
  description: 'Blank Next.js + Supabase project on Vercel',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
