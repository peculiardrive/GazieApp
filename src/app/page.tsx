"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { supabase, isMock } from '@/lib/supabase';
import { ShieldCheck, Car, Users, Calendar, ArrowRight, ShieldAlert, BadgeCheck, Activity } from 'lucide-react';
import Navbar from '@/components/ui/Navbar';

export default function Home() {
  const [session, setSession] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Live Activity State
  const [activityData, setActivityData] = useState<any>({
    ridesMatchedToday: 0,
    verifiedRiders: 0,
    verifiedDrivers: 0,
    mostActiveRouteToday: null,
    recentActivity: []
  });
  const [tickerIndex, setTickerIndex] = useState(0);

  const getRelativeTime = (isoString: string): string => {
    try {
      const d = new Date(isoString);
      const diffMs = Date.now() - d.getTime();
      const diffMins = Math.floor(diffMs / (1000 * 60));
      if (diffMins < 1) return 'just now';
      if (diffMins === 1) return '1 minute ago';
      if (diffMins < 60) return `${diffMins} minutes ago`;
      const diffHours = Math.floor(diffMins / 60);
      if (diffHours === 1) return '1 hour ago';
      if (diffHours < 24) return `${diffHours} hours ago`;
      return d.toLocaleDateString();
    } catch {
      return '';
    }
  };

  const loadActivityData = async () => {
    try {
      if (isMock) {
        // Aggregate browser LocalStorage data dynamically in mock mode
        if (typeof window === 'undefined') return;

        const profiles = JSON.parse(localStorage.getItem('gazie_profiles') || '[]');
        const bookings = JSON.parse(localStorage.getItem('gazie_bookings') || '[]');

        const todayStr = new Date().toLocaleDateString('en-CA');

        const cleanArea = (name: string): string => {
          if (!name) return 'Unknown';
          const lower = name.toLowerCase();
          if (lower.includes('lugbe')) return 'Lugbe';
          if (lower.includes('cbd') || lower.includes('central')) return 'CBD';
          if (lower.includes('garki')) return 'Garki';
          if (lower.includes('wuse')) return 'Wuse';
          if (lower.includes('airport')) return 'Airport Road';
          return name.split(',')[0].trim();
        };

        const vRiders = profiles.filter((p: any) => p.role === 'rider' && p.verification_status === 'verified').length;
        const vDrivers = profiles.filter((p: any) => p.role === 'driver' && p.verification_status === 'verified').length;

        // Matches today (status: confirmed or completed)
        const bookingsToday = bookings.filter((b: any) => 
          b.requested_date === todayStr && ['confirmed', 'completed'].includes(b.status)
        );

        // Recent bookings (confirmed or completed, sorted by created_at desc)
        const recentBookings = [...bookings]
          .filter((b: any) => ['confirmed', 'completed'].includes(b.status))
          .sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
          .slice(0, 5);

        // Calculate most active route today
        const routeCounts: Record<string, number> = {};
        bookingsToday.forEach((b: any) => {
          const key = `${cleanArea(b.pickup)} → ${cleanArea(b.destination)}`;
          routeCounts[key] = (routeCounts[key] || 0) + 1;
        });

        let mostActiveRouteToday = null;
        let maxCount = 0;
        Object.entries(routeCounts).forEach(([route, count]) => {
          if (count > maxCount) {
            maxCount = count;
            mostActiveRouteToday = route;
          }
        });

        const recentActivity = recentBookings.map((b: any) => ({
          route: `${cleanArea(b.pickup)} → ${cleanArea(b.destination)}`,
          createdAt: b.created_at
        }));

        setActivityData({
          ridesMatchedToday: bookingsToday.length,
          verifiedRiders: vRiders,
          verifiedDrivers: vDrivers,
          mostActiveRouteToday,
          recentActivity
        });
      } else {
        // Fetch from secure anonymized API route
        const res = await fetch('/api/live-activity');
        if (res.ok) {
          const data = await res.json();
          setActivityData(data);
        }
      }
    } catch (err) {
      console.error('Error fetching live activity data:', err);
    }
  };

  useEffect(() => {
    async function checkAuth() {
      const { data: { session } } = await supabase.auth.getSession();
      setSession(session);
      if (session?.user) {
        const { data } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();
        setProfile(data);
      }
      setLoading(false);
    }
    checkAuth();
    loadActivityData();

    // Poll API every 45 seconds to keep counts fresh
    const pollInterval = setInterval(loadActivityData, 45000);
    return () => clearInterval(pollInterval);
  }, []);

  // Ambient rotating ticker logic
  useEffect(() => {
    if (activityData?.recentActivity && activityData.recentActivity.length > 0) {
      const tickerInterval = setInterval(() => {
        setTickerIndex((prev) => (prev + 1) % activityData.recentActivity.length);
      }, 5000);
      return () => clearInterval(tickerInterval);
    }
  }, [activityData]);

  return (
    <div className="flex flex-col min-h-screen bg-gazie-paper text-gazie-navy">
      <Navbar />

      <main className="flex-1 flex flex-col justify-center items-center px-4 py-8 max-w-lg mx-auto w-full">
        {/* Pilot Corridor Badge */}
        <div className="bg-gazie-yellow border-2 border-gazie-navy text-gazie-navy font-bold font-mono text-xs px-3.5 py-1.5 rounded-full mb-5 uppercase tracking-wider shadow-sm flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#2D6A4F] animate-pulse" />
          <span>Abuja Pilot Corridor • Lugbe & Airport Road</span>
        </div>

        {/* Hero Section */}
        <div className="text-center space-y-3.5 mb-6">
          <h1 className="font-display font-extrabold text-3xl sm:text-5xl leading-tight tracking-tight text-gazie-navy">
            Commute Together to Work.
          </h1>
          <p className="font-sans text-xs sm:text-sm text-gazie-navy/75 leading-relaxed max-w-md mx-auto font-medium">
            <strong className="text-gazie-navy font-bold">Not a taxi or on-demand cab app.</strong> Gazie connects verified neighbors already travelling the Lugbe corridor to Central Area & Secretariat so drivers offset fuel and riders commute safely.
          </p>
        </div>

        {/* The Two Essential Actions: Driver vs Rider Grouped Together */}
        <div className="w-full bg-white border-2 border-gazie-navy rounded-2xl p-4 sm:p-5 shadow-md mb-6 text-left">
          <div className="border-b border-dashed border-gazie-navy/15 pb-2.5 mb-4">
            <span className="font-mono text-[10px] font-black uppercase text-gazie-navy/60 tracking-wider block">
              Choose your commute mode
            </span>
          </div>

          {/* The Two Primary Action Buttons - Grouped Close Together */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
            {/* Rider Button */}
            <Link
              href="/login?role=rider"
              className="flex items-center justify-between sm:justify-center gap-2 bg-gazie-yellow text-gazie-navy border-2 border-gazie-navy font-bold p-3.5 rounded-xl hover:bg-gazie-navy hover:text-gazie-paper transition-all duration-200 shadow-sm cursor-pointer group text-left sm:text-center"
            >
              <div>
                <span className="font-display font-black text-xs sm:text-sm uppercase tracking-wider block">
                  Rider
                </span>
                <span className="font-sans text-[11px] text-gazie-navy/80 block group-hover:text-gazie-paper/90 font-medium">
                  (Find a verified ride)
                </span>
              </div>
              <ArrowRight className="w-4 h-4 shrink-0 transition-transform group-hover:translate-x-0.5 sm:hidden" />
            </Link>

            {/* Driver Button */}
            <Link
              href="/login?role=driver"
              className="flex items-center justify-between sm:justify-center gap-2 bg-gazie-navy text-gazie-paper border-2 border-gazie-navy font-bold p-3.5 rounded-xl hover:bg-gazie-yellow hover:text-gazie-navy transition-all duration-200 shadow-sm cursor-pointer group text-left sm:text-center"
            >
              <div>
                <span className="font-display font-black text-xs sm:text-sm uppercase tracking-wider block">
                  Driver
                </span>
                <span className="font-sans text-[11px] text-gazie-paper/85 block group-hover:text-gazie-navy/80 font-medium">
                  (Share empty seats)
                </span>
              </div>
              <ArrowRight className="w-4 h-4 shrink-0 transition-transform group-hover:translate-x-0.5 sm:hidden" />
            </Link>
          </div>

          {/* Quick Details Below the Buttons */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-3 border-t border-dashed border-gazie-navy/15 text-[11px]">
            <div className="bg-gazie-paper/60 p-2.5 rounded-xl border border-gazie-navy/10 space-y-0.5">
              <span className="font-bold text-gazie-navy block">For Daily Commuters</span>
              <p className="text-[10px] text-gazie-navy/70 leading-relaxed font-medium">
                Find a verified ride going your way. Book the day before with fixed community rates and no price surges.
              </p>
            </div>
            <div className="bg-gazie-paper/60 p-2.5 rounded-xl border border-gazie-navy/10 space-y-0.5">
              <span className="font-bold text-gazie-navy block">For Car Owners</span>
              <p className="text-[10px] text-gazie-navy/70 leading-relaxed font-medium">
                Share empty seats with verified commuters on your routine route.
              </p>
            </div>
          </div>
        </div>

        {/* Active Pilot Corridors Quick-Tap Strip */}
        <div className="w-full bg-white border border-gazie-navy/15 rounded-2xl p-4 shadow-xs space-y-2.5 mb-6 text-left">
          <div className="flex items-center justify-between">
            <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-gazie-navy/70 flex items-center gap-1.5">
              <span>📍</span> Active Lugbe Pilot Corridors
            </span>
            <span className="text-[9px] font-mono font-bold bg-[#2D6A4F]/10 text-[#2D6A4F] px-2 py-0.5 rounded-full">
              Morning & Evening
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
            <div className="p-2.5 bg-gazie-paper/50 rounded-xl border border-gazie-navy/10 flex items-center justify-between">
              <div>
                <span className="font-bold text-gazie-navy block">Lugbe Federal Housing</span>
                <span className="text-[10px] text-gazie-navy/60">→ Federal Secretariat & CBD</span>
              </div>
              <span className="font-mono text-[10px] font-bold text-[#2D6A4F]">₦800 - ₦1,000</span>
            </div>

            <div className="p-2.5 bg-gazie-paper/50 rounded-xl border border-gazie-navy/10 flex items-center justify-between">
              <div>
                <span className="font-bold text-gazie-navy block">TradeMore / Airport Road</span>
                <span className="text-[10px] text-gazie-navy/60">→ Berger & Wuse II</span>
              </div>
              <span className="font-mono text-[10px] font-bold text-[#2D6A4F]">₦800 - ₦1,000</span>
            </div>
          </div>
        </div>

        {/* Existing Logged-in Commuter Status bar */}
        {!loading && session && (
          <div className="w-full bg-white border-2 border-gazie-navy rounded-2xl p-4 shadow-sm mb-6 flex items-center justify-between">
            <div className="flex items-center gap-2 text-left">
              <BadgeCheck className="w-5 h-5 text-gazie-green" />
              <div>
                <span className="text-xs font-bold text-gazie-navy block">Signed in as {profile?.full_name || 'Commuter'}</span>
                <span className="text-[10px] text-gazie-navy/60 uppercase font-mono">{profile?.role || 'member'}</span>
              </div>
            </div>
            <Link
              href="/dashboard"
              className="bg-gazie-navy text-white text-xs font-bold px-3 py-1.5 rounded-lg border border-gazie-navy hover:bg-gazie-yellow hover:text-gazie-navy transition flex items-center gap-1"
            >
              Dashboard <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        )}

        {/* Live Activity Section */}
        {(() => {
          let tickerText = "Join Gazie Commute for a safer commute today!";
          if (activityData?.recentActivity && activityData.recentActivity.length > 0) {
            const activeItem = activityData.recentActivity[tickerIndex];
            const timeStr = getRelativeTime(activeItem.createdAt);
            tickerText = `🎉 Match confirmed on the ${activeItem.route} route ${timeStr ? `(${timeStr})` : ''}`;
          }

          return (
            <section className="w-full max-w-md mx-auto mb-8 transition-all duration-300 hover:shadow-lg">
              <div className="bg-white border-2 border-gazie-navy rounded-2xl overflow-hidden flex flex-col relative shadow-md">
                
                {/* Header */}
                <div className="bg-gazie-navy text-gazie-paper p-3 flex justify-between items-center px-4">
                  <span className="font-mono text-xs tracking-widest font-bold">LIVE ACTIVITY</span>
                  <span className="font-display text-sm font-semibold tracking-wider">GAZIE TICKER</span>
                  <div className="w-2 h-2 rounded-full bg-gazie-yellow animate-ping" />
                </div>

                {/* Main Stats Body */}
                <div className="p-5 space-y-4">
                  {activityData.ridesMatchedToday > 0 ? (
                    <div className="text-center space-y-1">
                      <span className="text-[10px] font-bold text-gazie-navy opacity-60 uppercase block tracking-wider">TODAY'S ACTIVITY</span>
                      <span className="font-display font-extrabold text-2xl text-gazie-navy block">
                        {activityData.ridesMatchedToday} {activityData.ridesMatchedToday === 1 ? 'Ride' : 'Rides'} Matched Today
                      </span>
                    </div>
                  ) : (
                    <div className="text-center py-2 space-y-1.5">
                      <span className="text-[10px] font-bold text-gazie-navy opacity-60 uppercase block tracking-wider">TODAY'S ACTIVITY</span>
                      <span className="font-display font-extrabold text-base text-gazie-navy block leading-tight">
                        Be one of the first to join Gazie Commute
                      </span>
                      <span className="text-[10px] text-gazie-navy/60 italic block font-medium">No rides matched yet today</span>
                    </div>
                  )}

                  {/* Verified Count Row */}
                  <div className="grid grid-cols-2 gap-4 border-t border-dashed border-gazie-navy/15 pt-4 text-center">
                    <div>
                      <span className="text-[9px] font-bold text-gazie-navy/60 uppercase block tracking-wider">VERIFIED RIDERS</span>
                      <span className="font-mono text-lg font-black text-gazie-navy block mt-0.5">{activityData.verifiedRiders}</span>
                    </div>
                    <div>
                      <span className="text-[9px] font-bold text-gazie-navy/60 uppercase block tracking-wider">VERIFIED DRIVERS</span>
                      <span className="font-mono text-lg font-black text-gazie-navy block mt-0.5">{activityData.verifiedDrivers}</span>
                    </div>
                  </div>

                  {/* Most Active Route today */}
                  {activityData.ridesMatchedToday > 0 && activityData.mostActiveRouteToday && (
                    <div className="border-t border-dashed border-gazie-navy/15 pt-4 text-center">
                      <span className="text-[9px] font-bold text-gazie-navy/60 uppercase block tracking-wider">MOST ACTIVE ROUTE TODAY</span>
                      <span className="font-sans text-sm font-extrabold text-gazie-navy mt-1 block">
                        {activityData.mostActiveRouteToday}
                      </span>
                    </div>
                  )}
                </div>

                {/* Perforated Divider */}
                <div className="relative my-1">
                  <div className="absolute left-0 top-1/2 -translate-x-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-gazie-paper border-r-2 border-gazie-navy z-10" />
                  <div className="absolute right-0 top-1/2 translate-x-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-gazie-paper border-l-2 border-gazie-navy z-10" />
                  <div className="w-full border-t-2 border-dashed border-gazie-navy/30" />
                </div>

                {/* Bottom rotating ticker */}
                <div className="p-4 bg-gazie-paper/30 flex items-center justify-center text-center px-4 min-h-[56px] select-none">
                  <p key={tickerIndex} className="font-mono text-[10px] font-bold text-[#2D6A4F] animate-fadeIn leading-relaxed">
                    {tickerText}
                  </p>
                </div>

              </div>
            </section>
          );
        })()}

        {/* Feature Highlights Grid */}
        <div className="w-full grid grid-cols-1 gap-4 mb-8">
          <div className="flex items-start gap-4 p-4 bg-white border border-gazie-navy/10 rounded-xl">
            <div className="p-2 bg-[#2D6A4F]/10 text-gazie-green rounded-lg">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-display font-bold text-sm text-gazie-navy">Strict Verification</h3>
              <p className="text-xs text-gazie-navy/70 mt-0.5">
                Every rider uploads a National Identification Number (NIN). Drivers upload licence, insurance, and vehicle particulars. Admin reviews every application.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4 p-4 bg-white border border-gazie-navy/10 rounded-xl">
            <div className="p-2 bg-gazie-yellow/10 text-amber-800 rounded-lg">
              <Calendar className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-display font-bold text-sm text-gazie-navy">Book the Day Before</h3>
              <p className="text-xs text-gazie-navy/70 mt-0.5">
                Schedule your pickup by evening. Wake up knowing your commute is locked in and verified. No real-time booking frustration.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4 p-4 bg-white border border-gazie-navy/10 rounded-xl">
            <div className="p-2 bg-blue-50 text-blue-800 rounded-lg">
              <Car className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-display font-bold text-sm text-gazie-navy">All Major Abuja Corridors</h3>
              <p className="text-xs text-gazie-navy/70 mt-0.5">
                Connecting Airport Road, Kubwa, Gwarinpa, Apo, Lokogoma, Nyanya, CBD, Federal Secretariat, Wuse, and beyond.
              </p>
            </div>
          </div>
        </div>

        {/* Why Gazie Commute Section (Hidden for cleaner UI layout) */}
        {/*
        <section id="about" className="w-full bg-white border-2 border-gazie-navy rounded-2xl p-5 sm:p-6 shadow-sm space-y-4 mb-8 scroll-mt-20">
          <div className="border-b border-dashed border-gazie-navy/10 pb-3">
            <h2 className="font-display font-extrabold text-lg tracking-tight text-gazie-navy uppercase">Why Gazie Commute</h2>
          </div>
          
          <div className="font-sans text-xs text-gazie-navy/80 space-y-3.5 leading-relaxed">
            <p className="font-bold text-gazie-navy">
              Transportation should be built on trust, convenience, and community.
            </p>
            
            <p>
              As Nigeria's capital, Abuja deserves a modern, well-structured transportation system. Yet daily commuting still depends heavily on the informal "Along" system — passengers heading the same direction sharing taxis to split fares. It has served residents for years, but it remains unstructured, offers little accountability, and gives no real assurance about who you're travelling with.
            </p>
            
            <p>
              Meanwhile, thousands of private vehicles move across the city every day with empty seats, while commuters face high transport costs, unreliable options, and safety concerns — and drivers absorb the full cost of fuel alone on trips they're already making.
            </p>
            
            <p>
              Gazie Commute is building a better alternative: <span className="bg-gazie-yellow/35 px-1.5 py-0.5 rounded font-bold text-gazie-navy">community-verified ride sharing</span>. Instead of connecting strangers, we help people travelling the same direction share rides with those they already know — or who belong to trusted communities like estates, workplaces, schools, churches, professional associations, and social groups. Riders get an affordable, trusted way to commute. Drivers get to offset their fuel costs on journeys they're already taking.
            </p>
            
            <p>
              Our vision: the trusted mobility network for Abuja and beyond — making commuting safer, more affordable, more convenient, and more efficient, while reducing traffic congestion and putting existing vehicles to better use.
            </p>
          </div>
        </section>
        */}

        <div className="w-full text-center text-xs text-gazie-navy/70 font-medium border-t border-dashed border-gazie-navy/15 pt-6 space-y-3.5">
          <p className="flex items-center justify-center font-bold text-gazie-navy">
            <span>🛡️ Community-Verified Commuting Network &bull; Abuja & Environs</span>
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-4 text-xs">
            <a 
              href="https://wa.me/2348164737221" 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-[#2D6A4F] text-white font-bold text-xs hover:opacity-90 transition shadow-sm cursor-pointer"
            >
              💬 WhatsApp: +234 816 473 7221
            </a>
            <span className="hidden sm:inline text-gazie-navy/30">&bull;</span>
            <span>Official Email: <a href="mailto:gaziecommute@gmail.com" className="underline font-bold text-gazie-navy hover:text-gazie-green">gaziecommute@gmail.com</a></span>
          </div>

          <div className="bg-white/80 border border-gazie-navy/15 rounded-xl p-3 max-w-md mx-auto text-[11px] space-y-0.5 text-gazie-navy/80 shadow-sm">
            <p className="font-bold text-gazie-navy text-xs">Gazie Commute Technologies Ltd.</p>
            <p className="font-mono text-[10px]">CAC Registration / RC Number: <span className="font-bold text-gazie-navy">RC: 7924018</span></p>
            <p className="text-[10px] text-gazie-navy/70">Registered Address: Federal Capital Territory (FCT), Abuja, Nigeria</p>
          </div>

          <div className="flex flex-wrap justify-center items-center gap-3 sm:gap-4 pt-1 text-[10px]">
            <Link href="/support" className="underline hover:text-gazie-navy text-gazie-navy/70 transition font-semibold">
              Help & Support
            </Link>
            <span className="text-gazie-navy/30">&bull;</span>
            <Link href="/church-rides" className="underline hover:text-gazie-navy text-gazie-navy/70 transition font-semibold">
              Church Fellowships
            </Link>
            <span className="text-gazie-navy/30">&bull;</span>
            <Link href="/privacy" className="underline hover:text-gazie-navy text-gazie-navy/70 transition font-semibold">
              Privacy Policy
            </Link>
            <span className="text-gazie-navy/30">&bull;</span>
            <Link href="/terms" className="underline hover:text-gazie-navy text-gazie-navy/70 transition font-semibold">
              Terms & Conditions
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
