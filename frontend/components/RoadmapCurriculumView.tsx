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
      <div className="relative overflow-hidden rounded-3xl bg-white border border-slate-200/90 p-6 sm:p-8 shadow-sm space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            {/* Logo container */}
            {isPython ? (
              <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-slate-50 border border-slate-200/90 flex items-center justify-center p-2.5 shadow-2xs shrink-0">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/images/tech-logos/python.svg"
                  alt="Python"
                  className="w-9 h-9 sm:w-10 sm:h-10 object-contain"
                />
              </div>
            ) : (
              <div
                className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl flex items-center justify-center shadow-2xs text-white shrink-0"
                style={{ background: color }}
              >
                <BookOpen className="w-7 h-7 sm:w-8 sm:h-8" />
              </div>
            )}

            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-[10px] font-bold uppercase tracking-wider">
                  Verified Curriculum
                </span>
                <span className="text-xs font-semibold text-slate-500">
                  {checkpoints.length} Modules
                </span>
              </div>

              <h1 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight leading-tight">
                {roadmapTitle}
              </h1>

              <p className="text-xs sm:text-sm text-slate-600 font-medium leading-relaxed max-w-2xl">
                Structured step-by-step learning path covering foundational syntax, real-world architecture, and production-level engineering practices.
              </p>
            </div>
          </div>

          {/* Action / Enroll CTA */}
          <div className="shrink-0">
            {isEnrolled ? (
              <div className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-50 border border-emerald-200/90 text-emerald-700 text-xs font-bold shadow-xs">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Enrolled in Pathway</span>
              </div>
            ) : (
              <button
                type="button"
                onClick={onEnroll}
                className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs sm:text-sm shadow-sm transition-all cursor-pointer text-center active:scale-95"
              >
                Enroll in Roadmap
              </button>
            )}
          </div>
        </div>

        {/* ── Key Metrics & Progress Bar ── */}
        <div className="pt-4 border-t border-slate-100 space-y-4">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-700 flex-wrap gap-2">
            <span>
              Curriculum Progress:{" "}
              <strong className="text-slate-900 font-bold">
                {doneCount} of {totalCount} completed
              </strong>
            </span>
            <span className="font-bold text-slate-900">{progressPct}% Complete</span>
          </div>

          <div className="w-full h-2.5 rounded-full bg-slate-100 overflow-hidden">
            <div
              className="h-full rounded-full bg-slate-900 transition-all duration-500"
              style={{ width: `${progressPct}%` }}
            />
          </div>

          <div className="flex items-center gap-2.5 flex-wrap pt-1 text-xs">
            {ratings && (
              <span className="font-bold px-3 py-1 rounded-full bg-amber-50 border border-amber-200/80 text-amber-700 shadow-2xs">
                ★ {ratings}
              </span>
            )}
            {salary && (
              <span className="font-bold px-3 py-1 rounded-full bg-slate-100 border border-slate-200/80 text-slate-700 shadow-2xs">
                💼 {salary}
              </span>
            )}
            {growth && (
              <span className="font-bold px-3 py-1 rounded-full bg-blue-50 border border-blue-200/80 text-blue-700 shadow-2xs">
                📈 {growth}
              </span>
            )}
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
