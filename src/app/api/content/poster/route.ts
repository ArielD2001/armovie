// src/app/api/content/poster/route.ts
// Fetches poster/backdrop/metadata from TMDB v3 API using a Read Access Token (Bearer)
import { NextResponse } from 'next/server';
import { getFromCache, setCache } from '@/lib/cache';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const tmdbId = searchParams.get('tmdb_id');
  const rawType = searchParams.get('type') || 'movie';

  if (!tmdbId) {
    return NextResponse.json({ success: false, error: 'tmdb_id is required' }, { status: 400 });
  }

  const cacheKey = `tmdb_poster_${rawType}_${tmdbId}`;
  const cached = getFromCache(cacheKey);
  if (cached) {
    return NextResponse.json({ success: true, ...cached });
  }

  const tmdbType = rawType === 'movie' ? 'movie' : 'tv';

  // TMDB Read Access Token (Bearer) from environment variable
  const bearerToken = process.env.TMDB_READ_ACCESS_TOKEN;
  if (!bearerToken) {
    console.error('[poster] TMDB_READ_ACCESS_TOKEN is not set in environment');
    return NextResponse.json({ success: false, error: 'TMDB token not configured' }, { status: 500 });
  }

  const commonHeaders = {
    'Authorization': `Bearer ${bearerToken}`,
    'Accept': 'application/json',
  };

  try {
    // Try Spanish first, fallback to English
    const languages = ['es-ES', 'en-US'];

    for (const lang of languages) {
      try {
        const url = `https://api.themoviedb.org/3/${tmdbType}/${tmdbId}?language=${lang}&append_to_response=credits,videos`;
        const res = await fetch(url, {
          headers: commonHeaders,
          signal: AbortSignal.timeout(6000),
          next: { revalidate: 86400 }, // Cache at CDN level for 24h
        });

        if (res.ok) {
          const data = await res.json();
          // Only accept if we have at least a poster or backdrop
          if (data.poster_path || data.backdrop_path) {
            // Extract Cast
            const cast = data.credits?.cast?.slice(0, 10).map((c: any) => ({
              id: c.id,
              name: c.name,
              character: c.character,
              profile_path: c.profile_path
            })) || [];

            // Extract Trailer
            const trailer = data.videos?.results?.find((v: any) => v.type === 'Trailer' && v.site === 'YouTube')?.key || null;

            // Extract Director
            const director = data.credits?.crew?.find((c: any) => c.job === 'Director')?.name || null;

            // Extract Genres
            const genres = data.genres?.map((g: any) => g.name) || [];

            const result = {
              poster: data.poster_path || null,
              backdrop: data.backdrop_path || null,
              title: data.title || data.name || null,
              overview: data.overview || null,
              vote_average: data.vote_average ?? null,
              release_date: data.release_date || data.first_air_date || null,
              number_of_seasons: data.number_of_seasons || null,
              status: data.status || null,
              runtime: data.runtime || data.episode_run_time?.[0] || null,
              cast,
              trailer,
              director,
              genres,
            };
            setCache(cacheKey, result);
            return NextResponse.json({ success: true, ...result });
          }
        } else {
          console.warn(`[poster] TMDB ${tmdbType}/${tmdbId} lang=${lang} status=${res.status}`);
        }
      } catch {
        continue;
      }
    }

    return NextResponse.json({ success: false, error: 'Not found in TMDB' }, { status: 404 });
  } catch (error: any) {
    console.error('[poster] Unexpected error:', error.message);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
