'use client';
import { useState } from 'react';
import { Github, Code, HelpCircle, ChevronDown, ExternalLink } from 'lucide-react';

export function Footer() {
  const [isApiOpen, setIsApiOpen] = useState(false);

  return (
    <footer className="w-full mt-20 border-t border-slate-100 dark:border-slate-800/80 bg-white/50 dark:bg-slate-900/30 backdrop-blur-md transition-colors duration-300">
      <div className="max-w-6xl mx-auto px-6 py-8 space-y-6">
        
        {/* Footer Top Row: Branding, Github Link & API Toggle */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="text-center md:text-left">
            <h3 className="text-sm font-extrabold text-slate-800 dark:text-white tracking-wide uppercase">
              Watchers Heaven
            </h3>
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
              Your ultimate streaming interface hub. All rights reserved.
            </p>
          </div>

          <div className="flex items-center gap-4 flex-wrap justify-center">
            {/* Github Link */}
            <a 
              href="https://github.com/OgBek/watchers-heaven"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-accent-blue dark:hover:text-blue-400 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-100 dark:border-slate-800 smooth-transition"
            >
              <Github className="w-4 h-4" />
              <span>GitHub Repository</span>
              <ExternalLink className="w-3 h-3 opacity-60" />
            </a>

            {/* API Docs Trigger Button */}
            <button
              onClick={() => setIsApiOpen(!isApiOpen)}
              className="inline-flex items-center gap-1.5 px-4 py-1.5 text-xs font-bold text-white bg-accent-blue hover:bg-opacity-90 rounded-xl shadow-md shadow-accent-blue/10 smooth-transition"
            >
              <Code className="w-4 h-4" />
              <span>API Reference</span>
              <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-300 ${isApiOpen ? 'rotate-180' : ''}`} />
            </button>
          </div>
        </div>

        {/* Collapsible API Documentation Panel */}
        {isApiOpen && (
          <div className="pt-4 border-t border-slate-100 dark:border-slate-800/60 animate-fade-in space-y-4">
            <div>
              <h4 className="text-sm font-black text-slate-805 dark:text-white flex items-center gap-1.5">
                <HelpCircle className="w-4 h-4 text-accent-blue" />
                Streaming Provider Integration Endpoints
              </h4>
              <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">
                Watchers Heaven aggregates premium player servers dynamically using target database identifiers (TMDB/IMDB).
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              {/* Primary: VidLink */}
              <div className="bg-slate-50/70 dark:bg-slate-950/60 p-4 rounded-xl border border-slate-100 dark:border-slate-850 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span className="bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 font-extrabold px-1.5 py-0.5 rounded text-[9px] uppercase tracking-wider">⭐ Primary</span>
                    <span className="font-mono font-bold text-slate-700 dark:text-slate-300">VidLink</span>
                  </div>
                  <span className="text-[10px] text-slate-400 font-mono">vidlink.pro</span>
                </div>
                <code className="block font-mono bg-white dark:bg-slate-900 p-2 rounded border border-slate-100 dark:border-slate-800/50 text-accent-blue dark:text-blue-400 break-all select-all">
                  https://vidlink.pro/movie/&#123;tmdb_id&#125;?primaryColor=007bff&autoplay=true
                </code>
                <code className="block font-mono bg-white dark:bg-slate-900 p-2 rounded border border-slate-100 dark:border-slate-800/50 text-accent-blue dark:text-blue-400 break-all select-all">
                  https://vidlink.pro/tv/&#123;tmdb_id&#125;/&#123;season&#125;/&#123;episode&#125;
                </code>
                <p className="text-[10px] text-slate-405">Supports <code className="bg-white dark:bg-slate-900 px-1 py-0.5 rounded border border-slate-100 dark:border-slate-800/50">postMessage</code> playback events sync.</p>
              </div>

              {/* Vidsrc (vidsrc-embed.ru) */}
              <div className="bg-slate-50/70 dark:bg-slate-950/60 p-4 rounded-xl border border-slate-100 dark:border-slate-850 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span className="bg-green-105 dark:bg-green-950/60 text-green-700 dark:text-green-400 font-extrabold px-1.5 py-0.5 rounded text-[9px] uppercase tracking-wider">Active</span>
                    <span className="font-mono font-bold text-slate-700 dark:text-slate-300">Vidsrc</span>
                  </div>
                  <span className="text-[10px] text-slate-400 font-mono">vidsrc-embed.ru</span>
                </div>
                <code className="block font-mono bg-white dark:bg-slate-900 p-2 rounded border border-slate-100 dark:border-slate-800/50 text-accent-blue dark:text-blue-400 break-all select-all">
                  https://vidsrc-embed.ru/embed/movie/&#123;tmdb_id&#125;
                </code>
                <code className="block font-mono bg-white dark:bg-slate-900 p-2 rounded border border-slate-100 dark:border-slate-800/50 text-accent-blue dark:text-blue-400 break-all select-all">
                  https://vidsrc-embed.ru/embed/tv/&#123;tmdb_id&#125;/&#123;season&#125;-&#123;episode&#125;
                </code>
                <p className="text-[10px] text-slate-405">Query parameters: <code className="bg-white dark:bg-slate-900 px-1 py-0.5 rounded border border-slate-100 dark:border-slate-800/50">sub_url</code>, <code className="bg-white dark:bg-slate-900 px-1 py-0.5 rounded border border-slate-100 dark:border-slate-800/50">ds_lang</code>, <code className="bg-white dark:bg-slate-900 px-1 py-0.5 rounded border border-slate-100 dark:border-slate-800/50">autoplay</code>.</p>
              </div>

              {/* Vidsrc.to */}
              <div className="bg-slate-50/70 dark:bg-slate-950/60 p-4 rounded-xl border border-slate-100 dark:border-slate-850 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-mono font-bold text-slate-700 dark:text-slate-300">Vidsrc.to</span>
                  <span className="text-[10px] text-slate-400 font-mono">vidsrc.to</span>
                </div>
                <code className="block font-mono bg-white dark:bg-slate-900 p-2 rounded border border-slate-100 dark:border-slate-800/50 text-accent-blue dark:text-blue-400 break-all select-all">
                  https://vidsrc.to/embed/movie/&#123;tmdb_id&#125;
                </code>
                <code className="block font-mono bg-white dark:bg-slate-900 p-2 rounded border border-slate-100 dark:border-slate-800/50 text-accent-blue dark:text-blue-400 break-all select-all">
                  https://vidsrc.to/embed/tv/&#123;tmdb_id&#125;/&#123;season&#125;/&#123;episode&#125;
                </code>
              </div>

              {/* VidKing */}
              <div className="bg-slate-50/70 dark:bg-slate-950/60 p-4 rounded-xl border border-slate-100 dark:border-slate-850 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-mono font-bold text-slate-700 dark:text-slate-300">VidKing</span>
                  <span className="text-[10px] text-slate-400 font-mono">vidking.net</span>
                </div>
                <code className="block font-mono bg-white dark:bg-slate-900 p-2 rounded border border-slate-100 dark:border-slate-800/50 text-accent-blue dark:text-blue-400 break-all select-all">
                  https://www.vidking.net/embed/movie/&#123;tmdb_id&#125;?color=007bff&autoPlay=true
                </code>
                <p className="text-[10px] text-slate-405">Supports customization values for theme styling integration.</p>
              </div>

              {/* Compact row */}
              <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-3 gap-3 pt-2">
                <div className="bg-slate-50/50 dark:bg-slate-950/40 p-3 rounded-xl border border-slate-100 dark:border-slate-850">
                  <span className="font-mono font-bold text-slate-700 dark:text-slate-300 text-[10px] block mb-1">ScreenScape</span>
                  <code className="block font-mono text-[9px] text-accent-blue dark:text-blue-400 select-all truncate">screenscape.me/embed?tmdb=ID&type=movie</code>
                </div>
                <div className="bg-slate-50/50 dark:bg-slate-950/40 p-3 rounded-xl border border-slate-100 dark:border-slate-850">
                  <span className="font-mono font-bold text-slate-700 dark:text-slate-300 text-[10px] block mb-1">RiveStream</span>
                  <code className="block font-mono text-[9px] text-accent-blue dark:text-blue-400 select-all truncate">rivestream.ru/embed?type=movie&id=ID</code>
                </div>
                <div className="bg-slate-50/50 dark:bg-slate-950/40 p-3 rounded-xl border border-slate-100 dark:border-slate-850">
                  <span className="font-mono font-bold text-slate-700 dark:text-slate-300 text-[10px] block mb-1">TouStream</span>
                  <code className="block font-mono text-[9px] text-accent-blue dark:text-blue-400 select-all truncate">toustream.xyz/tou/movies/ID</code>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* Legal Disclaimer */}
        <div className="text-center text-[10px] text-slate-400 dark:text-slate-500 border-t border-slate-50 dark:border-slate-900 pt-4 pb-2">
          <p className="max-w-xl mx-auto leading-relaxed">
            <span className="font-bold uppercase tracking-wider text-[9px]">Disclaimer:</span>{' '}
            Watchers Heaven does not store, host, or distribute any content. We only aggregate and link to media that is already publicly available from third-party sources. All trademarks and copyrights belong to their respective owners.
          </p>
        </div>

        {/* Footer Bottom copyright */}
        <div className="text-center text-[10px] text-slate-400 dark:text-slate-600 pt-2">
          &copy; {new Date().getFullYear()} Watchers Heaven. Built with extreme passion.
        </div>
      </div>
    </footer>
  );
}
