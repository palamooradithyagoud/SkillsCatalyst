"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  Clock,
  Briefcase,
  ArrowRight,
  ArrowLeft,
  Search,
  CheckCircle2,
  Building2,
  Map,
  Layers,
  LayoutGrid,
  Type,
  Database,
  TrendingUp,
  Plus,
  BarChart2,
  ChevronsDown,
  Target,
  Grid,
  Columns,
  ExternalLink,
  Loader2,
  Filter,
  Sparkles,
  ChevronDown,
  CheckSquare,
  Square,
  Trophy,
  Check,
} from "lucide-react";
import { motion } from "framer-motion";
import PracticeTopicDrawer from "@/components/PracticeTopicDrawer";
import FloatingCTA from "@/components/mobile/FloatingCTA";
import {
  fetchPracticeCompanies,
  fetchCompanyQuestions,
  PracticeQuestion,
  QuestionPeriod,
} from "@/lib/api";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/lib/auth";

// Helper for formatting company slug into clean display name
function formatCompanyName(slug: string): string {
  if (!slug) return "";
  const specialMap: Record<string, string> = {
    "at-t": "AT&T",
    "bookingcom": "Booking.com",
    "c3-ai": "C3 AI",
    "f5-networks": "F5 Networks",
    "ge-digital": "GE Digital",
    "ge-healthcare": "GE Healthcare",
    "hp": "HP",
    "hpe": "HPE",
    "hrt": "HRT",
    "hsbc": "HSBC",
    "htc": "HTC",
    "ibm": "IBM",
    "imc": "IMC",
    "ivp": "IVP",
    "ixl": "IXL",
    "jd": "JD.com",
    "jpmorgan": "JPMorgan",
    "jtg": "JTG",
    "kla": "KLA",
    "kpit": "KPIT",
    "kpmg": "KPMG",
    "lti": "LTI",
    "maq-software": "MAQ Software",
    "msci": "MSCI",
    "nasdaq": "NASDAQ",
    "ncr": "NCR",
    "npci": "NPCI",
    "nvidia": "NVIDIA",
    "okx": "OKX",
    "olx": "OLX",
    "pwc": "PwC",
    "rbc": "RBC",
    "sap": "SAP",
    "sig": "SIG",
    "tcs": "TCS",
    "ubs": "UBS",
    "ukg": "UKG",
    "ust": "UST",
    "vk": "VK",
  };
  const lower = slug.toLowerCase().trim();
  if (specialMap[lower]) {
    return specialMap[lower];
  }
  return lower
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

function getLeetCodeUrl(q: PracticeQuestion): string {
  if (q.url && q.url.startsWith("http")) return q.url;
  const slug = q.title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return `https://leetcode.com/problems/${slug}`;
}

const TOP_COMPANIES = [
  "google",
  "amazon",
  "meta",
  "microsoft",
  "apple",
  "netflix",
  "uber",
  "adobe",
  "goldman-sachs",
  "tcs",
  "accenture",
  "deloitte",
  "wipro",
  "infosys",
  "flipkart",
];

const PERIODS: { value: QuestionPeriod; label: string }[] = [
  { value: "all", label: "All Time" },
  { value: "thirty-days", label: "30 Days" },
  { value: "three-months", label: "3 Months" },
  { value: "six-months", label: "6 Months" },
  { value: "more-than-six-months", label: "> 6 Months" },
];

const DIFFICULTIES = ["All", "Easy", "Medium", "Hard"];

// Beginner Level DSA Tree Data Schema
interface TreeCategory {
  id: string;
  title: string;
  icon: React.ElementType;
  color: string;
  gradient: string;
  badgeStyle: string;
  nodes: {
    id: string;
    title: string;
    icon: React.ElementType;
  }[];
}

// Problem IDs per node — used to compute solve % for the progress fill on each node button
const NODE_PROBLEM_IDS: Record<string, number[]> = {
  "two-pointers":     [26,27,88,283,349,350,455,905,922,977,2460,11,15,16,18,80,167,189,611,881,42],
  "sliding-window-arr": [643,209,713,904,930,1004,1052,1248,1343,1423,1493,1658,1695,1838,2024,2958,992],
  "prefix-sum":       [1480,724,303,1732,1991,238,560,525,523,930,974,1248,1314,1352,304,327],
  "kadanes":          [53,918,1749,1191,2321],
  "two-pointers-str": [125,344,345,392,1768,28,151,443,680,165,2109,408],
  "sliding-window-str": [1456,2379,3090,3,424,438,567,2516,76],
  "frequency-map":    [1,217,219,242,383,387,389,1207,1512,169,1748,350,49,347,451,560,659,692,1636],
  "prefix-hashmap":   [560,525,523,974,930,1248,1590,2845,325,437],
  "classic-bs":       [704,35,69,278,374,1539,33,34,74,81,153,162,540,875,1011,1283,2226,410],
  "lower-upper-bound": [35,744,34],
  "bs-on-answers":    [69,367,875,1011,1283,1482,1552,1760,1870,2187,2226,2251,410],
  "search-2d-matrix": [240,74,1901,1428,302],
};

const BEGINNER_TREE_DATA: TreeCategory[] = [
  {
    id: "arrays",
    title: "Arrays",
    icon: LayoutGrid,
    color: "#10b981",
    gradient: "from-emerald-600 to-teal-600",
    badgeStyle: "bg-emerald-50 text-emerald-700 border-emerald-200/90",
    nodes: [
      { id: "two-pointers", title: "Two Pointers", icon: ArrowRight },
      { id: "sliding-window-arr", title: "Sliding Window", icon: Columns },
      { id: "prefix-sum", title: "Prefix Sum", icon: Plus },
      { id: "kadanes", title: "Kadane's Algorithm", icon: TrendingUp },
    ],
  },
  {
    id: "strings",
    title: "Strings",
    icon: Type,
    color: "#8b5cf6",
    gradient: "from-violet-600 to-purple-600",
    badgeStyle: "bg-purple-50 text-purple-700 border-purple-200/90",
    nodes: [
      { id: "two-pointers-str", title: "Two Pointer", icon: ArrowRight },
      { id: "sliding-window-str", title: "Sliding Window", icon: Columns },
    ],
  },
  {
    id: "hashmap",
    title: "Hashmap",
    icon: Database,
    color: "#f59e0b",
    gradient: "from-amber-500 to-orange-600",
    badgeStyle: "bg-amber-50 text-amber-700 border-amber-200/90",
    nodes: [
      { id: "frequency-map", title: "Frequency Map", icon: BarChart2 },
      { id: "prefix-hashmap", title: "Prefix Sum + HashMap", icon: Plus },
    ],
  },
  {
    id: "binary-search",
    title: "Binary Search",
    icon: Search,
    color: "#0284c7",
    gradient: "from-sky-500 to-blue-600",
    badgeStyle: "bg-sky-50 text-sky-700 border-sky-200/90",
    nodes: [
      { id: "classic-bs", title: "Classic Binary Search", icon: Search },
      { id: "lower-upper-bound", title: "Lower / Upper Bound", icon: ChevronsDown },
      { id: "bs-on-answers", title: "Binary Search on Answers", icon: Target },
      { id: "search-2d-matrix", title: "Search in 2D Matrix", icon: Grid },
    ],
  },
];


export default function PracticePage() {
  const { session } = useAuth();
  const userId = session?.user_id;

  const [selectedMode, setSelectedMode] = useState<"index" | "beginner" | "company">("index");
  const [companiesList, setCompaniesList] = useState<string[]>([]);
  const [selectedCompany, setSelectedCompany] = useState<string>("google");
  const [companySearchInput, setCompanySearchInput] = useState<string>("");
  const [selectedPeriod, setSelectedPeriod] = useState<QuestionPeriod>("all");
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>("All");
  const [selectedStatus, setSelectedStatus] = useState<"All" | "Unsolved" | "Completed">("All");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [activePracticeTopic, setActivePracticeTopic] = useState<string | null>(null);

  const [questions, setQuestions] = useState<PracticeQuestion[]>([]);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [loadingQuestions, setLoadingQuestions] = useState<boolean>(false);
  const [loadingCompanies, setLoadingCompanies] = useState<boolean>(false);
  const [limit, setLimit] = useState<number>(100);

  const [solvedState, setSolvedState] = useState<Record<string, boolean>>({});
  const [drawerSolved, setDrawerSolved] = useState<Record<number, boolean>>({});

  // Compute per-node solve percentage from individual problem IDs
  const getNodeProgress = (nodeId: string): { solved: number; total: number; pct: number } => {
    const ids = NODE_PROBLEM_IDS[nodeId] ?? [];
    if (!ids.length) return { solved: 0, total: 0, pct: 0 };
    const solved = ids.filter((id) => !!drawerSolved[id]).length;
    return { solved, total: ids.length, pct: Math.round((solved / ids.length) * 100) };
  };

  // Toggle individual problem in Foundation drawer & sync directly to Supabase + localStorage
  const toggleDrawerProblem = async (
    problemId: number,
    details?: { title: string; difficulty: string; pattern: string }
  ) => {
    if (!userId) return;
    const isCurrentlyDone = !!drawerSolved[problemId];
    const newDoneState = !isCurrentlyDone;

    // 1. Local state update
    setDrawerSolved((prev) => {
      const updated = { ...prev, [problemId]: newDoneState };
      try {
        localStorage.setItem(`skillscatalyst_drawer_solved_${userId}`, JSON.stringify(updated));
      } catch (e) {}
      return updated;
    });

    setSolvedState((prev) => {
      const updated = { ...prev, [problemId.toString()]: newDoneState };
      try {
        localStorage.setItem(`skillscatalyst_solved_questions_${userId}`, JSON.stringify(updated));
      } catch (e) {}
      return updated;
    });

    // 2. Supabase DB Persistence
    try {
      if (newDoneState) {
        await supabase.from("leetcode_progress").upsert(
          {
            user_id: userId,
            company_slug: "foundation",
            question_id: problemId,
            question_title: details?.title || `Problem ${problemId}`,
            difficulty: details?.difficulty || "Easy",
            status: "solved",
            solved_at: new Date().toISOString(),
          },
          { onConflict: "user_id,company_slug,question_id" }
        );
      } else {
        await supabase
          .from("leetcode_progress")
          .delete()
          .eq("user_id", userId)
          .eq("company_slug", "foundation")
          .eq("question_id", problemId);
      }
    } catch (err) {
      console.warn("Supabase foundation problem sync warning:", err);
    }
  };

  // Load solved state from localStorage & Hydrate live from Supabase DB on mount
  useEffect(() => {
    if (!userId) {
      setSolvedState({});
      setDrawerSolved({});
      return;
    }


    try {
      const savedSolved = localStorage.getItem(`skillscatalyst_solved_questions_${userId}`);
      if (savedSolved) {
        setSolvedState(JSON.parse(savedSolved));
      }
      const savedDrawer = localStorage.getItem(`skillscatalyst_drawer_solved_${userId}`);
      if (savedDrawer) {
        setDrawerSolved(JSON.parse(savedDrawer));
      }
    } catch (e) {
      console.warn("Failed to read solved state from localStorage", e);
    }

    async function syncFromSupabase() {
      try {
        const { data: leetcodeData } = await supabase
          .from("leetcode_progress")
          .select("*")
          .eq("user_id", userId);

        const { data: roadmapData } = await supabase
          .from("roadmap_progress")
          .select("*")
          .eq("user_id", userId);

        const fetchedSolvedState: Record<string, boolean> = {};
        const fetchedDrawerState: Record<number, boolean> = {};

        if (leetcodeData) {
          leetcodeData.forEach((item) => {
            const isSolved = item.status === "solved";
            const qIdStr = item.question_id ? item.question_id.toString() : "";

            if (qIdStr) {
              fetchedSolvedState[qIdStr] = isSolved;
              const qIdNum = Number(item.question_id);
              if (!isNaN(qIdNum)) {
                fetchedDrawerState[qIdNum] = isSolved;
              }
            }
            if (item.company_slug && item.question_id && item.question_title) {
              const key = `q_${item.company_slug}_${item.question_id}_${item.question_title}`;
              fetchedSolvedState[key] = isSolved;
            }
          });
        }

        if (roadmapData) {
          roadmapData.forEach((item) => {
            if (item.status === "completed" && item.node_id) {
              fetchedSolvedState[item.node_id] = true;
            }
          });
        }

        setSolvedState((prev) => ({ ...prev, ...fetchedSolvedState }));
        setDrawerSolved((prev) => ({ ...prev, ...fetchedDrawerState }));
      } catch (err) {
        console.warn("Supabase initial sync error:", err);
      }
    }

    syncFromSupabase();
  }, [userId]);

  const toggleSolved = async (
    key: string,
    qDetails?: { company: string; id: number; title: string; difficulty: string; acceptance?: string; frequency?: string }
  ) => {
    const isCurrentlyDone = !!solvedState[key];
    const newDoneState = !isCurrentlyDone;

    setSolvedState((prev) => {
      const updated = { ...prev, [key]: newDoneState };
      try {
        localStorage.setItem(`skillscatalyst_solved_questions_${userId}`, JSON.stringify(updated));
      } catch (e) {
        console.warn("Failed to save solved question state", e);
      }
      return updated;
    });

    // Asynchronous background persistence into Supabase tables
    try {
      if (qDetails) {
        if (newDoneState) {
          await supabase.from("leetcode_progress").upsert(
            {
              user_id: userId,
              company_slug: qDetails.company,
              question_id: qDetails.id,
              question_title: qDetails.title,
              difficulty: qDetails.difficulty,
              acceptance: qDetails.acceptance || "",
              frequency: qDetails.frequency || "",
              status: "solved",
              solved_at: new Date().toISOString(),
            },
            { onConflict: "user_id,company_slug,question_id" }
          );
        } else {
          await supabase
            .from("leetcode_progress")
            .delete()
            .eq("user_id", userId)
            .eq("company_slug", qDetails.company)
            .eq("question_id", qDetails.id);
        }
      } else {
        if (newDoneState) {
          await supabase.from("roadmap_progress").upsert(
            {
              user_id: userId,
              roadmap_id: "dsa-beginner",
              node_id: key,
              node_title: key,
              status: "completed",
              completed_at: new Date().toISOString(),
            },
            { onConflict: "user_id,roadmap_id,node_id" }
          );
        } else {
          await supabase
            .from("roadmap_progress")
            .delete()
            .eq("user_id", userId)
            .eq("roadmap_id", "dsa-beginner")
            .eq("node_id", key);
        }
      }
    } catch (err) {
      console.warn("Supabase background sync error:", err);
    }
  };

  // Fetch company list from backend CSV repository
  useEffect(() => {
    async function loadCompanies() {
      setLoadingCompanies(true);
      const list = await fetchPracticeCompanies();
      if (list && list.length > 0) {
        setCompaniesList(list);
      } else {
        setCompaniesList(TOP_COMPANIES);
      }
      setLoadingCompanies(false);
    }
    loadCompanies();
  }, []);

  // Fetch questions for selected company & filters
  useEffect(() => {
    let isCancelled = false;

    async function loadQuestions() {
      if (selectedMode !== "company") return;
      setLoadingQuestions(true);

      const result = await fetchCompanyQuestions(
        selectedCompany,
        selectedPeriod,
        selectedDifficulty === "All" ? undefined : selectedDifficulty,
        searchQuery.trim() || undefined,
        limit,
        0
      );

      if (!isCancelled) {
        if (result && Array.isArray(result.questions)) {
          setQuestions(result.questions);
          setTotalCount(result.total || result.questions.length);
        } else {
          setQuestions([]);
          setTotalCount(0);
        }
        setLoadingQuestions(false);
      }
    }

    const timer = setTimeout(() => {
      loadQuestions();
    }, 200);

    return () => {
      isCancelled = true;
      clearTimeout(timer);
    };
  }, [selectedMode, selectedCompany, selectedPeriod, selectedDifficulty, searchQuery, limit]);

  // Filtered dropdown list of all 660+ companies
  const filteredCompaniesDropdown = useMemo(() => {
    if (!companySearchInput) return companiesList;
    const term = companySearchInput.toLowerCase().trim();
    return companiesList.filter(
      (c) => c.toLowerCase().includes(term) || formatCompanyName(c).toLowerCase().includes(term)
    );
  }, [companiesList, companySearchInput]);

  // Calculate count of solved questions in loaded list
  const companySolvedCount = useMemo(() => {
    return questions.reduce((acc, q) => {
      const key = `q_${selectedCompany}_${q.id}_${q.title}`;
      const isDone = !!solvedState[key] || !!solvedState[q.id.toString()];
      return isDone ? acc + 1 : acc;
    }, 0);
  }, [questions, solvedState, selectedCompany]);

  const companyProgressPercent =
    questions.length > 0 ? Math.round((companySolvedCount / questions.length) * 100) : 0;

  // Filter questions by Status (All vs Unsolved vs Completed)
  const filteredQuestions = useMemo(() => {
    if (selectedStatus === "All") return questions;
    return questions.filter((q) => {
      const key = `q_${selectedCompany}_${q.id}_${q.title}`;
      const isDone = !!solvedState[key] || !!solvedState[q.id.toString()];
      return selectedStatus === "Completed" ? isDone : !isDone;
    });
  }, [questions, selectedStatus, solvedState, selectedCompany]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="max-w-7xl mx-auto space-y-8 pb-16 select-none"
    >
      {/* ── Top Header */}
      {selectedMode === "index" && (
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">
              Practice & Problem Solving
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Choose your path to practice data structures & algorithms step-by-step or target top companies.
            </p>
          </div>
        </div>
      )}

      {selectedMode === "beginner" && (
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-emerald-100 border border-emerald-200 text-[#234B3B]">
              <Map className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">
                Beginner Level — DSA Learning Roadmap
              </h1>
              <p className="text-sm text-slate-500 mt-1">
                Follow the prerequisite tree from core data structures to advanced algorithm patterns.
              </p>
            </div>
          </div>

          <button
            onClick={() => setSelectedMode("index")}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-sm transition-all shadow-sm self-start md:self-auto"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Practice Cards</span>
          </button>
        </div>
      )}

      {selectedMode === "company" && (
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-600 via-purple-600 to-blue-600 text-white flex items-center justify-center shadow-md shadow-indigo-600/30 shrink-0">
              <Briefcase className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <h1 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">
                  Company Wise Questions
                </h1>
                <span className="px-3 py-0.5 rounded-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-[10px] font-black tracking-wider uppercase shadow-xs">
                  LeetCode CSV Bank
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-500 font-semibold mt-0.5">
                Explore real interview questions asked by {companiesList.length || "660+"} top tech companies from curated CSV datasets.
              </p>
            </div>
          </div>

          <button
            onClick={() => setSelectedMode("index")}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-slate-200/90 hover:bg-slate-50 text-slate-700 font-extrabold text-xs transition-all shadow-sm hover:shadow-md cursor-pointer self-start md:self-auto"
          >
            <ArrowLeft className="w-4 h-4 text-slate-600" />
            <span>Back to Practice Cards</span>
          </button>
        </div>
      )}

      {/* ── MODE SELECTION: INDEX PAGE CARDS (Side-by-Side on Smartphones) */}
      {selectedMode === "index" && (
        <div className="grid grid-cols-2 gap-3 sm:gap-6 pt-2">
          {/* Card 1: Beginner Level */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            onClick={() => setSelectedMode("beginner")}
            className="relative rounded-[20px] sm:rounded-[28px] p-3.5 sm:p-8 bg-white border border-slate-100 hover:border-emerald-200 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 cursor-pointer flex flex-col justify-between group"
          >
            <div className="space-y-3 sm:space-y-5">
              <div className="flex items-center justify-between">
                <div className="w-9 h-9 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-emerald-100 text-[#234B3B] flex items-center justify-center group-hover:scale-105 transition-transform shrink-0">
                  <Clock className="w-4 h-4 sm:w-6 sm:h-6" />
                </div>
                <span className="px-2 py-0.5 sm:px-3 sm:py-1 rounded-full bg-emerald-100 text-[#234B3B] text-[9px] sm:text-[10px] font-black tracking-widest uppercase">
                  FOUNDATIONS
                </span>
              </div>

              <div>
                <h3 className="text-xs sm:text-2xl font-bold text-slate-900 mb-1 sm:mb-2 group-hover:text-[#234B3B] transition-colors leading-snug">
                  1. Beginner Level
                </h3>
                <p className="text-[11px] sm:text-sm text-slate-500 font-normal leading-snug sm:leading-relaxed line-clamp-2 sm:line-clamp-none">
                  Master foundational data structures &amp; core patterns.
                </p>
              </div>
            </div>

            <div className="mt-4 sm:mt-8 pt-3 sm:pt-5 border-t border-slate-100 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2 sm:gap-4">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedMode("beginner");
                }}
                className="px-2.5 py-1.5 sm:px-4 sm:py-2 rounded-xl bg-[#234B3B] text-white text-[10px] sm:text-xs font-bold transition-all shadow-sm hover:bg-[#1b3b2e]"
              >
                Core Concepts
              </button>

              <div className="flex items-center justify-end sm:justify-start gap-1 text-[10px] sm:text-xs font-bold text-[#234B3B] transition-colors">
                <span>View</span>
                <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
              </div>
            </div>
          </motion.div>

          {/* Card 2: Company Wise Questions */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.4 }}
            onClick={() => setSelectedMode("company")}
            className="relative rounded-[20px] sm:rounded-[28px] p-3.5 sm:p-8 bg-white border border-slate-100 hover:border-blue-200 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 cursor-pointer flex flex-col justify-between group"
          >
            <div className="space-y-3 sm:space-y-5">
              <div className="flex items-center justify-between">
                <div className="w-9 h-9 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-blue-100 text-blue-700 flex items-center justify-center group-hover:scale-105 transition-transform shrink-0">
                  <Briefcase className="w-4 h-4 sm:w-6 sm:h-6" />
                </div>
                <span className="px-2 py-0.5 sm:px-3 sm:py-1 rounded-full bg-blue-100 text-blue-800 text-[9px] sm:text-[10px] font-black tracking-widest uppercase">
                  INTERVIEW PREP
                </span>
              </div>

              <div>
                <h3 className="text-xs sm:text-2xl font-bold text-slate-900 mb-1 sm:mb-2 group-hover:text-blue-700 transition-colors leading-snug">
                  2. Company Questions
                </h3>
                <p className="text-[11px] sm:text-sm text-slate-500 font-normal leading-snug sm:leading-relaxed line-clamp-2 sm:line-clamp-none">
                  LeetCode questions from {companiesList.length || "660+"} top tech companies.
                </p>
              </div>
            </div>

            <div className="mt-4 sm:mt-8 pt-3 sm:pt-5 border-t border-slate-100 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2 sm:gap-4">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedMode("company");
                }}
                className="px-2.5 py-1.5 sm:px-4 sm:py-2 rounded-xl bg-blue-600 text-white text-[10px] sm:text-xs font-bold transition-all shadow-sm hover:bg-blue-700"
              >
                Question Bank
              </button>

              <div className="flex items-center justify-end sm:justify-start gap-1 text-[10px] sm:text-xs font-bold text-blue-600 transition-colors">
                <span>View</span>
                <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* ── MODE 1: BEGINNER LEVEL — DSA LEARNING ROADMAP TREE */}
      {selectedMode === "beginner" && (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative rounded-[28px] p-6 sm:p-10 bg-white border border-slate-100 shadow-xs overflow-hidden min-h-[620px]"
        >
          {/* Ambient Glow Aura behind Foundation */}
          <div className="absolute top-4 left-1/2 -translate-x-1/2 w-64 h-32 bg-cyan-500/15 blur-3xl rounded-full pointer-events-none" />

          {/* Top Foundation Root Node & Branching Tree Structure */}
          <div className="flex flex-col items-center justify-center relative z-10 mb-8">
            <motion.div
              whileHover={{ scale: 1.05, y: -2 }}
              className="px-8 py-3.5 rounded-full text-white font-black text-lg flex items-center gap-2.5 shadow-lg bg-gradient-to-r from-[#173e32] via-[#12362b] to-[#0d2a21] border border-emerald-400/40 cursor-pointer relative z-20"
            >
              <Layers className="w-5 h-5 text-emerald-300" />
              <span>Foundation</span>
            </motion.div>

            {/* Vertical trunk line below Foundation */}
            <div className="w-0.5 h-8 bg-emerald-700" />

            {/* Horizontal Branch Bar spreading across 4 columns (Desktop) */}
            <div className="hidden lg:block w-[75%] h-0.5 bg-gradient-to-r from-emerald-500 via-purple-500 to-sky-500 relative">
              <div className="absolute left-0 top-0 w-0.5 h-7 bg-emerald-600" />
              <div className="absolute left-0 top-7 -translate-x-1/2 w-2.5 h-2.5 rounded-full bg-emerald-600 shadow-xs" />

              <div className="absolute left-[33.33%] top-0 w-0.5 h-7 bg-purple-600" />
              <div className="absolute left-[33.33%] top-7 -translate-x-1/2 w-2.5 h-2.5 rounded-full bg-purple-600 shadow-xs" />

              <div className="absolute left-[66.66%] top-0 w-0.5 h-7 bg-amber-500" />
              <div className="absolute left-[66.66%] top-7 -translate-x-1/2 w-2.5 h-2.5 rounded-full bg-amber-500 shadow-xs" />

              <div className="absolute right-0 top-0 w-0.5 h-7 bg-sky-500" />
              <div className="absolute right-0 top-7 translate-x-1/2 w-2.5 h-2.5 rounded-full bg-sky-500 shadow-xs" />
            </div>
          </div>

          {/* 4 Category Columns Grid (Side-by-Side on Smartphones) */}
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-8 relative z-10 pt-4">
            {BEGINNER_TREE_DATA.map((cat, cIdx) => {
              const CategoryIcon = cat.icon;

              return (
                <motion.div
                  key={cat.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: cIdx * 0.1, duration: 0.4 }}
                  className="space-y-4 flex flex-col items-center relative"
                >
                  {/* Category Header Node */}
                  <motion.div
                    whileHover={{ scale: 1.04, y: -2 }}
                    className={`w-full py-3.5 px-5 rounded-2xl bg-gradient-to-r ${cat.gradient} text-white font-extrabold text-sm flex items-center justify-center gap-2 shadow-md cursor-pointer relative z-10 border border-white/20`}
                  >
                    <CategoryIcon className="w-4.5 h-4.5 text-white" />
                    <span>{cat.title}</span>
                  </motion.div>

                  {/* Vertical Connector Line under Category Header */}
                  <div className="flex flex-col items-center my-1 relative z-10">
                    <div className="w-0.5 h-4" style={{ backgroundColor: cat.color }} />
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: cat.color }} />
                  </div>

                  {/* Sub-nodes Vertical Flow */}
                  <div className="w-full space-y-3 relative z-10">
                    {cat.nodes.map((node, nIdx) => {
                      const NodeIcon = node.icon;
                      const { solved, total, pct } = getNodeProgress(node.id);
                      const isComplete = total > 0 && pct === 100;

                      return (
                        <React.Fragment key={node.id}>
                          {nIdx > 0 && (
                            <div className="flex flex-col items-center my-1">
                              <div className="w-0.5 h-3" style={{ backgroundColor: `${cat.color}60` }} />
                              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: cat.color }} />
                              <div className="w-0.5 h-3" style={{ backgroundColor: `${cat.color}60` }} />
                            </div>
                          )}

                          {/* Node Button — vibrant card styling */}
                          <motion.button
                            whileHover={{ scale: 1.03, y: -1 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => setActivePracticeTopic(node.title)}
                            className="w-full py-3.5 px-4 rounded-2xl text-xs font-bold border transition-all duration-200 flex items-center gap-3 shadow-sm hover:shadow-md relative overflow-hidden text-slate-900 cursor-pointer group"
                            style={{
                              background: `linear-gradient(135deg, ${cat.color}14 0%, #ffffff 85%)`,
                              borderTopColor: `${cat.color}45`,
                              borderRightColor: `${cat.color}45`,
                              borderBottomColor: `${cat.color}45`,
                              borderLeftColor: cat.color,
                              borderLeftWidth: "4px",
                            }}
                          >
                            {/* Color progress fill behind label */}
                            {pct > 0 && (
                              <motion.div
                                className="absolute inset-0 rounded-2xl pointer-events-none"
                                initial={{ width: 0 }}
                                animate={{ width: `${pct}%` }}
                                transition={{ duration: 0.7, ease: "easeOut" }}
                                style={{
                                  background: `${cat.color}22`,
                                }}
                              />
                            )}

                            {/* Solid Brand Icon Badge */}
                            <div
                              className="w-7 h-7 rounded-xl flex items-center justify-center relative z-10 transition-transform group-hover:scale-110 shrink-0"
                              style={{
                                background: `linear-gradient(135deg, ${cat.color}, ${cat.color}dd)`,
                                color: "#ffffff",
                                boxShadow: `0 3px 10px ${cat.color}40`,
                              }}
                            >
                              <NodeIcon className="w-3.5 h-3.5 text-white" />
                            </div>

                            <span className="flex-1 text-left relative z-10 text-slate-900 font-extrabold group-hover:text-slate-950 text-xs">
                              {node.title}
                            </span>

                            {/* Progress counter badge */}
                            {total > 0 && (
                              <span
                                className="text-[10px] font-black px-2.5 py-0.5 rounded-full relative z-10 shrink-0 tabular-nums"
                                style={
                                  pct > 0
                                    ? {
                                        background: `linear-gradient(135deg, ${cat.color}, ${cat.color}ee)`,
                                        color: "#ffffff",
                                        boxShadow: `0 2px 8px ${cat.color}35`,
                                      }
                                    : {
                                        backgroundColor: "#f1f5f9",
                                        color: "#475569",
                                        border: "1px solid #e2e8f0",
                                      }
                                }
                              >
                                {solved}/{total}
                              </span>
                            )}
                          </motion.button>
                        </React.Fragment>
                      );
                    })}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      )}

      {/* ── MODE 2: COMPANY WISE QUESTION BANK (FETCHED FROM CSV DATASETS) */}
      {selectedMode === "company" && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {/* Controls Panel */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-md space-y-5 relative overflow-hidden">
            <div className="absolute -top-10 -right-10 w-44 h-44 bg-indigo-500/5 rounded-full blur-2xl pointer-events-none" />

            {/* Top row: Select Any Company Dropdown + Search bar */}
            <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 relative z-10">
              {/* Dropdown for 660+ companies */}
              <div className="flex items-center gap-3 flex-1 min-w-[260px]">
                <div className="w-9 h-9 rounded-xl bg-indigo-50 border border-indigo-200 flex items-center justify-center shrink-0 shadow-2xs">
                  <Building2 className="w-5 h-5 text-indigo-600" />
                </div>
                <div className="relative w-full max-w-md">
                  <select
                    value={selectedCompany}
                    onChange={(e) => {
                      setSelectedCompany(e.target.value);
                      setLimit(100);
                    }}
                    className="w-full bg-slate-900 text-white text-xs font-black px-4 py-2.5 rounded-xl border border-slate-800 focus:border-indigo-500 outline-none cursor-pointer appearance-none pr-10 shadow-md transition-all"
                  >
                    {filteredCompaniesDropdown.map((comp) => (
                      <option key={comp} value={comp} className="bg-slate-900 text-white font-semibold">
                        {formatCompanyName(comp)} ({comp})
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>

              {/* Company Search Input */}
              <div className="relative w-full md:w-64">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  value={companySearchInput}
                  onChange={(e) => setCompanySearchInput(e.target.value)}
                  placeholder="Filter 660+ companies..."
                  className="w-full bg-slate-50 border border-slate-200/90 focus:border-indigo-500 focus:bg-white text-slate-900 placeholder:text-slate-400 text-xs font-bold pl-10 pr-4 py-2.5 rounded-xl transition-all shadow-2xs outline-none"
                />
              </div>

              {/* Question Search Input */}
              <div className="relative w-full md:w-64">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search question title..."
                  className="w-full bg-slate-50 border border-slate-200/90 focus:border-indigo-500 focus:bg-white text-slate-900 placeholder:text-slate-400 text-xs font-bold pl-10 pr-4 py-2.5 rounded-xl transition-all shadow-2xs outline-none"
                />
              </div>
            </div>

            {/* Popular Companies Quick Selector Pills */}
            <div className="pt-3 border-t border-slate-100 flex items-center gap-2 overflow-x-auto pb-1 scrollbar-thin relative z-10">
              <span className="text-[11px] font-black text-slate-400 uppercase tracking-widest mr-1 shrink-0">
                POPULAR:
              </span>
              {TOP_COMPANIES.map((slug) => {
                const isSelected = selectedCompany === slug;
                return (
                  <button
                    key={slug}
                    onClick={() => {
                      setSelectedCompany(slug);
                      setLimit(100);
                    }}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-extrabold transition-all shrink-0 cursor-pointer ${
                      isSelected
                        ? "bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-700 text-white shadow-md shadow-indigo-600/30 border border-indigo-400 font-black scale-105"
                        : "bg-slate-100/90 text-slate-700 hover:bg-slate-200/90 hover:text-slate-900 border border-slate-200/80 shadow-2xs"
                    }`}
                  >
                    {formatCompanyName(slug)}
                  </button>
                );
              })}
            </div>

            {/* Filter Row: Time Periods & Difficulties & Status */}
            <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-4 relative z-10">
              {/* Time Period Tabs */}
              <div className="flex items-center gap-2 overflow-x-auto pb-1">
                <span className="text-[11px] font-black text-slate-400 uppercase tracking-widest mr-1 shrink-0">TIME FRAME:</span>
                {PERIODS.map((p) => {
                  const isActive = selectedPeriod === p.value;
                  return (
                    <button
                      key={p.value}
                      onClick={() => {
                        setSelectedPeriod(p.value);
                        setLimit(100);
                      }}
                      className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all shrink-0 cursor-pointer ${
                        isActive
                          ? "bg-gradient-to-r from-sky-500 to-blue-600 text-white shadow-xs font-black border border-sky-400"
                          : "bg-slate-100 text-slate-600 hover:bg-slate-200 border border-slate-200/70"
                      }`}
                    >
                      {p.label}
                    </button>
                  );
                })}
              </div>

              <div className="flex items-center gap-4 flex-wrap">
                {/* Difficulty Filter Tabs */}
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-black text-slate-400 uppercase tracking-widest mr-1">DIFFICULTY:</span>
                  {DIFFICULTIES.map((d) => {
                    const isActive = selectedDifficulty === d;
                    return (
                      <button
                        key={d}
                        onClick={() => setSelectedDifficulty(d)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
                          isActive
                            ? d === "Easy"
                              ? "bg-emerald-500 text-white font-black shadow-xs border border-emerald-400"
                              : d === "Medium"
                              ? "bg-amber-500 text-white font-black shadow-xs border border-amber-400"
                              : d === "Hard"
                              ? "bg-rose-500 text-white font-black shadow-xs border border-rose-400"
                              : "bg-indigo-600 text-white font-black shadow-xs border border-indigo-400"
                            : "bg-slate-100 text-slate-600 hover:bg-slate-200 border border-slate-200/70"
                        }`}
                      >
                        {d}
                      </button>
                    );
                  })}
                </div>

                {/* Completion Status Filter (All / Unsolved / Completed) */}
                <div className="flex items-center gap-2 border-l border-slate-200 pl-4">
                  <span className="text-[11px] font-black text-slate-400 uppercase tracking-widest mr-1">STATUS:</span>
                  {(["All", "Unsolved", "Completed"] as const).map((st) => {
                    const isActive = selectedStatus === st;
                    return (
                      <button
                        key={st}
                        onClick={() => setSelectedStatus(st)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
                          isActive
                            ? st === "Completed"
                              ? "bg-emerald-600 text-white font-black shadow-xs border border-emerald-400"
                              : st === "Unsolved"
                              ? "bg-indigo-600 text-white font-black shadow-xs border border-indigo-400"
                              : "bg-slate-800 text-white font-black shadow-xs border border-slate-700"
                            : "bg-slate-100 text-slate-600 hover:bg-slate-200 border border-slate-200/70"
                        }`}
                      >
                        {st}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* Progress Tracker Banner (Forest Green Hero) */}
          <div className="relative overflow-hidden rounded-[28px] bg-[#234B3B] p-6 sm:p-8 text-white flex flex-col md:flex-row items-center justify-between gap-6 shadow-sm">
            <div className="flex items-center gap-4 w-full md:w-auto">
              <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-[#234B3B] flex items-center justify-center shrink-0">
                <Trophy className="w-6 h-6 text-[#234B3B]" />
              </div>
              <div className="space-y-0.5">
                <h4 className="text-lg font-extrabold text-white flex items-center gap-2">
                  <span>{formatCompanyName(selectedCompany)} Progress Tracker</span>
                  <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-amber-400 text-slate-900">
                    ({companySolvedCount} / {questions.length} Solved)
                  </span>
                </h4>
                <p className="text-xs text-emerald-100/80 font-medium">
                  Check off questions to save your progress directly into Supabase DB.
                </p>
              </div>
            </div>

            {/* Animated Progress Bar */}
            <div className="w-full md:w-64 space-y-1.5">
              <div className="flex justify-between text-xs font-extrabold">
                <span className="text-emerald-100">Completion Rate</span>
                <span className="text-amber-300">{companyProgressPercent}%</span>
              </div>
              <div className="w-full h-2.5 rounded-full bg-white/20 overflow-hidden p-0.5 backdrop-blur-xs">
                <div
                  className="h-full rounded-full bg-amber-300 transition-all duration-500 shadow-xs"
                  style={{ width: `${companyProgressPercent}%` }}
                />
              </div>
            </div>
          </div>

          {/* Question List Table Container */}
          <div className="bg-white rounded-[28px] p-6 border border-slate-100 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-blue-100 text-blue-800 flex items-center justify-center font-bold">
                  <Building2 className="w-5 h-5 text-blue-800" />
                </div>
                <div>
                  <h3 className="text-lg font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
                    <span>{formatCompanyName(selectedCompany)}</span>
                    <span className="text-xs font-extrabold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                      {selectedCompany}
                    </span>
                  </h3>
                  <p className="text-xs text-slate-500 font-medium mt-0.5">
                    Interview questions fetched from CSV dataset ({PERIODS.find((p) => p.value === selectedPeriod)?.label})
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 self-end sm:self-auto">
                {loadingQuestions ? (
                  <div className="flex items-center gap-2 text-xs text-[#234B3B] font-bold">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Loading CSV data...</span>
                  </div>
                ) : (
                  <span className="text-xs text-slate-500 font-bold px-3.5 py-1.5 rounded-full bg-slate-100 border border-slate-200">
                    Showing <strong className="text-slate-900">{filteredQuestions.length}</strong> of{" "}
                    <strong className="text-[#234B3B]">{totalCount}</strong> questions
                  </span>
                )}
              </div>
            </div>

            {/* Questions Table Body */}
            {loadingQuestions ? (
              <div className="py-16 text-center space-y-3">
                <Loader2 className="w-8 h-8 text-[#234B3B] animate-spin mx-auto" />
                <p className="text-sm font-medium text-slate-500">
                  Parsing CSV question bank for {formatCompanyName(selectedCompany)}...
                </p>
              </div>
            ) : filteredQuestions.length === 0 ? (
              <div className="py-16 text-center space-y-3 bg-slate-50 rounded-2xl border border-slate-200/80">
                <Filter className="w-8 h-8 text-slate-400 mx-auto" />
                <h4 className="text-base font-bold text-slate-900">No questions found</h4>
                <p className="text-xs text-slate-500 max-w-sm mx-auto font-medium">
                  No interview questions match your selected status, period, or difficulty filters for {formatCompanyName(selectedCompany)}.
                </p>
              </div>
            ) : (
              <div className="space-y-2.5">
                {filteredQuestions.map((q, idx) => {
                  const key = `q_${selectedCompany}_${q.id}_${q.title}`;
                  const isDone = !!solvedState[key] || !!solvedState[q.id.toString()];
                  const leetCodeUrl = getLeetCodeUrl(q);

                  return (
                    <motion.div
                      key={`${q.id}-${idx}`}
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: Math.min(idx * 0.02, 0.3) }}
                      className={`flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-2xl border transition-all gap-4 group shadow-xs ${
                        isDone
                          ? "bg-emerald-50/60 border-emerald-200"
                          : "bg-white border-slate-100 hover:border-slate-200 hover:shadow-md"
                      }`}
                    >
                      <div className="flex items-start sm:items-center gap-3.5">
                        {/* Interactive Checkbox Button with Live Supabase Sync */}
                        <button
                          onClick={() =>
                            toggleSolved(key, {
                              company: selectedCompany,
                              id: q.id,
                              title: q.title,
                              difficulty: q.difficulty,
                              acceptance: q.acceptance,
                              frequency: q.frequency,
                            })
                          }
                          className={`flex items-center gap-2 px-3 py-1.5 rounded-full border transition-all cursor-pointer select-none shrink-0 ${
                            isDone
                              ? "bg-emerald-100 border-emerald-300 text-emerald-800 font-bold"
                              : "bg-slate-50 border-slate-200 hover:bg-slate-100 text-slate-600 font-semibold"
                          }`}
                          title={isDone ? "Click to mark as incomplete" : "Click to mark as completed"}
                        >
                          {isDone ? (
                            <CheckSquare className="w-4 h-4 text-emerald-700 shrink-0" />
                          ) : (
                            <Square className="w-4 h-4 text-slate-400 shrink-0" />
                          )}
                          <span className="text-[11px] font-extrabold tracking-wide">
                            {isDone ? "Completed" : "Mark Solved"}
                          </span>
                        </button>

                        <div className="space-y-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-xs font-mono text-slate-400 font-bold">
                              #{q.id || idx + 1}
                            </span>
                            <a
                              href={leetCodeUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className={`text-sm font-bold transition-colors flex items-center gap-1.5 ${
                                isDone
                                  ? "text-slate-400 line-through"
                                  : "text-slate-900 group-hover:text-[#234B3B]"
                              }`}
                            >
                              <span>{q.title}</span>
                              <ExternalLink className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 text-[#234B3B] transition-opacity" />
                            </a>

                            {isDone && (
                              <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200 flex items-center gap-1">
                                <Check className="w-3 h-3 text-emerald-700" />
                                Solved
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between sm:justify-end gap-3.5 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                        {/* Acceptance Rate */}
                        {q.acceptance && (
                          <span className="text-xs font-bold px-3 py-1 rounded-full bg-blue-100 text-blue-800 border border-blue-200">
                            {q.acceptance} Acc.
                          </span>
                        )}

                        {/* Frequency Rate */}
                        {q.frequency && (
                          <span className="text-xs font-bold px-3 py-1 rounded-full bg-purple-100 text-purple-800 border border-purple-200">
                            {q.frequency} Freq.
                          </span>
                        )}

                        {/* Difficulty Badge */}
                        <span
                          className={`text-xs font-bold px-3 py-1 rounded-full ${
                            q.difficulty === "Easy"
                              ? "bg-emerald-100 text-emerald-800 border border-emerald-200"
                              : q.difficulty === "Medium"
                              ? "bg-amber-100 text-amber-900 border border-amber-200"
                              : "bg-rose-100 text-rose-800 border border-rose-200"
                          }`}
                        >
                          {q.difficulty}
                        </span>

                        {/* Direct LeetCode External Link Button */}
                        <a
                          href={leetCodeUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-4 py-1.5 rounded-full text-xs font-bold text-white bg-[#234B3B] hover:bg-[#1b3b2e] shadow-xs flex items-center gap-1.5 transition-all cursor-pointer"
                        >
                          <span>Solve</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}

            {/* Load More Button */}
            {!loadingQuestions && questions.length < totalCount && (
              <div className="pt-4 text-center">
                <button
                  onClick={() => setLimit((prev) => prev + 100)}
                  className="px-6 py-2.5 rounded-xl bg-[#131b2e] hover:bg-indigo-950 border border-indigo-500/30 text-indigo-300 hover:text-white text-xs font-bold transition-all shadow-lg inline-flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  <span>Load More Questions ({questions.length} / {totalCount})</span>
                </button>
              </div>
            )}
          </div>
        </motion.div>
      )}

      {/* Practice Topic Detail Drawer Overlay — passes shared solved state for progress tracking */}
      <PracticeTopicDrawer
        isOpen={!!activePracticeTopic}
        onClose={() => setActivePracticeTopic(null)}
        topicName={activePracticeTopic || ""}
        solvedSet={drawerSolved}
        onToggleSolved={toggleDrawerProblem}
      />

      {/* Native Smartphone Floating Action Button */}
      {selectedMode !== "index" && (
        <FloatingCTA
          onClick={() => setSelectedMode("index")}
          icon={<ArrowLeft className="w-5 h-5 text-white" />}
          label="Practice Modes"
        />
      )}
    </motion.div>
  );
}
