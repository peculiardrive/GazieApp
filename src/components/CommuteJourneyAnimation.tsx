"use client";

import { useEffect, useState } from "react";
import {
  Car,
  Check,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Fuel,
  Pause,
  Play,
  RotateCcw,
  ShieldCheck,
  Sparkles,
  Users,
} from "lucide-react";

interface StageInfo {
  step: string;
  title: string;
  description: string;
  statusPill: string;
  seatStatus: string;
}

const STAGES: StageInfo[] = [
  {
    step: "01",
    title: "Driver creates a journey",
    description: "A verified neighbour is heading to work and has empty seats.",
    statusPill: "Lugbe Federal Housing → Central Area",
    seatStatus: "3 Empty Seats Available",
  },
  {
    step: "02",
    title: "Rider discovers the journey",
    description: "Another verified neighbour is travelling in the same direction.",
    statusPill: "Route Match Found along Airport Rd",
    seatStatus: "Matching Lugbe Corridor...",
  },
  {
    step: "03",
    title: "Seat confirmation",
    description: "Driver and rider agree to share the commute.",
    statusPill: "Mutual Agreement Confirmed",
    seatStatus: "1 Seat Booked • 2 Seats Left",
  },
  {
    step: "04",
    title: "Shared journey",
    description: "Neighbours travel together along the driver's regular route.",
    statusPill: "Commuting along Airport Road Corridor",
    seatStatus: "2 Neighbours Travelling Together",
  },
  {
    step: "05",
    title: "Shared benefits",
    description: "A routine journey works better when neighbours travel together.",
    statusPill: "Arrived: Federal Secretariat & Central Area",
    seatStatus: "Commute Completed Successfully",
  },
];

const BENEFITS = [
  {
    title: "Driver",
    subtitle: "Offsets fuel costs.",
    detail: "Share regular commute fuel expenses with verified neighbours heading your way.",
    icon: Fuel,
    pillBg: "bg-gazie-yellow text-gazie-navy",
    cardBg: "bg-amber-50/80 border-amber-200",
    iconColor: "text-amber-800",
  },
  {
    title: "Rider",
    subtitle: "Gains a convenient commute.",
    detail: "Lock in your ride the evening before at fixed community rates without surge pricing.",
    icon: ShieldCheck,
    pillBg: "bg-[#2D6A4F] text-white",
    cardBg: "bg-emerald-50/80 border-emerald-200",
    iconColor: "text-[#2D6A4F]",
  },
  {
    title: "Community",
    subtitle: "Makes better use of existing vehicles.",
    detail: "Fewer single-occupant cars on the Lugbe corridor reduces traffic and emissions.",
    icon: Users,
    pillBg: "bg-gazie-navy text-white",
    cardBg: "bg-slate-50 border-slate-200",
    iconColor: "text-gazie-navy",
  },
];

// Fictional Lugbe -> Central Area route coordinates along SVG viewBox 0 0 760 260
const ROUTE_PATH = "M 90 210 C 210 210, 270 178, 370 150 C 470 122, 540 85, 670 55";

// Car translation and orientation parameters for each stage
const CAR_POSITIONS = [
  { x: 90, y: 210, angle: -15, progress: 0 },    // Stage 1: At Lugbe departure
  { x: 90, y: 210, angle: -15, progress: 0 },    // Stage 2: At Lugbe, route matched
  { x: 135, y: 204, angle: -18, progress: 0.1 }, // Stage 3: Departure ready
  { x: 520, y: 104, angle: -20, progress: 0.72 },// Stage 4: En route past City Gate
  { x: 670, y: 55, angle: -18, progress: 1 },    // Stage 5: Parked at Central Area
];

const STAGE_INTERVAL_MS = 3600;

