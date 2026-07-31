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
    nodes: [
      { id: "two-pointers-str", title: "Two Pointer", icon: ArrowRight },
      { id: "sliding-window-str", title: "Sliding Window", icon: Columns },
    ],
  },
  {
    id: "hashmap",
    title: "Hashmap",
    icon: Database,
    nodes: [
      { id: "frequency-map", title: "Frequency Map", icon: BarChart2 },
      { id: "prefix-hashmap", title: "Prefix Sum + HashMap", icon: Plus },
    ],
  },
  {
    id: "binary-search",
    title: "Binary Search",
    icon: Search,
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
  const userId = session?.user_id || "default_user";

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
            <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
              Practice & Problem Solving
            </h1>
            <p className="text-sm text-slate-400 mt-1">
              Choose your path to practice data structures & algorithms step-by-step or target top companies.
            </p>
          </div>
        </div>
      )}

      {selectedMode === "beginner" && (
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-purple-500/15 border border-purple-500/30 text-purple-400">
              <Map className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
                Beginner Level — DSA Learning Roadmap
              </h1>
              <p className="text-sm text-slate-400 mt-1">
                Follow the prerequisite tree from core data structures to advanced algorithm patterns.
              </p>
            </div>
          </div>

          <button
            onClick={() => setSelectedMode("index")}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#131b2e] border border-white/[0.08] hover:border-slate-600 text-slate-300 hover:text-white font-medium text-sm transition-all shadow-md self-start md:self-auto"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Practice Cards</span>
          </button>
        </div>
      )}

      {selectedMode === "company" && (
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-blue-500/15 border border-blue-500/30 text-blue-400">
              <Briefcase className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
                Company Wise Questions — LeetCode CSV Bank
              </h1>
              <p className="text-sm text-slate-400 mt-1">
                Explore real interview questions asked by {companiesList.length || "660+"} top tech companies from curated CSV datasets.
              </p>
            </div>
          </div>

          <button
            onClick={() => setSelectedMode("index")}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#131b2e] border border-white/[0.08] hover:border-slate-600 text-slate-300 hover:text-white font-medium text-sm transition-all shadow-md self-start md:self-auto"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Practice Cards</span>
          </button>
        </div>
      )}

      {/* ── MODE SELECTION: INDEX PAGE CARDS */}
      {selectedMode === "index" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
          {/* Card 1: Beginner Level */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            onClick={() => setSelectedMode("beginner")}
            className="relative rounded-2xl p-6 md:p-8 bg-[#131b2e] border border-white/[0.08] hover:border-indigo-500/40 hover:bg-[#18233c] hover:shadow-2xl hover:shadow-indigo-500/10 hover:-translate-y-1 transition-all duration-300 cursor-pointer flex flex-col justify-between group"
          >
            <div className="space-y-5">
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center group-hover:scale-105 transition-transform">
                  <Clock className="w-6 h-6" />
                </div>
                <span className="px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-[10px] font-black tracking-widest uppercase">
                  FOUNDATIONS
                </span>
              </div>

              <div>
                <h3 className="text-xl md:text-2xl font-bold text-white mb-2 group-hover:text-indigo-300 transition-colors">
                  1. Beginner Level
                </h3>
                <p className="text-sm text-slate-400 font-normal leading-relaxed">
                  Master foundational data structures & algorithms concepts, core patterns, and time complexities.
                </p>
              </div>
            </div>

            <div className="mt-8 pt-5 border-t border-white/[0.06] flex items-center justify-between gap-4">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedMode("beginner");
                }}
                className="px-4 py-2 rounded-xl bg-indigo-950/80 hover:bg-indigo-900/90 text-indigo-300 border border-indigo-700/50 text-xs font-bold transition-all"
              >
                Core Concept Modules
              </button>

              <div className="flex items-center gap-1.5 text-xs font-bold text-cyan-400 group-hover:text-cyan-300 transition-colors">
                <span>View Concepts</span>
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </div>
            </div>
          </motion.div>

          {/* Card 2: Company Wise Questions */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.4 }}
            onClick={() => setSelectedMode("company")}
            className="relative rounded-2xl p-6 md:p-8 bg-[#131b2e] border border-white/[0.08] hover:border-indigo-500/40 hover:bg-[#18233c] hover:shadow-2xl hover:shadow-indigo-500/10 hover:-translate-y-1 transition-all duration-300 cursor-pointer flex flex-col justify-between group"
          >
            <div className="space-y-5">
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center group-hover:scale-105 transition-transform">
                  <Briefcase className="w-6 h-6" />
                </div>
                <span className="px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-[10px] font-black tracking-widest uppercase">
                  INTERVIEW PREP
                </span>
              </div>

              <div>
                <h3 className="text-xl md:text-2xl font-bold text-white mb-2 group-hover:text-indigo-300 transition-colors">
                  2. Company Wise Questions
                </h3>
                <p className="text-sm text-slate-400 font-normal leading-relaxed">
                  Explore real LeetCode questions asked by {companiesList.length || "660+"} top tech companies loaded directly from CSV datasets.
                </p>
              </div>
            </div>

            <div className="mt-8 pt-5 border-t border-white/[0.06] flex items-center justify-between gap-4">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedMode("company");
                }}
                className="px-4 py-2 rounded-xl bg-indigo-950/80 hover:bg-indigo-900/90 text-indigo-300 border border-indigo-700/50 text-xs font-bold transition-all"
              >
                LeetCode Question Bank
              </button>

              <div className="flex items-center gap-1.5 text-xs font-bold text-cyan-400 group-hover:text-cyan-300 transition-colors">
                <span>Explore Questions</span>
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
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
          className="relative rounded-3xl p-6 sm:p-10 bg-[#070b14] border border-indigo-500/30 shadow-2xl overflow-hidden min-h-[620px]"
          style={{
            backgroundImage: "radial-gradient(rgba(99, 102, 241, 0.12) 1px, transparent 1px)",
            backgroundSize: "24px 24px",
          }}
        >
          {/* Ambient Glow Aura behind Foundation */}
          <div className="absolute top-4 left-1/2 -translate-x-1/2 w-64 h-32 bg-cyan-500/15 blur-3xl rounded-full pointer-events-none animate-pulse" />

          {/* Top Foundation Root Node & Branching Tree Structure */}
          <div className="flex flex-col items-center justify-center relative z-10 mb-8">
            <motion.div
              whileHover={{ scale: 1.05, y: -2 }}
              className="px-8 py-3.5 rounded-2xl text-white font-black text-lg flex items-center gap-2.5 shadow-2xl border border-cyan-300/40 cursor-pointer relative z-20"
              style={{
                background: "linear-gradient(135deg, #0284c7 0%, #2563eb 50%, #3b82f6 100%)",
                boxShadow: "0 0 35px rgba(2, 132, 199, 0.5), 0 0 15px rgba(59, 130, 246, 0.4)",
              }}
            >
              <Layers className="w-5 h-5 text-cyan-200" />
              <span>Foundation</span>
            </motion.div>

            {/* Vertical trunk line below Foundation */}
            <div className="w-0.5 h-8 bg-gradient-to-b from-cyan-400 to-indigo-500 shadow-[0_0_12px_#38bdf8]" />

            {/* Horizontal Branch Bar spreading across 4 columns (Desktop) */}
            <div className="hidden lg:block w-[75%] h-0.5 bg-gradient-to-r from-cyan-500 via-indigo-500 to-cyan-500 shadow-[0_0_12px_#38bdf8] relative">
              <div className="absolute left-0 top-0 w-0.5 h-7 bg-gradient-to-b from-cyan-400 to-indigo-500 shadow-[0_0_10px_#38bdf8]" />
              <div className="absolute left-0 top-7 -translate-x-1/2 w-2 h-2 rounded-full bg-cyan-300 shadow-[0_0_8px_#38bdf8]" />

              <div className="absolute left-[33.33%] top-0 w-0.5 h-7 bg-gradient-to-b from-indigo-500 to-cyan-400 shadow-[0_0_10px_#38bdf8]" />
              <div className="absolute left-[33.33%] top-7 -translate-x-1/2 w-2 h-2 rounded-full bg-cyan-300 shadow-[0_0_8px_#38bdf8]" />

              <div className="absolute left-[66.66%] top-0 w-0.5 h-7 bg-gradient-to-b from-indigo-500 to-cyan-400 shadow-[0_0_10px_#38bdf8]" />
              <div className="absolute left-[66.66%] top-7 -translate-x-1/2 w-2 h-2 rounded-full bg-cyan-300 shadow-[0_0_8px_#38bdf8]" />

              <div className="absolute right-0 top-0 w-0.5 h-7 bg-gradient-to-b from-cyan-400 to-indigo-500 shadow-[0_0_10px_#38bdf8]" />
              <div className="absolute right-0 top-7 translate-x-1/2 w-2 h-2 rounded-full bg-cyan-300 shadow-[0_0_8px_#38bdf8]" />
            </div>
          </div>

          {/* 4 Category Columns Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 relative z-10 pt-4">
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
                    className="w-full py-3.5 px-5 rounded-2xl bg-[#12192e] border border-indigo-500/50 text-white font-extrabold text-sm flex items-center justify-center gap-2 shadow-xl shadow-indigo-500/15 cursor-pointer relative z-10"
                  >
                    <CategoryIcon className="w-4.5 h-4.5 text-indigo-400" />
                    <span>{cat.title}</span>
                  </motion.div>

                  {/* Vertical Connector Line under Category Header */}
                  <div className="flex flex-col items-center my-1 relative z-10">
                    <div className="w-0.5 h-4 bg-gradient-to-b from-indigo-500 to-cyan-400 shadow-[0_0_8px_#38bdf8]" />
                    <div className="w-2 h-2 rounded-full bg-cyan-300 border border-white shadow-[0_0_10px_#38bdf8] animate-pulse" />
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
                              <div className="w-0.5 h-3 bg-gradient-to-b from-indigo-500 to-cyan-400 shadow-[0_0_6px_#38bdf8]" />
                              <div className="w-1.5 h-1.5 rounded-full bg-cyan-300 border border-white/50 shadow-[0_0_8px_#38bdf8]" />
                              <div className="w-0.5 h-3 bg-gradient-to-b from-cyan-400 to-indigo-500 shadow-[0_0_6px_#38bdf8]" />
                            </div>
                          )}

                          {/* Node Button — green fill reflects solve progress */}
                          <motion.button
                            whileHover={{ scale: 1.03, y: -1 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => setActivePracticeTopic(node.title)}
                            className="w-full py-3 px-4 rounded-2xl text-xs font-bold border transition-all duration-200 flex items-center gap-2.5 shadow-md relative overflow-hidden"
                            style={{
                              borderColor: isComplete
                                ? "rgba(52,211,153,0.7)"
                                : pct > 0
                                ? "rgba(52,211,153,0.4)"
                                : "rgba(255,255,255,0.08)",
                              background: "#111728",
                            }}
                          >
                            {/* Green progress fill behind label */}
                            {pct > 0 && (
                              <motion.div
                                className="absolute inset-0 rounded-2xl pointer-events-none"
                                initial={{ width: 0 }}
                                animate={{ width: `${pct}%` }}
                                transition={{ duration: 0.7, ease: "easeOut" }}
                                style={{
                                  background: isComplete
                                    ? "linear-gradient(90deg, rgba(16,185,129,0.35) 0%, rgba(52,211,153,0.25) 100%)"
                                    : "linear-gradient(90deg, rgba(16,185,129,0.22) 0%, rgba(52,211,153,0.12) 100%)",
                                }}
                              />
                            )}

                            {/* Icon + label (above the fill) */}
                            <NodeIcon
                              className={`w-3.5 h-3.5 shrink-0 relative z-10 ${
                                pct > 0 ? "text-emerald-400" : "text-indigo-400"
                              }`}
                            />
                            <span
                              className={`flex-1 text-left relative z-10 ${
                                pct > 0 ? "text-white" : "text-slate-200"
                              }`}
                            >
                              {node.title}
                            </span>

                            {/* Progress counter badge */}
                            {total > 0 && (
                              <span
                                className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full relative z-10 shrink-0 tabular-nums ${
                                  isComplete
                                    ? "bg-emerald-500/25 text-emerald-300 border border-emerald-500/40"
                                    : pct > 0
                                    ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/25"
                                    : "bg-slate-700/60 text-slate-500 border border-slate-600/40"
                                }`}
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
          <div className="glass p-5 rounded-2xl border border-white/[0.08] space-y-4">
            {/* Top row: Select Any Company Dropdown + Search bar */}
            <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
              {/* Dropdown for 660+ companies */}
              <div className="flex items-center gap-3 flex-1 min-w-[260px]">
                <Building2 className="w-5 h-5 text-indigo-400 shrink-0" />
                <div className="relative w-full max-w-md">
                  <select
                    value={selectedCompany}
                    onChange={(e) => {
                      setSelectedCompany(e.target.value);
                      setLimit(100);
                    }}
                    className="w-full bg-[#0d1424] text-white text-xs font-bold px-4 py-2.5 rounded-xl border border-white/[0.12] focus:border-indigo-500 outline-none cursor-pointer appearance-none pr-10 shadow-lg"
                  >
                    {filteredCompaniesDropdown.map((comp) => (
                      <option key={comp} value={comp} className="bg-[#0f172a] text-white">
                        {formatCompanyName(comp)} ({comp})
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>

              {/* Company Search Input */}
              <div className="relative w-full md:w-64">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  type="text"
                  value={companySearchInput}
                  onChange={(e) => setCompanySearchInput(e.target.value)}
                  placeholder="Filter 660+ companies..."
                  className="input-glass w-full pl-10 pr-4 py-2 text-xs rounded-xl"
                />
              </div>

              {/* Question Search Input */}
              <div className="relative w-full md:w-64">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search question title..."
                  className="input-glass w-full pl-10 pr-4 py-2 text-xs rounded-xl"
                />
              </div>
            </div>

            {/* Popular Companies Quick Selector Pills */}
            <div className="pt-2 border-t border-white/[0.06] flex items-center gap-2 overflow-x-auto pb-1 scrollbar-thin">
              <span className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider mr-1 shrink-0">
                Popular:
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
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
                      isSelected
                        ? "bg-indigo-600 text-white shadow-lg shadow-indigo-500/30 border border-indigo-400/50"
                        : "bg-white/[0.04] text-slate-400 hover:text-white border border-white/[0.06] hover:bg-white/[0.08]"
                    }`}
                  >
                    {formatCompanyName(slug)}
                  </button>
                );
              })}
            </div>

            {/* Filter Row: Time Periods & Difficulties & Status */}
            <div className="pt-2 border-t border-white/[0.06] flex flex-wrap items-center justify-between gap-4">
              {/* Time Period Tabs */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
                <span className="text-[11px] font-bold text-slate-400 mr-2 shrink-0">Time Frame:</span>
                {PERIODS.map((p) => {
                  const isActive = selectedPeriod === p.value;
                  return (
                    <button
                      key={p.value}
                      onClick={() => {
                        setSelectedPeriod(p.value);
                        setLimit(100);
                      }}
                      className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all shrink-0 ${
                        isActive
                          ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/40"
                          : "bg-white/[0.02] text-slate-400 hover:text-slate-200 border border-transparent"
                      }`}
                    >
                      {p.label}
                    </button>
                  );
                })}
              </div>

              <div className="flex items-center gap-4 flex-wrap">
                {/* Difficulty Filter Tabs */}
                <div className="flex items-center gap-1.5">
                  <span className="text-[11px] font-bold text-slate-400 mr-2">Difficulty:</span>
                  {DIFFICULTIES.map((d) => {
                    const isActive = selectedDifficulty === d;
                    return (
                      <button
                        key={d}
                        onClick={() => setSelectedDifficulty(d)}
                        className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                          isActive
                            ? d === "Easy"
                              ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
                              : d === "Medium"
                              ? "bg-amber-500/20 text-amber-300 border border-amber-500/40"
                              : d === "Hard"
                              ? "bg-rose-500/20 text-rose-300 border border-rose-500/40"
                              : "bg-indigo-500/20 text-indigo-300 border border-indigo-500/40"
                            : "bg-white/[0.02] text-slate-400 hover:text-slate-200 border border-transparent"
                        }`}
                      >
                        {d}
                      </button>
                    );
                  })}
                </div>

                {/* Completion Status Filter (All / Unsolved / Completed) */}
                <div className="flex items-center gap-1.5 border-l border-white/[0.08] pl-3">
                  <span className="text-[11px] font-bold text-slate-400 mr-1">Status:</span>
                  {(["All", "Unsolved", "Completed"] as const).map((st) => {
                    const isActive = selectedStatus === st;
                    return (
                      <button
                        key={st}
                        onClick={() => setSelectedStatus(st)}
                        className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                          isActive
                            ? st === "Completed"
                              ? "bg-emerald-500/25 text-emerald-300 border border-emerald-500/40"
                              : st === "Unsolved"
                              ? "bg-indigo-500/25 text-indigo-300 border border-indigo-500/40"
                              : "bg-white/10 text-white border border-white/20"
                            : "bg-white/[0.02] text-slate-400 hover:text-slate-200 border border-transparent"
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

          {/* Progress Tracker Banner */}
          <div className="glass p-4 rounded-2xl border border-emerald-500/20 bg-gradient-to-r from-emerald-950/20 via-[#0d1424] to-indigo-950/20 flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3 w-full md:w-auto">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 flex items-center justify-center shrink-0">
                <Trophy className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-extrabold text-white flex items-center gap-2">
                  <span>{formatCompanyName(selectedCompany)} Progress Tracker</span>
                  <span className="text-xs font-bold text-emerald-400">
                    ({companySolvedCount} / {questions.length} Solved)
                  </span>
                </h4>
                <p className="text-xs text-slate-400 mt-0.5">
                  Check off questions to save your progress directly into Supabase DB.
                </p>
              </div>
            </div>

            {/* Animated Progress Bar */}
            <div className="w-full md:w-64 space-y-1.5">
              <div className="flex justify-between text-xs font-bold">
                <span className="text-slate-400">Completion</span>
                <span className="text-emerald-400">{companyProgressPercent}%</span>
              </div>
              <div className="w-full h-2 rounded-full bg-white/[0.08] overflow-hidden p-0.5">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-cyan-400 transition-all duration-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]"
                  style={{ width: `${companyProgressPercent}%` }}
                />
              </div>
            </div>
          </div>

          {/* Question List Table */}
          <div className="glass rounded-2xl p-6 border border-white/[0.08] space-y-4 shadow-2xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/[0.06] pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold">
                  <Building2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-extrabold text-white tracking-tight flex items-center gap-2">
                    <span>{formatCompanyName(selectedCompany)}</span>
                    <span className="text-xs font-mono px-2 py-0.5 rounded-md bg-indigo-950 text-indigo-300 border border-indigo-800">
                      {selectedCompany}
                    </span>
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Interview questions fetched from CSV dataset ({PERIODS.find((p) => p.value === selectedPeriod)?.label})
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 self-end sm:self-auto">
                {loadingQuestions ? (
                  <div className="flex items-center gap-2 text-xs text-indigo-400 font-bold">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Loading CSV data...</span>
                  </div>
                ) : (
                  <span className="text-xs text-slate-400 font-bold px-3 py-1.5 rounded-xl bg-white/[0.03] border border-white/[0.08]">
                    Showing <strong className="text-white">{filteredQuestions.length}</strong> of{" "}
                    <strong className="text-indigo-400">{totalCount}</strong> questions
                  </span>
                )}
              </div>
            </div>

            {/* Questions Table Body */}
            {loadingQuestions ? (
              <div className="py-16 text-center space-y-3">
                <Loader2 className="w-8 h-8 text-indigo-400 animate-spin mx-auto" />
                <p className="text-sm font-medium text-slate-400">
                  Parsing CSV question bank for {formatCompanyName(selectedCompany)}...
                </p>
              </div>
            ) : filteredQuestions.length === 0 ? (
              <div className="py-16 text-center space-y-3 bg-white/[0.01] rounded-xl border border-white/[0.04]">
                <Filter className="w-8 h-8 text-slate-600 mx-auto" />
                <h4 className="text-base font-bold text-white">No questions found</h4>
                <p className="text-xs text-slate-400 max-w-sm mx-auto">
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
                      className={`flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-xl border transition-all gap-4 group shadow-md ${
                        isDone
                          ? "bg-[#0a1816]/70 border-emerald-500/30"
                          : "bg-[#0c1220]/80 border-white/[0.06] hover:border-indigo-500/40 hover:bg-[#11192e]"
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
                          className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border transition-all cursor-pointer select-none shrink-0 ${
                            isDone
                              ? "bg-emerald-500/20 border-emerald-500/50 text-emerald-300 shadow-[0_0_12px_rgba(16,185,129,0.25)]"
                              : "bg-white/[0.02] border-white/[0.12] hover:border-slate-400 text-slate-400 hover:text-white"
                          }`}
                          title={isDone ? "Click to mark as incomplete" : "Click to mark as completed"}
                        >
                          {isDone ? (
                            <CheckSquare className="w-4 h-4 text-emerald-400 shrink-0" />
                          ) : (
                            <Square className="w-4 h-4 text-slate-500 shrink-0" />
                          )}
                          <span className="text-[11px] font-extrabold tracking-wide">
                            {isDone ? "Completed" : "Mark Solved"}
                          </span>
                        </button>

                        <div className="space-y-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-xs font-mono text-slate-500 font-bold">
                              #{q.id || idx + 1}
                            </span>
                            <a
                              href={leetCodeUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className={`text-sm font-bold transition-colors flex items-center gap-1.5 ${
                                isDone
                                  ? "text-slate-400 line-through"
                                  : "text-white group-hover:text-indigo-300"
                              }`}
                            >
                              <span>{q.title}</span>
                              <ExternalLink className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 text-indigo-400 transition-opacity" />
                            </a>

                            {isDone && (
                              <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                                <Check className="w-3 h-3" />
                                Solved
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between sm:justify-end gap-3.5 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-white/[0.04]">
                        {/* Acceptance Rate */}
                        {q.acceptance && (
                          <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-blue-500/10 text-blue-300 border border-blue-500/20">
                            {q.acceptance} Acc.
                          </span>
                        )}

                        {/* Frequency Rate */}
                        {q.frequency && (
                          <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-purple-500/10 text-purple-300 border border-purple-500/20">
                            {q.frequency} Freq.
                          </span>
                        )}

                        {/* Difficulty Badge */}
                        <span
                          className={`text-xs font-bold px-2.5 py-1 rounded-lg ${
                            q.difficulty === "Easy"
                              ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30"
                              : q.difficulty === "Medium"
                              ? "bg-amber-500/15 text-amber-400 border border-amber-500/30"
                              : "bg-rose-500/15 text-rose-400 border border-rose-500/30"
                          }`}
                        >
                          {q.difficulty}
                        </span>

                        {/* Solve Button */}
                        <a
                          href={leetCodeUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-600/30 hover:bg-indigo-600 text-indigo-200 hover:text-white border border-indigo-500/40 text-xs font-bold transition-all shadow-md"
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
    </motion.div>
  );
}
