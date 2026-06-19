/**
 * Lightweight in-memory LRU cache with TTL support.
 * Used server-side in API routes to cache upstream API responses.
 */

interface CacheEntry {
  value: string;
  expiresAt: number;
  prev: CacheEntry | null;
  next: CacheEntry | null;
}

export class MemoryCache {
  private map = new Map<string, CacheEntry>();
  private head: CacheEntry | null = null;
  private tail: CacheEntry | null = null;
  private _size = 0;

  constructor(
    private maxEntries = 500,
    private defaultTtlMs = 5 * 60 * 1000 // 5 minutes
  ) {}

  get(key: string): string | undefined {
    const entry = this.map.get(key);
    if (!entry) return undefined;
    if (Date.now() > entry.expiresAt) {
      this.delete(key);
      return undefined;
    }
    this.moveToHead(entry);
    return entry.value;
  }

  set(key: string, value: string, ttlMs?: number): void {
    const ttl = ttlMs ?? this.defaultTtlMs;
    const existing = this.map.get(key);
    if (existing) {
      existing.value = value;
      existing.expiresAt = Date.now() + ttl;
      this.moveToHead(existing);
      return;
    }

    if (this._size >= this.maxEntries) {
      this.evictTail();
    }

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

  get size(): number {
    return this._size;
  }

  /** Build a cache key from URL + sorted query params */
  static buildKey(base: string, searchParams?: URLSearchParams): string {
    if (!searchParams || [...searchParams.keys()].length === 0) return base;
    const sorted = [...searchParams.entries()].sort(([a], [b]) => a.localeCompare(b));
    const qs = sorted.map(([k, v]) => `${k}=${v}`).join('&');
    return `${base}?${qs}`;
  }

  // --- internal doubly-linked-list ops ---

  private delete(key: string): void {
    const entry = this.map.get(key);
    if (!entry) return;
    this.detach(entry);
    this.map.delete(key);
    this._size--;
  }

  private moveToHead(entry: CacheEntry): void {
    if (entry === this.head) return;
    this.detach(entry);
    entry.prev = null;
    entry.next = this.head;
    if (this.head) this.head.prev = entry;
    this.head = entry;
    if (!this.tail) this.tail = entry;
  }

  private detach(entry: CacheEntry): void {
    if (entry.prev) entry.prev.next = entry.next;
    else this.head = entry.next;
    if (entry.next) entry.next.prev = entry.prev;
    else this.tail = entry.prev;
  }

  private evictTail(): void {
    if (!this.tail) return;
    // Find the tail's key by iterating the map
    for (const [key, entry] of this.map) {
      if (entry === this.tail) {
        this.delete(key);
        return;
      }
    }
  }
}

// Singleton caches for the API proxy route
export const tmdbCache = new MemoryCache(500, 10 * 60 * 1000);   // 10 min TTL, 500 entries
export const channelsCache = new MemoryCache(5, 30 * 60 * 1000); // 30 min TTL, 5 entries (one per limit value)
