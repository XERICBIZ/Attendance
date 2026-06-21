'use client';

import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import Link from 'next/link';
import { Plus, Book, Trash2 } from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';

export default function SubjectsPage() {
  const user = useAppStore((state) => state.user);

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['subjects', user?.id],
    queryFn: api.getSubjects,
    enabled: !!user,
  });

  const subjects = data?.subjects || [];

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    if (confirm('Are you sure you want to delete this subject?')) {
      await api.deleteSubject(id);
      refetch();
    }
  };

  return (
    <div className="min-h-screen p-4 md:p-8 pt-6">
      <div className="max-w-6xl mx-auto space-y-8">
        
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-black">Subjects</h1>
          </div>
          <Link href="/subjects/new" className="hidden md:flex items-center gap-2 px-6 py-3 bg-neo-blue text-white neo-button">
            <Plus size={20} strokeWidth={3} />
            Add Subject
          </Link>
        </header>

        {isLoading ? (
          <div className="flex justify-center py-20">
            <div className="w-12 h-12 border-4 border-[#1a1a1a] border-t-neo-blue rounded-full animate-spin"></div>
          </div>
        ) : subjects.length === 0 ? (
          <div className="neo-card p-12 bg-white text-center flex flex-col items-center justify-center border-dashed border-4 border-[#1a1a1a]">
            <div className="w-20 h-20 bg-neo-yellow border-4 border-[#1a1a1a] rounded-full flex items-center justify-center mb-6">
              <Book size={40} strokeWidth={2.5} />
            </div>
            <h3 className="text-2xl font-black mb-2">No subjects yet</h3>
            <p className="font-medium mb-8 max-w-md">
              Start by adding your first subject to track attendance, calculate safe bunks, and view analytics.
            </p>
            <Link href="/subjects/new" className="px-8 py-4 bg-neo-blue text-white neo-button text-lg">
              Add Subject Now
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {subjects.map((sub: any, i: number) => {
              const presentCount = sub.attendance?.filter((a: any) => a.status === 'Present').length || 0;
              const totalCount = sub.attendance?.filter((a: any) => a.status !== 'Cancelled').length || 0;
              const percentage = totalCount === 0 ? 0 : Math.round((presentCount / totalCount) * 100);
              
              const isSafe = percentage >= sub.minAttendance;
              
              const cardColors = ['bg-neo-yellow', 'bg-neo-green text-white', 'bg-neo-orange', 'bg-white'];
              const bgClass = cardColors[i % cardColors.length];

              return (
                <motion.div 
                  key={sub.id}
                  initial={{ opacity: 0, y: 10 }} 
                  animate={{ opacity: 1, y: 0 }} 
                  transition={{ delay: i * 0.05 }}
                  className={`neo-card p-6 relative group ${bgClass}`}
                >
                  <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={(e) => handleDelete(sub.id, e)} className="w-10 h-10 bg-white border-2 border-[#1a1a1a] text-[#1a1a1a] rounded-full flex items-center justify-center hover:bg-neo-red hover:text-white transition-colors">
                      <Trash2 size={18} strokeWidth={2.5} />
                    </button>
                  </div>
                  
                  <Link href={`/subjects/${sub.id}`}>
                    <div className="w-14 h-14 bg-white border-2 border-[#1a1a1a] text-[#1a1a1a] rounded-full flex items-center justify-center mb-6 font-black text-2xl shadow-[2px_2px_0px_0px_#1a1a1a]">
                      {sub.subjectName.substring(0, 1)}
                    </div>
                    <h3 className="text-2xl font-black mb-1 truncate pr-8">{sub.subjectName}</h3>
                    <p className="font-bold opacity-80 mb-6">{sub.subjectCode || 'No Code'} • {sub.type}</p>
                    
                    <div className="flex justify-between items-end bg-white border-2 border-[#1a1a1a] p-4 rounded-xl shadow-[2px_2px_0px_0px_#1a1a1a] text-[#1a1a1a]">
                      <div>
                        <p className="text-sm font-bold opacity-70 mb-1">Attendance</p>
                        <p className="text-3xl font-black flex items-baseline gap-1">
                          {percentage}%
                          <span className="text-sm font-bold opacity-60"> / {sub.minAttendance}%</span>
                        </p>
                      </div>
                      <div className={`px-4 py-2 text-sm font-black rounded-full border-2 border-[#1a1a1a] ${isSafe ? 'bg-neo-green text-white' : 'bg-neo-red text-white'}`}>
                        {isSafe ? 'Safe' : 'Danger'}
                      </div>
                    </div>
                  </Link>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
