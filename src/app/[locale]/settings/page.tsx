'use client';
import { useState, useEffect } from 'react';
import { Settings, Check, Sun, Moon, Palette, Type, Code, Globe, HelpCircle } from 'lucide-react';

const FONTS = [
  { id: 'bricolage', name: 'Bricolage Grotesque', value: '"Bricolage Grotesque", sans-serif' },
  { id: 'ethiopic', name: 'Noto Sans Ethiopic', value: '"Noto Sans Ethiopic", sans-serif' },
  { id: 'system', name: 'System Default', value: 'system-ui, sans-serif' }
];

const ACCENTS = [
  { name: 'Classic Blue', hex: '#007bff' },
  { name: 'Vibrant Red', hex: '#e8232a' },
  { name: 'Forest Green', hex: '#10b981' },
  { name: 'Royal Purple', hex: '#8b5cf6' },
  { name: 'Sunset Amber', hex: '#f59e0b' }
];

export default function SettingsPage() {
  const [themeMode, setThemeMode] = useState('light');
  const [accentColor, setAccentColor] = useState('#007bff');
  const [fontFamily, setFontFamily] = useState('bricolage');

  // Load settings from localStorage on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const mode = localStorage.getItem('setting-theme-mode') || 'light';
      const accent = localStorage.getItem('setting-accent-color') || '#007bff';
      const font = localStorage.getItem('setting-font-family') || 'bricolage';

      setThemeMode(mode);
      setAccentColor(accent);
      setFontFamily(font);

      applyTheme(mode);
      applyAccent(accent);
      applyFont(font);
    }
  }, []);

  const applyTheme = (mode: string) => {
    setThemeMode(mode);
    localStorage.setItem('setting-theme-mode', mode);
    if (mode === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  const applyAccent = (color: string) => {
    setAccentColor(color);
    localStorage.setItem('setting-accent-color', color);
    document.documentElement.style.setProperty('--color-accent-blue', color);
  };

  const applyFont = (fontId: string) => {
    setFontFamily(fontId);
    localStorage.setItem('setting-font-family', fontId);
    const selected = FONTS.find(f => f.id === fontId);
    if (selected) {
      document.documentElement.style.setProperty('--font-sans', selected.value);
    }
  };

  const clearAllData = () => {
    localStorage.clear();
    // Reset defaults
    applyTheme('light');
    applyAccent('#007bff');
    applyFont('bricolage');
    alert('All site cache and local preferences have been cleared.');
  };

  return (
    <div className="min-h-screen py-10 px-4 md:px-8 bg-[var(--color-main)] dark:bg-slate-950 transition-colors duration-300">
      <div className="max-w-5xl mx-auto space-y-8">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-800 dark:text-white flex items-center gap-2">
            <Settings className="w-8 h-8 text-[#007bff]" />
            Preferences Center
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Configure your personalized streaming player environment</p>
        </div>

        {/* Settings Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          
          {/* Card: Theme mode */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800/80 p-6 shadow-sm space-y-4">
            <h2 className="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2 border-b border-slate-100 dark:border-slate-800/80 pb-2">
              <Sun className="w-5 h-5 text-[#007bff]" />
              Appearance Mode
            </h2>
            <p className="text-xs text-slate-400 dark:text-slate-550">Switch between light and dark display modes</p>
            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                onClick={() => applyTheme('light')}
                className={`py-3 rounded-xl border font-semibold text-sm transition-all flex items-center justify-center gap-2 ${
                  themeMode === 'light'
                    ? 'border-blue-500 bg-blue-50/50 text-[#007bff] dark:text-blue-450'
                    : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-350 hover:bg-slate-50 dark:hover:bg-slate-850/50'
                }`}
              >
                <Sun className="w-4 h-4" />
                Light
              </button>
              <button
                onClick={() => applyTheme('dark')}
                className={`py-3 rounded-xl border font-semibold text-sm transition-all flex items-center justify-center gap-2 ${
                  themeMode === 'dark'
                    ? 'border-blue-500 bg-blue-50/50 text-[#007bff] dark:text-blue-450'
                    : 'border-slate-250 dark:border-slate-800 text-slate-600 dark:text-slate-350 hover:bg-slate-50 dark:hover:bg-slate-850/50'
                }`}
              >
                <Moon className="w-4 h-4" />
                Dark
              </button>
            </div>
          </div>

          {/* Card: Accent Color */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800/80 p-6 shadow-sm space-y-4">
            <h2 className="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2 border-b border-slate-100 dark:border-slate-800/80 pb-2">
              <Palette className="w-5 h-5 text-[#007bff]" />
              Accent Theme Color
            </h2>
            <p className="text-xs text-slate-400 dark:text-slate-555">Choose custom colors for buttons and links</p>
            <div className="flex flex-wrap gap-2 pt-2">
              {ACCENTS.map((acc) => (
                <button
                  key={acc.hex}
                  onClick={() => applyAccent(acc.hex)}
                  style={{ backgroundColor: acc.hex }}
                  className="w-10 h-10 rounded-full relative hover:scale-105 transition-transform flex items-center justify-center shadow-sm"
                  title={acc.name}
                >
                  {accentColor === acc.hex && (
                    <Check className="w-5 h-5 text-white drop-shadow" />
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Card: Font Styles */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800/80 p-6 shadow-sm space-y-4">
            <h2 className="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2 border-b border-slate-100 dark:border-slate-800/80 pb-2">
              <Type className="w-5 h-5 text-[#007bff]" />
              Typography Family
            </h2>
            <p className="text-xs text-slate-400 dark:text-slate-555">Configure global layout display fonts</p>
            <div className="flex flex-col gap-2 pt-2">
              {FONTS.map((font) => (
                <button
                  key={font.id}
                  onClick={() => applyFont(font.id)}
                  className={`w-full py-2.5 px-4 rounded-xl border text-left text-sm font-medium transition-all flex items-center justify-between ${
                    fontFamily === font.id
                      ? 'border-blue-500 bg-blue-50/50 text-[#007bff] dark:text-blue-455'
                      : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-350 hover:bg-slate-50 dark:hover:bg-slate-850/50'
                  }`}
                >
                  <span>{font.name}</span>
                  {fontFamily === font.id && <Check className="w-4 h-4" />}
                </button>
              ))}
            </div>
          </div>

          {/* Card: API Documentation */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800/80 p-6 shadow-md space-y-6 md:col-span-2 lg:col-span-3">
            <h2 className="text-lg font-black text-slate-800 dark:text-white flex items-center gap-2 border-b border-slate-100 dark:border-slate-800/80 pb-3">
              <Code className="w-5 h-5 text-[#007bff]" />
              Streaming Provider API Reference
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 -mt-2">
              7 streaming servers are integrated. All endpoints accept TMDB IDs. Some also accept IMDB IDs.
            </p>

            <div className="space-y-5 text-xs">

              {/* VidLink */}
              <div className="bg-slate-50 dark:bg-slate-950 p-4 rounded-xl border border-slate-100 dark:border-slate-850 space-y-2">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-2">
                    <span className="bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 font-bold px-2 py-0.5 rounded text-[10px]">⭐ PRIMARY</span>
                    <span className="font-mono font-bold text-slate-700 dark:text-slate-300">VidLink</span>
                  </div>
                  <span className="text-slate-400 font-mono text-[10px]">vidlink.pro</span>
                </div>
                <code className="block font-mono bg-white dark:bg-slate-900 p-2.5 rounded border border-slate-100 dark:border-slate-800/50 text-blue-600 dark:text-blue-400 break-all select-all">
                  https://vidlink.pro/movie/&#123;tmdb_id&#125;?primaryColor=007bff&autoplay=true
                </code>
                <code className="block font-mono bg-white dark:bg-slate-900 p-2.5 rounded border border-slate-100 dark:border-slate-800/50 text-blue-600 dark:text-blue-400 break-all select-all">
                  https://vidlink.pro/tv/&#123;tmdb_id&#125;/&#123;season&#125;/&#123;episode&#125;
                </code>
                <p className="text-slate-400 mt-1">Supports <strong className="text-slate-600 dark:text-slate-300">postMessage</strong> events: <code className="bg-slate-100 dark:bg-slate-900 px-1 py-0.5 rounded">MEDIA_DATA</code>, <code className="bg-slate-100 dark:bg-slate-900 px-1 py-0.5 rounded">PLAYER_EVENT</code> for Continue Watching sync.</p>
              </div>

              {/* Vidsrc (vidsrc-embed.ru) */}
              <div className="bg-slate-50 dark:bg-slate-950 p-4 rounded-xl border border-slate-100 dark:border-slate-850 space-y-2">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-2">
                    <span className="bg-green-100 dark:bg-green-950/60 text-green-700 dark:text-green-400 font-bold px-2 py-0.5 rounded text-[10px]">GET</span>
                    <span className="font-mono font-bold text-slate-700 dark:text-slate-300">Vidsrc</span>
                  </div>
                  <span className="text-slate-400 font-mono text-[10px]">vidsrc-embed.ru</span>
                </div>
                <code className="block font-mono bg-white dark:bg-slate-900 p-2.5 rounded border border-slate-100 dark:border-slate-800/50 text-blue-600 dark:text-blue-400 break-all select-all">
                  https://vidsrc-embed.ru/embed/movie/&#123;tmdb_id&#125;
                </code>
                <code className="block font-mono bg-white dark:bg-slate-900 p-2.5 rounded border border-slate-100 dark:border-slate-800/50 text-blue-600 dark:text-blue-400 break-all select-all">
                  https://vidsrc-embed.ru/embed/tv/&#123;tmdb_id&#125;/&#123;season&#125;-&#123;episode&#125;
                </code>
                <p className="text-slate-400 mt-1">Optional params: <code className="bg-slate-100 dark:bg-slate-900 px-1 py-0.5 rounded">sub_url</code>, <code className="bg-slate-100 dark:bg-slate-900 px-1 py-0.5 rounded">ds_lang</code>, <code className="bg-slate-100 dark:bg-slate-900 px-1 py-0.5 rounded">autoplay</code> (1/0).</p>
              </div>

              {/* Vidsrc.to */}
              <div className="bg-slate-50 dark:bg-slate-950 p-4 rounded-xl border border-slate-100 dark:border-slate-850 space-y-2">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-2">
                    <span className="bg-green-100 dark:bg-green-950/60 text-green-700 dark:text-green-400 font-bold px-2 py-0.5 rounded text-[10px]">GET</span>
                    <span className="font-mono font-bold text-slate-700 dark:text-slate-300">Vidsrc.to</span>
                  </div>
                  <span className="text-slate-400 font-mono text-[10px]">vidsrc.to</span>
                </div>
                <code className="block font-mono bg-white dark:bg-slate-900 p-2.5 rounded border border-slate-100 dark:border-slate-800/50 text-blue-600 dark:text-blue-400 break-all select-all">
                  https://vidsrc.to/embed/movie/&#123;tmdb_id&#125;
                </code>
                <code className="block font-mono bg-white dark:bg-slate-900 p-2.5 rounded border border-slate-100 dark:border-slate-800/50 text-blue-600 dark:text-blue-400 break-all select-all">
                  https://vidsrc.to/embed/tv/&#123;tmdb_id&#125;/&#123;season&#125;/&#123;episode&#125;
                </code>
              </div>

              {/* VidKing */}
              <div className="bg-slate-50 dark:bg-slate-950 p-4 rounded-xl border border-slate-100 dark:border-slate-850 space-y-2">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-2">
                    <span className="bg-green-100 dark:bg-green-950/60 text-green-700 dark:text-green-400 font-bold px-2 py-0.5 rounded text-[10px]">GET</span>
                    <span className="font-mono font-bold text-slate-700 dark:text-slate-300">VidKing</span>
                  </div>
                  <span className="text-slate-400 font-mono text-[10px]">vidking.net</span>
                </div>
                <code className="block font-mono bg-white dark:bg-slate-900 p-2.5 rounded border border-slate-100 dark:border-slate-800/50 text-blue-600 dark:text-blue-400 break-all select-all">
                  https://www.vidking.net/embed/movie/&#123;tmdb_id&#125;?color=007bff&autoPlay=true
                </code>
                <p className="text-slate-400 mt-1">Params: <code className="bg-slate-100 dark:bg-slate-900 px-1 py-0.5 rounded">color</code>, <code className="bg-slate-100 dark:bg-slate-900 px-1 py-0.5 rounded">autoPlay</code>, <code className="bg-slate-100 dark:bg-slate-900 px-1 py-0.5 rounded">nextEpisode</code>, <code className="bg-slate-100 dark:bg-slate-900 px-1 py-0.5 rounded">episodeSelector</code>, <code className="bg-slate-100 dark:bg-slate-900 px-1 py-0.5 rounded">progress</code>.</p>
              </div>

              {/* ScreenScape, RiveStream, TouStream - compact row */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="bg-slate-50 dark:bg-slate-950 p-3 rounded-xl border border-slate-100 dark:border-slate-850 space-y-1">
                  <span className="font-mono font-bold text-slate-700 dark:text-slate-300 text-[11px]">ScreenScape</span>
                  <code className="block font-mono text-[10px] text-blue-600 dark:text-blue-400 break-all select-all">screenscape.me/embed?tmdb=ID&type=movie</code>
                </div>
                <div className="bg-slate-50 dark:bg-slate-950 p-3 rounded-xl border border-slate-100 dark:border-slate-850 space-y-1">
                  <span className="font-mono font-bold text-slate-700 dark:text-slate-300 text-[11px]">RiveStream</span>
                  <code className="block font-mono text-[10px] text-blue-600 dark:text-blue-400 break-all select-all">rivestream.ru/embed?type=movie&id=ID</code>
                </div>
                <div className="bg-slate-50 dark:bg-slate-950 p-3 rounded-xl border border-slate-100 dark:border-slate-850 space-y-1">
                  <span className="font-mono font-bold text-slate-700 dark:text-slate-300 text-[11px]">TouStream</span>
                  <code className="block font-mono text-[10px] text-blue-600 dark:text-blue-400 break-all select-all">toustream.xyz/tou/movies/ID</code>
                </div>
              </div>

              {/* VidLink Parameters Table */}
              <details className="group">
                <summary className="cursor-pointer text-sm font-semibold text-slate-700 dark:text-slate-300 hover:text-blue-500 transition-colors flex items-center gap-1">
                  <HelpCircle className="w-3.5 h-3.5" />
                  VidLink Customization Parameters
                </summary>
                <div className="overflow-x-auto mt-3">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 font-extrabold uppercase">
                        <th className="py-2">Parameter</th>
                        <th className="py-2">Type</th>
                        <th className="py-2">Default</th>
                        <th className="py-2">Description</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-850 text-slate-600 dark:text-slate-350">
                      <tr>
                        <td className="py-2.5 font-mono font-bold text-slate-800 dark:text-slate-200">primaryColor</td>
                        <td className="py-2.5">string</td>
                        <td className="py-2.5 font-mono text-slate-400">FFFFFF</td>
                        <td className="py-2.5">Hex color (no #) for the player UI accent.</td>
                      </tr>
                      <tr>
                        <td className="py-2.5 font-mono font-bold text-slate-800 dark:text-slate-200">secondaryColor</td>
                        <td className="py-2.5">string</td>
                        <td className="py-2.5 font-mono text-slate-400">000000</td>
                        <td className="py-2.5">Hex color for secondary UI elements.</td>
                      </tr>
                      <tr>
                        <td className="py-2.5 font-mono font-bold text-slate-800 dark:text-slate-200">iconColor</td>
                        <td className="py-2.5">string</td>
                        <td className="py-2.5 font-mono text-slate-400">FFFFFF</td>
                        <td className="py-2.5">Hex color for player icons.</td>
                      </tr>
                      <tr>
                        <td className="py-2.5 font-mono font-bold text-slate-800 dark:text-slate-200">autoplay</td>
                        <td className="py-2.5">boolean</td>
                        <td className="py-2.5 font-mono text-slate-400">false</td>
                        <td className="py-2.5">Auto-start playback on load.</td>
                      </tr>
                      <tr>
                        <td className="py-2.5 font-mono font-bold text-slate-800 dark:text-slate-200">nextButton</td>
                        <td className="py-2.5">boolean</td>
                        <td className="py-2.5 font-mono text-slate-400">true</td>
                        <td className="py-2.5">Show next episode button (TV only).</td>
                      </tr>
                      <tr>
                        <td className="py-2.5 font-mono font-bold text-slate-800 dark:text-slate-200">title</td>
                        <td className="py-2.5">boolean</td>
                        <td className="py-2.5 font-mono text-slate-400">true</td>
                        <td className="py-2.5">Display the media title in the player.</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </details>
            </div>
          </div>

          {/* Card: Site Data Operations */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800/80 p-6 shadow-sm space-y-4 md:col-span-2 lg:col-span-3">
            <h2 className="text-lg font-bold text-slate-850 dark:text-white border-b border-slate-100 dark:border-slate-800/80 pb-2">
              Danger Zone
            </h2>
            <p className="text-xs text-slate-400 dark:text-slate-500">Reset configurations or wipe watch history saved in this browser</p>
            <div className="pt-2">
              <button
                onClick={clearAllData}
                className="px-6 py-3 bg-red-500 hover:bg-red-650 text-white rounded-xl text-sm font-semibold transition-colors shadow-sm"
              >
                Clear All Local Cache & Reset
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
