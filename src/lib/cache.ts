// src/lib/cache.ts
// In-memory cache for Vercel (serverless friendliness)
const cache = new Map<string, any>();

export const setCache = (key: string, value: any) => {
  cache.set(key, { ...value, cached_at: new Date().toISOString() });
};

export const getFromCache = (key: string) => {
  return cache.get(key);
};

export const clearCache = () => {
  cache.clear();
};
