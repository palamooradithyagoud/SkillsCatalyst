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
  Sparkles,
  Search,
  Shuffle,
  Bookmark,
  RotateCw,
  Lock,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
// Sourced securely via Supabase RPC get_topic_questions & submit_question_attempt
import { supabase } from "@/lib/supabase";
import { getAuthHeaders, apiFetch, API_BASE } from "@/lib/api";
import { useSubscription } from "@/hooks/useSubscription";
import { usePricingModal } from "@/contexts/PricingModalContext";
import { PremiumLockCard } from "@/components/premium";
import {
  getUserTopicBookmarks,
  toggleTopicBookmark as toggleDbTopicBookmark,
  recordLegacyAttempt,
  getLegacyTopicAttempts,
  getQuestionsByTopicName,
  toLegacyQuestions,
  getUserTopicProgress,
} from "@/lib/aptitude";
import { LegacyPlacementQuestion, UserTopicProgress } from "@/types/aptitude";

const TOPIC_ID_MAP: Record<string, number> = {
  // Quantitative Aptitude
  "Percentages": 1,
  "Profit & Loss": 2,
  "Time & Work": 3,
  "Time, Speed & Distance": 4,
  "Probability": 5,
  "Permutations & Combinations": 6,
  "Problems on Trains": 16,
  "Simple Interest": 17,
  "Compound Interest": 18,
  "Problems on Ages": 19,
  "Partnership": 20,
  "Height & Distance": 21,
  "Calendar": 22,
  "Clock": 23,
  "Average": 24,
  "Area": 25,
  "Volume and Surface Area": 26,
  "Numbers": 27,
  "Problems on Numbers": 28,
  "Problems on H.C.F and L.C.M": 29,
  "Decimal Fraction": 30,
  "Simplification": 31,
  "Square Root and Cube Root": 32,
  "Surds and Indices": 33,
  "Ratio and Proportion": 34,
  "Chain Rule": 35,
  "Pipes and Cistern": 36,
  "Boats and Streams": 37,
  "Alligation or Mixture": 38,
  "Logarithm": 39,
  "Races and Games": 40,
  "Stocks and Shares": 41,
  "True Discount": 42,
  "Banker's Discount": 43,
  "Odd Man Out and Series": 44,

  // Logical Reasoning
  "Number Series": 45,
  "Letter and Symbol Series": 46,
  "Verbal Classification": 47,
  "Essential Part": 48,
  "Analogies": 49,
  "Artificial Language": 50,
  "Matching Definitions": 51,
  "Making Judgments": 52,
  "Verbal Reasoning": 53,
  "Logical Problems": 54,
  "Logical Games": 55,
  "Analyzing Arguments": 56,
  "Statement and Assumption": 57,
  "Course of Action": 58,
  "Statement and Conclusion": 59,
  "Theme Detection": 60,
  "Cause and Effect": 61,
  "Statement and Argument": 62,
  "Logical Deduction": 63,
  "Blood Relations": 7,
  "Seating Arrangement": 8,
  "Coding-Decoding": 9,
  "Syllogisms": 10,
  "Puzzles": 11,

  // Verbal Ability
  "Grammar": 41,
  "Reading Comprehension": 42,
  "Vocabulary": 43,
  "Sentence Correction": 44,
  "Spotting Errors": 64,
  "Synonyms": 65,
  "Antonyms": 66,
  "Selecting Words": 67,
  "Spellings": 68,
  "Sentence Formation": 69,
  "Ordering of Words": 70,
  "Sentence Improvement": 71,
  "Completing Statements": 72,
  "Ordering of Sentences": 73,
  "Paragraph Formation": 74,
  "Closet Test": 75,
  "Comprehension": 76,
  "One Word Substitutes": 77,
  "Idioms and Phrases": 78,
  "Change of Voice": 79,
  "Change of Speech": 80,
  "Verbal Analogies": 81,
};

export type PrepCategory = "Quantitative Aptitude" | "Logical Reasoning" | "Verbal Ability" | "All";

interface PlacementPrepModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialCategory?: PrepCategory | null;
  hasPlacementAccessOverride?: boolean;
}

