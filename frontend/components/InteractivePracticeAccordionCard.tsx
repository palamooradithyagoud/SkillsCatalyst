"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Code2,
  ListChecks,
  CheckCircle2,
  Clock,
  ArrowUpRight,
  Sparkles,
} from "lucide-react";

export interface InteractivePracticeAccordionCardProps {
  className?: string;
}

export default function InteractivePracticeAccordionCard({
  className = "",
}: InteractivePracticeAccordionCardProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"coding" | "interview">("coding");

  const handleStartJourney = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (activeTab === "coding") {
      router.push("/practice");
    } else {
      router.push("/career");
    }
  };

  return (
    <div
      className={`w-full h-full select-none relative p-5 sm:p-6 lg:p-7 flex flex-col justify-between overflow-hidden ${
        activeTab === "coding"
          ? "bg-gradient-to-br from-[#DCEEFF] via-[#EDF6FF] to-[#D8ECFF]"
          : "bg-gradient-to-br from-[#FCE7F3] via-[#FFF1F2] to-[#FBCFE8]"
      } ${className}`}
    >
      {/* Decorative background watermark glow */}
      <div
        className={`absolute -right-16 -top-16 w-64 h-64 rounded-full pointer-events-none transition-all duration-700 ${
          activeTab === "coding"
            ? "bg-blue-300/30 blur-2xl"
            : "bg-pink-300/35 blur-2xl"
        }`}
      />

      {/* ── Top row: Tab Switcher (Coding Practice vs Interview Prep) ── */}
      <div className="flex items-center justify-between gap-2 relative z-10 mb-3 sm:mb-4">
        <div className="flex items-center gap-1 p-0.5 rounded-xl bg-black/5 backdrop-blur-xs">
          <button
            type="button"
            onClick={() => setActiveTab("coding")}
            onMouseEnter={() => setActiveTab("coding")}
            className={`px-3 py-1.5 rounded-lg text-xs font-extrabold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === "coding"
                ? "bg-white text-blue-700 shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <Code2 className="w-3.5 h-3.5" />
            <span>Coding Practice</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("interview")}
            onMouseEnter={() => setActiveTab("interview")}
            className={`px-3 py-1.5 rounded-lg text-xs font-extrabold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === "interview"
                ? "bg-white text-pink-700 shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <ListChecks className="w-3.5 h-3.5" />
            <span>Interview Prep</span>
          </button>
        </div>

        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider hidden sm:inline-flex items-center gap-1">
          <Sparkles className="w-2.5 h-2.5 text-amber-500" />
          Interactive Prep
        </span>
      </div>

      {/* ── Main Content Area: Left Details & Right Illustration ── */}
      <div className="flex items-center justify-between gap-4 sm:gap-6 relative z-10 flex-1">
        {/* Left Side: Squircle, Title, Description, Pill, CTA */}
        <div className="flex-1 min-w-0 max-w-[240px] space-y-2.5">
          {/* Squircle Icon */}
          <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-white shadow-xs flex items-center justify-center">
            {activeTab === "coding" ? (
              <Code2 className="w-5 h-5 text-blue-600 stroke-[2.5]" />
            ) : (
              <ListChecks className="w-5 h-5 text-pink-600 stroke-[2.5]" />
            )}
          </div>

          <div>
            <h2 className="text-base sm:text-lg lg:text-xl font-black text-slate-900 tracking-tight leading-tight">
              {activeTab === "coding"
                ? "Coding Practice"
                : "Interview Preparation"}
            </h2>
            <p className="text-xs text-slate-600 font-medium leading-relaxed mt-1 line-clamp-2">
              {activeTab === "coding"
                ? "Level up your coding skills by practicing hiring questions."
                : "Crack Top companies in just 5 days."}
            </p>
          </div>

          {/* Metric Tag & CTA Button */}
          <div className="flex items-center gap-3 pt-1 flex-wrap">
            <div className="flex items-center gap-1 text-xs font-black text-slate-900 shrink-0">
              <span className="h-0.5 w-3 bg-slate-900 rounded-full" />
              <span>
                {activeTab === "coding" ? "400+ Questions" : "20+ Companies"}
              </span>
            </div>

            <button
              type="button"
              onClick={handleStartJourney}
              className="px-3.5 py-1.5 rounded-xl bg-black hover:bg-slate-900 text-white text-xs font-extrabold flex items-center gap-1.5 shadow-md active:scale-95 transition-all cursor-pointer shrink-0"
            >
              <span>Start Journey</span>
              <ArrowUpRight className="w-3.5 h-3.5 stroke-[2.5]" />
            </button>
          </div>
        </div>

        {/* Right Side Preview Graphic matching reference screenshots */}
        <div className="shrink-0 relative hidden sm:flex items-center justify-end">
          {activeTab === "coding" ? (
            /* ── Coding Practice Preview: Roadmap Timeline ── */
            <div className="w-[170px] sm:w-[190px] xl:w-[210px] relative space-y-2">
              {/* Day 1 */}
              <div className="p-2 rounded-xl bg-white shadow-xs border border-blue-100 flex items-center gap-2">
                <div className="w-4 h-4 rounded-full bg-emerald-500 text-white flex items-center justify-center shrink-0">
                  <CheckCircle2 className="w-3 h-3 stroke-[3]" />
                </div>
                <span className="text-[11px] font-black text-slate-800">
                  Day 1
                </span>
                <div className="flex items-center gap-1 ml-auto">
                  <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-slate-100 text-slate-600">
                    Array
                  </span>
                  <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 hidden xl:inline-block">
                    Two Pointer
                  </span>
                </div>
              </div>

              {/* Day 2 (Active Black Node) */}
              <div className="p-2 rounded-xl bg-slate-900 text-white shadow-md flex items-center gap-2 border border-slate-800">
                <div className="w-4 h-4 rounded-full border-2 border-white flex items-center justify-center shrink-0">
                  <div className="w-1.5 h-1.5 rounded-full bg-blue-400" />
                </div>
                <span className="text-[11px] font-black text-white">
                  Day 2
                </span>
                <div className="flex items-center gap-1 ml-auto">
                  <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-amber-400 text-slate-950 font-black">
                    Math
                  </span>
                  <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-amber-400 text-slate-950 font-black hidden xl:inline-block">
                    Tree
                  </span>
                </div>
              </div>

              {/* Day 3 */}
              <div className="p-2 rounded-xl bg-white/90 shadow-xs border border-blue-100/70 flex items-center gap-2">
                <div className="w-4 h-4 rounded-full border border-dashed border-slate-400 text-slate-500 flex items-center justify-center shrink-0">
                  <Clock className="w-2.5 h-2.5" />
                </div>
                <span className="text-[11px] font-black text-slate-700">
                  Day 3
                </span>
                <div className="flex items-center gap-1 ml-auto">
                  <span className="text-[9px] font-semibold px-1.5 py-0.5 rounded bg-slate-100 text-slate-500">
                    DFS Search
                  </span>
                </div>
              </div>
            </div>
          ) : (
            /* ── Interview Prep Preview: Company Cards ── */
            <div className="w-[170px] sm:w-[190px] xl:w-[210px] relative flex items-center gap-2 justify-end">
              {/* Amazon Card */}
              <div className="w-18 sm:w-20 p-2 sm:p-2.5 rounded-xl bg-white shadow-xs border border-pink-100 text-center flex flex-col items-center">
                <div className="w-7 h-7 rounded-lg bg-black text-white flex items-center justify-center text-xs font-black mb-1">
                  a
                </div>
                <span className="text-[10px] font-black text-slate-900 leading-tight">
                  Amazon
                </span>
                <span className="text-[8px] text-slate-400 font-semibold truncate max-w-full">
                  46.9k prep
                </span>
              </div>

              {/* Meta Card */}
              <div className="w-18 sm:w-20 p-2 sm:p-2.5 rounded-xl bg-gradient-to-b from-[#1877F2] to-[#0D65D9] text-white shadow-md text-center flex flex-col items-center transform scale-105">
                <div className="w-7 h-7 rounded-lg bg-white/20 backdrop-blur-xs flex items-center justify-center text-white text-xs font-black mb-1">
                  ∞
                </div>
                <span className="text-[10px] font-black text-white leading-tight">
                  Meta
                </span>
                <span className="text-[8px] text-white/80 font-semibold truncate max-w-full">
                  46.8k prep
                </span>
              </div>

              {/* Microsoft Card */}
              <div className="w-18 sm:w-20 p-2 sm:p-2.5 rounded-xl bg-white shadow-xs border border-pink-100 text-center flex flex-col items-center hidden xl:flex">
                <div className="w-7 h-7 rounded-lg bg-slate-100 grid grid-cols-2 gap-0.5 p-1 mb-1">
                  <div className="bg-[#F25022] rounded-[1px]" />
                  <div className="bg-[#7FBA00] rounded-[1px]" />
                  <div className="bg-[#00A4EF] rounded-[1px]" />
                  <div className="bg-[#FFB900] rounded-[1px]" />
                </div>
                <span className="text-[10px] font-black text-slate-900 leading-tight">
                  Microsoft
                </span>
                <span className="text-[8px] text-slate-400 font-semibold truncate max-w-full">
                  39.2k prep
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
