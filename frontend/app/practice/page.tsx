"use client";

import React, { useState } from "react";
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
} from "lucide-react";
import { motion } from "framer-motion";
import PracticeTopicDrawer from "@/components/PracticeTopicDrawer";

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

// Company Wise Question Bank Data
const COMPANY_QUESTIONS = [
  { id: 1, title: "Two Sum", company: "Google", difficulty: "Easy", topic: "Arrays & Hashing", acceptance: "52%" },
  { id: 2, title: "LRU Cache", company: "Google", difficulty: "Medium", topic: "Design & Hash", acceptance: "41%" },
  { id: 3, title: "Trapping Rain Water", company: "Google", difficulty: "Hard", topic: "Two Pointers", acceptance: "60%" },
  { id: 4, title: "Merge k Sorted Lists", company: "Amazon", difficulty: "Hard", topic: "Heap & Trees", acceptance: "51%" },
  { id: 5, title: "Course Schedule", company: "Amazon", difficulty: "Medium", topic: "Graph Topological Sort", acceptance: "47%" },
  { id: 6, title: "Number of Islands", company: "Amazon", difficulty: "Medium", topic: "BFS / DFS", acceptance: "58%" },
  { id: 7, title: "Subarray Sum Equals K", company: "Meta", difficulty: "Medium", topic: "Prefix Sum", acceptance: "44%" },
  { id: 8, title: "Valid Palindrome II", company: "Meta", difficulty: "Easy", topic: "Strings", acceptance: "40%" },
  { id: 9, title: "Serialize and Deserialize Binary Tree", company: "Meta", difficulty: "Hard", topic: "Trees & Design", acceptance: "56%" },
  { id: 10, title: "Design Search Autocomplete System", company: "Microsoft", difficulty: "Hard", topic: "Trie & Hash", acceptance: "48%" },
  { id: 11, title: "Reverse Nodes in k-Group", company: "Microsoft", difficulty: "Hard", topic: "Linked Lists", acceptance: "57%" },
  { id: 12, title: "Word Search II", company: "Microsoft", difficulty: "Hard", topic: "Trie & Backtracking", acceptance: "36%" },
];

const COMPANIES = ["All Giants", "Google", "Amazon", "Meta", "Microsoft"];

