"use client";

import React, { useState, useEffect, useMemo } from "react";
import { createPortal } from "react-dom";
import {
  Search,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Bookmark,
  Check,
  Video,
  X,
  Clock,
  Play,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import {
  STRIVER_DSA_CATEGORIES,
  TOTAL_STRIVER_PROBLEMS,
  STRIVER_TOTAL_STEPS,
  StriverProblem,
} from "@/data/practice/striverA2ZSheetData";
import CursorGrid from "@/components/practice/CursorGrid";

const STORAGE_KEY = "striver_a2z_solved_v1";
const BOOKMARKS_KEY = "striver_a2z_bookmarks_v1";

function cleanCategoryTitle(title: string): string {
  return title.replace(/^Step\s*\d+\s*[:\-–]\s*/i, "").trim();
}

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

export function StriverA2ZDSASheetView() {
  const [mounted, setMounted] = useState(false);
  const [solvedIds, setSolvedIds] = useState<Set<string>>(() => new Set());
  const [bookmarkedIds, setBookmarkedIds] = useState<Set<string>>(() => new Set());
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<"All" | "Unsolved" | "Solved">("All");
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({});
  const [activeVideoProblem, setActiveVideoProblem] = useState<StriverProblem | null>(null);

  // Mount + scroll to top
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

  // Load solved and bookmarked IDs from localStorage
  useEffect(() => {
    try {
      const storedSolved = localStorage.getItem(STORAGE_KEY);
      if (storedSolved) {
        const arr = JSON.parse(storedSolved);
        if (Array.isArray(arr)) {
          setSolvedIds(new Set(arr));
        }
      }
      const storedBookmarks = localStorage.getItem(BOOKMARKS_KEY);
      if (storedBookmarks) {
        const bArr = JSON.parse(storedBookmarks);
        if (Array.isArray(bArr)) {
          setBookmarkedIds(new Set(bArr));
        }
      }
    } catch {
      // ignore
    }
  }, []);

  // Toggle solved state
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

  // Toggle bookmark
  const toggleBookmark = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setBookmarkedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      try {
        localStorage.setItem(BOOKMARKS_KEY, JSON.stringify(Array.from(next)));
      } catch {
        // ignore
      }
      return next;
    });
  };

  // Toggle category expand/collapse
  const toggleCategory = (id: string) => {
    setExpandedCategories((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const expandAll = () => {
    const allExpanded: Record<string, boolean> = {};
    STRIVER_DSA_CATEGORIES.forEach((c) => {
      allExpanded[c.id] = true;
    });
    setExpandedCategories(allExpanded);
  };

  const collapseAll = () => {
    setExpandedCategories({});
  };

  // Handle ESC key to close video modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && activeVideoProblem) {
        setActiveVideoProblem(null);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [activeVideoProblem]);

  // Filtered categories and problems
  const filteredCategories = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return STRIVER_DSA_CATEGORIES.map((cat) => {
      const filteredProblems = cat.problems.filter((problem) => {
        // Status filter
        const isSolved = solvedIds.has(problem.id);
        if (selectedStatus === "Solved" && !isSolved) return false;
        if (selectedStatus === "Unsolved" && isSolved) return false;

        // Search query
        if (query) {
          const matchTitle = problem.title.toLowerCase().includes(query);
          const matchCategory = cleanCategoryTitle(cat.title).toLowerCase().includes(query);
          return matchTitle || matchCategory;
        }

        return true;
      });

      const solvedCount = cat.problems.filter((p) => solvedIds.has(p.id)).length;

      return {
        ...cat,
        filteredProblems,
        solvedCount,
      };
    }).filter((cat) => cat.filteredProblems.length > 0 || !query);
  }, [searchQuery, selectedStatus, solvedIds]);

  // Overall statistics
  const totalSolved = useMemo(() => {
    let count = 0;
    STRIVER_DSA_CATEGORIES.forEach((cat) => {
      cat.problems.forEach((p) => {
        if (solvedIds.has(p.id)) count++;
      });
    });
    return count;
  }, [solvedIds]);

  const progressPercent = TOTAL_STRIVER_PROBLEMS > 0
    ? Math.min(100, Math.round((totalSolved / TOTAL_STRIVER_PROBLEMS) * 100))
    : 0;

  // SVG Gauge Calculations (Radius = 40)
  const ringRadius = 40;
  const ringCircumference = 2 * Math.PI * ringRadius;
  const ringOffset = ringCircumference - (progressPercent / 100) * ringCircumference;

  return (
    <div className="w-full space-y-6 sm:space-y-8 select-none">
      {/* ─────────────────────────────────────────────────────────────
          1. HERO HEADER: CYBER MATRIX EMERALD AURORA + STRIVER CARD
          ───────────────────────────────────────────────────────────── */}
      <style jsx>{`
        .striver-aurora {
          position: absolute;
          inset: 0;
          overflow: hidden;
          border-radius: 1.5rem;
          pointer-events: none;
          z-index: 0;
        }
        .striver-aurora-blob {
          position: absolute;
          border-radius: 9999px;
          filter: blur(55px);
          opacity: 0.35;
          mix-blend-mode: screen;
          animation: striver-drift 12s ease-in-out infinite alternate;
        }
        .striver-aurora-blob:nth-child(1) {
          width: 320px;
          height: 320px;
          background: radial-gradient(circle, #10b981 0%, transparent 70%);
          top: -80px;
          left: -40px;
          animation-duration: 10s;
        }
        .striver-aurora-blob:nth-child(2) {
          width: 380px;
          height: 380px;
          background: radial-gradient(circle, #059669 0%, transparent 70%);
          bottom: -100px;
          right: 15%;
          animation-duration: 14s;
          animation-delay: -3s;
        }
        .striver-aurora-blob:nth-child(3) {
          width: 260px;
          height: 260px;
          background: radial-gradient(circle, #22c55e 0%, transparent 70%);
          top: 20%;
          right: -40px;
          animation-duration: 11s;
          animation-delay: -6s;
        }
        @keyframes striver-drift {
          0% {
            transform: translate(0px, 0px) scale(1);
          }
          50% {
            transform: translate(30px, -20px) scale(1.08);
          }
          100% {
            transform: translate(-20px, 25px) scale(0.95);
          }
        }
      `}</style>

      <div className="relative rounded-3xl p-6 sm:p-8 md:p-10 bg-[#021308] border border-emerald-500/25 shadow-2xl overflow-hidden min-h-[300px] flex items-center">
        {/* Animated Emerald Aurora */}
        <div className="striver-aurora">
          <div className="striver-aurora-blob" />
          <div className="striver-aurora-blob" />
          <div className="striver-aurora-blob" />
        </div>

        {/* Interactive Cursor Grid on Backside */}
        <div className="absolute inset-0 z-0 overflow-hidden rounded-3xl pointer-events-auto">
          <CursorGrid
            color="#10B981"
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

        <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-6 sm:gap-10 my-auto w-full pointer-events-none">
          {/* Left Column: Clean Title + Progress Tracker */}
          <div className="flex flex-col items-center lg:items-start text-center lg:text-left gap-4 sm:gap-5 flex-1 w-full max-w-lg lg:max-w-md pointer-events-auto">
            {/* Title */}
            <div>
              <h1 className="text-2xl xs:text-3xl sm:text-4xl md:text-[40px] font-black text-white tracking-tight leading-tight drop-shadow-md">
                Strivers A2Z DSA Sheet
              </h1>
              <p className="text-slate-400 text-xs sm:text-sm font-semibold tracking-wide pt-1">
                Curated by Striver (TakeUForward)
              </p>
            </div>

            {/* "YOUR PROGRESS" TRACKER CARD (MATCHING REFERENCE WITH OUR PALETTE) */}
            <div className="bg-[#0b1410]/95 border border-white/10 rounded-2xl p-4 sm:p-5 shadow-2xl backdrop-blur-md w-full max-w-[380px] text-left">
              {/* Header */}
              <div className="text-[11px] font-bold text-slate-400 tracking-wider uppercase pb-3 border-b border-white/10">
                YOUR PROGRESS
              </div>

              {/* Tracker Body */}
              <div className="pt-4 flex items-center justify-between gap-5">
                {/* Left: Circular Progress Ring */}
                <div className="relative w-20 h-20 sm:w-22 sm:h-22 flex items-center justify-center shrink-0">
                  <svg className="w-full h-full -rotate-90" viewBox="0 0 96 96">
                    <defs>
                      <linearGradient id="striverProgressGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#34d399" />
                        <stop offset="100%" stopColor="#059669" />
                      </linearGradient>
                    </defs>
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
                      stroke="url(#striverProgressGrad)"
                      strokeWidth="7"
                      strokeDasharray={ringCircumference}
                      strokeDashoffset={ringOffset}
                      strokeLinecap="round"
                      fill="none"
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                    <span className="text-lg sm:text-xl font-black text-white leading-none">
                      {progressPercent}%
                    </span>
                    <span className="text-[10px] text-slate-400 font-medium mt-1">
                      Complete
                    </span>
                  </div>
                </div>

                {/* Right: Solved, Topics, Remaining */}
                <div className="flex-1 flex flex-col justify-between gap-2.5">
                  {/* Row 1: Solved */}
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400 font-medium">Solved</span>
                    <span className="font-bold text-white tracking-tight">
                      <span className="text-emerald-400 font-bold">{totalSolved}</span> / {TOTAL_STRIVER_PROBLEMS}
                    </span>
                  </div>

                  {/* Row 2: Topics */}
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400 font-medium">Topics</span>
                    <span className="font-bold text-white tracking-tight">{STRIVER_TOTAL_STEPS}</span>
                  </div>

                  {/* Row 3: Remaining */}
                  <div className="flex items-center justify-between pt-1 border-t border-white/5 text-xs">
                    <span className="text-slate-400 font-medium">Remaining</span>
                    <span className="font-bold text-slate-200 tracking-tight">
                      {TOTAL_STRIVER_PROBLEMS - totalSolved}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Striver 16:9 Thumbnail (Fits completely without cropping) */}
          <div className="shrink-0 flex items-center justify-center pointer-events-auto w-full lg:w-auto">
            <div className="relative w-full max-w-[340px] xs:max-w-[380px] sm:max-w-[420px] md:max-w-[450px] lg:w-[450px] aspect-[16/9] rounded-2xl overflow-hidden border-2 border-emerald-500/40 shadow-[0_0_40px_rgba(16,185,129,0.35)] hover:shadow-[0_0_60px_rgba(16,185,129,0.55)] transition-all duration-300 group">
              <Image
                src="/images/practice/striver_a2z_sheet.jpg"
                alt="Striver A2Z DSA Sheet"
                fill
                sizes="(max-width: 768px) 380px, 450px"
                className="object-cover object-center group-hover:scale-102 transition-transform duration-500"
                priority
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />
              <div className="absolute bottom-2.5 left-2.5 right-2.5 text-center text-[11px] font-bold text-emerald-200 bg-black/65 backdrop-blur-md py-1 rounded-lg border border-white/10 shadow-sm">
                Raj Vikramaditya (Striver)
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          2. CONTROLS STRIP: SEARCH, STATUS & EXPAND/COLLAPSE
          ───────────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-3.5 sm:p-4 rounded-2xl border border-slate-200/90 shadow-sm">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search problems by title or topic..."
            className="w-full pl-9 pr-4 py-2 text-xs sm:text-sm rounded-xl bg-slate-50 border border-slate-200 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
          />
        </div>

        {/* Status Filter & Expand / Collapse */}
        <div className="flex items-center gap-2 flex-wrap justify-between sm:justify-end">
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value as "All" | "Unsolved" | "Solved")}
            className="px-3 py-2 text-xs font-bold rounded-xl bg-slate-50 border border-slate-200 text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 cursor-pointer"
          >
            <option value="All">All Status</option>
            <option value="Unsolved">Unsolved</option>
            <option value="Solved">Solved</option>
          </select>

          {/* Expand / Collapse All */}
          <div className="flex items-center gap-1 border-l border-slate-200 pl-2">
            <button
              onClick={expandAll}
              className="px-2.5 py-1.5 rounded-lg text-[11px] font-bold text-slate-600 hover:text-emerald-700 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              Expand All
            </button>
            <button
              onClick={collapseAll}
              className="px-2.5 py-1.5 rounded-lg text-[11px] font-bold text-slate-600 hover:text-emerald-700 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              Collapse
            </button>
          </div>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          3. ACCORDION LIST: 18 TOPICS & 455 PROBLEMS
          ───────────────────────────────────────────────────────────── */}
      <div className="space-y-2.5 sm:space-y-3">
        {filteredCategories.map((category) => {
          const isExpanded = !!expandedCategories[category.id];

          return (
            <div
              key={category.id}
              className="rounded-xl sm:rounded-2xl border border-slate-200/90 bg-white overflow-hidden shadow-2xs transition-all hover:border-slate-300"
            >
              {/* Compact Category Header matching reference */}
              <button
                onClick={() => toggleCategory(category.id)}
                className="w-full px-4 sm:px-6 py-3.5 sm:py-4 flex items-center justify-between gap-3 text-left hover:bg-slate-50/60 transition-colors cursor-pointer group"
              >
                {/* Left: Clean Topic Title */}
                <div className="min-w-0 flex-1">
                  <h3 className="text-slate-900 font-bold text-[13px] sm:text-[15px] tracking-tight truncate group-hover:text-emerald-700 transition-colors">
                    {cleanCategoryTitle(category.title)}
                  </h3>
                </div>

                {/* Right: Count Badge + Chevron */}
                <div className="flex items-center gap-2.5 sm:gap-3 shrink-0">
                  <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-500 font-semibold text-xs tracking-tight">
                    {category.problems.length}
                  </span>

                  <div className="text-slate-400 group-hover:text-slate-600 transition-colors">
                    {isExpanded ? (
                      <ChevronUp className="w-4 h-4 text-slate-500" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-slate-400" />
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
                    {/* Clean Table Header */}
                    <div className="flex items-center justify-between px-4 sm:px-5 py-2.5 bg-slate-50/90 border-b border-slate-200/80 text-[11px] font-black uppercase tracking-wider text-slate-500">
                      <div className="flex items-center gap-2">
                        <span>Problem</span>
                      </div>
                      <div className="min-w-[80px] text-right pr-2">
                        <span>Solution</span>
                      </div>
                    </div>

                    {/* Problem Rows */}
                    <div className="divide-y divide-slate-100">
                      {category.filteredProblems.map((problem) => {
                        const isSolved = solvedIds.has(problem.id);
                        const isBookmarked = bookmarkedIds.has(problem.id);
                        const hasVideo = !!problem.youtube_url;
                        const startTimestamp = problem.youtube_url ? parseYouTubeTimestamp(problem.youtube_url) : null;

                        return (
                          <div
                            key={problem.id}
                            className={`p-3 sm:px-5 sm:py-3.5 transition-colors flex items-center justify-between gap-3 ${
                              isSolved ? "bg-emerald-50/30" : "hover:bg-slate-50/60"
                            }`}
                          >
                            {/* Checkbox + Bookmark + Q# + Title */}
                            <div className="flex items-center gap-2.5 sm:gap-3 min-w-0 flex-1">
                              <button
                                onClick={() => toggleSolved(problem.id)}
                                aria-label={isSolved ? "Mark as unsolved" : "Mark as solved"}
                                className={`w-5 h-5 rounded-md border flex items-center justify-center transition-all shrink-0 cursor-pointer ${
                                  isSolved
                                    ? "bg-emerald-600 border-emerald-600 text-white shadow-xs"
                                    : "border-slate-300 hover:border-emerald-500 bg-white"
                                }`}
                              >
                                {isSolved && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                              </button>

                              <button
                                onClick={(e) => toggleBookmark(problem.id, e)}
                                aria-label={isBookmarked ? "Remove bookmark" : "Add bookmark"}
                                className={`shrink-0 transition-colors p-0.5 rounded cursor-pointer ${
                                  isBookmarked ? "text-amber-500" : "text-slate-300 hover:text-slate-500"
                                }`}
                              >
                                <Bookmark className="w-3.5 h-3.5 fill-current" />
                              </button>

                              <span className="text-[11px] font-bold text-slate-400 shrink-0 w-8">
                                Q{problem.qno}
                              </span>

                              <span
                                className={`text-xs sm:text-sm font-semibold truncate ${
                                  isSolved ? "line-through text-slate-400" : "text-slate-800"
                                }`}
                                title={problem.title}
                              >
                                {problem.title}
                              </span>
                            </div>

                            {/* Solution / YouTube Video button (Empty if no link found) */}
                            <div className="shrink-0 flex items-center justify-end min-w-[80px]">
                              {hasVideo ? (
                                <button
                                  onClick={() => setActiveVideoProblem(problem)}
                                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-red-50 hover:bg-red-100 border border-red-200/80 text-red-700 font-bold text-xs transition-all shadow-2xs hover:scale-102 cursor-pointer group"
                                  title={
                                    startTimestamp !== null
                                      ? `Watch solution starting at ${formatTimestampBadge(startTimestamp)}`
                                      : "Watch Video Solution"
                                  }
                                >
                                  <div className="w-4 h-4 rounded-full bg-red-600 text-white flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                                    <Play className="w-2.5 h-2.5 fill-white ml-0.5" />
                                  </div>
                                  <span className="text-[11px]">
                                    {startTimestamp !== null ? formatTimestampBadge(startTimestamp) : "Watch"}
                                  </span>
                                </button>
                              ) : null}
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
        })}
      </div>

      {/* ─────────────────────────────────────────────────────────────
          4. EMBEDDED YOUTUBE VIDEO SOLUTION MODAL (EXACT TIMESTAMP)
          ───────────────────────────────────────────────────────────── */}
      {mounted &&
        activeVideoProblem &&
        createPortal(
          <div className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-5 overflow-hidden">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setActiveVideoProblem(null)}
              className="absolute inset-0 bg-black/85 backdrop-blur-md"
            />

            {/* Modal Dialog */}
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 16 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 16 }}
              transition={{ duration: 0.2 }}
              className="relative z-10 w-full max-w-4xl max-h-[92vh] flex flex-col bg-[#0b1410] border border-emerald-500/30 rounded-2xl sm:rounded-3xl shadow-[0_20px_60px_rgba(0,0,0,0.8)] overflow-hidden"
            >
              {/* Modal Header */}
              <div className="px-4 py-3 sm:px-6 sm:py-3.5 border-b border-white/10 flex items-center justify-between gap-3 bg-[#051c0f] shrink-0">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-8 h-8 rounded-xl bg-red-600/20 border border-red-500/30 flex items-center justify-center shrink-0">
                    <Video className="w-4 h-4 text-red-400" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                        {cleanCategoryTitle(activeVideoProblem.stepName)}
                      </span>
                      {activeVideoProblem.youtube_url && parseYouTubeTimestamp(activeVideoProblem.youtube_url) !== null && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center gap-1">
                          <Clock className="w-2.5 h-2.5" />
                          <span>Starts at {formatTimestampBadge(parseYouTubeTimestamp(activeVideoProblem.youtube_url)!)}</span>
                        </span>
                      )}
                    </div>
                    <h2 className="text-sm sm:text-base font-black text-white truncate tracking-tight mt-0.5">
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

                  <button
                    onClick={() => setActiveVideoProblem(null)}
                    className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white flex items-center justify-center transition-colors shrink-0 cursor-pointer"
                    aria-label="Close video player"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* 16:9 Video Player Container (Height constrained) */}
              <div className="relative w-full aspect-video max-h-[58vh] bg-black shrink-1 flex items-center justify-center overflow-hidden">
                {activeVideoProblem.youtube_url && getYouTubeEmbedUrl(activeVideoProblem.youtube_url) ? (
                  <iframe
                    key={getYouTubeEmbedUrl(activeVideoProblem.youtube_url) || activeVideoProblem.id}
                    src={getYouTubeEmbedUrl(activeVideoProblem.youtube_url)!}
                    title={`${activeVideoProblem.title} - Striver Video Solution`}
                    className="w-full h-full border-0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    allowFullScreen
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 text-sm">
                    <p>Video solution not available for this topic.</p>
                  </div>
                )}
              </div>

              {/* Modal Footer */}
              <div className="px-4 py-2.5 sm:px-5 sm:py-3 border-t border-white/10 bg-[#07190f] flex items-center justify-between gap-2.5 shrink-0">
                <div className="text-xs text-slate-400 font-medium truncate max-w-[65%]">
                  Q{activeVideoProblem.qno}: {activeVideoProblem.title}
                </div>

                <div className="flex items-center gap-2 shrink-0">
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
                    className={`px-3.5 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer ${
                      solvedIds.has(activeVideoProblem.id)
                        ? "bg-emerald-600 text-white"
                        : "bg-white/10 hover:bg-white/20 text-slate-200"
                    }`}
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>{solvedIds.has(activeVideoProblem.id) ? "Solved" : "Mark as Solved"}</span>
                  </button>
                </div>
              </div>
            </motion.div>
          </div>,
          document.body
        )}
    </div>
  );
}
