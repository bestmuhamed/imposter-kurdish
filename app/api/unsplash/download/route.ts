// /app/api/unsplash/download/route.ts
import { NextResponse } from 'next/server'

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const url = searchParams.get('url')
  if (!url) return NextResponse.json({ ok: false }, { status: 400 })

  const r = await fetch(url, {
    headers: { Authorization: `Client-ID ${process.env.UNSPLASH_ACCESS_KEY!}` },
    cache: 'no-store'
  })
  return NextResponse.json({ ok: r.ok })
}
