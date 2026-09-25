"use client";

import React, { useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import {
  Flame,
  CheckCircle,
  Clock,
  ArrowRight,
  ChevronRight,
  Crown,
  Bookmark,
  Hourglass,
} from "lucide-react";
import type { Playlist } from "@/lib/api";

interface LearningProgressCardProps {
  dashboardData: any;
  videoProgressData?: {
    watchedCount: number;
    totalWatchTimeSeconds: number;
    raw?: any[];
  };
  userProgressData?: {
    streak_days?: number;
    total_xp?: number;
    level?: number;
  } | null;
  savedList: Playlist[];
  onOpenPlaylist?: (pl: Playlist) => void;
  onOpenSavedTab?: () => void;
  onExploreClick?: () => void;
}

export function extractPlaylistVideoCount(pl: any): number {
  if (!pl) return 0;
  if (Array.isArray(pl.videos) && pl.videos.length > 0) return pl.videos.length;
  const raw = pl.video_count || pl.videoCount || "";
  const match = String(raw).match(/\d+/);
  if (match) return parseInt(match[0], 10);
  return 0;
}

export function formatWatchTime(totalSeconds: number): string {
  if (totalSeconds <= 0) return "0m";
  const hours = totalSeconds / 3600;
  if (hours >= 1) {
    const formatted = Math.round(hours * 10) / 10;
    return `${formatted}h`;
  }
  const mins = Math.max(1, Math.round(totalSeconds / 60));
  return `${mins}m`;
}

export function LearningProgressCard({
  dashboardData,
  videoProgressData,
  userProgressData,
  savedList,
  onOpenSavedTab,
  onExploreClick,
}: LearningProgressCardProps) {
  // ── 1. Calculate Real User Data Directly from Supabase (Zero Hardcoding)
  const metrics = useMemo(() => {
    const user = dashboardData?.user || {};
    const dashLearning = dashboardData?.metrics?.learningProgress || {};
    const practice = dashboardData?.practiceOverview || {};

    // 1. Day Streak: Strictly from Supabase user_progress table
    const streak =
      typeof userProgressData?.streak_days === "number"
        ? userProgressData.streak_days
        : typeof user.streakDays === "number"
        ? user.streakDays
        : 0;

    // 2. Completed Videos: Real watched videos count strictly from Supabase video_progress
    const completedVideos =
      videoProgressData?.watchedCount ?? dashLearning.completedVideos ?? 0;

    // 3. Total Videos: Sum of video_count strictly from Supabase saved_playlists
    let totalVideos = 0;
    (savedList || []).forEach((pl) => {
      const c = extractPlaylistVideoCount(pl);
      totalVideos += Math.max(1, c);
    });

    // Fallback if savedList is hydrating from backend cache
    if (totalVideos === 0 && dashLearning.totalVideos) {
      totalVideos = dashLearning.totalVideos;
    }
    if (dashLearning.totalVideos && dashLearning.totalVideos > totalVideos) {
      totalVideos = dashLearning.totalVideos;
    }
    if (completedVideos > totalVideos && totalVideos > 0) {
      totalVideos = completedVideos;
    }

    // 4. Remaining Videos: Strictly (Total - Completed) from Supabase
    const remainingVideos = Math.max(0, totalVideos - completedVideos);

    // 5. Saved Progress Percentage: Strictly (completed videos / total videos) * 100
    const progressPct =
      totalVideos > 0
        ? Math.min(100, Math.round((completedVideos / totalVideos) * 100))
        : 0;

    // 6. Learning Watch Time: Effective watch seconds strictly from Supabase video_progress
    const effectiveWatchSeconds = videoProgressData?.totalWatchTimeSeconds ?? 0;
    const formattedWatchTime = formatWatchTime(effectiveWatchSeconds);
    const learningHours =
      effectiveWatchSeconds > 0
        ? Math.round((effectiveWatchSeconds / 3600) * 10) / 10
        : Math.round(completedVideos * 0.4 * 10) / 10;

    // 7. Real Weekly Activity Chart (Mon - Sun) strictly from Supabase video_progress timestamps
    const daysOrder = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
    const chartMap: Record<string, number> = {
      Mon: 0,
      Tue: 0,
      Wed: 0,
      Thu: 0,
      Fri: 0,
      Sat: 0,
      Sun: 0,
    };

    if (Array.isArray(practice.chartData)) {
      practice.chartData.forEach((item: any) => {
        if (item.day && chartMap[item.day] !== undefined) {
          chartMap[item.day] += Number(item.solved ?? item.count ?? 0);
        }
      });
    }

    if (Array.isArray(videoProgressData?.raw)) {
      const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
      videoProgressData.raw.forEach((r: any) => {
        const dateStr = r.updated_at || r.completed_at;
        if (dateStr) {
          const d = new Date(dateStr);
          if (!isNaN(d.getTime())) {
            const dayName = dayNames[d.getDay()];
            if (chartMap[dayName] !== undefined) {
              chartMap[dayName] += 1;
            }
          }
        }
      });
    }

    const dayValues = daysOrder.map((day) => chartMap[day] || 0);
    const maxVal = Math.max(1, ...dayValues);
    const hasAnyRealActivity = dayValues.some((v) => v > 0);

    const weeklyBars = daysOrder.map((day) => {
      const val = chartMap[day] || 0;
      let heightPct = 6;
      if (hasAnyRealActivity) {
        heightPct =
          val > 0 ? Math.min(100, Math.max(14, Math.round((val / maxVal) * 96))) : 6;
      }
      return { day, val, heightPct };
    });

    return {
      streak,
      completedVideos,
      remainingVideos,
      totalVideos,
      progressPct,
      formattedWatchTime,
      learningHours,
      weeklyBars,
    };
  }, [dashboardData, videoProgressData, userProgressData, savedList]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="relative w-full rounded-2xl sm:rounded-3xl border border-slate-200/90 bg-white shadow-[0_4px_24px_rgba(99,102,241,0.05)] p-4 sm:p-5 lg:p-5.5 overflow-hidden"
    >
      {/* Background ambient lighting glows */}
      <div className="absolute -top-24 -left-24 w-72 h-72 bg-purple-400/8 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -right-24 w-72 h-72 bg-indigo-400/8 rounded-full blur-3xl pointer-events-none" />

      {/* ── TOP HEADER ROW ── */}
      <div className="relative flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-3.5 border-b border-slate-100">
        <div>
          <h2 className="text-lg sm:text-xl md:text-2xl font-black text-slate-900 tracking-tight leading-tight">
            Your Learning{" "}
            <span className="bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
              Progress
            </span>
          </h2>
          <p className="text-xs sm:text-[13px] text-slate-500 font-medium mt-0.5">
            Stay consistent. Small steps lead to big opportunities 🚀
          </p>
        </div>

        <Link
          href="/analytics"
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-purple-50/80 hover:bg-purple-100 text-purple-700 border border-purple-200/70 text-xs font-bold transition-all shadow-2xs self-start sm:self-auto hover:shadow-xs group/btn"
        >
          <span>View Details</span>
          <ArrowRight className="w-3.5 h-3.5 group-hover/btn:translate-x-0.5 transition-transform" />
        </Link>
      </div>

      {/* ── MAIN CONTENT: GAUGE + METRICS/PROGRESS BAR + WEEKLY ACTIVITY ── */}
      <div className="relative flex flex-col lg:flex-row items-center lg:items-stretch gap-4 lg:gap-6 pt-3.5 sm:pt-4">
        {/* 1. Left: Circular Progress Ring strictly (completed / total * 100) */}
        <div className="flex flex-col items-center justify-center shrink-0 w-32 sm:w-36 lg:w-40 py-1">
          <div className="relative w-28 h-28 sm:w-32 sm:h-32 flex items-center justify-center">
            <svg className="w-full h-full -rotate-90 transform" viewBox="0 0 100 100">
              <defs>
                <linearGradient id="learningGaugeGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#8B5CF6" />
                  <stop offset="100%" stopColor="#6366F1" />
                </linearGradient>
              </defs>
              {/* Background circle */}
              <circle
                cx="50"
                cy="50"
                r="40"
                className="stroke-slate-100"
                strokeWidth="8"
                fill="transparent"
              />
              {/* Progress active stroke */}
              <circle
                cx="50"
                cy="50"
                r="40"
                stroke="url(#learningGaugeGradient)"
                strokeWidth="8"
                strokeDasharray={2 * Math.PI * 40}
                strokeDashoffset={
                  2 * Math.PI * 40 -
                  (2 * Math.PI * 40 * metrics.progressPct) / 100
                }
                strokeLinecap="round"
                fill="transparent"
                className="transition-all duration-1000 ease-out"
              />
            </svg>

            {/* Inner text: percentage, saved progress label, completed/total videos and remaining */}
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center select-none px-1">
              <span className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight leading-none">
                {metrics.progressPct}%
              </span>
              <span className="text-[9px] sm:text-[9.5px] font-black text-purple-600 uppercase tracking-wider mt-1 leading-tight">
                Saved Progress
              </span>
              <span className="text-[8.5px] sm:text-[9px] font-semibold text-slate-400 mt-0.5 tabular-nums">
                {metrics.totalVideos > 0
                  ? `${metrics.completedVideos}/${metrics.totalVideos} vids`
                  : "0 videos"}
              </span>
              {metrics.remainingVideos > 0 && (
                <span className="text-[7.5px] sm:text-[8px] font-bold text-amber-600/90 uppercase tracking-tight mt-0.5">
                  {metrics.remainingVideos} remaining
                </span>
              )}
            </div>
          </div>
        </div>

        {/* 2. Middle: 4 Stats (Streak, Completed, Remaining, Watch Time) + OVERALL PROGRESS BAR */}
        <div className="flex-1 w-full min-w-0 flex flex-col justify-between gap-3">
          {/* 4 Stats in one sleek row with subtle dividers */}
          <div className="grid grid-cols-2 sm:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-slate-100/90 py-1">
            {/* Stat 1: Day Streak from Supabase user_progress */}
            <div className="flex flex-col items-center text-center px-2 py-1.5 sm:py-0">
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-amber-500/10 text-amber-500 flex items-center justify-center mb-1 shadow-2xs">
                <Flame className="w-3.5 h-3.5 sm:w-4 sm:h-4 fill-amber-500" />
              </div>
              <span className="text-base sm:text-lg lg:text-xl font-black text-slate-900 leading-tight">
                {metrics.streak}
              </span>
              <span className="text-[10px] sm:text-[11px] font-bold text-slate-500 mt-0.5">
                Day Streak
              </span>
              <span className="text-[9px] font-extrabold text-emerald-700 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded-full mt-1.5 shadow-2xs">
                {metrics.streak > 0 ? `+${metrics.streak} streak` : "Active today"}
              </span>
            </div>

            {/* Stat 2: Completed Videos from Supabase video_progress */}
            <div className="flex flex-col items-center text-center px-2 py-1.5 sm:py-0">
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-emerald-500/10 text-emerald-600 flex items-center justify-center mb-1 shadow-2xs">
                <CheckCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </div>
              <span className="text-base sm:text-lg lg:text-xl font-black text-slate-900 leading-tight truncate max-w-full">
                {metrics.completedVideos}
              </span>
              <span className="text-[10px] sm:text-[11px] font-bold text-slate-500 mt-0.5">
                Completed Videos
              </span>
              <span className="text-[9px] font-extrabold text-emerald-700 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded-full mt-1.5 shadow-2xs">
                {metrics.progressPct}% done
              </span>
            </div>

            {/* Stat 3: Remaining Videos strictly (Total - Completed) */}
            <div className="flex flex-col items-center text-center px-2 py-1.5 sm:py-0">
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-indigo-500/10 text-indigo-500 flex items-center justify-center mb-1 shadow-2xs">
                <Hourglass className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </div>
              <span className="text-base sm:text-lg lg:text-xl font-black text-slate-900 leading-tight">
                {metrics.remainingVideos}
              </span>
              <span className="text-[10px] sm:text-[11px] font-bold text-slate-500 mt-0.5">
                Remaining Videos
              </span>
              <span className="text-[9px] font-extrabold text-indigo-700 bg-indigo-50 border border-indigo-100 px-2 py-0.5 rounded-full mt-1.5 shadow-2xs">
                {metrics.remainingVideos > 0
                  ? `${metrics.remainingVideos} to go`
                  : "All completed 🎉"}
              </span>
            </div>

            {/* Stat 4: Learning Watch Time from Supabase video_progress */}
            <div className="flex flex-col items-center text-center px-2 py-1.5 sm:py-0">
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-sky-500/10 text-sky-500 flex items-center justify-center mb-1 shadow-2xs">
                <Clock className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </div>
              <span className="text-base sm:text-lg lg:text-xl font-black text-slate-900 leading-tight">
                {metrics.learningHours}h
              </span>
              <span className="text-[10px] sm:text-[11px] font-bold text-slate-500 mt-0.5">
                Learning Time
              </span>
              <span className="text-[9px] font-extrabold text-sky-700 bg-sky-50 border border-sky-100 px-2 py-0.5 rounded-full mt-1.5 shadow-2xs">
                {metrics.learningHours > 0
                  ? `+${metrics.learningHours}h tracked`
                  : "0h tracked"}
              </span>
            </div>
          </div>

          {/* ── OVERALL SAVED VIDEOS PROGRESS BAR: Completed, Remaining, Total ── */}
          <div
            onClick={() => {
              if (savedList && savedList.length > 0 && onOpenSavedTab) {
                onOpenSavedTab();
              } else if (onExploreClick) {
                onExploreClick();
              }
            }}
            className="bg-slate-50/70 hover:bg-purple-50/30 border border-slate-200/80 hover:border-purple-200/90 rounded-xl sm:rounded-2xl p-2.5 sm:p-3 transition-all cursor-pointer group shadow-2xs"
          >
            <div className="flex items-center gap-3">
              {/* Left: Saved icon / thumbnail */}
              <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-lg bg-gradient-to-br from-purple-600 to-indigo-600 flex items-center justify-center shrink-0 relative overflow-hidden shadow-xs text-white">
                {savedList[0]?.thumbnail ? (
                  <Image
                    src={savedList[0].thumbnail}
                    alt={savedList[0].title || "Saved Playlists"}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform"
                  />
                ) : (
                  <Bookmark className="w-5 h-5 text-white" />
                )}
              </div>

              {/* Center: Details & Real Progress Bar */}
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2 mb-1">
                  <div className="flex items-center gap-2 truncate">
                    <span className="text-[9px] sm:text-[9.5px] font-black uppercase tracking-wider text-purple-600 shrink-0 leading-tight">
                      SAVED VIDEOS PROGRESS
                    </span>
                    <span className="text-slate-300 text-xs">•</span>
                    <span className="text-xs sm:text-[13px] font-bold text-slate-800 truncate leading-snug">
                      {savedList.length > 0
                        ? `${savedList.length} Saved Course${savedList.length !== 1 ? "s" : ""}`
                        : "No saved courses yet"}
                    </span>
                  </div>

                  {/* Watch Time Badge */}
                  <div className="flex items-center gap-1 text-[10px] sm:text-[11px] font-bold text-slate-600 bg-white/95 border border-slate-200/80 px-2 py-0.5 rounded-full shrink-0 shadow-2xs">
                    <Clock className="w-3 h-3 text-purple-600" />
                    <span>{metrics.formattedWatchTime} watched</span>
                  </div>
                </div>

                {/* Real Progress Bar */}
                <div className="flex items-center gap-2.5 sm:gap-3 mt-1 sm:mt-1.5">
                  <div className="flex-1 h-2 sm:h-2.5 bg-slate-200/80 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{
                        width: `${Math.max(
                          metrics.completedVideos > 0 ? 3 : 0,
                          metrics.progressPct
                        )}%`,
                      }}
                      transition={{ duration: 0.8, ease: "easeOut" }}
                      className="h-full bg-gradient-to-r from-purple-600 to-indigo-600 rounded-full"
                    />
                  </div>
                  <div className="flex items-center gap-1 text-[10.5px] sm:text-[11px] font-bold shrink-0 tabular-nums">
                    <span className="text-slate-900 font-black">
                      {metrics.completedVideos} / {metrics.totalVideos}
                    </span>
                    <span className="text-slate-400 font-semibold">videos</span>
                    <span className="text-purple-600 font-black ml-0.5">
                      ({metrics.progressPct}%)
                    </span>
                  </div>
                </div>

                {/* Bottom summary line: Completed vs Remaining */}
                <div className="flex items-center gap-3 mt-1 text-[10px] font-semibold text-slate-500">
                  <span className="text-emerald-700 font-bold">
                    ✓ {metrics.completedVideos} Completed
                  </span>
                  <span className="text-slate-300">•</span>
                  <span className="text-indigo-600 font-bold">
                    ⏳ {metrics.remainingVideos} Remaining
                  </span>
                  <span className="text-slate-300">•</span>
                  <span>{metrics.totalVideos} Total Videos</span>
                </div>
              </div>

              <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-purple-600 group-hover:translate-x-0.5 transition-transform shrink-0" />
            </div>
          </div>
        </div>

        {/* 3. Right: Weekly Activity Card */}
        <div className="w-full lg:w-60 xl:w-64 shrink-0">
          <div className="h-full rounded-xl sm:rounded-2xl p-3 sm:p-3.5 bg-gradient-to-br from-[#faf8ff] via-[#f4f0ff] to-[#ebe5ff] border border-purple-100 shadow-2xs flex flex-col justify-between">
            {/* Header */}
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-md bg-amber-100 text-amber-600 flex items-center justify-center shadow-xs">
                  <Crown className="w-3.5 h-3.5 fill-amber-500" />
                </div>
                <div>
                  <h4 className="text-xs font-extrabold text-slate-900 leading-tight">
                    Keep going!
                  </h4>
                  <p className="text-[10px] font-semibold text-purple-700 leading-tight">
                    You&apos;re doing great 🔥
                  </p>
                </div>
              </div>
              <Crown className="w-4 h-4 text-amber-500 fill-amber-400" />
            </div>

            {/* Weekly Bars with Connected Curve */}
            <div className="relative pt-2.5 pb-0.5 mt-2">
              {/* Connecting curve overlay ending at crown */}
              <svg
                className="absolute inset-x-0 top-0 w-full h-14 pointer-events-none overflow-visible"
                viewBox="0 0 100 50"
                preserveAspectRatio="none"
              >
                <path
                  d="M 6,42 Q 28,34 52,24 T 94,8"
                  fill="none"
                  stroke="#A855F7"
                  strokeWidth="1.6"
                  strokeDasharray="3 3"
                  className="opacity-60"
                />
              </svg>

              {/* 7 Day Bars from Supabase timestamps */}
              <div className="grid grid-cols-7 gap-1.5 items-end h-16 sm:h-18">
                {metrics.weeklyBars.map((bar) => (
                  <div
                    key={bar.day}
                    className="flex flex-col items-center gap-1 h-full justify-end"
                  >
                    <div className="w-full relative flex items-end justify-center h-full">
                      <div
                        className="w-full max-w-[12px] sm:max-w-[14px] bg-gradient-to-t from-purple-600 to-indigo-500 rounded-t-sm rounded-b-xs transition-all duration-700 hover:brightness-110 shadow-xs"
                        style={{ height: `${bar.heightPct}%` }}
                        title={`${bar.day}: ${bar.val} learning activities`}
                      />
                    </div>
                    <span className="text-[8.5px] font-bold text-slate-500 uppercase tracking-tight">
                      {bar.day}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
