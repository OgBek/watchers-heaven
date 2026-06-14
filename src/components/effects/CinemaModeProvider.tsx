'use client';
import { createContext, useContext, useState, ReactNode } from 'react';
import { cn } from '../typography/BalancedText';

interface CinemaModeContextType {
  isCinemaMode: boolean;
  enableCinemaMode: (color?: string) => void;
  disableCinemaMode: () => void;
}

const CinemaModeContext = createContext<CinemaModeContextType | undefined>(undefined);

export function CinemaModeProvider({ children }: { children: ReactNode }) {
  const [isCinemaMode, setIsCinemaMode] = useState(false);
  const [dominantColor, setDominantColor] = useState<string | null>(null);

  const enableCinemaMode = (color?: string) => {
    if (color) setDominantColor(color);
    setIsCinemaMode(true);
  };

  const disableCinemaMode = () => {
    setIsCinemaMode(false);
    setDominantColor(null);
  };

  return (
    <CinemaModeContext.Provider value={{ isCinemaMode, enableCinemaMode, disableCinemaMode }}>
      {/* Cinema Mode Global Overlay */}
      <div 
        className={cn(
          "fixed inset-0 z-40 pointer-events-none smooth-transition",
          isCinemaMode ? "opacity-100" : "opacity-0"
        )}
      >
        <div className="absolute inset-0 bg-black/90 backdrop-blur-md" />
        
        {/* CSS Film Grain Effect */}
        <div className="absolute inset-0 opacity-[0.03] mix-blend-overlay pointer-events-none" 
             style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }} 
        />
        
        {/* Ambient Glow */}
        {dominantColor && (
          <div 
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80vw] h-[80vh] blur-[150px] rounded-full opacity-40"
            style={{ backgroundColor: dominantColor }}
          />
        )}
      </div>
      
      {/* Content wrapper to fade/blur when cinema mode is active */}
      <div className={cn(
        "smooth-transition relative z-10",
        isCinemaMode && "opacity-10 scale-[0.98] blur-[8px]"
      )}>
        {children}
      </div>
    </CinemaModeContext.Provider>
  );
}

export function useCinemaMode() {
  const context = useContext(CinemaModeContext);
  if (!context) throw new Error("useCinemaMode must be used within a CinemaModeProvider");
  return context;
}
