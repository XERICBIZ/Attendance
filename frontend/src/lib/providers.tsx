'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState, useEffect } from 'react';
import { useAppStore } from '../store/useAppStore';
import { createClient } from './supabase';
import { hydrateFromServer } from './api';

export default function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60 * 1000,
        refetchOnWindowFocus: true,
      },
    },
  }));

  const setUser = useAppStore((state) => state.setUser);
  const setOnlineStatus = useAppStore((state) => state.setOnlineStatus);
  const supabase = createClient();

  useEffect(() => {
    // Check initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      // Hydrate local DB from server when session exists
      if (session?.user) {
        hydrateFromServer();
      }
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      // Hydrate when user signs in
      if (_event === 'SIGNED_IN' && session?.user) {
        hydrateFromServer();
      }
    });

    // Offline / Online listeners
    const handleOnline = () => setOnlineStatus(true);
    const handleOffline = () => setOnlineStatus(false);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    setOnlineStatus(navigator.onLine);

    return () => {
      subscription.unsubscribe();
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
}
