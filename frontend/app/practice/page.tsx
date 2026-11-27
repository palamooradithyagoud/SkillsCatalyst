"use client";

import React, { useState, useEffect, useMemo, useRef, Suspense } from "react";
import dynamic from "next/dynamic";
import { useSearchParams } from "next/navigation";
import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import {
  fetchPracticeCompanies,
  fetchCompanyQuestions,
  PracticeQuestion,
  QuestionPeriod,
} from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { TOP_COMPANIES, PERIODS, PracticeStatus } from "@/data/practice/constants";
import {
  calculateCompanySolvedCount,
  calculateCompanyProgressPercent,
  filterQuestionsByStatus,
  filterCompaniesList,
} from "@/lib/practice/practiceHelpers";
import { usePracticeSolvedState } from "@/hooks/usePracticeSolvedState";
import { PracticeHeader } from "@/components/practice/PracticeHeader";
import { PracticeHeroCard } from "@/components/practice/PracticeHeroCard";
import { PracticeModeCards } from "@/components/practice/PracticeModeCards";
import { PenguinDSASheetCard } from "@/components/practice/PenguinDSASheetCard";
import { ShradhaDSASheetCard } from "@/components/practice/ShradhaDSASheetCard";
import { StriverA2ZDSASheetCard } from "@/components/practice/StriverA2ZDSASheetCard";

// Code-split heavy practice sheets, tree view, topic drawer, and company bank out of initial /practice chunk
const PracticeTopicDrawer = dynamic(() => import("@/components/PracticeTopicDrawer"), { ssr: false });
const PenguinDSASheetView = dynamic(
  () => import("@/components/practice/PenguinDSASheetView").then((m) => m.PenguinDSASheetView),
  { ssr: false }
);
const ShradhaDSASheetView = dynamic(
  () => import("@/components/practice/ShradhaDSASheetView").then((m) => m.ShradhaDSASheetView),
  { ssr: false }
);
const StriverA2ZDSASheetView = dynamic(
  () => import("@/components/practice/StriverA2ZDSASheetView").then((m) => m.StriverA2ZDSASheetView),
  { ssr: false }
);
const BeginnerDSATree = dynamic(
  () => import("@/components/practice/BeginnerDSATree").then((m) => m.BeginnerDSATree),
  { ssr: false }
);
const BeginnerRoadmapCard = dynamic(
  () => import("@/components/practice/BeginnerRoadmapCard").then((m) => m.BeginnerRoadmapCard),
  { ssr: false }
);
const CompanyControlsPanel = dynamic(
  () => import("@/components/practice/CompanyControlsPanel").then((m) => m.CompanyControlsPanel),
  { ssr: false }
);
const CompanyProgressTracker = dynamic(
  () => import("@/components/practice/CompanyProgressTracker").then((m) => m.CompanyProgressTracker),
  { ssr: false }
);
const CompanyQuestionFilters = dynamic(
  () => import("@/components/practice/CompanyQuestionFilters").then((m) => m.CompanyQuestionFilters),
  { ssr: false }
);
const QuestionListTable = dynamic(
  () => import("@/components/practice/QuestionListTable").then((m) => m.QuestionListTable),
  { ssr: false }
);
import { useSubscription } from "@/hooks/useSubscription";
import { PremiumLockCard } from "@/components/premium";

