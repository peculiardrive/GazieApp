"use client";

import { useEffect, useState } from "react";
import { ArrowLeft, ArrowRight, Check, Pause, Play, RotateCcw } from "lucide-react";

const stages = [
  {
    title: "Driver creates a journey",
    description: "A verified neighbour is heading to work and has empty seats.",
  },
  {
    title: "Rider discovers the journey",
    description: "Another verified neighbour is travelling in the same direction.",
  },
  {
    title: "Seat confirmation",
    description: "Driver and rider agree to share the commute.",
  },
  {
    title: "Shared journey",
    description: "Neighbours travel together along the driver's regular route.",
  },
  {
    title: "Shared benefits",
    description: "A routine journey works better when neighbours travel together.",
  },
] as const;

const benefits = [
  { title: "Driver", description: "Offsets fuel costs.", color: "bg-gazie-yellow" },
  { title: "Rider", description: "Gains a convenient commute.", color: "bg-emerald-100" },
  { title: "Community", description: "Makes better use of existing vehicles.", color: "bg-blue-100" },
] as const;

const routePoints = [
  { x: 112, y: 198 },
  { x: 245, y: 171 },
  { x: 390, y: 139 },
  { x: 538, y: 94 },
  { x: 684, y: 54 },
];

const routePath =
  "M112 198 C180 198 205 181 245 171 S345 148 390 139 S490 107 538 94 S635 65 684 54";

const stageDuration = 2800;

