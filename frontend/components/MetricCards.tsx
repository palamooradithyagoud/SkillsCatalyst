"use client";

import React, { useEffect, useState } from "react";
import { BookOpen, Target, Map as MapIcon, Briefcase, Lock, ChevronLeft, ChevronRight, Trash2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { fetchActiveRoadmap, normalizeRoadmapId, removeEnrolledRoadmap, getRoadmapMeta } from "@/lib/api";
import { useAuth } from "@/lib/auth";

interface MetricCardProps {
  title: string;
  icon: React.ReactNode;
  iconBg: string;
  percentage: number;
  ringColor: string;
  subtitle: string;
  subtitleColor: string;
  isLocked?: boolean;
  delay?: number;
  badge?: string;
  onClick?: () => void;
}

function AnimatedCircle({
  percentage,
  ringColor,
  isLocked,
}: {
  percentage: number;
  ringColor: string;
  isLocked?: boolean;
}) {
  const [current, setCurrent] = useState(0);
  const radius = 42;
  const circumference = 2 * Math.PI * radius;
  const dashOffset = circumference - (current / 100) * circumference;

  useEffect(() => {
    if (isLocked) return;
    const timer = setTimeout(() => {
      let start = 0;
      const step = () => {
        start += 1;
        setCurrent(Math.min(start, percentage));
        if (start < percentage) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    }, 300);
    return () => clearTimeout(timer);
  }, [percentage, isLocked]);

  if (isLocked) {
    return (
      <div className="relative w-[112px] h-[112px] flex flex-col items-center justify-center">
        <div className="w-[112px] h-[112px] rounded-full flex items-center justify-center bg-white/[0.03] border border-white/[0.06]">
          <Lock className="w-6 h-6 text-slate-500" />
        </div>
        <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-widest mt-1">
          Locked
        </span>
      </div>
    );
  }

  return (
    <div className="relative w-[112px] h-[112px] flex items-center justify-center">
      <svg className="w-[112px] h-[112px] -rotate-90" viewBox="0 0 100 100">
        <circle
          cx="50"
          cy="50"
          r={radius}
          fill="none"
          stroke="rgba(255, 255, 255, 0.05)"
          strokeWidth="8"
        />
        <motion.circle
          cx="50"
          cy="50"
          r={radius}
          fill="none"
          stroke={ringColor}
          strokeWidth="8"
          strokeDasharray={circumference}
          strokeDashoffset={dashOffset}
          strokeLinecap="round"
          style={{
            filter: `drop-shadow(0 0 6px ${ringColor}66)`,
          }}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-xl font-bold text-white tracking-tight">
          {current}%
        </span>
      </div>
    </div>
  );
}

function MetricCard({
  title,
  icon,
  iconBg,
  percentage,
  ringColor,
  subtitle,
  subtitleColor,
  isLocked,
  delay = 0,
  badge,
  onClick,
}: MetricCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
      onClick={onClick}
      className={`glass rounded-2xl p-5 flex flex-col items-center justify-between min-h-[220px] transition-all duration-300 ${
        onClick ? "cursor-pointer hover:border-purple-500/40 hover:scale-[1.01] active:scale-[0.99]" : "hover:border-white/20"
      } ${isLocked ? "opacity-75" : ""}`}
      style={{
        background:
          "linear-gradient(135deg, rgba(255, 255, 255, 0.03) 0%, rgba(255, 255, 255, 0.01) 100%)",
        boxShadow: "0 8px 32px 0 rgba(0, 0, 0, 0.36)",
      }}
    >
      <div className="w-full flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className={`p-2 rounded-xl ${iconBg}`}>{icon}</div>
          <span className="text-sm font-semibold text-slate-200 tracking-wide">
            {title}
          </span>
        </div>
      </div>

      <div className="my-1.5 flex flex-col items-center">
        <AnimatedCircle
          percentage={percentage}
          ringColor={ringColor}
          isLocked={isLocked}
        />
      </div>

      <div className="flex flex-col items-center w-full min-h-[36px] justify-center">
        <span
          className={`text-xs font-semibold tracking-wide ${subtitleColor} text-center truncate max-w-full`}
        >
          {subtitle}
        </span>
        {badge && (
          <span className="mt-1 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-purple-500/15 border border-purple-500/30 text-purple-300 truncate max-w-full">
            {badge}
          </span>
        )}
      </div>
    </motion.div>
  );
}

function RoadmapMetricCard({ fallbackData }: { fallbackData?: any }) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { session } = useAuth();
  const userId = session?.user_id;

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  const {
    data: activeRm,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ["active-roadmap", userId],
    queryFn: () => fetchActiveRoadmap(),
    enabled: !!userId,
    staleTime: 1000 * 10,
  });

  const rawList = activeRm?.roadmaps || fallbackData?.roadmaps || [];

  const presetDefaults: Record<string, any> = {
    "c-programming": {
      roadmap_id: "c-programming",
      title: "C Programming Mastery",
      progress_percent: 0,
      completed_milestones: 0,
      total_milestones: 48,
      next_module: { title: "Introduction (C vs Assembly / C vs C++)" }
    },
    "cpp-programming": {
      roadmap_id: "cpp-programming",
      title: "C++ Development Mastery",
      progress_percent: 0,
      completed_milestones: 0,
      total_milestones: 37,
      next_module: { title: "Introduction to Language (What is C++ / Why C++ / C vs C++)" }
    },
    "python-mastery": {
      roadmap_id: "python-mastery",
      title: "Python Mastery",
      progress_percent: 0,
      completed_milestones: 0,
      total_milestones: 57,
      next_module: { title: "Basic Syntax" }
    }
  };

  let removedRoadmaps: string[] = [];
  if (typeof window !== "undefined") {
    try {
      const raw = localStorage.getItem("skillscatalyst_removed_roadmaps");
      if (raw) removedRoadmaps = JSON.parse(raw);
    } catch {}
  }

  const listMap = new Map<string, any>();

  if (rawList && rawList.length > 0) {
    rawList.forEach((item: any) => {
      const normId = normalizeRoadmapId(item.roadmap_id || item.title);
      if (normId && !removedRoadmaps.includes(normId)) {
        const meta = getRoadmapMeta(normId);
        const exactTotal = meta.total > 0 ? meta.total : (item.total_milestones || 20);
        listMap.set(normId, {
          ...item,
          roadmap_id: normId,
          title: item.title || meta.name,
          total_milestones: exactTotal,
        });
      }
    });
  } else if (activeRm?.has_active_roadmap || fallbackData?.has_active_roadmap || fallbackData?.roadmapName) {
    const singleId = normalizeRoadmapId(activeRm?.roadmap_id || fallbackData?.roadmapId || "c-programming");
    if (!removedRoadmaps.includes(singleId)) {
      const meta = getRoadmapMeta(singleId);
      const singleTitle = activeRm?.title || fallbackData?.roadmapName || meta.name || "Active Roadmap";
      const exactTotal = meta.total > 0 ? meta.total : (activeRm?.total_milestones || fallbackData?.total_milestones || 20);
      listMap.set(singleId, {
        roadmap_id: singleId,
        title: singleTitle,
        progress_percent: activeRm?.progress_percent ?? fallbackData?.percentage ?? 0,
        completed_milestones: activeRm?.completed_milestones ?? fallbackData?.count ?? 0,
        total_milestones: exactTotal,
        next_module: activeRm?.next_module || { title: fallbackData?.nextTopic || meta.nextTopic },
      });
    }
  }

  const list = Array.from(listMap.values());
  const listLength = list.length;

  useEffect(() => {
    if (listLength <= 1 || isHovered) return;
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % listLength);
    }, 4000);
    return () => clearInterval(timer);
  }, [listLength, isHovered]);

  if (isLoading && !fallbackData) {
    return (
      <div className="glass rounded-2xl p-5 flex flex-col items-center justify-between min-h-[220px] animate-pulse">
        <div className="w-full flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400">
            <MapIcon className="w-4 h-4" />
          </div>
          <div className="h-4 w-28 bg-white/10 rounded" />
        </div>
        <div className="w-20 h-20 rounded-full border-4 border-purple-500/20 border-t-purple-500 animate-spin my-3" />
        <div className="h-3 w-32 bg-white/10 rounded" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="glass rounded-2xl p-5 flex flex-col items-center justify-between min-h-[220px] border border-rose-500/30">
        <div className="w-full flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400">
            <MapIcon className="w-4 h-4" />
          </div>
          <span className="text-sm font-semibold text-slate-200">Roadmap Progress</span>
        </div>
        <div className="text-center my-3 space-y-2">
          <span className="text-xs text-rose-300 font-medium block">
            Unable to load roadmap progress.
          </span>
          <button
            onClick={() => refetch()}
            className="px-3 py-1 text-xs font-bold bg-rose-500/20 hover:bg-rose-500/30 text-rose-200 border border-rose-500/40 rounded-lg transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (list.length === 0) {
    return (
      <div className="glass rounded-2xl p-5 flex flex-col items-center justify-between min-h-[240px] relative overflow-hidden text-center">
        <div className="w-full flex items-center justify-between z-10">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400">
              <MapIcon className="w-4 h-4" />
            </div>
            <span className="text-sm font-semibold text-slate-200 tracking-wide">
              Roadmap Progress
            </span>
          </div>
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-500/20 border border-slate-500/30 text-slate-400">
            0 Enrolled
          </span>
        </div>

        <div className="my-auto space-y-2 z-10 py-3">
          <div className="w-10 h-10 mx-auto rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
            <MapIcon className="w-5 h-5" />
          </div>
          <span className="text-xs font-semibold text-slate-300 block">
            No active roadmaps enrolled
          </span>
          <span className="text-[11px] text-slate-400 block max-w-[200px] mx-auto">
            Enroll in C or C++ roadmaps to track progress.
          </span>
        </div>

        <button
          onClick={() => router.push("/roadmaps")}
          className="w-full py-1.5 px-3 rounded-xl bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 border border-purple-500/30 text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow-sm z-10"
        >
          <span>Explore Roadmaps</span>
          <span>→</span>
        </button>
      </div>
    );
  }

  const activeIndex = currentIndex % list.length;
  const currentItem = list[activeIndex] || list[0];

  const pct = currentItem?.progress_percent ?? 0;
  const title = currentItem?.title || "Active Roadmap";
  const completed = currentItem?.completed_milestones ?? 0;
  const total = currentItem?.total_milestones ?? 20;
  const nextTopic = currentItem?.next_module?.title || "";

  const handleContinue = (targetId?: string) => {
    const rid = targetId || currentItem?.roadmap_id || "c-programming";
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem("skillscatalyst_open_roadmap_id", rid);
      } catch {}
    }
    router.push("/roadmaps");
  };

  const handleRemoveRoadmap = async (targetId?: string) => {
    const rid = targetId || currentItem?.roadmap_id || "c-programming";
    const titleToRemove = currentItem?.title || "roadmap";
    if (confirm(`Remove ${titleToRemove} from your active dashboard roadmaps?`)) {
      await removeEnrolledRoadmap(rid);
      queryClient.invalidateQueries({ queryKey: ["active-roadmap"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      setCurrentIndex((prev) => Math.max(0, prev - 1));
    }
  };

  const handlePrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev - 1 + list.length) % list.length);
  };

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev + 1) % list.length);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="glass rounded-2xl p-5 flex flex-col items-center justify-between min-h-[240px] transition-all duration-300 hover:border-purple-500/40 cursor-pointer relative overflow-hidden group"
      onClick={() => handleContinue(currentItem?.roadmap_id)}
      style={{
        background:
          "linear-gradient(135deg, rgba(255, 255, 255, 0.03) 0%, rgba(255, 255, 255, 0.01) 100%)",
        boxShadow: "0 8px 32px 0 rgba(0, 0, 0, 0.36)",
      }}
    >
      {/* Clean Uncramped Header with Remove Option */}
      <div className="w-full flex items-center justify-between z-10">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400">
            <MapIcon className="w-4 h-4" />
          </div>
          <span className="text-sm font-semibold text-slate-200 tracking-wide">
            Roadmap Progress
          </span>
        </div>

        <div className="flex items-center gap-1.5 z-20">
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-purple-500/15 border border-purple-500/30 text-purple-300">
            {activeIndex + 1} / {list.length} Enrolled
          </span>
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleRemoveRoadmap(currentItem?.roadmap_id);
            }}
            className="p-1 rounded-lg bg-rose-500/10 hover:bg-rose-500/25 text-rose-400 border border-rose-500/20 transition-all hover:scale-105 active:scale-95"
            title={`Remove ${currentItem?.title || "roadmap"} from active roadmaps`}
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Middle Previous Button (<) on Left Side */}
      <button
        onClick={handlePrev}
        className="absolute left-2 top-1/2 -translate-y-1/2 z-20 p-1.5 rounded-full bg-white/10 hover:bg-purple-600/50 border border-white/15 text-slate-300 hover:text-white shadow-lg backdrop-blur-md transition-all hover:scale-110 active:scale-95"
        title="Previous Roadmap"
      >
        <ChevronLeft className="w-4 h-4" />
      </button>

      {/* Middle Next Button (>) on Right Side */}
      <button
        onClick={handleNext}
        className="absolute right-2 top-1/2 -translate-y-1/2 z-20 p-1.5 rounded-full bg-white/10 hover:bg-purple-600/50 border border-white/15 text-slate-300 hover:text-white shadow-lg backdrop-blur-md transition-all hover:scale-110 active:scale-95"
        title="Next Roadmap"
      >
        <ChevronRight className="w-4 h-4" />
      </button>

      {/* Animated Carousel Slide Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentItem?.roadmap_id || activeIndex}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.25 }}
          className="w-full flex flex-col items-center my-1 z-10 px-6"
        >
          <div className="my-1 flex flex-col items-center">
            <AnimatedCircle percentage={pct} ringColor="#a855f7" />
          </div>

          <div className="flex flex-col items-center w-full justify-center text-center mt-1">
            <span className="text-xs font-bold text-white truncate max-w-full">
              {title}
            </span>
            <span className="text-[11px] font-semibold text-purple-300/90 mt-0.5">
              {completed} / {total} milestones completed
            </span>
            {nextTopic && (
              <span className="mt-1 px-2.5 py-0.5 rounded-full text-[10px] font-medium bg-purple-500/15 border border-purple-500/30 text-purple-300 truncate max-w-full">
                {nextTopic.startsWith("Next:") || nextTopic.startsWith("Current:")
                  ? nextTopic
                  : `Current: ${nextTopic}`}
              </span>
            )}
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Bottom Section: Pagination Dots + Continue Button */}
      <div className="w-full space-y-2 z-10">
        <div className="flex items-center justify-center gap-1.5">
          {list.map((_: any, idx: number) => (
            <button
              key={idx}
              onClick={(e) => {
                e.stopPropagation();
                setCurrentIndex(idx);
              }}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                idx === activeIndex
                  ? "w-4 bg-purple-400"
                  : "w-1.5 bg-slate-600 hover:bg-slate-400"
              }`}
            />
          ))}
        </div>

        <button
          onClick={(e) => {
            e.stopPropagation();
            handleContinue(currentItem?.roadmap_id);
          }}
          className="w-full py-1.5 px-3 rounded-xl bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 border border-purple-500/30 text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow-sm"
        >
          <span>Continue Roadmap</span>
          <span>→</span>
        </button>
      </div>
    </motion.div>
  );
}

export interface MetricsData {
  learningProgress?: {
    percentage: number;
    completedVideos: number;
    totalVideos: number;
    subtitle: string;
  };
  roadmapProgress?: {
    has_active_roadmap?: boolean;
    count?: number;
    percentage: number;
    subtitle: string;
    roadmapName?: string;
    nextTopic?: string;
    roadmapId?: string;
    roadmaps?: any[];
  };
  savedPlaylists?: {
    count?: number;
    percentage: number;
    subtitle: string;
  };
  resumeReadiness?: {
    percentage: number;
    subtitle: string;
  };
  interviewReadiness?: {
    isLocked: boolean;
    subtitle: string;
  };
}

export default function MetricCards({ metrics }: { metrics?: MetricsData }) {
  const lp = metrics?.learningProgress;
  const rr = metrics?.resumeReadiness;
  const ir = metrics?.interviewReadiness;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      <MetricCard
        title="Learning Progress"
        icon={<BookOpen className="w-4 h-4 text-cyan-400" />}
        iconBg="bg-cyan-500/10 border border-cyan-500/20"
        percentage={lp?.percentage ?? 0}
        ringColor="#06b6d4"
        subtitle={lp?.subtitle ?? "0 videos completed"}
        subtitleColor="text-cyan-400"
        delay={0.1}
      />
      <RoadmapMetricCard fallbackData={metrics?.roadmapProgress} />
      <MetricCard
        title="Resume Readiness"
        icon={<Target className="w-4 h-4 text-blue-400" />}
        iconBg="bg-blue-500/10 border border-blue-500/20"
        percentage={rr?.percentage ?? 0}
        ringColor="#3b82f6"
        subtitle={rr?.subtitle ?? "No upload yet"}
        subtitleColor="text-blue-400"
        delay={0.3}
      />
      <MetricCard
        title="Interview Readiness"
        icon={<Briefcase className="w-4 h-4 text-rose-400" />}
        iconBg="bg-rose-500/10 border border-rose-500/20"
        percentage={ir?.isLocked ? 0 : 75}
        ringColor="#f43f5e"
        subtitle={ir?.subtitle ?? "Currently Locked"}
        subtitleColor="text-slate-500"
        isLocked={ir?.isLocked ?? true}
        delay={0.4}
      />
    </div>
  );
}

