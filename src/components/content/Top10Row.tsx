// src/components/content/Top10Row.tsx
"use client";

import { useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { VimeusItem } from "@/lib/vimeus-client";
import { MovieCard } from "./MovieCard";
import { Skeleton } from "../ui/Skeleton";

interface Top10RowProps {
  title: string;
  items: VimeusItem[];
  isLoading?: boolean;
}

export const Top10Row = ({ title, items, isLoading }: Top10RowProps) => {
  const rowRef = useRef<HTMLDivElement>(null);
  const [showArrows, setShowArrows] = useState(false);

  const scroll = (direction: "left" | "right") => {
    if (rowRef.current) {
      const { scrollLeft, clientWidth } = rowRef.current;
      const scrollAmount = clientWidth * 0.75;
      rowRef.current.scrollTo({
        left: direction === "left" ? scrollLeft - scrollAmount : scrollLeft + scrollAmount,
        behavior: "smooth",
      });
    }
  };

  const topItems = items.slice(0, 10);

  if (!isLoading && topItems.length === 0) return null;

  return (
    <div
      className="relative flex flex-col space-y-4"
      onMouseEnter={() => setShowArrows(true)}
      onMouseLeave={() => setShowArrows(false)}
    >
      <h2 className="text-xl md:text-2xl font-bold px-8 md:px-24 text-zinc-100 tracking-tight">
        {title}
      </h2>

      <div className="group relative w-full">
        {showArrows && (
          <>
            <button
              onClick={() => scroll("left")}
              className="absolute left-8 top-1/2 -translate-y-1/2 z-40 bg-black/50 p-2 rounded-full hover:bg-white/20 transition backdrop-blur-sm hidden md:block"
            >
              <ChevronLeft className="w-8 h-8 text-white" />
            </button>
            <button
              onClick={() => scroll("right")}
              className="absolute right-8 top-1/2 -translate-y-1/2 z-40 bg-black/50 p-2 rounded-full hover:bg-white/20 transition backdrop-blur-sm hidden md:block"
            >
              <ChevronRight className="w-8 h-8 text-white" />
            </button>
          </>
        )}

        <div
          ref={rowRef}
          className="flex gap-10 overflow-x-auto overflow-y-hidden px-8 md:px-24 hide-scrollbar scroll-smooth py-4"
        >
          {isLoading ? (
            Array(10).fill(0).map((_, i) => (
              <div key={i} className="flex-none w-40 md:w-48 lg:w-56 aspect-[2/3] relative">
                <Skeleton className="w-full h-full rounded-lg" />
              </div>
            ))
          ) : (
            topItems.map((item, index) => (
              <div key={item.tmdb_id} className="flex-none w-40 md:w-48 lg:w-56 relative group/card flex items-end justify-end">
                {/* Huge Number */}
                <div className="absolute -left-10 bottom-0 text-[120px] md:text-[180px] font-black leading-none tracking-tighter text-zinc-950 z-0 drop-shadow-[0_0_8px_rgba(255,255,255,0.4)] stroke-white" 
                     style={{ WebkitTextStroke: '2px rgba(255,255,255,0.3)' }}>
                  {index + 1}
                </div>
                {/* Poster Card */}
                <div className="w-[80%] h-full relative z-10 transition-transform duration-300 group-hover/card:-translate-y-2 group-hover/card:scale-105">
                  <MovieCard item={item} />
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
