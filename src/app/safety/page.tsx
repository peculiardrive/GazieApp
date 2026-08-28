"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { uploadDocument } from '@/lib/storage';
import Navbar from '@/components/ui/Navbar';
import {
  Activity,
  AlertTriangle,
  ArrowLeft,
  BadgeAlert,
  ClipboardList,
  HeartPulse,
  MapPin,
  MessageCircle,
  Phone,
  ShieldAlert,
  Siren,
  Upload,
  UserRound,
} from 'lucide-react';

const emergencyContacts = [
  {
    label: 'Nigeria Police Emergency',
    phone: '112',
    href: 'tel:112',
    note: 'For immediate danger, assault, kidnap threats, robbery, or active crime.',
  },
  {
    label: 'FRSC Road Crash Emergency',
    phone: '122',
    href: 'tel:122',
    note: 'For road crashes, stranded vehicles, blocked routes, or serious traffic incidents.',
  },
  {
    label: 'Gazie Safety Desk',
    phone: '08164737221',
    href: 'https://wa.me/2348164737221',
    note: 'For active trip escalation, commuter support, and admin follow-up.',
  },
];

const emergencyProcedures = [
  {
    title: 'Accident',
    icon: Activity,
    steps: [
      'Move away from traffic only if it is safe.',
      'Call 112 or FRSC 122 for injuries, blocked lanes, fire, or major damage.',
      'Record the trip ID, vehicle plate, location, time, and visible damage.',
      'Do not continue the trip until everyone is safe and authorities clear the scene.',
    ],
  },
  {
    title: 'Threat',
    icon: ShieldAlert,
    steps: [
      'Leave the vehicle or route area if you can do so safely.',
      'Call 112 immediately for violence, robbery, stalking, weapons, or coercion.',
      'Send Gazie the trip ID, live location, suspect details, and vehicle plate.',
      'Do not confront the person; preserve messages, photos, and call logs.',
    ],
  },
  {
    title: 'Medical',
    icon: HeartPulse,
    steps: [
      'Call 112 for breathing difficulty, heavy bleeding, fainting, seizure, or severe pain.',
      'Share the exact pickup/drop-off area or nearest landmark.',
      'Notify the rider/driver emergency contact when safe to do so.',
      'Keep the affected person still unless the location is unsafe.',
    ],
  },
];

const escalationLevels = [
  {
    value: 'level_1',
    label: 'Level 1',
    title: 'Service Issue',
    detail: 'Delay, route confusion, minor disagreement, or vehicle concern.',
  },
  {
    value: 'level_2',
    label: 'Level 2',
    title: 'Urgent Safety',
    detail: 'Threatening behavior, unsafe driving, stranded commuter, or active trip risk.',
  },
  {
    value: 'level_3',
    label: 'Level 3',
    title: 'Emergency',
    detail: 'Accident, injury, assault, robbery, medical crisis, or immediate danger.',
  },
];

