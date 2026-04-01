// src/components/content/DetailView.tsx
"use client";

import { useEffect, useState, useRef } from "react";
import { Play, Plus, Star, Calendar, Check, Loader2, X, Video } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { VimeusItem, getImageUrl, getBackupEmbedUrl } from "@/lib/vimeus-client";
import { Skeleton } from "@/components/ui/Skeleton";
import { MovieRow } from "./MovieRow";
import { useWatchlistStore } from "@/store/useWatchlistStore";

interface DetailViewProps {
  id: string;
  type: 'movie' | 'series' | 'anime';
}

export const DetailView = ({ id, type }: DetailViewProps) => {
  const [item, setItem] = useState<VimeusItem | null>(null);
  const [episodes, setEpisodes] = useState<any[]>([]);
  const [recommendations, setRecommendations] = useState<VimeusItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedSeason, setSelectedSeason] = useState(1);
  const [numberOfSeasons, setNumberOfSeasons] = useState(1);
  const [isMounted, setIsMounted] = useState(false);

  const { addItem, removeItem, isInWatchlist } = useWatchlistStore();
  const isItemInWatchlist = item ? isInWatchlist(item.tmdb_id) : false;

  const [showTrailer, setShowTrailer] = useState(false);
  const [activeEpisode, setActiveEpisode] = useState<{ s: number; e: number } | null>(null);
  const playerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let isMounted = true;
    const fetchDetails = async () => {
      setIsLoading(true);
      try {
        const apiType = type === 'movie' ? 'movies' : type;
        const res = await fetch(`/api/content?type=${apiType}&tmdb_id=${id}`);
        const data = await res.json();

        if (!isMounted) return;
        if (data.success && data.item) {
          setItem(data.item);

          // Background fetch recommendations
          fetch(`/api/content?type=${apiType}&page=1`)
            .then(r => r.json())
            .then(d => {
              if (isMounted && d.success && d.items) {
                setRecommendations(d.items.filter((i: any) => String(i.tmdb_id) !== String(id)).slice(0, 10));
              }
            }).catch(() => { });

          // Enrich with TMDB poster/backdrop/overview + seasons
          const posterType = type === 'movie' ? 'movie' : 'series';
          fetch(`/api/content/poster?tmdb_id=${id}&type=${posterType}`)
            .then(r => r.json())
            .then(pData => {
              if (isMounted && pData.success) {
                if (pData.number_of_seasons) setNumberOfSeasons(pData.number_of_seasons);
                setItem(prev => prev ? {
                  ...prev,
                  poster: pData.poster || prev.poster,
                  backdrop: pData.backdrop || prev.backdrop,
                  overview: pData.overview || prev.overview,
                  vote_average: pData.vote_average || prev.vote_average,
                  release_date: pData.release_date || prev.release_date,
                  title: pData.title || prev?.title || 'Contenido',
                  status: pData.status,
                  runtime: pData.runtime,
                  director: pData.director,
                  genres: pData.genres,
                  cast: pData.cast,
                  trailer: pData.trailer,
                } : prev);
              }
            })
            .catch(() => { });
        }
      } catch (err) {
        console.error("Detail fetch failed:", err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };
    fetchDetails();
    setIsMounted(true);
    return () => { isMounted = false; };
  }, [id, type]);

  // Fetch episodes separately when season changes
  useEffect(() => {
    let isMounted = true;
    if (type !== 'movie' && item) {
      fetch(`/api/content/episodes?tmdb_id=${id}&season=${selectedSeason}`)
        .then(r => r.json())
        .then(epData => {
          if (isMounted && epData.success) {
            setEpisodes(epData.items || []);
          }
        }).catch(() => { });
    }
    return () => { isMounted = false; };
  }, [id, selectedSeason, type, item]);

  const handlePlay = (season?: number, episode?: number) => {
    if (season !== undefined && episode !== undefined) {
      setActiveEpisode({ s: season, e: episode });
    }
    setShowPlayer(true);
    setTimeout(() => {
      playerRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 100);
  };

  const handleToggleWatchlist = () => {
    if (!item) return;
    if (isItemInWatchlist) {
      removeItem(item.tmdb_id);
    } else {
      addItem(item);
    }
  };

  if (isLoading) {
    return (
      <div className="pt-24 px-8 md:px-24 space-y-6 max-w-[1440px] mx-auto">
        <Skeleton className="h-[55vh] rounded-2xl w-full" />
        <div className="grid grid-cols-3 gap-4">
          <Skeleton className="h-8 rounded-lg col-span-2" />
          <Skeleton className="h-8 rounded-lg" />
        </div>
      </div>
    );
  }

  if (!item) {
    return (
      <div className="pt-32 text-center text-zinc-400 flex flex-col items-center gap-4">
        <span className="text-6xl">😕</span>
        <h2 className="text-2xl font-bold">Contenido no encontrado</h2>
        <p className="text-zinc-500">No pudimos encontrar este contenido. Intenta desde el inicio.</p>
      </div>
    );
  }

  const backdropUrl = getImageUrl(item.backdrop || item.poster, 'original');
  const posterUrl = getImageUrl(item.poster, 'w500');

  const VIEW_KEY = process.env.NEXT_PUBLIC_VIMEUS_VIEW_KEY || 'DRW0F8mcdTD5gDB95cdtmxzou1XPTnsNL7VUeaAsPXU';
  const embedBase = type === 'movie' ? 'movie' : (type === 'series' ? 'serie' : 'anime');

  const currentEmbedUrl = activeEpisode
    ? `https://vimeus.com/e/${embedBase}?tmdb=${item.tmdb_id}&se=${activeEpisode.s}&ep=${activeEpisode.e}&view_key=${VIEW_KEY}`
    : item.embed_url || `https://vimeus.com/e/${embedBase}?tmdb=${item.tmdb_id}&view_key=${VIEW_KEY}`;

  const seasonsArray = Array.from({ length: numberOfSeasons }, (_, i) => i + 1);

  return (
    <div className="min-h-screen pb-20">
      {/* Hero Section */}
      <div className="relative h-[70vh] w-full bg-zinc-950">
        {backdropUrl && (
          <Image
            src={backdropUrl}
            alt={item.title}
            fill
            className="object-cover opacity-35"
            priority
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-r from-zinc-950 via-zinc-950/80 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-transparent to-zinc-950/40" />

        <div className="relative h-full flex items-end px-8 md:px-24 pb-12 max-w-[1440px] mx-auto">
          <div className="flex gap-8 items-end w-full max-w-5xl">
            {/* Poster */}
            {posterUrl && (
              <div className="hidden md:block flex-shrink-0 w-44 aspect-[2/3] rounded-xl overflow-hidden shadow-2xl border border-white/10">
                <Image src={posterUrl} alt={item.title} width={176} height={264} className="object-cover w-full h-full" />
              </div>
            )}

            {/* Info */}
            <div className="flex-1 space-y-4">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 bg-blue-600 rounded text-xs font-black uppercase tracking-wider">
                  {type === 'movie' ? 'Película' : type === 'series' ? 'Serie' : 'Anime'}
                </span>
                {item.release_date && (
                  <span className="text-zinc-400 text-sm font-medium">{item.release_date.split('-')[0]}</span>
                )}
                {(item.vote_average ?? 0) > 0 && (
                  <span className="flex items-center gap-1.5 text-zinc-300 text-sm font-medium pl-1">
                    <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                    {Number(item.vote_average).toFixed(1)}
                  </span>
                )}
                <span className="px-2 py-0.5 border border-white/20 rounded text-[10px] font-bold text-zinc-300 hidden sm:inline-block ml-1">HD</span>
              </div>
              <h1 className="text-4xl md:text-6xl font-black tracking-tight leading-none">{item.title}</h1>
              
              <div className="flex flex-wrap items-center gap-3 text-sm text-zinc-400 font-medium pb-1">
                {(item.genres?.length ?? 0) > 0 && <span className="text-blue-400">{item.genres?.join(', ')}</span>}
                {item.runtime && <span>• {item.runtime} min</span>}
                {item.status && <span className="hidden sm:inline-block">• {item.status}</span>}
                {item.director && <span>• Dir. {item.director}</span>}
              </div>

              <div className="flex flex-wrap gap-3 pt-2">
                <button onClick={() => handlePlay(type !== 'movie' ? 1 : undefined, type !== 'movie' ? 1 : undefined)} className="btn-premium btn-primary">
                  <Play className="w-5 h-5 fill-current" />
                  {type === 'movie' ? 'Ver Película' : 'Ver Serie'}
                </button>
                {item.trailer && (
                  <button onClick={() => setShowTrailer(true)} className="btn-premium bg-white/5 border-white/10 hover:bg-white/10 text-white justify-center border transition-all">
                    <Video className="w-5 h-5 text-red-500" />
                    Tráiler
                  </button>
                )}
                {isMounted && (
                  <button
                    onClick={handleToggleWatchlist}
                    className="btn-premium btn-secondary"
                  >
                    {isItemInWatchlist ? (
                      <>
                        <Check className="w-5 h-5 text-green-400" />
                        En mi lista
                      </>
                    ) : (
                      <>
                        <Plus className="w-5 h-5" />
                        Mi Lista
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Overview / Synopsis - Now directly below the Hero */}
      {item.overview && (
        <div className="max-w-[1440px] mx-auto px-8 md:px-24 mt-10">
          <h2 className="text-2xl font-black uppercase tracking-tight mb-4">Sinopsis</h2>
          <p className="text-zinc-400 text-base leading-relaxed max-w-3xl">{item.overview}</p>
        </div>
      )}

      {/* Video Player Section */}
      {showPlayer && (
        <div
          ref={playerRef}
          className="max-w-[1440px] mx-auto px-8 md:px-24 mt-12 animate-in fade-in slide-in-from-bottom-4 duration-500"
        >
          {/* Now Playing Header */}
          <div className="mb-4">
            <h3 className="text-lg md:text-2xl font-bold text-zinc-200 flex items-center gap-2">
              <span className="w-1.5 h-6 bg-blue-600 rounded-full inline-block"></span>
              <span className="text-zinc-400 text-sm md:text-lg">Viendo:</span> <span className="text-white text-sm md:text-lg">{type === 'movie' ? item.title : `Temporada ${activeEpisode?.s} - Episodio ${activeEpisode?.e}`}</span>
            </h3>
          </div>

          <div className="flex flex-col lg:flex-row gap-6">
            <div className="flex-1 w-full">
              <div className="relative w-full aspect-video bg-zinc-900 rounded-xl overflow-hidden border border-white/10 shadow-2xl">
                <button
                  onClick={() => setShowPlayer(false)}
                  className="absolute top-4 right-4 z-[60] bg-black/50 hover:bg-white/20 p-2 rounded-full backdrop-blur-md transition-colors"
                  aria-label="Cerrar reproductor"
                >
                  <X className="w-5 h-5" />
                </button>
                <iframe
                  src={currentEmbedUrl}
                  className="w-full h-full"
                  allowFullScreen
                  allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
                  referrerPolicy="no-referrer-when-downgrade"
                  title={item.title}
                />
              </div>
            </div>
            <div className="w-full lg:w-[320px] flex-shrink-0 flex flex-col gap-4">
            </div>

            {/* Trending Sidebar 
            {recommendations.length > 0 && (
              <div className="w-full lg:w-[320px] flex-shrink-0 flex flex-col gap-4">
                <h3 className="text-sm font-black text-zinc-500 uppercase tracking-widest mb-1">Tendencias</h3>
                <div className="flex flex-col gap-3">
                  {recommendations.slice(0, 4).map(rec => (
                     <Link key={rec.tmdb_id} href={`/${rec.content_type === 'movie' ? 'movie' : 'series'}/${rec.tmdb_id}`} className="group flex gap-4 bg-white/5 border border-white/5 rounded-xl p-3 hover:bg-white/10 transition-all cursor-pointer shadow-lg hover:shadow-blue-900/10 hover:border-white/10">
                       <div className="w-[72px] h-[108px] rounded-lg bg-zinc-800 overflow-hidden relative flex-shrink-0">
                          {rec.poster ? (
                             <Image src={getImageUrl(rec.poster, 'w500')!} fill alt={rec.title} className="object-cover" unoptimized/>
                          ) : (
                             <div className="w-full h-full bg-zinc-800 flex items-center justify-center font-bold text-xs text-zinc-600">AR</div>
                          )}
                       </div>
                       <div className="flex-1 py-1 min-w-0 pr-2 flex flex-col justify-center">
                         <h4 className="text-[15px] font-bold text-zinc-200 line-clamp-2 leading-snug group-hover:text-blue-400 transition-colors">{rec.title}</h4>
                         {rec.release_date && <p className="text-[13px] text-zinc-500 mt-1.5 font-medium">{rec.release_date.split('-')[0]}</p>}
                       </div>
                     </Link>
                  ))}
                </div>
              </div>
            )}*/}
          </div>
        </div>
      )}

      {/* Episodes */}
      {type !== 'movie' && (
        <div className="max-w-[1440px] mx-auto px-8 md:px-24 mt-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-black uppercase tracking-tight">Episodios</h2>
            {seasonsArray.length > 1 && (
              <div className="flex items-center gap-2 overflow-x-auto hide-scrollbar">
                {seasonsArray.map(s => (
                  <button
                    key={s}
                    onClick={() => setSelectedSeason(s)}
                    className={`px-4 py-1.5 rounded-lg text-sm font-bold transition-colors whitespace-nowrap ${selectedSeason === s
                      ? 'bg-blue-600 text-white'
                      : 'bg-white/5 border border-white/10 hover:bg-white/10'
                      }`}
                  >
                    T{s}
                  </button>
                ))}
              </div>
            )}
          </div>
          <div className="grid gap-3">
            {episodes.length === 0 ? (
              <div className="py-8 text-center text-zinc-500 border border-dashed border-white/10 rounded-xl">
                Cargando episodios de la Temporada {selectedSeason}...
              </div>
            ) : episodes.map((ep) => (
              <button
                key={`${ep.season}-${ep.episode}`}
                onClick={() => handlePlay(ep.season, ep.episode)}
                className="flex items-center gap-4 p-4 bg-white/5 border border-white/5 rounded-xl hover:bg-white/10 transition-all text-left w-full group"
              >
                <div className="relative flex-shrink-0">
                  {ep.still_path ? (
                    <div className="w-32 h-20 bg-zinc-900 rounded-lg overflow-hidden relative hidden sm:block border border-white/5">
                      <Image
                        src={`https://image.tmdb.org/t/p/w300${ep.still_path}`}
                        alt={ep.title || `Episodio ${ep.episode}`}
                        fill
                        className="object-cover opacity-80 group-hover:opacity-100 transition-opacity"
                        unoptimized
                      />
                      <div className="absolute bottom-1 right-1 bg-black/70 backdrop-blur-sm px-1.5 py-0.5 rounded text-[10px] font-black text-white border border-white/10">
                        EP {ep.episode}
                      </div>
                    </div>
                  ) : (
                    <div className="w-12 h-12 bg-blue-600/20 border border-blue-500/30 rounded-lg flex items-center justify-center font-black text-lg text-blue-400 group-hover:bg-blue-600 group-hover:text-white transition-all">
                      {ep.episode}
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-[10px] font-black text-blue-500 uppercase tracking-widest sm:hidden">EP {ep.episode}</span>
                    <h3 className="font-bold text-base line-clamp-1">{ep.title || `Episodio ${ep.episode}`}</h3>
                  </div>
                  <p className="text-zinc-500 text-sm line-clamp-2">
                    {ep.overview || `Temporada ${ep.season} · Episodio ${ep.episode}`}
                  </p>
                </div>
                <Play className="w-6 h-6 text-blue-500 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Reparto Principal */}
      {item.cast && item.cast.length > 0 && (
        <div className="max-w-[1440px] mx-auto px-8 md:px-24 mt-16 mb-8">
          <h3 className="text-xl font-bold mb-6 text-zinc-100 flex items-center gap-3">
            <span className="w-1.5 h-6 bg-blue-600 rounded-full inline-block"></span>
            Reparto Principal
          </h3>
          <div className="flex gap-6 overflow-x-auto hide-scrollbar pb-4">
            {item.cast.map((actor: any) => (
              <div key={actor.id} className="flex-none w-28 text-center group">
                 <div className="w-24 h-24 mx-auto rounded-full bg-zinc-800 border border-white/10 overflow-hidden relative shadow-lg group-hover:border-blue-500 transition-colors mb-3">
                    {actor.profile_path ? (
                       <Image src={getImageUrl(actor.profile_path, 'w500')!} fill alt={actor.name} className="object-cover" unoptimized/>
                    ) : (
                       <div className="w-full h-full flex flex-col items-center justify-center text-zinc-600 text-[10px] font-bold">Sin foto</div>
                    )}
                 </div>
                 <h4 className="font-bold text-sm text-zinc-200 line-clamp-1">{actor.name}</h4>
                 <p className="text-xs text-zinc-500 line-clamp-1 mt-0.5">{actor.character}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recommendations */}
      {recommendations.length > 0 && (
        <div className="mt-16">
          <MovieRow title="Recomendados" items={recommendations} />
        </div>
      )}

      {/* Trailer Modal */}
      {showTrailer && item.trailer && (
        <div className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-sm flex items-center justify-center p-4">
           <div className="relative w-full max-w-5xl aspect-video bg-black rounded-2xl overflow-hidden border border-white/10 shadow-2xl animate-in zoom-in-95 duration-300">
              <button
                onClick={() => setShowTrailer(false)}
                className="absolute top-4 right-4 z-50 bg-black/50 hover:bg-white/20 p-2 rounded-full backdrop-blur-md transition-colors"
              >
                <X className="w-5 h-5 text-white" />
              </button>
              <iframe
                src={`https://www.youtube-nocookie.com/embed/${item.trailer}?autoplay=1&mute=1&rel=0&showinfo=0&controls=1&enablejsapi=1&origin=${typeof window !== 'undefined' ? window.location.origin : ''}`}
                className="w-full h-full"
                allowFullScreen
                allow="autoplay; encrypted-media; gyroscope; picture-in-picture"
                title="Trailer"
                referrerPolicy="strict-origin-when-cross-origin"
              />
           </div>
        </div>
      )}
    </div>
  );
};
