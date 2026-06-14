'use client';
import { useState, useEffect } from 'react';
import { ApiGateway } from '@/lib/api/gateway';
import { PosterCard } from '@/components/cards/PosterCard';
import { Film, Loader } from 'lucide-react';

export default function MoviesPage() {
  const [movies, setMovies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadMovies() {
      try {
        const data = await ApiGateway.fetchTmdb<any>('/trending/movie/week');
        if (data.results) {
          setMovies(data.results);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadMovies();
  }, []);

  return (
    <div className="min-h-screen py-10 px-4 md:px-8">
      <div className="max-w-6xl mx-auto space-y-8">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-800 flex items-center gap-2">
            <Film className="w-8 h-8 text-[#007bff]" />
            Trending Movies
          </h1>
          <p className="text-slate-500 text-sm mt-1">Discover popular movies this week</p>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <Loader className="w-8 h-8 animate-spin text-[#007bff]" />
          </div>
        ) : (
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
        )}
      </div>
    </div>
  );
}
