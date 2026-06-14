import { HeroFeature } from '@/components/hero/HeroFeature';
import { CarouselRow } from '@/components/cards/CarouselRow';
import { PosterCard } from '@/components/cards/PosterCard';

// Real TMDB IDs for recommendation/trending categories
const recommendationMovies = [
  { id: 533535, title: 'Deadpool & Wolverine', posterPath: '/8cdWjvZQUExUUTzyp4t6EDMubfO.jpg', rating: 7.7, year: '2024' },
  { id: 693134, title: 'Dune: Part Two', posterPath: '/1pdfLvkbY9ohJlCjQH2JGqqUT1e.jpg', rating: 8.3, year: '2024' },
  { id: 1022789, title: 'Inside Out 2', posterPath: '/vpnVM9B6NMmQpWeZvzRxHXh2kM2.jpg', rating: 7.7, year: '2024' },
  { id: 786892, title: 'Furiosa', posterPath: '/iADOJ8Zymht2JPMoy3R7xceZprc.jpg', rating: 7.9, year: '2024' },
  { id: 823464, title: 'Godzilla x Kong', posterPath: '/tMefBSflR6PGQLvLuPEoBiY91AW.jpg', rating: 7.2, year: '2024' },
  { id: 653346, title: 'Kingdom of the Apes', posterPath: '/gKkl37BQuKTanygYQG1pyYgLVgf.jpg', rating: 6.8, year: '2024' },
  { id: 573435, title: 'Bad Boys: Ride or Die', posterPath: '/nP6RliHjxsz4irTKsxe8FRhKZYl.jpg', rating: 7.0, year: '2024' },
];

const trendingTV = [
  { id: 1396, title: 'Breaking Bad', posterPath: '/ggFHVNu6YYI5L9pCfOacjizRGt.jpg', rating: 8.9, year: '2008' },
  { id: 1399, title: 'Game of Thrones', posterPath: '/1XS1oqL89opfnbLl8WnZY1O1uJx.jpg', rating: 8.4, year: '2011' },
  { id: 94997, title: 'House of the Dragon', posterPath: '/z2yahl2uefxDCl0nogcRBstwruJ.jpg', rating: 8.4, year: '2022' },
  { id: 100088, title: 'The Last of Us', posterPath: '/uKvVjHNqB5VmOrdxqAt2F7J78ED.jpg', rating: 8.8, year: '2023' },
  { id: 60625, title: 'Rick and Morty', posterPath: '/cvhNj9eoRBe5SxjCbQTkh05DO5u.jpg', rating: 8.7, year: '2013' },
];

const topRatedMovies = [
  { id: 278, title: 'The Shawshank Redemption', posterPath: '/9cqNcoGLjRfvSIa1o8IlUI7UAMA.jpg', rating: 9.3, year: '1994' },
  { id: 238, title: 'The Godfather', posterPath: '/3bhkrj58Vtu7enYsRolD1fZdja1.jpg', rating: 8.7, year: '1972' },
  { id: 240, title: 'The Godfather Part II', posterPath: '/hek3koDUyRQq7bkV3Ud9IIkVrlU.jpg', rating: 8.6, year: '1974' },
  { id: 155, title: 'The Dark Knight', posterPath: '/qJ2tWzZz6yQZ7FiIvO2slbJmBwy.jpg', rating: 8.5, year: '2008' },
  { id: 496243, title: 'Parasite', posterPath: '/7IiTTwgchoc12gstzfwj7rjO55q.jpg', rating: 8.5, year: '2019' },
  { id: 129, title: 'Spirited Away', posterPath: '/39wmItIWsg5sclJgTy75UI722qV.jpg', rating: 8.5, year: '2001' },
];

const nowPlaying = [
  { id: 1022789, title: 'Inside Out 2', posterPath: '/vpnVM9B6NMmQpWeZvzRxHXh2kM2.jpg', rating: 7.7, year: '2024' },
  { id: 533535, title: 'Deadpool & Wolverine', posterPath: '/8cdWjvZQUExUUTzyp4t6EDMubfO.jpg', rating: 7.7, year: '2024' },
  { id: 823464, title: 'Godzilla x Kong', posterPath: '/tMefBSflR6PGQLvLuPEoBiY91AW.jpg', rating: 7.2, year: '2024' },
  { id: 653346, title: 'Kingdom of the Apes', posterPath: '/gKkl37BQuKTanygYQG1pyYgLVgf.jpg', rating: 6.8, year: '2024' },
  { id: 573435, title: 'Bad Boys: Ride or Die', posterPath: '/nP6RliHjxsz4irTKsxe8FRhKZYl.jpg', rating: 7.0, year: '2024' },
];

