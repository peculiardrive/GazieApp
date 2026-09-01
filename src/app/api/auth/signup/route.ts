import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { sendVerificationEmail } from '@/lib/email';

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
        { error: 'Too many signup attempts from this IP. Please wait a few minutes before trying again.' },
        { status: 429 }
      );
    }

    const { email, phone, fullName, password, role } = await request.json();

    if (!email || typeof email !== 'string') {
      return NextResponse.json({ error: 'Email address is required' }, { status: 400 });
    }
    if (!phone || typeof phone !== 'string') {
      return NextResponse.json({ error: 'Phone number is required' }, { status: 400 });
    }
    if (!fullName || typeof fullName !== 'string') {
      return NextResponse.json({ error: 'Full name is required' }, { status: 400 });
    }
    if (!password || typeof password !== 'string' || password.length < 6) {
      return NextResponse.json({ error: 'Password must be at least 6 characters' }, { status: 400 });
    }
    if (role !== 'rider' && role !== 'driver') {
      return NextResponse.json({ error: 'Please choose a valid account type' }, { status: 400 });
    }

    const cleanEmail = email.trim().toLowerCase();
    const cleanPhone = phone.trim();
    const cleanName = fullName.trim();

    if (checkRateLimit(`email:${cleanEmail}`, 3, 5 * 60 * 1000)) {
      return NextResponse.json(
        { error: 'Too many signup attempts for this email. Please check your inbox or wait 5 minutes.' },
        { status: 429 }
      );
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseServiceKey) {
      console.error('Supabase server configuration is incomplete');
      return NextResponse.json({ error: 'Server authentication misconfigured: Missing Supabase URL or service role key' }, { status: 500 });
    }

    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });

    const origin = request.headers.get('origin') || process.env.NEXT_PUBLIC_APP_URL || 'https://gaziecommute.com';
    const redirectTo = `${origin}/dashboard`;
    const verificationRequired = process.env.NEXT_PUBLIC_VERIFICATION_REQUIRED !== 'false';

    if (!verificationRequired) {
      const { data: createData, error: createError } = await supabaseAdmin.auth.admin.createUser({
        email: cleanEmail,
        password,
        email_confirm: true,
        user_metadata: {
          full_name: cleanName,
          phone: cleanPhone,
          role
        }
      });

      if (createError || !createData?.user) {
        console.error('Pilot signup user creation failed:', createError?.message || 'Missing created user');
        const alreadyRegistered = /already|registered|exists/i.test(createError?.message || '');
        return NextResponse.json(
          { error: alreadyRegistered ? 'This email address is already registered. Please sign in or reset your password.' : 'Unable to create your account right now. Please try again.' },
          { status: alreadyRegistered ? 409 : 500 }
        );
      }

      const { error: profileError } = await supabaseAdmin
        .from('profiles')
        .upsert({
          id: createData.user.id,
          phone: cleanPhone,
          full_name: cleanName,
          role,
          verification_status: 'email_verified'
        }, { onConflict: 'id' });

      if (profileError) {
        console.error('Profile upsert failed after pilot signup:', profileError.message);
        return NextResponse.json({ error: 'Account created, but profile setup failed. Please contact support.' }, { status: 500 });
      }

      return NextResponse.json({
        success: true,
        verificationRequired: false,
        userId: createData.user.id,
        message: 'Account created. You can enter your dashboard while admin verification remains pending.'
      });
    }

    const { data: linkData, error: linkError } = await supabaseAdmin.auth.admin.generateLink({
      type: 'signup',
      email: cleanEmail,
      password,
      options: {
        redirectTo,
        data: {
          full_name: cleanName,
          phone: cleanPhone,
          role
        }
      }
    });

    if (linkError || !linkData?.user) {
      console.error('Signup link generation failed:', linkError?.message || 'Missing generated user');
      const alreadyRegistered = /already|registered|exists/i.test(linkError?.message || '');
      return NextResponse.json(
        { error: alreadyRegistered ? 'This email address is already registered. Please sign in or reset your password.' : 'Unable to create your account right now. Please try again.' },
        { status: alreadyRegistered ? 409 : 500 }
      );
    }

    const { error: profileError } = await supabaseAdmin
      .from('profiles')
      .upsert({
        id: linkData.user.id,
        phone: cleanPhone,
        full_name: cleanName,
        role,
        verification_status: 'pending_email'
      }, { onConflict: 'id' });

    if (profileError) {
      console.error('Profile upsert failed after signup:', profileError.message);
      return NextResponse.json({ error: 'Account created, but profile setup failed. Please contact support.' }, { status: 500 });
    }

    const actionLink = linkData.properties?.action_link || redirectTo;
    const emailOtp = linkData.properties?.email_otp;

    await sendVerificationEmail(cleanEmail, actionLink, emailOtp, cleanName);

    return NextResponse.json({
      success: true,
      userId: linkData.user.id,
      message: `Account created. A verification code has been dispatched to ${cleanEmail}. Please check your inbox.`
    });
  } catch (error: any) {
    console.error('Error in /api/auth/signup:', error);
    return NextResponse.json(
      { error: error.message || 'Unable to create your account right now. Please try again.' },
      { status: 500 }
    );
  }
}
