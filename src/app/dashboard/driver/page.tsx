"use client";

import React, { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase, syncRecurringPostings } from '@/lib/supabase';
import Navbar from '@/components/ui/Navbar';
import Ticket from '@/components/ui/Ticket';
import Toast, { useToast } from '@/components/ui/Toast';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import { MapPin, Clock, Calendar, AlertTriangle, ShieldAlert, BadgeCheck, Car, Landmark, Trash2, Power, Plus, ArrowRight, FileText, Sparkles } from 'lucide-react';
import VerificationModal from '@/components/ui/VerificationModal';
import RatingModal from '@/components/ui/RatingModal';
import { STANDARD_ABUJA_DESTINATIONS, STANDARD_COMMUTE_ROUTES, getKnownDestinations } from '@/lib/routes';
import { COMMUNITY_HUBS } from '@/lib/communities';

export default function DriverDashboard() {
  const router = useRouter();
  const [profile, setProfile] = useState<any>(null);
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isVerificationModalOpen, setIsVerificationModalOpen] = useState(false);
  const [ratingModalBooking, setRatingModalBooking] = useState<any | null>(null);

  // Toast notifications
  const { toasts, showToast, dismissToast } = useToast();

  // Confirm dialog state
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean;
    title: string;
    message: string;
    danger?: boolean;
    onConfirm: () => void;
  }>({ open: false, title: '', message: '', onConfirm: () => {} });

  const openConfirm = useCallback((title: string, message: string, onConfirm: () => void, danger = false) => {
    setConfirmDialog({ open: true, title, message, danger, onConfirm });
  }, []);

  const closeConfirm = useCallback(() => {
    setConfirmDialog(prev => ({ ...prev, open: false }));
  }, []);

  // Form edit states
  const [usualRoute, setUsualRoute] = useState('');
  const [availableTimeWindow, setAvailableTimeWindow] = useState('');
  const [driverFare, setDriverFare] = useState('');

  const [updateLoading, setUpdateLoading] = useState(false);
  const [message, setMessage] = useState<{ text: string; isError: boolean } | null>(null);

  // Tab state
  const [activeTab, setActiveTab] = useState<'matches' | 'postings'>('matches');

  // Ride Postings state
  const [postings, setPostings] = useState<any[]>([]);
  const [templates, setTemplates] = useState<any[]>([]);
  
  // Post Ride form state
  const [postPickup, setPostPickup] = useState('');
  const [postDestination, setPostDestination] = useState('Secretariat, Garki');
  const [postDate, setPostDate] = useState(new Date(Date.now() + 86400000).toISOString().split('T')[0]); // tomorrow
  const [postTime, setPostTime] = useState('07:30');
  const [postSeats, setPostSeats] = useState('4');
  const [postFare, setPostFare] = useState('');
  const [postCommunity, setPostCommunity] = useState('');
  const [isRecurring, setIsRecurring] = useState(false);
  const [postLoading, setPostLoading] = useState(false);

  const fetchDriverData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/login');
        return;
      }

      // Run template sync on launch
      await syncRecurringPostings();

      // 1. Fetch Profile
      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (profileData) {
        setProfile(profileData);
        setUsualRoute(profileData.usual_route || '');
        setAvailableTimeWindow(profileData.available_time_window || '');
        setDriverFare(String(profileData.driver_fare || 0));
        if (profileData.community_name) {
          setPostCommunity(profileData.community_name);
        }
        if (!postFare) setPostFare(String(profileData.driver_fare || 1000));
        if (!postPickup) setPostPickup(profileData.usual_route?.split(' to ')[0] || '');
      }

      // Fetch active postings
      const { data: postingsData } = await supabase
        .from('ride_postings')
        .select('*')
        .eq('driver_id', user.id);
      setPostings(postingsData || []);

      // Fetch templates
      const { data: templatesData } = await supabase
        .from('recurring_templates')
        .select('*')
        .eq('driver_id', user.id);
      setTemplates(templatesData || []);

      // 2. Fetch matched bookings
      const { data: bookingsData } = await supabase
        .from('bookings')
        .select('*')
        .eq('driver_id', user.id);

      const { data: allProfiles } = await supabase
        .from('profiles')
        .select('id, full_name, phone');

      // Fetch ratings submitted by driver
      const { data: userRatings } = await supabase
        .from('ratings')
        .select('booking_id, score')
        .eq('reviewer_id', user.id);

      const mappedBookings = (bookingsData || []).map((booking: any) => {
        const rider = (allProfiles || []).find((p: any) => p.id === booking.rider_id);
        const isRated = !!(userRatings || []).some((r: any) => r.booking_id === booking.id);
        return {
          ...booking,
          rider,
          riderName: rider?.full_name || 'Passenger',
          riderPhone: rider?.phone || '',
          partnerRating: rider?.rating || 5.0,
          isRated: isRated
        };
      });

      // Sort: matched/confirmed first, completed later
      mappedBookings.sort((a: any, b: any) => {
        const statusOrder: any = { confirmed: 1, matched: 1, completed: 2, cancelled: 3 };
        if (statusOrder[a.status] !== statusOrder[b.status]) {
          return statusOrder[a.status] - statusOrder[b.status];
        }
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      });

      setBookings(mappedBookings);
    } catch (err) {
      console.error('Error loading driver dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDriverData();
  }, [router]);

  const handleUpdateAvailability = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!usualRoute || !availableTimeWindow || !driverFare) {
      setMessage({ text: 'Please fill in route, time window and route fare', isError: true });
      return;
    }

    setUpdateLoading(true);
    setMessage(null);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase
        .from('profiles')
        .update({
          usual_route: usualRoute,
          available_time_window: availableTimeWindow,
          driver_fare: parseFloat(driverFare)
        })
        .eq('id', user.id);

      if (error) {
        setMessage({ text: error.message, isError: true });
      } else {
        setMessage({ text: 'Route and availability updated successfully!', isError: false });
        fetchDriverData();
      }
    } catch (err: any) {
      setMessage({ text: err.message || 'An error occurred', isError: true });
    } finally {
      setUpdateLoading(false);
    }
  };

  const handlePostRide = async (e: React.FormEvent) => {
    e.preventDefault();
    if (profile?.verification_status !== 'verified') {
      setIsVerificationModalOpen(true);
      return;
    }
    if (!postPickup || !postDestination || !postDate || !postTime || !postSeats || postFare === '') {
      showToast('Please fill in all required fields.', 'warning');
      return;
    }

    const parsedFare = parseFloat(postFare);
    if (isNaN(parsedFare) || parsedFare < 0) {
      showToast('Please enter a valid cost contribution (₦0 or higher).', 'warning');
      return;
    }
    if (parsedFare > 2000) {
      showToast('Carpooling Rule: Fuel contribution is capped at ₦2,000 to maintain non-commercial status.', 'warning');
      return;
    }
    const parsedSeats = parseInt(postSeats);
    if (parsedSeats > 4) {
      showToast('Carpooling Rule: Private vehicles may offer a maximum of 4 passenger seats.', 'warning');
      return;
    }

    setPostLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      let templateId = null;
      if (isRecurring) {
        // Create a template first
        const { data: newTemplate, error: tempError } = await supabase
          .from('recurring_templates')
          .insert({
            driver_id: user.id,
            pickup: postPickup,
            destination: postDestination,
            departure_time: postTime,
            days_of_week: '1,2,3,4,5', // Mon-Fri
            fare_per_seat: parseFloat(postFare),
            seats_total: parseInt(postSeats),
            active: true
          });
        
        if (tempError) {
          showToast('Failed to save recurring template: ' + tempError.message, 'error');
        } else if (newTemplate && newTemplate.length > 0) {
          templateId = newTemplate[0].id;
        }
      }

      // Insert posting
      const postingPayload: any = {
        driver_id: user.id,
        pickup: postPickup,
        destination: postDestination,
        departure_date: postDate,
        departure_time: postTime,
        seats_total: parseInt(postSeats),
        seats_available: parseInt(postSeats),
        fare_per_seat: parseFloat(postFare),
        is_recurring: isRecurring,
        recurring_template_id: templateId,
        status: 'active'
      };

      if (postCommunity && postCommunity.trim()) {
        postingPayload.community_name = postCommunity.trim();
      }

      let { data: newPosting, error: postError } = await supabase
        .from('ride_postings')
        .insert(postingPayload);

      // Graceful fallback: If community_name column does not exist in live Supabase DB, retry without it
      if (postError && (postError.code === '42703' || postError.message?.includes('community_name'))) {
        console.warn('community_name column not found in database, retrying insert without it:', postError.message);
        delete postingPayload.community_name;
        const retry = await supabase
          .from('ride_postings')
          .insert(postingPayload);
        newPosting = retry.data;
        postError = retry.error;
      }

      if (postError) {
        showToast('Failed to post ride: ' + postError.message, 'error');
      } else {
        showToast('Ride posted successfully!', 'success');
        
        // Trigger notifications for riders who prefer this route
        const { data: profiles } = await supabase.from('profiles').select('*').eq('role', 'rider');
        if (profiles) {
          for (const rider of profiles) {
            const pref = rider.preferred_routes || [];
            const matches = pref.some((route: string) => {
              const cleanRoute = route.toLowerCase();
              const pickLower = postPickup.toLowerCase();
              const destLower = postDestination.toLowerCase();
              return cleanRoute.includes(pickLower) && cleanRoute.includes(destLower);
            });
            if (matches) {
              await supabase.from('notifications').insert({
                user_id: rider.id,
                title: 'New Commute Posted',
                message: `${profile?.full_name || 'A driver'} posted a new commute: ${postPickup} → ${postDestination} on ${postDate} at ${postTime}. Fare: ₦${postFare}/seat.`,
                read: false
              });
            }
          }
        }

        // Reset form
        setPostPickup('');
        setIsRecurring(false);
        fetchDriverData();
      }
    } catch (err: any) {
      showToast(err.message || 'An error occurred', 'error');
    } finally {
      setPostLoading(false);
    }
  };

  const handleCancelPosting = async (postingId: string) => {
    const posting = postings.find(p => p.id === postingId);
    if (posting) {
      const departureTimeStr = `${posting.departure_date}T${posting.departure_time}`;
      const departureTime = new Date(departureTimeStr);
      const now = new Date();
      const timeDiffMs = departureTime.getTime() - now.getTime();
      const hoursRemaining = timeDiffMs / (1000 * 60 * 60);

      if (hoursRemaining < 2) {
        const hasConfirmedBookings = bookings.some(b => b.ride_posting_id === postingId && (b.status === 'confirmed' || b.status === 'matched'));
        if (hasConfirmedBookings) {
          showToast('Cannot cancel this ride posting within 2 hours of departure because riders have already confirmed matching commutes.', 'warning');
          return;
        }
      }
    }

    openConfirm(
      'Cancel Ride Posting',
      'Are you sure you want to cancel this ride posting? Any riders currently matched will be notified.',
      async () => {
        closeConfirm();
        try {
          const { error } = await supabase
            .from('ride_postings')
            .update({ status: 'cancelled' })
            .eq('id', postingId);

          if (error) {
            showToast('Failed to cancel posting: ' + error.message, 'error');
          } else {
            // Also cancel any bookings linked to this posting!
            const { data: bookingsData } = await supabase
              .from('bookings')
              .select('id, rider_id, status')
              .eq('ride_posting_id', postingId);

            if (bookingsData && bookingsData.length > 0) {
              for (const booking of bookingsData) {
                if (booking.status === 'confirmed' || booking.status === 'matched' || booking.status === 'requested' || booking.status === 'pending') {
                  await supabase
                    .from('bookings')
                    .update({ status: 'cancelled' })
                    .eq('id', booking.id);

                  // Notify Rider
                  await supabase.from('notifications').insert({
                    user_id: booking.rider_id,
                    title: 'Ride Cancelled by Driver',
                    message: `The ride matched on your route has been cancelled by the driver. Please search and book another commute.`,
                    read: false
                  });
                }
              }
            }

            fetchDriverData();
          }
        } catch (err: any) {
          showToast(err.message || 'Error occurred', 'error');
        }
      },
      true
    );
  };

  const handleToggleTemplate = async (templateId: string, currentActive: boolean) => {
    try {
      const { error } = await supabase
        .from('recurring_templates')
        .update({ active: !currentActive })
        .eq('id', templateId);

      if (error) {
        showToast('Failed to toggle template: ' + error.message, 'error');
      } else {
        fetchDriverData();
      }
    } catch (err: any) {
      showToast(err.message || 'Error occurred', 'error');
    }
  };

  const handleDeleteTemplate = async (templateId: string) => {
    openConfirm(
      'Delete Template',
      'Delete this recurring template? No further next-day rides will be auto-generated from it.',
      async () => {
        closeConfirm();
        try {
          const { error } = await supabase
            .from('recurring_templates')
            .delete()
            .eq('id', templateId);

          if (error) {
            showToast('Failed to delete template: ' + error.message, 'error');
          } else {
            fetchDriverData();
          }
        } catch (err: any) {
          showToast(err.message || 'Error occurred', 'error');
        }
      },
      true
    );
  };

  const handleCompleteBooking = async (bookingId: string) => {
    try {
      const { error } = await supabase
        .from('bookings')
        .update({ status: 'completed' })
        .eq('id', bookingId);

      if (error) {
        showToast('Failed to complete ride: ' + error.message, 'error');
      } else {
        fetchDriverData();
      }
    } catch (err: any) {
      showToast(err.message || 'Error completing booking', 'error');
    }
  };

  const handleCancelBooking = async (bookingId: string) => {
    const booking = bookings.find(b => b.id === bookingId);
    if (!booking) return;

    if (booking.status === 'confirmed' || booking.status === 'matched') {
      const departureTimeStr = `${booking.requested_date}T${booking.requested_time}`;
      const departureTime = new Date(departureTimeStr);
      const now = new Date();
      const timeDiffMs = departureTime.getTime() - now.getTime();
      const hoursRemaining = timeDiffMs / (1000 * 60 * 60);

      if (hoursRemaining < 2) {
        showToast('Cannot cancel passenger match within 2 hours of scheduled departure time.', 'warning');
        return;
      }
    }

    openConfirm(
      'Cancel Passenger Match',
      'Are you sure you want to cancel this booking? Passenger will see that the match was cancelled.',
      async () => {
        closeConfirm();
        try {
          const { error } = await supabase
            .from('bookings')
            .update({ status: 'cancelled' })
            .eq('id', bookingId);

          if (error) {
            showToast('Failed to cancel match: ' + error.message, 'error');
          } else {
            fetchDriverData();
          }
        } catch (err: any) {
          showToast(err.message || 'Error cancelling booking', 'error');
        }
      },
      true
    );
  };

  if (loading) {
    return (
      <div className="flex min-h-screen bg-gazie-paper items-center justify-center text-gazie-navy">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-4 border-gazie-yellow border-t-gazie-navy rounded-full animate-spin mx-auto" />
          <p className="font-display font-bold text-sm">Loading Driver Workspace...</p>
        </div>
      </div>
    );
  }

  const isPending = profile?.verification_status === 'pending_review';
  const isRejected = profile?.verification_status === 'rejected';
  const isEmailVerified = profile?.verification_status === 'email_verified';
  const isVerified = profile?.verification_status === 'verified';

  return (
    <div className="flex flex-col min-h-screen bg-gazie-paper text-gazie-navy">
      <Navbar />

      {/* Toast notifications */}
      <Toast toasts={toasts} onDismiss={dismissToast} />

      {/* Confirm dialog */}
      <ConfirmDialog
        open={confirmDialog.open}
        title={confirmDialog.title}
        message={confirmDialog.message}
        danger={confirmDialog.danger}
        onConfirm={confirmDialog.onConfirm}
        onCancel={closeConfirm}
      />

      <main className="flex-1 max-w-lg mx-auto w-full px-4 py-6 space-y-6">

        {/* Persistent Verification CTA Banners */}
        {(isEmailVerified || isRejected) && (
          <div className="bg-amber-50 border-2 border-amber-500 rounded-2xl p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 text-left">
            <div>
              <span className="font-display font-black text-xs uppercase text-amber-800">Verification Required</span>
              <p className="text-[10px] text-amber-800/80 mt-0.5 font-semibold">
                {isRejected 
                  ? `Your documents were rejected (${profile?.rejection_reason || "invalid info"}). Complete profile uploads to unlock matchmaking.` 
                  : "Complete verification to unlock ride requests or postings."}
              </p>
            </div>
            <button
              onClick={() => router.push('/profile')}
              className="bg-amber-500 hover:bg-amber-600 text-white font-bold text-[10px] py-1.5 px-3 rounded-lg transition shrink-0 uppercase tracking-wider"
            >
              Upload Documents
            </button>
          </div>
        )}

        {isPending && (
          <div className="bg-blue-50 border-2 border-blue-500 rounded-2xl p-4 flex items-start gap-3 text-left">
            <FileText className="w-5 h-5 text-blue-700 shrink-0 mt-0.5" />
            <div>
              <span className="font-display font-black text-xs uppercase text-blue-800">Documents Under Review</span>
              <p className="text-[10px] text-blue-800/80 mt-0.5 font-semibold leading-relaxed">
                Your verification documents have been submitted. Matches can be locked once approved by admin.
              </p>
            </div>
          </div>
        )}

        <div className="flex border-2 border-gazie-navy rounded-xl overflow-hidden bg-white">
          <button
            onClick={() => setActiveTab('matches')}
            className={`flex-1 py-2 text-center text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'matches' ? 'bg-gazie-navy text-gazie-paper' : 'bg-white text-gazie-navy hover:bg-gazie-paper/30'
            }`}
          >
            📋 Commutes & Matches
          </button>
          <button
            onClick={() => setActiveTab('postings')}
            className={`flex-1 py-2 text-center text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'postings' ? 'bg-gazie-navy text-gazie-paper' : 'bg-white text-gazie-navy hover:bg-gazie-paper/30'
            }`}
          >
            🚗 Post & Manage Rides
          </button>
        </div>

        {/* Action feedback message */}
        {message && (
          <div className={`p-3 rounded-lg text-xs font-semibold ${
            message.isError ? 'bg-red-50 text-red-700 border border-red-200' : 'bg-green-50 text-gazie-green border border-gazie-green/20'
          }`}>
            {message.text}
          </div>
        )}

        {activeTab === 'matches' && (
          <>
            {/* 1. Vehicle & Route Profile Summary */}
            <section className="bg-white border-2 border-gazie-navy rounded-2xl p-5 shadow-sm space-y-4">
              <div className="border-b border-dashed border-gazie-navy/10 pb-2 flex items-center justify-between">
                <h2 className="font-display font-extrabold text-sm uppercase tracking-wider text-gazie-navy/70 flex items-center gap-1.5">
                  <Car className="w-4 h-4 text-gazie-navy" /> Driver Profile & Vehicle
                </h2>
                <Link
                  href="/profile"
                  className="text-[11px] font-bold text-gazie-navy hover:text-gazie-green underline flex items-center gap-1 cursor-pointer"
                >
                  Edit in Profile <ArrowRight className="w-3 h-3" />
                </Link>
              </div>

              <div className="grid grid-cols-2 gap-4 text-xs font-semibold">
                <div>
                  <span className="opacity-60 block text-[10px]">VEHICLE</span>
                  <span className="text-sm font-bold text-gazie-navy block">
                    {profile?.vehicle_make && profile?.vehicle_model 
                      ? `${profile.vehicle_make} ${profile.vehicle_model}`
                      : 'Not configured'}
                  </span>
                  <span className="font-mono text-[10px] text-gazie-navy/60 block mt-0.5">
                    Plate: {profile?.vehicle_plate || 'None'}
                  </span>
                </div>
                <div>
                  <span className="opacity-60 block text-[10px]">DEFAULT ROUTE & FARE</span>
                  <span className="text-sm font-bold text-gazie-navy block truncate" title={profile?.usual_route || 'Not set'}>
                    {profile?.usual_route || 'Not set'}
                  </span>
                  <span className="font-mono text-[10px] text-[#2D6A4F] font-bold block mt-0.5">
                    ₦{profile?.driver_fare || 0}/seat • {profile?.available_time_window || 'Morning'}
                  </span>
                </div>
              </div>
            </section>

            {/* 2. My Passenger Tickets */}
            <section className="space-y-3">
              <h2 className="font-display font-extrabold text-lg tracking-tight">My Scheduled Commutes</h2>
              {bookings.length === 0 ? (
                <div className="bg-white border border-dashed border-gazie-navy/20 rounded-2xl p-8 text-center">
                  <p className="text-xs text-gazie-navy/60 font-semibold">You have no passenger matches assigned yet.</p>
                  <p className="text-[10px] text-gazie-navy/40 mt-1">Once the administrator matches a rider to your route, it will appear here as a trip ticket.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {bookings.map((booking) => (
                    <Ticket
                      key={booking.id}
                      id={booking.id}
                      pickup={booking.pickup}
                      destination={booking.destination}
                      date={booking.requested_date}
                      time={booking.requested_time}
                      status={booking.status}
                      fare={booking.driver_fare}
                      role="driver"
                      riderName={booking.riderName}
                      riderPhone={isVerified ? booking.riderPhone : 'Unverified (Contact Hidden)'}
                      partnerRating={booking.partnerRating}
                      isRated={booking.isRated}
                      onRate={
                        (booking.status === 'completed' || booking.status === 'confirmed' || booking.status === 'matched')
                          ? () => setRatingModalBooking(booking)
                          : undefined
                      }
                      onCancel={
                        (booking.status === 'confirmed' || booking.status === 'matched')
                          ? () => handleCancelBooking(booking.id)
                          : undefined
                      }
                      onComplete={
                        (booking.status === 'confirmed' || booking.status === 'matched')
                          ? () => handleCompleteBooking(booking.id)
                          : undefined
                      }
                    />
                  ))}
                </div>
              )}
            </section>
          </>
        )}

        {activeTab === 'postings' && (
          <>
            {/* Community Carpooling Notice Card */}
            <div className="bg-amber-50/90 border-2 border-amber-300 rounded-2xl p-4 flex items-start gap-3 text-left">
              <AlertTriangle className="w-5 h-5 text-amber-800 shrink-0 mt-0.5" />
              <div className="space-y-0.5">
                <span className="font-display font-black text-xs uppercase text-amber-900">
                  Community Carpooling Rule (Non-Commercial Pilot)
                </span>
                <p className="text-[11px] text-amber-950/80 font-medium leading-relaxed">
                  Only post pre-planned commutes you are already driving. Commercial taxi operations, on-demand hailing, airport charters, and surge pricing are strictly prohibited. Payments are voluntary fuel cost offsets (₦0 allowed for free community lifts).
                </p>
              </div>
            </div>

            {/* Post a Ride Form */}
            <section className="bg-white border-2 border-gazie-navy rounded-2xl p-5 shadow-sm space-y-4">
              <div className="border-b border-dashed border-gazie-navy/10 pb-3 flex justify-between items-center">
                <h2 className="font-display font-extrabold text-lg tracking-tight">Post a Daily Commute</h2>
                <span className="font-mono text-[10px] bg-gazie-yellow text-gazie-navy px-2 py-0.5 rounded font-bold uppercase">
                  Verified Carpool
                </span>
              </div>

              <form onSubmit={handlePostRide} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold uppercase tracking-wider text-gazie-navy/70 block">Pickup Area / Departure Landmark</label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gazie-navy/40" />
                    <input
                      type="text"
                      placeholder="e.g. Lugbe (FHA Gate / Trademore / VoA)"
                      value={postPickup}
                      onChange={(e) => setPostPickup(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 bg-gazie-paper/20 border border-gazie-navy rounded-xl text-xs focus:outline-none focus:border-gazie-yellow font-semibold"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <div className="flex justify-between items-center">
                    <label className="text-xs font-bold uppercase tracking-wider text-gazie-navy/70 block">Destination (Drop-off Hub)</label>
                    <span className="text-[9px] text-gazie-navy/50 font-semibold">Select or type custom hub</span>
                  </div>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gazie-navy/40" />
                    <input
                      type="text"
                      list="driver-destinations-list"
                      placeholder="e.g. Berger, Secretariat, Wuse II, Area 10..."
                      value={postDestination}
                      onChange={(e) => setPostDestination(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 bg-gazie-paper/20 border border-gazie-navy rounded-xl text-xs focus:outline-none focus:border-gazie-yellow font-semibold"
                      required
                    />
                    <datalist id="driver-destinations-list">
                      {STANDARD_ABUJA_DESTINATIONS.map((dest) => (
                        <option key={dest} value={dest} />
                      ))}
                    </datalist>
                  </div>

                  {/* Quick Select Destination Pills */}
                  <div className="flex flex-wrap gap-1 pt-1">
                    {['Berger', 'Federal Secretariat', 'Wuse II', 'Area 1', 'Area 10', 'Area 11', 'Banex Plaza', 'Gudu', 'Airport Road', 'Dunamis'].map((hub) => (
                      <button
                        type="button"
                        key={hub}
                        onClick={() => setPostDestination(hub)}
                        className={`text-[9px] px-2 py-0.5 rounded-full border transition cursor-pointer ${
                          postDestination === hub
                            ? 'bg-gazie-navy text-white border-gazie-navy font-bold'
                            : 'bg-white text-gazie-navy/70 border-gazie-navy/20 hover:border-gazie-navy hover:text-gazie-navy'
                        }`}
                      >
                        {hub}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold uppercase tracking-wider text-gazie-navy/70 block">Departure Date</label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gazie-navy/40" />
                      <input
                        type="date"
                        value={postDate}
                        onChange={(e) => setPostDate(e.target.value)}
                        className="w-full pl-9 pr-3 py-2 bg-gazie-paper/20 border border-gazie-navy rounded-xl text-xs font-mono focus:outline-none focus:border-gazie-yellow font-semibold"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold uppercase tracking-wider text-gazie-navy/70 block">Departure Time</label>
                    <div className="relative">
                      <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gazie-navy/40" />
                      <input
                        type="time"
                        value={postTime}
                        onChange={(e) => setPostTime(e.target.value)}
                        className="w-full pl-9 pr-3 py-2 bg-gazie-paper/20 border border-gazie-navy rounded-xl text-xs font-mono focus:outline-none focus:border-gazie-yellow font-semibold"
                        required
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold uppercase tracking-wider text-gazie-navy/70 block">Empty Seats (Max 4)</label>
                    <input
                      type="number"
                      value={postSeats}
                      onChange={(e) => setPostSeats(e.target.value)}
                      className="w-full px-3 py-2 bg-gazie-paper/20 border border-gazie-navy rounded-xl text-xs font-mono font-bold focus:outline-none focus:border-gazie-yellow"
                      min="1"
                      max="4"
                      required
                    />
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between items-center">
                      <label className="text-xs font-bold uppercase tracking-wider text-gazie-navy/70 block">
                        Fuel Contribution (₦)
                      </label>
                      <button
                        type="button"
                        onClick={() => setPostFare('0')}
                        className="text-[9px] font-bold text-gazie-green underline cursor-pointer hover:opacity-80"
                      >
                        Free (₦0)
                      </button>
                    </div>
                    <input
                      type="number"
                      value={postFare}
                      onChange={(e) => setPostFare(e.target.value)}
                      className="w-full px-3 py-2 bg-gazie-paper/20 border border-gazie-navy rounded-xl text-xs font-mono font-bold focus:outline-none focus:border-gazie-yellow"
                      min="0"
                      max="2000"
                      placeholder="e.g. 800 (₦0 for free lift)"
                      required
                    />
                  </div>
                </div>

                {/* Community / Service Hub Tag (Optional) */}
                <div className="space-y-1">
                  <div className="flex justify-between items-center">
                    <label className="text-xs font-bold uppercase tracking-wider text-gazie-navy/70 block">
                      Community / Service Tag <span className="font-normal lowercase text-gazie-navy/50">(optional)</span>
                    </label>
                    <span className="text-[9px] text-[#2D6A4F] font-bold">Trusted Brethren Match</span>
                  </div>
                  <select
                    value={postCommunity}
                    onChange={(e) => setPostCommunity(e.target.value)}
                    className="w-full px-3 py-2 bg-gazie-paper/20 border border-gazie-navy rounded-xl text-xs font-semibold focus:outline-none focus:border-gazie-yellow cursor-pointer"
                  >
                    <option value="">🌟 General Commute (Open to All Verified Commuters)</option>
                    {COMMUNITY_HUBS.map((hub) => (
                      <option key={hub.id} value={hub.shortName}>
                        {hub.icon} {hub.shortName} ({hub.type === 'church' ? 'Service/Fellowship' : 'Hub'})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <input
                    type="checkbox"
                    id="isRecurring"
                    checked={isRecurring}
                    onChange={(e) => setIsRecurring(e.target.checked)}
                    className="w-4 h-4 text-gazie-navy bg-gazie-paper border-gazie-navy rounded focus:ring-0 focus:outline-none cursor-pointer"
                  />
                  <label htmlFor="isRecurring" className="text-xs font-semibold text-gazie-navy cursor-pointer select-none">
                    Repeat this routine daily (Mon-Fri)
                  </label>
                </div>

                <button
                  type="submit"
                  disabled={postLoading}
                  className="w-full bg-gazie-navy text-gazie-paper font-bold py-2.5 rounded-xl border border-gazie-navy hover:bg-gazie-yellow hover:text-gazie-navy transition-all duration-200 text-xs shadow-sm cursor-pointer disabled:opacity-50"
                >
                  {postLoading ? 'Posting ride...' : 'Post This Ride'}
                </button>
              </form>
            </section>

            {/* Active Postings List */}
            <section className="space-y-3">
              <h2 className="font-display font-extrabold text-lg tracking-tight">My Active Ride Postings</h2>
              {postings.filter(p => p.status === 'active' || p.status === 'full').length === 0 ? (
                <div className="bg-white border border-dashed border-gazie-navy/20 rounded-2xl p-6 text-center">
                  <p className="text-xs text-gazie-navy/60 font-semibold">You have no active trip postings.</p>
                  <p className="text-[10px] text-gazie-navy/40 mt-1">Post a commute using the form above.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {postings.filter(p => p.status === 'active' || p.status === 'full').map((post) => (
                    <Ticket
                      key={post.id}
                      id={post.id}
                      pickup={post.pickup}
                      destination={post.destination}
                      date={post.departure_date}
                      time={post.departure_time}
                      status={post.status}
                      fare={post.fare_per_seat}
                      role="driver"
                      riderName={`${post.seats_available} of ${post.seats_total} seats remaining`}
                      communityName={post.community_name}
                      onCancel={() => handleCancelPosting(post.id)}
                      showMapPreview={true}
                    />
                  ))}
                </div>
              )}
            </section>

            {/* Recurring templates list */}
            {templates.length > 0 && (
              <section className="bg-white border-2 border-gazie-navy rounded-2xl p-5 shadow-sm space-y-3">
                <h3 className="font-display font-bold text-sm uppercase tracking-wider text-gazie-navy/80">
                  🔄 Active Recurring Routes
                </h3>
                <div className="divide-y divide-dashed divide-gazie-navy/10 text-xs">
                  {templates.map((temp) => (
                    <div key={temp.id} className="py-2.5 flex justify-between items-center gap-4">
                      <div className="space-y-0.5 min-w-0">
                        <span className="font-bold text-gazie-navy block truncate">{temp.pickup} → {temp.destination}</span>
                        <span className="font-mono text-[10px] text-gazie-navy/60 block">
                          ⏰ {temp.departure_time} | ₦{temp.fare_per_seat} | Weekdays (Mon-Fri)
                        </span>
                      </div>
                      <div className="flex gap-2 shrink-0">
                        <button
                          onClick={() => handleToggleTemplate(temp.id, temp.active)}
                          className={`p-1.5 rounded-lg border transition text-white ${
                            temp.active 
                              ? 'bg-gazie-green border-gazie-green hover:opacity-90' 
                              : 'bg-gazie-navy/40 border-gazie-navy/10 hover:bg-gazie-navy/55'
                          } cursor-pointer`}
                          title={temp.active ? 'Pause auto-posting' : 'Resume auto-posting'}
                        >
                          <Power className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteTemplate(temp.id)}
                          className="p-1.5 rounded-lg bg-red-50 text-red-600 border border-red-200 hover:bg-red-100 cursor-pointer"
                          title="Delete Template"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </>
        )}

        {/* 4. Safety Report Shortcut */}
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex justify-between items-center text-xs">
          <div>
            <span className="font-bold text-red-800 block">Report Route Incident</span>
            <span className="text-[10px] text-red-700 block mt-0.5">Encountered route anomalies, vehicle issues, or security delays? File a report.</span>
          </div>
          <button
            onClick={() => router.push('/safety')}
            className="bg-red-700 text-white font-bold py-1.5 px-3 rounded-lg hover:bg-red-800 transition text-[10px] cursor-pointer"
          >
            File Report
          </button>
        </div>

      </main>
      {/* Verification overlay modal */}
      <VerificationModal
        isOpen={isVerificationModalOpen}
        onClose={() => setIsVerificationModalOpen(false)}
        profile={profile}
        onSuccess={(updatedProfile) => {
          setProfile(updatedProfile);
        }}
      />

      {/* Rating & Review Modal */}
      <RatingModal
        isOpen={!!ratingModalBooking}
        onClose={() => setRatingModalBooking(null)}
        booking={ratingModalBooking}
        currentUserId={profile?.id}
        onSuccess={() => {
          showToast('Rating submitted successfully! Thank you.', 'success');
          fetchDriverData();
        }}
      />
    </div>
  );
}
