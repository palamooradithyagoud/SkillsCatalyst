"use client";

import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  CheckCircle2,
  Check,
  ChevronDown,
  ChevronRight,
  ExternalLink,
  BookOpen,
  Sparkles,
  Layers,
  Search,
  Clock,
  Lightbulb,
  Target,
  Inbox,
  Users,
} from "lucide-react";

export interface CheckpointItem {
  id: string;
  index: number;
  title: string;
  subtitle?: string;
  isCompleted: boolean;
  isCurrentTarget: boolean;
  nodesCount: number;
  completedNodesCount: number;
}

export interface SubtopicTopic {
  id: string;
  name: string;
  isRecommended?: boolean;
  isAlternative?: boolean;
  isOrderNotStrict?: boolean;
  docUrl?: string;
  desc?: string;
}

export interface SubtopicGroup {
  groupName?: string;
  topics: SubtopicTopic[];
}

export interface NodeTreeBranches {
  description: string;
  groups: SubtopicGroup[];
}

export interface RoadmapCurriculumViewProps {
  roadmapTitle: string;
  roadmapId: string;
  category: "skill" | "career";
  ratings?: string;
  salary?: string;
  growth?: string;
  color?: string;
  checkpoints: CheckpointItem[];
  progressPct: number;
  doneCount: number;
  totalCount: number;
  isEnrolled: boolean;
  onEnroll: () => void;
  onBack: () => void;
  onToggleCheckpoint: (checkpoint: CheckpointItem) => void;
  onToggleSubtopic?: (subtopicId: string, nodeName: string) => void;
  completedSubtopics?: Record<string, boolean>;
  getSubtopicsForNode?: (nodeName: string, roadmapId?: string) => NodeTreeBranches;
}

