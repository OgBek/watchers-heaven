/**
 * Tests for RateLimiter (src/lib/rate-limiter.ts)
 * Covers: hit() allowing/blocking, retryAfter(), window reset
 */
import { assertEquals, assertGreater } from "jsr:@std/assert";
import { RateLimiter } from "../src/lib/rate-limiter.ts";

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
  assertEquals(rl.hit("ip2"), false); // 3rd request — over limit
});

Deno.test("RateLimiter - different keys are independent", () => {
  const rl = new RateLimiter(1, 60_000);
  assertEquals(rl.hit("a"), true);
  assertEquals(rl.hit("a"), false); // "a" is exhausted
  assertEquals(rl.hit("b"), true);  // "b" has its own fresh bucket
});

Deno.test("RateLimiter - retryAfter returns positive seconds when limited", () => {
  const rl = new RateLimiter(1, 60_000);
  rl.hit("ip3");
  rl.hit("ip3"); // blocked
  assertGreater(rl.retryAfter("ip3"), 0);
});

Deno.test("RateLimiter - retryAfter returns 0 for unknown key", () => {
  const rl = new RateLimiter(5, 60_000);
  assertEquals(rl.retryAfter("unknown"), 0);
});

Deno.test("RateLimiter - window resets after windowMs elapses", async () => {
  const rl = new RateLimiter(1, 80); // 80ms window
  assertEquals(rl.hit("ip4"), true);
  assertEquals(rl.hit("ip4"), false); // blocked
  await new Promise((r) => setTimeout(r, 100));
  assertEquals(rl.hit("ip4"), true);  // window reset, allowed again
});
