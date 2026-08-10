"use client";

import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
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
  Grid,
  LayoutGrid,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { PERCENTAGES_QUESTIONS, PlacementQuestion, QUANTITATIVE_APTITUDE_MAP } from "@/data/aptitudeQuestions";
import { supabase } from "@/lib/supabase";
import { getAuthHeaders, apiFetch } from "@/lib/api";

const TOPIC_ID_MAP: Record<string, number> = {
  // Quantitative Aptitude
  "Percentages": 1,
  "Profit & Loss": 2,
  "Time & Work": 3,
  "Time, Speed & Distance": 4,
  "Probability": 5,
  "Permutations & Combinations": 6,

  // Logical Reasoning
  "Blood Relations": 7,
  "Seating Arrangement": 8,
  "Coding-Decoding": 9,
  "Syllogisms": 10,
  "Puzzles": 11,

  // Verbal Ability
  "Grammar": 12,
  "Reading Comprehension": 13,
  "Vocabulary": 14,
  "Sentence Correction": 15,
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
      color: "from-blue-50/90 via-indigo-50/40 to-white",
      borderColor: "border-blue-200/90",
      iconBg: "bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-xs",
      itemBorder: "border-blue-200/80 hover:border-blue-500 hover:bg-blue-50/50",
      badgeColor: "text-blue-700 bg-blue-100/90 border-blue-200/90",
      footerColor: "text-blue-600 hover:text-blue-800",
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
      color: "from-purple-50/90 via-violet-50/40 to-white",
      borderColor: "border-purple-200/90",
      iconBg: "bg-gradient-to-br from-violet-500 to-purple-600 text-white shadow-xs",
      itemBorder: "border-purple-200/80 hover:border-purple-500 hover:bg-purple-50/50",
      badgeColor: "text-purple-700 bg-purple-100/90 border-purple-200/90",
      footerColor: "text-purple-600 hover:text-purple-800",
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
      color: "from-emerald-50/90 via-teal-50/40 to-white",
      borderColor: "border-emerald-200/90",
      iconBg: "bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-xs",
      itemBorder: "border-emerald-200/80 hover:border-emerald-500 hover:bg-emerald-50/50",
      badgeColor: "text-emerald-700 bg-emerald-100/90 border-emerald-200/90",
      footerColor: "text-emerald-600 hover:text-emerald-800",
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
      color: "from-amber-50/90 via-orange-50/40 to-white",
      borderColor: "border-amber-200/90",
      iconBg: "bg-gradient-to-br from-amber-500 to-orange-600 text-white shadow-xs",
      itemBorder: "border-amber-200/80 hover:border-amber-500 hover:bg-amber-50/50",
      badgeColor: "text-amber-700 bg-amber-100/90 border-amber-200/90",
      footerColor: "text-amber-600 hover:text-amber-800",
      tests: [
        { name: "Quantitative Mastery Test", duration: "30 mins", count: "25 Qs" },
        { name: "Logical Reasoning Sprint", duration: "25 mins", count: "20 Qs" },
        { name: "Verbal Proficiency Quiz", duration: "20 mins", count: "20 Qs" },
      ],
    },
    {
      category: "Full-Length Tests",
      icon: FileCheck2,
      color: "from-sky-50/90 via-blue-50/40 to-white",
      borderColor: "border-sky-200/90",
      iconBg: "bg-gradient-to-br from-sky-500 to-blue-600 text-white shadow-xs",
      itemBorder: "border-sky-200/80 hover:border-sky-500 hover:bg-sky-50/50",
      badgeColor: "text-sky-700 bg-sky-100/90 border-sky-200/90",
      footerColor: "text-sky-600 hover:text-sky-800",
      tests: [
        { name: "TCS NQT Full Mock", duration: "90 mins", count: "80 Qs" },
        { name: "Infosys Pseudo-code & Aptitude", duration: "75 mins", count: "65 Qs" },
        { name: "Product Company General Aptitude", duration: "60 mins", count: "50 Qs" },
      ],
    },
    {
      category: "AI Performance Analysis",
      icon: BarChart3,
      color: "from-rose-50/90 via-pink-50/40 to-white",
      borderColor: "border-rose-200/90",
      iconBg: "bg-gradient-to-br from-rose-500 to-pink-600 text-white shadow-xs",
      itemBorder: "border-rose-200/80 hover:border-rose-500 hover:bg-rose-50/50",
      badgeColor: "text-rose-700 bg-rose-100/90 border-rose-200/90",
      footerColor: "text-rose-600 hover:text-rose-800",
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
  const [mounted, setMounted] = useState<boolean>(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Practice State
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [userAnswers, setUserAnswers] = useState<Record<number, number>>({});
  const [questionTimes, setQuestionTimes] = useState<Record<number, number>>({});
  const [showCorrectOptionMap, setShowCorrectOptionMap] = useState<Record<number, boolean>>({});
  const [showSolutionMap, setShowSolutionMap] = useState<Record<number, boolean>>({});
  const [practiceViewMode, setPracticeViewMode] = useState<"card" | "sheet">("card");
  const [quizFinished, setQuizFinished] = useState<boolean>(false);
  const [mobileGridOpen, setMobileGridOpen] = useState<boolean>(false);

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

  // Questions for current topic (Dynamic lookup for all Quantitative Aptitude topics)
  const questionsList: PlacementQuestion[] =
    selectedTopic && QUANTITATIVE_APTITUDE_MAP[selectedTopic]
      ? QUANTITATIVE_APTITUDE_MAP[selectedTopic]
      : PERCENTAGES_QUESTIONS;

  const currentQ = questionsList[currentIndex] || questionsList[0];
  const totalQuestions = questionsList.length;
  const answeredCount = Object.keys(userAnswers).length;
  const correctCount = questionsList.reduce((acc, q) => {
    return userAnswers[q.id] === q.correctIndex ? acc + 1 : acc;
  }, 0);
  const accuracyPercent = answeredCount > 0 ? Math.round((correctCount / answeredCount) * 100) : 0;
  const progressPercent = totalQuestions > 0 ? Math.round(((currentIndex + 1) / totalQuestions) * 100) : 0;

  // Early return MUST be after ALL hooks are called
  if (!isOpen || !mounted) return null;

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

      getAuthHeaders().then((headers) => {
        apiFetch("/api/practice/attempt", {
          method: "POST",
          headers: { "Content-Type": "application/json", ...headers },
          body: JSON.stringify({
            user_id: userId,
            topic_id: topicId,
            question_id: questionId,
            selected_option_index: optionIdx,
            is_correct: isCorrect,
            time_taken_seconds: timeSpentSec,
          }),
        }).catch(() => {});
      });

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

  const modalContent = (
    <AnimatePresence>
      <div className="fixed inset-0 z-[9999] bg-[#f4f6f3] select-none overflow-hidden flex flex-col shadow-2xl">
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.98 }}
          transition={{ duration: 0.2 }}
          className="bg-[#f4f6f3] w-full h-full flex flex-col overflow-hidden"
        >
          {/* Compact Header Bar */}
          <div className="px-3 py-2 sm:px-6 sm:py-3.5 border-b border-slate-200 bg-white flex items-center justify-between gap-2.5 shrink-0 shadow-2xs">
            <div className="flex items-center gap-2 sm:gap-3.5 min-w-0 flex-1">
              {selectedTopic ? (
                <button
                  onClick={() => setSelectedTopic(null)}
                  className="px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 transition-all flex items-center gap-1 text-xs font-black cursor-pointer border border-slate-200/80 shrink-0 active:scale-95 shadow-2xs"
                  aria-label="Back to Topics"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Back to Topics</span>
                  <span className="sm:hidden">Back</span>
                </button>
              ) : (
                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-emerald-600 via-teal-600 to-indigo-600 text-white flex items-center justify-center shadow-md shadow-emerald-600/30 shrink-0">
                  <Award className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                </div>
              )}
              <div className="min-w-0 flex-1">
                <h2 className="text-xs sm:text-base font-extrabold text-slate-900 tracking-tight truncate leading-tight">
                  {selectedTopic ? `${selectedTopic} Practice` : "Placement Preparation"}
                </h2>
                <p className="text-[10px] sm:text-xs text-slate-500 font-medium truncate hidden sm:block mt-0.5">
                  {selectedTopic
                    ? `${totalQuestions} Questions • Practice Mode`
                    : "Aptitude, Reasoning, Verbal & Mock Tests"}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
              {/* Practice View Switcher */}
              {selectedTopic && !quizFinished && (
                <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-lg border border-slate-200 text-[10px] sm:text-xs font-bold">
                  <button
                    onClick={() => setPracticeViewMode("card")}
                    className={`px-2 py-1 sm:px-3 sm:py-1.5 rounded-md transition-all cursor-pointer ${
                      practiceViewMode === "card"
                        ? "bg-slate-900 text-white font-black shadow-2xs"
                        : "text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    Single
                  </button>
                  <button
                    onClick={() => setPracticeViewMode("sheet")}
                    className={`px-2 py-1 sm:px-3 sm:py-1.5 rounded-md transition-all cursor-pointer ${
                      practiceViewMode === "sheet"
                        ? "bg-purple-600 text-white font-black shadow-2xs"
                        : "text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    Sheet
                  </button>
                </div>
              )}

              <button
                onClick={onClose}
                className="p-1.5 sm:px-3.5 sm:py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-extrabold transition-all border border-slate-800 shadow-md cursor-pointer flex items-center gap-1 active:scale-95"
                aria-label="Close modal"
              >
                <span className="hidden sm:inline">Close</span>
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Main Topic Selection View */}
          {!selectedTopic && (
            <>
              {/* Navigation Tabs */}
              <div className="px-6 py-3 border-b border-slate-200 bg-slate-100/90 flex items-center gap-3 shrink-0">
                <button
                  onClick={() => setActiveTab("aptitude")}
                  className={`px-5 py-2 rounded-xl font-extrabold text-xs transition-all flex items-center gap-2 cursor-pointer ${
                    activeTab === "aptitude"
                      ? "bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md shadow-purple-600/25 border border-purple-400"
                      : "bg-white text-slate-700 hover:text-slate-900 border border-slate-200/90 shadow-2xs"
                  }`}
                >
                  <Brain className="w-4 h-4" />
                  <span>Aptitude &amp; Reasoning</span>
                </button>

                <button
                  onClick={() => setActiveTab("mockTests")}
                  className={`px-5 py-2 rounded-xl font-extrabold text-xs transition-all flex items-center gap-2 cursor-pointer ${
                    activeTab === "mockTests"
                      ? "bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md shadow-purple-600/25 border border-purple-400"
                      : "bg-white text-slate-700 hover:text-slate-900 border border-slate-200/90 shadow-2xs"
                  }`}
                >
                  <FileCheck2 className="w-4 h-4" />
                  <span>Mock Tests</span>
                </button>
              </div>

              {/* Content Body */}
              <div className="p-6 md:p-8 overflow-y-auto flex-1 space-y-6 bg-[#f4f6f3]">
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
                          className={`p-6 rounded-3xl bg-gradient-to-b ${section.color} border ${section.borderColor} flex flex-col justify-between shadow-md`}
                        >
                          <div>
                            <div className="flex items-center justify-between mb-4">
                              <div className={`p-2.5 rounded-xl ${section.iconBg}`}>
                                <Icon className="w-5 h-5 text-white" />
                              </div>
                              <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full bg-white/80 border border-slate-200 text-slate-700 shadow-2xs">
                                {section.topics.length} Topics
                              </span>
                            </div>

                            <h3 className="text-lg font-black text-slate-900 mb-4">
                              {section.category}
                            </h3>

                            <div className="space-y-2.5">
                              {section.topics.map((t) => (
                                <div
                                  key={t.name}
                                  onClick={() => startTopicQuiz(t.name)}
                                  className={`p-3.5 rounded-2xl bg-white border ${section.itemBorder} transition-all flex items-center justify-between group cursor-pointer shadow-2xs hover:shadow-md`}
                                >
                                  <div className="flex items-center gap-2.5">
                                    <span className="w-2 h-2 rounded-full bg-purple-500 group-hover:scale-125 transition-transform" />
                                    <span className="text-xs font-extrabold text-slate-900 group-hover:text-purple-700">
                                      {t.name}
                                    </span>
                                  </div>
                                  <span className={`text-[10px] font-black px-2.5 py-0.5 rounded-full ${section.badgeColor}`}>
                                    {t.count}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>

                          <div className={`mt-6 pt-4 border-t border-slate-200/80 flex items-center justify-between text-xs font-extrabold ${section.footerColor}`}>
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
                          className={`p-6 rounded-3xl bg-gradient-to-b ${section.color} border ${section.borderColor} flex flex-col justify-between shadow-md`}
                        >
                          <div>
                            <div className="flex items-center justify-between mb-4">
                              <div className={`p-2.5 rounded-xl ${section.iconBg}`}>
                                <Icon className="w-5 h-5 text-white" />
                              </div>
                              <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full bg-white/80 border border-slate-200 text-slate-700 shadow-2xs">
                                {section.tests.length} Suites
                              </span>
                            </div>

                            <h3 className="text-lg font-black text-slate-900 mb-4">
                              {section.category}
                            </h3>

                            <div className="space-y-2.5">
                              {section.tests.map((test) => (
                                <div
                                  key={test.name}
                                  className={`p-3.5 rounded-2xl bg-white border ${section.itemBorder} transition-all space-y-1.5 group cursor-pointer shadow-2xs hover:shadow-md`}
                                >
                                  <div className="flex items-center justify-between">
                                    <span className="text-xs font-extrabold text-slate-900 group-hover:text-sky-700">
                                      {test.name}
                                    </span>
                                    <span className={`text-[10px] font-black px-2.5 py-0.5 rounded-full ${section.badgeColor}`}>
                                      {test.duration}
                                    </span>
                                  </div>
                                  <div className="text-[11px] text-slate-500 font-semibold flex items-center justify-between">
                                    <span>{test.count}</span>
                                    <span className={`${section.footerColor} font-extrabold group-hover:underline`}>Start Test →</span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>

                          <div className={`mt-6 pt-4 border-t border-slate-200/80 flex items-center justify-between text-xs font-extrabold ${section.footerColor}`}>
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
                          <div className="space-y-2.5 mb-6">
                            <div className="flex flex-wrap items-center justify-between gap-2 text-xs font-extrabold text-slate-700">
                              <span>Question {currentIndex + 1} of {totalQuestions}</span>
                              <div className="flex items-center gap-2 sm:gap-3">
                                <span className="flex items-center gap-1.5 text-amber-900 bg-amber-100/90 px-3 py-1 rounded-full border border-amber-300/80 font-black text-[11px] sm:text-xs shadow-2xs">
                                  <Clock className="w-3.5 h-3.5 text-amber-700" />
                                  <span>{formatTimer(questionTimerSeconds)}</span>
                                </span>
                                <span className="text-purple-700 font-black text-xs bg-purple-100 px-3 py-1 rounded-full border border-purple-200/80">
                                  {answeredCount}/{totalQuestions} Practiced
                                </span>
                              </div>
                            </div>
                            <div className="w-full bg-slate-200/90 h-2.5 rounded-full overflow-hidden border border-slate-300/50">
                              <motion.div
                                className="h-full bg-gradient-to-r from-blue-600 via-purple-600 to-emerald-500 rounded-full"
                                initial={{ width: 0 }}
                                animate={{ width: `${progressPercent}%` }}
                                transition={{ duration: 0.3 }}
                              />
                            </div>

                            {/* Mobile Horizontal Question Selector Chips (Visible < lg) */}
                            <div className="lg:hidden flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1 mobile-touch-scroll">
                              <button
                                onClick={() => setMobileGridOpen(true)}
                                className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-purple-600 text-white border border-purple-400 text-xs font-black shrink-0 shadow-2xs"
                              >
                                <Grid className="w-3.5 h-3.5 text-white" />
                                <span>All ({totalQuestions})</span>
                              </button>
                              {questionsList.map((q, idx) => {
                                const hasAns = userAnswers[q.id] !== undefined;
                                const isCorr = userAnswers[q.id] === q.correctIndex;
                                const isCur = idx === currentIndex;

                                let chipStyle = "bg-slate-100 text-slate-700 border-slate-200/90 font-extrabold";
                                if (hasAns) {
                                  chipStyle = isCorr ? "bg-emerald-500 text-white border-emerald-600 font-black" : "bg-rose-500 text-white border-rose-600 font-black";
                                }

                                return (
                                  <button
                                    key={q.id}
                                    onClick={() => setCurrentIndex(idx)}
                                    className={`w-8 h-8 rounded-xl text-xs border shrink-0 transition-all flex items-center justify-center cursor-pointer ${chipStyle} ${
                                      isCur ? "ring-2 ring-indigo-600 ring-offset-1 scale-105" : ""
                                    }`}
                                  >
                                    {q.id}
                                  </button>
                                );
                              })}
                            </div>
                          </div>

                          {/* Question Text Box */}
                          <div className="p-6 sm:p-7 rounded-3xl border border-slate-200/90 mb-6 bg-white shadow-md relative">
                            <div className="absolute -top-3.5 left-6 px-3.5 py-0.5 rounded-full bg-gradient-to-r from-purple-600 to-indigo-600 text-[10px] font-black text-white tracking-wider uppercase shadow-xs">
                              Practice Problem #{currentIndex + 1}
                            </div>
                            <h3 className="text-base sm:text-xl font-extrabold text-slate-900 leading-relaxed pt-2">
                              {currentQ.question}
                            </h3>
                          </div>

                          {/* Options Grid */}
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 mb-5">
                            {currentQ.options.map((opt, optIdx) => {
                              const isSelected = userAnswers[currentQ.id] === optIdx;
                              const isCorrect = optIdx === currentQ.correctIndex;
                              const hasAnswered = userAnswers[currentQ.id] !== undefined;

                              let optionStyles = "bg-white border-slate-200/90 hover:border-indigo-500 hover:bg-indigo-50/40 text-slate-900 font-extrabold shadow-2xs hover:shadow-md cursor-pointer";
                              if (hasAnswered) {
                                if (isSelected && isCorrect) {
                                  optionStyles = "bg-emerald-500 border-emerald-600 text-white font-black shadow-md cursor-not-allowed";
                                } else if (isSelected && !isCorrect) {
                                  optionStyles = "bg-rose-500 border-rose-600 text-white font-black shadow-md cursor-not-allowed";
                                } else {
                                  optionStyles = "bg-slate-100/90 border-slate-200 text-slate-400 font-semibold cursor-not-allowed opacity-50";
                                }
                              }

                              return (
                                <button
                                  key={optIdx}
                                  disabled={hasAnswered}
                                  onClick={() => handleSelectOption(currentQ.id, optIdx)}
                                  className={`p-4 sm:p-5 rounded-2xl border transition-all text-left flex items-center justify-between text-xs sm:text-sm ${optionStyles}`}
                                >
                                  <span>{opt}</span>
                                  {hasAnswered && isSelected && isCorrect && (
                                    <CheckCircle2 className="w-5 h-5 text-white shrink-0" />
                                  )}
                                  {hasAnswered && isSelected && !isCorrect && (
                                    <XCircle className="w-5 h-5 text-white shrink-0" />
                                  )}
                                </button>
                              );
                            })}
                          </div>

                          {/* Action Bar when Answered: Feedback & Retry Button */}
                          {userAnswers[currentQ.id] !== undefined && (
                            <div className="flex items-center justify-between p-4 rounded-2xl bg-white border border-slate-200/90 shadow-sm mb-6">
                              <div className="flex items-center gap-2 text-xs sm:text-sm font-black">
                                {userAnswers[currentQ.id] === currentQ.correctIndex ? (
                                  <span className="text-emerald-700 flex items-center gap-1.5">
                                    <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Correct Answer! Great Job 🎉
                                  </span>
                                ) : (
                                  <span className="text-rose-700 flex items-center gap-1.5">
                                    <XCircle className="w-4 h-4 text-rose-600" /> Incorrect Answer!
                                  </span>
                                )}
                              </div>

                              <button
                                onClick={() => handleRetryQuestion(currentQ.id)}
                                className="px-4 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-black transition-all flex items-center gap-1.5 shadow-md shadow-purple-600/25 cursor-pointer"
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
                                className="px-4 py-2.5 rounded-xl bg-emerald-50 hover:bg-emerald-100/90 text-xs font-extrabold text-emerald-800 border border-emerald-300/80 flex items-center gap-2 transition-all cursor-pointer shadow-2xs"
                              >
                                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                                <span>
                                  {showCorrectOptionMap[currentQ.id] ? "Hide Correct Option" : "Step 1: Show Correct Option 🎯"}
                                </span>
                              </button>

                              {/* Step 2 Toggle */}
                              <button
                                onClick={() => toggleSolution(currentQ.id)}
                                className="px-4 py-2.5 rounded-xl bg-amber-50 hover:bg-amber-100/90 text-xs font-extrabold text-amber-900 border border-amber-300/80 flex items-center gap-2 transition-all cursor-pointer shadow-2xs"
                              >
                                <Lightbulb className="w-4 h-4 text-amber-600" />
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
                                  className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-900 font-extrabold flex items-center gap-2 shadow-2xs"
                                >
                                  <span>🎯 Correct Option:</span>
                                  <span className="bg-emerald-600 text-white px-3 py-1 rounded-lg border border-emerald-700 font-black">{currentQ.answerText}</span>
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
                                  className="p-5 rounded-3xl bg-white border border-purple-200/90 text-xs leading-relaxed text-slate-800 space-y-2 overflow-hidden shadow-md"
                                >
                                  <div className="font-black text-amber-800 flex items-center gap-1.5">
                                    <Lightbulb className="w-4 h-4 text-amber-600" />
                                    <span>💡 Step-by-Step Solution:</span>
                                  </div>
                                  <div className="whitespace-pre-line text-slate-700 font-semibold pt-1">
                                    {currentQ.solution}
                                  </div>
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </div>
                        </div>

                        {/* Bottom Navigation Control Row */}
                        <div className="pt-6 border-t border-slate-200/80 flex items-center justify-between gap-4">
                          <button
                            onClick={() => setCurrentIndex((prev) => Math.max(0, prev - 1))}
                            disabled={currentIndex === 0}
                            className="px-4 py-2.5 rounded-xl bg-white hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed text-xs font-extrabold text-slate-800 border border-slate-200/90 flex items-center gap-1.5 cursor-pointer shadow-2xs"
                          >
                            <ChevronLeft className="w-4 h-4" />
                            <span>Previous Question</span>
                          </button>

                          <div className="flex items-center gap-3">
                            {currentIndex < totalQuestions - 1 ? (
                              <button
                                onClick={() => setCurrentIndex((prev) => Math.min(totalQuestions - 1, prev + 1))}
                                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-xs font-black text-white flex items-center gap-1.5 shadow-md shadow-purple-600/25 cursor-pointer"
                              >
                                <span>Next Question</span>
                                <ChevronRight className="w-4 h-4" />
                              </button>
                            ) : (
                              <button
                                onClick={() => setQuizFinished(true)}
                                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-xs font-black text-white flex items-center gap-2 shadow-md shadow-emerald-600/25 cursor-pointer"
                              >
                                <Check className="w-4 h-4" />
                                <span>Done Practicing</span>
                              </button>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Right Question Index Palette (Sidebar on Desktop lg:, Bottom Sheet Modal on Mobile) */}
                      <div className="hidden lg:flex lg:w-72 bg-white border-l border-slate-200/90 p-5 flex-col justify-between shrink-0 shadow-2xs">
                        <div>
                          <h4 className="text-xs font-black text-slate-900 uppercase tracking-widest mb-4 flex items-center justify-between">
                            <span>Questions Index</span>
                            <span className="text-[10px] text-purple-700 font-extrabold bg-purple-100 px-2 py-0.5 rounded-full">{answeredCount}/{totalQuestions}</span>
                          </h4>

                          {/* Question Grid Numbers */}
                          <div className="grid grid-cols-4 gap-2">
                            {questionsList.map((q, idx) => {
                              const hasAns = userAnswers[q.id] !== undefined;
                              const isCorr = userAnswers[q.id] === q.correctIndex;
                              const isCur = idx === currentIndex;

                              let gridStyle = "bg-slate-100 text-slate-700 border-slate-200/90 font-extrabold hover:bg-slate-200";
                              if (hasAns) {
                                gridStyle = isCorr
                                  ? "bg-emerald-500 text-white border-emerald-600 font-black shadow-2xs"
                                  : "bg-rose-500 text-white border-rose-600 font-black shadow-2xs";
                              }

                              return (
                                <button
                                  key={q.id}
                                  onClick={() => setCurrentIndex(idx)}
                                  className={`h-9 rounded-xl text-xs font-black border transition-all flex items-center justify-center cursor-pointer ${gridStyle} ${
                                    isCur ? "ring-2 ring-indigo-600 ring-offset-1 scale-105" : ""
                                  }`}
                                >
                                  {q.id}
                                </button>
                              );
                            })}
                          </div>
                        </div>

                        <div className="mt-6 pt-4 border-t border-slate-200/80 space-y-3">
                          <button
                            onClick={() => setQuizFinished(true)}
                            className="w-full py-3 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-xs font-black text-white shadow-md shadow-purple-600/25 transition-all cursor-pointer"
                          >
                            View Practice Summary &amp; Solutions
                          </button>
                        </div>
                      </div>

                      {/* Mobile Bottom Sheet Modal for Full 41-Question Grid (< lg) */}
                      <AnimatePresence>
                        {mobileGridOpen && (
                          <>
                            <motion.div
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              exit={{ opacity: 0 }}
                              onClick={() => setMobileGridOpen(false)}
                              className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 lg:hidden"
                            />
                            <motion.div
                              initial={{ y: "100%" }}
                              animate={{ y: 0 }}
                              exit={{ y: "100%" }}
                              transition={{ type: "spring", stiffness: 350, damping: 30 }}
                              className="fixed bottom-0 inset-x-0 bg-[#090e1c] border-t border-white/15 rounded-t-3xl p-6 z-50 max-h-[85vh] overflow-y-auto lg:hidden"
                            >
                              <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-4">
                                <div className="font-extrabold text-white text-sm flex items-center gap-2">
                                  <Grid className="w-4 h-4 text-purple-400" />
                                  <span>Questions Index ({answeredCount}/{totalQuestions} Practiced)</span>
                                </div>
                                <button
                                  onClick={() => setMobileGridOpen(false)}
                                  className="p-2 rounded-xl glass text-slate-400 hover:text-white"
                                >
                                  <X className="w-5 h-5" />
                                </button>
                              </div>

                              <div className="grid grid-cols-6 gap-2 mb-6">
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
                                      onClick={() => {
                                        setCurrentIndex(idx);
                                        setMobileGridOpen(false);
                                      }}
                                      className={`h-10 rounded-xl text-xs font-black border transition-all flex items-center justify-center ${gridStyle} ${
                                        isCur ? "ring-2 ring-purple-400 ring-offset-2 ring-offset-[#090e1c] scale-105" : ""
                                      }`}
                                    >
                                      {q.id}
                                    </button>
                                  );
                                })}
                              </div>

                              <button
                                onClick={() => {
                                  setMobileGridOpen(false);
                                  setQuizFinished(true);
                                }}
                                className="w-full py-3.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-xs font-extrabold text-white shadow-lg shadow-purple-600/30"
                              >
                                Finish &amp; View Summary
                              </button>
                            </motion.div>
                          </>
                        )}
                      </AnimatePresence>
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

  return createPortal(modalContent, document.body);
}
