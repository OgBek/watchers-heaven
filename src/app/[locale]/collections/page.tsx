'use client';
import { useState, useEffect, useMemo } from 'react';
import { ApiGateway } from '@/lib/api/gateway';
import { Folder, ArrowLeft, Loader, Search, X, Film, ArrowRight } from 'lucide-react';
import { PosterCard } from '@/components/cards/PosterCard';

const COLLECTION_IDS = [
  10,      // Star Wars
  1241,    // Harry Potter
  86311,   // The Avengers
  119,     // Lord of the Rings
  263,     // The Dark Knight
  265,     // The Godfather
  531241,  // Spider-Man (MCU) -> Intercepted to merge Tobey, Andrew & Spider-Verse!
  10194,   // Toy Story
  328,     // Jurassic Park
  121938,  // The Hobbit
  131635,  // The Hunger Games
  9485,    // Fast & Furious
  295,     // Pirates of the Caribbean
  8650,    // Transformers
  87359,   // Mission: Impossible
  84,      // Indiana Jones
  2150,    // Shrek
  33514,   // Twilight
  86066,   // Despicable Me
  77816,   // Kung Fu Panda
  8354,    // Ice Age
  131296,  // Iron Man Collection
  131292,  // Captain America Collection
  131295,  // Thor Collection
  2344,    // The Matrix Collection
  528,     // The Terminator Collection
  1570,    // Die Hard Collection
  40016,   // John Wick Collection
  8091,    // Alien Collection
  333339,  // Kingsman Collection
  9028,    // The Mummy Collection
  1575,    // Rocky Collection
].filter(Boolean);

