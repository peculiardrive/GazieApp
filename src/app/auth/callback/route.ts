import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const token_hash = searchParams.get('token_hash');
  const type = searchParams.get('type') as any;
  const next = searchParams.get('next') || '/dashboard';

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://buxiqqduzatptmrdkcwu.supabase.co';
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ1eGlxcWR1emF0cHRtcmRrY3d1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk0NTYwMTUsImV4cCI6MjA5NTAzMjAxNX0.N_p6B0YpL24-7w9T2Yn7k38eP2W8P0-k0T9-5Y9-4Y8';

  const supabase = createClient(supabaseUrl, supabaseAnonKey);

  if (token_hash && type) {
    const { error } = await supabase.auth.verifyOtp({
      token_hash,
      type
    });
    if (!error) {
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  // Redirect to dashboard or login
  return NextResponse.redirect(`${origin}/dashboard`);
}
