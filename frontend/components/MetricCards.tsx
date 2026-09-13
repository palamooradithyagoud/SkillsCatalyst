"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  BookOpen, GraduationCap, FileText, ChevronRight, Plus,
  Video, CheckCircle2, Bookmark, ArrowUpRight, Play, Loader2, Code2, Sparkles, TrendingUp
} from "lucide-react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { fetchSavedPlaylists, fetchPlaylistVideos, Playlist } from "@/lib/api";
import SkillsCatalystLogo from "@/components/SkillsCatalystLogo";
import PricingModal from "@/components/PricingModal";
import EventHeroCard from "@/components/EventHeroCard";
import { getTrialDaysRemaining, isUserTrialClaimed } from "@/lib/trial";

export interface MetricsData {
  learningProgress?: {
    percentage: number;
    completedVideos: number;
    totalVideos: number;
    subtitle: string;
  };
  roadmapProgress?: {
    percentage: number;
    roadmapName?: string;
  };
  resumeReadiness?: {
    percentage: number;
  };
  leetcodeProgress?: {
    totalSolved?: number;
    easySolved?: number;
    mediumSolved?: number;
    hardSolved?: number;
    username?: string;
    ranking?: number;
    configured?: boolean;
    subtitle?: string;
  };
  codingProgress?: {
    totalSolved?: number;
    leetcodeSolved?: number;
    easySolved?: number;
    mediumSolved?: number;
    hardSolved?: number;
    username?: string;
    ranking?: number;
    configured?: boolean;
    subtitle?: string;
  };
}

export interface SavedYTPlaylistItem {
  id: string;
  title: string;
  channel: string;
  completedVideos: number;
  totalVideos: number;
  progressPct: number;
  image: string;
  href: string;
}

