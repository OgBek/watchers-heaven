'use client';
import { motion } from 'framer-motion';
import { cn } from '../typography/BalancedText';
import { Star, Image as ImageIcon } from 'lucide-react';

interface PosterCardProps {
  title: string;
  posterPath: string;
  rating?: number;
  year?: string;
  className?: string;
}

export function PosterCard({ title, posterPath, rating, year, className }: PosterCardProps) {
  return (
    <motion.div 
      whileHover={{ scale: 1.02, y: -4 }}
      className={cn(
        "card-snap group relative min-w-[160px] md:min-w-[200px] lg:min-w-[240px] aspect-[2/3] rounded-[var(--radius-md)] overflow-hidden cursor-pointer",
        "shadow-[var(--shadow-soft)] hover:shadow-[var(--shadow-deep)] hover:ring-1 hover:ring-[var(--color-border-subtle)] smooth-transition bg-[var(--color-tertiary)]",
        className
      )}
    >
      {/* Fallback / Placeholder for slow/blocked networks */}
      <div className="absolute inset-0 flex items-center justify-center text-[var(--color-border-subtle)] mesh-bg opacity-50">
        <ImageIcon className="w-12 h-12 opacity-20" />
      </div>

      <img 
        src={`https://image.tmdb.org/t/p/w500${posterPath}`} 
        alt={title}
        className="relative z-10 w-full h-full object-cover smooth-transition group-hover:scale-105 opacity-0 transition-opacity duration-500"
        onLoad={(e) => { e.currentTarget.style.opacity = '1'; }}
        onError={(e) => { e.currentTarget.style.opacity = '0'; }}
        loading="lazy"
      />
      
      {/* Hover Overlay */}
      <div className="absolute inset-0 z-20 bg-gradient-to-t from-[var(--color-main)] via-black/40 to-transparent opacity-0 group-hover:opacity-100 smooth-transition flex flex-col justify-end p-5">
        <h3 className="text-[var(--color-text-primary)] font-semibold line-clamp-2 leading-tight mb-2 drop-shadow-md">{title}</h3>
        <div className="flex items-center gap-2 text-sm text-[var(--color-text-secondary)] font-medium">
          {year && <span>{year}</span>}
          {rating && (
            <span className="flex items-center gap-1">
              <Star className="w-4 h-4 text-[var(--color-warning)] fill-[var(--color-warning)]" />
              {rating.toFixed(1)}
            </span>
          )}
        </div>
      </div>
    </motion.div>
  );
}