export default function RoadmapCurriculumView({
  roadmapTitle,
  roadmapId,
  category,
  ratings = "4.9 Rating",
  salary,
  growth,
  color = "#3776AB",
  checkpoints,
  progressPct,
  doneCount,
  totalCount,
  isEnrolled,
  onEnroll,
  onBack,
  onToggleCheckpoint,
  onToggleSubtopic,
  completedSubtopics = {},
  getSubtopicsForNode,
}: RoadmapCurriculumViewProps) {
  const [searchFilter, setSearchFilter] = useState("");
  const [filterMode, setFilterMode] = useState<"all" | "completed" | "remaining">("all");
  const [expandedModules, setExpandedModules] = useState<Record<string, boolean>>({
    [checkpoints[0]?.id || ""]: true,
  });

  const toggleExpand = (id: string) => {
    setExpandedModules((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const expandAll = () => {
    const allExpanded: Record<string, boolean> = {};
    checkpoints.forEach((cp) => {
      allExpanded[cp.id] = true;
    });
    setExpandedModules(allExpanded);
  };

  const collapseAll = () => {
    setExpandedModules({});
  };

  const filteredCheckpoints = useMemo(() => {
    return checkpoints.filter((cp) => {
      if (filterMode === "completed" && !cp.isCompleted) return false;
      if (filterMode === "remaining" && cp.isCompleted) return false;
      if (searchFilter.trim()) {
        const q = searchFilter.toLowerCase();
        const matchTitle = cp.title.toLowerCase().includes(q);
        const matchSubtitle = (cp.subtitle || "").toLowerCase().includes(q);
        return matchTitle || matchSubtitle;
      }
      return true;
    });
  }, [checkpoints, filterMode, searchFilter]);

  const isPython = roadmapId === "python-mastery" || roadmapId.includes("python");

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-20">
      {/* ── Top Back Navigation & Breadcrumb ── */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white border border-slate-200/90 hover:bg-slate-50 text-slate-700 hover:text-slate-900 font-bold text-xs shadow-2xs transition-all cursor-pointer active:scale-95"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Roadmaps</span>
        </button>

        <div className="flex items-center gap-2">
          <span className="px-3 py-1 rounded-full bg-slate-100 border border-slate-200 text-slate-600 text-[11px] font-bold uppercase tracking-wider">
            {category === "career" ? "Career Path" : "Skill Roadmap"}
          </span>
          <span className="text-xs text-slate-400 font-medium hidden sm:inline-block">/</span>
          <span className="text-xs font-semibold text-slate-800 hidden sm:inline-block">
            {roadmapTitle}
          </span>
        </div>
      </div>

      {/* ── Header Card ── */}
      <div className="relative overflow-hidden rounded-3xl bg-[#7d26cd] border border-[#6b1eb5] p-8 sm:p-10 lg:p-12 shadow-xl space-y-8">
        <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-6">
          <div className="flex items-center gap-4 sm:gap-5">
            {/* Logo container */}
            {isPython ? (
              <div className="w-14 h-14 sm:w-18 sm:h-18 rounded-2xl bg-black flex items-center justify-center p-2.5 sm:p-3 shadow-md shrink-0">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/images/tech-logos/python.svg"
                  alt="Python"
                  className="w-9 h-9 sm:w-11 sm:h-11 object-contain"
                />
              </div>
            ) : (
              <div className="w-14 h-14 sm:w-18 sm:h-18 rounded-2xl bg-black flex items-center justify-center shadow-md text-white shrink-0">
                <BookOpen className="w-7 h-7 sm:w-9 sm:h-9 text-white" />
              </div>
            )}

            <div>
              <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight leading-tight">
                {roadmapTitle}
              </h1>
            </div>
          </div>

          {/* Right side stats bar matching image */}
          <div className="flex items-center gap-4 sm:gap-6 flex-wrap text-white text-xs sm:text-sm font-bold shrink-0">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-white/80 shrink-0" />
              <span>32 Hours</span>
            </div>
            <div className="flex items-center gap-2">
              <Lightbulb className="w-4 h-4 text-white/80 shrink-0" />
              <span>0 Videos</span>
            </div>
            <div className="flex items-center gap-2">
              <Target className="w-4 h-4 text-white/80 shrink-0" />
              <span>0 Assessments</span>
            </div>
            <div className="flex items-center gap-2">
              <Inbox className="w-4 h-4 text-white/80 shrink-0" />
              <span>6 Projects</span>
            </div>
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-white/80 shrink-0" />
              <span>102 Participants</span>
            </div>
          </div>
        </div>

        {/* ── Details Section: Small Cards ── */}
        <div className="pt-4 sm:pt-5 border-t border-black/15 flex items-stretch gap-4 flex-wrap">
          {/* Card 1: IN ROADMAP (Black background, White text) */}
          <div className="w-52 sm:w-56 rounded-2xl bg-black p-3.5 sm:p-4 text-white shadow-md border border-white/10 shrink-0">
            <div className="flex items-center gap-1.5 text-amber-400 font-extrabold text-[11px] uppercase tracking-wider mb-2.5">
              <span>🔥</span>
              <span>IN ROADMAP</span>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between border-b border-dashed border-white/20 pb-1.5">
                <span className="flex items-center gap-1.5 font-bold text-white">
                  <span className="text-amber-400 text-sm leading-none">•</span> Core Syntax & DSA
                </span>
                <span className="text-slate-400 text-xs font-semibold">5 Stns</span>
              </div>
              <div className="flex items-center justify-between border-b border-dashed border-white/20 pb-1.5">
                <span className="flex items-center gap-1.5 font-bold text-white">
                  <span className="text-amber-400 text-sm leading-none">•</span> OOP & Decorators
                </span>
                <span className="text-slate-400 text-xs font-semibold">6 Stns</span>
              </div>
              <div className="flex items-center justify-between border-b border-dashed border-white/20 pb-1.5">
                <span className="flex items-center gap-1.5 font-bold text-white">
                  <span className="text-amber-400 text-sm leading-none">•</span> Web Frameworks
                </span>
                <span className="text-slate-400 text-xs font-semibold">4 Stns</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5 font-bold text-white">
                  <span className="text-amber-400 text-sm leading-none">•</span> Async & Testing
                </span>
                <span className="text-slate-400 text-xs font-semibold">6 Stns</span>
              </div>
            </div>
          </div>

          {/* Card 2: YOU GET (White background, Black text) */}
          <div className="w-52 sm:w-56 rounded-2xl bg-white p-3.5 sm:p-4 text-black shadow-md border border-slate-100 shrink-0">
            <div className="text-slate-500 font-extrabold text-[11px] uppercase tracking-wider mb-2.5">
              YOU GET
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex items-center border-b border-dashed border-slate-200 pb-1.5">
                <span className="flex items-center gap-1.5 font-bold text-black">
                  <span className="text-black text-sm leading-none">•</span> 21 Stations
                </span>
              </div>
              <div className="flex items-center border-b border-dashed border-slate-200 pb-1.5">
                <span className="flex items-center gap-1.5 font-bold text-black">
                  <span className="text-black text-sm leading-none">•</span> Subtopic Checklist
                </span>
              </div>
              <div className="flex items-center border-b border-dashed border-slate-200 pb-1.5">
                <span className="flex items-center gap-1.5 font-bold text-black">
                  <span className="text-black text-sm leading-none">•</span> Official Docs
                </span>
              </div>
              <div className="flex items-center">
                <span className="flex items-center gap-1.5 font-bold text-black">
                  <span className="text-black text-sm leading-none">•</span> Real Projects
                </span>
              </div>
            </div>
          </div>

          {/* Card 3: Round Percentage (Beside the white card, same size) */}
          <div className="w-52 sm:w-56 rounded-2xl bg-white p-3.5 sm:p-4 text-black shadow-md border border-slate-100 shrink-0 flex flex-col justify-between">
            <div className="text-slate-500 font-extrabold text-[11px] uppercase tracking-wider mb-2.5">
              PROGRESS
            </div>

            <div className="my-auto flex flex-col items-center justify-center py-1">
              <div className="relative flex items-center justify-center w-18 h-18 sm:w-20 sm:h-20">
                <svg className="w-18 h-18 sm:w-20 sm:h-20 -rotate-90" viewBox="0 0 36 36">
                  <path
                    className="text-slate-100"
                    strokeWidth="3.5"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                  <path
                    className="text-[#7d26cd] transition-all duration-500"
                    strokeDasharray={`${progressPct}, 100`}
                    strokeWidth="3.5"
                    strokeLinecap="round"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                </svg>
                <div className="absolute flex flex-col items-center justify-center text-center">
                  <span className="text-base sm:text-lg font-black text-black leading-none">
                    {progressPct}%
                  </span>
                </div>
              </div>
            </div>

            <div className="pt-1.5 border-t border-dashed border-slate-200 text-center">
              <span className="text-xs font-bold text-slate-600">
                {doneCount} / {totalCount} Stations Done
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Modules List & Search / Filter Controls ── */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <h2 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight">
              Curriculum Modules
            </h2>
            <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 text-xs font-bold">
              {checkpoints.length}
            </span>
          </div>

          {/* Filter Chips & Expand Controls */}
          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex items-center bg-slate-100 rounded-xl p-0.5 text-xs font-semibold text-slate-600">
              <button
                type="button"
                onClick={() => setFilterMode("all")}
                className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                  filterMode === "all" ? "bg-white text-slate-900 shadow-2xs" : "hover:text-slate-900"
                }`}
              >
                All ({checkpoints.length})
              </button>
              <button
                type="button"
                onClick={() => setFilterMode("completed")}
                className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                  filterMode === "completed" ? "bg-white text-slate-900 shadow-2xs" : "hover:text-slate-900"
                }`}
              >
                Done ({doneCount})
              </button>
              <button
                type="button"
                onClick={() => setFilterMode("remaining")}
                className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                  filterMode === "remaining" ? "bg-white text-slate-900 shadow-2xs" : "hover:text-slate-900"
                }`}
              >
                Remaining ({totalCount - doneCount})
              </button>
            </div>

            <button
              type="button"
              onClick={expandAll}
              className="px-2.5 py-1 text-xs font-semibold text-slate-600 hover:text-slate-900 cursor-pointer"
            >
              Expand All
            </button>
            <span className="text-slate-300">|</span>
            <button
              type="button"
              onClick={collapseAll}
              className="px-2.5 py-1 text-xs font-semibold text-slate-600 hover:text-slate-900 cursor-pointer"
            >
              Collapse
            </button>
          </div>
        </div>

        {/* Search input */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchFilter}
            onChange={(e) => setSearchFilter(e.target.value)}
            placeholder="Search modules or topics..."
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-white border border-slate-200/90 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400 transition-all"
          />
        </div>

        {/* ── Modules Accordion ── */}
        <div className="space-y-3 pt-2">
          {filteredCheckpoints.map((cp) => {
            const isExpanded = !!expandedModules[cp.id];
            const branchData = getSubtopicsForNode ? getSubtopicsForNode(cp.title, roadmapId) : null;
            const allTopics = branchData?.groups?.flatMap((g) => g.topics) || [];

            return (
              <div
                key={cp.id}
                className={`rounded-2xl border transition-all duration-200 overflow-hidden ${
                  cp.isCompleted
                    ? "bg-slate-50/70 border-slate-200"
                    : "bg-white border-slate-200/90 hover:border-slate-300 shadow-xs"
                }`}
              >
                {/* Module Header Row */}
                <div className="p-4 sm:p-5 flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3.5 flex-1 min-w-0">
                    {/* Status / Toggle Completion Button */}
                    <button
                      type="button"
                      onClick={() => onToggleCheckpoint(cp)}
                      title={cp.isCompleted ? "Mark incomplete" : "Mark module completed"}
                      className={`w-7 h-7 rounded-xl flex items-center justify-center transition-all cursor-pointer shrink-0 mt-0.5 ${
                        cp.isCompleted
                          ? "bg-emerald-500 hover:bg-emerald-600 text-white shadow-xs"
                          : "border-2 border-slate-300 hover:border-slate-500 text-slate-500 bg-white"
                      }`}
                    >
                      {cp.isCompleted ? (
                        <Check className="w-4 h-4 stroke-[3]" />
                      ) : (
                        <span className="text-[11px] font-bold">{cp.index + 1}</span>
                      )}
                    </button>

                    {/* Title & Subtitle */}
                    <div
                      className="flex-1 min-w-0 cursor-pointer select-none"
                      onClick={() => toggleExpand(cp.id)}
                    >
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3
                          className={`text-sm sm:text-base font-bold transition-colors ${
                            cp.isCompleted
                              ? "text-slate-600 line-through decoration-slate-300"
                              : "text-slate-900 hover:text-blue-600"
                          }`}
                        >
                          {cp.title}
                        </h3>
                        {allTopics.length > 0 && (
                          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-slate-100 text-slate-600">
                            {allTopics.length} topics
                          </span>
                        )}
                      </div>

                      {cp.subtitle && (
                        <p className="text-xs text-slate-500 mt-1 font-normal leading-relaxed">
                          {cp.subtitle}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Expand / Collapse toggle */}
                  <button
                    type="button"
                    onClick={() => toggleExpand(cp.id)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-all cursor-pointer shrink-0"
                    title={isExpanded ? "Collapse" : "Expand"}
                  >
                    {isExpanded ? (
                      <ChevronDown className="w-4 h-4" />
                    ) : (
                      <ChevronRight className="w-4 h-4" />
                    )}
                  </button>
                </div>

                {/* Expanded Subtopics Area */}
                {isExpanded && (
                  <div className="px-4 sm:px-5 pb-5 pt-1 border-t border-slate-100 bg-slate-50/40 space-y-4">
                    {branchData?.description && (
                      <p className="text-xs text-slate-600 font-medium leading-relaxed pt-2">
                        {branchData.description}
                      </p>
                    )}

                    {branchData?.groups && branchData.groups.length > 0 ? (
                      <div className="space-y-4 pt-1">
                        {branchData.groups.map((group, gIdx) => (
                          <div key={gIdx} className="space-y-2">
                            {group.groupName && (
                              <div className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500">
                                {group.groupName}
                              </div>
                            )}

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                              {group.topics.map((topic) => {
                                const isTopicDone = !!completedSubtopics[topic.id];

                                return (
                                  <div
                                    key={topic.id}
                                    className={`p-3 rounded-xl border transition-all flex items-start gap-3 ${
                                      isTopicDone
                                        ? "bg-emerald-50/30 border-emerald-200"
                                        : "bg-white border-slate-200/80 hover:border-slate-300"
                                    }`}
                                  >
                                    {/* Topic Checkbox */}
                                    {onToggleSubtopic && (
                                      <button
                                        type="button"
                                        onClick={() => onToggleSubtopic(topic.id, cp.title)}
                                        className={`w-4 h-4 rounded-md mt-0.5 flex items-center justify-center transition-all cursor-pointer shrink-0 ${
                                          isTopicDone
                                            ? "bg-emerald-500 text-white"
                                            : "border border-slate-300 hover:border-slate-500 bg-white"
                                        }`}
                                        title={isTopicDone ? "Mark incomplete" : "Mark topic done"}
                                      >
                                        {isTopicDone && <Check className="w-3 h-3 stroke-[3]" />}
                                      </button>
                                    )}

                                    <div className="flex-1 min-w-0">
                                      <div className="flex items-center gap-1.5 flex-wrap">
                                        <span
                                          className={`text-xs font-bold ${
                                            isTopicDone
                                              ? "text-slate-600 line-through decoration-slate-300"
                                              : "text-slate-900"
                                          }`}
                                        >
                                          {topic.name}
                                        </span>

                                        {topic.isRecommended && (
                                          <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-amber-50 text-amber-700 border border-amber-200">
                                            Recommended
                                          </span>
                                        )}

                                        {topic.isAlternative && (
                                          <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-slate-100 text-slate-600">
                                            Alternative
                                          </span>
                                        )}

                                        {topic.docUrl && (
                                          <a
                                            href={topic.docUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="inline-flex items-center gap-0.5 text-[10px] text-blue-600 hover:text-blue-800 font-semibold hover:underline"
                                            title="Official Documentation"
                                          >
                                            <ExternalLink className="w-2.5 h-2.5" />
                                            <span>Docs</span>
                                          </a>
                                        )}
                                      </div>

                                      {topic.desc && (
                                        <p className="text-[11px] text-slate-500 mt-0.5 leading-snug">
                                          {topic.desc}
                                        </p>
                                      )}
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-xs text-slate-500 py-2">
                        Complete this core milestone to advance your roadmap progress.
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
