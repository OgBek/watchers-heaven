'use client';
import { motion } from 'framer-motion';
import { 
  Home, Search, Bot, Film, Tv, Calendar, BookOpen, Eye, 
  Theater, FolderOpen, Settings 
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export function FloatingNav() {
  const pathname = usePathname() || '/';

  const navItems = [
    { icon: Home, path: '/', label: 'Home' },
    { icon: Search, path: '/search', label: 'Search' },
    { icon: Bot, path: '/ai', label: 'AI Assistant' },
    { icon: Film, path: '/movies', label: 'Movies' },
    { icon: Tv, path: '/tv', label: 'TV Shows' },
    { icon: Calendar, path: '/calendar', label: 'Calendar' },
    { icon: BookOpen, path: '/library', label: 'Library' },
    { icon: Eye, path: '/watchlist', label: 'Watchlist' },
    { icon: Theater, path: '/theater', label: 'Theater Mode' },
    { icon: FolderOpen, path: '/collections', label: 'Collections' },
  ];

  return (
    <nav className="fixed left-0 top-0 bottom-0 w-16 lg:w-20 bg-white border-r border-[var(--color-border-subtle)] z-50 flex flex-col items-center py-6 shadow-sm">
      <div className="flex-1 flex flex-col items-center gap-3 w-full px-2">
        {navItems.map((item) => {
          // simple check if active
          const isActive = pathname === item.path || (item.path !== '/' && pathname.startsWith(item.path));
          return (
            <Link 
              key={item.label} 
              href={item.path}
              className="relative group w-full flex justify-center"
              title={item.label}
            >
              {isActive && (
                <div className="absolute -left-2 top-1/2 -translate-y-1/2 w-1 h-8 bg-[var(--color-accent-blue)] rounded-r-md" />
              )}
              <div className={`p-3 rounded-xl smooth-transition ${isActive ? 'bg-blue-50 text-[var(--color-accent-blue)]' : 'text-slate-400 hover:bg-slate-50 hover:text-slate-600'}`}>
                <item.icon className="w-5 h-5 lg:w-6 lg:h-6" strokeWidth={isActive ? 2.5 : 2} />
              </div>
            </Link>
          );
        })}
      </div>
      
      <div className="mt-auto w-full flex justify-center px-2">
        <Link 
          href="/settings"
          className={`p-3 rounded-xl smooth-transition ${pathname.includes('settings') ? 'bg-blue-50 text-[var(--color-accent-blue)]' : 'text-slate-400 hover:bg-slate-50 hover:text-slate-600'}`}
          title="Settings"
        >
          <Settings className="w-5 h-5 lg:w-6 lg:h-6" />
        </Link>
      </div>
    </nav>
  );
}
