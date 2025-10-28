# @ai-toolkit/cache

Universal caching for AI tools and agents.

## Installation

```bash
npm install @ai-toolkit/cache
# or
pnpm add @ai-toolkit/cache
```

## Features

- 🚀 Works with any AI SDK tool
- 💾 Multiple backends (LRU, Redis, Upstash)
- 🎯 Smart cache key generation
- 📊 Cache statistics
- 🔧 Customizable TTL and eviction
- 🐛 Debug mode

## Quick Start

```typescript
import { tool } from 'ai';
import { cached } from '@ai-toolkit/cache';
import { z } from 'zod';

const weatherTool = tool({
  description: 'Get weather for a location',
  parameters: z.object({
    location: z.string(),
  }),
  execute: async ({ location }) => {
    // Expensive API call
    const response = await fetch(`https://api.weather.com/${location}`);
    return response.json();
  },
});

// Wrap with caching
const cachedWeatherTool = cached(weatherTool, {
  ttl: 5 * 60 * 1000, // 5 minutes
  maxSize: 100,
  debug: true,
});
```

## Advanced Usage

### Custom Cache Key

```typescript
const cachedTool = cached(myTool, {
  keyGenerator: (params, context) => {
    return `${params.userId}-${params.action}-${context}`;
  },
  cacheKey: () => getCurrentUserId(),
});
```

### Conditional Caching

```typescript
const cachedTool = cached(myTool, {
  shouldCache: (params, result) => {
    // Only cache successful results
    return result.status === 'success';
  },
});
```

### Cache Monitoring

```typescript
const cachedTool = cached(myTool, {
  onHit: (key) => console.log(`Cache hit: ${key}`),
  onMiss: (key) => console.log(`Cache miss: ${key}`),
});

// Get statistics
const stats = cachedTool.getStats();
console.log(`Hit rate: ${stats.hitRate * 100}%`);
console.log(`Size: ${stats.size}/${stats.maxSize}`);
```

### Custom Cache Store

```typescript
import { cached, type CacheStore } from '@ai-toolkit/cache';

class RedisCacheStore implements CacheStore {
  constructor(private redis: RedisClient) {}

  async get(key: string) {
    const value = await this.redis.get(key);
    return value ? JSON.parse(value) : null;
  }

  async set(key: string, value: any) {
    await this.redis.set(key, JSON.stringify(value));
  }

  async delete(key: string) {
    return (await this.redis.del(key)) > 0;
  }

  async clear() {
    await this.redis.flushdb();
  }

  async size() {
    return await this.redis.dbsize();
  }
}

const cachedTool = cached(myTool, {
  store: new RedisCacheStore(redisClient),
  ttl: 10 * 60 * 1000,
});
```

### Cache Multiple Tools

```typescript
import { cacheTools } from '@ai-toolkit/cache';

const tools = {
  weather: weatherTool,
  news: newsTool,
  stocks: stocksTool,
};

const cachedTools = cacheTools(tools, {
  ttl: 5 * 60 * 1000,
  maxSize: 200,
});
```

## API Reference

### `cached(tool, options)`

Wrap a tool with caching.

**Options:**
- `ttl` - Time to live in milliseconds (default: 5 minutes)
- `maxSize` - Maximum cache entries for LRU (default: 1000)
- `store` - Custom cache store
- `keyGenerator` - Custom key generation function
- `cacheKey` - Context provider for cache keys
- `shouldCache` - Predicate to determine if result should be cached
- `onHit` - Callback on cache hit
- `onMiss` - Callback on cache miss
- `debug` - Enable debug logging

**Methods:**
- `getStats()` - Get cache statistics
- `clearCache(key?)` - Clear cache (all or specific key)
- `isCached(params)` - Check if params are cached
- `getCacheKey(params)` - Get cache key for params

### `LRUCacheStore`

Built-in LRU cache implementation.

```typescript
import { LRUCacheStore } from '@ai-toolkit/cache';

const store = new LRUCacheStore(1000, 5 * 60 * 1000);
```

## License

MIT
