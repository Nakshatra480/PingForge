interface CacheEntry {
  text: string;
  ts: number;
}

const cache = new Map<string, CacheEntry>();
const TTL = 30 * 60 * 1000;

export const getCached = (key: string): string | null => {
  const entry = cache.get(key);
  if (!entry) return null;
  if (Date.now() - entry.ts > TTL) {
    cache.delete(key);
    return null;
  }
  return entry.text;
};

export const setCache = (key: string, text: string): void => {
  cache.set(key, { text, ts: Date.now() });
};

export const createCacheKey = (...parts: string[]): string => {
  let hash = 0;
  const str = parts.join('|');
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash |= 0;
  }
  return hash.toString(36);
};
