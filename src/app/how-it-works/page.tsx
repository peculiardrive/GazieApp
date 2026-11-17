import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import Navbar from '@/components/ui/Navbar';
import CommuteJourneyAnimation from '@/components/CommuteJourneyAnimation';

export default function HowItWorksPage() {
  return (
    <div className="flex min-h-screen flex-col bg-gazie-paper text-gazie-navy">
      <Navbar />
      <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col px-4 py-6 sm:px-6 sm:py-10">
        <Link
          href="/"
          className="mb-5 inline-flex min-h-11 w-fit items-center gap-2 rounded-lg px-3 text-sm font-bold text-gazie-navy transition hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2D6A4F]"
        >
          <ArrowLeft className="h-4 w-4" /> Back to home
        </Link>
        <div className="mb-5 max-w-2xl">
          <p className="font-mono text-xs font-bold uppercase tracking-wider text-[#2D6A4F]">
            How it works
          </p>
          <h1 className="mt-1 font-display text-3xl font-extrabold tracking-tight text-gazie-navy sm:text-4xl">
            Your Route. Shared.
          </h1>
          <p className="mt-2 max-w-xl text-sm leading-relaxed text-gazie-navy/75">
            Follow a commute from an available seat to a shared journey with verified neighbours.
          </p>
        </div>
        <CommuteJourneyAnimation />
      </main>
    </div>
  );
}
