'use client';
import { useState, useEffect } from 'react';
import { ApiGateway } from '@/lib/api/gateway';
import { PosterCard } from '@/components/cards/PosterCard';
import { Tv, Loader, SlidersHorizontal } from 'lucide-react';

const TV_GENRES = [
  { id: '', name: 'All Genres' },
  { id: '10759', name: 'Action & Adventure' },
  { id: '16', name: 'Animation' },
  { id: '35', name: 'Comedy' },
  { id: '80', name: 'Crime' },
  { id: '99', name: 'Documentary' },
  { id: '18', name: 'Drama' },
  { id: '10751', name: 'Family' },
  { id: '9628', name: 'Mystery' },
  { id: '10765', name: 'Sci-Fi & Fantasy' }
];

const YEARS = ['', '2026', '2025', '2024', '2023', '2022', '2021', '2020', '2019', '2018'];

export default function TvShowsPage() {
  const [shows, setShows] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  
  // Filters
  const [selectedGenre, setSelectedGenre] = useState('');
  const [selectedYear, setSelectedYear] = useState('');
  const [sortBy, setSortBy] = useState('popularity.desc');

  useEffect(() => {
    async function loadShows() {
      setLoading(true);
      try {
        const params: Record<string, string> = {
          page: String(currentPage),
          sort_by: sortBy,
          include_adult: 'false' // Block adult content
        };

        if (selectedGenre) {
          params.with_genres = selectedGenre;
        }
        if (selectedYear) {
          params.first_air_date_year = selectedYear;
        }

        const data = await ApiGateway.fetchTmdb<any>('/discover/tv', params);
        if (data.results) {
          setShows(data.results);
          setTotalPages(Math.min(data.total_pages || 1, 500));
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadShows();
  }, [currentPage, selectedGenre, selectedYear, sortBy]);

  return (
    <div className="min-h-screen py-10 px-4 md:px-8 bg-[var(--color-main)]">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Header and Modernized Unified Filters Bar */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-4 border-b border-slate-100 dark:border-slate-800/80">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-800 dark:text-white flex items-center gap-2">
              <Tv className="w-8 h-8 text-[#007bff]" />
              TV Shows
            </h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Discover popular television series with filter options</p>
          </div>

          {/* Modern Unified Filters Panel */}
          <div className="flex flex-wrap items-center gap-3 bg-white/70 dark:bg-slate-900/60 backdrop-blur-md p-3 rounded-2xl border border-slate-100 dark:border-slate-800/80 shadow-lg">
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider pr-1.5 border-r border-slate-100 dark:border-slate-800">
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span>Filters</span>
            </div>
            
            {/* Genre */}
            <select
              value={selectedGenre}
              onChange={(e) => { setSelectedGenre(e.target.value); setCurrentPage(1); }}
              className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-705 dark:text-slate-200 text-xs font-semibold focus:outline-none focus:border-blue-500 transition shadow-sm hover:bg-slate-50 dark:hover:bg-slate-800/50"
            >
              {TV_GENRES.map(g => (
                <option key={g.id} value={g.id}>{g.name}</option>
              ))}
            </select>

            {/* Year */}
            <select
              value={selectedYear}
              onChange={(e) => { setSelectedYear(e.target.value); setCurrentPage(1); }}
              className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-705 dark:text-slate-200 text-xs font-semibold focus:outline-none focus:border-blue-500 transition shadow-sm hover:bg-slate-50 dark:hover:bg-slate-800/50"
            >
              <option value="">All Years</option>
              {YEARS.filter(Boolean).map(yr => (
                <option key={yr} value={yr}>{yr}</option>
              ))}
            </select>

            {/* Sort Order */}
            <select
              value={sortBy}
              onChange={(e) => { setSortBy(e.target.value); setCurrentPage(1); }}
              className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-705 dark:text-slate-200 text-xs font-semibold focus:outline-none focus:border-blue-500 transition shadow-sm hover:bg-slate-50 dark:hover:bg-slate-800/50"
            >
              <option value="popularity.desc">Most Popular</option>
              <option value="vote_average.desc">Highest Rated</option>
              <option value="first_air_date.desc">Latest Air Date</option>
            </select>
          </div>
        </div>

        {/* Content grid */}
        {loading ? (
          <div className="flex justify-center py-20">
            <Loader className="w-8 h-8 animate-spin text-[#007bff]" />
          </div>
        ) : shows.length > 0 ? (
          <div className="space-y-8">
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
              {shows.map((item) => (
                <PosterCard
                  key={item.id}
                  id={item.id}
                  title={item.name}
                  posterPath={item.poster_path}
                  rating={item.vote_average}
                  year={item.first_air_date ? item.first_air_date.split('-')[0] : ''}
                  type="tv"
                />
              ))}
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-center gap-4 pt-6">
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1 || loading}
                className="px-4 py-2 text-xs font-bold rounded-xl border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-350 hover:bg-slate-50 dark:hover:bg-slate-800/50 disabled:opacity-50 disabled:pointer-events-none transition shadow-sm bg-white dark:bg-slate-900"
              >
                Previous
              </button>
              <span className="text-xs font-black text-slate-500 dark:text-slate-400">
                Page {currentPage} of {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages || loading}
                className="px-4 py-2 text-xs font-bold rounded-xl border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-350 hover:bg-slate-50 dark:hover:bg-slate-800/50 disabled:opacity-50 disabled:pointer-events-none transition shadow-sm bg-white dark:bg-slate-900"
              >
                Next
              </button>
            </div>
          </div>
        ) : (
          <div className="text-center py-20 text-slate-400 dark:text-slate-600">
            No TV shows found matching these filters.
          </div>
        )}
      </div>
    </div>
  );
}
