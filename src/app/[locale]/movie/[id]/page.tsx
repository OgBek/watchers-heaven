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
  const [activeTab, setActiveTab] = useState<'overview' | 'casts' | 'reviews' | 'related'>('overview');
  const [isBookmarked, setIsBookmarked] = useState(false);

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
        <Loader className="w-8 h-8 animate-spin text-[#007bff]" />
      </div>
    );
  }

  if (!movie) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[var(--color-main)] p-8">
        <p className="text-slate-500 mb-4 font-semibold">Movie details not found.</p>
        <button 
          onClick={() => router.back()}
          className="flex items-center gap-2 px-4 py-2 bg-[#007bff] text-white rounded-xl text-sm font-semibold hover:bg-blue-600 transition-colors"
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

  return (
    <div className="min-h-screen pb-20 bg-[var(--color-main)] text-slate-800 dark:text-slate-100 transition-colors duration-300">
      
      {/* Container - Expanded to max-w-7xl for a bigger view scale */}
      <div className="max-w-7xl mx-auto pt-6 px-4 md:px-8 flex flex-col lg:flex-row gap-8">
        
        {/* LEFT COLUMN: Large Backdrop Card & Actions */}
        <div className="lg:w-[65%] space-y-6">
          <div className="relative w-full h-[60vh] min-h-[400px] max-h-[650px] rounded-[2.5rem] overflow-hidden bg-slate-100 dark:bg-slate-900 shadow-md">
            
            {/* Fallback backdrop */}
            <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-slate-200 to-slate-300 dark:from-slate-800 dark:to-slate-900">
              <ImageIcon className="w-20 h-20 text-slate-400 dark:text-slate-600" />
            </div>

            {/* Backdrop Image */}
            {movie.backdrop_path && (
              <img 
                src={`https://image.tmdb.org/t/p/original${movie.backdrop_path}`} 
                alt={movie.title}
                className="absolute inset-0 z-0 w-full h-full object-cover opacity-0 transition-opacity duration-1000"
                onLoad={(e) => { e.currentTarget.style.opacity = '1'; }}
                onError={(e) => { e.currentTarget.style.opacity = '0'; }}
              />
            )}

            {/* Back Button */}
            <button 
              onClick={() => router.back()}
              className="absolute top-6 left-6 z-30 flex items-center gap-2 px-3 py-2 rounded-xl bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm text-slate-700 dark:text-slate-200 text-xs font-bold hover:bg-white dark:hover:bg-slate-800 transition-all shadow-sm"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </button>

            {/* Poster Card Absolute Overlapping (Left cutout bottom-left area) */}
            <div className="absolute left-6 bottom-0 z-20 w-[120px] md:w-[135px] aspect-[2/3] rounded-2xl overflow-hidden bg-slate-200 dark:bg-slate-950 shadow-xl border-2 border-white dark:border-slate-800 translate-y-2">
              <img 
                src={`https://image.tmdb.org/t/p/w342${movie.poster_path}`} 
                alt={movie.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute top-2 right-2 bg-white/90 dark:bg-slate-900/90 text-slate-800 dark:text-slate-100 text-[10px] font-bold px-1.5 py-0.5 rounded-lg flex items-center gap-0.5 shadow-sm border border-slate-100 dark:border-slate-800">
                <Star className="w-2.5 h-2.5 fill-yellow-400 text-yellow-400" />
                {voteAverage}
              </div>
            </div>

            {/* Action Card Next to Poster utilizing the box shadow Inverted Corner Cutouts */}
            <div className="absolute left-[154px] md:left-[175px] bottom-0 z-20 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 border-b-0 rounded-t-[24px] py-4 px-5 flex items-center gap-4 w-[50%] min-w-[240px] max-w-[320px] shadow-lg">
              
              {/* Left Inverted Corner */}
              <div className="v-cutout-tr right-full bottom-0" />
              
              {/* Right Inverted Corner */}
              <div className="v-cutout-bl left-full bottom-0" />

              {/* MOVIE tag vertical strip */}
              <div className="w-8 flex-shrink-0 flex items-center justify-center border-r border-slate-100 dark:border-slate-800 h-8">
                <span className="text-[8px] font-extrabold text-slate-400 dark:text-slate-500 tracking-[0.2em] uppercase -rotate-90 whitespace-nowrap select-none">
                  MOVIE
                </span>
              </div>

              <div className="flex-1 min-w-0">
                <h2 className="text-sm font-extrabold text-slate-850 dark:text-white truncate mb-2">{movie.title}</h2>
                <div className="flex items-center gap-1.5">
                  <button 
                    onClick={() => router.push(`/${locale}/watch/${id}`)}
                    className="flex items-center gap-1 bg-[#007bff] hover:bg-blue-600 text-white px-3 py-1.5 rounded-xl text-[10px] font-bold transition-all shadow-sm"
                  >
                    <Play className="w-3 h-3 fill-white text-white" />
                    Watch
                  </button>
                  <button 
                    onClick={toggleBookmark}
                    className={`p-1.5 rounded-xl border transition-all ${
                      isBookmarked 
                        ? 'bg-blue-50 border-blue-100 text-[#007bff] dark:bg-blue-950 dark:border-blue-900' 
                        : 'border-slate-200 dark:border-slate-800 text-slate-400 hover:text-slate-655'
                    }`}
                    title="Bookmark"
                  >
                    <Bookmark className={`w-3 h-3 ${isBookmarked ? 'fill-[#007bff]' : ''}`} />
                  </button>
                  <button 
                    onClick={() => router.refresh()}
                    className="p-1.5 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-400 hover:text-slate-655 hover:bg-slate-50 transition-all"
                  >
                    <RefreshCw className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* RIGHT COLUMN: Metadata & Tab details */}
        <div className="flex-1 space-y-6 lg:pt-4">
          {/* Tabs */}
          <div className="flex border-b border-slate-100 dark:border-slate-800">
            {['overview', 'casts', 'related'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab as any)}
                className={`py-2.5 px-4 font-bold text-sm border-b-2 capitalize transition-all ${
                  activeTab === tab
                    ? 'border-[#007bff] text-[#007bff] dark:text-blue-400'
                    : 'border-transparent text-slate-400 hover:text-slate-650'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="space-y-6 min-h-[220px]">
            {activeTab === 'overview' && (
              <div className="space-y-4">
                {movie.tagline && (
                  <p className="text-base font-extrabold text-slate-700 dark:text-slate-350 italic">
                    &ldquo;{movie.tagline}&rdquo;
                  </p>
                )}
                <p className="text-sm leading-relaxed text-slate-650 dark:text-slate-400">
                  {movie.overview || 'No description available.'}
                </p>

                {/* Attributes List */}
                <div className="space-y-3 pt-4 border-t border-slate-100 dark:border-slate-800 text-xs">
                  <div className="grid grid-cols-3 gap-2">
                    <span className="text-slate-400 font-bold uppercase tracking-wider">Release</span>
                    <span className="col-span-2 text-slate-700 dark:text-slate-350 font-medium">
                      {movie.release_date ? new Date(movie.release_date).toLocaleDateString(locale, { day: 'numeric', month: 'long', year: 'numeric' }) : 'N/A'}
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <span className="text-slate-400 font-bold uppercase tracking-wider">Runtime</span>
                    <span className="col-span-2 text-slate-700 dark:text-slate-350 font-medium">
                      {movie.runtime ? `${runtimeHours}hr ${runtimeMins}min` : 'N/A'}
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <span className="text-slate-400 font-bold uppercase tracking-wider">Genre</span>
                    <span className="col-span-2 text-slate-700 dark:text-slate-350 font-medium">
                      {movie.genres ? movie.genres.map((g: any) => g.name).join(', ') : 'N/A'}
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <span className="text-slate-400 font-bold uppercase tracking-wider">Spoken Languages</span>
                    <span className="col-span-2 text-slate-700 dark:text-slate-350 font-medium">
                      {movie.spoken_languages ? movie.spoken_languages.map((l: any) => l.english_name).join(', ') : 'N/A'}
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <span className="text-slate-400 font-bold uppercase tracking-wider">Production Countries</span>
                    <span className="col-span-2 text-slate-700 dark:text-slate-350 font-medium">
                      {movie.production_countries ? movie.production_countries.map((c: any) => c.name).join(', ') : 'N/A'}
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-2 col-span-3">
                    <span className="text-slate-400 font-bold uppercase tracking-wider block mb-1">Production Companies</span>
                    <span className="col-span-3 text-slate-650 dark:text-slate-400 font-medium leading-relaxed block pl-1">
                      {movie.production_companies ? movie.production_companies.map((c: any) => c.name).join(', ') : 'N/A'}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'casts' && (
              <div className="grid grid-cols-2 gap-4">
                {credits?.cast?.slice(0, 8).map((actor: any) => (
                  <div key={actor.id} className="flex items-center gap-3 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-2.5 rounded-2xl shadow-sm">
                    <div className="w-10 h-10 rounded-full overflow-hidden bg-slate-100 shrink-0">
                      {actor.profile_path ? (
                        <img 
                          src={`https://image.tmdb.org/t/p/w185${actor.profile_path}`} 
                          alt={actor.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-slate-400 text-[10px] font-bold">
                          N/A
                        </div>
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-slate-850 dark:text-slate-100 truncate">{actor.name}</p>
                      <p className="text-[10px] text-slate-450 truncate">{actor.character}</p>
                    </div>
                  </div>
                ))}
                {(!credits?.cast || credits.cast.length === 0) && (
                  <p className="text-xs text-slate-400 col-span-2">No cast information available.</p>
                )}
              </div>
            )}

            {activeTab === 'related' && (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {recommendations.slice(0, 6).map((rec: any) => (
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
                  <p className="text-xs text-slate-400 col-span-3">No recommendation matches found.</p>
                )}
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
