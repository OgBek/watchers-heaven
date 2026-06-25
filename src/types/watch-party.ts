/**
 * Watch Party TypeScript Types
 * Shared across client, server, and store layers.
 */

// ─── Database Row Types ─────────────────────────────────────────────────────

export interface WatchParty {
  id: string;
  room_code: string;
  movie_id: string;
  movie_title: string;
  media_type: 'movie' | 'tv';
  season: number | null;
  episode: number | null;
  provider: string;
  host_user_id: string;
  playing: boolean;
  current_time: number;
  status: 'active' | 'ended';
  created_at: string;
  updated_at: string;
}

// ─── API Payload Types ──────────────────────────────────────────────────────

export interface CreatePartyPayload {
  movieId: string;
  movieTitle: string;
  mediaType: 'movie' | 'tv';
  season?: number;
  episode?: number;
  provider: string;
}

export interface CreatePartyResponse {
  roomCode: string;
  partyId: string;
}

export interface PlaybackUpdate {
  playing: boolean;
  currentTime: number;
}

// ─── UI State Types ─────────────────────────────────────────────────────────

export interface PlayerHandle {
  play: () => void;
  pause: () => void;
  seekTo: (time: number) => void;
  getCurrentTime: () => number;
  isPlaying: () => boolean;
}

export type ConnectionStatus = 'connecting' | 'connected' | 'reconnecting' | 'disconnected';

export type SyncStatus = 'synced' | 'syncing' | 'out-of-sync';

// ─── Realtime Payload ───────────────────────────────────────────────────────

export interface RealtimePartyPayload {
  new: WatchParty;
  old: Partial<WatchParty>;
  eventType: 'UPDATE';
}
