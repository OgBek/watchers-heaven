import { fetchClient } from './client';
import { withRetries } from './retries';
import { tmdbCircuitBreaker } from './circuit-breaker';

const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
const RIVE_BASE = 'https://rivestream.ru';

export interface TouStreamChannel {
  slug: string;
  name: string;
  logo: string;
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

  getTouStreamChannels: async (): Promise<TouStreamChannel[]> => {
    try {
      const res = await fetch('https://toustream.xyz/tou/api/channels');
      if (!res.ok) throw new Error('Failed to fetch channels');
      return await res.json();
    } catch (err) {
      console.error('Error fetching TouStream channels:', err);
      // Fallback channels in case the API is temporarily down
      return [
        { slug: 'cartoonnetwork', name: 'Cartoon Network', logo: 'https://upload.wikimedia.org/wikipedia/commons/b/bb/Cartoon_Network_Logo.svg' },
        { slug: 'disneychannel', name: 'Disney Channel', logo: 'https://upload.wikimedia.org/wikipedia/commons/d/d2/Disney_Channel_logo.svg' },
        { slug: 'nickelodeon', name: 'Nickelodeon', logo: 'https://upload.wikimedia.org/wikipedia/commons/a/a9/Nickelodeon_logo_%282023%29.svg' }
      ];
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