export default function CommuteJourneyAnimation() {
  const [stage, setStage] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);

  // Detect user accessibility preferences for reduced motion
  useEffect(() => {
    if (typeof window === "undefined") return;
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const updateMotion = () => setReducedMotion(media.matches);
    updateMotion();
    media.addEventListener("change", updateMotion);
    return () => media.removeEventListener("change", updateMotion);
  }, []);

  // Automatic sequential stage progression when Play is active
  useEffect(() => {
    if (!playing) return;

    if (stage === STAGES.length - 1) {
      setPlaying(false);
      return;
    }

    const timer = window.setTimeout(() => {
      setStage((prev) => (prev < STAGES.length - 1 ? prev + 1 : prev));
    }, STAGE_INTERVAL_MS);

    return () => window.clearTimeout(timer);
  }, [playing, stage]);

  const goToStage = (targetIndex: number) => {
    setPlaying(false);
    setStage(Math.max(0, Math.min(STAGES.length - 1, targetIndex)));
  };

  const handlePlayToggle = () => {
    if (stage === STAGES.length - 1) {
      setStage(0);
      setPlaying(true);
    } else {
      setPlaying((prev) => !prev);
    }
  };

  const handleRestart = () => {
    setPlaying(false);
    setStage(0);
  };

  const currentCar = CAR_POSITIONS[stage];
  const activeStage = STAGES[stage];

  return (
    <section
      aria-labelledby="journey-animation-title"
      className="mb-6 w-full overflow-hidden rounded-2xl border-2 border-gazie-navy bg-white text-left shadow-md transition-all"
    >
      {/* Header bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b-2 border-gazie-navy/10 bg-gazie-paper/50 px-4 py-3.5 sm:px-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-mono text-[10px] font-black uppercase tracking-widest text-[#2D6A4F]">
              How It Works
            </span>
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-[#2D6A4F]" />
            <span className="font-mono text-[10px] text-gazie-navy/60 font-bold">
              Abuja Pilot Corridor
            </span>
          </div>
          <h2
            id="journey-animation-title"
            className="font-display text-xl sm:text-2xl font-black tracking-tight text-gazie-navy mt-0.5"
          >
            Your Route. Shared.
          </h2>
        </div>

        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-gazie-navy/15 bg-white px-2.5 py-1 font-mono text-[10px] font-bold text-gazie-navy shadow-xs">
            <span className="h-2 w-2 rounded-full bg-gazie-yellow animate-pulse" />
            FICTIONAL DEMO ROUTE
          </span>
        </div>
      </div>

      {/* SVG Canvas Container */}
      <div className="px-3 pt-3 sm:px-5 sm:pt-4">
        <div className="relative overflow-hidden rounded-xl border-2 border-gazie-navy/15 bg-[#F4F8F5]">
          <svg
            viewBox="0 0 760 260"
            className="block h-auto w-full select-none"
            role="img"
            aria-label="Interactive map showing sample commute journey from Lugbe to Central Area"
          >
            <defs>
              {/* Subtle map coordinate grid pattern */}
              <pattern id="gazie-map-grid" width="38" height="38" patternUnits="userSpaceOnUse">
                <path d="M 38 0 L 0 0 0 38" fill="none" stroke="#DCE8DF" strokeWidth="1" />
              </pattern>

              {/* Linear gradient for connecting matching arc */}
              <linearGradient id="matchLineGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#FFC93C" stopOpacity="0.9" />
                <stop offset="100%" stopColor="#2D6A4F" stopOpacity="0.9" />
              </linearGradient>

              {/* Soft vehicle shadow */}
              <filter id="vehicle-shadow" x="-50%" y="-50%" width="200%" height="200%">
                <feDropShadow dx="0" dy="3" stdDeviation="3.5" floodColor="#14213D" floodOpacity="0.25" />
              </filter>
            </defs>

            {/* Background grid */}
            <rect width="760" height="260" fill="url(#gazie-map-grid)" />

            {/* Stylized background corridors / cross streets */}
            <path d="M 0 60 H 760" stroke="#E6EFE9" strokeWidth="10" />
            <path d="M 0 220 H 760" stroke="#E6EFE9" strokeWidth="10" />
            <path d="M 230 0 V 260" stroke="#E6EFE9" strokeWidth="8" />
            <path d="M 530 0 V 260" stroke="#E6EFE9" strokeWidth="8" />

            {/* Route Base (Outer White Glow) */}
            <path
              d={ROUTE_PATH}
              fill="none"
              stroke="#FFFFFF"
              strokeWidth="24"
              strokeLinecap="round"
            />

            {/* Route Highway Asphalt Bed */}
            <path
              d={ROUTE_PATH}
              fill="none"
              stroke="#CBD8D0"
              strokeWidth="14"
              strokeLinecap="round"
            />

            {/* Active Green Travelled Path (expands as stages progress) */}
            <path
              d={ROUTE_PATH}
              fill="none"
              stroke="#2D6A4F"
              strokeWidth="6"
              strokeLinecap="round"
              strokeDasharray="670"
              strokeDashoffset={
                reducedMotion
                  ? stage >= 3
                    ? "0"
                    : "500"
                  : stage === 0
                  ? "670"
                  : stage === 1
                  ? "640"
                  : stage === 2
                  ? "550"
                  : stage === 3
                  ? "120"
                  : "0"
              }
              style={{
                transition: reducedMotion ? "none" : "stroke-dashoffset 1.8s ease-in-out",
              }}
            />

            {/* Dashed Center Road Divider */}
            <path
              d={ROUTE_PATH}
              fill="none"
              stroke="#FFFFFF"
              strokeWidth="2"
              strokeLinecap="round"
              strokeDasharray="4 8"
              opacity="0.9"
            />

            {/* Corridor Landmark Markers */}

            {/* 1. Lugbe (Departure Corridor) */}
            <g transform="translate(90, 210)">
              <circle r="14" fill="#FFFFFF" stroke="#2D6A4F" strokeWidth="3" />
              <circle r="5" fill="#2D6A4F" />
              <text
                x="0"
                y="30"
                textAnchor="middle"
                fill="#14213D"
                fontSize="11"
                fontWeight="800"
                fontFamily="system-ui, sans-serif"
              >
                LUGBE
              </text>
              <text
                x="0"
                y="41"
                textAnchor="middle"
                fill="#557064"
                fontSize="8"
                fontWeight="600"
                fontFamily="system-ui, sans-serif"
              >
                Start Point
              </text>
            </g>

            {/* 2. Airport Road Corridor / Pickup Waypoint */}
            <g transform="translate(370, 150)">
              <circle r="6" fill="#FFFFFF" stroke="#557064" strokeWidth="2" />
              <text
                x="0"
                y="-14"
                textAnchor="middle"
                fill="#557064"
                fontSize="9"
                fontWeight="700"
                fontFamily="system-ui, sans-serif"
              >
                AIRPORT ROAD
              </text>
            </g>

            {/* 3. City Gate Waypoint */}
            <g transform="translate(530, 98)">
              <circle r="5" fill="#CBD8D0" stroke="#557064" strokeWidth="1.5" />
              <text
                x="0"
                y="-13"
                textAnchor="middle"
                fill="#557064"
                fontSize="9"
                fontWeight="600"
                fontFamily="system-ui, sans-serif"
              >
                City Gate
              </text>
            </g>

            {/* 4. Central Area / Federal Secretariat (Destination) */}
            <g transform="translate(670, 55)">
              <circle r="16" fill="#FFC93C" stroke="#14213D" strokeWidth="3" />
              <circle r="6" fill="#14213D" />
              <text
                x="0"
                y="-24"
                textAnchor="middle"
                fill="#14213D"
                fontSize="11"
                fontWeight="800"
                fontFamily="system-ui, sans-serif"
              >
                CENTRAL AREA
              </text>
              <text
                x="0"
                y="-13"
                textAnchor="middle"
                fill="#557064"
                fontSize="8"
                fontWeight="600"
                fontFamily="system-ui, sans-serif"
              >
                Secretariat & CBD
              </text>
            </g>

            {/* Stage 2 & 3: Rider Location Marker and Connecting Match Beam */}
            {stage >= 1 && (
              <g transform="translate(370, 150)">
                {/* Pulsing radar waves for matching in Stage 2 */}
                {stage === 1 && !reducedMotion && (
                  <>
                    <circle r="26" fill="none" stroke="#FFC93C" strokeWidth="1.5" opacity="0.4">
                      <animate
                        attributeName="r"
                        values="14;34"
                        dur="1.8s"
                        repeatCount="indefinite"
                      />
                      <animate
                        attributeName="opacity"
                        values="0.7;0"
                        dur="1.8s"
                        repeatCount="indefinite"
                      />
                    </circle>
                  </>
                )}

                {/* Connecting matching line to approaching car */}
                <path
                  d="M -235 55 Q -100 20, 0 0"
                  fill="none"
                  stroke="url(#matchLineGrad)"
                  strokeWidth="2.5"
                  strokeDasharray="4 4"
                  opacity={stage >= 3 ? 0.3 : 0.85}
                />

                {/* Rider pin */}
                <circle
                  r="13"
                  fill="#FFFFFF"
                  stroke={stage >= 2 ? "#2D6A4F" : "#FFC93C"}
                  strokeWidth="3"
                />

                {/* Rider Icon Silhouette */}
                <g transform="translate(0, -1)">
                  <circle
                    cx="0"
                    cy="-3"
                    r="3"
                    fill={stage >= 2 ? "#2D6A4F" : "#14213D"}
                  />
                  <path
                    d="M -5 5 C -5 2, -2 0, 0 0 C 2 0, 5 2, 5 5 Z"
                    fill={stage >= 2 ? "#2D6A4F" : "#14213D"}
                  />
                </g>

                {/* Rider Label Badge */}
                <rect
                  x="-35"
                  y="18"
                  width="70"
                  height="16"
                  rx="4"
                  fill="#FFFFFF"
                  stroke="#14213D"
                  strokeWidth="1.5"
                />
                <text
                  x="0"
                  y="29"
                  textAnchor="middle"
                  fill="#14213D"
                  fontSize="8"
                  fontWeight="800"
                  fontFamily="system-ui, sans-serif"
                >
                  {stage >= 3 ? "PICKED UP ✓" : "RIDER PICKUP"}
                </text>

                {/* Confirmation checkmark badge in Stage 3+ */}
                {stage >= 2 && (
                  <g transform="translate(11, -11)">
                    <circle r="7" fill="#2D6A4F" stroke="#FFFFFF" strokeWidth="1.5" />
                    <path
                      d="M -3 0 L -1 2 L 3 -2"
                      fill="none"
                      stroke="#FFFFFF"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                    />
                  </g>
                )}
              </g>
            )}

            {/* Vehicle Element (Smoothly animated along corridor) */}
            <g
              filter="url(#vehicle-shadow)"
              style={{
                transform: `translate(${currentCar.x}px, ${currentCar.y}px) rotate(${currentCar.angle}deg)`,
                transformOrigin: "0px 0px",
                transition: reducedMotion ? "none" : "transform 1.4s cubic-bezier(0.25, 1, 0.5, 1)",
              }}
            >
              {/* Headlight beam */}
              <polygon
                points="24,-6 50,-12 50,12 24,6"
                fill="#FFC93C"
                opacity={stage >= 2 ? "0.25" : "0.15"}
              />

              {/* Main Car Body */}
              <rect
                x="-24"
                y="-13"
                width="48"
                height="26"
                rx="8"
                fill="#14213D"
                stroke="#FFFFFF"
                strokeWidth="2"
              />

              {/* Windshield and Cabin Roof */}
              <path
                d="M -12 -12 L -6 -8 L 12 -8 L 18 -12 Z"
                fill="#2D6A4F"
                opacity="0.8"
              />
              <path
                d="M -12 12 L -6 8 L 12 8 L 18 12 Z"
                fill="#2D6A4F"
                opacity="0.8"
              />

              {/* Front and Rear Glass */}
              <rect x="-8" y="-7" width="16" height="14" rx="2" fill="#FFFFFF" opacity="0.9" />

              {/* Front Wheels */}
              <rect x="10" y="-15" width="8" height="4" rx="1.5" fill="#14213D" />
              <rect x="10" y="11" width="8" height="4" rx="1.5" fill="#14213D" />

              {/* Rear Wheels */}
              <rect x="-18" y="-15" width="8" height="4" rx="1.5" fill="#14213D" />
              <rect x="-18" y="11" width="8" height="4" rx="1.5" fill="#14213D" />

              {/* Commuters inside vehicle */}
              {/* Driver silhouette (Always present in front seat) */}
              <circle cx="2" cy="-2.5" r="2.8" fill="#FFC93C" />

              {/* Rider silhouette joins car in Stage 4 & 5 */}
              {stage >= 3 && (
                <circle cx="-3" cy="2.5" r="2.8" fill="#2D6A4F" stroke="#FFFFFF" strokeWidth="0.8" />
              )}

              {/* Headlights */}
              <circle cx="23" cy="-7" r="1.5" fill="#FFC93C" />
              <circle cx="23" cy="7" r="1.5" fill="#FFC93C" />
            </g>
          </svg>

          {/* Floating Context Pills Overlay on SVG Map */}
          <div className="absolute left-2.5 top-2.5 flex items-center gap-1.5 rounded-lg border border-gazie-navy/15 bg-white/95 px-2.5 py-1 text-[10px] font-bold text-gazie-navy shadow-xs backdrop-blur-xs">
            <Car className="h-3 w-3 text-[#2D6A4F]" />
            <span>{activeStage.statusPill}</span>
          </div>

          <div className="absolute right-2.5 bottom-2.5 flex items-center gap-1.5 rounded-lg border border-gazie-navy/15 bg-white/95 px-2.5 py-1 text-[10px] font-bold shadow-xs backdrop-blur-xs">
            {stage >= 2 ? (
              <CheckCircle2 className="h-3 w-3 text-[#2D6A4F]" />
            ) : (
              <Sparkles className="h-3 w-3 text-amber-600" />
            )}
            <span className={stage >= 2 ? "text-[#2D6A4F]" : "text-gazie-navy/80"}>
              {activeStage.seatStatus}
            </span>
          </div>
        </div>
      </div>

      {/* 5-Stage Interactive Progress Indicator */}
      <div className="px-3 pt-4 sm:px-6">
        <ol aria-label="Journey stages" className="grid grid-cols-5 gap-1.5 sm:gap-2">
          {STAGES.map((s, index) => {
            const isCurrent = stage === index;
            const isCompleted = stage > index;

            return (
              <li key={s.step} className="min-w-0">
                <button
                  type="button"
                  onClick={() => goToStage(index)}
                  aria-label={`Go to stage ${index + 1}: ${s.title}`}
                  aria-current={isCurrent ? "step" : undefined}
                  className={`flex min-h-[44px] w-full flex-col items-center justify-center rounded-xl border p-1 text-[11px] font-bold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2D6A4F] focus-visible:ring-offset-2 sm:flex-row sm:justify-start sm:gap-2 sm:px-3 ${
                    isCurrent
                      ? "border-gazie-navy bg-gazie-navy text-gazie-paper shadow-sm"
                      : isCompleted
                      ? "border-[#2D6A4F]/30 bg-[#2D6A4F]/10 text-[#2D6A4F] hover:bg-[#2D6A4F]/15"
                      : "border-gazie-navy/10 bg-white text-gazie-navy/60 hover:bg-gazie-paper/60"
                  }`}
                >
                  <span className="flex items-center gap-1 font-mono text-[10px] sm:text-xs">
                    {isCompleted ? (
                      <Check className="h-3 w-3 shrink-0 stroke-[3]" />
                    ) : (
                      s.step
                    )}
                  </span>
                  <span className="hidden truncate text-left sm:inline font-sans">
                    {index === 0 && "Driver"}
                    {index === 1 && "Rider"}
                    {index === 2 && "Confirm"}
                    {index === 3 && "Journey"}
                    {index === 4 && "Benefits"}
                  </span>
                </button>
              </li>
            );
          })}
        </ol>
      </div>

      {/* Active Stage Narrative Box */}
      <div
        aria-live="polite"
        aria-atomic="true"
        className="px-3 py-3.5 sm:px-6 min-h-[82px] flex flex-col justify-center"
      >
        <div className="flex items-center gap-2">
          <span className="rounded bg-gazie-yellow/30 px-1.5 py-0.5 font-mono text-[9px] font-black uppercase text-gazie-navy">
            Stage {stage + 1} of 5
          </span>
          <h3 className="font-display text-sm sm:text-base font-extrabold text-gazie-navy">
            {activeStage.title}
          </h3>
        </div>
        <p className="mt-1 text-xs sm:text-sm leading-relaxed text-gazie-navy/75 font-medium">
          {activeStage.description}
        </p>
      </div>

      {/* Stage 5 Animated Benefit Cards */}
      {stage === 4 && (
        <div className="space-y-3 px-3 pb-3 sm:px-6 sm:pb-4 motion-safe:animate-fadeIn">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            {BENEFITS.map((benefit, idx) => {
              const IconComponent = benefit.icon;
              return (
                <div
                  key={benefit.title}
                  className={`rounded-xl border p-3.5 transition-all shadow-xs ${benefit.cardBg}`}
                  style={{
                    animationDelay: reducedMotion ? "0ms" : `${idx * 120}ms`,
                  }}
                >
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span
                      className={`rounded-md px-2 py-0.5 font-mono text-[9px] font-black uppercase tracking-wider ${benefit.pillBg}`}
                    >
                      {benefit.title}
                    </span>
                    <IconComponent className={`h-4 w-4 shrink-0 ${benefit.iconColor}`} />
                  </div>
                  <h4 className="font-display text-xs sm:text-sm font-bold text-gazie-navy">
                    {benefit.subtitle}
                  </h4>
                  <p className="mt-1 text-[11px] leading-relaxed text-gazie-navy/70 font-medium">
                    {benefit.detail}
                  </p>
                </div>
              );
            })}
          </div>

          {/* Concluding Gazie Commute Signature Tagline */}
          <div className="rounded-xl border-2 border-[#2D6A4F] bg-[#2D6A4F]/10 p-3 text-center">
            <p className="font-display text-sm sm:text-base font-black tracking-tight text-[#2D6A4F]">
              Gazie Commute. Your Route. Shared.
            </p>
          </div>
        </div>
      )}

      {/* Controls Bar: Play / Pause, Previous, Next, Restart */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-t-2 border-gazie-navy/10 bg-gazie-paper/30 px-3 py-3 sm:px-6">
        <div className="flex items-center gap-2">
          {/* Previous Button */}
          <button
            type="button"
            onClick={() => goToStage(stage - 1)}
            disabled={stage === 0}
            aria-label="Previous stage"
            className="inline-flex min-h-[44px] items-center gap-1 rounded-xl border border-gazie-navy/20 bg-white px-3 text-xs font-bold text-gazie-navy shadow-xs transition-colors hover:bg-gazie-paper focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2D6A4F] disabled:cursor-not-allowed disabled:opacity-40"
          >
            <ChevronLeft className="h-4 w-4" />
            <span>Previous</span>
          </button>

          {/* Play / Pause Toggle Button */}
          <button
            type="button"
            onClick={handlePlayToggle}
            aria-label={playing ? "Pause journey animation" : "Play journey animation"}
            className="inline-flex min-h-[44px] items-center gap-1.5 rounded-xl border-2 border-gazie-navy bg-gazie-navy px-4 text-xs font-bold text-gazie-paper shadow-sm transition-all hover:bg-[#2D6A4F] hover:border-[#2D6A4F] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2D6A4F] focus-visible:ring-offset-2"
          >
            {playing ? (
              <>
                <Pause className="h-4 w-4" />
                <span>Pause</span>
              </>
            ) : (
              <>
                <Play className="h-4 w-4 fill-current" />
                <span>Play</span>
              </>
            )}
          </button>

          {/* Next Button */}
          <button
            type="button"
            onClick={() => goToStage(stage + 1)}
            disabled={stage === STAGES.length - 1}
            aria-label="Next stage"
            className="inline-flex min-h-[44px] items-center gap-1 rounded-xl border border-gazie-navy/20 bg-white px-3 text-xs font-bold text-gazie-navy shadow-xs transition-colors hover:bg-gazie-paper focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2D6A4F] disabled:cursor-not-allowed disabled:opacity-40"
          >
            <span>Next</span>
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>

        {/* Restart Button */}
        <button
          type="button"
          onClick={handleRestart}
          aria-label="Restart journey animation"
          className="inline-flex min-h-[44px] items-center gap-1.5 rounded-xl border border-gazie-navy/20 bg-white px-3 text-xs font-bold text-gazie-navy shadow-xs transition-colors hover:bg-gazie-paper focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2D6A4F]"
        >
          <RotateCcw className="h-3.5 w-3.5" />
          <span>Restart</span>
        </button>
      </div>

      {/* Safety & Fictional Data Note */}
      <div className="border-t border-dashed border-gazie-navy/10 px-3 py-2 sm:px-6">
        <p className="text-[10px] leading-relaxed text-gazie-navy/55 font-medium">
          Demonstration only. Fictional sample corridor with simulated neighbour matching. No live customer records, vehicle locations, or financial transactions are used.
        </p>
      </div>
    </section>
  );
}
