"use client";

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { uploadDocument } from '@/lib/storage';
import Navbar from '@/components/ui/Navbar';
import { ShieldCheck, Phone, User, Landmark, Car, HeartHandshake, BadgeAlert, ArrowLeft, Mail, FileText, Upload, ShieldAlert, Award, MapPin } from 'lucide-react';
import { STANDARD_COMMUTE_ROUTES } from '@/lib/routes';

export default function ProfilePage() {
  const router = useRouter();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  // Edit states
  const [fullName, setFullName] = useState('');
  const [emergencyContact, setEmergencyContact] = useState('');
  const [ninNumber, setNinNumber] = useState('');
  const [licenseNumber, setLicenseNumber] = useState('');
  const [vehicleMake, setVehicleMake] = useState('');
  const [vehicleModel, setVehicleModel] = useState('');
  const [vehicleColor, setVehicleColor] = useState('');
  const [vehiclePlate, setVehiclePlate] = useState('');
  const [usualRoute, setUsualRoute] = useState('');
  const [availableTimeWindow, setAvailableTimeWindow] = useState('');
  const [driverFare, setDriverFare] = useState('');

  // Upload states
  const [riderIdFile, setRiderIdFile] = useState<File | null>(null);
  const [addressFile, setAddressFile] = useState<File | null>(null);
  const [driverLicenseFile, setDriverLicenseFile] = useState<File | null>(null);

  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ text: string; isError: boolean } | null>(null);

  useEffect(() => {
    async function loadProfile() {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          router.push('/login');
          return;
        }

        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();

        if (data && !error) {
          setProfile(data);
          setFullName(data.full_name || '');
          setEmergencyContact(data.emergency_contact || '');
          setNinNumber(data.id_url && !data.id_url.startsWith('http') ? data.id_url : '');
          setLicenseNumber(data.license_url && !data.license_url.startsWith('http') ? data.license_url : '');
          setVehicleMake(data.vehicle_make || '');
          setVehicleModel(data.vehicle_model || '');
          setVehicleColor(data.vehicle_color || '');
          setVehiclePlate(data.vehicle_plate || '');
          setUsualRoute(data.usual_route || '');
          setAvailableTimeWindow(data.available_time_window || '');
          setDriverFare(String(data.driver_fare || 0));
        }
      } catch (err) {
        console.error('Error loading profile:', err);
      } finally {
        setLoading(false);
      }
    }
    loadProfile();
  }, [router]);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const cleanNin = ninNumber.replace(/[^0-9]/g, '');
      let currentIdUrl = cleanNin || profile.id_url || '';
      let currentProofUrl = profile.proof_of_address_url || '';
      let currentLicUrl = licenseNumber.trim() || profile.license_url || '';

      // Check if we can submit for review
      const hasNIN = !!(cleanNin || riderIdFile || (currentIdUrl && currentIdUrl.length === 11));
      const hasLicense = profile.role !== 'driver' || !!(licenseNumber.trim() || driverLicenseFile || currentLicUrl);

      // Perform optional file uploads
      if (riderIdFile) {
        setMessage({ text: 'Uploading National ID (NIN)...', isError: false });
        const { url, error: uploadErr } = await uploadDocument(riderIdFile, user.id, 'nin');
        if (uploadErr || !url) throw new Error(uploadErr || 'NIN upload failed');
        currentIdUrl = url;
      }

      if (addressFile) {
        setMessage({ text: 'Uploading Proof of Address...', isError: false });
        const { url, error: uploadErr } = await uploadDocument(addressFile, user.id, 'proof_of_address');
        if (uploadErr || !url) throw new Error(uploadErr || 'Proof of address upload failed');
        currentProofUrl = url;
      }

      if (profile.role === 'driver' && driverLicenseFile) {
        setMessage({ text: "Uploading Driver's Licence...", isError: false });
        const { url, error: uploadErr } = await uploadDocument(driverLicenseFile, user.id, 'driver_license');
        if (uploadErr || !url) throw new Error(uploadErr || 'Licence upload failed');
        currentLicUrl = url;
      }

      const updateData: any = {
        full_name: fullName,
        id_url: currentIdUrl,
        proof_of_address_url: currentProofUrl
      };

      if (profile.role === 'rider') {
        updateData.emergency_contact = emergencyContact;
      } else if (profile.role === 'driver') {
        updateData.license_url = currentLicUrl;
        updateData.vehicle_make = vehicleMake;
        updateData.vehicle_model = vehicleModel;
        updateData.vehicle_color = vehicleColor;
        updateData.vehicle_plate = vehiclePlate.toUpperCase();
        updateData.usual_route = usualRoute;
        updateData.available_time_window = availableTimeWindow;
        updateData.driver_fare = parseFloat(driverFare);
      }

      // If primary ID / NIN is provided, transition to pending_review
      const canSubmitReview = profile.role === 'driver' ? (hasLicense || hasNIN) : hasNIN;
      
      // Only transition to pending_review if they are currently unverified (email_verified or rejected)
      if (canSubmitReview && (profile.verification_status === 'email_verified' || profile.verification_status === 'rejected')) {
        updateData.verification_status = 'pending_review';
        updateData.rejection_reason = null; // Clear rejection reason
      }

      const { error } = await supabase
        .from('profiles')
        .update(updateData)
        .eq('id', user.id);

      if (error) {
        setMessage({ text: error.message, isError: true });
      } else {
        setMessage({ text: 'Profile updated successfully!', isError: false });
        // Refresh local details
        const { data } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();
        setProfile(data);
      }
    } catch (err: any) {
      setMessage({ text: err.message || 'An error occurred during save.', isError: true });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen bg-gazie-paper items-center justify-center text-gazie-navy">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-4 border-gazie-yellow border-t-gazie-navy rounded-full animate-spin mx-auto" />
          <p className="font-display font-bold text-sm">Loading Profile...</p>
        </div>
      </div>
    );
  }

  const getVerificationStatusLabel = () => {
    switch (profile?.verification_status) {
      case 'verified':
        return <span className="bg-[#2D6A4F]/10 text-gazie-green border border-gazie-green/20 px-2 py-0.5 rounded-full text-[10px] font-bold">✓ VERIFIED PROFILE</span>;
      case 'rejected':
        return <span className="bg-red-50 text-red-700 border border-red-200 px-2 py-0.5 rounded-full text-[10px] font-bold">⚠ REJECTED</span>;
      case 'pending_review':
        return <span className="bg-blue-50 text-blue-800 border border-blue-200 px-2 py-0.5 rounded-full text-[10px] font-bold">⌛ UNDER REVIEW</span>;
      case 'email_verified':
        return <span className="bg-gazie-yellow/15 text-amber-800 border border-gazie-yellow/20 px-2 py-0.5 rounded-full text-[10px] font-bold">EMAIL VERIFIED</span>;
      case 'pending_email':
      default:
        return <span className="bg-amber-50 text-amber-700 border border-amber-200 px-2 py-0.5 rounded-full text-[10px] font-bold">PENDING EMAIL</span>;
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-gazie-paper text-gazie-navy">
      <Navbar />

      <main className="flex-1 max-w-lg mx-auto w-full px-4 py-6 space-y-6">
        {/* Back navigation */}
        <button
          onClick={() => router.push('/dashboard')}
          className="text-xs font-bold text-gazie-navy flex items-center gap-1 hover:underline cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Dashboard
        </button>

        {/* Tier Banners */}
        {profile?.verification_status === 'email_verified' && (
          <div className="bg-amber-50 border-2 border-amber-500 rounded-2xl p-4 flex items-start gap-3 text-left">
            <ShieldAlert className="w-5 h-5 text-amber-700 shrink-0 mt-0.5 animate-pulse" />
            <div>
              <span className="font-display font-black text-xs uppercase text-amber-800">Email Verified (Tier 1 Commuter)</span>
              <p className="text-[11px] text-amber-800/80 mt-1 font-semibold leading-relaxed">
                You have read-only access. Complete document verification below to unlock ride requests or postings.
              </p>
            </div>
          </div>
        )}

        {profile?.verification_status === 'pending_review' && (
          <div className="bg-blue-50 border-2 border-blue-500 rounded-2xl p-4 flex items-start gap-3 text-left">
            <FileText className="w-5 h-5 text-blue-700 shrink-0 mt-0.5" />
            <div>
              <span className="font-display font-black text-xs uppercase text-blue-800">Verification Under Review</span>
              <p className="text-[11px] text-blue-800/80 mt-1 font-semibold leading-relaxed">
                Our administrators are reviewing your National ID and address proofs. We will update you shortly!
              </p>
            </div>
          </div>
        )}

        {profile?.verification_status === 'rejected' && (
          <div className="bg-red-50 border-2 border-red-500 rounded-2xl p-4 flex items-start gap-3 text-left">
            <BadgeAlert className="w-5 h-5 text-red-700 shrink-0 mt-0.5" />
            <div>
              <span className="font-display font-black text-xs uppercase text-red-800">Verification Rejected</span>
              <p className="text-[11px] text-red-800/90 mt-1 font-bold leading-relaxed">
                Reason: <span className="underline">{profile.rejection_reason || "Invalid document details"}</span>
              </p>
              <p className="text-[10px] text-red-800/70 mt-1 leading-normal font-medium">
                Please correct your profile fields, choose clean documents, and re-submit below.
              </p>
            </div>
          </div>
        )}

        {profile?.verification_status === 'verified' && (
          <div className="bg-green-50 border-2 border-[#2D6A4F] rounded-2xl p-4 flex items-start gap-3 text-left">
            <ShieldCheck className="w-5 h-5 text-[#2D6A4F] shrink-0 mt-0.5" />
            <div>
              <span className="font-display font-black text-xs uppercase text-[#2D6A4F]">Verified Commuter Profile</span>
              <p className="text-[11px] text-[#2D6A4F]/85 mt-1 font-semibold leading-relaxed">
                Your profile is verified! All ride requests, driver postings, and contact disclosures are fully unlocked.
              </p>
            </div>
          </div>
        )}

        {/* Profile Card Summary */}
        <div className="bg-white border-2 border-gazie-navy rounded-2xl p-5 shadow-sm space-y-4">
          <div className="flex items-center gap-4 border-b border-dashed border-gazie-navy/10 pb-4">
            <div className="w-12 h-12 bg-gazie-navy text-gazie-paper rounded-full flex items-center justify-center font-display font-black text-lg">
              {fullName.charAt(0).toUpperCase()}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-display font-extrabold text-base leading-none">{profile?.full_name}</h2>
                {getVerificationStatusLabel()}
              </div>
              <p className="text-xs font-mono text-gazie-navy/60 mt-1">Phone: {profile?.phone}</p>
              <p className="text-[10px] font-mono font-bold uppercase tracking-wider text-gazie-yellow bg-gazie-navy px-2 py-0.5 rounded-full inline-block mt-1.5">
                ROLE: {profile?.role}
              </p>
            </div>
          </div>

          {message && (
            <div className={`p-3 rounded-lg text-xs font-semibold ${
              message.isError ? 'bg-red-50 text-red-700 border border-red-200' : 'bg-green-50 text-gazie-green border border-gazie-green/20'
            }`}>
              {message.text}
            </div>
          )}

          <form onSubmit={handleSaveProfile} className="space-y-4">
            {/* Common fields */}
            <div className="space-y-1">
              <label className="text-xs font-bold uppercase tracking-wider text-gazie-navy/70 block">Full Name</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gazie-navy/40" />
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-gazie-paper/20 border border-gazie-navy rounded-xl text-xs focus:outline-none focus:border-gazie-yellow font-semibold"
                  disabled={profile?.verification_status === 'pending_review'}
                  required
                />
              </div>
            </div>

            {/* Rider specific */}
            {profile?.role === 'rider' && (
              <div className="space-y-1">
                <label className="text-xs font-bold uppercase tracking-wider text-gazie-navy/70 block">Emergency Contact Phone</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gazie-navy/40" />
                  <input
                    type="tel"
                    value={emergencyContact}
                    onChange={(e) => setEmergencyContact(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 bg-gazie-paper/20 border border-gazie-navy rounded-xl text-xs font-mono focus:outline-none focus:border-gazie-yellow font-semibold"
                    disabled={profile?.verification_status === 'pending_review'}
                    required
                  />
                </div>
              </div>
            )}

            {/* Driver specific */}
            {profile?.role === 'driver' && (
              <div className="space-y-4 pt-2 border-t border-dashed border-gazie-navy/10">
                <span className="text-xs font-bold text-gazie-navy/60 uppercase block tracking-wider">Vehicle Details</span>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-gazie-navy/60 uppercase">Make</label>
                    <input
                      type="text"
                      value={vehicleMake}
                      onChange={(e) => setVehicleMake(e.target.value)}
                      className="w-full px-3 py-2 bg-gazie-paper/20 border border-gazie-navy rounded-lg text-xs font-semibold"
                      disabled={profile?.verification_status === 'pending_review'}
                      required
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-gazie-navy/60 uppercase">Model</label>
                    <input
                      type="text"
                      value={vehicleModel}
                      onChange={(e) => setVehicleModel(e.target.value)}
                      className="w-full px-3 py-2 bg-gazie-paper/20 border border-gazie-navy rounded-lg text-xs font-semibold"
                      disabled={profile?.verification_status === 'pending_review'}
                      required
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-gazie-navy/60 uppercase">Color</label>
                    <input
                      type="text"
                      value={vehicleColor}
                      onChange={(e) => setVehicleColor(e.target.value)}
                      className="w-full px-3 py-2 bg-gazie-paper/20 border border-gazie-navy rounded-lg text-xs font-semibold"
                      placeholder="e.g. Blue"
                      disabled={profile?.verification_status === 'pending_review'}
                      required
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-gazie-navy/60 uppercase">Plate Number</label>
                    <input
                      type="text"
                      value={vehiclePlate}
                      onChange={(e) => setVehiclePlate(e.target.value)}
                      className="w-full px-3 py-2 bg-gazie-paper/20 border border-gazie-navy rounded-lg text-xs font-mono font-bold uppercase"
                      disabled={profile?.verification_status === 'pending_review'}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <div className="flex justify-between items-center">
                    <label className="text-[10px] font-bold text-gazie-navy/70 uppercase">Route Details</label>
                    <span className="text-[9px] text-gazie-navy/50 font-semibold">Select or type custom route</span>
                  </div>
                  <input
                    type="text"
                    list="profile-known-routes"
                    placeholder="e.g. Lugbe -> Berger (or Secretariat, Wuse II)"
                    value={usualRoute}
                    onChange={(e) => setUsualRoute(e.target.value)}
                    className="w-full px-3 py-2 bg-gazie-paper/20 border border-gazie-navy rounded-lg text-xs font-semibold focus:outline-none focus:border-gazie-yellow"
                    disabled={profile?.verification_status === 'pending_review'}
                    required
                  />
                  <datalist id="profile-known-routes">
                    {STANDARD_COMMUTE_ROUTES.map((r) => (
                      <option key={r} value={r} />
                    ))}
                  </datalist>

                  {/* Popular Route Quick Select Pills */}
                  <div className="flex flex-wrap gap-1 pt-1">
                    {['Lugbe -> Berger', 'Lugbe -> Federal Secretariat', 'Lugbe -> Wuse II', 'Lugbe -> Area 10', 'Lugbe -> Banex Plaza', 'Lugbe -> Gudu', 'Lugbe -> Airport / Dunamis'].map((preset) => (
                      <button
                        type="button"
                        key={preset}
                        onClick={() => setUsualRoute(preset)}
                        className={`text-[9px] px-2 py-0.5 rounded-full border transition cursor-pointer ${
                          usualRoute === preset
                            ? 'bg-gazie-navy text-white border-gazie-navy font-bold'
                            : 'bg-white text-gazie-navy/70 border-gazie-navy/20 hover:border-gazie-navy hover:text-gazie-navy'
                        }`}
                      >
                        {preset.replace('Lugbe -> ', '')}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-gazie-navy/70 uppercase">Daily Departure Time Range</label>
                    <input
                      type="text"
                      placeholder="e.g. 06:30 AM - 08:00 AM"
                      value={availableTimeWindow}
                      onChange={(e) => setAvailableTimeWindow(e.target.value)}
                      className="w-full px-3 py-2 bg-gazie-paper/20 border border-gazie-navy rounded-lg text-xs font-semibold"
                      disabled={profile?.verification_status === 'pending_review'}
                      required
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-gazie-navy/60 uppercase">Seat Fare (₦)</label>
                    <input
                      type="number"
                      value={driverFare}
                      onChange={(e) => setDriverFare(e.target.value)}
                      className="w-full px-3 py-2 bg-gazie-paper/20 border border-gazie-navy rounded-lg text-xs font-mono font-bold"
                      min="0"
                      disabled={profile?.verification_status === 'pending_review'}
                      required
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Tier 2 Document Verification Form */}
            {(profile?.verification_status === 'email_verified' || profile?.verification_status === 'rejected') && (
              <div className="space-y-4 pt-4 border-t border-dashed border-gazie-navy/10 text-left">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-gazie-navy/70 uppercase tracking-wider">Fast NIN Verification</span>
                  <span className="font-mono text-[10px] bg-gazie-yellow text-gazie-navy px-2 py-0.5 rounded font-bold uppercase">
                    {ninNumber.length === 11 ? 'NIN Complete ✓' : 'NIN Required'}
                  </span>
                </div>

                <div className="p-3 bg-gazie-yellow/10 border border-gazie-yellow/30 rounded-xl text-xs text-gazie-navy/80 font-semibold">
                  🛡️ <span className="font-bold">Zero file uploads needed!</span> Enter your 11-digit NIN below. Our team verifies it directly with NIMC.
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* 11-Digit NIN */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-gazie-navy/70 block">
                      11-Digit National ID Number (NIN) *
                    </label>
                    <input
                      type="text"
                      inputMode="numeric"
                      maxLength={11}
                      placeholder="e.g. 12345678901"
                      value={ninNumber}
                      onChange={(e) => setNinNumber(e.target.value.replace(/[^0-9]/g, ''))}
                      className="w-full px-3 py-2 bg-gazie-paper/20 border border-gazie-navy rounded-lg text-xs font-mono font-bold tracking-widest text-gazie-navy focus:outline-none focus:border-gazie-yellow placeholder:tracking-normal placeholder:font-sans"
                      required={profile?.role !== 'driver' || !licenseNumber}
                    />
                    <span className="text-[10px] text-gazie-navy/50 font-mono block text-right">
                      {ninNumber.length}/11 digits
                    </span>
                  </div>

                  {/* Driver's Licence Number (Drivers Only) */}
                  {profile?.role === 'driver' && (
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-gazie-navy/70 block">
                        Driver's Licence Number
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. ABC12345678"
                        value={licenseNumber}
                        onChange={(e) => setLicenseNumber(e.target.value.toUpperCase())}
                        className="w-full px-3 py-2 bg-gazie-paper/20 border border-gazie-navy rounded-lg text-xs font-mono font-bold uppercase focus:outline-none focus:border-gazie-yellow"
                      />
                    </div>
                  )}

                  {/* Optional Upload Slip / ID */}
                  <div className="space-y-1 sm:col-span-2">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-gazie-navy/50 block">
                      Attach NIN Slip or ID Photo <span className="text-[9px] font-normal italic lowercase">(optional)</span>
                    </label>
                    <div className="border border-dashed border-gazie-navy/20 rounded-lg p-2.5 text-center relative hover:bg-gazie-paper/5 transition cursor-pointer">
                      <input
                        type="file"
                        accept="image/*,application/pdf"
                        onChange={(e) => setRiderIdFile(e.target.files?.[0] || null)}
                        className="absolute inset-0 opacity-0 cursor-pointer"
                      />
                      <Upload className="w-3.5 h-3.5 mx-auto text-gazie-navy/30 mb-0.5" />
                      <span className="text-[9px] font-semibold block text-ellipsis overflow-hidden whitespace-nowrap text-gazie-navy/60">
                        {riderIdFile ? riderIdFile.name : profile?.id_url?.startsWith('http') ? 'ID Photo (Uploaded ✓)' : 'Optional — Click to attach file'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {profile?.verification_status !== 'pending_review' && (
              <button
                type="submit"
                disabled={saving}
                className="w-full bg-gazie-navy text-gazie-paper font-bold py-2.5 rounded-xl border border-gazie-navy hover:bg-gazie-yellow hover:text-gazie-navy transition-all duration-200 text-xs shadow-sm cursor-pointer disabled:opacity-50"
              >
                {saving ? 'Saving changes...' : 'Save Profile & Submit'}
              </button>
            )}
          </form>

          <div className="border-t border-dashed border-gazie-navy/10 pt-4 flex flex-col items-center gap-3">
            <a 
              href="https://wa.me/2348164737221" 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#2D6A4F] text-white font-bold text-xs hover:opacity-90 transition-all shadow-sm cursor-pointer"
            >
              💬 Chat with us on WhatsApp
            </a>
            <p className="text-xs text-gazie-navy/60">
              Need help? Contact Support Email:{" "}
              <a href="mailto:gaziecommute@gmail.com" className="underline font-bold hover:text-gazie-navy">
                gaziecommute@gmail.com
              </a>
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
