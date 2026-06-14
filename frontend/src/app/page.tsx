'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { useAppStore } from '@/store/useAppStore';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Calendar, TrendingUp, CloudOff } from 'lucide-react';

export default function LandingPage() {
  const user = useAppStore((state) => state.user);
  const router = useRouter();

  useEffect(() => {
    if (user) {
      router.push('/dashboard');
    }
  }, [user, router]);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white flex flex-col items-center justify-center p-6">
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="text-center max-w-3xl"
      >
        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6 bg-gradient-to-r from-indigo-500 to-cyan-400 bg-clip-text text-transparent">
          AttendX
        </h1>
        <p className="text-xl md:text-2xl text-slate-600 dark:text-slate-300 mb-10 font-medium">
          The ultimate smart attendance tracker. Predict, analyze, and master your college schedule.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-20">
          <Link href="/login" className="w-full sm:w-auto px-8 py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-bold text-lg shadow-lg hover:shadow-indigo-500/30 transition-all transform hover:-translate-y-1">
            Get Started
          </Link>
          <a href="#features" className="w-full sm:w-auto px-8 py-4 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-900 dark:text-white rounded-2xl font-bold text-lg shadow-sm border border-slate-200 dark:border-slate-700 transition-all">
            Learn More
          </a>
        </div>
      </motion.div>

      <motion.div 
        id="features"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 0.4 }}
        className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl w-full"
      >
        <div className="glass p-8 rounded-3xl flex flex-col items-center text-center">
          <div className="w-16 h-16 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-2xl flex items-center justify-center mb-6">
            <TrendingUp size={32} />
          </div>
          <h3 className="text-xl font-bold mb-3">Smart Analytics</h3>
          <p className="text-slate-500 dark:text-slate-400">
            Calculate safe bunks, predict future attendance, and see what-if scenarios instantly.
          </p>
        </div>

        <div className="glass p-8 rounded-3xl flex flex-col items-center text-center">
          <div className="w-16 h-16 bg-cyan-100 dark:bg-cyan-900/30 text-cyan-600 dark:text-cyan-400 rounded-2xl flex items-center justify-center mb-6">
            <CloudOff size={32} />
          </div>
          <h3 className="text-xl font-bold mb-3">Offline First</h3>
          <p className="text-slate-500 dark:text-slate-400">
            Mark attendance without internet. We auto-sync everything when you're back online.
          </p>
        </div>

        <div className="glass p-8 rounded-3xl flex flex-col items-center text-center">
          <div className="w-16 h-16 bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-2xl flex items-center justify-center mb-6">
            <Calendar size={32} />
          </div>
          <h3 className="text-xl font-bold mb-3">Timetable Magic</h3>
          <p className="text-slate-500 dark:text-slate-400">
            Manage your weekly schedule with a beautiful drag-and-drop calendar interface.
          </p>
        </div>
      </motion.div>
    </div>
  );
}
