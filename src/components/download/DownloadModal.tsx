'use client';

import { useState } from 'react';
import { Download, X, Film, Tv, ChevronDown } from 'lucide-react';

export type DownloadQuality = '360p' | '480p' | '720p' | '1080p' | '4K';

interface DownloadSource {
  name: string;
  url: string;
  qualities: DownloadQuality[];
}

interface DownloadModalProps {
  id: string | number;
  title: string;
  type: 'movie' | 'tv';
  season?: number;
  episode?: number;
  onClose: () => void;
}

const QUALITIES: DownloadQuality[] = ['360p', '480p', '720p', '1080p', '4K'];

const QUALITY_LABELS: Record<DownloadQuality, { label: string; badge: string; color: string }> = {
  '360p':  { label: '360p SD',  badge: 'SD',   color: 'bg-slate-500' },
  '480p':  { label: '480p SD',  badge: 'SD+',  color: 'bg-slate-400' },
  '720p':  { label: '720p HD',  badge: 'HD',   color: 'bg-blue-500' },
  '1080p': { label: '1080p FHD',badge: 'FHD',  color: 'bg-purple-500' },
  '4K':    { label: '2160p 4K', badge: '4K',   color: 'bg-yellow-500' },
};

function buildSources(
  id: string | number,
  type: 'movie' | 'tv',
  season?: number,
  episode?: number
): DownloadSource[] {
  const idStr = String(id);
  const s = season || 1;
  const e = episode || 1;

  if (type === 'movie') {
    return [
      {
        name: 'RiveStream',
        url: `https://rivestream.ru/download?type=movie&id=${idStr}`,
        qualities: ['360p', '480p', '720p', '1080p'],
      },
      {
        name: 'VidSrc',
        url: `https://vidsrc-embed.ru/download/movie/${idStr}`,
        qualities: ['360p', '480p', '720p', '1080p'],
      },
      {
        name: 'VidFast',
        url: `https://vidfast.pro/download/movie/${idStr}`,
        qualities: ['360p', '480p', '720p', '1080p', '4K'],
      },
    ];
  }

  return [
    {
      name: 'RiveStream',
      url: `https://rivestream.ru/download?type=tv&id=${idStr}&season=${s}&episode=${e}`,
      qualities: ['360p', '480p', '720p', '1080p'],
    },
    {
      name: 'VidSrc',
      url: `https://vidsrc-embed.ru/download/tv/${idStr}/${s}/${e}`,
      qualities: ['360p', '480p', '720p', '1080p'],
    },
    {
      name: 'VidFast',
      url: `https://vidfast.pro/download/tv/${idStr}/${s}/${e}`,
      qualities: ['360p', '480p', '720p', '1080p', '4K'],
    },
  ];
}

function buildQualityUrl(baseUrl: string, quality: DownloadQuality, title: string): string {
  const upstream = new URL(baseUrl);
  upstream.searchParams.set('quality', quality.toLowerCase().replace('k', 'K'));
  // Strip any # from title for a clean filename
  const safeName = title.replace(/[^a-z0-9 ._-]/gi, '_').replace(/\s+/g, '_');
  const ext = upstream.pathname.endsWith('.mkv') ? 'mkv' : 'mp4';
  const filename = `${safeName}_${quality}.${ext}`;
  // Route through our own proxy
  return `/api/download?url=${encodeURIComponent(upstream.toString())}&filename=${encodeURIComponent(filename)}`;
}

export function DownloadModal({
  id, title, type, season, episode, onClose,
}: DownloadModalProps) {
  const [selectedQuality, setSelectedQuality] = useState<DownloadQuality>('1080p');
  const [expanded, setExpanded] = useState<string | null>(null);

  const sources = buildSources(id, type, season, episode);
  const isTv = type === 'tv' && season !== undefined;

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

        {/* Quality selector */}
        <div className="space-y-2">
          <p className="text-[10px] font-black tracking-[0.2em] text-slate-400 uppercase">Select Quality</p>
          <div className="flex flex-wrap gap-2">
            {QUALITIES.map((q) => {
              const meta = QUALITY_LABELS[q];
              const isSelected = selectedQuality === q;
              return (
                <button
                  key={q}
                  onClick={() => setSelectedQuality(q)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border transition-all duration-200 ${
                    isSelected
                      ? 'bg-accent-blue text-white border-transparent shadow-md shadow-accent-blue/20 scale-105'
                      : 'bg-slate-800/60 text-slate-400 border-slate-700 hover:border-accent-blue/40 hover:text-slate-200'
                  }`}
                >
                  <span className={`w-1.5 h-1.5 rounded-full ${meta.color}`} />
                  {meta.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Source list */}
        <div className="space-y-2">
          <p className="text-[10px] font-black tracking-[0.2em] text-slate-400 uppercase">Download Sources</p>
          <div className="space-y-2">
            {sources.map((src) => {
              const supportsQuality = src.qualities.includes(selectedQuality);
              const isOpen = expanded === src.name;

              return (
                <div
                  key={src.name}
                  className="rounded-2xl border border-slate-700/60 bg-slate-800/40 overflow-hidden"
                >
                  {/* Source header */}
                  <button
                    className="w-full flex items-center justify-between px-4 py-3 text-left"
                    onClick={() => setExpanded(isOpen ? null : src.name)}
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="text-sm font-bold text-slate-200">{src.name}</span>
                      <div className="flex gap-1">
                        {src.qualities.map((q) => (
                          <span
                            key={q}
                            className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                              q === selectedQuality
                                ? `${QUALITY_LABELS[q].color} text-white`
                                : 'bg-slate-700 text-slate-400'
                            }`}
                          >
                            {QUALITY_LABELS[q].badge}
                          </span>
                        ))}
                      </div>
                    </div>
                    <ChevronDown
                      className={`w-4 h-4 text-slate-500 transition-transform ${isOpen ? 'rotate-180' : ''}`}
                    />
                  </button>

                  {/* Expanded actions */}
                  {isOpen && (
                    <div className="px-4 pb-3 space-y-2 border-t border-slate-700/40 pt-3">
                      {supportsQuality ? (
                        <a
                          href={buildQualityUrl(src.url, selectedQuality, title)}
                          download
                          className="flex items-center justify-center gap-2 w-full py-2.5 px-4 bg-accent-blue hover:brightness-110 text-white font-bold text-xs rounded-xl transition shadow-md"
                        >
                          <Download className="w-3.5 h-3.5" />
                          Download {QUALITY_LABELS[selectedQuality].label}
                        </a>
                      ) : (
                        <p className="text-[11px] text-amber-400 font-semibold text-center py-1">
                          {selectedQuality} not available on {src.name}. Try 1080p or lower.
                        </p>
                      )}
                      {/* All qualities quick-links */}
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {src.qualities.map((q) => (
                          <a
                            key={q}
                            href={buildQualityUrl(src.url, q, title)}
                            download
                            className="text-[10px] font-bold px-2 py-1 rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-300 transition"
                          >
                            {QUALITY_LABELS[q].badge}
                          </a>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <p className="text-[10px] text-slate-500 text-center leading-relaxed">
          Downloads are served directly from Watchers Heaven.
          Quality availability depends on the source.
        </p>
      </div>
    </div>
  );
}
