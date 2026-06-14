'use client';

import { motion } from 'framer-motion';
import { useAppStore } from '@/store/useAppStore';
import { User, Bell, Shield, Cloud, Smartphone, HelpCircle } from 'lucide-react';
import { syncBackground } from '@/lib/api';
import { useState } from 'react';

export default function SettingsPage() {
  const user = useAppStore((state) => state.user);
  const isOnline = useAppStore((state) => state.isOnline);
  const isSyncing = useAppStore((state) => state.isSyncing);
  const setSyncing = useAppStore((state) => state.setSyncing);

  const handleManualSync = async () => {
    if (!isOnline) {
      alert("You are currently offline. Syncing requires an active internet connection.");
      return;
    }
    
    setSyncing(true);
    try {
      await syncBackground();
      alert("Data synced successfully!");
    } catch (error) {
      alert("Sync failed. Please try again later.");
    } finally {
      setSyncing(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 p-4 md:p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        
        <header>
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white">Settings</h1>
          <p className="text-slate-500 dark:text-slate-400">Manage your preferences</p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-1 space-y-4">
            <div className="glass p-6 rounded-[2rem] flex flex-col items-center text-center">
              <div className="w-24 h-24 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-full flex items-center justify-center mb-4 text-3xl font-bold">
                {user?.user_metadata?.full_name?.substring(0, 1) || user?.email?.substring(0, 1) || 'U'}
              </div>
              <h3 className="font-bold text-lg">{user?.user_metadata?.full_name || 'Student'}</h3>
              <p className="text-slate-500 text-sm truncate w-full">{user?.email}</p>
            </div>
          </div>

          <div className="md:col-span-2 space-y-4">
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="glass rounded-[2rem] overflow-hidden">
              <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center gap-3">
                <Cloud className="text-indigo-500" />
                <h3 className="font-bold">Sync & Offline</h3>
              </div>
              <div className="p-6 space-y-4">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-medium">Force Sync</p>
                    <p className="text-sm text-slate-500">Push offline changes to server manually</p>
                  </div>
                  <button 
                    onClick={handleManualSync}
                    disabled={!isOnline || isSyncing}
                    className="px-4 py-2 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400 font-bold rounded-xl disabled:opacity-50"
                  >
                    {isSyncing ? 'Syncing...' : 'Sync Now'}
                  </button>
                </div>
              </div>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass rounded-[2rem] overflow-hidden">
              <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center gap-3">
                <Bell className="text-amber-500" />
                <h3 className="font-bold">Notifications</h3>
              </div>
              <div className="p-6 space-y-4 text-slate-500 text-sm text-center">
                Push notifications for upcoming classes and attendance warnings will be configurable here once PWA service workers are active on your device.
              </div>
            </motion.div>
          </div>
        </div>

      </div>
    </div>
  );
}
