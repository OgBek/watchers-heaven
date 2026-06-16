import { fetchClient } from './client';
import { withRetries } from './retries';
import { tmdbCircuitBreaker } from './circuit-breaker';

const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
const RIVE_BASE = 'https://rivestream.ru';

// ─── Client-side in-memory cache (browser only) ───

interface ClientCacheEntry {
  data: unknown;
  expiresAt: number;
}

const clientCache = new Map<string, ClientCacheEntry>();
const CLIENT_CACHE_TTL = 5 * 60 * 1000; // 5 minutes

// ── sessionStorage persistence layer ──
// Backs up cache entries to sessionStorage so they survive page refreshes
// and cross-page navigations. Only used in the browser.
const SESSION_CACHE_PREFIX = 'wh-cache:';

function clientCacheGet<T>(key: string): T | undefined {
  // 1. Check in-memory cache first (fastest)
  const entry = clientCache.get(key);
  if (entry) {
    if (Date.now() > entry.expiresAt) {
      clientCache.delete(key);
    } else {
      return entry.data as T;
    }
  }
  // 2. Fall back to sessionStorage
  if (typeof window !== 'undefined') {
    try {
      const raw = sessionStorage.getItem(SESSION_CACHE_PREFIX + key);
      if (raw) {
        const parsed = JSON.parse(raw) as ClientCacheEntry;
        if (Date.now() <= parsed.expiresAt) {
          // Restore to in-memory cache
          clientCache.set(key, parsed);
          return parsed.data as T;
        }
        sessionStorage.removeItem(SESSION_CACHE_PREFIX + key);
      }
    } catch { /* sessionStorage unavailable or corrupt */ }
  }
  return undefined;
}

function clientCacheSet(key: string, data: unknown, ttlMs = CLIENT_CACHE_TTL): void {
  const expiresAt = Date.now() + ttlMs;
  // Keep the in-memory cache from growing unbounded (max 150 entries)
  if (clientCache.size >= 150) {
    const firstKey = clientCache.keys().next().value;
    if (firstKey) clientCache.delete(firstKey);
  }
  clientCache.set(key, { data, expiresAt });
  // Persist to sessionStorage for cross-page survival
  if (typeof window !== 'undefined') {
    try {
      sessionStorage.setItem(
        SESSION_CACHE_PREFIX + key,
        JSON.stringify({ data, expiresAt })
      );
    } catch { /* quota exceeded — silently skip */ }
  }
}

// ─── In-flight request deduplication ───

const inflightRequests = new Map<string, Promise<unknown>>();

function dedupeRequest<T>(key: string, fn: () => Promise<T>): Promise<T> {
  const existing = inflightRequests.get(key);
  if (existing) return existing as Promise<T>;

  const promise = fn().finally(() => {
    inflightRequests.delete(key);
  });
  inflightRequests.set(key, promise);
  return promise;
}

// ─── Types ───

export interface TouStreamChannel {
  slug: string;
  name: string;
}

