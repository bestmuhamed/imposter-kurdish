import { NextResponse } from 'next/server'
const API = 'https://api.unsplash.com/search/photos'

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const q = searchParams.get('q') || ''
  const r = await fetch(`${API}?query=${encodeURIComponent(q)}&per_page=1&content_filter=high`, {
    headers: { Authorization: `Client-ID ${process.env.UNSPLASH_ACCESS_KEY}` },
    cache: 'no-store'
  })
  if (!r.ok) return NextResponse.json({ error: 'unsplash_failed' }, { status: r.status })
  const json = await r.json()
  const p = json.results?.[0]
  if (!p) return NextResponse.json({ photos: [] })
  // Nutze 'regular' + feste Breite/Höhe-Parameter für Stabilität/Caching:
  const url = `${p.urls.regular}&w=1200&h=800&fit=crop`
  return NextResponse.json({
    photos: [{
      url,
      alt: p.alt_description || q,
      author: p.user?.name,
      author_link: p.user?.links?.html,
      source_link: p.links?.html
    }]
  })
}
