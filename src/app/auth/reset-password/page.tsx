"use client";

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import Navbar from '@/components/ui/Navbar';
import Link from 'next/link';
import { Lock, Eye, EyeOff, CheckCircle2, ArrowRight, AlertCircle, Mail, KeyRound } from 'lucide-react';

function ResetPasswordContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [email, setEmail] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ text: string; isError: boolean } | null>(null);
  const [success, setSuccess] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // 1. Prepopulate email from query params if available
    const paramEmail = searchParams.get('email');
    if (paramEmail) {
      setEmail(paramEmail);
    }

    // 2. Check if active session already exists
    supabase.auth.getSession().then((res: any) => {
      if (res.data?.session) {
        setIsAuthenticated(true);
      }
    });

    // 3. Listen to auth state changes (e.g. when recovery token hash is processed)
    const { data: authListener } = supabase.auth.onAuthStateChange(async (event: any, session: any) => {
      if (event === 'PASSWORD_RECOVERY' || session) {
        setIsAuthenticated(true);
        setMessage({ text: 'Recovery link verified. Please enter your new password below.', isError: false });
      }
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [searchParams]);

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password || !confirmPassword) {
      setMessage({ text: 'Please fill in all password fields.', isError: true });
      return;
    }

    if (password.length < 6) {
      setMessage({ text: 'Password must be at least 6 characters long.', isError: true });
      return;
    }

    if (password !== confirmPassword) {
      setMessage({ text: 'Passwords do not match. Please re-check.', isError: true });
      return;
    }

    setLoading(true);
    setMessage(null);

    try {
      // If user is not yet authenticated via link, verify their 6-digit OTP code first
      if (!isAuthenticated) {
        if (!email.trim() || !otpCode.trim()) {
          setMessage({ text: 'Please enter your email and the 6-digit recovery code sent to you.', isError: true });
          setLoading(false);
          return;
        }

        const { data: otpData, error: otpError } = await supabase.auth.verifyOtp({
          email: email.trim().toLowerCase(),
          token: otpCode.trim(),
          type: 'recovery'
        });

        if (otpError) {
          throw new Error(otpError.message || 'Invalid or expired recovery code.');
        }

        setIsAuthenticated(true);
      }

      // Update password with active recovery session
      const { error: updateError } = await supabase.auth.updateUser({
        password: password
      });

      if (updateError) {
        throw updateError;
      }

      setSuccess(true);
      setMessage({ text: 'Your password has been successfully updated! Redirecting to dashboard...', isError: false });
      setTimeout(() => {
        router.push('/dashboard');
      }, 2000);

    } catch (err: any) {
      setMessage({ text: err.message || 'Failed to update password. Please try again.', isError: true });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full bg-white border-2 border-gazie-navy rounded-2xl p-6 sm:p-8 shadow-md space-y-6 text-center">
      <div className="flex flex-col items-center gap-2">
        <div className="w-12 h-12 bg-gazie-yellow border-2 border-gazie-navy rounded-2xl flex items-center justify-center shadow-sm">
          <Lock className="w-6 h-6 text-gazie-navy" />
        </div>
        <h1 className="font-display font-black text-2xl tracking-tight text-gazie-navy mt-1">
          {success ? 'Password Updated!' : 'Set New Password'}
        </h1>
        <p className="text-xs text-gazie-navy/70 max-w-xs mx-auto font-medium">
          {success 
            ? 'Your password was changed successfully. Redirecting you to dashboard...'
            : 'Create a new password for your Gazie Commute account.'
          }
        </p>
      </div>

      {message && (
        <div className={`p-3.5 rounded-xl text-xs font-semibold flex items-center gap-2 text-left ${
          message.isError 
            ? 'bg-red-50 text-red-700 border border-red-200' 
            : 'bg-green-50 text-gazie-green border border-gazie-green/20'
        }`}>
          {message.isError ? <AlertCircle className="w-4 h-4 shrink-0" /> : <CheckCircle2 className="w-4 h-4 shrink-0" />}
          <span>{message.text}</span>
        </div>
      )}

      {!success ? (
        <form onSubmit={handleResetPassword} className="space-y-4 text-left">
          
          {/* If opened directly without session, provide email & OTP code fields */}
          {!isAuthenticated && (
            <div className="space-y-4 p-4 bg-gazie-paper/30 border border-gazie-navy/20 rounded-xl">
              <div className="text-[11px] font-bold text-gazie-navy flex items-center gap-1.5 uppercase tracking-wider">
                <KeyRound className="w-3.5 h-3.5 text-gazie-navy" /> Recovery Credentials
              </div>
              
              <div className="space-y-1">
                <label className="text-xs font-bold uppercase tracking-wider block text-gazie-navy/70">
                  Registered Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gazie-navy/40" />
                  <input
                    type="email"
                    placeholder="e.g. commuter@gazie.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-white border-2 border-gazie-navy rounded-xl text-xs font-semibold focus:outline-none focus:border-gazie-yellow"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold uppercase tracking-wider block text-gazie-navy/70">
                  6-Digit Recovery Code
                </label>
                <input
                  type="text"
                  maxLength={8}
                  placeholder="Enter 6-digit code"
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value.replace(/[^0-9]/g, ''))}
                  className="w-full text-center tracking-[0.25em] font-mono text-lg font-black py-2 bg-white border-2 border-gazie-navy rounded-xl focus:outline-none focus:border-gazie-yellow text-gazie-navy"
                  required
                />
              </div>
            </div>
          )}

          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider block text-gazie-navy/70">
              New Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gazie-navy/40" />
              <input
                type={showPassword ? "text" : "password"}
                placeholder="At least 6 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-10 py-2.5 bg-gazie-paper/20 border-2 border-gazie-navy rounded-xl text-sm focus:outline-none focus:border-gazie-yellow font-medium"
                required
                minLength={6}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gazie-navy/40 hover:text-gazie-navy focus:outline-none"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider block text-gazie-navy/70">
              Confirm New Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gazie-navy/40" />
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Repeat new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-gazie-paper/20 border-2 border-gazie-navy rounded-xl text-sm focus:outline-none focus:border-gazie-yellow font-medium"
                required
                minLength={6}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 bg-gazie-navy text-gazie-paper hover:bg-gazie-yellow hover:text-gazie-navy font-bold py-3 rounded-xl border border-gazie-navy transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm disabled:opacity-50 text-sm"
          >
            {loading ? 'Updating Password...' : 'Save New Password'} <ArrowRight className="w-4 h-4" />
          </button>
        </form>
      ) : (
        <div className="pt-2">
          <Link
            href="/login"
            className="inline-flex items-center justify-center gap-2 w-full bg-gazie-navy text-gazie-paper font-bold py-3 rounded-xl hover:bg-gazie-yellow hover:text-gazie-navy transition border border-gazie-navy text-sm shadow-sm"
          >
            Continue to Login <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      )}

      <div className="border-t border-dashed border-gazie-navy/15 pt-4 text-center">
        <Link href="/login" className="text-xs font-bold text-gazie-navy/70 hover:text-gazie-navy hover:underline">
          ← Return to Sign In
        </Link>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="flex flex-col min-h-screen bg-gazie-paper text-gazie-navy">
      <Navbar />
      <main className="flex-1 flex flex-col justify-center items-center px-4 py-8 max-w-lg mx-auto w-full">
        <Suspense fallback={
          <div className="bg-white border-2 border-gazie-navy rounded-2xl p-8 text-center w-full">
            <div className="w-8 h-8 border-4 border-gazie-yellow border-t-gazie-navy rounded-full animate-spin mx-auto mb-4" />
            <p className="text-xs font-semibold text-gazie-navy">Loading Reset Console...</p>
          </div>
        }>
          <ResetPasswordContent />
        </Suspense>
      </main>
    </div>
  );
}
