// src/app/explore/page.tsx
"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { MovieCard } from "@/components/content/MovieCard";
import { Skeleton } from "@/components/ui/Skeleton";
import { VimeusItem } from "@/lib/vimeus-client";
import { Filter, Search as SearchIcon } from "lucide-react";
import { cn } from "@/lib/utils";

function ExploreContent() {
  const searchParams = useSearchParams();
  const initialType = searchParams.get('type') || 'movies';
  const query = searchParams.get('q') || '';
  const genreId = searchParams.get('genreId') || '';
  const genreName = searchParams.get('genreName') || '';

  const [items, setItems] = useState<VimeusItem[]>([]);
  const [type, setType] = useState(initialType);
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState(query);

  // Reset page when search or category changes
  useEffect(() => {
     setPage(1);
  }, [query, genreId]);

  useEffect(() => {
    const fetchExplore = async () => {
      setIsLoading(true);
      try {
        if (query) {
           const res = await fetch(`/api/search?q=${encodeURIComponent(query)}&page=${page}`);
           const data = await res.json();
           if (data.success) setItems(data.items);
        } else if (genreId) {
           const res = await fetch(`/api/discover?genreId=${genreId}&type=${type}&page=${page}`);
           const data = await res.json();
           if (data.success) setItems(data.items);
        } else {
           const res = await fetch(`/api/content?type=${type}&page=${page}`);
           const data = await res.json();
           if (data.success) setItems(data.items);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchExplore();
  }, [type, page, query, genreId]);

  const handleSearchKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
     if (e.key === 'Enter') {
        const url = new URL(window.location.href);
        if (searchTerm.trim()) {
           url.searchParams.set('q', searchTerm.trim());
        } else {
           url.searchParams.delete('q');
        }
        window.history.pushState({}, '', url.toString());
        // Forcing a rerender since Next 13 useSearchParams is reactive to pushState in some setups, but safe way is to reload or just rely on router
        window.location.href = url.toString();
     }
  };

  return (
    <div className="pt-24 min-h-screen px-8 md:px-24 max-w-[1440px] mx-auto pb-20">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
        <h1 className="text-3xl md:text-4xl font-black tracking-tight uppercase">
          {genreName ? `Género: ${genreName}` : query ? `Búsqueda: ${query}` : 'Explorar'}
          <span className="text-blue-500 ml-3">{type === 'movies' ? 'Películas' : (type === 'series' ? 'Series' : 'Anime')}</span>
        </h1>

        <div className="flex items-center gap-4 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
            <input
              type="text"
              placeholder="Buscar por título..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={handleSearchKeyPress}
              className="w-full bg-white/5 border border-white/10 rounded-lg pl-10 pr-4 py-2 text-sm focus:border-blue-500 outline-none transition-all"
            />
          </div>

          <button className="p-2 bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 transition-colors">
            <Filter className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Tabs */}
      {(!query) && (
        <div className="flex gap-4 mb-8 overflow-x-auto pb-2 hide-scrollbar">
          {['movies', 'series', 'animes'].map((t) => (
            <button
              key={t}
              onClick={() => { setType(t); setPage(1); }}
              className={`px-6 py-2 rounded-full text-sm font-bold transition-all whitespace-nowrap ${type === t ? 'bg-blue-600 text-white' : 'bg-white/5 text-zinc-400 hover:bg-white/10'
                }`}
            >
              {t === 'movies' ? 'Películas' : (t === 'series' ? 'Series' : 'Anime')}
            </button>
          ))}
        </div>
      )}

      {/* Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
        {isLoading ? (
          Array(12).fill(0).map((_, i) => (
            <Skeleton key={i} className="aspect-[2/3] rounded-lg" />
          ))
        ) : items.length > 0 ? (
          items.map((item) => (
            <MovieCard key={item.tmdb_id} item={item} />
          ))
        ) : (
          <div className="col-span-full py-20 text-center text-zinc-500">
            No se encontraron resultados para "{query || type}"
          </div>
        )}
      </div>

      {/* Pagination - Now works everywhere */}
      {!isLoading && items.length > 0 && (
        <div className="flex justify-center items-center mt-16 gap-2">
          <button
            disabled={page === 1}
            onClick={() => { setPage(p => p - 1); window.scrollTo(0, 0); }}
            className="w-10 h-10 flex items-center justify-center bg-white/5 rounded-lg disabled:opacity-30 hover:bg-white/10 transition-colors"
          >
            ←
          </button>

          <div className="flex items-center gap-1">
            {[...Array(page + 2)].map((_, i) => {
              const p = i + 1;
              if (p < page - 1 || p > page + 1) return null;
              return (
                <button
                  key={p}
                  onClick={() => { setPage(p); window.scrollTo(0, 0); }}
                  className={cn(
                    "w-10 h-10 rounded-lg text-sm font-bold transition-all",
                    page === p ? "bg-blue-600 text-white" : "bg-white/5 text-zinc-400 hover:bg-white/10"
                  )}
                >
                  {p}
                </button>
              )
            })}
          </div>

          <button
            onClick={() => { setPage(p => p + 1); window.scrollTo(0, 0); }}
            className="w-10 h-10 flex items-center justify-center bg-white/5 rounded-lg hover:bg-white/10 transition-colors"
          >
            →
          </button>
        </div>
      )}
    </div>
  );
}

export default function ExplorePage() {
  return (
    <Suspense fallback={<div className="pt-24 px-16"><Skeleton className="h-10 w-48 mb-12" /><div className="grid grid-cols-6 gap-6"><Skeleton className="aspect-[2/3]" /><Skeleton className="aspect-[2/3]" /></div></div>}>
      <ExploreContent />
    </Suspense>
  );
}
