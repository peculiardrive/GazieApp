"use client";

import React, { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { uploadDocument } from '@/lib/storage';
import { X, Upload, ShieldCheck, AlertCircle, Loader2, Car, FileText, FileSignature } from 'lucide-react';

interface VerificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: any;
  onSuccess: (updatedProfile: any) => void;
}

export default function VerificationModal({ isOpen, onClose, profile, onSuccess }: VerificationModalProps) {
  const [riderIdFile, setRiderIdFile] = useState<File | null>(null);
  const [addressFile, setAddressFile] = useState<File | null>(null);
  const [driverLicenseFile, setDriverLicenseFile] = useState<File | null>(null);

  // Vehicle states (only shown for drivers if not already set in profile)
  const [vehicleMake, setVehicleMake] = useState(profile?.vehicle_make || '');
  const [vehicleModel, setVehicleModel] = useState(profile?.vehicle_model || '');
  const [vehicleColor, setVehicleColor] = useState(profile?.vehicle_color || '');
  const [vehiclePlate, setVehiclePlate] = useState(profile?.vehicle_plate || '');

  const [uploading, setUploading] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  if (!isOpen) return null;

  const handleUploadAndSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setUploading(true);
    setErrorMessage('');
    setStatusMessage('');

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No user session found. Please log in again.');

      // Check required files
      if (!riderIdFile && !profile?.id_url) {
        throw new Error('Please select your National ID (NIN) document.');
      }
      if (!addressFile && !profile?.proof_of_address_url) {
        throw new Error('Please select a Proof of Address utility bill.');
      }
      if (profile?.role === 'driver') {
        if (!driverLicenseFile && !profile?.license_url) {
          throw new Error("Please select your Driver's Licence.");
        }
        if (!vehicleMake || !vehicleModel || !vehicleColor || !vehiclePlate) {
          throw new Error('Please fill in all vehicle details.');
        }
      }

      let currentIdUrl = profile?.id_url || '';
      let currentProofUrl = profile?.proof_of_address_url || '';
      let currentLicUrl = profile?.license_url || '';

      // Upload files sequentially
      if (riderIdFile) {
        setStatusMessage('Uploading National ID (NIN)...');
        const { url, error: uploadErr } = await uploadDocument(riderIdFile, user.id, 'nin');
        if (uploadErr || !url) throw new Error(uploadErr || 'NIN upload failed');
        currentIdUrl = url;
      }

      if (addressFile) {
        setStatusMessage('Uploading Proof of Address...');
        const { url, error: uploadErr } = await uploadDocument(addressFile, user.id, 'proof_of_address');
        if (uploadErr || !url) throw new Error(uploadErr || 'Proof of address upload failed');
        currentProofUrl = url;
      }

      if (profile?.role === 'driver' && driverLicenseFile) {
        setStatusMessage("Uploading Driver's Licence...");
        const { url, error: uploadErr } = await uploadDocument(driverLicenseFile, user.id, 'driver_license');
        if (uploadErr || !url) throw new Error(uploadErr || 'Licence upload failed');
        currentLicUrl = url;
      }

      // Update database profile
      setStatusMessage('Submitting profile for review...');
      const updateData: any = {
        id_url: currentIdUrl,
        proof_of_address_url: currentProofUrl,
        verification_status: 'pending_review',
        rejection_reason: null
      };

      if (profile?.role === 'driver') {
        updateData.license_url = currentLicUrl;
        updateData.vehicle_make = vehicleMake;
        updateData.vehicle_model = vehicleModel;
        updateData.vehicle_color = vehicleColor;
        updateData.vehicle_plate = vehiclePlate.toUpperCase();
      }

      const { error: dbErr } = await supabase
        .from('profiles')
        .update(updateData)
        .eq('id', user.id);

      if (dbErr) throw dbErr;

      setStatusMessage('Submission successful!');
      
      // Fetch fresh profile metadata
      const { data: freshProfile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      onSuccess(freshProfile);
      setTimeout(() => {
        onClose();
      }, 1500);

    } catch (err: any) {
      setErrorMessage(err.message || 'An error occurred during submission.');
    } finally {
      setUploading(false);
    }
  };

  const getRequiredCount = () => (profile?.role === 'driver' ? 3 : 2);
  const getSelectedCount = () => {
    let count = 0;
    if (riderIdFile || profile?.id_url) count++;
    if (addressFile || profile?.proof_of_address_url) count++;
    if (profile?.role === 'driver' && (driverLicenseFile || profile?.license_url)) count++;
    return count;
  };

  return (
    <div className="fixed inset-0 bg-gazie-navy/50 backdrop-blur-sm z-[999] flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white border-2 border-gazie-navy w-full max-w-md rounded-2xl shadow-xl overflow-hidden animate-fadeIn my-8 text-left">
        
        {/* Header */}
        <div className="bg-gazie-navy text-gazie-paper p-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <FileSignature className="w-5 h-5 text-gazie-yellow" />
            <span className="font-display font-black text-sm uppercase tracking-wider">Verification Required</span>
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
        <form onSubmit={handleUploadAndSubmit} className="p-5 space-y-4 max-h-[80vh] overflow-y-auto">
          
          <div className="text-xs text-gazie-navy/70 leading-relaxed font-semibold">
            Upload your credentials below to unlock ride matchmaking, bookings, and postings. 
            Once submitted, your account will be marked as <span className="text-blue-700 underline">Under Review</span>.
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

          {/* Progress Indicator */}
          <div className="bg-gazie-paper/30 p-3 rounded-xl border border-gazie-navy/10 flex justify-between items-center">
            <span className="text-[10px] font-bold uppercase tracking-wider text-gazie-navy/60">Documents Progress</span>
            <span className="font-mono text-xs bg-gazie-yellow text-gazie-navy px-2 py-0.5 rounded font-black">
              {getSelectedCount()} of {getRequiredCount()}
            </span>
          </div>

          <div className="grid grid-cols-1 gap-3">
            {/* National ID */}
            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase tracking-wider text-gazie-navy/70 block">National ID (NIN Slip/Card)</label>
              <div className="border border-dashed border-gazie-navy/35 rounded-lg p-3 text-center relative hover:bg-gazie-paper/5 transition cursor-pointer">
                <input
                  type="file"
                  accept="image/*,application/pdf"
                  onChange={(e) => setRiderIdFile(e.target.files?.[0] || null)}
                  className="absolute inset-0 opacity-0 cursor-pointer"
                  disabled={uploading}
                />
                <Upload className="w-4 h-4 mx-auto text-gazie-navy/40 mb-1" />
                <span className="text-[10px] font-bold block text-ellipsis overflow-hidden whitespace-nowrap">
                  {riderIdFile ? riderIdFile.name : profile?.id_url ? 'NIN ID Card (Uploaded ✓)' : 'Choose NIN File'}
                </span>
              </div>
            </div>

            {/* Proof of Address */}
            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase tracking-wider text-gazie-navy/70 block">Proof of Address (Utility Bill)</label>
              <div className="border border-dashed border-gazie-navy/35 rounded-lg p-3 text-center relative hover:bg-gazie-paper/5 transition cursor-pointer">
                <input
                  type="file"
                  accept="image/*,application/pdf"
                  onChange={(e) => setAddressFile(e.target.files?.[0] || null)}
                  className="absolute inset-0 opacity-0 cursor-pointer"
                  disabled={uploading}
                />
                <Upload className="w-4 h-4 mx-auto text-gazie-navy/40 mb-1" />
                <span className="text-[10px] font-bold block text-ellipsis overflow-hidden whitespace-nowrap">
                  {addressFile ? addressFile.name : profile?.proof_of_address_url ? 'Utility Bill (Uploaded ✓)' : 'Choose Utility Bill'}
                </span>
              </div>
            </div>

            {/* Driver license */}
            {profile?.role === 'driver' && (
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-gazie-navy/70 block">Driver's Licence</label>
                <div className="border border-dashed border-gazie-navy/35 rounded-lg p-3 text-center relative hover:bg-gazie-paper/5 transition cursor-pointer">
                  <input
                    type="file"
                    accept="image/*,application/pdf"
                    onChange={(e) => setDriverLicenseFile(e.target.files?.[0] || null)}
                    className="absolute inset-0 opacity-0 cursor-pointer"
                    disabled={uploading}
                  />
                  <Upload className="w-4 h-4 mx-auto text-gazie-navy/40 mb-1" />
                  <span className="text-[10px] font-bold block text-ellipsis overflow-hidden whitespace-nowrap">
                    {driverLicenseFile ? driverLicenseFile.name : profile?.license_url ? 'Driver Licence (Uploaded ✓)' : 'Choose Licence File'}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Vehicle Fields (Drivers Only) */}
          {profile?.role === 'driver' && (
            <div className="space-y-3 pt-2 border-t border-dashed border-gazie-navy/15">
              <span className="text-[10px] font-bold text-gazie-navy/50 uppercase tracking-wider block flex items-center gap-1">
                <Car className="w-3.5 h-3.5" /> Vehicle Information
              </span>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[9px] font-bold text-gazie-navy/60 uppercase">Make</label>
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
                  <label className="text-[9px] font-bold text-gazie-navy/60 uppercase">Model</label>
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
                  <label className="text-[9px] font-bold text-gazie-navy/60 uppercase">Color</label>
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
                  <label className="text-[9px] font-bold text-gazie-navy/60 uppercase">Plate Number</label>
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
          )}

          {/* Action button */}
          <button
            type="submit"
            disabled={uploading}
            className="w-full bg-gazie-navy text-gazie-paper font-bold py-2.5 rounded-xl hover:bg-gazie-yellow hover:text-gazie-navy transition-all duration-200 text-xs shadow-sm flex items-center justify-center gap-1.5 disabled:opacity-50 cursor-pointer"
          >
            {uploading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" /> Submitting...
              </>
            ) : (
              'Upload & Submit for Review'
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
