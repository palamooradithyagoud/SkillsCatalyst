"use client";

import React, { useEffect, useState } from "react";
import { BookOpen, Target, Sparkles, Briefcase, Lock } from "lucide-react";
import { motion } from "framer-motion";

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
          <div className="text-center">
            <Lock className="w-6 h-6 text-slate-600 mx-auto mb-1" />
            <span className="text-xs font-bold text-slate-500">Locked</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-[112px] h-[112px] flex items-center justify-center">
      <svg className="w-[112px] h-[112px] transform -rotate-90" viewBox="0 0 112 112">
        {/* Track */}
        <circle
          cx="56" cy="56" r={radius}
          className="progress-ring-track"
          strokeWidth="7"
          fill="transparent"
          stroke="rgba(255,255,255,0.05)"
        />
        {/* Fill */}
        <circle
          cx="56" cy="56" r={radius}
          stroke={ringColor}
          strokeWidth="7"
          strokeDasharray={circumference}
          strokeDashoffset={dashOffset}
          strokeLinecap="round"
          fill="transparent"
          className="progress-ring-fill"
          style={{
            filter: `drop-shadow(0 0 6px ${ringColor}80)`,
          }}
        />
      </svg>
      {/* Center label */}
      <div className="absolute text-center">
        <span className="text-2xl font-black text-white tabular-nums">
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
}: MetricCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ delay, duration: 0.5, ease: "easeOut" as const }}
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
      className="glass shimmer-card gradient-border rounded-2xl p-5 flex flex-col items-center justify-between min-h-[220px] relative overflow-hidden"
    >
      {/* Top row */}
      <div className="w-full flex items-center gap-3">
        <div className={`p-2 rounded-xl ${iconBg}`}>
          {icon}
        </div>
        <h3 className="text-sm font-bold text-slate-200 leading-tight">{title}</h3>
      </div>

      {/* Ring */}
      <div className="my-2">
        <AnimatedCircle percentage={percentage} ringColor={ringColor} isLocked={isLocked} />
      </div>

      {/* Subtitle */}
      <div className={`text-xs font-semibold ${subtitleColor}`}>{subtitle}</div>

      {/* Ambient gradient overlay */}
      <div
        className="absolute inset-0 rounded-2xl pointer-events-none opacity-20"
        style={{
          background: `radial-gradient(ellipse at 50% 120%, ${ringColor}20 0%, transparent 60%)`,
        }}
      />
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
  resumeReadiness?: {
    percentage: number;
    subtitle: string;
  };
  aiCareerHealth?: {
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
  const ch = metrics?.aiCareerHealth;
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
      <MetricCard
        title="Resume Readiness"
        icon={<Target className="w-4 h-4 text-blue-400" />}
        iconBg="bg-blue-500/10 border border-blue-500/20"
        percentage={rr?.percentage ?? 0}
        ringColor="#3b82f6"
        subtitle={rr?.subtitle ?? "No upload yet"}
        subtitleColor="text-blue-400"
        delay={0.2}
      />
      <MetricCard
        title="AI Career Health"
        icon={<Sparkles className="w-4 h-4 text-purple-400" />}
        iconBg="bg-purple-500/10 border border-purple-500/20"
        percentage={ch?.percentage ?? 0}
        ringColor="#3b82f6"
        subtitle={ch?.subtitle ?? "Start solving problems to build health"}
        subtitleColor="text-purple-400"
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

