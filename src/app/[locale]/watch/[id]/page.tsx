'use client';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { ArrowLeft, Maximize2, Minimize2, Play, RefreshCw, SkipForward, ArrowLeftCircle, RotateCcw, X } from 'lucide-react';
import { ApiGateway } from '@/lib/api/gateway';
import { useState, useEffect, useRef, useCallback } from 'react';

type Provider = 'vidlink' | 'vidsrc' | 'vidsrcto' | 'vidking' | 'screenscape' | 'toustream' | 'rivestream';

export default function WatchPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const id = params.id as string;
  const locale = (params.locale as string) || 'en';

  // Get season and episode if they exist in query params (e.g. for TV shows)
  const season = searchParams.get('s') ? parseInt(searchParams.get('s')!) : undefined;
  const episode = searchParams.get('e') ? parseInt(searchParams.get('e')!) : undefined;
  const isTv = season !== undefined || episode !== undefined;

  const [provider, setProvider] = useState<Provider>('vidlink');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [savedProgress, setSavedProgress] = useState<number>(0);
  const [showResumePrompt, setShowResumePrompt] = useState(false);
  const [initialProgressApplied, setInitialProgressApplied] = useState(false);
  const [accentColor, setAccentColor] = useState<string>('007bff');
  const iframeRef = useRef<HTMLIFrameElement>(null);

  // Next episode auto-play state
  const [showNextEpisodePopup, setShowNextEpisodePopup] = useState(false);
  const [nextEpisodeCountdown, setNextEpisodeCountdown] = useState(15);
  const nextEpisodeTimerRef = useRef<NodeJS.Timeout | null>(null);
  const hasTriggeredNextRef = useRef(false);

  // Generate storage key — includes provider so each server tracks its own progress
  const storageKey = `watch-progress:${id}:${season || 0}:${episode || 0}:${provider}`;

  // ── getEmbedUrl declared early (before effects that call it) ──
  const getEmbedUrl = useCallback(() => {
    const startProgress = initialProgressApplied ? savedProgress : 0;

    switch (provider) {
      case 'vidlink':
        return ApiGateway.getVidLinkUrl(
          id,
          isTv ? 'tv' : 'movie',
          season,
          episode,
          {
            primaryColor: accentColor,
            secondaryColor: '121212',
            iconColor: accentColor,
            autoplay: true,
            nextButton: false, // We handle next episode ourselves
            title: true,
          }
        );
      case 'vidsrc':
        return ApiGateway.getVidsrcEmbedUrl(
          id,
          isTv ? 'tv' : 'movie',
          season,
          episode,
          { autoplay: true }
        );
      case 'vidsrcto':
        return ApiGateway.getVidsrcToUrl(
          id,
          isTv ? 'tv' : 'movie',
          season,
          episode
        );
      case 'vidking':
        return ApiGateway.getVidKingUrl(
          id,
          isTv ? 'tv' : 'movie',
          season,
          episode,
          {
            color: accentColor,
            autoPlay: true,
            nextEpisode: false, // We handle next episode ourselves
            episodeSelector: true,
            progress: startProgress > 0 ? startProgress : undefined
          }
        );
      case 'screenscape':
        return ApiGateway.getScreenScapeUrl(
          id,
          isTv ? 'tv' : 'movie',
          season,
          episode,
          'eng'
        );
      case 'toustream':
        return isTv
          ? ApiGateway.getTvEmbedUrl(id, season || 1, episode || 1)
          : ApiGateway.getTouStreamMovieUrl(id);
      case 'rivestream':
      default:
        return isTv
          ? ApiGateway.getTvEmbedUrl(id, season || 1, episode || 1)
          : ApiGateway.getMovieEmbedUrl(id);
    }
  }, [provider, id, isTv, season, episode, accentColor, initialProgressApplied, savedProgress]);

  // ── goToNextEpisode declared before saveProgress (which calls it) ──
  const goToNextEpisode = useCallback(() => {
    if (nextEpisodeTimerRef.current) {
      clearInterval(nextEpisodeTimerRef.current);
      nextEpisodeTimerRef.current = null;
    }
    setShowNextEpisodePopup(false);
    const nextEp = (episode || 1) + 1;
    router.push(`/${locale}/watch/${id}?s=${season || 1}&e=${nextEp}`);
  }, [episode, id, locale, router, season]);

  // Load accent color from settings
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('setting-accent-color');
      if (stored) {
        // Strip # if present
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setAccentColor(stored.replace('#', ''));
      }
    }
  }, []);

  // Load saved progress from localStorage (provider-specific)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        try {
          const parsed = JSON.parse(saved) as { timestamp?: number };
          if (parsed && parsed.timestamp && parsed.timestamp > 0) {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setSavedProgress(parsed.timestamp);
            setShowResumePrompt(true);
            setInitialProgressApplied(false);
            return;
          }
        } catch (e) {
          console.error('Error parsing saved progress', e);
        }
      }
      // No progress for this provider — don't show resume prompt
      setShowResumePrompt(false);
      setSavedProgress(0);
    }
  }, [storageKey]);

  // Reload iframe when provider changes or resume is confirmed
  useEffect(() => {
    if (iframeRef.current && !showResumePrompt) {
      iframeRef.current.src = getEmbedUrl();
    }
  }, [provider, initialProgressApplied, showResumePrompt, getEmbedUrl]);

  // Reset next episode trigger when episode changes
  useEffect(() => {
    hasTriggeredNextRef.current = false;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setShowNextEpisodePopup(false);
    if (nextEpisodeTimerRef.current) {
      clearInterval(nextEpisodeTimerRef.current);
      nextEpisodeTimerRef.current = null;
    }
  }, [season, episode]);

  const saveProgress = useCallback((currentTime: number, duration: number) => {
    if (duration <= 0) return;
    const progressPercent = (currentTime / duration) * 100;

    const data = {
      id,
      type: isTv ? 'tv' : 'movie',
      season,
      episode,
      timestamp: Math.floor(currentTime),
      duration: Math.floor(duration),
      progress: progressPercent,
      updatedAt: Date.now(),
    };
    localStorage.setItem(storageKey, JSON.stringify(data));

    // Auto-play next episode detection: trigger when >95% complete
    if (isTv && progressPercent > 95 && !hasTriggeredNextRef.current && !showNextEpisodePopup) {
      hasTriggeredNextRef.current = true;
      setShowNextEpisodePopup(true);
      setNextEpisodeCountdown(15);

      // Start countdown
      nextEpisodeTimerRef.current = setInterval(() => {
        setNextEpisodeCountdown(prev => {
          if (prev <= 1) {
            // Auto-navigate to next episode
            if (nextEpisodeTimerRef.current) clearInterval(nextEpisodeTimerRef.current);
            goToNextEpisode();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
  }, [id, isTv, season, episode, storageKey, showNextEpisodePopup, goToNextEpisode]);

  const goBackToShow = useCallback(() => {
    if (nextEpisodeTimerRef.current) {
      clearInterval(nextEpisodeTimerRef.current);
      nextEpisodeTimerRef.current = null;
    }
    setShowNextEpisodePopup(false);
    router.push(`/${locale}/tv/${id}`);
  }, [id, locale, router]);

  const rewatchEpisode = useCallback(() => {
    if (nextEpisodeTimerRef.current) {
      clearInterval(nextEpisodeTimerRef.current);
      nextEpisodeTimerRef.current = null;
    }
    setShowNextEpisodePopup(false);
    hasTriggeredNextRef.current = false;
    // Clear saved progress for this episode so it starts fresh
    localStorage.removeItem(storageKey);
    setSavedProgress(0);
    // Reload iframe to restart the episode
    if (iframeRef.current) {
      iframeRef.current.src = getEmbedUrl();
    }
  }, [storageKey, getEmbedUrl]);

  const dismissNextPopup = useCallback(() => {
    if (nextEpisodeTimerRef.current) {
      clearInterval(nextEpisodeTimerRef.current);
      nextEpisodeTimerRef.current = null;
    }
    setShowNextEpisodePopup(false);
    hasTriggeredNextRef.current = false;
  }, []);

  // Listen for progress events from player iframes
  useEffect(() => {
    const handlePlayerMessage = (event: MessageEvent) => {
      let eventData: Record<string, unknown> | null = null;

      // Try parsing JSON (some providers send stringified JSON)
      if (typeof event.data === 'string') {
        try {
          eventData = JSON.parse(event.data) as Record<string, unknown>;
        } catch {
          // Not JSON, ignore
        }
      } else if (typeof event.data === 'object' && event.data !== null) {
        eventData = event.data as Record<string, unknown>;
      }

      if (!eventData) return;

      // --- VidLink PLAYER_EVENT (live playback updates) ---
      if (eventData.type === 'PLAYER_EVENT' && eventData.data) {
        const playerData = eventData.data as Record<string, unknown>;
        const currentTime = playerData.currentTime as number | undefined;
        const duration = playerData.duration as number | undefined;
        if (currentTime !== undefined && duration !== undefined) {
          saveProgress(currentTime, duration);
        }
      }

      // --- VidLink MEDIA_DATA (media metadata & continue watching info) ---
      if (eventData.type === 'MEDIA_DATA' && eventData.data) {
        const mediaData = eventData.data as Record<string, unknown>;
        // Store metadata for Continue Watching list
        const continueWatchingKey = `continue-watching`;
        try {
          const existing = localStorage.getItem(continueWatchingKey);
          const list: Record<string, unknown>[] = existing ? JSON.parse(existing) : [];
          // Update or insert this item
          const idx = list.findIndex((item) => item.id === id && item.season === (season || 0) && item.episode === (episode || 0));
          const entry = {
            id,
            type: isTv ? 'tv' : 'movie',
            season: season || 0,
            episode: episode || 0,
            title: (mediaData.title as string) || `#${id}`,
            poster: (mediaData.poster as string) || '',
            updatedAt: Date.now(),
          };
          if (idx >= 0) {
            list[idx] = entry;
          } else {
            list.unshift(entry);
          }
          // Keep only last 50 entries
          localStorage.setItem(continueWatchingKey, JSON.stringify(list.slice(0, 50)));
        } catch (e) {
          console.error('Error saving continue watching data', e);
        }
      }

      // --- ScreenScape Watch History Response ---
      if (eventData.type === 'SCREENSCAPE_WATCH_HISTORY_WITH_PROGRESS_RESPONSE') {
        console.log('ScreenScape History:', eventData.watchHistory);
      }
    };

    globalThis.addEventListener('message', handlePlayerMessage);
    return () => {
      globalThis.removeEventListener('message', handlePlayerMessage);
    };
  }, [id, season, episode, storageKey, isTv, saveProgress]);

  const handleResume = () => {
    setInitialProgressApplied(true);
    setShowResumePrompt(false);
  };

  const handleSkipResume = () => {
    setSavedProgress(0);
    setInitialProgressApplied(true);
    setShowResumePrompt(false);
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  const providersList: { id: Provider; name: string; quality: string; badge?: string }[] = [
    { id: 'vidlink', name: 'VidLink', quality: '1080p / HLS', badge: '⭐' },
    { id: 'vidsrc', name: 'Vidsrc', quality: '1080p / Multi' },
    { id: 'vidsrcto', name: 'Vidsrc.to', quality: '1080p / Multi' },
    { id: 'vidking', name: 'VidKing', quality: '1080p / Auto' },
    { id: 'screenscape', name: 'ScreenScape', quality: '1080p / English' },
    { id: 'toustream', name: 'TouStream', quality: '720p / Backup' },
    { id: 'rivestream', name: 'RiveStream', quality: '1080p / Torrent' }
  ];

  // Determine if this is Rivestream (apply sandbox restrictions)
  const isRivestream = provider === 'rivestream';

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col text-slate-100 font-sans">
      {/* Top Controller Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 px-4 py-3 bg-slate-900/90 border-b border-slate-800 z-10">

        {/* Left Side: Back & Info */}
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-slate-300 hover:text-white transition-colors text-sm font-medium bg-slate-800/80 px-3 py-2 rounded-xl"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>
          <div>
            <h1 className="text-sm font-bold text-white max-w-[200px] md:max-w-xs truncate">
              {isTv ? `TV Show #${id} (S${season}E${episode})` : `Movie #${id}`}
            </h1>
            <p className="text-[10px] text-slate-400">Streaming Aggregator</p>
          </div>
        </div>

        {/* Center: Server Selector */}
        <div className="flex flex-wrap items-center gap-1 bg-slate-950/80 p-1 rounded-2xl border border-slate-800">
          {providersList.map((p) => (
            <button
              key={p.id}
              onClick={() => {
                setProvider(p.id);
                // Provider change triggers storageKey change → useEffect handles resume check
              }}
              className={`px-2.5 py-1.5 rounded-xl text-[11px] font-semibold transition-all duration-300 flex flex-col items-center ${
                provider === p.id
                  ? 'text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
              style={provider === p.id ? { backgroundColor: `#${accentColor}` } : {}}
            >
              <span>{p.badge ? `${p.badge} ${p.name}` : p.name}</span>
              <span className={`text-[8px] mt-0.5 opacity-80 ${provider === p.id ? 'text-white/80' : 'text-slate-500'}`}>
                {p.quality}
              </span>
            </button>
          ))}
        </div>

        {/* Right Side: Refresh & Fullscreen */}
        <div className="flex items-center gap-2 self-end md:self-auto">
          <button
            onClick={() => {
              if (iframeRef.current) {
                iframeRef.current.src = getEmbedUrl();
              }
            }}
            className="text-slate-400 hover:text-white p-2 bg-slate-800/80 rounded-xl transition-colors"
            title="Refresh Player"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <button
            onClick={toggleFullscreen}
            className="text-slate-400 hover:text-white p-2 bg-slate-800/80 rounded-xl transition-colors"
            title="Toggle Fullscreen"
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Main Video Frame & Overlays */}
      <div className="flex-1 flex items-center justify-center relative bg-black">
        {/* Resume Watching Prompt */}
        {showResumePrompt && (
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm z-20 flex flex-col items-center justify-center p-6 animate-fade-in">
            <div className="relative bg-slate-900/95 backdrop-blur-xl border border-slate-700/50 rounded-3xl p-8 max-w-sm w-full shadow-2xl shadow-black/50 flex flex-col items-center space-y-6">
              {/* Close button */}
              <button
                onClick={handleSkipResume}
                className="absolute top-4 right-4 p-1.5 rounded-full text-slate-500 hover:text-white hover:bg-slate-800 transition"
              >
                <X className="w-4 h-4" />
              </button>

              {/* Progress ring */}
              <div className="relative w-20 h-20">
                <svg className="w-20 h-20 -rotate-90" viewBox="0 0 80 80">
                  <circle cx="40" cy="40" r="35" fill="none" stroke="#1e293b" strokeWidth="4" />
                  <circle
                    cx="40" cy="40" r="35" fill="none"
                    stroke={`#${accentColor}`}
                    strokeWidth="4"
                    strokeLinecap="round"
                    strokeDasharray={`${2 * Math.PI * 35}`}
                    strokeDashoffset={`${2 * Math.PI * 35 * (1 - Math.min((savedProgress / 3600), 1))}`}
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <Play className="w-6 h-6 text-white fill-white" />
                </div>
              </div>

              <div className="text-center">
                <h3 className="text-xl font-black text-white mb-1">Resume Watching?</h3>
                <p className="text-slate-400 text-sm">
                  Pick up from <span className="text-white font-semibold">{Math.floor(savedProgress / 60)}m {savedProgress % 60}s</span> on <span className="text-white font-semibold">{providersList.find(p => p.id === provider)?.name || provider}</span>
                </p>
              </div>

              {/* Action buttons */}
              <div className="flex flex-col gap-2.5 w-full">
                <button
                  onClick={handleResume}
                  className="w-full flex items-center justify-center gap-2.5 hover:brightness-110 text-white font-bold py-3.5 px-4 rounded-2xl text-sm transition-all shadow-lg"
                  style={{ backgroundColor: `#${accentColor}` }}
                >
                  <Play className="w-4 h-4 fill-white" />
                  Yes, Resume
                </button>
                <button
                  onClick={handleSkipResume}
                  className="w-full flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold py-3 px-4 rounded-2xl text-sm transition-colors"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  Start Over
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Next Episode Auto-play Popup */}
        {showNextEpisodePopup && isTv && (
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm z-30 flex flex-col items-center justify-center p-6 animate-fade-in">
            <div className="relative bg-slate-900/95 backdrop-blur-xl border border-slate-700/50 rounded-3xl p-8 max-w-md w-full shadow-2xl shadow-black/50 flex flex-col items-center space-y-6">
              {/* Close button */}
              <button
                onClick={dismissNextPopup}
                className="absolute top-4 right-4 p-1.5 rounded-full text-slate-500 hover:text-white hover:bg-slate-800 transition"
              >
                <X className="w-4 h-4" />
              </button>

              {/* Countdown ring */}
              <div className="relative w-20 h-20">
                <svg className="w-20 h-20 -rotate-90" viewBox="0 0 80 80">
                  <circle cx="40" cy="40" r="35" fill="none" stroke="#1e293b" strokeWidth="4" />
                  <circle
                    cx="40" cy="40" r="35" fill="none"
                    stroke={`#${accentColor}`}
                    strokeWidth="4"
                    strokeLinecap="round"
                    strokeDasharray={`${2 * Math.PI * 35}`}
                    strokeDashoffset={`${2 * Math.PI * 35 * (nextEpisodeCountdown / 15)}`}
                    className="transition-all duration-1000 ease-linear"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-2xl font-black text-white">{nextEpisodeCountdown}</span>
                </div>
              </div>

              <div className="text-center">
                <h3 className="text-xl font-black text-white mb-1">Episode Finished</h3>
                <p className="text-slate-400 text-sm">
                  Up next: <span className="text-white font-semibold">S{season}E{(episode || 1) + 1}</span>
                </p>
              </div>

              {/* Progress bar */}
              <div className="w-full bg-slate-800 rounded-full h-1 overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-1000 ease-linear"
                  style={{
                    width: `${((15 - nextEpisodeCountdown) / 15) * 100}%`,
                    backgroundColor: `#${accentColor}`
                  }}
                />
              </div>

              {/* Action buttons */}
              <div className="flex flex-col gap-2.5 w-full">
                <button
                  onClick={goToNextEpisode}
                  className="w-full flex items-center justify-center gap-2.5 hover:brightness-110 text-white font-bold py-3.5 px-4 rounded-2xl text-sm transition-all shadow-lg"
                  style={{ backgroundColor: `#${accentColor}` }}
                >
                  <SkipForward className="w-4 h-4" />
                  Play Next Episode
                </button>

                <div className="flex gap-2.5">
                  <button
                    onClick={rewatchEpisode}
                    className="flex-1 flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold py-3 px-4 rounded-2xl text-sm transition-colors"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    Rewatch
                  </button>
                  <button
                    onClick={goBackToShow}
                    className="flex-1 flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold py-3 px-4 rounded-2xl text-sm transition-colors"
                  >
                    <ArrowLeftCircle className="w-3.5 h-3.5" />
                    Show Details
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        <iframe
          ref={iframeRef}
          src={getEmbedUrl()}
          className="w-full h-full min-h-[75vh]"
          allowFullScreen
          allow="autoplay; fullscreen; picture-in-picture"
          {...(isRivestream ? { sandbox: "allow-scripts allow-same-origin allow-forms allow-popups" } : {})}
          title="Watchers Heaven Stream Player"
          style={{ border: 'none' }}
        />
      </div>

      {/* Info notice */}
      <div className="px-6 py-4 bg-slate-900 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
        <span>If the player shows a loading error, try switching servers above.</span>
        <span>Watch History is synced locally.</span>
      </div>
    </div>
  );
}
