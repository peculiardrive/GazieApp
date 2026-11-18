import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import Navbar from '@/components/ui/Navbar';
import CommuteJourneyAnimation from '@/components/CommuteJourneyAnimation';

export default function HowItWorksPage() {
  return (
    <div className="flex h-dvh flex-col overflow-hidden bg-gazie-paper text-gazie-navy">
      <Navbar />
      <main className="mx-auto flex min-h-0 w-full max-w-5xl flex-1 flex-col px-3 py-2 sm:px-6">
        <div className="flex h-10 shrink-0 items-center gap-2">
          <Link
            href="/"
            aria-label="Back to home"
            className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-gazie-navy transition hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2D6A4F]"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <p className="hidden font-mono text-xs font-bold uppercase tracking-wider text-[#2D6A4F] sm:block">
            How it works
          </p>
          <h1 className="font-display text-xl font-extrabold tracking-tight text-gazie-navy sm:text-2xl">
            Your Route. Shared.
          </h1>
        </div>
        <div className="min-h-0 flex-1">
          <CommuteJourneyAnimation compact />
        </div>
      </main>
    </div>
  );
}
