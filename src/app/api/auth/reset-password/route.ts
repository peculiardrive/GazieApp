import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { sendPasswordResetEmail } from '@/lib/email';

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
    const redirectTo = `${origin}/auth/reset-password`;

    // Generate recovery link & OTP
    const { data: linkData, error: linkError } = await supabaseAdmin.auth.admin.generateLink({
      type: 'recovery',
      email: cleanEmail,
      options: {
        redirectTo
      }
    });

    if (linkError) {
      console.warn(`Generate recovery link failed for ${cleanEmail}:`, linkError.message);
      // If user does not exist, return a generic success to prevent email fishing while giving clear feedback
      return NextResponse.json({
        success: true,
        message: `If an account exists for ${cleanEmail}, a recovery link and code have been sent. Please check your inbox and spam folder.`
      });
    }

    const actionLink = linkData?.properties?.action_link || redirectTo;
    const emailOtp = linkData?.properties?.email_otp;

    // Send email via Resend
    await sendPasswordResetEmail(cleanEmail, actionLink, emailOtp);

    return NextResponse.json({
      success: true,
      message: `Password reset email sent to ${cleanEmail}. Please check your inbox (and spam folder).`
    });

  } catch (error: any) {
    console.error('Error in /api/auth/reset-password:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to send password reset email. Please try again or contact support.' },
      { status: 500 }
    );
  }
}
