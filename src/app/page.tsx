import { HeroFeature } from '@/components/hero/HeroFeature';

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
      
      <section className="w-full max-w-7xl mx-auto pt-12 px-6 lg:px-12 pb-32">
         <h2 className="text-[length:var(--text-h2)] font-semibold mb-6 text-[var(--color-text-primary)]">Trending Now</h2>
         <div className="h-80 w-full glass rounded-[var(--radius-md)] flex items-center justify-center text-[var(--color-text-muted)]">
            Media Carousel Prototype
         </div>
      </section>
    </main>
  );
}
