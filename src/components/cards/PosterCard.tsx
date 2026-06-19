'use client';
import { Star, Image as ImageIcon } from 'lucide-react';
import { usePathname, useRouter } from 'next/navigation';

interface PosterCardProps {
  id: number;
  title: string;
  posterPath: string;
  rating?: number;
  year?: string;
  className?: string;
  type?: 'movie' | 'tv' | 'anime';
}

// Quality badge removed — TMDB does not provide actual stream quality data

export function PosterCard({ id, title, posterPath, rating, year, className, type = 'movie' }: PosterCardProps) {
  const router = useRouter();
  const pathname = usePathname() || '/';
  const segments = pathname.split('/').filter(Boolean);
  const locale = segments[0] && ['en','am','om','ti','so'].includes(segments[0]) ? segments[0] : 'en';

  const handleClick = () => {
    if (type === 'anime') {
      // Anime uses TMDB TV IDs but routes to watch with type=anime so the
      // watch page can pick the best server (Videasy first)
      router.push(`/${locale}/tv/${id}`);
    } else {
      router.push(`/${locale}/${type}/${id}`);
    }
  };

  return (
    <div 
      onClick={handleClick}
      className={`card-snap group relative min-w-[130px] md:min-w-[155px] lg:min-w-[170px] aspect-[2/3] rounded-xl overflow-hidden cursor-pointer shadow-sm hover:shadow-md smooth-transition bg-slate-100 dark:bg-slate-800 border border-slate-100 dark:border-slate-700/50 hover:-translate-y-1 ${className || ''}`}
    >
      {/* Persistent Top Badges */}
      <div className="absolute top-2 left-2 z-30 flex flex-col gap-1 pointer-events-none">
        {rating !== undefined && rating > 0 && (
          <div className="flex items-center gap-0.5 bg-black/60 backdrop-blur-md text-white text-[10px] font-extrabold px-1.5 py-0.5 rounded-md border border-white/10 shadow-sm">
            <Star className="w-2.5 h-2.5 text-yellow-400 fill-yellow-400" />
            <span>{rating.toFixed(1)}</span>
          </div>
        )}
      </div>

      {/* Fallback */}
      <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-900 p-3">
        <ImageIcon className="w-8 h-8 text-slate-200 dark:text-slate-600 mb-2" />
        <span className="text-[10px] text-slate-300 dark:text-slate-400 text-center line-clamp-2">{title}</span>
      </div>

      <img 
        src={`https://image.tmdb.org/t/p/w342${posterPath}`} 
        alt={title}
        className="relative z-10 w-full h-full object-cover opacity-0 transition-opacity duration-500"
        onLoad={(e) => { e.currentTarget.style.opacity = '1'; }}
        onError={(e) => { e.currentTarget.style.opacity = '0'; }}
        loading="lazy"
      />
      
      {/* Hover Overlay */}
      <div className="absolute inset-0 z-20 bg-gradient-to-t from-black/75 via-black/25 to-transparent opacity-0 group-hover:opacity-100 smooth-transition flex flex-col justify-end p-3">
        <h3 className="text-white text-sm font-semibold line-clamp-2 leading-tight mb-1 drop-shadow-sm">{title}</h3>
        <div className="flex items-center gap-2 text-xs text-white/80 font-medium">
          {year && <span>{year}</span>}
          {rating !== undefined && (
            <span className="flex items-center gap-0.5">
              <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
              {rating.toFixed(1)}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
