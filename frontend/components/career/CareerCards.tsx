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
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 items-stretch">
      {/* ── CARD 1: Aptitude & Reasoning ── */}
      <div
        onClick={onOpenPlacementPrep}
        className="bg-white rounded-2xl sm:rounded-[24px] md:rounded-[28px] border border-slate-200/80 shadow-xs flex flex-col overflow-hidden h-full cursor-pointer group hover:shadow-md transition-shadow"
      >
        {/* Top Pale Yellow Gradient Header filled till Aptitude & Reasoning */}
        <div className="w-full bg-gradient-to-r from-[#FEF3C7] via-[#FFFBEB] to-[#FDE68A] p-3.5 sm:p-4.5 pt-3 sm:pt-3.5 pb-3 sm:pb-3.5 border-b border-[#FDE68A]/70">
          <div className="h-5 mb-1 sm:mb-1.5" />
          <h3 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight leading-tight group-hover:text-amber-700 transition-colors">
            Aptitude &amp; Reasoning
          </h3>
        </div>

        {/* Card Body */}
        <div className="p-3.5 sm:p-4.5 flex flex-col justify-between flex-1">
          <p className="text-xs sm:text-sm text-slate-600 font-normal leading-relaxed min-h-[36px] sm:min-h-[40px]">
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
            className="w-full h-10 bg-[#0F172A] hover:bg-[#1E293B] text-white font-bold px-3 sm:px-4 rounded-xl transition-all shadow-md shadow-slate-900/10 flex items-center justify-center gap-1.5 sm:gap-2 text-xs sm:text-sm cursor-pointer mt-3.5 sm:mt-4 shrink-0"
          >
            <span>Start Aptitude &amp; Reasoning</span>
            <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </button>
        </div>
      </div>

      {/* ── CARD 2: Resume Review ── */}
      <div
        onClick={handleResumeReviewClick}
        className="bg-white rounded-2xl sm:rounded-[24px] md:rounded-[28px] border border-slate-200/80 shadow-xs flex flex-col overflow-hidden h-full cursor-pointer group hover:shadow-md transition-shadow"
      >
        {/* Top Pale Blue Gradient Header filled till Resume Review */}
        <div className="w-full bg-gradient-to-r from-[#DCEEFB] via-[#E8F3FD] to-[#D8EAFD] p-3.5 sm:p-4.5 pt-3 sm:pt-3.5 pb-3 sm:pb-3.5 border-b border-[#BFDBFE]/60">
          <div className="flex items-center justify-end mb-1 sm:mb-1.5">
            <div className="h-5 px-2.5 rounded-full bg-white/90 backdrop-blur-xs text-[#0369A1] border border-sky-200/60 text-[10px] sm:text-xs font-semibold flex items-center gap-1.5 shadow-2xs">
              <Crown className="w-3 h-3 text-amber-600" />
              <span>Pro Feature</span>
            </div>
          </div>
          <h3 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight leading-tight group-hover:text-[#0284C7] transition-colors">
            Resume Review
          </h3>
        </div>

        {/* Card Body */}
        <div className="p-3.5 sm:p-4.5 flex flex-col justify-between flex-1">
          <p className="text-xs sm:text-sm text-slate-600 font-normal leading-relaxed min-h-[36px] sm:min-h-[40px]">
            AI-powered resume analysis with real-time ATS scoring, recruiter insights, and actionable suggestions.
          </p>

          {/* Action Button */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              handleResumeReviewClick();
            }}
            className="w-full h-10 bg-[#0F172A] hover:bg-[#1E293B] text-white font-bold px-3 sm:px-4 rounded-xl transition-all shadow-md shadow-slate-900/10 flex items-center justify-center gap-1.5 sm:gap-2 text-xs sm:text-sm cursor-pointer mt-3.5 sm:mt-4 shrink-0"
          >
            <span>Launch Resume Review (Free)</span>
            <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </button>
        </div>
      </div>

      {/* ── CARD 3: AI Interviews (Locked) ── */}
      <div className="bg-white rounded-2xl sm:rounded-[24px] md:rounded-[28px] border border-slate-200/80 shadow-xs flex flex-col overflow-hidden h-full">
        {/* Top Pink Gradient Header filled till AI Interviews */}
        <div className="w-full bg-gradient-to-r from-[#F0D5EC] via-[#FCE3F4] to-[#EBD5F5] p-3.5 sm:p-4.5 pt-3 sm:pt-3.5 pb-3 sm:pb-3.5 border-b border-[#ECCEE7]/70">
          <div className="flex items-center justify-end mb-1 sm:mb-1.5">
            <div className="h-5 px-2.5 rounded-full bg-white/90 backdrop-blur-xs text-[#DC2626] border border-rose-200/60 text-[10px] sm:text-xs font-semibold flex items-center gap-1.5 shadow-2xs">
              <Lock className="w-3 h-3 text-[#DC2626]" />
              <span>Locked</span>
            </div>
          </div>
          <h3 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight leading-tight">
            AI Interviews
          </h3>
        </div>

        {/* Card Body */}
        <div className="p-3.5 sm:p-4.5 flex flex-col justify-between flex-1">
          <p className="text-xs sm:text-sm text-slate-600 font-normal leading-relaxed min-h-[36px] sm:min-h-[40px]">
            A real-time AI interview simulator that evaluates your voice, technical responses, and communication from start to finish.
          </p>

          {/* Action Button */}
          <button
            disabled
            className="w-full h-10 bg-[#F1F5F9] border border-slate-200/70 text-slate-400 font-bold px-3 sm:px-4 rounded-xl flex items-center justify-center gap-1.5 sm:gap-2 text-xs sm:text-sm cursor-not-allowed mt-3.5 sm:mt-4 shrink-0"
          >
            <Lock className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-slate-400" />
            <span>AI Interviews Locked</span>
          </button>
        </div>
      </div>
    </div>
  );
}
