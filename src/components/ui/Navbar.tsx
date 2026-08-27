"use client";

import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { ShieldCheck, LogOut, User, ShieldAlert, Shield } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

import { Profile } from '@/types';

export default function Navbar() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    async function fetchProfile() {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          setLoading(false);
          return;
        }

        const { data, error } = await supabase
          .from('profiles')
          .select('full_name, role, verification_status')
          .eq('id', user.id)
          .single();

        if (!error && data) {
          setProfile(data as Profile);
        }
      } catch (err) {
        console.error('Error loading navbar user profile:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchProfile();
    
    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
      fetchProfile();
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  const getVerificationBadge = () => {
    if (!profile) return null;
    switch (profile.verification_status) {
      case 'verified':
        return (
          <span className="inline-flex items-center gap-1 bg-[#2D6A4F]/10 text-gazie-green border border-gazie-green/20 px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wider">
            <ShieldCheck className="w-3.5 h-3.5" /> VERIFIED
          </span>
        );
      case 'pending_review':
        return (
          <span className="inline-flex items-center gap-1 bg-gazie-yellow/10 text-amber-700 border border-gazie-yellow/20 px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wider">
            <Shield className="w-3.5 h-3.5" /> UNDER REVIEW
          </span>
        );
      case 'email_verified':
        return (
          <span className="inline-flex items-center gap-1 bg-blue-50 text-blue-700 border border-blue-200 px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wider">
            <Shield className="w-3.5 h-3.5" /> UNVERIFIED
          </span>
        );
      case 'rejected':
        return (
          <span className="inline-flex items-center gap-1 bg-red-50 text-red-700 border border-red-200 px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wider">
            <ShieldAlert className="w-3.5 h-3.5" /> REJECTED
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-white border-b-2 border-gazie-navy px-4 py-3 flex justify-between items-center shadow-sm">
      <div className="flex items-center gap-3">
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
            <span className="font-mono text-[9px] tracking-wider text-gazie-navy/60 font-bold mt-1">LUGBE PILOT v1</span>
          </div>
        </Link>
      </div>

      {!loading && profile && (
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex flex-col items-end">
            <span className="text-xs font-bold text-gazie-navy">{profile.full_name}</span>
            <span className="text-[10px] font-mono text-gazie-navy/60 uppercase font-semibold">{profile.role}</span>
          </div>

          <div className="flex items-center gap-2">
            {getVerificationBadge()}
            
            <Link
              href="/profile"
              className="p-1.5 rounded-lg border border-gazie-navy text-gazie-navy hover:bg-gazie-navy hover:text-white transition-all cursor-pointer"
              title="View Profile"
            >
              <User className="w-4 h-4" />
            </Link>

            <button
              onClick={handleSignOut}
              className="p-1.5 rounded-lg border border-red-200 text-red-600 bg-red-50 hover:bg-red-100 transition-all cursor-pointer"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
