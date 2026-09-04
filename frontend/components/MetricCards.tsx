"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  BookOpen, GraduationCap, FileText, ChevronRight, Plus,
  Video, CheckCircle2, Bookmark, ArrowUpRight, Play, Loader2, Code2, Sparkles
} from "lucide-react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { fetchSavedPlaylists, fetchPlaylistVideos, Playlist } from "@/lib/api";
import SkillsCatalystLogo from "@/components/SkillsCatalystLogo";
import PricingModal from "@/components/PricingModal";
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
    } catch {}
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
          } catch {}
        } else {
          setSavedPlaylists([]);
          try {
            localStorage.setItem(CACHE_KEY, JSON.stringify([]));
          } catch {}
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
    <div className="space-y-6 select-none">
      {/* ── Top Hero Banner (Forest Green) ── */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="relative overflow-hidden rounded-[20px] sm:rounded-[28px] bg-[#234B3B] p-3.5 sm:p-8 text-white flex flex-col md:flex-row items-center justify-between min-h-[100px] sm:min-h-[190px] shadow-sm"
      >
        <div className="max-w-md space-y-1.5 sm:space-y-3 z-10 text-center md:text-left">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-400/20 border border-emerald-400/50 text-emerald-300 text-[10px] sm:text-xs font-black tracking-wider uppercase">
            <Sparkles className="w-3.5 h-3.5 text-emerald-300" />
            <span>7-Day Free Trial Available</span>
          </div>
          <h2 className="text-sm sm:text-3xl font-extrabold tracking-tight">
            Learn today, succeed tomorrow!
          </h2>
          <p className="text-[11px] sm:text-sm text-emerald-100/90 leading-snug sm:leading-relaxed font-medium line-clamp-2 sm:line-clamp-none">
            Master 20+ career roadmaps, solve 660+ company interview problems, and score resumes with ATS intelligence. Start with our 7-day free trial on 1-Month or 3-Month passes!
          </p>
          <div className="pt-0.5 sm:pt-1">
            <button
              type="button"
              onClick={() => setIsPricingModalOpen(true)}
              className="px-4 py-1.5 sm:px-6 sm:py-2.5 rounded-full bg-emerald-400 text-slate-950 font-black text-[11px] sm:text-sm shadow-lg hover:bg-emerald-300 active:scale-95 transition-all cursor-pointer flex items-center gap-2 mx-auto md:mx-0"
            >
              <span>✨ View Plans & 7-Day Free Trial</span>
            </button>
          </div>
        </div>

        {/* Prominent SkillsCatalyst Hero Logo Emblem */}
        <div className="relative shrink-0 mt-4 md:mt-0 z-10 hidden sm:flex items-center justify-center">
          <motion.div
            whileHover={{ scale: 1.05, y: -2 }}
            transition={{ type: "spring", stiffness: 350, damping: 22 }}
            className="w-36 h-36 sm:w-44 sm:h-44 md:w-52 md:h-52 rounded-[24px] sm:rounded-[32px] bg-white p-3 sm:p-5 shadow-2xl shadow-black/30 flex items-center justify-center border border-white/20"
          >
            <Image
              src="/logo.png"
              alt="SkillsCatalyst Official Logo"
              width={200}
              height={200}
              className="w-full h-full object-contain drop-shadow-sm select-none"
              priority
            />
          </motion.div>
        </div>
      </motion.div>

      {/* ── 3 High-Contrast Metric Cards (2-Column Mobile Grid, 3-Column Desktop) ── */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 sm:gap-5">
        {/* Card 1: Mustard/Yellow */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="metric-card card-morph col-span-1 rounded-[20px] sm:rounded-[24px] bg-[#eab308] p-3.5 sm:p-5 text-white flex flex-col justify-between min-h-[120px] sm:min-h-[140px] shadow-sm cursor-pointer"
          onClick={() => router.push("/learning")}
        >
          <div className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm font-semibold">
            <Video className="w-3.5 h-3.5 sm:w-4 sm:h-4 fill-white/20" />
            <span className="truncate">Saved Playlists</span>
          </div>

          <div className="flex items-baseline gap-2 sm:gap-3 my-1 sm:my-2">
            <span className="text-2xl sm:text-3xl font-black tracking-tight" suppressHydrationWarning>
              {savedPlaylists.length}
            </span>
            <span className="inline-flex items-center gap-0.5 text-[9px] sm:text-[11px] font-bold px-2 py-0.5 rounded-full bg-white/30 text-white backdrop-blur-sm">
              ▲ Tracked
            </span>
          </div>

          <span className="text-[10px] sm:text-xs text-amber-100 font-medium truncate" suppressHydrationWarning>
            {savedPlaylists.length === 1
              ? "1 playlist"
              : `${savedPlaylists.length} playlists`}
          </span>
        </motion.div>

        {/* Card 2: Ocean Blue */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="metric-card card-morph col-span-1 rounded-[20px] sm:rounded-[24px] bg-[#3b82f6] p-3.5 sm:p-5 text-white flex flex-col justify-between min-h-[120px] sm:min-h-[140px] shadow-sm cursor-pointer"
          onClick={() => router.push("/learning")}
        >
          <div className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm font-semibold">
            <GraduationCap className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            <span className="truncate">Video Progress</span>
          </div>

          <div className="flex items-baseline gap-2 sm:gap-3 my-1 sm:my-2">
            <span className="text-2xl sm:text-3xl font-black tracking-tight">
              {overallProgressPct}%
            </span>
            <span className="inline-flex items-center gap-0.5 text-[9px] sm:text-[11px] font-bold px-2 py-0.5 rounded-full bg-white/30 text-white backdrop-blur-sm">
              {totalCompletedVideos}/{totalSavedVideos} vids
            </span>
          </div>

          <span className="text-[10px] sm:text-xs text-blue-100 font-medium truncate">
            Completed courses
          </span>
        </motion.div>

        {/* Card 3: Vivid Purple - LeetCode Solved (Spans 2-columns on mobile for compact fit) */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.3 }}
          className="metric-card card-morph col-span-2 md:col-span-1 rounded-[20px] sm:rounded-[24px] bg-[#8b5cf6] p-3.5 sm:p-5 text-white flex flex-col justify-between min-h-[110px] sm:min-h-[140px] shadow-sm cursor-pointer group hover:brightness-105 transition-all"
          onClick={() => {
            if (!isLeetcodeConfigured) {
              router.push("/settings");
            } else {
              router.push("/practice");
            }
          }}
        >
          <div className="flex items-center justify-between text-xs sm:text-sm font-semibold">
            <div className="flex items-center gap-1.5 sm:gap-2">
              <Code2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-purple-200" />
              <span className="truncate">LeetCode Solved</span>
            </div>
            {leetcodeUser ? (
              <span className="text-[10px] font-bold text-purple-100 bg-white/20 px-2 py-0.5 rounded-full truncate max-w-[100px]">
                @{leetcodeUser}
              </span>
            ) : (
              <span className="text-[9px] font-bold text-purple-200 opacity-80 group-hover:opacity-100 transition-opacity">
                Settings →
              </span>
            )}
          </div>

          <div className="flex items-baseline gap-2 sm:gap-3 my-1 sm:my-2">
            <span className="text-2xl sm:text-3xl font-black tracking-tight" suppressHydrationWarning>
              {totalSolved}
            </span>
            <span className="inline-flex items-center gap-0.5 text-[9px] sm:text-[11px] font-bold px-2 py-0.5 rounded-full bg-white/30 text-white backdrop-blur-sm">
              {isLeetcodeConfigured
                ? (totalSolved > 0 ? "▲ Live Synced" : "▲ Synced")
                : "+ Connect Link"}
            </span>
          </div>

          <div className="text-[10px] sm:text-xs text-purple-100 font-medium truncate" suppressHydrationWarning>
            {isLeetcodeConfigured ? (
              totalSolved > 0 || (easySolved + mediumSolved + hardSolved) > 0 ? (
                <div className="flex items-center gap-1.5 truncate">
                  <span className="inline-flex items-center gap-0.5 text-emerald-200 font-bold">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block" /> {easySolved} Easy
                  </span>
                  <span>•</span>
                  <span className="inline-flex items-center gap-0.5 text-amber-200 font-bold">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400 inline-block" /> {mediumSolved} Med
                  </span>
                  <span>•</span>
                  <span className="inline-flex items-center gap-0.5 text-rose-200 font-bold">
                    <span className="w-1.5 h-1.5 rounded-full bg-rose-400 inline-block" /> {hardSolved} Hard
                  </span>
                </div>
              ) : (
                <span>Linked @{leetcodeUser || "profile"} • Ready to practice</span>
              )
            ) : (
              <span className="text-purple-200 group-hover:text-white transition-colors underline underline-offset-2">
                Paste your LeetCode link in Settings →
              </span>
            )}
          </div>
        </motion.div>
      </div>

      {/* ── Saved YouTube Playlists Section ── */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <h3 className="text-lg font-bold text-slate-800 tracking-tight">
              Saved YouTube Playlists
            </h3>
            <span className="px-3 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">
              {savedPlaylists.length} {savedPlaylists.length === 1 ? "playlist" : "playlists"}
            </span>
          </div>
          <Link
            href="/learning"
            className="text-xs font-bold text-slate-500 hover:text-slate-800 flex items-center gap-0.5 transition-colors"
          >
            <span>Browse & Save</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {loading ? (
          <div className="bg-white rounded-[24px] p-8 border border-slate-100 shadow-sm flex items-center justify-center space-x-3 text-slate-400">
            <Loader2 className="w-5 h-5 animate-spin text-[#234B3B]" />
            <span className="text-xs font-semibold">Loading real playlist progress...</span>
          </div>
        ) : savedPlaylists.length === 0 ? (
          /* Empty State when user has zero saved YouTube playlists */
          <div className="bg-white rounded-[24px] p-8 border border-dashed border-slate-200 text-center space-y-3 shadow-xs">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-500 flex items-center justify-center mx-auto">
              <Video className="w-6 h-6" />
            </div>
            <div className="space-y-1 max-w-sm mx-auto">
              <h4 className="text-sm font-bold text-slate-900">
                No Saved YouTube Playlists Yet
              </h4>
              <p className="text-xs text-slate-500 font-medium">
                Search for tech skills or save YouTube playlists on the Learning page to track your real video completion progress here!
              </p>
            </div>
            <div className="pt-1">
              <button
                onClick={() => router.push("/learning")}
                className="px-5 py-2.5 rounded-full bg-[#234B3B] text-white text-xs font-bold hover:bg-[#1b3b2e] shadow-sm transition-all active:scale-95 cursor-pointer"
              >
                + Search & Save YouTube Playlist
              </button>
            </div>
          </div>
        ) : (
          /* Grid of Saved YouTube Playlists showing exact video completion count */
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-5">
            {savedPlaylists.slice(0, 3).map((course, idx) => (
              <motion.div
                key={course.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.1 * idx }}
                onClick={() => router.push(course.href)}
                className="playlist-card card-morph bg-white rounded-[20px] sm:rounded-[24px] p-3.5 sm:p-5 border border-slate-100 shadow-sm hover:shadow-md hover:border-slate-200 cursor-pointer flex flex-col justify-between sm:min-h-[210px] group"
              >
                {/* Mobile Header + Image Row / Desktop Layout */}
                <div className="flex flex-row sm:flex-col items-center sm:items-stretch gap-3 sm:gap-0">
                  {/* 3D Clay Image Thumbnail */}
                  <div className="relative w-14 h-14 sm:w-20 sm:h-20 sm:mx-auto sm:my-2 overflow-hidden rounded-xl bg-slate-50 shrink-0 flex items-center justify-center">
                    <Image
                      src={course.image}
                      alt={course.title}
                      fill
                      unoptimized={course.image.startsWith("http")}
                      className="object-contain transform group-hover:scale-105 transition-transform"
                    />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1.5 mb-1">
                      <span className="text-[9px] sm:text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-full bg-rose-50 text-rose-600 border border-rose-100 inline-flex items-center gap-1">
                        <Video className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                        <span>YouTube Track</span>
                      </span>
                      {course.progressPct === 100 && (
                        <CheckCircle2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-600 shrink-0" />
                      )}
                    </div>

                    <h4 className="text-xs sm:text-base font-bold text-slate-900 tracking-tight group-hover:text-[#234B3B] transition-colors line-clamp-1 sm:line-clamp-2">
                      {course.title}
                    </h4>

                    <p className="text-[10px] sm:text-xs font-semibold text-slate-500 mt-0.5 sm:mt-1 flex items-center gap-1">
                      <Play className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-[#234B3B] fill-[#234B3B] shrink-0" />
                      <span>{course.completedVideos}/{course.totalVideos} videos completed</span>
                    </p>
                  </div>
                </div>

                {/* Exact Progress Bar & Percentage */}
                <div className="space-y-1.5 sm:space-y-2 mt-2 sm:mt-3">
                  <div className="w-full bg-slate-100 h-1.5 sm:h-2 rounded-full overflow-hidden flex gap-1 p-0.5">
                    <div
                      className="bg-[#234B3B] h-full rounded-full transition-all duration-500"
                      style={{ width: `${course.progressPct}%` }}
                    />
                    <div className="bg-slate-200 h-full rounded-full flex-1" />
                  </div>
                  <div className="flex items-center justify-between text-[10px] sm:text-xs">
                    <span className="font-bold text-slate-700">
                      {course.progressPct}% complete
                    </span>
                    <span className="text-[10px] font-semibold text-slate-400 group-hover:text-[#234B3B] transition-colors inline-flex items-center gap-0.5">
                      <span>Watch</span>
                      <ArrowUpRight className="w-3 h-3" />
                    </span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* ── 3-Card Retro Pricing Modal ── */}
      <PricingModal
        isOpen={isPricingModalOpen}
        onClose={() => setIsPricingModalOpen(false)}
      />
    </div>
  );
}



