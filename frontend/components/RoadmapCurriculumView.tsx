"use client";

import React, { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  CheckCircle2,
  Check,
  ChevronDown,
  ChevronRight,
  ExternalLink,
  BookOpen,
  Sparkles,
  Layers,
  Search,
  Clock,
  Play,
  HelpCircle,
  Inbox,
  Zap,
  Swords,
} from "lucide-react";
import InteractivePracticeAccordionCard from "./InteractivePracticeAccordionCard";
import RoadmapTreeView from "./RoadmapTreeView";

function QuizBadgeIcon({ className = "w-4.5 h-4.5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 36 36" fill="none" className={className}>
      <rect x="5" y="4" width="26" height="28" rx="5" fill="white" />
      <path d="M10 10H17" stroke="#C4B5FD" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M10 15H19" stroke="#E2E8F0" strokeWidth="2" strokeLinecap="round" />
      <circle cx="21" cy="21" r="8.5" fill="url(#quizGradMobile)" />
      <path
        d="M21 16.8C19.9 16.8 19 17.5 19 18.6H20.3C20.3 18.1 20.6 17.8 21 17.8C21.4 17.8 21.8 18.1 21.8 18.6C21.8 19.3 20.8 19.6 20.8 20.8H21.7C21.7 20 22.8 19.8 22.8 18.6C22.8 17.5 22 16.8 21 16.8Z"
        fill="white"
      />
      <circle cx="21.2" cy="23.2" r="0.8" fill="white" />
      <path d="M28 5L28.7 7L31 7.7L28.7 8.4L28 10.5L27.3 8.4L25 7.7L27.3 7L28 5Z" fill="#FBBF24" />
      <defs>
        <linearGradient id="quizGradMobile" x1="12" y1="12" x2="30" y2="30" gradientUnits="userSpaceOnUse">
          <stop stopColor="#F59E0B" />
          <stop offset="1" stopColor="#D97706" />
        </linearGradient>
      </defs>
    </svg>
  );
}

function GamificationBadgeIcon({ className = "w-4.5 h-4.5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 36 36" fill="none" className={className}>
      <rect x="4" y="10" width="28" height="17" rx="8" fill="url(#gamepadGradMobile)" />
      <rect x="9.5" y="15.5" width="6" height="2" rx="1" fill="#FFFFFF" />
      <rect x="11.5" y="13.5" width="2" height="6" rx="1" fill="#FFFFFF" />
      <circle cx="23" cy="15" r="1.5" fill="#E879F9" />
      <circle cx="26" cy="18" r="1.5" fill="#C084FC" />
      <circle cx="20" cy="18" r="1.5" fill="#818CF8" />
      <circle cx="23" cy="21" r="1.5" fill="#F472B6" />
      <path d="M18 4.5L19.3 7.8L22.5 9L19.3 10.2L18 13.5L16.7 10.2L13.5 9L16.7 7.8L18 4.5Z" fill="#FDE047" />
      <defs>
        <linearGradient id="gamepadGradMobile" x1="4" y1="10" x2="32" y2="27" gradientUnits="userSpaceOnUse">
          <stop stopColor="#A855F7" />
          <stop offset="1" stopColor="#6D28D9" />
        </linearGradient>
      </defs>
    </svg>
  );
}

export interface CheckpointItem {
  id: string;
  index: number;
  title: string;
  subtitle?: string;
  isCompleted: boolean;
  isCurrentTarget: boolean;
  nodesCount: number;
  completedNodesCount: number;
}

export interface SubtopicTopic {
  id: string;
  name: string;
  isRecommended?: boolean;
  isAlternative?: boolean;
  isOrderNotStrict?: boolean;
  docUrl?: string;
  desc?: string;
}

export interface SubtopicGroup {
  groupName?: string;
  topics: SubtopicTopic[];
}

export interface NodeTreeBranches {
  description: string;
  groups: SubtopicGroup[];
}

export interface RoadmapCurriculumViewProps {
  roadmapTitle: string;
  roadmapId: string;
  category: "skill" | "career";
  ratings?: string;
  salary?: string;
  growth?: string;
  color?: string;
  checkpoints: CheckpointItem[];
  progressPct: number;
  doneCount: number;
  totalCount: number;
  isEnrolled: boolean;
  onEnroll: () => void;
  onBack: () => void;
  onToggleCheckpoint: (checkpoint: CheckpointItem) => void;
  onToggleSubtopic?: (subtopicId: string, nodeName: string) => void;
  completedSubtopics?: Record<string, boolean>;
  getSubtopicsForNode?: (nodeName: string, roadmapId?: string) => NodeTreeBranches;
}