export default function CollectionsPage() {
  const [collections, setCollections] = useState<any[]>([]);
  const [selectedCol, setSelectedCol] = useState<any | null>(null);
  const [loadingList, setLoadingList] = useState(false);

  // Search & Pagination for the collections list itself
  const [searchQuery, setSearchQuery] = useState('');
  const [listPage, setListPage] = useState(1);
  const collectionsPerPage = 18;

  // Pagination for the parts inside a selected collection
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
              if (id === 531241) {
                 // Intercept Spider-Man and merge Tobey (556), Andrew (125574), Tom (531241), and Spider-Verse (558216)
                 const [mcu, tobey, andrew, verse] = await Promise.all([
                   ApiGateway.fetchTmdb<any>('/collection/531241').catch(() => null),
                   ApiGateway.fetchTmdb<any>('/collection/556').catch(() => null),
                   ApiGateway.fetchTmdb<any>('/collection/125574').catch(() => null),
                   ApiGateway.fetchTmdb<any>('/collection/558216').catch(() => null),
                 ]);
                
                const allParts = [
                  ...(tobey?.parts || []),
                  ...(andrew?.parts || []),
                  ...(mcu?.parts || []),
                  ...(verse?.parts || []),
                ];

                // Remove duplicate movies (e.g. No Way Home appearing in multiple listings if any)
                const uniquePartsMap = new Map();
                allParts.forEach(item => {
                  if (item && item.id) {
                    uniquePartsMap.set(item.id, item);
                  }
                });
                const uniqueParts = Array.from(uniquePartsMap.values());

                // Sort chronologically by release date
                uniqueParts.sort((a: any, b: any) => {
                  const dateA = a.release_date || '0';
                  const dateB = b.release_date || '0';
                  return dateA.localeCompare(dateB);
                });

                return {
                  id: 531241,
                  name: "Spider-Man Collection",
                  overview: "The complete Spider-Man cinematic franchise. Includes Tobey Maguire's original trilogy, Andrew Garfield's Amazing Spider-Man duology, Tom Holland's MCU trilogy, and the animated Spider-Verse movies.",
                  poster_path: mcu?.poster_path || tobey?.poster_path || "",
                  backdrop_path: mcu?.backdrop_path || tobey?.backdrop_path || "",
                  parts: uniqueParts
                };
              }
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

  // Filter collections list by search query
  const filteredCollections = useMemo(() => {
    return collections.filter(col => 
      col.name?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [collections, searchQuery]);

  // Paginated list of collections
  const totalListPages = Math.ceil(filteredCollections.length / collectionsPerPage);
  const paginatedCollections = useMemo(() => {
    const start = (listPage - 1) * collectionsPerPage;
    return filteredCollections.slice(start, start + collectionsPerPage);
  }, [filteredCollections, listPage]);

  // Reset page when search changes
  useEffect(() => {
    setListPage(1);
  }, [searchQuery]);

  // Paginated parts calculation for the selected collection detail
  const parts = selectedCol?.parts || [];
  const totalPages = Math.ceil(parts.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedParts = parts.slice(startIndex, startIndex + itemsPerPage);

  return (
    <div className="min-h-screen py-10 px-4 md:px-8 bg-[var(--color-main)] text-slate-800 dark:text-slate-100 transition-colors duration-300">
      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* Header */}
        {selectedCol ? (
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setSelectedCol(null)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-350 text-xs font-bold hover:bg-slate-50 dark:hover:bg-slate-800 transition shadow-sm active:scale-95"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Back to Collections
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            <div>
              <h1 className="text-3xl font-extrabold text-slate-800 dark:text-white flex items-center gap-2">
                <Folder className="w-8 h-8 text-accent-blue" />
                Movie Collections
              </h1>
              <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
                Explore curated movie collections and legendary franchises
              </p>
            </div>

            {/* Search Bar for Collections list */}
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-400 dark:text-slate-500" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search movie collections by name..."
                className="w-full pl-11 pr-10 py-3 rounded-2xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 text-sm text-slate-800 dark:text-slate-200 placeholder:text-slate-400 dark:placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-accent-blue/30 focus:border-accent-blue/50 transition-all shadow-sm"
              />
              {searchQuery && (
                <button 
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
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
        ) : paginatedCollections.length > 0 ? (
          /* Predefined Collections Poster Cards list */
          <div className="space-y-8 animate-fadeIn">
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
              {paginatedCollections.map((col) => (
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
                    <span className="text-[9px] font-bold text-blue-450 dark:text-blue-400 uppercase tracking-wider mt-1 block">
                      {col.parts?.length || 0} Parts
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* List Pagination */}
            {totalListPages > 1 && (
              <div className="flex items-center justify-center gap-3 pt-6">
                <button
                  onClick={() => setListPage(prev => Math.max(prev - 1, 1))}
                  disabled={listPage === 1}
                  className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-xl border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-350 hover:bg-slate-50 dark:hover:bg-slate-800/50 disabled:opacity-40 disabled:pointer-events-none transition shadow-sm bg-white dark:bg-slate-900 active:scale-95"
                >
                  Previous
                </button>
                
                <div className="flex items-center gap-1">
                  {Array.from({ length: totalListPages }, (_, i) => i + 1).map(pageNum => (
                    <button
                      key={pageNum}
                      onClick={() => setListPage(pageNum)}
                      className={`w-8 h-8 rounded-xl text-xs font-bold transition-all ${
                        pageNum === listPage
                          ? 'bg-accent-blue text-white shadow-md shadow-accent-blue/20'
                          : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                      }`}
                    >
                      {pageNum}
                    </button>
                  ))}
                </div>

                <button
                  onClick={() => setListPage(prev => Math.min(prev + 1, totalListPages))}
                  disabled={listPage === totalListPages}
                  className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-xl border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-350 hover:bg-slate-50 dark:hover:bg-slate-800/50 disabled:opacity-40 disabled:pointer-events-none transition shadow-sm bg-white dark:bg-slate-900 active:scale-95"
                >
                  Next
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-20 text-slate-400 dark:text-slate-600">
            No movie collections found matching search.
          </div>
        )}
      </div>
    </div>
  );
}
