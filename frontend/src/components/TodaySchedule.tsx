'use client';

import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { useAppStore } from '@/store/useAppStore';
import { Calendar, MapPin, User, Plus, X, Settings2, CheckCircle2 } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';

export default function TodaySchedule() {
  const queryClient = useQueryClient();
  const todayDateObj = new Date();
  const currentDay = todayDateObj.toLocaleDateString('en-US', { weekday: 'long' });
  const todayDateString = todayDateObj.toISOString().split('T')[0];

  const [showExtraModal, setShowExtraModal] = useState(false);
  const [showSubModal, setShowSubModal] = useState<string | null>(null); // holds timetableId
  
  // Form states
  const [selectedSubjectId, setSelectedSubjectId] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');

  const user = useAppStore((state) => state.user);
  
  const { data: subjectsData } = useQuery({ queryKey: ['subjects', user?.id], queryFn: api.getSubjects, enabled: !!user });
  const { data: timetableData } = useQuery({ queryKey: ['timetable', user?.id], queryFn: api.getTimetable, enabled: !!user });
  const { data: attendanceData } = useQuery({ queryKey: ['attendance', user?.id], queryFn: api.getAttendance, enabled: !!user });
  const { data: overridesData } = useQuery({ 
    queryKey: ['overrides', todayDateString, user?.id], 
    queryFn: () => api.getOverrides(todayDateString),
    enabled: !!user,
  });

  const subjects = subjectsData?.subjects || [];
  const allTimetable = timetableData?.timetable || [];
  const allAttendance = attendanceData?.attendance || [];
  const overrides = overridesData?.overrides || [];

  // Filter attendance for today
  const todaysAttendance = allAttendance.filter((a: any) => a.date === todayDateString);

  // Compute base classes for today
  let baseClasses = allTimetable.filter((entry: any) => entry.day === currentDay);

  // Apply Overrides
  let displayClasses: any[] = [];
  
  baseClasses.forEach((baseCls: any) => {
    // Check if there is an override for this specific timetable entry
    const override = overrides.find((o: any) => o.timetableId === baseCls.id);
    if (override) {
      if (override.type === 'cancel') {
        // Skip adding to display
        return;
      }
      if (override.type === 'substitute') {
        displayClasses.push({ ...baseCls, subjectId: override.subjectId, isSubstitute: true });
        return;
      }
    }
    displayClasses.push(baseCls);
  });

  // Add extra classes
  const extraClasses = overrides.filter((o: any) => o.type === 'extra').map((o: any) => ({
    id: o.id,
    subjectId: o.subjectId,
    startTime: o.startTime,
    endTime: o.endTime,
    isExtra: true
  }));

  displayClasses = [...displayClasses, ...extraClasses].sort((a, b) => a.startTime.localeCompare(b.startTime));

  // Handlers
  const handleAttendance = async (subjectId: string, status: string) => {
    try {
      await api.markAttendance({
        subjectId,
        date: todayDateString,
        status,
        notes: ''
      });
      queryClient.invalidateQueries({ queryKey: ['attendance'] });
      queryClient.invalidateQueries({ queryKey: ['subjects'] }); // to update analytics
    } catch (e) {
      alert('Failed to mark attendance');
    }
  };

  const handleAddExtraClass = async () => {
    if (!selectedSubjectId || !startTime || !endTime) return alert('Fill all fields');
    await api.createOverride({
      date: todayDateString,
      type: 'extra',
      subjectId: selectedSubjectId,
      startTime,
      endTime
    });
    setShowExtraModal(false);
    queryClient.invalidateQueries({ queryKey: ['overrides', todayDateString] });
  };

  const handleSubstitute = async (timetableId: string) => {
    if (!selectedSubjectId) return alert('Select a subject');
    await api.createOverride({
      date: todayDateString,
      type: 'substitute',
      timetableId,
      subjectId: selectedSubjectId
    });
    setShowSubModal(null);
    queryClient.invalidateQueries({ queryKey: ['overrides', todayDateString] });
  };

  const handleCancelClass = async (timetableId: string) => {
    await api.createOverride({
      date: todayDateString,
      type: 'cancel',
      timetableId
    });
    queryClient.invalidateQueries({ queryKey: ['overrides', todayDateString] });
  };

  return (
    <div className="neo-card p-6 md:p-8 bg-neo-yellow flex flex-col border-2 border-[#1a1a1a] h-full relative">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2 text-[#1a1a1a]">
          <Calendar size={28} strokeWidth={3} className="text-[#1a1a1a]" />
          <h3 className="text-2xl font-black">Today ({currentDay})</h3>
        </div>
      </div>
      
      <div className="flex-1 space-y-4 overflow-y-auto max-h-[500px] pb-20">
        {displayClasses.length === 0 ? (
          <div className="p-6 bg-white border-2 border-[#1a1a1a] shadow-[4px_4px_0px_0px_#1a1a1a] rounded-xl text-center">
            <p className="font-bold text-lg opacity-80">No classes today!</p>
          </div>
        ) : (
          displayClasses.map((cls: any, i: number) => {
            const subject = subjects.find((s: any) => s.id === cls.subjectId);
            const attendanceRecord = todaysAttendance.find((a: any) => a.subjectId === cls.subjectId);
            const isMarked = !!attendanceRecord;

            return (
              <div key={cls.id || i} className={`p-4 rounded-xl border-2 border-[#1a1a1a] shadow-[4px_4px_0px_0px_#1a1a1a] flex flex-col gap-3 ${isMarked ? 'bg-[#f4f0e6] opacity-80' : 'bg-white'}`}>
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-black text-sm mb-1">{cls.startTime} - {cls.endTime}</p>
                    <h4 className="font-bold text-xl leading-tight mb-2 flex items-center gap-2">
                      {subject?.subjectName || 'Unknown'}
                      {cls.isSubstitute && <span className="px-2 py-0.5 text-xs bg-neo-blue text-white rounded-full">Sub</span>}
                      {cls.isExtra && <span className="px-2 py-0.5 text-xs bg-neo-orange text-black rounded-full">Extra</span>}
                    </h4>
                    <div className="flex flex-wrap gap-2 text-xs font-bold opacity-80">
                      {cls.room && <span className="flex items-center gap-1"><MapPin size={12}/> {cls.room}</span>}
                      {subject?.facultyName && <span className="flex items-center gap-1"><User size={12}/> {subject.facultyName}</span>}
                    </div>
                  </div>
                  {isMarked && (
                    <div className="flex flex-col items-end">
                      <span className={`px-3 py-1 font-black text-sm rounded-full border-2 border-[#1a1a1a] ${attendanceRecord.status === 'Present' ? 'bg-neo-green text-white' : attendanceRecord.status === 'Absent' ? 'bg-neo-red text-white' : 'bg-[#1a1a1a] text-white'}`}>
                        {attendanceRecord.status}
                      </span>
                    </div>
                  )}
                </div>

                {!isMarked && (
                  <div className="flex flex-col gap-2 mt-2">
                    <div className="flex gap-2">
                      <button onClick={() => handleAttendance(cls.subjectId, 'Present')} className="flex-1 py-2 bg-neo-green text-white font-bold rounded-lg border-2 border-[#1a1a1a] hover:translate-y-[1px] transition-all">
                        Present
                      </button>
                      <button onClick={() => handleAttendance(cls.subjectId, 'Absent')} className="flex-1 py-2 bg-neo-red text-white font-bold rounded-lg border-2 border-[#1a1a1a] hover:translate-y-[1px] transition-all">
                        Absent
                      </button>
                    </div>
                    {/* Hide Cancel/Substitute if it's already an Extra class */}
                    {!cls.isExtra && (
                      <div className="flex items-center justify-between px-1">
                        <button onClick={() => handleCancelClass(cls.id)} className="text-xs font-bold underline opacity-70 hover:opacity-100">
                          Cancel Class
                        </button>
                        <button onClick={() => setShowSubModal(cls.id)} className="text-xs font-bold underline opacity-70 hover:opacity-100 flex items-center gap-1">
                          <Settings2 size={12} /> Substitute
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Add Extra Class Button floating at bottom */}
      <div className="absolute bottom-6 left-0 right-0 flex justify-center">
        <button 
          onClick={() => setShowExtraModal(true)}
          className="w-14 h-14 bg-neo-blue text-white rounded-full border-2 border-[#1a1a1a] shadow-[4px_4px_0px_0px_#1a1a1a] flex items-center justify-center hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_#1a1a1a] transition-all"
        >
          <Plus size={28} strokeWidth={3} />
        </button>
      </div>

      {/* Extra Class Modal */}
      {showExtraModal && (
        <div className="absolute inset-0 bg-black/50 z-10 flex items-center justify-center p-4 rounded-2xl">
          <div className="bg-white p-6 rounded-2xl border-2 border-[#1a1a1a] w-full max-w-sm space-y-4">
            <div className="flex justify-between items-center mb-2">
              <h4 className="font-black text-xl">Add Extra Class</h4>
              <button onClick={() => setShowExtraModal(false)}><X size={20}/></button>
            </div>
            <select className="neo-input w-full" onChange={e => setSelectedSubjectId(e.target.value)}>
              <option value="">Select subject...</option>
              {subjects.map((s:any) => <option key={s.id} value={s.id}>{s.subjectName}</option>)}
            </select>
            <div className="flex gap-2">
              <input type="time" className="neo-input w-full" onChange={e => setStartTime(e.target.value)} />
              <input type="time" className="neo-input w-full" onChange={e => setEndTime(e.target.value)} />
            </div>
            <button onClick={handleAddExtraClass} className="w-full py-3 bg-neo-blue text-white font-bold rounded-xl border-2 border-[#1a1a1a]">
              Save Extra Class
            </button>
          </div>
        </div>
      )}

      {/* Substitute Modal */}
      {showSubModal && (
        <div className="absolute inset-0 bg-black/50 z-10 flex items-center justify-center p-4 rounded-2xl">
          <div className="bg-white p-6 rounded-2xl border-2 border-[#1a1a1a] w-full max-w-sm space-y-4">
            <div className="flex justify-between items-center mb-2">
              <h4 className="font-black text-xl">Substitute Class</h4>
              <button onClick={() => setShowSubModal(null)}><X size={20}/></button>
            </div>
            <p className="text-sm font-bold opacity-80 mb-2">Select the new subject being taught instead:</p>
            <select className="neo-input w-full" onChange={e => setSelectedSubjectId(e.target.value)}>
              <option value="">Select subject...</option>
              {subjects.map((s:any) => <option key={s.id} value={s.id}>{s.subjectName}</option>)}
            </select>
            <button onClick={() => handleSubstitute(showSubModal)} className="w-full py-3 bg-neo-orange text-[#1a1a1a] font-bold rounded-xl border-2 border-[#1a1a1a]">
              Confirm Substitution
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
