import { VylaEvent, HealthResponse, VylaDownload, VylaSubtitle, ProviderState, VylaSource, VylaErrorClass } from './vyla-types';

export * from './vyla-types';

const BASE_URL = 'https://missourimonster-vyla-v2.hf.space';
const MAX_BUFFER_SIZE = 1024 * 1024; // 1MB soft cap
const TOKEN_REFRESH_BUFFER_MS = 5 * 60 * 1000;
const TIMEOUT_MS = 20000;

let globalTokenPromise: Promise<string> | null = null;
let tokenExpiresAt = 0;
const providerStates: Record<string, ProviderState> = {};

export class VylaClient {
  // --- Auth ---
  static async getToken(forceRefresh = false): Promise<string> {
    if (!forceRefresh && globalTokenPromise && Date.now() < tokenExpiresAt - TOKEN_REFRESH_BUFFER_MS) {
      return globalTokenPromise;
    }

    globalTokenPromise = (async () => {
      try {
        const res = await fetch(`${BASE_URL}/api/auth`, { method: 'POST' });
        if (!res.ok) throw new Error(`Auth failed: ${res.status}`);
        const data = await res.json();
        tokenExpiresAt = Date.now() + (data.expires_in || 1800) * 1000;
        return data.token;
      } catch (err) {
        globalTokenPromise = null;
        throw err;
      }
    })();

    return globalTokenPromise;
  }

  static async refreshToken(): Promise<string> {
      return this.getToken(true);
  }

  // --- Core SSE Parser ---
  static parseSSE(buffer: string): { events: VylaEvent[], remainingBuffer: string } {
      const events: VylaEvent[] = [];
      let remainingBuffer = buffer;

      remainingBuffer = remainingBuffer.replace(/\r\n/g, '\n');
      const parts = remainingBuffer.split('\n\n');
      remainingBuffer = parts.pop() || '';

      for (const part of parts) {
          if (!part.trim()) continue;
          
          const lines = part.split('\n');
          const dataLines = lines
            .filter(l => l.startsWith('data:'))
            .map(l => l.replace(/^data:\s*/, ''));

          if (dataLines.length > 0) {
            const dataStr = dataLines.join('');
            try {
              const parsed = JSON.parse(dataStr) as VylaEvent;
              events.push(parsed);
            } catch (e) {
              console.warn('[Vyla SSE Parse Error] Malformed chunk:', dataStr, e);
            }
          }
      }
      
      return { events, remainingBuffer };
  }

  // --- Streams ---
  static async *streamMedia(endpoint: string, token: string, signal: AbortSignal): AsyncGenerator<VylaEvent, void, unknown> {
    const controller = new AbortController();
    const onAbort = () => controller.abort();
    signal.addEventListener('abort', onAbort);
    
    const timeoutId = setTimeout(() => {
        controller.abort(new Error('NetworkError: Connection timed out'));
    }, TIMEOUT_MS);

    let response: Response;
    try {
        response = await fetch(`${BASE_URL}${endpoint}`, {
        headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'text/event-stream'
        },
        signal: controller.signal
        });
    } catch(err) {
        clearTimeout(timeoutId);
        throw err;
    }

    if (!response.ok) {
        clearTimeout(timeoutId);
        if (response.status === 401 || response.status === 403) {
            throw new Error('AuthError: ' + response.status);
        }
        throw new Error('NetworkError: ' + response.status);
    }

    if (!response.body) {
        clearTimeout(timeoutId);
        throw new Error('NetworkError: No response body');
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';
    let hasReceivedEvents = false;

    try {
      while (true) {
        const { done, value } = await reader.read();
        
        if (!hasReceivedEvents && value && value.length > 0) {
            hasReceivedEvents = true;
            clearTimeout(timeoutId);
        }

        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        
        if (buffer.length > MAX_BUFFER_SIZE) {
            buffer = buffer.slice(-MAX_BUFFER_SIZE);
        }

        const { events, remainingBuffer } = this.parseSSE(buffer);
        buffer = remainingBuffer;

        for (const ev of events) {
            if (ev.type !== 'debug') {
                yield ev;
            } else if (process.env.NODE_ENV === 'development') {
                console.debug('[Vyla Debug Event]', ev);
            }
        }
      }
    } finally {
        signal.removeEventListener('abort', onAbort);
        clearTimeout(timeoutId);
        if (buffer.trim()) {
            buffer += '\n\n'; // force flush
            const { events } = this.parseSSE(buffer);
            for (const ev of events) {
                if (ev.type !== 'debug') yield ev;
            }
        }
        try { await reader.cancel(); } catch { /* ignore */ }
        try { reader.releaseLock(); } catch { /* ignore */ }
    }
  }

  static async streamMovie(tmdbId: string, signal: AbortSignal) {
    const token = await this.getToken();
    return this.streamMedia(`/api/stream/movie/${tmdbId}`, token, signal);
  }

