"use client";

import React from 'react';
import Navbar from '@/components/ui/Navbar';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function PrivacyPage() {
  return (
    <div className="flex flex-col min-h-screen bg-gazie-paper text-gazie-navy">
      <Navbar />

      <main className="flex-1 max-w-2xl mx-auto w-full px-5 py-10 space-y-8">
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
        <div className="border-b-2 border-dashed border-gazie-navy/15 pb-6 space-y-2">
          <h1 className="font-display font-extrabold text-3xl sm:text-4xl tracking-tight leading-none uppercase">
            Privacy Policy & Terms of Use
          </h1>
          <p className="text-sm font-semibold text-gazie-navy/60 font-mono leading-relaxed">
            Gazie Commute Technologies Ltd &mdash; Last updated July 10, 2026
          </p>
        </div>

        {/* Policy Content */}
        <div className="font-sans text-sm text-gazie-navy/85 space-y-6 leading-relaxed">
          
          <section className="space-y-2.5">
            <h2 className="font-display font-extrabold text-lg uppercase tracking-tight text-gazie-navy">
              1. What we collect
            </h2>
            <p>
              To verify riders and drivers, we collect: your name, phone number, 
              National Identification Number (NIN), and (for drivers) driver's licence, vehicle 
              details, and insurance information. We also collect ride request/posting 
              details (routes, times) and, if provided, an emergency contact.
            </p>
          </section>

          <section className="space-y-2.5">
            <h2 className="font-display font-extrabold text-lg uppercase tracking-tight text-gazie-navy">
              2. Why we collect it
            </h2>
            <ul className="list-disc pl-5 space-y-1.5 font-medium">
              <li>To verify your identity before you can use the platform</li>
              <li>To match riders and drivers on shared routes</li>
              <li>To respond to safety incidents or disputes</li>
              <li>
                To improve the service and understand usage patterns (in aggregate, 
                not tied to your identity when shown publicly)
              </li>
            </ul>
          </section>

          <section className="space-y-2.5">
            <h2 className="font-display font-extrabold text-lg uppercase tracking-tight text-gazie-navy">
              3. How we use and share it
            </h2>
            <ul className="list-disc pl-5 space-y-1.5 font-medium">
              <li>
                Your name, vehicle details, and verified status are shared with the 
                specific rider/driver you're matched with, so you can coordinate your 
                trip.
              </li>
              <li>We do not sell your data to third parties.</li>
              <li>
                We do not share your ID documents, phone number, or personal details 
                publicly or with anyone outside a confirmed match.
              </li>
              <li>We may share information if required by law or to protect someone's safety.</li>
            </ul>
          </section>

          <section className="space-y-2.5">
            <h2 className="font-display font-extrabold text-lg uppercase tracking-tight text-gazie-navy">
              4. Your data, your control
            </h2>
            <ul className="list-disc pl-5 space-y-1.5 font-medium">
              <li>You can request a copy of the data we hold about you.</li>
              <li>
                You can request that we delete your account and associated data, 
                except where we're required to retain records (e.g., for safety incident 
                documentation).
              </li>
              <li>Contact us at <a href="mailto:gaziecommute@gmail.com" className="underline font-bold hover:text-gazie-green transition">gaziecommute@gmail.com</a> or via WhatsApp to make either request.</li>
            </ul>
          </section>

          <section className="space-y-2.5">
            <h2 className="font-display font-extrabold text-lg uppercase tracking-tight text-gazie-navy">
              5. Data storage & security
            </h2>
            <p>
              Your data is stored using industry-standard cloud infrastructure 
              (Supabase) with access limited to authorized platform administrators. 
              While we take reasonable steps to protect your information, no system is 
              100% secure, and you share information at your own risk.
            </p>
          </section>

          <section className="space-y-2.5">
            <h2 className="font-display font-extrabold text-lg uppercase tracking-tight text-gazie-navy">
              6. Platform fees
            </h2>
            <p>
              Gazie Commute is currently free to use during this pilot phase. We may 
              introduce a platform fee in the future; if we do, we will communicate 
              this clearly before it takes effect, and it will never apply 
              retroactively to trips already taken.
            </p>
          </section>

          <section className="space-y-2.5">
            <h2 className="font-display font-extrabold text-lg uppercase tracking-tight text-gazie-navy">
              7. Rider and driver responsibility
            </h2>
            <ul className="list-disc pl-5 space-y-1.5 font-medium">
              <li>
                Fares agreed between riders and drivers are paid directly between 
                them; Gazie Commute is not a party to that payment.
              </li>
              <li>
                Users are responsible for verifying that they feel safe and 
                comfortable proceeding with any matched trip, and may decline or cancel 
                at any time.
              </li>
              <li>
                Report any safety concerns or incidents immediately through the in-app 
                incident report feature or via WhatsApp.
              </li>
            </ul>
          </section>

          <section className="space-y-2.5">
            <h2 className="font-display font-extrabold text-lg uppercase tracking-tight text-gazie-navy">
              8. Changes to this policy
            </h2>
            <p>
              We may update this policy as the platform evolves. We'll note the 'last 
              updated' date at the top, and material changes will be communicated to 
              users.
            </p>
          </section>

          <section className="space-y-2.5 pb-4">
            <h2 className="font-display font-extrabold text-lg uppercase tracking-tight text-gazie-navy">
              9. Contact
            </h2>
            <p className="font-mono text-xs font-semibold">
              Questions about this policy: <a href="mailto:gaziecommute@gmail.com" className="underline font-bold hover:text-gazie-green transition">gaziecommute@gmail.com</a> | WhatsApp: <a href="https://wa.me/2348164737221" target="_blank" rel="noopener noreferrer" className="underline font-bold hover:text-gazie-green transition">08164737221</a>
            </p>
          </section>

        </div>
      </main>
    </div>
  );
}
