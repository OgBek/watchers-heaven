'use client';
import { Play, Bookmark, RefreshCw, Image as ImageIcon } from 'lucide-react';
import { usePathname, useRouter } from 'next/navigation';
import { useState, useEffect, useRef } from 'react';
import { isInWatchlist, toggleWatchlistItem } from '@/lib/watchlist';

interface Movie {
  id: number;
  title?: string;
  name?: string;
  backdrop_path?: string;
  poster_path?: string;
  overview?: string;
  media_type?: string;
}

interface HeroFeatureProps {
  movies: Movie[];
}

export function HeroFeature({ movies }: HeroFeatureProps) {
  const router = useRouter();
  const pathname = usePathname() || '/';
  const segments = pathname.split('/').filter(Boolean);
  const locale = segments[0] && ['en','am','om','ti','so'].includes(segments[0]) ? segments[0] : 'en';

  const [activeIndex, setActiveIndex] = useState(0);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const currentMovie = movies[activeIndex] || movies[0];
  const isTV = currentMovie?.media_type === 'tv';

  // Auto-slide effect
  useEffect(() => {
    if (movies.length <= 1) return;

    timerRef.current = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % movies.length);
    }, 5000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [movies]);

  // Load bookmark state
  useEffect(() => {
    if (typeof window !== 'undefined' && currentMovie) {
      setIsBookmarked(isInWatchlist(currentMovie.id));
    }
  }, [currentMovie]);

  const toggleBookmark = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (typeof window === 'undefined' || !currentMovie) return;

    const isTV = currentMovie.media_type === 'tv';
    const added = toggleWatchlistItem(currentMovie.id, isTV ? 'tv' : 'movie');
    setIsBookmarked(added);
  };

  const handleWatch = () => {
    if (!currentMovie) return;
    if (isTV) {
      router.push(`/${locale}/watch/${currentMovie.id}?s=1&e=1`);
    } else {
      router.push(`/${locale}/watch/${currentMovie.id}`);
    }
  };

  const handleDetails = () => {
    if (!currentMovie) return;
    if (isTV) {
      router.push(`/${locale}/tv/${currentMovie.id}`);
    } else {
      router.push(`/${locale}/movie/${currentMovie.id}`);
    }
  };

  if (!currentMovie) return null;

  return (
    <section className="relative w-full px-2 pt-6 pb-4">
      <div className="relative w-full">

        {/* Image Card — rounded rectangle, smooth cutout applied via css tab on the card */}
        <div 
          className="relative w-full h-[70vh] min-h-[500px] max-h-[750px] overflow-hidden bg-slate-100 dark:bg-slate-950 rounded-[32px]"
        >
          
          {/* Fallback */}
          <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-900 dark:to-slate-950">
            <ImageIcon className="w-20 h-20 text-slate-300 dark:text-slate-700" />
          </div>

          {/* Carousel Backdrop Images with Crossfade */}
          {movies.map((m, idx) => (
            <img 
              key={m.id}
              src={`https://image.tmdb.org/t/p/original${m.backdrop_path}`} 
              alt={m.title || m.name || ''}
              className={`absolute inset-0 z-0 w-full h-full object-cover transition-all duration-1000 ease-in-out ${
                idx === activeIndex 
                  ? 'opacity-100 scale-100' 
                  : 'opacity-0 scale-105 pointer-events-none'
              }`}
            />
          ))}

          {/* Bottom gradient for text readability */}
          <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-black/30 to-transparent z-[1]" />

          {/* Indicator Dots */}
          <div className="absolute top-6 right-8 z-30 flex items-center gap-2 bg-black/40 backdrop-blur-md px-3.5 py-2 rounded-2xl border border-white/10">
            {movies.map((_, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setActiveIndex(idx);
                  if (timerRef.current) {
                    clearInterval(timerRef.current);
                    timerRef.current = setInterval(() => {
                      setActiveIndex((prev) => (prev + 1) % movies.length);
                    }, 5000);
                  }
                }}
                className={`h-2 rounded-full transition-all duration-500 ${
                  idx === activeIndex ? 'w-6 bg-blue-500' : 'w-2 bg-white/50 hover:bg-white'
                }`}
                title={`Slide ${idx + 1}`}
              />
            ))}
          </div>
        </div>

        {/* Floating Info Card */}
        <div className="absolute bottom-[-1px] left-1/2 -translate-x-1/2 z-40 w-full sm:w-[420px] h-[110px] flex justify-center">
          <div className="w-full h-full flex items-center gap-3 bg-[var(--color-surface-primary)] dark:bg-[var(--color-surface-secondary)] px-5 pt-8 pb-3.5 hero-tab">
            
            {/* Left Side: Vertical Category Marker */}
            <div className="flex items-center justify-center border-r border-slate-200/60 dark:border-slate-700/60 pr-3 select-none">
              <span className="text-[9px] font-black tracking-[0.25em] text-slate-400 dark:text-slate-500 [writing-mode:vertical-lr] rotate-180">
                {isTV ? 'TV SHOW' : 'MOVIE'}
              </span>
            </div>

            {/* Right Side: Title & Actions */}
            <div className="flex flex-col flex-1 min-w-0">
              <h2 className="text-sm sm:text-base font-extrabold text-slate-800 dark:text-white mb-1.5 truncate">
                {currentMovie.title || currentMovie.name || "Loading Title..."}
              </h2>
              
              <div className="flex items-center gap-1.5 w-full">
                <button 
                  onClick={handleWatch}
                  className="flex items-center justify-center gap-1 bg-[var(--color-accent-blue)] text-white px-3 py-1.5 rounded-xl text-xs font-bold shadow-sm transition hover:brightness-110"
                >
                  <Play className="w-3 h-3 fill-white" />
                  Watch
                </button>
                
                <button 
                  onClick={handleDetails}
                  className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-3 py-1.5 rounded-xl text-xs font-bold transition hover:bg-slate-200 dark:hover:bg-slate-700"
                >
                  Details
                </button>

                <button 
                  onClick={toggleBookmark}
                  className={`p-1.5 rounded-xl border transition ${
                    isBookmarked 
                      ? 'bg-blue-50 border-blue-100 text-[var(--color-accent-blue)] dark:bg-blue-950/50 dark:border-blue-900' 
                      : 'border-slate-200 dark:border-slate-700 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'
                  }`}
                  title={isBookmarked ? 'Remove from Watchlist' : 'Add to Watchlist'}
                >
                  <Bookmark className={`w-3.5 h-3.5 ${isBookmarked ? 'fill-[var(--color-accent-blue)]' : ''}`} />
                </button>

                <button 
                  onClick={() => {
                    setActiveIndex((prev) => (prev + 1) % movies.length);
                  }}
                  className="p-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition"
                  title="Next Slide"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

          </div>
        </div>

      </div>
    </section>
  );
}
