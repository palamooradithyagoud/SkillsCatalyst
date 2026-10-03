/**
 * Lightweight in-memory client cache with explicit TTL and bounded capacity
 * Avoids redundant network round-trips for static question bank content
 */

interface CacheEntry<T> {
  data: T;
  expiresAt: number;
}

class AptitudeCache {
  private cache: Map<string, CacheEntry<unknown>> = new Map();
  private readonly defaultTTL: number = 10 * 60 * 1000; // 10 minutes
  private readonly maxEntries: number = 100; // Bound memory footprint

  get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    if (!entry) return null;

    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      return null;
    }

    return entry.data as T;
  }

  set<T>(key: string, data: T, customTTL?: number): void {
    if (data === null || data === undefined) return;

    // Remove if existing to refresh position
    if (this.cache.has(key)) {
      this.cache.delete(key);
    } else if (this.cache.size >= this.maxEntries) {
      // Evict oldest entry (first item in Map iterator)
      const oldestKey = this.cache.keys().next().value;
      if (oldestKey) this.cache.delete(oldestKey);
    }

    const ttl = customTTL && customTTL > 0 ? customTTL : this.defaultTTL;
    this.cache.set(key, {
      data,
      expiresAt: Date.now() + ttl,
    });
  }

  has(key: string): boolean {
    return this.get(key) !== null;
  }

  invalidate(pattern?: string): void {
    if (!pattern) {
      this.cache.clear();
      return;
    }
    for (const key of Array.from(this.cache.keys())) {
      if (key.includes(pattern)) {
        this.cache.delete(key);
      }
    }
  }

  size(): number {
    return this.cache.size;
  }
}

export const aptitudeCache = new AptitudeCache();
