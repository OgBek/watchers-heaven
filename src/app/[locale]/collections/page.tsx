'use client';
import { useState, useEffect, useMemo, useCallback } from 'react';
import { ApiGateway } from '@/lib/api/gateway';
import { Folder, ArrowLeft, Loader, Search, X, Film, ArrowRight } from 'lucide-react';
import { PosterCard } from '@/components/cards/PosterCard';

// Static metadata — no API calls needed to display the grid.
// Parts/movies are fetched on-demand when the user clicks a collection.
const COLLECTIONS = [
  { id: 10, name: 'Star Wars' },
  { id: 1241, name: 'Harry Potter' },
  { id: 86311, name: 'The Avengers' },
  { id: 119, name: 'Lord of the Rings' },
  { id: 263, name: 'The Dark Knight' },
  { id: 265, name: 'The Godfather' },
  { id: 531241, name: 'Spider-Man' },
  { id: 10194, name: 'Toy Story' },
  { id: 328, name: 'Jurassic Park' },
  { id: 121938, name: 'The Hobbit' },
  { id: 131635, name: 'The Hunger Games' },
  { id: 9485, name: 'Fast & Furious' },
  { id: 295, name: 'Pirates of the Caribbean' },
  { id: 8650, name: 'Transformers' },
  { id: 87359, name: 'Mission: Impossible' },
  { id: 84, name: 'Indiana Jones' },
  { id: 2150, name: 'Shrek' },
  { id: 33514, name: 'Twilight' },
  { id: 86066, name: 'Despicable Me' },
  { id: 77816, name: 'Kung Fu Panda' },
  { id: 8354, name: 'Ice Age' },
  { id: 131296, name: 'Iron Man' },
  { id: 131292, name: 'Captain America' },
  { id: 131295, name: 'Thor' },
  { id: 2344, name: 'The Matrix' },
  { id: 528, name: 'The Terminator' },
  { id: 1570, name: 'Die Hard' },
  { id: 40016, name: 'John Wick' },
  { id: 8091, name: 'Alien' },
  { id: 333339, name: 'Kingsman' },
  { id: 9028, name: 'The Mummy' },
  { id: 1575, name: 'Rocky' },
  { id: 17042, name: 'Planet of the Apes' },
  { id: 748, name: 'X-Men' },
  { id: 137, name: 'Back to the Future' },
  { id: 87096, name: 'Avatar' },
  { id: 155103, name: 'Jason Bourne' },
  { id: 151, name: 'Star Trek' },
  { id: 304, name: "Ocean's" },
  { id: 115570, name: 'Star Trek Reboot' },
  { id: 94032, name: 'The Hangover' },
  { id: 955, name: 'Men in Black' },
  { id: 468222, name: 'Venom' },
  { id: 126125, name: 'The Conjuring Universe' },
  { id: 1709, name: 'Predator' },
  { id: 284433, name: 'Fifty Shades' },
  { id: 134444, name: 'How to Train Your Dragon' },
  { id: 102225, name: 'The Chronicles of Narnia' },
  { id: 60599, name: 'Night at the Museum' },
  { id: 323208, name: 'The Purge' },
  { id: 103233, name: 'Maze Runner' },
  { id: 228446, name: 'Divergent' },
  { id: 14890, name: 'The Chronicles of Riddick' },
  { id: 5514, name: 'Ghostbusters' },
  { id: 401981, name: 'Fantastic Beasts' },
  { id: 420, name: 'Mad Max' },
  { id: 157336, name: 'Rambo' },
  { id: 30514, name: 'Resident Evil' },
  { id: 9134, name: 'Underworld' },
  { id: 106093, name: 'Step Up' },
  { id: 515243, name: 'The Equalizer' },
  { id: 87118, name: 'Scary Movie' },
  { id: 529892, name: 'Godzilla (MonsterVerse)' },
  { id: 91361, name: 'The Expendables' },
  { id: 176166, name: 'The Smurfs' },
  { id: 2831, name: 'The Mighty Ducks' },
  { id: 144571, name: 'The Croods' },
  { id: 254881, name: 'The Boss Baby' },
  { id: 356860, name: 'Trolls' },
  { id: 416560, name: 'Sing' },
  { id: 436573, name: 'The Secret Life of Pets' },
  { id: 473187, name: 'The Incredibles' },
  { id: 9086, name: 'Madagascar' },
  { id: 61168, name: 'Cars' },
  { id: 86121, name: 'Monsters, Inc.' },
  { id: 459636, name: 'Hotel Transylvania' },
];

