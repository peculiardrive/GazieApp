"use client";

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import Navbar from '@/components/ui/Navbar';
import Toast, { useToast } from '@/components/ui/Toast';
import { Users, Car, HeartHandshake, ShieldCheck, ShieldAlert, FileText, Check, X, Link as LinkIcon, ExternalLink, Calendar, Clock, Bookmark, ArrowRight, TrendingUp, MapPin, BarChart3, Activity, Pencil, Save } from 'lucide-react';

export default function AdminDashboard() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [profiles, setProfiles] = useState<any[]>([]);
  const [bookings, setBookings] = useState<any[]>([]);
  const [incidents, setIncidents] = useState<any[]>([]);

  // Toast notifications
  const { toasts, showToast, dismissToast } = useToast();

  // Postings state
  const [postings, setPostings] = useState<any[]>([]);

  // Modal file view state
  const [previewFileUrl, setPreviewFileUrl] = useState<string | null>(null);

  // Tab control
  const [activeTab, setActiveTab] = useState<'queues' | 'analytics' | 'users'>('queues');

  // User management edit state
  const [editingUser, setEditingUser] = useState<any | null>(null);
  const [editName, setEditName] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editRole, setEditRole] = useState('');
  const [editStatus, setEditStatus] = useState('');
  const [editSaving, setEditSaving] = useState(false);
  const [userSearchQuery, setUserSearchQuery] = useState('');
  const [userRoleFilter, setUserRoleFilter] = useState<'all' | 'rider' | 'driver' | 'admin'>('all');

  // Date range filter state
  const [dateFilter, setDateFilter] = useState<'today' | 'week' | 'all'>('all');

  const fetchAdminData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/login');
        return;
      }

      // Check if user is actually admin
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

      if (!profile || profile.role !== 'admin') {
        router.push('/dashboard');
        return;
      }

      // Fetch all data
      const { data: allProfiles } = await supabase.from('profiles').select('*');
      const { data: allBookings } = await supabase.from('bookings').select('*');
      const { data: allIncidents } = await supabase.from('incidents').select('*');
      const { data: allPostings } = await supabase.from('ride_postings').select('*');

      setProfiles(allProfiles || []);
      setBookings(allBookings || []);
      setIncidents(allIncidents || []);
      setPostings(allPostings || []);
    } catch (err) {
      console.error('Error loading admin dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, [router]);

  // Document approval
  const handleUpdateVerification = async (profileId: string, status: 'verified' | 'rejected', reason?: string) => {
    try {
      const updateData: any = { verification_status: status };
      if (status === 'rejected') {
        updateData.rejection_reason = reason || 'Documents did not meet criteria.';
      } else {
        updateData.rejection_reason = null;
      }

      const { error } = await supabase
        .from('profiles')
        .update(updateData)
        .eq('id', profileId);

      if (error) {
        showToast('Verification update failed: ' + error.message, 'error');
      } else {
        fetchAdminData();
      }
    } catch (err: any) {
      showToast(err.message || 'Error occurred during verification', 'error');
    }
  };

  // Match pairing is now automated directly in client matching transactions

  const openEditUser = (user: any) => {
    setEditingUser(user);
    setEditName(user.full_name || '');
    setEditPhone(user.phone || '');
    setEditRole(user.role || 'rider');
    setEditStatus(user.verification_status || 'email_verified');
  };

  const handleSaveUser = async () => {
    if (!editingUser) return;
    setEditSaving(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: editName.trim(),
          phone: editPhone.trim(),
          role: editRole,
          verification_status: editStatus,
        })
        .eq('id', editingUser.id);

      if (error) {
        showToast('Failed to save: ' + error.message, 'error');
      } else {
        setEditingUser(null);
        fetchAdminData();
      }
    } catch (err: any) {
      showToast(err.message || 'Save failed', 'error');
    } finally {
      setEditSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen bg-gazie-paper items-center justify-center text-gazie-navy">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-4 border-gazie-yellow border-t-gazie-navy rounded-full animate-spin mx-auto" />
          <p className="font-display font-bold text-sm">Loading Admin Console...</p>
        </div>
      </div>
    );
  }

  // Compute Stats
  const totalRiders = profiles.filter(p => p.role === 'rider').length;
  const totalDrivers = profiles.filter(p => p.role === 'driver').length;
  const todayStr = new Date().toISOString().split('T')[0];
  const matchesToday = bookings.filter(
    b => (b.status === 'confirmed' || b.status === 'matched' || b.status === 'completed') && b.requested_date === todayStr
  ).length;

  // Filter verification queue
  const pendingProfiles = profiles.filter(p => p.verification_status === 'pending_review');

  // Date Helpers for Analytics
  const now = new Date();
  const todayLocalStr = now.toLocaleDateString('en-CA'); // YYYY-MM-DD local format
  
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  const sevenDaysAgoStr = sevenDaysAgo.toLocaleDateString('en-CA');

  // Date filter predicates
  const filterByDate = (dateStr: string) => {
    if (dateFilter === 'today') return dateStr === todayLocalStr;
    if (dateFilter === 'week') return dateStr >= sevenDaysAgoStr && dateStr <= todayLocalStr;
    return true; // 'all'
  };

  const filterProfileByDate = (createdAtStr: string) => {
    const d = new Date(createdAtStr);
    if (dateFilter === 'today') return d.toLocaleDateString('en-CA') === todayLocalStr;
    if (dateFilter === 'week') return d >= sevenDaysAgo;
    return true; // 'all'
  };

  // --- TRIP ACTIVITY CALCULATIONS ---
  // Completed trips (all time, this week, today)
  const completedAllTime = bookings.filter(b => b.status === 'completed').length;
  const completedThisWeek = bookings.filter(b => b.status === 'completed' && b.requested_date >= sevenDaysAgoStr && b.requested_date <= todayLocalStr).length;
  const completedToday = bookings.filter(b => b.status === 'completed' && b.requested_date === todayLocalStr).length;

  // Confirmed & upcoming
  const confirmedUpcoming = bookings.filter(b => b.status === 'confirmed' && b.requested_date >= todayLocalStr).length;

  // Filtering for active selection (cancellations and no-shows)
  const filteredBookings = bookings.filter(b => filterByDate(b.requested_date));
  const totalConfirmedOrEndedFiltered = filteredBookings.filter(b => 
    ['confirmed', 'completed', 'cancelled', 'no_show'].includes(b.status)
  ).length;

  const cancelledCountFiltered = filteredBookings.filter(b => b.status === 'cancelled').length;
  const cancellationRateFiltered = totalConfirmedOrEndedFiltered > 0 
    ? (cancelledCountFiltered / totalConfirmedOrEndedFiltered) * 100 
    : 0;

  const noShowCountFiltered = filteredBookings.filter(b => b.status === 'no_show').length;
  const noShowRateFiltered = totalConfirmedOrEndedFiltered > 0 
    ? (noShowCountFiltered / totalConfirmedOrEndedFiltered) * 100 
    : 0;

  // --- USER GROWTH CALCULATIONS ---
  const ridersAllTime = profiles.filter(p => p.role === 'rider').length;
  const ridersThisWeek = profiles.filter(p => p.role === 'rider' && new Date(p.created_at) >= sevenDaysAgo).length;

  const driversAllTime = profiles.filter(p => p.role === 'driver').length;
  const driversThisWeek = profiles.filter(p => p.role === 'driver' && new Date(p.created_at) >= sevenDaysAgo).length;

  // Filtered profiles for ratio & verification rates
  const activeProfilesFiltered = profiles.filter(p => p.role !== 'admin' && filterProfileByDate(p.created_at));
  const totalProfilesFiltered = activeProfilesFiltered.length;
  
  const verifiedCountFiltered = activeProfilesFiltered.filter(p => p.verification_status === 'verified').length;
  const pendingCountFiltered = activeProfilesFiltered.filter(p => p.verification_status === 'pending').length;
  const rejectedCountFiltered = activeProfilesFiltered.filter(p => p.verification_status === 'rejected').length;

  const approvalRateFiltered = totalProfilesFiltered > 0 ? (verifiedCountFiltered / totalProfilesFiltered) * 100 : 0;
  const pendingRateFiltered = totalProfilesFiltered > 0 ? (pendingCountFiltered / totalProfilesFiltered) * 100 : 0;
  const rejectedRateFiltered = totalProfilesFiltered > 0 ? (rejectedCountFiltered / totalProfilesFiltered) * 100 : 0;

  // Rider vs Driver Ratio (filtered)
  const ridersFilteredCount = activeProfilesFiltered.filter(p => p.role === 'rider').length;
  const driversFilteredCount = activeProfilesFiltered.filter(p => p.role === 'driver').length;
  const totalRidersAndDriversFiltered = ridersFilteredCount + driversFilteredCount;

  const ridersPercentFiltered = totalRidersAndDriversFiltered > 0 
    ? (ridersFilteredCount / totalRidersAndDriversFiltered) * 100 
    : 0;
  const driversPercentFiltered = totalRidersAndDriversFiltered > 0 
    ? (driversFilteredCount / totalRidersAndDriversFiltered) * 100 
    : 0;
  const riderDriverRatioFiltered = driversFilteredCount > 0 
    ? (ridersFilteredCount / driversFilteredCount).toFixed(1) 
    : (ridersFilteredCount > 0 ? '∞' : '0.0');

  // --- ROUTE INSIGHTS ---
  const routeStatsMap: Record<string, { pickup: string; destination: string; volume: number; activePostings: number }> = {};
  
  // Accumulate volume from filtered bookings
  filteredBookings.forEach(b => {
    const key = `${b.pickup} → ${b.destination}`;
    if (!routeStatsMap[key]) {
      routeStatsMap[key] = { pickup: b.pickup, destination: b.destination, volume: 0, activePostings: 0 };
    }
    routeStatsMap[key].volume += 1;
  });

  // Accumulate active postings count
  postings.forEach(p => {
    if (p.status === 'active' && p.departure_date >= todayLocalStr) {
      const key = `${p.pickup} → ${p.destination}`;
      if (!routeStatsMap[key]) {
        routeStatsMap[key] = { pickup: p.pickup, destination: p.destination, volume: 0, activePostings: 0 };
      }
      routeStatsMap[key].activePostings += 1;
    }
  });

  const routeInsights = Object.values(routeStatsMap).sort((a, b) => b.volume - a.volume || b.activePostings - a.activePostings);
  const maxRouteVolume = Math.max(...routeInsights.map(r => r.volume), 1);

  // --- TIMING PATTERNS ---
  const hourBucketsFiltered: Record<number, number> = {};
  filteredBookings.forEach(b => {
    if (!b.requested_time) return;
    const hour = parseInt(b.requested_time.split(':')[0], 10);
    if (!isNaN(hour)) {
      hourBucketsFiltered[hour] = (hourBucketsFiltered[hour] || 0) + 1;
    }
  });

  const timingPatterns = Object.entries(hourBucketsFiltered)
    .map(([hourStr, count]) => ({
      hour: parseInt(hourStr, 10),
      count
    }))
    .sort((a, b) => b.count - a.count);

  const maxTimingCount = Math.max(...timingPatterns.map(t => t.count), 1);

  const formatHourBucket = (hour: number) => {
    const nextHour = (hour + 1) % 24;
    const formatPeriod = (h: number) => {
      if (h === 0) return '12 AM';
      if (h === 12) return '12 PM';
      return h < 12 ? `${h} AM` : `${h - 12} PM`;
    };
    return `${formatPeriod(hour)} - ${formatPeriod(nextHour)}`;
  };

  return (
    <div className="flex flex-col min-h-screen bg-gazie-paper text-gazie-navy">
      <Navbar />

      {/* Toast notifications */}
      <Toast toasts={toasts} onDismiss={dismissToast} />

      <main className="flex-1 max-w-4xl mx-auto w-full px-4 py-6 space-y-6">

        {/* Tab switcher navigation bar */}
        <div className="flex border-b-2 border-gazie-navy/15 gap-4 overflow-x-auto">
          <button
            onClick={() => setActiveTab('queues')}
            className={`pb-2 px-1 font-display font-extrabold text-sm border-b-3 -mb-[2px] transition cursor-pointer flex items-center gap-1.5 shrink-0 ${
              activeTab === 'queues'
                ? 'border-gazie-navy text-gazie-navy'
                : 'border-transparent text-gazie-navy/40 hover:text-gazie-navy/70'
            }`}
          >
            <Activity className="w-4 h-4" /> Overview & Queues
          </button>
          <button
            onClick={() => setActiveTab('analytics')}
            className={`pb-2 px-1 font-display font-extrabold text-sm border-b-3 -mb-[2px] transition cursor-pointer flex items-center gap-1.5 shrink-0 ${
              activeTab === 'analytics'
                ? 'border-gazie-navy text-gazie-navy'
                : 'border-transparent text-gazie-navy/40 hover:text-gazie-navy/70'
            }`}
          >
            <BarChart3 className="w-4 h-4" /> Analytics Insights
          </button>
          <button
            onClick={() => setActiveTab('users')}
            className={`pb-2 px-1 font-display font-extrabold text-sm border-b-3 -mb-[2px] transition cursor-pointer flex items-center gap-1.5 shrink-0 ${
              activeTab === 'users'
                ? 'border-gazie-navy text-gazie-navy'
                : 'border-transparent text-gazie-navy/40 hover:text-gazie-navy/70'
            }`}
          >
            <Users className="w-4 h-4" /> User Management
          </button>
        </div>

        {/* ACTIVE TAB: QUEUES (Existing Dashboard Views) */}
        {activeTab === 'queues' && (
          <div className="space-y-6 animate-fadeIn">
            {/* 1. Quick Stats Grid */}
            <section className="grid grid-cols-3 gap-3">
              <div className="bg-white border-2 border-gazie-navy rounded-xl p-3 flex flex-col items-center text-center shadow-sm">
                <Users className="w-5 h-5 text-gazie-navy opacity-70 mb-1" />
                <span className="font-mono text-lg font-extrabold">{totalRiders}</span>
                <span className="text-[9px] font-bold text-gazie-navy/60 uppercase">Total Riders</span>
              </div>
              <div className="bg-white border-2 border-gazie-navy rounded-xl p-3 flex flex-col items-center text-center shadow-sm">
                <Car className="w-5 h-5 text-gazie-navy opacity-70 mb-1" />
                <span className="font-mono text-lg font-extrabold">{totalDrivers}</span>
                <span className="text-[9px] font-bold text-gazie-navy/60 uppercase">Total Drivers</span>
              </div>
              <div className="bg-white border-2 border-gazie-navy rounded-xl p-3 flex flex-col items-center text-center shadow-sm">
                <HeartHandshake className="w-5 h-5 text-gazie-navy opacity-70 mb-1" />
                <span className="font-mono text-lg font-extrabold">{matchesToday}</span>
                <span className="text-[9px] font-bold text-gazie-navy/60 uppercase">Matches Today</span>
              </div>
            </section>

            {/* 2. User Verification Queue */}
            <section className="bg-white border-2 border-gazie-navy rounded-2xl p-5 shadow-sm space-y-4">
              <div className="border-b border-dashed border-gazie-navy/10 pb-2">
                <h2 className="font-display font-extrabold text-lg tracking-tight">Verification Submission Queue ({pendingProfiles.length})</h2>
              </div>

              {pendingProfiles.length === 0 ? (
                <p className="text-xs text-gazie-navy/60 italic text-center py-4">No profiles pending verification at this time.</p>
              ) : (
                <div className="space-y-4 divide-y divide-gray-100">
                  {pendingProfiles.map((p, idx) => (
                    <div key={p.id} className={`pt-3 ${idx === 0 ? '' : 'border-t'}`}>
                      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-sm">{p.full_name}</span>
                            <span className="font-mono text-[9px] bg-gazie-yellow text-gazie-navy px-1.5 py-0.2 rounded font-bold uppercase">{p.role}</span>
                          </div>
                          <p className="text-xs text-gazie-navy/60 font-mono mt-0.5">{p.phone}</p>
                          
                          {p.role === 'driver' && (
                            <div className="mt-2 text-[10px] space-y-1 bg-gazie-paper/30 p-2 rounded border border-gazie-navy/10 font-medium">
                              <p>🚗 Vehicle: <span className="font-bold">{p.vehicle_make} {p.vehicle_model} ({p.vehicle_color || 'No Color'}, {p.vehicle_plate})</span></p>
                              <p>📍 Route: <span className="font-bold">{p.usual_route}</span></p>
                              <p>💵 Fare: <span className="font-mono font-bold">₦{p.driver_fare}</span></p>
                            </div>
                          )}
                        </div>

                        <div className="flex flex-wrap gap-2 items-center">
                          {/* Document Viewer Buttons */}
                          {p.id_url && (
                            <button
                              onClick={() => setPreviewFileUrl(p.id_url)}
                              className="bg-white border border-gazie-navy text-gazie-navy text-[10px] font-bold py-1 px-2.5 rounded-lg flex items-center gap-1.5 hover:bg-gazie-navy hover:text-white transition cursor-pointer"
                            >
                              <FileText className="w-3 h-3" /> View NIN
                            </button>
                          )}
                          {p.proof_of_address_url && (
                            <button
                              onClick={() => setPreviewFileUrl(p.proof_of_address_url)}
                              className="bg-white border border-gazie-navy text-gazie-navy text-[10px] font-bold py-1 px-2.5 rounded-lg flex items-center gap-1.5 hover:bg-gazie-navy hover:text-white transition cursor-pointer"
                            >
                              <FileText className="w-3 h-3" /> View Address Proof
                            </button>
                          )}
                          {p.role === 'driver' && p.license_url && (
                            <button
                              onClick={() => setPreviewFileUrl(p.license_url)}
                              className="bg-white border border-gazie-navy text-gazie-navy text-[10px] font-bold py-1 px-2.5 rounded-lg flex items-center gap-1.5 hover:bg-gazie-navy hover:text-white transition cursor-pointer"
                            >
                              <FileText className="w-3 h-3" /> License
                            </button>
                          )}
                          {p.role === 'driver' && p.insurance_url && (
                            <button
                              onClick={() => setPreviewFileUrl(p.insurance_url)}
                              className="bg-white border border-gazie-navy text-gazie-navy text-[10px] font-bold py-1 px-2.5 rounded-lg flex items-center gap-1.5 hover:bg-gazie-navy hover:text-white transition cursor-pointer"
                            >
                              <FileText className="w-3 h-3" /> Insurance
                            </button>
                          )}

                          {/* Approval buttons */}
                          <div className="flex gap-1.5 ml-2 border-l border-gray-150 pl-3">
                            <button
                              onClick={() => handleUpdateVerification(p.id, 'verified')}
                              className="bg-[#2D6A4F] text-white p-1 rounded-lg hover:bg-emerald-950 transition cursor-pointer"
                              title="Approve Profile"
                            >
                              <Check className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => {
                                const reason = prompt('Please enter the reason for rejection:', 'Uploaded ID or utility bill is blurred/illegible.');
                                if (reason !== null) {
                                  handleUpdateVerification(p.id, 'rejected', reason);
                                }
                              }}
                              className="bg-red-700 text-white p-1 rounded-lg hover:bg-red-900 transition cursor-pointer"
                              title="Reject Profile"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>

            {/* 3. Automated Ride Matching Monitor Feed */}
            <section className="bg-white border-2 border-gazie-navy rounded-2xl p-5 shadow-sm space-y-4">
              <div className="border-b border-dashed border-gazie-navy/10 pb-3 flex justify-between items-center">
                <div>
                  <h2 className="font-display font-extrabold text-lg tracking-tight flex items-center gap-2">
                    <HeartHandshake className="w-5 h-5 text-gazie-navy" /> Automated Ride Match Monitor Feed
                  </h2>
                  <p className="text-xs text-gazie-navy/60 mt-0.5">
                    Real-time activity log of automatically matched and requested commutes.
                  </p>
                </div>
                <span className="font-mono text-[10px] bg-gazie-navy text-gazie-paper px-2 py-0.5 rounded font-bold uppercase tracking-wider">
                  Live Feed
                </span>
              </div>

              {bookings.length === 0 ? (
                <p className="text-xs text-gazie-navy/40 italic py-8 text-center bg-gazie-paper/10 rounded-xl border border-dashed border-gazie-navy/10">
                  No matches or bookings have occurred yet.
                </p>
              ) : (
                <div className="space-y-3 overflow-y-auto max-h-[500px] pr-1">
                  {[...bookings]
                    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
                    .map((b) => {
                      const rider = profiles.find(p => p.id === b.rider_id);
                      const driver = profiles.find(p => p.id === b.driver_id);
                      
                      const getStatusBadge = (status: string) => {
                        switch (status) {
                          case 'confirmed':
                          case 'matched':
                            return 'bg-gazie-green/10 text-gazie-green border border-gazie-green/20';
                          case 'completed':
                            return 'bg-gazie-navy/10 text-gazie-navy border border-gazie-navy/20';
                          case 'cancelled':
                            return 'bg-red-50 text-red-700 border border-red-200';
                          case 'no_show':
                            return 'bg-orange-50 text-orange-700 border border-orange-200';
                          case 'requested':
                          case 'pending':
                          default:
                            return 'bg-gazie-yellow/20 text-gazie-navy border border-gazie-yellow';
                        }
                      };

                      return (
                        <div key={b.id} className="border border-gazie-navy/10 rounded-xl p-3 bg-gazie-paper/5 flex flex-col sm:flex-row justify-between sm:items-center gap-3 text-xs text-left">
                          <div className="space-y-1">
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="font-bold text-gazie-navy">{b.pickup} → {b.destination}</span>
                              <span className={`text-[9px] px-2 py-0.5 rounded font-bold uppercase tracking-wider ${getStatusBadge(b.status)}`}>
                                {b.status}
                              </span>
                            </div>
                            
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 text-[11px] text-gazie-navy/70 leading-normal">
                              <p>👤 **Rider**: {rider?.full_name || 'Passenger'} ({rider?.phone || 'No phone'})</p>
                              <p>🚘 **Driver**: {driver?.full_name || 'No driver paired'} ({driver?.phone || 'No phone'})</p>
                              <p className="sm:col-span-2 text-[10px] opacity-75 mt-0.5">
                                📅 Date: <span className="font-semibold">{b.requested_date}</span> | Time: <span className="font-semibold">{b.requested_time}</span>
                                {b.driver_fare > 0 && ` | Fare: ₦${b.driver_fare}`}
                              </p>
                            </div>
                          </div>

                          <div className="text-right shrink-0 border-t sm:border-t-0 pt-2 sm:pt-0 border-dashed border-gazie-navy/10">
                            <span className="font-mono text-[9px] text-gazie-navy/40 block">
                              Logged: {new Date(b.created_at).toLocaleString()}
                            </span>
                            <span className="font-mono text-[9px] bg-gazie-navy/10 px-1.5 py-0.5 rounded text-gazie-navy block mt-1 w-max ml-auto">
                              ID: {b.id.substring(0, 8)}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                </div>
              )}
            </section>

            {/* 4. Safety Incidents Queue */}
            <section className="bg-white border-2 border-gazie-navy rounded-2xl p-5 shadow-sm space-y-4">
              <div className="border-b border-dashed border-gazie-navy/10 pb-2">
                <h2 className="font-display font-extrabold text-lg tracking-tight">Incident & Safety Reports ({incidents.length})</h2>
              </div>

              {incidents.length === 0 ? (
                <p className="text-xs text-gazie-navy/60 italic text-center py-4">No incident reports filed.</p>
              ) : (
                <div className="space-y-3">
                  {incidents.map((inc) => {
                    const reporter = profiles.find(p => p.id === inc.reporter_id);
                    return (
                      <div key={inc.id} className="p-3 bg-red-50/50 border border-red-200 rounded-xl space-y-2 text-xs">
                        <div className="flex justify-between items-center font-bold">
                          <span className="text-red-900">{reporter?.full_name || 'Reporter'} ({reporter?.phone})</span>
                          <span className="text-[9px] font-mono text-red-700/80">{new Date(inc.created_at).toLocaleString()}</span>
                        </div>
                        <p className="text-gray-700 font-medium">{inc.description}</p>
                        {inc.photo_url && (
                          <button
                            onClick={() => setPreviewFileUrl(inc.photo_url)}
                            className="text-[10px] font-bold text-red-700 underline flex items-center gap-1 hover:text-red-900 cursor-pointer"
                          >
                            <ExternalLink className="w-3 h-3" /> View Incident Image
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </section>
          </div>
        )}

        {/* ACTIVE TAB: USER MANAGEMENT */}
        {activeTab === 'users' && (() => {
          const filteredUsers = profiles
            .filter(p => userRoleFilter === 'all' || p.role === userRoleFilter)
            .filter(p => {
              if (!userSearchQuery) return true;
              const q = userSearchQuery.toLowerCase();
              return (
                (p.full_name || '').toLowerCase().includes(q) ||
                (p.phone || '').toLowerCase().includes(q) ||
                (p.role || '').toLowerCase().includes(q)
              );
            });

          const statusBadge = (status: string) => {
            switch (status) {
              case 'verified': return 'bg-green-100 text-green-800 border-green-200';
              case 'pending_review': return 'bg-blue-100 text-blue-800 border-blue-200';
              case 'email_verified': return 'bg-amber-100 text-amber-800 border-amber-200';
              case 'rejected': return 'bg-red-100 text-red-700 border-red-200';
              default: return 'bg-gray-100 text-gray-600 border-gray-200';
            }
          };

          const roleBadge = (role: string) => {
            if (role === 'driver') return 'bg-gazie-navy text-white';
            if (role === 'admin') return 'bg-gazie-yellow text-gazie-navy';
            return 'bg-gazie-paper text-gazie-navy border border-gazie-navy/20';
          };

          return (
            <div className="space-y-4 animate-fadeIn">
              {/* Header + Filters */}
              <section className="bg-white border-2 border-gazie-navy rounded-2xl p-5 shadow-sm space-y-4">
                <div className="flex justify-between items-center border-b border-dashed border-gazie-navy/10 pb-3">
                  <div>
                    <h2 className="font-display font-extrabold text-lg tracking-tight flex items-center gap-2">
                      <Users className="w-5 h-5" /> User Management
                    </h2>
                    <p className="text-[10px] text-gazie-navy/50 mt-0.5">{filteredUsers.length} of {profiles.length} users shown</p>
                  </div>
                  <span className="font-mono text-xs bg-gazie-navy text-gazie-paper px-2 py-0.5 rounded font-bold">{profiles.length} Total</span>
                </div>

                {/* Search + Role Filter */}
                <div className="flex flex-col sm:flex-row gap-3">
                  <input
                    type="text"
                    placeholder="Search by name or phone..."
                    value={userSearchQuery}
                    onChange={e => setUserSearchQuery(e.target.value)}
                    className="flex-1 px-3 py-2 bg-gazie-paper/20 border border-gazie-navy rounded-xl text-xs font-semibold focus:outline-none focus:border-gazie-yellow"
                  />
                  <div className="flex gap-1 bg-gazie-paper border border-gazie-navy/20 p-0.5 rounded-lg">
                    {(['all', 'rider', 'driver', 'admin'] as const).map(r => (
                      <button
                        key={r}
                        onClick={() => setUserRoleFilter(r)}
                        className={`px-2.5 py-1 text-[9px] font-bold rounded-md uppercase tracking-wider transition cursor-pointer ${
                          userRoleFilter === r
                            ? 'bg-gazie-navy text-white shadow-sm'
                            : 'text-gazie-navy/60 hover:text-gazie-navy'
                        }`}
                      >
                        {r === 'all' ? 'All' : r}
                      </button>
                    ))}
                  </div>
                </div>
              </section>

              {/* User Table */}
              <section className="bg-white border-2 border-gazie-navy rounded-2xl shadow-sm overflow-hidden">
                {filteredUsers.length === 0 ? (
                  <p className="text-xs text-gazie-navy/60 italic text-center py-8">No users match the current filter.</p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs">
                      <thead>
                        <tr className="bg-gazie-navy text-gazie-paper">
                          <th className="text-left px-4 py-2.5 font-bold uppercase tracking-wider text-[10px]">Name</th>
                          <th className="text-left px-4 py-2.5 font-bold uppercase tracking-wider text-[10px]">Phone</th>
                          <th className="text-left px-4 py-2.5 font-bold uppercase tracking-wider text-[10px]">Role</th>
                          <th className="text-left px-4 py-2.5 font-bold uppercase tracking-wider text-[10px]">Status</th>
                          <th className="text-left px-4 py-2.5 font-bold uppercase tracking-wider text-[10px]">Joined</th>
                          <th className="px-4 py-2.5"></th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gazie-navy/5">
                        {filteredUsers.map((user) => (
                          <tr key={user.id} className="hover:bg-gazie-paper/40 transition-colors">
                            <td className="px-4 py-3 font-semibold max-w-[140px]">
                              <span className="truncate block">{user.full_name || '—'}</span>
                            </td>
                            <td className="px-4 py-3 font-mono">{user.phone || '—'}</td>
                            <td className="px-4 py-3">
                              <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase ${roleBadge(user.role)}`}>
                                {user.role}
                              </span>
                            </td>
                            <td className="px-4 py-3">
                              <span className={`px-2 py-0.5 rounded border text-[9px] font-bold uppercase ${statusBadge(user.verification_status)}`}>
                                {(user.verification_status || '').replace('_', ' ')}
                              </span>
                            </td>
                            <td className="px-4 py-3 font-mono text-gazie-navy/50">
                              {user.created_at ? new Date(user.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: '2-digit' }) : '—'}
                            </td>
                            <td className="px-4 py-3">
                              <button
                                onClick={() => openEditUser(user)}
                                className="flex items-center gap-1 text-[10px] font-bold text-gazie-navy bg-gazie-paper border border-gazie-navy/30 px-2.5 py-1 rounded-lg hover:bg-gazie-navy hover:text-white transition cursor-pointer"
                              >
                                <Pencil className="w-3 h-3" /> Edit
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </section>

              {/* Inline Edit Modal */}
              {editingUser && (
                <div className="fixed inset-0 bg-gazie-navy/50 backdrop-blur-sm z-[999] flex items-center justify-center p-4">
                  <div className="bg-white border-2 border-gazie-navy w-full max-w-sm rounded-2xl shadow-xl overflow-hidden animate-fadeIn">
                    {/* Modal header */}
                    <div className="bg-gazie-navy text-gazie-paper p-4 flex justify-between items-center">
                      <span className="font-display font-black text-sm uppercase tracking-wider flex items-center gap-2">
                        <Pencil className="w-4 h-4 text-gazie-yellow" /> Edit User
                      </span>
                      <button
                        type="button"
                        onClick={() => setEditingUser(null)}
                        className="p-1 rounded-lg hover:bg-white/10 transition cursor-pointer"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Modal body */}
                    <div className="p-5 space-y-4">
                      <div className="text-[10px] text-gazie-navy/60 font-mono truncate">ID: {editingUser.id}</div>

                      <div className="space-y-1">
                        <label className="text-[10px] font-bold uppercase tracking-wider text-gazie-navy/70 block">Full Name</label>
                        <input
                          type="text"
                          value={editName}
                          onChange={e => setEditName(e.target.value)}
                          className="w-full px-3 py-2 bg-gazie-paper/20 border border-gazie-navy rounded-xl text-xs font-semibold focus:outline-none focus:border-gazie-yellow"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] font-bold uppercase tracking-wider text-gazie-navy/70 block">Phone Number</label>
                        <input
                          type="text"
                          value={editPhone}
                          onChange={e => setEditPhone(e.target.value)}
                          className="w-full px-3 py-2 bg-gazie-paper/20 border border-gazie-navy rounded-xl text-xs font-mono font-bold focus:outline-none focus:border-gazie-yellow"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold uppercase tracking-wider text-gazie-navy/70 block">Role</label>
                          <select
                            value={editRole}
                            onChange={e => setEditRole(e.target.value)}
                            className="w-full px-3 py-2 bg-gazie-paper/20 border border-gazie-navy rounded-xl text-xs font-semibold focus:outline-none cursor-pointer"
                          >
                            <option value="rider">Rider</option>
                            <option value="driver">Driver</option>
                            <option value="admin">Admin</option>
                          </select>
                        </div>

                        <div className="space-y-1">
                          <label className="text-[10px] font-bold uppercase tracking-wider text-gazie-navy/70 block">Verification</label>
                          <select
                            value={editStatus}
                            onChange={e => setEditStatus(e.target.value)}
                            className="w-full px-3 py-2 bg-gazie-paper/20 border border-gazie-navy rounded-xl text-xs font-semibold focus:outline-none cursor-pointer"
                          >
                            <option value="pending_email">Pending Email</option>
                            <option value="email_verified">Email Verified</option>
                            <option value="pending_review">Pending Review</option>
                            <option value="rejected">Rejected</option>
                            <option value="verified">Verified</option>
                          </select>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={handleSaveUser}
                        disabled={editSaving}
                        className="w-full bg-gazie-navy text-gazie-paper font-bold py-2.5 rounded-xl hover:bg-gazie-yellow hover:text-gazie-navy transition-all text-xs flex items-center justify-center gap-1.5 disabled:opacity-50 cursor-pointer"
                      >
                        <Save className="w-3.5 h-3.5" />
                        {editSaving ? 'Saving...' : 'Save Changes'}
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })()}

        {/* ACTIVE TAB: ANALYTICS (New Analytics Section) */}
        {activeTab === 'analytics' && (
          <div className="space-y-6 animate-fadeIn text-gazie-navy">
            
            {/* 1. Header with Date Filter */}
            <div className="bg-white border-2 border-gazie-navy rounded-2xl p-4 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
              <div>
                <h2 className="font-display font-extrabold text-lg tracking-tight flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-gazie-navy" /> Founder's Analytics Insights
                </h2>
                <p className="text-xs text-gazie-navy/60 mt-0.5">
                  Internal monitoring for commute performance, route insights, and user base growth.
                </p>
              </div>

              {/* Date Filter Selector */}
              <div className="flex bg-gazie-paper border border-gazie-navy/20 p-0.5 rounded-lg shrink-0 select-none">
                {(['all', 'week', 'today'] as const).map((filter) => (
                  <button
                    key={filter}
                    onClick={() => setDateFilter(filter)}
                    className={`px-3 py-1 text-[9px] font-bold rounded-md uppercase tracking-wider transition-all cursor-pointer ${
                      dateFilter === filter
                        ? 'bg-gazie-navy text-white shadow-sm'
                        : 'text-gazie-navy/60 hover:text-gazie-navy/95 hover:bg-gazie-navy/5'
                    }`}
                  >
                    {filter === 'all' ? 'All Time' : filter === 'week' ? 'This Week' : 'Today'}
                  </button>
                ))}
              </div>
            </div>

            {/* 2. Top-line Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              
              {/* Trip Activity Card */}
              <div className="bg-white border-2 border-gazie-navy rounded-2xl p-5 shadow-sm space-y-4">
                <div className="border-b border-dashed border-gazie-navy/10 pb-2 flex items-center justify-between">
                  <h3 className="font-display font-bold text-xs uppercase tracking-wider text-gazie-navy flex items-center gap-1.5">
                    <Activity className="w-4 h-4 text-gazie-navy" /> Trip Activity
                  </h3>
                  <span className="text-[9px] font-mono font-bold bg-[#2D6A4F]/10 text-gazie-green px-2 py-0.5 rounded border border-[#2D6A4F]/20">
                    Matches Count
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3.5">
                  {/* Completed Trips Sub-card */}
                  <div className="col-span-2 bg-gazie-paper/30 p-3 rounded-xl border border-gazie-navy/15 flex flex-col justify-between">
                    <div>
                      <span className="text-[9px] uppercase font-bold text-gazie-navy/60">Completed Trips</span>
                      <div className="text-3xl font-black font-mono tracking-tight text-gazie-navy mt-1">
                        {dateFilter === 'today' ? completedToday : dateFilter === 'week' ? completedThisWeek : completedAllTime}
                      </div>
                    </div>
                    
                    <div className="mt-3 grid grid-cols-3 gap-2 border-t border-dashed border-gazie-navy/10 pt-2 text-[10px]">
                      <div>
                        <span className="text-gazie-navy/40 font-bold block text-[8px] uppercase">Today</span>
                        <span className="font-bold font-mono text-gazie-navy">{completedToday}</span>
                      </div>
                      <div>
                        <span className="text-gazie-navy/40 font-bold block text-[8px] uppercase">This Week</span>
                        <span className="font-bold font-mono text-gazie-navy">{completedThisWeek}</span>
                      </div>
                      <div>
                        <span className="text-gazie-navy/40 font-bold block text-[8px] uppercase">All Time</span>
                        <span className="font-bold font-mono text-gazie-navy">{completedAllTime}</span>
                      </div>
                    </div>
                  </div>

                  {/* Confirmed but Upcoming matches */}
                  <div className="bg-gazie-paper/10 p-3 rounded-xl border border-gazie-navy/10 flex flex-col justify-between">
                    <span className="text-[9px] uppercase font-bold text-gazie-navy/60">Upcoming Confirmed</span>
                    <div className="text-xl font-extrabold font-mono text-gazie-navy mt-1">
                      {confirmedUpcoming}
                    </div>
                    <span className="text-[8px] text-gazie-navy/40 mt-1 leading-none">Departure date &ge; today</span>
                  </div>

                  {/* Total volume in filtered range */}
                  <div className="bg-gazie-paper/10 p-3 rounded-xl border border-gazie-navy/10 flex flex-col justify-between">
                    <span className="text-[9px] uppercase font-bold text-gazie-navy/60">Filtered Matches</span>
                    <div className="text-xl font-extrabold font-mono text-gazie-navy mt-1">
                      {totalConfirmedOrEndedFiltered}
                    </div>
                    <span className="text-[8px] text-gazie-navy/40 mt-1 leading-none">Total confirmed &amp; ended</span>
                  </div>

                  {/* Cancellations count & rate */}
                  <div className="bg-red-50/50 p-3 rounded-xl border border-red-200/50 flex flex-col justify-between space-y-1">
                    <span className="text-[9px] uppercase font-bold text-red-700">Cancellation Rate</span>
                    <div className="text-xl font-bold font-mono text-red-950 flex items-baseline gap-1">
                      {cancellationRateFiltered.toFixed(1)}%
                      <span className="text-[9px] text-red-700/70 font-semibold font-sans">({cancelledCountFiltered})</span>
                    </div>
                    <div className="w-full bg-red-100/50 h-1 rounded-full overflow-hidden">
                      <div className="bg-red-700 h-full rounded-full" style={{ width: `${Math.min(cancellationRateFiltered, 100)}%` }} />
                    </div>
                  </div>

                  {/* No-show count & rate */}
                  <div className="bg-orange-50/50 p-3 rounded-xl border border-orange-200/50 flex flex-col justify-between space-y-1">
                    <span className="text-[9px] uppercase font-bold text-orange-700">No-Show Rate</span>
                    <div className="text-xl font-bold font-mono text-orange-950 flex items-baseline gap-1">
                      {noShowRateFiltered.toFixed(1)}%
                      <span className="text-[9px] text-orange-700/70 font-semibold font-sans">({noShowCountFiltered})</span>
                    </div>
                    <div className="w-full bg-orange-100/50 h-1 rounded-full overflow-hidden">
                      <div className="bg-orange-600 h-full rounded-full" style={{ width: `${Math.min(noShowRateFiltered, 100)}%` }} />
                    </div>
                  </div>

                </div>
              </div>

              {/* User Growth Card */}
              <div className="bg-white border-2 border-gazie-navy rounded-2xl p-5 shadow-sm space-y-4">
                <div className="border-b border-dashed border-gazie-navy/10 pb-2 flex items-center justify-between">
                  <h3 className="font-display font-bold text-xs uppercase tracking-wider text-gazie-navy flex items-center gap-1.5">
                    <Users className="w-4 h-4 text-gazie-navy" /> User Growth
                  </h3>
                  <span className="text-[9px] font-mono font-bold bg-[#FFC93C]/10 text-amber-800 px-2 py-0.5 rounded border border-[#FFC93C]/20">
                    Profiles Base
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3.5">
                  {/* Riders Count */}
                  <div className="bg-gazie-paper/30 p-3 rounded-xl border border-gazie-navy/15 flex flex-col justify-between">
                    <span className="text-[9px] uppercase font-bold text-gazie-navy/60">Total Riders</span>
                    <div className="text-2xl font-black font-mono text-gazie-navy mt-1">
                      {ridersAllTime}
                    </div>
                    <div className="mt-2 flex items-center gap-1 text-[8px] text-[#2D6A4F] font-bold">
                      <TrendingUp className="w-3 h-3 shrink-0" />
                      +{ridersThisWeek} this week
                    </div>
                  </div>

                  {/* Drivers Count */}
                  <div className="bg-gazie-paper/30 p-3 rounded-xl border border-gazie-navy/15 flex flex-col justify-between">
                    <span className="text-[9px] uppercase font-bold text-gazie-navy/60">Total Drivers</span>
                    <div className="text-2xl font-black font-mono text-gazie-navy mt-1">
                      {driversAllTime}
                    </div>
                    <div className="mt-2 flex items-center gap-1 text-[8px] text-[#2D6A4F] font-bold">
                      <TrendingUp className="w-3 h-3 shrink-0" />
                      +{driversThisWeek} this week
                    </div>
                  </div>

                  {/* Riders vs Drivers Ratio */}
                  <div className="col-span-2 bg-gazie-paper/10 p-3 rounded-xl border border-gazie-navy/10 space-y-2">
                    <div className="flex justify-between items-center text-[9px] font-bold text-gazie-navy/60">
                      <span>Riders vs Drivers Ratio</span>
                      <span className="font-mono">{riderDriverRatioFiltered} Riders per Driver</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <div className="text-lg font-bold font-mono text-gazie-navy shrink-0">
                        {ridersFilteredCount}:{driversFilteredCount}
                      </div>
                      
                      {/* Segment proportion bar */}
                      <div className="flex-1 flex h-2 rounded-full overflow-hidden border border-gazie-navy/10">
                        <div className="bg-gazie-navy" style={{ width: `${ridersPercentFiltered}%` }} title={`Riders: ${ridersPercentFiltered.toFixed(1)}%`} />
                        <div className="bg-gazie-yellow" style={{ width: `${driversPercentFiltered}%` }} title={`Drivers: ${driversPercentFiltered.toFixed(1)}%`} />
                      </div>

                      <div className="text-[8px] font-bold text-gazie-navy/50 font-mono shrink-0">
                        {ridersPercentFiltered.toFixed(0)}% / {driversPercentFiltered.toFixed(0)}%
                      </div>
                    </div>
                  </div>

                  {/* Verification Status Distribution */}
                  <div className="col-span-2 bg-gazie-paper/10 p-3 rounded-xl border border-gazie-navy/10 space-y-2">
                    <div className="flex justify-between items-center text-[9px] font-bold text-gazie-navy/60">
                      <span>Verification Approval Rate</span>
                      <span className="font-mono text-gazie-green">{approvalRateFiltered.toFixed(1)}% Verified</span>
                    </div>

                    {/* Stacked segment bar */}
                    <div className="flex h-2 rounded-full overflow-hidden border border-gazie-navy/10 bg-gray-100">
                      <div className="bg-[#2D6A4F]" style={{ width: `${approvalRateFiltered}%` }} title={`Verified: ${verifiedCountFiltered}`} />
                      <div className="bg-gazie-yellow" style={{ width: `${pendingRateFiltered}%` }} title={`Pending: ${pendingCountFiltered}`} />
                      <div className="bg-red-700" style={{ width: `${rejectedRateFiltered}%` }} title={`Rejected: ${rejectedCountFiltered}`} />
                    </div>

                    {/* Key legend */}
                    <div className="grid grid-cols-3 gap-1 text-[8px] text-gazie-navy/60 font-mono pt-0.5">
                      <div className="flex items-center">
                        <span className="inline-block w-1.5 h-1.5 rounded-full bg-[#2D6A4F] mr-1" />
                        <span>Appr: <strong>{verifiedCountFiltered}</strong></span>
                      </div>
                      <div className="flex items-center">
                        <span className="inline-block w-1.5 h-1.5 rounded-full bg-gazie-yellow mr-1" />
                        <span>Pend: <strong>{pendingCountFiltered}</strong></span>
                      </div>
                      <div className="flex items-center">
                        <span className="inline-block w-1.5 h-1.5 rounded-full bg-red-700 mr-1" />
                        <span>Rejc: <strong>{rejectedCountFiltered}</strong></span>
                      </div>
                    </div>
                  </div>

                </div>
              </div>

            </div>

            {/* 3. Route Insights & Commute Timing Patterns */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              
              {/* Route Insights Column */}
              <div className="bg-white border-2 border-gazie-navy rounded-2xl p-5 shadow-sm space-y-4">
                <div className="border-b border-dashed border-gazie-navy/10 pb-2">
                  <h3 className="font-display font-bold text-xs uppercase tracking-wider text-gazie-navy flex items-center gap-1.5">
                    <MapPin className="w-4 h-4 text-gazie-navy" /> Top Routes & Active Postings
                  </h3>
                </div>

                {routeInsights.length === 0 ? (
                  <p className="text-xs text-gazie-navy/40 italic py-8 text-center bg-gazie-paper/10 rounded-xl border border-dashed border-gazie-navy/10">
                    No route matches found for this period.
                  </p>
                ) : (
                  <div className="space-y-3 max-h-[320px] overflow-y-auto pr-1">
                    {routeInsights.map((r, index) => {
                      const widthPercent = (r.volume / maxRouteVolume) * 100;
                      return (
                        <div key={index} className="space-y-1.5 text-xs text-left">
                          <div className="flex justify-between items-baseline font-bold text-gazie-navy">
                            <span className="text-xs">{r.pickup} &rarr; {r.destination}</span>
                            <span className="font-mono text-[10px] bg-gazie-navy/5 px-2 py-0.5 rounded border border-gazie-navy/10">
                              {r.volume} trips
                            </span>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            {/* Proportional visual bar */}
                            <div className="flex-1 bg-gray-100 rounded-full h-2 overflow-hidden border border-gazie-navy/5">
                              <div className="bg-gazie-navy h-full rounded-full" style={{ width: `${widthPercent}%` }} />
                            </div>
                            
                            {/* Active postings count display */}
                            <span className={`text-[8px] font-mono font-bold shrink-0 px-1.5 py-0.2 rounded border ${
                              r.activePostings > 0 
                                ? 'bg-gazie-yellow/20 text-amber-800 border-gazie-yellow/30' 
                                : 'bg-gray-100 text-gray-400 border-gray-200'
                            }`}>
                              {r.activePostings} active
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Timing Patterns Column */}
              <div className="bg-white border-2 border-gazie-navy rounded-2xl p-5 shadow-sm space-y-4">
                <div className="border-b border-dashed border-gazie-navy/10 pb-2">
                  <h3 className="font-display font-bold text-xs uppercase tracking-wider text-gazie-navy flex items-center gap-1.5">
                    <Clock className="w-4 h-4 text-gazie-navy" /> Peak Commute Time Windows
                  </h3>
                </div>

                {timingPatterns.length === 0 ? (
                  <p className="text-xs text-gazie-navy/40 italic py-8 text-center bg-gazie-paper/10 rounded-xl border border-dashed border-gazie-navy/10">
                    No commute time records for this period.
                  </p>
                ) : (
                  <div className="space-y-3 max-h-[320px] overflow-y-auto pr-1">
                    {timingPatterns.map((t, index) => {
                      const widthPercent = (t.count / maxTimingCount) * 100;
                      return (
                        <div key={index} className="space-y-1.5 text-xs text-left">
                          <div className="flex justify-between items-baseline font-bold text-gazie-navy">
                            <span className="text-xs">{formatHourBucket(t.hour)}</span>
                            <span className="font-mono text-[10px] bg-gazie-navy/5 px-2 py-0.5 rounded border border-gazie-navy/10">
                              {t.count} matches
                            </span>
                          </div>

                          {/* Proportional visual bar */}
                          <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden border border-gazie-navy/5">
                            <div className="bg-gazie-yellow h-full rounded-full" style={{ width: `${widthPercent}%` }} />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

            </div>

          </div>
        )}
      </main>

      {/* Document Preview Modal */}
      {previewFileUrl && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white border-2 border-gazie-navy rounded-2xl max-w-lg w-full overflow-hidden shadow-2xl relative">
            <div className="bg-gazie-navy text-white p-3 flex justify-between items-center font-bold text-sm px-4">
              <span>DOCUMENT VIEWER</span>
              <button
                onClick={() => setPreviewFileUrl(null)}
                className="bg-white/10 hover:bg-white/20 p-1 rounded-lg text-white font-mono cursor-pointer"
              >
                ✕ Close
              </button>
            </div>
            <div className="p-4 flex items-center justify-center min-h-[300px] max-h-[500px] overflow-auto">
              {previewFileUrl.startsWith('data:image/') || previewFileUrl.includes('id-url') || previewFileUrl.includes('placeholder') || previewFileUrl.startsWith('http') ? (
                // Render file or placeholder representation
                previewFileUrl.startsWith('data:image/') ? (
                  <img src={previewFileUrl} alt="Uploaded Doc" className="max-w-full max-h-[400px] object-contain rounded border" />
                ) : (
                  <div className="w-full text-center space-y-3 p-6 bg-gazie-paper rounded-xl border border-dashed border-gazie-navy/20">
                    <p className="font-mono text-xs font-semibold">Verification Document Preview</p>
                    <p className="text-[10px] text-gazie-navy/60">Path Reference: {previewFileUrl}</p>
                    <div className="w-24 h-16 bg-gazie-navy/5 mx-auto rounded flex items-center justify-center font-bold text-gazie-navy border">
                      DOC
                    </div>
                    <p className="text-[9px] text-gazie-navy/40 italic">This is a mock representation of the uploaded file metadata in LocalStorage.</p>
                  </div>
                )
              ) : (
                <embed src={previewFileUrl} className="w-full h-[400px] rounded" />
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
