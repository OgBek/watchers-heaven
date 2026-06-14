'use client';
import { Play, Bookmark, ExternalLink, Image as ImageIcon } from 'lucide-react';
import { usePathname, useRouter } from 'next/navigation';
import { ApiGateway } from '@/lib/api/gateway';

interface HeroFeatureProps {
  tmdbId: string;
  title: string;
  synopsis: string;
  backdropPath: string;
  genres: string[];
}

export function HeroFeature({ tmdbId, title, backdropPath }: HeroFeatureProps) {
  const router = useRouter();
  const pathname = usePathname() || '/';
  const segments = pathname.split('/').filter(Boolean);
  const locale = segments[0] && ['en','am','om','ti','so'].includes(segments[0]) ? segments[0] : 'en';

  const handleWatch = () => {
    router.push(`/${locale}/watch/${tmdbId}`);
  };

  const handleDetails = () => {
    router.push(`/${locale}/movie/${tmdbId}`);
  };

  return (
    <section className="relative w-full px-3 pt-3 pb-20">
      {/* Large Rounded Artwork Card */}
      <div className="relative w-full h-[55vh] min-h-[400px] max-h-[600px] rounded-[1.5rem] overflow-hidden bg-slate-100 shadow-sm">
        
        {/* Fallback */}
        <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-amber-100 via-amber-50 to-orange-100">
          <ImageIcon className="w-16 h-16 text-amber-200" />
        </div>

        {/* Backdrop Image */}
        <img 
          src={`https://image.tmdb.org/t/p/original${backdropPath}`} 
          alt={title}
          className="absolute inset-0 z-0 w-full h-full object-cover opacity-0 transition-opacity duration-1000"
          onLoad={(e) => { e.currentTarget.style.opacity = '1'; }}
          onError={(e) => { e.currentTarget.style.opacity = '0'; }}
        />
      </div>

      {/* Floating Bottom Pill Panel — overlaps the hero */}
      <div className="relative z-20 -mt-14 mx-auto bg-white rounded-2xl shadow-lg border border-slate-100 flex overflow-hidden w-[92%] max-w-[420px]">
        
        {/* Vertical "MOVIE" Label */}
        <div className="w-10 flex-shrink-0 flex items-center justify-center border-r border-slate-100">
          <span className="text-[9px] font-bold text-slate-400 tracking-[0.2em] uppercase -rotate-90 whitespace-nowrap select-none">
            MOVIE
          </span>
        </div>

        {/* Controls */}
        <div className="flex-1 px-5 py-4 flex flex-col items-center">
          <h2 className="text-xl font-bold text-slate-800 mb-3 line-clamp-1">{title}</h2>
          
          <div className="flex items-center gap-2">
            <button 
              onClick={handleWatch}
              className="flex items-center gap-1.5 bg-[#007bff] text-white px-4 py-1.5 rounded-lg text-sm font-semibold hover:bg-blue-600 smooth-transition shadow-sm"
            >
              <Play className="w-3.5 h-3.5 fill-white" />
              Watch
            </button>
            
            <button 
              onClick={handleDetails}
              className="flex items-center gap-1.5 bg-[#007bff] text-white px-4 py-1.5 rounded-lg text-sm font-semibold hover:bg-blue-600 smooth-transition shadow-sm"
            >
              Details
            </button>
            
            <button 
              onClick={() => alert('Bookmarked!')}
              className="p-2 text-slate-400 hover:text-blue-500 hover:bg-blue-50 rounded-lg smooth-transition"
              title="Bookmark"
            >
              <Bookmark className="w-4 h-4" />
            </button>
            
            <button 
              onClick={() => window.open(ApiGateway.getMovieEmbedUrl(tmdbId), '_blank')}
              className="p-2 text-slate-400 hover:text-blue-500 hover:bg-blue-50 rounded-lg smooth-transition"
              title="Open in new tab"
            >
              <ExternalLink className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
