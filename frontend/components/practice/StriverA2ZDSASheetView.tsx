"use client";

import React, { useState, useEffect } from "react";
import {
  Bookmark,
  Sparkles,
  Database,
  ArrowRight,
  Code2,
  Layers,
  CheckCircle2,
  FileSpreadsheet,
} from "lucide-react";
import { motion } from "framer-motion";
import Image from "next/image";
import CursorGrid from "@/components/practice/CursorGrid";

export function StriverA2ZDSASheetView() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className="w-full space-y-6 sm:space-y-8 select-none">
      {/* ─────────────────────────────────────────────────────────────
          1. HERO HEADER: CYBER MATRIX EMERALD AURORA + STRIVER CARD
          ───────────────────────────────────────────────────────────── */}
      <style jsx>{`
        .striver-aurora {
          position: absolute;
          inset: 0;
          overflow: hidden;
          border-radius: 1.5rem;
          pointer-events: none;
          z-index: 0;
        }
        .striver-aurora-blob {
          position: absolute;
          border-radius: 9999px;
          filter: blur(55px);
          opacity: 0.35;
          mix-blend-mode: screen;
          animation: striver-drift 12s ease-in-out infinite alternate;
        }
        .striver-aurora-blob:nth-child(1) {
          width: 320px;
          height: 320px;
          background: radial-gradient(circle, #10b981 0%, transparent 70%);
          top: -80px;
          left: -40px;
          animation-duration: 10s;
        }
        .striver-aurora-blob:nth-child(2) {
          width: 380px;
          height: 380px;
          background: radial-gradient(circle, #059669 0%, transparent 70%);
          bottom: -100px;
          right: 15%;
          animation-duration: 14s;
          animation-delay: -3s;
        }
        .striver-aurora-blob:nth-child(3) {
          width: 260px;
          height: 260px;
          background: radial-gradient(circle, #22c55e 0%, transparent 70%);
          top: 20%;
          right: -40px;
          animation-duration: 11s;
          animation-delay: -6s;
        }
        @keyframes striver-drift {
          0% {
            transform: translate(0px, 0px) scale(1);
          }
          50% {
            transform: translate(30px, -20px) scale(1.08);
          }
          100% {
            transform: translate(-20px, 25px) scale(0.95);
          }
        }
      `}</style>

      <div className="relative rounded-3xl p-6 sm:p-8 md:p-10 bg-[#021308] border border-emerald-500/25 shadow-2xl overflow-hidden min-h-[300px] flex items-center">
        {/* Animated Emerald Aurora */}
        <div className="striver-aurora">
          <div className="striver-aurora-blob" />
          <div className="striver-aurora-blob" />
          <div className="striver-aurora-blob" />
        </div>

        {/* Interactive Cursor Grid on Backside */}
        <div className="absolute inset-0 z-0 overflow-hidden rounded-3xl pointer-events-auto">
          <CursorGrid
            color="#10B981"
            cellSize={48}
            gridOpacity={0.16}
            maxOpacity={0.75}
            fillOpacity={0.08}
            radius={150}
            holdTime={400}
            fadeDuration={800}
            clickPulse={true}
            pulseSpeed={600}
            className="w-full h-full"
          />
        </div>

        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6 sm:gap-10 my-auto w-full pointer-events-none">
          {/* Left Column: Clean Title + Progress Tracker */}
          <div className="flex flex-col gap-4 sm:gap-5 flex-1 w-full max-w-lg pointer-events-auto">
            {/* Title */}
            <div>
              <h1 className="text-2xl xs:text-3xl sm:text-4xl md:text-[40px] font-black text-white tracking-tight leading-tight drop-shadow-md">
                Strivers A2Z DSA Sheet
              </h1>
              <p className="text-slate-400 text-xs sm:text-sm font-semibold tracking-wide pt-1">
                Curated by Striver (TakeUForward)
              </p>
            </div>

            {/* "YOUR PROGRESS" TRACKER CARD (MATCHING REFERENCE WITH OUR PALETTE) */}
            <div className="bg-[#0b1410]/95 border border-white/10 rounded-2xl p-4 sm:p-5 shadow-2xl backdrop-blur-md w-full sm:max-w-[360px]">
              {/* Header */}
              <div className="text-[11px] font-bold text-slate-400 tracking-wider uppercase pb-3 border-b border-white/10">
                YOUR PROGRESS
              </div>

              {/* Tracker Body */}
              <div className="pt-4 flex items-center justify-between gap-5">
                {/* Left: Circular Progress Ring */}
                <div className="relative w-20 h-20 sm:w-22 sm:h-22 flex items-center justify-center shrink-0">
                  <svg className="w-full h-full -rotate-90" viewBox="0 0 96 96">
                    <defs>
                      <linearGradient id="striverProgressGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#34d399" />
                        <stop offset="100%" stopColor="#059669" />
                      </linearGradient>
                    </defs>
                    <circle
                      cx="48"
                      cy="48"
                      r="40"
                      stroke="rgba(255, 255, 255, 0.08)"
                      strokeWidth="7"
                      fill="none"
                    />
                    <circle
                      cx="48"
                      cy="48"
                      r="40"
                      stroke="url(#striverProgressGrad)"
                      strokeWidth="7"
                      strokeDasharray={2 * Math.PI * 40}
                      strokeDashoffset={2 * Math.PI * 40}
                      strokeLinecap="round"
                      fill="none"
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                    <span className="text-lg sm:text-xl font-black text-white leading-none">
                      0%
                    </span>
                    <span className="text-[10px] text-slate-400 font-medium mt-1">
                      Complete
                    </span>
                  </div>
                </div>

                {/* Right: Solved, Topics, Difficulty breakdown */}
                <div className="flex-1 flex flex-col justify-between gap-2.5">
                  {/* Row 1: Solved */}
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400 font-medium">Solved</span>
                    <span className="font-bold text-white tracking-tight">
                      <span className="text-white">0</span> / 455
                    </span>
                  </div>

                  {/* Row 2: Topics */}
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400 font-medium">Topics</span>
                    <span className="font-bold text-white tracking-tight">18</span>
                  </div>

                  {/* Row 3: Difficulty breakdown */}
                  <div className="flex items-center justify-between pt-1 border-t border-white/5 text-xs">
                    <div className="flex items-center gap-1.5">
                      <span className="font-extrabold text-emerald-400">E</span>
                      <span className="font-bold text-white">148</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="font-extrabold text-amber-400">M</span>
                      <span className="font-bold text-white">251</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="font-extrabold text-rose-500">H</span>
                      <span className="font-bold text-white">56</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Striver 16:9 Thumbnail (Fits completely without cropping) */}
          <div className="shrink-0 flex items-center justify-center pointer-events-auto w-full md:w-auto">
            <div className="relative w-full max-w-[340px] xs:max-w-[380px] sm:max-w-[420px] md:w-[410px] lg:w-[450px] aspect-[16/9] rounded-2xl overflow-hidden border-2 border-emerald-500/40 shadow-[0_0_40px_rgba(16,185,129,0.35)] hover:shadow-[0_0_60px_rgba(16,185,129,0.55)] transition-all duration-300 group">
              <Image
                src="/images/practice/striver_a2z_sheet.jpg"
                alt="Striver A2Z DSA Sheet"
                fill
                sizes="(max-width: 768px) 380px, 450px"
                className="object-cover object-center group-hover:scale-102 transition-transform duration-500"
                priority
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />
              <div className="absolute bottom-2.5 left-2.5 right-2.5 text-center text-[11px] font-bold text-emerald-200 bg-black/65 backdrop-blur-md py-1 rounded-lg border border-white/10 shadow-sm">
                Raj Vikramaditya (Striver)
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          2. AWAITING DATA CONTAINER (NO DATA POPULATED AS INSTRUCTED)
          ───────────────────────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="w-full bg-white rounded-3xl border border-slate-200/90 shadow-sm p-8 sm:p-12 text-center flex flex-col items-center justify-center"
      >
        <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-emerald-50 border border-emerald-200/60 flex items-center justify-center mb-5 shadow-sm">
          <Database className="w-8 h-8 sm:w-10 sm:h-10 text-emerald-600" />
        </div>

        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100/70 text-emerald-800 text-xs font-bold mb-3 border border-emerald-200">
          <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
          Container Ready & Connected
        </span>

        <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
          Awaiting Striver A2Z Sheet Data
        </h2>

        <p className="max-w-xl text-slate-500 text-sm sm:text-base mt-2.5 leading-relaxed">
          The layout and card for <strong className="text-slate-800">Striver&apos;s A2Z DSA Sheet</strong> are set up and ready. Whenever you provide the questions and topics, they will be loaded here with full problem categorization, difficulty filters, video solutions, and progress tracking!
        </p>

        {/* Feature Preview Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 mt-8 w-full max-w-2xl text-left">
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/70">
            <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-xs mb-2">
              <Layers className="w-4 h-4" />
            </div>
            <h4 className="text-xs font-extrabold text-slate-900">Step-by-Step Structure</h4>
            <p className="text-[11px] text-slate-500 mt-1">
              Ready to support Steps 1 through 18, topics, and subtopics.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/70">
            <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-xs mb-2">
              <Code2 className="w-4 h-4" />
            </div>
            <h4 className="text-xs font-extrabold text-slate-900">Platform Practice</h4>
            <p className="text-[11px] text-slate-500 mt-1">
              Direct external links to LeetCode, GFG, and CodingNinjas.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/70">
            <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-xs mb-2">
              <CheckCircle2 className="w-4 h-4" />
            </div>
            <h4 className="text-xs font-extrabold text-slate-900">Instant Sync</h4>
            <p className="text-[11px] text-slate-500 mt-1">
              Real-time progress saving, bookmarks, and revision flags.
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
