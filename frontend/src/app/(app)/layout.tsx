'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, BookOpen, Calendar, Settings, LogOut, Plus, History } from 'lucide-react';
import { createClient } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { useAppStore } from '@/store/useAppStore';

const NAV_ITEMS = [
  { name: 'Home', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Subjects', href: '/subjects', icon: BookOpen },
  { name: 'Timetable', href: '/timetable', icon: Calendar },
  { name: 'History', href: '/history', icon: History },
  { name: 'Settings', href: '/settings', icon: Settings },
];

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();
  const isSyncing = useAppStore((state) => state.isSyncing);
  const isOnline = useAppStore((state) => state.isOnline);
  const user = useAppStore((state) => state.user);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  return (
    <div className="flex h-screen bg-[#F7F5EE] overflow-hidden text-[#1a1a1a]">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-72 bg-[#F7F5EE] border-r-2 border-[#1a1a1a] z-10">
        <div className="p-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-neo-yellow border-2 border-[#1a1a1a] rounded-full flex items-center justify-center font-bold text-lg">
               {user?.user_metadata?.full_name?.substring(0, 1) || 'A'}
            </div>
            <h1 className="text-xl font-black tracking-tight">Hey, {user?.user_metadata?.full_name?.split(' ')[0] || 'User'}!</h1>
          </div>
        </div>

        <div className="px-6 mb-6">
          <Link href="/subjects/new" className="flex items-center justify-center gap-2 w-full py-3 bg-neo-blue text-white neo-button">
            <Plus size={20} strokeWidth={3} />
            New Subject
          </Link>
        </div>
        
        <nav className="flex-1 px-4 space-y-3">
          {NAV_ITEMS.map((item) => {
            const isActive = pathname.startsWith(item.href);
            const Icon = item.icon;
            return (
              <Link 
                key={item.name} 
                href={item.href}
                className={`flex items-center gap-4 px-5 py-3 rounded-2xl font-bold transition-all border-2 border-transparent hover:border-[#1a1a1a] hover:bg-white ${isActive ? 'bg-white border-2 border-[#1a1a1a] shadow-[3px_3px_0px_0px_#1a1a1a]' : ''}`}
              >
                <Icon size={20} strokeWidth={2.5} />
                {item.name}
              </Link>
            );
          })}
        </nav>

        <div className="p-6 border-t-2 border-[#1a1a1a] space-y-4 bg-white">
          <div className="flex items-center gap-2">
            <div className={`w-3 h-3 border-2 border-[#1a1a1a] rounded-full ${isOnline ? 'bg-neo-green' : 'bg-neo-red'}`}></div>
            <span className="text-sm font-bold">
              {isOnline ? (isSyncing ? 'Syncing...' : 'Online') : 'Offline'}
            </span>
          </div>

          <button 
            onClick={handleLogout}
            className="flex items-center gap-3 w-full text-left font-bold text-neo-red hover:underline"
          >
            <LogOut size={20} strokeWidth={2.5} />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto pb-24 md:pb-0 relative z-0">
        <div className="md:hidden p-6 flex items-center justify-between border-b-2 border-[#1a1a1a] bg-white sticky top-0 z-20">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-neo-yellow border-2 border-[#1a1a1a] rounded-full flex items-center justify-center font-bold text-lg">
              {user?.user_metadata?.full_name?.substring(0, 1) || 'A'}
            </div>
            <h1 className="text-xl font-black">Hey, {user?.user_metadata?.full_name?.split(' ')[0] || 'User'}!</h1>
          </div>
          <Link href="/subjects/new" className="px-4 py-2 bg-neo-blue text-white text-sm neo-button flex items-center gap-1">
            <Plus size={16} strokeWidth={3} /> New
          </Link>
        </div>
        
        {children}
      </main>

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-4 left-4 right-4 bg-white border-2 border-[#1a1a1a] shadow-[4px_4px_0px_0px_#1a1a1a] rounded-full z-50 overflow-hidden">
        <div className="flex justify-around items-center h-16 px-2">
          {NAV_ITEMS.map((item) => {
            const isActive = pathname.startsWith(item.href);
            const Icon = item.icon;
            return (
              <Link 
                key={item.name} 
                href={item.href}
                className={`flex flex-col items-center justify-center w-full h-full space-y-1 ${isActive ? 'text-neo-blue' : 'text-[#1a1a1a]'}`}
              >
                <div className={`p-2 rounded-xl transition-all ${isActive ? '' : ''}`}>
                  <Icon size={24} strokeWidth={isActive ? 3 : 2} />
                </div>
                {isActive && <div className="w-1.5 h-1.5 bg-neo-blue rounded-full absolute bottom-1"></div>}
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
