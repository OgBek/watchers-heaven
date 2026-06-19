'use client';
import { useState, useEffect, useMemo, useCallback } from 'react';
import { ApiGateway } from '@/lib/api/gateway';
import { Folder, ArrowLeft, Loader, Search, X, Film, AlertCircle } from 'lucide-react';
import { PosterCard } from '@/components/cards/PosterCard';

// Static list of collection IDs + names
const COLLECTIONS = [
  // ── Sci-Fi & Action Blockbusters ──
  { id: 10, name: 'Star Wars' },
  { id: 86311, name: 'The Avengers' },
  { id: 131296, name: 'Iron Man' },
  { id: 131292, name: 'Captain America' },
  { id: 131295, name: 'Thor' },
  { id: 87096, name: 'Avatar' },
  { id: 2344, name: 'The Matrix' },
  { id: 263, name: 'The Dark Knight' },
  { id: 748, name: 'X-Men' },
  { id: 531241, name: 'Spider-Man' },
  { id: 9485, name: 'Fast & Furious' },
  { id: 87359, name: 'Mission: Impossible' },
  { id: 40016, name: 'John Wick' },
  { id: 8091, name: 'Alien' },
  { id: 528, name: 'The Terminator' },
  { id: 422834, name: 'Ant-Man' },
  { id: 131360, name: 'Doctor Strange' },
  { id: 573436, name: 'Black Panther' },
  { id: 624090, name: 'Guardians of the Galaxy' },
  { id: 468222, name: 'Venom' },
  { id: 529892, name: 'Godzilla (MonsterVerse)' },
  { id: 333339, name: 'Kingsman' },
  { id: 155103, name: 'Jason Bourne' },
  { id: 91361, name: 'The Expendables' },
  // ── Fantasy & Adventure ──
  { id: 1241, name: 'Harry Potter' },
  { id: 401981, name: 'Fantastic Beasts' },
  { id: 119, name: 'Lord of the Rings' },
  { id: 121938, name: 'The Hobbit' },
  { id: 84, name: 'Indiana Jones' },
  { id: 295, name: 'Pirates of the Caribbean' },
  { id: 102225, name: 'The Chronicles of Narnia' },
  { id: 420, name: 'Mad Max' },
  // ── Horror & Thriller ──
  { id: 126125, name: 'The Conjuring Universe' },
  { id: 323208, name: 'The Purge' },
  { id: 9134, name: 'Underworld' },
  { id: 30514, name: 'Resident Evil' },
  { id: 1709, name: 'Predator' },
  { id: 9028, name: 'The Mummy' },
  { id: 14890, name: 'The Chronicles of Riddick' },
  { id: 87118, name: 'Scary Movie' },
  // ── Drama & Crime ──
  { id: 265, name: 'The Godfather' },
  { id: 304, name: "Ocean's" },
  { id: 1575, name: 'Rocky' },
  { id: 157336, name: 'Rambo' },
  { id: 515243, name: 'The Equalizer' },
  // ── Comedy ──
  { id: 94032, name: 'The Hangover' },
  { id: 106093, name: 'Step Up' },
  // ── Animation & Family ──
  { id: 10194, name: 'Toy Story' },
  { id: 2150, name: 'Shrek' },
  { id: 86066, name: 'Despicable Me' },
  { id: 77816, name: 'Kung Fu Panda' },
  { id: 8354, name: 'Ice Age' },
  { id: 134444, name: 'How to Train Your Dragon' },
  { id: 473187, name: 'The Incredibles' },
  { id: 9086, name: 'Madagascar' },
  { id: 61168, name: 'Cars' },
  { id: 86121, name: 'Monsters, Inc.' },
  { id: 459636, name: 'Hotel Transylvania' },
  { id: 144571, name: 'The Croods' },
  { id: 254881, name: 'The Boss Baby' },
  { id: 356860, name: 'Trolls' },
  { id: 416560, name: 'Sing' },
  { id: 436573, name: 'The Secret Life of Pets' },
  { id: 176166, name: 'The Smurfs' },
  { id: 2831, name: 'The Mighty Ducks' },
  { id: 328, name: 'Jurassic Park' },
  // ── Romance & Drama ──
  { id: 33514, name: 'Twilight' },
  { id: 284433, name: 'Fifty Shades' },
  // ── Sci-Fi Series ──
  { id: 151, name: 'Star Trek' },
  { id: 115570, name: 'Star Trek Reboot' },
  { id: 137, name: 'Back to the Future' },
  { id: 17042, name: 'Planet of the Apes' },
  { id: 8650, name: 'Transformers' },
  // ── Teen / YA ──
  { id: 131635, name: 'The Hunger Games' },
  { id: 103233, name: 'Maze Runner' },
  { id: 228446, name: 'Divergent' },
  // ── Men in Black / Spy ──
  { id: 955, name: 'Men in Black' },
  { id: 107971, name: 'Creed' },
  { id: 313086, name: 'Conjuring' },
  { id: 453993, name: 'Aquaman' },
  { id: 468552, name: 'Wonder Woman' },
  { id: 86834, name: 'Lethal Weapon' },
  { id: 8581, name: 'Beverly Hills Cop' },
  { id: 9735, name: 'Ghostbusters' },
  { id: 5514, name: 'Ghostbusters (2016)' },
  { id: 9116, name: 'Rush Hour' },
  { id: 9754, name: 'Bad Boys' },
  { id: 3294, name: 'The Bourne Series' },
  { id: 131634, name: 'Deadpool' },
  { id: 9016, name: 'Friday the 13th' },
  { id: 18926, name: 'Nightmare on Elm Street' },
  { id: 9795, name: 'Halloween' },
  // ── Additional well-known ──
  { id: 645, name: 'James Bond 007' },
  { id: 2602, name: 'Ace Ventura' },
  { id: 9775, name: 'Scream' },
  { id: 86055, name: 'The Amazing Spider-Man' },
];
  { id: 3294, name: 'The Bourne Series' },
  { id: 131634, name: 'Deadpool' },
  { id: 9016, name: 'Friday the 13th' },
  { id: 18926, name: 'Nightmare on Elm Street' },
  { id: 9795, name: 'Halloween' },
];