const upcomingReleases = [
  { id: 1064028, title: 'Michael', posterPath: '/yDHYTfA3R0jFYba16ZBRWUP1lNl.jpg', rating: 8.0, year: '2025' },
  { id: 917496, title: 'Beetlejuice Beetlejuice', posterPath: '/kKg1F7J8eS16IRv0iI8j48fgR27.jpg', rating: 7.2, year: '2024' },
  { id: 939243, title: 'Sonic the Hedgehog 3', posterPath: '/d5i25Cc1562t2p431jRMXSpacez.jpg', rating: 8.2, year: '2024' },
  { id: 1184918, title: 'The Wild Robot', posterPath: '/9x9hPM8g4i5425g5R4w6t5o715.jpg', rating: 8.6, year: '2024' },
];

const popularAnime = [
  { id: 1429, title: 'Attack on Titan', posterPath: '/hTP1DtLGFamjfu8WqjnuQdP1n0.jpg', rating: 8.6, year: '2013' },
  { id: 114410, title: 'Jujutsu Kaisen', posterPath: '/hFWP5HkbVEe40hrptcgHQIwlsz5.jpg', rating: 8.6, year: '2020' },
  { id: 85937, title: 'Demon Slayer', posterPath: '/xUfRZu2mi8jH6SnDTRKSkcl4B93.jpg', rating: 8.4, year: '2019' },
  { id: 94605, title: 'Arcane', posterPath: '/fqldwxwkkwzkJtUzqVdmzoi2L6v.jpg', rating: 8.7, year: '2021' },
];

const actionAdventure = [
  { id: 299534, title: 'Avengers: Endgame', posterPath: '/or06eDt3qnRclzst4qJZQwEFOgl.jpg', rating: 8.3, year: '2019' },
  { id: 19995, title: 'Avatar', posterPath: '/kyeqWzo2vQUgik1CU2p2sa4866q.jpg', rating: 7.5, year: '2009' },
  { id: 120, title: 'The Lord of the Rings: Fellowship', posterPath: '/6oom5QDNv2DYjH105OpR2r765Sv.jpg', rating: 8.4, year: '2001' },
  { id: 1726, title: 'Iron Man', posterPath: '/78lPOOpaZzwqq7X6ehU14j2n91R.jpg', rating: 7.6, year: '2008' },
];

export default function Home() {
  return (
    <main className="min-h-screen pb-20">
      <HeroFeature 
        tmdbId="1064028" 
        title="Michael" 
        synopsis="A biopic about the King of Pop."
        backdropPath="/yDHYTfA3R0jFYba16ZBRWUP1lNl.jpg"
        genres={["Drama", "Music", "Biography"]}
      />
      
      <div className="mt-8 space-y-4">
        <CarouselRow title="Recommendation">
          {recommendationMovies.map((movie) => (
            <PosterCard 
              key={movie.id}
              id={movie.id}
              title={movie.title}
              posterPath={movie.posterPath}
              rating={movie.rating}
              year={movie.year}
            />
          ))}
        </CarouselRow>

        <CarouselRow title="Trending TV Shows">
          {trendingTV.map((show) => (
            <PosterCard 
              key={show.id}
              id={show.id}
              title={show.title}
              posterPath={show.posterPath}
              rating={show.rating}
              year={show.year}
            />
          ))}
        </CarouselRow>

        <CarouselRow title="Top Rated Movies">
          {topRatedMovies.map((movie) => (
            <PosterCard 
              key={movie.id}
              id={movie.id}
              title={movie.title}
              posterPath={movie.posterPath}
              rating={movie.rating}
              year={movie.year}
            />
          ))}
        </CarouselRow>

        <CarouselRow title="Now Playing in Theaters">
          {nowPlaying.map((movie) => (
            <PosterCard 
              key={movie.id}
              id={movie.id}
              title={movie.title}
              posterPath={movie.posterPath}
              rating={movie.rating}
              year={movie.year}
            />
          ))}
        </CarouselRow>

        <CarouselRow title="Upcoming Releases">
          {upcomingReleases.map((movie) => (
            <PosterCard 
              key={movie.id}
              id={movie.id}
              title={movie.title}
              posterPath={movie.posterPath}
              rating={movie.rating}
              year={movie.year}
            />
          ))}
        </CarouselRow>

        <CarouselRow title="Popular Anime">
          {popularAnime.map((show) => (
            <PosterCard 
              key={show.id}
              id={show.id}
              title={show.title}
              posterPath={show.posterPath}
              rating={show.rating}
              year={show.year}
            />
          ))}
        </CarouselRow>

        <CarouselRow title="Action & Adventure">
          {actionAdventure.map((movie) => (
            <PosterCard 
              key={movie.id}
              id={movie.id}
              title={movie.title}
              posterPath={movie.posterPath}
              rating={movie.rating}
              year={movie.year}
            />
          ))}
        </CarouselRow>
      </div>
    </main>
  );
}
