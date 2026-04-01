// src/app/api/content/route.ts
import { NextResponse } from 'next/server';
import { getListing, findByTmdbId } from '@/lib/vimeus-service';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const rawType = searchParams.get('type') || 'movies';
  const page = parseInt(searchParams.get('page') || '1');
  const tmdbId = searchParams.get('tmdb_id');

  // Normalize type to singular
  let contentType: 'movie' | 'series' | 'anime';
  if (rawType === 'movies' || rawType === 'movie') contentType = 'movie';
  else if (rawType === 'series') contentType = 'series';
  else if (rawType === 'animes' || rawType === 'anime') contentType = 'anime';
  else contentType = 'movie';

  try {
    // Single item lookup by TMDB ID
    if (tmdbId) {
      const item = await findByTmdbId(tmdbId, contentType);
      return NextResponse.json({ success: true, item });
    }

    // Listing items (limited to 18 per page to avoid overwhelming the user)
    const items = await getListing(contentType, page);
    return NextResponse.json({ success: true, items: items.slice(0, 18) });

  } catch (error: any) {
    console.error('Content API error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
