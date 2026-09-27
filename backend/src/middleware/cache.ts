import { Request, Response, NextFunction } from 'express';

interface CacheEntry {
  body: any;
  contentType?: string;
  expiresAt: number;
}

const memoryCache = new Map<string, CacheEntry>();

/**
 * High-performance in-memory cache middleware for read-heavy public endpoints.
 * @param durationSeconds Time in seconds to keep cached response
 */
export const memoryCacheMiddleware = (durationSeconds: number = 30) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    // Only cache GET requests
    if (req.method !== 'GET') {
      next();
      return;
    }

    // Do NOT cache authenticated requests (to prevent leaking personalized data like isStarred)
    if (req.headers.authorization) {
      next();
      return;
    }

    const cacheKey = `${req.originalUrl || req.url}`;
    const now = Date.now();
    const cached = memoryCache.get(cacheKey);

    if (cached && cached.expiresAt > now) {
      res.setHeader('X-Cache', 'HIT');
      res.setHeader('Cache-Control', `public, max-age=${durationSeconds}`);
      if (cached.contentType) {
        res.setHeader('Content-Type', cached.contentType);
      }
      res.send(cached.body);
      return;
    }

    // Capture response to store in cache
    const originalSend = res.send.bind(res);

    res.send = (body: any): Response => {
      // Only cache successful 200 responses
      if (res.statusCode === 200) {
        memoryCache.set(cacheKey, {
          body,
          contentType: res.getHeader('Content-Type') as string | undefined,
          expiresAt: Date.now() + durationSeconds * 1000,
        });
      }

      res.setHeader('X-Cache', 'MISS');
      res.setHeader('Cache-Control', `public, max-age=${durationSeconds}`);
      return originalSend(body);
    };

    next();
  };
};

/**
 * Clear cached entries by URL prefix or purge all
 */
export const clearApiCache = (prefix?: string) => {
  if (!prefix) {
    memoryCache.clear();
    return;
  }
  for (const key of memoryCache.keys()) {
    if (key.includes(prefix)) {
      memoryCache.delete(key);
    }
  }
};
