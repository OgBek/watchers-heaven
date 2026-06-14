'use client';
import { motion } from 'framer-motion';
import { Play, Info, Bookmark, RotateCw, Image as ImageIcon } from 'lucide-react';
import { ApiGateway } from '@/lib/api/gateway';

interface HeroFeatureProps {
  tmdbId: string;
  title: string;
  synopsis: string;
  backdropPath: string;
  genres: string[];
}

export function HeroFeature({ tmdbId, title, backdropPath }: HeroFeatureProps) {
  return (
    <section className="relative w-full px-4 lg:px-8 pt-6 pb-24">
      {/* Large Rounded Artwork Card */}
      <div className="relative w-full h-[60vh] min-h-[450px] max-h-[700px] rounded-[2rem] overflow-visible bg-white shadow-sm border border-[var(--color-border-subtle)]">
        
        {/* Fallback & Image */}
        <div className="absolute inset-0 rounded-[2rem] overflow-hidden flex items-center justify-center bg-[var(--color-main)]">
          <ImageIcon className="w-20 h-20 text-[var(--color-text-muted)] opacity-20" />
          
          <img 
            src={`https://image.tmdb.org/t/p/original${backdropPath}`} 
            alt={title}
            className="absolute inset-0 z-0 w-full h-full object-cover opacity-0 transition-opacity duration-1000"
            onLoad={(e) => { e.currentTarget.style.opacity = '1'; }}
            onError={(e) => { e.currentTarget.style.opacity = '0'; }}
          />
          {/* Subtle overlay to ensure text contrast if needed, but the original is very clean */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent" />
        </div>

        {/* Floating Bottom Pill Panel */}
        <div className="absolute -bottom-16 left-1/2 -translate-x-1/2 bg-white rounded-[2rem] shadow-[var(--shadow-deep)] border border-slate-100 flex overflow-hidden z-20 w-[90%] max-w-[450px]">
          
          {/* Vertical Label */}
          <div className="w-12 bg-white flex items-center justify-center border-r border-slate-100">
            <span className="text-[10px] font-bold text-slate-400 tracking-[0.2em] -rotate-90 whitespace-nowrap">
              MOVIE
            </span>
          </div>

          {/* Controls Area */}
          <div className="flex-1 px-6 py-4 flex flex-col items-center justify-center bg-white">
            <h2 className="text-2xl font-bold text-[var(--color-text-primary)] mb-3 line-clamp-1">{title}</h2>
            
            <div className="flex items-center gap-2">
              <button className="flex items-center gap-1.5 bg-[var(--color-accent-blue)] text-white px-4 py-1.5 rounded-lg text-sm font-semibold hover:bg-blue-600 smooth-transition shadow-sm">
                <Play className="w-4 h-4 fill-white" />
                Watch
              </button>
              
              <button className="flex items-center gap-1.5 bg-[var(--color-accent-blue)] text-white px-4 py-1.5 rounded-lg text-sm font-semibold hover:bg-blue-600 smooth-transition shadow-sm">
                Details
              </button>
              
              <button className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-lg smooth-transition">
                <Bookmark className="w-5 h-5" />
              </button>
              
              <button className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-lg smooth-transition">
                <RotateCw className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}
