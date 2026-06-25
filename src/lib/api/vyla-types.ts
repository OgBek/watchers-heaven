export interface VylaMeta {
  id: number;
  title?: string;
  [key: string]: unknown;
}

export interface VylaSource {
  source: string;
  label: string;
  url: string;
}

export interface VylaSubtitle {
  label: string;
  file: string;
  type: 'vtt' | 'srt';
}

export interface VylaDone {
  type: 'done';
  total: number;
}

export interface VylaDebugResult {
  source: string;
  ok: boolean;
  error: string | null;
  elapsed_ms: number;
}

export interface VylaDebugEvent {
  type: 'debug';
  results: VylaDebugResult[];
}

export type VylaEvent =
  | { type: 'meta'; meta: VylaMeta; subtitles?: VylaSubtitle[] }
  | { type: 'source'; source: VylaSource }
  | VylaDebugEvent
  | VylaDone;

export interface ProviderHealth {
  ok: boolean;
  ms: number;
}

export interface HealthResponse {
  status: 'ok' | 'degraded';
  timestamp: string;
  tmdb: boolean;
  cache: number;
  probe_id: string;
  sources: Record<string, ProviderHealth>;
}

export interface VylaDownload {
  url: string;
  quality: string;
  size: string | null;
  type: string;
  active?: boolean;
}

export type PlayerState =
  | 'idle'
  | 'loading'
  | 'playing'
  | 'buffering'
  | 'switching'
  | 'recovering'
  | 'ended'
  | 'error';

export type VylaErrorClass =
  | 'AuthError'
  | 'NoSources'
  | 'NetworkError'
  | 'ParsingError'
  | 'PlaybackError'
  | 'TimeoutError';

export interface VylaError {
  classification: VylaErrorClass;
  message: string;
}

export interface ProviderState {
  failures: {
    network: number;
    auth: number;
    timeout: number;
    playback: number;
  };
  totalFailures: number;
  emaSuccessRate: number; // Time-Weighted Exponential Moving Average
  lastUpdateTime: number; // Timestamp for time-aware decay
  initialTrialsRemaining: number; // Caps cold-start bias (default 2)
  lastFailTime: number;
  state: 'CLOSED' | 'OPEN' | 'HALF-OPEN';
  cooldownUntil: number;
  inTrial: boolean; // Prevents race conditions during HALF-OPEN state
}

export interface VylaTelemetry {
  onSourceSelected?: (source: VylaSource) => void;
  onSourceFailed?: (source: VylaSource, error: string, errorClass: VylaErrorClass) => void;
  onFallbackTriggered?: (nextSource: VylaSource) => void;
  onPlaybackStarted?: () => void;
  onPlaybackError?: (error: VylaError) => void;
  onProviderLatencySample?: (source: string, ms: number) => void;
  onProviderSuccessRateUpdate?: (source: string, ratio: number) => void;
}
