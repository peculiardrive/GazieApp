"use client";

import React, { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { uploadDocument } from '@/lib/storage';
import { X, ShieldCheck, AlertCircle, Loader2, Car, FileSignature, Upload, ChevronDown, ChevronUp } from 'lucide-react';

interface VerificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: any;
  onSuccess: (updatedProfile: any) => void;
}

export default function VerificationModal({ isOpen, onClose, profile, onSuccess }: VerificationModalProps) {
  // Text-Based Identity Inputs (No File Upload Required)
  const [ninNumber, setNinNumber] = useState(
    profile?.id_url?.startsWith('http') ? '' : (profile?.id_url || '')
  );
  const [licenseNumber, setLicenseNumber] = useState(
    profile?.license_url?.startsWith('http') ? '' : (profile?.license_url || '')
  );

  // Optional Photo Upload Toggle
  const [showOptionalUpload, setShowOptionalUpload] = useState(false);
  const [riderIdFile, setRiderIdFile] = useState<File | null>(null);
  const [driverLicenseFile, setDriverLicenseFile] = useState<File | null>(null);

  // Vehicle states (for drivers)
  const [vehicleMake, setVehicleMake] = useState(profile?.vehicle_make || '');
  const [vehicleModel, setVehicleModel] = useState(profile?.vehicle_model || '');
  const [vehicleColor, setVehicleColor] = useState(profile?.vehicle_color || '');
  const [vehiclePlate, setVehiclePlate] = useState(profile?.vehicle_plate || '');

  const [uploading, setUploading] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  if (!isOpen) return null;

  const handleVerifySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setUploading(true);
    setErrorMessage('');
    setStatusMessage('');

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No active user session found. Please log in again.');

      const cleanNin = ninNumber.replace(/[^0-9]/g, '');

      // Validation
      if (profile?.role === 'driver') {
        if (!cleanNin && !licenseNumber.trim()) {
          throw new Error("Please enter your 11-digit National Identity Number (NIN) or Driver's Licence number.");
        }
        if (cleanNin && cleanNin.length !== 11) {
          throw new Error('NIN must be exactly 11 digits.');
        }
        if (!vehiclePlate.trim()) {
          throw new Error('Please enter your Vehicle Plate Number.');
        }
      } else {
        if (!cleanNin) {
          throw new Error('Please enter your 11-digit National Identity Number (NIN).');
        }
        if (cleanNin.length !== 11) {
          throw new Error('NIN must be exactly 11 digits.');
        }
      }

      let currentIdUrl = cleanNin;
      let currentLicUrl = licenseNumber.trim();

      // Optional file uploads if user selected them
      if (riderIdFile) {
        setStatusMessage('Uploading optional NIN copy...');
        const { url, error: uploadErr } = await uploadDocument(riderIdFile, user.id, 'nin');
        if (!uploadErr && url) currentIdUrl = url;
      }

      if (profile?.role === 'driver' && driverLicenseFile) {
        setStatusMessage("Uploading optional licence copy...");
        const { url, error: uploadErr } = await uploadDocument(driverLicenseFile, user.id, 'driver_license');
        if (!uploadErr && url) currentLicUrl = url;
      }

      // Update database profile
      setStatusMessage('Submitting for NIMC verification review...');
      const updateData: any = {
        id_url: currentIdUrl,
        verification_status: 'pending_review',
        rejection_reason: null
      };

      if (profile?.role === 'driver') {
        updateData.license_url = currentLicUrl;
        updateData.vehicle_make = vehicleMake.trim();
        updateData.vehicle_model = vehicleModel.trim();
        updateData.vehicle_color = vehicleColor.trim();
        updateData.vehicle_plate = vehiclePlate.trim().toUpperCase();
      }

      const { error: dbErr } = await supabase
        .from('profiles')
        .update(updateData)
        .eq('id', user.id);

      if (dbErr) throw dbErr;

      setStatusMessage('Verification submitted! Admin will verify with NIMC.');
      
      // Fetch fresh profile metadata
      const { data: freshProfile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      onSuccess(freshProfile);
      setTimeout(() => {
        onClose();
      }, 1200);

    } catch (err: any) {
      setErrorMessage(err.message || 'An error occurred during verification submission.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-gazie-navy/50 backdrop-blur-sm z-[999] flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white border-2 border-gazie-navy w-full max-w-md rounded-2xl shadow-xl overflow-hidden animate-fadeIn my-8 text-left">
        
        {/* Header */}
        <div className="bg-gazie-navy text-gazie-paper p-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-gazie-yellow" />
            <span className="font-display font-black text-sm uppercase tracking-wider">Fast NIN Verification</span>
          </div>
          <button 
            type="button"
            onClick={onClose} 
            disabled={uploading}
            className="p-1 rounded-lg hover:bg-white/10 text-gazie-paper/80 hover:text-white transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form body */}
        <form onSubmit={handleVerifySubmit} className="p-5 space-y-4 max-h-[80vh] overflow-y-auto">
          
          <div className="bg-gazie-yellow/10 border border-gazie-yellow/30 p-3 rounded-xl text-xs text-gazie-navy/80 leading-relaxed font-semibold">
            🛡️ <span className="font-bold">Zero file uploads needed!</span> Simply enter your 11-digit NIN (National Identification Number). Our team verifies it directly with NIMC.
          </div>

          {errorMessage && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-xs p-3 rounded-xl flex items-start gap-2 font-semibold">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-500 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          {statusMessage && (
            <div className="bg-green-50 border border-gazie-green/20 text-gazie-green text-xs p-3 rounded-xl flex items-center gap-2 font-semibold">
              <Loader2 className="w-4 h-4 animate-spin shrink-0 text-gazie-green" />
              <span>{statusMessage}</span>
            </div>
          )}

          {/* 11-Digit NIN Input */}
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
              className="w-full px-3 py-2.5 bg-gazie-paper/20 border-2 border-gazie-navy rounded-xl text-sm font-mono font-bold tracking-widest text-gazie-navy focus:outline-none focus:border-gazie-yellow placeholder:tracking-normal placeholder:font-sans"
              required={profile?.role !== 'driver' || !licenseNumber}
            />
            <span className="text-[10px] text-gazie-navy/50 font-mono block text-right">
              {ninNumber.length}/11 digits
            </span>
          </div>

          {/* Driver License & Vehicle Fields (Drivers Only) */}
          {profile?.role === 'driver' && (
            <>
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-gazie-navy/70 block">
                  Driver's Licence Number <span className="text-[9px] font-normal lowercase italic">(optional if NIN provided)</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. ABC12345678"
                  value={licenseNumber}
                  onChange={(e) => setLicenseNumber(e.target.value.toUpperCase())}
                  className="w-full px-3 py-2 bg-gazie-paper/20 border border-gazie-navy rounded-xl text-xs font-mono font-bold uppercase focus:outline-none focus:border-gazie-yellow"
                />
              </div>

              <div className="space-y-3 pt-2 border-t border-dashed border-gazie-navy/15">
                <span className="text-[10px] font-bold text-gazie-navy/60 uppercase tracking-wider block flex items-center gap-1">
                  <Car className="w-3.5 h-3.5" /> Vehicle Information
                </span>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[9px] font-bold text-gazie-navy/60 uppercase">Make *</label>
                    <input
                      type="text"
                      value={vehicleMake}
                      onChange={(e) => setVehicleMake(e.target.value)}
                      placeholder="e.g. Toyota"
                      className="w-full px-2.5 py-1.5 bg-gazie-paper/20 border border-gazie-navy rounded-lg text-xs font-semibold"
                      disabled={uploading}
                      required
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] font-bold text-gazie-navy/60 uppercase">Model *</label>
                    <input
                      type="text"
                      value={vehicleModel}
                      onChange={(e) => setVehicleModel(e.target.value)}
                      placeholder="e.g. Corolla"
                      className="w-full px-2.5 py-1.5 bg-gazie-paper/20 border border-gazie-navy rounded-lg text-xs font-semibold"
                      disabled={uploading}
                      required
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] font-bold text-gazie-navy/60 uppercase">Color *</label>
                    <input
                      type="text"
                      value={vehicleColor}
                      onChange={(e) => setVehicleColor(e.target.value)}
                      placeholder="e.g. Silver"
                      className="w-full px-2.5 py-1.5 bg-gazie-paper/20 border border-gazie-navy rounded-lg text-xs font-semibold"
                      disabled={uploading}
                      required
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] font-bold text-gazie-navy/60 uppercase">Plate Number *</label>
                    <input
                      type="text"
                      value={vehiclePlate}
                      onChange={(e) => setVehiclePlate(e.target.value)}
                      placeholder="e.g. ABJ-123AA"
                      className="w-full px-2.5 py-1.5 bg-gazie-paper/20 border border-gazie-navy rounded-lg text-xs font-mono font-bold uppercase"
                      disabled={uploading}
                      required
                    />
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Optional Photo Attachment (Collapsible) */}
          <div className="pt-2 border-t border-dashed border-gazie-navy/15">
            <button
              type="button"
              onClick={() => setShowOptionalUpload(!showOptionalUpload)}
              className="text-[11px] font-bold text-gazie-navy/60 hover:text-gazie-navy flex items-center justify-between w-full py-1 cursor-pointer"
            >
              <span>Have a photo/slip? (Optional upload)</span>
              {showOptionalUpload ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>

            {showOptionalUpload && (
              <div className="mt-2 p-3 bg-gazie-paper/30 border border-gazie-navy/15 rounded-xl space-y-2 text-left">
                <div className="space-y-1">
                  <label className="text-[9px] font-bold text-gazie-navy/60 uppercase block">Attach NIN Slip / ID Photo</label>
                  <input
                    type="file"
                    accept="image/*,application/pdf"
                    onChange={(e) => setRiderIdFile(e.target.files?.[0] || null)}
                    className="text-[10px] w-full file:mr-2 file:py-1 file:px-2 file:rounded file:border-0 file:text-[10px] file:font-bold file:bg-gazie-navy file:text-white cursor-pointer"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Action button */}
          <button
            type="submit"
            disabled={uploading}
            className="w-full bg-gazie-navy text-gazie-paper font-bold py-3 rounded-xl hover:bg-gazie-yellow hover:text-gazie-navy transition-all duration-200 text-xs shadow-sm flex items-center justify-center gap-1.5 disabled:opacity-50 cursor-pointer uppercase tracking-wider font-display"
          >
            {uploading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" /> Verifying...
              </>
            ) : (
              'Submit NIN for Verification'
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
