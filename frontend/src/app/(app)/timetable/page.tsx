'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { motion } from 'framer-motion';
import { MapPin, User, Calendar as CalendarIcon, Plus, Settings2 } from 'lucide-react';
import Link from 'next/link';
import { useAppStore } from '@/store/useAppStore';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export default function TimetablePage() {
  const user = useAppStore((state) => state.user);
  const [selectedDay, setSelectedDay] = useState('Monday');

  const { data: timetableData, isLoading } = useQuery({
    queryKey: ['timetable', user?.id],
    queryFn: api.getTimetable,
    enabled: !!user,
  });

  const { data: subjectsData } = useQuery({
    queryKey: ['subjects', user?.id],
    queryFn: api.getSubjects,
    enabled: !!user,
  });

  const timetable = timetableData?.timetable || [];
  const subjects = subjectsData?.subjects || [];

  const dayClasses = timetable
    .filter((entry: any) => entry.day === selectedDay)
    .sort((a: any, b: any) => a.startTime.localeCompare(b.startTime));

  return (
    <div className="min-h-screen p-4 md:p-8 pt-6">
      <div className="max-w-6xl mx-auto space-y-8">
        
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <h1 className="text-3xl font-black">Timetable</h1>
          <div className="flex items-center gap-3">
            <Link href="/timetable/manage" className="flex items-center gap-2 px-6 py-3 bg-neo-blue text-white neo-button">
              <Settings2 size={20} strokeWidth={3} />
              Manage Schedule
            </Link>
          </div>
        </header>

        {/* Day Selector */}
        <div className="flex overflow-x-auto pb-6 gap-3 snap-x scrollbar-hide">
          {DAYS.map(day => (
            <button
              key={day}
              onClick={() => setSelectedDay(day)}
              className={`snap-center shrink-0 px-8 py-4 font-black transition-all rounded-full border-2 border-[#1a1a1a] ${
                selectedDay === day 
                  ? 'bg-neo-blue text-white shadow-[4px_4px_0px_0px_#1a1a1a] translate-y-[-4px]' 
                  : 'bg-white text-[#1a1a1a] hover:bg-neo-yellow shadow-[2px_2px_0px_0px_#1a1a1a]'
              }`}
            >
              {day}
            </button>
          ))}
        </div>

        {/* Classes List */}
        <div className="space-y-6">
          {isLoading ? (
            <div className="flex justify-center py-20">
              <div className="w-12 h-12 border-4 border-[#1a1a1a] border-t-neo-blue rounded-full animate-spin"></div>
            </div>
          ) : dayClasses.length === 0 ? (
            <div className="neo-card p-12 bg-[#f4f0e6] text-center border-dashed border-4 border-[#1a1a1a]">
              <div className="w-20 h-20 bg-white border-4 border-[#1a1a1a] rounded-full flex items-center justify-center mx-auto mb-6">
                <CalendarIcon size={40} strokeWidth={2.5} />
              </div>
              <h3 className="text-2xl font-black">Free Day!</h3>
              <p className="font-bold mt-2">No classes scheduled for {selectedDay}.</p>
            </div>
          ) : (
            dayClasses.map((cls: any, i: number) => {
              const subject = subjects.find((s: any) => s.id === cls.subjectId);
              const cardColors = ['bg-neo-yellow', 'bg-neo-green text-white', 'bg-neo-orange', 'bg-neo-red text-white'];
              const bgClass = cardColors[i % cardColors.length];
              
              return (
                <motion.div 
                  key={cls.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className={`neo-card p-6 md:p-8 flex flex-col md:flex-row gap-6 items-start md:items-center ${bgClass}`}
                >
                  <div className="shrink-0 w-40 bg-white text-[#1a1a1a] border-2 border-[#1a1a1a] rounded-xl p-4 text-center shadow-[4px_4px_0px_0px_#1a1a1a]">
                    <p className="text-2xl font-black">{cls.startTime}</p>
                    <p className="font-bold opacity-80">{cls.endTime}</p>
                  </div>

                  <div className="flex-1">
                    <h3 className="text-3xl font-black tracking-tight">{subject?.subjectName || 'Unknown Subject'}</h3>
                    <div className="flex flex-wrap gap-4 mt-4 font-bold opacity-90">
                      {cls.room && (
                        <div className="flex items-center gap-2 bg-white/20 px-3 py-1 rounded-lg border-2 border-transparent">
                          <MapPin size={18} strokeWidth={2.5} /> {cls.room}
                        </div>
                      )}
                      {subject?.facultyName && (
                        <div className="flex items-center gap-2 bg-white/20 px-3 py-1 rounded-lg border-2 border-transparent">
                          <User size={18} strokeWidth={2.5} /> {subject.facultyName}
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
