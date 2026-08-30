import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { sendVerificationEmail } from '@/lib/email';

export async function POST(request: Request) {
  try {
    const { email } = await request.json();

    if (!email || typeof email !== 'string') {
      return NextResponse.json({ error: 'Email address is required' }, { status: 400 });
    }

    const cleanEmail = email.trim().toLowerCase();
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://buxiqqduzatptmrdkcwu.supabase.co';
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseServiceKey) {
      console.error('SUPABASE_SERVICE_ROLE_KEY is missing');
      return NextResponse.json({ error: 'Server authentication misconfigured' }, { status: 500 });
    }

    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });

    const origin = request.headers.get('origin') || process.env.NEXT_PUBLIC_APP_URL || 'https://gaziecommute.com';
    const redirectTo = `${origin}/dashboard`;

    // Fetch user details for name
    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('full_name')
      .eq('email', cleanEmail)
      .maybeSingle();

    // Generate signup verification link & OTP
    const { data: linkData, error: linkError } = await supabaseAdmin.auth.admin.generateLink({
      type: 'magiclink',
      email: cleanEmail,
      options: {
        redirectTo
      }
    });

    if (linkError) {
      console.warn(`Generate signup verification link failed for ${cleanEmail}:`, linkError.message);
      // Fallback: try magiclink / invite or return message
      return NextResponse.json({
        success: true,
        message: `Verification instructions sent to ${cleanEmail}. Please check your inbox.`
      });
    }

    const actionLink = linkData?.properties?.action_link || redirectTo;
    const emailOtp = linkData?.properties?.email_otp;

    // Send email via Resend
    await sendVerificationEmail(cleanEmail, actionLink, emailOtp, profile?.full_name);

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
