// src/app/watchlist/page.tsx
"use client";

import { WatchlistRow } from "@/components/content/WatchlistRow";
import { PageTransition } from "@/components/animations/PageTransition";
import { useWatchlistStore } from "@/store/useWatchlistStore";
import { useEffect, useState } from "react";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";

export default function WatchlistPage() {
  const { items } = useWatchlistStore();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) return null;

  return (
    <PageTransition>
      <main className="min-h-screen bg-zinc-950 pt-32 pb-20 px-8 md:px-24">
        <div className="max-w-[1440px] mx-auto">
          <div className="flex items-center gap-4 mb-12">
            <Link 
              href="/" 
              className="p-2 hover:bg-white/10 rounded-full transition-colors text-zinc-400 hover:text-white"
            >
              <ChevronLeft className="w-6 h-6" />
            </Link>
            <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tighter">
              Mi <span className="text-blue-500">Lista</span>
            </h1>
          </div>

          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center space-y-6 bg-white/5 border border-white/5 rounded-3xl">
              <div className="text-6xl">empty</div>
              <div className="space-y-2">
                <h2 className="text-2xl font-bold text-white">Tu lista está vacía</h2>
                <p className="text-zinc-500 max-w-sm">
                  Aún no has añadido ninguna película o serie a tu lista personal.
                </p>
              </div>
              <Link 
                href="/" 
                className="px-8 py-3 bg-blue-600 hover:bg-blue-500 rounded-full font-bold transition-all uppercase text-sm tracking-widest"
              >
                Explorar Contenido
              </Link>
            </div>
          ) : (
            <div className="-ml-8 md:-ml-24">
               <WatchlistRow />
            </div>
          )}
        </div>
      </main>
    </PageTransition>
  );
}
