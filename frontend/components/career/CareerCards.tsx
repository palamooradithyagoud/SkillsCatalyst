"use client";

import React from "react";
import { useRouter } from "next/navigation";
import {
  Crown,
  Lock,
  ArrowRight,
} from "lucide-react";

interface CareerCardsProps {
  onOpenPlacementPrep: () => void;
  onOpenResumeReview?: () => void;
}

export default function CareerCards({
  onOpenPlacementPrep,
  onOpenResumeReview,
}: CareerCardsProps) {
  const router = useRouter();

  const handleResumeReviewClick = () => {
    if (onOpenResumeReview) {
      onOpenResumeReview();
    } else {
      router.push("/career/resume-review");
    }
  };

  return (
    <div className="flex flex-col gap-4 sm:gap-5 md:gap-6 w-full">
      {/* ── Section: Competitive ── */}
      <div className="flex flex-col gap-2.5 sm:gap-3">
        <div className="flex items-center gap-2">
          <h2 className="text-base sm:text-lg md:text-xl font-black text-slate-900 tracking-tight">
            Competitive
          </h2>
        </div>

        {/* ── TOP ROW: Aptitude & Reasoning + Reasoning ── */}
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 md:gap-6">
          {/* ── CARD 1: Aptitude & Reasoning ── */}
          <div className="w-full sm:w-[calc(50%-0.75rem)] lg:w-[calc(33.333%-1rem)]">
            <div
              onClick={onOpenPlacementPrep}
              className="bg-white rounded-xl sm:rounded-2xl md:rounded-[28px] border border-slate-200/80 shadow-xs flex flex-col overflow-hidden h-full cursor-pointer group hover:shadow-md transition-shadow min-w-0"
            >
              {/* Top Pale Yellow Gradient Header filled till Aptitude & Reasoning */}
              <div className="w-full bg-gradient-to-r from-[#FEF3C7] via-[#FFFBEB] to-[#FDE68A] p-2 sm:p-3.5 md:p-4.5 pt-2 sm:pt-3 pb-2 sm:pb-3 border-b border-[#FDE68A]/70">
                <div className="h-4 sm:h-5 mb-1 sm:mb-1.5" />
                <h3 className="text-xs sm:text-base md:text-lg font-black text-slate-900 tracking-tight leading-tight group-hover:text-amber-700 transition-colors">
                  Aptitude &amp; Reasoning
                </h3>
              </div>

              {/* Card Body */}
              <div className="p-2 sm:p-3.5 md:p-4.5 flex flex-col justify-between flex-1">
                <p className="text-[10px] sm:text-xs md:text-sm text-slate-600 font-normal leading-snug sm:leading-relaxed min-h-[28px] sm:min-h-[40px] line-clamp-3 sm:line-clamp-none">
                  Curated quantitative aptitude, logical reasoning suites, and structured practice paths.
                </p>

                {/* Action Button */}
                <button
                  id="open-placement-prep-btn"
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onOpenPlacementPrep();
                  }}
                  className="w-full h-8 sm:h-10 bg-[#0F172A] hover:bg-[#1E293B] text-white font-bold px-2 sm:px-4 rounded-lg sm:rounded-xl transition-all shadow-md shadow-slate-900/10 flex items-center justify-center gap-1 sm:gap-2 text-[10.5px] sm:text-xs cursor-pointer mt-2.5 sm:mt-4 shrink-0"
                >
                  <span className="sm:hidden">Start</span>
                  <span className="hidden sm:inline">Start Aptitude &amp; Reasoning</span>
                  <ArrowRight className="w-3 h-3 sm:w-3.5 sm:h-3.5 shrink-0" />
                </button>
              </div>
            </div>
          </div>

          {/* ── CARD: Reasoning (Pale Purple) ── */}
          <div className="w-full sm:w-[calc(50%-0.75rem)] lg:w-[calc(33.333%-1rem)]">
            <div
              onClick={onOpenPlacementPrep}
              className="bg-white rounded-xl sm:rounded-2xl md:rounded-[28px] border border-slate-200/80 shadow-xs flex flex-col overflow-hidden h-full cursor-pointer group hover:shadow-md transition-shadow min-w-0"
            >
              {/* Top Pale Purple Gradient Header */}
              <div className="w-full bg-gradient-to-r from-[#EDE9FE] via-[#F5F3FF] to-[#E0E7FF] p-2 sm:p-3.5 md:p-4.5 pt-2 sm:pt-3 pb-2 sm:pb-3 border-b border-[#DDD6FE]/70">
                <div className="h-4 sm:h-5 mb-1 sm:mb-1.5" />
                <h3 className="text-xs sm:text-base md:text-lg font-black text-slate-900 tracking-tight leading-tight group-hover:text-purple-700 transition-colors">
                  Reasoning
                </h3>
              </div>

              {/* Card Body */}
              <div className="p-2 sm:p-3.5 md:p-4.5 flex flex-col justify-between flex-1">
                <p className="text-[10px] sm:text-xs md:text-sm text-slate-600 font-normal leading-snug sm:leading-relaxed min-h-[28px] sm:min-h-[40px] line-clamp-3 sm:line-clamp-none">
                  Logical puzzles, deductive reasoning, analytical seating, and pattern problem-solving.
                </p>

                {/* Action Button */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onOpenPlacementPrep();
                  }}
                  className="w-full h-8 sm:h-10 bg-[#0F172A] hover:bg-[#1E293B] text-white font-bold px-2 sm:px-4 rounded-lg sm:rounded-xl transition-all shadow-md shadow-slate-900/10 flex items-center justify-center gap-1 sm:gap-2 text-[10.5px] sm:text-xs cursor-pointer mt-2.5 sm:mt-4 shrink-0"
                >
                  <span className="sm:hidden">Start</span>
                  <span className="hidden sm:inline">Start Reasoning</span>
                  <ArrowRight className="w-3 h-3 sm:w-3.5 sm:h-3.5 shrink-0" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Divider Line ── */}
      <div className="w-full border-t border-slate-200/80 my-1 sm:my-2" />

      {/* ── DOWNSIDE: Resume Review & AI Interviews (Same Size) ── */}
      <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 md:gap-6">
        {/* ── CARD 2: Resume Review ── */}
        <div className="w-full sm:w-[calc(50%-0.75rem)] lg:w-[calc(33.333%-1rem)]">
          <div
            onClick={handleResumeReviewClick}
            className="bg-white rounded-xl sm:rounded-2xl md:rounded-[28px] border border-slate-200/80 shadow-xs flex flex-col overflow-hidden h-full cursor-pointer group hover:shadow-md transition-shadow min-w-0"
          >
            {/* Top Pale Blue Gradient Header filled till Resume Review */}
            <div className="w-full bg-gradient-to-r from-[#DCEEFB] via-[#E8F3FD] to-[#D8EAFD] p-2 sm:p-3.5 md:p-4.5 pt-2 sm:pt-3 pb-2 sm:pb-3 border-b border-[#BFDBFE]/60">
              <div className="flex items-center justify-end mb-1 sm:mb-1.5">
                <div className="h-4 sm:h-5 px-1.5 sm:px-2.5 rounded-full bg-white/90 backdrop-blur-xs text-[#0369A1] border border-sky-200/60 text-[9px] sm:text-xs font-semibold flex items-center gap-1 sm:gap-1.5 shadow-2xs">
                  <Crown className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-amber-600 shrink-0" />
                  <span className="hidden sm:inline">Pro Feature</span>
                  <span className="sm:hidden">Pro</span>
                </div>
              </div>
              <h3 className="text-xs sm:text-base md:text-lg font-black text-slate-900 tracking-tight leading-tight group-hover:text-[#0284C7] transition-colors">
                Resume Review
              </h3>
            </div>

            {/* Card Body */}
            <div className="p-2 sm:p-3.5 md:p-4.5 flex flex-col justify-between flex-1">
              <p className="text-[10px] sm:text-xs md:text-sm text-slate-600 font-normal leading-snug sm:leading-relaxed min-h-[28px] sm:min-h-[40px] line-clamp-3 sm:line-clamp-none">
                AI-powered resume analysis with real-time ATS scoring, recruiter insights, and actionable suggestions.
              </p>

              {/* Action Button */}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleResumeReviewClick();
                }}
                className="w-full h-8 sm:h-10 bg-[#0F172A] hover:bg-[#1E293B] text-white font-bold px-2 sm:px-4 rounded-lg sm:rounded-xl transition-all shadow-md shadow-slate-900/10 flex items-center justify-center gap-1 sm:gap-2 text-[10.5px] sm:text-xs cursor-pointer mt-2.5 sm:mt-4 shrink-0"
              >
                <span className="sm:hidden">Review</span>
                <span className="hidden sm:inline">Launch Resume Review (Free)</span>
                <ArrowRight className="w-3 h-3 sm:w-3.5 sm:h-3.5 shrink-0" />
              </button>
            </div>
          </div>
        </div>

        {/* ── CARD 3: AI Interviews (Locked) ── */}
        <div className="w-full sm:w-[calc(50%-0.75rem)] lg:w-[calc(33.333%-1rem)]">
          <div className="bg-white rounded-xl sm:rounded-2xl md:rounded-[28px] border border-slate-200/80 shadow-xs flex flex-col overflow-hidden h-full min-w-0">
            {/* Top Pink Gradient Header filled till AI Interviews */}
            <div className="w-full bg-gradient-to-r from-[#F0D5EC] via-[#FCE3F4] to-[#EBD5F5] p-2 sm:p-3.5 md:p-4.5 pt-2 sm:pt-3 pb-2 sm:pb-3 border-b border-[#ECCEE7]/70">
              <div className="flex items-center justify-end mb-1 sm:mb-1.5">
                <div className="h-4 sm:h-5 px-1.5 sm:px-2.5 rounded-full bg-white/90 backdrop-blur-xs text-[#DC2626] border border-rose-200/60 text-[9px] sm:text-xs font-semibold flex items-center gap-1 sm:gap-1.5 shadow-2xs">
                  <Lock className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-[#DC2626] shrink-0" />
                  <span className="hidden sm:inline">Locked</span>
                  <span className="sm:hidden">Lock</span>
                </div>
              </div>
              <h3 className="text-xs sm:text-base md:text-lg font-black text-slate-900 tracking-tight leading-tight">
                AI Interviews
              </h3>
            </div>

            {/* Card Body */}
            <div className="p-2 sm:p-3.5 md:p-4.5 flex flex-col justify-between flex-1">
              <p className="text-[10px] sm:text-xs md:text-sm text-slate-600 font-normal leading-snug sm:leading-relaxed min-h-[28px] sm:min-h-[40px] line-clamp-3 sm:line-clamp-none">
                A real-time AI interview simulator that evaluates your voice, technical responses, and communication from start to finish.
              </p>

              {/* Action Button */}
              <button
                disabled
                className="w-full h-8 sm:h-10 bg-[#F1F5F9] border border-slate-200/70 text-slate-400 font-bold px-2 sm:px-4 rounded-lg sm:rounded-xl flex items-center justify-center gap-1 sm:gap-2 text-[10.5px] sm:text-xs cursor-not-allowed mt-2.5 sm:mt-4 shrink-0"
              >
                <Lock className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-slate-400 shrink-0" />
                <span className="sm:hidden">Locked</span>
                <span className="hidden sm:inline">AI Interviews Locked</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
