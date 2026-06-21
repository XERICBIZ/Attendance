'use client';

import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell
} from 'recharts';
import { BookOpen, CheckCircle, XCircle, AlertTriangle, TrendingUp } from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import TodaySchedule from '@/components/TodaySchedule';

export default function DashboardPage() {
  const user = useAppStore((state) => state.user);
  
  const { data: subjectsData } = useQuery({
    queryKey: ['subjects', user?.id],
    queryFn: api.getSubjects,
    enabled: !!user,
  });

  const { data: attendanceData } = useQuery({
    queryKey: ['attendance', user?.id],
    queryFn: api.getAttendance,
    enabled: !!user,
  });

  const { data: timetableData } = useQuery({
    queryKey: ['timetable', user?.id],
    queryFn: api.getTimetable,
    enabled: !!user,
  });

  const todayDateObj = new Date();
  const currentDay = todayDateObj.toLocaleDateString('en-US', { weekday: 'long' });
  const todayDateString = todayDateObj.toISOString().split('T')[0];

  const { data: overridesData } = useQuery({ 
    queryKey: ['overrides', todayDateString, user?.id], 
    queryFn: () => api.getOverrides(todayDateString),
    enabled: !!user,
  });

  const subjects = subjectsData?.subjects || [];
  
  // Chart Data still uses lifetime overall
  const chartData = subjects.map((sub: any) => {
    const presentCount = sub.attendance?.filter((a: any) => a.status === 'Present').length || 0;
    const totalCount = sub.attendance?.filter((a: any) => a.status !== 'Cancelled').length || 0;
    const percentage = totalCount === 0 ? 0 : Math.round((presentCount / totalCount) * 100);
    return {
      name: sub.subjectCode || sub.subjectName.substring(0, 5),
      percentage,
      min: sub.minAttendance,
    };
  });

  // Top Cards use TODAY's stats
  const allAttendance = attendanceData?.attendance || [];
  const todaysAttendance = allAttendance.filter((a: any) => a.date === todayDateString);
  const attendedToday = todaysAttendance.filter((a: any) => a.status === 'Present').length;
  const missedToday = todaysAttendance.filter((a: any) => a.status === 'Absent').length;

  const overrides = overridesData?.overrides || [];
  const allTimetable = timetableData?.timetable || [];
  let baseClasses = allTimetable.filter((entry: any) => entry.day === currentDay);
  
  let todaysTotalClasses = baseClasses.length;
  overrides.forEach((o: any) => {
    if (o.type === 'extra') todaysTotalClasses++;
    if (o.type === 'cancel') todaysTotalClasses--;
  });

  let todayPercentage = todaysTotalClasses > 0 ? Math.round((attendedToday / todaysTotalClasses) * 100) : 0;



  return (
    <div className="min-h-screen p-4 md:p-8 pt-6">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Analytics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="neo-card bg-neo-yellow p-6 flex items-center justify-between">
            <div>
              <p className="font-bold text-lg mb-1">Today Overall</p>
              <h3 className="text-4xl font-black">{todayPercentage}%</h3>
            </div>
            <div className="w-14 h-14 bg-white border-2 border-[#1a1a1a] rounded-full flex items-center justify-center">
              <TrendingUp size={28} strokeWidth={2.5} />
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="neo-card bg-neo-green p-6 flex items-center justify-between">
            <div>
              <p className="font-bold text-lg mb-1">Attended Today</p>
              <h3 className="text-4xl font-black">{attendedToday}</h3>
            </div>
            <div className="w-14 h-14 bg-white text-[#1a1a1a] border-2 border-[#1a1a1a] rounded-full flex items-center justify-center">
              <CheckCircle size={28} strokeWidth={2.5} />
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="neo-card bg-neo-red p-6 flex items-center justify-between">
            <div>
              <p className="font-bold text-lg mb-1">Missed Today</p>
              <h3 className="text-4xl font-black">{missedToday}</h3>
            </div>
            <div className="w-14 h-14 bg-white text-[#1a1a1a] border-2 border-[#1a1a1a] rounded-full flex items-center justify-center">
              <XCircle size={28} strokeWidth={2.5} />
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="neo-card bg-[#f4f0e6] p-6 flex items-center justify-between">
            <div>
              <p className="font-bold text-lg mb-1">Classes Today</p>
              <h3 className="text-4xl font-black">{todaysTotalClasses}</h3>
            </div>
            <div className="w-14 h-14 bg-white border-2 border-[#1a1a1a] rounded-full flex items-center justify-center">
              <BookOpen size={28} strokeWidth={2.5} />
            </div>
          </motion.div>
        </div>

        {/* Chart & Alerts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          <div className="lg:col-span-2 flex flex-col gap-6">
            {/* Attendance Overview Chart */}
            <div className="neo-card p-6 md:p-8 bg-white">
              <h3 className="text-2xl font-black mb-6">Attendance Overview</h3>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#1a1a1a', fontWeight: 'bold' }} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fill: '#1a1a1a', fontWeight: 'bold' }} />
                    <Tooltip 
                      cursor={{ fill: '#f4f0e6' }}
                      contentStyle={{ borderRadius: '16px', border: '2px solid #1a1a1a', boxShadow: '4px 4px 0px 0px #1a1a1a', fontWeight: 'bold', color: '#1a1a1a' }}
                    />
                    <Bar dataKey="percentage" radius={[8, 8, 8, 8]}>
                      {chartData.map((entry: any, index: number) => (
                        <Cell key={`cell-${index}`} fill={entry.percentage >= entry.min ? '#1B9C73' : '#ED6A5A'} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Danger Zone */}
            <div className="neo-card p-6 md:p-8 bg-[#f4f0e6] flex flex-col border-2 border-[#1a1a1a]">
              <div className="flex items-center gap-2 mb-6 text-[#1a1a1a]">
                <AlertTriangle size={28} strokeWidth={3} className="text-neo-red" />
                <h3 className="text-2xl font-black">Danger Zone</h3>
              </div>
              
              <div className="flex-1 space-y-4">
                {chartData.filter((d: any) => d.percentage < d.min).length === 0 ? (
                  <div className="flex flex-col items-center justify-center p-6 bg-white border-2 border-[#1a1a1a] shadow-[4px_4px_0px_0px_#1a1a1a] rounded-xl">
                    <div className="w-16 h-16 bg-[#f4f0e6] border-2 border-[#1a1a1a] rounded-full flex items-center justify-center mb-4">
                      <CheckCircle size={32} strokeWidth={3} className="text-neo-green" />
                    </div>
                    <p className="font-bold text-center text-lg">All clear! Keep it up.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {chartData.filter((d: any) => d.percentage < d.min).map((sub: any, i: number) => (
                      <div key={i} className="p-4 rounded-xl bg-white border-2 border-[#1a1a1a] shadow-[4px_4px_0px_0px_#1a1a1a]">
                        <div className="flex justify-between items-center mb-2">
                          <h4 className="font-bold text-lg">{sub.name}</h4>
                          <span className="text-sm font-black px-3 py-1 bg-neo-red text-white border-2 border-[#1a1a1a] rounded-full">
                            {sub.percentage}%
                          </span>
                        </div>
                        <p className="text-sm font-medium">
                          You are {sub.min - sub.percentage}% below the required {sub.min}%.
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
            
          {/* Today's Schedule */}
          <div className="lg:col-span-1 h-full">
            <TodaySchedule />
          </div>

        </div>

      </div>
    </div>
  );
}
