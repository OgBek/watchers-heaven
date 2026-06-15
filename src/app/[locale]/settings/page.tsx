'use client';
import { useState, useEffect } from 'react';
import { Settings, Check, Sun, Moon, Palette, Type, Globe } from 'lucide-react';
import { usePathname, useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';

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

const LANGUAGES = [
  { code: 'en', name: 'English' },
  { code: 'am', name: 'አማርኛ (Amharic)' },
  { code: 'om', name: 'Afaan Oromoo (Oromo)' },
  { code: 'ti', name: 'ትግርኛ (Tigrinya)' },
  { code: 'so', name: 'Af-Soomaali (Somali)' }
];

export default function SettingsPage() {
  const router = useRouter();
  const pathname = usePathname() || '';
  const currentLocale = pathname.split('/')[1] || 'en';
  const t = useTranslations('Settings');

  const [themeMode, setThemeMode] = useState('light');
  const [accentColor, setAccentColor] = useState('#007bff');
  const [fontFamily, setFontFamily] = useState('bricolage');

  const changeLanguage = (newLocale: string) => {
    const segments = pathname.split('/');
    segments[1] = newLocale;
    const newPath = segments.join('/');
    router.push(newPath);
  };

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
    alert(t('clearAll'));
  };

  return (
    <div className="min-h-screen py-10 px-4 md:px-8 bg-[var(--color-main)] dark:bg-slate-950 transition-colors duration-300">
      <div className="max-w-5xl mx-auto space-y-8">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-800 dark:text-white flex items-center gap-2">
            <Settings className="w-8 h-8 text-accent-blue" />
            {t('title')}
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">{t('subtitle')}</p>
        </div>

        {/* Settings Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          
          {/* Card: Theme mode */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800/80 p-6 shadow-sm space-y-4">
            <h2 className="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2 border-b border-slate-100 dark:border-slate-800/80 pb-2">
              <Sun className="w-5 h-5 text-accent-blue" />
              {t('appearance')}
            </h2>
            <p className="text-xs text-slate-400 dark:text-slate-550">{t('appearanceDesc')}</p>
            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                onClick={() => applyTheme('light')}
                className={`py-3 rounded-xl border font-semibold text-sm transition-all flex items-center justify-center gap-2 ${
                  themeMode === 'light'
                    ? 'border-blue-500 bg-blue-50/50 text-accent-blue dark:text-blue-450'
                    : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-350 hover:bg-slate-50 dark:hover:bg-slate-850/50'
                }`}
              >
                <Sun className="w-4 h-4" />
                {t('light')}
              </button>
              <button
                onClick={() => applyTheme('dark')}
                className={`py-3 rounded-xl border font-semibold text-sm transition-all flex items-center justify-center gap-2 ${
                  themeMode === 'dark'
                    ? 'border-blue-500 bg-blue-50/50 text-accent-blue dark:text-blue-450'
                    : 'border-slate-250 dark:border-slate-800 text-slate-600 dark:text-slate-350 hover:bg-slate-50 dark:hover:bg-slate-850/50'
                }`}
              >
                <Moon className="w-4 h-4" />
                {t('dark')}
              </button>
            </div>
          </div>

          {/* Card: Accent Color */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800/80 p-6 shadow-sm space-y-4">
            <h2 className="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2 border-b border-slate-100 dark:border-slate-800/80 pb-2">
              <Palette className="w-5 h-5 text-accent-blue" />
              {t('accent')}
            </h2>
            <p className="text-xs text-slate-400 dark:text-slate-555">{t('accentDesc')}</p>
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
              <Type className="w-5 h-5 text-accent-blue" />
              {t('typography')}
            </h2>
            <p className="text-xs text-slate-400 dark:text-slate-555">{t('typographyDesc')}</p>
            <div className="flex flex-col gap-2 pt-2">
              {FONTS.map((font) => (
                <button
                  key={font.id}
                  onClick={() => applyFont(font.id)}
                  className={`w-full py-2.5 px-4 rounded-xl border text-left text-sm font-medium transition-all flex items-center justify-between ${
                    fontFamily === font.id
                      ? 'border-blue-500 bg-blue-50/50 text-accent-blue dark:text-blue-455'
                      : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-350 hover:bg-slate-50 dark:hover:bg-slate-850/50'
                  }`}
                >
                  <span>{font.name}</span>
                  {fontFamily === font.id && <Check className="w-4 h-4" />}
                </button>
              ))}
            </div>
          </div>

          {/* Card: Preferred Language */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800/80 p-6 shadow-sm space-y-4">
            <h2 className="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2 border-b border-slate-100 dark:border-slate-800/80 pb-2">
              <Globe className="w-5 h-5 text-accent-blue" />
              {t('language')}
            </h2>
            <p className="text-xs text-slate-400 dark:text-slate-555">{t('languageDesc')}</p>
            <div className="flex flex-col gap-2 pt-2">
              {LANGUAGES.map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => changeLanguage(lang.code)}
                  className={`w-full py-2.5 px-4 rounded-xl border text-left text-sm font-medium transition-all flex items-center justify-between ${
                    currentLocale === lang.code
                      ? 'border-blue-500 bg-blue-50/50 text-accent-blue dark:text-blue-455'
                      : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-350 hover:bg-slate-50 dark:hover:bg-slate-850/50'
                  }`}
                >
                  <span>{lang.name}</span>
                  {currentLocale === lang.code && <Check className="w-4 h-4" />}
                </button>
              ))}
            </div>
          </div>

          {/* Card: Site Data Operations */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800/80 p-6 shadow-sm space-y-4 md:col-span-2 lg:col-span-3">
            <h2 className="text-lg font-bold text-slate-850 dark:text-white border-b border-slate-100 dark:border-slate-800/80 pb-2">
              {t('dangerZone')}
            </h2>
            <p className="text-xs text-slate-400 dark:text-slate-500">{t('dangerDesc')}</p>
            <div className="pt-2">
              <button
                onClick={clearAllData}
                className="px-6 py-3 bg-red-500 hover:bg-red-650 text-white rounded-xl text-sm font-semibold transition-colors shadow-sm"
              >
                {t('clearAll')}
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