// Spider-Man special IDs (merged from multiple sub-collections)
const SPIDERMAN_IDS = [531241, 556, 125574, 558216];

export default function CollectionsPage() {
  // Metadata for the grid — loaded lazily per page (poster_path, backdrop_path, overview, parts count)
  const [metadata, setMetadata] = useState<Record<number, any>>({});
  const [loadingMeta, setLoadingMeta] = useState<Set<number>>(new Set());

  // Selected collection detail (with full parts loaded on click)
  const [selectedCol, setSelectedCol] = useState<any | null>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);

  // Search & Pagination for the collections list
  const [searchQuery, setSearchQuery] = useState('');
  const [listPage, setListPage] = useState(1);
  const collectionsPerPage = 18;

  // Pagination for parts inside a selected collection
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  // Filter collections by search (instant — uses static names)
  const filteredCollections = useMemo(() => {
    if (!searchQuery.trim()) return COLLECTIONS;
    const q = searchQuery.toLowerCase();
    return COLLECTIONS.filter(c => c.name.toLowerCase().includes(q));
  }, [searchQuery]);

  // Paginated list
  const totalListPages = Math.ceil(filteredCollections.length / collectionsPerPage);
  const paginatedCollections = useMemo(() => {
    const start = (listPage - 1) * collectionsPerPage;
    return filteredCollections.slice(start, start + collectionsPerPage);
  }, [filteredCollections, listPage]);

  // Reset page when search changes
  useEffect(() => {
    setListPage(1);
  }, [searchQuery]);

  // ── Lazy-load metadata for the current page of collections ──
  useEffect(() => {
    let cancelled = false;
    const idsToFetch = paginatedCollections
      .map(c => c.id)
      .filter(id => !metadata[id] && !loadingMeta.has(id));

    if (idsToFetch.length === 0) return;

    setLoadingMeta(prev => {
      const next = new Set(prev);
      idsToFetch.forEach(id => next.add(id));
      return next;
    });

    async function loadMeta() {
      for (const id of idsToFetch) {
        if (cancelled) return;
        try {
          if (id === 531241) {
            // Spider-Man: merge multiple sub-collections
            const results = await Promise.all(
              SPIDERMAN_IDS.map(sid =>
                ApiGateway.fetchTmdb<any>(`/collection/${sid}`).catch(() => null)
              )
            );
            const allParts: any[] = [];
            results.forEach(r => { if (r?.parts) allParts.push(...r.parts); });
            const uniqueMap = new Map();
            allParts.forEach(p => { if (p?.id) uniqueMap.set(p.id, p); });
            setMetadata(prev => ({
              ...prev,
              [id]: {
                name: 'Spider-Man Collection',
                overview: 'The complete Spider-Man cinematic franchise.',
                poster_path: results.find(r => r?.poster_path)?.poster_path || '',
                backdrop_path: results.find(r => r?.backdrop_path)?.backdrop_path || '',
                partsCount: uniqueMap.size,
              },
            }));
          } else {
            const data = await ApiGateway.fetchTmdb<any>(`/collection/${id}`);
            if (cancelled) return;
            setMetadata(prev => ({
              ...prev,
              [id]: {
                name: data.name,
                overview: data.overview,
                poster_path: data.poster_path,
                backdrop_path: data.backdrop_path,
                partsCount: data.parts?.length || 0,
              },
            }));
          }
        } catch {
          // Silently skip failed fetches — grid still shows static name
        }
        // Small delay between requests to avoid rate limiting
        await new Promise(r => setTimeout(r, 150));
      }
      if (!cancelled) {
        setLoadingMeta(prev => {
          const next = new Set(prev);
          idsToFetch.forEach(id => next.delete(id));
          return next;
        });
      }
    }
    loadMeta();
    return () => { cancelled = true; };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [listPage, searchQuery]);

  // ── Fetch full collection details when user clicks a collection ──
  const handleSelectCollection = useCallback(async (col: { id: number; name: string }) => {
    setLoadingDetail(true);
    setCurrentPage(1);

    try {
      let fullData: any;

      if (col.id === 531241) {
        // Spider-Man: merge all sub-collections
        const results = await Promise.all(
          SPIDERMAN_IDS.map(sid =>
            ApiGateway.fetchTmdb<any>(`/collection/${sid}`).catch(() => null)
          )
        );
        const allParts: any[] = [];
        results.forEach(r => { if (r?.parts) allParts.push(...r.parts); });
        const uniqueMap = new Map();
        allParts.forEach(p => { if (p?.id) uniqueMap.set(p.id, p); });
        const uniqueParts = Array.from(uniqueMap.values());
        uniqueParts.sort((a: any, b: any) => (a.release_date || '0').localeCompare(b.release_date || '0'));
        fullData = {
          id: 531241,
          name: 'Spider-Man Collection',
          overview: 'The complete Spider-Man cinematic franchise.',
          poster_path: results.find(r => r?.poster_path)?.poster_path || '',
          backdrop_path: results.find(r => r?.backdrop_path)?.backdrop_path || '',
          parts: uniqueParts,
        };
      } else {
        fullData = await ApiGateway.fetchTmdb<any>(`/collection/${col.id}`);
      }

      setSelectedCol(fullData);
    } catch (err) {
      console.error('Failed to load collection details', err);
    } finally {
      setLoadingDetail(false);
    }
  }, []);

  // Paginated parts for the selected collection detail
  const parts = selectedCol?.parts || [];
  const totalPages = Math.ceil(parts.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedParts = parts.slice(startIndex, startIndex + itemsPerPage);

  return (
    <div className="min-h-screen py-10 px-4 md:px-8 bg-[var(--color-main)] text-slate-800 dark:text-slate-100 transition-colors duration-300">
      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* Header */}
        {selectedCol || loadingDetail ? (
          <div className="flex items-center gap-4">
            <button 
              onClick={() => { setSelectedCol(null); setLoadingDetail(false); }}
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold hover:bg-slate-50 dark:hover:bg-slate-800 transition shadow-sm active:scale-95"
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

            {/* Search Bar */}
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-400 dark:text-slate-500" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search movie collections by name..."
                className="w-full pl-11 pr-10 py-3 rounded-2xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-700 text-sm text-slate-800 dark:text-slate-200 placeholder:text-slate-400 dark:placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-accent-blue/30 focus:border-accent-blue/50 transition-all shadow-sm"
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

        {/* Detail Loading State */}
        {loadingDetail && !selectedCol && (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <Loader className="w-8 h-8 animate-spin text-accent-blue" />
            <span className="text-sm font-semibold text-slate-500 dark:text-slate-400">Loading collection movies...</span>
          </div>
        )}

        {/* Collections Detail View */}
        {selectedCol ? (
          <div className="space-y-8 animate-fadeIn">
            {/* Banner */}
            <div className="relative w-full h-[30vh] min-h-[200px] rounded-[2rem] overflow-hidden bg-slate-800 shadow-xl border border-slate-100 dark:border-slate-700">
              {selectedCol.backdrop_path ? (
                <img 
                  src={`https://image.tmdb.org/t/p/original${selectedCol.backdrop_path}`} 
                  alt={selectedCol.name}
                  className="w-full h-full object-cover opacity-75"
                />
              ) : (
                <div className="w-full h-full bg-slate-900 flex items-center justify-center">
                  <Folder className="w-16 h-16 text-slate-700" />
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
                      className="px-4 py-2 text-xs font-bold rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/60 disabled:opacity-50 disabled:pointer-events-none transition shadow-sm bg-white dark:bg-slate-900/80"
                    >
                      Previous
                    </button>
                    <span className="text-xs font-black text-slate-500 dark:text-slate-400">
                      Page {currentPage} of {totalPages}
                    </span>
                    <button
                      onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                      disabled={currentPage === totalPages}
                      className="px-4 py-2 text-xs font-bold rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/60 disabled:opacity-50 disabled:pointer-events-none transition shadow-sm bg-white dark:bg-slate-900/80"
                    >
                      Next
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-20 text-slate-400 dark:text-slate-500">
                No movies found in this collection.
              </div>
            )}
          </div>
        ) : !loadingDetail && paginatedCollections.length > 0 ? (
          /* Collections Grid — shows instantly using static names */
          <div className="space-y-8 animate-fadeIn">
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
              {paginatedCollections.map((col) => {
                const meta = metadata[col.id];
                const posterPath = meta?.poster_path;
                const partsCount = meta?.partsCount;
                const isLoading = loadingMeta.has(col.id);

                return (
                  <div
                    key={col.id}
                    onClick={() => handleSelectCollection(col)}
                    className="group relative aspect-[2/3] rounded-2xl overflow-hidden cursor-pointer shadow-md hover:shadow-xl border border-slate-100 dark:border-slate-700 transition-all duration-300 hover:-translate-y-1.5 bg-slate-900"
                  >
                    {/* Poster — shows once metadata loads, fallback shows name */}
                    {posterPath ? (
                      <img 
                        src={`https://image.tmdb.org/t/p/w500${posterPath}`} 
                        alt={col.name}
                        className="absolute inset-0 w-full h-full object-cover transition duration-500 group-hover:scale-103"
                      />
                    ) : (
                      <div className="absolute inset-0 flex flex-col items-center justify-center p-4">
                        {isLoading ? (
                          <Loader className="w-6 h-6 animate-spin text-slate-600 dark:text-slate-500" />
                        ) : (
                          <Film className="w-10 h-10 text-slate-600 dark:text-slate-500 mb-2" />
                        )}
                        <span className="text-xs text-slate-400 dark:text-slate-400 font-bold text-center mt-1">{col.name}</span>
                      </div>
                    )}
                    
                    {/* Overlay — always show name, parts count when available */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/10 to-transparent flex flex-col justify-end p-4 z-10">
                      <h3 className="text-xs font-black text-white drop-shadow-md leading-tight line-clamp-2">{col.name}</h3>
                      {partsCount !== undefined ? (
                        <span className="text-[9px] font-bold text-blue-400 dark:text-blue-400 uppercase tracking-wider mt-1 block">
                          {partsCount} Parts
                        </span>
                      ) : isLoading ? (
                        <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider mt-1 block">Loading...</span>
                      ) : null}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* List Pagination */}
            {totalListPages > 1 && (
              <div className="flex items-center justify-center gap-3 pt-6">
                <button
                  onClick={() => setListPage(prev => Math.max(prev - 1, 1))}
                  disabled={listPage === 1}
                  className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/60 disabled:opacity-40 disabled:pointer-events-none transition shadow-sm bg-white dark:bg-slate-900/80 active:scale-95"
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
                  className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/60 disabled:opacity-40 disabled:pointer-events-none transition shadow-sm bg-white dark:bg-slate-900/80 active:scale-95"
                >
                  Next
                </button>
              </div>
            )}
          </div>
        ) : !loadingDetail ? (
          <div className="text-center py-20 text-slate-400 dark:text-slate-600">
            No movie collections found matching search.
          </div>
        ) : null}
      </div>
    </div>
  );
}
