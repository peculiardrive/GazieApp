"use client";

import React, { useEffect, useState, use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/ui/Navbar';
import Toast, { useToast } from '@/components/ui/Toast';
import { supabase } from '@/lib/supabase';
import {
  fetchChurches,
  fetchChurchZones,
  fetchChurchCells,
  ChurchCommunity,
  ChurchZone,
  ChurchCell,
  SEED_CHURCHES
} from '@/lib/churches';
import {
  Church,
  Users,
  MapPin,
  Calendar,
  Clock,
  ShieldCheck,
  CheckCircle2,
  ArrowLeft,
  ArrowRight,
  Car,
  HeartHandshake,
  Sparkles,
  Share2,
  Phone
} from 'lucide-react';

interface ChurchCommunityPageProps {
  params: Promise<{ slug: string }>;
}

export default function ChurchCommunityPage({ params }: ChurchCommunityPageProps) {
  const router = useRouter();
  const resolvedParams = use(params);
  const slug = resolvedParams.slug;

  const { toasts, showToast, dismissToast } = useToast();

  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<any>(null);
  const [church, setChurch] = useState<ChurchCommunity | null>(null);
  const [zones, setZones] = useState<ChurchZone[]>([]);
  const [cells, setCells] = useState<ChurchCell[]>([]);
  const [rides, setRides] = useState<any[]>([]);
  const [joining, setJoining] = useState(false);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { data: prof } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .single();
          if (prof) setProfile(prof);
        }

        const allChurches = await fetchChurches();
        const foundChurch = allChurches.find(c => c.slug === slug || c.id === slug);

        if (foundChurch) {
          setChurch(foundChurch);
          const loadedZones = await fetchChurchZones(foundChurch.id);
          setZones(loadedZones);

          // Fetch cells for all zones
          const allCells: ChurchCell[] = [];
          for (const z of loadedZones) {
            const zCells = await fetchChurchCells(z.id);
            allCells.push(...zCells);
          }
          setCells(allCells);

          // Fetch active rides targeting this church
          const { data: postings } = await supabase
            .from('ride_postings')
            .select('*')
            .eq('status', 'active')
            .order('departure_date', { ascending: true });

          const matchingRides = (postings || []).filter((p: any) => {
            const matchesId = p.church_id === foundChurch.id;
            const matchesDest = p.destination?.toLowerCase().includes(foundChurch.name.toLowerCase().split(' ')[0]);
            const matchesComm = p.community_name?.toLowerCase().includes(foundChurch.name.toLowerCase().split(' ')[0]);
            return matchesId || matchesDest || matchesComm;
          });
          setRides(matchingRides);
        }
      } catch (err) {
        console.error('Error loading church community page:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [slug]);

  const handleJoinChurch = async () => {
    if (!profile) {
      router.push(`/login?redirect=/community/church/${slug}`);
      return;
    }

    setJoining(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          church_id: church?.id,
          community_type: 'church',
          community_name: church?.name,
          community_verification_status: profile.community_verification_status === 'community_verified' ? 'community_verified' : 'pending'
        })
        .eq('id', profile.id);

      if (error) {
        showToast('Failed to join community: ' + error.message, 'error');
      } else {
        showToast(`You have joined the ${church?.name} carpool community!`, 'success');
        setProfile((prev: any) => ({ ...prev, church_id: church?.id, community_name: church?.name }));
      }
    } catch (err: any) {
      showToast(err.message || 'An error occurred', 'error');
    } finally {
      setJoining(false);
    }
  };

  const handleShare = () => {
    if (typeof navigator !== 'undefined' && navigator.share) {
      navigator.share({
        title: `${church?.name} Carpooling - Gazie Commute`,
        text: `Share rides to church services and home fellowship with verified brethren from ${church?.name}!`,
        url: window.location.href
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      showToast('Page link copied to clipboard!', 'success');
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen bg-gazie-paper text-gazie-navy">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <p className="text-xs font-bold font-mono animate-pulse">Loading Church Community...</p>
        </div>
      </div>
    );
  }

  if (!church) {
    return (
      <div className="flex flex-col min-h-screen bg-gazie-paper text-gazie-navy">
        <Navbar />
        <main className="flex-1 max-w-lg mx-auto w-full px-4 py-12 text-center space-y-4">
          <Church className="w-12 h-12 text-gazie-navy/40 mx-auto" />
          <h2 className="font-display font-extrabold text-lg text-gazie-navy">Church Community Not Found</h2>
          <p className="text-xs text-gazie-navy/60">
            The requested church community could not be found or has not yet been registered on Gazie Commute.
          </p>
          <Link
            href="/dashboard/rider"
            className="inline-flex items-center gap-1.5 bg-gazie-navy text-gazie-paper font-bold text-xs py-2 px-4 rounded-xl"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Browse Commute Feed</span>
          </Link>
        </main>
      </div>
    );
  }

  const isUserMember = profile?.church_id === church.id;

  return (
    <div className="flex flex-col min-h-screen bg-gazie-paper text-gazie-navy">
      <Navbar />

      <Toast toasts={toasts} onDismiss={dismissToast} />

      <main className="flex-1 max-w-4xl mx-auto w-full px-4 py-6 space-y-6">

        {/* Back navigation */}
        <div className="flex items-center justify-between">
          <Link
            href="/dashboard/rider"
            className="text-xs font-bold text-gazie-navy/70 hover:text-gazie-navy inline-flex items-center gap-1"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Commute Feed</span>
          </Link>

          <button
            type="button"
            onClick={handleShare}
            className="text-xs font-bold text-gazie-navy hover:text-gazie-green inline-flex items-center gap-1 cursor-pointer"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>Share Hub</span>
          </button>
        </div>

        {/* Church Header Card */}
        <section className="bg-white border-2 border-gazie-navy rounded-3xl p-6 sm:p-8 shadow-sm space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <span className="bg-emerald-100 text-emerald-950 border border-emerald-300 text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full flex items-center gap-1">
                  <span>⛪</span>
                  <span>{church.denomination || 'Christian Ministry'}</span>
                </span>
                <span className="bg-[#2D6A4F]/10 text-gazie-green border border-gazie-green/20 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3" /> Verified Fellowship Hub
                </span>
              </div>

              <h1 className="font-display font-black text-2xl sm:text-3xl text-gazie-navy tracking-tight">
                {church.name}
              </h1>

              <div className="flex items-center gap-1.5 text-xs text-gazie-navy/70 font-semibold">
                <MapPin className="w-4 h-4 text-gazie-navy/50 shrink-0" />
                <span>{church.address}, {church.city}</span>
              </div>
            </div>

            <div className="flex flex-col sm:items-end gap-2 shrink-0">
              {isUserMember ? (
                <span className="bg-emerald-50 text-emerald-900 border border-emerald-300 font-extrabold text-xs py-2 px-4 rounded-xl inline-flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                  <span>You Are a Member</span>
                </span>
              ) : (
                <button
                  type="button"
                  onClick={handleJoinChurch}
                  disabled={joining}
                  className="bg-gazie-navy text-gazie-paper font-bold text-xs py-2.5 px-4 rounded-xl border border-gazie-navy hover:bg-gazie-yellow hover:text-gazie-navy transition-all shadow-xs cursor-pointer disabled:opacity-50"
                >
                  {joining ? 'Joining...' : 'Join This Church Hub'}
                </button>
              )}

              <Link
                href={`/dashboard/rider?community=${encodeURIComponent(church.name)}`}
                className="text-[11px] font-bold text-gazie-navy hover:underline flex items-center gap-1"
              >
                <span>Find Brethren Rides</span>
                <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
          </div>

          {/* Service Times Grid */}
          {church.service_times && church.service_times.length > 0 && (
            <div className="pt-4 border-t border-dashed border-gazie-navy/10 space-y-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-gazie-navy/60 block">
                Weekly Worship & Service Schedule
              </span>
              <div className="flex flex-wrap gap-2">
                {church.service_times.map((time, idx) => (
                  <span
                    key={idx}
                    className="bg-gazie-paper/50 border border-gazie-navy/15 rounded-lg px-2.5 py-1 text-xs font-semibold text-gazie-navy flex items-center gap-1.5"
                  >
                    <Clock className="w-3 h-3 text-gazie-navy/40" />
                    <span>{time}</span>
                  </span>
                ))}
              </div>
            </div>
          )}
        </section>

        {/* Zones & Cell Fellowships */}
        <section className="bg-white border-2 border-gazie-navy rounded-3xl p-6 sm:p-7 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-dashed border-gazie-navy/10 pb-3">
            <div>
              <h2 className="font-display font-extrabold text-base text-gazie-navy flex items-center gap-2">
                <Users className="w-4 h-4 text-gazie-navy" />
                <span>Fellowship Zones & Cell Clusters ({zones.length})</span>
              </h2>
              <p className="text-[11px] text-gazie-navy/60 mt-0.5">
                Neighborhood house care groups and cell meeting centers
              </p>
            </div>
            <Link
              href="/dashboard/driver"
              className="bg-gazie-paper hover:bg-gazie-yellow/30 text-gazie-navy text-[11px] font-bold py-1.5 px-3 rounded-lg border border-gazie-navy/20 transition hidden sm:inline-block"
            >
              + Post Cell Ride
            </Link>
          </div>

          {zones.length === 0 ? (
            <p className="text-xs text-gazie-navy/60 py-4 text-center">
              No zones registered yet for this church.
            </p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {zones.map((zone) => {
                const zoneCells = cells.filter(c => c.zone_id === zone.id);
                return (
                  <div
                    key={zone.id}
                    className="bg-gazie-paper/30 border border-gazie-navy/20 rounded-2xl p-4 space-y-2.5"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="font-display font-bold text-xs text-gazie-navy block">
                          {zone.name}
                        </span>
                        <span className="text-[10px] text-gazie-navy/60 block">
                          📍 {zone.city_area}
                        </span>
                      </div>
                      <span className="text-[10px] font-mono font-bold bg-white px-2 py-0.5 rounded border border-gazie-navy/10 text-gazie-navy/70">
                        {zoneCells.length} {zoneCells.length === 1 ? 'Cell' : 'Cells'}
                      </span>
                    </div>

                    {zoneCells.length > 0 && (
                      <div className="space-y-1.5 pt-1 border-t border-gazie-navy/10">
                        {zoneCells.map((cell) => (
                          <div
                            key={cell.id}
                            className="bg-white/80 p-2 rounded-xl text-[11px] flex justify-between items-center border border-gazie-navy/5"
                          >
                            <div>
                              <span className="font-bold text-gazie-navy block">{cell.name}</span>
                              <span className="text-[10px] text-gazie-navy/55 block">
                                {cell.meeting_day} • {cell.meeting_time}
                              </span>
                            </div>
                            <span className="text-[9px] bg-blue-50 text-blue-700 px-1.5 py-0.5 rounded font-bold">
                              {cell.meeting_address?.split(',')[0] || 'Cluster'}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* Active Rides to This Church */}
        <section className="bg-white border-2 border-gazie-navy rounded-3xl p-6 sm:p-7 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-dashed border-gazie-navy/10 pb-3">
            <div>
              <h2 className="font-display font-extrabold text-base text-gazie-navy flex items-center gap-2">
                <Car className="w-4 h-4 text-gazie-navy" />
                <span>Upcoming Carpools to {church.name} ({rides.length})</span>
              </h2>
              <p className="text-[11px] text-gazie-navy/60 mt-0.5">
                Sunday services and weekday fellowship commutes
              </p>
            </div>
            <Link
              href={`/dashboard/rider?community=${encodeURIComponent(church.name)}`}
              className="text-xs font-bold text-gazie-navy hover:text-gazie-green underline"
            >
              View All
            </Link>
          </div>

          {rides.length === 0 ? (
            <div className="py-8 text-center space-y-3">
              <p className="text-xs text-gazie-navy/60">
                No active carpools posted to {church.name} for this week yet.
              </p>
              <Link
                href="/dashboard/driver"
                className="inline-flex items-center gap-1.5 bg-gazie-navy text-gazie-paper font-bold text-xs py-2 px-4 rounded-xl border border-gazie-navy hover:bg-gazie-yellow hover:text-gazie-navy transition"
              >
                <Car className="w-3.5 h-3.5" />
                <span>Offer an Empty Seat</span>
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {rides.map((ride) => (
                <div
                  key={ride.id}
                  className="bg-gazie-paper/30 border border-gazie-navy/20 rounded-2xl p-4 space-y-2 text-xs"
                >
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-gazie-navy truncate">{ride.pickup} → {ride.destination}</span>
                    <span className="font-mono text-[10px] font-extrabold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded">
                      {ride.fare_per_seat === 0 ? 'FREE' : `₦${ride.fare_per_seat}`}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-[11px] text-gazie-navy/70">
                    <span className="flex items-center gap-1 font-semibold">
                      <Calendar className="w-3 h-3 text-gazie-navy/50" /> {ride.departure_date}
                    </span>
                    <span className="flex items-center gap-1 font-mono font-semibold">
                      <Clock className="w-3 h-3 text-gazie-navy/50" /> {ride.departure_time}
                    </span>
                  </div>
                  <div className="pt-2">
                    <Link
                      href={`/dashboard/rider?community=${encodeURIComponent(church.name)}`}
                      className="block text-center bg-gazie-navy text-white text-[11px] font-bold py-1.5 rounded-lg hover:bg-gazie-yellow hover:text-gazie-navy transition"
                    >
                      View & Book Seat
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

      </main>
    </div>
  );
}