export default function CommuteJourneyAnimation() {
  const [stage, setStage] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReducedMotion(media.matches);
    update();
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);

  useEffect(() => {
    if (!playing) return;

    if (stage === stages.length - 1) {
      setPlaying(false);
      return;
    }

    const timer = window.setTimeout(() => {
      setStage((current) => Math.min(current + 1, stages.length - 1));
    }, stageDuration);

    return () => window.clearTimeout(timer);
  }, [playing, stage]);

  const goToStage = (nextStage: number) => {
    setPlaying(false);
    setStage(Math.max(0, Math.min(stages.length - 1, nextStage)));
  };

  const startPlaying = () => {
    if (stage === stages.length - 1) setStage(0);
    setPlaying(true);
  };

  const carStart = routePoints[Math.max(0, stage - 1)];
  const carEnd = routePoints[stage];

  return (
    <section
      aria-labelledby="gazie-journey-heading"
      className="mb-7 w-full overflow-hidden rounded-2xl border-2 border-gazie-navy bg-white text-left shadow-md"
    >
      <div className="flex flex-wrap items-start justify-between gap-3 border-b border-gazie-navy/10 px-4 py-4 sm:px-6">
        <div>
          <p className="font-mono text-[10px] font-bold uppercase tracking-widest text-gazie-green">
            How Gazie Works
          </p>
          <h2 id="gazie-journey-heading" className="font-display text-xl font-black text-gazie-navy sm:text-2xl">
            Your Route. Shared.
          </h2>
          <p className="mt-1 text-xs text-gazie-navy/70">
            A sample neighbourhood journey from Lugbe to Central Area.
          </p>
        </div>
        <span className="rounded-full border border-gazie-green/20 bg-gazie-green/10 px-2.5 py-1 font-mono text-[10px] font-bold text-gazie-green">
          FICTIONAL ROUTE
        </span>
      </div>

      <div className="px-4 pt-4 sm:px-6">
        <div className="relative overflow-hidden rounded-xl border border-gazie-navy/10 bg-[#eef5f0]">
          <svg
            viewBox="0 0 760 260"
            className="block h-auto w-full"
            role="img"
            aria-label="Illustration of a fictional route from Lugbe to Central Area"
          >
            <defs>
              <pattern id="journey-grid" width="38" height="38" patternUnits="userSpaceOnUse">
                <path d="M38 0H0V38" fill="none" stroke="#d6e5db" strokeWidth="1" />
              </pattern>
              <filter id="car-shadow" x="-50%" y="-50%" width="200%" height="200%">
                <feDropShadow dx="0" dy="3" stdDeviation="3" floodColor="#14213d" floodOpacity=".18" />
              </filter>
            </defs>

            <rect width="760" height="260" fill="url(#journey-grid)" />
            <path d="M0 52H760M0 226H760M66 0V260M718 0V260" stroke="#fff" strokeWidth="14" />
            <path d="M0 52H760M0 226H760M66 0V260M718 0V260" stroke="#dbe7df" strokeWidth="1.5" />

            <path d={routePath} fill="none" stroke="#fff" strokeWidth="22" strokeLinecap="round" />
            <path d={routePath} fill="none" stroke="#b6d2c1" strokeWidth="12" strokeLinecap="round" />
            <path
              d={routePath}
              fill="none"
              stroke="#2D6A4F"
              strokeWidth="4"
              strokeLinecap="round"
              strokeDasharray="2 10"
            />

            <text x="94" y="235" fill="#14213D" fontSize="13" fontWeight="700">LUGBE</text>
            <text x="608" y="34" fill="#14213D" fontSize="13" fontWeight="700">CENTRAL AREA</text>
            <text x="61" y="30" fill="#557064" fontSize="10" fontWeight="600">AIRPORT ROAD</text>

            <circle cx="112" cy="198" r="13" fill="#fff" stroke="#2D6A4F" strokeWidth="4" />
            <circle cx="112" cy="198" r="4" fill="#2D6A4F" />
            <circle cx="684" cy="54" r="13" fill="#FFC93C" stroke="#14213D" strokeWidth="3" />
            <path d="M679 54h10m-5-5v10" stroke="#14213D" strokeWidth="2" strokeLinecap="round" />

            {stage >= 1 && (
              <g>
                <path d="M390 139v35" stroke="#d38a00" strokeWidth="2" strokeDasharray="4 4" />
                <circle cx="390" cy="186" r="17" fill="#fff" stroke="#d38a00" strokeWidth="3" />
                <circle cx="390" cy="181" r="4" fill="#d38a00" />
                <path d="M382 193c1-6 4-8 8-8s7 2 8 8" fill="#FFC93C" stroke="#d38a00" strokeWidth="1.5" />
              </g>
            )}

            <g
              transform={reducedMotion || stage === 0 ? "translate(0 0)" : "translate(0 0)"}
              filter="url(#car-shadow)"
              aria-hidden="true"
            >
              {stage > 0 && !reducedMotion && (
                <animateMotion
                  key={"car-motion-" + stage}
                  path={"M" + carStart.x + " " + carStart.y + " L" + carEnd.x + " " + carEnd.y}
                  dur="850ms"
                  fill="freeze"
                />
              )}
              {stage === 0 || reducedMotion ? (
                <g transform={"translate(" + carEnd.x + " " + carEnd.y + ")"}>
                  <circle r="25" fill="#14213D" opacity=".1" />
                  <rect x="-26" y="-13" width="52" height="25" rx="9" fill="#14213D" stroke="#fff" strokeWidth="2" />
                  <path d="M-14-12l5-9h17l7 9" fill="#14213D" stroke="#fff" strokeWidth="2" />
                  <path d="M-8-17h12l4 5H-11z" fill="#b9d8c5" />
                  <circle cx="-15" cy="13" r="5" fill="#14213D" stroke="#fff" strokeWidth="2" />
                  <circle cx="15" cy="13" r="5" fill="#14213D" stroke="#fff" strokeWidth="2" />
                  {stage >= 2 && <circle cx="0" cy="-1" r="4" fill="#FFC93C" />}
                </g>
              ) : (
                <g>
                  <circle r="25" fill="#14213D" opacity=".1" />
                  <rect x="-26" y="-13" width="52" height="25" rx="9" fill="#14213D" stroke="#fff" strokeWidth="2" />
                  <path d="M-14-12l5-9h17l7 9" fill="#14213D" stroke="#fff" strokeWidth="2" />
                  <path d="M-8-17h12l4 5H-11z" fill="#b9d8c5" />
                  <circle cx="-15" cy="13" r="5" fill="#14213D" stroke="#fff" strokeWidth="2" />
                  <circle cx="15" cy="13" r="5" fill="#14213D" stroke="#fff" strokeWidth="2" />
                  {stage >= 2 && <circle cx="0" cy="-1" r="4" fill="#FFC93C" />}
                </g>
              )}
            </g>
          </svg>

          <div className="absolute left-3 top-3 flex items-center gap-2 rounded-lg border border-white/80 bg-white/95 px-2.5 py-1.5 text-[10px] font-bold text-gazie-navy shadow-sm">
            <span className="h-2 w-2 rounded-full bg-gazie-green" />
            Lugbe, Abuja
          </div>
          <div className="absolute bottom-3 right-3 rounded-lg border border-white/80 bg-white/95 px-2.5 py-1.5 text-[10px] font-bold text-gazie-navy shadow-sm">
            Central Area
          </div>
          {stage >= 2 && (
            <div className="absolute right-3 top-3 flex items-center gap-1.5 rounded-lg border border-gazie-green/20 bg-white/95 px-2.5 py-1.5 text-[10px] font-bold text-gazie-green shadow-sm">
              <Check size={13} aria-hidden="true" />
              Seat confirmed
            </div>
          )}
        </div>
      </div>

      <div className="px-4 pt-4 sm:px-6">
        <ol aria-label="Journey stages" className="grid grid-cols-5 gap-2">
          {stages.map((item, index) => (
            <li key={item.title} className="min-w-0">
              <button
                type="button"
                onClick={() => goToStage(index)}
                aria-label={"Go to stage " + (index + 1) + ": " + item.title}
                aria-current={stage === index ? "step" : undefined}
                className={
                  "flex min-h-10 w-full items-center justify-center gap-1 rounded-lg border px-1.5 text-[10px] font-bold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gazie-green focus-visible:ring-offset-2 sm:justify-start sm:px-2 " +
                  (stage === index
                    ? "border-gazie-navy bg-gazie-navy text-white"
                    : stage > index
                      ? "border-gazie-green/25 bg-gazie-green/10 text-gazie-green"
                      : "border-gazie-navy/10 bg-white text-gazie-navy/55")
                }
              >
                <span className="font-mono">{String(index + 1).padStart(2, "0")}</span>
                <span className="hidden truncate sm:inline">Stage {index + 1}</span>
              </button>
            </li>
          ))}
        </ol>
      </div>

      <div aria-live="polite" aria-atomic="true" className="min-h-[88px] px-4 py-4 sm:px-6">
        <p className="font-display text-sm font-bold text-gazie-navy sm:text-base">
          {stages[stage].title}
        </p>
        <p className="mt-1 text-xs leading-relaxed text-gazie-navy/70 sm:text-sm">
          {stages[stage].description}
        </p>
        {stage === stages.length - 1 && (
          <p className="mt-2 font-display text-sm font-black text-gazie-green motion-safe:animate-fadeIn">
            Gazie Commute. Your Route. Shared.
          </p>
        )}
      </div>

      {stage === stages.length - 1 && (
        <div className="grid gap-2 px-4 pb-4 sm:grid-cols-3 sm:px-6">
          {benefits.map((benefit, index) => (
            <div
              key={benefit.title}
              className={
                "rounded-lg border border-gazie-navy/10 p-3 motion-safe:animate-fadeIn motion-reduce:animate-none " +
                benefit.color
              }
              style={{ animationDelay: (index * 100) + "ms" }}
            >
              <p className="font-mono text-[10px] font-bold uppercase tracking-wider text-gazie-navy/65">
                {benefit.title}
              </p>
              <p className="mt-1 text-xs font-bold leading-relaxed text-gazie-navy">
                {benefit.description}
              </p>
            </div>
          ))}
        </div>
      )}

      <div className="flex flex-wrap items-center gap-2 border-t border-gazie-navy/10 px-4 py-3 sm:px-6">
        <button
          type="button"
          onClick={() => goToStage(stage - 1)}
          disabled={stage === 0}
          aria-label="Previous stage"
          className="inline-flex min-h-10 items-center gap-1.5 rounded-lg border border-gazie-navy/20 px-3 text-xs font-bold text-gazie-navy transition-colors hover:bg-gazie-paper focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gazie-green disabled:cursor-not-allowed disabled:opacity-40"
        >
          <ArrowLeft size={15} aria-hidden="true" />
          Previous
        </button>
        <button
          type="button"
          onClick={() => (playing ? setPlaying(false) : startPlaying())}
          aria-label={playing ? "Pause journey animation" : "Play journey animation"}
          className="inline-flex min-h-10 items-center gap-1.5 rounded-lg bg-gazie-navy px-4 text-xs font-bold text-white transition-colors hover:bg-gazie-green focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gazie-green focus-visible:ring-offset-2"
        >
          {playing ? <Pause size={15} aria-hidden="true" /> : <Play size={15} aria-hidden="true" />}
          {playing ? "Pause" : "Play"}
        </button>
        <button
          type="button"
          onClick={() => goToStage(stage + 1)}
          disabled={stage === stages.length - 1}
          aria-label="Next stage"
          className="inline-flex min-h-10 items-center gap-1.5 rounded-lg border border-gazie-navy/20 px-3 text-xs font-bold text-gazie-navy transition-colors hover:bg-gazie-paper focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gazie-green disabled:cursor-not-allowed disabled:opacity-40"
        >
          Next
          <ArrowRight size={15} aria-hidden="true" />
        </button>
        <button
          type="button"
          onClick={() => {
            setPlaying(false);
            setStage(0);
          }}
          aria-label="Restart journey animation"
          className="ml-auto inline-flex min-h-10 items-center gap-1.5 rounded-lg border border-gazie-navy/20 px-3 text-xs font-bold text-gazie-navy transition-colors hover:bg-gazie-paper focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gazie-green"
        >
          <RotateCcw size={14} aria-hidden="true" />
          Restart
        </button>
      </div>

      <p className="px-4 pb-4 text-[10px] leading-relaxed text-gazie-navy/55 sm:px-6">
        Demonstration only. This route uses fictional locations and no live rider, vehicle, booking, or payment data.
      </p>
    </section>
  );
}
