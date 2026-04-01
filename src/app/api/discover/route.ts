// src/app/api/discover/route.ts
// Proxy endpoint to TMDB /discover/movie and /discover/tv that builds normalized VimeusItem results
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const genreId = searchParams.get('genreId');
  const type = searchParams.get('type') || 'movies';
  const page = searchParams.get('page') || '1';
  
  if (!genreId) {
    return NextResponse.json({ success: false, error: 'genreId is required' }, { status: 400 });
  }

  const bearerToken = process.env.TMDB_READ_ACCESS_TOKEN;
  if (!bearerToken) {
    return NextResponse.json({ success: false, error: 'TMDB token not configured' }, { status: 500 });
  }

  try {
    const tmdbType = type === 'series' ? 'tv' : 'movie';
    const url = `https://api.themoviedb.org/3/discover/${tmdbType}?with_genres=${genreId}&language=es-ES&page=${page}&sort_by=popularity.desc`;
    
    const res = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${bearerToken}`,
        'Accept': 'application/json',
      },
      next: { revalidate: 3600 } 
    });

    if (res.ok) {
      const data = await res.json();
      
      const items = data.results.map((i: any) => {
           const VIEW_KEY = process.env.NEXT_PUBLIC_VIMEUS_VIEW_KEY || 'DRW0F8mcdTD5gDB95cdtmxzou1XPTnsNL7VUeaAsPXU';
           const embedBase = tmdbType === 'movie' ? 'movie' : 'serie';
           const embed_url = `https://vimeus.com/e/${embedBase}?tmdb=${i.id}&view_key=${VIEW_KEY}`;

           return {
              tmdb_id: i.id,
              title: i.title || i.name,
              content_type: tmdbType === 'movie' ? 'movie' : 'series',
              poster: i.poster_path,
              backdrop: i.backdrop_path,
              overview: i.overview,
              vote_average: i.vote_average,
              release_date: i.release_date || i.first_air_date,
              embed_url
           };
        });

      return NextResponse.json({ 
        success: true, 
        items,
        page: data.page,
        total_pages: data.total_pages 
      });
    }

    return NextResponse.json({ success: false, error: 'TMDB discover failed' }, { status: 500 });
  } catch (error: any) {
    console.error('Discover API error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
