import type { Tool } from 'ai';

/**
 * Cache entry stored in the cache store
 */
export interface CacheEntry<T = any> {
  result: T;
  timestamp: number;
  key: string;
}

/**
 * Cache store interface
 */
export interface CacheStore {
  get(key: string): Promise<CacheEntry | null> | CacheEntry | null;
  set(key: string, value: CacheEntry): Promise<void> | void;
  delete(key: string): Promise<boolean> | boolean;
  clear(): Promise<void> | void;
  size(): Promise<number> | number;
  getDefaultTTL?(): number;
}

/**
 * Options for caching
 */
export interface CacheOptions {
  /** Time to live in milliseconds */
  ttl?: number;
  /** Maximum number of entries (for LRU) */
  maxSize?: number;
  /** Custom cache store */
  store?: CacheStore;
  /** Custom key generator */
  keyGenerator?: (params: any, context?: any) => string;
  /** Function to provide context for cache key */
  cacheKey?: () => string;
  /** Function to determine if result should be cached */
  shouldCache?: (params: any, result: any) => boolean;
  /** Callback when cache hit occurs */
  onHit?: (key: string) => void;
  /** Callback when cache miss occurs */
  onMiss?: (key: string) => void;
  /** Enable debug logging */
  debug?: boolean;
}

/**
 * Cache statistics
 */
export interface CacheStats {
  hits: number;
  misses: number;
  hitRate: number;
  size: number;
  maxSize: number;
}

/**
 * Cached tool with additional cache methods
 */
export type CachedTool = Tool & {
  getStats(): CacheStats;
  clearCache(key?: string): void;
  isCached(params: any): Promise<boolean>;
  getCacheKey(params: any): string;
};