export default function PracticePage() {
  const [selectedMode, setSelectedMode] = useState<"index" | "beginner" | "company">("index");
  const [selectedCompany, setSelectedCompany] = useState("All Giants");
  const [searchQuery, setSearchQuery] = useState("");
  const [activePracticeTopic, setActivePracticeTopic] = useState<string | null>(null);

  const [solvedState, setSolvedState] = useState<Record<string, boolean>>({
    "two-pointers": true,
    "classic-bs": true,
  });

  const toggleSolved = (key: string) => {
    setSolvedState((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const filteredCompanyQuestions = COMPANY_QUESTIONS.filter((q) => {
    const matchesCompany = selectedCompany === "All Giants" || q.company === selectedCompany;
    const matchesSearch =
      q.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      q.topic.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCompany && matchesSearch;
  });

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
                Company Wise Questions — LeetCode Question Bank
              </h1>
              <p className="text-sm text-slate-400 mt-1">
                Explore interview questions asked by Google, Amazon, Meta, Microsoft & 600+ companies.
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
                  Explore LeetCode interview questions asked by top tech giants including Google, Amazon, Meta, Microsoft & 600+ companies.
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
          className="relative rounded-3xl p-6 sm:p-10 bg-[#070b14] border border-indigo-500/30 shadow-2xl overflow-hidden min-h-[580px]"
          style={{
            backgroundImage: "radial-gradient(rgba(99, 102, 241, 0.12) 1px, transparent 1px)",
            backgroundSize: "24px 24px",
          }}
        >
          {/* SVG Tree Connection Lines Overlay */}
          <svg className="hidden lg:block absolute inset-0 w-full h-full pointer-events-none z-0">
            <defs>
              <linearGradient id="cyanGlowGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#38bdf8" />
                <stop offset="50%" stopColor="#6366f1" />
                <stop offset="100%" stopColor="#818cf8" />
              </linearGradient>
              <filter id="svgGlowEffect" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="3" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>
            </defs>

            {/* Branching Bezier curves from Foundation center top to 4 column headers */}
            <path
              d="M 50% 80 C 50% 130, 12.5% 130, 12.5% 180"
              stroke="url(#cyanGlowGrad)"
              strokeWidth="2.5"
              fill="none"
              filter="url(#svgGlowEffect)"
            />
            <path
              d="M 50% 80 C 50% 130, 37.5% 130, 37.5% 180"
              stroke="url(#cyanGlowGrad)"
              strokeWidth="2.5"
              fill="none"
              filter="url(#svgGlowEffect)"
            />
            <path
              d="M 50% 80 C 50% 130, 62.5% 130, 62.5% 180"
              stroke="url(#cyanGlowGrad)"
              strokeWidth="2.5"
              fill="none"
              filter="url(#svgGlowEffect)"
            />
            <path
              d="M 50% 80 C 50% 130, 87.5% 130, 87.5% 180"
              stroke="url(#cyanGlowGrad)"
              strokeWidth="2.5"
              fill="none"
              filter="url(#svgGlowEffect)"
            />
          </svg>

          {/* Top Foundation Root Node */}
          <div className="flex flex-col items-center justify-center relative z-10 mb-14">
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="px-8 py-3.5 rounded-2xl text-white font-black text-lg flex items-center gap-2.5 shadow-2xl border border-cyan-300/40 cursor-pointer"
              style={{
                background: "linear-gradient(135deg, #0284c7 0%, #2563eb 50%, #3b82f6 100%)",
                boxShadow: "0 0 35px rgba(2, 132, 199, 0.5), 0 0 15px rgba(59, 130, 246, 0.4)",
              }}
            >
              <Layers className="w-5 h-5 text-cyan-200" />
              <span>Foundation</span>
            </motion.div>
          </div>

          {/* 4 Category Columns Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 relative z-10">
            {BEGINNER_TREE_DATA.map((cat) => {
              const CategoryIcon = cat.icon;

              return (
                <div key={cat.id} className="space-y-4 flex flex-col items-center">
                  {/* Category Header Node */}
                  <motion.div
                    whileHover={{ scale: 1.03 }}
                    className="w-full py-3.5 px-5 rounded-2xl bg-[#12192e] border border-indigo-500/50 text-white font-extrabold text-sm flex items-center justify-center gap-2 shadow-xl shadow-indigo-500/10 cursor-pointer"
                  >
                    <CategoryIcon className="w-4.5 h-4.5 text-indigo-400" />
                    <span>{cat.title}</span>
                  </motion.div>

                  {/* Vertical Connector Line under Category Header */}
                  <div className="flex flex-col items-center">
                    <div className="w-0.5 h-4 bg-gradient-to-b from-indigo-500 to-cyan-400 shadow-[0_0_8px_#38bdf8]" />
                    <div className="w-1.5 h-1.5 rounded-full bg-cyan-300 shadow-[0_0_6px_#38bdf8]" />
                  </div>

                  {/* Sub-nodes Vertical Flow */}
                  <div className="w-full space-y-3">
                    {cat.nodes.map((node, nIdx) => {
                      const NodeIcon = node.icon;
                      const isDone = !!solvedState[node.id];

                      return (
                        <React.Fragment key={node.id}>
                          {nIdx > 0 && (
                            <div className="flex flex-col items-center -my-1">
                              <div className="w-0.5 h-3 bg-indigo-500/40" />
                              <div className="w-1 h-1 rounded-full bg-indigo-400" />
                            </div>
                          )}

                          <motion.button
                            whileHover={{ scale: 1.03, y: -2 }}
                            whileTap={{ scale: 0.97 }}
                            onClick={() => setActivePracticeTopic(node.title)}
                            className={`w-full py-3 px-4 rounded-2xl text-xs font-bold border transition-all duration-200 flex items-center justify-center gap-2.5 shadow-md ${
                              isDone
                                ? "bg-indigo-900/30 border-indigo-500 text-white shadow-indigo-500/20"
                                : "bg-[#111728] border-white/[0.08] hover:border-indigo-500/50 text-slate-200 hover:text-white"
                            }`}
                          >
                            <NodeIcon className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                            <span>{node.title}</span>
                          </motion.button>
                        </React.Fragment>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>
      )}

      {/* ── MODE 2: COMPANY WISE QUESTION BANK */}
      {selectedMode === "company" && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {/* Company Filters & Search Bar */}
          <div className="glass p-5 rounded-2xl border border-white/[0.08] flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto">
              <span className="text-xs font-bold text-slate-400 mr-2 shrink-0">Company:</span>
              {COMPANIES.map((company) => (
                <button
                  key={company}
                  onClick={() => setSelectedCompany(company)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
                    selectedCompany === company
                      ? "bg-indigo-600 text-white shadow-lg shadow-indigo-500/25"
                      : "bg-white/[0.04] text-slate-400 hover:text-white border border-white/[0.06]"
                  }`}
                >
                  {company}
                </button>
              ))}
            </div>

            <div className="relative w-full md:w-72">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search LeetCode question..."
                className="input-glass w-full pl-10 pr-4 py-2 text-xs rounded-xl"
              />
            </div>
          </div>

          {/* Question List Table */}
          <div className="glass rounded-2xl p-6 border border-white/[0.08] space-y-3">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Building2 className="w-5 h-5 text-indigo-400" />
                {selectedCompany} Targeted LeetCode Problem Set
              </h3>
              <span className="text-xs text-slate-400 font-medium">
                {filteredCompanyQuestions.length} Questions Available
              </span>
            </div>

            <div className="space-y-2">
              {filteredCompanyQuestions.map((q) => {
                const isDone = !!solvedState[q.id.toString()];
                return (
                  <div
                    key={q.id}
                    onClick={() => toggleSolved(q.id.toString())}
                    className="flex items-center justify-between p-4 rounded-xl bg-white/[0.025] border border-white/[0.06] hover:border-slate-600 transition-all cursor-pointer group"
                  >
                    <div className="flex items-center gap-3">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleSolved(q.id.toString());
                        }}
                        className={`p-1 rounded-lg transition-colors ${
                          isDone ? "text-emerald-400 bg-emerald-500/20" : "text-slate-600 hover:text-slate-400"
                        }`}
                      >
                        <CheckCircle2 className="w-4 h-4" />
                      </button>

                      <div>
                        <div className={`text-sm font-bold ${isDone ? "text-slate-400 line-through" : "text-white group-hover:text-indigo-300"}`}>
                          {q.title}
                        </div>
                        <div className="text-xs text-slate-500 mt-0.5">{q.topic}</div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
                        {q.company}
                      </span>
                      <span className="text-xs text-slate-400 hidden sm:inline">{q.acceptance} Acc.</span>
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
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </motion.div>
      )}

      {/* Practice Topic Detail Drawer Overlay matching target screenshot */}
      <PracticeTopicDrawer
        isOpen={!!activePracticeTopic}
        onClose={() => setActivePracticeTopic(null)}
        topicName={activePracticeTopic || ""}
      />
    </motion.div>
  );
}
