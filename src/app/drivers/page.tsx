import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import {
  ArrowRight,
  BadgeCheck,
  CalendarClock,
  Car,
  CircleDollarSign,
  ClipboardCheck,
  Fuel,
  MapPinned,
  MessageCircle,
  ShieldCheck,
  Users,
} from 'lucide-react';
import Navbar from '@/components/ui/Navbar';

export const metadata: Metadata = {
  title: 'Driver Onboarding | Gazie Commute Abuja',
  description:
    'Join Gazie Commute as a verified car owner. Share empty seats on your daily Abuja commute and offset fuel costs with verified neighbors.',
};

const steps = [
  {
    title: 'Register your profile',
    body: 'Create a driver account with your phone number, normal commute route, vehicle details, and preferred departure time.',
    icon: ClipboardCheck,
  },
  {
    title: 'Complete verification',
    body: 'Upload your licence, vehicle particulars, and identity documents so admins can approve your driver profile.',
    icon: BadgeCheck,
  },
  {
    title: 'Post tomorrow route',
    body: 'Choose your pickup area, destination, seats, departure time, and fare before riders start booking.',
    icon: CalendarClock,
  },
  {
    title: 'Drive your normal way',
    body: 'Approved riders join your planned commute and pay you directly by cash or transfer.',
    icon: Car,
  },
];

const driverBenefits = [
  {
    title: 'Offset fuel cost',
    body: 'Put empty seats to work on trips you already make.',
    icon: Fuel,
  },
  {
    title: 'Stay in control',
    body: 'You set your route, time, seats, and fare.',
    icon: CircleDollarSign,
  },
  {
    title: 'Verified riders',
    body: 'Riders submit identity details before they can book.',
    icon: ShieldCheck,
  },
];

const pilotRoutes = [
  'Airport Road / Lugbe to Secretariat & CBD',
  'Kubwa & Gwarinpa to Wuse & Berger',
  'Apo & Lokogoma to Area 11 & Secretariat',
  'Nyanya & Mararaba to Central Area'
];

