'use client';
import { motion } from 'framer-motion';
import { cn } from '../typography/BalancedText';
import { PlayCircle } from 'lucide-react';

interface FeatureCardProps {
  title: string;
  backdropPath: string;
  category?: string;
  className?: string;
}

export function FeatureCard({ title, backdropPath, category, className }: FeatureCardProps) {
  return (
    <motion.div 
      whileHover={{ scale: 1.02 }}
      className={cn(
        "card-snap group relative min-w-[280px] md:min-w-[400px] aspect-video rounded-[var(--radius-lg)] overflow-hidden cursor-pointer",
        "shadow-[var(--shadow-soft)] hover:shadow-[var(--shadow-deep)] hover:ring-1 hover:ring-[var(--color-border-subtle)] smooth-transition",
        className
      )}
    >
      <img 
        src={`https://image.tmdb.org/t/p/w780${backdropPath}`} 
        alt={title}
        className="w-full h-full object-cover smooth-transition group-hover:scale-105"
        loading="lazy"
      />
      
      {/* Dark Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-[var(--color-main)] via-[rgba(7,11,20,0.2)] to-transparent" />
      
      {/* Content */}
      <div className="absolute inset-0 p-6 flex flex-col justify-between">
        <div className="flex justify-between items-start">
          {category && (
            <span className="px-3 py-1 rounded-full glass text-[var(--color-text-primary)] text-xs font-semibold uppercase tracking-wider backdrop-blur-md">
              {category}
            </span>
          )}
          <div className="w-12 h-12 rounded-full glass flex items-center justify-center text-white opacity-0 group-hover:opacity-100 smooth-transition transform scale-75 group-hover:scale-100">
            <PlayCircle className="w-6 h-6" />
          </div>
        </div>
        
        <h3 className="text-[length:var(--text-h3)] text-[var(--color-text-primary)] font-bold line-clamp-2 leading-tight drop-shadow-md transform translate-y-2 group-hover:translate-y-0 smooth-transition">
          {title}
        </h3>
      </div>
    </motion.div>
  );
}
