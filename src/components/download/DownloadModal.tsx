'use client';

import { useState, useEffect } from 'react';
import { Download, X, Film, Tv, Loader, AlertCircle } from 'lucide-react';
import { VylaClient } from '../../lib/api/vyla-client';

export type DownloadQuality = '360p' | '480p' | '720p' | '1080p' | '4K';

interface VylaDownload {
  url: string;
  quality: string;
  size: string | null;
  type: string;    // 'mkv', 'mp4', etc.
  active?: boolean;
}

interface DownloadModalProps {
  id: string | number;
  title: string;
  type: 'movie' | 'tv';
  season?: number;
  episode?: number;
  onClose: () => void;
}

const QUALITY_COLORS: Record<string, string> = {
  '360p': 'bg-slate-500',
  '480p': 'bg-slate-400',
  '720p': 'bg-blue-500',
  '1080p': 'bg-purple-500',
  '4K': 'bg-yellow-500',
  '2160p': 'bg-yellow-500',
  'Unknown': 'bg-slate-600',
};

function qualityColor(q: string): string {
  // normalize "2160p" → "4K"
  const norm = q.replace('2160p', '4K');
  return QUALITY_COLORS[norm] || QUALITY_COLORS['Unknown'];
}



export function DownloadModal({
  id, title, type, season, episode, onClose,
}: DownloadModalProps) {
  const [links, setLinks] = useState<VylaDownload[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const isTv = type === 'tv' && season !== undefined;

  useEffect(() => {
    const controller = new AbortController();
    const { signal } = controller;

    async function fetchLinks() {
      setLoading(true);
      setError(null);
      try {
        const active = await VylaClient.getDownloads(type, id, season, episode, signal);
        setLinks(active);
      } catch (err: unknown) {
        const e = err as Error;
        if (e.name === 'AbortError') return;
        setError(e instanceof Error ? e.message : 'Failed to fetch download links');
      } finally {
        if (!signal.aborted) setLoading(false);
      }
    }
    fetchLinks();

    const onOnline = () => controller.abort();
    const onPageShow = (e: PageTransitionEvent) => {
        if (e.persisted) controller.abort();
    };

    window.addEventListener('online', onOnline);
    window.addEventListener('pageshow', onPageShow);

    return () => {
        controller.abort();
        window.removeEventListener('online', onOnline);
        window.removeEventListener('pageshow', onPageShow);
    };
  }, [id, type, season, episode]);

  return (
    <div
      className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-md bg-slate-900/95 backdrop-blur-xl border border-slate-700/50 rounded-3xl shadow-2xl shadow-black/60 p-6 space-y-5"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-accent-blue/10 border border-accent-blue/20">
              <Download className="w-5 h-5 text-accent-blue" />
            </div>
            <div>
              <h2 className="text-sm font-black text-white leading-tight">Download</h2>
              <p className="text-[11px] text-slate-400 mt-0.5 max-w-[220px] truncate">{title}</p>
              {isTv && (
                <p className="text-[10px] text-accent-blue font-semibold mt-0.5">
                  Season {season} · Episode {episode}
                </p>
              )}
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-slate-500 hover:text-white hover:bg-slate-800 transition shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content type badge */}
        <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
          {type === 'movie'
            ? <><Film className="w-3 h-3" /> Movie</>
            : <><Tv className="w-3 h-3" /> TV Show</>
          }
        </div>

        {/* Body */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-10 gap-3">
            <Loader className="w-7 h-7 animate-spin text-accent-blue" />
            <p className="text-slate-400 text-xs">Finding download links…</p>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-8 gap-3">
            <AlertCircle className="w-7 h-7 text-red-400" />
            <p className="text-slate-300 text-xs text-center">{error}</p>
            <p className="text-slate-500 text-[10px] text-center">
              Download links are provided by Vyla API and depend on availability.
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            <p className="text-[10px] font-black tracking-[0.2em] text-slate-400 uppercase">
              {links.length} download{links.length > 1 ? 's' : ''} available
            </p>
            <div className="space-y-2 max-h-72 overflow-y-auto pr-1" style={{ scrollbarWidth: 'thin' }}>
              {links.map((dl, i) => (
                <a
                  key={i}
                  href={dl.url}
                  download
                  className="flex items-center justify-between gap-3 w-full px-4 py-3 bg-slate-800/50 hover:bg-slate-800 border border-slate-700/60 hover:border-accent-blue/40 rounded-2xl transition group"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className={`text-[9px] font-black px-2 py-1 rounded-lg text-white shrink-0 ${qualityColor(dl.quality)}`}>
                      {dl.quality === '2160p' ? '4K' : dl.quality}
                    </span>
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-slate-200 truncate">
                        {dl.type?.toUpperCase()} · {dl.quality === '2160p' ? '4K' : dl.quality}
                      </p>
                      {dl.size && (
                        <p className="text-[10px] text-slate-500">{dl.size}</p>
                      )}
                    </div>
                  </div>
                  <Download className="w-4 h-4 text-slate-500 group-hover:text-accent-blue transition shrink-0" />
                </a>
              ))}
            </div>
          </div>
        )}

        <p className="text-[10px] text-slate-500 text-center leading-relaxed">
          Links are verified by Vyla API. File availability may vary.
        </p>
      </div>
    </div>
  );
}