export default function RoadmapCurriculumView({
  roadmapTitle,
  roadmapId,
  category,
  ratings = "4.9 Rating",
  salary,
  growth,
  color = "#3776AB",
  checkpoints,
  progressPct,
  doneCount,
  totalCount,
  isEnrolled,
  onEnroll,
  onBack,
  onToggleCheckpoint,
  onToggleSubtopic,
  completedSubtopics = {},
  getSubtopicsForNode,
}: RoadmapCurriculumViewProps) {
  const router = useRouter();
  const [searchFilter, setSearchFilter] = useState("");
  const [filterMode, setFilterMode] = useState<"all" | "completed" | "remaining">("all");
  const [viewMode, setViewMode] = useState<"tree" | "modules">("tree");
  const [expandedModules, setExpandedModules] = useState<Record<string, boolean>>({
    [checkpoints[0]?.id || ""]: true,
  });

  const toggleExpand = (id: string) => {
    setExpandedModules((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const expandAll = () => {
    const allExpanded: Record<string, boolean> = {};
    checkpoints.forEach((cp) => {
      allExpanded[cp.id] = true;
    });
    setExpandedModules(allExpanded);
  };

  const collapseAll = () => {
    setExpandedModules({});
  };

  const filteredCheckpoints = useMemo(() => {
    return checkpoints.filter((cp) => {
      if (filterMode === "completed" && !cp.isCompleted) return false;
      if (filterMode === "remaining" && cp.isCompleted) return false;
      if (searchFilter.trim()) {
        const q = searchFilter.toLowerCase();
        const matchTitle = cp.title.toLowerCase().includes(q);
        const matchSubtitle = (cp.subtitle || "").toLowerCase().includes(q);
        return matchTitle || matchSubtitle;
      }
      return true;
    });
  }, [checkpoints, filterMode, searchFilter]);

  const isPython = roadmapId === "python-mastery" || roadmapId.includes("python");

  return (
    <div className="max-w-7xl w-full mx-auto space-y-8 pb-20">
      {/* ── Top Back Navigation & Breadcrumb ── */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white border border-slate-200/90 hover:bg-slate-50 text-slate-700 hover:text-slate-900 font-bold text-xs shadow-2xs transition-all cursor-pointer active:scale-95"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Roadmaps</span>
        </button>

        <div className="flex items-center gap-2">
          <span className="px-3 py-1 rounded-full bg-slate-100 border border-slate-200 text-slate-600 text-[11px] font-bold uppercase tracking-wider">
            {category === "career" ? "Career Path" : "Skill Roadmap"}
          </span>
          <span className="text-xs text-slate-400 font-medium hidden sm:inline-block">/</span>
          <span className="text-xs font-semibold text-slate-800 hidden sm:inline-block">
            {roadmapTitle}
          </span>
        </div>
      </div>

      {/* ── Header Card ── */}
      <div className="relative overflow-hidden rounded-3xl bg-[#7d26cd] border border-[#6b1eb5] shadow-xl flex flex-col lg:flex-row items-stretch">
        {/* Left Section (Purple): Title, Stats, and Cards 1, 2, 3 */}
        <div className="flex-1 min-w-0 p-3.5 sm:p-5 lg:p-7 xl:p-8 flex flex-col justify-between space-y-3.5 sm:space-y-6 lg:space-y-8">
          <div className="flex items-center gap-2.5 sm:gap-4 lg:gap-5">
            {/* Logo container */}
            {isPython ? (
              <div className="w-10 h-10 sm:w-14 sm:h-14 lg:w-16 lg:h-16 rounded-xl sm:rounded-2xl bg-black flex items-center justify-center p-1.5 sm:p-2.5 lg:p-3 shadow-md shrink-0">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/images/tech-logos/python.svg"
                  alt="Python"
                  className="w-6 h-6 sm:w-9 sm:h-9 lg:w-10 lg:h-10 object-contain"
                />
              </div>
            ) : (
              <div className="w-10 h-10 sm:w-14 sm:h-14 lg:w-16 lg:h-16 rounded-xl sm:rounded-2xl bg-black flex items-center justify-center shadow-md text-white shrink-0">
                <BookOpen className="w-5 h-5 sm:w-7 sm:h-7 lg:w-8 lg:h-8 text-white" />
              </div>
            )}

            <div className="space-y-1 sm:space-y-1.5 lg:space-y-2">
              <h1 className="text-lg sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-black text-white tracking-tight leading-snug">
                {roadmapTitle}
              </h1>

              {/* Small stats icons directly downside the title text - compact on mobile */}
              <div className="flex items-center gap-x-2.5 gap-y-1 sm:gap-x-3.5 sm:gap-y-1.5 lg:gap-x-5 lg:gap-y-2 flex-wrap text-white text-[11px] sm:text-xs lg:text-sm font-semibold sm:font-bold">
                <div className="flex items-center gap-1 sm:gap-1.5">
                  <Clock className="w-3 h-3 sm:w-3.5 sm:h-3.5 lg:w-4 lg:h-4 text-white/80 shrink-0" />
                  <span>40 Hours</span>
                </div>
                <div className="flex items-center gap-1 sm:gap-1.5">
                  <Play className="w-3 h-3 sm:w-3.5 sm:h-3.5 lg:w-4 lg:h-4 text-white/80 shrink-0 fill-white/80" />
                  <span>100 Videos</span>
                </div>
                <div className="flex items-center gap-1 sm:gap-1.5">
                  <HelpCircle className="w-3 h-3 sm:w-3.5 sm:h-3.5 lg:w-4 lg:h-4 text-white/80 shrink-0" />
                  <span>25 Quizzes</span>
                </div>
                <div className="flex items-center gap-1 sm:gap-1.5">
                  <Inbox className="w-3 h-3 sm:w-3.5 sm:h-3.5 lg:w-4 lg:h-4 text-white/80 shrink-0" />
                  <span>3 Projects</span>
                </div>
              </div>
            </div>
          </div>

          {/* ── DESKTOP ONLY: Cards 1, 2, 3 in a row ── */}
          <div className="pt-3 sm:pt-4 lg:pt-5 border-t border-black/15 hidden lg:flex items-stretch gap-3 lg:gap-3.5">
            {/* Card 1: IN ROADMAP (Black background, White text) */}
            <div className="shrink lg:flex-1 lg:max-w-[220px] rounded-2xl bg-black p-3.5 lg:p-4 text-white shadow-md border border-white/10 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-1.5 text-amber-400 font-extrabold text-[11px] uppercase tracking-wider mb-2.5">
                  <span>🔥</span>
                  <span>IN ROADMAP</span>
                </div>

                <div className="space-y-2 text-xs">
                  <div className="flex items-center justify-between border-b border-dashed border-white/20 pb-1.5">
                    <span className="flex items-center gap-1.5 font-bold text-white truncate mr-2">
                      <span className="text-amber-400 text-sm leading-none">•</span> Core Syntax & DSA
                    </span>
                    <span className="text-slate-400 text-xs font-semibold shrink-0">5 Stns</span>
                  </div>
                  <div className="flex items-center justify-between border-b border-dashed border-white/20 pb-1.5">
                    <span className="flex items-center gap-1.5 font-bold text-white truncate mr-2">
                      <span className="text-amber-400 text-sm leading-none">•</span> OOP & Decorators
                    </span>
                    <span className="text-slate-400 text-xs font-semibold shrink-0">6 Stns</span>
                  </div>
                  <div className="flex items-center justify-between border-b border-dashed border-white/20 pb-1.5">
                    <span className="flex items-center gap-1.5 font-bold text-white truncate mr-2">
                      <span className="text-amber-400 text-sm leading-none">•</span> Web Frameworks
                    </span>
                    <span className="text-slate-400 text-xs font-semibold shrink-0">4 Stns</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1.5 font-bold text-white truncate mr-2">
                      <span className="text-amber-400 text-sm leading-none">•</span> Async & Testing
                    </span>
                    <span className="text-slate-400 text-xs font-semibold shrink-0">6 Stns</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Card 2: YOU GET (White background, Black text) */}
            <div className="shrink lg:flex-1 lg:max-w-[220px] rounded-2xl bg-white p-3.5 lg:p-4 text-black shadow-md border border-slate-100 flex flex-col justify-between">
              <div>
                <div className="text-slate-500 font-extrabold text-[11px] uppercase tracking-wider mb-2.5">
                  YOU GET
                </div>

                <div className="space-y-2 text-xs">
                  <div className="flex items-center border-b border-dashed border-slate-200 pb-1.5">
                    <span className="flex items-center gap-1.5 font-bold text-black truncate">
                      <span className="text-black text-sm leading-none">•</span> 21 Stations
                    </span>
                  </div>
                  <div className="flex items-center border-b border-dashed border-slate-200 pb-1.5">
                    <span className="flex items-center gap-1.5 font-bold text-black truncate">
                      <span className="text-black text-sm leading-none">•</span> Subtopics
                    </span>
                  </div>
                  <div className="flex items-center border-b border-dashed border-slate-200 pb-1.5">
                    <span className="flex items-center gap-1.5 font-bold text-black truncate">
                      <span className="text-black text-sm leading-none">•</span> Official Docs
                    </span>
                  </div>
                  <div className="flex items-center">
                    <span className="flex items-center gap-1.5 font-bold text-black truncate">
                      <span className="text-black text-sm leading-none">•</span> Real Projects
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Card 3: Round Percentage */}
            <div className="shrink lg:flex-1 lg:max-w-[220px] rounded-2xl bg-white p-3.5 lg:p-4 text-black shadow-md border border-slate-100 flex flex-col justify-between">
              <div className="text-slate-500 font-extrabold text-[11px] uppercase tracking-wider mb-2.5">
                PROGRESS
              </div>

              <div className="my-auto flex flex-col items-center justify-center py-1">
                <div className="relative flex items-center justify-center w-18 h-18 lg:w-20 lg:h-20">
                  <svg className="w-18 h-18 lg:w-20 lg:h-20 -rotate-90" viewBox="0 0 36 36">
                    <path
                      className="text-slate-100"
                      strokeWidth="3.5"
                      stroke="currentColor"
                      fill="none"
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    />
                    <path
                      className="text-[#7d26cd] transition-all duration-500"
                      strokeDasharray={`${progressPct}, 100`}
                      strokeWidth="3.5"
                      strokeLinecap="round"
                      stroke="currentColor"
                      fill="none"
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    />
                  </svg>
                  <div className="absolute flex flex-col items-center justify-center text-center">
                    <span className="text-base lg:text-lg font-black text-black leading-none">
                      {progressPct}%
                    </span>
                  </div>
                </div>
              </div>

              <div className="pt-1.5 border-t border-dashed border-slate-200 text-center">
                <span className="text-xs font-bold text-slate-600 block truncate">
                  {doneCount} / {totalCount} Done
                </span>
              </div>
            </div>
          </div>

          {/* ── MOBILE ONLY: Row 1 (Black + White side-by-side) & Row 2 (Progress + Quiz/Gamification side-by-side) ── */}
          <div className="pt-2.5 border-t border-black/15 flex flex-col gap-2 sm:gap-2.5 lg:hidden">
            {/* Mobile Row 1: Black Card (IN ROADMAP) & White Card (YOU GET) Side-by-Side */}
            <div className="grid grid-cols-2 gap-2 sm:gap-2.5">
              {/* Black Card: IN ROADMAP */}
              <div className="rounded-xl bg-black p-2.5 sm:p-3 text-white shadow-md border border-white/10 flex flex-col justify-between h-[138px]">
                <div>
                  <div className="flex items-center gap-1 text-amber-400 font-extrabold text-[10px] uppercase tracking-wider mb-1.5">
                    <span>🔥</span>
                    <span>IN ROADMAP</span>
                  </div>

                  <div className="space-y-1 text-[10.5px]">
                    <div className="flex items-center justify-between border-b border-dashed border-white/20 pb-0.5">
                      <span className="font-bold text-white truncate mr-1">• Core Syntax</span>
                      <span className="text-slate-400 text-[9.5px] font-semibold shrink-0">5 Stns</span>
                    </div>
                    <div className="flex items-center justify-between border-b border-dashed border-white/20 pb-0.5">
                      <span className="font-bold text-white truncate mr-1">• OOP & Dec</span>
                      <span className="text-slate-400 text-[9.5px] font-semibold shrink-0">6 Stns</span>
                    </div>
                    <div className="flex items-center justify-between border-b border-dashed border-white/20 pb-0.5">
                      <span className="font-bold text-white truncate mr-1">• Web Fmwk</span>
                      <span className="text-slate-400 text-[9.5px] font-semibold shrink-0">4 Stns</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-white truncate mr-1">• Async & Test</span>
                      <span className="text-slate-400 text-[9.5px] font-semibold shrink-0">6 Stns</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* White Card: YOU GET */}
              <div className="rounded-xl bg-white p-2.5 sm:p-3 text-black shadow-md border border-slate-100 flex flex-col justify-between h-[138px]">
                <div>
                  <div className="text-slate-500 font-extrabold text-[10px] uppercase tracking-wider mb-1.5">
                    YOU GET
                  </div>

                  <div className="space-y-1 text-[10.5px]">
                    <div className="flex items-center border-b border-dashed border-slate-200 pb-0.5">
                      <span className="font-bold text-black truncate">• 21 Stations</span>
                    </div>
                    <div className="flex items-center border-b border-dashed border-slate-200 pb-0.5">
                      <span className="font-bold text-black truncate">• Subtopics</span>
                    </div>
                    <div className="flex items-center border-b border-dashed border-slate-200 pb-0.5">
                      <span className="font-bold text-black truncate">• Official Docs</span>
                    </div>
                    <div className="flex items-center">
                      <span className="font-bold text-black truncate">• Real Projects</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Mobile Row 2: Progress Card & Beside that Quiz + Gamification Cards */}
            <div className="grid grid-cols-2 gap-2 sm:gap-2.5">
              {/* Left Column: Progress Card (Moved to downside) */}
              <div className="rounded-xl bg-white p-2.5 sm:p-3 text-black shadow-md border border-slate-100 flex flex-col justify-between h-[138px]">
                <div className="text-slate-500 font-extrabold text-[10px] uppercase tracking-wider">
                  PROGRESS
                </div>

                <div className="my-auto flex flex-col items-center justify-center py-0.5">
                  <div className="relative flex items-center justify-center w-13 h-13 sm:w-15 sm:h-15">
                    <svg className="w-13 h-13 sm:w-15 sm:h-15 -rotate-90" viewBox="0 0 36 36">
                      <path
                        className="text-slate-100"
                        strokeWidth="3.5"
                        stroke="currentColor"
                        fill="none"
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      />
                      <path
                        className="text-[#7d26cd] transition-all duration-500"
                        strokeDasharray={`${progressPct}, 100`}
                        strokeWidth="3.5"
                        strokeLinecap="round"
                        stroke="currentColor"
                        fill="none"
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      />
                    </svg>
                    <div className="absolute flex flex-col items-center justify-center text-center">
                      <span className="text-sm sm:text-base font-black text-black leading-none">
                        {progressPct}%
                      </span>
                    </div>
                  </div>
                </div>

                <div className="pt-1 border-t border-dashed border-slate-200 text-center">
                  <span className="text-[9.5px] font-bold text-slate-600 block truncate">
                    {doneCount} / {totalCount} Done
                  </span>
                </div>
              </div>

              {/* Right Column: Beside Progress -> Quiz & Gamification Cards (Black background) */}
              <div className="flex flex-col justify-between gap-1.5 sm:gap-2 h-[138px]">
                {/* Quiz Mini Card: Black */}
                <div
                  onClick={() => router.push("/practice")}
                  className="flex-1 bg-black rounded-xl p-2.5 flex items-center gap-2.5 shadow-md border border-white/10 active:scale-95 transition-all cursor-pointer overflow-hidden hover:border-white/20"
                >
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#7C3AED] via-[#6D28D9] to-[#4C1D95] p-1.5 flex items-center justify-center shrink-0 shadow-xs ring-2 ring-purple-900/60 relative">
                    <QuizBadgeIcon className="w-4.5 h-4.5 drop-shadow-xs" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-xs sm:text-sm font-black text-white leading-tight truncate">
                      Topic Quiz
                    </div>
                  </div>
                </div>

                {/* Gamification Mini Card: Black */}
                <div
                  onClick={() => router.push("/practice")}
                  className="flex-1 bg-black rounded-xl p-2.5 flex items-center gap-2.5 shadow-md border border-white/10 active:scale-95 transition-all cursor-pointer overflow-hidden hover:border-white/20"
                >
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#1E1B4B] via-[#312E81] to-[#4338CA] p-1.5 flex items-center justify-center shrink-0 shadow-xs ring-2 ring-purple-900/60 relative">
                    <GamificationBadgeIcon className="w-4.5 h-4.5 drop-shadow-xs" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-xs sm:text-sm font-black text-white leading-tight truncate">
                      Gamification
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── MOBILE ONLY: Action Buttons Bar downside ── */}
        <div className="p-3 bg-[#101523] border-t border-white/10 lg:hidden flex items-center gap-2.5 w-full">
          <button
            type="button"
            onClick={onEnroll}
            className="flex-1 py-2.5 px-3 rounded-xl bg-[#FACC15] hover:bg-[#FDE047] active:bg-[#EAB308] text-slate-950 font-black text-xs tracking-tight flex items-center justify-center gap-1.5 shadow-md shadow-amber-400/20 active:scale-95 transition-all cursor-pointer truncate"
          >
            {isEnrolled ? (
              <>
                <Check className="w-3.5 h-3.5 stroke-[3] shrink-0" />
                <span className="truncate">Enrolled</span>
              </>
            ) : (
              <>
                <Zap className="w-3.5 h-3.5 fill-slate-950 stroke-slate-950 shrink-0" />
                <span className="truncate">Enroll</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={() => router.push("/practice")}
            className="flex-1 py-2.5 px-3 rounded-xl bg-[#EC4899] hover:bg-[#F472B6] active:bg-[#DB2777] text-white font-black text-xs tracking-tight flex items-center justify-center gap-1.5 shadow-md shadow-pink-500/20 active:scale-95 transition-all cursor-pointer truncate"
          >
            <Swords className="w-3.5 h-3.5 stroke-[2.5] shrink-0" />
            <span className="truncate">Enter the Arena</span>
          </button>
        </div>

        {/* ── DESKTOP ONLY: Right Section with full interactive practice card & downside buttons ── */}
        <div className="w-full lg:w-[410px] xl:w-[460px] 2xl:w-[490px] shrink-0 self-stretch hidden lg:flex flex-col bg-[#101523] border-l border-white/10">
          <InteractivePracticeAccordionCard
            className="w-full h-full"
            isEnrolled={isEnrolled}
            onEnroll={onEnroll}
          />
        </div>
      </div>

      {/* ── Curriculum Views: Pure CSS Hierarchical Tree on Python Roadmap, Switchable on Others ── */}
      {isPython ? (
        <RoadmapTreeView
          roadmapTitle={roadmapTitle}
          roadmapId={roadmapId}
          checkpoints={checkpoints}
          completedSubtopics={completedSubtopics}
          onToggleCheckpoint={onToggleCheckpoint}
          onToggleSubtopic={onToggleSubtopic}
          getSubtopicsForNode={getSubtopicsForNode}
          color={color}
        />
      ) : (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <h2 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight">
                Curriculum Modules
              </h2>
              <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 text-xs font-bold">
                {checkpoints.length}
              </span>
            </div>

            {/* View Mode Switcher: Tree View vs Modules View */}
            <div className="flex items-center bg-slate-100 rounded-xl p-0.5 text-xs font-semibold text-slate-600">
              <button
                type="button"
                onClick={() => setViewMode("tree")}
                className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                  viewMode === "tree" ? "bg-white text-slate-900 shadow-2xs font-bold" : "hover:text-slate-900"
                }`}
              >
                Tree View
              </button>
              <button
                type="button"
                onClick={() => setViewMode("modules")}
                className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                  viewMode === "modules" ? "bg-white text-slate-900 shadow-2xs font-bold" : "hover:text-slate-900"
                }`}
              >
                Modules View
              </button>
            </div>
          </div>

          {viewMode === "tree" ? (
            <RoadmapTreeView
              roadmapTitle={roadmapTitle}
              roadmapId={roadmapId}
              checkpoints={checkpoints}
              completedSubtopics={completedSubtopics}
              onToggleCheckpoint={onToggleCheckpoint}
              onToggleSubtopic={onToggleSubtopic}
              getSubtopicsForNode={getSubtopicsForNode}
              color={color}
            />
          ) : (
            <div className="space-y-4 pt-1">
              <div className="flex items-center justify-end gap-2 flex-wrap">
                {/* Filter Chips & Expand Controls */}
                <div className="flex items-center bg-slate-100 rounded-xl p-0.5 text-xs font-semibold text-slate-600">
                  <button
                    type="button"
                    onClick={() => setFilterMode("all")}
                    className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                      filterMode === "all" ? "bg-white text-slate-900 shadow-2xs" : "hover:text-slate-900"
                    }`}
                  >
                    All ({checkpoints.length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setFilterMode("completed")}
                    className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                      filterMode === "completed" ? "bg-white text-slate-900 shadow-2xs" : "hover:text-slate-900"
                    }`}
                  >
                    Done ({doneCount})
                  </button>
                  <button
                    type="button"
                    onClick={() => setFilterMode("remaining")}
                    className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                      filterMode === "remaining" ? "bg-white text-slate-900 shadow-2xs" : "hover:text-slate-900"
                    }`}
                  >
                    Remaining ({totalCount - doneCount})
                  </button>
                </div>

                <button
                  type="button"
                  onClick={expandAll}
                  className="px-2.5 py-1 text-xs font-semibold text-slate-600 hover:text-slate-900 cursor-pointer"
                >
                  Expand All
                </button>
                <span className="text-slate-300">|</span>
                <button
                  type="button"
                  onClick={collapseAll}
                  className="px-2.5 py-1 text-xs font-semibold text-slate-600 hover:text-slate-900 cursor-pointer"
                >
                  Collapse
                </button>
              </div>

              {/* Search input */}
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchFilter}
                  onChange={(e) => setSearchFilter(e.target.value)}
                  placeholder="Search modules or topics..."
                  className="w-full pl-10 pr-4 py-2 rounded-xl bg-white border border-slate-200/90 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400 transition-all"
                />
              </div>

              {/* ── Modules Accordion ── */}
              <div className="space-y-3 pt-2">
                {filteredCheckpoints.map((cp) => {
                  const isExpanded = !!expandedModules[cp.id];
                  const branchData = getSubtopicsForNode ? getSubtopicsForNode(cp.title, roadmapId) : null;
                  const allTopics = branchData?.groups?.flatMap((g) => g.topics) || [];

                  return (
                    <div
                      key={cp.id}
                      className={`rounded-2xl border transition-all duration-200 overflow-hidden ${
                        cp.isCompleted
                          ? "bg-slate-50/70 border-slate-200"
                          : "bg-white border-slate-200/90 hover:border-slate-300 shadow-xs"
                      }`}
                    >
                      {/* Module Header Row */}
                      <div className="p-4 sm:p-5 flex items-start justify-between gap-4">
                        <div className="flex items-start gap-3.5 flex-1 min-w-0">
                          {/* Status / Toggle Completion Button */}
                          <button
                            type="button"
                            onClick={() => onToggleCheckpoint(cp)}
                            title={cp.isCompleted ? "Mark incomplete" : "Mark module completed"}
                            className={`w-7 h-7 rounded-xl flex items-center justify-center transition-all cursor-pointer shrink-0 mt-0.5 ${
                              cp.isCompleted
                                ? "bg-emerald-500 hover:bg-emerald-600 text-white shadow-xs"
                                : "border-2 border-slate-300 hover:border-slate-500 text-slate-500 bg-white"
                            }`}
                          >
                            {cp.isCompleted ? (
                              <Check className="w-4 h-4 stroke-[3]" />
                            ) : (
                              <span className="text-[11px] font-bold">{cp.index + 1}</span>
                            )}
                          </button>

                          {/* Title & Subtitle */}
                          <div
                            className="flex-1 min-w-0 cursor-pointer select-none"
                            onClick={() => toggleExpand(cp.id)}
                          >
                            <div className="flex items-center gap-2 flex-wrap">
                              <h3
                                className={`text-sm sm:text-base font-bold transition-colors ${
                                  cp.isCompleted
                                    ? "text-slate-600 line-through decoration-slate-300"
                                    : "text-slate-900 hover:text-blue-600"
                                }`}
                              >
                                {cp.title}
                              </h3>
                              {allTopics.length > 0 && (
                                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-slate-100 text-slate-600">
                                  {allTopics.length} topics
                                </span>
                              )}
                            </div>

                            {cp.subtitle && (
                              <p className="text-xs text-slate-500 mt-1 font-normal leading-relaxed">
                                {cp.subtitle}
                              </p>
                            )}
                          </div>
                        </div>

                        {/* Expand / Collapse toggle */}
                        <button
                          type="button"
                          onClick={() => toggleExpand(cp.id)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-all cursor-pointer shrink-0"
                          title={isExpanded ? "Collapse" : "Expand"}
                        >
                          {isExpanded ? (
                            <ChevronDown className="w-4 h-4" />
                          ) : (
                            <ChevronRight className="w-4 h-4" />
                          )}
                        </button>
                      </div>

                      {/* Expanded Subtopics Area */}
                      {isExpanded && (
                        <div className="px-4 sm:px-5 pb-5 pt-1 border-t border-slate-100 bg-slate-50/40 space-y-4">
                          {branchData?.description && (
                            <p className="text-xs text-slate-600 font-medium leading-relaxed pt-2">
                              {branchData.description}
                            </p>
                          )}

                          {branchData?.groups && branchData.groups.length > 0 ? (
                            <div className="space-y-4 pt-1">
                              {branchData.groups.map((group, gIdx) => (
                                <div key={gIdx} className="space-y-2">
                                  {group.groupName && (
                                    <div className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500">
                                      {group.groupName}
                                    </div>
                                  )}

                                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                                    {group.topics.map((topic) => {
                                      const isTopicDone = !!completedSubtopics[topic.id];

                                      return (
                                        <div
                                          key={topic.id}
                                          className={`p-3 rounded-xl border transition-all flex items-start gap-3 ${
                                            isTopicDone
                                              ? "bg-emerald-50/30 border-emerald-200"
                                              : "bg-white border-slate-200/80 hover:border-slate-300"
                                          }`}
                                        >
                                          {/* Topic Checkbox */}
                                          {onToggleSubtopic && (
                                            <button
                                              type="button"
                                              onClick={() => onToggleSubtopic(topic.id, cp.title)}
                                              className={`w-4 h-4 rounded-md mt-0.5 flex items-center justify-center transition-all cursor-pointer shrink-0 ${
                                                isTopicDone
                                                  ? "bg-emerald-500 text-white"
                                                  : "border border-slate-300 hover:border-slate-500 bg-white"
                                              }`}
                                              title={isTopicDone ? "Mark incomplete" : "Mark topic done"}
                                            >
                                              {isTopicDone && <Check className="w-3 h-3 stroke-[3]" />}
                                            </button>
                                          )}

                                          <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-1.5 flex-wrap">
                                              <span
                                                className={`text-xs font-bold ${
                                                  isTopicDone
                                                    ? "text-slate-600 line-through decoration-slate-300"
                                                    : "text-slate-900"
                                                }`}
                                              >
                                                {topic.name}
                                              </span>

                                              {topic.isRecommended && (
                                                <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-amber-50 text-amber-700 border border-amber-200">
                                                  Recommended
                                                </span>
                                              )}

                                              {topic.isAlternative && (
                                                <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-slate-100 text-slate-600">
                                                  Alternative
                                                </span>
                                              )}

                                              {topic.docUrl && (
                                                <a
                                                  href={topic.docUrl}
                                                  target="_blank"
                                                  rel="noopener noreferrer"
                                                  className="inline-flex items-center gap-0.5 text-[10px] text-blue-600 hover:text-blue-800 font-semibold hover:underline"
                                                  title="Official Documentation"
                                                >
                                                  <ExternalLink className="w-2.5 h-2.5" />
                                                  <span>Docs</span>
                                                </a>
                                              )}
                                            </div>

                                            {topic.desc && (
                                              <p className="text-[11px] text-slate-500 mt-0.5 leading-snug">
                                                {topic.desc}
                                              </p>
                                            )}
                                          </div>
                                        </div>
                                      );
                                    })}
                                  </div>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div className="text-xs text-slate-500 py-2">
                              Complete this core milestone to advance your roadmap progress.
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
