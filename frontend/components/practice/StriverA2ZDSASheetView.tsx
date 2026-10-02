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
            {/* Clean Bold Title */}
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 text-xs font-bold mb-2">
                <Sparkles className="w-3.5 h-3.5" />
                <span>take U-forward</span>
              </div>
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-white tracking-tight leading-tight drop-shadow-md">
                STRIVER&apos;S A2Z <br />
                <span className="bg-gradient-to-r from-emerald-400 via-green-400 to-lime-300 bg-clip-text text-transparent">
                  DSA SHEET
                </span>
              </h1>
              <p className="text-emerald-300/80 text-xs sm:text-sm font-semibold tracking-wide pt-1">
                By Raj Vikramaditya (Striver) • Ex-Google
              </p>
            </div>

            {/* "DATA STATUS" / PROGRESS CARD */}
            <div className="bg-[#051c0f]/90 border border-emerald-500/30 rounded-2xl p-4 sm:p-5 shadow-2xl backdrop-blur-md w-full sm:max-w-[340px]">
              {/* Header */}
              <div className="text-[11px] font-black text-emerald-300 tracking-wider uppercase pb-2.5 border-b border-white/10 flex items-center justify-between">
                <span>SHEET STATUS</span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 font-bold border border-emerald-500/30">
                  Ready For Data
                </span>
              </div>

              {/* Tracker Body */}
              <div className="pt-3.5 flex items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="text-2xl font-black text-white tracking-tight">0 Problems</div>
                  <p className="text-xs text-emerald-200/70">Awaiting your question list</p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/25 flex items-center justify-center shrink-0">
                  <FileSpreadsheet className="w-6 h-6 text-emerald-400" />
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Striver Image (At Right Side) */}
          <div className="shrink-0 flex items-center justify-center pointer-events-auto">
            <div className="relative w-52 h-52 sm:w-60 sm:h-60 md:w-68 md:h-68 rounded-2xl overflow-hidden border-2 border-emerald-500/40 shadow-[0_0_40px_rgba(16,185,129,0.35)] hover:shadow-[0_0_60px_rgba(16,185,129,0.55)] transition-all duration-300 group">
              <Image
                src="/images/practice/striver_a2z_sheet.jpg"
                alt="Striver A2Z DSA Sheet"
                fill
                sizes="(max-width: 768px) 240px, 280px"
                className="object-cover object-center group-hover:scale-105 transition-transform duration-500"
                priority
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-transparent pointer-events-none" />
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
