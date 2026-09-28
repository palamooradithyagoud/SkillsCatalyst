"use client";

import React from "react";
import { useRouter } from "next/navigation";
import {
  BarChart2,
  FileText,
  Users,
  Target,
  Search,
  Star,
  FileEdit,
  Mic,
  Code2,
  BarChart3,
  Lock,
  Crown,
  ArrowRight,
  Pause,
  PhoneOff,
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
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* ── CARD 1: Placement Prep ── */}
      <div
        onClick={onOpenPlacementPrep}
        className="bg-white rounded-[28px] border border-slate-200/80 p-5 sm:p-6 shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between h-full cursor-pointer group"
      >
        <div>
          {/* Top Hero Banner */}
          <div className="bg-[#F1F3FD] rounded-2xl p-5 relative overflow-hidden mb-6 min-h-[220px] flex flex-col justify-between">
            {/* Top row */}
            <div className="flex items-center justify-between relative z-10">
              <div className="w-10 h-10 rounded-xl bg-white shadow-xs border border-indigo-100/70 flex items-center justify-center text-[#4F46E5]">
                <BarChart2 className="w-5 h-5 text-[#4F46E5]" />
              </div>
              <div className="px-3 py-1 rounded-full bg-[#E0E7FF]/70 text-[#4338CA] text-xs font-semibold flex items-center gap-1.5 shadow-2xs">
                <span className="w-2 h-2 rounded-full bg-[#4F46E5]" />
                <span>Active Prep Suite</span>
              </div>
            </div>

            {/* Bottom content with stack */}
            <div className="flex items-end justify-between gap-2 mt-4 relative z-10">
              <div className="max-w-[54%]">
                <h3 className="text-xl font-extrabold text-slate-900 tracking-tight mb-1.5 group-hover:text-[#4F46E5] transition-colors">
                  Placement Prep
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed font-normal">
                  Curated company-wise interview problems, aptitude suites, and structured learning paths.
                </p>
              </div>

              {/* Fanned company cards */}
              <div className="relative w-[130px] h-[116px] shrink-0">
                {/* 4. TCS */}
                <div className="absolute top-[66px] right-[24px] z-0 bg-white rounded-lg px-2.5 py-1.5 shadow-sm border border-slate-100/90 flex items-center gap-1.5 select-none transition-transform group-hover:translate-x-0.5">
                  <span className="text-[10px] font-black text-[#E20074] tracking-tight">tcs</span>
                  <span className="text-[10px] font-bold text-slate-700">TCS</span>
                </div>

                {/* 3. Microsoft */}
                <div className="absolute top-[44px] right-[16px] z-10 bg-white rounded-lg px-2.5 py-1.5 shadow-sm border border-slate-100/90 flex items-center gap-1.5 select-none transition-transform group-hover:translate-x-0.5">
                  <div className="grid grid-cols-2 gap-0.5 w-3 h-3 shrink-0">
                    <span className="bg-[#F25022] rounded-[0.5px] w-1.5 h-1.5"></span>
                    <span className="bg-[#7FBA00] rounded-[0.5px] w-1.5 h-1.5"></span>
                    <span className="bg-[#00A4EF] rounded-[0.5px] w-1.5 h-1.5"></span>
                    <span className="bg-[#FFB900] rounded-[0.5px] w-1.5 h-1.5"></span>
                  </div>
                  <span className="text-[10px] font-bold text-slate-700">Microsoft</span>
                </div>

                {/* 2. Amazon */}
                <div className="absolute top-[22px] right-[8px] z-20 bg-white rounded-lg px-2.5 py-1.5 shadow-sm border border-slate-100/90 flex items-center gap-1.5 select-none transition-transform group-hover:translate-x-0.5">
                  <span className="text-[11px] font-black text-slate-900 tracking-tight leading-none">a</span>
                  <span className="text-[10px] font-bold text-slate-700">Amazon</span>
                </div>

                {/* 1. Google (Top) */}
                <div className="absolute top-0 right-0 z-30 bg-white rounded-lg px-2.5 py-1.5 shadow-md border border-slate-100/90 flex items-center gap-1.5 select-none transition-transform group-hover:translate-x-0.5">
                  <svg className="w-3.5 h-3.5 shrink-0" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"/>
                    <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"/>
                    <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.16 0 9.98 0 12s.45 3.84 1.25 5.42l4.03-3.15z"/>
                    <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"/>
                  </svg>
                  <span className="text-[10px] font-bold text-slate-700">Google</span>
                </div>
              </div>
            </div>
          </div>

          {/* Features List */}
          <div className="space-y-4 px-1">
            <div className="flex items-center gap-3.5">
              <div className="w-9 h-9 rounded-xl bg-[#F0F3FF] text-[#4F46E5] flex items-center justify-center shrink-0">
                <FileText className="w-4 h-4 text-[#4F46E5]" />
              </div>
              <div>
                <h4 className="text-xs sm:text-sm font-bold text-slate-900 leading-snug">
                  Company-wise DSA & Aptitude
                </h4>
                <p className="text-[11px] sm:text-xs text-slate-500 font-normal leading-tight">
                  Practice with real interview patterns
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3.5">
              <div className="w-9 h-9 rounded-xl bg-[#F0F3FF] text-[#4F46E5] flex items-center justify-center shrink-0">
                <Users className="w-4 h-4 text-[#4F46E5]" />
              </div>
              <div>
                <h4 className="text-xs sm:text-sm font-bold text-slate-900 leading-snug">
                  Tier-1 Hiring Rubrics
                </h4>
                <p className="text-[11px] sm:text-xs text-slate-500 font-normal leading-tight">
                  Know what top companies look for
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3.5">
              <div className="w-9 h-9 rounded-xl bg-[#F0F3FF] text-[#4F46E5] flex items-center justify-center shrink-0">
                <Target className="w-4 h-4 text-[#4F46E5]" />
              </div>
              <div>
                <h4 className="text-xs sm:text-sm font-bold text-slate-900 leading-snug">
                  Structured Learning Paths
                </h4>
                <p className="text-[11px] sm:text-xs text-slate-500 font-normal leading-tight">
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
          className="w-full bg-[#4F46E5] hover:bg-[#4338CA] text-white font-bold py-3.5 px-4 rounded-xl transition-all shadow-md shadow-indigo-600/20 flex items-center justify-center gap-2 text-xs sm:text-sm cursor-pointer mt-7"
        >
          <span>Start Placement Prep</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {/* ── CARD 2: Resume Review ── */}
      <div
        onClick={handleResumeReviewClick}
        className="bg-white rounded-[28px] border border-slate-200/80 p-5 sm:p-6 shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between h-full cursor-pointer group"
      >
        <div>
          {/* Top Hero Banner */}
          <div className="bg-[#FFF9F2] rounded-2xl p-5 relative overflow-hidden mb-6 min-h-[220px] flex flex-col justify-between">
            {/* Top row */}
            <div className="flex items-center justify-between relative z-10">
              <div className="w-10 h-10 rounded-xl bg-white shadow-xs border border-amber-200/60 flex items-center justify-center text-[#D97706]">
                <FileText className="w-5 h-5 text-[#D97706]" />
              </div>
              <div className="px-3 py-1 rounded-full bg-[#FEF3C7] text-[#92400E] border border-amber-200/50 text-xs font-semibold flex items-center gap-1.5 shadow-2xs">
                <Crown className="w-3.5 h-3.5 text-amber-700" />
                <span>Pro Feature</span>
              </div>
            </div>

            {/* Bottom content with Resume Card */}
            <div className="flex items-end justify-between gap-2 mt-4 relative z-10">
              <div className="max-w-[48%]">
                <h3 className="text-xl font-extrabold text-slate-900 tracking-tight mb-1.5 group-hover:text-amber-700 transition-colors">
                  Resume Review
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed font-normal">
                  AI-powered resume analysis with ATS scoring, recruiter insights, and actionable suggestions.
                </p>
              </div>

              {/* Mini Resume Card Mockup */}
              <div className="w-[145px] bg-white rounded-xl shadow-md border border-slate-100/90 p-2.5 flex flex-col gap-1.5 shrink-0 select-none transition-transform group-hover:scale-[1.02]">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-[9.5px] font-bold text-slate-800 leading-tight block">Your Resume</span>
                    <div className="space-y-1 mt-1">
                      <div className="w-10 h-1 bg-slate-200 rounded-full" />
                      <div className="w-7 h-1 bg-slate-200 rounded-full" />
                    </div>
                  </div>
                  {/* Gauge */}
                  <div className="w-9 h-9 rounded-full border-2 border-[#10B981] flex flex-col items-center justify-center bg-white shrink-0">
                    <span className="text-[11px] font-black text-[#10B981] leading-none">82</span>
                    <span className="text-[5px] font-bold text-slate-400 uppercase leading-none mt-0.5">ATS Score</span>
                  </div>
                </div>

                <div className="space-y-1 pt-1 border-t border-slate-100">
                  <div className="bg-slate-50 border border-slate-100 rounded px-1.5 py-0.5 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                    <span className="text-[7px] font-medium text-slate-700 truncate">Strong experience section</span>
                  </div>
                  <div className="bg-slate-50 border border-slate-100 rounded px-1.5 py-0.5 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0" />
                    <span className="text-[7px] font-medium text-slate-700 truncate">Add more quantifiable results</span>
                  </div>
                  <div className="bg-slate-50 border border-slate-100 rounded px-1.5 py-0.5 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-rose-500 shrink-0" />
                    <span className="text-[7px] font-medium text-slate-700 truncate">Missing key skills (e.g. System Design)</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Features List */}
          <div className="space-y-4 px-1">
            <div className="flex items-center gap-3.5">
              <div className="w-9 h-9 rounded-xl bg-slate-50 text-slate-700 flex items-center justify-center shrink-0 border border-slate-100">
                <Search className="w-4 h-4 text-slate-600" />
              </div>
              <div>
                <h4 className="text-xs sm:text-sm font-bold text-slate-900 leading-snug">
                  ATS Compatibility Check
                </h4>
                <p className="text-[11px] sm:text-xs text-slate-500 font-normal leading-tight">
                  See how well your resume passes ATS
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3.5">
              <div className="w-9 h-9 rounded-xl bg-slate-50 text-slate-700 flex items-center justify-center shrink-0 border border-slate-100">
                <Star className="w-4 h-4 text-slate-600" />
              </div>
              <div>
                <h4 className="text-xs sm:text-sm font-bold text-slate-900 leading-snug">
                  Recruiter-style Feedback
                </h4>
                <p className="text-[11px] sm:text-xs text-slate-500 font-normal leading-tight">
                  Get actionable, role-specific suggestions
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3.5">
              <div className="w-9 h-9 rounded-xl bg-slate-50 text-slate-700 flex items-center justify-center shrink-0 border border-slate-100">
                <FileEdit className="w-4 h-4 text-slate-600" />
              </div>
              <div>
                <h4 className="text-xs sm:text-sm font-bold text-slate-900 leading-snug">
                  Bullet Point Rewrite
                </h4>
                <p className="text-[11px] sm:text-xs text-slate-500 font-normal leading-tight">
                  Turn generic points into impactful ones
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Action Button */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            handleResumeReviewClick();
          }}
          className="w-full bg-[#0F172A] hover:bg-[#1E293B] text-white font-bold py-3.5 px-4 rounded-xl transition-all shadow-md shadow-slate-900/15 flex items-center justify-center gap-2 text-xs sm:text-sm cursor-pointer mt-7"
        >
          <span>Launch Resume Review (Free)</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {/* ── CARD 3: AI Interviews (Locked) ── */}
      <div className="bg-white rounded-[28px] border border-slate-200/80 p-5 sm:p-6 shadow-xs flex flex-col justify-between h-full">
        <div>
          {/* Top Hero Banner */}
          <div className="bg-[#F0F5FD] rounded-2xl p-5 relative overflow-hidden mb-6 min-h-[220px] flex flex-col justify-between">
            {/* Top row */}
            <div className="flex items-center justify-between relative z-10">
              <div className="w-10 h-10 rounded-xl bg-white shadow-xs border border-sky-100 flex items-center justify-center text-[#0284C7]">
                <Mic className="w-5 h-5 text-[#0284C7]" />
              </div>
              <div className="px-3 py-1 rounded-full bg-[#FEE2E2]/70 text-[#DC2626] border border-rose-200/50 text-xs font-semibold flex items-center gap-1.5 shadow-2xs">
                <Lock className="w-3 h-3 text-[#DC2626]" />
                <span>Locked</span>
              </div>
            </div>

            {/* Bottom content with 3D Laptop */}
            <div className="flex items-end justify-between gap-2 mt-4 relative z-10">
              <div className="max-w-[48%]">
                <h3 className="text-xl font-extrabold text-slate-900 tracking-tight mb-1.5">
                  AI Interviews
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed font-normal">
                  Real-time AI voice &amp; technical mock interviews with instant feedback and improvement tips.
                </p>
              </div>

              {/* Laptop illustration */}
              <div className="relative w-[138px] flex flex-col items-center shrink-0 select-none">
                {/* Screen */}
                <div className="w-full bg-[#0F172A] rounded-t-lg border border-slate-700/80 p-2 shadow-lg flex flex-col justify-between h-[84px] relative">
                  <div className="text-[7px] text-slate-400 font-mono flex items-center justify-between leading-none">
                    <span>05:34</span>
                  </div>

                  {/* Waveform */}
                  <div className="flex items-center justify-center gap-[2.5px] h-7 my-auto">
                    {[4, 8, 14, 20, 12, 17, 24, 18, 13, 21, 15, 9, 5].map((h, i) => (
                      <span
                        key={i}
                        style={{ height: `${h}px` }}
                        className="w-[2.5px] bg-gradient-to-t from-cyan-400 via-sky-400 to-indigo-400 rounded-full drop-shadow-[0_0_4px_rgba(56,189,248,0.7)]"
                      />
                    ))}
                  </div>

                  {/* Controls */}
                  <div className="flex items-center justify-center gap-2 mt-auto">
                    <span className="w-3.5 h-3.5 rounded-full bg-slate-800 text-slate-300 flex items-center justify-center">
                      <Mic className="w-2 h-2 text-slate-300" />
                    </span>
                    <span className="w-3.5 h-3.5 rounded-full bg-[#4F46E5] text-white flex items-center justify-center">
                      <Pause className="w-2 h-2 fill-current" />
                    </span>
                    <span className="w-3.5 h-3.5 rounded-full bg-rose-600 text-white flex items-center justify-center">
                      <PhoneOff className="w-2 h-2" />
                    </span>
                  </div>
                </div>

                {/* Base */}
                <div className="w-[114%] h-2.5 bg-gradient-to-b from-slate-300 via-slate-400 to-slate-500 rounded-b-md shadow-md flex justify-center items-start pt-0.5 border-t border-slate-400/80">
                  <div className="w-7 h-0.5 bg-slate-600/70 rounded-full" />
                </div>
              </div>
            </div>
          </div>

          {/* Features List */}
          <div className="space-y-4 px-1">
            <div className="flex items-center gap-3.5">
              <div className="w-9 h-9 rounded-xl bg-slate-50 text-slate-700 flex items-center justify-center shrink-0 border border-slate-100">
                <Mic className="w-4 h-4 text-slate-600" />
              </div>
              <div>
                <h4 className="text-xs sm:text-sm font-bold text-slate-900 leading-snug">
                  Real-time AI Interviewer
                </h4>
                <p className="text-[11px] sm:text-xs text-slate-500 font-normal leading-tight">
                  Voice &amp; technical mock interviews
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3.5">
              <div className="w-9 h-9 rounded-xl bg-slate-50 text-slate-700 flex items-center justify-center shrink-0 border border-slate-100">
                <Code2 className="w-4 h-4 text-slate-600" />
              </div>
              <div>
                <h4 className="text-xs sm:text-sm font-bold text-slate-900 leading-snug">
                  DSA Practice Problems
                </h4>
                <p className="text-[11px] sm:text-xs text-slate-500 font-normal leading-tight">
                  Practice curated company questions
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3.5">
              <div className="w-9 h-9 rounded-xl bg-slate-50 text-slate-700 flex items-center justify-center shrink-0 border border-slate-100">
                <BarChart3 className="w-4 h-4 text-slate-600" />
              </div>
              <div>
                <h4 className="text-xs sm:text-sm font-bold text-slate-900 leading-snug">
                  Detailed Performance Report
                </h4>
                <p className="text-[11px] sm:text-xs text-slate-500 font-normal leading-tight">
                  Get scored feedback &amp; improvement tips
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Action Button */}
        <button
          disabled
          className="w-full bg-[#F1F5F9] border border-slate-200/70 text-slate-400 font-bold py-3.5 px-4 rounded-xl flex items-center justify-center gap-2 text-xs sm:text-sm cursor-not-allowed mt-7"
        >
          <Lock className="w-4 h-4 text-slate-400" />
          <span>AI Interviews Locked</span>
        </button>
      </div>
    </div>
  );
}
