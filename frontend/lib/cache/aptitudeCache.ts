/**
 * Lightweight in-memory client cache with TTL
 * Avoids redundant network round-trips for static question bank content
 */

interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

class AptitudeCache {
  private cache: Map<string, CacheEntry<unknown>> = new Map();
  private defaultTTL: number = 10 * 60 * 1000; // 10 minutes

  get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    if (!entry) return null;
    if (Date.now() - entry.timestamp > this.defaultTTL) {
      this.cache.delete(key);
      return null;
    }
    return entry.data as T;
  }

  set<T>(key: string, data: T, customTTL?: number): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now() + (customTTL ? customTTL - this.defaultTTL : 0),
    });
  }

  invalidate(pattern?: string): void {
    if (!pattern) {
      this.cache.clear();
      return;
    }
    for (const key of this.cache.keys()) {
      if (key.includes(pattern)) {
        this.cache.delete(key);
      }
    }
  }
}

export const aptitudeCache = new AptitudeCache();
