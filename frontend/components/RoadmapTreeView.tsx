"use client";

import React, { useState, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Folder,
  FolderOpen,
  FileCode2,
  Check,
  CheckCircle2,
  ExternalLink,
  Search,
  Sparkles,
  ChevronRight,
  BookOpen,
  Layers,
  Play,
  X,
} from "lucide-react";
import { CheckpointItem } from "./RoadmapCurriculumView";

export interface TopicItem {
  id: string;
  name: string;
  desc?: string;
  isRecommended?: boolean;
  isAlternative?: boolean;
  docUrl?: string;
  youtubeUrl?: string;
  youtubeId?: string;
}

export interface RoadmapTreeViewProps {
  roadmapTitle: string;
  roadmapId: string;
  checkpoints: CheckpointItem[];
  completedSubtopics?: Record<string, boolean>;
  onToggleCheckpoint?: (cp: CheckpointItem) => void;
  onToggleSubtopic?: (subtopicId: string, nodeName: string) => void;
  getSubtopicsForNode?: (nodeName: string, roadmapId?: string) => any;
  color?: string;
}

export default function RoadmapTreeView({
  roadmapTitle,
  roadmapId,
  checkpoints,
  completedSubtopics = {},
  onToggleCheckpoint,
  onToggleSubtopic,
  getSubtopicsForNode,
  color = "#3776AB",
}: RoadmapTreeViewProps) {
  const router = useRouter();

  // Search filter
  const [searchQuery, setSearchQuery] = useState("");

  // Track expanded folder state (default open first 2 stations)
  const [openFolders, setOpenFolders] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {};
    if (checkpoints.length > 0) {
      initial[checkpoints[0].id] = true;
    }
    if (checkpoints.length > 1) {
      initial[checkpoints[1].id] = true;
    }
    return initial;
  });

  // Extract all modules with their subtopics
  const modulesWithTopics = useMemo(() => {
    return checkpoints.map((cp) => {
      const branchData = getSubtopicsForNode ? getSubtopicsForNode(cp.title, roadmapId) : null;
      const topics: TopicItem[] =
        branchData?.groups?.flatMap((g: any) => g.topics) || [
          {
            id: `${cp.id}-core`,
            name: `${cp.title.replace(/^\d+\.\s*/, "")} Core`,
            desc: cp.subtitle || "Master the core principles of this milestone.",
          },
        ];
      return {
        checkpoint: cp,
        description: branchData?.description || cp.subtitle,
        topics,
      };
    });
  }, [checkpoints, getSubtopicsForNode, roadmapId]);

  // Selected topic for the inspector pane
  const [selectedState, setSelectedState] = useState<{
    topic: TopicItem;
    checkpoint: CheckpointItem;
    description?: string;
  }>(() => {
    const firstModule = modulesWithTopics[0];
    const firstTopic = firstModule?.topics[0] || {
      id: "py-intro",
      name: "Python Introduction",
      desc: "Overview of Python, ecosystem, philosophy, and language capabilities",
      youtubeUrl: "https://youtu.be/YZkyL-f-YXY",
      youtubeId: "YZkyL-f-YXY",
    };
    return {
      topic: firstTopic,
      checkpoint: firstModule?.checkpoint || checkpoints[0],
      description: firstModule?.description,
    };
  });

  // Track whether the video is actively open & playing for the selected topic
  const [isVideoOpen, setIsVideoOpen] = useState(false);

  // Track active mobile tab ('tree' | 'details')
  const [mobileTab, setMobileTab] = useState<"tree" | "details">("tree");

  // Automatically reset video player to closed state when topic selection changes
  useEffect(() => {
    setIsVideoOpen(false);
  }, [selectedState.topic.id]);

  // Filter modules based on search query
  const filteredModules = useMemo(() => {
    if (!searchQuery.trim()) return modulesWithTopics;
    const q = searchQuery.toLowerCase().trim();
    return modulesWithTopics
      .map((m) => {
        const matchesModule = m.checkpoint.title.toLowerCase().includes(q);
        const matchingTopics = m.topics.filter(
          (t) =>
            t.name.toLowerCase().includes(q) ||
            (t.desc && t.desc.toLowerCase().includes(q))
        );
        if (matchesModule || matchingTopics.length > 0) {
          return {
            ...m,
            topics: matchesModule ? m.topics : matchingTopics,
          };
        }
        return null;
      })
      .filter(Boolean) as typeof modulesWithTopics;
  }, [modulesWithTopics, searchQuery]);

  const toggleFolder = (folderId: string) => {
    setOpenFolders((prev) => ({
      ...prev,
      [folderId]: !prev[folderId],
    }));
  };

  const expandAll = () => {
    const allOpen: Record<string, boolean> = {};
    checkpoints.forEach((cp) => {
      allOpen[cp.id] = true;
    });
    setOpenFolders(allOpen);
  };

  const collapseAll = () => {
    setOpenFolders({});
  };

  const currentTopicDone = selectedState.topic
    ? !!completedSubtopics[selectedState.topic.id]
    : false;

  const handleToggleCurrentTopic = () => {
    if (selectedState.topic && onToggleSubtopic) {
      onToggleSubtopic(selectedState.topic.id, selectedState.checkpoint.title);
    }
  };

  // Find next topic in sequence
  const handleNextTopic = () => {
    let foundCurrent = false;
    for (const m of modulesWithTopics) {
      for (const t of m.topics) {
        if (foundCurrent) {
          setSelectedState({
            topic: t,
            checkpoint: m.checkpoint,
            description: m.description,
          });
          setMobileTab("details");
          setOpenFolders((prev) => ({ ...prev, [m.checkpoint.id]: true }));
          return;
        }
        if (t.id === selectedState.topic.id) {
          foundCurrent = true;
        }
      }
    }
  };

  // Stats calculation
  const totalTopicsCount = useMemo(() => {
    return modulesWithTopics.reduce((sum, m) => sum + m.topics.length, 0);
  }, [modulesWithTopics]);

  return (
    <div className="w-full space-y-5">
      {/* ── Top Bar: Explorer Title, Stats, and Controls ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-zinc-900 border border-slate-200/90 dark:border-zinc-800 p-3.5 sm:p-4 rounded-2xl shadow-xs">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-9 h-9 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center font-black shrink-0">
            <Layers className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <h2 className="text-sm sm:text-lg font-extrabold text-slate-900 dark:text-zinc-100 tracking-tight truncate">
              Python Learning Tree
            </h2>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-56">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search tree files..."
              className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-slate-50 dark:bg-zinc-800 border border-slate-200/80 dark:border-zinc-700 text-xs text-slate-900 dark:text-zinc-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            />
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <button
              type="button"
              onClick={expandAll}
              className="px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-zinc-700 hover:bg-slate-50 dark:hover:bg-zinc-800 text-[11px] sm:text-xs font-semibold text-slate-600 dark:text-zinc-300 transition-colors cursor-pointer"
            >
              Expand
            </button>
            <button
              type="button"
              onClick={collapseAll}
              className="px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-zinc-700 hover:bg-slate-50 dark:hover:bg-zinc-800 text-[11px] sm:text-xs font-semibold text-slate-600 dark:text-zinc-300 transition-colors cursor-pointer"
            >
              Collapse
            </button>
          </div>
        </div>
      </div>

      {/* ── Mobile View Switcher (Tree vs Topic Lesson) ── */}
      <div className="flex lg:hidden items-center p-1 bg-slate-100 dark:bg-zinc-800/80 rounded-xl w-full text-xs font-bold gap-1">
        <button
          type="button"
          onClick={() => setMobileTab("tree")}
          className={`flex-1 py-2 rounded-lg transition-all text-center cursor-pointer ${
            mobileTab === "tree"
              ? "bg-white dark:bg-zinc-900 text-blue-600 dark:text-blue-400 shadow-2xs font-extrabold"
              : "text-slate-600 dark:text-zinc-400 hover:text-slate-900"
          }`}
        >
          Curriculum Tree ({totalTopicsCount})
        </button>
        <button
          type="button"
          onClick={() => setMobileTab("details")}
          className={`flex-1 py-2 rounded-lg transition-all text-center flex items-center justify-center gap-1.5 cursor-pointer ${
            mobileTab === "details"
              ? "bg-white dark:bg-zinc-900 text-blue-600 dark:text-blue-400 shadow-2xs font-extrabold"
              : "text-slate-600 dark:text-zinc-400 hover:text-slate-900"
          }`}
        >
          <span>Lesson Inspector</span>
          {selectedState.topic.youtubeId && (
            <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
          )}
        </button>
      </div>

      {/* ── Main Two-Column Layout: Tree Container (Left) + Learning Inspector (Right) ── */}
      <div className="flex flex-col lg:flex-row items-start gap-6 w-full">
        {/* Left Column: The Hierarchical Tree View */}
        <div className={`shrink-0 w-full lg:w-[340px] ${mobileTab === "tree" ? "block" : "hidden lg:block"}`}>
          <div className="tree-container w-full lg:w-[340px] max-h-[580px] lg:max-h-[680px] overflow-y-auto">
            <ul>
              {filteredModules.map(({ checkpoint: cp, topics }) => {
                const folderId = `tree-folder-${cp.id}`;
                const isOpen = !!openFolders[cp.id];
                const isSelectedModule = selectedState.checkpoint.id === cp.id;
                const completedInModule = topics.filter(
                  (t) => !!completedSubtopics[t.id]
                ).length;
                const isModuleAllDone =
                  topics.length > 0 && completedInModule === topics.length;

                return (
                  <li key={cp.id} className="tree-item">
                    <input
                      type="checkbox"
                      id={folderId}
                      className="tree-toggle"
                      checked={isOpen}
                      onChange={() => toggleFolder(cp.id)}
                    />

                    <label htmlFor={folderId} className="tree-label group">
                      <Folder className="icon folder-closed-icon" />
                      <FolderOpen className="icon folder-open-icon" />
                      <span className="truncate flex-1 font-medium group-hover:text-blue-600 dark:group-hover:text-blue-400">
                        {cp.title}
                      </span>
                      {isModuleAllDone ? (
                        <span className="text-emerald-500 font-bold text-xs shrink-0" title="All topics completed">
                          ✓
                        </span>
                      ) : (
                        <span className="text-[10px] text-slate-400 dark:text-zinc-500 shrink-0 font-normal">
                          {completedInModule}/{topics.length}
                        </span>
                      )}
                    </label>

                    <div className="tree-children-wrapper">
                      <div className="tree-children">
                        <ul>
                          {topics.map((topic) => {
                            const isTopicDone = !!completedSubtopics[topic.id];
                            const isSelected = selectedState.topic?.id === topic.id;

                            return (
                              <li key={topic.id} className="tree-item">
                                <div
                                  className={`file-item ${
                                    isSelected ? "is-selected" : ""
                                  }`}
                                  onClick={() => {
                                    setSelectedState({
                                      topic,
                                      checkpoint: cp,
                                      description: cp.subtitle,
                                    });
                                    setMobileTab("details");
                                  }}
                                  title={topic.name}
                                >
                                  {isTopicDone ? (
                                    <CheckCircle2 className="icon text-emerald-500 stroke-[2.5]" />
                                  ) : (
                                    <FileCode2 className="icon text-blue-500/80" />
                                  )}
                                  <span className="truncate flex-1 text-xs">
                                    {topic.name}
                                  </span>
                                  {topic.isRecommended && (
                                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0" title="Recommended topic" />
                                  )}
                                </div>
                              </li>
                            );
                          })}
                        </ul>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>

        {/* Right Column: Topic Inspector & Interactive Learning Workbench */}
        <div
          id="topic-inspector"
          className={`flex-1 w-full min-w-0 bg-white dark:bg-zinc-900 border border-slate-200/90 dark:border-zinc-800 rounded-2xl p-4 sm:p-7 shadow-sm space-y-5 sm:space-y-6 ${
            mobileTab === "details" ? "block" : "hidden lg:block"
          }`}
        >
          {/* Header of Inspector */}
          <div className="space-y-1.5 pb-4 sm:pb-5 border-b border-slate-100 dark:border-zinc-800">
            <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap text-xs text-slate-500 dark:text-zinc-400 font-semibold">
              <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 font-mono text-[10px] sm:text-[11px] truncate max-w-full">
                {selectedState.checkpoint.title}
              </span>
              <span>/</span>
              <span className="text-blue-600 dark:text-blue-400 font-mono text-[11px] truncate">
                {selectedState.topic.name.toLowerCase().replace(/\s+/g, "_")}.py
              </span>
            </div>

            <h3 className="text-lg sm:text-2xl font-black text-slate-900 dark:text-zinc-100 tracking-tight leading-tight">
              {selectedState.topic.name}
            </h3>

            {selectedState.topic.desc && (
              <p className="text-xs sm:text-sm text-slate-600 dark:text-zinc-300 leading-relaxed font-normal">
                {selectedState.topic.desc}
              </p>
            )}
          </div>

          {/* Video Tutorial Section: Interactive button when closed, Player when opened */}
          {selectedState.topic.youtubeId && (
            <div className="space-y-3">
              {!isVideoOpen ? (
                <div
                  onClick={() => setIsVideoOpen(true)}
                  className="group relative flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 p-3.5 sm:p-5 rounded-2xl border border-red-500/20 dark:border-red-500/30 bg-gradient-to-r from-red-50/80 via-white to-red-50/30 dark:from-red-950/30 dark:via-zinc-900 dark:to-zinc-900 hover:border-red-500/40 hover:shadow-md transition-all cursor-pointer"
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      setIsVideoOpen(true);
                    }
                  }}
                >
                  <div className="flex items-center gap-3 sm:gap-3.5 min-w-0">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-red-600 text-white flex items-center justify-center shadow-md shadow-red-600/30 group-hover:scale-105 group-hover:bg-red-700 transition-all shrink-0">
                      <Play className="w-5 h-5 sm:w-6 sm:h-6 fill-white ml-0.5" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                        <span className="text-[10px] sm:text-[11px] font-black uppercase tracking-wider text-red-600 dark:text-red-400">
                          Video Tutorial Available
                        </span>
                      </div>
                      <h4 className="text-xs sm:text-base font-bold text-slate-900 dark:text-zinc-100 group-hover:text-red-600 dark:group-hover:text-red-400 transition-colors truncate">
                        {selectedState.topic.name}
                      </h4>
                      <p className="text-[11px] sm:text-xs text-slate-500 dark:text-zinc-400 truncate sm:whitespace-normal">
                        Click to watch the full video walkthrough and start learning
                      </p>
                    </div>
                  </div>

                  <div
                    className="flex items-center shrink-0 w-full sm:w-auto"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <button
                      type="button"
                      onClick={() => setIsVideoOpen(true)}
                      className="w-full sm:w-auto justify-center inline-flex items-center gap-2 px-4 py-2 sm:py-2.5 rounded-xl bg-red-600 hover:bg-red-700 active:scale-95 text-white text-xs font-bold transition-all shadow-sm shadow-red-600/30 cursor-pointer"
                    >
                      <Play className="w-3.5 h-3.5 fill-white" />
                      <span>Watch Video</span>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-zinc-200">
                      <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                      <span className="flex items-center gap-1.5 text-slate-900 dark:text-zinc-100 font-extrabold truncate">
                        <Play className="w-3.5 h-3.5 text-red-500 fill-red-500 shrink-0" />
                        <span className="truncate">Playing: {selectedState.topic.name}</span>
                      </span>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        type="button"
                        onClick={() => setIsVideoOpen(false)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-zinc-700 hover:bg-slate-100 dark:hover:bg-zinc-800 text-xs font-semibold text-slate-600 dark:text-zinc-300 transition-colors cursor-pointer"
                        title="Close Video"
                      >
                        <X className="w-3.5 h-3.5" />
                        <span>Close Video</span>
                      </button>
                    </div>
                  </div>

                  <div className="relative w-full aspect-video rounded-2xl overflow-hidden bg-black shadow-lg border border-slate-200 dark:border-zinc-800">
                    <iframe
                      key={selectedState.topic.youtubeId}
                      src={`https://www.youtube.com/embed/${selectedState.topic.youtubeId}?autoplay=1&rel=0&modestbranding=1`}
                      title={selectedState.topic.name}
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                      allowFullScreen
                      className="absolute inset-0 w-full h-full border-0"
                    />
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Station Overview & Context */}
          <div className="bg-slate-50 dark:bg-zinc-800/60 rounded-xl p-3.5 sm:p-4 space-y-2 border border-slate-200/60 dark:border-zinc-800">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400">
              <BookOpen className="w-3.5 h-3.5 text-blue-500" />
              <span>Milestone Context</span>
            </div>
            <p className="text-xs sm:text-sm text-slate-700 dark:text-zinc-300 leading-relaxed">
              {selectedState.description ||
                "This topic forms an essential foundation within the Python engineering curriculum."}
            </p>
          </div>

          {/* Quick Learning & Action Links */}
          <div className="pt-2">
            {/* Documentation Link */}
            <a
              href={
                selectedState.topic.docUrl ||
                `https://docs.python.org/3/search.html?q=${encodeURIComponent(
                  selectedState.topic.name
                )}`
              }
              target="_blank"
              rel="noopener noreferrer"
              className="p-3.5 rounded-xl border border-slate-200/80 dark:border-zinc-800 hover:border-blue-400 dark:hover:border-blue-600 hover:bg-blue-50/30 dark:hover:bg-blue-950/20 transition-all flex items-center justify-between group"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
                  <ExternalLink className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <div className="text-xs font-bold text-slate-900 dark:text-zinc-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 truncate">
                    Official Python Documentation
                  </div>
                  <div className="text-[11px] text-slate-500 truncate">
                    Read syntax guides & API specs
                  </div>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-blue-600 shrink-0" />
            </a>
          </div>

          {/* Footer Actions & Navigation */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pt-4 border-t border-slate-100 dark:border-zinc-800 gap-3">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setMobileTab("tree")}
                className="lg:hidden inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 dark:border-zinc-700 hover:bg-slate-50 dark:hover:bg-zinc-800 text-slate-700 dark:text-zinc-300 font-bold text-xs transition-colors cursor-pointer"
              >
                ← Curriculum Tree
              </button>

              <span className="text-xs text-slate-500 dark:text-zinc-400 hidden sm:inline">
                Click any file in the tree to inspect topics
              </span>
            </div>

            <div className="flex items-center gap-2.5 w-full sm:w-auto">
              {/* Mark as Completed Button (downside) */}
              <button
                type="button"
                onClick={handleToggleCurrentTopic}
                className={`flex-1 sm:flex-initial px-4 py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-xs active:scale-95 ${
                  currentTopicDone
                    ? "bg-emerald-500 hover:bg-emerald-600 text-white"
                    : "bg-slate-900 hover:bg-slate-800 text-white dark:bg-white dark:text-slate-900"
                }`}
              >
                {currentTopicDone ? (
                  <>
                    <Check className="w-4 h-4 stroke-[3]" />
                    <span>Topic Completed</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Mark as Completed</span>
                  </>
                )}
              </button>

              {/* Next Topic Button */}
              <button
                type="button"
                onClick={handleNextTopic}
                className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-700 text-slate-800 dark:text-zinc-200 font-bold text-xs transition-colors cursor-pointer"
              >
                <span>Next Topic</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
