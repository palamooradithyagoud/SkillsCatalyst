"use client";

import React, { useState } from "react";
import {
  Clock,
  Briefcase,
  ArrowRight,
  ArrowLeft,
  Search,
  Filter,
  CheckCircle2,
  Code2,
  Sparkles,
  Building2,
  Target,
  ExternalLink,
  Flame,
  Layers,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// Beginner Core Concept Modules Data
const BEGINNER_MODULES = [
  {
    id: "arrays-strings",
    title: "1. Arrays & Strings Fundamentals",
    description: "Memory contiguous allocation, 2-pointers, sliding window, and string manipulation.",
    problems: [
      { id: 1, title: "Two Sum", difficulty: "Easy", company: "Google / Amazon", status: "Solved" },
      { id: 2, title: "Valid Anagram", difficulty: "Easy", company: "Meta", status: "Solved" },
      { id: 3, title: "Container With Most Water", difficulty: "Medium", company: "Amazon", status: "Pending" },
      { id: 4, title: "Longest Substring Without Repeating Characters", difficulty: "Medium", company: "Microsoft", status: "Pending" },
    ],
  },
  {
    id: "linked-lists",
    title: "2. Linked Lists & Pointers",
    description: "Singly linked lists, doubly linked lists, Floyd's cycle detection, and reversal.",
    problems: [
      { id: 5, title: "Reverse Linked List", difficulty: "Easy", company: "Google", status: "Solved" },
      { id: 6, title: "Linked List Cycle", difficulty: "Easy", company: "Amazon", status: "Pending" },
      { id: 7, title: "Merge Two Sorted Lists", difficulty: "Easy", company: "Meta", status: "Pending" },
      { id: 8, title: "Reorder List", difficulty: "Medium", company: "Microsoft", status: "Pending" },
    ],
  },
  {
    id: "trees-graphs",
    title: "3. Trees & Graph Traversal",
    description: "Binary search trees, Depth-First Search (DFS), Breadth-First Search (BFS), and recursion.",
    problems: [
      { id: 9, title: "Invert Binary Tree", difficulty: "Easy", company: "Google", status: "Solved" },
      { id: 10, title: "Maximum Depth of Binary Tree", difficulty: "Easy", company: "Amazon", status: "Solved" },
      { id: 11, title: "Lowest Common Ancestor", difficulty: "Medium", company: "Meta", status: "Pending" },
      { id: 12, title: "Number of Islands", difficulty: "Medium", company: "Amazon / Microsoft", status: "Pending" },
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
  const [solvedState, setSolvedState] = useState<Record<number, boolean>>({
    1: true,
    2: true,
    5: true,
    9: true,
    10: true,
  });

  const toggleProblemSolved = (id: number) => {
    setSolvedState((prev) => ({ ...prev, [id]: !prev[id] }));
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
      {/* ── Main Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
            Practice & Problem Solving
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Choose your path to practice data structures & algorithms step-by-step or target top companies.
          </p>
        </div>

        {selectedMode !== "index" && (
          <button
            onClick={() => setSelectedMode("index")}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#131b2e] border border-white/[0.08] hover:border-slate-600 text-slate-300 hover:text-white font-medium text-sm transition-all shadow-md self-start md:self-auto"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Modes</span>
          </button>
        )}
      </div>

      {/* ── MODE SELECTION (MAIN CARDS GRID MATCHING SCREENSHOT) */}
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
            {/* Top Row: Icon + Badge */}
            <div className="space-y-5">
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center group-hover:scale-105 transition-transform">
                  <Clock className="w-6 h-6" />
                </div>
                <span className="px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-[10px] font-black tracking-widest uppercase">
                  FOUNDATIONS
                </span>
              </div>

              {/* Title & Description */}
              <div>
                <h3 className="text-xl md:text-2xl font-bold text-white mb-2 group-hover:text-indigo-300 transition-colors">
                  1. Beginner Level
                </h3>
                <p className="text-sm text-slate-400 font-normal leading-relaxed">
                  Master foundational data structures & algorithms concepts, core patterns, and time complexities.
                </p>
              </div>
            </div>

            {/* Bottom Row Action Bar */}
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
            {/* Top Row: Icon + Badge */}
            <div className="space-y-5">
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center group-hover:scale-105 transition-transform">
                  <Briefcase className="w-6 h-6" />
                </div>
                <span className="px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-[10px] font-black tracking-widest uppercase">
                  INTERVIEW PREP
                </span>
              </div>

              {/* Title & Description */}
              <div>
                <h3 className="text-xl md:text-2xl font-bold text-white mb-2 group-hover:text-indigo-300 transition-colors">
                  2. Company Wise Questions
                </h3>
                <p className="text-sm text-slate-400 font-normal leading-relaxed">
                  Explore LeetCode interview questions asked by top tech giants including Google, Amazon, Meta, Microsoft & 600+ companies.
                </p>
              </div>
            </div>

            {/* Bottom Row Action Bar */}
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

      {/* ── MODE 1: BEGINNER LEVEL CORE CONCEPT MODULES */}
      {selectedMode === "beginner" && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          <div className="glass rounded-2xl p-6 border border-emerald-500/30 bg-emerald-950/10">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-emerald-500/20 text-emerald-400">
                <Clock className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">Beginner Level DSA Modules</h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Step-by-step foundational modules with curated practice problem sets.
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            {BEGINNER_MODULES.map((module) => (
              <div key={module.id} className="glass rounded-2xl p-6 border border-white/[0.08] space-y-4">
                <div>
                  <h3 className="text-lg font-bold text-white">{module.title}</h3>
                  <p className="text-xs text-slate-400 mt-0.5">{module.description}</p>
                </div>

                <div className="space-y-2">
                  {module.problems.map((p) => {
                    const isDone = !!solvedState[p.id];
                    return (
                      <div
                        key={p.id}
                        onClick={() => toggleProblemSolved(p.id)}
                        className="flex items-center justify-between p-3.5 rounded-xl bg-white/[0.025] border border-white/[0.06] hover:border-slate-600 transition-all cursor-pointer group"
                      >
                        <div className="flex items-center gap-3">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleProblemSolved(p.id);
                            }}
                            className={`p-1 rounded-lg transition-colors ${
                              isDone ? "text-emerald-400 bg-emerald-500/20" : "text-slate-600 hover:text-slate-400"
                            }`}
                          >
                            <CheckCircle2 className="w-4 h-4" />
                          </button>
                          <span className={`text-sm font-semibold ${isDone ? "text-slate-400 line-through" : "text-white"}`}>
                            {p.title}
                          </span>
                        </div>

                        <div className="flex items-center gap-3">
                          <span className="text-xs text-slate-400 hidden sm:inline">{p.company}</span>
                          <span
                            className={`text-xs font-bold px-2.5 py-0.5 rounded-md ${
                              p.difficulty === "Easy"
                                ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30"
                                : "bg-amber-500/15 text-amber-400 border border-amber-500/30"
                            }`}
                          >
                            {p.difficulty}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
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
                const isDone = !!solvedState[q.id];
                return (
                  <div
                    key={q.id}
                    onClick={() => toggleProblemSolved(q.id)}
                    className="flex items-center justify-between p-4 rounded-xl bg-white/[0.025] border border-white/[0.06] hover:border-slate-600 transition-all cursor-pointer group"
                  >
                    <div className="flex items-center gap-3">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleProblemSolved(q.id);
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
    </motion.div>
  );
}
