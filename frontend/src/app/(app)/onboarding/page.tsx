'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { User, ArrowRight, Loader2 } from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import { useRouter } from 'next/navigation';
import { db } from '@/lib/db';

export default function OnboardingPage() {
  const [name, setName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const { user, setUser } = useAppStore();
  const router = useRouter();

  const handleSave = async () => {
    if (!name.trim() || name.trim().length < 2) {
      setError('Please enter your full name (at least 2 characters).');
      return;
    }
    setIsLoading(true);
    // Update the user metadata locally so the layout shows correct name
    if (user) {
      const updatedUser = {
        ...user,
        user_metadata: { ...user.user_metadata, full_name: name.trim() },
      };
      setUser(updatedUser as any);
    }
    // Small delay for UX
    await new Promise(r => setTimeout(r, 400));
    router.push('/dashboard');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F7F5EE] p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="neo-card bg-neo-yellow p-8 md:p-12">
          <div className="w-16 h-16 bg-white border-2 border-[#1a1a1a] shadow-[4px_4px_0px_0px_#1a1a1a] rounded-full flex items-center justify-center mb-6">
            <User size={32} strokeWidth={3} />
          </div>

          <h1 className="text-3xl font-black mb-2">Welcome! 👋</h1>
          <p className="font-bold opacity-70 mb-8">
            Before we start tracking your attendance, what should we call you?
          </p>

          <div className="space-y-4">
            <div>
              <input
                type="text"
                value={name}
                onChange={(e) => { setName(e.target.value); setError(''); }}
                onKeyDown={(e) => e.key === 'Enter' && handleSave()}
                placeholder="Your full name..."
                className="neo-input w-full text-lg py-4 px-5"
                autoFocus
              />
              {error && <p className="text-neo-red font-bold text-sm mt-2">{error}</p>}
            </div>

            <button
              onClick={handleSave}
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-3 py-4 bg-[#1a1a1a] text-white font-black text-lg rounded-2xl border-2 border-[#1a1a1a] shadow-[4px_4px_0px_0px_rgba(0,0,0,0.3)] hover:translate-y-[2px] hover:shadow-none transition-all disabled:opacity-70"
            >
              {isLoading ? <Loader2 className="animate-spin" size={22} /> : (
                <>Let's Go! <ArrowRight size={22} strokeWidth={3} /></>
              )}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
