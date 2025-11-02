/**
 * Token Cache Utility
 * Caches normalized and tokenized code to avoid re-processing unchanged files.
 */

interface CacheEntry {
  normalized: string;
  tokens: string[];
  timestamp: number;
}

const CACHE_TTL = 5 * 60 * 1000; // 5 minutes
const cache = new Map<string, CacheEntry>();

/**
 * Generate cache key from file content and language
 */
function generateCacheKey(content: string, language: string): string {
  return `${language}:${content.slice(0, 100)}:${content.length}`;
}

/**
 * Get cached tokens if available
 */
export function getCachedTokens(content: string, language: string): { normalized: string; tokens: string[] } | null {
  const key = generateCacheKey(content, language);
  const entry = cache.get(key);
  
  if (entry && Date.now() - entry.timestamp < CACHE_TTL) {
    return {
      normalized: entry.normalized,
      tokens: entry.tokens
    };
  }
  
  return null;
}

/**
 * Cache tokens for future use
 */
export function cacheTokens(content: string, language: string, normalized: string, tokens: string[]): void {
  const key = generateCacheKey(content, language);
  cache.set(key, {
    normalized,
    tokens,
    timestamp: Date.now()
  });
  
  // Clean up old entries if cache gets too large
  if (cache.size > 100) {
    const oldestKey = Array.from(cache.entries())
      .sort((a, b) => a[1].timestamp - b[1].timestamp)[0][0];
    cache.delete(oldestKey);
  }
}

/**
 * Clear cache
 */
export function clearCache(): void {
  cache.clear();
}

