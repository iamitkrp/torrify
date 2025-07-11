import { LRUCache } from 'lru-cache';
import { SearchResponse, CacheEntry } from '@/types';
import { generateCacheKey } from './utils';

class CacheManager {
  private cache: LRUCache<string, CacheEntry>;
  private readonly defaultTTL: number;
  private hits = 0;
  private misses = 0;

  constructor() {
    this.defaultTTL = parseInt(process.env.CACHE_TTL || '900000'); // 15 minutes default
    
    this.cache = new LRUCache<string, CacheEntry>({
      max: 1000, // Maximum number of cached entries
      ttl: this.defaultTTL, // Time to live in milliseconds
      updateAgeOnGet: true, // Reset TTL when item is accessed
      allowStale: false,
    });
  }

  /**
   * Get cached search results
   */
  get(query: string, sources: string[] = []): SearchResponse | null {
    const key = generateCacheKey(query, sources);
    const entry = this.cache.get(key);

    if (!entry) {
      return null;
    }

    // Check if entry has expired (additional safety check)
    if (Date.now() > entry.expiry) {
      this.cache.delete(key);
      return null;
    }

    // Mark as cached for the response
    const response = { ...entry.data, cached: true };
    return response;
  }

  /**
   * Store search results in cache
   */
  set(query: string, sources: string[], data: SearchResponse, ttl?: number): void {
    const key = generateCacheKey(query, sources);
    const cacheTTL = ttl || this.defaultTTL;
    
    const entry: CacheEntry = {
      data: { ...data, cached: false }, // Store original cached flag
      timestamp: Date.now(),
      expiry: Date.now() + cacheTTL,
    };

    this.cache.set(key, entry);
  }

  /**
   * Check if a query is cached
   */
  has(query: string, sources: string[] = []): boolean {
    const key = generateCacheKey(query, sources);
    return this.cache.has(key);
  }

  /**
   * Remove specific cache entry
   */
  delete(query: string, sources: string[] = []): boolean {
    const key = generateCacheKey(query, sources);
    return this.cache.delete(key);
  }

  /**
   * Clear all cache entries
   */
  clear(): void {
    this.cache.clear();
  }

  /**
   * Get cache statistics
   */
  getStats() {
    return {
      size: this.cache.size,
      maxSize: this.cache.max,
      calculatedSize: this.cache.calculatedSize,
      ttl: this.defaultTTL,
    };
  }

  /**
   * Get all cache keys (useful for debugging)
   */
  getKeys(): string[] {
    return Array.from(this.cache.keys());
  }

  /**
   * Cleanup expired entries manually
   */
  cleanup(): number {
    let removedCount = 0;
    const now = Date.now();

    for (const [key, entry] of this.cache.entries()) {
      if (now > entry.expiry) {
        this.cache.delete(key);
        removedCount++;
      }
    }

    return removedCount;
  }

  /**
   * Update cache TTL for specific entry
   */
  updateTTL(query: string, sources: string[] = [], newTTL: number): boolean {
    const key = generateCacheKey(query, sources);
    const entry = this.cache.get(key);

    if (!entry) {
      return false;
    }

    // Update expiry time
    entry.expiry = Date.now() + newTTL;
    this.cache.set(key, entry);
    return true;
  }

  /**
   * Get cache entry age in milliseconds
   */
  getEntryAge(query: string, sources: string[] = []): number | null {
    const key = generateCacheKey(query, sources);
    const entry = this.cache.get(key);

    if (!entry) {
      return null;
    }

    return Date.now() - entry.timestamp;
  }

  /**
   * Check if cache entry is fresh (less than specified age)
   */
  isEntryFresh(query: string, sources: string[] = [], maxAge: number = 300000): boolean {
    const age = this.getEntryAge(query, sources);
    return age !== null && age < maxAge;
  }

  /**
   * Get cache hit rate statistics
   */
  recordHit(): void {
    this.hits++;
  }

  recordMiss(): void {
    this.misses++;
  }

  getHitRate(): number {
    const total = this.hits + this.misses;
    return total > 0 ? this.hits / total : 0;
  }

  resetStats(): void {
    this.hits = 0;
    this.misses = 0;
  }
}

// Create singleton instance
const cacheManager = new CacheManager();

export default cacheManager;

// Export functions for easier usage
export const getCachedResults = (query: string, sources: string[] = []) => cacheManager.get(query, sources);
export const setCachedResults = (query: string, sources: string[], data: SearchResponse, ttl?: number) => cacheManager.set(query, sources, data, ttl);
export const hasCachedResults = (query: string, sources: string[] = []) => cacheManager.has(query, sources);
export const deleteCachedResults = (query: string, sources: string[] = []) => cacheManager.delete(query, sources);
export const clearCache = () => cacheManager.clear();
export const getCacheStats = () => cacheManager.getStats();
export const cleanupCache = () => cacheManager.cleanup();

/**
 * Middleware function to handle caching in API routes
 */
export function withCache<T extends SearchResponse>(
  handler: () => Promise<T>,
  query: string,
  sources: string[] = [],
  ttl?: number
) {
  return async (): Promise<T> => {
    // Try to get from cache first
    const cached = getCachedResults(query, sources);
    if (cached) {
      cacheManager.recordHit();
      return cached as T;
    }

    // Cache miss - execute handler
    cacheManager.recordMiss();
    const result = await handler();
    
    // Store in cache
    setCachedResults(query, sources, result, ttl);
    
    return result;
  };
}

/**
 * Cache warming function for popular queries
 */
export async function warmCache(
  popularQueries: string[],
  searchFunction: (query: string) => Promise<SearchResponse>
): Promise<void> {
  console.log(`Warming cache with ${popularQueries.length} popular queries...`);
  
  for (const query of popularQueries) {
    try {
      if (!hasCachedResults(query)) {
        const results = await searchFunction(query);
        setCachedResults(query, [], results);
        console.log(`Cache warmed for query: ${query}`);
      }
    } catch (error) {
      console.error(`Failed to warm cache for query: ${query}`, error);
    }
  }
}