"use client";

import React, { useState, useEffect } from "react";
import {
  X,
  Calculator,
  Brain,
  MessageSquare,
  FileCheck2,
  ChevronRight,
  ChevronLeft,
  Award,
  CheckCircle2,
  XCircle,
  Clock,
  RefreshCw,
  Layers,
  BarChart3,
  ArrowLeft,
  Lightbulb,
  Check,
  Zap,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { PERCENTAGES_QUESTIONS, PlacementQuestion, QUANTITATIVE_APTITUDE_MAP } from "@/data/aptitudeQuestions";
import { supabase } from "@/lib/supabase";

const TOPIC_ID_MAP: Record<string, number> = {
  "Percentages": 1,
  "Profit & Loss": 2,
  "Time & Work": 3,
  "Time, Speed & Distance": 4,
  "Probability": 5,
  "Permutations & Combinations": 6,
};

interface PlacementPrepModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const PLACEMENT_PREP_DATA = {
  aptitude: [
    {
      category: "Quantitative Aptitude",
      icon: Calculator,
      color: "from-blue-500/20 to-indigo-500/10",
      borderColor: "border-blue-500/30",
      iconColor: "text-blue-400",
      topics: [
        { name: "Percentages", count: "41 Questions & Solutions", status: "Ready" },
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

  // Practice State
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [userAnswers, setUserAnswers] = useState<Record<number, number>>({});
  const [questionTimes, setQuestionTimes] = useState<Record<number, number>>({});
  const [showCorrectOptionMap, setShowCorrectOptionMap] = useState<Record<number, boolean>>({});
  const [showSolutionMap, setShowSolutionMap] = useState<Record<number, boolean>>({});
  const [practiceViewMode, setPracticeViewMode] = useState<"card" | "sheet">("card");
  const [quizFinished, setQuizFinished] = useState<boolean>(false);

  // Per-Question Stopwatch (Unlimited timer - counts up time spent on current question)
  const [questionTimerSeconds, setQuestionTimerSeconds] = useState<number>(0);

  useEffect(() => {
    if (!selectedTopic || quizFinished) return;
    setQuestionTimerSeconds(0);
    const interval = setInterval(() => {
      setQuestionTimerSeconds((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [selectedTopic, currentIndex, quizFinished]);

  const formatTimer = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  // Escape key handler
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !selectedTopic) onClose();
    };
    if (isOpen) {
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose, selectedTopic]);

  // Questions for current topic (Dynamic lookup for all Quantitative Aptitude topics)
  const questionsList: PlacementQuestion[] =
    selectedTopic && QUANTITATIVE_APTITUDE_MAP[selectedTopic]
      ? QUANTITATIVE_APTITUDE_MAP[selectedTopic]
      : PERCENTAGES_QUESTIONS;

  const startTopicQuiz = (topicName: string) => {
    setSelectedTopic(topicName);
    setCurrentIndex(0);
    setUserAnswers({});
    setQuestionTimes({});
    setShowCorrectOptionMap({});
    setShowSolutionMap({});
    setPracticeViewMode("card");
    setQuestionTimerSeconds(0);
    setQuizFinished(false);
  };

  // Load saved progress from LocalStorage & Supabase whenever selectedTopic changes
  useEffect(() => {
    if (!selectedTopic) return;

    // 1. Load from LocalStorage immediately for instant UI responsiveness
    try {
      const storageKey = `skillscatalyst_aptitude_progress_${selectedTopic}`;
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.userAnswers) setUserAnswers(parsed.userAnswers);
        if (parsed.questionTimes) setQuestionTimes(parsed.questionTimes);
      }
    } catch (e) {
      console.warn("Failed to load local topic progress:", e);
    }

    // 2. Sync from Supabase DB / Backend API
    const syncDatabaseProgress = async () => {
      try {
        const { data: authData } = await supabase.auth.getUser();
        const userId = authData.user?.id;
        if (!userId) return;

        const topicId = TOPIC_ID_MAP[selectedTopic] || 1;
        const { data, error } = await supabase
          .from("user_aptitude_attempts")
          .select("question_id, selected_option_index, time_taken_seconds")
          .eq("user_id", userId)
          .eq("topic_id", topicId);

        if (data && data.length > 0) {
          const dbAnswers: Record<number, number> = {};
          const dbTimes: Record<number, number> = {};
          data.forEach((row: any) => {
            dbAnswers[row.question_id] = row.selected_option_index;
            dbTimes[row.question_id] = row.time_taken_seconds || 0;
          });
          setUserAnswers((prev) => ({ ...dbAnswers, ...prev }));
          setQuestionTimes((prev) => ({ ...dbTimes, ...prev }));
        }
      } catch (err) {
        console.warn("Failed to sync database attempts:", err);
      }
    };

    syncDatabaseProgress();
  }, [selectedTopic]);

  // Helper to persist attempt to LocalStorage and Database
  const persistAttempt = async (
    topicName: string,
    questionId: number,
    optionIdx: number,
    isCorrect: boolean,
    timeSpentSec: number,
    updatedAnswers: Record<number, number>,
    updatedTimes: Record<number, number>
  ) => {
    // 1. LocalStorage
    try {
      const storageKey = `skillscatalyst_aptitude_progress_${topicName}`;
      localStorage.setItem(
        storageKey,
        JSON.stringify({ userAnswers: updatedAnswers, questionTimes: updatedTimes })
      );
    } catch (e) {
      console.warn("Failed to update localStorage:", e);
    }

    // 2. Backend API & Supabase DB Table
    try {
      const { data: authData } = await supabase.auth.getUser();
      const userId = authData.user?.id || "guest_user";
      const topicId = TOPIC_ID_MAP[topicName] || 1;

      fetch("/api/practice/attempt", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: userId,
          topic_id: topicId,
          question_id: questionId,
          selected_option_index: optionIdx,
          is_correct: isCorrect,
          time_taken_seconds: timeSpentSec,
        }),
      }).catch(() => {});

      if (authData.user?.id) {
        await supabase.from("user_aptitude_attempts").upsert(
          {
            user_id: authData.user.id,
            topic_id: topicId,
            question_id: questionId,
            selected_option_index: optionIdx,
            is_correct: isCorrect,
            time_taken_seconds: timeSpentSec,
            attempted_at: new Date().toISOString(),
          },
          { onConflict: "user_id,question_id" }
        );
      }
    } catch (err) {
      console.warn("Database persist warning:", err);
    }
  };

  const handleSelectOption = (questionId: number, optionIdx: number) => {
    if (quizFinished || userAnswers[questionId] !== undefined) return;
    const timeSpent = questionTimes[questionId] !== undefined ? questionTimes[questionId] : questionTimerSeconds;
    const isCorrect = currentQ ? optionIdx === currentQ.correctIndex : false;

    const newAnswers = { ...userAnswers, [questionId]: optionIdx };
    const newTimes = { ...questionTimes, [questionId]: timeSpent };

    setUserAnswers(newAnswers);
    setQuestionTimes(newTimes);

    if (selectedTopic) {
      persistAttempt(selectedTopic, questionId, optionIdx, isCorrect, timeSpent, newAnswers, newTimes);
    }
  };

  const handleRetryQuestion = async (questionId: number) => {
    const newAnswers = { ...userAnswers };
    delete newAnswers[questionId];

    const newTimes = { ...questionTimes };
    delete newTimes[questionId];

    setUserAnswers(newAnswers);
    setQuestionTimes(newTimes);
    setQuestionTimerSeconds(0);

    if (selectedTopic) {
      try {
        const storageKey = `skillscatalyst_aptitude_progress_${selectedTopic}`;
        localStorage.setItem(
          storageKey,
          JSON.stringify({ userAnswers: newAnswers, questionTimes: newTimes })
        );
      } catch {}

      try {
        const { data: authData } = await supabase.auth.getUser();
        if (authData.user?.id) {
          await supabase
            .from("user_aptitude_attempts")
            .delete()
            .eq("user_id", authData.user.id)
            .eq("question_id", questionId);
        }
      } catch {}
    }
  };

  const toggleCorrectOption = (questionId: number) => {
    setShowCorrectOptionMap((prev) => ({
      ...prev,
      [questionId]: !prev[questionId],
    }));
  };

  const toggleSolution = (questionId: number) => {
    setShowSolutionMap((prev) => ({
      ...prev,
      [questionId]: !prev[questionId],
    }));
  };

  const handleRestartQuiz = () => {
    setUserAnswers({});
    setQuestionTimes({});
    setShowCorrectOptionMap({});
    setShowSolutionMap({});
    setCurrentIndex(0);
    setQuestionTimerSeconds(0);
    setQuizFinished(false);
  };

  const currentQ = questionsList[currentIndex];

  // Calculated Metrics
  const totalQuestions = questionsList.length;
  const answeredCount = Object.keys(userAnswers).length;
  const correctCount = questionsList.reduce((acc, q) => {
    return userAnswers[q.id] === q.correctIndex ? acc + 1 : acc;
  }, 0);
  const accuracyPercent = answeredCount > 0 ? Math.round((correctCount / answeredCount) * 100) : 0;
  const progressPercent = totalQuestions > 0 ? Math.round(((currentIndex + 1) / totalQuestions) * 100) : 0;
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
          <div className="p-5 border-b border-white/[0.08] bg-[#0d1424] flex items-center justify-between gap-4 shrink-0">
            <div className="flex items-center gap-3">
              {selectedTopic ? (
                <button
                  onClick={() => setSelectedTopic(null)}
                  className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-all flex items-center gap-1.5 text-xs font-bold"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Back to Topics</span>
                </button>
              ) : (
                <div className="p-2.5 rounded-2xl bg-purple-500/15 border border-purple-500/30 text-purple-400">
                  <Award className="w-6 h-6" />
                </div>
              )}
              <div>
                <h2 className="text-xl font-extrabold text-white tracking-tight">
                  {selectedTopic ? `${selectedTopic} Practice Module` : "Placement Preparation"}
                </h2>
                <p className="text-xs text-slate-400">
                  {selectedTopic
                    ? `Practice Mode • ${totalQuestions} Questions with Step-by-Step Solutions`
                    : "Comprehensive Aptitude, Reasoning, Verbal & Mock Test Suite"}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {/* Practice View Switcher */}
              {selectedTopic && !quizFinished && (
                <div className="flex items-center gap-1.5 bg-slate-900/90 p-1 rounded-xl border border-white/10 text-xs font-bold">
                  <button
                    onClick={() => setPracticeViewMode("card")}
                    className={`px-3 py-1.5 rounded-lg transition-all ${
                      practiceViewMode === "card"
                        ? "bg-purple-600 text-white font-extrabold shadow"
                        : "text-slate-400 hover:text-white"
                    }`}
                  >
                    Single Question
                  </button>
                  <button
                    onClick={() => setPracticeViewMode("sheet")}
                    className={`px-3 py-1.5 rounded-lg transition-all ${
                      practiceViewMode === "sheet"
                        ? "bg-purple-600 text-white font-extrabold shadow"
                        : "text-slate-400 hover:text-white"
                    }`}
                  >
                    Full Practice Sheet
                  </button>
                </div>
              )}

              <button
                onClick={onClose}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition-all border border-white/10 shadow-md"
              >
                <span>Close (ESC)</span>
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Main Topic Selection View */}
          {!selectedTopic && (
            <>
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
                                  onClick={() => startTopicQuiz(t.name)}
                                  className="p-3 rounded-xl bg-slate-900/60 border border-white/[0.06] hover:border-purple-500/40 transition-all flex items-center justify-between group cursor-pointer"
                                >
                                  <div className="flex items-center gap-2">
                                    <span className="w-1.5 h-1.5 rounded-full bg-purple-400 group-hover:scale-125 transition-transform" />
                                    <span className="text-xs font-bold text-slate-200 group-hover:text-white">
                                      {t.name}
                                    </span>
                                  </div>
                                  <span className="text-[10px] font-bold text-purple-300 bg-purple-500/20 px-2 py-0.5 rounded border border-purple-500/30">
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
            </>
          )}

          {/* Topic Practice Suite View */}
          {selectedTopic && (
            <div className="flex-1 flex flex-col overflow-hidden">
              {/* If Practice is NOT finished */}
              {!quizFinished && (
                <>
                  {/* Mode A: Single Question Interactive View */}
                  {practiceViewMode === "card" && currentQ && (
                    <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
                      {/* Left Main Question Column */}
                      <div className="flex-1 p-6 md:p-8 overflow-y-auto flex flex-col justify-between space-y-6">
                        <div>
                          {/* Top Practice Progress Bar & Stopwatch */}
                          <div className="space-y-2 mb-6">
                            <div className="flex flex-wrap items-center justify-between gap-2 text-xs font-bold text-slate-400">
                              <span>Question {currentIndex + 1} of {totalQuestions}</span>
                              <div className="flex items-center gap-3">
                                <span className="flex items-center gap-1.5 text-amber-300 bg-amber-500/15 px-3 py-1 rounded-full border border-amber-500/30 font-extrabold text-xs shadow-sm">
                                  <Clock className="w-3.5 h-3.5 text-amber-400" />
                                  <span>Time Spent: {formatTimer(questionTimerSeconds)}</span>
                                </span>
                                <span className="text-purple-400 font-extrabold">Practiced: {answeredCount} / {totalQuestions}</span>
                              </div>
                            </div>
                            <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                              <motion.div
                                className="h-full bg-gradient-to-r from-blue-500 via-purple-500 to-emerald-400 rounded-full"
                                initial={{ width: 0 }}
                                animate={{ width: `${progressPercent}%` }}
                                transition={{ duration: 0.3 }}
                              />
                            </div>
                          </div>

                          {/* Question Text Box */}
                          <div className="glass p-6 rounded-2xl border border-white/10 mb-6 bg-slate-900/60 shadow-xl relative">
                            <div className="absolute -top-3 left-6 px-3 py-0.5 rounded-full bg-purple-600/30 border border-purple-500/40 text-[10px] font-extrabold text-purple-300 tracking-wider uppercase">
                              Practice Problem #{currentIndex + 1}
                            </div>
                            <h3 className="text-base sm:text-lg font-bold text-white leading-relaxed pt-1">
                              {currentQ.question}
                            </h3>
                          </div>

                          {/* Options Grid */}
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
                            {currentQ.options.map((opt, optIdx) => {
                              const isSelected = userAnswers[currentQ.id] === optIdx;
                              const isCorrect = optIdx === currentQ.correctIndex;
                              const hasAnswered = userAnswers[currentQ.id] !== undefined;

                              let optionStyles = "bg-slate-900/70 border-white/[0.08] hover:border-purple-500/40 text-slate-200 cursor-pointer";
                              if (hasAnswered) {
                                if (isSelected && isCorrect) {
                                  optionStyles = "bg-emerald-950/80 border-emerald-500 text-emerald-200 font-extrabold shadow-lg shadow-emerald-900/30 cursor-not-allowed";
                                } else if (isSelected && !isCorrect) {
                                  optionStyles = "bg-rose-950/80 border-rose-500 text-rose-200 font-extrabold shadow-lg shadow-rose-900/30 cursor-not-allowed";
                                } else {
                                  optionStyles = "bg-slate-900/40 border-white/[0.04] text-slate-500 cursor-not-allowed opacity-50";
                                }
                              }

                              return (
                                <button
                                  key={optIdx}
                                  disabled={hasAnswered}
                                  onClick={() => handleSelectOption(currentQ.id, optIdx)}
                                  className={`p-4 rounded-xl border transition-all text-left flex items-center justify-between text-sm ${optionStyles}`}
                                >
                                  <span>{opt}</span>
                                  {hasAnswered && isSelected && isCorrect && (
                                    <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                                  )}
                                  {hasAnswered && isSelected && !isCorrect && (
                                    <XCircle className="w-5 h-5 text-rose-400 shrink-0" />
                                  )}
                                </button>
                              );
                            })}
                          </div>

                          {/* Action Bar when Answered: Feedback & Retry Button */}
                          {userAnswers[currentQ.id] !== undefined && (
                            <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-900/90 border border-white/10 mb-6">
                              <div className="flex items-center gap-2 text-xs font-bold">
                                {userAnswers[currentQ.id] === currentQ.correctIndex ? (
                                  <span className="text-emerald-400 flex items-center gap-1.5">
                                    <CheckCircle2 className="w-4 h-4" /> Correct Answer! Great Job 🎉
                                  </span>
                                ) : (
                                  <span className="text-rose-400 flex items-center gap-1.5">
                                    <XCircle className="w-4 h-4" /> Incorrect Answer!
                                  </span>
                                )}
                              </div>

                              <button
                                onClick={() => handleRetryQuestion(currentQ.id)}
                                className="px-3.5 py-1.5 rounded-lg bg-purple-600/30 hover:bg-purple-600/50 text-purple-300 border border-purple-500/40 text-xs font-extrabold transition-all flex items-center gap-1.5 shadow"
                              >
                                <RefreshCw className="w-3.5 h-3.5" />
                                <span>Retry Question 🔄</span>
                              </button>
                            </div>
                          )}

                          {/* Two Solution Steps: Step 1 (Show Correct Option) & Step 2 (Show Step-by-Step Solution) */}
                          <div className="space-y-3">
                            <div className="flex flex-wrap items-center gap-3">
                              {/* Step 1 Toggle */}
                              <button
                                onClick={() => toggleCorrectOption(currentQ.id)}
                                className="px-4 py-2.5 rounded-xl glass hover:bg-white/10 text-xs font-bold text-emerald-300 border border-emerald-500/30 flex items-center gap-2 transition-all"
                              >
                                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                                <span>
                                  {showCorrectOptionMap[currentQ.id] ? "Hide Correct Option" : "Step 1: Show Correct Option 🎯"}
                                </span>
                              </button>

                              {/* Step 2 Toggle */}
                              <button
                                onClick={() => toggleSolution(currentQ.id)}
                                className="px-4 py-2.5 rounded-xl glass hover:bg-white/10 text-xs font-bold text-amber-300 border border-amber-500/30 flex items-center gap-2 transition-all"
                              >
                                <Lightbulb className="w-4 h-4 text-amber-400" />
                                <span>
                                  {showSolutionMap[currentQ.id] ? "Hide Solution" : "Step 2: Show Step-by-Step Solution 💡"}
                                </span>
                              </button>
                            </div>

                            {/* Display Step 1: Correct Option Card */}
                            <AnimatePresence>
                              {showCorrectOptionMap[currentQ.id] && (
                                <motion.div
                                  initial={{ opacity: 0, height: 0 }}
                                  animate={{ opacity: 1, height: "auto" }}
                                  exit={{ opacity: 0, height: 0 }}
                                  className="p-4 rounded-xl bg-emerald-950/40 border border-emerald-500/40 text-xs text-emerald-200 font-extrabold flex items-center gap-2"
                                >
                                  <span>🎯 Correct Option:</span>
                                  <span className="bg-emerald-500/20 px-3 py-1 rounded-md text-emerald-300 border border-emerald-500/30 font-black">{currentQ.answerText}</span>
                                </motion.div>
                              )}
                            </AnimatePresence>

                            {/* Display Step 2: Step-by-Step Solution Card */}
                            <AnimatePresence>
                              {showSolutionMap[currentQ.id] && (
                                <motion.div
                                  initial={{ opacity: 0, height: 0 }}
                                  animate={{ opacity: 1, height: "auto" }}
                                  exit={{ opacity: 0, height: 0 }}
                                  className="p-5 rounded-2xl bg-purple-950/30 border border-purple-500/30 text-xs leading-relaxed text-slate-200 space-y-2 overflow-hidden shadow-inner"
                                >
                                  <div className="font-extrabold text-amber-300 flex items-center gap-1.5">
                                    <Lightbulb className="w-4 h-4 text-amber-400" />
                                    <span>💡 Step-by-Step Solution:</span>
                                  </div>
                                  <div className="whitespace-pre-line text-slate-300 font-medium pt-1">
                                    {currentQ.solution}
                                  </div>
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </div>
                        </div>

                        {/* Bottom Navigation Control Row */}
                        <div className="pt-6 border-t border-white/[0.08] flex items-center justify-between gap-4">
                          <button
                            onClick={() => setCurrentIndex((prev) => Math.max(0, prev - 1))}
                            disabled={currentIndex === 0}
                            className="px-4 py-2.5 rounded-xl glass hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed text-xs font-bold text-white flex items-center gap-1.5"
                          >
                            <ChevronLeft className="w-4 h-4" />
                            <span>Previous Question</span>
                          </button>

                          <div className="flex items-center gap-3">
                            {currentIndex < totalQuestions - 1 ? (
                              <button
                                onClick={() => setCurrentIndex((prev) => Math.min(totalQuestions - 1, prev + 1))}
                                className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-xs font-extrabold text-white flex items-center gap-1.5 shadow-lg shadow-purple-600/30"
                              >
                                <span>Next Question</span>
                                <ChevronRight className="w-4 h-4" />
                              </button>
                            ) : (
                              <button
                                onClick={() => setQuizFinished(true)}
                                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-xs font-extrabold text-white flex items-center gap-2 shadow-lg shadow-emerald-600/30"
                              >
                                <Check className="w-4 h-4" />
                                <span>Done Practicing</span>
                              </button>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Right Question Index Palette Drawer */}
                      <div className="w-full lg:w-72 bg-[#090e1c] border-t lg:border-t-0 lg:border-l border-white/[0.08] p-5 flex flex-col justify-between shrink-0">
                        <div>
                          <h4 className="text-xs font-extrabold text-slate-300 uppercase tracking-wider mb-4 flex items-center justify-between">
                            <span>Practice Questions Index</span>
                            <span className="text-[10px] text-purple-400">{answeredCount}/{totalQuestions} Practiced</span>
                          </h4>

                          {/* Question Grid Numbers */}
                          <div className="grid grid-cols-6 sm:grid-cols-9 lg:grid-cols-4 gap-2">
                            {questionsList.map((q, idx) => {
                              const hasAns = userAnswers[q.id] !== undefined;
                              const isCorr = userAnswers[q.id] === q.correctIndex;
                              const isCur = idx === currentIndex;

                              let gridStyle = "bg-slate-800/60 text-slate-400 border-white/[0.05]";
                              if (hasAns) {
                                gridStyle = isCorr
                                  ? "bg-emerald-600 text-white border-emerald-400"
                                  : "bg-rose-600 text-white border-rose-400";
                              }

                              return (
                                <button
                                  key={q.id}
                                  onClick={() => setCurrentIndex(idx)}
                                  className={`h-9 rounded-xl text-xs font-black border transition-all flex items-center justify-center ${gridStyle} ${
                                    isCur ? "ring-2 ring-purple-400 ring-offset-2 ring-offset-[#090e1c] scale-105" : ""
                                  }`}
                                >
                                  {q.id}
                                </button>
                              );
                            })}
                          </div>
                        </div>

                        <div className="mt-6 pt-4 border-t border-white/[0.08] space-y-3">
                          <button
                            onClick={() => setQuizFinished(true)}
                            className="w-full py-3 rounded-xl bg-purple-600 hover:bg-purple-500 text-xs font-extrabold text-white shadow-lg shadow-purple-600/30 transition-all"
                          >
                            View Practice Summary &amp; Solutions
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Mode B: Full Practice Sheet (Scrollable List of All Questions) */}
                  {practiceViewMode === "sheet" && (
                    <div className="flex-1 p-6 md:p-8 overflow-y-auto space-y-6">
                      <div className="flex items-center justify-between border-b border-white/10 pb-4">
                        <div>
                          <h3 className="text-lg font-extrabold text-white">Full Practice Sheet: {selectedTopic}</h3>
                          <p className="text-xs text-slate-400">All {totalQuestions} practice questions listed with instant answer validation &amp; solutions.</p>
                        </div>
                        <button
                          onClick={() => setQuizFinished(true)}
                          className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-xs font-extrabold text-white shadow"
                        >
                          Done Practicing
                        </button>
                      </div>

                      <div className="space-y-6">
                        {questionsList.map((q, idx) => {
                          const userAnsIdx = userAnswers[q.id];
                          const isCorrect = userAnsIdx === q.correctIndex;
                          const hasAnswered = userAnsIdx !== undefined;

                          return (
                            <div key={q.id} className="p-6 rounded-2xl bg-slate-900/60 border border-white/10 space-y-4">
                              <div className="flex items-start justify-between gap-4">
                                <span className="px-2.5 py-0.5 rounded-full bg-purple-500/20 text-purple-300 text-[10px] font-extrabold border border-purple-500/30">
                                  #{idx + 1}
                                </span>
                                <h4 className="flex-1 text-sm font-bold text-white leading-relaxed">
                                  {q.question}
                                </h4>
                              </div>

                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                                {q.options.map((opt, optIdx) => {
                                  const isSel = userAnsIdx === optIdx;
                                  const isRight = optIdx === q.correctIndex;
                                  let style = "bg-slate-800/60 border-white/[0.06] text-slate-300 hover:border-purple-500/30";
                                  if (hasAnswered) {
                                    if (isRight) style = "bg-emerald-950/60 border-emerald-500/50 text-emerald-200 font-bold";
                                    else if (isSel && !isRight) style = "bg-rose-950/60 border-rose-500/50 text-rose-200 font-bold";
                                  }

                                  return (
                                    <button
                                      key={optIdx}
                                      onClick={() => handleSelectOption(q.id, optIdx)}
                                      className={`p-3 rounded-xl border transition-all text-left text-xs ${style}`}
                                    >
                                      {opt}
                                    </button>
                                  );
                                })}
                              </div>

                              <div>
                                <button
                                  onClick={() => toggleSolution(q.id)}
                                  className="text-xs font-bold text-purple-300 hover:text-purple-200 flex items-center gap-1.5"
                                >
                                  <Lightbulb className="w-3.5 h-3.5 text-amber-400" />
                                  <span>{showSolutionMap[q.id] ? "Hide Solution" : "Show Solution 💡"}</span>
                                </button>

                                {showSolutionMap[q.id] && (
                                  <div className="mt-3 p-4 rounded-xl bg-purple-950/30 border border-purple-500/30 text-xs text-slate-200 space-y-1">
                                    <div className="font-extrabold text-amber-300">Answer: {q.answerText}</div>
                                    <div className="whitespace-pre-line text-slate-300 font-medium pt-1">{q.solution}</div>
                                  </div>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </>
              )}

              {/* Practice Summary Screen */}
              {quizFinished && (
                <div className="flex-1 p-6 md:p-8 overflow-y-auto space-y-8">
                  {/* Score Banner */}
                  <div className="p-8 rounded-3xl bg-gradient-to-r from-purple-900/40 via-indigo-900/30 to-blue-900/40 border border-purple-500/30 flex flex-col md:flex-row items-center justify-between gap-6 shadow-2xl">
                    <div>
                      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-extrabold mb-3">
                        <CheckCircle2 className="w-4 h-4" /> Practice Session Completed!
                      </div>
                      <h3 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                        {selectedTopic} Practice Summary
                      </h3>
                      <p className="text-sm text-slate-300 mt-1">
                        Self-Paced Practice Completed. Review your answers and step-by-step solutions below.
                      </p>
                    </div>

                    <div className="flex items-center gap-6 bg-slate-900/80 p-5 rounded-2xl border border-white/10">
                      <div className="text-center">
                        <div className="text-3xl font-black text-purple-400">{correctCount} / {totalQuestions}</div>
                        <div className="text-[10px] font-bold uppercase text-slate-400 mt-0.5">Practiced</div>
                      </div>
                      <div className="w-px h-10 bg-white/10" />
                      <div className="text-center">
                        <div className="text-3xl font-black text-emerald-400">{accuracyPercent}%</div>
                        <div className="text-[10px] font-bold uppercase text-slate-400 mt-0.5">Accuracy</div>
                      </div>
                      <div className="w-px h-10 bg-white/10" />
                      <button
                        onClick={handleRestartQuiz}
                        className="p-3 rounded-xl bg-purple-600 hover:bg-purple-500 text-white transition-all shadow-md flex items-center gap-1 text-xs font-bold"
                        title="Restart Practice"
                      >
                        <RefreshCw className="w-4 h-4" />
                        <span>Retry</span>
                      </button>
                    </div>
                  </div>

                  {/* Solutions Table & Breakdown */}
                  <div className="space-y-4">
                    <h4 className="text-lg font-extrabold text-white flex items-center gap-2">
                      <Lightbulb className="w-5 h-5 text-amber-400" />
                      Detailed Solutions &amp; Answer Key
                    </h4>

                    <div className="space-y-4">
                      {questionsList.map((q) => {
                        const userAnsIdx = userAnswers[q.id];
                        const isCorrect = userAnsIdx === q.correctIndex;
                        const userAnsText = userAnsIdx !== undefined ? q.options[userAnsIdx] : "Unattempted";

                        return (
                          <div
                            key={q.id}
                            className={`p-6 rounded-2xl border transition-all space-y-3 ${
                              userAnsIdx === undefined
                                ? "bg-slate-900/40 border-white/10"
                                : isCorrect
                                ? "bg-emerald-950/20 border-emerald-500/30"
                                : "bg-rose-950/20 border-rose-500/30"
                            }`}
                          >
                            <div className="flex items-start justify-between gap-4">
                              <h5 className="text-sm font-bold text-white leading-relaxed">
                                {q.question}
                              </h5>
                              <span
                                className={`text-xs font-extrabold px-3 py-1 rounded-full shrink-0 ${
                                  userAnsIdx === undefined
                                    ? "bg-slate-800 text-slate-400"
                                    : isCorrect
                                    ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                                    : "bg-rose-500/20 text-rose-300 border border-rose-500/30"
                                }`}
                              >
                                {userAnsIdx === undefined
                                  ? "Unattempted"
                                  : isCorrect
                                  ? "Correct ✓"
                                  : "Incorrect ✗"}
                              </span>
                            </div>

                            {/* User answer vs correct answer & Time taken */}
                            <div className="flex flex-wrap items-center gap-4 text-xs font-semibold">
                              <div className="text-slate-400">
                                Your Choice: <span className={isCorrect ? "text-emerald-400 font-bold" : "text-rose-400 font-bold"}>{userAnsText}</span>
                              </div>
                              <div className="text-amber-300 font-bold">
                                Correct Answer: {q.answerText}
                              </div>
                              {questionTimes[q.id] !== undefined && (
                                <div className="text-purple-300 bg-purple-500/15 px-2.5 py-0.5 rounded-md border border-purple-500/30 font-extrabold flex items-center gap-1">
                                  <Clock className="w-3 h-3 text-purple-400" />
                                  <span>Time Taken: {questionTimes[q.id]}s</span>
                                </div>
                              )}
                            </div>

                            {/* Solution Box */}
                            <div className="p-4 rounded-xl bg-slate-950/60 border border-white/[0.06] text-xs leading-relaxed text-slate-300 space-y-1">
                              <div className="font-extrabold text-purple-400 text-[11px] uppercase tracking-wider mb-1">
                                Step-by-Step Solution
                              </div>
                              <div className="whitespace-pre-line font-medium text-slate-300">
                                {q.solution}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
