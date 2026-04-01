// src/app/api/search/route.ts
// Proxy endpoint to TMDB /search/multi that builds normalized VimeusItem results
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get('q');
  
  if (!q) {
    return NextResponse.json({ success: false, error: 'q is required' }, { status: 400 });
  }

  const bearerToken = process.env.TMDB_READ_ACCESS_TOKEN;
  if (!bearerToken) {
    return NextResponse.json({ success: false, error: 'TMDB token not configured' }, { status: 500 });
  }

  try {
    const url = `https://api.themoviedb.org/3/search/multi?query=${encodeURIComponent(q)}&language=es-ES&page=1`;
    const res = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${bearerToken}`,
        'Accept': 'application/json',
      },
      next: { revalidate: 3600 } // Cache searches for 1 hour
    });

    if (res.ok) {
      const data = await res.json();
      
      // Filter out people and convert TMDB schema to our VimeusItem schema
      const items = data.results
        .filter((i: any) => i.media_type === 'movie' || i.media_type === 'tv')
        .map((i: any) => {
           const type = i.media_type === 'movie' ? 'movie' : 'series';
           const VIEW_KEY = process.env.NEXT_PUBLIC_VIMEUS_VIEW_KEY || 'DRW0F8mcdTD5gDB95cdtmxzou1XPTnsNL7VUeaAsPXU';
           const embedBase = type === 'movie' ? 'movie' : 'serie';
           const embed_url = `https://vimeus.com/e/${embedBase}?tmdb=${i.id}&view_key=${VIEW_KEY}`;

           return {
              tmdb_id: i.id,
              title: i.title || i.name,
              content_type: type,
              poster: i.poster_path,
              backdrop: i.backdrop_path,
              overview: i.overview,
              vote_average: i.vote_average,
              release_date: i.release_date || i.first_air_date,
              embed_url
           };
        });

      return NextResponse.json({ success: true, items });
    }

    return NextResponse.json({ success: false, error: 'TMDB search failed' }, { status: 500 });
  } catch (error: any) {
    console.error('Search API error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
