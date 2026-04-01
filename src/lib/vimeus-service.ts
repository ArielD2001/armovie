// src/lib/vimeus-service.ts
// Server-side only — uses Node.js and server-side APIs
import { VimeusItem, cleanTitleUtils } from './vimeus-client';
import { getFromCache, setCache } from './cache';

const API_KEY = process.env.VIMEUS_API_KEY;
const BASE_URL = process.env.VIMEUS_BASE_URL || 'https://vimeus.com';
const VIEW_KEY = process.env.NEXT_PUBLIC_VIMEUS_VIEW_KEY || 'DRW0F8mcdTD5gDB95cdtmxzou1XPTnsNL7VUeaAsPXU';

export type { VimeusItem };
export const cleanTitle = cleanTitleUtils;

// The Vimeus API returns: { error, message, data: [...items] }
// Each item has: tmdb_id, title, embed_url, download_url, quality
// NOTE: No poster/backdrop from the API — we build those from TMDB image CDN

// Build embed URL from our view_key (override the one from the API to avoid key leaks)
function buildEmbedUrl(tmdbId: number | string, type: 'movie' | 'series' | 'anime'): string {
  const path = type === 'movie' ? 'movie' : 'serie';
  return `https://vimeus.com/e/${path}?tmdb=${tmdbId}&view_key=${VIEW_KEY}`;
}

// Try to get an IMDB-derived poster via TMDB redirect (no API key needed)
// Returns a TMDB image URL for the given tmdbId or null
async function getPosterUrl(tmdbId: string, type: 'movie' | 'series' | 'anime'): Promise<string | null> {
  const cacheKey = `poster_${type}_${tmdbId}`;
  const cached = getFromCache(cacheKey);
  if (cached) return cached as string;
  
  try {
    // Use the unofficial TMDB image redirect — works without an API key
    const category = type === 'movie' ? 'movie' : 'tv';
    const res = await fetch(
      `https://api.tmdb.org/3/${category}/${tmdbId}?api_key=&append_to_response=`,
      { signal: AbortSignal.timeout(3000) }
    );
    if (res.ok) {
      const d = await res.json();
      const poster = d.poster_path || null;
      const backdrop = d.backdrop_path || null;
      if (poster) {
        setCache(`poster_${type}_${tmdbId}`, poster);
        setCache(`backdrop_${type}_${tmdbId}`, backdrop);
      }
      return poster;
    }
  } catch {
    // Poster fetch failed — that's ok, UI will show placeholder
  }
  return null;
}

// Normalize a raw Vimeus item to our VimeusItem shape
function normalizeItem(raw: any, contentType: 'movie' | 'series' | 'anime'): VimeusItem {
  const tmdbId = parseInt(String(raw.tmdb_id));
  return {
    tmdb_id: tmdbId,
    title: cleanTitleUtils(raw.title || 'Contenido'),
    embed_url: buildEmbedUrl(tmdbId, contentType),
    content_type: contentType,
    poster: raw.poster || null,
    backdrop: raw.backdrop || null,
    overview: raw.overview || null,
  };
}

// Extract the items array from various Vimeus API response shapes
function extractItems(data: any): any[] {
  // The real API: { error, message, data: [...] }
  if (Array.isArray(data.data)) return data.data;
  if (Array.isArray(data)) return data;
  if (data.data && typeof data.data === 'object') {
    const d = data.data;
    const extracted = d.result || d.movies || d.series || d.animes || d.items;
    if (Array.isArray(extracted)) return extracted;
  }
  return data.result || data.movies || data.series || data.animes || data.items || [];
}

export const vimeusFetch = async (
  endpoint: string,
  params: Record<string, string | number | undefined> = {}
) => {
  const url = new URL(`${BASE_URL}${endpoint}`);
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined) url.searchParams.append(key, value.toString());
  });
  const response = await fetch(url.toString(), {
    headers: {
      Accept: 'application/json',
      'X-API-Key': API_KEY || '',
    },
    next: { revalidate: 3600 },
  });
  if (!response.ok) {
    throw new Error(`Vimeus API error [${response.status}]: ${response.statusText}`);
  }
  return response.json();
};

export const getEpisodes = (tmdbId: number, season?: number) =>
  vimeusFetch('/api/listing/episodes', { tmdb_id: tmdbId, season });

// Get a listing page and return normalized VimeusItems
export const getListing = async (
  type: 'movie' | 'series' | 'anime',
  page = 1
): Promise<VimeusItem[]> => {
  const endpointMap = { movie: '/api/listing/movies', series: '/api/listing/series', anime: '/api/listing/animes' };
  const data = await vimeusFetch(endpointMap[type], { page });
  const raw = extractItems(data);
  return raw.map((item: any) => normalizeItem(item, type));
};

// Find a specific content item by TMDB ID, scanning up to 5 pages
// The Vimeus API returns 100 items per page, so 5 pages covers 500 items
export const findByTmdbId = async (
  tmdbId: string,
  type: 'movie' | 'series' | 'anime'
): Promise<VimeusItem | null> => {
  const cacheKey = `find_${type}_${tmdbId}`;
  const cached = getFromCache(cacheKey);
  if (cached) return cached as VimeusItem;

  for (let page = 1; page <= 5; page++) {
    try {
      const items = await getListing(type, page);
      const found = items.find((i) => String(i.tmdb_id) === String(tmdbId));
      if (found) {
        const result = { ...found, embed_url: buildEmbedUrl(tmdbId, type), content_type: type };
        setCache(cacheKey, result);
        return result;
      }
      // API returns 100 items per page; fewer means last page
      if (items.length < 100) break;
    } catch (err) {
      console.error(`Page ${page} fetch error for ${type}:`, err);
      break;
    }
  }

  // Not found in listings — return minimal item so the player still works
  return {
    tmdb_id: parseInt(tmdbId),
    title: 'Cargando...',
    embed_url: buildEmbedUrl(tmdbId, type),
    content_type: type,
    poster: undefined,
    backdrop: undefined,
  };
};

export async function getTMDBMetadata(tmdbId: string, type: 'movie' | 'series') {
  const tmdbType = type === 'movie' ? 'movie' : 'tv';
  const bearerToken = process.env.TMDB_READ_ACCESS_TOKEN;
  
  if (!bearerToken) return null;

  try {
    const url = `https://api.themoviedb.org/3/${tmdbType}/${tmdbId}?language=es-ES`;
    const res = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${bearerToken}`,
        'Accept': 'application/json',
      },
      next: { revalidate: 86400 },
    });

    if (res.ok) {
      const data = await res.json();
      return {
        title: data.title || data.name,
        overview: data.overview,
        poster_path: data.poster_path,
        backdrop_path: data.backdrop_path,
      };
    }
  } catch (error) {
    console.error('TMDB Metadata fetch error:', error);
  }
  return null;
}

