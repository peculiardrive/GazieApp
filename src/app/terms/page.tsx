"use client";

import React from 'react';
import Navbar from '@/components/ui/Navbar';
import Link from 'next/link';
import { ArrowLeft, ShieldCheck, AlertTriangle, FileText, CheckCircle2 } from 'lucide-react';

export default function TermsPage() {
  return (
    <div className="flex flex-col min-h-screen bg-gazie-paper text-gazie-navy">
      <Navbar />

      <main className="flex-1 max-w-3xl mx-auto w-full px-5 py-10 space-y-8">
        {/* Back Link */}
        <div className="pb-2">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-gazie-navy/60 hover:text-gazie-navy transition hover:underline"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Home
          </Link>
        </div>

        {/* Header Section */}
        <div className="border-b-2 border-dashed border-gazie-navy/15 pb-6 space-y-3">
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-gazie-navy/5 text-gazie-navy text-[11px] font-bold tracking-wide">
            <FileText className="w-3.5 h-3.5" /> LEGAL AGREEMENT
          </div>
          <h1 className="font-display font-extrabold text-3xl sm:text-4xl tracking-tight leading-none uppercase">
            Terms & Conditions of Service
          </h1>
          <p className="text-xs font-semibold text-gazie-navy/60 font-mono leading-relaxed">
            Gazie Commute Technologies &bull; Effective Date: August 27, 2026
          </p>
        </div>

        {/* Terms Content */}
        <div className="font-sans text-sm text-gazie-navy/85 space-y-8 leading-relaxed">

          {/* Section 1 */}
          <section className="space-y-3">
            <h2 className="font-display font-extrabold text-lg uppercase tracking-tight text-gazie-navy flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-gazie-navy text-white inline-flex items-center justify-center text-xs">1</span>
              Platform Description & Role
            </h2>
            <p>
              <strong>Gazie Commute</strong> provides a technology platform connecting verified private car owners (&ldquo;Drivers&rdquo;) and commuters (&ldquo;Riders&rdquo;) travelling along the same route to share scheduled commutes and offset fuel expenses.
            </p>
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-xs font-semibold text-amber-900 flex items-start gap-3">
              <AlertTriangle className="w-4 h-4 text-amber-700 flex-shrink-0 mt-0.5" />
              <span>
                <strong>Important Notice:</strong> Gazie Commute is a technology matchmaking platform, not a transportation carrier, taxi company, or employer. Drivers are independent car owners and not agents or employees of Gazie Commute.
              </span>
            </div>
          </section>

          {/* Section 2 */}
          <section className="space-y-3">
            <h2 className="font-display font-extrabold text-lg uppercase tracking-tight text-gazie-navy flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-gazie-navy text-white inline-flex items-center justify-center text-xs">2</span>
              User Eligibility & KYC Verification
            </h2>
            <ul className="list-disc pl-5 space-y-2 font-medium">
              <li>You must be at least 18 years of age and legally resident in Nigeria to register.</li>
              <li>
                <strong>Rider Verification:</strong> Riders must provide accurate full name, phone number, emergency contact, proof of address, and valid government identification (e.g. NIN, Voter&rsquo;s Card, International Passport).
              </li>
              <li>
                <strong>Driver Verification:</strong> Drivers must provide a valid Federal Road Safety Corps (FRSC) Driver&rsquo;s License, roadworthy vehicle details (Make, Model, Color, Plate Number), and proof of vehicle insurance.
              </li>
              <li>
                Gazie Commute reserves the absolute right to approve, reject, or revoke verification status if documents submitted are invalid, expired, fraudulent, or altered.
              </li>
            </ul>
          </section>

          {/* Section 3 */}
          <section className="space-y-3">
            <h2 className="font-display font-extrabold text-lg uppercase tracking-tight text-gazie-navy flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-gazie-navy text-white inline-flex items-center justify-center text-xs">3</span>
              Fares, Fuel Sharing & Platform Fees
            </h2>
            <ul className="list-disc pl-5 space-y-2 font-medium">
              <li>
                <strong>Driver Fare (Fuel Cost Offset):</strong> Drivers set a reasonable per-seat fare strictly to offset commuting and fuel costs. Fares are settled directly between Rider and Driver (via cash or instant bank transfer) at the start or completion of the trip.
              </li>
              <li>
                <strong>Platform Unlock Fee:</strong> Gazie Commute may charge a nominal match confirmation / unlock fee (e.g. ₦50) processed securely through our authorized payment partner, Paystack.
              </li>
              <li>
                <strong>Refund Policy:</strong> If a match fails due to a full car or a driver cancellation after payment, you may request a platform fee refund or credit by emailing <a href="mailto:gaziecommute@gmail.com" className="underline font-bold text-gazie-green">gaziecommute@gmail.com</a>.
              </li>
            </ul>
          </section>

          {/* Section 4 */}
          <section className="space-y-3">
            <h2 className="font-display font-extrabold text-lg uppercase tracking-tight text-gazie-navy flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-gazie-navy text-white inline-flex items-center justify-center text-xs">4</span>
              Cancellation & Departure Rules
            </h2>
            <ul className="list-disc pl-5 space-y-2 font-medium">
              <li>
                <strong>2-Hour Cancellation Cutoff:</strong> To protect scheduled commuters, matched rides cannot be cancelled within two (2) hours of the scheduled departure time except in documented emergencies.
              </li>
              <li>
                <strong>Punctuality & No-Shows:</strong> Both riders and drivers must arrive at the agreed pickup point at the designated time. Repeated no-shows or chronic lateness will result in account suspension.
              </li>
            </ul>
          </section>

          {/* Section 5 */}
          <section className="space-y-3">
            <h2 className="font-display font-extrabold text-lg uppercase tracking-tight text-gazie-navy flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-gazie-navy text-white inline-flex items-center justify-center text-xs">5</span>
              Safety & Code of Conduct
            </h2>
            <p>
              Every commuter on Gazie Commute must treat others with respect and dignity. The following behaviors constitute immediate grounds for permanent ban:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-semibold">
              <div className="p-3 bg-white border border-gazie-navy/15 rounded-xl flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-gazie-green flex-shrink-0" /> Strict Zero Tolerance for Harassment
              </div>
              <div className="p-3 bg-white border border-gazie-navy/15 rounded-xl flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-gazie-green flex-shrink-0" /> Safe Driving & Obeying Speed Limits
              </div>
              <div className="p-3 bg-white border border-gazie-navy/15 rounded-xl flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-gazie-green flex-shrink-0" /> No Intoxicants / Alcohol / Smoking
              </div>
              <div className="p-3 bg-white border border-gazie-navy/15 rounded-xl flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-gazie-green flex-shrink-0" /> Accurate Reporting of Incidents
              </div>
            </div>
          </section>

          {/* Section 6 */}
          <section className="space-y-3">
            <h2 className="font-display font-extrabold text-lg uppercase tracking-tight text-gazie-navy flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-gazie-navy text-white inline-flex items-center justify-center text-xs">6</span>
              Limitation of Liability
            </h2>
            <p>
              To the maximum extent permitted under Nigerian law, Gazie Commute, its founders, and affiliates are not liable for direct, indirect, incidental, or consequential damages resulting from trips, driver actions, passenger conduct, traffic incidents, mechanical breakdowns, or loss of personal items during transit. Commuters participate voluntarily at their own discretion.
            </p>
          </section>

          {/* Section 7 */}
          <section className="space-y-3">
            <h2 className="font-display font-extrabold text-lg uppercase tracking-tight text-gazie-navy flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-gazie-navy text-white inline-flex items-center justify-center text-xs">7</span>
              Governing Law & Jurisdiction
            </h2>
            <p>
              These Terms and Conditions are governed by and construed in accordance with the laws of the Federal Republic of Nigeria. Any disputes arising from or relating to the use of the platform shall be subject to the exclusive jurisdiction of the courts of the Federal Capital Territory (FCT), Abuja, Nigeria.
            </p>
          </section>

          {/* Section 8 */}
          <section className="space-y-2 border-t border-dashed border-gazie-navy/20 pt-6">
            <h2 className="font-display font-extrabold text-sm uppercase tracking-tight text-gazie-navy">
              Contact & Inquiries
            </h2>
            <p className="text-xs font-mono">
              Email: <a href="mailto:gaziecommute@gmail.com" className="underline font-bold text-gazie-green">gaziecommute@gmail.com</a> | WhatsApp: <a href="https://wa.me/2348164737221" target="_blank" rel="noopener noreferrer" className="underline font-bold text-gazie-green">08164737221</a>
            </p>
          </section>

        </div>
      </main>
    </div>
  );
}
