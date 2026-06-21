'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { CalendarDays, ChevronDown, ChevronUp, CheckCircle2, XCircle, Ban, Filter } from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';

// Group attendance records by date
function groupByDate(attendance: any[]) {
  const grouped: Record<string, any[]> = {};
  attendance.forEach((record) => {
    if (!grouped[record.date]) grouped[record.date] = [];
    grouped[record.date].push(record);
  });
  // Sort dates descending (newest first)
  return Object.entries(grouped).sort(([a], [b]) => b.localeCompare(a));
}

function formatDate(dateStr: string) {
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
}

const STATUS_CONFIG: Record<string, { color: string; icon: any; label: string }> = {
  Present: { color: 'bg-neo-green text-white', icon: CheckCircle2, label: 'Present' },
  Absent: { color: 'bg-neo-red text-white', icon: XCircle, label: 'Absent' },
  Cancelled: { color: 'bg-[#1a1a1a] text-white', icon: Ban, label: 'Cancelled' },
};

export default function HistoryPage() {
  const user = useAppStore((state) => state.user);
  const [expandedDate, setExpandedDate] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('All');

  const { data: attendanceData, isLoading } = useQuery({
    queryKey: ['attendance', user?.id],
    queryFn: api.getAttendance,
    enabled: !!user,
  });

  const { data: subjectsData } = useQuery({
    queryKey: ['subjects', user?.id],
    queryFn: api.getSubjects,
    enabled: !!user,
  });

  const subjects = subjectsData?.subjects || [];
  const allAttendance = attendanceData?.attendance || [];

  const filteredAttendance = filterStatus === 'All'
    ? allAttendance
    : allAttendance.filter((a: any) => a.status === filterStatus);

  const grouped = groupByDate(filteredAttendance);

  return (
    <div className="min-h-screen p-4 md:p-8 pt-6">
      <div className="max-w-3xl mx-auto space-y-8">

        {/* Header */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-black flex items-center gap-3">
              <CalendarDays size={32} strokeWidth={3} />
              Attendance History
            </h1>
            <p className="text-sm font-bold opacity-60 mt-1">Your complete date-wise record</p>
          </div>

          {/* Filter */}
          <div className="flex items-center gap-2 flex-wrap">
            <Filter size={16} strokeWidth={3} />
            {['All', 'Present', 'Absent', 'Cancelled'].map((status) => (
              <button
                key={status}
                onClick={() => setFilterStatus(status)}
                className={`px-4 py-2 rounded-full font-bold border-2 border-[#1a1a1a] text-sm transition-all ${
                  filterStatus === status
                    ? 'bg-[#1a1a1a] text-white shadow-none'
                    : 'bg-white hover:bg-[#f4f0e6]'
                }`}
              >
                {status}
              </button>
            ))}
          </div>
        </header>

        {/* Stats Row */}
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: 'Total', value: allAttendance.length, color: 'bg-[#f4f0e6]' },
            { label: 'Present', value: allAttendance.filter((a: any) => a.status === 'Present').length, color: 'bg-neo-green' },
            { label: 'Absent', value: allAttendance.filter((a: any) => a.status === 'Absent').length, color: 'bg-neo-red' },
          ].map((stat) => (
            <div key={stat.label} className={`neo-card ${stat.color} p-4 text-center`}>
              <p className="font-bold text-sm">{stat.label}</p>
              <p className="text-3xl font-black">{stat.value}</p>
            </div>
          ))}
        </div>

        {/* History List */}
        {isLoading ? (
          <div className="text-center py-20 font-bold opacity-50">Loading history...</div>
        ) : grouped.length === 0 ? (
          <div className="neo-card p-12 bg-white text-center">
            <CalendarDays size={48} strokeWidth={1.5} className="mx-auto mb-4 opacity-30" />
            <p className="text-xl font-black opacity-50">No records found</p>
            <p className="text-sm font-bold opacity-40 mt-1">Your attendance history will appear here once you start marking it on the Dashboard.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {grouped.map(([date, records]) => {
              const presentCount = records.filter((r) => r.status === 'Present').length;
              const totalNonCancelled = records.filter((r) => r.status !== 'Cancelled').length;
              const percent = totalNonCancelled > 0 ? Math.round((presentCount / totalNonCancelled) * 100) : 0;
              const isExpanded = expandedDate === date;

              return (
                <motion.div
                  key={date}
                  layout
                  className="neo-card bg-white overflow-hidden"
                >
                  {/* Date Row - clickable to expand */}
                  <button
                    onClick={() => setExpandedDate(isExpanded ? null : date)}
                    className="w-full flex items-center justify-between p-5 text-left"
                  >
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 rounded-xl border-2 border-[#1a1a1a] flex items-center justify-center font-black text-lg ${percent >= 75 ? 'bg-neo-green text-white' : percent > 0 ? 'bg-neo-yellow' : 'bg-neo-red text-white'}`}>
                        {percent}%
                      </div>
                      <div>
                        <p className="font-black text-lg leading-tight">{formatDate(date)}</p>
                        <p className="text-sm font-bold opacity-60">{records.length} class{records.length !== 1 ? 'es' : ''} · {presentCount} attended</p>
                      </div>
                    </div>
                    {isExpanded ? <ChevronUp strokeWidth={3} size={20} /> : <ChevronDown strokeWidth={3} size={20} />}
                  </button>

                  {/* Expanded Records */}
                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden"
                      >
                        <div className="border-t-2 border-[#1a1a1a] divide-y-2 divide-[#1a1a1a]/10">
                          {records
                            .sort((a, b) => (a.createdAt || '').localeCompare(b.createdAt || ''))
                            .map((record: any, i: number) => {
                              const subject = subjects.find((s: any) => s.id === record.subjectId);
                              const statusCfg = STATUS_CONFIG[record.status] || STATUS_CONFIG['Absent'];
                              const Icon = statusCfg.icon;
                              return (
                                <div key={i} className="flex items-center justify-between px-5 py-4">
                                  <div>
                                    <p className="font-bold">{subject?.subjectName || 'Unknown Subject'}</p>
                                    {subject?.subjectCode && <p className="text-xs font-bold opacity-50">{subject.subjectCode}</p>}
                                  </div>
                                  <span className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full font-bold text-sm border-2 border-[#1a1a1a] ${statusCfg.color}`}>
                                    <Icon size={14} strokeWidth={3} />
                                    {statusCfg.label}
                                  </span>
                                </div>
                              );
                            })}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
          </div>
        )}

      </div>
    </div>
  );
}
