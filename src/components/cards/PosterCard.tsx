'use client';
import { motion } from 'framer-motion';
import { cn } from '../typography/BalancedText';
import { Star } from 'lucide-react';

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
        "shadow-[var(--shadow-soft)] hover:shadow-[var(--shadow-deep)] hover:ring-1 hover:ring-[var(--color-border-subtle)] smooth-transition",
        className
      )}
    >
      <img 
        src={`https://image.tmdb.org/t/p/w500${posterPath}`} 
        alt={title}
        className="w-full h-full object-cover smooth-transition group-hover:scale-105"
        loading="lazy"
      />
      
      {/* Hover Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-[var(--color-main)] via-transparent to-transparent opacity-0 group-hover:opacity-100 smooth-transition flex flex-col justify-end p-4">
        <h3 className="text-[var(--color-text-primary)] font-semibold line-clamp-2 leading-tight mb-1">{title}</h3>
        <div className="flex items-center gap-2 text-xs text-[var(--color-text-secondary)]">
          {year && <span>{year}</span>}
          {rating && (
            <span className="flex items-center gap-1">
              <Star className="w-3 h-3 text-[var(--color-warning)] fill-[var(--color-warning)]" />
              {rating.toFixed(1)}
            </span>
          )}
        </div>
      </div>
    </motion.div>
  );
}
