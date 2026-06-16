/**
 * In-memory sliding-window rate limiter for API routes.
 * Server-side only — prevents abuse of upstream API proxies.
 */

interface WindowBucket {
  count: number;
  resetAt: number;
}

export class RateLimiter {
  private buckets = new Map<string, WindowBucket>();

  /**
   * @param maxRequests  Max requests allowed per window
   * @param windowMs     Window duration in milliseconds
   */
  constructor(
    private maxRequests = 60,
    private windowMs = 60_000 // 1 minute
  ) {}

  /** Returns true if the request is allowed, false if rate-limited. */
  hit(key: string): boolean {
    const now = Date.now();
    let bucket = this.buckets.get(key);

    if (!bucket || now >= bucket.resetAt) {
      bucket = { count: 0, resetAt: now + this.windowMs };
      this.buckets.set(key, bucket);
    }

    if (bucket.count >= this.maxRequests) {
      return false;
    }

    bucket.count++;
    return true;
  }

  /** Seconds remaining until the bucket resets (for Retry-After header). */
  retryAfter(key: string): number {
    const bucket = this.buckets.get(key);
    if (!bucket) return 0;
    return Math.ceil((bucket.resetAt - Date.now()) / 1000);
  }

  /** Periodically clean up stale buckets to prevent memory leaks. */
  startCleanup(intervalMs = 5 * 60_000): void {
    if (typeof globalThis !== 'undefined') {
      const id = setInterval(() => {
        const now = Date.now();
        for (const [key, bucket] of this.buckets) {
          if (now >= bucket.resetAt) this.buckets.delete(key);
        }
      }, intervalMs);
      if (typeof id === 'object' && 'unref' in id) id.unref();
    }
  }
}

// Global singleton — 120 requests per minute per IP
export const apiRateLimiter = new RateLimiter(120, 60_000);
apiRateLimiter.startCleanup();
