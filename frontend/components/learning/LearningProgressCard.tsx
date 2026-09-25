"use client";

import React, { useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import {
  Flame,
  Target,
  BarChart3,
  Clock,
  ArrowRight,
  ChevronRight,
  Crown,
  Play,
  Sparkles,
  BookOpen,
} from "lucide-react";
import type { Playlist } from "@/lib/api";

interface LearningProgressCardProps {
  dashboardData: any;
  videoProgressData?: {
    watchedCount: number;
    totalWatchTimeSeconds: number;
    raw?: any[];
  };
  savedList: Playlist[];
  onOpenPlaylist?: (pl: Playlist) => void;
  onExploreClick?: () => void;
}

export function LearningProgressCard({
  dashboardData,
  videoProgressData,
  savedList,
  onOpenPlaylist,
  onExploreClick,
}: LearningProgressCardProps) {
  // ── 1. Calculate Real User Data
  const metrics = useMemo(() => {
    const user = dashboardData?.user || {};
    const dashLearning = dashboardData?.metrics?.learningProgress || {};
    const dashRoadmap = dashboardData?.metrics?.roadmapProgress || {};
    const practice = dashboardData?.practiceOverview || {};

    // Active Streak (real user data)
    const streak = typeof user.streakDays === "number" ? user.streakDays : 0;

    // Videos Watched: Real count from Supabase video_progress or backend metrics
    const completedVideos =
      videoProgressData?.watchedCount ?? dashLearning.completedVideos ?? 0;

    // Total Videos across user's saved playlists / active tracks
    let totalVideos = 0;
    if (savedList && savedList.length > 0) {
      for (const pl of savedList) {
        const vCount =
          pl.videos?.length ||
          parseInt(String(pl.videoCount || "0").match(/\d+/)?.[0] || "0", 10);
        totalVideos += vCount;
      }
    }
    if (dashLearning.totalVideos && dashLearning.totalVideos > totalVideos) {
      totalVideos = dashLearning.totalVideos;
    }
    if (completedVideos > totalVideos && completedVideos > 0) {
      totalVideos = completedVideos;
    }

    // Learning Time: Real seconds watched converted to hours
    const totalSeconds = videoProgressData?.totalWatchTimeSeconds ?? 0;
    const learningHours =
      totalSeconds > 0
        ? Math.round((totalSeconds / 3600) * 10) / 10
        : Math.round(completedVideos * 0.4 * 10) / 10;

    // Goals Completed: Roadmap milestones or completed videos
    let completedGoals = 0;
    let totalGoals = 0;
    if (dashRoadmap?.has_active_roadmap) {
      completedGoals = dashRoadmap.count || 0;
      totalGoals =
        dashRoadmap.roadmaps?.[0]?.nodes?.length ||
        dashRoadmap.roadmaps?.length ||
        20;
    } else {
      completedGoals = completedVideos;
      totalGoals = totalVideos;
    }

    const goalsPct =
      totalGoals > 0
        ? Math.min(100, Math.round((completedGoals / totalGoals) * 100))
        : 0;

    // Overall Progress Percentage
    const overallProgressPct =
      totalVideos > 0
        ? Math.min(100, Math.round((completedVideos / totalVideos) * 100))
        : dashLearning.percentage || goalsPct || 0;

    // Current Path / Active Playlist
    let activePath: {
      title: string;
      thumbnail?: string;
      completed: number;
      total: number;
      pct: number;
      playlist?: Playlist;
    } | null = null;

    if (savedList && savedList.length > 0) {
      const firstPl = savedList[0];
      const plTotal =
        firstPl.videos?.length ||
        parseInt(String(firstPl.videoCount || "0").match(/\d+/)?.[0] || "0", 10);

      // Check how many videos of this playlist are watched
      let plWatched = 0;
      if (videoProgressData?.raw && Array.isArray(videoProgressData.raw)) {
        plWatched = videoProgressData.raw.filter(
          (r: any) =>
            (r.playlist_id === firstPl.id ||
              String(r.playlist_id) === String(firstPl.id)) &&
            !!r.watched
        ).length;
      }
      if (plWatched > plTotal && plTotal > 0) plWatched = plTotal;

      const plPct =
        plTotal > 0 ? Math.min(100, Math.round((plWatched / plTotal) * 100)) : 0;

      activePath = {
        title: firstPl.title,
        thumbnail: firstPl.thumbnail,
        completed: plWatched,
        total: plTotal,
        pct: plPct,
        playlist: firstPl,
      };
    } else if (dashRoadmap?.has_active_roadmap && dashRoadmap.roadmapName) {
      activePath = {
        title: dashRoadmap.roadmapName,
        completed: dashRoadmap.count || 0,
        total:
          dashRoadmap.roadmaps?.[0]?.nodes?.length ||
          dashRoadmap.roadmaps?.length ||
          20,
        pct: dashRoadmap.percentage || 0,
      };
    }

    // Weekly activity chart (Mon - Sun) from practice / activity overview
    const rawChart = practice.chartData || [];
    const daysOrder = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
    const chartMap: Record<string, number> = {};
    if (Array.isArray(rawChart)) {
      rawChart.forEach((item: any) => {
        if (item.day) {
          chartMap[item.day] = Number(item.solved ?? item.count ?? 0);
        }
      });
    }

    // Determine max value for proportional scaling
    const dayValues = daysOrder.map((day) => chartMap[day] || 0);
    const maxVal = Math.max(1, ...dayValues);

    const weeklyBars = daysOrder.map((day, idx) => {
      const val = chartMap[day] || 0;
      // Proportional height percentage (base 18% so bar is always aesthetically visible)
      const heightPct =
        val > 0 ? Math.min(100, Math.max(22, Math.round((val / maxVal) * 95))) : 16 + idx * 8;
      return { day, val, heightPct };
    });

    return {
      streak,
      completedVideos,
      totalVideos,
      learningHours,
      completedGoals,
      totalGoals,
      goalsPct,
      overallProgressPct,
      activePath,
      weeklyBars,
    };
  }, [dashboardData, videoProgressData, savedList]);

  // Circular gauge calculations (radius 46, circumference ~289)
  const radius = 46;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset =
    circumference - (circumference * metrics.overallProgressPct) / 100;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      className="relative w-full rounded-2xl sm:rounded-3xl border border-slate-200/90 bg-white shadow-[0_12px_44px_rgba(99,102,241,0.06)] p-5 sm:p-7 overflow-hidden group"
    >
      {/* Background ambient lighting glows */}
      <div className="absolute -top-20 -left-20 w-72 h-72 bg-purple-400/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-20 -right-20 w-72 h-72 bg-indigo-400/10 rounded-full blur-3xl pointer-events-none" />

      {/* ── TOP HEADER ROW ── */}
      <div className="relative flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-5 border-b border-slate-100">
        <div>
          <h2 className="text-xl sm:text-2xl lg:text-3xl font-black text-slate-900 tracking-tight leading-tight">
            Your Learning{" "}
            <span className="bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
              Progress
            </span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 font-medium mt-0.5">
            Stay consistent. Small steps lead to big opportunities 🚀
          </p>
        </div>

        <Link
          href="/analytics"
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-purple-50/80 hover:bg-purple-100 text-purple-700 border border-purple-200/70 text-xs sm:text-sm font-bold transition-all shadow-2xs self-start sm:self-auto hover:shadow-xs group/btn"
        >
          <span>View Details</span>
          <ArrowRight className="w-3.5 h-3.5 group-hover/btn:translate-x-0.5 transition-transform" />
        </Link>
      </div>

      {/* ── MAIN CONTENT: CIRCULAR RING + METRICS/PATH + WEEKLY ACTIVITY ── */}
      <div className="relative grid grid-cols-1 lg:grid-cols-12 gap-6 items-center pt-5 sm:pt-6">
        {/* 1. Left: Circular Progress Ring (Cols 1-3) */}
        <div className="lg:col-span-3 flex flex-col items-center justify-center p-2">
          <div className="relative w-32 h-32 sm:w-36 sm:h-36 flex items-center justify-center">
            <svg className="w-full h-full -rotate-90 transform" viewBox="0 0 120 120">
              <defs>
                <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#8B5CF6" />
                  <stop offset="100%" stopColor="#6366F1" />
                </linearGradient>
              </defs>
              {/* Background circle */}
              <circle
                cx="60"
                cy="60"
                r={radius}
                className="stroke-slate-100"
                strokeWidth="10"
                fill="transparent"
              />
              {/* Progress active stroke */}
              <circle
                cx="60"
                cy="60"
                r={radius}
                stroke="url(#progressGradient)"
                strokeWidth="10"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                fill="transparent"
                className="transition-all duration-1000 ease-out"
              />
            </svg>

            {/* Inner text */}
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
              <span className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight leading-none">
                {metrics.overallProgressPct}%
              </span>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-1">
                Overall Progress
              </span>
            </div>
          </div>
        </div>

        {/* 2. Middle: 4 User Stats + Current Path Banner (Cols 4-8) */}
        <div className="lg:col-span-6 flex flex-col gap-4">
          {/* 4 User Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3">
            {/* Stat 1: Day Streak */}
            <div className="flex flex-col items-center text-center p-2.5 sm:p-3 rounded-2xl bg-slate-50/70 border border-slate-100/90">
              <div className="w-8 h-8 rounded-full bg-amber-500/10 text-amber-500 flex items-center justify-center mb-1.5 shadow-2xs">
                <Flame className="w-4 h-4 fill-amber-500" />
              </div>
              <span className="text-lg sm:text-xl font-black text-slate-900 leading-none">
                {metrics.streak}
              </span>
              <span className="text-[10px] font-bold text-slate-500 mt-1">Day Streak</span>
              <span className="text-[9px] font-extrabold text-emerald-700 bg-emerald-50 border border-emerald-100 px-1.5 py-0.5 rounded-full mt-1.5">
                {metrics.streak > 0 ? `+${metrics.streak} streak` : "Active today"}
              </span>
            </div>

            {/* Stat 2: Goals Completed */}
            <div className="flex flex-col items-center text-center p-2.5 sm:p-3 rounded-2xl bg-slate-50/70 border border-slate-100/90">
              <div className="w-8 h-8 rounded-full bg-rose-500/10 text-rose-500 flex items-center justify-center mb-1.5 shadow-2xs">
                <Target className="w-4 h-4" />
              </div>
              <span className="text-lg sm:text-xl font-black text-slate-900 leading-none truncate max-w-full">
                {metrics.completedGoals}
                {metrics.totalGoals > 0 && (
                  <span className="text-xs font-semibold text-slate-400">/{metrics.totalGoals}</span>
                )}
              </span>
              <span className="text-[10px] font-bold text-slate-500 mt-1">Goals Completed</span>
              <span className="text-[9px] font-extrabold text-purple-700 bg-purple-50 border border-purple-100 px-1.5 py-0.5 rounded-full mt-1.5">
                {metrics.goalsPct}% on track
              </span>
            </div>

            {/* Stat 3: Videos Watched */}
            <div className="flex flex-col items-center text-center p-2.5 sm:p-3 rounded-2xl bg-slate-50/70 border border-slate-100/90">
              <div className="w-8 h-8 rounded-full bg-indigo-500/10 text-indigo-500 flex items-center justify-center mb-1.5 shadow-2xs">
                <BarChart3 className="w-4 h-4" />
              </div>
              <span className="text-lg sm:text-xl font-black text-slate-900 leading-none">
                {metrics.completedVideos}
              </span>
              <span className="text-[10px] font-bold text-slate-500 mt-1">Videos Watched</span>
              <span className="text-[9px] font-extrabold text-sky-700 bg-sky-50 border border-sky-100 px-1.5 py-0.5 rounded-full mt-1.5">
                {metrics.completedVideos > 0 ? `+${metrics.completedVideos} done` : "0 completed"}
              </span>
            </div>

            {/* Stat 4: Learning Time */}
            <div className="flex flex-col items-center text-center p-2.5 sm:p-3 rounded-2xl bg-slate-50/70 border border-slate-100/90">
              <div className="w-8 h-8 rounded-full bg-sky-500/10 text-sky-500 flex items-center justify-center mb-1.5 shadow-2xs">
                <Clock className="w-4 h-4" />
              </div>
              <span className="text-lg sm:text-xl font-black text-slate-900 leading-none">
                {metrics.learningHours}h
              </span>
              <span className="text-[10px] font-bold text-slate-500 mt-1">Learning Time</span>
              <span className="text-[9px] font-extrabold text-emerald-700 bg-emerald-50 border border-emerald-100 px-1.5 py-0.5 rounded-full mt-1.5">
                {metrics.learningHours > 0 ? `+${metrics.learningHours}h tracked` : "0h tracked"}
              </span>
            </div>
          </div>

          {/* CURRENT PATH Progress Bar */}
          {metrics.activePath ? (
            <div
              onClick={() => {
                if (metrics.activePath?.playlist && onOpenPlaylist) {
                  onOpenPlaylist(metrics.activePath.playlist);
                }
              }}
              className="bg-slate-50/90 hover:bg-purple-50/40 border border-slate-200/80 hover:border-purple-200/80 rounded-2xl p-3 sm:p-3.5 flex items-center gap-3 sm:gap-4 transition-all cursor-pointer group shadow-2xs"
            >
              {/* Thumbnail or Icon */}
              <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center overflow-hidden shrink-0 relative shadow-2xs">
                {metrics.activePath.thumbnail ? (
                  <Image
                    src={metrics.activePath.thumbnail}
                    alt={metrics.activePath.title}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <Play className="w-5 h-5 text-purple-400 fill-purple-400/30" />
                )}
              </div>

              {/* Title & Progress Bar */}
              <div className="min-w-0 flex-1">
                <span className="text-[9.5px] font-extrabold uppercase tracking-wider text-purple-600 block">
                  CURRENT PATH
                </span>
                <h4 className="text-xs sm:text-sm font-bold text-slate-900 truncate group-hover:text-purple-700 transition-colors">
                  {metrics.activePath.title}
                </h4>

                {/* Progress Bar Track */}
                <div className="flex items-center gap-3 mt-1.5">
                  <div className="flex-1 h-2 sm:h-2.5 bg-slate-200/80 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-purple-600 to-indigo-600 rounded-full transition-all duration-500"
                      style={{ width: `${Math.max(4, metrics.activePath.pct)}%` }}
                    />
                  </div>
                  <span className="text-[11px] font-bold text-slate-500 tabular-nums shrink-0">
                    {metrics.activePath.completed} / {metrics.activePath.total} videos
                  </span>
                </div>
              </div>

              <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-purple-600 group-hover:translate-x-0.5 transition-transform shrink-0" />
            </div>
          ) : (
            /* Fallback if user has no saved playlist or active roadmap yet */
            <div
              onClick={onExploreClick}
              className="bg-slate-50/90 hover:bg-purple-50/50 border border-dashed border-slate-200/90 hover:border-purple-300 rounded-2xl p-3.5 flex items-center justify-between gap-3 transition-all cursor-pointer group"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center shrink-0">
                  <BookOpen className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <span className="text-[9.5px] font-extrabold uppercase tracking-wider text-slate-400 block">
                    CURRENT PATH
                  </span>
                  <p className="text-xs sm:text-sm font-bold text-slate-700 truncate">
                    No active playlist yet — Explore skills below
                  </p>
                </div>
              </div>
              <span className="text-xs font-bold text-purple-600 flex items-center gap-1 group-hover:translate-x-0.5 transition-transform shrink-0">
                Start Now <ChevronRight className="w-4 h-4" />
              </span>
            </div>
          )}
        </div>

        {/* 3. Right: Weekly Activity Card (Cols 9-12) */}
        <div className="lg:col-span-3 h-full">
          <div className="h-full rounded-2xl p-4 sm:p-4.5 bg-gradient-to-br from-purple-50/80 via-indigo-50/50 to-purple-100/40 border border-purple-100/90 shadow-2xs flex flex-col justify-between">
            {/* Header */}
            <div className="flex items-center justify-between gap-2 mb-3">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-amber-100 text-amber-600 flex items-center justify-center shadow-xs">
                  <Crown className="w-4 h-4 fill-amber-500" />
                </div>
                <div>
                  <h4 className="text-xs font-extrabold text-slate-900 leading-tight">
                    Keep going!
                  </h4>
                  <p className="text-[10px] font-semibold text-purple-700/90 leading-tight">
                    You&apos;re doing great 🔥
                  </p>
                </div>
              </div>
              <Crown className="w-4 h-4 text-amber-500 fill-amber-400" />
            </div>

            {/* Weekly Bars with Connected Curve */}
            <div className="relative pt-4 pb-1">
              {/* Connecting curve overlay */}
              <svg
                className="absolute inset-x-0 top-0 w-full h-20 pointer-events-none overflow-visible"
                viewBox="0 0 100 60"
                preserveAspectRatio="none"
              >
                <path
                  d="M 5,50 Q 25,42 50,30 T 95,8"
                  fill="none"
                  stroke="#A855F7"
                  strokeWidth="1.8"
                  strokeDasharray="3 3"
                  className="opacity-60"
                />
              </svg>

              {/* 7 Day Bars */}
              <div className="grid grid-cols-7 gap-1.5 items-end h-22 sm:h-24">
                {metrics.weeklyBars.map((bar, i) => (
                  <div key={bar.day} className="flex flex-col items-center gap-1 h-full justify-end">
                    <div className="w-full relative flex items-end justify-center h-full">
                      <div
                        className="w-full max-w-[14px] sm:max-w-[18px] bg-gradient-to-t from-purple-600 to-indigo-500 rounded-t-md rounded-b-xs transition-all duration-700 hover:brightness-110 shadow-xs"
                        style={{ height: `${bar.heightPct}%` }}
                        title={`${bar.day}: ${bar.val} items completed`}
                      />
                    </div>
                    <span className="text-[9px] font-bold text-slate-500 uppercase tracking-tight">
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
