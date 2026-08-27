"use client";

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

export default function DashboardRedirect() {
  const router = useRouter();
  const [statusText, setStatusText] = useState('Verifying your session...');

  useEffect(() => {
    async function checkRoleAndRedirect() {
      try {
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError || !session) {
          router.push('/login');
          return;
        }

        const userId = session.user.id;
        
        // Fetch user profile role and verification status
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('role, verification_status')
          .eq('id', userId)
          .single();

        if (profileError || !profile) {
          setStatusText('Profile not found. Please log in again.');
          setTimeout(() => {
            router.push('/login');
          }, 1500);
          return;
        }

        // Check if user confirmed their email via magic link or signup confirmation
        const isEmailConfirmed = !!(session.user.email_confirmed_at || (session.user as any).confirmed_at || session.user.user_metadata?.email_verified);

        if (profile.verification_status === 'pending_email') {
          if (isEmailConfirmed) {
            // Automatically upgrade status to email_verified
            await supabase
              .from('profiles')
              .update({ verification_status: 'email_verified' })
              .eq('id', userId);
            profile.verification_status = 'email_verified';
          } else {
            setStatusText('Email verification required. Please check your inbox or spam folder.');
            setTimeout(() => {
              router.push('/login');
            }, 2500);
            return;
          }
        }

        setStatusText(`Welcome ${session.user.user_metadata?.full_name || 'Commuter'}! Redirecting to ${profile.role} dashboard...`);

        // Redirect based on role
        if (profile.role === 'admin') {
          router.push('/dashboard/admin');
        } else if (profile.role === 'driver') {
          router.push('/dashboard/driver');
        } else {
          router.push('/dashboard/rider');
        }
      } catch (err) {
        console.error('Redirect error:', err);
        router.push('/login');
      }
    }

    checkRoleAndRedirect();
  }, [router]);

  return (
    <div className="flex min-h-screen bg-gazie-paper items-center justify-center text-gazie-navy">
      <div className="text-center space-y-4">
        <div className="w-12 h-12 border-4 border-gazie-yellow border-t-gazie-navy rounded-full animate-spin mx-auto" />
        <p className="font-display font-bold text-sm tracking-wide">{statusText}</p>
      </div>
    </div>
  );
}
