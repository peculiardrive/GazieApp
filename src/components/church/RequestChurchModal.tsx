"use client";

import React, { useState } from 'react';
import { Church, MapPin, User, Phone, X, CheckCircle2, Sparkles } from 'lucide-react';
import { submitChurchRequest } from '@/lib/churches';

interface RequestChurchModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId?: string;
  onSuccess?: () => void;
}

export default function RequestChurchModal({
  isOpen,
  onClose,
  userId,
  onSuccess
}: RequestChurchModalProps) {
  const [churchName, setChurchName] = useState('');
  const [denomination, setDenomination] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('Abuja');
  const [leaderContact, setLeaderContact] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!churchName.trim()) {
      setErrorMsg('Please enter your church name');
      return;
    }

    setSubmitting(true);
    setErrorMsg(null);

    const res = await submitChurchRequest({
      userId,
      churchName: churchName.trim(),
      denomination: denomination.trim() || undefined,
      address: address.trim() || undefined,
      city: city.trim() || 'Abuja',
      leaderContact: leaderContact.trim() || undefined
    });

    setSubmitting(false);

    if (res.success) {
      setSubmitted(true);
      setTimeout(() => {
        setSubmitted(false);
        setChurchName('');
        setDenomination('');
        setAddress('');
        setLeaderContact('');
        onClose();
        if (onSuccess) onSuccess();
      }, 2000);
    } else {
      setErrorMsg(res.error || 'Failed to submit church request. Please try again.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
      <div className="bg-white border-2 border-gazie-navy rounded-2xl w-full max-w-md overflow-hidden shadow-2xl animate-scaleUp">
        {/* Header */}
        <div className="bg-gazie-navy text-white px-5 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <span className="text-xl">⛪</span>
            <div>
              <h3 className="font-display font-extrabold text-sm uppercase tracking-wider">
                Request to Add Church
              </h3>
              <p className="text-[10px] text-white/70">Connect your parish or fellowship cluster to Gazie Commute</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4 text-left">
          {submitted ? (
            <div className="py-8 text-center space-y-2">
              <div className="w-12 h-12 rounded-full bg-emerald-100 text-[#2D6A4F] mx-auto flex items-center justify-center animate-bounce">
                <CheckCircle2 className="w-7 h-7" />
              </div>
              <h4 className="font-display font-extrabold text-base text-gazie-navy">Request Received!</h4>
              <p className="text-xs text-gazie-navy/70 max-w-xs mx-auto">
                Thank you! Our community admins will review and add your church and neighborhood zones shortly.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-3.5">
              <div className="p-3 bg-[#2D6A4F]/10 border border-[#2D6A4F]/30 rounded-xl text-xs text-gazie-navy/80 space-y-1">
                <div className="font-bold text-[#2D6A4F] flex items-center gap-1 text-[11px] uppercase tracking-wide">
                  <Sparkles className="w-3.5 h-3.5" /> Church Community Onboarding
                </div>
                <p className="text-[10px] leading-relaxed">
                  We verify each church hub to ensure trust and coordinate cell fellowship carpools safely. Tell us about your church:
                </p>
              </div>

              {errorMsg && (
                <div className="p-2.5 bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg font-semibold">
                  {errorMsg}
                </div>
              )}

              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-gazie-navy/70 block">
                  Church / Parish Name *
                </label>
                <div className="relative">
                  <Church className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gazie-navy/40" />
                  <input
                    type="text"
                    required
                    placeholder="e.g. City of David Parish / Dayspring Church"
                    value={churchName}
                    onChange={(e) => setChurchName(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 bg-gazie-paper/30 border border-gazie-navy rounded-xl text-xs focus:outline-none focus:border-gazie-yellow font-semibold text-gazie-navy"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-gazie-navy/70 block">
                    Denomination (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Baptist, Anglican, etc."
                    value={denomination}
                    onChange={(e) => setDenomination(e.target.value)}
                    className="w-full px-3 py-2 bg-gazie-paper/30 border border-gazie-navy rounded-xl text-xs font-semibold text-gazie-navy"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-gazie-navy/70 block">
                    City / State
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Abuja (FCT)"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full px-3 py-2 bg-gazie-paper/30 border border-gazie-navy rounded-xl text-xs font-semibold text-gazie-navy"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-gazie-navy/70 block">
                  Address / Landmark (Optional)
                </label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gazie-navy/40" />
                  <input
                    type="text"
                    placeholder="e.g. Plot 45, Gwarinpa 3rd Avenue"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 bg-gazie-paper/30 border border-gazie-navy rounded-xl text-xs font-semibold text-gazie-navy"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-gazie-navy/70 block">
                  Pastoral / Cell Leader Contact (Optional)
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gazie-navy/40" />
                  <input
                    type="text"
                    placeholder="e.g. 080... or church email"
                    value={leaderContact}
                    onChange={(e) => setLeaderContact(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 bg-gazie-paper/30 border border-gazie-navy rounded-xl text-xs font-semibold text-gazie-navy"
                  />
                </div>
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 py-2 rounded-xl border border-gazie-navy/30 text-xs font-bold text-gazie-navy hover:bg-gazie-paper/50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 py-2 rounded-xl bg-gazie-navy text-white text-xs font-bold border border-gazie-navy hover:bg-gazie-yellow hover:text-gazie-navy transition cursor-pointer disabled:opacity-50"
                >
                  {submitting ? 'Submitting...' : 'Submit Request'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
