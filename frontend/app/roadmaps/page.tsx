"use client";

import React, { useState } from "react";
import {
  Map, ChevronRight, CheckCircle2, Lock, Sparkles, Loader2,
  BrainCircuit, Layers, Code, Terminal, Check
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { generateRoadmap, RoadmapData } from "@/lib/api";

const PRESET_ROADMAPS: {
  title: string;
  progress: number;
  color: string;
  tiers: { tier: number; name: string; description: string; nodes: string[]; completed: boolean[] }[];
}[] = [
  {
    title: "Full-Stack Software Engineer",
    progress: 40,
    color: "#6366f1",
    tiers: [
      { tier: 1, name: "Primary Foundation", description: "Core web fundamentals and language syntax", nodes: ["HTML5 & Modern CSS", "TypeScript Essentials", "Git & Version Control"], completed: [true, true, true] },
      { tier: 2, name: "Fast Track Acceleration", description: "Frontend & Backend frameworks", nodes: ["React 19 & Next.js 16", "FastAPI & Python", "PostgreSQL & Supabase"], completed: [true, false, false] },
      { tier: 3, name: "Interview Preparation", description: "DSA problem solving & system design", nodes: ["Arrays & Hashing", "API Rate Limiting Design", "Database Indexing"], completed: [false, false, false] },
      { tier: 4, name: "Applied Capstone Project", description: "Production deployments", nodes: ["Full-Stack SaaS Platform", "CI/CD Pipeline"], completed: [false, false] },
      { tier: 5, name: "Advanced Architecture", description: "Scalability & performance", nodes: ["Microservices", "Redis Caching & Queue Workers"], completed: [false, false] },
    ],
  },
  {
    title: "Data Structures & Algorithms Mastery",
    progress: 55,
    color: "#10b981",
    tiers: [
      { tier: 1, name: "Primary Foundation", description: "Array & string fundamentals", nodes: ["Arrays & HashMaps", "Two Pointers", "Sliding Window"], completed: [true, true, true] },
      { tier: 2, name: "Fast Track Acceleration", description: "Linear data structures & recursion", nodes: ["Linked Lists", "Stacks & Queues", "Recursion & Backtracking"], completed: [true, true, false] },
      { tier: 3, name: "Interview Preparation", description: "Trees, graphs & DP pattern recognition", nodes: ["Binary Search Trees", "Graph BFS / DFS", "1D & 2D Dynamic Programming"], completed: [false, false, false] },
      { tier: 4, name: "Applied Capstone Project", description: "Blind-75 & LeetCode Hard sprints", nodes: ["Blind-75 Speedrun", "System Design Coding"], completed: [false, false] },
      { tier: 5, name: "Advanced Architecture", description: "Advanced graph & memory optimization", nodes: ["Trie Data Structure", "Segment Trees & Disjoint Sets"], completed: [false, false] },
    ],
  },
  {
    title: "AI & Machine Learning Engineer",
    progress: 20,
    color: "#a855f7",
    tiers: [
      { tier: 1, name: "Primary Foundation", description: "Python math & data analysis", nodes: ["Python for AI", "NumPy & Pandas", "Linear Algebra"], completed: [true, false, false] },
      { tier: 2, name: "Fast Track Acceleration", description: "Classical ML & Deep Learning", nodes: ["Scikit-Learn Classifiers", "PyTorch Fundamentals", "Convolutional Networks"], completed: [false, false, false] },
      { tier: 3, name: "Interview Preparation", description: "ML System Design & Transformer models", nodes: ["LLM Architecture", "RAG Pipeline Design", "Vector Embeddings"], completed: [false, false, false] },
      { tier: 4, name: "Applied Capstone Project", description: "AI Agents & Autonomous Workflows", nodes: ["Groq LLM Integration", "Agentic RAG Engine"], completed: [false, false] },
      { tier: 5, name: "Advanced Architecture", description: "Model fine-tuning & quantizations", nodes: ["LoRA / QLoRA Tuning", "vLLM Production Serving"], completed: [false, false] },
    ],
  },
];

export default function RoadmapsPage() {
  const [query, setQuery] = useState("");
  const [generating, setGenerating] = useState(false);
  const [customRoadmaps, setCustomRoadmaps] = useState<RoadmapData[]>([]);
  const [completedState, setCompletedState] = useState<Record<string, boolean>>({});

  const handleGenerate = async () => {
    if (!query.trim() || generating) return;
    setGenerating(true);
    const roadmap = await generateRoadmap(query.trim());
    if (roadmap) {
      setCustomRoadmaps((prev) => [roadmap, ...prev]);
      setQuery("");
    }
    setGenerating(false);
  };

  const toggleNode = (roadmapKey: string, nodeName: string) => {
    const key = `${roadmapKey}-${nodeName}`;
    setCompletedState((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const isNodeDone = (roadmapKey: string, nodeName: string, defaultDone: boolean) => {
    const key = `${roadmapKey}-${nodeName}`;
    return completedState[key] !== undefined ? completedState[key] : defaultDone;
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-6xl mx-auto space-y-8 pb-12">
      {/* ── Header */}
      <motion.div
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex flex-col md:flex-row md:items-center justify-between gap-4"
      >
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
            <Map className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">5-Tier AI Career Roadmaps</h1>
            <p className="text-sm text-slate-400 mt-0.5">
              Structured 5-level curriculum powered by Groq Llama-3.3 70B AI
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 px-3 py-1.5 glass rounded-full text-xs font-semibold text-purple-300 border border-purple-500/20">
          <BrainCircuit className="w-4 h-4 text-purple-400" />
          Tier 3 Resolution Active
        </div>
      </motion.div>

      {/* ── Search / Generator Input */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.4 }}
        className="glass p-5 rounded-2xl border border-white/[0.08]"
      >
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Sparkles className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleGenerate()}
              placeholder="Enter any tech target (e.g., Rust, System Design, DevOps, Flutter, AI Agents)..."
              className="input-glass w-full pl-11 pr-4 py-3 text-sm"
            />
          </div>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            onClick={handleGenerate}
            disabled={generating || !query.trim()}
            className="px-6 py-3 rounded-xl text-white font-bold text-sm flex items-center justify-center gap-2 whitespace-nowrap disabled:opacity-50"
            style={{
              background: "linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)",
              boxShadow: "0 4px 15px rgba(79,70,229,0.35)",
            }}
          >
            {generating ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" /> Generating Tier 1-5 Roadmap...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" /> Generate 5-Tier AI Roadmap
              </>
            )}
          </motion.button>
        </div>
      </motion.div>

      {/* ── Generated Custom Roadmaps */}
      <AnimatePresence>
        {customRoadmaps.map((r, rIdx) => (
          <motion.div
            key={`custom-${rIdx}`}
            initial={{ opacity: 0, scale: 0.96, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.4 }}
            className="glass gradient-border rounded-2xl p-6 relative overflow-hidden"
            style={{
              background: "linear-gradient(135deg, rgba(79,70,229,0.12) 0%, rgba(14,22,44,0.9) 100%)",
              borderColor: "rgba(99,102,241,0.35)",
            }}
          >
            <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-indigo-500/20 text-indigo-300 font-bold text-xs">
                  AI GENERATED
                </div>
                <h3 className="text-xl font-bold text-white">{r.title}</h3>
              </div>
              <span className="text-xs font-bold text-indigo-400 bg-indigo-950/60 border border-indigo-700/40 px-3 py-1 rounded-full">
                5-Tier Curriculum
              </span>
            </div>

            {/* Tiers List */}
            <div className="space-y-4 mt-6">
              {r.tiers.map((t) => (
                <div key={t.tier} className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-4">
                  <div className="flex items-center gap-2.5 mb-1.5">
                    <span className="text-xs font-bold text-indigo-400 bg-indigo-500/15 border border-indigo-500/30 px-2 py-0.5 rounded-lg">
                      TIER {t.tier}
                    </span>
                    <h4 className="text-base font-bold text-white">{t.name}</h4>
                  </div>
                  <p className="text-xs text-slate-400 mb-3">{t.description}</p>
                  <div className="flex flex-wrap items-center gap-2">
                    {t.nodes.map((n, nIdx) => {
                      const done = isNodeDone(r.title, n, false);
                      return (
                        <button
                          key={nIdx}
                          onClick={() => toggleNode(r.title, n)}
                          className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                            done
                              ? "text-emerald-300 bg-emerald-500/15 border-emerald-500/40"
                              : "text-slate-300 bg-slate-800/40 border-slate-700/50 hover:border-slate-500"
                          }`}
                        >
                          {done ? (
                            <Check className="w-3.5 h-3.5 text-emerald-400" />
                          ) : (
                            <div className="w-3 h-3 rounded-full border border-slate-500" />
                          )}
                          {n}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        ))}
      </AnimatePresence>

      {/* ── Preset Curated Roadmaps */}
      <div className="space-y-6">
        <h2 className="text-lg font-bold text-white flex items-center gap-2">
          <Layers className="w-5 h-5 text-indigo-400" /> Standard Career Track Roadmaps
        </h2>

        {PRESET_ROADMAPS.map((r, idx) => {
          const totalNodes = r.tiers.flatMap((t) => t.nodes);
          const doneNodesCount = totalNodes.filter((n) => isNodeDone(r.title, n, false)).length;
          const currentPct = Math.round((doneNodesCount / totalNodes.length) * 100) || r.progress;

          return (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 + idx * 0.1, duration: 0.5, ease: "easeOut" as const }}
              className="glass rounded-2xl p-6 border border-white/[0.08]"
            >
              {/* Header */}
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-xl font-bold text-white">{r.title}</h3>
                <span className="text-sm font-bold" style={{ color: r.color }}>
                  {currentPct}% Completed
                </span>
              </div>

              {/* Progress bar */}
              <div className="w-full bg-white/5 h-2 rounded-full mb-6 overflow-hidden">
                <motion.div
                  className="h-full rounded-full"
                  style={{ background: `linear-gradient(90deg, ${r.color}, ${r.color}90)` }}
                  initial={{ width: 0 }}
                  animate={{ width: `${currentPct}%` }}
                  transition={{ delay: 0.3 + idx * 0.1, duration: 0.8, ease: "easeOut" }}
                />
              </div>

              {/* 5-Tier Breakdown */}
              <div className="space-y-3">
                {r.tiers.map((t) => (
                  <div key={t.tier} className="p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.05]">
                    <div className="flex items-center gap-2.5 mb-2">
                      <span
                        className="text-[10px] font-bold px-2 py-0.5 rounded-md"
                        style={{ background: `${r.color}20`, color: r.color, border: `1px solid ${r.color}40` }}
                      >
                        TIER {t.tier}
                      </span>
                      <span className="text-sm font-bold text-white">{t.name}</span>
                      <span className="text-xs text-slate-500 font-normal hidden md:inline">• {t.description}</span>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      {t.nodes.map((node, nIdx) => {
                        const defaultDone = t.completed[nIdx] ?? false;
                        const done = isNodeDone(r.title, node, defaultDone);

                        return (
                          <motion.button
                            key={nIdx}
                            whileHover={{ scale: 1.03 }}
                            whileTap={{ scale: 0.97 }}
                            onClick={() => toggleNode(r.title, node)}
                            className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                              done
                                ? "text-white border-transparent"
                                : "text-slate-400 bg-white/[0.025] border-white/[0.06] hover:border-slate-500"
                            }`}
                            style={
                              done
                                ? {
                                    background: `${r.color}25`,
                                    borderColor: `${r.color}50`,
                                    color: "#ffffff",
                                  }
                                : {}
                            }
                          >
                            {done ? (
                              <CheckCircle2 className="w-3.5 h-3.5 shrink-0" style={{ color: r.color }} />
                            ) : (
                              <Lock className="w-3 h-3 text-slate-600 shrink-0" />
                            )}
                            <span>{node}</span>
                          </motion.button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}
