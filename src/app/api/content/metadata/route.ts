// src/app/api/content/metadata/route.ts
import { NextResponse } from 'next/server';
import { findByTmdbId } from '@/lib/vimeus-service';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const tmdbId = searchParams.get('tmdb_id');
  const rawType = searchParams.get('type') || 'movie';

  if (!tmdbId) {
    return NextResponse.json({ success: false, error: 'tmdb_id is required' }, { status: 400 });
  }

  let contentType: 'movie' | 'series' | 'anime';
  if (rawType === 'series') contentType = 'series';
  else if (rawType === 'anime' || rawType === 'animes') contentType = 'anime';
  else contentType = 'movie';

  try {
    const meta = await findByTmdbId(tmdbId, contentType);
    if (!meta) {
      return NextResponse.json({ success: false, error: 'Not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true, meta });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