export default function MetricCards({ metrics }: { metrics?: MetricsData }) {
  const router = useRouter();

  // 3D clay graphics pool as visual accents for saved playlists
  const clayImages = [
    "/images/pink_torus.png",
    "/images/orange_cylinders.png",
    "/images/purple_discs.png",
  ];

  const CACHE_KEY = "skillscatalyst_cached_dashboard_saved_playlists";

  const [savedPlaylists, setSavedPlaylists] = useState<SavedYTPlaylistItem[]>([]);
  const [cachedLcStats, setCachedLcStats] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [isPricingModalOpen, setIsPricingModalOpen] = useState<boolean>(false);

  // Client-side local cache hydration after mount
  useEffect(() => {
    try {
      const cached = localStorage.getItem(CACHE_KEY);
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed)) {
          setSavedPlaylists(parsed);
          setLoading(false);
        }
      }

      // Check localStorage for cached coding/leetcode stats
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && (key.startsWith("sc_coding_stats_") || key.startsWith("sc_coding_profiles_"))) {
          const raw = localStorage.getItem(key);
          if (raw) {
            const parsed = JSON.parse(raw);
            if (parsed) {
              if (parsed.leetcode && typeof parsed.leetcode === "object") {
                setCachedLcStats(parsed.leetcode);
                break;
              } else if (parsed.leetcode && typeof parsed.leetcode === "string") {
                setCachedLcStats({ configured: true, username: parsed.leetcode });
              }
            }
          }
        }
      }
    } catch { }
  }, []);

  // Silent Background Revalidation (SWR Pattern)
  useEffect(() => {
    async function loadRealSavedYTPlaylists() {
      try {
        // 1. Fetch saved playlists via API & Supabase DB
        const { saved } = await fetchSavedPlaylists();

        if (saved && Array.isArray(saved) && saved.length > 0) {
          // 2. Fetch exact video watched/completed count for each playlist
          const playlistItems: SavedYTPlaylistItem[] = await Promise.all(
            saved.map(async (playlist: Playlist, idx: number) => {
              let completedVideos = 0;
              let totalVideos = parseInt(playlist.video_count) || 0;

              try {
                const { videos } = await fetchPlaylistVideos(playlist.id);
                if (videos && Array.isArray(videos) && videos.length > 0) {
                  totalVideos = videos.length;
                  completedVideos = videos.filter(
                    (v) => v.watched || v.completed_at
                  ).length;
                }
              } catch (e) {
                console.warn(`Failed to fetch videos for ${playlist.id}:`, e);
              }

              const progressPct =
                totalVideos > 0
                  ? Math.round((completedVideos / totalVideos) * 100)
                  : 0;

              const rawThumb = playlist.thumbnail || "";
              const isValidThumb =
                rawThumb &&
                !rawThumb.includes("/vi/default/") &&
                !rawThumb.endsWith("default.jpg");

              const imageSrc = isValidThumb
                ? rawThumb
                : clayImages[idx % clayImages.length];

              return {
                id: playlist.id,
                title: playlist.title || "YouTube Learning Playlist",
                channel: playlist.channel || "YouTube Creator",
                completedVideos,
                totalVideos,
                progressPct,
                image: imageSrc,
                href: `/learning?playlist=${encodeURIComponent(playlist.id)}`,
              };
            })
          );

          setSavedPlaylists(playlistItems);
          try {
            localStorage.setItem(CACHE_KEY, JSON.stringify(playlistItems));
          } catch { }
        } else {
          setSavedPlaylists([]);
          try {
            localStorage.setItem(CACHE_KEY, JSON.stringify([]));
          } catch { }
        }
      } catch (err) {
        console.warn("Failed to load saved YT playlists:", err);
      } finally {
        setLoading(false);
      }
    }

    loadRealSavedYTPlaylists();
  }, []);

  // Compute total watched video stats across all saved playlists
  const totalSavedVideos = savedPlaylists.reduce((acc, p) => acc + p.totalVideos, 0);
  const totalCompletedVideos = savedPlaylists.reduce((acc, p) => acc + p.completedVideos, 0);
  const overallProgressPct =
    totalSavedVideos > 0
      ? Math.round((totalCompletedVideos / totalSavedVideos) * 100)
      : metrics?.learningProgress?.percentage ?? 0;

  // Resolve live webscraped LeetCode statistics
  const leetcodeData = metrics?.leetcodeProgress || metrics?.codingProgress;
  const isLeetcodeConfigured = Boolean(
    leetcodeData?.configured ||
    leetcodeData?.username ||
    cachedLcStats?.configured ||
    cachedLcStats?.username ||
    ((leetcodeData?.totalSolved ?? 0) > 0) ||
    ((cachedLcStats?.total_solved ?? 0) > 0)
  );

  const totalSolved =
    leetcodeData?.totalSolved ??
    cachedLcStats?.total_solved ??
    cachedLcStats?.solved ??
    0;

  const easySolved = leetcodeData?.easySolved ?? cachedLcStats?.easy_solved ?? 0;
  const mediumSolved = leetcodeData?.mediumSolved ?? cachedLcStats?.medium_solved ?? 0;
  const hardSolved = leetcodeData?.hardSolved ?? cachedLcStats?.hard_solved ?? 0;
  const leetcodeUser = leetcodeData?.username || cachedLcStats?.username || "";
  const leetcodeRanking = leetcodeData?.ranking || cachedLcStats?.ranking || 0;

  return (
    <div className="space-y-3.5 sm:space-y-4 select-none">
      {/* ── Top Hero Event Banner with Moving Events & Get PRO Trigger ── */}
      <EventHeroCard onOpenPricing={() => setIsPricingModalOpen(true)} />

      {/* ── 3 Compact Metric Cards (Aligned to Left, Matching Event Card Width) ── */}
      <div className="w-full max-w-[460px] sm:max-w-[480px] grid grid-cols-3 gap-2 sm:gap-2.5">
        {/* Card 1: Mustard/Yellow - Saved Playlists */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.05 }}
          className="metric-card card-morph rounded-[14px] sm:rounded-[16px] bg-[#eab308] p-2 sm:p-2.5 text-white flex flex-col justify-between min-h-[84px] sm:min-h-[96px] shadow-sm cursor-pointer hover:brightness-105 active:scale-98 transition-all"
          onClick={() => router.push("/learning")}
        >
          <div className="flex items-center gap-1 text-[10px] sm:text-xs font-bold">
            <Video className="w-3 h-3 sm:w-3.5 sm:h-3.5 fill-white/20 shrink-0" />
            <span className="truncate">Playlists</span>
          </div>

          <div className="flex items-baseline gap-1 my-0.5">
            <span className="text-lg sm:text-2xl font-black tracking-tight" suppressHydrationWarning>
              {savedPlaylists.length}
            </span>
            <span className="text-[7.5px] sm:text-[8.5px] font-bold px-1.5 py-0.2 rounded-full bg-white/25 text-white backdrop-blur-sm">
              Tracked
            </span>
          </div>

          <span className="text-[8.5px] sm:text-[9.5px] text-amber-100 font-medium truncate" suppressHydrationWarning>
            {savedPlaylists.length === 1 ? "1 saved" : `${savedPlaylists.length} saved`}
          </span>
        </motion.div>

        {/* Card 2: Ocean Blue - Video Progress */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          className="metric-card card-morph rounded-[14px] sm:rounded-[16px] bg-[#3b82f6] p-2 sm:p-2.5 text-white flex flex-col justify-between min-h-[84px] sm:min-h-[96px] shadow-sm cursor-pointer hover:brightness-105 active:scale-98 transition-all"
          onClick={() => router.push("/learning")}
        >
          <div className="flex items-center gap-1 text-[10px] sm:text-xs font-bold">
            <GraduationCap className="w-3 h-3 sm:w-3.5 sm:h-3.5 shrink-0" />
            <span className="truncate">Progress</span>
          </div>

          <div className="flex items-baseline gap-1 my-0.5">
            <span className="text-lg sm:text-2xl font-black tracking-tight">
              {overallProgressPct}%
            </span>
            <span className="text-[7.5px] sm:text-[8.5px] font-bold px-1 py-0.2 rounded-full bg-white/25 text-white backdrop-blur-sm truncate max-w-[45px]">
              {totalCompletedVideos}/{totalSavedVideos}
            </span>
          </div>

          <span className="text-[8.5px] sm:text-[9.5px] text-blue-100 font-medium truncate">
            Completed
          </span>
        </motion.div>

        {/* Card 3: Vivid Purple - LeetCode Solved */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.15 }}
          className="metric-card card-morph rounded-[14px] sm:rounded-[16px] bg-[#8b5cf6] p-2 sm:p-2.5 text-white flex flex-col justify-between min-h-[84px] sm:min-h-[96px] shadow-sm cursor-pointer group hover:brightness-105 active:scale-98 transition-all"
          onClick={() => {
            if (!isLeetcodeConfigured) {
              router.push("/settings");
            } else {
              router.push("/practice");
            }
          }}
        >
          <div className="flex items-center justify-between text-[10px] sm:text-xs font-bold">
            <div className="flex items-center gap-1 min-w-0">
              <Code2 className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-purple-200 shrink-0" />
              <span className="truncate">LeetCode</span>
            </div>
            {leetcodeUser ? (
              <span className="text-[7.5px] font-bold text-purple-100 bg-white/20 px-1 py-0.2 rounded truncate max-w-[42px]">
                @{leetcodeUser}
              </span>
            ) : null}
          </div>

          <div className="flex items-baseline gap-1 my-0.5">
            <span className="text-lg sm:text-2xl font-black tracking-tight" suppressHydrationWarning>
              {totalSolved}
            </span>
            <span className="text-[7.5px] sm:text-[8.5px] font-bold px-1.5 py-0.2 rounded-full bg-white/25 text-white backdrop-blur-sm">
              Solved
            </span>
          </div>

          <div className="text-[8px] sm:text-[9px] text-purple-100 font-medium truncate" suppressHydrationWarning>
            {isLeetcodeConfigured ? (
              <span className="text-emerald-200 font-semibold truncate">
                {easySolved}E • {mediumSolved}M • {hardSolved}H
              </span>
            ) : (
              <span className="text-purple-200 group-hover:text-white underline truncate">
                + Connect
              </span>
            )}
          </div>
        </motion.div>
      </div>

      {/* ── Your Learning Progress Section ── */}
      <div className="space-y-2.5 sm:space-y-3">
        <div className="w-full max-w-[460px] sm:max-w-[480px] flex items-center justify-between">
          <h3 className="text-sm sm:text-base font-bold text-slate-800 tracking-tight">
            Your Learning Progress
          </h3>
          <Link
            href="/learning"
            className="text-[11px] sm:text-xs font-bold text-slate-500 hover:text-slate-800 flex items-center gap-0.5 transition-colors"
          >
            <span>Browse & Save</span>
            <ChevronRight className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
          </Link>
        </div>

        {loading ? (
          <div className="w-full max-w-[460px] sm:max-w-[480px] bg-white rounded-[18px] p-6 border border-slate-100 shadow-sm flex items-center justify-center space-x-3 text-slate-400">
            <Loader2 className="w-4 h-4 animate-spin text-[#234B3B]" />
            <span className="text-xs font-semibold">Loading learning progress...</span>
          </div>
        ) : savedPlaylists.length === 0 ? (
          /* Empty State when user has zero saved YouTube playlists */
          <div className="w-full max-w-[460px] sm:max-w-[480px] bg-white rounded-[18px] p-6 border border-dashed border-slate-200 text-center space-y-2.5 shadow-xs">
            <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-500 flex items-center justify-center mx-auto">
              <Video className="w-5 h-5" />
            </div>
            <div className="space-y-1 max-w-xs mx-auto">
              <h4 className="text-xs font-bold text-slate-900">
                No Learning Progress Yet
              </h4>
              <p className="text-[11px] text-slate-500 font-medium leading-relaxed">
                Save YouTube playlists on the Learning page to track your real video completion progress here!
              </p>
            </div>
            <div className="pt-0.5">
              <button
                onClick={() => router.push("/learning")}
                className="px-4 py-2 rounded-full bg-[#234B3B] text-white text-[11px] font-bold hover:bg-[#1b3b2e] shadow-sm transition-all active:scale-95 cursor-pointer"
              >
                + Browse & Save Playlists
              </button>
            </div>
          </div>
        ) : (
          /* Compact Grid of Saved Playlists showing exact video completion count */
          <div className="w-full max-w-[460px] sm:max-w-[480px] grid grid-cols-2 gap-2 sm:gap-2.5">
            {savedPlaylists.slice(0, 2).map((course, idx) => (
              <motion.div
                key={course.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.05 * idx }}
                onClick={() => router.push(course.href)}
                className="playlist-card card-morph bg-white rounded-[14px] sm:rounded-[18px] p-2.5 sm:p-3 border border-slate-100 shadow-xs hover:shadow-md hover:border-slate-200 cursor-pointer flex flex-col justify-between group min-h-[148px] sm:min-h-[162px]"
              >
                <div>
                  {/* 3D Clay Image Thumbnail (Compact) */}
                  <div className="relative w-11 h-11 sm:w-13 sm:h-13 mx-auto mb-1.5 overflow-hidden rounded-xl bg-slate-50/80 shrink-0 flex items-center justify-center">
                    <Image
                      src={course.image}
                      alt={course.title}
                      fill
                      unoptimized={course.image.startsWith("http")}
                      className="object-contain transform group-hover:scale-105 transition-transform"
                    />
                  </div>

                  <div className="flex items-center justify-between gap-1 mb-1">
                    <span className="text-[8px] sm:text-[8.5px] font-extrabold uppercase tracking-wider px-1.5 py-0.2 rounded-full bg-rose-50 text-rose-600 border border-rose-100 inline-flex items-center gap-0.5">
                      <Video className="w-2 h-2 sm:w-2.5 sm:h-2.5" />
                      <span>YouTube Track</span>
                    </span>
                    {course.progressPct === 100 && (
                      <CheckCircle2 className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-emerald-600 shrink-0" />
                    )}
                  </div>

                  <h4 className="text-[11px] sm:text-xs font-bold text-slate-900 tracking-tight group-hover:text-[#234B3B] transition-colors line-clamp-1 leading-snug">
                    {course.title}
                  </h4>

                  <p className="text-[9px] sm:text-[10px] font-semibold text-slate-500 mt-0.5 flex items-center gap-1">
                    <Play className="w-2 h-2 sm:w-2.5 sm:h-2.5 text-[#234B3B] fill-[#234B3B] shrink-0" />
                    <span>{course.completedVideos}/{course.totalVideos} videos completed</span>
                  </p>
                </div>

                {/* Exact Progress Bar & Percentage */}
                <div className="space-y-1 mt-1.5">
                  <div className="w-full bg-slate-100 h-1 sm:h-1.5 rounded-full overflow-hidden flex gap-0.5 p-0.2">
                    <div
                      className="bg-[#234B3B] h-full rounded-full transition-all duration-500"
                      style={{ width: `${course.progressPct}%` }}
                    />
                    <div className="bg-slate-200 h-full rounded-full flex-1" />
                  </div>
                  <div className="flex items-center justify-between text-[8.5px] sm:text-[9.5px]">
                    <span className="font-bold text-slate-700">
                      {course.progressPct}% complete
                    </span>
                    <span className="text-[8.5px] font-semibold text-slate-400 group-hover:text-[#234B3B] transition-colors inline-flex items-center gap-0.5">
                      <span>Watch</span>
                      <ArrowUpRight className="w-2.5 h-2.5" />
                    </span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* ── Trending Skills Section (Below Learning Progress) ── */}
      <div className="space-y-2.5 sm:space-y-3 pt-1">
        <div className="w-full max-w-[460px] sm:max-w-[480px] flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <TrendingUp className="w-4 h-4 text-[#7c3aed]" />
            <h3 className="text-sm sm:text-base font-bold text-slate-800 tracking-tight">
              Trending Skills
            </h3>
          </div>
          <Link
            href="/learning"
            className="text-[11px] sm:text-xs font-bold text-[#7c3aed] hover:text-[#6d28d9] flex items-center gap-0.5 transition-colors"
          >
            <span>View All</span>
            <ChevronRight className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
          </Link>
        </div>

        <div className="w-full max-w-[460px] sm:max-w-[480px] grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-2.5">
          {/* 1. Python */}
          <motion.div
            whileHover={{ y: -2, scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => router.push("/learning?query=Python")}
            className="bg-white rounded-[14px] sm:rounded-[16px] p-2.5 sm:p-3 border border-slate-100 shadow-xs hover:shadow-md hover:border-slate-200 cursor-pointer flex items-center gap-2 sm:gap-2.5 transition-all group min-w-0"
          >
            {/* Exact Official Python Logo */}
            <svg className="w-6 h-6 sm:w-7 sm:h-7 shrink-0" viewBox="0 0 110 110" fill="none" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <linearGradient id="py-blue" x1="12%" y1="12%" x2="80%" y2="80%">
                  <stop offset="0%" stopColor="#387EB8" />
                  <stop offset="100%" stopColor="#366994" />
                </linearGradient>
                <linearGradient id="py-yellow" x1="15%" y1="25%" x2="85%" y2="85%">
                  <stop offset="0%" stopColor="#FFE873" />
                  <stop offset="100%" stopColor="#FFD43B" />
                </linearGradient>
              </defs>
              <path d="M54.7 0C25.5 0 27.3 12.6 27.3 12.6l.03 13.1h27.8v3.9H16.2S0 27.6 0 57.1c0 29.5 16.3 28.5 16.3 28.5h9.7v-13.7s-.5-16.3 16-16.3h27.6s15.5.2 15.5-15V12.7S88.6 0 54.7 0zm-15.3 8.9c2.8 0 5 2.2 5 5s-2.2 5-5 5-5-2.2-5-5 2.2-5 5-5z" fill="url(#py-blue)"/>
              <path d="M55.3 110c29.2 0 27.4-12.6 27.4-12.6l-.03-13.1H54.9v-3.9h38.9s16.2 2 16.2-27.5c0-29.5-16.3-28.5-16.3-28.5h-9.7v13.7s.5 16.3-16 16.3H50.1s-15.5-.2-15.5 15v21.8s-2.5 12.8 31.4 12.8zm15.3-8.9c-2.8 0-5-2.2-5-5s2.2-5 5-5 5 2.2 5 5-2.2 5-5 5z" fill="url(#py-yellow)"/>
              <circle cx="39.4" cy="13.9" r="4.2" fill="#FFFFFF"/>
              <circle cx="70.6" cy="96.1" r="4.2" fill="#FFFFFF"/>
            </svg>
            <div className="min-w-0 flex-1">
              <h4 className="text-[11px] sm:text-xs font-bold text-slate-900 tracking-tight group-hover:text-[#7c3aed] transition-colors truncate leading-tight">
                Python
              </h4>
              <span className="inline-block text-[9.5px] sm:text-[10px] font-bold text-emerald-600 leading-none mt-0.5">
                ↑ 24%
              </span>
              <p className="text-[8.5px] sm:text-[9.5px] text-slate-400 font-medium truncate mt-0.5 leading-none">
                1.2M learners
              </p>
            </div>
          </motion.div>

          {/* 2. React.js */}
          <motion.div
            whileHover={{ y: -2, scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => router.push("/learning?query=React")}
            className="bg-white rounded-[14px] sm:rounded-[16px] p-2.5 sm:p-3 border border-slate-100 shadow-xs hover:shadow-md hover:border-slate-200 cursor-pointer flex items-center gap-2 sm:gap-2.5 transition-all group min-w-0"
          >
            {/* Exact Official React Atom Logo */}
            <svg className="w-6 h-6 sm:w-7 sm:h-7 shrink-0" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <ellipse cx="12" cy="12" rx="4.2" ry="11" stroke="#00D8FF" strokeWidth="1.3" />
              <ellipse cx="12" cy="12" rx="4.2" ry="11" transform="rotate(60 12 12)" stroke="#00D8FF" strokeWidth="1.3" />
              <ellipse cx="12" cy="12" rx="4.2" ry="11" transform="rotate(120 12 12)" stroke="#00D8FF" strokeWidth="1.3" />
              <circle cx="12" cy="12" r="2.2" fill="#00D8FF" />
            </svg>
            <div className="min-w-0 flex-1">
              <h4 className="text-[11px] sm:text-xs font-bold text-slate-900 tracking-tight group-hover:text-[#7c3aed] transition-colors truncate leading-tight">
                React.js
              </h4>
              <span className="inline-block text-[9.5px] sm:text-[10px] font-bold text-emerald-600 leading-none mt-0.5">
                ↑ 18%
              </span>
              <p className="text-[8.5px] sm:text-[9.5px] text-slate-400 font-medium truncate mt-0.5 leading-none">
                850K learners
              </p>
            </div>
          </motion.div>

          {/* 3. Generative AI */}
          <motion.div
            whileHover={{ y: -2, scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => router.push("/learning?query=AI")}
            className="bg-white rounded-[14px] sm:rounded-[16px] p-2.5 sm:p-3 border border-slate-100 shadow-xs hover:shadow-md hover:border-slate-200 cursor-pointer flex items-center gap-2 sm:gap-2.5 transition-all group min-w-0"
          >
            {/* Exact Icon provided by user for Generative AI */}
            <div className="w-6 h-6 sm:w-7 sm:h-7 shrink-0 relative flex items-center justify-center">
              <Image
                src="/images/icons/generative-ai.png"
                alt="Generative AI"
                width={28}
                height={28}
                className="w-full h-full object-contain"
                priority
              />
            </div>
            <div className="min-w-0 flex-1">
              <h4 className="text-[11px] sm:text-xs font-bold text-slate-900 tracking-tight group-hover:text-[#7c3aed] transition-colors truncate leading-tight">
                Generative AI
              </h4>
              <span className="inline-block text-[9.5px] sm:text-[10px] font-bold text-emerald-600 leading-none mt-0.5">
                ↑ 32%
              </span>
              <p className="text-[8.5px] sm:text-[9.5px] text-slate-400 font-medium truncate mt-0.5 leading-none">
                1.5M learners
              </p>
            </div>
          </motion.div>

          {/* 4. UI/UX Design */}
          <motion.div
            whileHover={{ y: -2, scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => router.push("/learning?query=UI%2FUX")}
            className="bg-white rounded-[14px] sm:rounded-[16px] p-2.5 sm:p-3 border border-slate-100 shadow-xs hover:shadow-md hover:border-slate-200 cursor-pointer flex items-center gap-2 sm:gap-2.5 transition-all group min-w-0"
          >
            {/* Exact Official Figma Logo */}
            <svg className="w-5 h-6 sm:w-5.5 sm:h-7 shrink-0" viewBox="0 0 38 57" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M19 28.5C19 23.2533 23.2533 19 28.5 19C33.7467 19 38 23.2533 38 28.5C38 33.7467 33.7467 38 28.5 38C23.2533 38 19 33.7467 19 28.5Z" fill="#1ABCFE"/>
              <path d="M0 47.5C0 42.2533 4.25329 38 9.5 38H19V47.5C19 52.7467 14.7467 57 9.5 57C4.25329 57 0 52.7467 0 47.5Z" fill="#0ACF83"/>
              <path d="M19 0V19H28.5C33.7467 19 38 14.7467 38 9.5C38 4.25329 33.7467 0 28.5 0H19Z" fill="#FF7262"/>
              <path d="M0 9.5C0 14.7467 4.25329 19 9.5 19H19V0H9.5C4.25329 0 0 4.25329 0 9.5Z" fill="#F24E1E"/>
              <path d="M0 28.5C0 33.7467 4.25329 38 9.5 38H19V19H9.5C4.25329 19 0 23.2533 0 28.5Z" fill="#A259FF"/>
            </svg>
            <div className="min-w-0 flex-1">
              <h4 className="text-[11px] sm:text-xs font-bold text-slate-900 tracking-tight group-hover:text-[#7c3aed] transition-colors truncate leading-tight">
                UI/UX Design
              </h4>
              <span className="inline-block text-[9.5px] sm:text-[10px] font-bold text-emerald-600 leading-none mt-0.5">
                ↑ 21%
              </span>
              <p className="text-[8.5px] sm:text-[9.5px] text-slate-400 font-medium truncate mt-0.5 leading-none">
                920K learners
              </p>
            </div>
          </motion.div>
        </div>
      </div>

      {/* ── 3-Card Retro Pricing Modal ── */}
      <PricingModal
        isOpen={isPricingModalOpen}
        onClose={() => setIsPricingModalOpen(false)}
      />
    </div>
  );
}



