'use client';
import { useState, useEffect } from 'react';
import { ApiGateway } from '@/lib/api/gateway';
import { Search, Loader, Star } from 'lucide-react';
import { PosterCard } from '@/components/cards/PosterCard';

export default function SearchPage() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }
    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const data = await ApiGateway.fetchTmdb<any>('/search/multi', { query });
        if (data.results) {
          // Filter results with poster paths
          setResults(data.results.filter((r: any) => r.poster_path));
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }, 500); // Debounce 500ms

    return () => clearTimeout(timer);
  }, [query]);

  return (
    <div className="min-h-screen py-10 px-4 md:px-8">
      <div className="max-w-6xl mx-auto space-y-8">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-800">Search Library</h1>
          <p className="text-slate-500 text-sm mt-1">Explore movies, TV shows, anime and more</p>
        </div>

        {/* Input bar */}
        <div className="relative max-w-xl">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input
            type="text"
            placeholder="Type name, genre, or release year..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3.5 rounded-2xl border border-slate-200 bg-white focus:outline-none focus:border-blue-500 text-slate-700 shadow-sm transition-colors text-base"
          />
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <Loader className="w-8 h-8 animate-spin text-[#007bff]" />
          </div>
        ) : results.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {results.map((item) => (
              <PosterCard
                key={item.id}
                id={item.id}
                title={item.title || item.name}
                posterPath={item.poster_path}
                rating={item.vote_average}
                year={item.release_date ? item.release_date.split('-')[0] : (item.first_air_date ? item.first_air_date.split('-')[0] : '')}
              />
            ))}
          </div>
        ) : query.trim() ? (
          <div className="text-center py-20 text-slate-400">
            No results found for &ldquo;{query}&rdquo;.
          </div>
        ) : (
          <div className="text-center py-20 text-slate-400 flex flex-col items-center">
            <Search className="w-12 h-12 text-slate-200 mb-2" />
            <p>Start typing to search titles...</p>
          </div>
        )}
      </div>
    </div>
  );
}
