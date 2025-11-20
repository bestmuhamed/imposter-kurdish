import { NextResponse } from 'next/server';

const ACCESS_KEY = process.env.UNSPLASH_ACCESS_KEY!;

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get('q') || '';
  if (!q) return NextResponse.json({ photos: [] });

  const r = await fetch(
    `https://api.unsplash.com/search/photos?query=${encodeURIComponent(q)}&per_page=1`,
    { headers: { Authorization: `Client-ID ${ACCESS_KEY}` }, cache: 'no-store' }
  );

  if (!r.ok) {
    const text = await r.text().catch(() => '');
    return NextResponse.json({ error: 'unsplash search failed', details: text }, { status: 500 });
  }

  const data = await r.json();
  const first = data?.results?.[0];

  
  console.log('Unsplash pick: +  hier rein?');

  const pick = first ? {
    url: first.urls?.regular,
    author: first.user?.name,
    author_link: first.user?.links?.html,
    photo_link: first.links?.html,
    download_location: first.links?.download_location, // <- WICHTIG
  } : undefined;


  console.log('Unsplash pick:', pick?.download_location);

  return NextResponse.json({ photos: pick ? [pick] : [] });
}
