import process from 'node:process';
import { HeroFeature } from '@/components/hero/HeroFeature';
import { CarouselRow } from '@/components/cards/CarouselRow';
import { PosterCard } from '@/components/cards/PosterCard';

interface TmdbItem {
  id: number;
  title?: string;
  name?: string;
  poster_path?: string;
  backdrop_path?: string;
  vote_average?: number;
  release_date?: string;
  first_air_date?: string;
  media_type?: string;
}

// Fallback lists in case API fetch fails
const fallbackRecommendation = [
  { id: 533535, title: 'Deadpool & Wolverine', poster_path: '/8cdWjvZQUExUUTzyp4t6EDMubfO.jpg', vote_average: 7.7, release_date: '2024-07-24' },
  { id: 693134, title: 'Dune: Part Two', poster_path: '/1pdfLvkbY9ohJlCjQH2JGqqUT1e.jpg', vote_average: 8.3, release_date: '2024-02-27' },
  { id: 1022789, title: 'Inside Out 2', poster_path: '/vpnVM9B6NMmQpWeZvzRxHXh2kM2.jpg', vote_average: 7.7, release_date: '2024-06-11' }
];

async function fetchFromTmdb(endpoint: string, params: Record<string, string> = {}) {
  const apiKey = process.env.TMDB_API_KEY;
  if (!apiKey) throw new Error('TMDB_API_KEY is not set');
  const url = new URL(`https://api.themoviedb.org/3${endpoint}`);
  url.searchParams.append('api_key', apiKey);
  url.searchParams.append('include_adult', 'false'); // Persistently filter adult content
  Object.entries(params).forEach(([key, value]) => url.searchParams.append(key, value));
  
  try {
    const res = await fetch(url.toString(), { next: { revalidate: 3600 } }); // Cache 1hr
    if (!res.ok) throw new Error('TMDB API Fetch failed');
    return await res.json();
  } catch (err) {
    console.error(`Error querying TMDB ${endpoint}:`, err);
    return { results: [] };
  }
}

export default async function Home() {
  // Query actual trending/latest lists
  const [
    trendingMovies,
    trendingTv,
    topRated,
    nowPlaying,
    ,
    anime,
    action
  ] = await Promise.all([
    fetchFromTmdb('/trending/movie/week'),
    fetchFromTmdb('/trending/tv/week'),
    fetchFromTmdb('/movie/top_rated'),
    fetchFromTmdb('/movie/now_playing'),
    fetchFromTmdb('/discover/movie', {
      'primary_release_date.gte': '2025-01-01',
      'sort_by': 'popularity.desc'
    }),
    fetchFromTmdb('/discover/tv', {
      'with_genres': '16',
      'with_original_language': 'ja',
      'sort_by': 'popularity.desc'
    }),
    fetchFromTmdb('/discover/movie', {
      'with_genres': '28,12',
      'sort_by': 'popularity.desc'
    })
  ]);

  const getList = (apiResult: { results?: unknown[] } | null, fallback: unknown[]) => {
    return apiResult?.results?.length ? apiResult.results : fallback;
  };

  // Mix trending movies + TV shows for the hero slider
  const heroMovies = getList(trendingMovies, fallbackRecommendation)
    .slice(0, 3)
    .map((item) => ({ ...(item as TmdbItem), media_type: 'movie' }));
  const heroTv = getList(trendingTv, [])
    .slice(0, 3)
    .map((item) => ({ ...(item as TmdbItem), media_type: 'tv' }));
  const heroSlides = [...heroMovies, ...heroTv].filter((item) => (item as TmdbItem).backdrop_path);

  return (
    <main className="min-h-screen pb-20 bg-[var(--color-main)] text-slate-800 dark:text-white transition-colors duration-300">
      <HeroFeature movies={heroSlides} />
      
      <div className="mt-8 space-y-4 animate-fadeIn">
        <CarouselRow title="Recommendation">
          {getList(trendingMovies, fallbackRecommendation).map((item) => {
            const movie = item as TmdbItem;
            return (
            <PosterCard 
              key={movie.id}
              id={movie.id}
              title={movie.title ?? movie.name ?? ''}
              posterPath={movie.poster_path ?? ''}
              rating={movie.vote_average}
              year={movie.release_date ? movie.release_date.split('-')[0] : (movie.first_air_date ? movie.first_air_date.split('-')[0] : '')}
              type="movie"
            />
            );
          })}
        </CarouselRow>

        <CarouselRow title="Trending TV Shows">
          {getList(trendingTv, []).map((item) => {
            const show = item as TmdbItem;
            return (
            <PosterCard 
              key={show.id}
              id={show.id}
              title={show.name ?? show.title ?? ''}
              posterPath={show.poster_path ?? ''}
              rating={show.vote_average}
              year={show.first_air_date ? show.first_air_date.split('-')[0] : ''}
              type="tv"
            />
            );
          })}
        </CarouselRow>

        <CarouselRow title="Top Rated Movies">
          {getList(topRated, []).map((item) => {
            const movie = item as TmdbItem;
            return (
            <PosterCard 
              key={movie.id}
              id={movie.id}
              title={movie.title ?? ''}
              posterPath={movie.poster_path ?? ''}
              rating={movie.vote_average}
              year={movie.release_date ? movie.release_date.split('-')[0] : ''}
              type="movie"
            />
            );
          })}
        </CarouselRow>

        <CarouselRow title="Now Playing in Theaters">
          {getList(nowPlaying, []).map((item) => {
            const movie = item as TmdbItem;
            return (
            <PosterCard 
              key={movie.id}
              id={movie.id}
              title={movie.title ?? ''}
              posterPath={movie.poster_path ?? ''}
              rating={movie.vote_average}
              year={movie.release_date ? movie.release_date.split('-')[0] : ''}
              type="movie"
            />
            );
          })}
        </CarouselRow>

        <CarouselRow title="Popular Anime">
          {getList(anime, []).map((item) => {
            const show = item as TmdbItem;
            return (
            <PosterCard 
              key={show.id}
              id={show.id}
              title={show.name ?? ''}
              posterPath={show.poster_path ?? ''}
              rating={show.vote_average}
              year={show.first_air_date ? show.first_air_date.split('-')[0] : ''}
              type="tv"
            />
            );
          })}
        </CarouselRow>

        <CarouselRow title="Action & Adventure">
          {getList(action, []).map((item) => {
            const movie = item as TmdbItem;
            return (
            <PosterCard 
              key={movie.id}
              id={movie.id}
              title={movie.title ?? ''}
              posterPath={movie.poster_path ?? ''}
              rating={movie.vote_average}
              year={movie.release_date ? movie.release_date.split('-')[0] : ''}
              type="movie"
            />
            );
          })}
        </CarouselRow>
      </div>
    </main>
  );
}
