"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { uploadDocument } from '@/lib/storage';
import Navbar from '@/components/ui/Navbar';
import { AlertCircle, Upload, ShieldAlert, ArrowLeft } from 'lucide-react';

export default function SafetyPage() {
  const router = useRouter();
  const [description, setDescription] = useState('');
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleSubmitReport = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanDesc = description.trim();
    if (!cleanDesc) {
      setError('Please provide a description of the incident.');
      return;
    }

    if (cleanDesc.length > 2000) {
      setError('Incident description must not exceed 2000 characters.');
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/login');
        return;
      }

      // Handle optional photo upload
      let photoUrl = '';
      if (photoFile) {
        const { url, error: uploadErr } = await uploadDocument(photoFile, user.id, 'incident');
        if (uploadErr || !url) throw new Error(uploadErr || 'Photo upload failed');
        photoUrl = url;
      }

      // Save report
      const { error: insertErr } = await supabase
        .from('incidents')
        .insert({
          reporter_id: user.id,
          description: description.trim(),
          photo_url: photoUrl || null
        });

      if (insertErr) {
        setError(insertErr.message);
      } else {
        setSuccess('Incident report filed successfully. The administrators have been notified.');
        setDescription('');
        setPhotoFile(null);
        setTimeout(() => {
          router.push('/dashboard');
        }, 2000);
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred while filing the report.');
    } finally {
      setLoading(false);
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

        {/* Form Container */}
        <div className="bg-white border-2 border-gazie-navy rounded-2xl p-5 shadow-sm space-y-4">
          <div className="border-b border-dashed border-gazie-navy/10 pb-3 flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-red-700" />
            <h2 className="font-display font-extrabold text-lg tracking-tight">Report Safety Incident</h2>
          </div>

          <p className="text-xs text-gazie-navy/70 leading-relaxed">
            Use this form to report route disruptions, vehicular faults, behavior issues, or delays during your matched commutes. This report goes directly to the platform administrators for review.
          </p>

          <div className="flex flex-col sm:flex-row items-center gap-3 bg-red-50/50 p-3 rounded-xl border border-red-100 text-xs">
            <span className="font-bold text-red-950">Need immediate support?</span>
            <a 
              href="https://wa.me/2348164737221" 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#2D6A4F] text-white font-bold text-[10px] hover:opacity-90 transition-all shadow-sm cursor-pointer"
            >
              💬 Chat on WhatsApp
            </a>
            <span className="hidden sm:inline text-red-900/35">|</span>
            <span className="text-red-950 font-medium">Email: <a href="mailto:gaziecommute@gmail.com" className="underline font-bold">gaziecommute@gmail.com</a></span>
          </div>

          {error && (
            <div className="bg-red-50 text-red-700 text-xs p-3 rounded-lg border border-red-200 font-semibold">
              {error}
            </div>
          )}

          {success && (
            <div className="bg-green-50 text-gazie-green text-xs p-3 rounded-lg border border-gazie-green/20 font-semibold animate-pulse">
              {success}
            </div>
          )}

          <form onSubmit={handleSubmitReport} className="space-y-4">
            <div className="space-y-1">
              <label className="text-xs font-bold uppercase tracking-wider text-gazie-navy/70 block">
                Describe the Incident
              </label>
              <textarea
                placeholder="Please describe what happened, including route, driver/passenger names if known, time, and specific details."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={5}
                className="w-full px-3 py-2 bg-gazie-paper/20 border-2 border-gazie-navy rounded-xl text-xs focus:outline-none focus:border-gazie-yellow font-semibold"
                required
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold uppercase tracking-wider text-gazie-navy/70 block">
                Attach Supporting Photo (Optional)
              </label>
              <div className="border-2 border-dashed border-gazie-navy/30 rounded-xl p-4 text-center hover:bg-gazie-paper/10 transition cursor-pointer relative">
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setPhotoFile(e.target.files?.[0] || null)}
                  className="absolute inset-0 opacity-0 cursor-pointer"
                />
                <Upload className="w-5 h-5 mx-auto text-gazie-navy/40 mb-1.5" />
                <span className="text-xs font-bold block text-gazie-navy">
                  {photoFile ? photoFile.name : 'Choose incident picture'}
                </span>
                <span className="text-[10px] text-gazie-navy/60 block mt-0.5">Image file (Max 5MB)</span>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-red-700 hover:bg-red-950 text-white font-bold py-2.5 rounded-xl border border-red-700 transition-all text-xs shadow-sm cursor-pointer disabled:opacity-50"
            >
              {loading ? 'Submitting Report...' : 'File Safety Report'}
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}
