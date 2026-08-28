"use client";

import React from 'react';
import Navbar from '@/components/ui/Navbar';
import Link from 'next/link';
import { ArrowLeft, ShieldCheck, AlertTriangle, FileText, CheckCircle2, Scale, ShieldAlert, HeartHandshake } from 'lucide-react';

export default function TermsPage() {
  return (
    <div className="flex flex-col min-h-screen bg-gazie-paper text-gazie-navy">
      <Navbar />

      <main className="flex-1 max-w-4xl mx-auto w-full px-5 py-10 space-y-8">
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
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gazie-navy/5 text-gazie-navy text-[11px] font-bold tracking-wide border border-gazie-navy/15">
            <FileText className="w-3.5 h-3.5" /> LEGAL TERMS & CONDITIONS OF SERVICE
          </div>
          <h1 className="font-display font-black text-3xl sm:text-4xl tracking-tight leading-none uppercase">
            Terms of Service & Commuter Agreement
          </h1>
          <p className="text-xs font-semibold text-gazie-navy/60 font-mono leading-relaxed">
            Gazie Commute Technologies Ltd. &bull; Effective Date: August 28, 2026 &bull; Version 2.1
          </p>
        </div>

        {/* Terms Content */}
        <div className="font-sans text-sm text-gazie-navy/85 space-y-9 leading-relaxed">

          {/* Section 1 */}
          <section className="space-y-3">
            <h2 className="font-display font-extrabold text-lg uppercase tracking-tight text-gazie-navy flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-gazie-navy text-white inline-flex items-center justify-center text-xs">1</span>
              Platform Role & Purpose
            </h2>
            <p>
              <strong>Gazie Commute Technologies Ltd.</strong> (&ldquo;Gazie Commute&rdquo;, &ldquo;we&rdquo;, or &ldquo;our&rdquo;) provides a software matchmaking platform that connects verified private car owners (&ldquo;Drivers&rdquo;) and fellow commuters (&ldquo;Riders&rdquo;) travelling along the same daily route within Abuja and surrounding corridors to share rides and offset fuel costs.
            </p>
            <div className="bg-amber-50/80 border-2 border-amber-300 rounded-2xl p-4 text-xs font-medium text-amber-950 flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-700 flex-shrink-0 mt-0.5" />
              <div className="space-y-1">
                <span className="font-bold block uppercase tracking-wide text-amber-900">Peer-to-Peer Carpooling Nature</span>
                <p className="leading-relaxed">
                  Gazie Commute operates as a digital matchmaking technology intermediary. Drivers offering empty seats in their personal vehicles are independent private commuters sharing daily travel, not commercial taxi operators, public transport carriers, or employees of Gazie Commute.
                </p>
              </div>
            </div>
          </section>

          {/* Section 2 */}
          <section className="space-y-3">
            <h2 className="font-display font-extrabold text-lg uppercase tracking-tight text-gazie-navy flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-gazie-navy text-white inline-flex items-center justify-center text-xs">2</span>
              User Eligibility, Account Security & Verification
            </h2>
            <ul className="list-disc pl-5 space-y-2 font-medium">
              <li><strong>Age & Capacity:</strong> You must be at least eighteen (18) years of age and legally competent to enter binding agreements in Nigeria.</li>
              <li>
                <strong>Rider Verification (KYC):</strong> Riders must provide accurate legal names, verified telephone numbers, emergency contact details, and a valid National Identification Number (NIN) document/slip.
              </li>
              <li>
                <strong>Driver Verification (KYC):</strong> Drivers must provide a genuine, unexpired Federal Road Safety Corps (FRSC) Driver&rsquo;s Licence (or NIN), roadworthy vehicle particulars (Make, Model, Color, Registration Plate Number), and routine commute corridor information.
              </li>
              <li>
                <strong>Gazie Verification Duty:</strong> Gazie Commute undertakes a duty of reasonable care to verify submitted credentials against established verification standards prior to granting verified account status.
              </li>
            </ul>
          </section>

          {/* Section 3 */}
          <section className="space-y-3">
            <h2 className="font-display font-extrabold text-lg uppercase tracking-tight text-gazie-navy flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-gazie-navy text-white inline-flex items-center justify-center text-xs">3</span>
              Fares, Fuel Cost Offsets & Platform Fees
            </h2>
            <ul className="list-disc pl-5 space-y-2 font-medium">
              <li>
                <strong>Direct Fuel Cost Offset:</strong> Seat fares are established by drivers strictly as non-commercial contributions towards fuel and routine running costs. Fares are paid directly between passenger and car owner (via cash or instant transfer) at pickup or drop-off.
              </li>
              <li>
                <strong>Platform Unlock Fee:</strong> Gazie Commute may charge a nominal match confirmation fee (e.g. ₦50) processed through our CBN-licensed payment partner, Paystack.
              </li>
              <li>
                <strong>Refund Guarantee:</strong> In accordance with Nigerian consumer protection principles, if a paid match fails due to a driver cancellation or unresolvable scheduling discrepancy, the platform fee will be promptly refunded or credited upon request to <a href="mailto:gaziecommute@gmail.com" className="underline font-bold text-gazie-green">gaziecommute@gmail.com</a>.
              </li>
            </ul>
          </section>

          {/* Section 4 */}
          <section className="space-y-3">
            <h2 className="font-display font-extrabold text-lg uppercase tracking-tight text-gazie-navy flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-gazie-navy text-white inline-flex items-center justify-center text-xs">4</span>
              Cancellation & Punctuality Standards
            </h2>
            <ul className="list-disc pl-5 space-y-2 font-medium">
              <li>
                <strong>2-Hour Cancellation Window:</strong> To prevent stranding daily commuters, confirmed ride matches cannot be cancelled within two (2) hours of the agreed departure time except in verified force majeure emergencies.
              </li>
              <li>
                <strong>No-Show & Lateness Policy:</strong> Both parties must arrive at the agreed pickup hub on schedule. Repeated no-shows or chronic unpunctuality will result in verification suspension.
              </li>
            </ul>
          </section>

          {/* Section 5 */}
          <section className="space-y-3">
            <h2 className="font-display font-extrabold text-lg uppercase tracking-tight text-gazie-navy flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-gazie-navy text-white inline-flex items-center justify-center text-xs">5</span>
              Commuter Safety & Code of Conduct
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs font-semibold">
              <div className="p-3 bg-white border border-gazie-navy/15 rounded-xl flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-gazie-green flex-shrink-0" /> Zero Tolerance for Harassment or Discrimination
              </div>
              <div className="p-3 bg-white border border-gazie-navy/15 rounded-xl flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-gazie-green flex-shrink-0" /> Strict Adherence to FRSC Speed Limits & Traffic Laws
              </div>
              <div className="p-3 bg-white border border-gazie-navy/15 rounded-xl flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-gazie-green flex-shrink-0" /> Zero Intoxication, Alcohol, or In-Vehicle Smoking
              </div>
              <div className="p-3 bg-white border border-gazie-navy/15 rounded-xl flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-gazie-green flex-shrink-0" /> Accurate, Timely Safety & Incident Reporting
              </div>
            </div>
          </section>

          {/* Section 6: Legally Compliant Liability Framework */}
          <section className="space-y-4 bg-white border-2 border-gazie-navy rounded-2xl p-6 shadow-sm">
            <div className="border-b border-dashed border-gazie-navy/15 pb-3">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-gazie-navy text-white text-[10px] font-bold uppercase tracking-wider mb-1">
                <Scale className="w-3.5 h-3.5" /> Legal Liability & Consumer Rights Framework
              </div>
              <h2 className="font-display font-black text-xl tracking-tight text-gazie-navy uppercase">
                6. Apportionment of Responsibility & Limitation of Liability
              </h2>
            </div>

            <p className="text-xs font-semibold text-gazie-navy/80">
              This section sets out the precise division of legal responsibility between Gazie Commute, drivers, and riders under Nigerian law:
            </p>

            {/* 6.1 What Gazie is Responsible For */}
            <div className="p-4 bg-green-50/70 border border-gazie-green/30 rounded-xl space-y-2 text-xs">
              <h3 className="font-bold text-gazie-green text-sm flex items-center gap-1.5 uppercase tracking-wide">
                <ShieldCheck className="w-4 h-4 text-gazie-green" />
                6.1 Gazie Commute Responsibilities & Duty of Care
              </h3>
              <p className="text-gazie-navy/80 leading-relaxed">
                Gazie Commute owes a statutory duty of care to its users and <strong>does not exclude or limit liability</strong> where it cannot legally do so under the <strong>Federal Competition and Consumer Protection Act (FCCPA) 2018</strong> or applicable Nigerian laws. Specifically, Gazie Commute remains responsible for:
              </p>
              <ul className="list-disc pl-5 space-y-1 text-gazie-navy/80">
                <li>Direct damages caused by Gazie Commute&rsquo;s own <strong>gross negligence, willful misconduct, or fraud</strong>;</li>
                <li>Failure to exercise reasonable skill and care in the execution of our <strong>identity and credential verification procedures</strong>;</li>
                <li>Security breaches of personal data caused by our failure to maintain technical security safeguards required under the <strong>NDPA 2023</strong>;</li>
                <li>Statutory consumer guarantees that cannot be excluded under the <strong>FCCPA 2018</strong>.</li>
              </ul>
            </div>

            {/* 6.2 Driver & Vehicle Responsibilities */}
            <div className="p-4 bg-gazie-paper/60 border border-gazie-navy/20 rounded-xl space-y-2 text-xs">
              <h3 className="font-bold text-gazie-navy text-sm flex items-center gap-1.5 uppercase tracking-wide">
                <HeartHandshake className="w-4 h-4 text-gazie-navy" />
                6.2 Independent Driver & Car Owner Responsibilities
              </h3>
              <p className="text-gazie-navy/80 leading-relaxed">
                Because private drivers control their own personal vehicles and physical driving decisions, Drivers are solely responsible for:
              </p>
              <ul className="list-disc pl-5 space-y-1 text-gazie-navy/70">
                <li>Safe physical operation of their vehicle in accordance with the National Road Traffic Regulations;</li>
                <li>Maintaining roadworthiness, valid vehicle licences, road-tax documentation, and third-party motor insurance;</li>
                <li>Direct interactions and physical conduct during the commute.</li>
              </ul>
            </div>

            {/* 6.3 Third-Party & Road Risk Disclaimers */}
            <div className="space-y-2 text-xs text-gazie-navy/75 leading-relaxed">
              <h3 className="font-bold text-gazie-navy uppercase tracking-wider text-[11px]">
                6.3 General Road Conditions & Third-Party Events
              </h3>
              <p>
                To the extent permitted by law, Gazie Commute is not liable for damages or losses arising from unforeseeable external events outside our reasonable technological control, including unexpected mechanical vehicle failures of private car owners, unforeseen road accidents caused by third-party motorists, traffic gridlock delays, adverse weather conditions, or loss/theft of personal belongings left unattended in vehicles.
              </p>
            </div>

            {/* 6.4 Statutory Consumer Protection Non-Exclusion */}
            <div className="p-3 bg-gazie-navy/5 border border-gazie-navy/15 rounded-xl text-[11px] font-semibold text-gazie-navy/80 leading-relaxed">
              <strong>Statutory Rights Protected:</strong> Nothing in these Terms of Service operates to exclude, restrict, or modify any statutory consumer right, warranty, or remedy conferred by the <em>Federal Competition and Consumer Protection Act (FCCPA) 2018</em> or the <em>Nigeria Data Protection Act (NDPA) 2023</em> that cannot be lawfully excluded by contract.
            </div>
          </section>

          {/* Section 7 */}
          <section className="space-y-3">
            <h2 className="font-display font-extrabold text-lg uppercase tracking-tight text-gazie-navy flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-gazie-navy text-white inline-flex items-center justify-center text-xs">7</span>
              Dispute Resolution & Governing Law
            </h2>
            <p>
              These Terms shall be governed by and interpreted in accordance with the laws of the <strong>Federal Republic of Nigeria</strong>.
            </p>
            <p>
              In the event of any controversy or dispute between commuters or with the platform, the parties agree to first attempt resolution through good-faith mediation facilitated by Gazie Commute Customer Resolution Unit. If unresolved, disputes shall be submitted to the competent courts of the <strong>Federal Capital Territory (FCT), Abuja, Nigeria</strong>.
            </p>
          </section>

          {/* Section 8 */}
          <section className="space-y-3 border-t-2 border-dashed border-gazie-navy/15 pt-6">
            <h2 className="font-display font-extrabold text-sm uppercase tracking-tight text-gazie-navy">
              8. Contact & Support
            </h2>
            <p className="text-xs text-gazie-navy/70 leading-relaxed">
              If you have any questions regarding these Terms of Service, liability allocations, or consumer rights inquiries, please contact our Legal & Support Team:
            </p>
            <div className="p-3.5 bg-white border border-gazie-navy/20 rounded-xl text-xs space-y-1 font-mono">
              <p><strong>Entity:</strong> Gazie Commute Technologies Ltd.</p>
              <p><strong>Email:</strong> <a href="mailto:gaziecommute@gmail.com" className="underline font-bold text-gazie-green">gaziecommute@gmail.com</a></p>
              <p><strong>Support WhatsApp:</strong> <a href="https://wa.me/2348164737221" target="_blank" rel="noopener noreferrer" className="underline font-bold text-gazie-green">+234 816 473 7221</a></p>
              <p><strong>Jurisdiction:</strong> Abuja, Federal Capital Territory (FCT), Nigeria</p>
            </div>
            <p className="text-[11px] text-gazie-navy/60 pt-1">
              For complete details on our data protection safeguards and NDPA compliance, please review our{' '}
              <Link href="/privacy" className="underline font-bold text-gazie-navy hover:text-gazie-green">
                Privacy Policy
              </Link>.
            </p>
          </section>

        </div>
      </main>
    </div>
  );
}
