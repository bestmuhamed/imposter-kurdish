// /app/api/unsplash/route.ts
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const q = searchParams.get('q') || ''
  if (!q) return NextResponse.json({ photos: [] })

  // Unsplash Search API
  const r = await fetch(
    `https://api.unsplash.com/search/photos?query=${encodeURIComponent(q)}&per_page=1`,
    { headers: { Authorization: `Client-ID ${process.env.UNSPLASH_ACCESS_KEY!}` }, cache: 'no-store' }
  )
  if (!r.ok) {
    const err = await r.text()
    return NextResponse.json({ error: 'unsplash_search_failed', detail: err }, { status: 500 })
  }
  const json = await r.json()

  const photos = (json.results || []).map((p: any) => ({
    url: p.urls?.regular || p.urls?.small,
    // Attribution
    author: p.user?.name,
    author_link: p.user?.links?.html,         // Profil
    photo_link: p.links?.html,                // Foto-Seite
    // Download-Trigger
    download_location: p.links?.download_location
  }))

  return NextResponse.json({ photos })
}
