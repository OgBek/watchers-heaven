'use client';
import { Play, Bookmark, RefreshCw, Image as ImageIcon } from 'lucide-react';
import { usePathname, useRouter } from 'next/navigation';
import { useState, useEffect, useRef } from 'react';

interface Movie {
  id: number;
  title?: string;
  name?: string;
  backdrop_path?: string;
  overview?: string;
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

  // Auto-slide effect
  useEffect(() => {
    if (movies.length <= 1) return;

    timerRef.current = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % movies.length);
    }, 5000); // 5 seconds interval

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [movies]);

  // Load bookmark state
  useEffect(() => {
    if (typeof window !== 'undefined' && currentMovie) {
      const stored = localStorage.getItem('watchers-heaven-watchlist');
      if (stored) {
        try {
          const ids: string[] = JSON.parse(stored);
          setIsBookmarked(ids.includes(currentMovie.id.toString()));
        } catch {}
      }
    }
  }, [currentMovie]);

  const toggleBookmark = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (typeof window === 'undefined' || !currentMovie) return;

    const tmdbId = currentMovie.id.toString();
    const stored = localStorage.getItem('watchers-heaven-watchlist');
    let ids: string[] = [];
    if (stored) {
      try {
        ids = JSON.parse(stored);
      } catch {}
    }

    if (ids.includes(tmdbId)) {
      ids = ids.filter(i => i !== tmdbId);
      setIsBookmarked(false);
    } else {
      ids.push(tmdbId);
      setIsBookmarked(true);
    }
    localStorage.setItem('watchers-heaven-watchlist', JSON.stringify(ids));
  };

  const handleWatch = () => {
    if (!currentMovie) return;
    router.push(`/${locale}/watch/${currentMovie.id}`);
  };

  const handleDetails = () => {
    if (!currentMovie) return;
    router.push(`/${locale}/movie/${currentMovie.id}`);
  };

  if (!currentMovie) return null;

  return (
    <section className="relative w-full px-2 pt-3 pb-8">
      {/* Large Rounded Artwork Card (Sized to 70vh for premium visual scale) */}
      <div className="relative w-full h-[70vh] min-h-[500px] max-h-[750px] rounded-[2.5rem] overflow-hidden bg-slate-100 dark:bg-slate-950 shadow-md">
        
        {/* Fallback */}
        <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-900 dark:to-slate-950">
          <ImageIcon className="w-20 h-20 text-slate-350 dark:text-slate-700" />
        </div>

        {/* Carousel Backdrop Images with Crossfade */}
        {movies.map((m, idx) => (
          <img 
            key={m.id}
            src={`https://image.tmdb.org/t/p/original${m.backdrop_path}`} 
            alt={m.title || m.name}
            className={`absolute inset-0 z-0 w-full h-full object-cover transition-all duration-1000 transform ${
              idx === activeIndex 
                ? 'opacity-100 scale-100' 
                : 'opacity-0 scale-105 pointer-events-none'
            }`}
          />
        ))}

        {/* Dynamic Indicator Dots */}
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

        {/* Absolute Centered Badge inside the Cutout with Box Shadow pseudo corners */}
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 z-20 bg-white dark:bg-slate-900 px-8 py-5 rounded-[24px] flex flex-col items-center min-w-[280px] max-w-[380px] shadow-lg border border-slate-100 dark:border-slate-800">
          
          {/* Left Inverted Corner */}
          <div className="v-cutout-tr right-full bottom-0" />
          
          {/* Right Inverted Corner */}
          <div className="v-cutout-bl left-full bottom-0" />

          {/* Badge Content */}
          <span className="text-[10px] font-extrabold tracking-[0.25em] text-slate-400 dark:text-slate-500 uppercase mb-1.5 select-none">
            TRENDING MOVIE
          </span>
          
          <h2 className="text-xl font-extrabold text-slate-850 dark:text-white mb-4 text-center line-clamp-1">
            {currentMovie.title || currentMovie.name}
          </h2>
          
          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            <button 
              onClick={handleWatch}
              className="flex items-center gap-1.5 bg-[#007bff] hover:bg-blue-600 text-white px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-sm"
            >
              <Play className="w-3.5 h-3.5 fill-white text-white" />
              Watch
            </button>
            
            <button 
              onClick={handleDetails}
              className="flex items-center bg-[#007bff] hover:bg-blue-600 text-white px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-sm"
            >
              Details
            </button>
            
            <button 
              onClick={toggleBookmark}
              className={`p-2 rounded-xl transition-all border ${
                isBookmarked 
                  ? 'bg-blue-50 border-blue-100 text-[#007bff] dark:bg-blue-950/50 dark:border-blue-900' 
                  : 'border-slate-200 dark:border-slate-800 text-slate-400 hover:text-slate-650 hover:bg-slate-50'
              }`}
              title={isBookmarked ? 'Remove from Watchlist' : 'Add to Watchlist'}
            >
              <Bookmark className={`w-3.5 h-3.5 ${isBookmarked ? 'fill-[#007bff]' : ''}`} />
            </button>
            
            <button 
              onClick={() => {
                setActiveIndex((prev) => (prev + 1) % movies.length);
              }}
              className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-400 hover:text-slate-650 hover:bg-slate-50 transition-all"
              title="Next Slide"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
