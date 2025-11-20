// app/api/unsplash/download/route.ts
import { NextResponse } from 'next/server'

const ACCESS_KEY = process.env.UNSPLASH_ACCESS_KEY!

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const downloadLocation = searchParams.get('url')
  if (!downloadLocation) {
    return NextResponse.json({ ok: false, error: 'Missing url' }, { status: 400 })
  }

  // 1) Offiziellen Download triggern
  const res = await fetch(downloadLocation, {
    headers: {
      Authorization: `Client-ID ${ACCESS_KEY}`,
      'Accept-Version': 'v1',
    },
    cache: 'no-store',
  })

  const data = await res.json().catch(() => null)

  if (!res.ok || !data?.url) {
    return NextResponse.json({ ok: false, status: res.status, data }, { status: 502 })
  }

  // 2) Optionale HEAD-Abfrage (damit Unsplash sicher das Bild als „verwendet“ zählt)
  try {
    await fetch(data.url, { method: 'HEAD' })
  } catch {}

  return NextResponse.json({ ok: true, fileUrl: data.url })
}
