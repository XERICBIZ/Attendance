'use client';

import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { api } from '@/lib/api';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Loader2, Save } from 'lucide-react';
import Link from 'next/link';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useAppStore } from '@/store/useAppStore';

const timetableSchema = z.object({
  subjectId: z.string().min(1, 'Please select a subject'),
  day: z.enum(['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']),
  startTime: z.string().min(1, 'Start time is required'),
  endTime: z.string().min(1, 'End time is required'),
  room: z.string().optional(),
});

type TimetableFormValues = z.infer<typeof timetableSchema>;

export default function ManageTimetablePage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const user = useAppStore((state) => state.user);

  const { data: subjectsData } = useQuery({
    queryKey: ['subjects', user?.id],
    queryFn: api.getSubjects,
    enabled: !!user,
  });

  const subjects = subjectsData?.subjects || [];

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<TimetableFormValues>({
    resolver: zodResolver(timetableSchema),
    defaultValues: {
      day: 'Monday',
    }
  });

  const onSubmit = async (data: TimetableFormValues) => {
    try {
      await api.createTimetableEntry(data);
      queryClient.invalidateQueries({ queryKey: ['timetable'] });
      router.push('/timetable');
    } catch (error) {
      console.error('Failed to save schedule', error);
      alert('Failed to save schedule. Please try again.');
    }
  };

  return (
    <div className="min-h-screen p-4 md:p-8 pt-10 md:pt-8">
      <div className="max-w-xl mx-auto space-y-8">
        
        <header className="flex items-center gap-4 mb-8">
          <Link href="/timetable" className="w-12 h-12 neo-card flex items-center justify-center hover:bg-neo-yellow transition-colors cursor-pointer bg-white">
            <ArrowLeft size={24} strokeWidth={3} />
          </Link>
          <div>
            <h1 className="text-3xl font-black">Add Schedule</h1>
          </div>
        </header>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="neo-card p-6 md:p-8 bg-white"
        >
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-5">
              
              <div>
                <label className="block font-bold mb-2 text-lg">Subject *</label>
                <select
                  {...register('subjectId')}
                  className="neo-input bg-[#f4f0e6] appearance-none"
                >
                  <option value="">Select a subject...</option>
                  {subjects.map((sub: any) => (
                    <option key={sub.id} value={sub.id}>{sub.subjectName}</option>
                  ))}
                </select>
                {errors.subjectId && <p className="text-neo-red font-bold text-sm mt-2">{errors.subjectId.message}</p>}
              </div>

              <div>
                <label className="block font-bold mb-2 text-lg">Day of Week</label>
                <select
                  {...register('day')}
                  className="neo-input bg-[#f4f0e6] appearance-none"
                >
                  <option value="Monday">Monday</option>
                  <option value="Tuesday">Tuesday</option>
                  <option value="Wednesday">Wednesday</option>
                  <option value="Thursday">Thursday</option>
                  <option value="Friday">Friday</option>
                  <option value="Saturday">Saturday</option>
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="block font-bold mb-2 text-lg">Start Time</label>
                  <input
                    type="time"
                    {...register('startTime')}
                    className="neo-input bg-[#f4f0e6]"
                  />
                  {errors.startTime && <p className="text-neo-red font-bold text-sm mt-2">{errors.startTime.message}</p>}
                </div>
                <div>
                  <label className="block font-bold mb-2 text-lg">End Time</label>
                  <input
                    type="time"
                    {...register('endTime')}
                    className="neo-input bg-[#f4f0e6]"
                  />
                  {errors.endTime && <p className="text-neo-red font-bold text-sm mt-2">{errors.endTime.message}</p>}
                </div>
              </div>

              <div>
                <label className="block font-bold mb-2 text-lg">Room / Location (Optional)</label>
                <input
                  {...register('room')}
                  className="neo-input bg-[#f4f0e6]"
                  placeholder="e.g. Room 402"
                />
              </div>

            </div>

            <div className="pt-6">
              <button
                type="submit"
                disabled={isSubmitting || subjects.length === 0}
                className="w-full py-4 bg-neo-blue text-white text-xl neo-button flex justify-center items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isSubmitting ? <Loader2 className="animate-spin" size={24} /> : 'Save Class Schedule'}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </div>
  );
}
