import type { Tool } from 'ai';
import type { CacheOptions, CacheStats, CachedTool } from './types';
import { LRUCacheStore } from './lru-store';

/**
 * Default cache key generator
 */
function defaultKeyGenerator(params: any, context?: any): string {
  const paramsKey = serializeValue(params);
  if (context) {
    return `${paramsKey}|${context}`;
  }
  return paramsKey;
}

/**
 * Serialize a value to a stable string representation
 */
function serializeValue(value: any): string {
  if (value === null || value === undefined) {
    return 'null';
  }

  if (
    typeof value === 'string' ||
    typeof value === 'number' ||
    typeof value === 'boolean'
  ) {
    return String(value);
  }

  if (value instanceof Date) {
    return value.toISOString();
  }

  if (Array.isArray(value)) {
    return `[${value.map(serializeValue).join(',')}]`;
  }

  if (typeof value === 'object') {
    const sortedKeys = Object.keys(value).sort();
    const pairs = sortedKeys.map((key) => `${key}:${serializeValue(value[key])}`);
    return `{${pairs.join(',')}}`;
  }

  return String(value);
}

/**
 * Wrap a tool with caching
 */
export function cached<T extends Tool>(
  tool: T,
  options: CacheOptions = {}
): CachedTool {
  const {
    ttl = 5 * 60 * 1000,
    maxSize = 1000,
    store,
    keyGenerator = defaultKeyGenerator,
    cacheKey,
    shouldCache = () => true,
    onHit,
    onMiss,
    debug = false,
  } = options;

  const cacheStore = store || new LRUCacheStore(maxSize, ttl);
  let hits = 0;
  let misses = 0;

  const log = debug ? console.log : () => {};

  // Create cache API methods
  const cacheApi = {
    getStats(): CacheStats {
      const total = hits + misses;
      const sizeResult = typeof cacheStore.size === 'function' ? cacheStore.size() : 0;
      return {
        hits,
        misses,
        hitRate: total > 0 ? hits / total : 0,
        size: typeof sizeResult === 'number' ? sizeResult : 0,
        maxSize,
      };
    },

    clearCache(key?: string): void {
      if (key) {
        cacheStore.delete(key);
      } else {
        cacheStore.clear();
      }
    },

    async isCached(params: any): Promise<boolean> {
      const context = cacheKey?.();
      const key = keyGenerator(params, context);
      const cached = await cacheStore.get(key);
      if (!cached) return false;

      const now = Date.now();
      const isValid = now - cached.timestamp < ttl;

      if (!isValid) {
        await cacheStore.delete(key);
        return false;
      }

      return true;
    },

    getCacheKey(params: any): string {
      const context = cacheKey?.();
      return keyGenerator(params, context);
    },
  };

  // Wrap the tool with caching logic
  const cachedTool = new Proxy(tool, {
    get(target, prop) {
      if (prop === 'execute') {
        return async (...args: any[]) => {
          const [params, executionOptions] = args;
          const context = cacheKey?.();
          const key = keyGenerator(params, context);
          const now = Date.now();

          // Check cache
          const cached = await cacheStore.get(key);
          if (cached && now - cached.timestamp < ttl) {
            hits++;
            onHit?.(key);
            log(`[Cache] HIT for key: ${key}`);
            return cached.result;
          }

          // Execute original
          misses++;
          onMiss?.(key);
          log(`[Cache] MISS for key: ${key}`);

          const result = await target.execute?.(params, executionOptions);

          if (shouldCache(params, result)) {
            await cacheStore.set(key, {
              result,
              timestamp: now,
              key,
            });
            log(`[Cache] STORED result for key: ${key}`);
          }

          return result;
        };
      }

      if (prop in cacheApi) {
        return cacheApi[prop as keyof typeof cacheApi];
      }

      return target[prop as keyof typeof target];
    },
  }) as unknown as CachedTool;

  return cachedTool;
}

/**
 * Cache multiple tools with the same configuration
 */
export function cacheTools<T extends Record<string, Tool>>(
  tools: T,
  options: CacheOptions = {}
): { [K in keyof T]: CachedTool } {
  const cachedTools = {} as { [K in keyof T]: CachedTool };

  for (const [name, tool] of Object.entries(tools)) {
    cachedTools[name as keyof T] = cached(tool, options);
  }

  return cachedTools;
}
