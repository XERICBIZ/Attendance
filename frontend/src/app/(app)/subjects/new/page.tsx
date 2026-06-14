'use client';

import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { api } from '@/lib/api';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Loader2, Save } from 'lucide-react';
import Link from 'next/link';
import { useQueryClient } from '@tanstack/react-query';

const subjectSchema = z.object({
  subjectName: z.string().min(2, 'Subject name is required'),
  subjectCode: z.string().optional(),
  facultyName: z.string().optional(),
  credits: z.number().min(1).max(10),
  type: z.enum(['Theory', 'Lab', 'Tutorial', 'Workshop']),
  minAttendance: z.number().min(0).max(100),
});

type SubjectFormValues = z.infer<typeof subjectSchema>;

export default function NewSubjectPage() {
  const router = useRouter();
  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SubjectFormValues>({
    resolver: zodResolver(subjectSchema),
    defaultValues: {
      credits: 3,
      type: 'Theory',
      minAttendance: 75,
    }
  });

  const onSubmit = async (data: SubjectFormValues) => {
    try {
      await api.createSubject(data);
      // Invalidate queries so the subjects list updates
      queryClient.invalidateQueries({ queryKey: ['subjects'] });
      router.push('/subjects');
    } catch (error) {
      console.error('Failed to create subject', error);
      alert('Failed to save subject. Please try again.');
    }
  };


  return (
    <div className="min-h-screen p-4 md:p-8 pt-10 md:pt-8">
      <div className="max-w-xl mx-auto space-y-8">
        
        <header className="flex items-center gap-4 mb-8">
          <Link href="/subjects" className="w-12 h-12 neo-card flex items-center justify-center hover:bg-neo-yellow transition-colors cursor-pointer">
            <ArrowLeft size={24} strokeWidth={3} />
          </Link>
          <div>
            <h1 className="text-3xl font-black">Create Subject</h1>
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
                <label className="block font-bold mb-2 text-lg">Subject name</label>
                <input
                  {...register('subjectName')}
                  className="neo-input bg-[#f4f0e6]"
                  placeholder="e.g. UserFlow app"
                />
                {errors.subjectName && <p className="text-neo-red font-bold text-sm mt-2">{errors.subjectName.message}</p>}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="block font-bold mb-2 text-lg">Subject code</label>
                  <input
                    {...register('subjectCode')}
                    className="neo-input bg-[#f4f0e6]"
                    placeholder="e.g. CS201"
                  />
                </div>
                <div>
                  <label className="block font-bold mb-2 text-lg">Faculty name</label>
                  <input
                    {...register('facultyName')}
                    className="neo-input bg-[#f4f0e6]"
                    placeholder="e.g. Dr. Turing"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                <div>
                  <label className="block font-bold mb-2 text-lg">Type</label>
                  <select
                    {...register('type')}
                    className="neo-input bg-[#f4f0e6] appearance-none"
                  >
                    <option value="Theory">Theory</option>
                    <option value="Lab">Lab</option>
                    <option value="Tutorial">Tutorial</option>
                    <option value="Workshop">Workshop</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold mb-2 text-lg">Credits</label>
                  <input
                    type="number"
                    {...register('credits', { valueAsNumber: true })}
                    className="neo-input bg-[#f4f0e6]"
                  />
                </div>
                <div>
                  <label className="block font-bold mb-2 text-lg">Min (%)</label>
                  <input
                    type="number"
                    {...register('minAttendance', { valueAsNumber: true })}
                    className="neo-input bg-[#f4f0e6]"
                  />
                </div>
              </div>
            </div>

            <div className="pt-6">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-4 bg-neo-blue text-white text-xl neo-button flex justify-center items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isSubmitting ? <Loader2 className="animate-spin" size={24} /> : 'Create Subject'}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </div>
  );
}
