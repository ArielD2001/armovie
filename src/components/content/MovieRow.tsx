// src/components/content/MovieRow.tsx
"use client";

import { useRef, useState } from 'react';
import { ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react';
import { VimeusItem } from '@/lib/vimeus-client';
import { MovieCard } from './MovieCard';
import { cn } from '@/lib/utils';
import Link from 'next/link';

interface MovieRowProps {
  title: string;
  items: VimeusItem[];
  isLoading?: boolean;
  exploreType?: 'movies' | 'series' | 'animes';
}

export const MovieRow = ({ title, items, isLoading = false, exploreType }: MovieRowProps) => {
  const rowRef = useRef<HTMLDivElement>(null);
  const [showArrows, setShowArrows] = useState(false);

  const scroll = (direction: 'left' | 'right') => {
    if (rowRef.current) {
      const { scrollLeft, clientWidth } = rowRef.current;
      const scrollTo = direction === 'left' ? scrollLeft - clientWidth : scrollLeft + clientWidth;
      rowRef.current.scrollTo({ left: scrollTo, behavior: 'smooth' });
    }
  };

  return (
    <div 
        className="space-y-4 mb-12 relative"
        onMouseEnter={() => setShowArrows(true)}
        onMouseLeave={() => setShowArrows(false)}
    >
      <div className="flex items-center justify-between px-8 md:px-24 mb-4">
        <h2 className="text-xl md:text-2xl font-bold text-zinc-100 tracking-tight">
          {title}
        </h2>
        {exploreType && (
          <Link 
             href={`/explore?type=${exploreType}`} 
             className="flex items-center gap-1.5 text-[11px] md:text-xs font-black uppercase tracking-widest text-zinc-400 hover:text-blue-500 transition-colors group"
          >
             Ver más 
             <ArrowRight className="w-4 h-4 text-zinc-600 group-hover:text-blue-500 transition-colors" />
          </Link>
        )}
      </div>

      <div className="relative">
        <button 
          onClick={() => scroll('left')}
          className={cn(
            "absolute left-0 top-0 bottom-0 z-[60] bg-black/60 w-16 items-center justify-center transition-opacity duration-300",
            showArrows ? "flex opacity-100" : "hidden opacity-0"
          )}
        >
          <ChevronLeft className="w-8 h-8 text-white" />
        </button>

        <div 
          ref={rowRef}
          className="flex gap-4 overflow-x-auto overflow-y-hidden px-8 md:px-24 hide-scrollbar scroll-smooth"
        >
          {isLoading ? (
             Array(8).fill(0).map((_, i) => (
                <div key={i} className="min-w-[200px] md:min-w-[240px] aspect-[2/3] rounded-lg bg-zinc-900 animate-shimmer" />
             ))
          ) : (
            items.map((item) => (
              <div key={item.tmdb_id} className="min-w-[120px] md:min-w-[140px] lg:min-w-[160px]">
                <MovieCard item={item} />
              </div>
            ))
          )}
        </div>

        <button 
          onClick={() => scroll('right')}
          className={cn(
            "absolute right-0 top-0 bottom-0 z-[60] bg-black/60 w-16 items-center justify-center transition-opacity duration-300",
            showArrows ? "flex opacity-100" : "hidden opacity-0"
          )}
        >
          <ChevronRight className="w-8 h-8 text-white" />
        </button>
      </div>
    </div>
  );
};
