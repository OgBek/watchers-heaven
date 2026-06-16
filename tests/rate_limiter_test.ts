/**
 * Tests for RateLimiter logic (inlined from src/lib/rate-limiter.ts)
 * Deno-compatible: no external src/ imports needed.
 */
import { assertEquals, assertGreater } from "jsr:@std/assert";

// ── Inlined RateLimiter ───────────────────────────────────────────────────────

interface WindowBucket {
  count: number;
  resetAt: number;
}

class RateLimiter {
  private buckets = new Map<string, WindowBucket>();

  constructor(
    private maxRequests = 60,
    private windowMs = 60_000,
  ) {}

  hit(key: string): boolean {
    const now = Date.now();
    let bucket = this.buckets.get(key);
    if (!bucket || now >= bucket.resetAt) {
      bucket = { count: 0, resetAt: now + this.windowMs };
      this.buckets.set(key, bucket);
    }
    if (bucket.count >= this.maxRequests) return false;
    bucket.count++;
    return true;
  }

  retryAfter(key: string): number {
    const bucket = this.buckets.get(key);
    if (!bucket) return 0;
    return Math.ceil((bucket.resetAt - Date.now()) / 1000);
  }
}

// ── Tests ─────────────────────────────────────────────────────────────────────

Deno.test("RateLimiter - allows requests under the limit", () => {
  const rl = new RateLimiter(3, 60_000);
  assertEquals(rl.hit("ip1"), true);
  assertEquals(rl.hit("ip1"), true);
  assertEquals(rl.hit("ip1"), true);
});

Deno.test("RateLimiter - blocks on the request that exceeds the limit", () => {
  const rl = new RateLimiter(2, 60_000);
  rl.hit("ip2");
  rl.hit("ip2");
  assertEquals(rl.hit("ip2"), false);
});

Deno.test("RateLimiter - different keys are independent", () => {
  const rl = new RateLimiter(1, 60_000);
  assertEquals(rl.hit("a"), true);
  assertEquals(rl.hit("a"), false);
  assertEquals(rl.hit("b"), true);
});

Deno.test("RateLimiter - retryAfter returns positive seconds when rate-limited", () => {
  const rl = new RateLimiter(1, 60_000);
  rl.hit("ip3");
  rl.hit("ip3");
  assertGreater(rl.retryAfter("ip3"), 0);
});

Deno.test("RateLimiter - retryAfter returns 0 for unknown key", () => {
  const rl = new RateLimiter(5, 60_000);
  assertEquals(rl.retryAfter("unknown"), 0);
});

Deno.test("RateLimiter - window resets after windowMs elapses", async () => {
  const rl = new RateLimiter(1, 80);
  assertEquals(rl.hit("ip4"), true);
  assertEquals(rl.hit("ip4"), false);
  await new Promise((r) => setTimeout(r, 100));
  assertEquals(rl.hit("ip4"), true);
});
