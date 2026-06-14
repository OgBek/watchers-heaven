'use client';
import { useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '../typography/BalancedText';

interface CarouselRowProps {
  title: string;
  children: React.ReactNode;
  className?: string;
}

export function CarouselRow({ title, children, className }: CarouselRowProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (!scrollRef.current) return;
    const { clientWidth } = scrollRef.current;
    const scrollAmount = direction === 'left' ? -(clientWidth * 0.75) : (clientWidth * 0.75);
    scrollRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
  };

  return (
    <section className={cn("w-full py-8", className)}>
      <div className="flex items-center justify-between mb-4 px-6 lg:px-12">
        <h2 className="text-[length:var(--text-h2)] font-semibold text-[var(--color-text-primary)]">{title}</h2>
        <div className="flex gap-2">
          <button 
            onClick={() => scroll('left')}
            className="w-10 h-10 rounded-full glass flex items-center justify-center text-white hover:bg-[var(--color-surface-primary)] smooth-transition"
            aria-label="Scroll left"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button 
            onClick={() => scroll('right')}
            className="w-10 h-10 rounded-full glass flex items-center justify-center text-white hover:bg-[var(--color-surface-primary)] smooth-transition"
            aria-label="Scroll right"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>
      
      {/* Carousel Container */}
      <div className="relative w-full carousel-mask">
        <div 
          ref={scrollRef}
          className="carousel flex gap-4 overflow-x-auto px-6 lg:px-12 pb-8 pt-2"
        >
          {children}
        </div>
      </div>
    </section>
  );
}
