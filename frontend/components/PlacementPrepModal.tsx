"use client";

import React, { useState, useEffect } from "react";
import {
  X,
  Calculator,
  Brain,
  MessageSquare,
  FileCheck2,
  ChevronRight,
  Sparkles,
  BarChart3,
  Award,
  CheckCircle2,
  Play,
  Layers,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface PlacementPrepModalProps {
  isOpen: boolean;
  onClose: () => void;
}

// Exact dataset hierarchy requested by the user
const PLACEMENT_PREP_DATA = {
  aptitude: [
    {
      category: "Quantitative Aptitude",
      icon: Calculator,
      color: "from-blue-500/20 to-indigo-500/10",
      borderColor: "border-blue-500/30",
      iconColor: "text-blue-400",
      topics: [
        { name: "Percentages", count: "45 Questions", status: "Ready" },
        { name: "Profit & Loss", count: "38 Questions", status: "Ready" },
        { name: "Time & Work", count: "42 Questions", status: "Ready" },
        { name: "Time, Speed & Distance", count: "50 Questions", status: "Ready" },
        { name: "Probability", count: "30 Questions", status: "Ready" },
        { name: "Permutations & Combinations", count: "35 Questions", status: "Ready" },
      ],
    },
    {
      category: "Logical Reasoning",
      icon: Brain,
      color: "from-purple-500/20 to-violet-500/10",
      borderColor: "border-purple-500/30",
      iconColor: "text-purple-400",
      topics: [
        { name: "Blood Relations", count: "28 Questions", status: "Ready" },
        { name: "Seating Arrangement", count: "34 Questions", status: "Ready" },
        { name: "Coding-Decoding", count: "40 Questions", status: "Ready" },
        { name: "Syllogisms", count: "25 Questions", status: "Ready" },
        { name: "Puzzles", count: "32 Questions", status: "Ready" },
      ],
    },
    {
      category: "Verbal Ability",
      icon: MessageSquare,
      color: "from-emerald-500/20 to-teal-500/10",
      borderColor: "border-emerald-500/30",
      iconColor: "text-emerald-400",
      topics: [
        { name: "Grammar", count: "60 Questions", status: "Ready" },
        { name: "Reading Comprehension", count: "20 Passages", status: "Ready" },
        { name: "Vocabulary", count: "100+ Words", status: "Ready" },
        { name: "Sentence Correction", count: "45 Questions", status: "Ready" },
      ],
    },
  ],
  mockTests: [
    {
      category: "Topic-wise Tests",
      icon: Layers,
      color: "from-amber-500/20 to-orange-500/10",
      borderColor: "border-amber-500/30",
      iconColor: "text-amber-400",
      tests: [
        { name: "Quantitative Mastery Test", duration: "30 mins", count: "25 Qs" },
        { name: "Logical Reasoning Sprint", duration: "25 mins", count: "20 Qs" },
        { name: "Verbal Proficiency Quiz", duration: "20 mins", count: "20 Qs" },
      ],
    },
    {
      category: "Full-Length Tests",
      icon: FileCheck2,
      color: "from-cyan-500/20 to-blue-500/10",
      borderColor: "border-cyan-500/30",
      iconColor: "text-cyan-400",
      tests: [
        { name: "TCS NQT Full Mock", duration: "90 mins", count: "80 Qs" },
        { name: "Infosys Pseudo-code & Aptitude", duration: "75 mins", count: "65 Qs" },
        { name: "Product Company General Aptitude", duration: "60 mins", count: "50 Qs" },
      ],
    },
    {
      category: "AI Performance Analysis",
      icon: BarChart3,
      color: "from-rose-500/20 to-pink-500/10",
      borderColor: "border-rose-500/30",
      iconColor: "text-rose-400",
      tests: [
        { name: "Speed & Accuracy Diagnostic", duration: "AI Realtime", count: "Analytics" },
        { name: "Weak Pattern Breakdown", duration: "Live Scan", count: "Report" },
        { name: "Percentile & Benchmark Rank", duration: "Global", count: "Leaderboard" },
      ],
    },
  ],
};

export default function PlacementPrepModal({ isOpen, onClose }: PlacementPrepModalProps) {
  const [activeTab, setActiveTab] = useState<"aptitude" | "mockTests">("aptitude");
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) {
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed top-0 bottom-0 right-0 left-0 lg:left-64 z-40 bg-[#070b16] select-none overflow-hidden flex flex-col border-l border-white/[0.08] shadow-2xl">
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.98 }}
          transition={{ duration: 0.2 }}
          className="bg-[#0a0f1d] w-full h-full flex flex-col overflow-hidden"
        >
          {/* Header Bar */}
          <div className="p-6 border-b border-white/[0.08] bg-[#0d1424] flex items-center justify-between gap-4 shrink-0">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-2xl bg-purple-500/15 border border-purple-500/30 text-purple-400">
                <Award className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-xl font-extrabold text-white tracking-tight">
                  Placement Preparation
                </h2>
                <p className="text-xs text-slate-400">
                  Comprehensive Aptitude, Reasoning, Verbal &amp; Mock Test Suite
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition-all border border-white/10 shadow-md"
            >
              <span>Close Prep Suite (ESC)</span>
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Navigation Tabs */}
          <div className="px-6 pt-4 pb-2 border-b border-white/[0.06] bg-[#090d19] flex items-center gap-3 shrink-0">
            <button
              onClick={() => setActiveTab("aptitude")}
              className={`px-5 py-2.5 rounded-xl font-extrabold text-xs transition-all flex items-center gap-2 ${
                activeTab === "aptitude"
                  ? "bg-purple-600 text-white shadow-lg shadow-purple-600/30 border border-purple-400/40"
                  : "bg-white/[0.03] text-slate-400 hover:text-white hover:bg-white/[0.08]"
              }`}
            >
              <Brain className="w-4 h-4" />
              <span>Aptitude &amp; Reasoning</span>
            </button>

            <button
              onClick={() => setActiveTab("mockTests")}
              className={`px-5 py-2.5 rounded-xl font-extrabold text-xs transition-all flex items-center gap-2 ${
                activeTab === "mockTests"
                  ? "bg-purple-600 text-white shadow-lg shadow-purple-600/30 border border-purple-400/40"
                  : "bg-white/[0.03] text-slate-400 hover:text-white hover:bg-white/[0.08]"
              }`}
            >
              <FileCheck2 className="w-4 h-4" />
              <span>Mock Tests</span>
            </button>
          </div>

          {/* Content Body */}
          <div className="p-6 md:p-8 overflow-y-auto flex-1 space-y-6">
            {activeTab === "aptitude" && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {PLACEMENT_PREP_DATA.aptitude.map((section, idx) => {
                  const Icon = section.icon;
                  return (
                    <motion.div
                      key={section.category}
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.1 }}
                      className={`p-6 rounded-2xl bg-gradient-to-b ${section.color} border ${section.borderColor} flex flex-col justify-between shadow-xl`}
                    >
                      <div>
                        <div className="flex items-center justify-between mb-4">
                          <div className={`p-2.5 rounded-xl bg-white/10 ${section.iconColor}`}>
                            <Icon className="w-5 h-5" />
                          </div>
                          <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full bg-white/10 text-slate-300">
                            {section.topics.length} Topics
                          </span>
                        </div>

                        <h3 className="text-lg font-extrabold text-white mb-4">
                          {section.category}
                        </h3>

                        <div className="space-y-2">
                          {section.topics.map((t) => (
                            <div
                              key={t.name}
                              onClick={() => setSelectedTopic(t.name)}
                              className="p-3 rounded-xl bg-slate-900/60 border border-white/[0.06] hover:border-purple-500/40 transition-all flex items-center justify-between group cursor-pointer"
                            >
                              <div className="flex items-center gap-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-purple-400 group-hover:scale-125 transition-transform" />
                                <span className="text-xs font-bold text-slate-200 group-hover:text-white">
                                  {t.name}
                                </span>
                              </div>
                              <span className="text-[10px] font-bold text-slate-500">
                                {t.count}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="mt-6 pt-4 border-t border-white/[0.06] flex items-center justify-between text-xs font-bold text-purple-400">
                        <span>Practice Module</span>
                        <ChevronRight className="w-4 h-4" />
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}

            {activeTab === "mockTests" && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {PLACEMENT_PREP_DATA.mockTests.map((section, idx) => {
                  const Icon = section.icon;
                  return (
                    <motion.div
                      key={section.category}
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.1 }}
                      className={`p-6 rounded-2xl bg-gradient-to-b ${section.color} border ${section.borderColor} flex flex-col justify-between shadow-xl`}
                    >
                      <div>
                        <div className="flex items-center justify-between mb-4">
                          <div className={`p-2.5 rounded-xl bg-white/10 ${section.iconColor}`}>
                            <Icon className="w-5 h-5" />
                          </div>
                          <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full bg-white/10 text-slate-300">
                            {section.tests.length} Suites
                          </span>
                        </div>

                        <h3 className="text-lg font-extrabold text-white mb-4">
                          {section.category}
                        </h3>

                        <div className="space-y-2.5">
                          {section.tests.map((test) => (
                            <div
                              key={test.name}
                              className="p-3.5 rounded-xl bg-slate-900/60 border border-white/[0.06] hover:border-cyan-500/40 transition-all space-y-1 group cursor-pointer"
                            >
                              <div className="flex items-center justify-between">
                                <span className="text-xs font-bold text-slate-200 group-hover:text-white">
                                  {test.name}
                                </span>
                                <span className="text-[10px] font-extrabold px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                                  {test.duration}
                                </span>
                              </div>
                              <div className="text-[11px] text-slate-500 flex items-center justify-between">
                                <span>{test.count}</span>
                                <span className="text-cyan-400 group-hover:underline">Start Test →</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="mt-6 pt-4 border-t border-white/[0.06] flex items-center justify-between text-xs font-bold text-cyan-400">
                        <span>Evaluation Mode</span>
                        <ChevronRight className="w-4 h-4" />
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
