"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
import {
  Search,
  ExternalLink,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Bookmark,
  Sparkles,
  Flame,
  Filter,
  Check,
  Building2,
  Calendar,
  Layers,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import {
  SHRADHA_DSA_CATEGORIES,
  TOTAL_SHRADHA_PROBLEMS,
  ShradhaProblem,
  Difficulty,
  Platform,
} from "@/data/practice/shradhaDsaSheetData";
import { SmoothCursor } from "@/components/ui/smooth-cursor";

const STORAGE_KEY = "shradha_sheet_solved_v1";

export function ShradhaDSASheetView() {
  const [solvedIds, setSolvedIds] = useState<Set<string>>(() => new Set());
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>("All");
  const [selectedStatus, setSelectedStatus] = useState<"All" | "Unsolved" | "Solved">("All");
  const [selectedPhase, setSelectedPhase] = useState<string>("All");
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>(() => {
    // Open first 3 categories by default
    const init: Record<string, boolean> = {};
    SHRADHA_DSA_CATEGORIES.forEach((c, idx) => {
      init[c.id] = idx < 3;
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
    SHRADHA_DSA_CATEGORIES.forEach((c) => {
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

    return SHRADHA_DSA_CATEGORIES.map((cat) => {
      // Phase filtering
      if (selectedPhase !== "All" && !cat.dayRange.includes(selectedPhase)) {
        return null;
      }

      const matchingProblems = cat.problems.filter((prob) => {
        // Search query (title, platform, or company)
        if (q) {
          const matchTitle = prob.title.toLowerCase().includes(q);
          const matchPlatform = prob.platform.toLowerCase().includes(q);
          const matchCompany = prob.companies.some((c) => c.toLowerCase().includes(q));
          if (!matchTitle && !matchPlatform && !matchCompany) {
            return false;
          }
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
    }).filter(
      (cat): cat is (typeof SHRADHA_DSA_CATEGORIES[0] & { filteredProblems: ShradhaProblem[]; solvedCount: number }) =>
        cat !== null && (cat.filteredProblems.length > 0 || !searchQuery)
    );
  }, [searchQuery, selectedDifficulty, selectedStatus, selectedPhase, solvedIds]);

  // Statistics breakdown
  const stats = useMemo(() => {
    let easyTotal = 0;
    let medTotal = 0;
    let hardTotal = 0;
    let easySolved = 0;
    let medSolved = 0;
    let hardSolved = 0;

    SHRADHA_DSA_CATEGORIES.forEach((cat) => {
      cat.problems.forEach((p) => {
        const isSolved = solvedIds.has(p.id);
        if (p.difficulty === "Easy") {
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
  const progressPercent = TOTAL_SHRADHA_PROBLEMS > 0
    ? Math.min(100, Math.round((totalSolved / TOTAL_SHRADHA_PROBLEMS) * 100))
    : 0;

  const ringRadius = 38;
  const ringCircumference = 2 * Math.PI * ringRadius;
  const ringOffset = ringCircumference - (ringCircumference * progressPercent) / 100;

  const getDifficultyBadge = (diff: Difficulty) => {
    switch (diff) {
      case "Easy":
        return "bg-emerald-50 text-emerald-700 border-emerald-200";
      case "Medium":
        return "bg-amber-50 text-amber-700 border-amber-200";
      case "Hard":
        return "bg-rose-50 text-rose-700 border-rose-200";
      default:
        return "bg-slate-50 text-slate-700 border-slate-200";
    }
  };

  const getCompanyColor = (company: string) => {
    switch (company) {
      case "Google":
        return "bg-blue-50 text-blue-700 border-blue-200";
      case "Microsoft":
        return "bg-emerald-50 text-emerald-700 border-emerald-200";
      case "Amazon":
        return "bg-amber-50 text-amber-800 border-amber-200";
      case "Apple":
        return "bg-slate-100 text-slate-800 border-slate-300";
      case "Netflix":
        return "bg-red-50 text-red-700 border-red-200";
      default:
        return "bg-orange-50 text-orange-700 border-orange-200";
    }
  };

  return (
    <div className="space-y-6 sm:space-y-8 select-none max-w-5xl mx-auto">
      {/* ─────────────────────────────────────────────────────────────
          1. HERO HEADER: CYBER ORANGE AURORA + SHRADHA DIDI CARD
          ───────────────────────────────────────────────────────────── */}
      <style>{`
        .shradha-aurora {
          position: absolute;
          inset: 0;
          overflow: hidden;
          pointer-events: none;
          z-index: 0;
        }
        .shradha-aurora-blob {
          position: absolute;
          filter: blur(60px);
          border-radius: 9999px;
          opacity: 0.45;
          mix-blend-mode: screen;
          pointer-events: none;
          animation: shradha-drift 12s ease-in-out infinite alternate;
        }
        .shradha-aurora-blob:nth-child(1) {
          top: -20%;
          left: 10%;
          width: 360px;
          height: 360px;
          background: radial-gradient(circle, #ea580c 0%, rgba(234, 88, 12, 0) 70%);
          animation-duration: 9s;
        }
        .shradha-aurora-blob:nth-child(2) {
          bottom: -15%;
          left: 45%;
          width: 420px;
          height: 380px;
          background: radial-gradient(circle, #dc2626 0%, rgba(220, 38, 38, 0) 70%);
          animation-duration: 13s;
          animation-delay: -2s;
        }
        .shradha-aurora-blob:nth-child(3) {
          top: 15%;
          right: 5%;
          width: 340px;
          height: 340px;
          background: radial-gradient(circle, #f59e0b 0%, rgba(245, 158, 11, 0) 70%);
          animation-duration: 11s;
          animation-delay: -5s;
        }
        @keyframes shradha-drift {
          0% { transform: translate(0, 0) scale(1); }
          50% { transform: translate(25px, -20px) scale(1.12); }
          100% { transform: translate(-20px, 20px) scale(0.95); }
        }
      `}</style>

      <div
        ref={heroCardRef}
        className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-[#180803] via-[#240c04] to-[#3a1306] border border-orange-500/30 p-6 sm:p-8 md:p-9 text-white shadow-2xl min-h-[300px] flex flex-col justify-between"
      >
        {/* Custom Physics Cursor */}
        <SmoothCursor containerRef={heroCardRef} />

        {/* Ambient Aurora Flares */}
        <div className="shradha-aurora">
          <div className="shradha-aurora-blob" />
          <div className="shradha-aurora-blob" />
          <div className="shradha-aurora-blob" />
        </div>

        {/* Circuit Pattern Overlay */}
        <div
          className="absolute inset-0 opacity-10 pointer-events-none"
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, #fb923c 1px, transparent 0)`,
            backgroundSize: "28px 28px",
          }}
        />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6 sm:gap-8 my-auto">
          {/* Left Column: Heading + Details */}
          <div className="space-y-3 max-w-md">
            {/* Top Pill Tags */}
            <div className="flex items-center gap-2 flex-wrap">
              <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-gradient-to-r from-red-600 to-orange-500 text-white font-black text-xs uppercase tracking-wider shadow-lg shadow-orange-900/40 border border-orange-300/30">
                <Flame className="w-3.5 h-3.5 text-yellow-300 fill-yellow-300" />
                30 DAYS SERIES
              </span>
              <span className="px-2.5 py-1 rounded-full bg-orange-950/80 border border-orange-500/30 text-orange-200 text-xs font-semibold backdrop-blur-sm">
                Apna College
              </span>
              <span className="px-2.5 py-1 rounded-full bg-amber-950/80 border border-amber-500/30 text-amber-200 text-xs font-bold backdrop-blur-sm">
                Ex-Microsoft
              </span>
            </div>

            {/* Title */}
            <div>
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-white tracking-tight leading-tight drop-shadow-md">
                DSA 30 DAYS <br />
                <span className="bg-gradient-to-r from-amber-300 via-orange-400 to-rose-400 bg-clip-text text-transparent">
                  SHEET SERIES
                </span>
              </h1>
              <p className="text-orange-200/90 text-sm sm:text-base font-medium mt-2 leading-relaxed">
                By Shradha Khapra — The curated question roadmap to crack FAANG & Tier-1 tech interviews in 30 days.
              </p>
            </div>

            {/* Target Companies Strip */}
            <div className="flex items-center gap-2 pt-1 flex-wrap">
              <span className="text-xs text-orange-300/80 font-bold uppercase tracking-wider">Targets:</span>
              {["Microsoft", "Apple", "Amazon", "Netflix", "Google"].map((co) => (
                <span
                  key={co}
                  className="px-2 py-0.5 rounded-md bg-white/10 text-white text-[11px] font-extrabold backdrop-blur-sm border border-white/15"
                >
                  {co}
                </span>
              ))}
            </div>
          </div>

          {/* Center Column: Visual Card Cutout with Glowing Border */}
          <div className="relative group shrink-0 mx-auto lg:mx-0">
            <div className="relative w-44 h-44 sm:w-48 sm:h-48 md:w-52 md:h-52 rounded-2xl overflow-hidden border-2 border-orange-500/40 shadow-[0_0_35px_rgba(249,115,22,0.35)] group-hover:shadow-[0_0_50px_rgba(249,115,22,0.55)] transition-all duration-500">
              <Image
                src="/images/practice/shradha_dsa_30_days.jpg"
                alt="Shradha Khapra DSA 30 Days"
                fill
                sizes="210px"
                className="object-cover object-center group-hover:scale-105 transition-transform duration-500"
                priority
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent pointer-events-none" />
              <div className="absolute bottom-2 left-2 right-2 text-center text-[10px] font-bold text-orange-200 bg-black/60 backdrop-blur-md py-0.5 rounded border border-white/10">
                Shradha Khapra
              </div>
            </div>
          </div>

          {/* Right Column: "YOUR PROGRESS" TRACKER */}
          <div className="bg-[#1c0a04]/90 border border-orange-500/25 rounded-2xl p-4 sm:p-5 shadow-2xl backdrop-blur-md w-full lg:w-[320px] shrink-0">
            {/* Header */}
            <div className="text-[11px] font-black text-orange-300 tracking-wider uppercase pb-2.5 border-b border-white/10 flex items-center justify-between">
              <span>YOUR PROGRESS</span>
              <span className="text-[10px] px-2 py-0.5 rounded bg-orange-950 text-orange-300 font-bold border border-orange-500/30">
                {totalSolved} / {TOTAL_SHRADHA_PROBLEMS}
              </span>
            </div>

            {/* Tracker Body */}
            <div className="pt-3.5 flex items-center justify-between gap-5">
              {/* Circular Gauge */}
              <div className="relative w-22 h-22 sm:w-24 sm:h-24 flex items-center justify-center shrink-0">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 96 96">
                  <circle
                    cx="48"
                    cy="48"
                    r={ringRadius}
                    stroke="rgba(255, 255, 255, 0.08)"
                    strokeWidth="7"
                    fill="none"
                  />
                  <circle
                    cx="48"
                    cy="48"
                    r={ringRadius}
                    stroke="url(#shradhaRingGrad)"
                    strokeWidth="7"
                    strokeDasharray={ringCircumference}
                    strokeDashoffset={ringOffset}
                    strokeLinecap="round"
                    fill="none"
                    className="transition-all duration-700 ease-out"
                  />
                  <defs>
                    <linearGradient id="shradhaRingGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#F59E0B" />
                      <stop offset="50%" stopColor="#EA580C" />
                      <stop offset="100%" stopColor="#DC2626" />
                    </linearGradient>
                  </defs>
                </svg>

                {/* Center Content */}
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center select-none">
                  <span className="text-xl font-black text-white leading-none tracking-tight">
                    {progressPercent}%
                  </span>
                  <span className="text-[9px] font-semibold text-orange-300 mt-1 uppercase tracking-wider">
                    Completed
                  </span>
                </div>
              </div>

              {/* Difficulty Breakdown */}
              <div className="flex-1 space-y-2">
                <div className="flex items-center justify-between text-xs font-bold pb-1 border-b border-white/5">
                  <span className="text-emerald-400">Easy</span>
                  <span className="text-white font-extrabold">
                    {stats.easySolved} / {stats.easyTotal}
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs font-bold pb-1 border-b border-white/5">
                  <span className="text-amber-400">Medium</span>
                  <span className="text-white font-extrabold">
                    {stats.medSolved} / {stats.medTotal}
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs font-bold pb-1 border-b border-white/5">
                  <span className="text-rose-400">Hard</span>
                  <span className="text-white font-extrabold">
                    {stats.hardSolved} / {stats.hardTotal}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          2. CONTROLS STRIP: SEARCH, FILTERS & EXPAND/COLLAPSE
          ───────────────────────────────────────────────────────────── */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 bg-white p-3.5 sm:p-4 rounded-2xl border border-slate-200/90 shadow-sm">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search problems by name, company (Google, Microsoft), or platform..."
            className="w-full pl-9 pr-4 py-2 text-xs sm:text-sm rounded-xl bg-slate-50 border border-slate-200 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all"
          />
        </div>

        {/* Filters */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Difficulty Dropdown */}
          <select
            value={selectedDifficulty}
            onChange={(e) => setSelectedDifficulty(e.target.value)}
            className="px-3 py-2 text-xs font-bold rounded-xl bg-slate-50 border border-slate-200 text-slate-700 focus:outline-none focus:ring-2 focus:ring-orange-500/20 cursor-pointer"
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
            className="px-3 py-2 text-xs font-bold rounded-xl bg-slate-50 border border-slate-200 text-slate-700 focus:outline-none focus:ring-2 focus:ring-orange-500/20 cursor-pointer"
          >
            <option value="All">All Status</option>
            <option value="Unsolved">Unsolved</option>
            <option value="Solved">Solved</option>
          </select>

          {/* Expand/Collapse All */}
          <div className="flex items-center gap-1 border-l border-slate-200 pl-2">
            <button
              onClick={expandAll}
              className="px-2.5 py-1.5 text-xs font-bold text-slate-600 hover:text-orange-600 rounded-lg hover:bg-orange-50 transition-colors"
            >
              Expand All
            </button>
            <button
              onClick={collapseAll}
              className="px-2.5 py-1.5 text-xs font-bold text-slate-600 hover:text-orange-600 rounded-lg hover:bg-orange-50 transition-colors"
            >
              Collapse
            </button>
          </div>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          3. CATEGORIES ACCORDION LIST
          ───────────────────────────────────────────────────────────── */}
      <div className="space-y-4">
        {filteredCategories.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl border border-slate-200 p-8 shadow-sm">
            <p className="text-slate-500 font-bold text-base">No problems matched your current filters.</p>
            <button
              onClick={() => {
                setSearchQuery("");
                setSelectedDifficulty("All");
                setSelectedStatus("All");
                setSelectedPhase("All");
              }}
              className="mt-3 px-4 py-2 rounded-xl bg-orange-600 text-white font-bold text-xs hover:bg-orange-700 transition-colors"
            >
              Clear All Filters
            </button>
          </div>
        ) : (
          filteredCategories.map((category) => {
            const isExpanded = expandedCategories[category.id] ?? false;
            const categoryPercent =
              category.problems.length > 0
                ? Math.round((category.solvedCount / category.problems.length) * 100)
                : 0;

            return (
              <div
                key={category.id}
                className="bg-white rounded-2xl border border-slate-200/90 shadow-sm overflow-hidden transition-all duration-200"
              >
                {/* Category Header */}
                <button
                  onClick={() => toggleCategory(category.id)}
                  className="w-full p-4 sm:p-5 flex items-center justify-between gap-4 text-left hover:bg-slate-50/70 transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-3 sm:gap-4 flex-1 min-w-0">
                    {/* Day Range Pill */}
                    <div className="px-2.5 py-1 rounded-lg bg-orange-50 border border-orange-200 text-orange-700 font-black text-xs shrink-0 flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-orange-600" />
                      <span>{category.dayRange}</span>
                    </div>

                    <div className="min-w-0">
                      <h3 className="text-slate-900 font-extrabold text-base sm:text-lg tracking-tight truncate">
                        {category.title}
                      </h3>
                      <p className="text-slate-500 text-xs sm:text-[13px] font-medium truncate mt-0.5">
                        {category.description}
                      </p>
                    </div>
                  </div>

                  {/* Right side stats + expand chevron */}
                  <div className="flex items-center gap-4 shrink-0">
                    <div className="text-right">
                      <span className="text-xs font-black text-slate-800">
                        {category.solvedCount} / {category.problems.length}
                      </span>
                      <div className="w-20 sm:w-24 h-1.5 rounded-full bg-slate-100 overflow-hidden mt-1">
                        <div
                          className="h-full bg-gradient-to-r from-amber-500 to-orange-600 rounded-full transition-all duration-500"
                          style={{ width: `${categoryPercent}%` }}
                        />
                      </div>
                    </div>

                    <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 group-hover:bg-orange-100 transition-colors">
                      {isExpanded ? (
                        <ChevronUp className="w-4 h-4 text-slate-700" />
                      ) : (
                        <ChevronDown className="w-4 h-4 text-slate-700" />
                      )}
                    </div>
                  </div>
                </button>

                {/* Problems List in Category */}
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="border-t border-slate-100 divide-y divide-slate-100"
                    >
                      {category.filteredProblems.map((problem) => {
                        const isSolved = solvedIds.has(problem.id);

                        return (
                          <div
                            key={problem.id}
                            className={`p-3.5 sm:p-4 px-4 sm:px-6 flex items-center justify-between gap-3 transition-colors ${
                              isSolved ? "bg-emerald-50/40" : "hover:bg-slate-50/60"
                            }`}
                          >
                            {/* Left: Checkbox + Title + Day */}
                            <div className="flex items-center gap-3 sm:gap-4 flex-1 min-w-0">
                              <button
                                onClick={() => toggleSolved(problem.id)}
                                className={`w-5 h-5 rounded-md border flex items-center justify-center shrink-0 transition-all cursor-pointer ${
                                  isSolved
                                    ? "bg-emerald-600 border-emerald-600 text-white shadow-sm"
                                    : "border-slate-300 hover:border-orange-500 bg-white"
                                }`}
                                aria-label={isSolved ? "Mark unsolved" : "Mark solved"}
                              >
                                {isSolved && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                              </button>

                              <span className="text-[11px] font-bold text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded shrink-0">
                                Day {problem.day}
                              </span>

                              <a
                                href={problem.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className={`font-bold text-xs sm:text-sm tracking-tight truncate transition-colors flex items-center gap-1.5 group ${
                                  isSolved
                                    ? "text-slate-500 line-through decoration-slate-300"
                                    : "text-slate-800 hover:text-orange-600"
                                }`}
                              >
                                <span>{problem.title}</span>
                                <ExternalLink className="w-3 h-3 text-slate-400 group-hover:text-orange-500 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
                              </a>
                            </div>

                            {/* Right: Company Pills + Difficulty + Platform Link */}
                            <div className="flex items-center gap-2 sm:gap-3 shrink-0">
                              {/* Company Tags */}
                              <div className="hidden sm:flex items-center gap-1">
                                {problem.companies.slice(0, 3).map((comp) => (
                                  <span
                                    key={comp}
                                    className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${getCompanyColor(
                                      comp
                                    )}`}
                                  >
                                    {comp}
                                  </span>
                                ))}
                                {problem.companies.length > 3 && (
                                  <span className="text-[10px] font-bold text-slate-400 px-1">
                                    +{problem.companies.length - 3}
                                  </span>
                                )}
                              </div>

                              {/* Difficulty */}
                              <span
                                className={`text-[11px] font-extrabold px-2.5 py-0.5 rounded-full border ${getDifficultyBadge(
                                  problem.difficulty
                                )}`}
                              >
                                {problem.difficulty}
                              </span>

                              {/* Direct Solve Link Button */}
                              <a
                                href={problem.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-orange-50 hover:text-orange-600 border border-slate-200/80 text-slate-700 text-xs font-bold flex items-center gap-1 transition-all"
                              >
                                <span>Solve</span>
                                <ExternalLink className="w-3 h-3" />
                              </a>
                            </div>
                          </div>
                        );
                      })}
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
