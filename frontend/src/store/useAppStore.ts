import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User } from '@supabase/supabase-js';

interface AppState {
  user: User | null;
  isOnline: boolean;
  setUser: (user: User | null) => void;
  setOnlineStatus: (status: boolean) => void;
  isSyncing: boolean;
  setSyncing: (status: boolean) => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      user: null,
      isOnline: true,
      isSyncing: false,
      setUser: (user) => set({ user }),
      setOnlineStatus: (status) => set({ isOnline: status }),
      setSyncing: (status) => set({ isSyncing: status }),
    }),
    {
      name: 'attendx-storage',
    }
  )
);
