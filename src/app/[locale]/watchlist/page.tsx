'use client';
import { useEffect, useState } from 'react';
import { ApiGateway } from '@/lib/api/gateway';
import { PosterCard } from '@/components/cards/PosterCard';
import { Eye, Loader } from 'lucide-react';

export default function WatchlistPage() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadWatchlist() {
      const stored = localStorage.getItem('watchers-heaven-watchlist');
      if (!stored) {
        setItems([]);
        setLoading(false);
        return;
      }

      try {
        const ids: string[] = JSON.parse(stored);
        const fetched = await Promise.all(
          ids.map(async (id) => {
            try {
              return await ApiGateway.getMovieDetails(id);
            } catch {
              return null;
            }
          })
        );
        setItems(fetched.filter((item) => item !== null));
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadWatchlist();
  }, []);

  return (
    <div className="min-h-screen py-10 px-4 md:px-8">
      <div className="max-w-6xl mx-auto space-y-8">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-800 flex items-center gap-2">
            <Eye className="w-8 h-8 text-[#007bff]" />
            My Watchlist
          </h1>
          <p className="text-slate-500 text-sm mt-1">Keep track of movies and shows you want to watch</p>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <Loader className="w-8 h-8 animate-spin text-[#007bff]" />
          </div>
        ) : items.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {items.map((item) => (
              <PosterCard
                key={item.id}
                id={item.id}
                title={item.title || item.name}
                posterPath={item.poster_path}
                rating={item.vote_average}
                year={item.release_date ? item.release_date.split('-')[0] : ''}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-20 text-slate-400">
            Your watchlist is empty. Add titles from details or hero sections.
          </div>
        )}
      </div>
    </div>
  );
}
