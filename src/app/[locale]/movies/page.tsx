'use client';
import { useState, useEffect } from 'react';
import { ApiGateway } from '@/lib/api/gateway';
import { PosterCard } from '@/components/cards/PosterCard';
import { Film, Loader } from 'lucide-react';

const MOVIE_GENRES = [
  { id: '', name: 'All Genres' },
  { id: '28', name: 'Action' },
  { id: '12', name: 'Adventure' },
  { id: '16', name: 'Animation' },
  { id: '35', name: 'Comedy' },
  { id: '80', name: 'Crime' },
  { id: '18', name: 'Drama' },
  { id: '14', name: 'Fantasy' },
  { id: '27', name: 'Horror' },
  { id: '878', name: 'Sci-Fi' },
  { id: '53', name: 'Thriller' },
  { id: '10749', name: 'Romance' }
];

const YEARS = ['', '2026', '2025', '2024', '2023', '2022', '2021', '2020', '2019', '2018'];

export default function MoviesPage() {
  const [movies, setMovies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  
  // Filters
  const [selectedGenre, setSelectedGenre] = useState('');
  const [selectedYear, setSelectedYear] = useState('');
  const [sortBy, setSortBy] = useState('popularity.desc');

  useEffect(() => {
    async function loadMovies() {
      setLoading(true);
      try {
        const params: Record<string, string> = {
          page: String(currentPage),
          sort_by: sortBy
        };

        if (selectedGenre) {
          params.with_genres = selectedGenre;
        }
        if (selectedYear) {
          params.primary_release_year = selectedYear;
        }

        const data = await ApiGateway.fetchTmdb<any>('/discover/movie', params);
        if (data.results) {
          setMovies(data.results);
          setTotalPages(Math.min(data.total_pages || 1, 500)); // TMDB discover caps at 500 pages
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadMovies();
  }, [currentPage, selectedGenre, selectedYear, sortBy]);

  return (
    <div className="min-h-screen py-10 px-4 md:px-8 bg-[var(--color-main)]">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-800 dark:text-white flex items-center gap-2">
              <Film className="w-8 h-8 text-[#007bff]" />
              Movies
            </h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Explore all movies with real-time filters</p>
          </div>

          {/* Filters controls */}
          <div className="flex flex-wrap items-center gap-3 bg-white dark:bg-slate-900 p-2.5 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm">
            <select
              value={selectedGenre}
              onChange={(e) => { setSelectedGenre(e.target.value); setCurrentPage(1); }}
              className="px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-705 dark:text-slate-200 text-xs font-bold focus:outline-none focus:border-blue-500 transition shadow-sm"
            >
              {MOVIE_GENRES.map(g => (
                <option key={g.id} value={g.id}>{g.name}</option>
              ))}
            </select>

            <select
              value={selectedYear}
              onChange={(e) => { setSelectedYear(e.target.value); setCurrentPage(1); }}
              className="px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-705 dark:text-slate-200 text-xs font-bold focus:outline-none focus:border-blue-500 transition shadow-sm"
            >
              <option value="">All Years</option>
              {YEARS.filter(Boolean).map(yr => (
                <option key={yr} value={yr}>{yr}</option>
              ))}
            </select>

            <select
              value={sortBy}
              onChange={(e) => { setSortBy(e.target.value); setCurrentPage(1); }}
              className="px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-705 dark:text-slate-200 text-xs font-bold focus:outline-none focus:border-blue-500 transition shadow-sm"
            >
              <option value="popularity.desc">Most Popular</option>
              <option value="vote_average.desc">Highest Rated</option>
              <option value="primary_release_date.desc">Latest Releases</option>
            </select>
          </div>
        </div>

        {/* Content grid */}
        {loading ? (
          <div className="flex justify-center py-20">
            <Loader className="w-8 h-8 animate-spin text-[#007bff]" />
          </div>
        ) : movies.length > 0 ? (
          <div className="space-y-8">
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
              {movies.map((item) => (
                <PosterCard
                  key={item.id}
                  id={item.id}
                  title={item.title}
                  posterPath={item.poster_path}
                  rating={item.vote_average}
                  year={item.release_date ? item.release_date.split('-')[0] : ''}
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
            No movies found matching these filters.
          </div>
        )}
      </div>
    </div>
  );
}
