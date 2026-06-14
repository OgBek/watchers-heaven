'use client';
import { useState, useEffect } from 'react';
import { ApiGateway } from '@/lib/api/gateway';
import { Folder, ArrowLeft, Loader, Star, Film } from 'lucide-react';
import { PosterCard } from '@/components/cards/PosterCard';

const COLLECTION_IDS = [10, 1241, 86311, 119, 263, 9481, 531241, 10194, 328, 121938, 131635, 9485, 295, 8650];

export default function CollectionsPage() {
  const [collections, setCollections] = useState<any[]>([]);
  const [selectedCol, setSelectedCol] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingList, setLoadingList] = useState(false);

  // Pagination for collection parts
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  // Load all predefined collections on mount
  useEffect(() => {
    async function loadCollectionsList() {
      setLoadingList(true);
      try {
        const data = await Promise.all(
          COLLECTION_IDS.map(async (id) => {
            try {
              return await ApiGateway.fetchTmdb<any>(`/collection/${id}`);
            } catch {
              return null;
            }
          })
        );
        setCollections(data.filter(Boolean));
      } catch (err) {
        console.error('Failed to load collections list', err);
      } finally {
        setLoadingList(false);
      }
    }
    loadCollectionsList();
  }, []);

  const handleSelectCollection = (col: any) => {
    setSelectedCol(col);
    setCurrentPage(1);
  };

  // Paginated parts calculation
  const parts = selectedCol?.parts || [];
  const totalPages = Math.ceil(parts.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedParts = parts.slice(startIndex, startIndex + itemsPerPage);

  return (
    <div className="min-h-screen py-10 px-4 md:px-8 bg-[var(--color-main)] text-slate-800 dark:text-slate-100 transition-colors duration-300">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Header */}
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
              <Folder className="w-8 h-8 text-accent-blue" />
              Movie Collections
            </h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Explore curated movie collections and legendary franchises</p>
          </div>
        )}

        {/* Collections List or Detail View */}
        {selectedCol ? (
          <div className="space-y-8 animate-fadeIn">
            {/* Banner details */}
            <div className="relative w-full h-[30vh] min-h-[200px] rounded-[2rem] overflow-hidden bg-slate-800 shadow-xl border border-slate-100 dark:border-slate-800">
              {selectedCol.backdrop_path ? (
                <img 
                  src={`https://image.tmdb.org/t/p/original${selectedCol.backdrop_path}`} 
                  alt={selectedCol.name}
                  className="w-full h-full object-cover opacity-75"
                />
              ) : (
                <div className="w-full h-full bg-slate-900 flex items-center justify-center">
                  <Folder className="w-16 h-16 text-slate-750" />
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/50 to-transparent flex flex-col justify-end p-6 md:p-8">
                <h2 className="text-2xl md:text-3xl font-black text-white">{selectedCol.name}</h2>
                <p className="text-xs md:text-sm text-slate-300 max-w-2xl mt-2 leading-relaxed">
                  {selectedCol.overview || 'Explore all movies inside this cinematic collection.'}
                </p>
              </div>
            </div>

            {/* Movies grid with pagination */}
            {paginatedParts.length > 0 ? (
              <div className="space-y-6">
                <h3 className="text-xs font-black tracking-[0.25em] text-slate-400 dark:text-slate-500 uppercase">
                  Movies in this collection (Page {currentPage} of {totalPages})
                </h3>
                
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                  {paginatedParts.map((item: any) => (
                    <PosterCard
                      key={item.id}
                      id={item.id}
                      title={item.title}
                      posterPath={item.poster_path}
                      rating={item.vote_average}
                      year={item.release_date ? item.release_date.split('-')[0] : ''}
                      type="movie"
                    />
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-center gap-4 pt-6">
                    <button
                      onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                      disabled={currentPage === 1}
                      className="px-4 py-2 text-xs font-bold rounded-xl border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-350 hover:bg-slate-50 dark:hover:bg-slate-800/50 disabled:opacity-50 disabled:pointer-events-none transition shadow-sm bg-white dark:bg-slate-900"
                    >
                      Previous
                    </button>
                    <span className="text-xs font-black text-slate-500 dark:text-slate-400">
                      Page {currentPage} of {totalPages}
                    </span>
                    <button
                      onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                      disabled={currentPage === totalPages}
                      className="px-4 py-2 text-xs font-bold rounded-xl border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-350 hover:bg-slate-50 dark:hover:bg-slate-800/50 disabled:opacity-50 disabled:pointer-events-none transition shadow-sm bg-white dark:bg-slate-900"
                    >
                      Next
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-20 text-slate-400">
                No movies found in this collection.
              </div>
            )}
          </div>
        ) : loadingList ? (
          <div className="flex justify-center py-20">
            <Loader className="w-8 h-8 animate-spin text-accent-blue" />
          </div>
        ) : (
          /* Predefined Collections Poster Cards list */
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
            {collections.map((col) => (
              <div
                key={col.id}
                onClick={() => handleSelectCollection(col)}
                className="group relative aspect-[2/3] rounded-2xl overflow-hidden cursor-pointer shadow-md hover:shadow-xl border border-slate-100 dark:border-slate-850 transition-all duration-300 hover:-translate-y-1.5 bg-slate-900"
              >
                {/* Official Collection Poster */}
                {col.poster_path ? (
                  <img 
                    src={`https://image.tmdb.org/t/p/w500${col.poster_path}`} 
                    alt={col.name}
                    className="absolute inset-0 w-full h-full object-cover transition duration-500 group-hover:scale-103"
                  />
                ) : (
                  <div className="absolute inset-0 flex flex-col items-center justify-center p-4">
                    <Film className="w-10 h-10 text-slate-700 mb-2" />
                    <span className="text-xs text-slate-400 font-bold text-center">{col.name}</span>
                  </div>
                )}
                
                {/* Overlay details */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/10 to-transparent flex flex-col justify-end p-4 z-10">
                  <h3 className="text-xs font-black text-white drop-shadow-md leading-tight line-clamp-2">{col.name}</h3>
                  <span className="text-[9px] font-bold text-blue-400 uppercase tracking-wider mt-1 block">
                    {col.parts?.length || 0} Parts
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
