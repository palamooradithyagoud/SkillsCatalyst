"use client";

import React, { useRef, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, useInView } from "framer-motion";
import SkillsCatalystLogo from "@/components/SkillsCatalystLogo";

// ── Custom Brand SVG Icons (Zero default stock Lucide output) ──
function ResourceStackIcon({ className = "w-5 h-5 text-slate-300" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <path d="M4 7l8-4 8 4-8 4-8-4z" />
      <path d="M4 12l8 4 8-4" />
      <path d="M4 17l8 4 8-4" />
    </svg>
  );
}

function VideoPlayIcon({ className = "w-5 h-5 text-rose-400" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <rect x="2" y="4" width="20" height="16" rx="4" />
      <polygon points="10 8 16 12 10 16 10 8" fill="currentColor" stroke="none" />
    </svg>
  );
}

function ConflictingVoicesIcon({ className = "w-5 h-5 text-slate-300" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
      <path d="M8 12h.01M12 12h.01M16 12h.01" strokeWidth="3" />
    </svg>
  );
}

function CurriculumTrackIcon({ className = "w-5 h-5 text-[#d5ff38]" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <circle cx="6" cy="6" r="3" />
      <circle cx="18" cy="12" r="3" />
      <circle cx="6" cy="18" r="3" />
      <path d="M8.5 7.5l7 3M8.5 16.5l7-3" strokeWidth="2" strokeDasharray="3 3" />
    </svg>
  );
}

function CareerReadinessIcon({ className = "w-5 h-5 text-[#d5ff38]" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <path d="M3 3v18h18" />
      <path d="M7 15l4-5 4 3 6-7" strokeWidth="2.5" />
      <circle cx="11" cy="10" r="1.5" fill="currentColor" />
      <circle cx="15" cy="13" r="1.5" fill="currentColor" />
      <circle cx="21" cy="6" r="1.5" fill="currentColor" />
    </svg>
  );
}

function ConfidenceBadgeIcon({ className = "w-5 h-5 text-[#d5ff38]" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <path d="M12 2l7 4v6c0 5-3.5 9.5-7 10-3.5-.5-7-5-7-10V6l7-4z" />
      <path d="M9 12l2 2 4-4" strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  );
}

function BrandArrowRightIcon({ className = "w-3.5 h-3.5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <path d="M3 8h10M9 4l4 4-4 4" />
    </svg>
  );
}

