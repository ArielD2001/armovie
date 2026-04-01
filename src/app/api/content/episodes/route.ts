// src/app/api/content/episodes/route.ts
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const tmdbId = searchParams.get('tmdb_id');
  const season = searchParams.get('season') || '1';

  if (!tmdbId) {
    return NextResponse.json({ success: false, error: 'tmdb_id is required' }, { status: 400 });
  }

  const bearerToken = process.env.TMDB_READ_ACCESS_TOKEN;
  if (!bearerToken) {
    return NextResponse.json({ success: false, error: 'TMDB token not configured' }, { status: 500 });
  }

  try {
    const url = `https://api.themoviedb.org/3/tv/${tmdbId}/season/${season}?language=es-ES`;
    const res = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${bearerToken}`,
        'Accept': 'application/json',
      },
      next: { revalidate: 86400 }
    });

    if (res.ok) {
      const data = await res.json();
      const items = data.episodes.map((ep: any) => ({
        season: ep.season_number,
        episode: ep.episode_number,
        title: ep.name,
        overview: ep.overview,
        still_path: ep.still_path
      }));
      return NextResponse.json({ success: true, items });
    }

    return NextResponse.json({ success: false, error: 'Not found in TMDB' }, { status: 404 });
  } catch (error: any) {
    console.error('Episodes API error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
