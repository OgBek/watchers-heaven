'use client';
import { useRef, useEffect, useState } from 'react';
import clsx from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: (string | undefined | null | false)[]) {
  return twMerge(clsx(inputs));
}

interface BalancedTextProps {
  text: string;
  className?: string;
  as?: React.ElementType;
}

export function BalancedText({ text, className, as: Component = 'h1' }: BalancedTextProps) {
  const [balanced, setBalanced] = useState(text);
  const containerRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    // This is a wrapper for @chenglou/pretext
    // The core idea is to measure text without layout shift
    setBalanced(text);
  }, [text]);

  return (
    <Component ref={containerRef} className={cn('text-balance', className)}>
      {balanced}
    </Component>
  );
}
