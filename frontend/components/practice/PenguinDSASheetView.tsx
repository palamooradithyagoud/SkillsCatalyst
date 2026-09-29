"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
import {
  Search,
  ExternalLink,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Bookmark,
  Layers,
  Sparkles,
  ArrowRight,
  Filter,
  Check,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import {
  PENGUIN_DSA_SHEET_CATEGORIES,
  TOTAL_PENGUIN_PROBLEMS,
  SheetProblem,
  Difficulty,
  Platform,
} from "@/data/practice/penguinDsaSheetData";
import { SmoothCursor } from "@/components/ui/smooth-cursor";
import InteractiveCharacter from "@/components/ui/interactive-3d-character";

const STORAGE_KEY = "penguin_sheet_solved_v1";

export function PenguinDSASheetView() {
  const [solvedIds, setSolvedIds] = useState<Set<string>>(() => new Set());
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>("All");
  const [selectedStatus, setSelectedStatus] = useState<"All" | "Unsolved" | "Solved">("All");
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>(() => {
    // Open first 3 categories by default
    const init: Record<string, boolean> = {};
    PENGUIN_DSA_SHEET_CATEGORIES.forEach((c, idx) => {
      init[c.id] = idx < 2;
    });
    return init;
  });

  const heroCardRef = useRef<HTMLDivElement>(null);

  // Load solved state from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const arr = JSON.parse(stored);
        if (Array.isArray(arr)) {
          setSolvedIds(new Set(arr));
        }
      }
    } catch {
      // ignore
    }
  }, []);

  // Save solved state
  const toggleSolved = (id: string) => {
    setSolvedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(Array.from(next)));
      } catch {
        // ignore
      }
      return next;
    });
  };

  const toggleCategory = (id: string) => {
    setExpandedCategories((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const expandAll = () => {
    const allOpen: Record<string, boolean> = {};
    PENGUIN_DSA_SHEET_CATEGORIES.forEach((c) => {
      allOpen[c.id] = true;
    });
    setExpandedCategories(allOpen);
  };

  const collapseAll = () => {
    setExpandedCategories({});
  };

  // Filter problems within categories
  const filteredCategories = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();

    return PENGUIN_DSA_SHEET_CATEGORIES.map((cat) => {
      const matchingProblems = cat.problems.filter((prob) => {
        // Search query
        if (q && !prob.title.toLowerCase().includes(q) && !prob.platform.toLowerCase().includes(q)) {
          return false;
        }
        // Difficulty filter
        if (selectedDifficulty !== "All" && prob.difficulty !== selectedDifficulty) {
          return false;
        }
        // Status filter
        const isSolved = solvedIds.has(prob.id);
        if (selectedStatus === "Solved" && !isSolved) return false;
        if (selectedStatus === "Unsolved" && isSolved) return false;

        return true;
      });

      return {
        ...cat,
        filteredProblems: matchingProblems,
        solvedCount: cat.problems.filter((p) => solvedIds.has(p.id)).length,
      };
    }).filter((cat) => cat.filteredProblems.length > 0 || !searchQuery);
  }, [searchQuery, selectedDifficulty, selectedStatus, solvedIds]);

  // Difficulty statistics breakdown (Easy, Medium, Hard)
  const stats = useMemo(() => {
    let easyTotal = 0;
    let medTotal = 0;
    let hardTotal = 0;
    let easySolved = 0;
    let medSolved = 0;
    let hardSolved = 0;

    PENGUIN_DSA_SHEET_CATEGORIES.forEach((cat) => {
      cat.problems.forEach((p) => {
        const isSolved = solvedIds.has(p.id);
        if (p.difficulty === "Easy" || p.difficulty === "Basic") {
          easyTotal++;
          if (isSolved) easySolved++;
        } else if (p.difficulty === "Medium") {
          medTotal++;
          if (isSolved) medSolved++;
        } else if (p.difficulty === "Hard") {
          hardTotal++;
          if (isSolved) hardSolved++;
        }
      });
    });

    return { easyTotal, medTotal, hardTotal, easySolved, medSolved, hardSolved };
  }, [solvedIds]);

  const totalSolved = solvedIds.size;
  const progressPercent = TOTAL_PENGUIN_PROBLEMS > 0
    ? Math.min(100, Math.round((totalSolved / TOTAL_PENGUIN_PROBLEMS) * 100))
    : 0;

  const ringRadius = 38;
  const ringCircumference = 2 * Math.PI * ringRadius;
  const ringOffset = ringCircumference - (ringCircumference * progressPercent) / 100;

  const getDifficultyBadge = (diff: Difficulty) => {
    switch (diff) {
      case "Easy":
      case "Basic":
        return "bg-emerald-50 text-emerald-700 border-emerald-200";
      case "Medium":
        return "bg-amber-50 text-amber-700 border-amber-200";
      case "Hard":
        return "bg-rose-50 text-rose-700 border-rose-200";
      default:
        return "bg-slate-50 text-slate-700 border-slate-200";
    }
  };

  const getPlatformBadge = (platform: Platform) => {
    switch (platform) {
      case "leetcode":
        return "bg-amber-50 text-amber-800 border-amber-200/80";
      case "geeksforgeeks":
        return "bg-emerald-50 text-emerald-800 border-emerald-200/80";
      case "interviewbit":
        return "bg-blue-50 text-blue-800 border-blue-200/80";
      case "spoj":
        return "bg-purple-50 text-purple-800 border-purple-200/80";
      case "hackerrank":
        return "bg-teal-50 text-teal-800 border-teal-200/80";
      case "hackerearth":
        return "bg-indigo-50 text-indigo-800 border-indigo-200/80";
      default:
        return "bg-slate-50 text-slate-700 border-slate-200";
    }
  };

  return (
    <div className="space-y-6 sm:space-y-8 select-none max-w-5xl mx-auto">
      {/* ─────────────────────────────────────────────────────────────
          1. HERO HEADER: REDESIGNED WITH "YOUR PROGRESS" TRACKING SYSTEM
          ───────────────────────────────────────────────────────────── */}
      {/* Inline styles for Aurora Background & Character Container */}
      <style>{`
        .aurora-background {
          position: absolute;
          inset: 0;
          overflow: hidden;
          pointer-events: none;
          z-index: 0;
        }
        .aurora-blob {
          position: absolute;
          filter: blur(65px);
          border-radius: 9999px;
          opacity: 0.55;
          mix-blend-mode: screen;
          pointer-events: none;
          animation: aurora-drift 11s ease-in-out infinite alternate;
        }
        .aurora-blob:nth-child(1) {
          top: -20%;
          left: 8%;
          width: 380px;
          height: 380px;
          background: radial-gradient(circle, #7c3aed 0%, rgba(124, 58, 237, 0) 70%);
          animation-duration: 10s;
        }
        .aurora-blob:nth-child(2) {
          bottom: -15%;
          left: 38%;
          width: 420px;
          height: 380px;
          background: radial-gradient(circle, #4f46e5 0%, rgba(79, 70, 229, 0) 70%);
          animation-duration: 14s;
          animation-delay: -3s;
        }
        .aurora-blob:nth-child(3) {
          top: 15%;
          right: 8%;
          width: 350px;
          height: 350px;
          background: radial-gradient(circle, #a855f7 0%, rgba(168, 85, 247, 0) 70%);
          animation-duration: 12s;
          animation-delay: -6s;
        }
        @keyframes aurora-drift {
          0% { transform: translate(0, 0) scale(1); }
          50% { transform: translate(30px, -25px) scale(1.15); }
          100% { transform: translate(-25px, 20px) scale(0.92); }
        }
        .character-container {
          position: relative;
          z-index: 10;
        }
      `}</style>

      <div
        ref={heroCardRef}
        className="hero-container relative rounded-3xl overflow-hidden bg-gradient-to-r from-[#0d0722] via-[#140b33] to-[#240c4d] border border-purple-500/30 p-6 sm:p-8 md:p-10 text-white shadow-2xl min-h-[290px] flex flex-col justify-between"
      >
        {/* Custom Smooth Physics Cursor Scoped to this Card */}
        <SmoothCursor containerRef={heroCardRef} />

        {/* Aurora Background with Animated Glowing Blobs */}
        <div className="aurora-background">
          <div className="aurora-blob"></div>
          <div className="aurora-blob"></div>
          <div className="aurora-blob"></div>
        </div>

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6 sm:gap-8 my-auto">
          {/* Left Column: Big Bold Title (Text removed as requested) */}
          <div className="space-y-1.5 max-w-sm">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-white tracking-tight leading-none drop-shadow-md">
              Penguin&apos;s <span className="text-[#8B5CF6]">DSA Sheet</span>
            </h1>
          </div>

          {/* Center Column: 3D Interactive Penguin Character */}
          <div className="character-container flex items-center justify-center shrink-0">
            <InteractiveCharacter width={220} height={220} />
          </div>

          {/* ─────────────────────────────────────────────────────────
              Right Column: "YOUR PROGRESS" TRACKER (MATCHING EXACTLY)
              ───────────────────────────────────────────────────────── */}
          <div className="bg-[#140827]/90 border border-purple-500/25 rounded-2xl p-4 sm:p-5 shadow-2xl backdrop-blur-md w-full lg:w-[340px] shrink-0">

            {/* Header with Divider Line */}
            <div className="text-[11px] font-black text-slate-300 tracking-wider uppercase pb-2.5 border-b border-white/10">
              YOUR PROGRESS
            </div>

            {/* Tracker Body: Gauge + Stats */}
            <div className="pt-3.5 flex items-center justify-between gap-5">
              {/* Circular Ring Gauge */}
              <div className="relative w-22 h-22 sm:w-24 sm:h-24 flex items-center justify-center shrink-0">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 96 96">
                  {/* Background Track Ring */}
                  <circle
                    cx="48"
                    cy="48"
                    r={ringRadius}
                    stroke="rgba(255, 255, 255, 0.08)"
                    strokeWidth="7"
                    fill="none"
                  />
                  {/* Progress Ring */}
                  <circle
                    cx="48"
                    cy="48"
                    r={ringRadius}
                    stroke="url(#ringGradExact)"
                    strokeWidth="7"
                    strokeDasharray={ringCircumference}
                    strokeDashoffset={ringOffset}
                    strokeLinecap="round"
                    fill="none"
                    className="transition-all duration-700 ease-out"
                  />
                  <defs>
                    <linearGradient id="ringGradExact" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#A855F7" />
                      <stop offset="100%" stopColor="#7C3AED" />
                    </linearGradient>
                  </defs>
                </svg>

                {/* Center Content: Percent + Complete */}
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center select-none">
                  <span className="text-xl font-black text-white leading-none tracking-tight">
                    {progressPercent}%
                  </span>
                  <span className="text-[10px] font-semibold text-slate-400 mt-1 uppercase tracking-wider">
                    Complete
                  </span>
                </div>
              </div>

              {/* Right Side Stats */}
              <div className="flex-1 space-y-2.5">
                {/* Row 1: Solved */}
                <div className="flex items-center justify-between text-xs font-bold pb-1.5 border-b border-white/5">
                  <span className="text-slate-400">Solved</span>
                  <span className="text-white font-black text-sm">
                    {totalSolved} / {TOTAL_PENGUIN_PROBLEMS}
                  </span>
                </div>

                {/* Row 2: Topics */}
                <div className="flex items-center justify-between text-xs font-bold pb-2 border-b border-white/5">
                  <span className="text-slate-400">Topics</span>
                  <span className="text-white font-black text-sm">
                    {PENGUIN_DSA_SHEET_CATEGORIES.length}
                  </span>
                </div>

                {/* Row 3: Color-Coded Difficulty Indicators (E, M, H) */}
                <div className="flex items-center justify-between pt-0.5 text-xs font-black">
                  <span className="text-emerald-400" title={`Easy: ${stats.easySolved} / ${stats.easyTotal} solved`}>
                    E {stats.easySolved > 0 ? `${stats.easySolved}/${stats.easyTotal}` : stats.easyTotal}
                  </span>
                  <span className="text-amber-400" title={`Medium: ${stats.medSolved} / ${stats.medTotal} solved`}>
                    M {stats.medSolved > 0 ? `${stats.medSolved}/${stats.medTotal}` : stats.medTotal}
                  </span>
                  <span className="text-rose-400" title={`Hard: ${stats.hardSolved} / ${stats.hardTotal} solved`}>
                    H {stats.hardSolved > 0 ? `${stats.hardSolved}/${stats.hardTotal}` : stats.hardTotal}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          2. FILTER & SEARCH CONTROLS
          ───────────────────────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-4 sm:p-5 shadow-sm space-y-3.5">
        <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
          {/* Search Box */}
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search problems by name or platform..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all bg-slate-50/50"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600 font-bold"
              >
                Clear
              </button>
            )}
          </div>

          {/* Difficulty Dropdown */}
          <div className="flex items-center gap-2">
            <select
              value={selectedDifficulty}
              onChange={(e) => setSelectedDifficulty(e.target.value)}
              className="px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm font-bold text-slate-700 bg-white hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-purple-500/20 cursor-pointer"
            >
              <option value="All">All Difficulties</option>
              <option value="Easy">Easy</option>
              <option value="Medium">Medium</option>
              <option value="Hard">Hard</option>
            </select>

            {/* Status Dropdown */}
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value as "All" | "Unsolved" | "Solved")}
              className="px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm font-bold text-slate-700 bg-white hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-purple-500/20 cursor-pointer"
            >
              <option value="All">All Status</option>
              <option value="Unsolved">Unsolved</option>
              <option value="Solved">Solved</option>
            </select>

            {/* Expand / Collapse Toggle Buttons */}
            <div className="hidden md:flex items-center gap-1 border-l border-slate-200 pl-2">
              <button
                onClick={expandAll}
                className="px-2.5 py-2 rounded-lg text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors"
                title="Expand All"
              >
                Expand
              </button>
              <button
                onClick={collapseAll}
                className="px-2.5 py-2 rounded-lg text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors"
                title="Collapse All"
              >
                Collapse
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          3. CATEGORIES ACCORDION LIST
          ───────────────────────────────────────────────────────────── */}
      <div className="space-y-4">
        {filteredCategories.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200/90 p-12 text-center space-y-3">
            <p className="text-slate-500 font-semibold text-base">No problems match your current filters.</p>
            <button
              onClick={() => {
                setSearchQuery("");
                setSelectedDifficulty("All");
                setSelectedStatus("All");
              }}
              className="px-4 py-2 rounded-xl bg-purple-600 text-white font-bold text-xs hover:bg-purple-700 transition-colors"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          filteredCategories.map((cat, catIdx) => {
            const isOpen = !!expandedCategories[cat.id];
            const catProgress = Math.round((cat.solvedCount / cat.total) * 100);

            return (
              <div
                key={cat.id}
                className="bg-white rounded-2xl border border-slate-200/90 shadow-sm overflow-hidden transition-all"
              >
                {/* Accordion Header */}
                <button
                  onClick={() => toggleCategory(cat.id)}
                  className="w-full px-5 py-4 flex items-center justify-between gap-4 text-left hover:bg-slate-50/70 transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    <span className="w-7 h-7 rounded-lg bg-purple-50 border border-purple-200/80 text-purple-700 font-black text-xs flex items-center justify-center shrink-0">
                      {catIdx + 1}
                    </span>
                    <div>
                      <h2 className="text-base sm:text-lg font-black text-slate-900 tracking-tight flex items-center gap-2">
                        <span>{cat.title}</span>
                        {cat.solvedCount === cat.total && cat.total > 0 && (
                          <CheckCircle2 className="w-4 h-4 text-emerald-500 fill-emerald-100 shrink-0" />
                        )}
                      </h2>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 sm:gap-4 shrink-0">
                    {/* Category Solved Counter */}
                    <div className="text-right">
                      <span className="text-xs sm:text-sm font-extrabold text-slate-700">
                        {cat.solvedCount} / {cat.total}
                      </span>
                      <div className="w-16 sm:w-24 h-1.5 rounded-full bg-slate-100 overflow-hidden mt-1">
                        <div
                          className="h-full bg-purple-600 rounded-full transition-all"
                          style={{ width: `${catProgress}%` }}
                        />
                      </div>
                    </div>

                    <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500">
                      {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </div>
                  </div>
                </button>

                {/* Problems Table / List */}
                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25 }}
                      className="border-t border-slate-100"
                    >
                      <div className="divide-y divide-slate-100">
                        {cat.filteredProblems.map((prob, pIdx) => {
                          const isSolved = solvedIds.has(prob.id);

                          return (
                            <div
                              key={prob.id}
                              className={`px-4 sm:px-6 py-3.5 flex items-center justify-between gap-3 transition-colors ${
                                isSolved ? "bg-slate-50/60" : "hover:bg-slate-50/40"
                              }`}
                            >
                              <div className="flex items-center gap-3 min-w-0 flex-1">
                                {/* Solved Checkbox */}
                                <button
                                  type="button"
                                  onClick={() => toggleSolved(prob.id)}
                                  className={`w-5 h-5 rounded-md border flex items-center justify-center transition-all cursor-pointer shrink-0 ${
                                    isSolved
                                      ? "bg-purple-600 border-purple-600 text-white shadow-sm"
                                      : "border-slate-300 hover:border-purple-400 bg-white"
                                  }`}
                                  title={isSolved ? "Mark as unsolved" : "Mark as solved"}
                                >
                                  {isSolved && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                                </button>

                                {/* Problem Title with Strikethrough when solved */}
                                <a
                                  href={prob.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className={`text-xs sm:text-sm font-semibold tracking-tight truncate transition-colors hover:text-purple-600 ${
                                    isSolved
                                      ? "line-through text-slate-400 font-normal"
                                      : "text-slate-800 font-bold"
                                  }`}
                                  title={prob.title}
                                >
                                  {prob.title}
                                </a>
                              </div>

                              <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
                                {/* Platform Badge */}
                                <span
                                  className={`text-[10px] sm:text-[11px] font-bold px-2 sm:px-2.5 py-0.5 rounded-md border uppercase tracking-wider ${getPlatformBadge(
                                    prob.platform
                                  )}`}
                                >
                                  {prob.platform}
                                </span>

                                {/* Difficulty Pill */}
                                <span
                                  className={`text-[10px] sm:text-[11px] font-bold px-2 sm:px-2.5 py-0.5 rounded-md border ${getDifficultyBadge(
                                    prob.difficulty
                                  )}`}
                                >
                                  {prob.difficulty}
                                </span>

                                {/* External Link Icon */}
                                <a
                                  href={prob.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-400 hover:text-purple-600 hover:bg-purple-50 transition-colors"
                                  title="Open Problem"
                                >
                                  <ExternalLink className="w-3.5 h-3.5" />
                                </a>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
