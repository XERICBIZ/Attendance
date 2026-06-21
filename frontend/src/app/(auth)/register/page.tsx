'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Mail, Lock, Loader2, User as UserIcon, ArrowRight } from 'lucide-react';
import Link from 'next/link';

const registerSchema = z.object({
  fullName: z.string().min(2, { message: 'Name must be at least 2 characters' }),
  email: z.string().email({ message: 'Invalid email address' }),
  password: z.string().min(6, { message: 'Password must be at least 6 characters' }),
});

type RegisterFormValues = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const router = useRouter();
  const supabase = createClient();
  const [error, setError] = useState<string | null>(null);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterFormValues) => {
    setError(null);
    const { data: authData, error } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: {
        data: {
          full_name: data.fullName,
        }
      }
    });

    if (error) {
      setError(error.message);
    } else if (authData.session === null) {
      // Supabase requires email confirmation
      setError('Registration successful! Please check your email to confirm your account before logging in.');
    } else {
      // User is logged in immediately (email confirmation is disabled)
      router.push('/dashboard');
    }
  };

  const handleGoogleLogin = async () => {
    setIsGoogleLoading(true);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (error) {
      setError(error.message);
      setIsGoogleLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F7F5EE] p-6 text-[#1a1a1a] relative overflow-hidden">
      {/* Decorative neo-brutalist background shapes */}
      <div className="absolute -top-10 right-10 w-48 h-48 bg-neo-green border-[3px] border-[#1a1a1a] rounded-full opacity-50 pointer-events-none"></div>
      <div className="absolute bottom-10 -left-10 w-40 h-40 bg-neo-orange border-[3px] border-[#1a1a1a] opacity-50 pointer-events-none -rotate-12"></div>
      
      <div className="neo-card w-full max-w-md p-8 relative z-10 bg-white mt-10 mb-10">
        <div className="text-center mb-8">
          <div className="inline-block bg-neo-blue text-white border-2 border-[#1a1a1a] px-4 py-1 font-black text-xl mb-4 shadow-[2px_2px_0px_0px_#1a1a1a]">
            AttendX
          </div>
          <h1 className="text-3xl font-black tracking-tight">Create Account</h1>
          <p className="text-gray-600 mt-2 font-medium">Join us and take control of your attendance.</p>
        </div>

        {error && (
          <div className="bg-neo-red text-white border-2 border-[#1a1a1a] font-bold p-3 rounded-xl mb-6 text-sm text-center shadow-[2px_2px_0px_0px_#1a1a1a]">
            {error}
          </div>
        )}

        <button
          onClick={handleGoogleLogin}
          disabled={isGoogleLoading}
          className="w-full flex items-center justify-center gap-3 bg-white border-2 border-[#1a1a1a] text-[#1a1a1a] py-3 rounded-xl font-bold mb-6 hover:bg-gray-50 transition-all shadow-[3px_3px_0px_0px_#1a1a1a] active:translate-y-1 active:translate-x-1 active:shadow-none disabled:opacity-70 disabled:active:translate-y-0 disabled:active:translate-x-0 disabled:active:shadow-[3px_3px_0px_0px_#1a1a1a]"
        >
          {isGoogleLoading ? <Loader2 className="animate-spin" size={20} /> : (
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
          )}
          Sign up with Google
        </button>

        <div className="relative mb-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t-2 border-[#1a1a1a]"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-3 bg-white font-bold border-2 border-[#1a1a1a] rounded-full">OR</span>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div>
            <label className="block text-sm font-bold mb-1 ml-1">Full Name</label>
            <div className="relative">
              <UserIcon className="absolute left-3 top-3.5 text-gray-500" size={20} />
              <input
                {...register('fullName')}
                type="text"
                placeholder="John Doe"
                className="neo-input pl-10"
              />
            </div>
            {errors.fullName && <p className="text-neo-red font-bold text-xs mt-1 ml-1">{errors.fullName.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-bold mb-1 ml-1">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3 top-3.5 text-gray-500" size={20} />
              <input
                {...register('email')}
                type="email"
                placeholder="hello@attendx.com"
                className="neo-input pl-10"
              />
            </div>
            {errors.email && <p className="text-neo-red font-bold text-xs mt-1 ml-1">{errors.email.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-bold mb-1 ml-1">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-3.5 text-gray-500" size={20} />
              <input
                {...register('password')}
                type="password"
                placeholder="••••••••"
                className="neo-input pl-10"
              />
            </div>
            {errors.password && <p className="text-neo-red font-bold text-xs mt-1 ml-1">{errors.password.message}</p>}
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3 bg-neo-yellow text-[#1a1a1a] neo-button flex justify-center items-center gap-2 text-lg mt-2 disabled:opacity-70 disabled:active:translate-y-0 disabled:active:translate-x-0 disabled:active:shadow-[3px_3px_0px_0px_#1a1a1a]"
          >
            {isSubmitting ? <Loader2 className="animate-spin" size={20} /> : (
              <>
                Create Account <ArrowRight size={20} strokeWidth={3} />
              </>
            )}
          </button>
        </form>

        <div className="mt-8 pt-6 border-t-2 border-[#1a1a1a] text-center">
          <p className="text-sm font-medium">
            Already have an account?{' '}
            <Link href="/login" className="font-black text-neo-red hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
