'use client';

/**
 * VylaPlayer
 * Native HLS video player powered by the Vyla API.
 * Vyla fans out to multiple providers via SSE, verifies streams live,
 * and returns proxied CORS-safe HLS/MP4 URLs + subtitles.
 */

import { useEffect, useRef, useState, useCallback } from 'react';
import {
  Play, Pause, Volume2, VolumeX, Maximize2, Minimize2,
  Loader, AlertCircle, RefreshCw, ChevronDown, Subtitles,
} from 'lucide-react';

const VYLA_BASE = 'https://missourimonster-vyla.hf.space';

// ─── Types ───────────────────────────────────────────────────────────────────

interface VylaMeta {
  id: number;
  title: string;
  release_date?: string;
  runtime?: number;
  vote_average?: number;
}

interface VylaSource {
  source: string;
  label: string;
  url: string;
}

interface VylaSubtitle {
  label: string;
  file: string;
  type: 'vtt' | 'srt';
  source: string;
}

// ─── Props ───────────────────────────────────────────────────────────────────

interface VylaPlayerProps {
  id: string | number;
  type: 'movie' | 'tv';
  season?: number;
  episode?: number;
  accentColor?: string;
  startAt?: number;
  onProgress?: (currentTime: number, duration: number) => void;
}

// ─── Component ───────────────────────────────────────────────────────────────

