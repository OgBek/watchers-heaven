import { HeroFeature } from '@/components/hero/HeroFeature';
import { CarouselRow } from '@/components/cards/CarouselRow';
import { PosterCard } from '@/components/cards/PosterCard';

// Dummy data for testing the UI
const trendingMovies = [
  { id: 1, title: 'Dune: Part Two', posterPath: '/1pdfLvkbY9ohJlCjQH2JGqqUT1e.jpg', rating: 8.3, year: '2024' },
  { id: 2, title: 'Furiosa: A Mad Max Saga', posterPath: '/iADOJ8Zymht2JPMoy3R7xceZprc.jpg', rating: 7.9, year: '2024' },
  { id: 3, title: 'Godzilla x Kong: The New Empire', posterPath: '/tMefBSflR6PGQLvLuPEoBiY91AW.jpg', rating: 7.2, year: '2024' },
  { id: 4, title: 'Kingdom of the Planet of the Apes', posterPath: '/gKkl37BQuKTanygYQG1pyYgLVgf.jpg', rating: 6.8, year: '2024' },
  { id: 5, title: 'Inside Out 2', posterPath: '/vpnVM9B6NMmQpWeZvzRxHXh2kM2.jpg', rating: 7.7, year: '2024' },
  { id: 6, title: 'Bad Boys: Ride or Die', posterPath: '/nP6RliHjxsz4irTKsxe8FRhKZYl.jpg', rating: 7.0, year: '2024' },
];

const trendingAnime = [
  { id: 101, title: 'Jujutsu Kaisen', posterPath: '/hFWP5HkbVEe40hrptcgHQIwlsz5.jpg', rating: 8.6, year: '2020' },
  { id: 102, title: 'Demon Slayer', posterPath: '/xUfRZu2mi8jH6SnDTRKSkcl4B93.jpg', rating: 8.4, year: '2019' },
  { id: 103, title: 'Solo Leveling', posterPath: '/geCRueVbNj0teVKNBS0zDcwA37P.jpg', rating: 8.3, year: '2024' },
  { id: 104, title: 'Attack on Titan', posterPath: '/8jOWn3GDO02O5rW35I1mKntf690.jpg', rating: 8.9, year: '2013' },
  { id: 105, title: 'One Piece', posterPath: '/fcZNmbD9E4a7q1kQdE2S8E1B9P2.jpg', rating: 8.7, year: '1999' },
  { id: 106, title: 'Spy x Family', posterPath: '/wffZ1lS5pD6054k0yI4IItVp1vG.jpg', rating: 8.4, year: '2022' },
];

export default function Home() {
  return (
    <main className="min-h-screen">
      <HeroFeature 
        tmdbId="533535" 
        title="Deadpool & Wolverine" 
        synopsis="A listless Wade Wilson toils away in civilian life with his days as the morally flexible mercenary, Deadpool, behind him. But when his homeworld faces an existential threat, Wade must reluctantly suit-up again with an even more reluctant Wolverine."
        backdropPath="/yDHYTfA3R0jFYba16ZBRWUP1lNl.jpg"
        genres={["Action", "Comedy", "Science Fiction"]}
      />
      
      <div className="pb-32 -mt-16 relative z-20">
        <CarouselRow title="Trending Now">
          {trendingMovies.map((movie) => (
            <PosterCard 
              key={movie.id}
              title={movie.title}
              posterPath={movie.posterPath}
              rating={movie.rating}
              year={movie.year}
            />
          ))}
        </CarouselRow>

        <CarouselRow title="Anime Spotlight">
          {trendingAnime.map((anime) => (
            <PosterCard 
              key={anime.id}
              title={anime.title}
              posterPath={anime.posterPath}
              rating={anime.rating}
              year={anime.year}
            />
          ))}
        </CarouselRow>
      </div>
    </main>
  );
}
