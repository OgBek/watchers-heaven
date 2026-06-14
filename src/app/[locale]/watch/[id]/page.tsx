'use client';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { ArrowLeft, Maximize2, Minimize2, Info, RefreshCw } from 'lucide-react';
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

  // Generate storage key
  const storageKey = `watch-progress:${id}:${season || 0}:${episode || 0}`;

  // Load accent color from settings
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('setting-accent-color');
      if (stored) {
        // Strip # if present
        setAccentColor(stored.replace('#', ''));
      }
    }
  }, []);

  // Load saved progress from localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (parsed && parsed.timestamp > 0) {
            setSavedProgress(parsed.timestamp);
            setShowResumePrompt(true);
          }
        } catch (e) {
          console.error('Error parsing saved progress', e);
        }
      }
    }
  }, [storageKey]);

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
  }, [id, isTv, season, episode, storageKey]);

  // Listen for progress events from player iframes
  useEffect(() => {
    const handlePlayerMessage = (event: MessageEvent) => {
      let eventData: any = null;

      // Try parsing JSON (some providers send stringified JSON)
      if (typeof event.data === 'string') {
        try {
          eventData = JSON.parse(event.data);
        } catch {
          // Not JSON, ignore
        }
      } else if (typeof event.data === 'object' && event.data !== null) {
        eventData = event.data;
      }

      if (!eventData) return;

      // --- VidLink PLAYER_EVENT (live playback updates) ---
      // VidLink sends: { type: 'PLAYER_EVENT', data: { event, currentTime, duration } }
      if (eventData.type === 'PLAYER_EVENT' && eventData.data) {
        const { currentTime, duration } = eventData.data;
        if (currentTime !== undefined && duration !== undefined) {
          saveProgress(currentTime, duration);
        }
      }

      // --- VidLink MEDIA_DATA (media metadata & continue watching info) ---
      // VidLink sends: { type: 'MEDIA_DATA', data: { id, title, poster, ... } }
      if (eventData.type === 'MEDIA_DATA' && eventData.data) {
        const mediaData = eventData.data;
        // Store metadata for Continue Watching list
        const continueWatchingKey = `continue-watching`;
        try {
          const existing = localStorage.getItem(continueWatchingKey);
          const list = existing ? JSON.parse(existing) : [];
          // Update or insert this item
          const idx = list.findIndex((item: any) => item.id === id && item.season === (season || 0) && item.episode === (episode || 0));
          const entry = {
            id,
            type: isTv ? 'tv' : 'movie',
            season: season || 0,
            episode: episode || 0,
            title: mediaData.title || `#${id}`,
            poster: mediaData.poster || '',
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

      // --- VidKing Player Events (legacy) ---
      if (eventData.type === 'PLAYER_EVENT' && eventData.data && !eventData.data.event) {
        // VidKing uses a slightly different format, already handled above
      }

      // --- ScreenScape Watch History Response ---
      if (eventData.type === 'SCREENSCAPE_WATCH_HISTORY_WITH_PROGRESS_RESPONSE') {
        console.log('ScreenScape History:', eventData.watchHistory);
      }
    };

    window.addEventListener('message', handlePlayerMessage);
    return () => {
      window.removeEventListener('message', handlePlayerMessage);
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

  // Generate correct URLs based on current provider
  const getEmbedUrl = () => {
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
            nextButton: true,
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
            nextEpisode: true, 
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
                if (savedProgress > 0) {
                  setShowResumePrompt(true);
                  setInitialProgressApplied(false);
                }
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

      {/* Main Video Frame & Resume Overlay */}
      <div className="flex-1 flex items-center justify-center relative bg-black">
        {showResumePrompt && (
          <div className="absolute inset-0 bg-slate-950/90 z-20 flex flex-col items-center justify-center p-6 text-center animate-fade-in">
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 max-w-sm shadow-2xl flex flex-col items-center">
              <Info className="w-12 h-12 text-blue-500 mb-4" />
              <h3 className="text-lg font-bold text-white mb-2">Resume Watching?</h3>
              <p className="text-slate-400 text-sm mb-6">
                We found saved progress from your last session: {Math.floor(savedProgress / 60)}m {savedProgress % 60}s.
              </p>
              <div className="flex gap-3 w-full">
                <button
                  onClick={handleResume}
                  className="flex-1 hover:brightness-110 text-white font-semibold py-2.5 px-4 rounded-xl text-sm transition-all"
                  style={{ backgroundColor: `#${accentColor}` }}
                >
                  Yes, Resume
                </button>
                <button
                  onClick={handleSkipResume}
                  className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold py-2.5 px-4 rounded-xl text-sm transition-colors"
                >
                  Start Over
                </button>
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
