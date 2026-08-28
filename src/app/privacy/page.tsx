"use client";

import React from 'react';
import Navbar from '@/components/ui/Navbar';
import Link from 'next/link';
import { 
  ArrowLeft, 
  ShieldCheck, 
  Lock, 
  Eye, 
  Database, 
  Globe2, 
  AlertTriangle, 
  FileCheck2, 
  Clock, 
  Building2, 
  CheckCircle2, 
  Scale 
} from 'lucide-react';

export default function PrivacyPage() {
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
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#2D6A4F]/10 text-gazie-green text-[11px] font-bold tracking-wide border border-gazie-green/20">
            <ShieldCheck className="w-4 h-4" /> NIGERIA DATA PROTECTION ACT (NDPA) 2023 COMPLIANT
          </div>
          <h1 className="font-display font-black text-3xl sm:text-4xl tracking-tight leading-none uppercase">
            Privacy Policy & Data Protection Charter
          </h1>
          <p className="text-xs font-semibold text-gazie-navy/60 font-mono leading-relaxed">
            Gazie Commute Technologies Ltd. &bull; Effective Date: August 28, 2026 &bull; Version 2.1
          </p>
        </div>

        {/* Policy Content */}
        <div className="font-sans text-sm text-gazie-navy/85 space-y-9 leading-relaxed">

          {/* Section 1: Overview & Data Controller */}
          <section className="space-y-3">
            <h2 className="font-display font-extrabold text-lg uppercase tracking-tight text-gazie-navy flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-gazie-navy text-white inline-flex items-center justify-center text-xs">1</span>
              Data Controller & Scope
            </h2>
            <p>
              This Privacy Policy describes how <strong>Gazie Commute Technologies Ltd.</strong> (&ldquo;Gazie Commute&rdquo;, &ldquo;we&rdquo;, &ldquo;our&rdquo;, or &ldquo;us&rdquo;) collects, stores, processes, discloses, and protects your personal data when you interact with our web platform, mobile applications, and matchmaking infrastructure.
            </p>
            <p>
              Gazie Commute operates as a designated <strong>Data Controller</strong> in full compliance with the <strong>Nigeria Data Protection Act (NDPA) 2023</strong> and the <strong>Nigeria Data Protection Regulation (NDPR)</strong> overseen by the <strong>Nigeria Data Protection Commission (NDPC)</strong>.
            </p>
          </section>

          {/* Section 2: Information We Collect */}
          <section className="space-y-3">
            <h2 className="font-display font-extrabold text-lg uppercase tracking-tight text-gazie-navy flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-gazie-navy text-white inline-flex items-center justify-center text-xs">2</span>
              Categories of Personal Data Collected
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="p-4 bg-white border-2 border-gazie-navy/15 rounded-2xl space-y-2">
                <h3 className="font-bold text-gazie-navy text-xs uppercase tracking-wider flex items-center gap-1.5">
                  <Eye className="w-4 h-4 text-gazie-navy" /> 2.1 Identity & KYC Data
                </h3>
                <p className="text-xs text-gazie-navy/70 leading-normal">
                  Full name, mobile telephone number, email address, password cryptographic hash, National Identification Number (NIN) document/slip, government ID card, and trusted emergency contact telephone numbers.
                </p>
              </div>

              <div className="p-4 bg-white border-2 border-gazie-navy/15 rounded-2xl space-y-2">
                <h3 className="font-bold text-gazie-navy text-xs uppercase tracking-wider flex items-center gap-1.5">
                  <Database className="w-4 h-4 text-gazie-navy" /> 2.2 Driver & Vehicle Data
                </h3>
                <p className="text-xs text-gazie-navy/70 leading-normal">
                  Driver&rsquo;s Licence copy, vehicle make, model, color, vehicle registration plate number, routine commute corridors, departure time windows, seat fare rates, and driver ratings.
                </p>
              </div>

              <div className="p-4 bg-white border-2 border-gazie-navy/15 rounded-2xl space-y-2">
                <h3 className="font-bold text-gazie-navy text-xs uppercase tracking-wider flex items-center gap-1.5">
                  <Lock className="w-4 h-4 text-gazie-navy" /> 2.3 Trip & Transaction Data
                </h3>
                <p className="text-xs text-gazie-navy/70 leading-normal">
                  Pickup and drop-off hubs, booking timestamps, ride match statuses, Paystack transaction reference tokens, community ratings & reviews, and safety incident logs.
                </p>
              </div>
            </div>
          </section>

          {/* Section 3: Lawful Basis */}
          <section className="space-y-3">
            <h2 className="font-display font-extrabold text-lg uppercase tracking-tight text-gazie-navy flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-gazie-navy text-white inline-flex items-center justify-center text-xs">3</span>
              Lawful Bases for Processing
            </h2>
            <p>
              Pursuant to <strong>Section 25 of the NDPA 2023</strong>, we only process personal data when an authorized legal basis applies:
            </p>
            <ul className="list-disc pl-5 space-y-1.5 font-medium">
              <li><strong>Contractual Necessity:</strong> To authenticate accounts, perform ride matchmaking, facilitate communications between matched commuters, and administer digital transit passes.</li>
              <li><strong>Legal & Regulatory Obligation:</strong> To maintain verifiable driver/commuter safety records and cooperate with statutory regulatory or law enforcement inquiries.</li>
              <li><strong>Consent:</strong> For opt-in commute alerts, WhatsApp notifications, and promotional updates (which can be withdrawn at any time).</li>
              <li><strong>Legitimate Interests:</strong> To prevent fraud, protect commuter physical security, optimize route density, and defend against legal liability.</li>
            </ul>
          </section>

          {/* Section 4: Sharing & Sub-Processors */}
          <section className="space-y-3">
            <h2 className="font-display font-extrabold text-lg uppercase tracking-tight text-gazie-navy flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-gazie-navy text-white inline-flex items-center justify-center text-xs">4</span>
              Data Sharing & Third-Party Sub-Processors
            </h2>
            <ul className="list-disc pl-5 space-y-2 font-medium">
              <li>
                <strong>Between Matched Commuters:</strong> Once a match is confirmed and unlocked, your full name, verification badge, vehicle particulars, and direct telephone contact are shared strictly between the matched driver and passenger to coordinate daily transit.
              </li>
              <li>
                <strong>Authorized Cloud & Payment Infrastructure:</strong>
                <ul className="list-circle pl-5 mt-1.5 space-y-1.5 text-xs text-gazie-navy/80">
                  <li><strong>Supabase Inc.:</strong> SOC2-compliant managed PostgreSQL database, authentication engine, and encrypted document storage.</li>
                  <li><strong>Paystack Payments Ltd.:</strong> CBN-licensed, PCI-DSS Level 1 certified payment gateway for platform fee settlements. We never view or store raw credit/debit card numbers.</li>
                  <li><strong>Vercel Inc.:</strong> High-availability edge compute and CDN deployment network with DDoS mitigation.</li>
                </ul>
              </li>
              <li>
                <strong>Zero Commercial Sale Guarantee:</strong> We do not sell, monetize, rent, or lease personal commuter data to third-party advertisers or data brokers under any circumstances.
              </li>
            </ul>
          </section>

          {/* Section 5: International Data Transfers */}
          <section className="space-y-3 bg-white border-2 border-gazie-navy rounded-2xl p-5 shadow-sm">
            <h2 className="font-display font-extrabold text-lg uppercase tracking-tight text-gazie-navy flex items-center gap-2">
              <Globe2 className="w-5 h-5 text-gazie-navy" />
              5. International & Cross-Border Data Transfers
            </h2>
            <p className="text-xs text-gazie-navy/80 leading-relaxed">
              In accordance with <strong>Sections 41, 42, and 43 of the NDPA 2023</strong> (Cross-Border Transfer of Personal Data), Gazie Commute utilizes world-class international cloud infrastructure (Supabase AWS instances and Vercel Global Edge Network) located in high-security jurisdictions ensuring adequate data protection standards.
            </p>
            <div className="space-y-2 text-xs">
              <h3 className="font-bold text-gazie-navy uppercase tracking-wider">Adequacy Safeguards Employed:</h3>
              <ul className="list-disc pl-5 space-y-1 text-gazie-navy/70">
                <li><strong>Data Processing Agreements (DPAs):</strong> Comprehensive DPAs incorporating Standard Contractual Clauses (SCCs) guaranteeing data protection levels equivalent to the NDPA.</li>
                <li><strong>End-to-End Encryption:</strong> All data transferred internationally is encrypted in transit using <strong>TLS 1.3</strong> and encrypted at rest using <strong>AES-256</strong>.</li>
                <li><strong>Data Minimization:</strong> Data routed through international edge CDNs is limited strictly to encrypted session tokens and encrypted application payloads.</li>
              </ul>
            </div>
          </section>

          {/* Section 6: Security Measures */}
          <section className="space-y-3">
            <h2 className="font-display font-extrabold text-lg uppercase tracking-tight text-gazie-navy flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-gazie-navy text-white inline-flex items-center justify-center text-xs">6</span>
              Technical & Organizational Security Measures
            </h2>
            <p>
              We implement comprehensive enterprise-grade safeguards designed to prevent unauthorized access, alteration, disclosure, or destruction of personal data:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-3.5 bg-white border border-gazie-navy/15 rounded-xl space-y-1">
                <span className="font-bold text-gazie-navy block">🔒 Encryption Standards</span>
                <p className="text-gazie-navy/70">AES-256 bit encryption at rest for all database tables and uploaded KYC documents; TLS 1.3 encryption for all network transmissions.</p>
              </div>
              <div className="p-3.5 bg-white border border-gazie-navy/15 rounded-xl space-y-1">
                <span className="font-bold text-gazie-navy block">🛡️ Row-Level Security (RLS)</span>
                <p className="text-gazie-navy/70">Strict PostgreSQL database policies ensuring users can only read and modify their own records, preventing cross-tenant data leakage.</p>
              </div>
              <div className="p-3.5 bg-white border border-gazie-navy/15 rounded-xl space-y-1">
                <span className="font-bold text-gazie-navy block">🔑 Cryptographic Passwords</span>
                <p className="text-gazie-navy/70">All user credentials are protected with one-way salted Argon2/Bcrypt password hashing algorithms; passwords are never stored in plaintext.</p>
              </div>
              <div className="p-3.5 bg-white border border-gazie-navy/15 rounded-xl space-y-1">
                <span className="font-bold text-gazie-navy block">📑 Isolated Storage Buckets</span>
                <p className="text-gazie-navy/70">KYC verification files (NIN, licences) are stored in dedicated cloud buckets with ephemeral presigned access tokens and restricted admin privileges.</p>
              </div>
            </div>
          </section>

          {/* Section 7: Data Retention Schedule */}
          <section className="space-y-3">
            <h2 className="font-display font-extrabold text-lg uppercase tracking-tight text-gazie-navy flex items-center gap-2">
              <Clock className="w-5 h-5 text-gazie-navy" />
              7. Data Retention & Erasure Schedule
            </h2>
            <p>
              Personal data is retained only for the duration necessary to fulfill the purposes outlined in this Policy, adhering to the following statutory retention schedules:
            </p>
            <div className="overflow-x-auto border-2 border-gazie-navy rounded-2xl bg-white shadow-sm">
              <table className="w-full text-xs text-left">
                <thead className="bg-gazie-navy text-gazie-paper text-[10px] uppercase font-bold tracking-wider">
                  <tr>
                    <th className="p-3">Data Category</th>
                    <th className="p-3">Retention Period</th>
                    <th className="p-3">Statutory Rationale</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gazie-navy/10 font-medium">
                  <tr>
                    <td className="p-3 font-bold">Account Profile & Contact Info</td>
                    <td className="p-3">Duration of active account + 12 months after closure</td>
                    <td className="p-3 text-gazie-navy/70">Account management & post-closure inquiries</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-bold">KYC Documents (NIN, Licences)</td>
                    <td className="p-3">Duration of verified status; purged within 30 days of account deletion</td>
                    <td className="p-3 text-gazie-navy/70">Safety verification & fraud prevention</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-bold">Trip Bookings & Match History</td>
                    <td className="p-3">5 Years</td>
                    <td className="p-3 text-gazie-navy/70">Commercial audit & transit dispute resolution</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-bold">Platform Fee Payment Logs</td>
                    <td className="p-3">6 Years</td>
                    <td className="p-3 text-gazie-navy/70">CBN regulatory financial record-keeping standards</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-bold">Safety Incident Reports</td>
                    <td className="p-3">7 Years</td>
                    <td className="p-3 text-gazie-navy/70">Legal defense, passenger safety & liability claims</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          {/* Section 8: Complete Data Subject Rights */}
          <section className="space-y-3">
            <h2 className="font-display font-extrabold text-lg uppercase tracking-tight text-gazie-navy flex items-center gap-2">
              <Scale className="w-5 h-5 text-gazie-navy" />
              8. Complete Data Subject Rights (NDPA 2023)
            </h2>
            <p>
              Under <strong>Part V of the NDPA 2023</strong>, you are entitled to exercise the following statutory data rights free of charge:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
              <div className="p-3 bg-white border border-gazie-navy/15 rounded-xl space-y-1">
                <span className="font-bold text-gazie-navy block">1. Right of Access</span>
                <p className="text-gazie-navy/70">You have the right to request a complete copy of all personal data held about you.</p>
              </div>
              <div className="p-3 bg-white border border-gazie-navy/15 rounded-xl space-y-1">
                <span className="font-bold text-gazie-navy block">2. Right to Rectification</span>
                <p className="text-gazie-navy/70">You can modify or update inaccurate, incomplete, or outdated profile information via your dashboard or by contacting us.</p>
              </div>
              <div className="p-3 bg-white border border-gazie-navy/15 rounded-xl space-y-1">
                <span className="font-bold text-gazie-navy block">3. Right to Erasure (&ldquo;To Be Forgotten&rdquo;)</span>
                <p className="text-gazie-navy/70">You may request permanent deletion of your profile, verification files, and unassociated data.</p>
              </div>
              <div className="p-3 bg-white border border-gazie-navy/15 rounded-xl space-y-1">
                <span className="font-bold text-gazie-navy block">4. Right to Restrict Processing</span>
                <p className="text-gazie-navy/70">You can request restriction of processing while a dispute regarding data accuracy is being resolved.</p>
              </div>
              <div className="p-3 bg-white border border-gazie-navy/15 rounded-xl space-y-1">
                <span className="font-bold text-gazie-navy block">5. Right to Data Portability</span>
                <p className="text-gazie-navy/70">You have the right to receive your personal data in a structured, commonly used, and machine-readable format (JSON/CSV).</p>
              </div>
              <div className="p-3 bg-white border border-gazie-navy/15 rounded-xl space-y-1">
                <span className="font-bold text-gazie-navy block">6. Right to Object & Withdraw Consent</span>
                <p className="text-gazie-navy/70">You can object to processing based on legitimate interests or withdraw consent for non-essential notifications at any time.</p>
              </div>
            </div>
            <p className="text-xs font-semibold pt-1">
              To exercise any of your data rights, submit a written request to our Data Protection Officer at{' '}
              <a href="mailto:gaziecommute@gmail.com" className="underline font-bold text-gazie-green">
                gaziecommute@gmail.com
              </a>. We will acknowledge and respond to requests within <strong>30 days</strong> as required by law.
            </p>
          </section>

          {/* Section 9: Data Breach Procedure */}
          <section className="space-y-3 bg-red-50/60 border-2 border-red-200 rounded-2xl p-5 shadow-sm">
            <h2 className="font-display font-extrabold text-lg uppercase tracking-tight text-red-900 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-red-700" />
              9. Personal Data Breach Management & Notification Procedure
            </h2>
            <p className="text-xs text-red-950 leading-relaxed">
              In accordance with <strong>Section 40 of the NDPA 2023</strong>, Gazie Commute maintains a comprehensive Incident Response and Data Breach Protocol:
            </p>
            <div className="space-y-2 text-xs text-red-900">
              <div className="p-3 bg-white/80 border border-red-200 rounded-xl space-y-1">
                <span className="font-bold block text-red-950">🚨 72-Hour Statutory Regulatory Notification:</span>
                <p>
                  In the event of a confirmed personal data breach that is likely to result in a risk to the rights and freedoms of commuters, Gazie Commute will formally notify the <strong>Nigeria Data Protection Commission (NDPC) within 72 hours</strong> of becoming aware of the breach.
                </p>
              </div>
              <div className="p-3 bg-white/80 border border-red-200 rounded-xl space-y-1">
                <span className="font-bold block text-red-950">📢 Affected Commuter Notification:</span>
                <p>
                  Where a data breach poses a high risk to affected individuals, we will directly notify affected commuters without undue delay via registered email and platform banners, detailing the nature of the breach, compromised data categories, mitigation actions taken, and recommended precautions (e.g., password reset).
                </p>
              </div>
              <div className="p-3 bg-white/80 border border-red-200 rounded-xl space-y-1">
                <span className="font-bold block text-red-950">🛡️ Containment & Forensic Remediation:</span>
                <p>
                  Immediate technical measures will be enacted to contain the incident, revoke compromised access tokens, patch vulnerabilities, and document comprehensive forensic audit trails for regulatory submission.
                </p>
              </div>
            </div>
          </section>

          {/* Section 10: Complaint Escalation to NDPC */}
          <section className="space-y-3 bg-white border-2 border-gazie-navy rounded-2xl p-5 shadow-sm">
            <h2 className="font-display font-extrabold text-lg uppercase tracking-tight text-gazie-navy flex items-center gap-2">
              <Building2 className="w-5 h-5 text-gazie-navy" />
              10. Regulatory Oversight & Complaint Escalation to NDPC
            </h2>
            <p className="text-xs text-gazie-navy/80 leading-relaxed">
              If you have concerns about how your personal data is handled, we encourage you to contact our Data Protection Officer first so we can promptly address your issue. However, you have the unfettered statutory right under the NDPA 2023 to escalate complaints directly to the national regulatory supervisory authority:
            </p>
            <div className="p-4 bg-gazie-paper/50 border border-gazie-navy/20 rounded-xl space-y-2 text-xs font-mono">
              <span className="font-bold text-gazie-navy block font-sans text-sm">
                Nigeria Data Protection Commission (NDPC)
              </span>
              <p className="text-gazie-navy/80 font-sans">
                <strong>Headquarters Address:</strong> No. 5, Charles de Gaulle Close, Asokoro, Abuja, FCT, Nigeria.
              </p>
              <p className="text-gazie-navy/80 font-sans">
                <strong>Official Email:</strong> <a href="mailto:info@ndpc.gov.ng" className="underline font-bold text-gazie-green">info@ndpc.gov.ng</a> / <a href="mailto:complaints@ndpc.gov.ng" className="underline font-bold text-gazie-green">complaints@ndpc.gov.ng</a>
              </p>
              <p className="text-gazie-navy/80 font-sans">
                <strong>Official Portal:</strong> <a href="https://ndpc.gov.ng" target="_blank" rel="noopener noreferrer" className="underline font-bold text-gazie-green">https://ndpc.gov.ng</a>
              </p>
            </div>
          </section>

          {/* Section 11: Contact DPO & Updates */}
          <section className="space-y-3 border-t-2 border-dashed border-gazie-navy/15 pt-6">
            <h2 className="font-display font-extrabold text-sm uppercase tracking-tight text-gazie-navy">
              11. Contact Our Data Protection Officer (DPO) & Policy Updates
            </h2>
            <p className="text-xs text-gazie-navy/70 leading-relaxed">
              We may update this Privacy Policy periodically to reflect technological improvements, product feature additions, or legislative changes. When material changes occur, we will notify registered commuters via email and dashboard notification prior to the change taking effect.
            </p>
            <div className="p-3.5 bg-white border border-gazie-navy/20 rounded-xl text-xs space-y-1 font-mono">
              <p><strong>Data Protection Officer:</strong> Gazie Commute Legal & Compliance Unit</p>
              <p><strong>Direct Email:</strong> <a href="mailto:gaziecommute@gmail.com" className="underline font-bold text-gazie-green">gaziecommute@gmail.com</a></p>
              <p><strong>Support WhatsApp:</strong> <a href="https://wa.me/2348164737221" target="_blank" rel="noopener noreferrer" className="underline font-bold text-gazie-green">+234 816 473 7221</a></p>
              <p><strong>Operating Base:</strong> Abuja, Federal Capital Territory (FCT), Nigeria</p>
            </div>
            <p className="text-[11px] text-gazie-navy/60 pt-1">
              For platform commute rules, liability exclusions, and driver/passenger conduct standards, please review our{' '}
              <Link href="/terms" className="underline font-bold text-gazie-navy hover:text-gazie-green">
                Terms of Service
              </Link>.
            </p>
          </section>

        </div>
      </main>
    </div>
  );
}
