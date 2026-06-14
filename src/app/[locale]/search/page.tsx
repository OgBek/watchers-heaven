'use client';
import { useState, useEffect } from 'react';
import { ApiGateway } from '@/lib/api/gateway';
import { Search, Loader, AlertCircle } from 'lucide-react';
import { PosterCard } from '@/components/cards/PosterCard';

const normalizeString = (str: string) => {
  return str.toLowerCase().replace(/[^a-z0-9]/g, '');
};

const getQueryVariations = (q: string): string[] => {
  const normalized = q.trim();
  if (!normalized) return [];
  const variations = [normalized];
  
  // If no space, split common prefixes
  if (!normalized.includes(' ')) {
    const splitPattern = /^(spider|iron|bat|super|star|dark|john|die|fast|tom|x)(.+)$/i;
    const match = normalized.match(splitPattern);
    if (match) {
      variations.push(`${match[1]} ${match[2]}`);
    }
  }
  return [...new Set(variations)];
};

export default function SearchPage() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [trending, setTrending] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load trending movies as default preview
  useEffect(() => {
    async function loadTrending() {
      try {
        const data = await ApiGateway.fetchTmdb<any>('/trending/movie/week');
        if (data.results) {
          setTrending(data.results.slice(0, 12));
        }
      } catch (err) {
        // Log simple error to avoid dev server error overlays
        console.warn('Trending fetch failed:', err instanceof Error ? err.message : err);
      }
    }
    loadTrending();
  }, []);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      setError(null);
      return;
    }
    const timer = setTimeout(async () => {
      setLoading(true);
      setError(null);
      try {
        const variations = getQueryVariations(query);
        const fetches = variations.map(v => 
          ApiGateway.fetchTmdb<any>('/search/multi', { query: v }).catch(() => ({ results: [] }))
        );
        const responses = await Promise.all(fetches);
        
        // Merge results
        const allResults = responses.flatMap(res => res.results || []);
        
        // Remove duplicates
        const uniqueResultsMap = new Map();
        allResults.forEach(item => {
          if (item && item.id) {
            uniqueResultsMap.set(item.id, item);
          }
        });
        let merged = Array.from(uniqueResultsMap.values());

        // Client-side fuzzy/substring filtering for precision
        const normQuery = normalizeString(query);
        merged = merged.filter((item: any) => {
          const title = item.title || item.name || '';
          const originalTitle = item.original_title || item.original_name || '';
          return (
            item.poster_path && (
              normalizeString(title).includes(normQuery) ||
              normalizeString(originalTitle).includes(normQuery)
            )
          );
        });

        setResults(merged);
      } catch (err) {
        console.warn('Search query failed:', err instanceof Error ? err.message : err);
        setError('Connection timed out or returned an error. Please adjust your query or check your connection.');
      } finally {
        setLoading(false);
      }
    }, 500); // Debounce 500ms

    return () => clearTimeout(timer);
  }, [query]);

  return (
    <div className="min-h-screen py-10 px-4 md:px-8 bg-[var(--color-main)]">
      <div className="max-w-6xl mx-auto space-y-8">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-800 dark:text-white">Search Library</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Explore movies, TV shows, anime and more</p>
        </div>

        {/* Input bar */}
        <div className="relative max-w-xl">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input
            type="text"
            placeholder="Type name, genre, or release year..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 focus:outline-none focus:border-blue-500 text-slate-705 dark:text-slate-200 shadow-sm transition-colors text-base"
          />
        </div>

        {error && (
          <div className="flex items-center gap-3 p-4 bg-red-50 dark:bg-red-950/20 border border-red-100 dark:border-red-900/50 rounded-2xl text-red-650 dark:text-red-400 text-sm">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <div className="flex-1">{error}</div>
            <button
              onClick={() => {
                const current = query;
                setQuery('');
                setTimeout(() => setQuery(current), 50);
              }}
              className="px-3 py-1.5 bg-red-100 dark:bg-red-900/40 hover:bg-red-200 dark:hover:bg-red-900/60 rounded-xl text-xs font-bold transition"
            >
              Retry
            </button>
          </div>
        )}

        {loading ? (
          <div className="flex justify-center py-20">
            <Loader className="w-8 h-8 animate-spin text-accent-blue" />
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
                type={item.media_type === 'tv' ? 'tv' : 'movie'}
              />
            ))}
          </div>
        ) : query.trim() && !error ? (
          <div className="text-center py-20 text-slate-400">
            No results found for &ldquo;{query}&rdquo;.
          </div>
        ) : !error && (
          <div className="space-y-5">
            <h2 className="text-xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
              Trending Movies & Series
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
              {trending.map((item) => (
                <PosterCard
                  key={item.id}
                  id={item.id}
                  title={item.title || item.name}
                  posterPath={item.poster_path}
                  rating={item.vote_average}
                  year={item.release_date ? item.release_date.split('-')[0] : (item.first_air_date ? item.first_air_date.split('-')[0] : '')}
                  type="movie"
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