export default function StructuredCareerPathSection() {
  const router = useRouter();
  const sectionRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(sectionRef, { once: false, margin: "-80px" });

  const [animPhase, setAnimPhase] = useState<number>(0);
  const [activeCard, setActiveCard] = useState<string | null>(null);

  useEffect(() => {
    if (!isInView) {
      setAnimPhase(0);
      return;
    }

    setAnimPhase(1);

    const timer1 = setTimeout(() => {
      setAnimPhase(2);
    }, 1200);

    const timer2 = setTimeout(() => {
      setAnimPhase(3);
    }, 2200);

    const timer3 = setTimeout(() => {
      setAnimPhase(4);
    }, 3400);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
    };
  }, [isInView]);

  const handleExplore = () => {
    router.push("/login");
  };

  return (
    <section
      ref={sectionRef}
      className="relative w-full bg-[#10110E] text-white pt-16 sm:pt-22 pb-18 sm:pb-24 overflow-hidden flex flex-col items-center select-none border-t border-b border-[#24271F]"
    >
      {/* ── Subtle Technical Blueprint Pattern (Engineered grid, zero AI gradient blobs) ── */}
      <div className="absolute inset-0 pointer-events-none opacity-20" aria-hidden="true">
        <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="careerGridPattern" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(255, 255, 255, 0.09)" strokeWidth="1" />
              <circle cx="0" cy="0" r="1.2" fill="#d5ff38" opacity="0.45" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#careerGridPattern)" />
        </svg>
      </div>

      <div className="relative z-10 w-full max-w-6xl px-4 sm:px-6 flex flex-col items-center">
        {/* ── Section Header (Human-crafted, confident typography) ── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="text-center space-y-2 mb-12 sm:mb-16"
        >
          <h2 className="text-3xl sm:text-5xl md:text-6xl font-black tracking-tight text-white">
            Your career shouldn’t feel confusing.
          </h2>
          <div className="relative inline-block mt-2">
            <h3 className="text-2xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-slate-200">
              Get a clear path.{" "}
              <span className="text-[#d5ff38] font-black underline decoration-[#d5ff38]/40 decoration-wavy underline-offset-8">
                Build the right skills.
              </span>
            </h3>
          </div>
        </motion.div>

        {/* ── Desktop 3-Column Diagram with Mathematically Aligned SVG Lines ── */}
        <div className="relative w-full max-w-5xl my-4 hidden md:flex items-center justify-between h-[400px]">
          {/* ═══════════════ COLUMN 1: 3 LEFT PROBLEM CARDS ═══════════════ */}
          <div className="flex flex-col justify-between h-[400px] w-64 shrink-0 z-20 py-2">
            {/* Card 1: Too many resources */}
            <motion.div
              initial={{ opacity: 0, x: -24 }}
              animate={animPhase >= 1 ? { opacity: 1, x: 0 } : { opacity: 0, x: -24 }}
              transition={{ duration: 0.45, delay: 0.1 }}
              onMouseEnter={() => setActiveCard("resources")}
              onMouseLeave={() => setActiveCard(null)}
              className={`h-[68px] relative flex items-center gap-3.5 px-3.5 rounded-2xl bg-[#111319]/90 backdrop-blur-md border transition-all duration-300 shadow-lg cursor-default ${
                activeCard === "resources"
                  ? "border-slate-500 shadow-[0_4px_20px_rgba(0,0,0,0.5)] scale-[1.02]"
                  : "border-slate-800/80 hover:border-slate-600"
              }`}
            >
              <div className="w-10 h-10 rounded-xl bg-slate-900/90 border border-slate-700/60 flex items-center justify-center shrink-0">
                <ResourceStackIcon className="w-5 h-5 text-slate-300" />
              </div>
              <div className="text-left">
                <span className="text-sm font-bold text-white leading-tight block">
                  Too many
                </span>
                <span className="text-xs text-slate-400 font-medium">
                  unfiltered resources
                </span>
              </div>
              {/* Connector Dot */}
              <div
                className={`absolute -right-1.5 top-1/2 -translate-y-1/2 w-3 h-3 rounded-full border-2 border-[#08090D] transition-all duration-300 ${
                  animPhase >= 1
                    ? "bg-slate-400 shadow-[0_0_8px_rgba(148,163,184,0.4)]"
                    : "bg-slate-700"
                }`}
              />
            </motion.div>

            {/* Card 2: Endless YouTube tutorials */}
            <motion.div
              initial={{ opacity: 0, x: -24 }}
              animate={animPhase >= 1 ? { opacity: 1, x: 0 } : { opacity: 0, x: -24 }}
              transition={{ duration: 0.45, delay: 0.2 }}
              onMouseEnter={() => setActiveCard("youtube")}
              onMouseLeave={() => setActiveCard(null)}
              className={`h-[68px] relative flex items-center gap-3.5 px-3.5 rounded-2xl bg-[#111319]/90 backdrop-blur-md border transition-all duration-300 shadow-lg cursor-default ${
                activeCard === "youtube"
                  ? "border-slate-500 shadow-[0_4px_20px_rgba(0,0,0,0.5)] scale-[1.02]"
                  : "border-slate-800/80 hover:border-slate-600"
              }`}
            >
              <div className="w-10 h-10 rounded-xl bg-slate-900/90 border border-slate-700/60 flex items-center justify-center shrink-0">
                <VideoPlayIcon className="w-5 h-5 text-rose-400/90" />
              </div>
              <div className="text-left">
                <span className="text-sm font-bold text-white leading-tight block">
                  Endless passive
                </span>
                <span className="text-xs text-slate-400 font-medium">
                  video tutorials
                </span>
              </div>
              {/* Connector Dot */}
              <div
                className={`absolute -right-1.5 top-1/2 -translate-y-1/2 w-3 h-3 rounded-full border-2 border-[#08090D] transition-all duration-300 ${
                  animPhase >= 1
                    ? "bg-slate-400 shadow-[0_0_8px_rgba(148,163,184,0.4)]"
                    : "bg-slate-700"
                }`}
              />
            </motion.div>

            {/* Card 3: Everyone says something different */}
            <motion.div
              initial={{ opacity: 0, x: -24 }}
              animate={animPhase >= 1 ? { opacity: 1, x: 0 } : { opacity: 0, x: -24 }}
              transition={{ duration: 0.45, delay: 0.3 }}
              onMouseEnter={() => setActiveCard("different")}
              onMouseLeave={() => setActiveCard(null)}
              className={`h-[68px] relative flex items-center gap-3.5 px-3.5 rounded-2xl bg-[#111319]/90 backdrop-blur-md border transition-all duration-300 shadow-lg cursor-default ${
                activeCard === "different"
                  ? "border-slate-500 shadow-[0_4px_20px_rgba(0,0,0,0.5)] scale-[1.02]"
                  : "border-slate-800/80 hover:border-slate-600"
              }`}
            >
              <div className="w-10 h-10 rounded-xl bg-slate-900/90 border border-slate-700/60 flex items-center justify-center shrink-0">
                <ConflictingVoicesIcon className="w-5 h-5 text-slate-300" />
              </div>
              <div className="text-left">
                <span className="text-sm font-bold text-white leading-tight block">
                  Conflicting roadmap
                </span>
                <span className="text-xs text-slate-400 font-medium">
                  advice from all sides
                </span>
              </div>
              {/* Connector Dot */}
              <div
                className={`absolute -right-1.5 top-1/2 -translate-y-1/2 w-3 h-3 rounded-full border-2 border-[#08090D] transition-all duration-300 ${
                  animPhase >= 1
                    ? "bg-slate-400 shadow-[0_0_8px_rgba(148,163,184,0.4)]"
                    : "bg-slate-700"
                }`}
              />
            </motion.div>
          </div>

          {/* ═══════════════ SVG CONNECTOR 1: LEFT TO CENTER ═══════════════ */}
          <div className="relative flex-1 h-[400px] pointer-events-none z-10">
            <svg
              className="w-full h-full overflow-visible"
              viewBox="0 0 100 400"
              preserveAspectRatio="none"
            >
              <defs>
                <linearGradient id="leftBrandPathGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#475569" />
                  <stop offset="65%" stopColor="#64748B" />
                  <stop offset="100%" stopColor="#d5ff38" />
                </linearGradient>
                <filter id="glowLeftMuted" x="-20%" y="-20%" width="140%" height="140%">
                  <feGaussianBlur stdDeviation="1.8" result="blur" />
                  <feMerge>
                    <feMergeNode in="blur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
              </defs>

              {/* Inactive Base Tracks */}
              <path d="M 0,36 C 55,36 45,200 100,200" fill="none" stroke="#1E2330" strokeWidth="2" />
              <path d="M 0,200 L 100,200" fill="none" stroke="#1E2330" strokeWidth="2" />
              <path d="M 0,364 C 55,364 45,200 100,200" fill="none" stroke="#1E2330" strokeWidth="2" />

              {/* Animated Flowing Lines */}
              <motion.path
                d="M 0,36 C 55,36 45,200 100,200"
                fill="none"
                stroke="url(#leftBrandPathGrad)"
                strokeWidth="2.8"
                filter="url(#glowLeftMuted)"
                initial={{ pathLength: 0 }}
                animate={animPhase >= 1 ? { pathLength: 1 } : { pathLength: 0 }}
                transition={{ duration: 1.1, ease: "easeInOut" }}
              />
              <motion.path
                d="M 0,200 L 100,200"
                fill="none"
                stroke="url(#leftBrandPathGrad)"
                strokeWidth="2.8"
                filter="url(#glowLeftMuted)"
                initial={{ pathLength: 0 }}
                animate={animPhase >= 1 ? { pathLength: 1 } : { pathLength: 0 }}
                transition={{ duration: 1.0, ease: "easeInOut" }}
              />
              <motion.path
                d="M 0,364 C 55,364 45,200 100,200"
                fill="none"
                stroke="url(#leftBrandPathGrad)"
                strokeWidth="2.8"
                filter="url(#glowLeftMuted)"
                initial={{ pathLength: 0 }}
                animate={animPhase >= 1 ? { pathLength: 1 } : { pathLength: 0 }}
                transition={{ duration: 1.1, ease: "easeInOut" }}
              />

              {/* Refined Signal Pulses */}
              {animPhase >= 1 && (
                <>
                  <circle r="3" fill="#d5ff38" filter="url(#glowLeftMuted)">
                    <animateMotion
                      path="M 0,36 C 55,36 45,200 100,200"
                      dur="2.8s"
                      repeatCount="indefinite"
                    />
                  </circle>
                  <circle r="3" fill="#94A3B8" filter="url(#glowLeftMuted)">
                    <animateMotion
                      path="M 0,200 L 100,200"
                      dur="2.4s"
                      repeatCount="indefinite"
                    />
                  </circle>
                  <circle r="3" fill="#d5ff38" filter="url(#glowLeftMuted)">
                    <animateMotion
                      path="M 0,364 C 55,364 45,200 100,200"
                      dur="2.8s"
                      repeatCount="indefinite"
                    />
                  </circle>
                </>
              )}
            </svg>
          </div>

          {/* ═══════════════ COLUMN 2: CENTER SKILLSCATALYST CARD ═══════════════ */}
          <div className="relative w-72 lg:w-80 shrink-0 z-30 flex items-center justify-center">
            {/* Left Connector Node */}
            <motion.div
              animate={
                animPhase >= 2
                  ? {
                      scale: [1, 1.25, 1],
                      boxShadow: [
                        "0 0 6px rgba(213,255,56,0.5)",
                        "0 0 16px rgba(213,255,56,0.8)",
                        "0 0 6px rgba(213,255,56,0.5)",
                      ],
                    }
                  : {}
              }
              transition={{ repeat: Infinity, duration: 2.2 }}
              className={`absolute -left-2.5 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full border-2 border-[#08090D] z-40 transition-all ${
                animPhase >= 2 ? "bg-[#d5ff38]" : "bg-slate-700"
              }`}
            />

            {/* Right Connector Node */}
            <motion.div
              animate={
                animPhase >= 3
                  ? {
                      scale: [1, 1.25, 1],
                      boxShadow: [
                        "0 0 6px rgba(213,255,56,0.5)",
                        "0 0 16px rgba(213,255,56,0.8)",
                        "0 0 6px rgba(213,255,56,0.5)",
                      ],
                    }
                  : {}
              }
              transition={{ repeat: Infinity, duration: 2.2, delay: 0.4 }}
              className={`absolute -right-2.5 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full border-2 border-[#08090D] z-40 transition-all ${
                animPhase >= 3 ? "bg-[#d5ff38]" : "bg-slate-700"
              }`}
            />

            {/* Main Central Card */}
            <motion.div
              animate={
                animPhase >= 2
                  ? {
                      opacity: 1,
                      scale: animPhase === 2 ? [0.98, 1.02, 1] : 1,
                      boxShadow: [
                        "0 4px 20px rgba(0,0,0,0.6)",
                        "0 8px 30px rgba(213,255,56,0.22)",
                        "0 4px 20px rgba(0,0,0,0.6)",
                      ],
                    }
                  : { opacity: 0.9, scale: 0.98 }
              }
              transition={{ duration: 2.8, repeat: Infinity, ease: "easeInOut" }}
              className="w-full relative p-6 sm:p-7 rounded-3xl bg-[#0F1117] border border-[#d5ff38]/40 hover:border-[#d5ff38]/70 backdrop-blur-xl flex flex-col items-center text-center overflow-hidden transition-all duration-300"
            >
              {/* Official Brand Logo */}
              <motion.div
                animate={animPhase >= 2 ? { scale: [1, 1.04, 1] } : {}}
                transition={{ duration: 2.6, repeat: Infinity, ease: "easeInOut" }}
                className="relative my-2 w-14 h-14 flex items-center justify-center"
              >
                <SkillsCatalystLogo size="md" showText={false} animated={true} theme="dark" />
              </motion.div>

              {/* Brand Title */}
              <h4 className="text-xl sm:text-2xl font-black text-white tracking-tight mt-1">
                SkillsCatalyst
              </h4>

              {/* Subtitle */}
              <p className="text-xs sm:text-[13px] text-slate-300 font-medium leading-relaxed mt-2 max-w-[220px]">
                Targeted roadmaps, compiler sandboxes, and AI-evaluated readiness scores.
              </p>

              {/* Action Button */}
              <div className="mt-5 w-full">
                <button
                  type="button"
                  onClick={handleExplore}
                  className="w-full py-3 px-4 rounded-full bg-[#d5ff38] hover:bg-[#c4ec32] text-[#0C0D12] font-black text-[11px] sm:text-xs tracking-wider uppercase shadow-md hover:shadow-lg active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>EXPLORE YOUR CAREER PATH</span>
                  <BrandArrowRightIcon className="w-3.5 h-3.5 stroke-[3]" />
                </button>
              </div>
            </motion.div>
          </div>

          {/* ═══════════════ SVG CONNECTOR 2: CENTER TO RIGHT ═══════════════ */}
          <div className="relative flex-1 h-[400px] pointer-events-none z-10">
            <svg
              className="w-full h-full overflow-visible"
              viewBox="0 0 100 400"
              preserveAspectRatio="none"
            >
              <defs>
                <linearGradient id="rightBrandPathGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#d5ff38" />
                  <stop offset="50%" stopColor="#bce62e" />
                  <stop offset="100%" stopColor="#e8ff8f" />
                </linearGradient>
                <filter id="glowRightMuted" x="-20%" y="-20%" width="140%" height="140%">
                  <feGaussianBlur stdDeviation="1.8" result="blur" />
                  <feMerge>
                    <feMergeNode in="blur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
              </defs>

              {/* Inactive Base Tracks */}
              <path d="M 0,200 C 45,200 55,36 100,36" fill="none" stroke="#1E2330" strokeWidth="2" />
              <path d="M 0,200 L 100,200" fill="none" stroke="#1E2330" strokeWidth="2" />
              <path d="M 0,200 C 45,200 55,364 100,364" fill="none" stroke="#1E2330" strokeWidth="2" />

              {/* Animated Lines Flowing Out to the Right */}
              <motion.path
                d="M 0,200 C 45,200 55,36 100,36"
                fill="none"
                stroke="url(#rightBrandPathGrad)"
                strokeWidth="2.8"
                filter="url(#glowRightMuted)"
                initial={{ pathLength: 0, opacity: 0 }}
                animate={animPhase >= 3 ? { pathLength: 1, opacity: 1 } : { pathLength: 0, opacity: 0 }}
                transition={{ duration: 1.1, ease: "easeInOut" }}
              />
              <motion.path
                d="M 0,200 L 100,200"
                fill="none"
                stroke="url(#rightBrandPathGrad)"
                strokeWidth="2.8"
                filter="url(#glowRightMuted)"
                initial={{ pathLength: 0, opacity: 0 }}
                animate={animPhase >= 3 ? { pathLength: 1, opacity: 1 } : { pathLength: 0, opacity: 0 }}
                transition={{ duration: 1.0, ease: "easeInOut" }}
              />
              <motion.path
                d="M 0,200 C 45,200 55,364 100,364"
                fill="none"
                stroke="url(#rightBrandPathGrad)"
                strokeWidth="2.8"
                filter="url(#glowRightMuted)"
                initial={{ pathLength: 0, opacity: 0 }}
                animate={animPhase >= 3 ? { pathLength: 1, opacity: 1 } : { pathLength: 0, opacity: 0 }}
                transition={{ duration: 1.1, ease: "easeInOut" }}
              />

              {/* Refined Signal Pulses */}
              {animPhase >= 3 && (
                <>
                  <circle r="3" fill="#d5ff38" filter="url(#glowRightMuted)">
                    <animateMotion
                      path="M 0,200 C 45,200 55,36 100,36"
                      dur="2.8s"
                      repeatCount="indefinite"
                    />
                  </circle>
                  <circle r="3" fill="#bce62e" filter="url(#glowRightMuted)">
                    <animateMotion
                      path="M 0,200 L 100,200"
                      dur="2.4s"
                      repeatCount="indefinite"
                    />
                  </circle>
                  <circle r="3" fill="#e8ff8f" filter="url(#glowRightMuted)">
                    <animateMotion
                      path="M 0,200 C 45,200 55,364 100,364"
                      dur="2.8s"
                      repeatCount="indefinite"
                    />
                  </circle>
                </>
              )}
            </svg>
          </div>

          {/* ═══════════════ COLUMN 3: 3 RIGHT SOLUTION CARDS ═══════════════ */}
          <div className="flex flex-col justify-between h-[400px] w-64 shrink-0 z-20 py-2">
            {/* Card 1: Structured learning */}
            <motion.div
              initial={{ opacity: 0, x: 24 }}
              animate={animPhase >= 3 ? { opacity: 1, x: 0 } : { opacity: 0, x: 24 }}
              transition={{ duration: 0.45, delay: 0.15 }}
              onMouseEnter={() => setActiveCard("learning")}
              onMouseLeave={() => setActiveCard(null)}
              className={`h-[68px] relative flex items-center gap-3.5 px-3.5 rounded-2xl bg-[#111319]/90 backdrop-blur-md border transition-all duration-300 shadow-lg cursor-default ${
                activeCard === "learning"
                  ? "border-[#d5ff38] shadow-[0_4px_20px_rgba(213,255,56,0.2)] scale-[1.02]"
                  : "border-slate-800/80 hover:border-[#d5ff38]/60"
              }`}
            >
              {/* Connector Dot */}
              <div
                className={`absolute -left-1.5 top-1/2 -translate-y-1/2 w-3 h-3 rounded-full border-2 border-[#08090D] transition-all duration-300 ${
                  animPhase >= 3
                    ? "bg-[#d5ff38] shadow-[0_0_8px_rgba(213,255,56,0.5)]"
                    : "bg-slate-700"
                }`}
              />
              <div className="w-10 h-10 rounded-xl bg-[#171d05] border border-[#d5ff38]/30 flex items-center justify-center shrink-0">
                <CurriculumTrackIcon className="w-5 h-5 text-[#d5ff38]" />
              </div>
              <div className="text-left">
                <span className="text-sm font-bold text-white leading-tight block">
                  Structured
                </span>
                <span className="text-xs text-slate-400 font-medium">
                  step-by-step tracks
                </span>
              </div>
            </motion.div>

            {/* Card 2: Career-ready skills */}
            <motion.div
              initial={{ opacity: 0, x: 24 }}
              animate={animPhase >= 3 ? { opacity: 1, x: 0 } : { opacity: 0, x: 24 }}
              transition={{ duration: 0.45, delay: 0.25 }}
              onMouseEnter={() => setActiveCard("skills")}
              onMouseLeave={() => setActiveCard(null)}
              className={`h-[68px] relative flex items-center gap-3.5 px-3.5 rounded-2xl bg-[#111319]/90 backdrop-blur-md border transition-all duration-300 shadow-lg cursor-default ${
                activeCard === "skills"
                  ? "border-[#d5ff38] shadow-[0_4px_20px_rgba(213,255,56,0.2)] scale-[1.02]"
                  : "border-slate-800/80 hover:border-[#d5ff38]/60"
              }`}
            >
              {/* Connector Dot */}
              <div
                className={`absolute -left-1.5 top-1/2 -translate-y-1/2 w-3 h-3 rounded-full border-2 border-[#08090D] transition-all duration-300 ${
                  animPhase >= 3
                    ? "bg-[#d5ff38] shadow-[0_0_8px_rgba(213,255,56,0.5)]"
                    : "bg-slate-700"
                }`}
              />
              <div className="w-10 h-10 rounded-xl bg-[#171d05] border border-[#d5ff38]/30 flex items-center justify-center shrink-0">
                <CareerReadinessIcon className="w-5 h-5 text-[#d5ff38]" />
              </div>
              <div className="text-left">
                <span className="text-sm font-bold text-white leading-tight block">
                  Verified
                </span>
                <span className="text-xs text-slate-400 font-medium">
                  placement readiness
                </span>
              </div>
            </motion.div>

            {/* Card 3: Build confidence */}
            <motion.div
              initial={{ opacity: 0, x: 24 }}
              animate={animPhase >= 3 ? { opacity: 1, x: 0 } : { opacity: 0, x: 24 }}
              transition={{ duration: 0.45, delay: 0.35 }}
              onMouseEnter={() => setActiveCard("confidence")}
              onMouseLeave={() => setActiveCard(null)}
              className={`h-[68px] relative flex items-center gap-3.5 px-3.5 rounded-2xl bg-[#111319]/90 backdrop-blur-md border transition-all duration-300 shadow-lg cursor-default ${
                activeCard === "confidence"
                  ? "border-[#d5ff38] shadow-[0_4px_20px_rgba(213,255,56,0.2)] scale-[1.02]"
                  : "border-slate-800/80 hover:border-[#d5ff38]/60"
              }`}
            >
              {/* Connector Dot */}
              <div
                className={`absolute -left-1.5 top-1/2 -translate-y-1/2 w-3 h-3 rounded-full border-2 border-[#08090D] transition-all duration-300 ${
                  animPhase >= 3
                    ? "bg-[#d5ff38] shadow-[0_0_8px_rgba(213,255,56,0.5)]"
                    : "bg-slate-700"
                }`}
              />
              <div className="w-10 h-10 rounded-xl bg-[#171d05] border border-[#d5ff38]/30 flex items-center justify-center shrink-0">
                <ConfidenceBadgeIcon className="w-5 h-5 text-[#d5ff38]" />
              </div>
              <div className="text-left">
                <span className="text-sm font-bold text-white leading-tight block">
                  Interview
                </span>
                <span className="text-xs text-slate-400 font-medium">
                  proven confidence
                </span>
              </div>
            </motion.div>
          </div>
        </div>

        {/* ── Mobile Layout (Refined vertical stack, zero neon clutter) ── */}
        <div className="flex md:hidden flex-col items-center w-full max-w-sm space-y-4 my-6">
          {/* Left Cards on Mobile */}
          <div className="w-full space-y-2.5">
            <div className="p-3.5 rounded-xl bg-[#111319] border border-slate-800 flex items-center gap-3">
              <ResourceStackIcon className="w-4 h-4 text-slate-300 shrink-0" />
              <span className="text-xs font-semibold text-slate-200">Too many unfiltered resources</span>
            </div>
            <div className="p-3.5 rounded-xl bg-[#111319] border border-slate-800 flex items-center gap-3">
              <VideoPlayIcon className="w-4 h-4 text-rose-400/90 shrink-0" />
              <span className="text-xs font-semibold text-slate-200">Endless passive video tutorials</span>
            </div>
            <div className="p-3.5 rounded-xl bg-[#111319] border border-slate-800 flex items-center gap-3">
              <ConflictingVoicesIcon className="w-4 h-4 text-slate-300 shrink-0" />
              <span className="text-xs font-semibold text-slate-200">Conflicting roadmap advice</span>
            </div>
          </div>

          {/* Central Connecting Trace */}
          <div className="flex flex-col items-center gap-1 my-1">
            <div className="w-0.5 h-6 bg-gradient-to-b from-slate-600 to-[#d5ff38]" />
            <div className="w-2 h-2 rounded-full bg-[#d5ff38]" />
          </div>

          {/* Center Card on Mobile */}
          <div className="w-full p-5 rounded-2xl bg-[#0F1117] border border-[#d5ff38]/50 text-center shadow-lg flex flex-col items-center">
            <div className="w-12 h-12 flex items-center justify-center mb-1">
              <SkillsCatalystLogo size="sm" showText={false} animated={true} theme="dark" />
            </div>
            <h4 className="text-lg font-black text-white">SkillsCatalyst</h4>
            <p className="text-xs text-slate-300 mt-1">Targeted roadmaps, compiler sandboxes, and AI-evaluated readiness scores.</p>
            <button
              type="button"
              onClick={handleExplore}
              className="mt-4 w-full py-2.5 rounded-full bg-[#d5ff38] hover:bg-[#c4ec32] text-[#0C0D12] font-black text-xs uppercase tracking-wider transition-all"
            >
              EXPLORE YOUR CAREER PATH ➔
            </button>
          </div>

          {/* Central Connecting Trace */}
          <div className="flex flex-col items-center gap-1 my-1">
            <div className="w-2 h-2 rounded-full bg-[#d5ff38]" />
            <div className="w-0.5 h-6 bg-gradient-to-b from-[#d5ff38] to-slate-600" />
          </div>

          {/* Right Cards on Mobile */}
          <div className="w-full space-y-2.5">
            <div className="p-3.5 rounded-xl bg-[#111319] border border-slate-800 flex items-center gap-3">
              <CurriculumTrackIcon className="w-4 h-4 text-[#d5ff38] shrink-0" />
              <span className="text-xs font-semibold text-slate-200">Structured step-by-step tracks</span>
            </div>
            <div className="p-3.5 rounded-xl bg-[#111319] border border-slate-800 flex items-center gap-3">
              <CareerReadinessIcon className="w-4 h-4 text-[#d5ff38] shrink-0" />
              <span className="text-xs font-semibold text-slate-200">Verified placement readiness</span>
            </div>
            <div className="p-3.5 rounded-xl bg-[#111319] border border-slate-800 flex items-center gap-3">
              <ConfidenceBadgeIcon className="w-4 h-4 text-[#d5ff38] shrink-0" />
              <span className="text-xs font-semibold text-slate-200">Interview proven confidence</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
