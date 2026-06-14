'use client';
import { 
  Home, Search, MonitorPlay, Tv, Settings, Radio, Film, Compass, Folder
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export function FloatingNav() {
  const pathname = usePathname() || '/';

  // Extract locale from pathname (e.g., /en/settings -> en)
  const segments = pathname.split('/').filter(Boolean);
  const locale = segments[0] && ['en','am','om','ti','so'].includes(segments[0]) ? segments[0] : 'en';
  // The path after locale
  const currentPath = '/' + segments.slice(1).join('/');

  const navItems = [
    { icon: Home, path: '/', label: 'Home' },
    { icon: Search, path: '/search', label: 'Search' },
    { icon: MonitorPlay, path: '/movies', label: 'Movies' },
    { icon: Tv, path: '/tv', label: 'TV Shows' },
    { icon: Radio, path: '/live', label: 'Live TV' },
    { icon: Film, path: '/k-drama', label: 'K-Drama' },
    { icon: Compass, path: '/anime', label: 'Anime' },
    { icon: Folder, path: '/collections', label: 'Collections' },
  ];

  const bottomItems = [
    { icon: Settings, path: '/settings', label: 'Settings' },
  ];

  const isItemActive = (path: string) => {
    if (path === '/') return currentPath === '/' || currentPath === '';
    return currentPath.startsWith(path);
  };

  const localePath = (path: string) => `/${locale}${path === '/' ? '' : path}`;

  return (
    <nav className="fixed bottom-3 left-3 right-3 lg:bottom-auto lg:left-4 lg:right-auto lg:top-1/2 lg:-translate-y-1/2 z-50 flex items-center justify-center">
      <div className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-md rounded-2xl lg:rounded-3xl shadow-2xl border border-slate-100 dark:border-slate-800/80 flex flex-row lg:flex-col items-center py-2 px-3 lg:py-4 lg:px-1 w-full lg:w-14 h-14 lg:h-auto lg:max-h-[85vh] gap-1.5 justify-between lg:justify-start lg:overflow-visible">
        
        {/* Main nav icons */}
        <div className="flex flex-row lg:flex-col items-center gap-1 w-full lg:w-auto px-1 overflow-x-auto lg:overflow-visible scrollbar-none flex-1 lg:flex-initial lg:max-h-[70vh] lg:overflow-y-auto">
          {navItems.map((item) => {
            const isActive = isItemActive(item.path);
            return (
              <Link 
                key={item.label} 
                href={localePath(item.path)}
                className="relative group flex justify-center flex-shrink-0"
              >
                <div className={`p-2 rounded-xl smooth-transition ${
                  isActive 
                    ? 'bg-blue-50 dark:bg-blue-950/60 text-[#007bff] dark:text-blue-400' 
                    : 'text-slate-400 dark:text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:text-slate-650 dark:hover:text-slate-350'
                }`}>
                  <item.icon className="w-[18px] h-[18px]" strokeWidth={isActive ? 2.5 : 1.8} />
                </div>
                
                {/* CSS Group Hover Tooltip */}
                <div className="absolute opacity-0 scale-95 pointer-events-none group-hover:opacity-100 group-hover:scale-100 transition-all duration-200 bottom-full left-1/2 -translate-x-1/2 mb-3 lg:bottom-auto lg:top-1/2 lg:-translate-y-1/2 lg:left-full lg:translate-x-0 lg:ml-3 px-3 py-1.5 bg-slate-850 dark:bg-slate-950 text-white text-xs font-semibold rounded-lg whitespace-nowrap z-[100] shadow-xl border border-slate-700/50 dark:border-slate-800/50">
                  {item.label}
                </div>
              </Link>
            );
          })}
        </div>
        
        {/* Divider */}
        <div className="w-px h-6 lg:w-6 lg:h-px bg-slate-100 dark:bg-slate-800/80 my-0 mx-2 lg:my-1 lg:mx-0 shrink-0" />

        {/* Bottom icons */}
        <div className="flex flex-row lg:flex-col items-center gap-1 shrink-0 px-1 lg:overflow-visible">
          {bottomItems.map((item) => {
            const isActive = isItemActive(item.path);
            return (
              <Link 
                key={item.label}
                href={localePath(item.path)}
                className="relative group flex justify-center flex-shrink-0"
              >
                <div className={`p-2 rounded-xl smooth-transition ${
                  isActive 
                    ? 'bg-blue-50 dark:bg-blue-950/60 text-[#007bff] dark:text-blue-400' 
                    : 'text-slate-400 dark:text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:text-slate-650 dark:hover:text-slate-350'
                }`}>
                  <item.icon className="w-[18px] h-[18px]" strokeWidth={isActive ? 2.5 : 1.8} />
                </div>
                
                {/* CSS Group Hover Tooltip */}
                <div className="absolute opacity-0 scale-95 pointer-events-none group-hover:opacity-100 group-hover:scale-100 transition-all duration-200 bottom-full left-1/2 -translate-x-1/2 mb-3 lg:bottom-auto lg:top-1/2 lg:-translate-y-1/2 lg:left-full lg:translate-x-0 lg:ml-3 px-3 py-1.5 bg-slate-850 dark:bg-slate-950 text-white text-xs font-semibold rounded-lg whitespace-nowrap z-[100] shadow-xl border border-slate-700/50 dark:border-slate-800/50">
                  {item.label}
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
