// src/app/page.tsx
"use client";

import { useEffect, useState } from "react";
import { Hero } from "@/components/content/Hero";
import { MovieRow } from "@/components/content/MovieRow";
import { Top10Sidebar } from "@/components/content/Top10Sidebar";
import { CategoryRow } from "@/components/content/CategoryRow";
import { WatchlistRow } from "@/components/content/WatchlistRow";
import { VimeusItem } from "@/lib/vimeus-client";
import { PageTransition } from "@/components/animations/PageTransition";

export default function Home() {
  const [movies, setMovies] = useState<VimeusItem[]>([]);
  const [series, setSeries] = useState<VimeusItem[]>([]);
  const [animes, setAnimes] = useState<VimeusItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);

        // Fetch in parallel for better performance
        const [moviesRes, seriesRes, animesRes] = await Promise.all([
          fetch('/api/content?type=movies').then(r => r.json()),
          fetch('/api/content?type=series').then(r => r.json()),
          fetch('/api/content?type=animes').then(r => r.json()),
        ]);

        if (moviesRes.success) setMovies(moviesRes.items);
        if (seriesRes.success) setSeries(seriesRes.items);
        if (animesRes.success) setAnimes(animesRes.items);

      } catch (error) {
        console.error("Failed to fetch content:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  // Featured item for the Hero (first movie or first item available)
  const featuredItem = movies[0] || series[0] || animes[0];

  return (
    <PageTransition>
      <main className="min-h-screen bg-zinc-950 pb-20">
        {/* Hero Section */}
        <Hero item={featuredItem} />

        {/* Magazine Layout Container */}
        <div className="relative z-20 max-w-[1440px] mx-auto px-6 md:px-24 -mt-8 md:-mt-12 flex flex-col xl:flex-row gap-8 lg:gap-12 items-start">
          
          {/* Main Content (Left Side - ~70%) */}
          <div className="flex-1 min-w-0 w-full space-y-12">
            
            {/* Watchlist - Shows conditionally if user is logged in and has items */}
            <div className="-ml-6 md:-ml-24">
              <WatchlistRow />
            </div>

            {/* Categories Grid */}
            <div className="-ml-6 md:-ml-24">
              <CategoryRow />
            </div>

            {/* New Releases */}
            <div className="-ml-6 md:-ml-24">
              <MovieRow
                title="Nuevos Estrenos en Películas"
                items={movies.slice(10)} // Skip Top 10
                isLoading={isLoading}
                exploreType="movies"
              />
            </div>

            {/* Promotional Banner */}
            <div className="py-4">
              <div className="relative w-full rounded-2xl overflow-hidden shadow-2xl bg-gradient-to-r from-blue-900 to-indigo-900 flex items-center p-8 md:p-14 border border-white/10 group">
                  <div className="absolute inset-0 bg-blue-900 opacity-80 z-0"></div>
                  <div 
                    className="absolute inset-0 opacity-40 mix-blend-overlay bg-[url('https://image.tmdb.org/t/p/original/m02cO6hEHT5N1k8F79qK27o5K9e.jpg')] bg-cover bg-center group-hover:scale-105 group-hover:opacity-50 transition-all duration-700 z-0"
                  />
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-950 via-blue-900/80 to-transparent z-10" />
                  
                  <div className="relative z-20">
                    <span className="px-2 py-0.5 bg-yellow-500 text-yellow-950 font-black text-[10px] uppercase tracking-widest rounded mb-3 inline-block">Especial</span>
                    <h3 className="text-2xl md:text-5xl font-black text-white mb-3 uppercase tracking-tight drop-shadow-2xl max-w-xl leading-tight">Maratón de Fin de Semana</h3>
                    <p className="text-blue-100 font-medium max-w-lg text-sm md:text-base drop-shadow-md leading-relaxed">
                      Las mejores películas y series para que no despegues del sofá. Descubre nuestras recomendaciones exclusivas hechas para ti.
                    </p>
                  </div>
              </div>
            </div>

            {/* Featured Series */}
            <div className="-ml-6 md:-ml-24">
              <MovieRow
                title="Series Destacadas"
                items={series}
                isLoading={isLoading}
                exploreType="series"
              />
            </div>

            {/* Anime */}
            <div className="-ml-6 md:-ml-24">
              <MovieRow
                title="Anime Sin Límites"
                items={animes}
                isLoading={isLoading}
                exploreType="animes"
              />
            </div>
            
          </div>

          {/* Sidebar (Right Side - ~30%) */}
          <Top10Sidebar items={movies} isLoading={isLoading} />
          
        </div>
      </main>
    </PageTransition>
  );
}
