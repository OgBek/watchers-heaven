'use client';
import { Home, Compass, PlayCircle, Heart, User } from 'lucide-react';
import Link from 'next/link';

export function FloatingNav() {
  const navItems = [
    { icon: Home, label: 'Home', href: '/' },
    { icon: Compass, label: 'Discover', href: '/discover' },
    { icon: PlayCircle, label: 'Live', href: '/live' },
    { icon: Heart, label: 'Watchlist', href: '/watchlist' },
    { icon: User, label: 'Profile', href: '/profile' },
  ];

  return (
    <nav className="fixed left-6 top-1/2 -translate-y-1/2 z-50 glass rounded-full py-6 px-3 flex flex-col gap-8 shadow-[var(--shadow-deep)] hover:w-48 group overflow-hidden smooth-transition">
      {navItems.map((item) => (
        <Link 
          key={item.label} 
          href={item.href}
          className="flex items-center gap-4 text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:scale-110 smooth-transition w-10 overflow-hidden group-hover:w-full"
        >
          <item.icon className="w-6 h-6 shrink-0" />
          <span className="font-medium tracking-wide opacity-0 group-hover:opacity-100 smooth-transition whitespace-nowrap">
            {item.label}
          </span>
        </Link>
      ))}
    </nav>
  );
}
