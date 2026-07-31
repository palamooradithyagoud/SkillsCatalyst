"use client";

import React, { useEffect, useState } from "react";
import { BookOpen, Target, Map, Briefcase, Lock } from "lucide-react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";

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
        {onClick && (
          <span className="text-[10px] font-bold text-purple-400 uppercase tracking-widest bg-purple-500/10 px-2 py-0.5 rounded-full border border-purple-500/20">
            Open →
          </span>
        )}
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

export interface MetricsData {
  learningProgress?: {
    percentage: number;
    completedVideos: number;
    totalVideos: number;
    subtitle: string;
  };
  roadmapProgress?: {
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
  const router = useRouter();
  const lp = metrics?.learningProgress;
  const rm = metrics?.roadmapProgress;
  const rr = metrics?.resumeReadiness;
  const ir = metrics?.interviewReadiness;

  const roadmapSubtitleText = rm?.roadmapName
    ? `Following: ${rm.roadmapName}`
    : (rm?.count && rm.count > 0 ? `${rm.count} topics completed` : "No active roadmap");
  const roadmapNextBadge = rm?.nextTopic
    ? (rm.nextTopic.startsWith("Next:") || rm.nextTopic.includes("Roadmap Completed") ? rm.nextTopic : `Next: ${rm.nextTopic}`)
    : "Explore roadmaps on Roadmaps page";

  const handleRoadmapCardClick = () => {
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem(
          "skillscatalyst_open_roadmap_id",
          rm?.roadmapId || "c-programming"
        );
      } catch {}
    }
    router.push("/roadmaps");
  };

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
      <MetricCard
        title="Roadmap Progress"
        icon={<Map className="w-4 h-4 text-purple-400" />}
        iconBg="bg-purple-500/10 border border-purple-500/20"
        percentage={rm?.percentage ?? 0}
        ringColor="#a855f7"
        subtitle={roadmapSubtitleText}
        subtitleColor="text-purple-400"
        badge={roadmapNextBadge}
        delay={0.2}
        onClick={handleRoadmapCardClick}
      />
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

