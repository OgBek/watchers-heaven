'use client';
import { useEffect, useState } from 'react';
import { ApiGateway, TouStreamChannel } from '@/lib/api/gateway';
import { Tv, Search, Play, RefreshCw, Loader } from 'lucide-react';

export default function LiveTvPage() {
  const [channels, setChannels] = useState<TouStreamChannel[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedChannel, setSelectedChannel] = useState<TouStreamChannel | null>(null);

  useEffect(() => {
    async function loadChannels() {
      setLoading(true);
      const list = await ApiGateway.getTouStreamChannels();
      setChannels(list);
      if (list.length > 0) {
        setSelectedChannel(list[0]);
      }
      setLoading(false);
    }
    loadChannels();
  }, []);

  const filteredChannels = channels.filter((c) =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen pb-20 px-4 md:px-8 pt-6 bg-[var(--color-main)]">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-800 dark:text-white flex items-center gap-2">
            <Tv className="w-6 h-6 text-[#007bff]" />
            Live TV Channels
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">Stream live channels directly in your browser</p>
        </div>

        {/* Search Input */}
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search channels..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 focus:outline-none focus:border-blue-500 text-slate-700 dark:text-slate-200 placeholder-slate-400 transition-colors shadow-sm"
          />
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center min-h-[50vh] text-slate-500 gap-3">
          <Loader className="w-8 h-8 animate-spin text-[#007bff]" />
          <span>Fetching Live Streams...</span>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left/Middle Column: Active Player */}
          <div className="lg:col-span-2 space-y-4">
            {selectedChannel ? (
              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-md overflow-hidden transition-all duration-300">
                {/* Embedded Video */}
                <div className="relative aspect-video w-full bg-black">
                  <iframe
                    src={ApiGateway.getTouStreamLiveUrl(selectedChannel.slug)}
                    className="w-full h-full"
                    allowFullScreen
                    allow="autoplay; fullscreen; picture-in-picture"
                    title={`Live TV - ${selectedChannel.name}`}
                    style={{ border: 'none' }}
                  />
                </div>
                {/* Details under Player - Name only, no logo */}
                <div className="p-5 flex items-center justify-between">
                  <div>
                    <h2 className="text-lg font-bold text-slate-800 dark:text-white">{selectedChannel.name}</h2>
                    <span className="inline-flex items-center gap-1.5 text-xs text-red-500 font-semibold mt-0.5">
                      <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                      LIVE
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-md p-10 text-center text-slate-400">
                No channel selected or available.
              </div>
            )}
          </div>

          {/* Right Column: Channels List - Logo removed, name only */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-md p-4 max-h-[70vh] overflow-y-auto flex flex-col gap-2">
            <h3 className="text-sm font-bold text-slate-700 dark:text-slate-200 px-2 pb-2 border-b border-slate-100 dark:border-slate-800 mb-2 flex items-center justify-between">
              <span>Available Streams</span>
              <button 
                onClick={async () => {
                  setLoading(true);
                  const list = await ApiGateway.getTouStreamChannels();
                  setChannels(list);
                  setLoading(false);
                }}
                className="p-1 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg text-slate-400 hover:text-slate-650 dark:hover:text-slate-200 smooth-transition"
                title="Refresh Channel List"
              >
                <RefreshCw className="w-3.5 h-3.5" />
              </button>
            </h3>

            {filteredChannels.length > 0 ? (
              <div className="flex flex-col gap-1.5">
                {filteredChannels.map((channel) => {
                  const isActive = selectedChannel?.slug === channel.slug;
                  return (
                    <button
                      key={channel.slug}
                      onClick={() => setSelectedChannel(channel)}
                      className={`w-full flex items-center justify-between p-3.5 rounded-xl transition-all duration-300 text-left border ${
                        isActive
                          ? 'bg-blue-50/80 dark:bg-blue-950/40 border-blue-100/50 dark:border-blue-900/50 text-[#007bff] dark:text-blue-450'
                          : 'bg-transparent border-transparent text-slate-600 dark:text-slate-350 hover:bg-slate-50/70 dark:hover:bg-slate-800/40'
                      }`}
                    >
                      <div className="flex-1 min-w-0 pr-2">
                        <span className="font-semibold text-sm truncate block">{channel.name}</span>
                        <span className="text-[10px] text-slate-400 dark:text-slate-500 truncate block">Slug: {channel.slug}</span>
                      </div>
                      {isActive && (
                        <Play className="w-4 h-4 fill-[#007bff] dark:fill-blue-400 text-[#007bff] dark:text-blue-400 shrink-0" />
                      )}
                    </button>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8 text-xs text-slate-400">
                No channels match your search.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
