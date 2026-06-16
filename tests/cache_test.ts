/**
 * Tests for MemoryCache (src/lib/cache.ts)
 * Covers: set/get, TTL expiry, LRU eviction, buildKey, has(), size
 */
import { assertEquals, assertStrictEquals } from "jsr:@std/assert";
import { MemoryCache } from "../src/lib/cache.ts";

Deno.test("MemoryCache - stores and retrieves a value", () => {
  const cache = new MemoryCache(10, 60_000);
  cache.set("key1", "hello");
  assertEquals(cache.get("key1"), "hello");
});

Deno.test("MemoryCache - returns undefined for missing key", () => {
  const cache = new MemoryCache(10, 60_000);
  assertEquals(cache.get("nonexistent"), undefined);
});

Deno.test("MemoryCache - returns undefined after TTL expires", async () => {
  const cache = new MemoryCache(10, 50); // 50ms TTL
  cache.set("temp", "value");
  assertEquals(cache.get("temp"), "value");
  await new Promise((r) => setTimeout(r, 100));
  assertEquals(cache.get("temp"), undefined);
});

Deno.test("MemoryCache - has() reflects presence and expiry", async () => {
  const cache = new MemoryCache(10, 50);
  cache.set("x", "1");
  assertEquals(cache.has("x"), true);
  await new Promise((r) => setTimeout(r, 100));
  assertEquals(cache.has("x"), false);
});

Deno.test("MemoryCache - size tracks entry count", () => {
  const cache = new MemoryCache(10, 60_000);
  assertEquals(cache.size, 0);
  cache.set("a", "1");
  cache.set("b", "2");
  assertEquals(cache.size, 2);
});

Deno.test("MemoryCache - updating an existing key does not increase size", () => {
  const cache = new MemoryCache(10, 60_000);
  cache.set("k", "v1");
  cache.set("k", "v2");
  assertStrictEquals(cache.size, 1);
  assertEquals(cache.get("k"), "v2");
});

Deno.test("MemoryCache - evicts LRU entry when maxEntries is reached", () => {
  const cache = new MemoryCache(3, 60_000);
  cache.set("a", "1");
  cache.set("b", "2");
  cache.set("c", "3");
  // Access "a" to make it recently used
  cache.get("a");
  // Adding "d" should evict the LRU entry ("b")
  cache.set("d", "4");
  assertEquals(cache.size, 3);
  assertEquals(cache.get("b"), undefined); // evicted
  assertEquals(cache.get("a"), "1");       // still present
  assertEquals(cache.get("c"), "3");       // still present
  assertEquals(cache.get("d"), "4");       // newly added
});

Deno.test("MemoryCache.buildKey - no params returns base", () => {
  const key = MemoryCache.buildKey("/movie/popular");
  assertEquals(key, "/movie/popular");
});

Deno.test("MemoryCache.buildKey - sorts params deterministically", () => {
  const p1 = new URLSearchParams([["z", "26"], ["a", "1"]]);
  const p2 = new URLSearchParams([["a", "1"], ["z", "26"]]);
  assertEquals(MemoryCache.buildKey("/path", p1), MemoryCache.buildKey("/path", p2));
});

Deno.test("MemoryCache.buildKey - includes params in output", () => {
  const p = new URLSearchParams([["page", "2"], ["lang", "en"]]);
  const key = MemoryCache.buildKey("/discover/movie", p);
  assertEquals(key.startsWith("/discover/movie?"), true);
  assertEquals(key.includes("lang=en"), true);
  assertEquals(key.includes("page=2"), true);
});