  static async streamTV(tmdbId: string, season: number, episode: number, signal: AbortSignal) {
    const token = await this.getToken();
    return this.streamMedia(`/api/stream/tv/${tmdbId}/${season}/${episode}`, token, signal);
  }

  // --- Ancillary Data ---
  static async getDownloads(type: 'movie' | 'tv', id: string | number, season?: number, episode?: number, signal?: AbortSignal): Promise<VylaDownload[]> {
      let url: string;
      if (type === 'tv' && season !== undefined && episode !== undefined) {
          url = `${BASE_URL}/downloads/tv/${id}/${season}/${episode}`;
      } else {
          url = `${BASE_URL}/downloads/movie/${id}`;
      }

      const res = await fetch(url, { signal });
      if (!res.ok) throw new Error(`Download API returned ${res.status}`);
      const data = await res.json() as { downloads?: VylaDownload[] } | VylaDownload[];
      const downloads: VylaDownload[] = Array.isArray(data) ? data : data.downloads ?? [];
      const active = downloads.filter((d) => d.active !== false);
      if (active.length === 0) throw new Error('No download links available');
      return active;
  }

  static async getSubtitles(tmdbId: string): Promise<VylaSubtitle[]> {
      const res = await fetch(`${BASE_URL}/api/subtitles/${tmdbId}`);
      if (!res.ok) return [];
      const data = await res.json();
      return data.subtitles || [];
  }

  // --- Health & Circuit Breaker ---
  static async getHealth(): Promise<HealthResponse> {
      const res = await fetch(`${BASE_URL}/api/health`);
      if (!res.ok) throw new Error('Health check failed');
      return res.json();
  }

  static testProvider(sourceKey: string, errorClass: VylaErrorClass) {
      const current = providerStates[sourceKey] || {
          failures: { network: 0, auth: 0, timeout: 0, playback: 0 },
          totalFailures: 0,
          emaSuccessRate: 0.8,
          lastUpdateTime: Date.now(),
          initialTrialsRemaining: 2,
          lastFailTime: 0,
          state: 'CLOSED',
          cooldownUntil: 0,
          inTrial: false
      };
      
      const now = Date.now();
      const timeDiff = Math.max(1, now - current.lastUpdateTime);
      const decay = Math.exp(-timeDiff / 60000);
      
      const newTotalFailures = current.totalFailures + 1;
      const newEma = (current.emaSuccessRate * decay) * 0.7;
      
      const failures = { ...current.failures };
      if (errorClass === 'NetworkError') failures.network++;
      else if (errorClass === 'AuthError') failures.auth++;
      else if (errorClass === 'PlaybackError') failures.playback++;
      else failures.timeout++;

      let newState = current.state;
      let newCooldown = current.cooldownUntil;
      let newInitialTrials = current.initialTrialsRemaining;

      if (newInitialTrials > 0) newInitialTrials--;

      if (newTotalFailures >= 3) {
          newState = 'OPEN';
          newCooldown = now + (errorClass === 'TimeoutError' ? 120000 : 60000);
      }

      providerStates[sourceKey] = {
          failures,
          totalFailures: newTotalFailures,
          emaSuccessRate: newEma,
          lastUpdateTime: now,
          initialTrialsRemaining: newInitialTrials,
          lastFailTime: now,
          state: newState,
          cooldownUntil: newCooldown,
          inTrial: false
      };
  }

  static rankSources(sources: VylaSource[]): VylaSource[] {
      return [...sources].sort((a, b) => {
          const stateA = providerStates[a.source] || { emaSuccessRate: 0.8, state: 'CLOSED', cooldownUntil: 0 };
          const stateB = providerStates[b.source] || { emaSuccessRate: 0.8, state: 'CLOSED', cooldownUntil: 0 };
          
          if (stateA.state === 'OPEN' && stateB.state !== 'OPEN') return 1;
          if (stateB.state === 'OPEN' && stateA.state !== 'OPEN') return -1;
          if (stateA.cooldownUntil > Date.now() && stateB.cooldownUntil <= Date.now()) return 1;
          if (stateB.cooldownUntil > Date.now() && stateA.cooldownUntil <= Date.now()) return -1;

          return stateB.emaSuccessRate - stateA.emaSuccessRate;
      });
  }

  static handleRetries(sources: VylaSource[], currentIdx: number, errorClass: VylaErrorClass): { nextIdx: number, fallbackSource: VylaSource | null } {
      const src = sources[currentIdx];
      if (src) {
          this.testProvider(src.source, errorClass);
      }

      const nextIdx = currentIdx + 1;
      if (nextIdx < sources.length) {
          return { nextIdx, fallbackSource: sources[nextIdx] };
      }
      return { nextIdx: -1, fallbackSource: null };
  }
}
