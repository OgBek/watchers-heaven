'use client';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Play, Bookmark, RefreshCw, Star, Loader, Image as ImageIcon } from 'lucide-react';
import { ApiGateway } from '@/lib/api/gateway';
import { useState, useEffect } from 'react';
import { PosterCard } from '@/components/cards/PosterCard';

export default function MovieDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const locale = (params.locale as string) || 'en';

  const [movie, setMovie] = useState<any>(null);
  const [credits, setCredits] = useState<any>(null);
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isBookmarked, setIsBookmarked] = useState(false);
  
  // Track hovered section: 'left' | 'right' | null for dynamic column expansion
  const [hoveredSection, setHoveredSection] = useState<'left' | 'right' | null>(null);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const [movieData, creditsData, recsData] = await Promise.all([
          ApiGateway.getMovieDetails(id),
          ApiGateway.getMovieCredits(id).catch(() => null),
          ApiGateway.getMovieRecommendations(id).catch(() => ({ results: [] }))
        ]);
        setMovie(movieData);
        setCredits(creditsData);
        setRecommendations(recsData.results || []);
      } catch (err) {
        console.error('Failed to load movie details', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [id]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('watchers-heaven-watchlist');
      if (stored) {
        try {
          const ids: string[] = JSON.parse(stored);
          setIsBookmarked(ids.includes(id));
        } catch {}
      }
    }
  }, [id]);

  const toggleBookmark = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (typeof window === 'undefined') return;

    const stored = localStorage.getItem('watchers-heaven-watchlist');
    let ids: string[] = [];
    if (stored) {
      try {
        ids = JSON.parse(stored);
      } catch {}
    }

    if (ids.includes(id)) {
      ids = ids.filter(i => i !== id);
      setIsBookmarked(false);
    } else {
      ids.push(id);
      setIsBookmarked(true);
    }
    localStorage.setItem('watchers-heaven-watchlist', JSON.stringify(ids));
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--color-main)]">
        <Loader className="w-8 h-8 animate-spin text-accent-blue" />
      </div>
    );
  }

  if (!movie) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[var(--color-main)] p-8">
        <p className="text-slate-500 mb-4 font-semibold">Movie details not found.</p>
        <button 
          onClick={() => router.back()}
          className="flex items-center gap-2 px-4 py-2 bg-accent-blue text-white rounded-xl text-sm font-semibold hover:bg-blue-600 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Go Back
        </button>
      </div>
    );
  }

  const voteAverage = movie.vote_average ? movie.vote_average.toFixed(1) : 'N/A';
  const releaseYear = movie.release_date ? movie.release_date.split('-')[0] : 'N/A';
  const runtimeHours = movie.runtime ? Math.floor(movie.runtime / 60) : 0;
  const runtimeMins = movie.runtime ? movie.runtime % 60 : 0;

  // Compute dynamic column widths based on hovered section
  let leftColWidth = 'lg:w-[32%]';
  let rightColWidth = 'lg:w-[68%]';

  if (hoveredSection === 'left') {
    leftColWidth = 'lg:w-[45%]';
    rightColWidth = 'lg:w-[55%]';
  } else if (hoveredSection === 'right') {
    leftColWidth = 'lg:w-[22%]';
    rightColWidth = 'lg:w-[78%]';
  }

  return (
    <div className="min-h-screen pb-24 bg-[var(--color-main)] text-slate-800 dark:text-slate-100 transition-colors duration-300">
      
      {/* Back navigation header */}
      <div className="max-w-7xl mx-auto px-4 md:px-8 pt-4">
        <button 
          onClick={() => router.back()}
          className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 text-slate-700 dark:text-slate-350 text-xs font-bold hover:bg-slate-50 dark:hover:bg-slate-800 transition shadow-sm"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back
        </button>
      </div>

      {/* Main Responsive Grid Layout with hover transitions */}
      <div className="max-w-7xl mx-auto pt-4 px-4 md:px-8 flex flex-col lg:flex-row gap-8 items-start">
        
        {/* LEFT COLUMN: Poster & Cast List */}
        <div 
          className={`${leftColWidth} w-full space-y-6 transition-all duration-500 ease-in-out`}
          onMouseEnter={() => setHoveredSection('left')}
          onMouseLeave={() => setHoveredSection(null)}
        >
          {/* Dynamic Movie Poster */}
          <div 
            className="group relative w-full aspect-[2/3] overflow-hidden bg-slate-100 dark:bg-slate-900 shadow-2xl border border-slate-100 dark:border-slate-800/60 transition-transform duration-500"
            style={{
              maskImage:
                "url(\"data:image/svg+xml,%3Csvg width='221' height='122' viewBox='0 0 221 122' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath fillRule='evenodd' clipRule='evenodd' d='M183 4C183 1.79086 184.791 0 187 0H217C219.209 0 221 1.79086 221 4V14V28V99C221 101.209 219.209 103 217 103H182C179.791 103 178 104.791 178 107V118C178 120.209 176.209 122 174 122H28C25.7909 122 24 120.209 24 118V103V94V46C24 43.7909 22.2091 42 20 42H4C1.79086 42 0 40.2091 0 38V18C0 15.7909 1.79086 14 4 14H24H43H179C181.209 14 183 12.2091 183 10V4Z' fill='%23D9D9D9'/%3E%3C/svg%3E%0A\")",
              WebkitMaskImage:
                "url(\"data:image/svg+xml,%3Csvg width='221' height='122' viewBox='0 0 221 122' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath fillRule='evenodd' clipRule='evenodd' d='M183 4C183 1.79086 184.791 0 187 0H217C219.209 0 221 1.79086 221 4V14V28V99C221 101.209 219.209 103 217 103H182C179.791 103 178 104.791 178 107V118C178 120.209 176.209 122 174 122H28C25.7909 122 24 120.209 24 118V103V94V46C24 43.7909 22.2091 42 20 42H4C1.79086 42 0 40.2091 0 38V18C0 15.7909 1.79086 14 4 14H24H43H179C181.209 14 183 12.2091 183 10V4Z' fill='%23D9D9D9'/%3E%3C/svg%3E%0A\")",
              maskRepeat: 'no-repeat',
              WebkitMaskRepeat: 'no-repeat',
              maskSize: '100% 100%',
              WebkitMaskSize: '100% 100%',
            }}
          >
            {movie.poster_path ? (
              <img 
                src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`} 
                alt={movie.title}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
            ) : (
              <div className="absolute inset-0 flex flex-col items-center justify-center p-6 bg-slate-100 dark:bg-slate-950">
                <ImageIcon className="w-16 h-16 text-slate-300 dark:text-slate-700 mb-2" />
                <span className="text-xs text-slate-400 text-center font-bold">{movie.title}</span>
              </div>
            )}
            
            {/* Rating Indicator */}
            <div className="absolute top-4 left-4 bg-black/60 backdrop-blur-md text-white text-xs font-extrabold px-2.5 py-1 rounded-xl flex items-center gap-1 border border-white/10 shadow-md">
              <Star className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />
              <span>{voteAverage}</span>
            </div>
          </div>

          {/* Cast Members (Positioned under the poster) */}
          <div className="space-y-3 pt-2">
            <h3 className="text-[10px] font-black tracking-[0.25em] text-slate-400 dark:text-slate-500 uppercase select-none">
              Cast & Crew
            </h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {credits?.cast?.slice(0, 8).map((actor: any) => (
                <div key={actor.id} className="flex items-center gap-3 bg-white dark:bg-slate-900/50 backdrop-blur-sm border border-slate-100 dark:border-slate-800/80 p-2.5 rounded-2xl shadow-sm hover:shadow-md transition">
                  <div className="w-9 h-9 rounded-full overflow-hidden bg-slate-100 dark:bg-slate-800 shrink-0">
                    {actor.profile_path ? (
                      <img 
                        src={`https://image.tmdb.org/t/p/w185${actor.profile_path}`} 
                        alt={actor.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-400 text-[9px] font-bold">
                        N/A
                      </div>
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-black text-slate-800 dark:text-slate-150 truncate leading-tight">{actor.name}</p>
                    <p className="text-[10px] text-slate-400 dark:text-slate-500 truncate mt-0.5">{actor.character}</p>
                  </div>
                </div>
              ))}
              {(!credits?.cast || credits.cast.length === 0) && (
                <p className="text-xs text-slate-400 col-span-2">No cast information available.</p>
              )}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Backdrop Banner, Overview & Related */}
        <div 
          className={`${rightColWidth} w-full space-y-8 transition-all duration-500 ease-in-out`}
          onMouseEnter={() => setHoveredSection('right')}
          onMouseLeave={() => setHoveredSection(null)}
        >
          {/* Main Backdrop Banner Card — hidden on mobile to avoid duplicate images */}
          <div className="hidden lg:block relative w-full h-[40vh] min-h-[300px] max-h-[500px] rounded-[2rem] overflow-hidden bg-slate-100 dark:bg-slate-900 shadow-xl border border-slate-100 dark:border-slate-800">
            {movie.backdrop_path ? (
              <img 
                src={`https://image.tmdb.org/t/p/original${movie.backdrop_path}`} 
                alt={movie.title}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-slate-200 to-slate-300 dark:from-slate-800 dark:to-slate-900 flex items-center justify-center">
                <ImageIcon className="w-20 h-20 text-slate-400 dark:text-slate-600" />
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/25 to-transparent z-[1]" />
          </div>

          {/* Title Header & Play Actions Bar */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800/80 pb-6">
            <div>
              <h1 className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white leading-tight mb-2">
                {movie.title}
              </h1>
              
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 text-xs text-slate-400 dark:text-slate-500 font-semibold uppercase tracking-wider">
                <span>{releaseYear}</span>
                <span>•</span>
                <span>{movie.runtime ? `${runtimeHours}h ${runtimeMins}m` : 'N/A'}</span>
                <span>•</span>
                <span>{movie.genres ? movie.genres.slice(0, 3).map((g: any) => g.name).join(', ') : 'N/A'}</span>
              </div>
            </div>

            {/* Quick Actions Panel */}
            <div className="flex items-center gap-2">
              <button 
                onClick={() => router.push(`/${locale}/watch/${id}`)}
                className="flex items-center gap-2 bg-accent-blue hover:bg-blue-600 text-white px-5 py-3 rounded-2xl text-xs font-bold transition shadow-md"
              >
                <Play className="w-4 h-4 fill-white text-white" />
                Watch Now
              </button>
              
              <button 
                onClick={toggleBookmark}
                className={`p-3 rounded-2xl border transition ${
                  isBookmarked 
                    ? 'bg-blue-50 border-blue-100 text-accent-blue dark:bg-blue-950 dark:border-blue-900' 
                    : 'border-slate-200 dark:border-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'
                }`}
                title="Add to watchlist"
              >
                <Bookmark className={`w-4 h-4 ${isBookmarked ? 'fill-accent-blue' : ''}`} />
              </button>

              <button 
                onClick={() => router.refresh()}
                className="p-3 rounded-2xl border border-slate-200 dark:border-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Overview & Metadata Block */}
          <div className="space-y-4 bg-white dark:bg-slate-900/30 backdrop-blur-sm p-6 rounded-[2rem] border border-slate-100 dark:border-slate-800/60 shadow-sm">
            <h3 className="text-xs font-black tracking-[0.25em] text-slate-400 dark:text-slate-500 uppercase select-none">
              Overview
            </h3>
            
            {movie.tagline && (
              <p className="text-base font-extrabold text-slate-700 dark:text-slate-350 italic">
                &ldquo;{movie.tagline}&rdquo;
              </p>
            )}
            
            <p className="text-sm leading-relaxed text-slate-650 dark:text-slate-400">
              {movie.overview || 'No description available.'}
            </p>

            {/* Extended Attributes Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-6 border-t border-slate-100 dark:border-slate-800/80 text-xs">
              <div className="space-y-2.5">
                <div className="flex justify-between border-b border-slate-50 dark:border-slate-800/40 pb-1.5">
                  <span className="text-slate-400 font-bold uppercase tracking-wider">Release Date</span>
                  <span className="text-slate-750 dark:text-slate-300 font-medium">
                    {movie.release_date ? new Date(movie.release_date).toLocaleDateString(locale, { day: 'numeric', month: 'long', year: 'numeric' }) : 'N/A'}
                  </span>
                </div>
                
                <div className="flex justify-between border-b border-slate-50 dark:border-slate-800/40 pb-1.5">
                  <span className="text-slate-400 font-bold uppercase tracking-wider">Spoken Languages</span>
                  <span className="text-slate-755 dark:text-slate-300 font-medium truncate max-w-[200px]" title={movie.spoken_languages ? movie.spoken_languages.map((l: any) => l.english_name).join(', ') : 'N/A'}>
                    {movie.spoken_languages ? movie.spoken_languages.map((l: any) => l.english_name).join(', ') : 'N/A'}
                  </span>
                </div>
              </div>

              <div className="space-y-2.5">
                <div className="flex justify-between border-b border-slate-50 dark:border-slate-800/40 pb-1.5">
                  <span className="text-slate-400 font-bold uppercase tracking-wider">Production Countries</span>
                  <span className="text-slate-755 dark:text-slate-300 font-medium truncate max-w-[200px]" title={movie.production_countries ? movie.production_countries.map((c: any) => c.name).join(', ') : 'N/A'}>
                    {movie.production_countries ? movie.production_countries.map((c: any) => c.name).join(', ') : 'N/A'}
                  </span>
                </div>

                <div className="flex justify-between border-b border-slate-50 dark:border-slate-800/40 pb-1.5">
                  <span className="text-slate-400 font-bold uppercase tracking-wider">Production Companies</span>
                  <span className="text-slate-755 dark:text-slate-300 font-medium truncate max-w-[200px]" title={movie.production_companies ? movie.production_companies.map((c: any) => c.name).join(', ') : 'N/A'}>
                    {movie.production_companies ? movie.production_companies.map((c: any) => c.name).join(', ') : 'N/A'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Related / Recommendations Slider/Grid */}
          <div className="space-y-4">
            <h3 className="text-xs font-black tracking-[0.25em] text-slate-400 dark:text-slate-500 uppercase select-none">
              Recommendations
            </h3>
            
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {recommendations.slice(0, 8).map((rec: any) => (
                <PosterCard
                  key={rec.id}
                  id={rec.id}
                  title={rec.title}
                  posterPath={rec.poster_path}
                  rating={rec.vote_average}
                  year={rec.release_date ? rec.release_date.split('-')[0] : ''}
                />
              ))}
              {recommendations.length === 0 && (
                <p className="text-xs text-slate-400 col-span-4 py-4">No recommendation matches found.</p>
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
