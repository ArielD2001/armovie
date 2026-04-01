// src/components/content/MovieCard.tsx
"use client";

import Link from 'next/link';
import Image from 'next/image';
import { Play, Plus, Film } from 'lucide-react';
import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { VimeusItem, getImageUrl, cleanTitleUtils as cleanTitle } from '@/lib/vimeus-client';

interface MovieCardProps {
  item: VimeusItem;
  priority?: boolean;
}

export const MovieCard = ({ item: initialItem, priority = false }: MovieCardProps) => {
  const [item, setItem] = useState<VimeusItem>(initialItem);
  const [isHovered, setIsHovered] = useState(false);
  const [posterLoading, setPosterLoading] = useState(!initialItem.poster);

  useEffect(() => {
    setItem(initialItem);
    if (!initialItem.poster && initialItem.tmdb_id) {
      setPosterLoading(true);
      const type = initialItem.content_type === 'movie' ? 'movie' : 'series';
      fetch(`/api/content/poster?tmdb_id=${initialItem.tmdb_id}&type=${type}`)
        .then(r => r.json())
        .then(data => {
          if (data.success && (data.poster || data.backdrop)) {
            setItem(prev => ({
              ...prev,
              poster: data.poster || prev.poster,
              backdrop: data.backdrop || prev.backdrop,
              overview: data.overview || prev.overview,
              vote_average: data.vote_average || prev.vote_average,
              release_date: data.release_date || prev.release_date,
              title: data.title ? cleanTitle(data.title) : prev.title,
            }));
          }
        })
        .catch(() => {})
        .finally(() => setPosterLoading(false));
    } else {
      setPosterLoading(false);
    }
  }, [initialItem]);

  const posterUrl = getImageUrl(item.poster, 'w500');
  const detailUrl = `/${item.content_type === 'movie' ? 'movie' : 'series'}/${item.tmdb_id}`;
  return (
    <Link
      href={detailUrl}
      className="relative block aspect-[2/3] rounded-xl overflow-hidden cursor-pointer group bg-zinc-900 border border-white/5 hover:z-50"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Image / Placeholder */}
      <div className="absolute inset-0 transition-transform duration-500 group-hover:scale-105">
        {posterUrl ? (
          <Image
            src={posterUrl}
            alt={item.title}
            fill
            sizes="(max-width: 768px) 50vw, (max-width: 1200px) 25vw, 20vw"
            className="object-cover"
            priority={priority}
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center p-6 bg-gradient-to-br from-zinc-800 via-zinc-900 to-black text-center relative overflow-hidden">
            <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,_#3b82f6_0%,_transparent_70%)]" />
            <Film className={cn("w-10 h-10 text-blue-500/40 mb-4 relative z-10", posterLoading && "animate-pulse")} />
            <h3 className="text-xs font-bold text-zinc-400 line-clamp-3 relative z-10 tracking-wide leading-relaxed">
              {cleanTitle(item.title)}
            </h3>
          </div>
        )}
      </div>

      {/* Hover Overlay */}
      <div className={cn(
        "absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent transition-opacity duration-300 flex flex-col justify-end p-4 z-20",
        isHovered ? "opacity-100" : "opacity-0"
      )}>
        <h3 className="text-white font-bold text-sm mb-3 line-clamp-2">{cleanTitle(item.title)}</h3>
        <div className="flex items-center gap-2">
          <button
            className="flex-1 bg-white text-black py-2 rounded-lg flex items-center justify-center gap-1 text-xs font-black hover:bg-zinc-200 transition-colors"
            aria-label="Reproducir"
          >
            <Play className="w-3 h-3 fill-current" /> PLAY
          </button>
          <button
            className="p-2 bg-white/20 backdrop-blur-md rounded-lg hover:bg-white/30 transition-colors"
            aria-label="Añadir a lista"
          >
            <Plus className="w-4 h-4 text-white" />
          </button>
        </div>
      </div>
    </Link>
  );
};
