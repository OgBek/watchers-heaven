'use client';
import { motion, useScroll, useTransform } from 'framer-motion';
import { BalancedText } from '../typography/BalancedText';
import { ApiGateway } from '@/lib/api/gateway';

interface HeroFeatureProps {
  tmdbId: string;
  title: string;
  synopsis: string;
  backdropPath: string;
  genres: string[];
}

export function HeroFeature({ tmdbId, title, synopsis, backdropPath, genres }: HeroFeatureProps) {
  const { scrollY } = useScroll();
  const y = useTransform(scrollY, [0, 500], [0, 150]);
  const opacity = useTransform(scrollY, [0, 300], [1, 0]);

  return (
    <section className="relative w-full h-[85vh] min-h-[600px] flex items-end pb-24 overflow-hidden">
      {/* Background Parallax */}
      <motion.div 
        style={{ y, opacity }}
        className="absolute inset-0 z-0"
      >
        <img 
          src={`https://image.tmdb.org/t/p/original${backdropPath}`} 
          alt={title}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[var(--color-main)] via-[rgba(7,11,20,0.4)] to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-[var(--color-main)] via-[rgba(7,11,20,0.6)] to-transparent" />
      </motion.div>

      {/* Content */}
      <div className="relative z-10 w-full max-w-7xl mx-auto px-6 lg:px-12 flex justify-between items-end">
        <div className="max-w-2xl">
          <div className="flex gap-3 mb-4">
            {genres.map(g => (
              <span key={g} className="px-3 py-1 rounded-full glass text-[var(--color-text-secondary)] text-sm font-medium tracking-wide">
                {g}
              </span>
            ))}
          </div>
          
          <BalancedText 
            text={title} 
            className="text-[length:var(--text-hero)] font-bold leading-[1.1] mb-6 text-[var(--color-text-primary)] tracking-tight drop-shadow-2xl" 
          />
          
          <p className="text-[length:var(--text-body-lg)] text-[var(--color-text-secondary)] line-clamp-3 mb-8 max-w-xl leading-relaxed">
            {synopsis}
          </p>

          <div className="flex gap-4">
            <button className="px-8 py-4 rounded-[var(--radius-md)] bg-[var(--color-accent-blue)] text-white font-semibold text-lg hover:bg-blue-400 smooth-transition shadow-[var(--shadow-soft)] hover:shadow-[var(--shadow-deep)]">
              Play Trailer
            </button>
            <button className="px-8 py-4 rounded-[var(--radius-md)] glass text-white font-semibold text-lg hover:bg-[var(--color-surface-secondary)] smooth-transition">
              More Info
            </button>
          </div>
        </div>

        {/* Floating Trailer Preview */}
        <div className="hidden lg:block w-80 h-48 cutout-card bg-[var(--color-surface-primary)] border border-[var(--color-border-subtle)] shadow-[var(--shadow-deep)] p-2">
          <iframe 
            src={ApiGateway.getMovieEmbedUrl(tmdbId)}
            className="w-full h-full rounded-[var(--radius-sm)]"
            allowFullScreen
            title="Trailer Preview"
          />
        </div>
      </div>
    </section>
  );
}