// Spider-Man special IDs (merged from multiple sub-collections)
const SPIDERMAN_IDS = [531241, 556, 125574, 558216];

const CACHE_KEY = 'collections-metadata';
const CACHE_TTL = 24 * 60 * 60 * 1000; // 24 hours

interface CollectionMeta {
  id: number;
  name: string;
  overview: string;
  poster_path: string;
  backdrop_path: string;
  partsCount: number;
}

// ── Cache helpers ──
function getCachedCollections(): CollectionMeta[] | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = sessionStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (parsed.expiresAt && Date.now() <= parsed.expiresAt && Array.isArray(parsed.data)) {
      return parsed.data;
    }
    sessionStorage.removeItem(CACHE_KEY);
  } catch { /* sessionStorage unavailable */ }
  return null;
}

function setCachedCollections(data: CollectionMeta[]): void {
  if (typeof window === 'undefined') return;
  try {
    sessionStorage.setItem(CACHE_KEY, JSON.stringify({
      data,
      expiresAt: Date.now() + CACHE_TTL,
    }));
  } catch { /* quota exceeded */ }
}

export default function CollectionsPage() {
  // All collection metadata — loaded once, cached in sessionStorage
  const [collections, setCollections] = useState<CollectionMeta[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadProgress, setLoadProgress] = useState(0);

  // Selected collection detail (with full parts loaded on click)
  const [selectedCol, setSelectedCol] = useState<Record<string, unknown> | null>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [errorToast, setErrorToast] = useState<string | null>(null);

  // Search & Pagination for the collections list
  const [searchQuery, setSearchQuery] = useState('');
  const [listPage, setListPage] = useState(1);
  const collectionsPerPage = 18;

  // Pagination for parts inside a selected collection
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  // ── Load ALL collection metadata once (from cache or API) ──
  useEffect(() => {
    let cancelled = false;

    // Check cache first — instant load if available
    const cached = getCachedCollections();
    if (cached && cached.length > 0) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setCollections(cached);
      setLoading(false);
      return;
    }

    // Fetch all collections from TMDB
    async function loadAll() {
      const results: CollectionMeta[] = [];
      const BATCH = 10;
      const total = COLLECTIONS.length;
      let loaded = 0;

      for (let i = 0; i < total; i += BATCH) {
        if (cancelled) return;
        const batch = COLLECTIONS.slice(i, i + BATCH);

        const batchResults = await Promise.all(
          batch.map(async (col): Promise<CollectionMeta | null> => {
            try {
              if (col.id === 531241) {
                const subResults = await Promise.all(
                  SPIDERMAN_IDS.map(sid =>
                    ApiGateway.fetchTmdb<Record<string, unknown>>(`/collection/${sid}`).catch(() => null)
                  )
                );
                const allParts: Record<string, unknown>[] = [];
                subResults.forEach(r => {
                  const rec = r as { parts?: Record<string, unknown>[] } | null;
                  if (rec?.parts) allParts.push(...rec.parts);
                });
                const uniqueMap = new Map<unknown, Record<string, unknown>>();
                allParts.forEach(p => { if (p?.id) uniqueMap.set(p.id, p); });
                return {
                  id: 531241,
                  name: 'Spider-Man Collection',
                  overview: 'The complete Spider-Man cinematic franchise.',
                  poster_path: (subResults.find(r => (r as { poster_path?: string } | null)?.poster_path) as { poster_path?: string } | null)?.poster_path || '',
                  backdrop_path: (subResults.find(r => (r as { backdrop_path?: string } | null)?.backdrop_path) as { backdrop_path?: string } | null)?.backdrop_path || '',
                  partsCount: uniqueMap.size,
                };
              }
              const data = await ApiGateway.fetchTmdb<Record<string, unknown>>(`/collection/${col.id}`);
              return {
                id: col.id,
                name: (data.name as string) || col.name,
                overview: (data.overview as string) || '',
                poster_path: (data.poster_path as string) || '',
                backdrop_path: (data.backdrop_path as string) || '',
                partsCount: (data.parts as unknown[])?.length || 0,
              };
            } catch {
              // Skip 404s and other failures — they won't be in the cached list
              return null;
            }
          })
        );

        batchResults.forEach(r => { if (r) results.push(r); });
        loaded += batch.length;
        if (!cancelled) setLoadProgress(Math.round((loaded / total) * 100));

        // Small delay between batches to avoid rate limiting
        if (i + BATCH < total && !cancelled) {
          await new Promise(r => setTimeout(r, 200));
        }
      }

      if (!cancelled) {
        // Sort to maintain the original COLLECTIONS order
        const idOrder = new Map(COLLECTIONS.map((c, idx) => [c.id, idx]));
        results.sort((a, b) => (idOrder.get(a.id) ?? 0) - (idOrder.get(b.id) ?? 0));

        setCollections(results);
        setCachedCollections(results);
        setLoading(false);
      }
    }

    loadAll();
    return () => { cancelled = true; };
  }, []);

  // Filter collections by search
  const filteredCollections = useMemo(() => {
    if (!searchQuery.trim()) return collections;
    const q = searchQuery.toLowerCase();
    return collections.filter(c => c.name.toLowerCase().includes(q));
  }, [collections, searchQuery]);

  // Paginated list
  const totalListPages = Math.ceil(filteredCollections.length / collectionsPerPage);
  const paginatedCollections = useMemo(() => {
    const start = (listPage - 1) * collectionsPerPage;
    return filteredCollections.slice(start, start + collectionsPerPage);
  }, [filteredCollections, listPage]);

  // Reset page when search changes
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { setListPage(1); }, [searchQuery]);

  // Clamp listPage if it exceeds totalListPages
  useEffect(() => {
    if (listPage > totalListPages && totalListPages > 0) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setListPage(totalListPages);
    }
  }, [listPage, totalListPages]);

  // ── Fetch full collection details when user clicks a collection ──
  const handleSelectCollection = useCallback(async (col: CollectionMeta) => {
    setLoadingDetail(true);
    setCurrentPage(1);

    try {
      let fullData: Record<string, unknown>;

      if (col.id === 531241) {
        const results = await Promise.all(
          SPIDERMAN_IDS.map(sid =>
            ApiGateway.fetchTmdb<Record<string, unknown>>(`/collection/${sid}`).catch(() => null)
          )
        );
        const allParts: Record<string, unknown>[] = [];
        results.forEach(r => {
          const rec = r as { parts?: Record<string, unknown>[] } | null;
          if (rec?.parts) allParts.push(...rec.parts);
        });
        const uniqueMap = new Map<unknown, Record<string, unknown>>();
        allParts.forEach(p => { if (p?.id) uniqueMap.set(p.id, p); });
        const uniqueParts = Array.from(uniqueMap.values());
        uniqueParts.sort((a, b) => ((a.release_date as string) || '0').localeCompare((b.release_date as string) || '0'));
        fullData = {
          id: 531241,
          name: 'Spider-Man Collection',
          overview: 'The complete Spider-Man cinematic franchise.',
          poster_path: (results.find(r => (r as { poster_path?: string } | null)?.poster_path) as { poster_path?: string } | null)?.poster_path || '',
          backdrop_path: (results.find(r => (r as { backdrop_path?: string } | null)?.backdrop_path) as { backdrop_path?: string } | null)?.backdrop_path || '',
          parts: uniqueParts,
        };
      } else {
        fullData = await ApiGateway.fetchTmdb<Record<string, unknown>>(`/collection/${col.id}`);
      }

      setSelectedCol(fullData);
    } catch (err) {
      console.error('Failed to load collection details', err);
      setErrorToast(`"${col.name}" is no longer available.`);
      setTimeout(() => setErrorToast(null), 4000);
    } finally {
      setLoadingDetail(false);
    }
  }, []);

  // Paginated parts for the selected collection detail
  const parts = (selectedCol?.parts as Record<string, unknown>[] | undefined) || [];
  // Sort parts ascending by release_date before paginating
  const sortedParts = [...parts].sort((a, b) => {
    const dateA = ((a as Record<string, unknown>).release_date as string) || '0';
    const dateB = ((b as Record<string, unknown>).release_date as string) || '0';
    return dateA.localeCompare(dateB);
  });
  const totalPages = Math.ceil(sortedParts.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedParts = sortedParts.slice(startIndex, startIndex + itemsPerPage);

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

            {/* Search Bar — only show when collections are loaded */}
            {collections.length > 0 && (
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
            )}
          </div>
        )}

        {/* Detail Loading State */}
        {loadingDetail && !selectedCol && (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <Loader className="w-8 h-8 animate-spin text-accent-blue" />
            <span className="text-sm font-semibold text-slate-500 dark:text-slate-400">Loading collection movies...</span>
          </div>
        )}

        {/* Initial Loading State — fetching all metadata */}
        {loading && !selectedCol && (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <Loader className="w-10 h-10 animate-spin text-accent-blue" />
            <div className="text-center space-y-2">
              <span className="text-sm font-bold text-slate-600 dark:text-slate-300">Loading Movie Collections</span>
              <p className="text-xs text-slate-400 dark:text-slate-500 max-w-sm">
                Fetching metadata for {COLLECTIONS.length} collections. This only happens once — data is cached for instant access afterward.
              </p>
            </div>
            {/* Progress bar */}
            <div className="w-48 bg-slate-200 dark:bg-slate-800 rounded-full h-2 overflow-hidden">
              <div
                className="h-full bg-accent-blue rounded-full transition-all duration-300 ease-out"
                style={{ width: `${loadProgress}%` }}
              />
            </div>
            <span className="text-xs font-bold text-slate-400 dark:text-slate-500">{loadProgress}%</span>
          </div>
        )}

        {/* Collections Detail View */}
        {selectedCol ? (() => {
          const col = selectedCol as { name?: string; overview?: string; backdrop_path?: string };
          return (
          <div className="space-y-8 animate-fadeIn">
            {/* Banner */}
            <div className="relative w-full h-[30vh] min-h-[200px] rounded-[2rem] overflow-hidden bg-slate-800 shadow-xl border border-slate-100 dark:border-slate-700">
              {col.backdrop_path ? (
                <img 
                  src={`https://image.tmdb.org/t/p/original${col.backdrop_path}`} 
                  alt={col.name}
                  className="w-full h-full object-cover opacity-75"
                />
              ) : (
                <div className="w-full h-full bg-slate-900 flex items-center justify-center">
                  <Folder className="w-16 h-16 text-slate-700" />
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/50 to-transparent flex flex-col justify-end p-6 md:p-8">
                <h2 className="text-2xl md:text-3xl font-black text-white">{col.name}</h2>
                <p className="text-xs md:text-sm text-slate-300 max-w-2xl mt-2 leading-relaxed">
                  {col.overview || 'Explore all movies inside this cinematic collection.'}
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
                  {(paginatedParts as Record<string, unknown>[]).map((item) => (
                    <PosterCard
                      key={item.id as number}
                      id={item.id as number}
                      title={item.title as string}
                      posterPath={item.poster_path as string}
                      rating={item.vote_average as number}
                      year={item.release_date ? (item.release_date as string).split('-')[0] : ''}
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
        ); })() : !loading && !loadingDetail && paginatedCollections.length > 0 ? (
          /* Collections Grid — all loaded from cache */
          <div className="space-y-8 animate-fadeIn">
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
              {paginatedCollections.map((col) => (
                <div
                  key={col.id}
                  onClick={() => handleSelectCollection(col)}
                  className="group relative aspect-[2/3] rounded-2xl overflow-hidden cursor-pointer shadow-md hover:shadow-xl border border-slate-100 dark:border-slate-700 transition-all duration-300 hover:-translate-y-1.5 bg-slate-900"
                >
                  {/* Poster */}
                  {col.poster_path ? (
                    <img 
                      src={`https://image.tmdb.org/t/p/w342${col.poster_path}`} 
                      alt={col.name}
                      className="absolute inset-0 w-full h-full object-cover transition duration-500 group-hover:scale-103"
                    />
                  ) : (
                    <div className="absolute inset-0 flex flex-col items-center justify-center p-4">
                      <Film className="w-10 h-10 text-slate-600 dark:text-slate-500 mb-2" />
                      <span className="text-xs text-slate-400 dark:text-slate-400 font-bold text-center">{col.name}</span>
                    </div>
                  )}
                  
                  {/* Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/10 to-transparent flex flex-col justify-end p-4 z-10">
                    <h3 className="text-xs font-black text-white drop-shadow-md leading-tight line-clamp-2">{col.name}</h3>
                    <span className="text-[9px] font-bold text-blue-400 dark:text-blue-400 uppercase tracking-wider mt-1 block">
                      {col.partsCount} Parts
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
        ) : !loading && !loadingDetail ? (
          <div className="text-center py-20 text-slate-400 dark:text-slate-600">
            No movie collections found matching search.
          </div>
        ) : null}

        {/* Error Toast */}
        {errorToast && (
          <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 px-5 py-3 rounded-2xl bg-red-600 text-white text-sm font-semibold shadow-lg shadow-red-900/30 animate-fadeIn">
            <AlertCircle className="w-4 h-4 shrink-0" />
            {errorToast}
            <button onClick={() => setErrorToast(null)} className="ml-2 p-0.5 hover:bg-red-500 rounded-full transition">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
