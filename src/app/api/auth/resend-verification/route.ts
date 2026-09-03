import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { sendVerificationEmail } from '@/lib/email';

// In-memory rate limiting map for email verification requests
const rateLimitMap = new Map<string, { count: number; expiresAt: number }>();

function checkRateLimit(key: string, maxLimit = 3, windowMs = 5 * 60 * 1000): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(key);
  if (!entry || entry.expiresAt < now) {
    rateLimitMap.set(key, { count: 1, expiresAt: now + windowMs });
    return false;
  }
  if (entry.count >= maxLimit) {
    return true;
  }
  entry.count += 1;
  return false;
}

export async function POST(request: Request) {
  try {
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0].trim() || 'unknown-ip';
    if (checkRateLimit(`ip:${ip}`, 5, 5 * 60 * 1000)) {
      return NextResponse.json(
        { error: 'Too many requests from this IP. Please wait a few minutes before trying again.' },
        { status: 429 }
      );
    }

    const { email } = await request.json();

    if (!email || typeof email !== 'string') {
      return NextResponse.json({ error: 'Email address is required' }, { status: 400 });
    }

    const cleanEmail = email.trim().toLowerCase();

    if (checkRateLimit(`email:${cleanEmail}`, 3, 5 * 60 * 1000)) {
      return NextResponse.json(
        { error: 'Too many verification attempts for this email. Please check your inbox or wait 5 minutes.' },
        { status: 429 }
      );
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://buxiqqduzatptmrdkcwu.supabase.co';
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseServiceKey) {
      console.error('SUPABASE_SERVICE_ROLE_KEY is missing in server environment variables');
      return NextResponse.json({ error: 'Server authentication misconfigured: Missing SUPABASE_SERVICE_ROLE_KEY' }, { status: 500 });
    }

    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });

    const origin = request.headers.get('origin') || process.env.NEXT_PUBLIC_APP_URL || 'https://gaziecommute.com';
    const redirectTo = `${origin}/dashboard`;

    // Generate signup verification link & OTP
    const { data: linkData, error: linkError } = await supabaseAdmin.auth.admin.generateLink({
      type: 'magiclink',
      email: cleanEmail,
      options: {
        redirectTo
      }
    });

    if (linkError || !linkData?.user) {
      console.warn(`Generate signup verification link failed for ${cleanEmail}:`, linkError?.message);
      return NextResponse.json({
        success: true,
        message: `If an account exists for ${cleanEmail}, verification instructions have been dispatched. Please check your inbox.`
      });
    }

    // Fetch user details for name using user id
    let fullName: string | undefined;
    try {
      const { data: profile } = await supabaseAdmin
        .from('profiles')
        .select('full_name')
        .eq('id', linkData.user.id)
        .maybeSingle();
      fullName = profile?.full_name || (linkData.user.user_metadata as any)?.full_name;
    } catch {
      fullName = (linkData.user.user_metadata as any)?.full_name;
    }

    const actionLink = linkData?.properties?.action_link || redirectTo;
    const emailOtp = linkData?.properties?.email_otp;

    // Send email via Resend
    await sendVerificationEmail(cleanEmail, actionLink, emailOtp, fullName);

    return NextResponse.json({
      success: true,
      message: `A verification code has been dispatched to ${cleanEmail}. Please check your inbox.`
    });

  } catch (error: any) {
    console.error('Error in /api/auth/resend-verification:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to dispatch verification email.' },
      { status: 500 }
    );
  }
}
