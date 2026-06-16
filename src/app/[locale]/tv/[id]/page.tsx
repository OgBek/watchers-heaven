'use client';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Play, Bookmark, RefreshCw, Star, Loader, Image as ImageIcon } from 'lucide-react';
import { ApiGateway } from '@/lib/api/gateway';
import { useState, useEffect } from 'react';
import { PosterCard } from '@/components/cards/PosterCard';
import { isInWatchlist, toggleWatchlistItem } from '@/lib/watchlist';

export default function TvShowDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const locale = (params.locale as string) || 'en';

  const [show, setShow] = useState<any>(null);
  const [credits, setCredits] = useState<any>(null);
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isBookmarked, setIsBookmarked] = useState(false);

  // Seasons and Episodes
  const [selectedSeason, setSelectedSeason] = useState<number>(1);
  const [seasonDetails, setSeasonDetails] = useState<any>(null);
  const [loadingEpisodes, setLoadingEpisodes] = useState(false);

  // Track hovered section: 'left' | 'right' | null for dynamic column expansion
  const [hoveredSection, setHoveredSection] = useState<'left' | 'right' | null>(null);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const [showData, creditsData, recsData] = await Promise.all([
          ApiGateway.getTvDetails(id),
          ApiGateway.getTvCredits(id).catch(() => null),
          ApiGateway.getTvRecommendations(id).catch(() => ({ results: [] }))
        ]);
        setShow(showData);
        setCredits(creditsData);
        setRecommendations(recsData.results || []);
        
        // Default to first season if available
        if (showData.seasons && showData.seasons.length > 0) {
          const firstSeason = showData.seasons[0].season_number;
          setSelectedSeason(firstSeason);
        }
      } catch (err) {
        console.error('Failed to load TV show details', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [id]);

  // Load season details when selected season changes
  useEffect(() => {
    if (!show) return;
    async function loadSeason() {
      setLoadingEpisodes(true);
      try {
        const data = await ApiGateway.getTvSeasonDetails(id, selectedSeason);
        setSeasonDetails(data);
      } catch (e) {
        console.error('Failed to fetch season details', e);
      } finally {
        setLoadingEpisodes(false);
      }
    }
    loadSeason();
  }, [selectedSeason, show, id]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setIsBookmarked(isInWatchlist(id));
    }
  }, [id]);

  const toggleBookmark = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (typeof window === 'undefined') return;
    const added = toggleWatchlistItem(id, 'tv');
    setIsBookmarked(added);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--color-main)]">
        <Loader className="w-8 h-8 animate-spin text-accent-blue" />
      </div>
    );
  }

  if (!show) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[var(--color-main)] p-8">
        <p className="text-slate-500 mb-4 font-semibold">TV Show details not found.</p>
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

  const voteAverage = show.vote_average ? show.vote_average.toFixed(1) : 'N/A';
  const releaseYear = show.first_air_date ? show.first_air_date.split('-')[0] : 'N/A';

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
          className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold hover:bg-slate-50 dark:hover:bg-slate-800 transition shadow-sm"
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
            className="group relative w-full aspect-[2/3] overflow-hidden bg-slate-100 dark:bg-slate-900 shadow-2xl border border-slate-100 dark:border-slate-800/60 rounded-3xl transition-transform duration-500"
          >
            {show.poster_path ? (
              <img 
                src={`https://image.tmdb.org/t/p/w500${show.poster_path}`} 
                alt={show.name}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
            ) : (
              <div className="absolute inset-0 flex flex-col items-center justify-center p-6 bg-slate-100 dark:bg-slate-955">
                <ImageIcon className="w-16 h-16 text-slate-300 dark:text-slate-700 mb-2" />
                <span className="text-xs text-slate-400 text-center font-bold">{show.name}</span>
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

        {/* RIGHT COLUMN: Backdrop Banner, Overview, Seasons & Related */}
        <div 
          className={`${rightColWidth} w-full space-y-8 transition-all duration-500 ease-in-out`}
          onMouseEnter={() => setHoveredSection('right')}
          onMouseLeave={() => setHoveredSection(null)}
        >
          {/* Main Backdrop Banner Card — hidden on mobile to avoid duplicate images */}
          <div className="hidden lg:block relative w-full h-[40vh] min-h-[300px] max-h-[500px] rounded-[2rem] overflow-hidden bg-slate-100 dark:bg-slate-900 shadow-xl border border-slate-100 dark:border-slate-800">
            {show.backdrop_path ? (
              <img 
                src={`https://image.tmdb.org/t/p/original${show.backdrop_path}`} 
                alt={show.name}
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
                {show.name}
              </h1>
              
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 text-xs text-slate-400 dark:text-slate-500 font-semibold uppercase tracking-wider">
                <span>{releaseYear}</span>
                <span>•</span>
                <span>{show.number_of_seasons} Seasons</span>
                <span>•</span>
                <span>{show.number_of_episodes} Episodes</span>
                <span>•</span>
                <span>{show.genres ? show.genres.slice(0, 3).map((g: any) => g.name).join(', ') : 'N/A'}</span>
              </div>
            </div>

            {/* Quick Actions Panel */}
            <div className="flex items-center gap-2">
              <button 
                onClick={() => router.push(`/${locale}/watch/${id}?s=1&e=1`)}
                className="flex items-center gap-2 bg-accent-blue hover:bg-blue-600 text-white px-5 py-3 rounded-2xl text-xs font-bold transition shadow-md"
              >
                <Play className="w-4 h-4 fill-white text-white" />
                Watch S1E1
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
            
            <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-400">
              {show.overview || 'No description available.'}
            </p>

            {/* Extended Attributes Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-6 border-t border-slate-100 dark:border-slate-800/80 text-xs">
              <div className="space-y-2.5">
                <div className="flex justify-between border-b border-slate-50 dark:border-slate-800/40 pb-1.5">
                  <span className="text-slate-400 font-bold uppercase tracking-wider">First Air Date</span>
                  <span className="text-slate-700 dark:text-slate-300 font-medium">
                    {show.first_air_date ? new Date(show.first_air_date).toLocaleDateString(locale, { day: 'numeric', month: 'long', year: 'numeric' }) : 'N/A'}
                  </span>
                </div>
                
                <div className="flex justify-between border-b border-slate-50 dark:border-slate-800/40 pb-1.5">
                  <span className="text-slate-400 font-bold uppercase tracking-wider">Networks</span>
                  <span className="text-slate-755 dark:text-slate-300 font-medium truncate max-w-[200px]" title={show.networks ? show.networks.map((n: any) => n.name).join(', ') : 'N/A'}>
                    {show.networks ? show.networks.map((n: any) => n.name).join(', ') : 'N/A'}
                  </span>
                </div>
              </div>

              <div className="space-y-2.5">
                <div className="flex justify-between border-b border-slate-50 dark:border-slate-800/40 pb-1.5">
                  <span className="text-slate-400 font-bold uppercase tracking-wider">Status</span>
                  <span className="text-slate-755 dark:text-slate-300 font-medium">
                    {show.status || 'N/A'}
                  </span>
                </div>

                <div className="flex justify-between border-b border-slate-50 dark:border-slate-800/40 pb-1.5">
                  <span className="text-slate-400 font-bold uppercase tracking-wider">Episode Runtime</span>
                  <span className="text-slate-755 dark:text-slate-300 font-medium">
                    {show.episode_run_time && show.episode_run_time.length > 0 ? `${show.episode_run_time[0]}m` : 'N/A'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Episode Browser Section */}
          <div className="space-y-4 bg-white dark:bg-slate-900/30 backdrop-blur-sm p-6 rounded-[2rem] border border-slate-100 dark:border-slate-800/60 shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800/80 pb-3 flex-wrap gap-2">
              <h3 className="text-xs font-black tracking-[0.25em] text-slate-400 dark:text-slate-500 uppercase select-none">
                Episodes Selector
              </h3>
              
              {/* Season Selector Dropdown */}
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-400 font-bold">Season:</span>
                <select
                  value={selectedSeason}
                  onChange={(e) => setSelectedSeason(parseInt(e.target.value))}
                  className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-705 dark:text-slate-250 text-xs font-bold focus:outline-none focus:border-blue-500 transition shadow-sm"
                >
                  {show.seasons?.map((s: any) => (
                    <option key={s.id} value={s.season_number}>
                      {s.name || `Season ${s.season_number}`}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* List of episodes */}
            {loadingEpisodes ? (
              <div className="flex justify-center py-10">
                <Loader className="w-6 h-6 animate-spin text-accent-blue" />
              </div>
            ) : seasonDetails?.episodes ? (
              <div className="space-y-3 max-h-[700px] overflow-y-auto pr-1" style={{ scrollbarWidth: 'thin' }}>
                {seasonDetails.episodes.map((ep: any) => (
                  <div 
                    key={ep.id}
                    onClick={() => router.push(`/${locale}/watch/${id}?s=${selectedSeason}&e=${ep.episode_number}`)}
                    className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-3 rounded-2xl bg-white dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800 hover:border-blue-400/50 hover:bg-blue-50/10 dark:hover:bg-blue-950/10 cursor-pointer transition-all duration-300"
                  >
                    <div className="flex gap-3 min-w-0">
                      {/* Episode thumbnail */}
                      <div className="w-20 aspect-video rounded-lg bg-slate-100 dark:bg-slate-800 shrink-0 overflow-hidden relative">
                        {ep.still_path ? (
                          <img 
                            src={`https://image.tmdb.org/t/p/w185${ep.still_path}`}
                            alt={ep.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-slate-300 text-[8px]">No Image</div>
                        )}
                        <div className="absolute bottom-1 right-1 bg-black/60 text-white text-[8px] font-black px-1 rounded">
                          EP {ep.episode_number}
                        </div>
                      </div>
                      
                      <div className="min-w-0">
                        <h4 className="text-xs font-bold text-slate-800 dark:text-white truncate">{ep.name}</h4>
                        <p className="text-[10px] text-slate-400 dark:text-slate-500 line-clamp-2 mt-0.5 leading-relaxed">{ep.overview || 'No description available for this episode.'}</p>
                      </div>
                    </div>
                    <Play className="w-4 h-4 text-accent-blue dark:text-blue-400 shrink-0 hidden sm:block mr-2" />
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-400 py-4">No episodes found for this season.</p>
            )}
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
                  title={rec.name}
                  posterPath={rec.poster_path}
                  rating={rec.vote_average}
                  year={rec.first_air_date ? rec.first_air_date.split('-')[0] : ''}
                  type="tv"
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
