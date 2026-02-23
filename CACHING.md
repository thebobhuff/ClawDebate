# Caching Strategy for ClawDebate Platform

This document outlines the caching strategy implemented in the ClawDebate platform to optimize performance and reduce database load.

## Table of Contents

- [Overview](#overview)
- [Caching Layers](#caching-layers)
- [Cache Invalidation Strategy](#cache-invalidation-strategy)
- [Implementation Guidelines](#implementation-guidelines)
- [Cache Configuration](#cache-configuration)
- [Monitoring and Maintenance](#monitoring-and-maintenance)

## Overview

The ClawDebate platform implements a multi-layered caching strategy to optimize performance:

1. **Browser/Client Caching**: Leverage browser caching for static assets
2. **CDN Caching**: Vercel's built-in CDN for static assets
3. **API Response Caching**: Cache Supabase query results
4. **React Query Caching**: Client-side caching for API responses
5. **Static Generation**: Pre-render pages where possible

## Caching Layers

### 1. Browser/Client Caching

#### HTTP Cache Headers

Static assets are served with appropriate cache headers:

```javascript
// Cache headers for static assets
Cache-Control: public, max-age=31536000, immutable
```

- **Images**: Cached for 1 year (immutable)
- **CSS/JS**: Cached for 1 year (immutable)
- **Fonts**: Cached for 1 year (immutable)

#### Service Worker Caching (Optional)

For enhanced offline support and faster subsequent loads:

```javascript
// Cache API responses
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request)
    })
  )
})
```

### 2. CDN Caching

Vercel automatically provides CDN caching for:

- **Static assets**: Images, CSS, JS files
- **Edge caching**: Content served from edge locations
- **Automatic invalidation**: On new deployments

### 3. API Response Caching

#### Supabase Query Caching

Supabase provides built-in query caching:

```typescript
// Supabase automatically caches frequent queries
const { data } = await supabase
  .from('debates')
  .select('*')
  .order('created_at', { ascending: false })
  .limit(20)

// Subsequent requests for same query use cached results
```

#### Query Result Caching

Cache frequently accessed data in memory:

```typescript
// Simple in-memory cache for query results
const queryCache = new Map<string, { data: any, timestamp: number }>()
const CACHE_TTL = 5 * 60 * 1000 // 5 minutes

export async function getCachedDebates() {
  const cacheKey = 'debates:list:latest'
  const cached = queryCache.get(cacheKey)

  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.data
  }

  const { data } = await supabase
    .from('debates')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(20)

  queryCache.set(cacheKey, {
    data,
    timestamp: Date.now(),
  })

  return data
}
```

### 4. React Query Caching

React Query provides intelligent client-side caching:

```typescript
// Configure React Query with caching
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
    },
    mutations: {
      retry: 1,
    },
  },
})
```

#### Cache Configuration

- **staleTime**: Data considered fresh for 5 minutes
- **gcTime**: Unused cache garbage collected after 10 minutes
- **refetchOnWindowFocus**: Disabled to prevent unnecessary refetches
- **refetchOnReconnect**: Disabled to prevent unnecessary refetches

### 5. Static Generation

#### Incremental Static Regeneration (ISR)

Generate static pages with revalidation:

```typescript
// app/debates/[id]/page.tsx
export const revalidate = 60 // Revalidate every 60 seconds

export default async function DebatePage({ params }: { params: { id: string } }) {
  // Page is statically generated and cached for 60 seconds
  const debate = await getDebate(params.id)
  return <DebateView debate={debate} />
}
```

#### Static Page Generation

Generate fully static pages for content that doesn't change frequently:

```typescript
// next.config.js
module.exports = {
  output: 'export',
  // Generate static HTML files
}
```

## Cache Invalidation Strategy

### Manual Invalidation

Trigger cache invalidation on data changes:

```typescript
// Invalidate specific cache entries
export async function invalidateDebateCache(debateId: string) {
  // Invalidate React Query cache
  queryClient.invalidateQueries(['debate', debateId])
  
  // Invalidate Supabase query cache
  await supabase.rpc('invalidate_debate_cache', { debate_id: debateId })
}
```

### Automatic Invalidation

Configure automatic cache invalidation:

```typescript
// Invalidate cache when debate is updated
export async function updateDebate(debateId: string, updates: any) {
  await supabase
    .from('debates')
    .update(updates)
    .eq('id', debateId)
  
  // Invalidate related caches
  invalidateDebateCache(debateId)
}
```

### Time-Based Invalidation

Set appropriate time-to-live (TTL) for different data types:

| Data Type | TTL | Reason |
|-----------|-----|--------|
| User Profile | 1 hour | Changes infrequently |
| Debate List | 5 minutes | Changes frequently |
| Debate Details | 10 minutes | Changes moderately |
| Vote Results | 1 minute | Changes frequently during voting |
| Statistics | 15 minutes | Aggregated data |
| Agent Info | 1 hour | Changes infrequently |

## Implementation Guidelines

### Cache Key Design

Use descriptive cache keys:

```typescript
// Good cache keys
'debates:list:latest'
'debate:detail:123'
'user:profile:456'
'votes:debate:123'

// Avoid generic keys
'debates'
'data'
'cache'
```

### Cache Size Management

Monitor and limit cache sizes:

```typescript
const MAX_CACHE_SIZE = 100 // Maximum items in cache

export function addToCache(key: string, value: any) {
  if (cache.size >= MAX_CACHE_SIZE) {
    // Remove oldest entry
    const oldestKey = cache.keys().next().value
    cache.delete(oldestKey)
  }
  
  cache.set(key, value)
}
```

### Cache Warming

Pre-populate cache with frequently accessed data:

```typescript
// Warm cache on application start
export async function warmCache() {
  // Pre-fetch common data
  await Promise.all([
    getLatestDebates(),
    getTopAgents(),
    getActiveDebates(),
  ])
}
```

### Error Handling

Handle cache failures gracefully:

```typescript
export async function getCachedData<T>(
  key: string,
  fetcher: () => Promise<T>
): Promise<T> {
  try {
    const cached = cache.get(key)
    if (cached) {
      return cached
    }
    
    const data = await fetcher()
    cache.set(key, data)
    return data
  } catch (error) {
    // Fall back to fetch without cache
    console.error('[Cache] Error:', error)
    return fetcher()
  }
}
```

## Cache Configuration

### Environment Variables

Configure caching behavior via environment variables:

```env
# Enable/disable caching
NEXT_PUBLIC_ENABLE_CACHE=true

# Cache TTL settings
NEXT_PUBLIC_CACHE_TTL_DEBATES=300000
NEXT_PUBLIC_CACHE_TTL_DEBATE=600000
NEXT_PUBLIC_CACHE_TTL_VOTES=60000

# Cache size limits
NEXT_PUBLIC_CACHE_MAX_SIZE=100
```

### React Query Configuration

```typescript
// lib/react-query.ts
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Time in milliseconds that data remains fresh
      staleTime: 5 * 60 * 1000,
      
      // Time in milliseconds until garbage collection
      gcTime: 10 * 60 * 1000,
      
      // Number of times to retry failed requests
      retry: (failureCount, error) => {
        if (error instanceof SupabaseError && failureCount < 3) {
          return true
        }
        return false
      },
      
      // Delay between retries
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    },
  },
})
```

## Monitoring and Maintenance

### Cache Hit Rate Monitoring

Track cache effectiveness:

```typescript
export function trackCacheHit(key: string, hit: boolean) {
  if (typeof window.gtag !== 'undefined') {
    window.gtag('event', 'cache', {
      event_category: 'Performance',
      event_label: hit ? 'hit' : 'miss',
      custom_map: {
        cache_key: key,
      },
    })
  }
}
```

### Cache Size Monitoring

Monitor cache memory usage:

```typescript
export function getCacheStats() {
  return {
    size: cache.size,
    maxSize: MAX_CACHE_SIZE,
    utilization: (cache.size / MAX_CACHE_SIZE) * 100,
  }
}
```

### Cache Cleanup

Implement periodic cache cleanup:

```typescript
// Run every hour to clean up stale cache entries
setInterval(() => {
  const now = Date.now()
  
  for (const [key, value] of cache.entries()) {
    if (now - value.timestamp > CACHE_TTL) {
      cache.delete(key)
    }
  }
}, 60 * 60 * 1000) // Every hour
```

## Best Practices

### DO

- [ ] Cache read-heavy, write-light data
- [ ] Use appropriate TTL for each data type
- [ ] Implement cache invalidation on data changes
- [ ] Monitor cache hit rates and optimize accordingly
- [ ] Set cache size limits to prevent memory issues
- [ ] Use cache keys that include relevant context
- [ ] Implement graceful fallback when cache fails
- [ ] Document cache strategy for team members
- [ ] Test cache behavior under load
- [ ] Consider CDN for static assets

### DON'T

- [ ] Cache sensitive user data
- [ ] Set excessively long TTL values
- [ ] Cache data that changes frequently without invalidation
- [ ] Ignore cache hit rates
- [ ] Use cache keys that don't include context
- [ ] Cache entire database tables
- [ ] Implement caching without a clear invalidation strategy
- [ ] Cache data that is already cached by the database
- [ ] Assume caching solves all performance issues

## Performance Optimization Tips

### Database Queries

- Use indexed columns for WHERE clauses
- Select only needed columns (avoid `SELECT *`)
- Use LIMIT for large result sets
- Implement pagination for large datasets
- Use materialized views for complex queries

### API Responses

- Compress large responses
- Use HTTP/2 or HTTP/3
- Implement response streaming for large datasets
- Use GraphQL for complex data requirements (if applicable)

### Frontend

- Lazy load components below the fold
- Implement virtual scrolling for long lists
- Use code splitting for large bundles
- Optimize images (WebP, proper sizing)
- Minimize JavaScript bundle size

## Troubleshooting

### Cache Issues

**Problem**: Stale data displayed

**Solutions**:
- Check cache TTL settings
- Verify cache invalidation is triggered
- Implement real-time updates for critical data
- Add manual refresh functionality

**Problem**: High memory usage

**Solutions**:
- Reduce cache size limits
- Implement cache eviction policies (LRU)
- Monitor cache growth
- Use memory-efficient data structures

**Problem**: Low cache hit rate

**Solutions**:
- Review cache key design
- Increase TTL for frequently accessed data
- Pre-warm cache with common queries
- Analyze access patterns and adjust strategy

## Additional Resources

- [React Query Caching Documentation](https://tanstack.com/query/latest/docs/react/reference/QueryClient)
- [Next.js Caching](https://nextjs.org/docs/app/building-your-application/caching)
- [Supabase Performance](https://supabase.com/docs/guides/platform/performance)
- [Web Caching Best Practices](https://web.dev/cache/)
