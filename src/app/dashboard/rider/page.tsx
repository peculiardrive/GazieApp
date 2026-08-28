"use client";

import React, { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { supabase, syncRecurringPostings, confirmMatch, isMock } from '@/lib/supabase';
import Navbar from '@/components/ui/Navbar';
import Ticket from '@/components/ui/Ticket';
import Toast, { useToast } from '@/components/ui/Toast';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import { MapPin, Clock, Calendar, AlertTriangle, ShieldAlert, Phone, Bell, CheckSquare, Search, Sparkles, UserCheck, ArrowRight, FileText } from 'lucide-react';
import Script from 'next/script';
import VerificationModal from '@/components/ui/VerificationModal';
import { STANDARD_ABUJA_DESTINATIONS } from '@/lib/routes';

export default function RiderDashboard() {
  const router = useRouter();
  const [profile, setProfile] = useState<any>(null);
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isVerificationModalOpen, setIsVerificationModalOpen] = useState(false);

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

  // Payment verification hooks
  const [paymentProcessing, setPaymentProcessing] = useState(false);
  const [paymentBookingId, setPaymentBookingId] = useState<string | null>(null);

  const pollBookingStatus = (bookingId: string) => {
    let attempts = 0;
    const maxAttempts = 12; // 36 seconds max
    
    const interval = setInterval(async () => {
      attempts++;
      try {
        const { data: booking } = await supabase
          .from('bookings')
          .select('status')
          .eq('id', bookingId)
          .single();
        
        if (booking && (booking.status === 'confirmed' || booking.status === 'matched')) {
          clearInterval(interval);
          setPaymentProcessing(false);
          setPaymentBookingId(null);
          showToast('Payment verified! Your match has been unlocked.', 'success');
          fetchRiderData();
        } else if (booking && booking.status === 'payment_failed') {
          clearInterval(interval);
          setPaymentProcessing(false);
          setPaymentBookingId(null);
          showToast('Unlock confirmation failed. Please retry.', 'error');
          fetchRiderData();
        } else if (attempts >= maxAttempts) {
          clearInterval(interval);
          setPaymentProcessing(false);
          setPaymentBookingId(null);
          showToast('Verification is taking longer than expected. We will notify you once confirmed.', 'warning');
          fetchRiderData();
        }
      } catch (err) {
        console.error('Error polling booking status:', err);
      }
    }, 3000);
  };

  const triggerPaystackCheckout = (bookingId: string, posting: any, riderEmail: string) => {
    if (typeof window === 'undefined' || !(window as any).PaystackPop) {
      showToast('Payment gateway is loading. Please try again.', 'warning');
      return;
    }

    const publicKey = process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY || '';
    if (!publicKey) {
      showToast('Payment gateway configuration is missing. Please contact support.', 'error');
      return;
    }

    const handler = (window as any).PaystackPop.setup({
      key: publicKey,
      email: riderEmail,
      amount: 5000, // ₦50 in kobo
      ref: bookingId,
      channels: ['card', 'bank_transfer', 'ussd'],
      callback: function(response: any) {
        setPaymentProcessing(true);
        setPaymentBookingId(bookingId);
        pollBookingStatus(bookingId);
      },
      onClose: function() {
        showToast('Checkout cancelled.', 'info');
      }
    });
    handler.openIframe();
  };

  const triggerMockCheckout = (bookingId: string, postingId: string) => {
    const paySuccessful = window.confirm("[MOCK PAYMENT] Simulating ₦50 platform unlock checkout.\n\nClick OK to simulate charge.success\nClick Cancel to simulate charge.failed");
    
    if (paySuccessful) {
      const postingsKey = 'gazie_ride_postings';
      const bookingsKey = 'gazie_bookings';
      const notificationsKey = 'gazie_notifications';

      let postingsList = JSON.parse(localStorage.getItem(postingsKey) || '[]');
      let bookingsList = JSON.parse(localStorage.getItem(bookingsKey) || '[]');
      let notificationsList = JSON.parse(localStorage.getItem(notificationsKey) || '[]');

      const bookingIndex = bookingsList.findIndex((b: any) => b.id === bookingId);
      if (bookingIndex === -1) {
        showToast('Booking record not found.', 'error');
        return;
      }

      const postingIndex = postingsList.findIndex((p: any) => p.id === postingId);
      if (postingIndex === -1) {
        showToast('Posting not found.', 'error');
        return;
      }

      const posting = postingsList[postingIndex];
      if (posting.seats_available <= 0) {
        bookingsList[bookingIndex].status = 'payment_failed';
        localStorage.setItem(bookingsKey, JSON.stringify(bookingsList));
        showToast('Seats are no longer available. Match failed.', 'error');
        fetchRiderData();
        return;
      }

      // Decrement seats
      posting.seats_available -= 1;
      if (posting.seats_available === 0) {
        posting.status = 'full';
      }
      postingsList[postingIndex] = posting;

      // Confirm booking
      bookingsList[bookingIndex].status = 'confirmed';
      bookingsList[bookingIndex].platform_fee = 50;
      
      // Log payment in local storage mock payments
      const paymentsKey = 'gazie_payments';
      const payments = JSON.parse(localStorage.getItem(paymentsKey) || '[]');
      payments.push({
        id: crypto.randomUUID(),
        booking_id: bookingId,
        reference: bookingId,
        amount: 50,
        status: 'success',
        created_at: new Date().toISOString()
      });
      localStorage.setItem(paymentsKey, JSON.stringify(payments));

      // Notifications
      notificationsList.push({
        id: crypto.randomUUID(),
        user_id: bookingsList[bookingIndex].rider_id,
        title: 'Unlock Confirmed!',
        message: `Payment verified. Your ride match from ${posting.pickup} to ${posting.destination} has been confirmed successfully.`,
        read: false,
        created_at: new Date().toISOString()
      }, {
        id: crypto.randomUUID(),
        user_id: posting.driver_id,
        title: 'Passenger Confirmed',
        message: `A passenger has completed payment and joined your posted commute from ${posting.pickup} to ${posting.destination}.`,
        read: false,
        created_at: new Date().toISOString()
      });

      localStorage.setItem(postingsKey, JSON.stringify(postingsList));
      localStorage.setItem(bookingsKey, JSON.stringify(bookingsList));
      localStorage.setItem(notificationsKey, JSON.stringify(notificationsList));

      showToast('Mock Payment Success! Ride match unlocked.', 'success');
      fetchRiderData();
    } else {
      const bookingsKey = 'gazie_bookings';
      let bookingsList = JSON.parse(localStorage.getItem(bookingsKey) || '[]');
      const bookingIndex = bookingsList.findIndex((b: any) => b.id === bookingId);
      if (bookingIndex !== -1) {
        bookingsList[bookingIndex].status = 'payment_failed';
        localStorage.setItem(bookingsKey, JSON.stringify(bookingsList));
      }
      showToast('Mock Payment Failed.', 'error');
      fetchRiderData();
    }
  };

  // New Booking form state
  const [pickup, setPickup] = useState('');
  const [destination, setDestination] = useState('');
  const [requestedDate, setRequestedDate] = useState(new Date().toISOString().split('T')[0]);
  const [requestedTime, setRequestedTime] = useState('07:30');
  const [emergencyContact, setEmergencyContact] = useState('');

  const [bookingSubmitLoading, setBookingSubmitLoading] = useState(false);
  const [emergencyUpdateLoading, setEmergencyUpdateLoading] = useState(false);
  const [message, setMessage] = useState<{ text: string; isError: boolean } | null>(null);

  // Tab state
  const [activeTab, setActiveTab] = useState<'browse' | 'passes'>('browse');

  // Browse ride postings state
  const [allPostings, setAllPostings] = useState<any[]>([]);
  const [searchDest, setSearchDest] = useState('all');
  const [searchDate, setSearchDate] = useState(new Date(Date.now() + 86400000).toISOString().split('T')[0]); // tomorrow
  const [allDrivers, setAllDrivers] = useState<any[]>([]);

  // Notifications state
  const [notifications, setNotifications] = useState<any[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);

  const fetchRiderData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/login');
        return;
      }

      await syncRecurringPostings();

      // 1. Fetch Profile
      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (profileData) {
        setProfile(profileData);
        setEmergencyContact(profileData.emergency_contact || '');
      }

      // 2. Fetch Bookings (include driver details if matched)
      const { data: bookingsData } = await supabase
        .from('bookings')
        .select('*')
        .eq('rider_id', user.id);

      const { data: allProfiles } = await supabase
        .from('profiles')
        .select('*');

      setAllDrivers((allProfiles || []).filter((p: any) => p.role === 'driver'));

      const mappedBookings = (bookingsData || []).map((booking: any) => {
        const driver = (allProfiles || []).find((p: any) => p.id === booking.driver_id);
        return {
          ...booking,
          driverName: driver?.full_name || 'Awaiting Admin Match',
          driverPhone: driver?.phone || '',
          vehicleInfo: driver ? `${driver.vehicle_make} ${driver.vehicle_model} [${driver.vehicle_plate}]` : '',
        };
      });

      // Sort bookings (newest first)
      mappedBookings.sort((a: any, b: any) => {
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      });

      setBookings(mappedBookings);

      // Fetch active postings
      const { data: postingsData } = await supabase
        .from('ride_postings')
        .select('*');
      setAllPostings(postingsData || []);

      // Fetch notifications
      const { data: notificationsData } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id);
      
      const sortedNotifs = (notificationsData || []).sort((a: any, b: any) => {
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      });
      setNotifications(sortedNotifs);

    } catch (err) {
      console.error('Error fetching rider dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRiderData();
  }, [router]);

  const handleCreateBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (profile?.verification_status !== 'verified') {
      setIsVerificationModalOpen(true);
      return;
    }
    if (!pickup || !destination || !requestedTime) {
      setMessage({ text: 'Please fill in pickup, destination and departure time', isError: true });
      return;
    }

    setBookingSubmitLoading(true);
    setMessage(null);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase.from('bookings').insert({
        rider_id: user.id,
        pickup,
        destination,
        requested_date: requestedDate,
        requested_time: requestedTime,
        status: 'requested',
        driver_fare: 0,
        platform_fee: 0
      });

      if (error) {
        setMessage({ text: error.message, isError: true });
      } else {
        setMessage({ text: 'Ride request submitted successfully! Pending admin match.', isError: false });
        setPickup('');
        setDestination('');
        fetchRiderData();
      }
    } catch (err: any) {
      setMessage({ text: err.message || 'An error occurred', isError: true });
    } finally {
      setBookingSubmitLoading(false);
    }
  };

  const handleUpdateEmergency = async (e: React.FormEvent) => {
    e.preventDefault();
    setEmergencyUpdateLoading(true);
    setMessage(null);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase
        .from('profiles')
        .update({ emergency_contact: emergencyContact })
        .eq('id', user.id);

      if (error) {
        setMessage({ text: error.message, isError: true });
      } else {
        setMessage({ text: 'Emergency contact updated successfully!', isError: false });
        fetchRiderData();
      }
    } catch (err: any) {
      setMessage({ text: err.message || 'An error occurred', isError: true });
    } finally {
      setEmergencyUpdateLoading(false);
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
        showToast('Cannot cancel booking within 2 hours of scheduled departure time.', 'warning');
        return;
      }
    }

    openConfirm(
      'Cancel Booking',
      'Are you sure you want to cancel this booking?',
      async () => {
        closeConfirm();
        try {
          if ((booking.status === 'confirmed' || booking.status === 'matched') && booking.ride_posting_id) {
            const { data: postingData } = await supabase
              .from('ride_postings')
              .select('*')
              .eq('id', booking.ride_posting_id)
              .single();

            if (postingData) {
              const updatedSeats = postingData.seats_available + 1;
              await supabase
                .from('ride_postings')
                .update({
                  seats_available: updatedSeats,
                  status: 'active'
                })
                .eq('id', booking.ride_posting_id);
            }
          }

          const { error } = await supabase
            .from('bookings')
            .update({ status: 'cancelled' })
            .eq('id', bookingId);

          if (error) {
            showToast('Failed to cancel booking: ' + error.message, 'error');
          } else {
            fetchRiderData();
          }
        } catch (err: any) {
          showToast(err.message || 'Error occurred while cancelling', 'error');
        }
      },
      true
    );
  };

  const handleRequestRidePosting = async (posting: any) => {
    if (profile?.verification_status !== 'verified') {
      setIsVerificationModalOpen(true);
      return;
    }

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      if (posting.seats_available <= 0) {
        showToast('This ride posting is already full!', 'warning');
        return;
      }

      const alreadyRequested = bookings.some(
        b => b.ride_posting_id === posting.id && b.status !== 'cancelled' && b.status !== 'payment_failed'
      );
      if (alreadyRequested) {
        showToast('You have already submitted a request for this commute.', 'info');
        return;
      }

      const isFeeEnabled = process.env.NEXT_PUBLIC_PLATFORM_FEE_ENABLED === 'true';

      if (isFeeEnabled) {
        let bookingId = '';

        if (isMock) {
          // Create a mock requested booking
          const bookingsKey = 'gazie_bookings';
          const bookingsList = JSON.parse(localStorage.getItem(bookingsKey) || '[]');
          bookingId = crypto.randomUUID();
          
          bookingsList.push({
            id: bookingId,
            rider_id: user.id,
            driver_id: posting.driver_id,
            role: 'rider',
            pickup: posting.pickup,
            destination: posting.destination,
            requested_date: posting.departure_date,
            requested_time: posting.departure_time,
            status: 'requested',
            driver_fare: posting.fare_per_seat,
            platform_fee: 0,
            created_at: new Date().toISOString()
          });
          localStorage.setItem(bookingsKey, JSON.stringify(bookingsList));
          
          fetchRiderData();
          triggerMockCheckout(bookingId, posting.id);
        } else {
          // Insert a real requested booking
          const { data: newBooking, error: bookingErr } = await supabase
            .from('bookings')
            .insert({
              rider_id: user.id,
              driver_id: posting.driver_id,
              ride_posting_id: posting.id,
              pickup: posting.pickup,
              destination: posting.destination,
              requested_date: posting.departure_date,
              requested_time: posting.departure_time,
              status: 'requested',
              driver_fare: posting.fare_per_seat,
              platform_fee: 0
            })
            .select('id')
            .single();

          if (bookingErr || !newBooking) {
            showToast('Failed to initialize request: ' + (bookingErr?.message || 'Unknown error'), 'error');
            return;
          }

          bookingId = newBooking.id;
          fetchRiderData();
          triggerPaystackCheckout(bookingId, posting, user.email || `${user.phone}@gazie.com`);
        }
      } else {
        // Free pilot flow: confirm immediately
        const { data: confirmRes, error: confirmError } = await confirmMatch(user.id, posting.id);
        if (confirmError) {
          showToast('Failed to request ride match: ' + confirmError.message, 'error');
          return;
        }

        // Register route preference for matches notifications updates
        const routeStr = `${posting.pickup} to ${posting.destination}`;
        const currentPrefs = profile?.preferred_routes || [];
        if (!currentPrefs.includes(routeStr)) {
          const newPrefs = [...currentPrefs, routeStr];
          await supabase
            .from('profiles')
            .update({ preferred_routes: newPrefs })
            .eq('id', user.id);
        }

        showToast('Trip request submitted! Your match is confirmed instantly.', 'success');
        fetchRiderData();
      }
    } catch (err: any) {
      showToast(err.message || 'Error occurred', 'error');
    }
  };

  const handleMarkNotificationsRead = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('user_id', user.id);

      if (error) {
        console.error('Error marking read:', error);
      } else {
        fetchRiderData();
      }
    } catch (err: any) {
      console.error(err);
    }
  };

  const formatReadableDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="flex min-h-screen bg-gazie-paper items-center justify-center text-gazie-navy">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-4 border-gazie-yellow border-t-gazie-navy rounded-full animate-spin mx-auto" />
          <p className="font-display font-bold text-sm">Loading Rider Workspace...</p>
        </div>
      </div>
    );
  }

  const isVerified = profile?.verification_status === 'verified';
  const isPending = profile?.verification_status === 'pending_review';
  const isRejected = profile?.verification_status === 'rejected';
  const isEmailVerified = profile?.verification_status === 'email_verified';

  // Filter postings based on search params
  const filteredPostings = allPostings.filter(post => {
    const routeMatch = searchDest === 'all' || post.destination === searchDest;
    const dateMatch = !searchDate || post.departure_date === searchDate;
    const activeMatch = post.status === 'active' && post.seats_available > 0;
    return routeMatch && dateMatch && activeMatch;
  });

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
        confirmLabel="Yes, Cancel"
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
                  ? `Your documents were rejected (${profile?.rejection_reason || "invalid info"}). Complete profile uploads to unlock matching.` 
                  : "Complete verification to unlock ride booking or postings."}
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
            onClick={() => setActiveTab('browse')}
            className={`flex-1 py-2 text-center text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'browse' ? 'bg-gazie-navy text-gazie-paper' : 'bg-white text-gazie-navy hover:bg-gazie-paper/30'
            }`}
          >
            🔍 Browse & Book Rides
          </button>
          <button
            onClick={() => setActiveTab('passes')}
            className={`flex-1 py-2 text-center text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'passes' ? 'bg-gazie-navy text-gazie-paper' : 'bg-white text-gazie-navy hover:bg-gazie-paper/30'
            }`}
          >
            🎟️ My Passes & Profile
          </button>
        </div>

        {/* Notifications Alert Banner */}
        <div className="bg-white border-2 border-gazie-navy rounded-2xl p-4 shadow-sm space-y-2">
          <button
            onClick={() => {
              setShowNotifications(!showNotifications);
              if (!showNotifications) handleMarkNotificationsRead();
            }}
            className="w-full flex justify-between items-center text-xs font-bold text-gazie-navy cursor-pointer"
          >
            <span className="flex items-center gap-1.5 uppercase tracking-wider text-gazie-navy/70">
              <Bell className="w-4 h-4 text-gazie-navy" /> Commute Alerts
            </span>
            <span className="flex items-center gap-1">
              {notifications.filter(n => !n.read).length > 0 && (
                <span className="bg-gazie-green text-white text-[9px] px-1.5 py-0.2 rounded-full animate-bounce">
                  {notifications.filter(n => !n.read).length} new
                </span>
              )}
              <span className="text-[10px] text-gazie-navy/50 underline">
                {showNotifications ? 'Hide' : 'View'}
              </span>
            </span>
          </button>

          {showNotifications && (
            <div className="pt-2 divide-y divide-dashed divide-gazie-navy/10 max-h-48 overflow-y-auto text-[11px] leading-relaxed">
              {notifications.length === 0 ? (
                <p className="text-center text-[10px] text-gazie-navy/50 py-4">No notifications yet.</p>
              ) : (
                notifications.map((n) => (
                  <div key={n.id} className="py-2 space-y-0.5 text-left">
                    <div className="flex justify-between items-center font-bold">
                      <span className="text-gazie-navy">{n.title}</span>
                      <span className="font-mono text-[8px] text-gazie-navy/40">
                        {new Date(n.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-gazie-navy/70">{n.message}</p>
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        {/* Action feedback message */}
        {message && (
          <div className={`p-3 rounded-lg text-xs font-semibold ${
            message.isError ? 'bg-red-50 text-red-700 border border-red-200' : 'bg-green-50 text-gazie-green border border-gazie-green/20'
          }`}>
            {message.text}
          </div>
        )}

        {/* Tab 1: Browse available ride postings */}
        {activeTab === 'browse' && (
          <>
            {/* Filter Search Card */}
            <section className="bg-white border-2 border-gazie-navy rounded-2xl p-5 shadow-sm space-y-4">
              <div className="border-b border-dashed border-gazie-navy/10 pb-3 flex items-center gap-2">
                <Search className="w-5 h-5 text-gazie-navy/70" />
                <h2 className="font-display font-extrabold text-lg tracking-tight">Find Commutes</h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5 sm:col-span-2">
                  <div className="flex justify-between items-center">
                    <label className="text-xs font-bold uppercase tracking-wider text-gazie-navy/70 block">Route Destination</label>
                    <span className="text-[9px] text-gazie-navy/50 font-semibold">Filter by town destination</span>
                  </div>
                  <div className="relative flex items-center">
                    <MapPin className="absolute left-3 w-4 h-4 text-gazie-navy/40 pointer-events-none" />
                    <select
                      value={searchDest}
                      onChange={(e) => setSearchDest(e.target.value)}
                      className="w-full pl-9 pr-8 py-2 bg-gazie-paper/20 border border-gazie-navy rounded-xl text-xs focus:outline-none focus:border-gazie-yellow font-semibold cursor-pointer appearance-none"
                    >
                      <option value="all">🌟 All Destinations (Abuja & Environs)</option>
                      {STANDARD_ABUJA_DESTINATIONS.map((dest) => (
                        <option key={dest} value={dest}>{dest}</option>
                      ))}
                    </select>
                    <div className="absolute right-3 pointer-events-none border-l border-gazie-navy/20 pl-2">
                      <ArrowRight className="w-3.5 h-3.5 text-gazie-navy/50 rotate-90" />
                    </div>
                  </div>

                  {/* Quick Filter Chips */}
                  <div className="flex flex-wrap gap-1 pt-1">
                    {['all', 'Berger', 'Federal Secretariat', 'Wuse II', 'Area 10', 'Banex Plaza', 'Gudu', 'Dunamis'].map((chip) => (
                      <button
                        type="button"
                        key={chip}
                        onClick={() => setSearchDest(chip)}
                        className={`text-[9px] px-2.5 py-0.5 rounded-full border transition cursor-pointer ${
                          searchDest === chip
                            ? 'bg-gazie-navy text-white border-gazie-navy font-bold shadow-sm'
                            : 'bg-white text-gazie-navy/70 border-gazie-navy/20 hover:border-gazie-navy hover:text-gazie-navy'
                        }`}
                      >
                        {chip === 'all' ? 'All' : chip}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold uppercase tracking-wider text-gazie-navy/70 block">Commute Date</label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gazie-navy/40" />
                    <input
                      type="date"
                      value={searchDate}
                      onChange={(e) => setSearchDate(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 bg-gazie-paper/20 border border-gazie-navy rounded-xl text-xs font-mono focus:outline-none focus:border-gazie-yellow font-semibold"
                    />
                  </div>
                </div>
              </div>
            </section>

            {/* Postings Listings Grid */}
            <section className="space-y-3">
              <h2 className="font-display font-extrabold text-lg tracking-tight">Available Commutes</h2>
              {filteredPostings.length === 0 ? (
                <div className="bg-white border border-dashed border-gazie-navy/20 rounded-2xl p-8 text-center space-y-4">
                  <p className="text-xs text-gazie-navy/60 font-semibold">No driver has posted a matching commute for this date yet.</p>
                  <div className="border-t border-dashed border-gazie-navy/10 pt-4 max-w-xs mx-auto">
                    <span className="text-[10px] text-gazie-navy/40 uppercase font-bold tracking-wider">Alternative option</span>
                    <p className="text-[10px] text-gazie-navy/50 mt-1">Submit your custom route and departure details below. Platform admins will try to match you with a driver manually!</p>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredPostings.map((posting) => {
                    const driver = allDrivers.find(d => d.id === posting.driver_id);
                    return (
                      <Ticket
                        key={posting.id}
                        id={posting.id}
                        pickup={posting.pickup}
                        destination={posting.destination}
                        date={posting.departure_date}
                        time={posting.departure_time}
                        status={posting.status}
                        fare={posting.fare_per_seat}
                        role="rider"
                        driverName={driver?.full_name || 'Verified Driver'}
                        driverPhone={`🚘 ${driver?.vehicle_make || ''} ${driver?.vehicle_model || ''}`}
                        vehicleInfo={`${posting.seats_available} of ${posting.seats_total} seats left`}
                        onSelect={() => handleRequestRidePosting(posting)}
                        selectLabel={process.env.NEXT_PUBLIC_PLATFORM_FEE_ENABLED === 'true' ? "Unlock Match (₦50)" : "Request Commute"}
                        showMapPreview={true}
                      />
                    );
                  })}
                </div>
              )}
            </section>

            {/* Custom Fallback booking scheduler */}
            {filteredPostings.length === 0 && (
              <section className="bg-white border-2 border-gazie-navy rounded-2xl p-5 shadow-sm space-y-4">
                <div className="border-b border-dashed border-gazie-navy/10 pb-3 flex justify-between items-center">
                  <h2 className="font-display font-extrabold text-lg tracking-tight">Schedule Route Request</h2>
                  <span className="font-mono text-[10px] bg-gazie-yellow text-gazie-navy px-2 py-0.5 rounded font-bold uppercase">
                    Admin Match
                  </span>
                </div>

                <form onSubmit={handleCreateBooking} className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold uppercase tracking-wider text-gazie-navy/70 block">Pickup Location</label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gazie-navy/40" />
                      <input
                        type="text"
                        placeholder="e.g. Lugbe Federal Housing Gate"
                        value={pickup}
                        onChange={(e) => setPickup(e.target.value)}
                        className="w-full pl-9 pr-3 py-2 bg-gazie-paper/20 border border-gazie-navy rounded-xl text-xs focus:outline-none focus:border-gazie-yellow font-semibold"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex justify-between items-center">
                      <label className="text-xs font-bold uppercase tracking-wider text-gazie-navy/70 block">Destination (Drop-off)</label>
                      <span className="text-[9px] text-gazie-navy/50 font-semibold">Select or type custom hub</span>
                    </div>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gazie-navy/40" />
                      <input
                        type="text"
                        list="rider-destinations-datalist"
                        placeholder="e.g. Berger, Secretariat, Wuse II, Area 10, Banex..."
                        value={destination}
                        onChange={(e) => setDestination(e.target.value)}
                        className="w-full pl-9 pr-3 py-2 bg-gazie-paper/20 border border-gazie-navy rounded-xl text-xs focus:outline-none focus:border-gazie-yellow font-semibold"
                        required
                      />
                      <datalist id="rider-destinations-datalist">
                        {STANDARD_ABUJA_DESTINATIONS.map((dest) => (
                          <option key={dest} value={dest} />
                        ))}
                      </datalist>
                    </div>

                    {/* Quick Select Destination Chips */}
                    <div className="flex flex-wrap gap-1 pt-1">
                      {['Berger', 'Federal Secretariat', 'Wuse II', 'Area 10', 'Banex Plaza', 'Gudu', 'Dunamis', 'Airport Road'].map((hub) => (
                        <button
                          type="button"
                          key={hub}
                          onClick={() => setDestination(hub)}
                          className={`text-[9px] px-2 py-0.5 rounded-full border transition cursor-pointer ${
                            destination === hub
                              ? 'bg-gazie-navy text-white border-gazie-navy font-bold'
                              : 'bg-white text-gazie-navy/70 border-gazie-navy/20 hover:border-gazie-navy hover:text-gazie-navy'
                          }`}
                        >
                          {hub}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold uppercase tracking-wider text-gazie-navy/70 block">Departure Date</label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gazie-navy/40" />
                      <input
                        type="date"
                        value={requestedDate}
                        onChange={(e) => setRequestedDate(e.target.value)}
                        className="w-full pl-9 pr-3 py-2 bg-gazie-paper/20 border border-gazie-navy rounded-xl text-xs font-mono focus:outline-none focus:border-gazie-yellow font-semibold"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold uppercase tracking-wider text-gazie-navy/70 block">Preferred Departure Time</label>
                    <div className="relative">
                      <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gazie-navy/40" />
                      <input
                        type="time"
                        value={requestedTime}
                        onChange={(e) => setRequestedTime(e.target.value)}
                        className="w-full pl-9 pr-3 py-2 bg-gazie-paper/20 border border-gazie-navy rounded-xl text-xs font-mono focus:outline-none focus:border-gazie-yellow"
                        required
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={bookingSubmitLoading}
                    className="w-full bg-gazie-navy text-gazie-paper font-bold py-2.5 rounded-xl border border-gazie-navy hover:bg-gazie-yellow hover:text-gazie-navy transition-all duration-200 text-xs shadow-sm cursor-pointer disabled:opacity-50"
                  >
                    {bookingSubmitLoading ? 'Submitting request...' : 'Book Ride Commute'}
                  </button>
                </form>
              </section>
            )}
          </>
        )}

        {/* Tab 2: My Transit Passes & profile detail settings */}
        {activeTab === 'passes' && (
          <>
            {/* 2. My Ride Tickets Section */}
            <section className="space-y-3">
              <h2 className="font-display font-extrabold text-lg tracking-tight">My Transit Passes</h2>
              {bookings.length === 0 ? (
                <div className="bg-white border border-dashed border-gazie-navy/20 rounded-2xl p-8 text-center">
                  <p className="text-xs text-gazie-navy/60 font-semibold">You have no scheduled ride passes yet.</p>
                  <p className="text-[10px] text-gazie-navy/40 mt-1">Book your first ride using the form above.</p>
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
                      role="rider"
                      driverName={booking.driverName}
                      driverPhone={isVerified ? booking.driverPhone : 'Unverified (Contact Hidden)'}
                      vehicleInfo={booking.vehicleInfo}
                      onCancel={
                        (booking.status === 'pending' || booking.status === 'matched' || booking.status === 'requested' || booking.status === 'payment_failed')
                          ? () => handleCancelBooking(booking.id)
                          : undefined
                      }
                      onSelect={
                        (booking.status === 'requested' || booking.status === 'payment_failed')
                          ? () => {
                              const posting = allPostings.find(p => p.id === booking.ride_posting_id) || { id: booking.ride_posting_id, pickup: booking.pickup, destination: booking.destination, departure_date: booking.requested_date, departure_time: booking.requested_time, fare_per_seat: booking.driver_fare };
                              if (isMock) {
                                triggerMockCheckout(booking.id, posting.id);
                              } else {
                                triggerPaystackCheckout(booking.id, posting, profile?.phone + "@gazie.com");
                              }
                            }
                          : undefined
                      }
                      selectLabel={booking.status === 'payment_failed' ? "Retry Unlock (₦50)" : "Unlock Pass (₦50)"}
                    />
                  ))}
                </div>
              )}
            </section>

            {/* 3. Emergency Contact Section */}
            <section className="bg-white border-2 border-gazie-navy rounded-2xl p-5 shadow-sm space-y-4">
              <div className="border-b border-dashed border-gazie-navy/10 pb-2">
                <h2 className="font-display font-bold text-sm uppercase tracking-wider text-gazie-navy/80">Emergency Contact</h2>
              </div>
              <form onSubmit={handleUpdateEmergency} className="space-y-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-gazie-navy/60 block">
                    Relative or Friend's Phone Number
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gazie-navy/40" />
                    <input
                      type="tel"
                      placeholder="e.g. 08033332222"
                      value={emergencyContact}
                      onChange={(e) => setEmergencyContact(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 bg-gazie-paper/20 border border-gazie-navy rounded-xl text-xs font-mono focus:outline-none focus:border-gazie-yellow"
                      required
                    />
                  </div>
                </div>
                <button
                  type="submit"
                  disabled={emergencyUpdateLoading}
                  className="w-full bg-white text-gazie-navy font-bold py-2 rounded-xl border border-gazie-navy hover:bg-gazie-navy hover:text-gazie-paper transition-all duration-200 text-xs cursor-pointer disabled:opacity-50"
                >
                  {emergencyUpdateLoading ? 'Saving...' : 'Update Emergency Number'}
                </button>
              </form>
            </section>
          </>
        )}

        {/* 4. Safety Report Shortcut */}
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex justify-between items-center text-xs">
          <div>
            <span className="font-bold text-red-800 block">Felt Unsafe or Encountered an Issue?</span>
            <span className="text-[10px] text-red-700 block mt-0.5">Submit an incident report immediately to the Gazie admins.</span>
          </div>
          <button
            onClick={() => router.push('/safety')}
            className="bg-red-700 text-white font-bold py-1.5 px-3 rounded-lg hover:bg-red-800 transition text-[10px] cursor-pointer"
          >
            File Report
          </button>
        </div>

      </main>

      {/* Paystack Inline Script */}
      <Script src="https://js.paystack.co/v1/inline.js" strategy="lazyOnload" />

      {/* Glassmorphic spinner while waiting for webhook updates */}
      {paymentProcessing && (
        <div className="fixed inset-0 bg-gazie-navy/40 backdrop-blur-sm z-[9999] flex items-center justify-center">
          <div className="bg-white border-2 border-gazie-navy p-6 rounded-2xl shadow-xl max-w-xs text-center space-y-4 animate-fadeIn">
            <div className="w-10 h-10 border-4 border-gazie-yellow border-t-gazie-navy rounded-full animate-spin mx-auto" />
            <div className="space-y-1">
              <span className="font-display font-extrabold text-sm uppercase tracking-wider text-gazie-navy">Verifying Payment</span>
              <p className="text-[10px] text-gazie-navy/70">Please wait while we confirm your transaction reference with Paystack...</p>
            </div>
          </div>
        </div>
      )}
      {/* Verification overlay modal */}
      <VerificationModal
        isOpen={isVerificationModalOpen}
        onClose={() => setIsVerificationModalOpen(false)}
        profile={profile}
        onSuccess={(updatedProfile) => {
          setProfile(updatedProfile);
        }}
      />
    </div>
  );
}