export function VylaPlayer({
  id, type, season, episode, accentColor = '007bff', startAt = 0, onProgress,
}: VylaPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const hlsRef = useRef<any>(null);

  const [sources, setSources] = useState<VylaSource[]>([]);
  const [subtitles, setSubtitles] = useState<VylaSubtitle[]>([]);
  const [meta, setMeta] = useState<VylaMeta | null>(null);
  const [activeSourceIdx, setActiveSourceIdx] = useState(0);
  const [activeSubtitle, setActiveSubtitle] = useState<string | null>(null);

  const [loading, setLoading] = useState(true);
  const [sourceCount, setSourceCount] = useState(0);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(false);
  const [volume, setVolume] = useState(1);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [fullscreen, setFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [showSourceMenu, setShowSourceMenu] = useState(false);
  const [showSubMenu, setShowSubMenu] = useState(false);
  const controlsTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ── Build SSE endpoint ──────────────────────────────────────────────────────
  const sseUrl = type === 'movie'
    ? `${VYLA_BASE}/movie?id=${id}`
    : `${VYLA_BASE}/tv?id=${id}&season=${season || 1}&episode=${episode || 1}`;

  // ── Load Hls.js dynamically (client-side only) ──────────────────────────────
  const loadHls = useCallback(async (url: string) => {
    const video = videoRef.current;
    if (!video) return;

    // Destroy previous instance
    if (hlsRef.current) {
      hlsRef.current.destroy();
      hlsRef.current = null;
    }

    if (url.includes('.m3u8') || url.includes('/api?url=')) {
      // HLS source — use hls.js
      try {
        const HlsModule = await import('hls.js');
        const Hls = HlsModule.default;
        if (Hls.isSupported()) {
          const hls = new Hls({ enableWorker: true });
          hlsRef.current = hls;
          hls.loadSource(url);
          hls.attachMedia(video);
          hls.on(Hls.Events.MANIFEST_PARSED, () => {
            if (startAt > 0) video.currentTime = startAt;
            video.play().catch(() => {});
          });
          hls.on(Hls.Events.ERROR, (_: unknown, data: { fatal: boolean; type: string }) => {
            if (data.fatal) {
              setError(`HLS error: ${data.type}`);
            }
          });
          return;
        }
      } catch {
        // hls.js not available — fall through to native
      }
    }

    // MP4 or native HLS (Safari)
    video.src = url;
    if (startAt > 0) video.currentTime = startAt;
    video.play().catch(() => {});
  }, [startAt]);

  // ── Switch to a specific source ──────────────────────────────────────────────
  const switchSource = useCallback((idx: number) => {
    const src = sources[idx];
    if (!src) return;
    setActiveSourceIdx(idx);
    setError(null);
    loadHls(src.url);
  }, [sources, loadHls]);

  // ── Open SSE stream ──────────────────────────────────────────────────────────
  const openStream = useCallback(() => {
    setSources([]);
    setSubtitles([]);
    setMeta(null);
    setDone(false);
    setError(null);
    setLoading(true);
    setSourceCount(0);
    setActiveSourceIdx(0);

    const es = new EventSource(sseUrl);
    let firstSource = true;

    es.onmessage = (ev) => {
      try {
        const payload = JSON.parse(ev.data as string) as {
          type: string;
          meta?: VylaMeta;
          subtitles?: VylaSubtitle[];
          source?: VylaSource;
          total?: number;
        };

        if (payload.type === 'meta') {
          if (payload.meta) setMeta(payload.meta);
          if (payload.subtitles?.length) setSubtitles(payload.subtitles);
        }

        if (payload.type === 'source' && payload.source) {
          setSources((prev) => [...prev, payload.source!]);
          setSourceCount((c) => c + 1);
          setLoading(false);
          // Auto-load first working source
          if (firstSource) {
            firstSource = false;
            loadHls(payload.source.url);
          }
        }

        if (payload.type === 'done') {
          setDone(true);
          es.close();
          if (sourceCount === 0 && !firstSource === false) {
            setError('No working sources found for this title.');
            setLoading(false);
          }
        }
      } catch { /* malformed event — skip */ }
    };

    es.onerror = () => {
      es.close();
      setLoading(false);
      if (sources.length === 0) {
        setError('Could not connect to Vyla API. Try another server.');
      }
    };

    return () => es.close();
  }, [sseUrl, loadHls, sourceCount, sources.length]);

  // ── Start stream on mount ────────────────────────────────────────────────────
  useEffect(() => {
    const cleanup = openStream();
    return () => {
      cleanup?.();
      if (hlsRef.current) { hlsRef.current.destroy(); hlsRef.current = null; }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, type, season, episode]);

  // ── Video event listeners ────────────────────────────────────────────────────
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const onPlay = () => setPlaying(true);
    const onPause = () => setPlaying(false);
    const onTimeUpdate = () => {
      setCurrentTime(video.currentTime);
      onProgress?.(video.currentTime, video.duration || 0);
    };
    const onDurationChange = () => setDuration(video.duration || 0);
    const onVolumeChange = () => { setVolume(video.volume); setMuted(video.muted); };
    const onError = () => {
      // Try next source automatically
      setActiveSourceIdx((prev) => {
        const next = prev + 1;
        if (next < sources.length) {
          switchSource(next);
          return next;
        }
        setError('All sources failed. Try refreshing.');
        return prev;
      });
    };

    video.addEventListener('play', onPlay);
    video.addEventListener('pause', onPause);
    video.addEventListener('timeupdate', onTimeUpdate);
    video.addEventListener('durationchange', onDurationChange);
    video.addEventListener('volumechange', onVolumeChange);
    video.addEventListener('error', onError);
    return () => {
      video.removeEventListener('play', onPlay);
      video.removeEventListener('pause', onPause);
      video.removeEventListener('timeupdate', onTimeUpdate);
      video.removeEventListener('durationchange', onDurationChange);
      video.removeEventListener('volumechange', onVolumeChange);
      video.removeEventListener('error', onError);
    };
  }, [sources, switchSource, onProgress]);

  // ── Fullscreen listener ──────────────────────────────────────────────────────
  useEffect(() => {
    const onChange = () => setFullscreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', onChange);
    return () => document.removeEventListener('fullscreenchange', onChange);
  }, []);

  // ── Controls auto-hide ───────────────────────────────────────────────────────
  const resetControlsTimer = useCallback(() => {
    setShowControls(true);
    if (controlsTimerRef.current) clearTimeout(controlsTimerRef.current);
    controlsTimerRef.current = setTimeout(() => setShowControls(false), 3000);
  }, []);

  // ── Helpers ──────────────────────────────────────────────────────────────────
  const togglePlay = () => {
    const v = videoRef.current;
    if (!v) return;
    if (v.paused) v.play().catch(() => {}); else v.pause();
  };

  const toggleMute = () => {
    const v = videoRef.current;
    if (!v) return;
    v.muted = !v.muted;
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = videoRef.current;
    if (!v) return;
    const val = parseFloat(e.target.value);
    v.volume = val;
    v.muted = val === 0;
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = videoRef.current;
    if (!v) return;
    v.currentTime = parseFloat(e.target.value);
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
  };

  const fmt = (s: number) => {
    if (!isFinite(s)) return '0:00';
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60).toString().padStart(2, '0');
    return `${m}:${sec}`;
  };

  // ─── Render ────────────────────────────────────────────────────────────────

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full bg-black select-none"
      onMouseMove={resetControlsTimer}
      onClick={resetControlsTimer}
    >
      {/* Native video element */}
      <video
        ref={videoRef}
        className="w-full h-full object-contain"
        playsInline
      >
        {/* Active subtitle track */}
        {activeSubtitle && (
          <track
            kind="subtitles"
            src={activeSubtitle}
            default
          />
        )}
      </video>

      {/* Loading overlay */}
      {loading && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 z-20 gap-3">
          <Loader className="w-10 h-10 animate-spin text-white" />
          <p className="text-white text-sm font-semibold">
            {sources.length === 0 ? 'Finding sources…' : `${sources.length} source${sources.length > 1 ? 's' : ''} found`}
          </p>
          {meta && (
            <p className="text-slate-400 text-xs">{meta.title}</p>
          )}
        </div>
      )}

      {/* Error overlay */}
      {error && !loading && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/90 z-20 gap-4 p-6">
          <AlertCircle className="w-10 h-10 text-red-400" />
          <p className="text-white text-sm font-semibold text-center">{error}</p>
          <button
            onClick={openStream}
            className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 text-white text-xs font-bold rounded-xl transition"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Retry
          </button>
        </div>
      )}

      {/* Source badge — top left */}
      {!loading && sources.length > 0 && (
        <div className="absolute top-3 left-3 z-10 flex items-center gap-1.5">
          <span
            className="text-[10px] font-black px-2 py-0.5 rounded-lg text-white"
            style={{ backgroundColor: `#${accentColor}` }}
          >
            {sources[activeSourceIdx]?.label ?? 'Vyla'}
          </span>
          {done && (
            <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-lg bg-black/50 text-slate-300">
              {sourceCount} sources
            </span>
          )}
        </div>
      )}

      {/* Controls overlay — only show when video has loaded and has a known duration */}
      {!loading && !error && duration > 0 && (
      <div
        className={`absolute inset-x-0 bottom-0 z-30 transition-opacity duration-300 ${showControls || !playing ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
      >
        <div className="bg-gradient-to-t from-black/90 via-black/40 to-transparent px-4 pt-8 pb-4 space-y-2">

          {/* Seek bar */}
          <input
            type="range"
            min={0}
            max={duration || 100}
            step={0.5}
            value={currentTime}
            onChange={handleSeek}
            className="w-full h-1 accent-white cursor-pointer"
            style={{ accentColor: `#${accentColor}` }}
          />

          {/* Bottom controls row */}
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              {/* Play/Pause */}
              <button onClick={togglePlay} className="text-white hover:opacity-80 transition p-1">
                {playing
                  ? <Pause className="w-5 h-5 fill-white" />
                  : <Play className="w-5 h-5 fill-white" />
                }
              </button>

              {/* Volume */}
              <div className="flex items-center gap-1.5">
                <button onClick={toggleMute} className="text-white hover:opacity-80 transition p-1">
                  {muted || volume === 0
                    ? <VolumeX className="w-4 h-4" />
                    : <Volume2 className="w-4 h-4" />
                  }
                </button>
                <input
                  type="range"
                  min={0}
                  max={1}
                  step={0.05}
                  value={muted ? 0 : volume}
                  onChange={handleVolumeChange}
                  className="w-16 h-1 cursor-pointer hidden sm:block"
                  style={{ accentColor: `#${accentColor}` }}
                />
              </div>

              {/* Time */}
              <span className="text-white text-[11px] font-mono font-semibold tabular-nums">
                {fmt(currentTime)} / {fmt(duration)}
              </span>
            </div>

            <div className="flex items-center gap-2">
              {/* Source switcher */}
              {sources.length > 1 && (
                <div className="relative">
                  <button
                    onClick={() => { setShowSourceMenu((v) => !v); setShowSubMenu(false); }}
                    className="flex items-center gap-1 text-white text-[10px] font-bold px-2 py-1 rounded-lg bg-white/10 hover:bg-white/20 transition"
                  >
                    Source
                    <ChevronDown className="w-3 h-3" />
                  </button>
                  {showSourceMenu && (
                    <div className="absolute bottom-8 right-0 bg-slate-900 border border-slate-700 rounded-xl overflow-hidden shadow-xl min-w-[150px] z-40">
                      {sources.map((src, i) => (
                        <button
                          key={src.source}
                          onClick={() => { switchSource(i); setShowSourceMenu(false); }}
                          className={`w-full text-left px-3 py-2 text-xs font-semibold transition ${
                            i === activeSourceIdx
                              ? 'text-white bg-white/10'
                              : 'text-slate-300 hover:bg-white/5'
                          }`}
                        >
                          {src.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Subtitle switcher */}
              {subtitles.length > 0 && (
                <div className="relative">
                  <button
                    onClick={() => { setShowSubMenu((v) => !v); setShowSourceMenu(false); }}
                    className={`p-1 rounded-lg transition ${activeSubtitle ? 'text-yellow-400' : 'text-white hover:opacity-80'}`}
                    title="Subtitles"
                  >
                    <Subtitles className="w-4 h-4" />
                  </button>
                  {showSubMenu && (
                    <div className="absolute bottom-8 right-0 bg-slate-900 border border-slate-700 rounded-xl overflow-hidden shadow-xl min-w-[140px] z-40">
                      <button
                        onClick={() => { setActiveSubtitle(null); setShowSubMenu(false); }}
                        className={`w-full text-left px-3 py-2 text-xs font-semibold transition ${!activeSubtitle ? 'text-white bg-white/10' : 'text-slate-300 hover:bg-white/5'}`}
                      >
                        Off
                      </button>
                      {subtitles.map((sub) => (
                        <button
                          key={sub.file}
                          onClick={() => { setActiveSubtitle(sub.file); setShowSubMenu(false); }}
                          className={`w-full text-left px-3 py-2 text-xs font-semibold transition ${activeSubtitle === sub.file ? 'text-yellow-400 bg-white/10' : 'text-slate-300 hover:bg-white/5'}`}
                        >
                          {sub.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Fullscreen */}
              <button onClick={toggleFullscreen} className="text-white hover:opacity-80 transition p-1">
                {fullscreen
                  ? <Minimize2 className="w-4 h-4" />
                  : <Maximize2 className="w-4 h-4" />
                }
              </button>
            </div>
          </div>
        </div>
      </div>
      )}
    </div>
  );
}
