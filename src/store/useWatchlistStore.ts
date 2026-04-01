// src/store/useWatchlistStore.ts
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { VimeusItem } from '@/lib/vimeus-client';

interface WatchlistState {
  items: VimeusItem[];
  addItem: (item: VimeusItem) => void;
  removeItem: (tmdbId: number) => void;
  isInWatchlist: (tmdbId: number) => boolean;
}

export const useWatchlistStore = create<WatchlistState>()(
  persist(
    (set, get) => ({
      items: [],
      addItem: (item: VimeusItem) => {
        if (!get().isInWatchlist(item.tmdb_id)) {
          set((state) => ({ items: [item, ...state.items] }));
        }
      },
      removeItem: (tmdbId: number) => {
        set((state) => ({
          items: state.items.filter((i) => i.tmdb_id !== tmdbId),
        }));
      },
      isInWatchlist: (tmdbId: number) => {
        return get().items.some((i) => i.tmdb_id === tmdbId);
      },
    }),
    {
      name: 'armovie-watchlist-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
);
