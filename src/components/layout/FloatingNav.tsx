'use client';
import { useState } from 'react';
import { 
  Home, Search, MonitorPlay, Tv, Calendar, BookOpen, Eye, 
  Drama, FolderOpen, Settings, BarChart2, Plus
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export function FloatingNav() {
  const pathname = usePathname() || '/';
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);

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
    { icon: Calendar, path: '/schedule', label: 'Schedule' },
    { icon: BookOpen, path: '/library', label: 'Library' },
    { icon: Drama, path: '/theater', label: 'Theater' },
    { icon: Eye, path: '/watchlist', label: 'Watchlist' },
    { icon: FolderOpen, path: '/collections', label: 'Collections' },
    { icon: BarChart2, path: '/stats', label: 'Stats' },
  ];

  const bottomItems = [
    { icon: Plus, path: '/add', label: 'Add' },
    { icon: Settings, path: '/settings', label: 'Settings' },
  ];

  const isItemActive = (path: string) => {
    if (path === '/') return currentPath === '/' || currentPath === '';
    return currentPath.startsWith(path);
  };

  const localePath = (path: string) => `/${locale}${path === '/' ? '' : path}`;

  return (
    <nav className="fixed left-4 top-1/2 -translate-y-1/2 z-50 flex items-center justify-center">
      <div className="bg-white rounded-3xl shadow-lg border border-slate-100 flex flex-col items-center py-4 px-1 w-14 h-auto max-h-[85vh] gap-1.5">
        
        {/* Main nav icons */}
        <div className="flex flex-col items-center gap-1 w-full px-1 overflow-y-auto scrollbar-none">
          {navItems.map((item) => {
            const isActive = isItemActive(item.path);
            return (
              <Link 
                key={item.label} 
                href={localePath(item.path)}
                className="relative group w-full flex justify-center"
                onMouseEnter={() => setHoveredItem(item.label)}
                onMouseLeave={() => setHoveredItem(null)}
              >
                <div className={`p-2 rounded-xl smooth-transition ${
                  isActive 
                    ? 'bg-blue-50 text-[#007bff]' 
                    : 'text-slate-400 hover:bg-slate-50 hover:text-slate-500'
                }`}>
                  <item.icon className="w-[18px] h-[18px]" strokeWidth={isActive ? 2.5 : 1.8} />
                </div>
                
                {/* Hover Tooltip */}
                {hoveredItem === item.label && (
                  <div className="absolute left-full top-1/2 -translate-y-1/2 ml-3 px-3 py-1.5 bg-slate-800 text-white text-xs font-medium rounded-lg whitespace-nowrap z-[60] shadow-lg pointer-events-none">
                    {item.label}
                  </div>
                )}
              </Link>
            );
          })}
        </div>
        
        {/* Divider */}
        <div className="w-6 h-px bg-slate-100 my-1 shrink-0" />

        {/* Bottom icons */}
        <div className="flex flex-col items-center gap-1 w-full px-1 shrink-0">
          {bottomItems.map((item) => {
            const isActive = isItemActive(item.path);
            return (
              <Link 
                key={item.label}
                href={localePath(item.path)}
                className="relative group w-full flex justify-center"
                onMouseEnter={() => setHoveredItem(item.label)}
                onMouseLeave={() => setHoveredItem(null)}
              >
                <div className={`p-2 rounded-xl smooth-transition ${
                  isActive 
                    ? 'bg-blue-50 text-[#007bff]' 
                    : 'text-slate-400 hover:bg-slate-50 hover:text-slate-500'
                }`}>
                  <item.icon className="w-[18px] h-[18px]" strokeWidth={isActive ? 2.5 : 1.8} />
                </div>
                
                {hoveredItem === item.label && (
                  <div className="absolute left-full top-1/2 -translate-y-1/2 ml-3 px-3 py-1.5 bg-slate-800 text-white text-xs font-medium rounded-lg whitespace-nowrap z-[60] shadow-lg pointer-events-none">
                    {item.label}
                  </div>
                )}
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
