"use client";

import React, { useState, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import { supabase, isMock } from '@/lib/supabase';
import { ShieldCheck, Mail, Lock, ArrowRight, ArrowLeft, Eye, EyeOff } from 'lucide-react';
import Link from 'next/link';

function AdminLoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [isForgotPassword, setIsForgotPassword] = useState(false);

  const handleAdminSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please enter your email and password');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password
      });

      if (signInError) {
        setError(signInError.message);
        setLoading(false);
        return;
      }

      if (data.session) {
        // Fetch profile to verify admin role
        const { data: profile, error: profileErr } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', data.session.user.id)
          .single();

        if (profileErr || !profile || profile.role !== 'admin') {
          // Deny access and sign out
          await supabase.auth.signOut();
          setError('Access Denied: This portal is reserved for administrators only.');
          setLoading(false);
          return;
        }

        router.push('/dashboard/admin');
      } else {
        setError('Verification failed.');
        setLoading(false);
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred during authentication.');
      setLoading(false);
    }
  };

  const handleAdminForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setError('Please enter your administrator email address');
      return;
    }
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim() })
      });
      const data = await res.json();

      if (!res.ok || data.error) {
        setError(data.error || 'Failed to send password reset email');
      } else {
        setSuccess(data.message || `A password reset link has been sent to ${email.trim()}. Please check your email inbox and spam folder.`);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to send password reset email');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full space-y-6">
      {/* Mock mode banner — credentials must be entered manually */}
      {isMock && (
        <div className="bg-gazie-navy text-gazie-paper p-3 rounded-xl border border-gazie-navy shadow-sm text-xs text-center">
          <span className="font-bold text-gazie-yellow block">MOCK MODE ACTIVE</span>
          <span className="text-gazie-paper/60">Enter your admin credentials below to continue.</span>
        </div>
      )}

      <div className="bg-white border-2 border-gazie-navy rounded-2xl shadow-md overflow-hidden">
        <div className="bg-gazie-navy text-gazie-paper text-center py-4 px-6">
          <ShieldCheck className="w-8 h-8 text-gazie-yellow mx-auto mb-1" />
          <h2 className="font-display font-extrabold text-lg tracking-wider">ADMIN ACCESS PORTAL</h2>
          <p className="text-[10px] text-gazie-paper/60 uppercase font-semibold">Authorized Personnel Only</p>
        </div>

        <div className="p-6">
          {error && (
            <div className="bg-red-50 text-red-700 text-xs p-3 rounded-lg border border-red-200 mb-4 font-semibold flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-red-600 inline-block animate-pulse" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="bg-green-50 text-gazie-green text-xs p-3 rounded-lg border border-gazie-green/20 mb-4 font-semibold flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-gazie-green inline-block animate-ping" />
              <span>{success}</span>
            </div>
          )}

          {isForgotPassword ? (
            <form onSubmit={handleAdminForgotPassword} className="space-y-4 animate-fadeIn">
              <div className="text-left space-y-1 mb-2">
                <h3 className="font-display font-extrabold text-base text-gazie-navy">Admin Password Recovery</h3>
                <p className="text-xs text-gazie-navy/60">
                  Enter your admin email address and we&apos;ll send you a password reset link.
                </p>
              </div>

              <div className="space-y-1.5 text-left">
                <label className="text-xs font-bold uppercase tracking-wider block text-gazie-navy/70">Admin Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gazie-navy/40" />
                  <input
                    type="email"
                    placeholder="e.g. admin@gazie.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-gazie-paper/20 border-2 border-gazie-navy rounded-xl text-sm focus:outline-none focus:border-gazie-yellow font-semibold"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gazie-navy text-gazie-paper hover:bg-gazie-yellow hover:text-gazie-navy font-bold py-3 rounded-xl border border-gazie-navy transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm disabled:opacity-50 text-sm"
              >
                {loading ? 'Sending link...' : 'Send Recovery Link'} <ArrowRight className="w-4 h-4" />
              </button>

              <div className="pt-2 text-center">
                <button
                  type="button"
                  onClick={() => {
                    setIsForgotPassword(false);
                    setError(null);
                    setSuccess(null);
                  }}
                  className="text-xs font-bold text-gazie-navy/70 hover:text-gazie-navy hover:underline cursor-pointer"
                >
                  ← Back to Admin Login
                </button>
              </div>
            </form>
          ) : (
            <form onSubmit={handleAdminSignIn} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider block text-gazie-navy/70 text-left">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gazie-navy/40" />
                  <input
                    type="email"
                    placeholder="e.g. admin@gazie.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-gazie-paper/20 border-2 border-gazie-navy rounded-xl text-sm focus:outline-none focus:border-gazie-yellow font-semibold"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-bold uppercase tracking-wider block text-gazie-navy/70 text-left">Password</label>
                  <button
                    type="button"
                    onClick={() => {
                      setIsForgotPassword(true);
                      setError(null);
                      setSuccess(null);
                    }}
                    className="text-[11px] font-bold text-gazie-navy/60 hover:text-gazie-navy hover:underline cursor-pointer"
                  >
                    Forgot password?
                  </button>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gazie-navy/40" />
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-10 py-2.5 bg-gazie-paper/20 border-2 border-gazie-navy rounded-xl text-sm focus:outline-none focus:border-gazie-yellow"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gazie-navy/40 hover:text-gazie-navy focus:outline-none cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gazie-navy text-gazie-paper hover:bg-gazie-yellow hover:text-gazie-navy font-bold py-3 rounded-xl border border-gazie-navy transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm disabled:opacity-50 text-sm"
              >
                {loading ? 'Authenticating...' : 'Secure Login'} <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          )}

          <div className="mt-4 pt-4 border-t border-dashed border-gray-150 flex justify-between items-center text-[10px] font-bold">
            <Link href="/login" className="text-gazie-navy hover:underline flex items-center gap-1">
              <ArrowLeft className="w-3.5 h-3.5" /> Commuter Portal
            </Link>
            <Link href="/" className="text-gazie-navy hover:underline">
              Back to Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AdminLoginPage() {
  return (
    <div className="flex flex-col min-h-screen bg-gazie-paper text-gazie-navy">
      <header className="sticky top-0 z-50 bg-white border-b-2 border-gazie-navy px-4 py-3 flex justify-between items-center shadow-sm">
        <Link href="/" className="flex items-center gap-3">
          <img
            src="/brand/gazie-commute-icon.png"
            alt="Gazie Commute Logo"
            className="h-9 w-9 object-contain rounded-lg border border-gazie-navy/15"
          />
          <div className="flex flex-col">
            <span className="font-display font-extrabold text-base leading-none tracking-tight text-gazie-navy">
              GAZIE <span className="text-gazie-yellow">COMMUTE</span>
            </span>
            <span className="font-mono text-[9px] tracking-wider text-gazie-navy/60 font-bold mt-1">SECURE CONSOLE</span>
          </div>
        </Link>
      </header>

      <main className="flex-1 flex flex-col justify-center items-center px-4 py-8 max-w-sm mx-auto w-full">
        <Suspense fallback={
          <div className="bg-white border-2 border-gazie-navy rounded-2xl shadow-md p-8 text-center w-full">
            <div className="w-8 h-8 border-4 border-gazie-yellow border-t-gazie-navy rounded-full animate-spin mx-auto mb-4" />
            <p className="text-sm font-semibold text-gazie-navy">Initializing Console...</p>
          </div>
        }>
          <AdminLoginForm />
        </Suspense>
      </main>
    </div>
  );
}
