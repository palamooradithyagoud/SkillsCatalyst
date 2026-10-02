"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
import { createPortal } from "react-dom";
import {
  Search,
  ExternalLink,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Bookmark,
  Sparkles,
  Filter,
  Check,
  Building2,
  Calendar,
  Layers,
  Video,
  X,
  Clock,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import {
  SHRADHA_DSA_CATEGORIES,
  TOTAL_SHRADHA_PROBLEMS,
  ShradhaProblem,
  Difficulty,
} from "@/data/practice/shradhaDsaSheetData";
import { SmoothCursor } from "@/components/ui/smooth-cursor";
import CursorGrid from "@/components/practice/CursorGrid";

const STORAGE_KEY = "shradha_sheet_solved_v1";

function parseYouTubeTimestamp(url: string): number | null {
  try {
    let urlToParse = url.trim();
    if (!urlToParse.startsWith("http://") && !urlToParse.startsWith("https://")) {
      urlToParse = `https://${urlToParse}`;
    }
    const parsed = new URL(urlToParse);
    let tParam = parsed.searchParams.get("t") || parsed.searchParams.get("start");

    // Check hash fragment (e.g. #t=1m30s or #t=60 or #start=60)
    if (!tParam && parsed.hash) {
      const hashMatch = parsed.hash.match(/[#&?](?:t|start)=([^&#]+)/i);
      if (hashMatch) {
        tParam = hashMatch[1];
      }
    }

    if (!tParam) return null;

    // Colon format: "mm:ss" or "hh:mm:ss" (e.g. "1:30" or "01:25:30")
    if (tParam.includes(":")) {
      const parts = tParam.split(":").map((p) => parseInt(p, 10) || 0);
      if (parts.length === 2) {
        return parts[0] * 60 + parts[1];
      }
      if (parts.length === 3) {
        return parts[0] * 3600 + parts[1] * 60 + parts[2];
      }
    }

    // Pure number or with trailing 's' (e.g. "1s", "120s", "120")
    const pureSecMatch = tParam.match(/^(\d+)s?$/i);
    if (pureSecMatch) {
      return parseInt(pureSecMatch[1], 10);
    }

    // Combined formats (e.g. "1h30m20s", "14m20s", "1m")
    let totalSeconds = 0;
    const hoursMatch = tParam.match(/(\d+)h/i);
    const minsMatch = tParam.match(/(\d+)m/i);
    const secsMatch = tParam.match(/(\d+)s/i);

    if (hoursMatch) totalSeconds += parseInt(hoursMatch[1], 10) * 3600;
    if (minsMatch) totalSeconds += parseInt(minsMatch[1], 10) * 60;
    if (secsMatch) totalSeconds += parseInt(secsMatch[1], 10);

    return totalSeconds > 0 ? totalSeconds : null;
  } catch {
    const match = url.match(/[?&#](?:t|start)=([^&#]+)/i);
    if (!match) return null;
    const val = match[1];
    if (val.includes(":")) {
      const parts = val.split(":").map((p) => parseInt(p, 10) || 0);
      if (parts.length === 2) return parts[0] * 60 + parts[1];
      if (parts.length === 3) return parts[0] * 3600 + parts[1] * 60 + parts[2];
    }
    const pureSec = val.match(/^(\d+)s?$/i);
    if (pureSec) return parseInt(pureSec[1], 10);
    return null;
  }
}

function formatTimestampBadge(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  if (h > 0) {
    return `${h}h ${m}m ${s}s`;
  }
  if (m > 0) {
    return `${m}m ${s}s`;
  }
  return `${s}s`;
}

function getYouTubeEmbedUrl(urlOrId: string): string | null {
  if (!urlOrId) return null;
  const match = urlOrId.match(
    /(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=|shorts\/))([\w-]{11})/
  );
  if (!match || !match[1]) return null;

  const videoId = match[1];
  const startSeconds = parseYouTubeTimestamp(urlOrId);

  let embedUrl = `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0&modestbranding=1&enablejsapi=1`;
  if (startSeconds !== null && startSeconds >= 0) {
    embedUrl += `&start=${startSeconds}`;
  }
  return embedUrl;
}

export function ShradhaDSASheetView() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
    if (typeof window !== "undefined") {
      window.scrollTo(0, 0);
      const mainElem = document.querySelector("main");
      if (mainElem) {
        mainElem.scrollTop = 0;
      }
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;
    }
  }, []);

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

  // Track which problems have their full companies list expanded
  const [expandedCompanyIds, setExpandedCompanyIds] = useState<Set<string>>(() => new Set());

  // Active video problem for embedded in-app YouTube player modal
  const [activeVideoProblem, setActiveVideoProblem] = useState<ShradhaProblem | null>(null);

  // Close modal on Escape key and lock background scroll
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setActiveVideoProblem(null);
      }
    };
    if (activeVideoProblem) {
      window.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden";
    }
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "unset";
    };
  }, [activeVideoProblem]);

  const toggleCompanyExpand = (id: string) => {
    setExpandedCompanyIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

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
        // Search query (title or company)
        if (q) {
          const matchTitle = prob.title.toLowerCase().includes(q);
          const matchCompany = prob.companies.some((c) => c.toLowerCase().includes(q));
          if (!matchTitle && !matchCompany) {
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
        className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-[#160602] via-[#240a04] to-[#140502] border border-orange-500/30 p-6 sm:p-8 md:p-9 text-white shadow-2xl min-h-[300px] flex flex-col justify-between"
      >
        {/* Custom Physics Cursor */}
        <SmoothCursor containerRef={heroCardRef} />

        {/* Ambient Aurora Flares */}
        <div className="shradha-aurora">
          <div className="shradha-aurora-blob" />
          <div className="shradha-aurora-blob" />
          <div className="shradha-aurora-blob" />
        </div>

        {/* Interactive Cursor Grid on Backside */}
        <div className="absolute inset-0 z-0 overflow-hidden rounded-3xl pointer-events-auto">
          <CursorGrid
            color="#FB923C"
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
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-white tracking-tight leading-tight drop-shadow-md">
                DSA 30 DAYS <br />
                <span className="bg-gradient-to-r from-amber-300 via-orange-400 to-rose-400 bg-clip-text text-transparent">
                  SHEET SERIES
                </span>
              </h1>
              <p className="text-orange-300/80 text-xs sm:text-sm font-semibold tracking-wide pt-1">
                By Shradha Khapra
              </p>
            </div>

            {/* "YOUR PROGRESS" TRACKER (on Left Side) */}
            <div className="bg-[#1c0a04]/90 border border-orange-500/30 rounded-2xl p-4 sm:p-5 shadow-2xl backdrop-blur-md w-full sm:max-w-[340px]">
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

          {/* Right Column: Shradha Didi Image (At Right Side) */}
          <div className="shrink-0 flex items-center justify-center pointer-events-auto">
            <div className="relative w-52 h-52 sm:w-60 sm:h-60 md:w-68 md:h-68 rounded-2xl overflow-hidden border-2 border-orange-500/40 shadow-[0_0_40px_rgba(249,115,22,0.35)] hover:shadow-[0_0_60px_rgba(249,115,22,0.55)] transition-all duration-300 group">
              <Image
                src="/images/practice/shradha_dsa_30_days.jpg"
                alt="Shradha Khapra DSA 30 Days"
                fill
                sizes="(max-width: 768px) 240px, 280px"
                className="object-cover object-center group-hover:scale-105 transition-transform duration-500"
                priority
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-transparent to-transparent pointer-events-none" />
              <div className="absolute bottom-2.5 left-2.5 right-2.5 text-center text-[11px] font-bold text-orange-200 bg-black/65 backdrop-blur-md py-1 rounded-lg border border-white/10 shadow-sm">
                Shradha Khapra
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
                      className="border-t border-slate-100"
                    >
                      {/* Table Header: Problem | Youtube | Practice | Level | Company */}
                      <div className="hidden md:grid md:grid-cols-12 gap-3 px-5 py-2.5 bg-slate-50/90 border-b border-slate-200/80 text-[11px] font-black uppercase tracking-wider text-slate-500">
                        <div className="col-span-5 flex items-center gap-2">
                          <span>Problem</span>
                        </div>
                        <div className="col-span-1 text-center">
                          <span>Youtube</span>
                        </div>
                        <div className="col-span-1 text-center">
                          <span>Practice</span>
                        </div>
                        <div className="col-span-2 text-center">
                          <span>Level</span>
                        </div>
                        <div className="col-span-3 text-left">
                          <span>Company</span>
                        </div>
                      </div>

                      {/* Problems List in Category */}
                      <div className="divide-y divide-slate-100">
                        {category.filteredProblems.map((problem) => {
                          const isSolved = solvedIds.has(problem.id);
                          const isCompanyExpanded = expandedCompanyIds.has(problem.id);
                          const hasMoreCompanies = problem.companies.length > 2;
                          const displayCompanies = isCompanyExpanded
                            ? problem.companies
                            : problem.companies.slice(0, 2);

                          return (
                            <div
                              key={problem.id}
                              className={`px-3.5 sm:px-5 py-3 md:py-3.5 flex flex-col md:grid md:grid-cols-12 gap-2 md:gap-3 items-start md:items-center transition-colors ${
                                isSolved ? "bg-emerald-50/40" : "hover:bg-slate-50/60"
                              }`}
                            >
                              {/* 1. Problem Top Line on Mobile / Col 5 on Desktop */}
                              <div className="col-span-5 flex items-center justify-between gap-2.5 min-w-0 w-full">
                                <div className="flex items-center gap-2.5 min-w-0 flex-1">
                                  <button
                                    type="button"
                                    onClick={() => toggleSolved(problem.id)}
                                    className={`w-5 h-5 rounded-md border flex items-center justify-center shrink-0 transition-all cursor-pointer ${
                                      isSolved
                                        ? "bg-emerald-600 border-emerald-600 text-white shadow-xs"
                                        : "border-slate-300 hover:border-orange-500 bg-white"
                                    }`}
                                    aria-label={isSolved ? "Mark unsolved" : "Mark solved"}
                                  >
                                    {isSolved && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                                  </button>

                                  <span className="text-[10px] sm:text-[11px] font-extrabold text-orange-700 bg-orange-50 border border-orange-200/80 px-1.5 py-0.5 rounded shrink-0">
                                    Q{problem.qno}
                                  </span>

                                  <a
                                    href={problem.leetcode_url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className={`font-bold text-xs sm:text-sm tracking-tight truncate transition-colors flex items-center gap-1.5 group ${
                                      isSolved
                                        ? "text-slate-400 line-through decoration-slate-300 font-normal"
                                        : "text-slate-800 hover:text-orange-600"
                                    }`}
                                    title={problem.title}
                                  >
                                    <span className="truncate">{problem.title}</span>
                                    <ExternalLink className="w-3 h-3 text-slate-400 group-hover:text-orange-500 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
                                  </a>
                                </div>

                                {/* Difficulty Badge: Right-aligned on mobile next to title */}
                                <div className="md:hidden shrink-0">
                                  <span
                                    className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full border ${getDifficultyBadge(
                                      problem.difficulty
                                    )}`}
                                  >
                                    {problem.difficulty}
                                  </span>
                                </div>
                              </div>

                              {/* 2. Actions & Companies: Bottom line on Mobile / Columns 6-12 on Desktop */}
                              <div className="flex md:contents items-center justify-between w-full gap-2 pl-7.5 md:pl-0">
                                {/* Action Buttons Group (YouTube + Practice) */}
                                <div className="flex items-center gap-2 md:contents shrink-0">
                                  {/* YouTube (Col 1 on Desktop) */}
                                  <div className="col-span-1 flex md:justify-center items-center">
                                    {problem.youtube_url ? (
                                      <button
                                        type="button"
                                        onClick={() => setActiveVideoProblem(problem)}
                                        className="h-7 px-2.5 md:px-0 md:w-8 md:h-8 rounded-lg bg-red-50 hover:bg-red-500 text-red-600 hover:text-white border border-red-200/80 hover:border-red-500 flex items-center justify-center gap-1.5 transition-all active:scale-95 cursor-pointer shadow-xs group/yt"
                                        title="Watch Embedded Video Solution"
                                      >
                                        <Video className="w-3.5 h-3.5 group-hover/yt:fill-white transition-colors" />
                                        <span className="text-[11px] font-extrabold md:hidden">Watch</span>
                                      </button>
                                    ) : (
                                      <span className="text-slate-300 text-sm font-semibold hidden md:inline">—</span>
                                    )}
                                  </div>

                                  {/* Practice Code (Col 1 on Desktop) */}
                                  <div className="col-span-1 flex md:justify-center items-center">
                                    <a
                                      href={problem.leetcode_url}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="h-7 px-2.5 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200/80 text-[11px] font-extrabold flex items-center gap-1 transition-all active:scale-95 shadow-xs"
                                      title="Practice on LeetCode"
                                    >
                                      <span>Code</span>
                                      <ExternalLink className="w-2.5 h-2.5" />
                                    </a>
                                  </div>
                                </div>

                                {/* Difficulty Badge (Col 2 on Desktop - hidden on mobile since it's beside title) */}
                                <div className="hidden md:flex col-span-2 justify-center items-center">
                                  <span
                                    className={`text-[11px] font-extrabold px-2.5 py-0.5 rounded-full border ${getDifficultyBadge(
                                      problem.difficulty
                                    )}`}
                                  >
                                    {problem.difficulty}
                                  </span>
                                </div>

                                {/* Companies (Col 3 on Desktop, Right side on Mobile) */}
                                <div className="col-span-3 flex items-center gap-1 flex-wrap justify-end md:justify-start min-w-0">
                                  {displayCompanies.map((comp) => (
                                    <span
                                      key={comp}
                                      onClick={() => hasMoreCompanies && toggleCompanyExpand(problem.id)}
                                      className={`text-[9px] sm:text-[10px] font-bold px-1.5 py-0.5 rounded border transition-all truncate max-w-[110px] ${getCompanyColor(
                                        comp
                                      )} ${hasMoreCompanies ? "cursor-pointer hover:opacity-80 active:scale-95" : ""}`}
                                      title={hasMoreCompanies ? (isCompanyExpanded ? "Click to collapse" : "Click to view all companies") : undefined}
                                    >
                                      {comp}
                                    </span>
                                  ))}
                                  {hasMoreCompanies && (
                                    <button
                                      type="button"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        toggleCompanyExpand(problem.id);
                                      }}
                                      className="text-[9px] sm:text-[10px] font-extrabold text-orange-700 bg-orange-50 hover:bg-orange-100 px-1.5 py-0.5 rounded border border-orange-200/80 cursor-pointer transition-all hover:scale-105 active:scale-95 shrink-0"
                                      title={isCompanyExpanded ? "Click to show less" : "Click to view all companies"}
                                    >
                                      {isCompanyExpanded ? "Less" : `+${problem.companies.length - 2}`}
                                    </button>
                                  )}
                                </div>
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

      {/* ─────────────────────────────────────────────────────────────
          4. EMBEDDED YOUTUBE THEATER MODAL (IN-SYSTEM PLAYER)
          ───────────────────────────────────────────────────────────── */}
      {mounted &&
        typeof document !== "undefined" &&
        createPortal(
          <AnimatePresence>
            {activeVideoProblem && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-[9999] bg-black/90 backdrop-blur-md flex items-center justify-center p-3 sm:p-5 md:p-6"
                onClick={() => setActiveVideoProblem(null)}
              >
                <motion.div
                  initial={{ scale: 0.95, opacity: 0, y: 12 }}
                  animate={{ scale: 1, opacity: 1, y: 0 }}
                  exit={{ scale: 0.95, opacity: 0, y: 12 }}
                  transition={{ type: "spring", damping: 26, stiffness: 320 }}
                  className="relative w-full max-w-4xl max-h-[92vh] bg-[#120502] border border-orange-500/35 rounded-2xl sm:rounded-3xl shadow-[0_25px_60px_-15px_rgba(0,0,0,0.9),0_0_40px_rgba(249,115,22,0.2)] overflow-hidden flex flex-col text-white"
                  onClick={(e) => e.stopPropagation()}
                >
                  {/* Modal Header */}
                  <div className="flex items-center justify-between px-4 py-3 sm:px-5 sm:py-3.5 border-b border-white/10 bg-gradient-to-r from-[#1c0803] via-[#240b04] to-[#1c0803] shrink-0">
                    <div className="flex items-center gap-3 min-w-0 pr-3">
                      <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-red-600 text-white flex items-center justify-center shrink-0 shadow-md">
                        <Video className="w-4 h-4 sm:w-5 sm:h-5 fill-white" />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-0.5">
                          <span className="text-[10px] sm:text-[11px] font-black text-orange-400 uppercase tracking-wider">
                            Q{activeVideoProblem.qno} • Video Solution
                          </span>
                          <span
                            className={`text-[9px] sm:text-[10px] font-extrabold px-2 py-0.5 rounded-full border ${getDifficultyBadge(
                              activeVideoProblem.difficulty
                            )}`}
                          >
                            {activeVideoProblem.difficulty}
                          </span>
                          {activeVideoProblem.youtube_url && parseYouTubeTimestamp(activeVideoProblem.youtube_url) !== null && (
                            <span className="text-[9px] sm:text-[10px] font-bold px-2 py-0.5 rounded-full bg-orange-500/20 text-orange-300 border border-orange-500/30 flex items-center gap-1">
                              <Clock className="w-2.5 h-2.5 text-orange-400" />
                              <span>Starts at {formatTimestampBadge(parseYouTubeTimestamp(activeVideoProblem.youtube_url)!)}</span>
                            </span>
                          )}
                        </div>
                        <h2 className="text-sm sm:text-base font-black text-white truncate tracking-tight">
                          {activeVideoProblem.title}
                        </h2>
                      </div>
                    </div>

                    {/* Header Actions */}
                    <div className="flex items-center gap-2 shrink-0">
                      {activeVideoProblem.youtube_url && (
                        <a
                          href={activeVideoProblem.youtube_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-red-600 text-slate-200 hover:text-white text-xs font-bold transition-all border border-white/10 shadow-sm"
                          title="Open on YouTube at exact timestamp in new tab"
                        >
                          <ExternalLink className="w-3 h-3" />
                          <span>Watch on YouTube</span>
                        </a>
                      )}

                      {/* Close Button */}
                      <button
                        onClick={() => setActiveVideoProblem(null)}
                        className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white flex items-center justify-center transition-colors shrink-0 cursor-pointer"
                        aria-label="Close video player"
                        title="Close (Esc)"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* 16:9 Video Player Container (Height-constrained so it never pushes the footer off-screen) */}
                  <div className="relative w-full aspect-video max-h-[58vh] bg-black shrink-1 flex items-center justify-center overflow-hidden">
                    {activeVideoProblem.youtube_url && getYouTubeEmbedUrl(activeVideoProblem.youtube_url) ? (
                      <iframe
                        key={getYouTubeEmbedUrl(activeVideoProblem.youtube_url) || activeVideoProblem.id}
                        src={getYouTubeEmbedUrl(activeVideoProblem.youtube_url)!}
                        title={`${activeVideoProblem.title} - Video Solution`}
                        className="w-full h-full border-0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                        allowFullScreen
                      />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 text-sm">
                        <p>Video solution not available for this problem.</p>
                      </div>
                    )}
                  </div>

                  {/* Modal Footer */}
                  <div className="px-4 py-2.5 sm:px-5 sm:py-3 border-t border-white/10 bg-[#160602] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5 shrink-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-[11px] sm:text-xs text-orange-300 font-bold">Asked in:</span>
                      {activeVideoProblem.companies.slice(0, 5).map((co) => (
                        <span
                          key={co}
                          className={`text-[9px] sm:text-[10px] font-bold px-1.5 py-0.5 rounded border ${getCompanyColor(co)}`}
                        >
                          {co}
                        </span>
                      ))}
                      {activeVideoProblem.companies.length > 5 && (
                        <span className="text-[9px] sm:text-[10px] font-bold text-slate-400">
                          +{activeVideoProblem.companies.length - 5} more
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2 w-full sm:w-auto justify-end flex-wrap">
                      {activeVideoProblem.youtube_url && (
                        <a
                          href={activeVideoProblem.youtube_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="sm:hidden px-3 py-1.5 rounded-xl bg-red-600/20 hover:bg-red-600/30 border border-red-500/30 text-red-200 font-bold text-xs flex items-center gap-1.5 transition-all"
                        >
                          <span>YouTube</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      )}

                      <button
                        onClick={() => toggleSolved(activeVideoProblem.id)}
                        className={`px-3 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer ${
                          solvedIds.has(activeVideoProblem.id)
                            ? "bg-emerald-600 text-white"
                            : "bg-white/10 hover:bg-white/20 text-slate-200"
                        }`}
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>{solvedIds.has(activeVideoProblem.id) ? "Solved" : "Mark as Solved"}</span>
                      </button>

                      <a
                        href={activeVideoProblem.leetcode_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3.5 py-1.5 rounded-xl bg-orange-600 hover:bg-orange-500 text-white font-extrabold text-xs flex items-center gap-1.5 transition-all shadow-md shadow-orange-900/30"
                      >
                        <span>Practice on LeetCode</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>,
          document.body
        )}
    </div>
  );
}
