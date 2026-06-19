'use client';
import { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { usePathname, useRouter } from 'next/navigation';

interface CastMember {
  id: number;
  name: string;
  character: string;
  profile_path?: string;
}

interface CreditsData {
  cast?: CastMember[];
}

interface CastSectionProps {
  credits: CreditsData | null;
}

export function CastSection({ credits }: CastSectionProps) {
  const [open, setOpen] = useState(false);
  const cast = credits?.cast?.slice(0, 8) ?? [];
  const router = useRouter();
  const pathname = usePathname() || '/';
  const segments = pathname.split('/').filter(Boolean);
  const locale = segments[0] && ['en', 'am', 'om', 'ti', 'so'].includes(segments[0]) ? segments[0] : 'en';

  const content = (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
      {cast.length > 0 ? cast.map((actor) => (
        <button
          key={actor.id}
          onClick={() => router.push(`/${locale}/person/${actor.id}`)}
          className="flex items-center gap-3 bg-white dark:bg-slate-900/50 backdrop-blur-sm border border-slate-100 dark:border-slate-800/80 p-2.5 rounded-2xl shadow-sm hover:shadow-md hover:border-accent-blue/30 transition text-left w-full group"
        >
          <div className="w-9 h-9 rounded-full overflow-hidden bg-slate-100 dark:bg-slate-800 shrink-0">
            {actor.profile_path ? (
              <img
                src={`https://image.tmdb.org/t/p/w185${actor.profile_path}`}
                alt={actor.name}
                className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-slate-400 text-[9px] font-bold">
                N/A
              </div>
            )}
          </div>
          <div className="min-w-0">
            <p className="text-xs font-black text-slate-800 dark:text-slate-100 truncate leading-tight group-hover:text-accent-blue transition">{actor.name}</p>
            <p className="text-[10px] text-slate-400 dark:text-slate-500 truncate mt-0.5">{actor.character}</p>
            <p className="text-[9px] text-accent-blue/70 mt-0.5 hidden group-hover:block">View filmography →</p>
          </div>
        </button>
      )) : (
        <p className="text-xs text-slate-400 col-span-2">No cast information available.</p>
      )}
    </div>
  );

  return (
    <div className="space-y-1 pt-2">
      {/* Mobile: collapsible toggle button */}
      <button
        className="lg:hidden w-full flex items-center justify-between px-1 py-2 text-[10px] font-black tracking-[0.25em] text-slate-400 dark:text-slate-500 uppercase select-none"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
      >
        <span>Cast &amp; Crew</span>
        {open
          ? <ChevronUp className="w-3.5 h-3.5" />
          : <ChevronDown className="w-3.5 h-3.5" />
        }
      </button>

      {/* Desktop: always visible label */}
      <h3 className="hidden lg:block text-[10px] font-black tracking-[0.25em] text-slate-400 dark:text-slate-500 uppercase select-none px-1">
        Cast &amp; Crew
      </h3>

      {/* Mobile: show only when open */}
      <div className="lg:hidden">
        {open && content}
      </div>

      {/* Desktop: always show */}
      <div className="hidden lg:block">
        {content}
      </div>
    </div>
  );
}
