"use client";

import React from 'react';
import Navbar from '@/components/ui/Navbar';
import Link from 'next/link';
import { ArrowLeft, ShieldCheck, Lock, Eye, Database, Server, RefreshCw } from 'lucide-react';

export default function PrivacyPage() {
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
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-[#2D6A4F]/10 text-gazie-green text-[11px] font-bold tracking-wide">
            <ShieldCheck className="w-3.5 h-3.5" /> NDPA 2023 COMPLIANT
          </div>
          <h1 className="font-display font-extrabold text-3xl sm:text-4xl tracking-tight leading-none uppercase">
            Privacy Policy & Data Handling
          </h1>
          <p className="text-xs font-semibold text-gazie-navy/60 font-mono leading-relaxed">
            Gazie Commute Technologies &bull; Effective Date: August 27, 2026
          </p>
        </div>

        {/* Policy Content */}
        <div className="font-sans text-sm text-gazie-navy/85 space-y-8 leading-relaxed">

          {/* Section 1 */}
          <section className="space-y-3">
            <h2 className="font-display font-extrabold text-lg uppercase tracking-tight text-gazie-navy flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-gazie-navy text-white inline-flex items-center justify-center text-xs">1</span>
              Data Controller & Overview
            </h2>
            <p>
              This Privacy Policy explains how <strong>Gazie Commute</strong> (&ldquo;we&rdquo;, &ldquo;our&rdquo;, or &ldquo;us&rdquo;) collects, processes, stores, and safeguards personal data when you use our web application, mobile experiences, and related services, in full compliance with the <strong>Nigeria Data Protection Act (NDPA) 2023</strong> and the <strong>Nigeria Data Protection Regulation (NDPR)</strong>.
            </p>
          </section>

          {/* Section 2 */}
          <section className="space-y-3">
            <h2 className="font-display font-extrabold text-lg uppercase tracking-tight text-gazie-navy flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-gazie-navy text-white inline-flex items-center justify-center text-xs">2</span>
              Information We Collect
            </h2>
            <div className="space-y-3">
              <div className="p-4 bg-white border border-gazie-navy/15 rounded-xl space-y-2">
                <h3 className="font-bold text-gazie-navy text-xs uppercase tracking-wider flex items-center gap-1.5">
                  <Eye className="w-4 h-4 text-gazie-navy" /> 2.1 Identity & Verification Data (KYC)
                </h3>
                <p className="text-xs text-gazie-navy/80">
                  Full name, phone number, email address, National Identification Number (NIN) document, government ID card, proof of residential address utility bill, and emergency contact details.
                </p>
              </div>

              <div className="p-4 bg-white border border-gazie-navy/15 rounded-xl space-y-2">
                <h3 className="font-bold text-gazie-navy text-xs uppercase tracking-wider flex items-center gap-1.5">
                  <Database className="w-4 h-4 text-gazie-navy" /> 2.2 Driver & Vehicle Information
                </h3>
                <p className="text-xs text-gazie-navy/80">
                  Driver&rsquo;s License copy, vehicle make, model, color, registration plate number, and routine route / schedule preferences.
                </p>
              </div>

              <div className="p-4 bg-white border border-gazie-navy/15 rounded-xl space-y-2">
                <h3 className="font-bold text-gazie-navy text-xs uppercase tracking-wider flex items-center gap-1.5">
                  <Lock className="w-4 h-4 text-gazie-navy" /> 2.3 Trip & Transaction Data
                </h3>
                <p className="text-xs text-gazie-navy/80">
                  Pickup and destination landmarks, departure times, match statuses, Paystack payment audit reference tokens, and safety incident logs.
                </p>
              </div>
            </div>
          </section>

          {/* Section 3 */}
          <section className="space-y-3">
            <h2 className="font-display font-extrabold text-lg uppercase tracking-tight text-gazie-navy flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-gazie-navy text-white inline-flex items-center justify-center text-xs">3</span>
              Lawful Basis for Processing
            </h2>
            <p>
              Under Section 25 of the NDPA 2023, we process your personal data under the following legal bases:
            </p>
            <ul className="list-disc pl-5 space-y-1.5 font-medium">
              <li><strong>Performance of Contract:</strong> To verify accounts, match drivers and riders, and deliver scheduled commute services.</li>
              <li><strong>Legal Obligation:</strong> To maintain safety verification records and cooperate with regulatory law enforcement inquiries when legally mandated.</li>
              <li><strong>Consent:</strong> For opt-in notification alerts and personalized preferred route notifications.</li>
              <li><strong>Legitimate Interests:</strong> To detect fraud, resolve safety incidents, and enhance platform security.</li>
            </ul>
          </section>

          {/* Section 4 */}
          <section className="space-y-3">
            <h2 className="font-display font-extrabold text-lg uppercase tracking-tight text-gazie-navy flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-gazie-navy text-white inline-flex items-center justify-center text-xs">4</span>
              How Information is Shared
            </h2>
            <ul className="list-disc pl-5 space-y-2 font-medium">
              <li>
                <strong>Between Matched Commuters:</strong> Once a ride match is unlocked, your first name, verified status, vehicle information, and direct phone contact are shared strictly between the matched driver and passenger to coordinate pickup.
              </li>
              <li>
                <strong>Third-Party Infrastructure Processors:</strong>
                <ul className="list-circle pl-5 mt-1 space-y-1 text-xs text-gazie-navy/80">
                  <li><strong>Supabase Inc.</strong> &mdash; Cloud Database, Authentication, and Encrypted Storage Provider.</li>
                  <li><strong>Paystack Payments Ltd.</strong> &mdash; CBN-licensed payment gateway processing unlock fees. We never store credit card details on our servers.</li>
                  <li><strong>Vercel Inc.</strong> &mdash; Secure hosting and Edge CDN infrastructure.</li>
                </ul>
              </li>
              <li>
                <strong>Zero Data Sale Guarantee:</strong> We do not sell, rent, or trade your personal information to marketing advertisers.
              </li>
            </ul>
          </section>

          {/* Section 5 */}
          <section className="space-y-3">
            <h2 className="font-display font-extrabold text-lg uppercase tracking-tight text-gazie-navy flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-gazie-navy text-white inline-flex items-center justify-center text-xs">5</span>
              Data Retention & Deletion
            </h2>
            <p>
              We retain personal data only for as long as necessary to provide platform services and satisfy legal or safety record-keeping requirements:
            </p>
            <ul className="list-disc pl-5 space-y-1.5 font-medium">
              <li><strong>Active Account Data:</strong> Retained for the lifetime of your active profile.</li>
              <li><strong>Safety & Incident Records:</strong> Retained for a minimum of 24 months for liability and dispute resolution purposes.</li>
              <li><strong>Account Erasure:</strong> You may submit an erasure request at any time to have your profile and unassociated data permanently deleted.</li>
            </ul>
          </section>

          {/* Section 6 */}
          <section className="space-y-3">
            <h2 className="font-display font-extrabold text-lg uppercase tracking-tight text-gazie-navy flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-gazie-navy text-white inline-flex items-center justify-center text-xs">6</span>
              Your Data Subject Rights
            </h2>
            <p>
              As a data subject in Nigeria under the NDPA 2023, you have the right to:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-semibold">
              <div className="p-3 bg-white border border-gazie-navy/15 rounded-xl">
                &bull; Request access to all data held about you
              </div>
              <div className="p-3 bg-white border border-gazie-navy/15 rounded-xl">
                &bull; Correct inaccurate or outdated information
              </div>
              <div className="p-3 bg-white border border-gazie-navy/15 rounded-xl">
                &bull; Request account deletion and erasure
              </div>
              <div className="p-3 bg-white border border-gazie-navy/15 rounded-xl">
                &bull; Withdraw consent for optional communications
              </div>
            </div>
            <p className="text-xs font-semibold pt-1">
              To exercise any of these rights, email our Data Protection contact at <a href="mailto:gaziecommute@gmail.com" className="underline font-bold text-gazie-green">gaziecommute@gmail.com</a>.
            </p>
          </section>

          {/* Section 7 */}
          <section className="space-y-2 border-t border-dashed border-gazie-navy/20 pt-6">
            <h2 className="font-display font-extrabold text-sm uppercase tracking-tight text-gazie-navy">
              Data Protection Officer Contact
            </h2>
            <p className="text-xs font-mono">
              Email: <a href="mailto:gaziecommute@gmail.com" className="underline font-bold text-gazie-green">gaziecommute@gmail.com</a> | WhatsApp: <a href="https://wa.me/2348164737221" target="_blank" rel="noopener noreferrer" className="underline font-bold text-gazie-green">08164737221</a>
            </p>
            <p className="text-[11px] text-gazie-navy/60">
              For complete platform usage rules and cancellation policies, please review our <Link href="/terms" className="underline font-bold text-gazie-navy hover:text-gazie-green">Terms of Service</Link>.
            </p>
          </section>

        </div>
      </main>
    </div>
  );
}
