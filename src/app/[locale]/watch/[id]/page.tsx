'use client';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { ArrowLeft, Maximize2, Minimize2, Play, RefreshCw, SkipForward, ArrowLeftCircle, RotateCcw, X, Download, Users } from 'lucide-react';
import { ApiGateway } from '@/lib/api/gateway';
import { useState, useEffect, useRef, useCallback } from 'react';
import { DownloadModal } from '@/components/download/DownloadModal';
import { VylaPlayer } from '@/components/player/VylaPlayer';
import { supabase } from '@/lib/supabase/client';

type Provider = 'vyla' | 'vidsync' | 'vidrock' | 'videasy' | 'vidfast' | 'vidlink' | 'vidsrc' | 'vidsrcto' | 'vidking' | 'screenscape' | 'toustream' | 'rivestream';

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
  const isAnime = searchParams.get('type') === 'anime';

  const [provider, setProvider] = useState<Provider>(
    isAnime ? 'videasy' : 'vyla'
  );
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showDownload, setShowDownload] = useState(false);
  const [savedProgress, setSavedProgress] = useState<number>(0);
  const [showResumePrompt, setShowResumePrompt] = useState(false);
  const [initialProgressApplied, setInitialProgressApplied] = useState(false);
  const [accentColor, setAccentColor] = useState<string>('007bff');
  const [isCreatingParty, setIsCreatingParty] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const handleCreateParty = async () => {
    if (!['vyla', 'vidsync'].includes(provider)) return;
    setIsCreatingParty(true);
    try {
      // 1. Ensure user has a session to create the party
      let { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        const { error } = await supabase.auth.signInAnonymously();
        if (error) throw new Error('Failed to authenticate anonymously');
        const authRes = await supabase.auth.getSession();
        session = authRes.data.session;
      }

      const movieTitle = isTv ? `TV Show #${id} (S${season}E${episode})` : `Movie #${id}`;
      
      const res = await fetch('/api/party', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          ...(session?.access_token ? { 'Authorization': `Bearer ${session.access_token}` } : {})
        },
        body: JSON.stringify({
          movieId: id,
          movieTitle,
          mediaType: isTv ? 'tv' : 'movie',
          season,
          episode,
          provider
        })
      });
      
      if (!res.ok) throw new Error('Failed to create party');
      const data = await res.json();
      router.push(`/${locale}/party/${data.roomCode}`);
    } catch (err) {
      console.error(err);
      alert('Failed to create Watch Party');
      setIsCreatingParty(false);
    }
  };

  // AniList ID — resolved once for anime content so Videasy gets the right ID
  const [aniListId, setAniListId] = useState<number | null>(null);
  const [aniListTitle, setAniListTitle] = useState<string>('');

  // Resolve AniList ID when watching anime with Videasy
  useEffect(() => {
    if (!isAnime || provider !== 'videasy') return;
    if (aniListId !== null) return; // already resolved

    async function resolve() {
      // Try to get the title from TMDB first, then search AniList
      try {
        const data = await ApiGateway.fetchTmdb<{ name?: string; original_name?: string }>(`/tv/${id}`);
        const title = data.name || data.original_name || '';
        if (title) {
          setAniListTitle(title);
          const aid = await ApiGateway.getAniListId(title);
          setAniListId(aid ?? -1); // -1 = searched but not found
        }
      } catch {
        setAniListId(-1);
      }
    }
    resolve();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, isAnime, provider]);

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
      case 'vidsync':
        return ApiGateway.getVidSyncUrl(
          id,
          isTv ? 'tv' : 'movie',
          season,
          episode,
          {
            autoPlay: true,
            theme: accentColor,
            startTime: startProgress > 0 ? startProgress : undefined,
            nextButton: isTv ? false : undefined, // we handle next episode ourselves
            autoNext: false,
          }
        );
      case 'vidrock':
        return ApiGateway.getVidRockUrl(
          id,
          isTv ? 'tv' : 'movie',
          season,
          episode,
          {
            autoplay: true,
            theme: accentColor,
            autonext: false,        // we handle next episode ourselves
            nextbutton: false,
            episodeselector: isTv,
            download: false,
          }
        );
      case 'videasy':
        // For anime: use AniList ID if resolved, fall back to TMDB ID with TV type
        if (isAnime && aniListId && aniListId > 0) {
          return ApiGateway.getVideasyUrl(
            aniListId,
            'anime',
            undefined,
            episode,
            {
              color: accentColor,
              progress: startProgress > 0 ? startProgress : undefined,
              overlay: true,
            }
          );
        }
        return ApiGateway.getVideasyUrl(
          id,
          isTv ? 'tv' : 'movie',
          season,
          episode,
          {
            color: accentColor,
            progress: startProgress > 0 ? startProgress : undefined,
            nextEpisode: isTv ? false : undefined,
            autoplayNextEpisode: false,
            episodeSelector: isTv ? true : undefined,
            overlay: true,
          }
        );
      case 'vidfast':
        return ApiGateway.getVidFastUrl(
          id,
          isTv ? 'tv' : 'movie',
          season,
          episode,
          {
            autoPlay: true,
            theme: accentColor,
            title: true,
            poster: true,
            nextButton: isTv ? false : undefined, // we handle next episode ourselves
            autoNext: false,
            startAt: startProgress > 0 ? startProgress : undefined,
          }
        );
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
  }, [provider, id, isTv, isAnime, aniListId, season, episode, accentColor, initialProgressApplied, savedProgress]);

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
      // For VidSync: request saved progress snapshot immediately after load
      if (provider === 'vidsync') {
        const frame = iframeRef.current;
        const onLoad = () => {
          frame.contentWindow?.postMessage(
            { type: 'VIDSYNC_PLAYER_COMMAND', action: 'getMediaData' },
            '*'
          );
        };
        frame.addEventListener('load', onLoad, { once: true });
      }
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

      // --- Videasy progress events ---
      // Videasy sends: { id, type, progress, timestamp, duration, season?, episode? }
      if (
        eventData.id !== undefined &&
        eventData.type !== undefined &&
        eventData.timestamp !== undefined &&
        eventData.duration !== undefined
      ) {
        const currentTime = eventData.timestamp as number;
        const duration = eventData.duration as number;
        if (duration > 0) saveProgress(currentTime, duration);
      }

      // --- VidSync VIDSYNC_PLAYER_EVENT ---
      if (eventData.type === 'VIDSYNC_PLAYER_EVENT' && eventData.data) {
        const d = eventData.data as Record<string, unknown>;
        const currentTime = d.currentTime as number | undefined;
        const duration = d.duration as number | undefined;
        if (currentTime !== undefined && duration !== undefined) {
          saveProgress(currentTime, duration);
        }
      }

      // --- VidSync VIDSYNC_MEDIA_DATA — full normalized progress entry ---
      if (eventData.type === 'VIDSYNC_MEDIA_DATA' && eventData.data) {
        const d = eventData.data as Record<string, unknown>;
        try {
          const existing = localStorage.getItem('vidSyncProgress');
          const store: Record<string, unknown> = existing ? JSON.parse(existing) : {};
          const entryKey = isTv ? `t${id}` : `m${id}`;
          store[entryKey] = { ...((store[entryKey] as Record<string, unknown>) || {}), ...d };
          localStorage.setItem('vidSyncProgress', JSON.stringify(store));
        } catch { /* silently skip */ }
      }

      // --- VidFast / VidLink / VidRock PLAYER_EVENT (live playback updates) ---
      if (eventData.type === 'PLAYER_EVENT' && eventData.data) {
        // Validate origin for VidFast events
        const vidfastOrigins = [
          'https://vidfast.pro', 'https://vidfast.in', 'https://vidfast.io',
          'https://vidfast.me', 'https://vidfast.net', 'https://vidfast.pm', 'https://vidfast.xyz',
        ];
        const isVidfast = vidfastOrigins.includes(event.origin);
        const isVidlink = event.origin.includes('vidlink.pro');
        const isVidrock = event.origin === 'https://vidrock.ru';
        if (isVidfast || isVidlink || isVidrock || event.origin === '') {
          const playerData = eventData.data as Record<string, unknown>;
          const currentTime = playerData.currentTime as number | undefined;
          const duration = playerData.duration as number | undefined;
          if (currentTime !== undefined && duration !== undefined) {
            saveProgress(currentTime, duration);
          }
        }
      }

      // --- VidLink / VidFast / VidRock MEDIA_DATA (media metadata & continue watching info) ---
      if (eventData.type === 'MEDIA_DATA' && eventData.data) {
        const mediaData = eventData.data as Record<string, unknown>;

        // VidFast stores its own richer progress format — persist it directly
        if (typeof mediaData === 'object' && mediaData !== null) {
          try {
            const existing = localStorage.getItem('vidFastProgress');
            const store: Record<string, unknown> = existing ? JSON.parse(existing) : {};
            const entryKey = isTv ? `t${id}` : `m${id}`;
            store[entryKey] = { ...((store[entryKey] as Record<string, unknown>) || {}), ...mediaData };
            localStorage.setItem('vidFastProgress', JSON.stringify(store));
          } catch { /* quota or parse error — silently skip */ }
        }

        // VidRock stores as an array under vidRockProgress
        if (event.origin === 'https://vidrock.ru') {
          try {
            const existing = localStorage.getItem('vidRockProgress');
            const list: Record<string, unknown>[] = existing ? JSON.parse(existing) : [];
            const entryId = mediaData.id;
            const idx = list.findIndex((item) => item.id === entryId);
            if (idx >= 0) { list[idx] = { ...list[idx], ...mediaData }; }
            else { list.unshift(mediaData); }
            localStorage.setItem('vidRockProgress', JSON.stringify(list.slice(0, 50)));
          } catch { /* silently skip */ }
        }

        // Store metadata for Continue Watching list
        const continueWatchingKey = `continue-watching`;
        try {
          const existing = localStorage.getItem(continueWatchingKey);
          const list: Record<string, unknown>[] = existing ? JSON.parse(existing) : [];
          const idx = list.findIndex((item) => item.id === id && item.season === (season || 0) && item.episode === (episode || 0));
          const entry = {
            id,
            type: isTv ? 'tv' : 'movie',
            season: season || 0,
            episode: episode || 0,
            title: (mediaData.title as string) || `#${id}`,
            poster: (mediaData.poster_path as string) || (mediaData.poster as string) || '',
            updatedAt: Date.now(),
          };
          if (idx >= 0) { list[idx] = entry; } else { list.unshift(entry); }
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

  // Providers ordered by best fit for the current content type
  // ⭐ marks the recommended server for that content type
  const allProviders: { id: Provider; name: string; quality: string; badge?: string; best: ('movie' | 'tv' | 'anime')[] }[] = [
    { id: 'vyla',        name: 'Vyla',        quality: 'HLS / Real Streams', badge: '⭐', best: ['movie', 'tv'] },
    { id: 'vidfast',     name: 'VidFast',     quality: '1080p / HLS',        badge: '⭐', best: ['movie'] },
    { id: 'vidrock',     name: 'VidRock',     quality: '1080p / Multi',      best: ['tv'] },
    { id: 'videasy',     name: 'Videasy',     quality: '1080p / Multi',      badge: '⭐', best: ['anime'] },
    { id: 'vidlink',     name: 'VidLink',     quality: '1080p / HLS',        best: ['movie', 'tv', 'anime'] },
    { id: 'vidsrc',      name: 'Vidsrc',      quality: '1080p / Multi',      best: ['movie', 'tv', 'anime'] },
    { id: 'vidsrcto',    name: 'Vidsrc.to',   quality: '1080p / Multi',      best: ['movie', 'tv', 'anime'] },
    { id: 'vidking',     name: 'VidKing',     quality: '1080p / Auto',       best: ['movie', 'tv'] },
    { id: 'screenscape', name: 'ScreenScape', quality: '1080p / English',    best: ['movie', 'tv'] },
    { id: 'toustream',   name: 'TouStream',   quality: '720p / Backup',      best: ['movie', 'tv'] },
    { id: 'rivestream',  name: 'RiveStream',  quality: '1080p / Torrent',    best: ['movie', 'tv'] },
    { id: 'vidsync',     name: 'VidSync',     quality: '1080p / HLS',        best: ['movie'] },
  ];

  const contentType: 'movie' | 'tv' | 'anime' = isAnime ? 'anime' : isTv ? 'tv' : 'movie';

  // Sort: best-fit servers for current content type first, others after
  const providersList = [...allProviders].sort((a, b) => {
    const aFit = a.best.includes(contentType) ? 0 : 1;
    const bFit = b.best.includes(contentType) ? 0 : 1;
    return aFit - bFit;
  }).map(({ id, name, quality, badge, best }) => ({
    id, name, quality,
    // Only show ⭐ badge when this provider's specialty matches the current content type
    badge: badge && best[0] === contentType ? badge : undefined,
  }));

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
        <div className="max-w-full overflow-x-auto scrollbar-hide">
          <div className="flex flex-nowrap items-center gap-1 bg-slate-950/80 p-1 rounded-2xl border border-slate-800 w-max">
            {providersList.map((p) => (
              <button
                key={p.id}
                onClick={() => {
                  setProvider(p.id);
                  // Provider change triggers storageKey change → useEffect handles resume check
                }}
                className={`px-2 py-1 rounded-xl text-[10px] font-semibold transition-all duration-300 flex flex-col items-center whitespace-nowrap ${
                  provider === p.id
                    ? 'text-white shadow-md'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                }`}
                style={provider === p.id ? { backgroundColor: `#${accentColor}` } : {}}
              >
                <span>{p.badge ? `${p.badge} ${p.name}` : p.name}</span>
                <span className={`text-[7px] mt-0.5 opacity-80 ${provider === p.id ? 'text-white/80' : 'text-slate-500'}`}>
                  {p.quality}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Right Side: Download, Refresh & Fullscreen */}
        <div className="flex items-center gap-2 self-end md:self-auto">
          <button
            onClick={() => setShowDownload(true)}
            className="flex items-center gap-1.5 text-slate-400 hover:text-white px-3 py-2 bg-slate-800/80 rounded-xl transition-colors text-xs font-semibold"
            title="Download"
          >
            <Download className="w-4 h-4" />
            <span className="hidden sm:inline">Download</span>
          </button>
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

      {/* Watch Party Banner */}
      {['vyla', 'vidsync'].includes(provider) && (
        <div className="bg-blue-900/40 border-b border-blue-800/50 px-4 py-2 flex items-center justify-between z-10">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-blue-400" />
            <span className="text-sm font-semibold text-blue-100">
              Watch Party mode — Powered by {providersList.find(p => p.id === provider)?.name || provider}
            </span>
          </div>
          <button
            onClick={handleCreateParty}
            disabled={isCreatingParty}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-4 py-1.5 rounded-lg text-xs font-bold transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
          >
            <span className="hidden sm:inline">{isCreatingParty ? 'Creating...' : 'Create Watch Party'}</span>
            <Users className="w-3.5 h-3.5 sm:hidden" />
          </button>
        </div>
      )}

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

        {provider === 'vyla' ? (
          <VylaPlayer
            id={id}
            type={isTv ? 'tv' : 'movie'}
            season={season}
            episode={episode}
            accentColor={accentColor}
            startAt={initialProgressApplied ? savedProgress : 0}
            onProgress={saveProgress}
          />
        ) : (
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
        )}
      </div>

      {/* Info notice */}
      <div className="px-6 py-4 bg-slate-900 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
        <span>{provider === 'vyla' ? 'Vyla streams real HLS sources. Switch server if nothing loads.' : 'If the player shows a loading error, try switching servers above.'}</span>
        <span>Watch History is synced locally.</span>
      </div>

      {/* Download Modal */}
      {showDownload && (
        <DownloadModal
          id={id}
          title={isTv ? `Show #${id}` : `Movie #${id}`}
          type={isTv ? 'tv' : 'movie'}
          season={season}
          episode={episode}
          onClose={() => setShowDownload(false)}
        />
      )}
    </div>
  );
}
