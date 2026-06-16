/**
 * Tests for MemoryCache logic (inlined from src/lib/cache.ts)
 * Deno-compatible: no external src/ imports needed.
 */
import { assertEquals, assertStrictEquals } from "jsr:@std/assert";

// ── Inlined MemoryCache ───────────────────────────────────────────────────────

interface CacheEntry {
  value: string;
  expiresAt: number;
  prev: CacheEntry | null;
  next: CacheEntry | null;
}

class MemoryCache {
  private map = new Map<string, CacheEntry>();
  private head: CacheEntry | null = null;
  private tail: CacheEntry | null = null;
  private _size = 0;

  constructor(
    private maxEntries = 500,
    private defaultTtlMs = 5 * 60 * 1000,
  ) {}

  get(key: string): string | undefined {
    const entry = this.map.get(key);
    if (!entry) return undefined;
    if (Date.now() > entry.expiresAt) {
      this._delete(key);
      return undefined;
    }
    this._moveToHead(entry);
    return entry.value;
  }

  set(key: string, value: string, ttlMs?: number): void {
    const ttl = ttlMs ?? this.defaultTtlMs;
    const existing = this.map.get(key);
    if (existing) {
      existing.value = value;
      existing.expiresAt = Date.now() + ttl;
      this._moveToHead(existing);
      return;
    }
    if (this._size >= this.maxEntries) this._evictTail();
    const entry: CacheEntry = {
      value,
      expiresAt: Date.now() + ttl,
      prev: null,
      next: this.head,
    };
    if (this.head) this.head.prev = entry;
    this.head = entry;
    if (!this.tail) this.tail = entry;
    this.map.set(key, entry);
    this._size++;
  }

  has(key: string): boolean {
    return this.get(key) !== undefined;
  }

  get size(): number { return this._size; }

  static buildKey(base: string, searchParams?: URLSearchParams): string {
    if (!searchParams || [...searchParams.keys()].length === 0) return base;
    const sorted = [...searchParams.entries()].sort(([a], [b]) =>
      a.localeCompare(b)
    );
    const qs = sorted.map(([k, v]) => `${k}=${v}`).join("&");
    return `${base}?${qs}`;
  }

  private _delete(key: string): void {
    const entry = this.map.get(key);
    if (!entry) return;
    this._detach(entry);
    this.map.delete(key);
    this._size--;
  }

  private _moveToHead(entry: CacheEntry): void {
    if (entry === this.head) return;
    this._detach(entry);
    entry.prev = null;
    entry.next = this.head;
    if (this.head) this.head.prev = entry;
    this.head = entry;
    if (!this.tail) this.tail = entry;
  }

  private _detach(entry: CacheEntry): void {
    if (entry.prev) entry.prev.next = entry.next;
    else this.head = entry.next;
    if (entry.next) entry.next.prev = entry.prev;
    else this.tail = entry.prev;
  }

  private _evictTail(): void {
    if (!this.tail) return;
    for (const [key, entry] of this.map) {
      if (entry === this.tail) { this._delete(key); return; }
    }
  }
}

// ── Tests ─────────────────────────────────────────────────────────────────────

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
  const cache = new MemoryCache(10, 50);
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

Deno.test("MemoryCache - updating existing key does not increase size", () => {
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
  cache.get("a"); // make "a" recently used
  cache.set("d", "4"); // should evict "b" (LRU)
  assertEquals(cache.size, 3);
  assertEquals(cache.get("b"), undefined);
  assertEquals(cache.get("a"), "1");
  assertEquals(cache.get("c"), "3");
  assertEquals(cache.get("d"), "4");
});

Deno.test("MemoryCache.buildKey - no params returns base path", () => {
  assertEquals(MemoryCache.buildKey("/movie/popular"), "/movie/popular");
});

Deno.test("MemoryCache.buildKey - sorts params deterministically", () => {
  const p1 = new URLSearchParams([["z", "26"], ["a", "1"]]);
  const p2 = new URLSearchParams([["a", "1"], ["z", "26"]]);
  assertEquals(
    MemoryCache.buildKey("/path", p1),
    MemoryCache.buildKey("/path", p2),
  );
});

Deno.test("MemoryCache.buildKey - includes all params in output", () => {
  const p = new URLSearchParams([["page", "2"], ["lang", "en"]]);
  const key = MemoryCache.buildKey("/discover/movie", p);
  assertEquals(key.startsWith("/discover/movie?"), true);
  assertEquals(key.includes("lang=en"), true);
  assertEquals(key.includes("page=2"), true);
});
