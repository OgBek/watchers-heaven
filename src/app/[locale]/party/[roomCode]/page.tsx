'use client';

import { useParams, useRouter } from 'next/navigation';
import { useRef, useState, useEffect } from 'react';
import { useWatchParty } from '@/hooks/use-watch-party';
import { useWatchPartyStore } from '@/stores/watch-party-store';
import { VylaPlayer, VylaPlayerHandle } from '@/components/player/VylaPlayer';
import { Link2, Crown, LogOut, Loader, AlertCircle } from 'lucide-react';

export default function PartyRoomPage() {
  const params = useParams();
  const router = useRouter();
  const locale = (params.locale as string) || 'en';
  const roomCode = params.roomCode as string;

  const playerRef = useRef<VylaPlayerHandle>(null);
  
  const { handlePlay, handlePause, handleSeek } = useWatchParty(roomCode, playerRef);
  const store = useWatchPartyStore();

  const [copied, setCopied] = useState(false);

  const copyInviteLink = () => {
    const url = window.location.href;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleLeave = () => {
    // Optionally alert the user or confirm
    router.push(`/${locale}`);
  };

  // Loading state
  if (store.connectionStatus === 'connecting' && !store.party) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-white space-y-4">
        <Loader className="w-8 h-8 animate-spin text-accent-blue" />
        <p className="font-semibold">Joining Watch Party...</p>
      </div>
    );
  }

  // Error state
  if (store.error) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-white space-y-4 p-6">
        <AlertCircle className="w-12 h-12 text-red-500" />
        <h2 className="text-xl font-bold">Failed to Join Party</h2>
        <p className="text-slate-400 text-center max-w-sm">{store.error}</p>
        <button 
          onClick={() => router.push(`/${locale}`)}
          className="mt-4 px-6 py-2 bg-slate-800 hover:bg-slate-700 rounded-xl font-bold transition"
        >
          Go Home
        </button>
      </div>
    );
  }

  // If connected but party is null, something went wrong
  if (!store.party) {
    return null; 
  }

  // Determine sync status color and text
  const syncColorMap = {
    'synced': 'bg-green-500',
    'syncing': 'bg-yellow-500',
    'out-of-sync': 'bg-red-500'
  };

  const syncTextMap = {
    'synced': 'Synced',
    'syncing': 'Syncing...',
    'out-of-sync': 'Out of Sync'
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col text-slate-100 font-sans">
      {/* Top Bar */}
      <div className="flex items-center justify-between px-4 py-3 bg-slate-900 border-b border-slate-800 z-10">
        <div className="flex items-center gap-4">
          <div>
            <h1 className="text-sm font-bold text-white max-w-[200px] md:max-w-xs truncate">
              {store.party.movie_title}
            </h1>
            <p className="text-[10px] text-slate-400">
              {store.party.media_type === 'tv' 
                ? `S${store.party.season} E${store.party.episode}`
                : 'Movie'}
            </p>
          </div>
          
          <div className="hidden sm:flex items-center gap-2 bg-slate-950 px-3 py-1.5 rounded-lg border border-slate-800">
            <span className="text-xs text-slate-400">Room Code:</span>
            <span className="text-xs font-mono font-bold tracking-wider">{roomCode}</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {store.isHost && (
            <div className="flex items-center gap-1.5 px-2.5 py-1 bg-yellow-500/20 text-yellow-500 rounded-lg text-[10px] font-bold uppercase tracking-wider">
              <Crown className="w-3 h-3" />
              <span className="hidden sm:inline">Host</span>
            </div>
          )}

          {!store.isHost && (
            <div className="flex items-center gap-1.5 px-2.5 py-1 bg-slate-800 rounded-lg text-[10px] font-bold uppercase tracking-wider">
              <div className={`w-2 h-2 rounded-full ${syncColorMap[store.syncStatus]}`} />
              <span className="hidden sm:inline">{syncTextMap[store.syncStatus]}</span>
            </div>
          )}

          <button
            onClick={copyInviteLink}
            className="flex items-center gap-2 px-3 py-1.5 bg-accent-blue hover:bg-blue-600 rounded-xl text-xs font-bold transition shadow-md"
          >
            <Link2 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{copied ? 'Copied!' : 'Invite'}</span>
          </button>

          <button
            onClick={handleLeave}
            className="flex items-center gap-2 p-1.5 sm:px-3 sm:py-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-500 rounded-xl text-xs font-bold transition"
            title="Leave Party"
          >
            <LogOut className="w-4 h-4 sm:w-3.5 sm:h-3.5" />
            <span className="hidden sm:inline">Leave</span>
          </button>
        </div>
      </div>

      {/* Main Video Area */}
      <div className="flex-1 relative bg-black">
        <VylaPlayer
          ref={playerRef}
          id={store.party.movie_id}
          type={store.party.media_type}
          season={store.party.season || undefined}
          episode={store.party.episode || undefined}
          onPlay={handlePlay}
          onPause={handlePause}
          onSeek={handleSeek}
        />
        
        {/* Disconnection Warning Overlay */}
        {store.connectionStatus === 'reconnecting' && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 z-50 bg-yellow-500/90 text-black px-4 py-2 rounded-full text-xs font-bold flex items-center gap-2 shadow-xl animate-pulse">
            <Loader className="w-3 h-3 animate-spin" />
            Reconnecting to party...
          </div>
        )}
      </div>
    </div>
  );
}
