import { HeroFeature } from '@/components/hero/HeroFeature';
import { CarouselRow } from '@/components/cards/CarouselRow';
import { PosterCard } from '@/components/cards/PosterCard';

const recommendationMovies = [
  { id: 1, title: 'The Batman', posterPath: '/74xTEgt7R36Fpooo50r9T25onhq.jpg', rating: 7.7, year: '2022' },
  { id: 2, title: 'Inside Out 2', posterPath: '/vpnVM9B6NMmQpWeZvzRxHXh2kM2.jpg', rating: 7.7, year: '2024' },
  { id: 3, title: 'Deadpool & Wolverine', posterPath: '/8cdWjvZQUExUUTzyp4t6EDMubfO.jpg', rating: 7.7, year: '2024' },
  { id: 4, title: 'Furiosa', posterPath: '/iADOJ8Zymht2JPMoy3R7xceZprc.jpg', rating: 7.9, year: '2024' },
  { id: 5, title: 'Godzilla x Kong', posterPath: '/tMefBSflR6PGQLvLuPEoBiY91AW.jpg', rating: 7.2, year: '2024' },
  { id: 6, title: 'Kingdom of the Apes', posterPath: '/gKkl37BQuKTanygYQG1pyYgLVgf.jpg', rating: 6.8, year: '2024' },
  { id: 7, title: 'Dune: Part Two', posterPath: '/1pdfLvkbY9ohJlCjQH2JGqqUT1e.jpg', rating: 8.3, year: '2024' },
  { id: 8, title: 'Bad Boys: Ride or Die', posterPath: '/nP6RliHjxsz4irTKsxe8FRhKZYl.jpg', rating: 7.0, year: '2024' },
];

export default function Home() {
  return (
    <main className="min-h-screen">
      <HeroFeature 
        tmdbId="1064028" 
        title="Michael" 
        synopsis="A biopic about the King of Pop."
        backdropPath="/yDHYTfA3R0jFYba16ZBRWUP1lNl.jpg"
        genres={["Drama", "Music", "Biography"]}
      />
      
      <div className="pb-20 mt-12">
        <CarouselRow title="Recommendation">
          {recommendationMovies.map((movie) => (
            <PosterCard 
              key={movie.id}
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