const PLACEMENT_PREP_DATA = {
  aptitude: [
    {
      category: "Quantitative Aptitude",
      icon: Calculator,
      color: "from-[#FEF9C3] via-[#FFFBEB] to-[#FEF08A]/80",
      borderColor: "border-amber-300/80",
      iconBg: "bg-amber-400 text-slate-950",
      itemBorder: "border-amber-200/90 hover:border-amber-400 hover:bg-amber-50/50",
      badgeColor: "text-amber-900 bg-amber-100/90 border-amber-200/80",
      footerColor: "text-amber-900 hover:text-amber-950",
      description: "A comprehensive test to evaluate technical skills and problem-solving abilities.",
      topics: [
        { name: "Percentages", status: "Ready" },
        { name: "Profit & Loss", status: "Ready" },
        { name: "Time & Work", status: "Ready" },
        { name: "Time, Speed & Distance", status: "Ready" },
        { name: "Problems on Trains", status: "Ready" },
        { name: "Simple Interest", status: "Ready" },
        { name: "Compound Interest", status: "Ready" },
        { name: "Problems on Ages", status: "Ready" },
        { name: "Partnership", status: "Ready" },
        { name: "Probability", status: "Ready" },
        { name: "Permutations & Combinations", status: "Ready" },
        { name: "Height & Distance", status: "Ready" },
        { name: "Calendar", status: "Ready" },
        { name: "Clock", status: "Ready" },
        { name: "Average", status: "Ready" },
        { name: "Area", status: "Ready" },
        { name: "Volume and Surface Area", status: "Ready" },
        { name: "Numbers", status: "Ready" },
        { name: "Problems on Numbers", status: "Ready" },
        { name: "Problems on H.C.F and L.C.M", status: "Ready" },
        { name: "Decimal Fraction", status: "Ready" },
        { name: "Simplification", status: "Ready" },
        { name: "Square Root and Cube Root", status: "Ready" },
        { name: "Surds and Indices", status: "Ready" },
        { name: "Ratio and Proportion", status: "Ready" },
        { name: "Chain Rule", status: "Ready" },
        { name: "Pipes and Cistern", status: "Ready" },
        { name: "Boats and Streams", status: "Ready" },
        { name: "Alligation or Mixture", status: "Ready" },
        { name: "Logarithm", status: "Ready" },
        { name: "Races and Games", status: "Ready" },
        { name: "Stocks and Shares", status: "Ready" },
        { name: "True Discount", status: "Ready" },
        { name: "Banker's Discount", status: "Ready" },
        { name: "Odd Man Out and Series", status: "Ready" },
      ],
    },
    {
      category: "Logical Reasoning",
      icon: Brain,
      color: "from-[#EDE9FE] via-[#F5F3FF] to-[#DDD6FE]/80",
      borderColor: "border-purple-300/80",
      iconBg: "bg-gradient-to-br from-violet-500 to-purple-600 text-white shadow-xs",
      itemBorder: "border-purple-200/80 hover:border-purple-500 hover:bg-purple-50/50",
      badgeColor: "text-purple-700 bg-purple-100/90 border-purple-200/90",
      footerColor: "text-purple-600 hover:text-purple-800",
      description: "Analytical reasoning, pattern recognition, and critical deduction assessments.",
      topics: [
        { name: "Number Series", status: "Ready" },
        { name: "Letter and Symbol Series", status: "Ready" },
        { name: "Verbal Classification", status: "Ready" },
        { name: "Essential Part", status: "Ready" },
        { name: "Analogies", status: "Ready" },
        { name: "Artificial Language", status: "Ready" },
        { name: "Matching Definitions", status: "Ready" },
        { name: "Making Judgments", status: "Ready" },
        { name: "Verbal Reasoning", status: "Ready" },
        { name: "Logical Problems", status: "Ready" },
        { name: "Logical Games", status: "Ready" },
        { name: "Analyzing Arguments", status: "Ready" },
        { name: "Statement and Assumption", status: "Ready" },
        { name: "Course of Action", status: "Ready" },
        { name: "Statement and Conclusion", status: "Ready" },
        { name: "Theme Detection", status: "Ready" },
        { name: "Cause and Effect", status: "Ready" },
        { name: "Statement and Argument", status: "Ready" },
        { name: "Logical Deduction", status: "Ready" },
        { name: "Blood Relations", status: "Ready" },
        { name: "Seating Arrangement", status: "Ready" },
        { name: "Coding-Decoding", status: "Ready" },
        { name: "Syllogisms", status: "Ready" },
        { name: "Puzzles", status: "Ready" },
      ],
    },
    {
      category: "Verbal Ability",
      icon: MessageSquare,
      color: "from-[#DCFCE7] via-[#F0FDF4] to-[#BBF7D0]/80",
      borderColor: "border-emerald-300/80",
      iconBg: "bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-xs",
      itemBorder: "border-emerald-200/80 hover:border-emerald-500 hover:bg-emerald-50/50",
      badgeColor: "text-emerald-700 bg-emerald-100/90 border-emerald-200/90",
      footerColor: "text-emerald-600 hover:text-emerald-800",
      description: "English grammar, vocabulary mastery, comprehension, and sentence structuring.",
      topics: [
        { name: "Spotting Errors", status: "Ready" },
        { name: "Synonyms", status: "Ready" },
        { name: "Antonyms", status: "Ready" },
        { name: "Selecting Words", status: "Ready" },
        { name: "Spellings", status: "Ready" },
        { name: "Sentence Formation", status: "Ready" },
        { name: "Ordering of Words", status: "Ready" },
        { name: "Sentence Correction", status: "Ready" },
        { name: "Sentence Improvement", status: "Ready" },
        { name: "Completing Statements", status: "Ready" },
        { name: "Ordering of Sentences", status: "Ready" },
        { name: "Paragraph Formation", status: "Ready" },
        { name: "Closet Test", status: "Ready" },
        { name: "Comprehension", status: "Ready" },
        { name: "One Word Substitutes", status: "Ready" },
        { name: "Idioms and Phrases", status: "Ready" },
        { name: "Change of Voice", status: "Ready" },
        { name: "Change of Speech", status: "Ready" },
        { name: "Verbal Analogies", status: "Ready" },
        { name: "Grammar", status: "Ready" },
        { name: "Reading Comprehension", status: "Ready" },
        { name: "Vocabulary", status: "Ready" },
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

export default function PlacementPrepModal({
  isOpen,
  onClose,
  initialCategory = null,
  hasPlacementAccessOverride,
}: PlacementPrepModalProps) {
  const { canAccess } = useSubscription();
  const { openPricingModal } = usePricingModal();
  const hasPlacementAccess = hasPlacementAccessOverride ?? canAccess("placement_prep");
  const [activeTab, setActiveTab] = useState<"aptitude" | "mockTests">("aptitude");
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null);
  const [mounted, setMounted] = useState<boolean>(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Filter sections according to initialCategory
  const filteredAptitudeSections = React.useMemo(() => {
    if (!initialCategory || initialCategory === "All") {
      return PLACEMENT_PREP_DATA.aptitude;
    }
    const catLower = initialCategory.toLowerCase();
    return PLACEMENT_PREP_DATA.aptitude.filter((sec) => {
      const secLower = sec.category.toLowerCase();
      if (catLower.includes("quant") && secLower.includes("quant")) return true;
      if (catLower.includes("reason") && secLower.includes("reason")) return true;
      if (catLower.includes("verbal") && secLower.includes("verbal")) return true;
      return secLower === catLower;
    });
  }, [initialCategory]);

  // Practice State
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [userAnswers, setUserAnswers] = useState<Record<number, number>>({});
  const [questionTimes, setQuestionTimes] = useState<Record<number, number>>({});
  const [showCorrectOptionMap, setShowCorrectOptionMap] = useState<Record<number, boolean>>({});
  const [showSolutionMap, setShowSolutionMap] = useState<Record<number, boolean>>({});
  const [dbQuestionsMap, setDbQuestionsMap] = useState<Record<string, LegacyPlacementQuestion[]>>({});
  const [isLoadingTopicQuestions, setIsLoadingTopicQuestions] = useState<boolean>(false);
  const [revealedSolutions, setRevealedSolutions] = useState<Record<number, { solution?: string; correctIndex?: number; isCorrect: boolean }>>({});
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

  const startTopicQuiz = (topicName: string, startIdx: number = 0) => {
    setSelectedTopic(topicName);
    setCurrentIndex(startIdx);
    setUserAnswers({});
    setQuestionTimes({});
    setShowCorrectOptionMap({});
    setShowSolutionMap({});
    setRevealedSolutions({});
    setPracticeViewMode("card");
    setQuestionTimerSeconds(0);
    setQuizFinished(false);
  };

  // Aggregated live progress statistics per category (dynamic, zero hardcoding)
  const [userProgressMap, setUserProgressMap] = useState<Record<string, UserTopicProgress>>({});
  const [categoryStats, setCategoryStats] = useState<Record<string, {
    totalQuestions: number;
    solvedCount: number;
    startedCount: number;
    totalAttempts: number;
    accuracy: number;
    progressPercent: number;
  }>>({});

  const refreshCategoryStats = React.useCallback(async () => {
    const statsRecord: Record<string, {
      totalQuestions: number;
      solvedCount: number;
      startedCount: number;
      totalAttempts: number;
      accuracy: number;
      progressPercent: number;
    }> = {};

    for (const section of PLACEMENT_PREP_DATA.aptitude) {
      let totalQuestions = 0;
      let solvedCount = 0;
      let startedCount = 0;
      let totalAttempts = 0;
      let correctCount = 0;

      for (const t of section.topics) {
        const prog = userProgressMap[t.name];
        const qList = dbQuestionsMap[t.name] || [];
        const tCount = prog?.total_questions || qList.length || 0;
        totalQuestions += tCount;

        const attempted = prog?.attempted_count || 0;
        const solved = prog?.solved_count || 0;

        if (attempted > 0) {
          startedCount += 1;
          totalAttempts += attempted;
          solvedCount += attempted;
          correctCount += solved;
        } else {
          try {
            const storageKey = `skillscatalyst_aptitude_progress_${t.name}`;
            const saved = typeof window !== "undefined" ? localStorage.getItem(storageKey) : null;
            if (saved) {
              const parsed = JSON.parse(saved);
              const savedAns: Record<number, number> = parsed.userAnswers || {};
              const count = Object.keys(savedAns).length;
              if (count > 0) {
                startedCount += 1;
                totalAttempts += count;
                solvedCount += count;
              }
            }
          } catch (_) {}
        }
      }

      // Check current answers in active topic if not yet written to localStorage
      if (selectedTopic && section.topics.some((t) => t.name === selectedTopic)) {
        const currentAnsKeys = Object.keys(userAnswers);
        if (currentAnsKeys.length > 0) {
          startedCount = Math.max(startedCount, 1);
        }
      }

      const accuracy = solvedCount > 0 ? (correctCount / solvedCount) * 100 : 0;
      const progressPercent = totalQuestions > 0 ? Math.min(100, Math.round((solvedCount / totalQuestions) * 100)) : 0;

      statsRecord[section.category] = {
        totalQuestions,
        solvedCount,
        startedCount,
        totalAttempts,
        accuracy,
        progressPercent,
      };
    }

    setCategoryStats(statsRecord);
  }, [selectedTopic, userAnswers, userProgressMap, dbQuestionsMap]);

  useEffect(() => {
    if (isOpen) {
      getUserTopicProgress()
        .then((map) => {
          if (map && Object.keys(map).length > 0) {
            setUserProgressMap(map);
          }
        })
        .catch(() => {});
      refreshCategoryStats();
    }
  }, [isOpen, refreshCategoryStats]);

  // Image 1 Reference: Topic Explorer & Filter States
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<string>("all");
  const [selectedSort, setSelectedSort] = useState<string>("default");
  const [quickFilterTab, setQuickFilterTab] = useState<"all" | "bookmarks" | "attempted" | "solved">("all");
  const [bookmarkedTopicKeys, setBookmarkedTopicKeys] = useState<Record<string, boolean>>({});

  useEffect(() => {
    getUserTopicBookmarks()
      .then((saved) => {
        if (saved && Object.keys(saved).length > 0) {
          setBookmarkedTopicKeys(saved);
        }
      })
      .catch(() => {
        try {
          const saved = localStorage.getItem("skillscatalyst_bookmarked_topics");
          if (saved) setBookmarkedTopicKeys(JSON.parse(saved));
        } catch (_) {}
      });
  }, []);

  const toggleTopicBookmark = (topicName: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setBookmarkedTopicKeys((prev) => {
      const isBookmarked = !prev[topicName];
      toggleDbTopicBookmark(topicName, topicName, !isBookmarked).catch(() => {});
      return { ...prev, [topicName]: isBookmarked };
    });
  };

  // Dynamic topic aggregator per section with live question counts, attempts & solve status
  const getFilteredTopicsForSection = React.useCallback(
    (sectionTopics: { name: string; status: string }[]) => {
      const topicItems = sectionTopics.map((t) => {
        const topicName = t.name;
        const prog = userProgressMap[topicName];
        const qArray = dbQuestionsMap[topicName] || [];
        const questionCount = prog?.total_questions || qArray.length || 0;
        let localAnsCount = 0;
        try {
          const saved = typeof window !== "undefined" ? localStorage.getItem(`skillscatalyst_aptitude_progress_${topicName}`) : null;
          if (saved) {
            localAnsCount = Object.keys(JSON.parse(saved).userAnswers || {}).length;
          }
        } catch (_) {}

        const attemptedCount = prog?.attempted_count || localAnsCount;
        const solvedCount = prog?.solved_count || 0;
        const isSolved = attemptedCount > 0 && solvedCount === questionCount && questionCount > 0;
        const isAttempted = attemptedCount > 0;

        return {
          name: topicName,
          questionCount,
          attemptedCount,
          solvedCount,
          isSolved,
          isAttempted,
          isBookmarked: !!bookmarkedTopicKeys[topicName],
          points: questionCount * 10,
        };
      });

      return topicItems
        .filter((item) => {
          // Quick filter tab
          if (quickFilterTab === "bookmarks" && !item.isBookmarked) return false;
          if (quickFilterTab === "attempted" && !item.isAttempted) return false;
          if (quickFilterTab === "solved" && !item.isSolved) return false;

          // Search Query
          if (searchQuery.trim()) {
            const q = searchQuery.toLowerCase();
            const matchTopic = item.name.toLowerCase().includes(q);
            if (!matchTopic) return false;
          }

          // Status Dropdown
          if (selectedStatusFilter === "solved" && !item.isSolved) return false;
          if (selectedStatusFilter === "attempted" && !item.isAttempted) return false;
          if (selectedStatusFilter === "unattempted" && item.isAttempted) return false;

          return true;
        })
        .sort((a, b) => {
          if (selectedSort === "name") return a.name.localeCompare(b.name);
          if (selectedSort === "questions") return b.questionCount - a.questionCount;
          return 0; // default order
        });
    },
    [dbQuestionsMap, bookmarkedTopicKeys, quickFilterTab, searchQuery, selectedStatusFilter, selectedSort]
  );

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
    // 2. Sync from Supabase DB via clean data-access layer
    const syncDatabaseProgress = async () => {
      try {
        const { answers, times, solutions } = await getLegacyTopicAttempts(selectedTopic);
        if (Object.keys(answers).length > 0) {
          setUserAnswers((prev) => ({ ...answers, ...prev }));
          setQuestionTimes((prev) => ({ ...times, ...prev }));
        }
        if (solutions && Object.keys(solutions).length > 0) {
          setRevealedSolutions((prev) => ({ ...solutions, ...prev }));
        }
      } catch (err) {
        console.warn("Failed to sync database attempts:", err);
      }
    };

    syncDatabaseProgress();
  }, [selectedTopic]);

  // Load questions dynamically from Supabase PostgreSQL (cached via in-memory aptitudeCache)
  // Falls back to static question bank if offline or unavailable.
  useEffect(() => {
    if (!selectedTopic) return;

    let isMounted = true;
    const loadQuestions = async () => {
      if (dbQuestionsMap[selectedTopic] && dbQuestionsMap[selectedTopic].length > 0) {
        return;
      }
      try {
        setIsLoadingTopicQuestions(true);
        const fetched = await getQuestionsByTopicName(selectedTopic);
        if (isMounted && fetched && fetched.length > 0) {
          const legacyFormatted = toLegacyQuestions(fetched);
          setDbQuestionsMap((prev) => ({
            ...prev,
            [selectedTopic]: legacyFormatted,
          }));
        }
      } catch (err) {
        console.warn(`[Aptitude] Supabase fetch failed for "${selectedTopic}", using fallback:`, err);
      } finally {
        if (isMounted) setIsLoadingTopicQuestions(false);
      }
    };

    loadQuestions();
    return () => {
      isMounted = false;
    };
  }, [selectedTopic, dbQuestionsMap]);

  // Questions for current topic loaded securely from Supabase PostgreSQL via get_topic_questions RPC
  const questionsList: LegacyPlacementQuestion[] = React.useMemo(() => {
    if (!selectedTopic) return [];
    return dbQuestionsMap[selectedTopic] || [];
  }, [selectedTopic, dbQuestionsMap]);

  const currentQ = questionsList[currentIndex] || questionsList[0];
  const totalQuestions = questionsList.length;
  const answeredCount = Object.keys(userAnswers).length;
  const correctCount = questionsList.reduce((acc, q) => {
    return revealedSolutions[q.id]?.isCorrect ? acc + 1 : acc;
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
    timeSpentSec: number,
    updatedAnswers: Record<number, number>,
    updatedTimes: Record<number, number>,
    targetQ?: LegacyPlacementQuestion
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

    // 2. Data-Access Layer: Supabase RPC (Server-side validation & answer protection)
    try {
      let optId: string | undefined;
      if (targetQ && targetQ.dbOptions && targetQ.dbOptions.length > 0) {
        optId = (targetQ.dbOptions as any[]).find((o: any) => o.display_order === optionIdx)?.id;
      }

      const rpcResult = await recordLegacyAttempt(
        topicName,
        questionId,
        optionIdx,
        false,
        timeSpentSec,
        targetQ?.dbId,
        optId
      );

      if (rpcResult) {
        let resolvedCorrectIdx = 0;
        if (targetQ && targetQ.dbOptions && targetQ.dbOptions.length > 0) {
          const foundIdx = (targetQ.dbOptions as any[]).findIndex((o: any) => o.id === rpcResult.correct_option_id);
          if (foundIdx !== -1) resolvedCorrectIdx = foundIdx;
        }

        setRevealedSolutions((prev) => ({
          ...prev,
          [questionId]: {
            solution: rpcResult.explanation,
            correctIndex: resolvedCorrectIdx,
            isCorrect: rpcResult.is_correct,
          },
        }));
      }

      // 3. Keep backend telemetry updated for career stats
      const { data: authData } = await supabase.auth.getUser();
      const userId = authData.user?.id;
      const topicId = TOPIC_ID_MAP[topicName] || 1;
      if (userId) {
        getAuthHeaders().then((headers) => {
          apiFetch(`${API_BASE}/api/practice/aptitude/attempt`, {
            method: "POST",
            headers: { "Content-Type": "application/json", ...headers },
            body: JSON.stringify({
              user_id: userId,
              topic_id: topicId,
              question_id: questionId,
              selected_option_index: optionIdx,
              is_correct: rpcResult?.is_correct ?? false,
              time_taken_seconds: timeSpentSec,
            }),
          }).catch(() => {});
        });
      }

      refreshCategoryStats();
    } catch (err) {
      console.warn("Database persist warning:", err);
    }
  };

  const handleSelectOption = (questionId: number, optionIdx: number) => {
    if (quizFinished || userAnswers[questionId] !== undefined) return;
    const timeSpent = questionTimes[questionId] !== undefined ? questionTimes[questionId] : questionTimerSeconds;
    const targetQ = questionsList.find((item) => item.id === questionId);

    const newAnswers = { ...userAnswers, [questionId]: optionIdx };
    const newTimes = { ...questionTimes, [questionId]: timeSpent };

    setUserAnswers(newAnswers);
    setQuestionTimes(newTimes);

    if (selectedTopic) {
      persistAttempt(selectedTopic, questionId, optionIdx, timeSpent, newAnswers, newTimes, targetQ);
    }
  };

  const handleRetryQuestion = async (questionId: number) => {
    const newAnswers = { ...userAnswers };
    delete newAnswers[questionId];

    const newTimes = { ...questionTimes };
    delete newTimes[questionId];

    const newRevealed = { ...revealedSolutions };
    delete newRevealed[questionId];

    const newCorrectMap = { ...showCorrectOptionMap };
    delete newCorrectMap[questionId];

    const newSolMap = { ...showSolutionMap };
    delete newSolMap[questionId];

    setUserAnswers(newAnswers);
    setQuestionTimes(newTimes);
    setRevealedSolutions(newRevealed);
    setShowCorrectOptionMap(newCorrectMap);
    setShowSolutionMap(newSolMap);
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
      <div className="fixed inset-0 z-[9999] bg-white dark:bg-black select-none overflow-hidden flex flex-col shadow-2xl">
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.98 }}
          transition={{ duration: 0.2 }}
          role="dialog"
          aria-modal="true"
          aria-label={selectedTopic ? `${selectedTopic} Practice Quiz` : "Placement Prep Quiz Catalog"}
          className="bg-white dark:bg-black w-full h-full flex flex-col overflow-hidden"
        >
          {/* Sleek Floating Close Button for Main View */}
          {!selectedTopic && (
            <button
              onClick={onClose}
              className="fixed top-4 right-4 sm:top-5 sm:right-6 z-50 px-3.5 py-1.5 rounded-xl bg-slate-900/90 hover:bg-slate-900 text-white text-xs font-black transition-all border border-slate-700/80 shadow-lg backdrop-blur-md cursor-pointer flex items-center gap-1.5 active:scale-95"
              aria-label="Close modal"
            >
              <span>Close</span>
              <X className="w-4 h-4" />
            </button>
          )}

          {/* Compact Header Bar (Only visible during active Topic Practice / Quiz Mode) */}
          {selectedTopic && (
            <div className="px-3 py-2 sm:px-6 sm:py-3.5 border-b border-slate-200 dark:border-neutral-800 bg-white dark:bg-[#18191F] flex items-center justify-between gap-2.5 shrink-0 shadow-2xs">
              <div className="flex items-center gap-2 sm:gap-3.5 min-w-0 flex-1">
                <button
                  onClick={() => setSelectedTopic(null)}
                  className="px-2.5 py-1.5 rounded-lg bg-slate-100 dark:bg-[#121318] hover:bg-slate-200 dark:hover:bg-[#20222A] text-slate-800 dark:text-white transition-all flex items-center gap-1 text-xs font-black cursor-pointer border border-slate-200/80 dark:border-neutral-800 shrink-0 active:scale-95 shadow-2xs"
                  aria-label="Back to Topics"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Back to Topics</span>
                  <span className="sm:hidden">Back</span>
                </button>
                <div className="min-w-0 flex-1">
                  <h2 className="text-xs sm:text-base font-extrabold text-slate-900 dark:text-white tracking-tight truncate leading-tight">
                    {selectedTopic} Practice
                  </h2>
                  <p className="text-[10px] sm:text-xs text-slate-500 dark:text-neutral-400 font-medium truncate hidden sm:block mt-0.5">
                    {totalQuestions} Questions • Practice Mode
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
                {/* Practice View Switcher */}
                {!quizFinished && (
                  <div className="flex items-center gap-1 bg-slate-100 dark:bg-[#121318] p-1 rounded-xl border border-slate-200 dark:border-neutral-800 text-[10px] sm:text-xs font-bold">
                    <button
                      onClick={() => setPracticeViewMode("card")}
                      className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer font-black ${
                        practiceViewMode === "card"
                          ? "bg-slate-900 dark:bg-[#20222A] text-white shadow-xs"
                          : "text-slate-600 dark:text-neutral-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/60 dark:hover:bg-[#18191F]"
                      }`}
                    >
                      Single
                    </button>
                    <button
                      onClick={() => setPracticeViewMode("sheet")}
                      className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer font-black ${
                        practiceViewMode === "sheet"
                          ? "bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-xs"
                          : "text-slate-600 dark:text-neutral-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/60 dark:hover:bg-[#18191F]"
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
          )}

          {/* Topic Selection & Practice Flow */}
          <>
              {/* Main Topic Selection View */}
              {!selectedTopic && (
                <>
                  {/* Content Body */}
                  <div className="p-4 sm:p-6 md:p-8 pt-5 sm:pt-6 overflow-y-auto flex-1 space-y-6 bg-[#f4f6f3] dark:bg-black">
                    {activeTab === "aptitude" && (
                      <div className="max-w-5xl mx-auto w-full space-y-6">
                        {filteredAptitudeSections.map((section, idx) => {
                      const Icon = section.icon;
                      const isQuantitative = section.category === "Quantitative Aptitude";
                      const isLogicalReasoning = section.category === "Logical Reasoning";
                      const isVerbalAbility = section.category === "Verbal Ability";

                      const heroCardTheme = isQuantitative
                        ? "bg-gradient-to-br from-[#FEF9C3] via-[#FFFBEB] to-[#FEF08A]/80 border border-amber-300/80 shadow-amber-950/5"
                        : isLogicalReasoning
                        ? "bg-gradient-to-br from-[#EDE9FE] via-[#F5F3FF] to-[#DDD6FE]/80 border border-purple-300/80 shadow-purple-950/5"
                        : "bg-gradient-to-br from-[#DCFCE7] via-[#F0FDF4] to-[#BBF7D0]/80 border border-emerald-300/80 shadow-emerald-950/5";

                      // Derive dynamic stats (zero hardcoded numbers)
                      const stats = categoryStats[section.category] || {
                        totalQuestions: section.topics.reduce(
                          (acc, t) => acc + (userProgressMap[t.name]?.total_questions || dbQuestionsMap[t.name]?.length || 0),
                          0
                        ),
                        solvedCount: 0,
                        startedCount: 0,
                        totalAttempts: 0,
                        accuracy: 0,
                        progressPercent: 0,
                      };

                      return (
                        <React.Fragment key={section.category}>
                          <motion.div
                            initial={{ opacity: 0, y: 15 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.1 }}
                            className={`p-4 sm:p-5 md:p-6 rounded-[20px] sm:rounded-[24px] relative overflow-hidden flex flex-col justify-between shadow-md transition-all ${heroCardTheme}`}
                          >
                            {/* Dot Matrix Pattern Overlay for Engineering Tech Aesthetic */}
                            <div
                              className="absolute inset-0 pointer-events-none opacity-30"
                              style={{
                                backgroundImage: isQuantitative
                                  ? "radial-gradient(#b45309 0.75px, transparent 0.75px)"
                                  : section.category === "Logical Reasoning"
                                  ? "radial-gradient(#7c3aed 0.75px, transparent 0.75px)"
                                  : "radial-gradient(#059669 0.75px, transparent 0.75px)",
                                backgroundSize: "20px 20px",
                              }}
                            />

                            {/* ── UPPER HERO ROW (Matching Image 2 Layout) ── */}
                            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5 lg:gap-6 relative z-10">
                              {/* Left: Icon Squircle + Title + Description */}
                              <div className="flex items-center gap-3.5 sm:gap-5 flex-1 min-w-0">
                                {/* Squircle Badge Container */}
                                <div
                                  className={`w-13 h-13 sm:w-16 sm:h-16 rounded-xl sm:rounded-2xl flex items-center justify-center shrink-0 shadow-2xs ${
                                    isQuantitative
                                      ? "bg-amber-200/70 border border-amber-300/90"
                                      : section.category === "Logical Reasoning"
                                      ? "bg-purple-200/70 border border-purple-300/90"
                                      : "bg-emerald-200/70 border border-emerald-300/90"
                                  }`}
                                >
                                  {isQuantitative ? (
                                    <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-amber-400 border border-amber-500/40 flex items-center justify-center font-black text-slate-950 text-base sm:text-lg shadow-xs tracking-tight">
                                      QA
                                    </div>
                                  ) : section.category === "Logical Reasoning" ? (
                                    <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 border border-purple-500/40 flex items-center justify-center font-black text-white text-base sm:text-lg shadow-xs tracking-tight">
                                      LR
                                    </div>
                                  ) : (
                                    <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 border border-emerald-500/40 flex items-center justify-center font-black text-white text-base sm:text-lg shadow-xs tracking-tight">
                                      VA
                                    </div>
                                  )}
                                </div>

                                <div className="flex-1 min-w-0">
                                  <h2 className="text-xl sm:text-2xl lg:text-3xl font-black text-slate-900 tracking-tight leading-tight">
                                    {section.category}
                                  </h2>

                                  <p className="text-xs sm:text-sm text-slate-700 font-medium max-w-lg mt-1 leading-relaxed">
                                    {section.description || "A comprehensive test to evaluate technical skills and problem-solving abilities."}
                                  </p>
                                </div>
                              </div>

                              {/* Right: "Your Progress" Card (Black Background + White Circular Tracker + Dynamic Metrics) */}
                              <div className="bg-[#0A0D14] text-white rounded-xl sm:rounded-2xl p-3.5 sm:p-4 border border-neutral-800 shadow-xl min-w-[260px] sm:min-w-[280px] md:min-w-[300px] shrink-0 relative z-10">
                                <div className="flex items-center justify-between pb-2 mb-2.5 border-b border-white/10">
                                  <h3 className="text-white font-extrabold text-xs sm:text-sm tracking-tight">
                                    Your Progress
                                  </h3>
                                </div>

                                <div className="flex items-center justify-between gap-3.5 sm:gap-5">
                                  {/* Left: White Circular Progress Tracker */}
                                  <div className="relative w-15 h-15 sm:w-17 sm:h-17 shrink-0 flex items-center justify-center">
                                    <svg className="w-full h-full -rotate-90 transform" viewBox="0 0 80 80">
                                      {/* Track circle (translucent white) */}
                                      <circle
                                        cx="40"
                                        cy="40"
                                        r="32"
                                        className="stroke-white/15"
                                        strokeWidth="5.5"
                                        fill="transparent"
                                      />
                                      {/* Tracker circle (White colour) */}
                                      <circle
                                        cx="40"
                                        cy="40"
                                        r="32"
                                        stroke="#ffffff"
                                        strokeWidth="5.5"
                                        strokeDasharray={201.06}
                                        strokeDashoffset={201.06 - (stats.progressPercent / 100) * 201.06}
                                        strokeLinecap="round"
                                        fill="transparent"
                                        className="transition-all duration-700 ease-out"
                                      />
                                    </svg>

                                    <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                                      <span className="text-sm sm:text-base font-black text-white leading-none">
                                        {stats.progressPercent}%
                                      </span>
                                      <span className="text-[8px] sm:text-[9px] text-neutral-400 font-medium mt-0.5">
                                        Complete
                                      </span>
                                    </div>
                                  </div>

                                  {/* Right: Dynamic Metrics breakdown (Zero hardcoded values) */}
                                  <div className="flex flex-col justify-between py-0 text-[11px] sm:text-xs space-y-1 flex-1 min-w-[115px]">
                                    <div className="flex items-center justify-between gap-2.5">
                                      <span className="text-neutral-400 font-medium">Solved</span>
                                      <span className="font-black text-white">
                                        {stats.solvedCount}/{stats.totalQuestions}
                                      </span>
                                    </div>
                                    <div className="flex items-center justify-between gap-2.5">
                                      <span className="text-neutral-400 font-medium">Started</span>
                                      <span className="font-bold text-amber-400">
                                        {stats.startedCount}
                                      </span>
                                    </div>
                                    <div className="flex items-center justify-between gap-2.5">
                                      <span className="text-neutral-400 font-medium">Total Attempts</span>
                                      <span className="font-bold text-indigo-400">
                                        {stats.totalAttempts}
                                      </span>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </motion.div>

                          {/* ── TOPICS EXPLORER & LIST FOR THIS SECTION ── */}
                          {(() => {
                            const sectionTopicList = getFilteredTopicsForSection(section.topics);
                            return (
                              <div className="space-y-4">
                                {/* Search & Filter Toolbar Card */}
                                <div className="bg-white dark:bg-[#18191F] rounded-xl sm:rounded-2xl border border-slate-200/90 dark:border-neutral-800 p-2.5 sm:p-4 shadow-xs">
                                  <div className="flex flex-col md:flex-row items-stretch md:items-center gap-2 sm:gap-3">
                                    {/* Search Input */}
                                    <div className="relative flex-1 min-w-0">
                                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 sm:w-4 sm:h-4 text-slate-400 dark:text-neutral-500" />
                                      <input
                                        type="text"
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        placeholder={`Search in ${section.category}...`}
                                        className="w-full pl-8 sm:pl-10 pr-7 sm:pr-8 py-2 sm:py-2.5 text-xs sm:text-sm bg-white dark:bg-[#121318] border border-slate-200 dark:border-neutral-800 rounded-lg sm:rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 transition-all font-medium text-slate-800 dark:text-white placeholder:text-slate-400 dark:placeholder:text-neutral-500"
                                      />
                                      {searchQuery && (
                                        <button
                                          type="button"
                                          onClick={() => setSearchQuery("")}
                                          className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-neutral-500 hover:text-slate-600 dark:hover:text-white"
                                        >
                                          <X className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                                        </button>
                                      )}
                                    </div>

                                    {/* Status + Sort By + Pick Random */}
                                    <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
                                      {/* Status Dropdown */}
                                      <select
                                        value={selectedStatusFilter}
                                        onChange={(e) => setSelectedStatusFilter(e.target.value)}
                                        className="flex-1 sm:flex-initial px-2 sm:px-3.5 py-1.5 sm:py-2.5 bg-white dark:bg-[#121318] border border-slate-200 dark:border-neutral-800 rounded-lg sm:rounded-xl text-[11px] sm:text-sm font-semibold text-slate-700 dark:text-white hover:border-slate-300 dark:hover:border-neutral-700 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 cursor-pointer min-w-0"
                                      >
                                        <option value="all" className="dark:bg-[#121318] dark:text-white">Status</option>
                                        <option value="solved" className="dark:bg-[#121318] dark:text-white">Solved</option>
                                        <option value="attempted" className="dark:bg-[#121318] dark:text-white">Attempted</option>
                                        <option value="unattempted" className="dark:bg-[#121318] dark:text-white">Unattempted</option>
                                      </select>

                                      {/* Sort By Dropdown */}
                                      <select
                                        value={selectedSort}
                                        onChange={(e) => setSelectedSort(e.target.value)}
                                        className="flex-1 sm:flex-initial px-2 sm:px-3.5 py-1.5 sm:py-2.5 bg-white dark:bg-[#121318] border border-slate-200 dark:border-neutral-800 rounded-lg sm:rounded-xl text-[11px] sm:text-sm font-semibold text-slate-700 dark:text-white hover:border-slate-300 dark:hover:border-neutral-700 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 cursor-pointer min-w-0"
                                      >
                                        <option value="default" className="dark:bg-[#121318] dark:text-white">Sort By</option>
                                        <option value="name" className="dark:bg-[#121318] dark:text-white">Topic A-Z</option>
                                        <option value="questions" className="dark:bg-[#121318] dark:text-white">Questions</option>
                                      </select>

                                      {/* Pick Random Action Button */}
                                      <button
                                        type="button"
                                        onClick={() => {
                                          if (sectionTopicList.length === 0) return;
                                          const rand = Math.floor(Math.random() * sectionTopicList.length);
                                          startTopicQuiz(sectionTopicList[rand].name, 0);
                                        }}
                                        className="bg-[#00A8CD] hover:bg-[#0891B2] text-white font-black text-[11px] sm:text-sm px-2.5 sm:px-4 py-1.5 sm:py-2.5 rounded-lg sm:rounded-xl transition-all shadow-xs flex items-center justify-center gap-1 sm:gap-1.5 cursor-pointer active:scale-95 shrink-0 whitespace-nowrap"
                                        title="Pick Random Topic"
                                      >
                                        <RotateCw className="w-3.5 h-3.5 shrink-0" />
                                        <span>Pick Random</span>
                                      </button>
                                    </div>
                                  </div>
                                </div>

                                {/* Topic Rows List Container */}
                                <div className="bg-white dark:bg-[#18191F] rounded-2xl border border-slate-200/90 dark:border-neutral-800 shadow-2xs divide-y divide-slate-100 dark:divide-neutral-800 overflow-hidden">
                                  {sectionTopicList.length === 0 ? (
                                    <div className="p-8 text-center text-slate-500 dark:text-neutral-400 text-sm">
                                      No topics match your current filters in {section.category}.
                                    </div>
                                  ) : (
                                    sectionTopicList.map((item) => (
                                      <div
                                        key={item.name}
                                        className="p-4 sm:p-5 flex items-center justify-between gap-4 hover:bg-slate-50/80 dark:hover:bg-[#20222A] transition-colors"
                                      >
                                        <div className="flex-1 min-w-0">
                                          <h4
                                            onClick={() => startTopicQuiz(item.name, 0)}
                                            className="text-sm sm:text-base font-black text-slate-900 dark:text-white hover:text-indigo-600 dark:hover:text-indigo-400 cursor-pointer transition-colors leading-snug"
                                          >
                                            {item.name}
                                          </h4>
                                          <div className="flex items-center gap-3 mt-1.5 flex-wrap">
                                            <span className="text-[11px] font-bold text-amber-600 dark:text-amber-400 flex items-center gap-1">
                                              <Zap className="w-3 h-3 fill-amber-500 text-amber-500" />
                                              {item.questionCount} Questions
                                            </span>
                                            <span className="text-[11px] font-medium text-slate-400 dark:text-neutral-400 flex items-center gap-1">
                                              <Clock className="w-3 h-3 text-slate-400 dark:text-neutral-400" />
                                              — {item.attemptedCount} attempted
                                            </span>
                                            {item.isSolved ? (
                                              <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/50 flex items-center gap-1">
                                                <Check className="w-2.5 h-2.5 stroke-[3]" /> Solved
                                              </span>
                                            ) : item.isAttempted ? (
                                              <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800/50 flex items-center gap-1">
                                                {item.solvedCount}/{item.questionCount} Solved
                                              </span>
                                            ) : null}
                                            {!hasPlacementAccess ? (
                                              <span className="text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-300/80 dark:border-amber-800/60 flex items-center gap-1 shadow-2xs">
                                                <Sparkles className="w-2.5 h-2.5 text-amber-600 dark:text-amber-400" />
                                                3 Free Questions
                                              </span>
                                            ) : null}
                                          </div>
                                        </div>

                                        <div className="flex items-center gap-2.5 shrink-0">
                                          <button
                                            type="button"
                                            onClick={(e) => toggleTopicBookmark(item.name, e)}
                                            aria-label={item.isBookmarked ? `Remove ${item.name} from bookmarks` : `Bookmark ${item.name}`}
                                            className={`p-2 rounded-xl transition-all cursor-pointer ${
                                              item.isBookmarked
                                                ? "bg-rose-50 dark:bg-rose-950/40 text-rose-500 dark:text-rose-400 hover:bg-rose-100 dark:hover:bg-rose-950/60"
                                                : "text-slate-300 dark:text-neutral-600 hover:text-slate-500 dark:hover:text-neutral-300 hover:bg-slate-100 dark:hover:bg-neutral-800"
                                            }`}
                                            title={item.isBookmarked ? "Remove Bookmark" : "Bookmark Topic"}
                                          >
                                            <Bookmark className={`w-4 h-4 ${item.isBookmarked ? "fill-rose-500 text-rose-500" : ""}`} />
                                          </button>
                                          <button
                                            type="button"
                                            onClick={() => startTopicQuiz(item.name, 0)}
                                            className="bg-[#0F172A] hover:bg-[#1E293B] dark:bg-[#121318] dark:hover:bg-[#20222A] dark:border dark:border-neutral-700 text-white font-extrabold text-xs sm:text-sm px-6 py-2.5 rounded-xl transition-all shadow-xs cursor-pointer active:scale-95 shrink-0"
                                          >
                                            {hasPlacementAccess ? "Solve" : "Try Free"}
                                          </button>
                                        </div>
                                      </div>
                                    ))
                                  )}
                                </div>
                              </div>
                            );
                          })()}
                        </React.Fragment>
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
                                  onClick={() => {
                                    if (!hasPlacementAccess) {
                                      openPricingModal();
                                    }
                                  }}
                                  className={`p-3.5 rounded-2xl bg-white dark:bg-[#18191F] border ${section.itemBorder} dark:border-neutral-800 transition-all space-y-1.5 group cursor-pointer shadow-2xs hover:shadow-md`}
                                >
                                  <div className="flex items-center justify-between">
                                    <span className="text-xs font-extrabold text-slate-900 dark:text-white group-hover:text-sky-700 dark:group-hover:text-sky-400">
                                      {test.name}
                                    </span>
                                    <div className="flex items-center gap-1.5">
                                      {!hasPlacementAccess && (
                                        <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-500/20 flex items-center gap-1">
                                          <Lock className="w-2.5 h-2.5" /> PRO
                                        </span>
                                      )}
                                      <span className={`text-[10px] font-black px-2.5 py-0.5 rounded-full ${section.badgeColor}`}>
                                        {test.duration}
                                      </span>
                                    </div>
                                  </div>
                                  <div className="text-[11px] text-slate-500 dark:text-neutral-400 font-semibold flex items-center justify-between">
                                    <span>{test.count}</span>
                                    <span className={`${section.footerColor} font-extrabold group-hover:underline`}>
                                      {hasPlacementAccess ? "Start Test →" : "Unlock with PRO →"}
                                    </span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>

                          <div className={`mt-6 pt-4 border-t border-slate-200/80 dark:border-neutral-800 flex items-center justify-between text-xs font-extrabold ${section.footerColor}`}>
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
            <div className="flex-1 flex flex-col overflow-hidden bg-[#f4f6f3] dark:bg-black">
              {/* If Practice is NOT finished */}
              {!quizFinished && (
                <>
                  {/* Mode A: Single Question Interactive View */}
                  {practiceViewMode === "card" && currentQ && (() => {
                    const isCurrentLocked = !hasPlacementAccess && currentIndex >= 3;

                    return (
                    <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
                      {/* Left Main Question Column */}
                      <div className="flex-1 p-6 md:p-8 overflow-y-auto flex flex-col justify-between space-y-6 bg-[#f4f6f3] dark:bg-black">
                        <div>
                          {/* Top Practice Progress Bar & Stopwatch */}
                          <div className="space-y-2.5 mb-6">
                            <div className="flex flex-wrap items-center justify-between gap-2 text-xs font-extrabold text-slate-700 dark:text-neutral-300">
                              <div className="flex items-center gap-2">
                                <span>Question {currentIndex + 1} of {totalQuestions}</span>
                                {!hasPlacementAccess && (
                                  <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-300/80 dark:border-amber-800/60 flex items-center gap-1 shadow-2xs">
                                    <Sparkles className="w-2.5 h-2.5 text-amber-600 dark:text-amber-400" />
                                    3 Free Questions
                                  </span>
                                )}
                              </div>
                              <div className="flex items-center gap-2 sm:gap-3">
                                <span className="flex items-center gap-1.5 text-amber-900 bg-amber-100/90 dark:bg-amber-950/40 dark:text-amber-300 px-3 py-1 rounded-full border border-amber-300/80 dark:border-amber-800/60 font-black text-[11px] sm:text-xs shadow-2xs">
                                  <Clock className="w-3.5 h-3.5 text-amber-700 dark:text-amber-400" />
                                  <span>{formatTimer(questionTimerSeconds)}</span>
                                </span>
                                <span className="text-purple-700 dark:text-purple-300 font-black text-xs bg-purple-100 dark:bg-purple-950/40 px-3 py-1 rounded-full border border-purple-200/80 dark:border-purple-800/60">
                                  {answeredCount}/{totalQuestions} Practiced
                                </span>
                              </div>
                            </div>
                            <div className="w-full bg-slate-200/90 dark:bg-neutral-800 h-2.5 rounded-full overflow-hidden border border-slate-300/50 dark:border-neutral-700">
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
                                const isLocked = !hasPlacementAccess && idx >= 3;
                                const hasAns = userAnswers[q.id] !== undefined;
                                const isCorr = revealedSolutions[q.id]?.isCorrect;
                                const isCur = idx === currentIndex;

                                let chipStyle = isLocked
                                  ? "bg-amber-50/70 dark:bg-amber-950/30 text-amber-700 dark:text-amber-400 border-amber-300/60 dark:border-amber-800/50 font-bold"
                                  : "bg-slate-100 dark:bg-[#121318] text-slate-700 dark:text-neutral-300 border-slate-200/90 dark:border-neutral-800 font-extrabold";
                                if (!isLocked && hasAns) {
                                  chipStyle = isCorr ? "bg-emerald-500 text-white border-emerald-600 font-black" : "bg-rose-500 text-white border-rose-600 font-black";
                                }

                                return (
                                  <button
                                    key={q.id}
                                    onClick={() => setCurrentIndex(idx)}
                                    className={`w-8 h-8 rounded-xl text-xs border shrink-0 transition-all flex items-center justify-center cursor-pointer ${chipStyle} ${
                                      isCur ? (isLocked ? "ring-2 ring-amber-500 ring-offset-1 scale-105" : "ring-2 ring-indigo-600 ring-offset-1 scale-105") : ""
                                    }`}
                                    title={isLocked ? `Question ${q.id} (PRO Locked)` : `Question ${q.id}`}
                                  >
                                    {isLocked ? <Lock className="w-3 h-3 text-amber-600 dark:text-amber-400" /> : q.id}
                                  </button>
                                );
                              })}
                            </div>
                          </div>

                          {/* In-Flow Content: Locked Teaser Card vs Unlocked Question Box & Options */}
                          {isCurrentLocked ? (
                            <div className="p-8 sm:p-10 rounded-3xl border border-amber-500/30 bg-gradient-to-b from-amber-500/10 via-purple-500/5 to-white dark:to-[#18191F] text-center space-y-6 shadow-md mb-6">
                              <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-amber-500 to-amber-400 text-slate-950 flex items-center justify-center mx-auto shadow-md">
                                <Lock className="w-8 h-8" />
                              </div>
                              <div className="space-y-2 max-w-lg mx-auto">
                                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 text-amber-700 dark:text-amber-300 text-xs font-black border border-amber-500/30">
                                  <Sparkles className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                                  <span>3 of {totalQuestions} Questions Unlocked (Sample)</span>
                                </div>
                                <h3 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
                                  Practice Question #{currentIndex + 1} is a PRO Feature
                                </h3>
                                <p className="text-xs sm:text-sm text-slate-600 dark:text-neutral-300 font-medium leading-relaxed">
                                  You have completed your free preview of <strong>{selectedTopic}</strong>! Upgrade to SkillsCatalyst PRO to unlock the remaining {Math.max(0, totalQuestions - 3)} questions, step-by-step solutions, formulas, and timed company mock tests.
                                </p>
                              </div>

                              {/* Value Highlights Grid */}
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-xl mx-auto text-left">
                                <div className="flex items-center gap-2.5 p-3 rounded-xl bg-white/80 dark:bg-[#121318] border border-slate-200/80 dark:border-neutral-800 text-xs font-bold text-slate-800 dark:text-neutral-200">
                                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                                  <span>All {totalQuestions} topic practice questions</span>
                                </div>
                                <div className="flex items-center gap-2.5 p-3 rounded-xl bg-white/80 dark:bg-[#121318] border border-slate-200/80 dark:border-neutral-800 text-xs font-bold text-slate-800 dark:text-neutral-200">
                                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                                  <span>Detailed step-by-step solutions & formulas</span>
                                </div>
                                <div className="flex items-center gap-2.5 p-3 rounded-xl bg-white/80 dark:bg-[#121318] border border-slate-200/80 dark:border-neutral-800 text-xs font-bold text-slate-800 dark:text-neutral-200">
                                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                                  <span>Timed company mock tests (TCS, Infosys, etc.)</span>
                                </div>
                                <div className="flex items-center gap-2.5 p-3 rounded-xl bg-white/80 dark:bg-[#121318] border border-slate-200/80 dark:border-neutral-800 text-xs font-bold text-slate-800 dark:text-neutral-200">
                                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                                  <span>AI Mentor personalized weakness analysis</span>
                                </div>
                              </div>

                              {/* Action Buttons */}
                              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
                                <button
                                  type="button"
                                  onClick={openPricingModal}
                                  className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 via-amber-600 to-amber-700 hover:from-amber-600 hover:to-amber-800 text-slate-950 font-black text-sm shadow-lg hover:shadow-xl transition-all cursor-pointer active:scale-95 flex items-center justify-center gap-2"
                                >
                                  <Lock className="w-4 h-4" />
                                  <span>Upgrade to PRO — Instant Access</span>
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setCurrentIndex(0)}
                                  className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-white dark:bg-[#121318] hover:bg-slate-100 dark:hover:bg-[#20222A] text-slate-800 dark:text-white border border-slate-200 dark:border-neutral-700 font-extrabold text-sm transition-all cursor-pointer shadow-xs"
                                >
                                  <span>Review Free Questions (1–3)</span>
                                </button>
                              </div>
                            </div>
                          ) : (
                            <>
                              {/* Question Text Box */}
                              <div className="p-6 sm:p-7 rounded-3xl border border-slate-200/90 dark:border-neutral-800 mb-6 bg-white dark:bg-[#18191F] shadow-md relative">
                                <div className="absolute -top-3.5 left-6 px-3.5 py-0.5 rounded-full bg-gradient-to-r from-purple-600 to-indigo-600 text-[10px] font-black text-white tracking-wider uppercase shadow-xs">
                                  Practice Problem #{currentIndex + 1}
                                </div>
                                <h3 className="text-base sm:text-xl font-extrabold text-slate-900 dark:text-white leading-relaxed pt-2">
                                  {currentQ.question}
                                </h3>
                              </div>

                              {/* Options Grid */}
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 mb-5">
                                {currentQ.options.map((opt, optIdx) => {
                                  const hasAnswered = userAnswers[currentQ.id] !== undefined;
                                  const solutionData = revealedSolutions[currentQ.id];
                                  const isSelected = userAnswers[currentQ.id] === optIdx;

                                  let optionStyles = "bg-white dark:bg-[#18191F] border-slate-200/90 dark:border-neutral-800 hover:border-indigo-500 hover:bg-indigo-50/40 dark:hover:bg-[#20222A] text-slate-900 dark:text-white font-extrabold shadow-2xs hover:shadow-md cursor-pointer";
                                  if (hasAnswered) {
                                    if (solutionData) {
                                      if (isSelected && solutionData.isCorrect) {
                                        optionStyles = "bg-emerald-500 border-emerald-600 text-white font-black shadow-md cursor-not-allowed";
                                      } else if (isSelected && !solutionData.isCorrect) {
                                        optionStyles = "bg-rose-500 border-rose-600 text-white font-black shadow-md cursor-not-allowed";
                                      } else if (!isSelected && optIdx === solutionData.correctIndex) {
                                        optionStyles = "bg-emerald-500/20 border-emerald-500 text-emerald-800 dark:text-emerald-300 font-bold cursor-not-allowed";
                                      } else {
                                        optionStyles = "bg-slate-100/90 dark:bg-[#121318] border-slate-200 dark:border-neutral-800 text-slate-400 dark:text-neutral-500 font-semibold cursor-not-allowed opacity-50";
                                      }
                                    } else {
                                      if (isSelected) {
                                        optionStyles = "bg-indigo-500/20 border-indigo-500 text-indigo-800 dark:text-indigo-300 font-bold animate-pulse cursor-not-allowed";
                                      } else {
                                        optionStyles = "bg-slate-100/90 dark:bg-[#121318] border-slate-200 dark:border-neutral-800 text-slate-400 dark:text-neutral-500 font-semibold cursor-not-allowed opacity-50";
                                      }
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
                                      {hasAnswered && isSelected && solutionData?.isCorrect && (
                                        <CheckCircle2 className="w-5 h-5 text-white shrink-0" />
                                      )}
                                      {hasAnswered && isSelected && solutionData && !solutionData.isCorrect && (
                                        <XCircle className="w-5 h-5 text-white shrink-0" />
                                      )}
                                    </button>
                                  );
                                })}
                              </div>

                              {/* Action Bar when Answered: Feedback & Retry Button */}
                              {userAnswers[currentQ.id] !== undefined && (
                                <div className="flex items-center justify-between p-4 rounded-2xl bg-white dark:bg-[#18191F] border border-slate-200/90 dark:border-neutral-800 shadow-sm mb-6">
                                  <div className="flex items-center gap-2 text-xs sm:text-sm font-black">
                                    {revealedSolutions[currentQ.id] ? (
                                      revealedSolutions[currentQ.id].isCorrect ? (
                                        <span className="text-emerald-700 dark:text-emerald-400 flex items-center gap-1.5">
                                          <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" /> Correct Answer! Great Job 🎉
                                        </span>
                                      ) : (
                                        <span className="text-rose-700 dark:text-rose-400 flex items-center gap-1.5">
                                          <XCircle className="w-4 h-4 text-rose-600 dark:text-rose-400" /> Incorrect Answer!
                                        </span>
                                      )
                                    ) : (
                                      <span className="text-slate-600 dark:text-neutral-400 flex items-center gap-1.5">
                                        <RefreshCw className="w-3.5 h-3.5 animate-spin text-purple-600" /> Verifying answer with server...
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
                              {userAnswers[currentQ.id] !== undefined && revealedSolutions[currentQ.id] && (
                                <div className="space-y-3">
                                  <div className="flex flex-wrap items-center gap-3">
                                    {/* Step 1 Toggle */}
                                    <button
                                      onClick={() => toggleCorrectOption(currentQ.id)}
                                      className="px-4 py-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 hover:bg-emerald-100/90 dark:hover:bg-emerald-950/60 text-xs font-extrabold text-emerald-800 dark:text-emerald-300 border border-emerald-300/80 dark:border-emerald-800/60 flex items-center gap-2 transition-all cursor-pointer shadow-2xs"
                                    >
                                      <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                                      <span>
                                        {showCorrectOptionMap[currentQ.id] ? "Hide Correct Option" : "Step 1: Show Correct Option 🎯"}
                                      </span>
                                    </button>

                                    {/* Step 2 Toggle */}
                                    <button
                                      onClick={() => toggleSolution(currentQ.id)}
                                      className="px-4 py-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 hover:bg-amber-100/90 dark:hover:bg-amber-950/60 text-xs font-extrabold text-amber-900 dark:text-amber-300 border border-amber-300/80 dark:border-amber-800/60 flex items-center gap-2 transition-all cursor-pointer shadow-2xs"
                                    >
                                      <Lightbulb className="w-4 h-4 text-amber-600 dark:text-amber-400" />
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
                                        className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-xs text-emerald-900 dark:text-emerald-200 font-extrabold flex items-center gap-2 shadow-2xs"
                                      >
                                        <span>🎯 Correct Option:</span>
                                        <span className="bg-emerald-600 text-white px-3 py-1 rounded-lg border border-emerald-700 font-black">
                                          {revealedSolutions[currentQ.id]?.correctIndex !== undefined ? currentQ.options[revealedSolutions[currentQ.id].correctIndex!] : ""}
                                        </span>
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
                                        className="p-5 rounded-3xl bg-white dark:bg-[#18191F] border border-purple-200/90 dark:border-neutral-800 text-xs leading-relaxed text-slate-800 dark:text-white space-y-2 overflow-hidden shadow-md"
                                      >
                                        <div className="font-black text-amber-800 dark:text-amber-400 flex items-center gap-1.5">
                                          <Lightbulb className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                                          <span>💡 Step-by-Step Solution:</span>
                                        </div>
                                        <div className="whitespace-pre-line text-slate-700 dark:text-neutral-300 font-semibold pt-1">
                                          {revealedSolutions[currentQ.id]?.solution || "No detailed solution recorded."}
                                        </div>
                                      </motion.div>
                                    )}
                                  </AnimatePresence>
                                </div>
                              )}
                            </>
                          )}
                        </div>

                        {/* Bottom Navigation Control Row */}
                        <div className="pt-6 border-t border-slate-200/80 dark:border-neutral-800 flex items-center justify-between gap-4">
                          <button
                            onClick={() => setCurrentIndex((prev) => Math.max(0, prev - 1))}
                            disabled={currentIndex === 0}
                            className="px-4 py-2.5 rounded-xl bg-white dark:bg-[#18191F] hover:bg-slate-100 dark:hover:bg-[#20222A] disabled:opacity-40 disabled:cursor-not-allowed text-xs font-extrabold text-slate-800 dark:text-white border border-slate-200/90 dark:border-neutral-800 flex items-center gap-1.5 cursor-pointer shadow-2xs"
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
                      <div className="hidden lg:flex lg:w-72 bg-white dark:bg-[#18191F] border-l border-slate-200/90 dark:border-neutral-800 p-5 flex-col justify-between shrink-0 shadow-2xs">
                        <div>
                          <h4 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-widest mb-4 flex items-center justify-between">
                            <span>Questions Index</span>
                            <span className="text-[10px] text-purple-700 dark:text-purple-300 font-extrabold bg-purple-100 dark:bg-purple-950/50 px-2 py-0.5 rounded-full">{answeredCount}/{totalQuestions}</span>
                          </h4>

                          {/* Question Grid Numbers */}
                          <div className="grid grid-cols-4 gap-2">
                            {questionsList.map((q, idx) => {
                              const isLocked = !hasPlacementAccess && idx >= 3;
                              const hasAns = userAnswers[q.id] !== undefined;
                              const isCorr = revealedSolutions[q.id]?.isCorrect;
                              const isCur = idx === currentIndex;

                              let gridStyle = isLocked
                                ? "bg-amber-50/70 dark:bg-amber-950/30 text-amber-700 dark:text-amber-400 border-amber-300/60 dark:border-amber-800/50 font-bold hover:bg-amber-100 dark:hover:bg-amber-950/50"
                                : "bg-slate-100 dark:bg-[#121318] text-slate-700 dark:text-neutral-300 border-slate-200/90 dark:border-neutral-800 font-extrabold hover:bg-slate-200 dark:hover:bg-[#20222A]";
                              if (!isLocked && hasAns) {
                                gridStyle = isCorr
                                  ? "bg-emerald-500 text-white border-emerald-600 font-black shadow-2xs"
                                  : "bg-rose-500 text-white border-rose-600 font-black shadow-2xs";
                              }

                              return (
                                <button
                                  key={q.id}
                                  onClick={() => setCurrentIndex(idx)}
                                  className={`h-9 rounded-xl text-xs font-black border transition-all flex items-center justify-center cursor-pointer ${gridStyle} ${
                                    isCur ? (isLocked ? "ring-2 ring-amber-500 ring-offset-1 scale-105" : "ring-2 ring-indigo-600 ring-offset-1 scale-105") : ""
                                  }`}
                                  title={isLocked ? `Question ${q.id} (PRO Locked)` : `Question ${q.id}`}
                                >
                                  {isLocked ? (
                                    <span className="flex items-center gap-1">
                                      <span>{q.id}</span>
                                      <Lock className="w-2.5 h-2.5 text-amber-600 dark:text-amber-400 shrink-0" />
                                    </span>
                                  ) : (
                                    q.id
                                  )}
                                </button>
                              );
                            })}
                          </div>
                        </div>

                        <div className="mt-6 pt-4 border-t border-slate-200/80 dark:border-neutral-800 space-y-3">
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
                              className="fixed bottom-0 inset-x-0 bg-white dark:bg-[#18191F] border-t border-slate-200 dark:border-neutral-800 rounded-t-3xl p-6 z-50 max-h-[85vh] overflow-y-auto lg:hidden shadow-2xl"
                            >
                              <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-neutral-800 mb-4">
                                <div className="font-black text-slate-900 dark:text-white text-sm flex items-center gap-2">
                                  <Grid className="w-4 h-4 text-purple-600" />
                                  <span>Questions Index ({answeredCount}/{totalQuestions} Practiced)</span>
                                </div>
                                <button
                                  onClick={() => setMobileGridOpen(false)}
                                  className="p-2 rounded-xl bg-slate-100 dark:bg-[#121318] hover:bg-slate-200 dark:hover:bg-[#20222A] text-slate-600 dark:text-neutral-300 cursor-pointer"
                                >
                                  <X className="w-5 h-5" />
                                </button>
                              </div>

                              <div className="grid grid-cols-6 gap-2 mb-6">
                                {questionsList.map((q, idx) => {
                                  const isLocked = !hasPlacementAccess && idx >= 3;
                                  const hasAns = userAnswers[q.id] !== undefined;
                                  const isCorr = revealedSolutions[q.id]?.isCorrect;
                                  const isCur = idx === currentIndex;

                                  let gridStyle = isLocked
                                    ? "bg-amber-50/70 dark:bg-amber-950/30 text-amber-700 dark:text-amber-400 border-amber-300/60 dark:border-amber-800/50 font-bold hover:bg-amber-100 dark:hover:bg-amber-950/50"
                                    : "bg-slate-100 dark:bg-[#121318] text-slate-700 dark:text-neutral-300 border-slate-200 dark:border-neutral-800 font-extrabold hover:bg-slate-200 dark:hover:bg-[#20222A]";
                                  if (!isLocked && hasAns) {
                                    gridStyle = isCorr
                                      ? "bg-emerald-500 text-white border-emerald-600 font-black shadow-xs"
                                      : "bg-rose-500 text-white border-rose-600 font-black shadow-xs";
                                  }

                                  return (
                                    <button
                                      key={q.id}
                                      onClick={() => {
                                        setCurrentIndex(idx);
                                        setMobileGridOpen(false);
                                      }}
                                      className={`h-10 rounded-xl text-xs font-black border transition-all flex items-center justify-center cursor-pointer ${gridStyle} ${
                                        isCur ? (isLocked ? "ring-2 ring-amber-500 ring-offset-1 scale-105" : "ring-2 ring-indigo-600 ring-offset-1 scale-105") : ""
                                      }`}
                                      title={isLocked ? `Question ${q.id} (PRO Locked)` : `Question ${q.id}`}
                                    >
                                      {isLocked ? (
                                        <span className="flex items-center gap-1">
                                          <span>{q.id}</span>
                                          <Lock className="w-2.5 h-2.5 text-amber-600 dark:text-amber-400 shrink-0" />
                                        </span>
                                      ) : (
                                        q.id
                                      )}
                                    </button>
                                  );
                                })}
                              </div>

                              <button
                                onClick={() => {
                                  setMobileGridOpen(false);
                                  setQuizFinished(true);
                                }}
                                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-xs font-black text-white shadow-lg shadow-purple-600/30 cursor-pointer"
                              >
                                Finish &amp; View Summary
                              </button>
                            </motion.div>
                          </>
                        )}
                      </AnimatePresence>
                    </div>
                    );
                  })()}

                  {/* Mode B: Full Practice Sheet (Scrollable List of All Questions) */}
                  {practiceViewMode === "sheet" && (
                    <div className="flex-1 p-6 md:p-8 overflow-y-auto space-y-6 bg-[#f4f6f3] dark:bg-black">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-neutral-800 pb-5 bg-white dark:bg-[#18191F] p-6 rounded-3xl border border-slate-200/90 dark:border-neutral-800 shadow-xs">
                        <div>
                          <div className="flex items-center gap-2 mb-1.5">
                            <span className="px-3 py-0.5 rounded-full bg-purple-100 dark:bg-purple-950/50 text-purple-800 dark:text-purple-300 text-[10px] font-black uppercase tracking-wider border border-purple-200 dark:border-purple-800">
                              Sheet Mode
                            </span>
                            <span className="text-xs text-slate-500 dark:text-neutral-400 font-bold">• {totalQuestions} Practice Problems</span>
                          </div>
                          <h3 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">Full Practice Sheet: {selectedTopic}</h3>
                          <p className="text-xs text-slate-600 dark:text-neutral-400 font-medium mt-1">All {totalQuestions} practice questions listed with instant answer validation &amp; step-by-step solutions.</p>
                        </div>
                        <button
                          onClick={() => setQuizFinished(true)}
                          className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-xs font-black text-white shadow-md shadow-purple-600/25 flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-95 shrink-0"
                        >
                          <Check className="w-4 h-4" />
                          <span>Done Practicing</span>
                        </button>
                      </div>

                      <div className="space-y-6">
                        {questionsList.map((q, idx) => {
                          const isLocked = !hasPlacementAccess && idx >= 3;
                          const userAnsIdx = userAnswers[q.id];
                          const isCorrect = revealedSolutions[q.id]?.isCorrect ?? false;
                          const hasAnswered = userAnsIdx !== undefined;

                          if (isLocked) {
                            return (
                              <div
                                key={q.id}
                                className="p-6 sm:p-7 rounded-3xl bg-gradient-to-r from-amber-50/70 via-purple-50/30 to-white dark:from-[#18191F] dark:to-[#121318] border border-amber-300/70 dark:border-amber-800/60 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition-all"
                              >
                                <div className="space-y-1.5 max-w-xl">
                                  <div className="flex items-center gap-2">
                                    <span className="px-3 py-1 rounded-xl bg-purple-100 dark:bg-purple-950/50 text-purple-800 dark:text-purple-300 text-xs font-black border border-purple-200/80 dark:border-purple-800 shadow-2xs">
                                      Problem #{idx + 1}
                                    </span>
                                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 text-[10px] font-black uppercase tracking-wider border border-amber-300/80 dark:border-amber-700/80">
                                      <Lock className="w-2.5 h-2.5 text-amber-600 dark:text-amber-400" />
                                      PRO Locked
                                    </span>
                                  </div>
                                  <h4 className="text-sm sm:text-base font-extrabold text-slate-800 dark:text-neutral-200">
                                    {q.question}
                                  </h4>
                                  <p className="text-xs text-slate-500 dark:text-neutral-400 font-medium">
                                    Options, real-time verification, and full step-by-step solutions are available with SkillsCatalyst PRO.
                                  </p>
                                </div>
                                <button
                                  type="button"
                                  onClick={openPricingModal}
                                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 via-amber-600 to-amber-700 hover:from-amber-600 hover:to-amber-800 text-slate-950 font-black text-xs shadow-md hover:shadow-lg transition-all cursor-pointer active:scale-95 flex items-center gap-1.5 shrink-0"
                                >
                                  <Lock className="w-3.5 h-3.5" />
                                  <span>Unlock with PRO</span>
                                </button>
                              </div>
                            );
                          }

                          return (
                            <div key={q.id} className="p-6 sm:p-7 rounded-3xl bg-white dark:bg-[#18191F] border border-slate-200/90 dark:border-neutral-800 shadow-sm hover:shadow-md transition-all space-y-4">
                              <div className="flex items-start justify-between gap-4">
                                <div className="flex items-center gap-2.5">
                                  <span className="px-3 py-1 rounded-xl bg-purple-100 dark:bg-purple-950/50 text-purple-800 dark:text-purple-300 text-xs font-black border border-purple-200/80 dark:border-purple-800 shadow-2xs">
                                    Problem #{idx + 1}
                                  </span>
                                  {hasAnswered && (
                                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                                      isCorrect
                                        ? "bg-emerald-100 dark:bg-emerald-950/50 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800"
                                        : "bg-rose-100 dark:bg-rose-950/50 text-rose-800 dark:text-rose-300 border border-rose-300 dark:border-rose-800"
                                    }`}>
                                      {isCorrect ? "Correct ✓" : "Incorrect ✗"}
                                    </span>
                                  )}
                                </div>
                              </div>

                              <h4 className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-white leading-relaxed">
                                {q.question}
                              </h4>

                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                {q.options.map((opt, optIdx) => {
                                  const isSel = userAnsIdx === optIdx;
                                  const isRight = revealedSolutions[q.id] ? optIdx === revealedSolutions[q.id].correctIndex : false;
                                  let style = "bg-white dark:bg-[#121318] border-slate-200 dark:border-neutral-800 text-slate-800 dark:text-white hover:border-indigo-400 hover:bg-indigo-50/40 dark:hover:bg-[#20222A] shadow-2xs cursor-pointer";
                                  if (hasAnswered) {
                                    if (isRight) {
                                      style = "bg-emerald-50 dark:bg-emerald-950/40 border-2 border-emerald-500 text-emerald-950 dark:text-emerald-200 font-black shadow-xs ring-1 ring-emerald-400/30 cursor-not-allowed";
                                    } else if (isSel && !isRight) {
                                      style = "bg-rose-50 dark:bg-rose-950/40 border-2 border-rose-500 text-rose-950 dark:text-rose-200 font-black shadow-xs ring-1 ring-rose-400/30 cursor-not-allowed";
                                    } else {
                                      style = "bg-slate-50/60 dark:bg-[#121318]/50 border-slate-200/80 dark:border-neutral-800 text-slate-400 dark:text-neutral-500 font-medium opacity-60 cursor-not-allowed";
                                    }
                                  }

                                  return (
                                    <button
                                      key={optIdx}
                                      onClick={() => handleSelectOption(q.id, optIdx)}
                                      disabled={hasAnswered}
                                      className={`p-3.5 sm:p-4 rounded-2xl border transition-all text-left text-xs sm:text-sm font-semibold flex items-center justify-between gap-3 ${style}`}
                                    >
                                      <span className="flex-1 leading-relaxed">{opt}</span>
                                      {hasAnswered && isRight && (
                                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                                      )}
                                      {hasAnswered && isSel && !isRight && (
                                        <X className="w-4 h-4 text-rose-600 shrink-0" />
                                      )}
                                    </button>
                                  );
                                })}
                              </div>

                              <div className="pt-2 border-t border-slate-100 dark:border-neutral-800 flex items-center justify-between">
                                <button
                                  onClick={() => toggleSolution(q.id)}
                                  className="text-xs font-extrabold text-amber-900 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/40 hover:bg-amber-100 dark:hover:bg-amber-950/60 px-3.5 py-1.5 rounded-xl border border-amber-300/80 dark:border-amber-800/60 flex items-center gap-1.5 transition-all cursor-pointer shadow-2xs"
                                >
                                  <Lightbulb className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                                  <span>{showSolutionMap[q.id] ? "Hide Solution" : "Show Solution 💡"}</span>
                                </button>
                              </div>

                              {showSolutionMap[q.id] && (
                                <div className="mt-3 p-4 sm:p-5 rounded-2xl bg-amber-50/80 dark:bg-[#121318] border border-amber-200/90 dark:border-neutral-800 text-xs text-slate-800 dark:text-neutral-200 space-y-2 shadow-2xs">
                                  <div className="font-black text-amber-950 dark:text-amber-400 flex items-center gap-2">
                                    <span className="bg-emerald-600 text-white px-2.5 py-0.5 rounded-lg font-black text-[11px] shadow-2xs">
                                      Answer: {revealedSolutions[q.id]?.correctIndex !== undefined ? q.options[revealedSolutions[q.id].correctIndex!] : ""}
                                    </span>
                                  </div>
                                  <div className="whitespace-pre-line text-slate-700 dark:text-neutral-300 font-semibold pt-1 border-t border-amber-200/60 dark:border-neutral-800">
                                    {revealedSolutions[q.id]?.solution || "No detailed solution recorded."}
                                  </div>
                                </div>
                              )}
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
                <div className="flex-1 p-6 md:p-8 overflow-y-auto space-y-8 bg-[#f4f6f3] dark:bg-black">
                  {/* Score Banner */}
                  <div className="p-8 rounded-3xl bg-gradient-to-r from-purple-700 via-indigo-700 to-blue-700 border border-purple-400/30 flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl text-white">
                    <div>
                      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 text-white border border-white/30 text-xs font-black mb-3 backdrop-blur-sm">
                        <CheckCircle2 className="w-4 h-4 text-emerald-300" /> Practice Session Completed!
                      </div>
                      <h3 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                        {selectedTopic} Practice Summary
                      </h3>
                      <p className="text-sm text-purple-100 font-medium mt-1">
                        Self-Paced Practice Completed. Review your answers and step-by-step solutions below.
                      </p>
                    </div>

                    <div className="flex items-center gap-6 bg-white/10 backdrop-blur-md p-5 rounded-2xl border border-white/20 text-white">
                      <div className="text-center">
                        <div className="text-3xl font-black text-purple-200">{correctCount} / {totalQuestions}</div>
                        <div className="text-[10px] font-bold uppercase text-purple-200/80 mt-0.5">Practiced</div>
                      </div>
                      <div className="w-px h-10 bg-white/20" />
                      <div className="text-center">
                        <div className="text-3xl font-black text-emerald-300">{accuracyPercent}%</div>
                        <div className="text-[10px] font-bold uppercase text-purple-200/80 mt-0.5">Accuracy</div>
                      </div>
                      <div className="w-px h-10 bg-white/20" />
                      <button
                        onClick={handleRestartQuiz}
                        className="p-3 rounded-xl bg-white text-purple-900 hover:bg-purple-50 transition-all shadow-md flex items-center gap-1 text-xs font-black cursor-pointer"
                        title="Restart Practice"
                      >
                        <RefreshCw className="w-4 h-4" />
                        <span>Retry</span>
                      </button>
                    </div>
                  </div>

                  {/* Solutions Table & Breakdown */}
                  <div className="space-y-4">
                    <h4 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                      <Lightbulb className="w-5 h-5 text-amber-500" />
                      Detailed Solutions &amp; Answer Key
                    </h4>

                    <div className="space-y-4">
                      {questionsList.map((q) => {
                        const userAnsIdx = userAnswers[q.id];
                        const isCorrect = revealedSolutions[q.id]?.isCorrect ?? false;
                        const userAnsText = userAnsIdx !== undefined ? q.options[userAnsIdx] : "Unattempted";
                        const correctText = revealedSolutions[q.id]?.correctIndex !== undefined ? q.options[revealedSolutions[q.id].correctIndex!] : "Submitted";

                        return (
                          <div
                            key={q.id}
                            className={`p-6 rounded-3xl border transition-all space-y-3 bg-white dark:bg-[#18191F] shadow-sm ${
                              userAnsIdx === undefined
                                ? "border-slate-200 dark:border-neutral-800"
                                : isCorrect
                                ? "border-emerald-300 dark:border-emerald-700 ring-1 ring-emerald-400/20"
                                : "border-rose-300 dark:border-rose-700 ring-1 ring-rose-400/20"
                            }`}
                          >
                            <div className="flex items-start justify-between gap-4">
                              <h5 className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-white leading-relaxed">
                                {q.question}
                              </h5>
                              <span
                                className={`text-xs font-black px-3 py-1 rounded-full shrink-0 ${
                                  userAnsIdx === undefined
                                    ? "bg-slate-100 dark:bg-[#121318] text-slate-600 dark:text-neutral-400 border border-slate-200 dark:border-neutral-800"
                                    : isCorrect
                                    ? "bg-emerald-100 dark:bg-emerald-950/50 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800"
                                    : "bg-rose-100 dark:bg-rose-950/50 text-rose-800 dark:text-rose-300 border border-rose-300 dark:border-rose-800"
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
                            <div className="flex flex-wrap items-center gap-4 text-xs font-bold">
                              <div className="text-slate-600 dark:text-neutral-400">
                                Your Choice: <span className={isCorrect ? "text-emerald-700 dark:text-emerald-400 font-black" : "text-rose-700 dark:text-rose-400 font-black"}>{userAnsText}</span>
                              </div>
                              <div className="text-amber-800 dark:text-amber-300 font-black flex items-center gap-1">
                                <span className="bg-amber-100 dark:bg-amber-950/40 text-amber-900 dark:text-amber-300 px-2.5 py-0.5 rounded-lg border border-amber-200 dark:border-amber-800/60">Correct Answer: {correctText}</span>
                              </div>
                              {questionTimes[q.id] !== undefined && (
                                <div className="text-purple-800 dark:text-purple-300 bg-purple-100 dark:bg-purple-950/40 px-2.5 py-0.5 rounded-lg border border-purple-200 dark:border-purple-800/60 font-extrabold flex items-center gap-1">
                                  <Clock className="w-3 h-3 text-purple-600 dark:text-purple-400" />
                                  <span>Time Taken: {questionTimes[q.id]}s</span>
                                </div>
                              )}
                            </div>

                            {/* Solution Box */}
                            <div className="p-4 sm:p-5 rounded-2xl bg-indigo-50/60 dark:bg-[#121318] border border-indigo-100 dark:border-neutral-800 text-xs leading-relaxed text-slate-800 dark:text-neutral-200 space-y-1">
                              <div className="font-black text-indigo-900 dark:text-indigo-400 text-[11px] uppercase tracking-wider mb-1">
                                Step-by-Step Solution
                              </div>
                              <div className="whitespace-pre-line font-medium text-slate-700 dark:text-neutral-300">
                                {revealedSolutions[q.id]?.solution || "No detailed solution recorded."}
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
            </>
        </motion.div>
      </div>
    </AnimatePresence>
  );

  if (!isOpen || !mounted) return null;

  return createPortal(modalContent, document.body);
}
