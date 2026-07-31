"use client";

import React, { useEffect, useState } from "react";
import { BookOpen, Target, Map, Briefcase, Lock } from "lucide-react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { fetchActiveRoadmap } from "@/lib/api";
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
  const { session } = useAuth();
  const userId = session?.user_id;

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

  if (isLoading && !fallbackData) {
    return (
      <div className="glass rounded-2xl p-5 flex flex-col items-center justify-between min-h-[220px] animate-pulse">
        <div className="w-full flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400">
            <Map className="w-4 h-4" />
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
            <Map className="w-4 h-4" />
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

  const hasActive = activeRm?.has_active_roadmap ?? fallbackData?.has_active_roadmap ?? !!fallbackData?.roadmapName;

  if (!hasActive) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass rounded-2xl p-5 flex flex-col items-center justify-between min-h-[220px] transition-all hover:border-purple-500/30"
      >
        <div className="w-full flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400">
            <Map className="w-4 h-4" />
          </div>
          <span className="text-sm font-semibold text-slate-200">Roadmap Progress</span>
        </div>

        <div className="text-center my-3 space-y-1.5">
          <div className="text-sm font-bold text-white">No active roadmap</div>
          <p className="text-xs text-slate-400 leading-relaxed max-w-[200px]">
            Choose a career roadmap and start tracking your journey.
          </p>
        </div>

        <button
          onClick={() => router.push("/roadmaps")}
          className="w-full py-2 px-3 rounded-xl bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 border border-purple-500/30 text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow-sm"
        >
          <span>Explore Roadmaps</span>
          <span>→</span>
        </button>
      </motion.div>
    );
  }

  const pct = activeRm?.progress_percent ?? fallbackData?.percentage ?? 0;
  const title = activeRm?.title || fallbackData?.roadmapName || "Active Roadmap";
  const completed = activeRm?.completed_milestones ?? fallbackData?.count ?? 0;
  const total = activeRm?.total_milestones ?? 48;
  const nextTopic = activeRm?.next_module?.title || fallbackData?.nextTopic || "";

  const handleContinue = () => {
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem(
          "skillscatalyst_open_roadmap_id",
          activeRm?.roadmap_id || fallbackData?.roadmapId || "c-programming"
        );
      } catch {}
    }
    router.push("/roadmaps");
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass rounded-2xl p-5 flex flex-col items-center justify-between min-h-[220px] transition-all duration-300 hover:border-purple-500/40 cursor-pointer"
      onClick={handleContinue}
      style={{
        background:
          "linear-gradient(135deg, rgba(255, 255, 255, 0.03) 0%, rgba(255, 255, 255, 0.01) 100%)",
        boxShadow: "0 8px 32px 0 rgba(0, 0, 0, 0.36)",
      }}
    >
      <div className="w-full flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400">
            <Map className="w-4 h-4" />
          </div>
          <span className="text-sm font-semibold text-slate-200 tracking-wide">
            Roadmap Progress
          </span>
        </div>
      </div>

      <div className="my-1 flex flex-col items-center">
        <AnimatedCircle percentage={pct} ringColor="#a855f7" />
      </div>

      <div className="flex flex-col items-center w-full justify-center text-center">
        <span className="text-xs font-bold text-white truncate max-w-full">
          {title}
        </span>
        <span className="text-[11px] font-semibold text-purple-300/90 mt-0.5">
          {completed} / {total} milestones completed
        </span>
        {nextTopic && (
          <span className="mt-1 px-2.5 py-0.5 rounded-full text-[10px] font-medium bg-purple-500/15 border border-purple-500/30 text-purple-300 truncate max-w-full">
            {nextTopic.startsWith("Next:") || nextTopic.startsWith("Current:") ? nextTopic : `Current: ${nextTopic}`}
          </span>
        )}
      </div>

      <button
        onClick={(e) => {
          e.stopPropagation();
          handleContinue();
        }}
        className="w-full mt-2 py-1.5 px-3 rounded-xl bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 border border-purple-500/30 text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow-sm"
      >
        <span>Continue Roadmap</span>
        <span>→</span>
      </button>
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

