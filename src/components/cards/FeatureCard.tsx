'use client';
import { motion } from 'framer-motion';
import { cn } from '../typography/BalancedText';
import { PlayCircle, Image as ImageIcon } from 'lucide-react';
import { useCinemaMode } from '../effects/CinemaModeProvider';

interface FeatureCardProps {
  title: string;
  backdropPath: string;
  category?: string;
  className?: string;
}

export function FeatureCard({ title, backdropPath, category, className }: FeatureCardProps) {
  const { enableCinemaMode } = useCinemaMode();

  return (
    <motion.div 
      whileHover={{ scale: 1.02 }}
      onClick={() => enableCinemaMode('rgba(59,130,246,0.2)')}
      className={cn(
        "card-snap group relative min-w-[280px] md:min-w-[400px] lg:min-w-[480px] aspect-video rounded-[var(--radius-lg)] overflow-hidden cursor-pointer",
        "shadow-[var(--shadow-soft)] hover:shadow-[var(--shadow-deep)] hover:ring-1 hover:ring-[var(--color-border-subtle)] smooth-transition bg-[var(--color-secondary)]",
        className
      )}
    >
      {/* Fallback */}
      <div className="absolute inset-0 flex items-center justify-center text-[var(--color-border-subtle)] mesh-bg opacity-30">
        <ImageIcon className="w-16 h-16 opacity-20" />
      </div>

      <img 
        src={`https://image.tmdb.org/t/p/w780${backdropPath}`} 
        alt={title}
        className="relative z-10 w-full h-full object-cover smooth-transition group-hover:scale-105 opacity-0 transition-opacity duration-500"
        onLoad={(e) => { e.currentTarget.style.opacity = '1'; }}
        onError={(e) => { e.currentTarget.style.opacity = '0'; }}
        loading="lazy"
      />
      
      {/* Dark Gradient Overlay */}
      <div className="absolute inset-0 z-20 bg-gradient-to-t from-[var(--color-main)] via-[rgba(7,11,20,0.4)] to-transparent opacity-90 group-hover:opacity-100 smooth-transition" />
      
      {/* Content */}
      <div className="absolute inset-0 z-30 p-6 flex flex-col justify-between">
        <div className="flex justify-between items-start">
          {category && (
            <span className="px-3 py-1 rounded-full glass text-[var(--color-text-primary)] text-xs font-bold uppercase tracking-wider backdrop-blur-md shadow-sm">
              {category}
            </span>
          )}
          <div className="w-12 h-12 rounded-full glass flex items-center justify-center text-white opacity-0 group-hover:opacity-100 smooth-transition transform scale-75 group-hover:scale-110 shadow-[var(--shadow-soft)]">
            <PlayCircle className="w-6 h-6 fill-white/20" />
          </div>
        </div>
        
        <h3 className="text-[length:var(--text-h3)] text-[var(--color-text-primary)] font-bold line-clamp-2 leading-tight drop-shadow-md transform translate-y-2 group-hover:translate-y-0 smooth-transition">
          {title}
        </h3>
      </div>
    </motion.div>
  );
}
