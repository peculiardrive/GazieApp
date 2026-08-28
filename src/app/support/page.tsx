"use client";

import React, { useState } from 'react';
import Navbar from '@/components/ui/Navbar';
import Link from 'next/link';
import { ArrowLeft, MessageSquare, Mail, Phone, ShieldAlert, ChevronDown, ChevronUp, HelpCircle, CheckCircle2, Clock } from 'lucide-react';

export default function SupportPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const faqs = [
    {
      q: "How does Gazie Commute work?",
      a: "Gazie Commute connects verified car owners (Drivers) and passengers (Riders) traveling along the same route across Abuja and its residential corridors (such as Airport Road, Kubwa, Gwarinpa, Apo, Lokogoma, Nyanya into Secretariat, CBD, and Wuse). Drivers post their scheduled departure times and empty seats to offset fuel costs, and riders request seats for a trusted, comfortable daily commute."
    },
    {
      q: "How do I pay the driver for fuel sharing?",
      a: "The fare listed on the commute posting is paid directly to the driver at the start or completion of your trip via cash or instant bank transfer. Gazie Commute does not hold or deduct from the driver's fare."
    },
    {
      q: "What is the ₦50 platform unlock fee?",
      a: "To maintain platform security, verify KYC identities, and prevent ghost bookings, a nominal ₦50 unlock fee is processed via Paystack when confirming a match. This unlocks the driver's direct contact and vehicle registration details."
    },
    {
      q: "What if my ride is cancelled or full after payment?",
      a: "If a ride posting fills up or is cancelled by the driver after you unlock, our system automatically logs the incident. You can contact support on WhatsApp or email us at gaziecommute@gmail.com for an immediate platform fee refund or credit."
    },
    {
      q: "What is the cancellation policy?",
      a: "To ensure reliability for scheduled commuters, matches cannot be cancelled within 2 hours of the scheduled departure time except in emergency situations. Repeated last-minute cancellations or no-shows may lead to account suspension."
    },
    {
      q: "How is commuter safety verified?",
      a: "Every commuter on Gazie Commute goes through KYC verification: Government ID/NIN verification, proof of address, driver's license inspection, vehicle roadworthiness checks, and emergency contact logging."
    }
  ];

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

        {/* Header */}
        <div className="border-b-2 border-dashed border-gazie-navy/15 pb-6 space-y-3">
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-[#2D6A4F]/10 text-gazie-green text-[11px] font-bold tracking-wide">
            <HelpCircle className="w-3.5 h-3.5" /> 24/7 COMMUTER SUPPORT
          </div>
          <h1 className="font-display font-extrabold text-3xl sm:text-4xl tracking-tight leading-none uppercase">
            Help & Customer Support Center
          </h1>
          <p className="text-xs font-semibold text-gazie-navy/60 font-mono leading-relaxed">
            Need help with a ride, verification, or payment? We&rsquo;re here for you.
          </p>
        </div>

        {/* Quick Contact Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* WhatsApp Support */}
          <a
            href="https://wa.me/2348164737221?text=Hello%20Gazie%20Support%2C%20I%20need%20assistance%20with%20my%20account"
            target="_blank"
            rel="noopener noreferrer"
            className="p-5 bg-white border-2 border-gazie-navy rounded-2xl flex flex-col justify-between space-y-3 shadow-sm hover:shadow-md hover:-translate-y-1 transition duration-200"
          >
            <div className="w-10 h-10 rounded-xl bg-[#2D6A4F]/10 text-gazie-green flex items-center justify-center font-bold">
              <MessageSquare className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-gazie-navy">WhatsApp Chat</h3>
              <p className="text-[11px] text-gazie-navy/70 mt-0.5">Fastest response for active trip coordination.</p>
            </div>
            <span className="text-xs font-bold text-gazie-green inline-flex items-center gap-1">
              Chat on WhatsApp &rarr;
            </span>
          </a>

          {/* Email Support */}
          <a
            href="mailto:gaziecommute@gmail.com"
            className="p-5 bg-white border-2 border-gazie-navy rounded-2xl flex flex-col justify-between space-y-3 shadow-sm hover:shadow-md hover:-translate-y-1 transition duration-200"
          >
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center font-bold">
              <Mail className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-gazie-navy">Email Support</h3>
              <p className="text-[11px] text-gazie-navy/70 mt-0.5">gaziecommute@gmail.com for account inquiries.</p>
            </div>
            <span className="text-xs font-bold text-blue-700 inline-flex items-center gap-1">
              Send an Email &rarr;
            </span>
          </a>

          {/* Emergency / Safety */}
          <Link
            href="/safety"
            className="p-5 bg-white border-2 border-red-500 rounded-2xl flex flex-col justify-between space-y-3 shadow-sm hover:shadow-md hover:-translate-y-1 transition duration-200"
          >
            <div className="w-10 h-10 rounded-xl bg-red-50 text-red-700 flex items-center justify-center font-bold">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-red-900">Safety & Incidents</h3>
              <p className="text-[11px] text-red-800/80 mt-0.5">File an incident report or report misconduct.</p>
            </div>
            <span className="text-xs font-bold text-red-700 inline-flex items-center gap-1">
              File Report &rarr;
            </span>
          </Link>
        </div>

        {/* Operating Hours Banner */}
        <div className="p-4 bg-gazie-navy text-gazie-paper rounded-2xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <div className="flex items-center gap-3">
            <Clock className="w-5 h-5 text-gazie-yellow flex-shrink-0" />
            <div>
              <h4 className="font-bold text-xs">Pilot Support Hours</h4>
              <p className="text-[11px] text-gazie-paper/80">Monday – Saturday: 06:00 AM – 09:00 PM (WAT)</p>
            </div>
          </div>
          <a
            href="https://wa.me/2348164737221"
            target="_blank"
            rel="noopener noreferrer"
            className="px-3 py-1.5 rounded-xl bg-gazie-yellow text-gazie-navy font-bold text-xs hover:bg-white transition"
          >
            08164737221
          </a>
        </div>

        {/* FAQ Section */}
        <section className="space-y-4 pt-4">
          <div className="space-y-1">
            <h2 className="font-display font-extrabold text-xl uppercase tracking-tight text-gazie-navy">
              Frequently Asked Questions (FAQ)
            </h2>
            <p className="text-xs text-gazie-navy/60 font-semibold">
              Find instant answers to common commuter questions.
            </p>
          </div>

          <div className="space-y-3">
            {faqs.map((faq, idx) => {
              const isOpen = openFaq === idx;
              return (
                <div
                  key={idx}
                  className="bg-white border-2 border-gazie-navy/15 rounded-2xl overflow-hidden transition"
                >
                  <button
                    onClick={() => setOpenFaq(isOpen ? null : idx)}
                    className="w-full p-4 text-left font-bold text-sm text-gazie-navy flex justify-between items-center gap-3 cursor-pointer hover:bg-gazie-paper/30 transition"
                  >
                    <span>{faq.q}</span>
                    {isOpen ? <ChevronUp className="w-4 h-4 text-gazie-navy flex-shrink-0" /> : <ChevronDown className="w-4 h-4 text-gazie-navy/50 flex-shrink-0" />}
                  </button>
                  {isOpen && (
                    <div className="p-4 pt-0 text-xs text-gazie-navy/80 leading-relaxed border-t border-dashed border-gazie-navy/10 mt-1">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>

        {/* Official Corporate Identity Block */}
        <div className="p-4 bg-white border-2 border-gazie-navy/20 rounded-2xl text-xs space-y-1.5 font-mono shadow-sm text-center">
          <p className="font-sans font-bold text-sm text-gazie-navy">Gazie Commute Technologies Ltd.</p>
          <p><strong>CAC Registration / RC Number:</strong> <span className="font-bold text-gazie-navy">RC: 7924018</span></p>
          <p><strong>Registered Address:</strong> Federal Capital Territory (FCT), Abuja, Nigeria</p>
          <p><strong>Official Corporate Email:</strong> <a href="mailto:gaziecommute@gmail.com" className="underline font-bold text-gazie-green">gaziecommute@gmail.com</a></p>
        </div>

      </main>
    </div>
  );
}
