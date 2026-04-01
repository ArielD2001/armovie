// src/lib/vimeus-client.ts

export interface VimeusItem {
  id?: number;
  tmdb_id: number;
  imdb_id?: string;
  title: string;
  poster?: string;
  backdrop?: string;
  embed_url: string;
  content_type: 'movie' | 'series' | 'anime';
  // Extra meta fields from scraper/cache/API
  vote_average?: number;
  release_date?: string;
  overview?: string;
  status?: string;
  runtime?: number;
  director?: string;
  trailer?: string;
  genres?: string[];
  cast?: {
    id: number;
    name: string;
    character: string;
    profile_path: string | null;
  }[];
}

export const getImageUrl = (path: string | undefined, size: 'w500' | 'original' = 'w500') => {
  if (!path) return null;
  if (path.startsWith('http')) return path;
  return `https://image.tmdb.org/t/p/${size}${path.startsWith('/') ? '' : '/'}${path}`;
};

export const cleanTitleUtils = (title: string) => {
  if (!title) return "";
  return title
    .split('(')[0]
    .split(' - ')[0]
    .split(' — ')[0]
    .split(' | ')[0]
    .trim();
};
export const getBackupEmbedUrl = (tmdbId: number, type: 'movie' | 'series' | 'anime', s?: number, e?: number) => {
  const isTV = type === 'series' || type === 'anime';
  if (isTV && s !== undefined && e !== undefined) {
    return `https://vidsrc.to/embed/tv/${tmdbId}/${s}/${e}`;
  }
  return `https://vidsrc.to/embed/movie/${tmdbId}`;
};
