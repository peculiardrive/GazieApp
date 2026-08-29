"use client";

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import Navbar from '@/components/ui/Navbar';
import Toast, { useToast } from '@/components/ui/Toast';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import { 
  Users, Car, HeartHandshake, ShieldCheck, ShieldAlert, FileText, 
  Check, X, Link as LinkIcon, ExternalLink, Calendar, Clock, Bookmark, 
  ArrowRight, TrendingUp, MapPin, BarChart3, Activity, Pencil, Save, 
  UserPlus, Trash2, Download, Search, RefreshCw, AlertTriangle, 
  CheckCircle2, Phone, Shield, Eye
} from 'lucide-react';
import { STANDARD_COMMUTE_ROUTES } from '@/lib/routes';

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

  const [currentAdminId, setCurrentAdminId] = useState<string>('');

  // User management state
  const [editingUser, setEditingUser] = useState<any | null>(null);
  const [editName, setEditName] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editRole, setEditRole] = useState('rider');
  const [editStatus, setEditStatus] = useState('email_verified');
  const [editVehicleMake, setEditVehicleMake] = useState('');
  const [editVehicleModel, setEditVehicleModel] = useState('');
  const [editVehicleColor, setEditVehicleColor] = useState('');
  const [editVehiclePlate, setEditVehiclePlate] = useState('');
  const [editUsualRoute, setEditUsualRoute] = useState('');
  const [editDriverFare, setEditDriverFare] = useState('');
  const [editTimeWindow, setEditTimeWindow] = useState('');
  const [editEmergencyContact, setEditEmergencyContact] = useState('');
  const [editSaving, setEditSaving] = useState(false);

  // Add user state
  const [isAddUserOpen, setIsAddUserOpen] = useState(false);
  const [addUserSaving, setAddUserSaving] = useState(false);
  const [newUserForm, setNewUserForm] = useState({
    full_name: '',
    phone: '',
    role: 'rider',
    verification_status: 'email_verified',
    vehicle_make: '',
    vehicle_model: '',
    vehicle_color: '',
    vehicle_plate: '',
    usual_route: 'Lugbe Plaza -> Federal Secretariat',
    driver_fare: '1000',
    available_time_window: '06:30 AM - 08:30 AM',
    emergency_contact: ''
  });

  // Delete modal state
  const [deleteConfirmUser, setDeleteConfirmUser] = useState<any | null>(null);
  const [deleteSaving, setDeleteSaving] = useState(false);

  // Search & Filter state
  const [userSearchQuery, setUserSearchQuery] = useState('');
  const [userRoleFilter, setUserRoleFilter] = useState<'all' | 'rider' | 'driver' | 'admin'>('all');
  const [userStatusFilter, setUserStatusFilter] = useState<'all' | 'verified' | 'pending_review' | 'email_verified' | 'rejected'>('all');

  // Date range filter state
  const [dateFilter, setDateFilter] = useState<'today' | 'week' | 'all'>('all');

  const fetchAdminData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/login');
        return;
      }

      setCurrentAdminId(user.id);

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
      const { data: allProfiles } = await supabase.from('profiles').select('*').order('created_at', { ascending: false });
      const { data: allBookings } = await supabase.from('bookings').select('*').order('created_at', { ascending: false });
      const { data: allIncidents } = await supabase.from('incidents').select('*').order('created_at', { ascending: false });
      const { data: allPostings } = await supabase.from('ride_postings').select('*').order('created_at', { ascending: false });

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
        showToast(`User verification updated to ${status.toUpperCase()}`, 'success');
        fetchAdminData();
      }
    } catch (err: any) {
      showToast(err.message || 'Error occurred during verification', 'error');
    }
  };

  // Quick Role Toggle
  const handleQuickRoleChange = async (userId: string, newRole: string) => {
    if (userId === currentAdminId && newRole !== 'admin') {
      showToast('Cannot demote your own active administrator account.', 'error');
      return;
    }

    try {
      const { error } = await supabase
        .from('profiles')
        .update({ role: newRole })
        .eq('id', userId);

      if (error) {
        showToast('Failed to update role: ' + error.message, 'error');
      } else {
        showToast(`Role updated to ${newRole.toUpperCase()}`, 'success');
        fetchAdminData();
      }
    } catch (err: any) {
      showToast(err.message || 'Role change failed', 'error');
    }
  };

  // Open Edit User Modal
  const openEditUser = (user: any) => {
    setEditingUser(user);
    setEditName(user.full_name || '');
    setEditPhone(user.phone || '');
    setEditRole(user.role || 'rider');
    setEditStatus(user.verification_status || 'email_verified');
    setEditVehicleMake(user.vehicle_make || '');
    setEditVehicleModel(user.vehicle_model || '');
    setEditVehicleColor(user.vehicle_color || '');
    setEditVehiclePlate(user.vehicle_plate || '');
    setEditUsualRoute(user.usual_route || '');
    setEditDriverFare(user.driver_fare ? String(user.driver_fare) : '');
    setEditTimeWindow(user.available_time_window || '');
    setEditEmergencyContact(user.emergency_contact || '');
  };

  // Save Edit User
  const handleSaveUser = async () => {
    if (!editingUser) return;
    if (editingUser.id === currentAdminId && editRole !== 'admin') {
      showToast('Cannot remove your own admin privileges.', 'error');
      return;
    }

    setEditSaving(true);
    try {
      const payload: any = {
        full_name: editName.trim(),
        phone: editPhone.trim(),
        role: editRole,
        verification_status: editStatus,
        emergency_contact: editEmergencyContact.trim() || null,
      };

      if (editRole === 'driver') {
        payload.vehicle_make = editVehicleMake.trim() || null;
        payload.vehicle_model = editVehicleModel.trim() || null;
        payload.vehicle_color = editVehicleColor.trim() || null;
        payload.vehicle_plate = editVehiclePlate.trim().toUpperCase() || null;
        payload.usual_route = editUsualRoute.trim() || null;
        payload.driver_fare = editDriverFare ? Number(editDriverFare) : null;
        payload.available_time_window = editTimeWindow.trim() || null;
      }

      const { error } = await supabase
        .from('profiles')
        .update(payload)
        .eq('id', editingUser.id);

      if (error) {
        showToast('Failed to save: ' + error.message, 'error');
      } else {
        showToast('User profile updated successfully!', 'success');
        setEditingUser(null);
        fetchAdminData();
      }
    } catch (err: any) {
      showToast(err.message || 'Save failed', 'error');
    } finally {
      setEditSaving(false);
    }
  };

  // Create / Add New User
  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUserForm.full_name.trim()) {
      showToast('Please enter full name', 'error');
      return;
    }

    setAddUserSaving(true);
    try {
      const newUserId = crypto.randomUUID();
      const payload: any = {
        id: newUserId,
        full_name: newUserForm.full_name.trim(),
        phone: newUserForm.phone.trim() || null,
        role: newUserForm.role,
        verification_status: newUserForm.verification_status,
        emergency_contact: newUserForm.emergency_contact.trim() || null,
      };

      if (newUserForm.role === 'driver') {
        payload.vehicle_make = newUserForm.vehicle_make.trim() || 'Toyota';
        payload.vehicle_model = newUserForm.vehicle_model.trim() || 'Corolla';
        payload.vehicle_color = newUserForm.vehicle_color.trim() || 'Silver';
        payload.vehicle_plate = newUserForm.vehicle_plate.trim().toUpperCase() || 'ABC-123-XY';
        payload.usual_route = newUserForm.usual_route.trim() || 'Lugbe Plaza -> Federal Secretariat';
        payload.driver_fare = newUserForm.driver_fare ? Number(newUserForm.driver_fare) : 1000;
        payload.available_time_window = newUserForm.available_time_window.trim() || '06:30 AM - 08:30 AM';
      }

      const { error } = await supabase
        .from('profiles')
        .insert(payload);

      if (error) {
        showToast('Failed to create user: ' + error.message, 'error');
      } else {
        showToast(`User "${newUserForm.full_name}" created successfully!`, 'success');
        setIsAddUserOpen(false);
        setNewUserForm({
          full_name: '',
          phone: '',
          role: 'rider',
          verification_status: 'email_verified',
          vehicle_make: '',
          vehicle_model: '',
          vehicle_color: '',
          vehicle_plate: '',
          usual_route: 'Lugbe Plaza -> Federal Secretariat',
          driver_fare: '1000',
          available_time_window: '06:30 AM - 08:30 AM',
          emergency_contact: ''
        });
        fetchAdminData();
      }
    } catch (err: any) {
      showToast(err.message || 'Creation failed', 'error');
    } finally {
      setAddUserSaving(false);
    }
  };

  // Delete User
  const executeDeleteUser = async () => {
    if (!deleteConfirmUser) return;
    if (deleteConfirmUser.id === currentAdminId) {
      showToast('Cannot delete your own active administrator account.', 'error');
      setDeleteConfirmUser(null);
      return;
    }

    setDeleteSaving(true);
    try {
      // 1. Delete user bookings, postings, and templates
      await supabase.from('bookings').delete().or(`rider_id.eq.${deleteConfirmUser.id},driver_id.eq.${deleteConfirmUser.id}`);
      await supabase.from('ride_postings').delete().eq('driver_id', deleteConfirmUser.id);
      await supabase.from('recurring_templates').delete().eq('driver_id', deleteConfirmUser.id);
      await supabase.from('incidents').delete().or(`reporter_id.eq.${deleteConfirmUser.id},reported_id.eq.${deleteConfirmUser.id}`);

      // 2. Delete from public.profiles
      const { error } = await supabase
        .from('profiles')
        .delete()
        .eq('id', deleteConfirmUser.id);

      if (error) {
        showToast('Delete failed: ' + error.message, 'error');
      } else {
        showToast(`User "${deleteConfirmUser.full_name || 'Account'}" deleted permanently.`, 'success');
        if (editingUser?.id === deleteConfirmUser.id) {
          setEditingUser(null);
        }
        setDeleteConfirmUser(null);
        fetchAdminData();
      }
    } catch (err: any) {
      showToast(err.message || 'Error deleting user', 'error');
    } finally {
      setDeleteSaving(false);
    }
  };

  // Export Users to CSV
  const exportUsersCSV = () => {
    if (profiles.length === 0) {
      showToast('No users available to export', 'error');
      return;
    }

    const headers = ['ID', 'Full Name', 'Phone', 'Role', 'Verification Status', 'Vehicle Plate', 'Vehicle Info', 'Route', 'Fare (NGN)', 'Joined Date'];
    const rows = profiles.map(p => [
      `"${p.id}"`,
      `"${p.full_name || ''}"`,
      `"${p.phone || ''}"`,
      `"${p.role || ''}"`,
      `"${p.verification_status || ''}"`,
      `"${p.vehicle_plate || ''}"`,
      `"${[p.vehicle_color, p.vehicle_make, p.vehicle_model].filter(Boolean).join(' ')}"`,
      `"${p.usual_route || ''}"`,
      `"${p.driver_fare || ''}"`,
      `"${p.created_at ? new Date(p.created_at).toISOString().split('T')[0] : ''}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `gazie-users-${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    showToast('Exported users spreadsheet successfully!', 'success');
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

  const getIncidentSeverityConfig = (severity?: string) => {
    switch (severity) {
      case 'level_3':
        return {
          label: 'Level 3 Emergency',
          className: 'bg-red-700 text-white border-red-800',
          action: 'Call emergency responders, contact both trip parties, and preserve all evidence.',
        };
      case 'level_2':
        return {
          label: 'Level 2 Urgent',
          className: 'bg-orange-100 text-orange-900 border-orange-300',
          action: 'Contact the reporter, pause the trip if active, and verify rider/driver location.',
        };
      default:
        return {
          label: 'Level 1 Service',
          className: 'bg-gazie-yellow text-gazie-navy border-gazie-navy/20',
          action: 'Review the report, message the affected party, and close when resolved.',
        };
    }
  };

  const formatIncidentType = (type?: string) => {
    if (!type) return 'Service Issue';
    return type
      .split('_')
      .map(part => part.charAt(0).toUpperCase() + part.slice(1))
      .join(' ');
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
                    const severityConfig = getIncidentSeverityConfig(inc.severity);
                    return (
                      <div key={inc.id} className="p-4 bg-red-50/50 border border-red-200 rounded-xl space-y-3 text-xs">
                        <div className="flex flex-col sm:flex-row sm:justify-between gap-2">
                          <div className="space-y-1">
                            <div className="flex flex-wrap items-center gap-2">
                              <span className={`px-2 py-1 rounded border text-[9px] font-extrabold uppercase ${severityConfig.className}`}>
                                {severityConfig.label}
                              </span>
                              <span className="px-2 py-1 rounded border border-red-200 bg-white text-red-900 text-[9px] font-extrabold uppercase">
                                {formatIncidentType(inc.incident_type)}
                              </span>
                              <span className="px-2 py-1 rounded border border-gazie-navy/15 bg-white text-gazie-navy text-[9px] font-mono font-bold uppercase">
                                {inc.status || 'open'}
                              </span>
                            </div>
                            <span className="text-red-950 font-bold block">
                              {reporter?.full_name || 'Reporter'} {reporter?.phone ? `(${reporter.phone})` : ''}
                            </span>
                          </div>
                          <div className="text-left sm:text-right space-y-1">
                            <span className="text-[9px] font-mono text-red-700/80 block">{new Date(inc.created_at).toLocaleString()}</span>
                            <span className="text-[9px] font-mono text-gazie-navy/60 block">Report: {inc.id.substring(0, 8)}</span>
                          </div>
                        </div>

                        <div className="grid sm:grid-cols-2 gap-2">
                          <div className="bg-white border border-red-100 rounded-lg p-2">
                            <span className="text-[9px] uppercase font-bold text-gazie-navy/50 flex items-center gap-1">
                              <FileText className="w-3 h-3" /> Trip Identification
                            </span>
                            <span className="font-mono font-bold text-gazie-navy block mt-1">{inc.trip_code || 'Not provided'}</span>
                          </div>
                          <div className="bg-white border border-red-100 rounded-lg p-2">
                            <span className="text-[9px] uppercase font-bold text-gazie-navy/50 flex items-center gap-1">
                              <MapPin className="w-3 h-3" /> Current Location
                            </span>
                            <span className="font-bold text-gazie-navy block mt-1">{inc.current_location || 'Not provided'}</span>
                          </div>
                          <div className="bg-white border border-red-100 rounded-lg p-2">
                            <span className="text-[9px] uppercase font-bold text-gazie-navy/50 flex items-center gap-1">
                              <Users className="w-3 h-3" /> Involved Party
                            </span>
                            <span className="font-bold text-gazie-navy block mt-1">{inc.involved_party || 'Not provided'}</span>
                          </div>
                          <div className="bg-white border border-red-100 rounded-lg p-2">
                            <span className="text-[9px] uppercase font-bold text-gazie-navy/50 flex items-center gap-1">
                              <Phone className="w-3 h-3" /> Emergency Contact
                            </span>
                            <span className="font-bold text-gazie-navy block mt-1">
                              {[inc.emergency_contact_name, inc.emergency_contact_phone].filter(Boolean).join(' - ') || reporter?.emergency_contact || 'Not provided'}
                            </span>
                          </div>
                        </div>

                        <div className="bg-white border border-red-100 rounded-lg p-3 space-y-2">
                          <div>
                            <span className="text-[9px] uppercase font-bold text-gazie-navy/50">Immediate Action Taken</span>
                            <p className="text-gazie-navy/75 font-medium mt-1">{inc.immediate_action_taken || 'No action note provided.'}</p>
                          </div>
                          <div>
                            <span className="text-[9px] uppercase font-bold text-gazie-navy/50">Incident Details</span>
                            <p className="text-gray-700 font-medium mt-1">{inc.description}</p>
                          </div>
                        </div>

                        <div className="bg-red-900 text-white rounded-lg p-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                          <span className="font-bold leading-snug">{severityConfig.action}</span>
                          <a
                            href={`https://wa.me/2348164737221?text=${encodeURIComponent(`Emergency report ${inc.id.substring(0, 8)}: ${inc.trip_code || 'No trip ID'} at ${inc.current_location || 'unknown location'}`)}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-white text-red-900 text-[10px] font-extrabold hover:bg-gazie-yellow transition-colors"
                          >
                            <Phone className="w-3.5 h-3.5" /> Escalate
                          </a>
                        </div>

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
            .filter(p => userStatusFilter === 'all' || p.verification_status === userStatusFilter)
            .filter(p => {
              if (!userSearchQuery) return true;
              const q = userSearchQuery.toLowerCase();
              return (
                (p.full_name || '').toLowerCase().includes(q) ||
                (p.phone || '').toLowerCase().includes(q) ||
                (p.role || '').toLowerCase().includes(q) ||
                (p.vehicle_plate || '').toLowerCase().includes(q) ||
                (p.usual_route || '').toLowerCase().includes(q)
              );
            });

          const totalVerifiedUsers = profiles.filter(p => p.verification_status === 'verified').length;
          const totalDriverUsers = profiles.filter(p => p.role === 'driver').length;
          const totalRiderUsers = profiles.filter(p => p.role === 'rider').length;
          const totalAdminUsers = profiles.filter(p => p.role === 'admin').length;

          const statusBadge = (status: string) => {
            switch (status) {
              case 'verified': return 'bg-green-100 text-green-800 border-green-300';
              case 'pending_review': return 'bg-blue-100 text-blue-800 border-blue-300 animate-pulse';
              case 'email_verified': return 'bg-amber-100 text-amber-800 border-amber-300';
              case 'rejected': return 'bg-red-100 text-red-700 border-red-300';
              default: return 'bg-gray-100 text-gray-600 border-gray-200';
            }
          };

          const roleBadge = (role: string) => {
            if (role === 'driver') return 'bg-gazie-navy text-white';
            if (role === 'admin') return 'bg-gazie-yellow text-gazie-navy font-bold';
            return 'bg-gazie-paper text-gazie-navy border border-gazie-navy/30';
          };

          return (
            <div className="space-y-6 animate-fadeIn">
              
              {/* 1. Quick Stats Overview */}
              <section className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                <div className="bg-white border-2 border-gazie-navy rounded-xl p-3 text-center shadow-sm">
                  <Users className="w-4 h-4 text-gazie-navy opacity-70 mx-auto mb-1" />
                  <span className="font-mono text-lg font-extrabold text-gazie-navy">{profiles.length}</span>
                  <span className="text-[9px] font-bold text-gazie-navy/60 uppercase block">Total Users</span>
                </div>
                <div className="bg-white border-2 border-gazie-navy rounded-xl p-3 text-center shadow-sm">
                  <ShieldCheck className="w-4 h-4 text-gazie-green mx-auto mb-1" />
                  <span className="font-mono text-lg font-extrabold text-gazie-green">{totalVerifiedUsers}</span>
                  <span className="text-[9px] font-bold text-gazie-navy/60 uppercase block">Verified (KYC)</span>
                </div>
                <div className="bg-white border-2 border-gazie-navy rounded-xl p-3 text-center shadow-sm">
                  <Car className="w-4 h-4 text-gazie-navy mx-auto mb-1" />
                  <span className="font-mono text-lg font-extrabold text-gazie-navy">{totalDriverUsers}</span>
                  <span className="text-[9px] font-bold text-gazie-navy/60 uppercase block">Drivers</span>
                </div>
                <div className="bg-white border-2 border-gazie-navy rounded-xl p-3 text-center shadow-sm">
                  <HeartHandshake className="w-4 h-4 text-gazie-navy mx-auto mb-1" />
                  <span className="font-mono text-lg font-extrabold text-gazie-navy">{totalRiderUsers}</span>
                  <span className="text-[9px] font-bold text-gazie-navy/60 uppercase block">Riders</span>
                </div>
                <div className="bg-white border-2 border-gazie-navy rounded-xl p-3 text-center shadow-sm col-span-2 sm:col-span-1">
                  <Shield className="w-4 h-4 text-amber-600 mx-auto mb-1" />
                  <span className="font-mono text-lg font-extrabold text-amber-800">{totalAdminUsers}</span>
                  <span className="text-[9px] font-bold text-gazie-navy/60 uppercase block">Admins</span>
                </div>
              </section>

              {/* 2. Control Bar (Search, Multi-Filter, Add User, Export) */}
              <section className="bg-white border-2 border-gazie-navy rounded-2xl p-4 shadow-sm space-y-3">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                  <div>
                    <h2 className="font-display font-extrabold text-lg tracking-tight flex items-center gap-2">
                      <Users className="w-5 h-5 text-gazie-navy" /> Administrative User Directory
                    </h2>
                    <p className="text-[11px] text-gazie-navy/60">
                      Showing {filteredUsers.length} of {profiles.length} registered commuter profiles.
                    </p>
                  </div>

                  <div className="flex items-center gap-2 w-full sm:w-auto">
                    <button
                      onClick={() => setIsAddUserOpen(true)}
                      className="flex-1 sm:flex-none bg-[#2D6A4F] text-white font-bold text-xs px-3.5 py-2 rounded-xl hover:bg-emerald-900 transition flex items-center justify-center gap-1.5 shadow-sm cursor-pointer"
                    >
                      <UserPlus className="w-4 h-4" /> Add User
                    </button>

                    <button
                      onClick={exportUsersCSV}
                      className="bg-white border-2 border-gazie-navy text-gazie-navy font-bold text-xs px-3 py-2 rounded-xl hover:bg-gazie-paper transition flex items-center justify-center gap-1.5 cursor-pointer"
                      title="Export directory as CSV"
                    >
                      <Download className="w-4 h-4" /> Export
                    </button>
                  </div>
                </div>

                {/* Filters Row */}
                <div className="grid grid-cols-1 sm:grid-cols-12 gap-2.5 pt-2 border-t border-dashed border-gazie-navy/10">
                  {/* Search Input */}
                  <div className="sm:col-span-6 relative">
                    <Search className="w-4 h-4 text-gazie-navy/40 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="Search name, phone, plate, route..."
                      value={userSearchQuery}
                      onChange={e => setUserSearchQuery(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 bg-gazie-paper/20 border border-gazie-navy rounded-xl text-xs font-semibold focus:outline-none focus:border-gazie-yellow"
                    />
                  </div>

                  {/* Role Filter */}
                  <div className="sm:col-span-3">
                    <select
                      value={userRoleFilter}
                      onChange={e => setUserRoleFilter(e.target.value as any)}
                      className="w-full px-3 py-2 bg-gazie-paper/20 border border-gazie-navy rounded-xl text-xs font-semibold focus:outline-none cursor-pointer"
                    >
                      <option value="all">All Roles</option>
                      <option value="rider">Riders</option>
                      <option value="driver">Drivers</option>
                      <option value="admin">Administrators</option>
                    </select>
                  </div>

                  {/* Verification Status Filter */}
                  <div className="sm:col-span-3">
                    <select
                      value={userStatusFilter}
                      onChange={e => setUserStatusFilter(e.target.value as any)}
                      className="w-full px-3 py-2 bg-gazie-paper/20 border border-gazie-navy rounded-xl text-xs font-semibold focus:outline-none cursor-pointer"
                    >
                      <option value="all">All Statuses</option>
                      <option value="verified">Verified (KYC)</option>
                      <option value="pending_review">Pending Review</option>
                      <option value="email_verified">Email Verified</option>
                      <option value="rejected">Rejected</option>
                    </select>
                  </div>
                </div>
              </section>

              {/* 3. Interactive User Table */}
              <section className="bg-white border-2 border-gazie-navy rounded-2xl shadow-sm overflow-hidden">
                {filteredUsers.length === 0 ? (
                  <div className="p-8 text-center space-y-2">
                    <Users className="w-8 h-8 text-gazie-navy/30 mx-auto" />
                    <p className="text-xs text-gazie-navy/60 font-semibold">No users found matching your search or filters.</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs">
                      <thead>
                        <tr className="bg-gazie-navy text-gazie-paper">
                          <th className="text-left px-4 py-3 font-bold uppercase tracking-wider text-[10px]">User & Contact</th>
                          <th className="text-left px-4 py-3 font-bold uppercase tracking-wider text-[10px]">Role</th>
                          <th className="text-left px-4 py-3 font-bold uppercase tracking-wider text-[10px]">Verification</th>
                          <th className="text-left px-4 py-3 font-bold uppercase tracking-wider text-[10px]">Route / Vehicle</th>
                          <th className="text-left px-4 py-3 font-bold uppercase tracking-wider text-[10px]">Joined</th>
                          <th className="px-4 py-3 text-right font-bold uppercase tracking-wider text-[10px]">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gazie-navy/10">
                        {filteredUsers.map((user) => {
                          const isCurrentAdmin = user.id === currentAdminId;
                          const initials = (user.full_name || 'U')
                            .split(' ')
                            .map((n: string) => n[0])
                            .slice(0, 2)
                            .join('')
                            .toUpperCase();

                          return (
                            <tr key={user.id} className="hover:bg-gazie-paper/30 transition-colors">
                              {/* User Info */}
                              <td className="px-4 py-3">
                                <div className="flex items-center gap-2.5">
                                  <div className="w-8 h-8 rounded-full bg-gazie-navy text-gazie-paper flex items-center justify-center font-black text-[11px] shrink-0 border border-gazie-yellow">
                                    {initials}
                                  </div>
                                  <div className="min-w-0 max-w-[160px]">
                                    <div className="flex items-center gap-1.5">
                                      <span className="font-bold text-gazie-navy truncate block">
                                        {user.full_name || 'Anonymous User'}
                                      </span>
                                      {isCurrentAdmin && (
                                        <span className="text-[8px] bg-amber-100 text-amber-800 font-bold px-1 rounded">YOU</span>
                                      )}
                                    </div>
                                    <div className="text-[11px] font-mono text-gazie-navy/70 flex items-center gap-1">
                                      <Phone className="w-3 h-3 inline text-gazie-navy/40" />
                                      {user.phone ? (
                                        <a href={`tel:${user.phone}`} className="hover:underline">{user.phone}</a>
                                      ) : (
                                        <span className="italic text-gazie-navy/40">No phone</span>
                                      )}
                                    </div>
                                    {user.emergency_contact && (
                                      <div className="text-[9px] text-gazie-navy/50 truncate">
                                        🚨 ICE: {user.emergency_contact}
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </td>

                              {/* Role Selector (1-Click Switch) */}
                              <td className="px-4 py-3">
                                <select
                                  value={user.role}
                                  onChange={e => handleQuickRoleChange(user.id, e.target.value)}
                                  disabled={isCurrentAdmin}
                                  className={`px-2 py-1 rounded text-[10px] font-bold uppercase cursor-pointer border focus:outline-none transition ${roleBadge(user.role)} ${
                                    isCurrentAdmin ? 'opacity-80 cursor-not-allowed' : 'hover:opacity-90'
                                  }`}
                                  title={isCurrentAdmin ? 'Your active role' : 'Change user role'}
                                >
                                  <option value="rider">Rider</option>
                                  <option value="driver">Driver</option>
                                  <option value="admin">Admin</option>
                                </select>
                              </td>

                              {/* Verification Status & NIN Identity */}
                              <td className="px-4 py-3 min-w-[140px]">
                                <div className="space-y-1">
                                  <span className={`inline-block px-2 py-0.5 rounded border text-[9px] font-bold uppercase ${statusBadge(user.verification_status)}`}>
                                    {(user.verification_status || '').replace('_', ' ')}
                                  </span>

                                  {/* Text-Based Identity Records */}
                                  {user.id_url && !user.id_url.startsWith('http') && (
                                    <div className="font-mono text-[9px] font-bold bg-gazie-paper border border-gazie-navy/20 px-1.5 py-0.5 rounded text-gazie-navy">
                                      🆔 NIN: {user.id_url}
                                    </div>
                                  )}
                                  {user.license_url && !user.license_url.startsWith('http') && (
                                    <div className="font-mono text-[9px] font-bold bg-amber-50 border border-amber-300 text-amber-900 px-1.5 py-0.5 rounded">
                                      🚗 LIC: {user.license_url}
                                    </div>
                                  )}
                                  {user.id_url && user.id_url.startsWith('http') && (
                                    <a href={user.id_url} target="_blank" rel="noopener noreferrer" className="text-[9px] font-bold underline text-blue-700 block">
                                      📄 View ID File
                                    </a>
                                  )}

                                  {/* Quick Verification Actions */}
                                  {user.verification_status === 'pending_review' && (
                                    <div className="flex items-center gap-1 pt-0.5">
                                      <button
                                        onClick={() => handleUpdateVerification(user.id, 'verified')}
                                        className="bg-[#2D6A4F] text-white px-2 py-0.5 rounded text-[9px] font-bold hover:bg-emerald-950 transition cursor-pointer flex items-center gap-0.5"
                                        title="1-Click Approve"
                                      >
                                        <Check className="w-3 h-3" /> Approve
                                      </button>
                                      <button
                                        onClick={() => {
                                          const reason = prompt('Rejection reason:', 'NIN does not match user name in NIMC records.');
                                          if (reason !== null) {
                                            handleUpdateVerification(user.id, 'rejected', reason);
                                          }
                                        }}
                                        className="bg-red-700 text-white px-1.5 py-0.5 rounded text-[9px] font-bold hover:bg-red-900 transition cursor-pointer"
                                        title="1-Click Reject"
                                      >
                                        <X className="w-3 h-3" />
                                      </button>
                                    </div>
                                  )}
                                </div>
                              </td>
                              <td className="px-4 py-3 max-w-[180px]">
                                {user.role === 'driver' ? (
                                  <div className="space-y-0.5 text-[10px]">
                                    <span className="font-mono font-bold bg-gazie-navy text-gazie-paper px-1.5 py-0.5 rounded text-[9px] inline-block">
                                      {user.vehicle_plate || 'NO PLATE'}
                                    </span>
                                    <p className="text-gazie-navy/80 truncate">
                                      {[user.vehicle_color, user.vehicle_make, user.vehicle_model].filter(Boolean).join(' ') || 'Vehicle info pending'}
                                    </p>
                                    {user.usual_route && (
                                      <p className="text-gazie-navy/60 truncate font-semibold">📍 {user.usual_route}</p>
                                    )}
                                    {user.driver_fare && (
                                      <p className="font-mono font-bold text-gazie-green">₦{user.driver_fare}/seat</p>
                                    )}
                                  </div>
                                ) : (
                                  <span className="text-[10px] text-gazie-navy/40 italic">Passenger</span>
                                )}
                              </td>

                              {/* Joined Date */}
                              <td className="px-4 py-3 font-mono text-[10px] text-gazie-navy/60">
                                {user.created_at ? new Date(user.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: '2-digit' }) : '—'}
                              </td>

                              {/* Action Buttons */}
                              <td className="px-4 py-3 text-right">
                                <div className="flex items-center justify-end gap-1.5">
                                  <button
                                    onClick={() => openEditUser(user)}
                                    className="p-1.5 rounded-lg border border-gazie-navy/30 bg-gazie-paper hover:bg-gazie-navy hover:text-white transition cursor-pointer"
                                    title="Edit User Profile"
                                  >
                                    <Pencil className="w-3.5 h-3.5" />
                                  </button>

                                  {!isCurrentAdmin && (
                                    <button
                                      onClick={() => setDeleteConfirmUser(user)}
                                      className="p-1.5 rounded-lg border border-red-200 bg-red-50 text-red-700 hover:bg-red-600 hover:text-white transition cursor-pointer"
                                      title="Delete User"
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                  )}
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </section>

              {/* 4. ADD USER MODAL */}
              {isAddUserOpen && (
                <div className="fixed inset-0 bg-gazie-navy/60 backdrop-blur-sm z-[999] flex items-center justify-center p-4">
                  <div className="bg-white border-2 border-gazie-navy w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden animate-fadeIn max-h-[90vh] flex flex-col">
                    {/* Modal Header */}
                    <div className="bg-gazie-navy text-gazie-paper p-4 flex justify-between items-center shrink-0">
                      <span className="font-display font-black text-sm uppercase tracking-wider flex items-center gap-2">
                        <UserPlus className="w-4 h-4 text-gazie-yellow" /> Create New Commuter
                      </span>
                      <button
                        type="button"
                        onClick={() => setIsAddUserOpen(false)}
                        className="p-1 rounded-lg hover:bg-white/10 transition cursor-pointer"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Modal Form Body */}
                    <form onSubmit={handleAddUser} className="p-5 space-y-4 overflow-y-auto flex-1 text-left">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold uppercase tracking-wider text-gazie-navy/70 block">Full Name *</label>
                          <input
                            type="text"
                            required
                            placeholder="e.g. Zara Everest"
                            value={newUserForm.full_name}
                            onChange={e => setNewUserForm({ ...newUserForm, full_name: e.target.value })}
                            className="w-full px-3 py-2 bg-gazie-paper/20 border border-gazie-navy rounded-xl text-xs font-semibold focus:outline-none focus:border-gazie-yellow"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-[10px] font-bold uppercase tracking-wider text-gazie-navy/70 block">Phone Number</label>
                          <input
                            type="tel"
                            placeholder="08012345678"
                            value={newUserForm.phone}
                            onChange={e => setNewUserForm({ ...newUserForm, phone: e.target.value })}
                            className="w-full px-3 py-2 bg-gazie-paper/20 border border-gazie-navy rounded-xl text-xs font-mono font-bold focus:outline-none focus:border-gazie-yellow"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold uppercase tracking-wider text-gazie-navy/70 block">Role</label>
                          <select
                            value={newUserForm.role}
                            onChange={e => setNewUserForm({ ...newUserForm, role: e.target.value })}
                            className="w-full px-3 py-2 bg-gazie-paper/20 border border-gazie-navy rounded-xl text-xs font-semibold focus:outline-none cursor-pointer"
                          >
                            <option value="rider">Rider (Passenger)</option>
                            <option value="driver">Driver (Car Owner)</option>
                            <option value="admin">Administrator</option>
                          </select>
                        </div>

                        <div className="space-y-1">
                          <label className="text-[10px] font-bold uppercase tracking-wider text-gazie-navy/70 block">Initial Status</label>
                          <select
                            value={newUserForm.verification_status}
                            onChange={e => setNewUserForm({ ...newUserForm, verification_status: e.target.value })}
                            className="w-full px-3 py-2 bg-gazie-paper/20 border border-gazie-navy rounded-xl text-xs font-semibold focus:outline-none cursor-pointer"
                          >
                            <option value="verified">Verified (Full Access)</option>
                            <option value="email_verified">Email Verified (Tier 1)</option>
                            <option value="pending_review">Pending Review</option>
                            <option value="rejected">Rejected</option>
                          </select>
                        </div>
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] font-bold uppercase tracking-wider text-gazie-navy/70 block">Emergency Contact (Next of Kin)</label>
                        <input
                          type="text"
                          placeholder="e.g. Sister: 08099887766"
                          value={newUserForm.emergency_contact}
                          onChange={e => setNewUserForm({ ...newUserForm, emergency_contact: e.target.value })}
                          className="w-full px-3 py-2 bg-gazie-paper/20 border border-gazie-navy rounded-xl text-xs font-semibold focus:outline-none focus:border-gazie-yellow"
                        />
                      </div>

                      {/* Driver Specific Fields */}
                      {newUserForm.role === 'driver' && (
                        <div className="p-3 bg-gazie-paper/40 border border-gazie-navy/20 rounded-xl space-y-3">
                          <span className="text-[10px] font-bold uppercase text-gazie-navy block tracking-wider">
                            🚗 Driver & Vehicle Details
                          </span>

                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                            <div className="space-y-1">
                              <label className="text-[9px] font-bold uppercase text-gazie-navy/60">Make</label>
                              <input
                                type="text"
                                placeholder="Toyota"
                                value={newUserForm.vehicle_make}
                                onChange={e => setNewUserForm({ ...newUserForm, vehicle_make: e.target.value })}
                                className="w-full px-2 py-1.5 bg-white border border-gazie-navy rounded-lg text-xs"
                              />
                            </div>
                            <div className="space-y-1">
                              <label className="text-[9px] font-bold uppercase text-gazie-navy/60">Model</label>
                              <input
                                type="text"
                                placeholder="Corolla"
                                value={newUserForm.vehicle_model}
                                onChange={e => setNewUserForm({ ...newUserForm, vehicle_model: e.target.value })}
                                className="w-full px-2 py-1.5 bg-white border border-gazie-navy rounded-lg text-xs"
                              />
                            </div>
                            <div className="space-y-1">
                              <label className="text-[9px] font-bold uppercase text-gazie-navy/60">Color</label>
                              <input
                                type="text"
                                placeholder="Silver"
                                value={newUserForm.vehicle_color}
                                onChange={e => setNewUserForm({ ...newUserForm, vehicle_color: e.target.value })}
                                className="w-full px-2 py-1.5 bg-white border border-gazie-navy rounded-lg text-xs"
                              />
                            </div>
                            <div className="space-y-1">
                              <label className="text-[9px] font-bold uppercase text-gazie-navy/60">Plate No.</label>
                              <input
                                type="text"
                                placeholder="ABC-123-XY"
                                value={newUserForm.vehicle_plate}
                                onChange={e => setNewUserForm({ ...newUserForm, vehicle_plate: e.target.value })}
                                className="w-full px-2 py-1.5 bg-white border border-gazie-navy rounded-lg text-xs font-mono uppercase font-bold"
                              />
                            </div>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            <div className="space-y-1">
                              <label className="text-[9px] font-bold uppercase text-gazie-navy/60">Usual Route</label>
                              <input
                                type="text"
                                list="admin-add-user-routes"
                                placeholder="e.g. Lugbe -> Berger (or Secretariat)"
                                value={newUserForm.usual_route}
                                onChange={e => setNewUserForm({ ...newUserForm, usual_route: e.target.value })}
                                className="w-full px-2 py-1.5 bg-white border border-gazie-navy rounded-lg text-xs"
                              />
                              <datalist id="admin-add-user-routes">
                                {STANDARD_COMMUTE_ROUTES.map(r => (
                                  <option key={r} value={r} />
                                ))}
                              </datalist>
                            </div>
                            <div className="space-y-1">
                              <label className="text-[9px] font-bold uppercase text-gazie-navy/60">Seat Fare (₦)</label>
                              <input
                                type="number"
                                placeholder="1000"
                                value={newUserForm.driver_fare}
                                onChange={e => setNewUserForm({ ...newUserForm, driver_fare: e.target.value })}
                                className="w-full px-2 py-1.5 bg-white border border-gazie-navy rounded-lg text-xs font-mono font-bold"
                              />
                            </div>
                          </div>
                        </div>
                      )}

                      <div className="pt-2 flex justify-end gap-2 border-t border-dashed border-gazie-navy/10">
                        <button
                          type="button"
                          onClick={() => setIsAddUserOpen(false)}
                          className="px-4 py-2 bg-gray-100 text-gazie-navy font-bold rounded-xl text-xs hover:bg-gray-200 transition cursor-pointer"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          disabled={addUserSaving}
                          className="px-5 py-2 bg-[#2D6A4F] text-white font-bold rounded-xl text-xs hover:bg-emerald-900 transition flex items-center gap-1.5 disabled:opacity-50 cursor-pointer shadow-sm"
                        >
                          <Save className="w-3.5 h-3.5" />
                          {addUserSaving ? 'Creating...' : 'Create Profile'}
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}

              {/* 5. COMPREHENSIVE EDIT USER MODAL */}
              {editingUser && (
                <div className="fixed inset-0 bg-gazie-navy/60 backdrop-blur-sm z-[999] flex items-center justify-center p-4">
                  <div className="bg-white border-2 border-gazie-navy w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden animate-fadeIn max-h-[90vh] flex flex-col">
                    {/* Modal Header */}
                    <div className="bg-gazie-navy text-gazie-paper p-4 flex justify-between items-center shrink-0">
                      <div>
                        <span className="font-display font-black text-sm uppercase tracking-wider flex items-center gap-2">
                          <Pencil className="w-4 h-4 text-gazie-yellow" /> Manage User: {editingUser.full_name || 'Profile'}
                        </span>
                        <span className="text-[10px] text-gazie-paper/60 font-mono block">ID: {editingUser.id}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setEditingUser(null)}
                        className="p-1 rounded-lg hover:bg-white/10 transition cursor-pointer"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Modal Body */}
                    <div className="p-5 space-y-4 overflow-y-auto flex-1 text-left">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold uppercase tracking-wider text-gazie-navy/70 block">Role</label>
                          <select
                            value={editRole}
                            onChange={e => setEditRole(e.target.value)}
                            disabled={editingUser.id === currentAdminId}
                            className="w-full px-3 py-2 bg-gazie-paper/20 border border-gazie-navy rounded-xl text-xs font-semibold focus:outline-none cursor-pointer"
                          >
                            <option value="rider">Rider</option>
                            <option value="driver">Driver</option>
                            <option value="admin">Administrator</option>
                          </select>
                        </div>

                        <div className="space-y-1">
                          <label className="text-[10px] font-bold uppercase tracking-wider text-gazie-navy/70 block">Verification Status</label>
                          <select
                            value={editStatus}
                            onChange={e => setEditStatus(e.target.value)}
                            className="w-full px-3 py-2 bg-gazie-paper/20 border border-gazie-navy rounded-xl text-xs font-semibold focus:outline-none cursor-pointer"
                          >
                            <option value="verified">Verified</option>
                            <option value="email_verified">Email Verified</option>
                            <option value="pending_review">Pending Review</option>
                            <option value="rejected">Rejected</option>
                          </select>
                        </div>
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] font-bold uppercase tracking-wider text-gazie-navy/70 block">Emergency Contact (Next of Kin)</label>
                        <input
                          type="text"
                          value={editEmergencyContact}
                          onChange={e => setEditEmergencyContact(e.target.value)}
                          className="w-full px-3 py-2 bg-gazie-paper/20 border border-gazie-navy rounded-xl text-xs font-semibold focus:outline-none focus:border-gazie-yellow"
                        />
                      </div>

                      {/* Driver Attributes */}
                      {editRole === 'driver' && (
                        <div className="p-3.5 bg-gazie-paper/40 border border-gazie-navy/20 rounded-xl space-y-3">
                          <span className="text-[10px] font-bold uppercase text-gazie-navy block tracking-wider">
                            🚗 Vehicle & Route Configuration
                          </span>

                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                            <div className="space-y-1">
                              <label className="text-[9px] font-bold uppercase text-gazie-navy/60">Make</label>
                              <input
                                type="text"
                                value={editVehicleMake}
                                onChange={e => setEditVehicleMake(e.target.value)}
                                className="w-full px-2 py-1.5 bg-white border border-gazie-navy rounded-lg text-xs"
                              />
                            </div>
                            <div className="space-y-1">
                              <label className="text-[9px] font-bold uppercase text-gazie-navy/60">Model</label>
                              <input
                                type="text"
                                value={editVehicleModel}
                                onChange={e => setEditVehicleModel(e.target.value)}
                                className="w-full px-2 py-1.5 bg-white border border-gazie-navy rounded-lg text-xs"
                              />
                            </div>
                            <div className="space-y-1">
                              <label className="text-[9px] font-bold uppercase text-gazie-navy/60">Color</label>
                              <input
                                type="text"
                                value={editVehicleColor}
                                onChange={e => setEditVehicleColor(e.target.value)}
                                className="w-full px-2 py-1.5 bg-white border border-gazie-navy rounded-lg text-xs"
                              />
                            </div>
                            <div className="space-y-1">
                              <label className="text-[9px] font-bold uppercase text-gazie-navy/60">Plate No.</label>
                              <input
                                type="text"
                                value={editVehiclePlate}
                                onChange={e => setEditVehiclePlate(e.target.value)}
                                className="w-full px-2 py-1.5 bg-white border border-gazie-navy rounded-lg text-xs font-mono uppercase font-bold"
                              />
                            </div>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                            <div className="sm:col-span-2 space-y-1">
                              <label className="text-[9px] font-bold uppercase text-gazie-navy/60">Usual Route</label>
                              <input
                                type="text"
                                list="admin-edit-user-routes"
                                placeholder="e.g. Lugbe -> Berger (or Secretariat)"
                                value={editUsualRoute}
                                onChange={e => setEditUsualRoute(e.target.value)}
                                className="w-full px-2 py-1.5 bg-white border border-gazie-navy rounded-lg text-xs"
                              />
                              <datalist id="admin-edit-user-routes">
                                {STANDARD_COMMUTE_ROUTES.map(r => (
                                  <option key={r} value={r} />
                                ))}
                              </datalist>
                            </div>
                            <div className="space-y-1">
                              <label className="text-[9px] font-bold uppercase text-gazie-navy/60">Seat Fare (₦)</label>
                              <input
                                type="number"
                                value={editDriverFare}
                                onChange={e => setEditDriverFare(e.target.value)}
                                className="w-full px-2 py-1.5 bg-white border border-gazie-navy rounded-lg text-xs font-mono font-bold"
                              />
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Uploaded Documents Quick Access */}
                      {(editingUser.id_url || editingUser.proof_of_address_url || editingUser.license_url || editingUser.insurance_url) && (
                        <div className="p-3 bg-gazie-paper/20 border border-gazie-navy/10 rounded-xl space-y-2">
                          <span className="text-[10px] font-bold uppercase text-gazie-navy/70 block">
                            📁 Uploaded KYC Documents
                          </span>
                          <div className="flex flex-wrap gap-2">
                            {editingUser.id_url && (
                              <button
                                type="button"
                                onClick={() => setPreviewFileUrl(editingUser.id_url)}
                                className="bg-white border border-gazie-navy px-2.5 py-1 rounded-lg text-[10px] font-bold text-gazie-navy hover:bg-gazie-navy hover:text-white transition flex items-center gap-1 cursor-pointer"
                              >
                                <Eye className="w-3 h-3" /> View National ID
                              </button>
                            )}
                            {editingUser.proof_of_address_url && (
                              <button
                                type="button"
                                onClick={() => setPreviewFileUrl(editingUser.proof_of_address_url)}
                                className="bg-white border border-gazie-navy px-2.5 py-1 rounded-lg text-[10px] font-bold text-gazie-navy hover:bg-gazie-navy hover:text-white transition flex items-center gap-1 cursor-pointer"
                              >
                                <Eye className="w-3 h-3" /> View Address Proof
                              </button>
                            )}
                            {editingUser.license_url && (
                              <button
                                type="button"
                                onClick={() => setPreviewFileUrl(editingUser.license_url)}
                                className="bg-white border border-gazie-navy px-2.5 py-1 rounded-lg text-[10px] font-bold text-gazie-navy hover:bg-gazie-navy hover:text-white transition flex items-center gap-1 cursor-pointer"
                              >
                                <Eye className="w-3 h-3" /> View Driver License
                              </button>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Modal Action Buttons */}
                      <div className="pt-3 border-t border-dashed border-gazie-navy/10 flex items-center justify-between">
                        {editingUser.id !== currentAdminId ? (
                          <button
                            type="button"
                            onClick={() => setDeleteConfirmUser(editingUser)}
                            className="text-red-700 bg-red-50 hover:bg-red-600 hover:text-white border border-red-200 px-3 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" /> Delete User
                          </button>
                        ) : <div />}

                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => setEditingUser(null)}
                            className="px-4 py-2 bg-gray-100 text-gazie-navy font-bold rounded-xl text-xs hover:bg-gray-200 transition cursor-pointer"
                          >
                            Cancel
                          </button>
                          <button
                            type="button"
                            onClick={handleSaveUser}
                            disabled={editSaving}
                            className="px-5 py-2 bg-gazie-navy text-gazie-paper font-bold rounded-xl text-xs hover:bg-gazie-yellow hover:text-gazie-navy transition flex items-center gap-1.5 disabled:opacity-50 cursor-pointer shadow-sm"
                          >
                            <Save className="w-3.5 h-3.5" />
                            {editSaving ? 'Saving...' : 'Save Changes'}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* 6. DELETE CONFIRMATION MODAL */}
              <ConfirmDialog
                open={!!deleteConfirmUser}
                title="Delete User Account"
                message={`Are you sure you want to permanently delete "${deleteConfirmUser?.full_name || 'this user'}"? All their associated bookings, trip postings, and verification documents will be removed permanently.`}
                confirmLabel={deleteSaving ? "Deleting..." : "Permanently Delete"}
                cancelLabel="Cancel"
                danger={true}
                onConfirm={executeDeleteUser}
                onCancel={() => setDeleteConfirmUser(null)}
              />
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
