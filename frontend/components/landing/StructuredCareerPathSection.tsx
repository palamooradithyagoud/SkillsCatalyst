"use client";

import React, { useRef, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, useInView } from "framer-motion";
import {
  Layers,
  MessageCircle,
  BookOpen,
  TrendingUp,
  Trophy,
  ArrowRight,
} from "lucide-react";
import SkillsCatalystLogo from "@/components/SkillsCatalystLogo";

export default function StructuredCareerPathSection() {
  const router = useRouter();
  const sectionRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(sectionRef, { once: false, margin: "-80px" });

  // Animation phase:
  // 0 = Initial wait
  // 1 = Left cards active, Left lines drawing towards SkillsCatalyst
  // 2 = Convergence at SkillsCatalyst (shockwave, center card lights up)
  // 3 = Right lines drawing outward, Right cards reveal
  // 4 = Continuous ambient pulse loop
  const [animPhase, setAnimPhase] = useState<number>(0);
  const [activeCard, setActiveCard] = useState<string | null>(null);

  useEffect(() => {
    if (!isInView) {
      setAnimPhase(0);
      return;
    }

    // Phase 1: Left lines start drawing immediately
    setAnimPhase(1);

    // Phase 2: Lines meet at SkillsCatalyst center after 1.2s
    const timer1 = setTimeout(() => {
      setAnimPhase(2);
    }, 1200);

    // Phase 3: Energy leaves SkillsCatalyst & reveals Right side after 2.2s
    const timer2 = setTimeout(() => {
      setAnimPhase(3);
    }, 2200);

    // Phase 4: Continuous ambient energy loop after 3.4s
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
      className="relative w-full bg-[#020208] text-white pt-14 sm:pt-20 pb-16 sm:pb-24 overflow-hidden flex flex-col items-center select-none"
    >
      {/* Background Starfield & Radial Ambient Glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[750px] h-[550px] bg-gradient-to-tr from-fuchsia-600/15 via-purple-600/10 to-sky-500/10 rounded-full blur-[130px]" />
        <div className="absolute top-12 left-16 w-1.5 h-1.5 rounded-full bg-white/40 blur-[0.5px] animate-pulse" />
        <div className="absolute top-28 right-28 w-2 h-2 rounded-full bg-pink-400/50 blur-[1px] animate-ping" />
        <div className="absolute bottom-48 left-1/3 w-1 h-1 rounded-full bg-sky-300/40" />
        <div className="absolute top-1/2 right-16 w-2 h-2 rounded-full bg-purple-400/40 blur-[1px]" />
      </div>

      <div className="relative z-10 w-full max-w-6xl px-4 sm:px-6 flex flex-col items-center">
        {/* ── Section Header ── */}
        <motion.div
          initial={{ opacity: 0, y: 25 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 25 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          className="text-center space-y-2 mb-10 sm:mb-14"
        >
          <h2 className="text-3xl sm:text-5xl md:text-6xl font-black tracking-tight text-white drop-shadow-md">
            Your career shouldn’t feel confusing.
          </h2>
          <div className="relative inline-block">
            <h3 className="text-2xl sm:text-4xl md:text-5xl font-extrabold italic tracking-tight bg-gradient-to-r from-pink-400 via-fuchsia-400 to-pink-500 bg-clip-text text-transparent drop-shadow-sm pr-1">
              Get a clear path. Build the right skills.
            </h3>
            <svg
              className="absolute -bottom-2 left-0 w-full h-2 text-pink-500/50"
              viewBox="0 0 100 10"
              preserveAspectRatio="none"
            >
              <path
                d="M 0 5 Q 50 10 100 5"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
              />
            </svg>
          </div>
        </motion.div>

        {/* ── Desktop 3-Column Diagram with Mathematically Aligned SVG Lines ── */}
        <div className="relative w-full max-w-5xl my-4 hidden md:flex items-center justify-between h-[400px]">
          {/* ═══════════════ COLUMN 1: 3 LEFT PROBLEM CARDS ═══════════════ */}
          <div className="flex flex-col justify-between h-[400px] w-64 shrink-0 z-20 py-2">
            {/* Card 1: Too many resources (Center y=36px) */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={animPhase >= 1 ? { opacity: 1, x: 0 } : { opacity: 0, x: -30 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              onMouseEnter={() => setActiveCard("resources")}
              onMouseLeave={() => setActiveCard(null)}
              className={`h-[68px] relative flex items-center gap-3.5 px-3.5 rounded-2xl bg-[#0c101a]/95 backdrop-blur-md border transition-all duration-300 shadow-xl cursor-default ${
                activeCard === "resources"
                  ? "border-sky-400 shadow-[0_0_20px_rgba(56,189,248,0.35)] scale-[1.02]"
                  : "border-slate-800 hover:border-sky-400/60"
              }`}
            >
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-slate-800 to-sky-950/80 border border-sky-500/30 flex items-center justify-center shrink-0 shadow-inner">
                <Layers className="w-5 h-5 text-sky-400" />
              </div>
              <div className="text-left">
                <span className="text-sm font-black text-white leading-tight block">
                  Too many
                </span>
                <span className="text-xs text-slate-300 font-medium">
                  resources
                </span>
              </div>
              {/* Connector Dot */}
              <div
                className={`absolute -right-1.5 top-1/2 -translate-y-1/2 w-3 h-3 rounded-full border-2 border-black transition-all ${
                  animPhase >= 1
                    ? "bg-sky-400 shadow-[0_0_10px_#38bdf8]"
                    : "bg-slate-700"
                }`}
              />
            </motion.div>

            {/* Card 2: Endless YouTube tutorials (Center y=200px) */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={animPhase >= 1 ? { opacity: 1, x: 0 } : { opacity: 0, x: -30 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              onMouseEnter={() => setActiveCard("youtube")}
              onMouseLeave={() => setActiveCard(null)}
              className={`h-[68px] relative flex items-center gap-3.5 px-3.5 rounded-2xl bg-[#0c101a]/95 backdrop-blur-md border transition-all duration-300 shadow-xl cursor-default ${
                activeCard === "youtube"
                  ? "border-red-500 shadow-[0_0_20px_rgba(239,68,68,0.35)] scale-[1.02]"
                  : "border-slate-800 hover:border-red-500/60"
              }`}
            >
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-950/70 to-slate-900 border border-red-500/30 flex items-center justify-center shrink-0 shadow-inner">
                <div className="w-5 h-3.5 bg-red-600 rounded flex items-center justify-center shadow">
                  <div className="w-0 h-0 border-y-[3px] border-y-transparent border-l-[5px] border-l-white ml-0.5" />
                </div>
              </div>
              <div className="text-left">
                <span className="text-sm font-black text-white leading-tight block">
                  Endless YouTube
                </span>
                <span className="text-xs text-slate-300 font-medium">
                  tutorials
                </span>
              </div>
              {/* Connector Dot */}
              <div
                className={`absolute -right-1.5 top-1/2 -translate-y-1/2 w-3 h-3 rounded-full border-2 border-black transition-all ${
                  animPhase >= 1
                    ? "bg-sky-400 shadow-[0_0_10px_#38bdf8]"
                    : "bg-slate-700"
                }`}
              />
            </motion.div>

            {/* Card 3: Everyone says something different (Center y=364px) */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={animPhase >= 1 ? { opacity: 1, x: 0 } : { opacity: 0, x: -30 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              onMouseEnter={() => setActiveCard("different")}
              onMouseLeave={() => setActiveCard(null)}
              className={`h-[68px] relative flex items-center gap-3.5 px-3.5 rounded-2xl bg-[#0c101a]/95 backdrop-blur-md border transition-all duration-300 shadow-xl cursor-default ${
                activeCard === "different"
                  ? "border-purple-400 shadow-[0_0_20px_rgba(192,132,252,0.35)] scale-[1.02]"
                  : "border-slate-800 hover:border-purple-400/60"
              }`}
            >
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-950/70 to-slate-900 border border-purple-500/30 flex items-center justify-center shrink-0 shadow-inner">
                <MessageCircle className="w-5 h-5 text-purple-400" />
              </div>
              <div className="text-left">
                <span className="text-sm font-black text-white leading-tight block">
                  Everyone says
                </span>
                <span className="text-xs text-slate-300 font-medium">
                  something different
                </span>
              </div>
              {/* Connector Dot */}
              <div
                className={`absolute -right-1.5 top-1/2 -translate-y-1/2 w-3 h-3 rounded-full border-2 border-black transition-all ${
                  animPhase >= 1
                    ? "bg-sky-400 shadow-[0_0_10px_#38bdf8]"
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
                <linearGradient id="leftPathGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#38bdf8" />
                  <stop offset="50%" stopColor="#a855f7" />
                  <stop offset="100%" stopColor="#ec4899" />
                </linearGradient>
                <filter id="glowLeft" x="-30%" y="-30%" width="160%" height="160%">
                  <feGaussianBlur stdDeviation="2.5" result="blur" />
                  <feMerge>
                    <feMergeNode in="blur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
              </defs>

              {/* Inactive Base Tracks */}
              <path
                d="M 0,36 C 55,36 45,200 100,200"
                fill="none"
                stroke="#151b2e"
                strokeWidth="2.5"
              />
              <path
                d="M 0,200 L 100,200"
                fill="none"
                stroke="#151b2e"
                strokeWidth="2.5"
              />
              <path
                d="M 0,364 C 55,364 45,200 100,200"
                fill="none"
                stroke="#151b2e"
                strokeWidth="2.5"
              />

              {/* Animated Flowing Gradient Lines */}
              <motion.path
                d="M 0,36 C 55,36 45,200 100,200"
                fill="none"
                stroke="url(#leftPathGrad)"
                strokeWidth="3.2"
                filter="url(#glowLeft)"
                initial={{ pathLength: 0 }}
                animate={animPhase >= 1 ? { pathLength: 1 } : { pathLength: 0 }}
                transition={{ duration: 1.1, ease: "easeInOut" }}
              />
              <motion.path
                d="M 0,200 L 100,200"
                fill="none"
                stroke="url(#leftPathGrad)"
                strokeWidth="3.2"
                filter="url(#glowLeft)"
                initial={{ pathLength: 0 }}
                animate={animPhase >= 1 ? { pathLength: 1 } : { pathLength: 0 }}
                transition={{ duration: 1.0, ease: "easeInOut" }}
              />
              <motion.path
                d="M 0,364 C 55,364 45,200 100,200"
                fill="none"
                stroke="url(#leftPathGrad)"
                strokeWidth="3.2"
                filter="url(#glowLeft)"
                initial={{ pathLength: 0 }}
                animate={animPhase >= 1 ? { pathLength: 1 } : { pathLength: 0 }}
                transition={{ duration: 1.1, ease: "easeInOut" }}
              />

              {/* Traveling Light Pulse Comets */}
              {animPhase >= 1 && (
                <>
                  <circle r="4" fill="#38bdf8" filter="url(#glowLeft)">
                    <animateMotion
                      path="M 0,36 C 55,36 45,200 100,200"
                      dur="2.5s"
                      repeatCount="indefinite"
                    />
                  </circle>
                  <circle r="4" fill="#a855f7" filter="url(#glowLeft)">
                    <animateMotion
                      path="M 0,200 L 100,200"
                      dur="2.2s"
                      repeatCount="indefinite"
                    />
                  </circle>
                  <circle r="4" fill="#38bdf8" filter="url(#glowLeft)">
                    <animateMotion
                      path="M 0,364 C 55,364 45,200 100,200"
                      dur="2.5s"
                      repeatCount="indefinite"
                    />
                  </circle>
                </>
              )}
            </svg>
          </div>

          {/* ═══════════════ COLUMN 2: CENTER SKILLSCATALYST CARD ═══════════════ */}
          <div className="relative w-72 lg:w-80 shrink-0 z-30 flex items-center justify-center">
            {/* Left Connector Node (Meeting Point of Left Lines) */}
            <motion.div
              animate={
                animPhase >= 2
                  ? {
                      scale: [1, 1.6, 1],
                      boxShadow: [
                        "0 0 10px #ec4899",
                        "0 0 30px #ec4899",
                        "0 0 12px #ec4899",
                      ],
                    }
                  : {}
              }
              transition={{ repeat: Infinity, duration: 2 }}
              className={`absolute -left-2.5 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full border-2 border-black z-40 transition-all ${
                animPhase >= 2 ? "bg-fuchsia-400 shadow-[0_0_18px_#e879f9]" : "bg-slate-700"
              }`}
            />

            {/* Right Connector Node (Origin of Right Lines) */}
            <motion.div
              animate={
                animPhase >= 3
                  ? {
                      scale: [1, 1.6, 1],
                      boxShadow: [
                        "0 0 10px #ec4899",
                        "0 0 30px #ec4899",
                        "0 0 12px #ec4899",
                      ],
                    }
                  : {}
              }
              transition={{ repeat: Infinity, duration: 2, delay: 0.5 }}
              className={`absolute -right-2.5 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full border-2 border-black z-40 transition-all ${
                animPhase >= 3 ? "bg-fuchsia-400 shadow-[0_0_18px_#e879f9]" : "bg-slate-700"
              }`}
            />

            {/* Main Central Card */}
            <motion.div
              animate={
                animPhase >= 2
                  ? {
                      opacity: 1,
                      scale: animPhase === 2 ? [0.98, 1.03, 1] : 1,
                      boxShadow: [
                        "0 0 25px rgba(236,72,153,0.3)",
                        "0 0 60px rgba(217,70,239,0.5)",
                        "0 0 30px rgba(236,72,153,0.3)",
                      ],
                    }
                  : { opacity: 0.85, scale: 0.98, boxShadow: "0 0 15px rgba(0,0,0,0.5)" }
              }
              transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
              className="w-full relative p-6 sm:p-7 rounded-3xl bg-[#090a14] border-2 border-fuchsia-500/70 backdrop-blur-xl flex flex-col items-center text-center overflow-hidden transition-all duration-500"
            >
              {/* Subtle energetic top glow */}
              <div className="absolute top-0 right-0 w-36 h-36 bg-fuchsia-500/15 rounded-full blur-2xl pointer-events-none" />

              {/* ── Official SkillsCatalyst Brand Logo ── */}
              <motion.div
                animate={animPhase >= 2 ? { scale: [1, 1.08, 1] } : {}}
                transition={{ duration: 2.6, repeat: Infinity, ease: "easeInOut" }}
                className="relative my-2 w-14 h-14 flex items-center justify-center drop-shadow-[0_0_18px_rgba(236,72,153,0.7)]"
              >
                <SkillsCatalystLogo size="md" showText={false} animated={true} />
              </motion.div>

              {/* Brand Title */}
              <h4 className="text-xl sm:text-2xl font-black text-white tracking-tight mt-1">
                SkillsCatalyst
              </h4>

              {/* Subtitle */}
              <p className="text-xs sm:text-[13px] text-slate-300 font-medium leading-snug mt-2 max-w-[220px]">
                Your structured path from learning to career readiness.
              </p>

              {/* Action Button */}
              <div className="mt-5 w-full">
                <button
                  type="button"
                  onClick={handleExplore}
                  className="w-full py-3 px-4 rounded-full bg-gradient-to-r from-pink-500 via-fuchsia-500 to-pink-500 hover:from-pink-400 hover:to-fuchsia-400 text-white font-black text-[11px] sm:text-xs tracking-wider uppercase shadow-lg shadow-pink-500/40 hover:shadow-pink-500/60 active:scale-95 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <span>EXPLORE YOUR CAREER PATH</span>
                  <ArrowRight className="w-3.5 h-3.5 stroke-[3]" />
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
                <linearGradient id="rightPathGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#ec4899" />
                  <stop offset="50%" stopColor="#d946ef" />
                  <stop offset="100%" stopColor="#f43f5e" />
                </linearGradient>
                <filter id="glowRight" x="-30%" y="-30%" width="160%" height="160%">
                  <feGaussianBlur stdDeviation="2.5" result="blur" />
                  <feMerge>
                    <feMergeNode in="blur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
              </defs>

              {/* Inactive Base Tracks */}
              <path
                d="M 0,200 C 45,200 55,36 100,36"
                fill="none"
                stroke="#151b2e"
                strokeWidth="2.5"
              />
              <path
                d="M 0,200 L 100,200"
                fill="none"
                stroke="#151b2e"
                strokeWidth="2.5"
              />
              <path
                d="M 0,200 C 45,200 55,364 100,364"
                fill="none"
                stroke="#151b2e"
                strokeWidth="2.5"
              />

              {/* Animated Glowing Lines Flowing Out to the Right */}
              <motion.path
                d="M 0,200 C 45,200 55,36 100,36"
                fill="none"
                stroke="url(#rightPathGrad)"
                strokeWidth="3.2"
                filter="url(#glowRight)"
                initial={{ pathLength: 0, opacity: 0 }}
                animate={animPhase >= 3 ? { pathLength: 1, opacity: 1 } : { pathLength: 0, opacity: 0 }}
                transition={{ duration: 1.1, ease: "easeInOut" }}
              />
              <motion.path
                d="M 0,200 L 100,200"
                fill="none"
                stroke="url(#rightPathGrad)"
                strokeWidth="3.2"
                filter="url(#glowRight)"
                initial={{ pathLength: 0, opacity: 0 }}
                animate={animPhase >= 3 ? { pathLength: 1, opacity: 1 } : { pathLength: 0, opacity: 0 }}
                transition={{ duration: 1.0, ease: "easeInOut" }}
              />
              <motion.path
                d="M 0,200 C 45,200 55,364 100,364"
                fill="none"
                stroke="url(#rightPathGrad)"
                strokeWidth="3.2"
                filter="url(#glowRight)"
                initial={{ pathLength: 0, opacity: 0 }}
                animate={animPhase >= 3 ? { pathLength: 1, opacity: 1 } : { pathLength: 0, opacity: 0 }}
                transition={{ duration: 1.1, ease: "easeInOut" }}
              />

              {/* Traveling Light Pulse Comets */}
              {animPhase >= 3 && (
                <>
                  <circle r="4" fill="#f43f5e" filter="url(#glowRight)">
                    <animateMotion
                      path="M 0,200 C 45,200 55,36 100,36"
                      dur="2.5s"
                      repeatCount="indefinite"
                    />
                  </circle>
                  <circle r="4" fill="#ec4899" filter="url(#glowRight)">
                    <animateMotion
                      path="M 0,200 L 100,200"
                      dur="2.2s"
                      repeatCount="indefinite"
                    />
                  </circle>
                  <circle r="4" fill="#d946ef" filter="url(#glowRight)">
                    <animateMotion
                      path="M 0,200 C 45,200 55,364 100,364"
                      dur="2.5s"
                      repeatCount="indefinite"
                    />
                  </circle>
                </>
              )}
            </svg>
          </div>

          {/* ═══════════════ COLUMN 3: 3 RIGHT SOLUTION CARDS ═══════════════ */}
          <div className="flex flex-col justify-between h-[400px] w-64 shrink-0 z-20 py-2">
            {/* Card 1: Structured learning (Center y=36px) */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={animPhase >= 3 ? { opacity: 1, x: 0 } : { opacity: 0, x: 30 }}
              transition={{ duration: 0.5, delay: 0.15 }}
              onMouseEnter={() => setActiveCard("learning")}
              onMouseLeave={() => setActiveCard(null)}
              className={`h-[68px] relative flex items-center gap-3.5 px-3.5 rounded-2xl bg-[#0c101a]/95 backdrop-blur-md border transition-all duration-300 shadow-xl cursor-default ${
                activeCard === "learning"
                  ? "border-pink-400 shadow-[0_0_20px_rgba(244,63,94,0.35)] scale-[1.02]"
                  : "border-slate-800 hover:border-pink-500/60"
              }`}
            >
              {/* Connector Dot */}
              <div
                className={`absolute -left-1.5 top-1/2 -translate-y-1/2 w-3 h-3 rounded-full border-2 border-black transition-all ${
                  animPhase >= 3
                    ? "bg-fuchsia-400 shadow-[0_0_10px_#e879f9]"
                    : "bg-slate-700"
                }`}
              />
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-pink-950/70 to-slate-900 border border-pink-500/30 flex items-center justify-center shrink-0 shadow-inner">
                <BookOpen className="w-5 h-5 text-pink-400" />
              </div>
              <div className="text-left">
                <span className="text-sm font-black text-white leading-tight block">
                  Structured
                </span>
                <span className="text-xs text-slate-300 font-medium">
                  learning
                </span>
              </div>
            </motion.div>

            {/* Card 2: Career-ready skills (Center y=200px) */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={animPhase >= 3 ? { opacity: 1, x: 0 } : { opacity: 0, x: 30 }}
              transition={{ duration: 0.5, delay: 0.25 }}
              onMouseEnter={() => setActiveCard("skills")}
              onMouseLeave={() => setActiveCard(null)}
              className={`h-[68px] relative flex items-center gap-3.5 px-3.5 rounded-2xl bg-[#0c101a]/95 backdrop-blur-md border transition-all duration-300 shadow-xl cursor-default ${
                activeCard === "skills"
                  ? "border-fuchsia-400 shadow-[0_0_20px_rgba(217,70,239,0.35)] scale-[1.02]"
                  : "border-slate-800 hover:border-fuchsia-500/60"
              }`}
            >
              {/* Connector Dot */}
              <div
                className={`absolute -left-1.5 top-1/2 -translate-y-1/2 w-3 h-3 rounded-full border-2 border-black transition-all ${
                  animPhase >= 3
                    ? "bg-fuchsia-400 shadow-[0_0_10px_#e879f9]"
                    : "bg-slate-700"
                }`}
              />
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-fuchsia-950/70 to-slate-900 border border-fuchsia-500/30 flex items-center justify-center shrink-0 shadow-inner">
                <TrendingUp className="w-5 h-5 text-fuchsia-400" />
              </div>
              <div className="text-left">
                <span className="text-sm font-black text-white leading-tight block">
                  Career-ready
                </span>
                <span className="text-xs text-slate-300 font-medium">
                  skills
                </span>
              </div>
            </motion.div>

            {/* Card 3: Build confidence (Center y=364px) */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={animPhase >= 3 ? { opacity: 1, x: 0 } : { opacity: 0, x: 30 }}
              transition={{ duration: 0.5, delay: 0.35 }}
              onMouseEnter={() => setActiveCard("confidence")}
              onMouseLeave={() => setActiveCard(null)}
              className={`h-[68px] relative flex items-center gap-3.5 px-3.5 rounded-2xl bg-[#0c101a]/95 backdrop-blur-md border transition-all duration-300 shadow-xl cursor-default ${
                activeCard === "confidence"
                  ? "border-pink-400 shadow-[0_0_20px_rgba(244,63,94,0.35)] scale-[1.02]"
                  : "border-slate-800 hover:border-pink-500/60"
              }`}
            >
              {/* Connector Dot */}
              <div
                className={`absolute -left-1.5 top-1/2 -translate-y-1/2 w-3 h-3 rounded-full border-2 border-black transition-all ${
                  animPhase >= 3
                    ? "bg-fuchsia-400 shadow-[0_0_10px_#e879f9]"
                    : "bg-slate-700"
                }`}
              />
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-pink-950/70 to-slate-900 border border-pink-500/30 flex items-center justify-center shrink-0 shadow-inner">
                <Trophy className="w-5 h-5 text-pink-400" />
              </div>
              <div className="text-left">
                <span className="text-sm font-black text-white leading-tight block">
                  Build
                </span>
                <span className="text-xs text-slate-300 font-medium">
                  confidence
                </span>
              </div>
            </motion.div>
          </div>
        </div>

        {/* ── Mobile Layout (Stacked Vertical Flow) ── */}
        <div className="flex md:hidden flex-col items-center w-full max-w-sm space-y-3.5 my-6">
          {/* 3 Left Cards on Mobile */}
          <div className="w-full space-y-2.5">
            <div className="p-3 rounded-xl bg-[#0c101a] border border-slate-800 flex items-center gap-3">
              <Layers className="w-4 h-4 text-sky-400 shrink-0" />
              <span className="text-xs font-bold text-white">Too many resources</span>
            </div>
            <div className="p-3 rounded-xl bg-[#0c101a] border border-slate-800 flex items-center gap-3">
              <div className="w-4 h-3 bg-red-600 rounded flex items-center justify-center shrink-0">
                <div className="w-0 h-0 border-y-[2px] border-y-transparent border-l-[4px] border-l-white ml-0.5" />
              </div>
              <span className="text-xs font-bold text-white">Endless YouTube tutorials</span>
            </div>
            <div className="p-3 rounded-xl bg-[#0c101a] border border-slate-800 flex items-center gap-3">
              <MessageCircle className="w-4 h-4 text-purple-400 shrink-0" />
              <span className="text-xs font-bold text-white">Everyone says something different</span>
            </div>
          </div>

          {/* Central Downward Pulse Arrow */}
          <div className="flex flex-col items-center gap-1 my-1">
            <div className="w-0.5 h-6 bg-gradient-to-b from-sky-400 to-pink-500 animate-pulse" />
            <div className="w-2 h-2 rounded-full bg-pink-500 shadow-[0_0_8px_#ec4899]" />
          </div>

          {/* Center Card on Mobile */}
          <div className="w-full p-5 rounded-2xl bg-[#090a14] border-2 border-fuchsia-500/70 text-center shadow-xl flex flex-col items-center">
            <div className="w-12 h-12 flex items-center justify-center mb-1">
              <SkillsCatalystLogo size="sm" showText={false} animated={true} />
            </div>
            <h4 className="text-lg font-black text-white">SkillsCatalyst</h4>
            <p className="text-xs text-slate-300 mt-1">Your structured path from learning to career readiness.</p>
            <button
              type="button"
              onClick={handleExplore}
              className="mt-4 w-full py-2.5 rounded-full bg-gradient-to-r from-pink-500 to-fuchsia-500 text-white font-black text-xs uppercase tracking-wider"
            >
              EXPLORE YOUR CAREER PATH ➔
            </button>
          </div>

          {/* Central Downward Pulse Arrow */}
          <div className="flex flex-col items-center gap-1 my-1">
            <div className="w-2 h-2 rounded-full bg-pink-500 shadow-[0_0_8px_#ec4899]" />
            <div className="w-0.5 h-6 bg-gradient-to-b from-pink-500 to-fuchsia-400 animate-pulse" />
          </div>

          {/* 3 Right Cards on Mobile */}
          <div className="w-full space-y-2.5">
            <div className="p-3 rounded-xl bg-[#0c101a] border border-slate-800 flex items-center gap-3">
              <BookOpen className="w-4 h-4 text-pink-400 shrink-0" />
              <span className="text-xs font-bold text-white">Structured learning</span>
            </div>
            <div className="p-3 rounded-xl bg-[#0c101a] border border-slate-800 flex items-center gap-3">
              <TrendingUp className="w-4 h-4 text-fuchsia-400 shrink-0" />
              <span className="text-xs font-bold text-white">Career-ready skills</span>
            </div>
            <div className="p-3 rounded-xl bg-[#0c101a] border border-slate-800 flex items-center gap-3">
              <Trophy className="w-4 h-4 text-pink-400 shrink-0" />
              <span className="text-xs font-bold text-white">Build confidence</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
