import { create } from 'zustand';
import { ConnectionStatus, RealtimePartyPayload, SyncStatus, WatchParty, WatchPartyMember } from '@/types/watch-party';

interface WatchPartyState {
  party: WatchParty | null;
  isHost: boolean;
  userId: string | null;
  playing: boolean;
  currentTime: number;
  connectionStatus: ConnectionStatus;
  syncStatus: SyncStatus;
  viewerCount: number;
  members: WatchPartyMember[];
  error: string | null;
  
  // Actions
  setParty: (party: WatchParty | null) => void;
  setIsHost: (isHost: boolean) => void;
  setUserId: (userId: string | null) => void;
  setPlaying: (playing: boolean) => void;
  setCurrentTime: (time: number) => void;
  setConnectionStatus: (status: ConnectionStatus) => void;
  setSyncStatus: (status: SyncStatus) => void;
  setViewerCount: (count: number) => void;
  setMembers: (members: WatchPartyMember[]) => void;
  setError: (error: string | null) => void;
  handleRealtimeUpdate: (payload: RealtimePartyPayload) => void;
  reset: () => void;
}

export const useWatchPartyStore = create<WatchPartyState>((set, get) => ({
  party: null,
  isHost: false,
  userId: null,
  playing: false,
  currentTime: 0,
  connectionStatus: 'disconnected',
  syncStatus: 'synced',
  viewerCount: 1,
  members: [],
  error: null,

  setParty: (party) => set({ party }),
  setIsHost: (isHost) => set({ isHost }),
  setUserId: (userId) => set({ userId }),
  setPlaying: (playing) => set({ playing }),
  setCurrentTime: (currentTime) => set({ currentTime }),
  setConnectionStatus: (connectionStatus) => set({ connectionStatus }),
  setSyncStatus: (syncStatus) => set({ syncStatus }),
  setViewerCount: (viewerCount) => set({ viewerCount }),
  setMembers: (members) => set({ members }),
  setError: (error) => set({ error }),
  
  handleRealtimeUpdate: (payload) => {
    const { new: newParty } = payload;
    const { isHost } = get();
    
    set({ party: newParty });
    
    // If we're not the host, we need to follow the host's playback state
    if (!isHost) {
      set({ 
        playing: newParty.playing,
        // We don't automatically update currentTime here because we want
        // the drift correction logic to handle seeking to avoid stuttering
        // if the difference is small.
      });
    }
  },

  reset: () => set({
    party: null,
    isHost: false,
    playing: false,
    currentTime: 0,
    connectionStatus: 'disconnected',
    syncStatus: 'synced',
    viewerCount: 1,
    members: [],
    error: null,
  })
}));
