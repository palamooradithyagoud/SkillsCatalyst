"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { Zap, Swords, Check } from "lucide-react";

export interface InteractivePracticeAccordionCardProps {
  className?: string;
  isEnrolled?: boolean;
  onEnroll?: () => void;
  onEnterArena?: () => void;
}

export default function InteractivePracticeAccordionCard({
  className = "",
  isEnrolled = false,
  onEnroll,
  onEnterArena,
}: InteractivePracticeAccordionCardProps) {
  const router = useRouter();

  const handleEnroll = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onEnroll) {
      onEnroll();
    }
  };

  const handleEnterArena = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onEnterArena) {
      onEnterArena();
    } else {
      router.push("/practice");
    }
  };

  return (
    <div
      className={`w-full h-auto lg:h-full select-none bg-[#101523] p-3 sm:p-4.5 lg:p-6 xl:p-7 flex flex-col justify-between gap-3 sm:gap-4 lg:gap-4.5 ${className}`}
    >
      {/* Top Section: The Two Horizontal White Cards */}
      <div className="space-y-2.5 sm:space-y-3 lg:space-y-4">
        {/* Horizontal Card 1: Quiz */}
        <div className="w-full rounded-xl sm:rounded-2xl lg:rounded-3xl bg-white p-3 sm:p-4 lg:p-5 text-black shadow-md border border-slate-100/90 transition-all duration-300 hover:shadow-lg hover:scale-[1.01] cursor-pointer flex items-center gap-3 sm:gap-4 lg:gap-4.5 min-h-[76px] sm:min-h-[96px] lg:min-h-[110px]">
          {/* Custom Handcrafted Quiz Badge Logo */}
          <div className="w-10 h-10 sm:w-12 sm:h-12 lg:w-14 lg:h-14 rounded-lg sm:rounded-xl lg:rounded-2xl bg-gradient-to-br from-[#7C3AED] via-[#6D28D9] to-[#4C1D95] p-1.5 sm:p-2 lg:p-2.5 flex items-center justify-center shrink-0 shadow-md shadow-purple-600/25 ring-2 sm:ring-3 lg:ring-4 ring-purple-100/80 relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1/2 bg-white/20 rounded-t-lg sm:rounded-t-xl lg:rounded-t-2xl pointer-events-none" />
            <svg viewBox="0 0 36 36" fill="none" className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 relative z-10 drop-shadow-sm">
              {/* Sheet */}
              <rect x="5" y="4" width="26" height="28" rx="5" fill="white" />
              <path d="M10 10H17" stroke="#C4B5FD" strokeWidth="2.5" strokeLinecap="round" />
              <path d="M10 15H19" stroke="#E2E8F0" strokeWidth="2" strokeLinecap="round" />
              {/* Golden Question Badge */}
              <circle cx="21" cy="21" r="8.5" fill="url(#quizGrad)" />
              <path d="M21 16.8C19.9 16.8 19 17.5 19 18.6H20.3C20.3 18.1 20.6 17.8 21 17.8C21.4 17.8 21.8 18.1 21.8 18.6C21.8 19.3 20.8 19.6 20.8 20.8H21.7C21.7 20 22.8 19.8 22.8 18.6C22.8 17.5 22 16.8 21 16.8Z" fill="white" />
              <circle cx="21.2" cy="23.2" r="0.8" fill="white" />
              {/* Sparkle */}
              <path d="M28 5L28.7 7L31 7.7L28.7 8.4L28 10.5L27.3 8.4L25 7.7L27.3 7L28 5Z" fill="#FBBF24" />
              <defs>
                <linearGradient id="quizGrad" x1="12" y1="12" x2="30" y2="30" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#F59E0B" />
                  <stop offset="1" stopColor="#D97706" />
                </linearGradient>
              </defs>
            </svg>
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5 sm:gap-2 mb-0.5 sm:mb-1 flex-wrap">
              <h3 className="text-xs sm:text-sm lg:text-base font-black text-black tracking-tight leading-tight">
                Quiz for Every Topic
              </h3>
              <span className="px-1.5 sm:px-2 py-0.5 rounded-full bg-slate-100 text-black text-[8.5px] sm:text-[10px] font-black tracking-wider uppercase">
                Topic Quiz
              </span>
            </div>
            <p className="text-[10.5px] sm:text-xs text-black font-bold leading-snug">
              Quiz for every topic to make your understanding more clear
            </p>
          </div>
        </div>

        {/* Horizontal Card 2: Gamification */}
        <div className="w-full rounded-xl sm:rounded-2xl lg:rounded-3xl bg-white p-3 sm:p-4 lg:p-5 text-black shadow-md border border-slate-100/90 transition-all duration-300 hover:shadow-lg hover:scale-[1.01] cursor-pointer flex items-center gap-3 sm:gap-4 lg:gap-4.5 min-h-[76px] sm:min-h-[96px] lg:min-h-[110px]">
          {/* Custom Handcrafted Gamification Arcade Badge Logo */}
          <div className="w-10 h-10 sm:w-12 sm:h-12 lg:w-14 lg:h-14 rounded-lg sm:rounded-xl lg:rounded-2xl bg-gradient-to-br from-[#1E1B4B] via-[#312E81] to-[#4338CA] p-1.5 sm:p-2 lg:p-2.5 flex items-center justify-center shrink-0 shadow-md shadow-indigo-600/25 ring-2 sm:ring-3 lg:ring-4 ring-purple-100/80 relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1/2 bg-white/15 rounded-t-lg sm:rounded-t-xl lg:rounded-t-2xl pointer-events-none" />
            <svg viewBox="0 0 36 36" fill="none" className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 relative z-10 drop-shadow-md">
              {/* Lilac / Violet Gamepad Body */}
              <rect x="4" y="10" width="28" height="17" rx="8" fill="url(#gamepadGrad)" />
              {/* D-Pad */}
              <rect x="9.5" y="15.5" width="6" height="2" rx="1" fill="#FFFFFF" />
              <rect x="11.5" y="13.5" width="2" height="6" rx="1" fill="#FFFFFF" />
              {/* Action Buttons */}
              <circle cx="23" cy="15" r="1.5" fill="#E879F9" />
              <circle cx="26" cy="18" r="1.5" fill="#C084FC" />
              <circle cx="20" cy="18" r="1.5" fill="#818CF8" />
              <circle cx="23" cy="21" r="1.5" fill="#F472B6" />
              {/* Floating Star on top */}
              <path d="M18 4.5L19.3 7.8L22.5 9L19.3 10.2L18 13.5L16.7 10.2L13.5 9L16.7 7.8L18 4.5Z" fill="#FDE047" />
              <defs>
                <linearGradient id="gamepadGrad" x1="4" y1="10" x2="32" y2="27" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#A855F7" />
                  <stop offset="1" stopColor="#6D28D9" />
                </linearGradient>
              </defs>
            </svg>
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5 sm:gap-2 mb-0.5 sm:mb-1 flex-wrap">
              <h3 className="text-xs sm:text-sm lg:text-base font-black text-black tracking-tight leading-tight">
                Gamification
              </h3>
              {/* Lilac badge */}
              <span className="px-1.5 sm:px-2 py-0.5 rounded-full bg-[#FAF5FF] border border-[#E9D5FF] text-[#9333EA] text-[8.5px] sm:text-[10px] font-black tracking-wider uppercase">
                Lilac Quests
              </span>
            </div>
            {/* Black + Lilac text */}
            <p className="text-[10.5px] sm:text-xs text-black font-bold leading-snug">
              Earn badges & level up with <span className="text-[#9333EA] font-extrabold">interactive rewards</span>
            </p>
          </div>
        </div>
      </div>

      {/* Downside Action Buttons: Yellow Enroll & Pink Enter the Arena */}
      <div className="pt-1.5 sm:pt-2.5 lg:pt-3 flex items-center gap-2 sm:gap-3 w-full">
        {/* Yellow Button: Enroll */}
        <button
          type="button"
          onClick={handleEnroll}
          className="flex-1 py-2.5 sm:py-3 lg:py-3.5 px-3 sm:px-4 rounded-xl sm:rounded-2xl bg-[#FACC15] hover:bg-[#FDE047] active:bg-[#EAB308] text-slate-950 font-black text-xs sm:text-sm tracking-tight flex items-center justify-center gap-1.5 sm:gap-2 shadow-md shadow-amber-400/20 active:scale-95 transition-all cursor-pointer truncate"
        >
          {isEnrolled ? (
            <>
              <Check className="w-3.5 h-3.5 sm:w-4 sm:h-4 stroke-[3] shrink-0" />
              <span className="truncate">Enrolled</span>
            </>
          ) : (
            <>
              <Zap className="w-3.5 h-3.5 sm:w-4 sm:h-4 fill-slate-950 stroke-slate-950 shrink-0" />
              <span className="truncate">Enroll</span>
            </>
          )}
        </button>

        {/* Pink Button: Enter the Arena */}
        <button
          type="button"
          onClick={handleEnterArena}
          className="flex-1 py-2.5 sm:py-3 lg:py-3.5 px-3 sm:px-4 rounded-xl sm:rounded-2xl bg-[#EC4899] hover:bg-[#F472B6] active:bg-[#DB2777] text-white font-black text-xs sm:text-sm tracking-tight flex items-center justify-center gap-1.5 sm:gap-2 shadow-md shadow-pink-500/20 active:scale-95 transition-all cursor-pointer truncate"
        >
          <Swords className="w-3.5 h-3.5 sm:w-4 sm:h-4 stroke-[2.5] shrink-0" />
          <span className="truncate">Enter the Arena</span>
        </button>
      </div>
    </div>
  );
}
