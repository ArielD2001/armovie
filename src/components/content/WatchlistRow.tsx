// src/components/content/WatchlistRow.tsx
"use client";
import { useEffect, useState } from "react";
import { MovieRow } from "./MovieRow";
import { useWatchlistStore } from "@/store/useWatchlistStore";

export const WatchlistRow = () => {
  const { items } = useWatchlistStore();
  const [isMounted, setIsMounted] = useState(false);

  // Avoid hydration mismatch by waiting for mount
  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted || items.length === 0) {
    return null;
  }

  return <MovieRow title="Mi Lista" items={items} />;
};
