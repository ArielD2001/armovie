// src/components/content/Hero.tsx
"use client";
import { useEffect, useState } from 'react';
import { Play, Info } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { VimeusItem, getImageUrl, cleanTitleUtils as cleanTitle } from '@/lib/vimeus-client';
import { Skeleton } from '../ui/Skeleton';

interface HeroProps {
  item: VimeusItem;
}

export const Hero = ({ item: initialItem }: HeroProps) => {
  const [item, setItem] = useState<VimeusItem | null>(initialItem);
  const [isLoading, setIsLoading] = useState(!initialItem?.backdrop);

  useEffect(() => {
    if (!initialItem) return;
    setItem(initialItem);
    
    // If the item lacks a backdrop/overview, fetch it from our TMDB proxy API
    if (!initialItem.backdrop || !initialItem.overview) {
      setIsLoading(true);
      const type = initialItem.content_type === 'movie' ? 'movie' : 'series';
      fetch(`/api/content/poster?tmdb_id=${initialItem.tmdb_id}&type=${type}`)
        .then(r => r.json())
        .then(data => {
          if (data.success) {
            setItem(prev => prev ? {
              ...prev,
              poster: data.poster || prev.poster,
              backdrop: data.backdrop || prev.backdrop,
              overview: data.overview || prev.overview,
              title: data.title ? cleanTitle(data.title) : prev.title
            } : prev);
          }
        })
        .finally(() => setIsLoading(false));
    } else {
      setIsLoading(false);
    }
  }, [initialItem]);

  if (!item) return null;

  if (isLoading) {
    return <Skeleton className="w-full min-h-[85vh] rounded-none" />;
  }

  const backdropUrl = getImageUrl(item.backdrop || item.poster, 'original');

  return (
    <div className="relative min-h-[90vh] md:h-[85vh] w-full overflow-hidden flex flex-col justify-end pb-20 md:pb-0 md:justify-center">
      {/* Background Image */}
      <div className="absolute inset-0 w-full h-full">
        {backdropUrl && (
          <Image
            src={backdropUrl}
            alt={item.title}
            fill
            className="object-cover"
            priority
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-r from-zinc-950 via-zinc-950/40 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-transparent to-transparent" />
      </div>

      {/* Content */}
      <div className="relative z-10 px-6 md:px-24 max-w-[1440px] mx-auto w-full pt-40 md:pt-0">
        <div className="max-w-2xl space-y-4 md:space-y-6">
          <span className="inline-block px-3 py-1 bg-blue-600 rounded text-[10px] font-black uppercase tracking-widest animate-in fade-in slide-in-from-left duration-700">
            Destacado
          </span>
          
          <h1 className="text-4xl sm:text-5xl md:text-7xl font-black tracking-tight leading-[1.05] md:leading-[0.95] drop-shadow-2xl animate-in fade-in slide-in-from-left duration-700 delay-100">
            {item.title}
          </h1>

          <p className="text-zinc-400 text-lg md:text-xl line-clamp-3 max-w-xl animate-in fade-in slide-in-from-left duration-700 delay-200">
            {item.overview || 'Descubre esta increíble historia ahora en exclusiva por ARMOVIE. Calidad 4K disponible.'}
          </p>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 md:gap-4 animate-in fade-in slide-in-from-left duration-700 delay-300 pt-2">
            <Link 
              href={`/${item.content_type === 'movie' ? 'movie' : 'series'}/${item.tmdb_id}`}
              className="btn-premium btn-primary text-sm md:text-base px-10 flex justify-center"
            >
              <Play className="w-5 h-5 fill-current" /> Ver ahora
            </Link>
            <Link 
              href={`/${item.content_type === 'movie' ? 'movie' : 'series'}/${item.tmdb_id}`}
              className="btn-premium btn-secondary text-sm md:text-base flex justify-center"
            >
              <Info className="w-5 h-5" /> Más información
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
