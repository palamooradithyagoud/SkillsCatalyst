"use client";

import React from "react";
import { useRouter } from "next/navigation";
import {
  BarChart2,
  FileText,
  Users,
  Target,
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
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
      {/* ── CARD 1: Aptitude & Reasoning ── */}
      <div
        onClick={onOpenPlacementPrep}
        className="bg-white rounded-2xl sm:rounded-[24px] md:rounded-[28px] border border-slate-200/80 p-3.5 sm:p-5 md:p-6 shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between h-full cursor-pointer group"
      >
        <div>
          {/* Top Hero Banner */}
          <div className="bg-[#F1F3FD] rounded-xl sm:rounded-2xl p-3.5 sm:p-4 md:p-5 relative overflow-hidden mb-3.5 sm:mb-5 md:mb-6 min-h-[160px] sm:min-h-[190px] md:min-h-[220px] flex flex-col justify-between">
            {/* Top row */}
            <div className="flex items-center justify-between relative z-10">
              <div className="w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10 rounded-lg sm:rounded-xl bg-white shadow-xs border border-indigo-100/70 flex items-center justify-center text-[#4F46E5]">
                <BarChart2 className="w-4 h-4 sm:w-4.5 sm:h-4.5 md:w-5 md:h-5 text-[#4F46E5]" />
              </div>
              <div className="px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-full bg-[#E0E7FF]/70 text-[#4338CA] text-[10px] sm:text-xs font-semibold flex items-center gap-1.5 shadow-2xs">
                <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-[#4F46E5]" />
                <span>Active Prep Suite</span>
              </div>
            </div>

            {/* Bottom content with stack */}
            <div className="flex items-end justify-between gap-2 sm:gap-3 mt-3 sm:mt-4 relative z-10">
              <div className="flex-1 min-w-0 pr-1">
                <h3 className="text-base sm:text-lg md:text-xl font-extrabold text-slate-900 tracking-tight mb-1 sm:mb-1.5 group-hover:text-[#4F46E5] transition-colors leading-tight">
                  Aptitude &amp; Reasoning
                </h3>
                <p className="text-[10.5px] sm:text-xs text-slate-500 leading-snug sm:leading-relaxed font-normal">
                  Curated quantitative aptitude, logical reasoning suites, and structured practice paths.
                </p>
              </div>

              {/* Fanned company cards - compact scale on mobile */}
              <div className="scale-80 sm:scale-95 md:scale-100 origin-bottom-right shrink-0">
                <div className="relative w-[116px] h-[106px] shrink-0">
                  {/* 4. TCS */}
                  <div className="absolute top-[72px] right-[24px] z-10 w-[108px] h-[30px] bg-white rounded-lg px-2.5 shadow-sm border border-slate-100/90 flex items-center gap-2 select-none transition-transform group-hover:translate-x-0.5">
                    <span className="text-[9px] font-black text-[#E20074] tracking-tighter px-1 py-0.5 rounded bg-pink-50 border border-pink-100/60 leading-none shrink-0">
                      tcs
                    </span>
                    <span className="text-[10px] font-bold text-slate-700 truncate">TCS</span>
                  </div>

                  {/* 3. Microsoft */}
                  <div className="absolute top-[48px] right-[16px] z-20 w-[108px] h-[30px] bg-white rounded-lg px-2.5 shadow-sm border border-slate-100/90 flex items-center gap-2 select-none transition-transform group-hover:translate-x-0.5">
                    <div className="grid grid-cols-2 gap-0.5 w-3.5 h-3.5 shrink-0">
                      <span className="bg-[#F25022] rounded-[0.5px]"></span>
                      <span className="bg-[#7FBA00] rounded-[0.5px]"></span>
                      <span className="bg-[#00A4EF] rounded-[0.5px]"></span>
                      <span className="bg-[#FFB900] rounded-[0.5px]"></span>
                    </div>
                    <span className="text-[10px] font-bold text-slate-700 truncate">Microsoft</span>
                  </div>

                  {/* 2. Amazon */}
                  <div className="absolute top-[24px] right-[8px] z-30 w-[108px] h-[30px] bg-white rounded-lg px-2.5 shadow-sm border border-slate-100/90 flex items-center gap-2 select-none transition-transform group-hover:translate-x-0.5">
                    <svg className="w-3.5 h-3.5 shrink-0" viewBox="0 0 24 24" fill="none">
                      <path
                        d="M13.8 12.8c-1.7 0-3.1.6-4 1.8-.3.4-.2.9.2 1.2.4.3.9.2 1.2-.2.6-.8 1.5-1.2 2.6-1.2 1.8 0 3.2 1.2 3.2 2.9v.2c-.7-.4-1.7-.6-2.8-.6-2.6 0-4.4 1.4-4.4 3.4 0 1.9 1.6 3 3.8 3 1.6 0 2.8-.7 3.4-1.8h.1v1.5c0 .4.4.8.8.8h1.5c.4 0 .8-.4.8-.8v-6.7c0-2.9-2.5-5.2-6.3-5.2zm2.2 7.6c-.5.7-1.4 1.2-2.4 1.2-1.3 0-2.1-.6-2.1-1.6 0-1 .8-1.7 2.3-1.7.8 0 1.5.2 2.2.4v1.7z"
                        fill="#111827"
                      />
                      <path
                        d="M21.5 19.5c-3.2 2.4-7.8 3.7-12 3.2-3.5-.4-6.8-2-9.5-4.4-.3-.3-.1-.7.3-.5 3.3 1.8 7.3 2.8 11.4 2.4 3.7-.3 7.3-1.6 10.3-3.6.4-.3.8.1.5.5z"
                        fill="#F59E0B"
                      />
                    </svg>
                    <span className="text-[10px] font-bold text-slate-700 truncate">Amazon</span>
                  </div>

                  {/* 1. Google (Top) */}
                  <div className="absolute top-0 right-0 z-40 w-[108px] h-[30px] bg-white rounded-lg px-2.5 shadow-md border border-slate-100/90 flex items-center gap-2 select-none transition-transform group-hover:translate-x-0.5">
                    <svg className="w-3.5 h-3.5 shrink-0" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"/>
                      <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"/>
                      <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.16 0 9.98 0 12s.45 3.84 1.25 5.42l4.03-3.15z"/>
                      <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"/>
                    </svg>
                    <span className="text-[10px] font-bold text-slate-700 truncate">Google</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Features List */}
          <div className="space-y-2.5 sm:space-y-3.5 md:space-y-4 px-0.5 sm:px-1">
            <div className="flex items-center gap-2.5 sm:gap-3.5">
              <div className="w-7 h-7 sm:w-8 sm:h-8 md:w-9 md:h-9 rounded-lg sm:rounded-xl bg-[#F0F3FF] text-[#4F46E5] flex items-center justify-center shrink-0">
                <FileText className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#4F46E5]" />
              </div>
              <div>
                <h4 className="text-xs sm:text-sm font-bold text-slate-900 leading-snug">
                  Aptitude Questions
                </h4>
                <p className="text-[10px] sm:text-xs text-slate-500 font-normal leading-tight mt-0.5">
                  Practice topic-wise core problem patterns
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2.5 sm:gap-3.5">
              <div className="w-7 h-7 sm:w-8 sm:h-8 md:w-9 md:h-9 rounded-lg sm:rounded-xl bg-[#F0F3FF] text-[#4F46E5] flex items-center justify-center shrink-0">
                <Users className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#4F46E5]" />
              </div>
              <div>
                <h4 className="text-xs sm:text-sm font-bold text-slate-900 leading-snug">
                  Quantitative &amp; Logical Skills
                </h4>
                <p className="text-[10px] sm:text-xs text-slate-500 font-normal leading-tight mt-0.5">
                  Master core problem-solving concepts
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2.5 sm:gap-3.5">
              <div className="w-7 h-7 sm:w-8 sm:h-8 md:w-9 md:h-9 rounded-lg sm:rounded-xl bg-[#F0F3FF] text-[#4F46E5] flex items-center justify-center shrink-0">
                <Target className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#4F46E5]" />
              </div>
              <div>
                <h4 className="text-xs sm:text-sm font-bold text-slate-900 leading-snug">
                  Structured Practice Paths
                </h4>
                <p className="text-[10px] sm:text-xs text-slate-500 font-normal leading-tight mt-0.5">
                  Go from basics to interview-ready
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Action Button */}
        <button
          id="open-placement-prep-btn"
          onClick={(e) => {
            e.stopPropagation();
            onOpenPlacementPrep();
          }}
          className="w-full bg-[#4F46E5] hover:bg-[#4338CA] text-white font-bold py-2.5 sm:py-3 md:py-3.5 px-3 sm:px-4 rounded-xl transition-all shadow-md shadow-indigo-600/20 flex items-center justify-center gap-1.5 sm:gap-2 text-xs sm:text-sm cursor-pointer mt-4 sm:mt-6 md:mt-7"
        >
          <span>Start Aptitude &amp; Reasoning</span>
          <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
        </button>
      </div>

      {/* ── CARD 2: Resume Review ── */}
      <div
        onClick={handleResumeReviewClick}
        className="bg-white rounded-2xl sm:rounded-[24px] md:rounded-[28px] border border-slate-200/80 shadow-xs flex flex-col overflow-hidden self-start cursor-pointer group hover:shadow-md transition-shadow"
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
      <div className="bg-white rounded-2xl sm:rounded-[24px] md:rounded-[28px] border border-slate-200/80 shadow-xs flex flex-col overflow-hidden self-start">
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
