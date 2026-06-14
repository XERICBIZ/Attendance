import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');

  if (code) {
    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() { return cookieStore.getAll(); },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          },
        },
      }
    );

    await supabase.auth.exchangeCodeForSession(code);
    
    const { data: { user } } = await supabase.auth.getUser();
    const hasName = user?.user_metadata?.full_name && user.user_metadata.full_name.trim().length > 0;

    // Redirect to onboarding if no name yet, otherwise go to dashboard
    return NextResponse.redirect(new URL(hasName ? '/dashboard' : '/onboarding', requestUrl.origin));
  }

  return NextResponse.redirect(new URL('/login', requestUrl.origin));
}
