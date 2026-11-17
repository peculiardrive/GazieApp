"use client";

import { useEffect, useState } from "react";
import { ArrowLeft, ArrowRight, Pause, Play, RotateCcw } from "lucide-react";

const steps = [
  { title: "Driver posts a regular commute", description: "A verified neighbour shares available seats on a planned Lugbe to Central Area journey." },
  { title: "Neighbour discovers the route", description: "Another verified neighbour travelling in the same direction finds the shared commute." },
  { title: "Seat is confirmed", description: "The driver accepts the request and both commuters agree on the journey." },
  { title: "Neighbours commute together", description: "The driver follows their usual route, now with a neighbour on board." },
  { title: "Fuel costs are shared", description: "Empty seats become useful, helping the driver offset fuel costs." },
];

export default function CommuteJourneyAnimation() {
  const [step, setStep] = useState(0);
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
    if (!playing || reducedMotion) return;
    const timer = window.setInterval(() => {
      setStep(current => {
        if (current === steps.length - 1) {
          setPlaying(false);
          return current;
        }
        return current + 1;
      });
    }, 2200);
    return () => window.clearInterval(timer);
  }, [playing, reducedMotion]);

  const move = (next: number) => {
    setPlaying(false);
    setStep(Math.max(0, Math.min(steps.length - 1, next)));
  };
  const positions = [[42, 142], [98, 120], [156, 91], [232, 60], [298, 37]];
  const [x, y] = positions[step];

  return (
    <section aria-labelledby="gazie-journey-heading" className="w-full rounded-2xl border-2 border-gazie-navy bg-white p-4 sm:p-5 shadow-md mb-7">
      <div className="mb-3 text-left">
        <p className="font-mono text-[10px] font-bold uppercase tracking-widest text-gazie-green">How Gazie Works</p>
        <h2 id="gazie-journey-heading" className="font-display text-xl font-black text-gazie-navy">Your Route. Shared.</h2>
        <p className="text-xs text-gazie-navy/70">Follow a sample neighbourhood carpool journey.</p>
      </div>
      <div className="overflow-hidden rounded-xl bg-[#e9f3ee]">
        <svg viewBox="0 0 340 184" className="w-full h-auto" role="img" aria-label={`Illustrative route from Lugbe to Central Area, step ${step + 1} of 5: ${steps[step].title}`}>
          <rect width="340" height="184" fill="#e9f3ee" />
          {[25,77,129].map(n => <path key={`h${n}`} d={`M0 ${n} H340`} stroke="#fff" strokeWidth="11" />)}
          {[58,138,230,298].map(n => <path key={`v${n}`} d={`M${n} 0 V184`} stroke="#fff" strokeWidth="10" />)}
          <path d="M42 142 C94 142 94 91 156 91 S235 37 298 37" stroke="#a4c7e9" strokeWidth="13" fill="none" strokeLinecap="round" />
          <path d="M42 142 C94 142 94 91 156 91 S235 37 298 37" stroke="#2563eb" strokeWidth="4" fill="none" strokeDasharray="6 6" strokeLinecap="round" />
          <circle cx="42" cy="142" r="9" fill="#fff" stroke="#2563eb" strokeWidth="3" />
          <circle cx="156" cy="91" r="8" fill={step >= 1 ? "#f59e0b" : "#cbd5e1"} stroke="#fff" strokeWidth="3" />
          <circle cx="298" cy="37" r="9" fill="#fff" stroke="#16a34a" strokeWidth="3" />
          <g style={{ transform: `translate(${x}px, ${y}px)`, transition: reducedMotion ? "none" : "transform 850ms ease-in-out" }}>
            <circle r="19" fill="#1d4ed8" opacity=".14" />
            <rect x="-14" y="-9" width="28" height="18" rx="6" fill="#1d4ed8" stroke="#fff" strokeWidth="1.5" />
            <rect x="-8" y="-7" width="12" height="6" rx="2" fill="#bfdbfe" />
            <circle cx="-8" cy="9" r="3" fill="#1e293b" />
            <circle cx="8" cy="9" r="3" fill="#1e293b" />
          </g>
          <rect x="12" y="10" width="94" height="24" rx="8" fill="#fff" />
          <text x="59" y="26" textAnchor="middle" fontSize="10" fill="#1e293b">Lugbe, Abuja</text>
          <rect x="223" y="145" width="105" height="24" rx="8" fill="#fff" />
          <text x="275" y="161" textAnchor="middle" fontSize="10" fill="#1e293b">Central Area</text>
        </svg>
      </div>
      <div aria-live="polite" className="text-left mt-3 min-h-[74px]">
        <p className="font-bold text-sm text-gazie-navy">{step + 1}. {steps[step].title}</p>
        <p className="text-xs leading-relaxed text-gazie-navy/70 mt-1">{steps[step].description}</p>
      </div>
      <div className="flex gap-1 my-3" role="progressbar" aria-label="Journey progress" aria-valuenow={step + 1} aria-valuemin={1} aria-valuemax={5}>
        {steps.map((_, index) => <div key={index} className={`h-1.5 flex-1 rounded-full ${index <= step ? "bg-gazie-navy" : "bg-gazie-navy/15"}`} />)}
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <button type="button" onClick={() => move(step - 1)} disabled={step === 0} aria-label="Previous step" className="rounded-lg border border-gazie-navy/20 p-2 disabled:opacity-40"><ArrowLeft size={16} /></button>
        <button type="button" onClick={() => move(step + 1)} disabled={step === steps.length - 1} aria-label="Next step" className="rounded-lg border border-gazie-navy/20 p-2 disabled:opacity-40"><ArrowRight size={16} /></button>
        <button type="button" onClick={() => { if (step === steps.length - 1) setStep(0); setPlaying(!playing); }} disabled={reducedMotion} className="inline-flex items-center gap-1.5 rounded-lg bg-gazie-navy px-3 py-2 text-xs font-bold text-white disabled:opacity-40">
          {playing ? <Pause size={14} /> : <Play size={14} />}{playing ? "Pause" : "Play"}
        </button>
        <button type="button" onClick={() => move(0)} className="inline-flex items-center gap-1 rounded-lg border border-gazie-navy/20 px-3 py-2 text-xs"><RotateCcw size={14} /> Restart</button>
      </div>
      <p className="mt-3 text-left text-[10px] text-gazie-navy/55">Illustrative demo only. No live location, booking, or payment data is used.</p>
    </section>
  );
}
