"use client";

import React, { useState } from "react";
import { Target, CheckCircle2, Code2, Flame, Filter } from "lucide-react";
import { motion } from "framer-motion";

const problems = [
  { id: 1, title: "Two Sum", category: "Arrays & Hashing", difficulty: "Easy", status: "Solved" },
  { id: 2, title: "Valid Anagram", category: "Arrays & Hashing", difficulty: "Easy", status: "Solved" },
  { id: 3, title: "Group Anagrams", category: "Arrays & Hashing", difficulty: "Medium", status: "Solved" },
  { id: 4, title: "Top K Frequent Elements", category: "Arrays & Hashing", difficulty: "Medium", status: "Solved" },
  { id: 5, title: "Product of Array Except Self", category: "Arrays & Hashing", difficulty: "Medium", status: "Solved" },
  { id: 6, title: "Longest Consecutive Sequence", category: "Arrays & Hashing", difficulty: "Medium", status: "Todo" },
  { id: 7, title: "3Sum", category: "Two Pointers", difficulty: "Medium", status: "Todo" },
  { id: 8, title: "Container With Most Water", category: "Two Pointers", difficulty: "Medium", status: "Todo" },
];

const difficultyConfig: Record<string, string> = {
  Easy: "text-emerald-400 bg-emerald-500/10 border border-emerald-500/20",
  Medium: "text-amber-400 bg-amber-500/10 border border-amber-500/20",
  Hard: "text-rose-400 bg-rose-500/10 border border-rose-500/20",
};

const filters = ["All", "Easy", "Medium", "Hard"];

export default function PracticePage() {
  const [filter, setFilter] = useState("All");
  const filtered = filter === "All" ? problems : problems.filter((p) => p.difficulty === filter);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex flex-col md:flex-row md:items-center justify-between gap-4"
      >
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
            <Target className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">DSA & Coding Practice</h1>
            <p className="text-sm text-slate-400 mt-0.5">Track solved problems, accuracy, and your streak</p>
          </div>
        </div>

        {/* Filter tabs */}
        <div className="flex items-center gap-1 glass p-1 rounded-xl">
          <Filter className="w-3.5 h-3.5 text-slate-500 ml-2" />
          {filters.map((d) => (
            <button
              key={d}
              onClick={() => setFilter(d)}
              className={`px-3.5 py-2 rounded-lg text-xs font-bold transition-all ${
                filter === d
                  ? "bg-blue-600 text-white shadow-lg shadow-blue-500/25"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              {d}
            </button>
          ))}
        </div>
      </motion.div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { icon: <Code2 className="w-5 h-5 text-blue-400" />, value: "117", label: "Problems Solved", color: "#3b82f6", bg: "bg-blue-500/10 border-blue-500/20" },
          { icon: <CheckCircle2 className="w-5 h-5 text-emerald-400" />, value: "91%", label: "Success Rate", color: "#10b981", bg: "bg-emerald-500/10 border-emerald-500/20" },
          { icon: <Flame className="w-5 h-5 text-orange-400" />, value: "0", label: "Contests", color: "#f97316", bg: "bg-orange-500/10 border-orange-500/20" },
        ].map((item, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 + i * 0.08, duration: 0.4 }}
            whileHover={{ y: -3, transition: { duration: 0.2 } }}
            className="glass gradient-border rounded-2xl p-5 flex items-center gap-4"
          >
            <div className={`p-3 rounded-xl border ${item.bg}`}>{item.icon}</div>
            <div>
              <div className="text-3xl font-black text-white tracking-tight">{item.value}</div>
              <div className="text-xs font-semibold text-slate-400 mt-0.5">{item.label}</div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Problem table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.5 }}
        className="glass rounded-2xl p-6 overflow-hidden"
      >
        <h2 className="text-lg font-bold text-white mb-5">Target Problem Set</h2>
        <div className="space-y-1">
          {filtered.map((p, i) => (
            <motion.div
              key={p.id}
              initial={{ opacity: 0, x: -16 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.45 + i * 0.04, duration: 0.35 }}
              whileHover={{ x: 3, transition: { duration: 0.15 } }}
              className="flex items-center justify-between px-4 py-3.5 rounded-xl transition-all hover:bg-white/[0.03] cursor-pointer group"
            >
              <div className="flex items-center gap-3">
                <motion.span
                  className={`w-2 h-2 rounded-full shrink-0 ${
                    p.status === "Solved" ? "bg-emerald-400" : "bg-slate-600"
                  }`}
                  animate={p.status === "Solved" ? { scale: [1, 1.2, 1] } : {}}
                  transition={{ repeat: Infinity, duration: 2, delay: i * 0.3 }}
                />
                <span className="text-sm font-semibold text-slate-200 group-hover:text-white transition-colors">
                  {p.title}
                </span>
                <span className="text-xs text-slate-500 hidden md:inline">{p.category}</span>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <span className={`text-xs font-bold px-2.5 py-1 rounded-lg ${difficultyConfig[p.difficulty]}`}>
                  {p.difficulty}
                </span>
                <span
                  className={`text-xs font-semibold ${
                    p.status === "Solved" ? "text-emerald-400" : "text-slate-500"
                  }`}
                >
                  {p.status}
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
}

