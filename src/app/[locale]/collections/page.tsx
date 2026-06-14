'use client';
import { useState, useEffect } from 'react';
import { ApiGateway } from '@/lib/api/gateway';
import { FolderOpen, ArrowLeft, Loader, Star } from 'lucide-react';
import { PosterCard } from '@/components/cards/PosterCard';

interface CollectionItem {
  id: number;
  name: string;
  backdrop: string;
  description: string;
}

const PREDEFINED_COLLECTIONS: CollectionItem[] = [
  {
    id: 10,
    name: 'Star Wars Saga',
    backdrop: '/sp158I1V0l5Wp0sCg5n6dM9c19b.jpg',
    description: 'The epic space opera franchise created by George Lucas.'
  },
  {
    id: 1241,
    name: 'Harry Potter Collection',
    backdrop: '/u52XL4y570ui4kE7C6Acl03V1sV.jpg',
    description: 'The complete cinematic adventure of the Wizarding World.'
  },
  {
    id: 86311,
    name: 'The Avengers Collection',
    backdrop: '/mdf5z56q1S6kM75Jz2u1sS5UvXy.jpg',
    description: 'Earth\'s mightiest heroes assemble in the Marvel Cinematic Universe.'
  },
  {
    id: 119,
    name: 'Lord of the Rings',
    backdrop: '/p2G2pA4b41PjP32YlF0N97Cg9e9.jpg',
    description: 'The epic fantasy adventure set in Middle-earth, directed by Peter Jackson.'
  },
  {
    id: 263,
    name: 'The Dark Knight Trilogy',
    backdrop: '/xfK16851L17mXtUo4fK700j19b.jpg',
    description: 'Christopher Nolan\'s gritty, acclaimed take on the Batman saga.'
  },
  {
    id: 9481,
    name: 'Fast & Furious Saga',
    backdrop: '/z8O5g6O5U08s15j4dE7C97VvXy.jpg',
    description: 'The high-octane action film series centering on illegal street racing and heists.'
  },
  {
    id: 531241,
    name: 'Spider-Man Collection',
    backdrop: '/kZzZ4u57O6kM85j3dE7C97VvXy.jpg',
    description: 'The web-slinging adventures of Peter Parker across multiple dimensions.'
  },
  {
    id: 10194,
    name: 'Toy Story Collection',
    backdrop: '/3b5z56q1S6kM75Jz2u1sS5UvXy.jpg',
    description: 'Pixar\'s classic animated series following the secret lives of toys.'
  }
];

export default function CollectionsPage() {
  const [selectedCol, setSelectedCol] = useState<CollectionItem | null>(null);
  const [collectionData, setCollectionData] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!selectedCol) {
      setCollectionData(null);
      return;
    }

    async function loadCollectionDetails() {
      setLoading(true);
      try {
        const data = await ApiGateway.fetchTmdb<any>(`/collection/${selectedCol.id}`);
        setCollectionData(data);
      } catch (err) {
        console.error('Failed to load collection details:', err);
      } finally {
        setLoading(false);
      }
    }
    loadCollectionDetails();
  }, [selectedCol]);

  return (
    <div className="min-h-screen py-10 px-4 md:px-8 bg-[var(--color-main)]">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Back navigation or main header */}
        {selectedCol ? (
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setSelectedCol(null)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 text-slate-700 dark:text-slate-350 text-xs font-bold hover:bg-slate-50 dark:hover:bg-slate-800 transition shadow-sm"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Back to Collections
            </button>
          </div>
        ) : (
          <div>
            <h1 className="text-3xl font-extrabold text-slate-800 dark:text-white flex items-center gap-2">
              <FolderOpen className="w-8 h-8 text-[#007bff]" />
              Movie Collections
            </h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Explore curated movie collections and legendary franchises</p>
          </div>
        )}

        {/* Content Section */}
        {selectedCol ? (
          <div className="space-y-8 animate-fadeIn">
            {/* Banner details */}
            <div className="relative w-full h-[30vh] min-h-[200px] rounded-[2rem] overflow-hidden bg-slate-800 shadow-xl border border-slate-100 dark:border-slate-800">
              {collectionData?.backdrop_path ? (
                <img 
                  src={`https://image.tmdb.org/t/p/original${collectionData.backdrop_path}`} 
                  alt={selectedCol.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-slate-900 flex items-center justify-center">
                  <FolderOpen className="w-16 h-16 text-slate-750" />
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent flex flex-col justify-end p-6 md:p-8">
                <h2 className="text-2xl md:text-3xl font-black text-white">{collectionData?.name || selectedCol.name}</h2>
                <p className="text-xs md:text-sm text-slate-300 max-w-2xl mt-2 leading-relaxed">
                  {collectionData?.overview || selectedCol.description}
                </p>
              </div>
            </div>

            {loading ? (
              <div className="flex justify-center py-20">
                <Loader className="w-8 h-8 animate-spin text-[#007bff]" />
              </div>
            ) : collectionData?.parts?.length > 0 ? (
              <div className="space-y-4">
                <h3 className="text-xs font-black tracking-[0.25em] text-slate-400 dark:text-slate-500 uppercase">
                  Movies in this collection
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                  {collectionData.parts.map((item: any) => (
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
              </div>
            ) : (
              <div className="text-center py-20 text-slate-400">
                No movies found in this collection.
              </div>
            )}
          </div>
        ) : (
          /* Collections Cards list */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {PREDEFINED_COLLECTIONS.map((col) => (
              <div
                key={col.id}
                onClick={() => setSelectedCol(col)}
                className="group relative aspect-[1.8/1] rounded-2xl overflow-hidden cursor-pointer shadow-md hover:shadow-xl border border-slate-100 dark:border-slate-800/80 transition-all duration-300 hover:-translate-y-1 bg-slate-900"
              >
                {/* Backdrop cover */}
                <img 
                  src={`https://image.tmdb.org/t/p/w780${col.backdrop}`} 
                  alt={col.name}
                  className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:scale-102 group-hover:opacity-75 transition duration-500"
                  onError={(e) => {
                    // Fallback to solid color
                    e.currentTarget.style.display = 'none';
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent flex flex-col justify-end p-4">
                  <h3 className="text-base font-black text-white drop-shadow-md">{col.name}</h3>
                  <p className="text-[10px] text-slate-300 mt-1 line-clamp-2 leading-relaxed opacity-0 group-hover:opacity-100 transition duration-300">
                    {col.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
