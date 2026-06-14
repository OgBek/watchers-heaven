import { fetchClient } from './client';
import { withRetries } from './retries';
import { tmdbCircuitBreaker } from './circuit-breaker';

const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
const RIVE_BASE = 'https://rivestream.ru';

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

  // --- TMDB API ---
  fetchTmdb: async <T>(endpoint: string, apiKey: string, params: Record<string, string> = {}): Promise<T> => {
    const url = new URL(`${TMDB_BASE_URL}${endpoint}`);
    url.searchParams.append('api_key', apiKey);
    Object.entries(params).forEach(([key, value]) => url.searchParams.append(key, value));

    return tmdbCircuitBreaker.execute(() => 
      withRetries(() => fetchClient(url.toString(), {
        headers: {
          'Accept': 'application/json'
        }
      }))
    );
  }
};