export default function DriversPage() {
  return (
    <div className="min-h-screen bg-gazie-paper text-gazie-navy">
      <Navbar />

      <main className="mx-auto flex w-full max-w-5xl flex-col gap-10 px-4 py-8 sm:px-6 lg:px-8">
        <section className="grid items-center gap-8 lg:grid-cols-[1.05fr_0.95fr]">
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 rounded-full border-2 border-gazie-navy bg-gazie-yellow px-3 py-1.5 font-mono text-[10px] font-bold uppercase tracking-wider shadow-sm">
              <MapPinned className="h-3.5 w-3.5" />
              Abuja Driver Network
            </div>

            <div className="space-y-4">
              <h1 className="font-display text-4xl font-extrabold leading-tight tracking-tight sm:text-5xl lg:text-6xl">
                Turn your daily commute into shared fuel relief.
              </h1>
              <p className="max-w-xl text-sm font-semibold leading-7 text-gazie-navy/72 sm:text-base">
                Driving across Abuja for work or business? Gazie Commute helps verified car owners share
                empty seats with trusted neighbors while keeping full control of your route, schedule, and fare.
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <Link
                href="/login?role=driver"
                className="inline-flex items-center justify-center gap-2 rounded-xl border-2 border-gazie-navy bg-gazie-navy px-5 py-3 text-sm font-extrabold text-gazie-paper shadow-md transition hover:bg-gazie-yellow hover:text-gazie-navy"
              >
                Start Driver Registration
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/login?role=rider"
                className="inline-flex items-center justify-center gap-2 rounded-xl border-2 border-gazie-navy bg-white px-5 py-3 text-sm font-extrabold text-gazie-navy shadow-sm transition hover:bg-gazie-yellow hover:text-gazie-navy"
              >
                <Users className="h-4 w-4" />
                Rider Registration
              </Link>
            </div>

            <div className="grid grid-cols-3 gap-3 border-t border-dashed border-gazie-navy/20 pt-5 text-center">
              <div>
                <span className="block font-display text-2xl font-extrabold">N50</span>
                <span className="block text-[9px] font-bold uppercase tracking-wider text-gazie-navy/55">
                  Rider unlock fee
                </span>
              </div>
              <div>
                <span className="block font-display text-2xl font-extrabold">4</span>
                <span className="block text-[9px] font-bold uppercase tracking-wider text-gazie-navy/55">
                  Seats you can set
                </span>
              </div>
              <div>
                <span className="block font-display text-2xl font-extrabold">1 day</span>
                <span className="block text-[9px] font-bold uppercase tracking-wider text-gazie-navy/55">
                  Planned bookings
                </span>
              </div>
            </div>
          </div>

          <div className="relative overflow-hidden rounded-2xl border-2 border-gazie-navy bg-white shadow-lg">
            <div className="border-b-2 border-gazie-navy bg-gazie-navy px-4 py-3 text-gazie-paper">
              <span className="font-mono text-xs font-bold uppercase tracking-widest">Driver Route Card</span>
            </div>
            <div className="space-y-5 p-5">
              <div className="flex items-center gap-4 rounded-xl border border-gazie-navy/10 bg-gazie-paper/50 p-4">
                <Image
                  src="/brand/gazie-commute-icon.png"
                  alt="Gazie Commute"
                  width={72}
                  height={72}
                  priority
                  className="h-16 w-16 rounded-xl border border-gazie-navy/15 object-contain"
                />
                <div>
                  <span className="block font-display text-lg font-extrabold">Lugbe Federal Housing</span>
                  <span className="block text-xs font-bold uppercase tracking-wider text-gazie-navy/55">
                    Morning commute posting
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-3 text-sm">
                <div className="mt-1 h-3 w-3 rounded-full border-2 border-gazie-green bg-white" />
                <div>
                  <span className="block text-[10px] font-bold uppercase tracking-wider text-gazie-navy/50">
                    Pickup
                  </span>
                  <span className="font-bold">Lugbe gate or estate pickup point</span>
                </div>
                <div className="mt-1 h-3 w-3 rounded-full border-2 border-gazie-yellow bg-gazie-yellow" />
                <div>
                  <span className="block text-[10px] font-bold uppercase tracking-wider text-gazie-navy/50">
                    Destination
                  </span>
                  <span className="font-bold">CBD, Garki, Wuse, or Airport Road</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-xl border border-dashed border-gazie-navy/20 p-3">
                  <span className="block text-[10px] font-bold uppercase tracking-wider text-gazie-navy/50">
                    Driver sets
                  </span>
                  <span className="font-mono text-sm font-bold">Time, seats, fare</span>
                </div>
                <div className="rounded-xl border border-dashed border-gazie-navy/20 p-3">
                  <span className="block text-[10px] font-bold uppercase tracking-wider text-gazie-navy/50">
                    Rider status
                  </span>
                  <span className="font-mono text-sm font-bold text-gazie-green">Verified only</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-3">
          {driverBenefits.map((benefit) => {
            const Icon = benefit.icon;
            return (
              <article key={benefit.title} className="rounded-xl border border-gazie-navy/15 bg-white p-5 shadow-sm">
                <Icon className="mb-4 h-6 w-6 text-gazie-green" />
                <h2 className="font-display text-base font-extrabold">{benefit.title}</h2>
                <p className="mt-2 text-xs font-semibold leading-6 text-gazie-navy/68">{benefit.body}</p>
              </article>
            );
          })}
        </section>

        <section className="grid gap-6 lg:grid-cols-[0.8fr_1.2fr]">
          <div className="space-y-4">
            <h2 className="font-display text-2xl font-extrabold tracking-tight">Active Commute Corridors</h2>
            <p className="text-sm font-semibold leading-7 text-gazie-navy/70">
              Connecting residential corridors (Airport Road, Kubwa, Gwarinpa, Apo, Lokogoma, Nyanya) into Abuja business
              districts and ministries. Drivers can post one-off trips or recurring weekday commutes.
            </p>
            <div className="flex flex-wrap gap-2">
              {pilotRoutes.map((route) => (
                <span
                  key={route}
                  className="rounded-full border border-gazie-navy/20 bg-white px-3 py-1.5 font-mono text-[10px] font-bold uppercase tracking-wider"
                >
                  {route}
                </span>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border-2 border-gazie-navy bg-white shadow-sm">
            <div className="border-b border-dashed border-gazie-navy/15 p-5">
              <h2 className="font-display text-2xl font-extrabold tracking-tight">How driver onboarding works</h2>
            </div>
            <div className="grid gap-0 divide-y divide-dashed divide-gazie-navy/15">
              {steps.map((step, index) => {
                const Icon = step.icon;
                return (
                  <div key={step.title} className="grid grid-cols-[auto_1fr] gap-4 p-5">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl border-2 border-gazie-navy bg-gazie-yellow">
                      <Icon className="h-5 w-5" />
                    </div>
                    <div>
                      <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-gazie-navy/45">
                        Step {index + 1}
                      </span>
                      <h3 className="font-display text-base font-extrabold">{step.title}</h3>
                      <p className="mt-1 text-xs font-semibold leading-6 text-gazie-navy/68">{step.body}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        <section className="grid gap-5 rounded-2xl border-2 border-gazie-navy bg-gazie-navy p-5 text-gazie-paper shadow-lg sm:grid-cols-[1fr_auto] sm:items-center">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 font-mono text-[10px] font-bold uppercase tracking-widest text-gazie-yellow">
              <Users className="h-4 w-4" />
              Driver onboarding campaign
            </div>
            <h2 className="font-display text-2xl font-extrabold tracking-tight">
              Share your normal route. Let verified riders request a seat.
            </h2>
            <p className="max-w-2xl text-xs font-semibold leading-6 text-gazie-paper/72">
              Start with one commute posting for tomorrow morning. Gazie will help match riders heading
              your way as the Lugbe pilot grows.
            </p>
          </div>
          <Link
            href="/login?role=driver"
            className="inline-flex items-center justify-center gap-2 rounded-xl border-2 border-gazie-yellow bg-gazie-yellow px-5 py-3 text-sm font-extrabold text-gazie-navy shadow-md transition hover:bg-white"
          >
            Register Now
            <ArrowRight className="h-4 w-4" />
          </Link>
        </section>
      </main>
    </div>
  );
}
