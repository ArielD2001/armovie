// src/components/content/Top10Sidebar.tsx
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { TrendingUp } from "lucide-react";
import { VimeusItem, getImageUrl } from "@/lib/vimeus-client";
import { Skeleton } from "../ui/Skeleton";

interface Top10SidebarProps {
  items: VimeusItem[];
  isLoading?: boolean;
}

const Top10ItemCard = ({ movie, index }: { movie: VimeusItem; index: number }) => {
  const [posterUrl, setPosterUrl] = useState<string | null>(getImageUrl(movie.poster, 'w500'));

  useEffect(() => {
    let active = true;
    if (!movie.poster) {
      fetch(`/api/content/poster?tmdb_id=${movie.tmdb_id}&type=${movie.content_type}`)
        .then(r => r.json())
        .then(d => {
          if (active && d.success && d.poster) {
            setPosterUrl(getImageUrl(d.poster, 'w500'));
          }
        })
        .catch(() => {});
    }
    return () => { active = false; };
  }, [movie]);

  return (
    <Link 
      href={`/${movie.content_type === 'movie' ? 'movie' : 'series'}/${movie.tmdb_id}`} 
      className="flex gap-4 group items-center bg-white/0 hover:bg-white/5 p-2 -mx-2 rounded-xl transition-all"
    >
      <div className="text-2xl xl:text-3xl font-black italic text-zinc-700 w-8 text-center group-hover:text-blue-500 transition-colors">
        {index + 1}
      </div>
      <div className="w-16 xl:w-20 aspect-[2/3] rounded-lg bg-zinc-800 overflow-hidden relative flex-shrink-0 shadow-lg group-hover:shadow-blue-900/40 transition-shadow">
        {posterUrl ? (
          <Image src={posterUrl} fill alt={movie.title} className="object-cover" unoptimized/>
        ) : (
          <div className="w-full h-full bg-zinc-800 flex items-center justify-center font-bold text-xs text-zinc-600">AR</div>
        )}
      </div>
      <div className="flex-1 min-w-0 pr-2">
        <h4 className="font-bold text-sm xl:text-base text-zinc-200 line-clamp-2 leading-snug group-hover:text-blue-400 transition-colors">{movie.title}</h4>
        <div className="flex items-center gap-2 mt-2">
          {movie.release_date && <span className="text-xs text-zinc-500 font-medium">{movie.release_date.split('-')[0]}</span>}
          {(movie.vote_average ?? 0) > 0 && (
            <span className="text-xs bg-zinc-800 text-zinc-300 px-2 py-0.5 rounded font-bold border border-white/5">
              ⭐ {Number(movie.vote_average).toFixed(1)}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
};

export const Top10Sidebar = ({ items, isLoading }: Top10SidebarProps) => {
  const topItems = items.slice(0, 10);

  if (!isLoading && topItems.length === 0) return null;

  return (
    <div className="w-full xl:w-[320px] 2xl:w-[380px] flex-shrink-0">
      <div className="bg-zinc-900/50 backdrop-blur-md border border-white/10 rounded-2xl p-6 xl:sticky xl:top-24 shadow-2xl">
        <h3 className="text-lg xl:text-xl font-black uppercase tracking-tight mb-6 flex items-center gap-3 text-zinc-100">
          <TrendingUp className="w-6 h-6 text-blue-500" /> Top 10 Tendencias
        </h3>
        
        <div className="flex flex-col gap-5">
          {isLoading ? (
            Array(10).fill(0).map((_, i) => (
              <div key={i} className="flex gap-4 items-center">
                 <Skeleton className="w-8 h-8 rounded-full flex-shrink-0" />
                 <Skeleton className="w-16 h-24 rounded-lg flex-shrink-0" />
                 <div className="flex-1 space-y-2">
                    <Skeleton className="w-full h-4" />
                    <Skeleton className="w-1/2 h-3" />
                 </div>
              </div>
            ))
          ) : (
            topItems.map((movie, index) => (
              <Top10ItemCard key={movie.tmdb_id} movie={movie} index={index} />
            ))
          )}
        </div>
      </div>
    </div>
  );
};