export const ApiGateway = {
  // --- RiveStream API ---
  getMovieEmbedUrl: (tmdbId: string | number, type: 'default' | 'torrent' | 'agg' = 'default') => {
    const path = type === 'default' ? '/embed' : `/embed/${type}`;
    return `${RIVE_BASE}${path}?type=movie&id=${tmdbId}`;
  },

  getTvEmbedUrl: (tmdbId: string | number, season: number, episode: number, type: 'default' | 'torrent' | 'agg' = 'default') => {
    const path = type === 'default' ? '/embed' : `/embed/${type}`;
    return `${RIVE_BASE}${path}?type=tv&id=${tmdbId}&season=${season}&episode=${episode}`;
  },

  getMovieDownloadUrl: (tmdbId: string | number) => {
    return `${RIVE_BASE}/download?type=movie&id=${tmdbId}`;
  },

  getTvDownloadUrl: (tmdbId: string | number, season: number, episode: number) => {
    return `${RIVE_BASE}/download?type=tv&id=${tmdbId}&season=${season}&episode=${episode}`;
  },

  // --- ScreenScape API ---
  getScreenScapeUrl: (id: string | number, type: 'movie' | 'tv', season?: number, episode?: number, language = 'eng', isImdb = false) => {
    const idKey = isImdb ? 'imdb' : 'tmdb';
    let url = `https://screenscape.me/embed?${idKey}=${id}&type=${type}`;
    if (type === 'tv' && season !== undefined && episode !== undefined) {
      url += `&s=${season}&e=${episode}`;
    }
    if (language) {
      url += `&lan=${language}`;
    }
    return url;
  },

  // --- TouStream API ---
  getTouStreamMovieUrl: (tmdbId: string | number) => {
    return `https://toustream.xyz/tou/movies/${tmdbId}`;
  },

  getTouStreamLiveUrl: (channelSlug: string) => {
    return `https://toustream.xyz/tou/live/${channelSlug}`;
  },

  /**
   * Fetch live channels through the server proxy to avoid the 12 MB
   * client-side JSON parse crash. Falls back to a small default list.
   * @param limit  Max channels to return (10–200, default 200).
   *               Use a smaller limit for a fast initial batch.
   */
  getTouStreamChannels: async (limit = 200): Promise<TouStreamChannel[]> => {
    const cacheKey = `toustream-channels:${limit}`;

    // Check client cache first
    const cached = clientCacheGet<TouStreamChannel[]>(cacheKey);
    if (cached) return cached;

    const FALLBACK: TouStreamChannel[] = [
      { slug: 'cartoonnetwork', name: 'Cartoon Network' },
      { slug: 'disneychannel', name: 'Disney Channel' },
      { slug: 'nickelodeon', name: 'Nickelodeon' }
    ];

    try {
      return await dedupeRequest(cacheKey, async () => {
        const res = await fetchClient('/api/tmdb/channels', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'get-channels', limit }),
          timeoutMs: 95_000,
        });
        const channels = Array.isArray(res) ? res : FALLBACK;
        clientCacheSet(cacheKey, channels, 30 * 60 * 1000); // 30 min
        return channels;
      });
    } catch (err) {
      console.error('Error fetching TouStream channels:', err);
      return FALLBACK;
    }
  },

  // --- VidKing API ---
  getVidKingUrl: (tmdbId: string | number, type: 'movie' | 'tv', season?: number, episode?: number, options?: { color?: string; autoPlay?: boolean; nextEpisode?: boolean; episodeSelector?: boolean; progress?: number }) => {
    let url = type === 'movie' 
      ? `https://www.vidking.net/embed/movie/${tmdbId}`
      : `https://www.vidking.net/embed/tv/${tmdbId}/${season || 1}/${episode || 1}`;
    
    const params: string[] = [];
    if (options) {
      if (options.color) params.push(`color=${options.color}`);
      if (options.autoPlay !== undefined) params.push(`autoPlay=${options.autoPlay}`);
      if (options.nextEpisode !== undefined) params.push(`nextEpisode=${options.nextEpisode}`);
      if (options.episodeSelector !== undefined) params.push(`episodeSelector=${options.episodeSelector}`);
      if (options.progress !== undefined) params.push(`progress=${options.progress}`);
    }
    if (params.length > 0) {
      url += `?${params.join('&')}`;
    }
    return url;
  },

  // --- Vidsrc (vidsrc-embed.ru) API ---
  getVidsrcEmbedUrl: (id: string | number, type: 'movie' | 'tv', season?: number, episode?: number, options?: { subUrl?: string; dsLang?: string; autoplay?: boolean }) => {
    const base = 'https://vidsrc-embed.ru/embed';
    let url = type === 'movie'
      ? `${base}/movie/${id}`
      : `${base}/tv/${id}/${season || 1}-${episode || 1}`;
    const params: string[] = [];
    if (options?.subUrl) params.push(`sub_url=${encodeURIComponent(options.subUrl)}`);
    if (options?.dsLang) params.push(`ds_lang=${options.dsLang}`);
    if (options?.autoplay !== undefined) params.push(`autoplay=${options.autoplay ? 1 : 0}`);
    if (params.length > 0) url += `?${params.join('&')}`;
    return url;
  },

  // --- VidLink (vidlink.pro) API ---
  getVidLinkUrl: (id: string | number, type: 'movie' | 'tv', season?: number, episode?: number, options?: { primaryColor?: string; secondaryColor?: string; iconColor?: string; autoplay?: boolean; nextButton?: boolean; title?: boolean }) => {
    let url = type === 'movie'
      ? `https://vidlink.pro/movie/${id}`
      : `https://vidlink.pro/tv/${id}/${season || 1}/${episode || 1}`;
    const params: string[] = [];
    if (options?.primaryColor) params.push(`primaryColor=${options.primaryColor}`);
    if (options?.secondaryColor) params.push(`secondaryColor=${options.secondaryColor}`);
    if (options?.iconColor) params.push(`iconColor=${options.iconColor}`);
    if (options?.autoplay !== undefined) params.push(`autoplay=${options.autoplay}`);
    if (options?.nextButton !== undefined) params.push(`nextButton=${options.nextButton}`);
    if (options?.title !== undefined) params.push(`title=${options.title}`);
    if (params.length > 0) url += `?${params.join('&')}`;
    return url;
  },

  // --- Vidsrc.to API ---
  getVidsrcToUrl: (id: string | number, type: 'movie' | 'tv', season?: number, episode?: number) => {
    const base = 'https://vidsrc.to/embed';
    return type === 'movie'
      ? `${base}/movie/${id}`
      : `${base}/tv/${id}/${season || 1}/${episode || 1}`;
  },

  // --- TMDB API (with client-side cache + deduplication) ---
  fetchTmdb: async <T>(endpoint: string, params: Record<string, string> = {}): Promise<T> => {
    const isBrowser = typeof window !== 'undefined';

    // Build a deterministic cache key
    const sortedParams = Object.entries(params).sort(([a], [b]) => a.localeCompare(b));
    const paramStr = sortedParams.map(([k, v]) => `${k}=${v}`).join('&');
    const cacheKey = `tmdb:${endpoint}${paramStr ? '?' + paramStr : ''}`;

    // ── Client cache hit ──
    if (isBrowser) {
      const cached = clientCacheGet<T>(cacheKey);
      if (cached) return cached;
    }

    // ── Deduplicate in-flight requests ──
    return dedupeRequest(cacheKey, async () => {
      let urlString = '';

      if (isBrowser) {
        const url = new URL(`${window.location.origin}/api/tmdb${endpoint}`);
        Object.entries(params).forEach(([key, value]) => url.searchParams.append(key, value));
        urlString = url.toString();
      } else {
        const apiKey = process.env.TMDB_API_KEY;
        if (!apiKey) throw new Error('TMDB_API_KEY is not set');
        const url = new URL(`${TMDB_BASE_URL}${endpoint}`);
        url.searchParams.append('api_key', apiKey);
        Object.entries(params).forEach(([key, value]) => url.searchParams.append(key, value));
        urlString = url.toString();
      }

      const data = await tmdbCircuitBreaker.execute(() =>
        withRetries(() => fetchClient(urlString, {
          headers: { 'Accept': 'application/json' },
        }))
      );

      // ── Store in client cache ──
      if (isBrowser) {
        clientCacheSet(cacheKey, data);
      }

      return data as T;
    });
  },

  getMovieDetails: async (id: string | number) => {
    return ApiGateway.fetchTmdb<any>(`/movie/${id}`);
  },

  getMovieCredits: async (id: string | number) => {
    return ApiGateway.fetchTmdb<any>(`/movie/${id}/credits`);
  },

  getMovieRecommendations: async (id: string | number) => {
    return ApiGateway.fetchTmdb<any>(`/movie/${id}/recommendations`);
  },

  getTvDetails: async (id: string | number) => {
    return ApiGateway.fetchTmdb<any>(`/tv/${id}`);
  },

  getTvCredits: async (id: string | number) => {
    return ApiGateway.fetchTmdb<any>(`/tv/${id}/credits`);
  },

  getTvRecommendations: async (id: string | number) => {
    return ApiGateway.fetchTmdb<any>(`/tv/${id}/recommendations`);
  },

  getTvSeasonDetails: async (tvId: string | number, seasonNumber: number) => {
    return ApiGateway.fetchTmdb<any>(`/tv/${tvId}/season/${seasonNumber}`);
  }
};
