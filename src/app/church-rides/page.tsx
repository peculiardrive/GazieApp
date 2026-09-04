"use client";

import React, { useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

function ChurchRidesRedirect() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const church = searchParams.get('church');
    if (church) {
      router.replace(`/dashboard/rider?community=${encodeURIComponent(church)}`);
    } else {
      router.replace('/dashboard/rider?community=church');
    }
  }, [router, searchParams]);

  return (
    <div className="flex min-h-screen bg-gazie-paper items-center justify-center text-gazie-navy">
      <div className="text-center space-y-3">
        <div className="w-10 h-10 border-4 border-gazie-yellow border-t-gazie-navy rounded-full animate-spin mx-auto" />
        <p className="font-display font-bold text-xs uppercase tracking-wider">
          Redirecting to Commute Feed...
        </p>
      </div>
    </div>
  );
}

export default function ChurchRidesPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gazie-paper" />}>
      <ChurchRidesRedirect />
    </Suspense>
  );
}
