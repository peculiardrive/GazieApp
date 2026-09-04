"use client";

import React, { useEffect, useState, useMemo, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import Navbar from '@/components/ui/Navbar';
import Toast, { useToast } from '@/components/ui/Toast';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import VerificationModal from '@/components/ui/VerificationModal';
import RequestChurchModal from '@/components/church/RequestChurchModal';
import { supabase } from '@/lib/supabase';
import { CHURCH_COMMUNITIES_ENABLED } from '@/lib/config';
import {
  SEED_CHURCHES,
  fetchChurches,
  fetchChurchZones,
  fetchChurchCells,
  ChurchCommunity,
  ChurchZone,
  ChurchCell
} from '@/lib/churches';
import { isFreeSundayChurchCommute } from '@/lib/communities';
import {
  Church,
  Users,
  MapPin,
  Calendar,
  Clock,
  ShieldCheck,
  CheckCircle2,
  Search,
  Filter,
  Sparkles,
  ArrowRight,
  Car,
  HeartHandshake,
  Check,
  Plus,
  RefreshCw,
  Info
} from 'lucide-react';

function ChurchRidesContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialChurch = searchParams.get('church') || '';

  const { toasts, showToast, dismissToast } = useToast();

  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<any>(null);
  const [churches, setChurches] = useState<ChurchCommunity[]>([]);
  const [zones, setZones] = useState<ChurchZone[]>([]);
  const [cells, setCells] = useState<ChurchCell[]>([]);
  const [postings, setPostings] = useState<any[]>([]);

  // Filter States
  const [selectedChurchId, setSelectedChurchId] = useState<string>(initialChurch);
  const [selectedZoneId, setSelectedZoneId] = useState<string>('');
  const [selectedCellId, setSelectedCellId] = useState<string>('');
  const [selectedPurpose, setSelectedPurpose] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedDate, setSelectedDate] = useState<string>('');

  // Modals
  const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);
  const [isVerificationModalOpen, setIsVerificationModalOpen] = useState(false);
  const [bookingLoadingId, setBookingLoadingId] = useState<string | null>(null);

  // Confirm dialog
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
  }>({ open: false, title: '', message: '', onConfirm: () => {} });

  // 1. Fetch user profile & available churches
  useEffect(() => {
    async function initData() {
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

        const loadedChurches = await fetchChurches();
        setChurches(loadedChurches);

        // If URL had a slug or church name, match it
        if (initialChurch) {
          const found = loadedChurches.find(
            c => c.id === initialChurch || c.slug === initialChurch || c.name.toLowerCase().includes(initialChurch.toLowerCase())
          );
          if (found) {
            setSelectedChurchId(found.id);
            const loadedZones = await fetchChurchZones(found.id);
            setZones(loadedZones);
          }
        }

        await loadPostings();
      } catch (err) {
        console.error('Error initializing church rides data:', err);
      } finally {
        setLoading(false);
      }
    }
    initData();
  }, [initialChurch]);

  // Load all active postings with resilient fallback
  const loadPostings = async () => {
    try {
      // First try fetching with driver profile join
      const { data: postingsData, error } = await supabase
        .from('ride_postings')
        .select(`
          *,
          driver:profiles!driver_id (
            id,
            full_name,
            phone,
            verification_status,
            community_verification_status,
            church_id,
            church_zone_id,
            church_cell_id,
            vehicle_make,
            vehicle_model,
            vehicle_plate,
            rating
          )
        `)
        .eq('status', 'active')
        .order('departure_date', { ascending: true });

      if (error) {
        // Fallback: standard select without join if relationship isn't configured
        const { data: simpleData } = await supabase
          .from('ride_postings')
          .select('*')
          .eq('status', 'active')
          .order('departure_date', { ascending: true });
        
        setPostings(simpleData || []);
      } else {
        setPostings(postingsData || []);
      }
    } catch (err) {
      console.warn('Error loading postings in church-rides:', err);
      setPostings([]);
    }
  };

  // Handle church filter change
  const handleChurchSelect = async (churchId: string) => {
    setSelectedChurchId(churchId);
    setSelectedZoneId('');
    setSelectedCellId('');
    if (churchId) {
      const loadedZones = await fetchChurchZones(churchId);
      setZones(loadedZones);
    } else {
      setZones([]);
      setCells([]);
    }
  };

  // Handle zone filter change
  const handleZoneSelect = async (zoneId: string) => {
    setSelectedZoneId(zoneId);
    setSelectedCellId('');
    if (zoneId) {
      const loadedCells = await fetchChurchCells(zoneId);
      setCells(loadedCells);
    } else {
      setCells([]);
    }
  };

  // Filtered Postings
  const filteredPostings = useMemo(() => {
    return postings.filter((p) => {
      // Must have seats available
      if (p.seats_available <= 0) return false;

      // Church filter
      if (selectedChurchId) {
        const selChurch = churches.find(c => c.id === selectedChurchId);
        const matchesId = p.church_id === selectedChurchId;
        const matchesCommunity = selChurch && p.community_name && p.community_name.toLowerCase().includes(selChurch.name.toLowerCase().split(' ')[0]);
        const matchesDest = selChurch && p.destination && p.destination.toLowerCase().includes(selChurch.name.toLowerCase().split(' ')[0]);
        if (!matchesId && !matchesCommunity && !matchesDest) return false;
      }

      // Zone filter
      if (selectedZoneId) {
        if (p.church_zone_id && p.church_zone_id !== selectedZoneId) return false;
      }

      // Cell filter
      if (selectedCellId) {
        if (p.church_cell_id && p.church_cell_id !== selectedCellId) return false;
      }

      // Purpose filter
      if (selectedPurpose !== 'all') {
        if (p.ride_purpose) {
          if (p.ride_purpose !== selectedPurpose) return false;
        } else {
          // If ride_purpose column wasn't set, match by day or destination
          if (selectedPurpose === 'sunday_service') {
            const dateObj = new Date(p.departure_date);
            if (dateObj.getDay() !== 0) return false;
          }
        }
      }

      // Text search query (pickup or destination or service name)
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        const pickMatch = p.pickup?.toLowerCase().includes(query);
        const destMatch = p.destination?.toLowerCase().includes(query);
        const serviceMatch = p.service_name?.toLowerCase().includes(query);
        const notesMatch = p.notes?.toLowerCase().includes(query);
        if (!pickMatch && !destMatch && !serviceMatch && !notesMatch) return false;
      }

      // Date filter
      if (selectedDate) {
        if (p.departure_date !== selectedDate) return false;
      }

      return true;
    });
  }, [postings, selectedChurchId, selectedZoneId, selectedCellId, selectedPurpose, searchQuery, selectedDate, churches]);

  // Handle Join Carpool
  const handleJoinCarpool = async (posting: any) => {
    if (!profile) {
      router.push(`/login?redirect=/church-rides`);
      return;
    }

    if (profile.verification_status !== 'verified') {
      setIsVerificationModalOpen(true);
      return;
    }

    if (posting.driver_id === profile.id) {
      showToast('You cannot book a seat on your own ride posting.', 'warning');
      return;
    }

    setConfirmDialog({
      open: true,
      title: 'Join Church Carpool',
      message: `Would you like to reserve 1 seat with ${posting.driver?.full_name || 'your driver'} from ${posting.pickup} to ${posting.destination} on ${posting.departure_date} at ${posting.departure_time}?`,
      onConfirm: async () => {
        setBookingLoadingId(posting.id);
        try {
          // Check if Free Sunday Promo applies
          const isFreeSunday = isFreeSundayChurchCommute({
            date: posting.departure_date,
            communityName: posting.community_name,
            pickup: posting.pickup,
            destination: posting.destination,
            riderCommunity: profile?.community_name
          });

          // Insert booking
          const { data: newBooking, error: bookErr } = await supabase
            .from('bookings')
            .insert({
              rider_id: profile.id,
              driver_id: posting.driver_id,
              ride_posting_id: posting.id,
              pickup: posting.pickup,
              destination: posting.destination,
              requested_date: posting.departure_date,
              requested_time: posting.departure_time,
              driver_fare: posting.fare_per_seat || 0,
              platform_fee: isFreeSunday ? 0 : 100,
              status: isFreeSunday ? 'confirmed' : 'requested'
            })
            .select()
            .single();

          if (bookErr) {
            showToast('Failed to join ride: ' + bookErr.message, 'error');
            return;
          }

          // Decrement seat count in posting
          await supabase
            .from('ride_postings')
            .update({
              seats_available: Math.max(0, posting.seats_available - 1),
              status: posting.seats_available - 1 <= 0 ? 'full' : 'active'
            })
            .eq('id', posting.id);

          // Create notification for driver
          await supabase.from('notifications').insert({
            user_id: posting.driver_id,
            title: 'New Fellowship Member Joined Your Ride!',
            message: `${profile.full_name} has joined your ride to ${posting.destination} on ${posting.departure_date} (${posting.departure_time}).`
          });

          if (isFreeSunday) {
            showToast('🎉 Seat reserved! Free Sunday Church Pass unlocked.', 'success');
            router.push('/dashboard/rider?tab=passes');
          } else {
            showToast('Seat reserved! Unlock match in your dashboard.', 'success');
            router.push('/dashboard/rider?tab=passes');
          }
        } catch (err: any) {
          showToast(err.message || 'An error occurred while reserving seat', 'error');
        } finally {
          setBookingLoadingId(null);
          loadPostings();
        }
      }
    });
  };

  const selectedChurchObj = churches.find(c => c.id === selectedChurchId);

  return (
    <div className="flex flex-col min-h-screen bg-gazie-paper text-gazie-navy">
      <Navbar />

      <Toast toasts={toasts} onDismiss={dismissToast} />

      <ConfirmDialog
        open={confirmDialog.open}
        title={confirmDialog.title}
        message={confirmDialog.message}
        onConfirm={confirmDialog.onConfirm}
        onCancel={() => setConfirmDialog(prev => ({ ...prev, open: false }))}
      />

      <VerificationModal
        isOpen={isVerificationModalOpen}
        onClose={() => setIsVerificationModalOpen(false)}
        profile={profile}
        onSuccess={(updated) => {
          setProfile(updated);
          setIsVerificationModalOpen(false);
          showToast('Identity verification submitted for review!', 'success');
        }}
      />

      <RequestChurchModal
        isOpen={isRequestModalOpen}
        onClose={() => setIsRequestModalOpen(false)}
        onSuccess={() => showToast('Thank you! Your church community request has been submitted for review.', 'success')}
      />

      <main className="flex-1 max-w-5xl mx-auto w-full px-4 py-6 space-y-6">

        {/* Hero Header Banner */}
        <section className="bg-white border-2 border-gazie-navy rounded-3xl p-6 sm:p-8 shadow-sm relative overflow-hidden">
          <div className="absolute -right-6 -bottom-6 opacity-5 pointer-events-none">
            <Church className="w-56 h-56 text-gazie-navy" />
          </div>

          <div className="max-w-2xl space-y-3 relative z-10">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-[#2D6A4F] text-white shadow-xs">
                <span>⛪</span>
                <span>Church & Cell Carpooling</span>
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-extrabold bg-amber-100 text-amber-900 border border-amber-300">
                <Sparkles className="w-3.5 h-3.5 text-amber-700" />
                Sunday Promo: 100% Free Pass (₦0)
              </span>
            </div>

            <h1 className="font-display font-black text-2xl sm:text-3xl text-gazie-navy tracking-tight leading-tight">
              Share Rides to Church Services & Home Cell Fellowships
            </h1>

            <p className="text-xs sm:text-sm text-gazie-navy/75 font-medium leading-relaxed">
              Connect with verified brethren travelling from your neighborhood to Sunday services, midweek communion, and home fellowship clusters across Abuja.
            </p>

            <div className="pt-2 flex flex-wrap items-center gap-3">
              <Link
                href="/dashboard/driver"
                className="bg-gazie-navy text-gazie-paper font-bold text-xs py-2.5 px-4 rounded-xl border border-gazie-navy hover:bg-gazie-yellow hover:text-gazie-navy transition-all duration-200 inline-flex items-center gap-1.5 shadow-xs"
              >
                <Car className="w-4 h-4" />
                <span>Post a Church Commute</span>
              </Link>

              <button
                type="button"
                onClick={() => setIsRequestModalOpen(true)}
                className="bg-white text-gazie-navy font-bold text-xs py-2.5 px-4 rounded-xl border border-gazie-navy/30 hover:border-gazie-navy hover:bg-gazie-paper/50 transition-all inline-flex items-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-4 h-4 text-gazie-navy/70" />
                <span>Request Your Church</span>
              </button>
            </div>
          </div>
        </section>

        {/* Quick Church Filter Bar (Pills) */}
        <section className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-gazie-navy/70 flex items-center gap-1.5">
              <Church className="w-3.5 h-3.5 text-gazie-navy" /> Select Church Community
            </span>
            {selectedChurchId && (
              <button
                type="button"
                onClick={() => handleChurchSelect('')}
                className="text-[10px] font-bold text-gazie-navy/60 hover:text-red-600 underline cursor-pointer"
              >
                Clear filter
              </button>
            )}
          </div>

          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none text-xs">
            <button
              type="button"
              onClick={() => handleChurchSelect('')}
              className={`px-3 py-2 rounded-xl border font-bold shrink-0 transition-all cursor-pointer ${
                !selectedChurchId
                  ? 'bg-gazie-navy text-white border-gazie-navy shadow-xs'
                  : 'bg-white text-gazie-navy/80 border-gazie-navy/20 hover:border-gazie-navy hover:bg-white'
              }`}
            >
              🌟 All Abuja Churches
            </button>
            {churches.map((church) => (
              <button
                type="button"
                key={church.id}
                onClick={() => handleChurchSelect(church.id)}
                className={`px-3 py-2 rounded-xl border font-bold shrink-0 transition-all flex items-center gap-1.5 cursor-pointer ${
                  selectedChurchId === church.id
                    ? 'bg-gazie-navy text-white border-gazie-navy shadow-xs'
                    : 'bg-white text-gazie-navy/80 border-gazie-navy/20 hover:border-gazie-navy hover:bg-white'
                }`}
              >
                <span>⛪</span>
                <span>{church.name}</span>
              </button>
            ))}
          </div>
        </section>

        {/* Main Filter & Search Control Card */}
        <section className="bg-white border-2 border-gazie-navy rounded-2xl p-4 sm:p-5 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row gap-3">
            {/* Search input */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gazie-navy/40" />
              <input
                type="text"
                placeholder="Search pickup area (e.g. Lugbe, Kubwa, Lokogoma, Apo, Wuse...)"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-gazie-paper/30 border border-gazie-navy/30 rounded-xl text-xs font-semibold focus:outline-none focus:border-gazie-navy"
              />
            </div>

            {/* Commute Category Pills */}
            <div className="flex gap-1.5 overflow-x-auto text-[11px] pb-1 sm:pb-0">
              {[
                { id: 'all', label: 'All Services' },
                { id: 'sunday_service', label: '⛪ Sunday' },
                { id: 'midweek_service', label: '📖 Midweek' },
                { id: 'cell_meeting', label: '👥 Cell / Care' }
              ].map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setSelectedPurpose(cat.id)}
                  className={`px-3 py-2 rounded-xl border font-bold shrink-0 transition-all cursor-pointer ${
                    selectedPurpose === cat.id
                      ? 'bg-gazie-navy text-white border-gazie-navy'
                      : 'bg-gazie-paper/30 text-gazie-navy/70 border-gazie-navy/15 hover:border-gazie-navy'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          {/* Hierarchical Zone & Cell Drilldown (Visible when church is selected) */}
          {selectedChurchId && zones.length > 0 && (
            <div className="pt-3 border-t border-dashed border-gazie-navy/10 grid grid-cols-1 sm:grid-cols-2 gap-3 animate-fadeIn">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gazie-navy/60 uppercase block">Filter by Church Zone</label>
                <select
                  value={selectedZoneId}
                  onChange={(e) => handleZoneSelect(e.target.value)}
                  className="w-full px-3 py-2 bg-gazie-paper/20 border border-gazie-navy/30 rounded-xl text-xs font-semibold focus:outline-none focus:border-gazie-navy cursor-pointer"
                >
                  <option value="">All Zones in {selectedChurchObj?.name}</option>
                  {zones.map((z) => (
                    <option key={z.id} value={z.id}>
                      {z.name} ({z.city_area})
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gazie-navy/60 uppercase block">Filter by Home Fellowship / Cell</label>
                <select
                  value={selectedCellId}
                  onChange={(e) => setSelectedCellId(e.target.value)}
                  disabled={!selectedZoneId || cells.length === 0}
                  className="w-full px-3 py-2 bg-gazie-paper/20 border border-gazie-navy/30 rounded-xl text-xs font-semibold focus:outline-none focus:border-gazie-navy disabled:opacity-50 cursor-pointer"
                >
                  <option value="">All Cells in this Zone</option>
                  {cells.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.meeting_day})
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {/* Active Church Banner & Community Link */}
          {selectedChurchObj && (
            <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs bg-blue-50/60 p-3 rounded-xl border border-blue-200">
              <div className="flex items-center gap-2">
                <span className="text-xl">⛪</span>
                <div>
                  <span className="font-bold text-blue-950 block">{selectedChurchObj.name}</span>
                  <span className="text-[10px] text-blue-800/80 block">{selectedChurchObj.address}</span>
                </div>
              </div>
              <Link
                href={`/community/church/${selectedChurchObj.slug}`}
                className="text-[11px] font-bold text-blue-700 hover:text-blue-900 underline flex items-center gap-1 self-start sm:self-auto cursor-pointer"
              >
                <span>View Church Community Hub</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          )}
        </section>

        {/* Results Count & Active Status */}
        <div className="flex items-center justify-between text-xs font-semibold text-gazie-navy/70 px-1">
          <span>
            Showing <strong className="text-gazie-navy">{filteredPostings.length}</strong> available church carpool{filteredPostings.length === 1 ? '' : 's'}
          </span>
          <button
            type="button"
            onClick={loadPostings}
            className="flex items-center gap-1 text-[11px] text-gazie-navy hover:text-gazie-green underline cursor-pointer"
          >
            <RefreshCw className="w-3 h-3" /> Refresh rides
          </button>
        </div>

        {/* Rides Grid */}
        {filteredPostings.length === 0 ? (
          <div className="bg-white border-2 border-dashed border-gazie-navy/20 rounded-3xl p-10 text-center space-y-4">
            <div className="w-16 h-16 bg-gazie-paper rounded-full flex items-center justify-center mx-auto text-2xl border border-gazie-navy/10">
              ⛪
            </div>
            <div className="max-w-md mx-auto space-y-1">
              <h3 className="font-display font-extrabold text-base text-gazie-navy">
                No active carpools match your filter right now
              </h3>
              <p className="text-xs text-gazie-navy/60 leading-relaxed">
                Be the first to offer a seat to fellow members travelling to this service, or request your fellowship cluster.
              </p>
            </div>
            <div className="pt-2 flex flex-wrap justify-center gap-3">
              <Link
                href="/dashboard/driver"
                className="bg-gazie-navy text-gazie-paper font-bold text-xs py-2.5 px-5 rounded-xl border border-gazie-navy hover:bg-gazie-yellow hover:text-gazie-navy transition-all shadow-xs"
              >
                Post a Commute for this Church
              </Link>
              <button
                type="button"
                onClick={() => {
                  setSelectedChurchId('');
                  setSelectedZoneId('');
                  setSelectedCellId('');
                  setSelectedPurpose('all');
                  setSearchQuery('');
                }}
                className="bg-white text-gazie-navy font-bold text-xs py-2.5 px-4 rounded-xl border border-gazie-navy/30 hover:border-gazie-navy transition-all cursor-pointer"
              >
                Clear Filters
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredPostings.map((posting) => {
              const dateObj = new Date(posting.departure_date);
              const isSunday = dateObj.getDay() === 0;
              const isFree = posting.fare_per_seat === 0 || isSunday;
              const churchMatch = churches.find(c => c.id === posting.church_id);

              return (
                <div
                  key={posting.id}
                  className="bg-white border-2 border-gazie-navy rounded-2xl p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-4"
                >
                  {/* Top Header Stub */}
                  <div className="flex items-start justify-between gap-2 border-b border-dashed border-gazie-navy/10 pb-3">
                    <div className="space-y-0.5">
                      <span className="inline-flex items-center gap-1 font-display font-black text-xs text-gazie-navy uppercase tracking-wide">
                        <span>⛪</span>
                        <span>{posting.community_name || churchMatch?.name || 'Church Fellowship'}</span>
                      </span>
                      {posting.service_name && (
                        <span className="text-[11px] font-bold text-[#2D6A4F] block">
                          {posting.service_name}
                        </span>
                      )}
                    </div>
                    {isFree ? (
                      <span className="bg-emerald-100 text-emerald-900 border border-emerald-300 text-[10px] font-black uppercase px-2 py-0.5 rounded-full shrink-0">
                        FREE (₦0)
                      </span>
                    ) : (
                      <span className="bg-gazie-paper text-gazie-navy font-mono text-xs font-extrabold px-2.5 py-0.5 rounded-lg border border-gazie-navy/20 shrink-0">
                        ₦{posting.fare_per_seat}/seat
                      </span>
                    )}
                  </div>

                  {/* Route & Timing */}
                  <div className="space-y-2 text-xs">
                    <div className="flex items-start gap-2.5">
                      <div className="mt-1 flex flex-col items-center">
                        <div className="w-2.5 h-2.5 rounded-full border-2 border-gazie-navy bg-gazie-yellow" />
                        <div className="w-0.5 h-5 bg-dashed border-l border-gazie-navy my-0.5" />
                        <div className="w-2.5 h-2.5 rounded-full border-2 border-gazie-navy bg-gazie-navy" />
                      </div>
                      <div className="flex-1 space-y-1">
                        <div>
                          <span className="text-[9px] font-bold text-gazie-navy/50 uppercase block">Pickup Area</span>
                          <span className="font-bold text-gazie-navy block">{posting.pickup}</span>
                        </div>
                        <div>
                          <span className="text-[9px] font-bold text-gazie-navy/50 uppercase block">Destination Church / Hub</span>
                          <span className="font-bold text-gazie-navy block">{posting.destination}</span>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 pt-2 border-t border-gazie-paper text-[11px]">
                      <div className="flex items-center gap-1.5 text-gazie-navy/70">
                        <Calendar className="w-3.5 h-3.5 text-gazie-navy/50" />
                        <span className="font-bold text-gazie-navy">{posting.departure_date}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-gazie-navy/70">
                        <Clock className="w-3.5 h-3.5 text-gazie-navy/50" />
                        <span className="font-mono font-bold text-gazie-navy">{posting.departure_time}</span>
                      </div>
                    </div>
                  </div>

                  {/* Driver & Safety Badges */}
                  <div className="bg-gazie-paper/30 p-3 rounded-xl border border-gazie-navy/10 space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-gazie-navy text-white font-black flex items-center justify-center text-[10px]">
                          {(posting.driver?.full_name || 'Driver').charAt(0)}
                        </div>
                        <div>
                          <span className="font-bold text-gazie-navy block text-xs">
                            {posting.driver?.full_name || 'Verified Driver'}
                          </span>
                          <span className="text-[10px] text-gazie-navy/60 block">
                            {posting.driver?.vehicle_make ? `${posting.driver.vehicle_make} ${posting.driver.vehicle_model}` : 'Verified Vehicle'}
                          </span>
                        </div>
                      </div>
                      <span className="text-[11px] font-mono font-bold text-gazie-navy bg-white px-2 py-0.5 rounded border border-gazie-navy/15">
                        {posting.seats_available} {posting.seats_available === 1 ? 'seat' : 'seats'} left
                      </span>
                    </div>

                    {/* Verification Trust Row */}
                    <div className="flex flex-wrap items-center gap-1.5 pt-1 text-[9px] font-bold">
                      <span className="inline-flex items-center gap-1 bg-[#2D6A4F]/10 text-gazie-green border border-gazie-green/20 px-2 py-0.5 rounded-full">
                        <ShieldCheck className="w-3 h-3" /> Identity Verified
                      </span>
                      {posting.driver?.community_verification_status === 'community_verified' && (
                        <span className="inline-flex items-center gap-1 bg-blue-100 text-blue-800 border border-blue-300 px-2 py-0.5 rounded-full">
                          <CheckCircle2 className="w-3 h-3" /> Church Verified Brethren
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Booking CTA Button */}
                  <button
                    type="button"
                    onClick={() => handleJoinCarpool(posting)}
                    disabled={bookingLoadingId === posting.id}
                    className="w-full bg-gazie-navy text-gazie-paper font-bold py-2.5 rounded-xl border border-gazie-navy hover:bg-gazie-yellow hover:text-gazie-navy transition-all duration-200 text-xs shadow-xs cursor-pointer flex items-center justify-center gap-1.5 disabled:opacity-50"
                  >
                    <HeartHandshake className="w-4 h-4" />
                    <span>{bookingLoadingId === posting.id ? 'Reserving Seat...' : 'Join This Church Carpool'}</span>
                  </button>
                </div>
              );
            })}
          </div>
        )}

        {/* Community Outreach & Onboarding Explainer */}
        <section className="bg-amber-50/70 border-2 border-amber-300 rounded-3xl p-6 sm:p-7 text-left space-y-3">
          <div className="flex items-center gap-2">
            <span className="text-xl">🤝</span>
            <h3 className="font-display font-extrabold text-sm sm:text-base text-amber-950 uppercase tracking-tight">
              Bring Gazie Commute to Your Church Cell or Home Fellowship
            </h3>
          </div>
          <p className="text-xs text-amber-900/90 leading-relaxed max-w-3xl">
            Pastors, cell leaders, and care fellowship coordinators across Abuja use Gazie Commute to ensure members arrive safely, reduce transport burdens, and foster fellowship on the road. Sunday platform passes are 100% free of platform charges.
          </p>
          <div className="pt-1 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setIsRequestModalOpen(true)}
              className="bg-amber-800 text-white font-bold text-xs py-2 px-4 rounded-xl hover:bg-amber-900 transition cursor-pointer"
            >
              Request Fellowship Center Addition
            </button>
            <Link
              href="/support"
              className="bg-white text-amber-950 font-bold text-xs py-2 px-4 rounded-xl border border-amber-300 hover:bg-amber-100/50 transition"
            >
              Learn More for Church Leaders
            </Link>
          </div>
        </section>

      </main>
    </div>
  );
}

export default function ChurchRidesPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gazie-paper flex items-center justify-center font-bold text-xs">
          Loading Church Carpools...
        </div>
      }
    >
      <ChurchRidesContent />
    </Suspense>
  );
}
