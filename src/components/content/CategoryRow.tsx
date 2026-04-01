// src/components/content/CategoryRow.tsx
"use client";
import Link from "next/link";
import { Film, Swords, Laugh, Ghost, Rocket, Heart, Zap, Music } from "lucide-react";

export const CategoryRow = () => {
  const categories = [
    { name: "Acción", id: 28, icon: Swords, color: "from-red-500/20 to-orange-500/20" },
    { name: "Comedia", id: 35, icon: Laugh, color: "from-yellow-400/20 to-amber-500/20" },
    { name: "Terror", id: 27, icon: Ghost, color: "from-zinc-700/50 to-zinc-900/80" },
    { name: "Ciencia Ficción", id: 878, icon: Rocket, color: "from-blue-500/20 to-cyan-500/20" },
    { name: "Romance", id: 10749, icon: Heart, color: "from-pink-500/20 to-rose-500/20" },
    { name: "Animación", id: 16, icon: Zap, color: "from-purple-500/20 to-indigo-500/20" },
    { name: "Drama", id: 18, icon: Film, color: "from-emerald-500/20 to-teal-500/20" },
    { name: "Musical", id: 10402, icon: Music, color: "from-fuchsia-500/20 to-pink-500/20" },
  ];

  return (
    <div className="relative flex flex-col space-y-4 pt-4">
      <h2 className="text-xl md:text-2xl font-bold px-8 md:px-24 text-zinc-100 tracking-tight">
        Explorar por Género
      </h2>
      <div className="flex gap-4 overflow-x-auto overflow-y-hidden px-8 md:px-24 hide-scrollbar pb-4 pt-2">
        {categories.map((cat, i) => (
          <Link
            key={i}
            href={`/explore?genreId=${cat.id}&genreName=${encodeURIComponent(cat.name)}`}
            className={`flex-none w-40 md:w-52 h-24 rounded-xl bg-gradient-to-br ${cat.color} border border-white/5 flex flex-col items-center justify-center gap-2 hover:scale-105 hover:border-white/20 transition-all group`}
          >
            <cat.icon className="w-6 h-6 text-zinc-300 group-hover:text-white transition-colors" />
            <span className="font-bold text-sm text-zinc-300 group-hover:text-white transition-colors">{cat.name}</span>
          </Link>
        ))}
      </div>
    </div>
  );
};