function PracticeContent() {
  const { session } = useAuth();
  const userId = session?.user_id;
  const { canAccess, isPremium } = useSubscription();
  const hasCompanyAccess = canAccess("company_interview_questions");
  const searchParams = useSearchParams();
  const sheetsScrollRef = useRef<HTMLDivElement>(null);

  const scrollSheets = (distance: number) => {
    if (sheetsScrollRef.current) {
      sheetsScrollRef.current.scrollBy({ left: distance, behavior: "smooth" });
    }
  };

  const urlCompany = searchParams?.get("company");
  const urlPeriod = searchParams?.get("period");
  const urlMode = searchParams?.get("mode");

  const [selectedMode, setSelectedMode] = useState<"index" | "beginner" | "company" | "penguin-sheet" | "shradha-sheet" | "striver-sheet">(() => {
    if (urlCompany || urlMode === "company") return "company";
    if (urlMode === "beginner") return "beginner";
    if (urlMode === "sheet" || urlMode === "penguin-sheet") return "penguin-sheet";
    if (urlMode === "shradha" || urlMode === "shradha-sheet") return "shradha-sheet";
    if (urlMode === "striver" || urlMode === "striver-sheet") return "striver-sheet";
    return "index";
  });

  // Sync practice subview state to document body attribute for MobileNav detection
  useEffect(() => {
    if (typeof document !== "undefined") {
      if (selectedMode !== "index") {
        document.body.setAttribute("data-practice-subview", "true");
      } else {
        document.body.removeAttribute("data-practice-subview");
      }
    }
    return () => {
      if (typeof document !== "undefined") {
        document.body.removeAttribute("data-practice-subview");
      }
    };
  }, [selectedMode]);

  // Dedicated scroll controller: DSA sheets section vs Practice top
  useEffect(() => {
    if (typeof window === "undefined") return;

    const isDsaTarget =
      searchParams?.get("section") === "dsa-sheets" ||
      searchParams?.get("mode") === "dsa-sheets" ||
      window.location.hash === "#dsa-sheets";

    if (isDsaTarget) {
      setSelectedMode("index");
      let attempts = 0;
      const interval = setInterval(() => {
        attempts++;
        const el = document.getElementById("dsa-sheets");
        const mainElem = document.querySelector("main");
        if (el) {
          el.scrollIntoView({ behavior: "smooth", block: "start" });
          if (mainElem) {
            const mainRect = mainElem.getBoundingClientRect();
            const elRect = el.getBoundingClientRect();
            const relativeTop = elRect.top - mainRect.top + mainElem.scrollTop - 24;
            mainElem.scrollTo({ top: Math.max(0, relativeTop), behavior: "smooth" });
          }
          if (attempts > 6) {
            clearInterval(interval);
          }
        }
        if (attempts > 20) {
          clearInterval(interval);
        }
      }, 50);

      return () => clearInterval(interval);
    } else {
      // Standard practice navigation -> ensure page opens at the very top
      const scrollToTop = () => {
        const mainElem = document.querySelector("main");
        if (mainElem) {
          mainElem.scrollTop = 0;
        }
        window.scrollTo(0, 0);
        document.documentElement.scrollTop = 0;
        document.body.scrollTop = 0;
      };

      scrollToTop();
      const rAF = requestAnimationFrame(scrollToTop);
      const timer = setTimeout(scrollToTop, 100);

      return () => {
        cancelAnimationFrame(rAF);
        clearTimeout(timer);
      };
    }
  }, [searchParams, selectedMode]);

  const [selectedCompany, setSelectedCompany] = useState<string>(() => {
    if (urlCompany) return urlCompany.toLowerCase();
    return "google";
  });
  const [companySearchInput, setCompanySearchInput] = useState<string>("");
  const [selectedPeriod, setSelectedPeriod] = useState<QuestionPeriod>(() => {
    if (urlPeriod) return urlPeriod as QuestionPeriod;
    if (urlCompany) return "thirty-days";
    return "all";
  });

  // Keep state synchronized with URL search parameters (e.g. from Explore page company cards)
  useEffect(() => {
    if (!searchParams) return;
    const comp = searchParams.get("company");
    const per = searchParams.get("period");
    const m = searchParams.get("mode");

    if (comp) {
      setSelectedCompany(comp.toLowerCase());
      setSelectedMode("company");
      setSelectedPeriod((per as QuestionPeriod) || "thirty-days");
    } else if (m === "company") {
      setSelectedMode("company");
      if (per) setSelectedPeriod(per as QuestionPeriod);
    } else if (m === "beginner") {
      setSelectedMode("beginner");
    } else if (m === "sheet" || m === "penguin-sheet") {
      setSelectedMode("penguin-sheet");
    } else if (m === "shradha" || m === "shradha-sheet") {
      setSelectedMode("shradha-sheet");
    } else if (m === "striver" || m === "striver-sheet") {
      setSelectedMode("striver-sheet");
    } else if (m === "index") {
      setSelectedMode("index");
    }
  }, [searchParams]);

  const [selectedDifficulty, setSelectedDifficulty] = useState<string>("All");
  const [selectedStatus, setSelectedStatus] = useState<PracticeStatus>("All");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState<string>("");
  const [activePracticeTopic, setActivePracticeTopic] = useState<string | null>(null);
  const [limit, setLimit] = useState<number>(100);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearchQuery(searchQuery.trim()), 180);
    return () => clearTimeout(t);
  }, [searchQuery]);

  // Solved state and Supabase persistence hook
  const {
    solvedState,
    drawerSolved,
    toggleSolved,
    toggleDrawerProblem,
  } = usePracticeSolvedState(userId);

  // Cached company list across visits
  const companiesQuery = useQuery<string[]>({
    queryKey: ["practice", "companies"],
    queryFn: async () => {
      const list = await fetchPracticeCompanies();
      return list && list.length > 0 ? list : TOP_COMPANIES;
    },
    staleTime: 5 * 60 * 1000,
    placeholderData: TOP_COMPANIES,
  });

  const companiesList = companiesQuery.data ?? TOP_COMPANIES;

  // Cached questions query (only runs when company mode is active)
  const questionsQuery = useQuery<{ questions: PracticeQuestion[]; total: number }>({
    queryKey: [
      "practice",
      "questions",
      selectedCompany,
      selectedPeriod,
      selectedDifficulty,
      debouncedSearchQuery,
      limit,
    ],
    queryFn: async () => {
      const result = await fetchCompanyQuestions(
        selectedCompany,
        selectedPeriod,
        selectedDifficulty === "All" ? undefined : selectedDifficulty,
        debouncedSearchQuery || undefined,
        limit,
        0
      );
      if (result && Array.isArray(result.questions)) {
        return {
          questions: result.questions,
          total: result.total || result.questions.length,
        };
      }
      return { questions: [], total: 0 };
    },
    enabled: selectedMode === "company",
    staleTime: 2 * 60 * 1000,
    placeholderData: keepPreviousData,
  });

  const questions = questionsQuery.data?.questions ?? [];
  const totalCount = questionsQuery.data?.total ?? 0;
  const loadingQuestions = questionsQuery.isFetching && !questionsQuery.data;

  // Filtered dropdown list of all 660+ companies
  const filteredCompaniesDropdown = useMemo(() => {
    return filterCompaniesList(companiesList, companySearchInput);
  }, [companiesList, companySearchInput]);

  // Calculate count of solved questions in loaded list
  const companySolvedCount = useMemo(() => {
    return calculateCompanySolvedCount(questions, solvedState, selectedCompany);
  }, [questions, solvedState, selectedCompany]);

  const companyProgressPercent = useMemo(() => {
    return calculateCompanyProgressPercent(companySolvedCount, questions.length);
  }, [companySolvedCount, questions.length]);

  // Filter questions by Status (All vs Unsolved vs Completed)
  const filteredQuestions = useMemo(() => {
    return filterQuestionsByStatus(questions, selectedStatus, solvedState, selectedCompany);
  }, [questions, selectedStatus, solvedState, selectedCompany]);

  const selectedPeriodLabel = useMemo(() => {
    return PERIODS.find((p) => p.value === selectedPeriod)?.label || "All Time";
  }, [selectedPeriod]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="max-w-7xl mx-auto space-y-8 pb-28 sm:pb-16 select-none"
    >
      {/* ── Top Header */}
      <PracticeHeader
        selectedMode={selectedMode}
        onBack={() => setSelectedMode("index")}
        companiesCount={companiesList.length}
      />

      {/* ── MODE 0: INDEX PAGE (HERO CARD FIRST + MODE CARDS) */}
      {selectedMode === "index" && (
        <div className="space-y-6 sm:space-y-8">
          <PracticeHeroCard
            onSelectCompany={(companyId) => {
              setSelectedCompany(companyId);
              setSelectedMode("company");
            }}
          />

          <PracticeModeCards
            onSelectMode={setSelectedMode}
            companiesCount={companiesList.length}
          />

          {/* ── DSA SHEETS Heading with Horizontal Scroll Controls ── */}
          <div id="dsa-sheets" className="max-w-5xl mx-auto w-full flex items-center justify-between pt-2 sm:pt-4 scroll-mt-20">
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                DSA SHEETS
              </h2>
            </div>

            {/* Scroll Navigation Chevrons */}
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => scrollSheets(-340)}
                aria-label="Scroll left"
                className="w-8 h-8 rounded-full border border-slate-200/90 dark:border-neutral-800 bg-white dark:bg-[#18191F] hover:bg-slate-50 dark:hover:bg-[#20222A] text-slate-700 dark:text-neutral-300 flex items-center justify-center shadow-xs transition-all active:scale-95 cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => scrollSheets(340)}
                aria-label="Scroll right"
                className="w-8 h-8 rounded-full border border-slate-200/90 dark:border-neutral-800 bg-white dark:bg-[#18191F] hover:bg-slate-50 dark:hover:bg-[#20222A] text-slate-700 dark:text-neutral-300 flex items-center justify-center shadow-xs transition-all active:scale-95 cursor-pointer"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* ── DSA Sheet Cards: Horizontal Scrollable Row Side-by-Side ── */}
          <div
            ref={sheetsScrollRef}
            className="max-w-5xl mx-auto w-full flex items-stretch gap-4 sm:gap-6 overflow-x-auto pb-1 pt-1 px-1 no-scrollbar mobile-touch-scroll scroll-smooth snap-x snap-mandatory [&::-webkit-scrollbar]:hidden"
            style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
          >
            <div className="shrink-0 w-[275px] xs:w-[310px] sm:w-[335px] snap-start flex flex-col">
              <StriverA2ZDSASheetCard onSelect={() => setSelectedMode("striver-sheet")} />
            </div>
            <div className="shrink-0 w-[275px] xs:w-[310px] sm:w-[335px] snap-start flex flex-col">
              <PenguinDSASheetCard onSelect={() => setSelectedMode("penguin-sheet")} />
            </div>
            <div className="shrink-0 w-[275px] xs:w-[310px] sm:w-[335px] snap-start flex flex-col">
              <ShradhaDSASheetCard onSelect={() => setSelectedMode("shradha-sheet")} />
            </div>
          </div>
        </div>
      )}

      {/* ── MODE 3: PENGUIN DSA SHEET VIEW ── */}
      {selectedMode === "penguin-sheet" && (
        <PenguinDSASheetView />
      )}

      {/* ── MODE 4: SHRADHA DIDI DSA SHEET VIEW ── */}
      {selectedMode === "shradha-sheet" && (
        <ShradhaDSASheetView />
      )}

      {/* ── MODE 5: STRIVER A2Z DSA SHEET VIEW ── */}
      {selectedMode === "striver-sheet" && (
        <StriverA2ZDSASheetView />
      )}

      {/* ── MODE 1: BEGINNER LEVEL — DSA LEARNING ROADMAP TREE */}
      {selectedMode === "beginner" && (
        <div className="space-y-6 sm:space-y-8">
          <BeginnerRoadmapCard drawerSolved={drawerSolved} />

          <BeginnerDSATree
            drawerSolved={drawerSolved}
            onSelectTopic={setActivePracticeTopic}
          />
        </div>
      )}

      {/* ── MODE 2: COMPANY WISE QUESTION BANK */}
      {selectedMode === "company" && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {/* Controls Panel */}
          <CompanyControlsPanel
            selectedCompany={selectedCompany}
            onSelectCompany={(comp) => {
              setSelectedCompany(comp);
              setLimit(100);
            }}
            filteredCompaniesDropdown={filteredCompaniesDropdown}
            companySearchInput={companySearchInput}
            onCompanySearchChange={setCompanySearchInput}
          />

          {/* Progress Tracker Banner */}
          <CompanyProgressTracker
            company={selectedCompany}
            solvedCount={companySolvedCount}
            totalCount={questions.length}
            progressPercent={companyProgressPercent}
          />

          {/* Filter Bar: Time Frame & Difficulty (styled like Image 2, below Company Tracker) */}
          <CompanyQuestionFilters
            selectedPeriod={selectedPeriod}
            onSelectPeriod={(p) => {
              setSelectedPeriod(p);
              setLimit(100);
            }}
            selectedDifficulty={selectedDifficulty}
            onSelectDifficulty={setSelectedDifficulty}
            selectedStatus={selectedStatus}
            onSelectStatus={setSelectedStatus}
            searchQuery={searchQuery}
            onSearchQueryChange={setSearchQuery}
          />

          {/* Question List Table */}
          <QuestionListTable
            company={selectedCompany}
            periodLabel={selectedPeriodLabel}
            loadingQuestions={loadingQuestions}
            filteredQuestions={filteredQuestions}
            totalCount={totalCount}
            loadedCount={questions.length}
            solvedState={solvedState}
            onToggleSolved={toggleSolved}
            onLoadMore={() => setLimit((prev) => prev + 100)}
          />
        </motion.div>
      )}

      {/* Practice Topic Detail Drawer Overlay */}
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

export default function PracticePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center p-8 bg-[#f4f6f3]">
          <div className="flex items-center gap-3 text-slate-600 font-bold text-sm bg-white px-6 py-4 rounded-2xl shadow-sm border border-slate-200">
            <div className="w-5 h-5 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
            <span>Loading practice modules...</span>
          </div>
        </div>
      }
    >
      <PracticeContent />
    </Suspense>
  );
}
