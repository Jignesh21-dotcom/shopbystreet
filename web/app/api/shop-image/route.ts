// app/api/shop-image/route.ts

import { NextResponse } from 'next/server';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const query = searchParams.get('query');

  if (!query) {
    return NextResponse.json({ error: 'Missing query' }, { status: 400 });
  }

  const res = await fetch(`https://api.pexels.com/v1/search?query=${encodeURIComponent(query)}&per_page=1`, {
    headers: {
      Authorization: '5Lr5hSW7eywIyJL2H8vPRVdDEb8HEdgHLhGZrI12oDHL6CPLSvyoINQW',
    },
  });

  const data = await res.json();
  const imageUrl = data.photos?.[0]?.src?.medium || null;

  return NextResponse.json({ imageUrl });
}
