"use client";

import React, { useState, useEffect, useMemo, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import PracticeTopicDrawer from "@/components/PracticeTopicDrawer";
import FloatingCTA from "@/components/mobile/FloatingCTA";
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
import { PracticeModeCards } from "@/components/practice/PracticeModeCards";
import { BeginnerDSATree } from "@/components/practice/BeginnerDSATree";
import { CompanyControlsPanel } from "@/components/practice/CompanyControlsPanel";
import { CompanyProgressTracker } from "@/components/practice/CompanyProgressTracker";
import { QuestionListTable } from "@/components/practice/QuestionListTable";

function PracticeContent() {
  const { session } = useAuth();
  const userId = session?.user_id;
  const searchParams = useSearchParams();

  const urlCompany = searchParams?.get("company");
  const urlPeriod = searchParams?.get("period");
  const urlMode = searchParams?.get("mode");

  const [selectedMode, setSelectedMode] = useState<"index" | "beginner" | "company">(() => {
    if (urlCompany || urlMode === "company") return "company";
    if (urlMode === "beginner") return "beginner";
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

  const [companiesList, setCompaniesList] = useState<string[]>([]);
  const [selectedCompany, setSelectedCompany] = useState<string>(() => {
    if (urlCompany) return urlCompany.toLowerCase();
    return "google";
  });
  const [companySearchInput, setCompanySearchInput] = useState<string>("" );
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
    } else if (m === "index") {
      setSelectedMode("index");
    }
  }, [searchParams]);

  const [selectedDifficulty, setSelectedDifficulty] = useState<string>("All");
  const [selectedStatus, setSelectedStatus] = useState<PracticeStatus>("All");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [activePracticeTopic, setActivePracticeTopic] = useState<string | null>(null);

  const [questions, setQuestions] = useState<PracticeQuestion[]>([]);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [loadingQuestions, setLoadingQuestions] = useState<boolean>(false);
  const [loadingCompanies, setLoadingCompanies] = useState<boolean>(false);
  const [limit, setLimit] = useState<number>(100);

  // Solved state and Supabase persistence hook
  const {
    solvedState,
    drawerSolved,
    toggleSolved,
    toggleDrawerProblem,
  } = usePracticeSolvedState(userId);

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
      className="max-w-7xl mx-auto space-y-8 pb-16 select-none"
    >
      {/* ── Top Header */}
      <PracticeHeader
        selectedMode={selectedMode}
        onBack={() => setSelectedMode("index")}
        companiesCount={companiesList.length}
      />

      {/* ── MODE 0: INDEX PAGE CARDS */}
      {selectedMode === "index" && (
        <PracticeModeCards
          onSelectMode={setSelectedMode}
          companiesCount={companiesList.length}
        />
      )}

      {/* ── MODE 1: BEGINNER LEVEL — DSA LEARNING ROADMAP TREE */}
      {selectedMode === "beginner" && (
        <BeginnerDSATree
          drawerSolved={drawerSolved}
          onSelectTopic={setActivePracticeTopic}
        />
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
            searchQuery={searchQuery}
            onSearchQueryChange={setSearchQuery}
            selectedPeriod={selectedPeriod}
            onSelectPeriod={(p) => {
              setSelectedPeriod(p);
              setLimit(100);
            }}
            selectedDifficulty={selectedDifficulty}
            onSelectDifficulty={setSelectedDifficulty}
            selectedStatus={selectedStatus}
            onSelectStatus={setSelectedStatus}
          />

          {/* Progress Tracker Banner */}
          <CompanyProgressTracker
            company={selectedCompany}
            solvedCount={companySolvedCount}
            totalCount={questions.length}
            progressPercent={companyProgressPercent}
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

      {/* Native Smartphone Floating Action Button */}
      {selectedMode !== "index" && (
        <FloatingCTA
          onClick={() => setSelectedMode("index")}
          icon={<ArrowLeft className="w-5 h-5 text-white" />}
          label="Practice Modes"
        />
      )}
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
