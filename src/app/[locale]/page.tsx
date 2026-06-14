import { HeroFeature } from '@/components/hero/HeroFeature';
import { CarouselRow } from '@/components/cards/CarouselRow';
import { PosterCard } from '@/components/cards/PosterCard';

// Fallback lists in case API fetch fails
const fallbackRecommendation = [
  { id: 533535, title: 'Deadpool & Wolverine', poster_path: '/8cdWjvZQUExUUTzyp4t6EDMubfO.jpg', vote_average: 7.7, release_date: '2024-07-24' },
  { id: 693134, title: 'Dune: Part Two', poster_path: '/1pdfLvkbY9ohJlCjQH2JGqqUT1e.jpg', vote_average: 8.3, release_date: '2024-02-27' },
  { id: 1022789, title: 'Inside Out 2', poster_path: '/vpnVM9B6NMmQpWeZvzRxHXh2kM2.jpg', vote_average: 7.7, release_date: '2024-06-11' }
];

async function fetchFromTmdb(endpoint: string, params: Record<string, string> = {}) {
  const apiKey = process.env.TMDB_API_KEY || '9d12b6b90ce72ac7663cd7cb98428a6a';
  const url = new URL(`https://api.themoviedb.org/3${endpoint}`);
  url.searchParams.append('api_key', apiKey);
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
    upcoming,
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

  const getList = (apiResult: any, fallback: any[]) => {
    return apiResult?.results?.length ? apiResult.results : fallback;
  };

  const trendingList = getList(trendingMovies, fallbackRecommendation).slice(0, 5);

  return (
    <main className="min-h-screen pb-20 bg-[var(--color-main)] text-slate-800 dark:text-white transition-colors duration-300">
      <HeroFeature movies={trendingList} />
      
      <div className="mt-8 space-y-4">
        <CarouselRow title="Recommendation">
          {getList(trendingMovies, fallbackRecommendation).map((movie: any) => (
            <PosterCard 
              key={movie.id}
              id={movie.id}
              title={movie.title || movie.name}
              posterPath={movie.poster_path}
              rating={movie.vote_average}
              year={movie.release_date ? movie.release_date.split('-')[0] : (movie.first_air_date ? movie.first_air_date.split('-')[0] : '')}
            />
          ))}
        </CarouselRow>

        <CarouselRow title="Trending TV Shows">
          {getList(trendingTv, []).map((show: any) => (
            <PosterCard 
              key={show.id}
              id={show.id}
              title={show.name || show.title}
              posterPath={show.poster_path}
              rating={show.vote_average}
              year={show.first_air_date ? show.first_air_date.split('-')[0] : ''}
            />
          ))}
        </CarouselRow>

        <CarouselRow title="Top Rated Movies">
          {getList(topRated, []).map((movie: any) => (
            <PosterCard 
              key={movie.id}
              id={movie.id}
              title={movie.title}
              posterPath={movie.poster_path}
              rating={movie.vote_average}
              year={movie.release_date ? movie.release_date.split('-')[0] : ''}
            />
          ))}
        </CarouselRow>

        <CarouselRow title="Now Playing in Theaters">
          {getList(nowPlaying, []).map((movie: any) => (
            <PosterCard 
              key={movie.id}
              id={movie.id}
              title={movie.title}
              posterPath={movie.poster_path}
              rating={movie.vote_average}
              year={movie.release_date ? movie.release_date.split('-')[0] : ''}
            />
          ))}
        </CarouselRow>

        <CarouselRow title="Upcoming Releases">
          {getList(upcoming, []).map((movie: any) => (
            <PosterCard 
              key={movie.id}
              id={movie.id}
              title={movie.title}
              posterPath={movie.poster_path}
              rating={movie.vote_average}
              year={movie.release_date ? movie.release_date.split('-')[0] : ''}
            />
          ))}
        </CarouselRow>

        <CarouselRow title="Popular Anime">
          {getList(anime, []).map((show: any) => (
            <PosterCard 
              key={show.id}
              id={show.id}
              title={show.name}
              posterPath={show.poster_path}
              rating={show.vote_average}
              year={show.first_air_date ? show.first_air_date.split('-')[0] : ''}
            />
          ))}
        </CarouselRow>

        <CarouselRow title="Action & Adventure">
          {getList(action, []).map((movie: any) => (
            <PosterCard 
              key={movie.id}
              id={movie.id}
              title={movie.title}
              posterPath={movie.poster_path}
              rating={movie.vote_average}
              year={movie.release_date ? movie.release_date.split('-')[0] : ''}
            />
          ))}
        </CarouselRow>
      </div>
    </main>
  );
}
