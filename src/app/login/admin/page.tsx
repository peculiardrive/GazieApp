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
  const [showPassword, setShowPassword] = useState(false);

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


  return (
    <div className="w-full space-y-6">
      {/* Mock Autofill for development */}
      {isMock && (
        <div className="bg-gazie-navy text-gazie-paper p-4 rounded-xl border border-gazie-navy shadow-sm text-xs space-y-2 text-center">
          <span className="font-bold text-gazie-yellow block">MOCK MODE ACTIVE</span>
          <div className="flex flex-col sm:flex-row gap-2 justify-center">
            <button 
              type="button" 
              onClick={() => { setEmail('09011111111@gazie.com'); setPassword('password123'); }}
              className="flex-1 bg-white/10 hover:bg-white/20 px-2 py-1.5 rounded font-mono text-[9px] uppercase font-bold cursor-pointer transition-all"
            >
              Seed Admin (09011111111@gazie.com)
            </button>
            <button 
              type="button" 
              onClick={() => { setEmail('gaziecommute@gmail.com'); setPassword('N3xtG3N@77%'); }}
              className="flex-1 bg-white/10 hover:bg-white/20 px-2 py-1.5 rounded font-mono text-[9px] uppercase font-bold cursor-pointer transition-all"
            >
              Peculiar Admin (gaziecommute@gmail.com)
            </button>
          </div>
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
              <label className="text-xs font-bold uppercase tracking-wider block text-gazie-navy/70 text-left">Password</label>
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
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gazie-navy/40 hover:text-gazie-navy focus:outline-none"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gazie-navy text-gazie-paper hover:bg-gazie-yellow hover:text-gazie-navy font-bold py-3 rounded-xl border border-gazie-navy transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm disabled:opacity-50"
            >
              {loading ? 'Authenticating...' : 'Secure Login'} <ArrowRight className="w-4 h-4" />
            </button>
          </form>

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
