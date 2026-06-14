'use client';
import { useRef } from 'react';
import { ChevronLeft, ChevronRight, Link2 } from 'lucide-react';

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
    <section className={`w-full py-6 ${className || ''}`}>
      <div className="flex items-center justify-between mb-4 px-4 lg:px-8">
        <div className="flex items-center gap-2">
          <h2 className="text-xl font-bold text-[var(--color-text-primary)]">{title}</h2>
          <Link2 className="w-4 h-4 text-slate-400" />
        </div>
        <div className="flex items-center gap-1 text-sm text-slate-400 font-medium select-none">
          <button 
            onClick={() => scroll('left')}
            className="hover:text-slate-600 smooth-transition px-1"
            aria-label="Scroll left"
          >
            &lt;
          </button>
          <span>swipe</span>
          <button 
            onClick={() => scroll('right')}
            className="hover:text-slate-600 smooth-transition px-1"
            aria-label="Scroll right"
          >
            &gt;
          </button>
        </div>
      </div>
      
      {/* Carousel Container */}
      <div className="relative w-full">
        <div 
          ref={scrollRef}
          className="carousel flex gap-3 overflow-x-auto px-4 lg:px-8 pb-4 pt-1"
        >
          {children}
        </div>
      </div>
    </section>
  );
}