export default function SafetyPage() {
  const router = useRouter();
  const [incidentType, setIncidentType] = useState('accident');
  const [severity, setSeverity] = useState('level_2');
  const [tripCode, setTripCode] = useState('');
  const [currentLocation, setCurrentLocation] = useState('');
  const [involvedParty, setInvolvedParty] = useState('');
  const [emergencyContactName, setEmergencyContactName] = useState('');
  const [emergencyContactPhone, setEmergencyContactPhone] = useState('');
  const [immediateActionTaken, setImmediateActionTaken] = useState('');
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

    if (!tripCode.trim()) {
      setError('Please enter the trip ID or ticket code. Use "unknown" if you cannot access it.');
      return;
    }

    if (!currentLocation.trim()) {
      setError('Please enter the current location or nearest landmark.');
      return;
    }

    if (!emergencyContactPhone.trim()) {
      setError('Please enter an emergency contact phone number.');
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
          incident_type: incidentType,
          severity,
          trip_code: tripCode.trim(),
          current_location: currentLocation.trim(),
          involved_party: involvedParty.trim() || null,
          emergency_contact_name: emergencyContactName.trim() || null,
          emergency_contact_phone: emergencyContactPhone.trim(),
          immediate_action_taken: immediateActionTaken.trim() || null,
          description: description.trim(),
          photo_url: photoUrl || null
        });

      if (insertErr) {
        setError(insertErr.message);
      } else {
        setSuccess('Emergency report filed. Gazie administrators can now triage the trip and contact details.');
        setTripCode('');
        setCurrentLocation('');
        setInvolvedParty('');
        setEmergencyContactName('');
        setEmergencyContactPhone('');
        setImmediateActionTaken('');
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

      <main className="flex-1 max-w-5xl mx-auto w-full px-4 py-6 space-y-6">
        {/* Back navigation */}
        <button
          onClick={() => router.push('/dashboard')}
          className="text-xs font-bold text-gazie-navy flex items-center gap-1 hover:underline cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Dashboard
        </button>

        <section className="bg-red-950 text-white border-2 border-red-950 rounded-lg p-4 shadow-sm">
          <div className="grid md:grid-cols-[1.2fr_1fr] gap-4 items-start">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Siren className="w-5 h-5 text-gazie-yellow" />
                <h1 className="font-display font-extrabold text-xl tracking-tight">Emergency Safety Process</h1>
              </div>
              <p className="text-sm text-white/80 leading-relaxed">
                For life-threatening danger, call emergency responders first. Then submit the trip ID and details here so Gazie admins can identify the journey, contact both parties, and preserve the incident record.
              </p>
            </div>
            <div className="grid sm:grid-cols-3 md:grid-cols-1 gap-2">
              {emergencyContacts.map((contact) => (
                <a
                  key={contact.label}
                  href={contact.href}
                  target={contact.href.startsWith('http') ? '_blank' : undefined}
                  rel={contact.href.startsWith('http') ? 'noopener noreferrer' : undefined}
                  className="bg-white text-gazie-navy rounded-lg border border-white/20 p-3 hover:bg-gazie-yellow transition-colors"
                >
                  <span className="flex items-center gap-2 text-xs font-extrabold uppercase">
                    {contact.href.startsWith('tel') ? <Phone className="w-4 h-4" /> : <MessageCircle className="w-4 h-4" />}
                    {contact.label}
                  </span>
                  <span className="block font-mono text-sm font-bold mt-1">{contact.phone}</span>
                  <span className="block text-[10px] text-gazie-navy/70 leading-snug mt-1">{contact.note}</span>
                </a>
              ))}
            </div>
          </div>
        </section>

        <section className="grid md:grid-cols-3 gap-3">
          {emergencyProcedures.map(({ title, icon: Icon, steps }) => (
            <div key={title} className="bg-white border-2 border-gazie-navy rounded-lg p-4 shadow-sm">
              <div className="flex items-center gap-2 mb-3">
                <Icon className="w-5 h-5 text-red-700" />
                <h2 className="font-display font-extrabold text-base tracking-tight">{title}</h2>
              </div>
              <ol className="space-y-2">
                {steps.map((step, index) => (
                  <li key={step} className="grid grid-cols-[24px_1fr] gap-2 text-xs text-gazie-navy/75 leading-relaxed">
                    <span className="w-6 h-6 rounded-full bg-gazie-yellow text-gazie-navy font-mono font-extrabold flex items-center justify-center text-[10px]">
                      {index + 1}
                    </span>
                    <span>{step}</span>
                  </li>
                ))}
              </ol>
            </div>
          ))}
        </section>

        {/* Form Container */}
        <div className="bg-white border-2 border-gazie-navy rounded-lg p-5 shadow-sm space-y-4">
          <div className="border-b border-dashed border-gazie-navy/10 pb-3 flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-red-700" />
            <h2 className="font-display font-extrabold text-lg tracking-tight">File Emergency Report</h2>
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
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-bold uppercase tracking-wider text-gazie-navy/70 block">
                  Emergency Type
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { value: 'accident', label: 'Accident', icon: Activity },
                    { value: 'threat', label: 'Threat', icon: BadgeAlert },
                    { value: 'medical', label: 'Medical', icon: HeartPulse },
                  ].map(({ value, label, icon: Icon }) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() => setIncidentType(value)}
                      className={`h-20 rounded-lg border-2 px-2 text-[10px] font-extrabold uppercase flex flex-col items-center justify-center gap-1 transition-colors ${
                        incidentType === value
                          ? 'bg-red-700 text-white border-red-700'
                          : 'bg-gazie-paper/20 text-gazie-navy border-gazie-navy/20 hover:border-gazie-navy'
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold uppercase tracking-wider text-gazie-navy/70 block">
                  Escalation Level
                </label>
                <select
                  value={severity}
                  onChange={(e) => setSeverity(e.target.value)}
                  className="w-full h-10 px-3 bg-gazie-paper/20 border-2 border-gazie-navy rounded-lg text-xs focus:outline-none focus:border-gazie-yellow font-bold"
                >
                  {escalationLevels.map((level) => (
                    <option key={level.value} value={level.value}>
                      {level.label}: {level.title}
                    </option>
                  ))}
                </select>
                <p className="text-[10px] text-gazie-navy/60 leading-relaxed">
                  {escalationLevels.find((level) => level.value === severity)?.detail}
                </p>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-bold uppercase tracking-wider text-gazie-navy/70 flex items-center gap-1">
                  <ClipboardList className="w-3.5 h-3.5" /> Trip ID or Ticket Code
                </label>
                <input
                  value={tripCode}
                  onChange={(e) => setTripCode(e.target.value)}
                  placeholder="Example: GZ-AB123 or booking ID"
                  className="w-full px-3 py-2 bg-gazie-paper/20 border-2 border-gazie-navy rounded-lg text-xs focus:outline-none focus:border-gazie-yellow font-semibold"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold uppercase tracking-wider text-gazie-navy/70 flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5" /> Current Location
                </label>
                <input
                  value={currentLocation}
                  onChange={(e) => setCurrentLocation(e.target.value)}
                  placeholder="Nearest landmark, estate gate, junction, or route"
                  className="w-full px-3 py-2 bg-gazie-paper/20 border-2 border-gazie-navy rounded-lg text-xs focus:outline-none focus:border-gazie-yellow font-semibold"
                  required
                />
              </div>
            </div>

            <div className="grid md:grid-cols-3 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-bold uppercase tracking-wider text-gazie-navy/70 flex items-center gap-1">
                  <UserRound className="w-3.5 h-3.5" /> Involved Party
                </label>
                <input
                  value={involvedParty}
                  onChange={(e) => setInvolvedParty(e.target.value)}
                  placeholder="Driver/rider name, phone, or vehicle plate"
                  className="w-full px-3 py-2 bg-gazie-paper/20 border-2 border-gazie-navy rounded-lg text-xs focus:outline-none focus:border-gazie-yellow font-semibold"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold uppercase tracking-wider text-gazie-navy/70 block">
                  Emergency Contact Name
                </label>
                <input
                  value={emergencyContactName}
                  onChange={(e) => setEmergencyContactName(e.target.value)}
                  placeholder="Trusted person to notify"
                  className="w-full px-3 py-2 bg-gazie-paper/20 border-2 border-gazie-navy rounded-lg text-xs focus:outline-none focus:border-gazie-yellow font-semibold"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold uppercase tracking-wider text-gazie-navy/70 flex items-center gap-1">
                  <Phone className="w-3.5 h-3.5" /> Emergency Contact Phone
                </label>
                <input
                  value={emergencyContactPhone}
                  onChange={(e) => setEmergencyContactPhone(e.target.value)}
                  placeholder="Phone number"
                  className="w-full px-3 py-2 bg-gazie-paper/20 border-2 border-gazie-navy rounded-lg text-xs focus:outline-none focus:border-gazie-yellow font-semibold"
                  required
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold uppercase tracking-wider text-gazie-navy/70 block">
                Immediate Action Taken
              </label>
              <textarea
                placeholder="Who has been called, where the person is now, whether the trip stopped, and any urgent support needed."
                value={immediateActionTaken}
                onChange={(e) => setImmediateActionTaken(e.target.value)}
                rows={3}
                className="w-full px-3 py-2 bg-gazie-paper/20 border-2 border-gazie-navy rounded-lg text-xs focus:outline-none focus:border-gazie-yellow font-semibold"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold uppercase tracking-wider text-gazie-navy/70 flex items-center gap-1">
                <AlertTriangle className="w-3.5 h-3.5" /> Incident Details
              </label>
              <textarea
                placeholder="Describe what happened, time, direction of travel, injuries or threats, people involved, and any police/medical reference numbers."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={5}
                className="w-full px-3 py-2 bg-gazie-paper/20 border-2 border-gazie-navy rounded-lg text-xs focus:outline-none focus:border-gazie-yellow font-semibold"
                required
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold uppercase tracking-wider text-gazie-navy/70 block">
                Attach Supporting Photo (Optional)
              </label>
              <div className="border-2 border-dashed border-gazie-navy/30 rounded-lg p-4 text-center hover:bg-gazie-paper/10 transition cursor-pointer relative">
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
              className="w-full bg-red-700 hover:bg-red-950 text-white font-bold py-3 rounded-lg border border-red-700 transition-all text-xs shadow-sm cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
            >
              <Siren className="w-4 h-4" />
              {loading ? 'Submitting Report...' : 'File Emergency Report'}
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}
