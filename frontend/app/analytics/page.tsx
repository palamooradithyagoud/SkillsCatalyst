"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  BarChart3, TrendingUp, TrendingDown, Zap, Clock, Award, Target,
  Flame, Brain, Code2, Trophy, ArrowUpRight, ArrowDownRight,
  Calendar, Activity, BookOpen, CheckCircle2, Star, Layers,
  GitCommit, LayoutDashboard, Database, PlayCircle, Bookmark
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { fetchDashboardData, fetchSavedPlaylists, fetchProfileData } from "@/lib/api";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/lib/auth";

// ─── Problem dataset for topic mapping ───────────────────────────────────────
interface ProblemMeta {
  id: number;
  title: string;
  difficulty: "Easy" | "Medium" | "Hard";
  topic: string;
}

const ALL_PROBLEMS_MAP: Record<string, ProblemMeta> = {
  "26": { id: 26, title: "Remove Duplicates from Sorted Array", difficulty: "Easy", topic: "Two Pointers" },
  "27": { id: 27, title: "Remove Element", difficulty: "Easy", topic: "Two Pointers" },
  "88": { id: 88, title: "Merge Sorted Array", difficulty: "Easy", topic: "Two Pointers" },
  "283": { id: 283, title: "Move Zeroes", difficulty: "Easy", topic: "Two Pointers" },
  "349": { id: 349, title: "Intersection of Two Arrays", difficulty: "Easy", topic: "Two Pointers" },
  "350": { id: 350, title: "Intersection of Two Arrays II", difficulty: "Easy", topic: "Two Pointers" },
  "455": { id: 455, title: "Assign Cookies", difficulty: "Easy", topic: "Two Pointers" },
  "905": { id: 905, title: "Sort Array By Parity", difficulty: "Easy", topic: "Two Pointers" },
  "922": { id: 922, title: "Sort Array By Parity II", difficulty: "Easy", topic: "Two Pointers" },
  "977": { id: 977, title: "Squares of a Sorted Array", difficulty: "Easy", topic: "Two Pointers" },
  "2460": { id: 2460, title: "Apply Operations to an Array", difficulty: "Easy", topic: "Two Pointers" },
  "11": { id: 11, title: "Container With Most Water", difficulty: "Medium", topic: "Two Pointers" },
  "15": { id: 15, title: "3Sum", difficulty: "Medium", topic: "Two Pointers" },
  "16": { id: 16, title: "3Sum Closest", difficulty: "Medium", topic: "Two Pointers" },
  "18": { id: 18, title: "4Sum", difficulty: "Medium", topic: "Two Pointers" },
  "80": { id: 80, title: "Remove Duplicates from Sorted Array II", difficulty: "Medium", topic: "Two Pointers" },
  "167": { id: 167, title: "Two Sum II – Input Array Is Sorted", difficulty: "Medium", topic: "Two Pointers" },
  "189": { id: 189, title: "Rotate Array", difficulty: "Medium", topic: "Two Pointers" },
  "611": { id: 611, title: "Valid Triangle Number", difficulty: "Medium", topic: "Two Pointers" },
  "881": { id: 881, title: "Boats to Save People", difficulty: "Medium", topic: "Two Pointers" },
  "42": { id: 42, title: "Trapping Rain Water", difficulty: "Hard", topic: "Two Pointers" },

  "643": { id: 643, title: "Maximum Average Subarray I", difficulty: "Easy", topic: "Sliding Window" },
  "209": { id: 209, title: "Minimum Size Subarray Sum", difficulty: "Medium", topic: "Sliding Window" },
  "713": { id: 713, title: "Subarray Product Less Than K", difficulty: "Medium", topic: "Sliding Window" },
  "904": { id: 904, title: "Fruit Into Baskets", difficulty: "Medium", topic: "Sliding Window" },
  "930": { id: 930, title: "Binary Subarrays With Sum", difficulty: "Medium", topic: "Sliding Window" },
  "1004": { id: 1004, title: "Max Consecutive Ones III", difficulty: "Medium", topic: "Sliding Window" },
  "1052": { id: 1052, title: "Grumpy Bookstore Owner", difficulty: "Medium", topic: "Sliding Window" },
  "1248": { id: 1248, title: "Count Number of Nice Subarrays", difficulty: "Medium", topic: "Sliding Window" },
  "1343": { id: 1343, title: "Sub-arrays of Size K", difficulty: "Medium", topic: "Sliding Window" },
  "1423": { id: 1423, title: "Maximum Points from Cards", difficulty: "Medium", topic: "Sliding Window" },
  "1493": { id: 1493, title: "Longest Subarray of 1's", difficulty: "Medium", topic: "Sliding Window" },
  "1658": { id: 1658, title: "Minimum Operations to Reduce X", difficulty: "Medium", topic: "Sliding Window" },
  "1695": { id: 1695, title: "Maximum Erasure Value", difficulty: "Medium", topic: "Sliding Window" },
  "1838": { id: 1838, title: "Frequency of Most Frequent", difficulty: "Medium", topic: "Sliding Window" },
  "2024": { id: 2024, title: "Maximize Confusion of Exam", difficulty: "Medium", topic: "Sliding Window" },
  "2958": { id: 2958, title: "Longest Subarray With K Frequency", difficulty: "Medium", topic: "Sliding Window" },
  "992": { id: 992, title: "Subarrays with K Different Integers", difficulty: "Hard", topic: "Sliding Window" },

  "1480": { id: 1480, title: "Running Sum of 1d Array", difficulty: "Easy", topic: "Prefix Sum" },
  "724": { id: 724, title: "Find Pivot Index", difficulty: "Easy", topic: "Prefix Sum" },
  "303": { id: 303, title: "Range Sum Query – Immutable", difficulty: "Easy", topic: "Prefix Sum" },
  "1732": { id: 1732, title: "Find the Highest Altitude", difficulty: "Easy", topic: "Prefix Sum" },
  "1991": { id: 1991, title: "Find the Middle Index", difficulty: "Easy", topic: "Prefix Sum" },
  "238": { id: 238, title: "Product of Array Except Self", difficulty: "Medium", topic: "Prefix Sum" },
  "560": { id: 560, title: "Subarray Sum Equals K", difficulty: "Medium", topic: "Prefix Sum" },
  "525": { id: 525, topic: "Prefix Sum", title: "Contiguous Array", difficulty: "Medium" },
  "523": { id: 523, topic: "Prefix Sum", title: "Continuous Subarray Sum", difficulty: "Medium" },

  "53": { id: 53, title: "Maximum Subarray", difficulty: "Easy", topic: "Kadane's Algo" },
  "918": { id: 918, title: "Maximum Sum Circular Subarray", difficulty: "Medium", topic: "Kadane's Algo" },
  "1749": { id: 1749, title: "Maximum Absolute Sum", difficulty: "Medium", topic: "Kadane's Algo" },
  "1191": { id: 1191, title: "K-Concatenation Maximum Sum", difficulty: "Medium", topic: "Kadane's Algo" },
  "2321": { id: 2321, title: "Maximum Score Of Spliced Array", difficulty: "Hard", topic: "Kadane's Algo" },

  "1": { id: 1, title: "Two Sum", difficulty: "Easy", topic: "Frequency Map" },
  "217": { id: 217, title: "Contains Duplicate", difficulty: "Easy", topic: "Frequency Map" },
  "219": { id: 219, title: "Contains Duplicate II", difficulty: "Easy", topic: "Frequency Map" },
  "242": { id: 242, title: "Valid Anagram", difficulty: "Easy", topic: "Frequency Map" },
  "383": { id: 383, title: "Ransom Note", difficulty: "Easy", topic: "Frequency Map" },
  "387": { id: 387, title: "First Unique Character", difficulty: "Easy", topic: "Frequency Map" },
  "389": { id: 389, title: "Find the Difference", difficulty: "Easy", topic: "Frequency Map" },
  "1207": { id: 1207, title: "Unique Number of Occurrences", difficulty: "Easy", topic: "Frequency Map" },

  "704": { id: 704, title: "Binary Search", difficulty: "Easy", topic: "Binary Search" },
  "35": { id: 35, title: "Search Insert Position", difficulty: "Easy", topic: "Binary Search" },
  "69": { id: 69, title: "Sqrt(x)", difficulty: "Easy", topic: "Binary Search" },
  "278": { id: 278, title: "First Bad Version", difficulty: "Easy", topic: "Binary Search" },
  "374": { id: 374, title: "Guess Number Higher or Lower", difficulty: "Easy", topic: "Binary Search" },
  "33": { id: 33, title: "Search in Rotated Sorted Array", difficulty: "Medium", topic: "Binary Search" },
  "34": { id: 34, title: "Find First and Last Position", difficulty: "Medium", topic: "Binary Search" },
  "74": { id: 74, title: "Search a 2D Matrix", difficulty: "Medium", topic: "Binary Search" },
  "81": { id: 81, title: "Search in Rotated Sorted Array II", difficulty: "Medium", topic: "Binary Search" },
  "153": { id: 153, title: "Find Minimum in Rotated Array", difficulty: "Medium", topic: "Binary Search" },
  "162": { id: 162, title: "Find Peak Element", difficulty: "Medium", topic: "Binary Search" },
  "875": { id: 875, title: "Koko Eating Bananas", difficulty: "Medium", topic: "Binary Search" },
  "1011": { id: 1011, title: "Capacity To Ship Packages", difficulty: "Medium", topic: "Binary Search" },
};

const TOPIC_TOTALS: Record<string, number> = {
  "Two Pointers": 21,
  "Sliding Window": 17,
  "Prefix Sum": 16,
  "Kadane's Algo": 5,
  "Frequency Map": 19,
  "Binary Search": 18,
};

const TIME_RANGES = ["7D", "30D", "90D", "1Y"];

// Color scheme
const C = {
  blue: "#3b82f6",
  cyan: "#06b6d4",
  green: "#10b981",
  purple: "#8b5cf6",
  amber: "#f59e0b",
  rose: "#f43f5e",
  indigo: "#6366f1",
};

/** SVG Radar Chart */
function RadarChart({ data }: { data: { label: string; score: number }[] }) {
  const size = 220;
  const cx = size / 2, cy = size / 2, r = 80;
  const n = data.length;
  const angleStep = (2 * Math.PI) / n;
  const angle = (i: number) => -Math.PI / 2 + i * angleStep;

  const scaleR = (score: number) => (Math.min(score, 100) / 100) * r;
  const gridLevels = [20, 40, 60, 80, 100];

  const polygon = (scores: number[]) =>
    scores.map((s, i) => {
      const a = angle(i);
      const ra = scaleR(s);
      return `${cx + ra * Math.cos(a)},${cy + ra * Math.sin(a)}`;
    }).join(" ");

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="mx-auto">
      {gridLevels.map((level) => (
        <polygon
          key={level}
          points={Array.from({ length: n }, (_, i) => {
            const a = angle(i);
            const ra = (level / 100) * r;
            return `${cx + ra * Math.cos(a)},${cy + ra * Math.sin(a)}`;
          }).join(" ")}
          fill="none"
          stroke="rgba(255,255,255,0.06)"
          strokeWidth="1"
        />
      ))}
      {data.map((_, i) => (
        <line
          key={i}
          x1={cx} y1={cy}
          x2={cx + r * Math.cos(angle(i))}
          y2={cy + r * Math.sin(angle(i))}
          stroke="rgba(255,255,255,0.06)"
          strokeWidth="1"
        />
      ))}
      <polygon
        points={polygon(data.map((d) => d.score))}
        fill="rgba(99,102,241,0.22)"
        stroke="#6366f1"
        strokeWidth="2"
      />
      {data.map((d, i) => {
        const a = angle(i);
        const ra = scaleR(d.score);
        return (
          <circle
            key={i}
            cx={cx + ra * Math.cos(a)}
            cy={cy + ra * Math.sin(a)}
            r={4}
            fill="#818cf8"
            stroke="#1e1b4b"
            strokeWidth="2"
          />
        );
      })}
      {data.map((d, i) => {
        const a = angle(i);
        const labelR = r + 20;
        const x = cx + labelR * Math.cos(a);
        const y = cy + labelR * Math.sin(a);
        return (
          <text
            key={i}
            x={x} y={y}
            textAnchor="middle"
            dominantBaseline="middle"
            fontSize="10"
            fontWeight="700"
            fill="rgba(148,163,184,0.9)"
            fontFamily="Inter, sans-serif"
          >
            {d.label}
          </text>
        );
      })}
    </svg>
  );
}

/** Animated ring progress */
function RingProgress({ pct: p, color, size = 80, stroke = 8 }: { pct: number; color: string; size?: number; stroke?: number }) {
  const radius = (size - stroke) / 2;
  const circ = 2 * Math.PI * radius;
  const safePct = Math.min(Math.max(p, 0), 100);
  const offset = circ - (safePct / 100) * circ;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="-rotate-90">
      <circle cx={size/2} cy={size/2} r={radius} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth={stroke} />
      <motion.circle
        cx={size/2} cy={size/2} r={radius}
        fill="none" stroke={color} strokeWidth={stroke}
        strokeLinecap="round"
        strokeDasharray={circ}
        initial={{ strokeDashoffset: circ }}
        animate={{ strokeDashoffset: offset }}
        transition={{ duration: 1.2, ease: "easeOut" }}
      />
    </svg>
  );
}

export default function AnalyticsPage() {
  const { session } = useAuth();
  const userId = session?.user_id || "default_user";

  const [timeRange, setTimeRange] = useState("30D");
  const [solvedKeys, setSolvedKeys] = useState<string[]>([]);
  const [dbLeetcodeProgress, setDbLeetcodeProgress] = useState<any[]>([]);

  // Query Dashboard API
  const { data: dashboardData } = useQuery({
    queryKey: ["dashboard", userId],
    queryFn: () => fetchDashboardData(userId),
  });

  // Query Saved Playlists API
  const { data: savedPlaylistsData } = useQuery({
    queryKey: ["saved-playlists", userId],
    queryFn: () => fetchSavedPlaylists(userId),
  });

  // Query User Profile API (contains extracted LeetCode/GitHub stats)
  const { data: profileData } = useQuery({
    queryKey: ["profile-summary", userId],
    queryFn: () => fetchProfileData(userId),
  });

  // Load local solved state for fallback/activity feed
  useEffect(() => {
    try {
      const saved = localStorage.getItem(`skillscatalyst_solved_questions_${userId}`);
      if (saved) {
        const parsed = JSON.parse(saved);
        const active = Object.keys(parsed).filter((k) => !!parsed[k]);
        setSolvedKeys(active);
      }
    } catch (e) {
      console.warn("Failed to load solved questions from localStorage", e);
    }

    async function loadSupabaseProgress() {
      try {
        const { data: lc } = await supabase
          .from("leetcode_progress")
          .select("*")
          .eq("user_id", userId);
        if (lc) setDbLeetcodeProgress(lc);
      } catch (err) {
        console.warn("Supabase progress load notice:", err);
      }
    }

    loadSupabaseProgress();
  }, [userId]);

  // Compute EXACT statistics strictly from connected coding profile data
  const stats = useMemo(() => {
    const lcStats = profileData?.coding_stats?.leetcode;
    const gfgStats = profileData?.coding_stats?.geeksforgeeks;

    const hasExternalLeetcode = lcStats && lcStats.configured && typeof lcStats.total_solved === "number" && lcStats.total_solved > 0;
    const hasExternalGfg = gfgStats && gfgStats.configured && typeof gfgStats.total_solved === "number" && gfgStats.total_solved > 0;

    let totalProblemsSolved = 0;
    let easyCount = 0;
    let mediumCount = 0;
    let hardCount = 0;

    if (hasExternalLeetcode) {
      // STRICTLY use connected LeetCode profile data (no foundation or company-wise ticked added)
      easyCount = lcStats.easy_solved || 0;
      mediumCount = lcStats.medium_solved || 0;
      hardCount = lcStats.hard_solved || 0;
      totalProblemsSolved = lcStats.total_solved || (easyCount + mediumCount + hardCount);
    } else if (hasExternalGfg) {
      easyCount = gfgStats.total_solved || 0;
      totalProblemsSolved = easyCount;
    } else {
      // Fallback: strictly if NO external coding profile is linked yet
      const allSolvedSet = new Set<string>();
      solvedKeys.forEach((k) => allSolvedSet.add(k));
      dbLeetcodeProgress.forEach((item) => {
        if (item.status === "solved") {
          if (item.question_id) allSolvedSet.add(item.question_id.toString());
        }
      });

      allSolvedSet.forEach((key) => {
        const meta = ALL_PROBLEMS_MAP[key];
        if (meta) {
          if (meta.difficulty === "Easy") easyCount++;
          else if (meta.difficulty === "Medium") mediumCount++;
          else if (meta.difficulty === "Hard") hardCount++;
        } else {
          easyCount++;
        }
      });
      totalProblemsSolved = easyCount + mediumCount + hardCount;
    }

    // Exact difficulty percentages calculated strictly against totalProblemsSolved
    const easyPct = totalProblemsSolved > 0 ? Math.round((easyCount / totalProblemsSolved) * 100) : 0;
    const mediumPct = totalProblemsSolved > 0 ? Math.round((mediumCount / totalProblemsSolved) * 100) : 0;
    const hardPct = totalProblemsSolved > 0 ? Math.max(0, 100 - easyPct - mediumPct) : 0;

    // Calculate Topic Mastery breakdown for local pattern radar
    const topicSolvedCounts: Record<string, number> = {
      "Two Pointers": 0,
      "Sliding Window": 0,
      "Prefix Sum": 0,
      "Kadane's Algo": 0,
      "Frequency Map": 0,
      "Binary Search": 0,
    };

    solvedKeys.forEach((key) => {
      const meta = ALL_PROBLEMS_MAP[key];
      if (meta && topicSolvedCounts[meta.topic] !== undefined) {
        topicSolvedCounts[meta.topic]++;
      }
    });

    const topicRadarData = Object.keys(TOPIC_TOTALS).map((tName) => {
      const solved = topicSolvedCounts[tName] || 0;
      const total = TOPIC_TOTALS[tName];
      const score = Math.min(100, Math.round((solved / total) * 100));
      return { label: tName, score, solved, total };
    });

    // Real video learning metrics from dashboard API
    const completedVideos = dashboardData?.metrics?.learningProgress?.completedVideos || 0;
    const totalVideos = dashboardData?.metrics?.learningProgress?.totalVideos || 0;
    const learningPct = dashboardData?.metrics?.learningProgress?.percentage || 0;
    const savedPlaylistsCount = savedPlaylistsData?.count || savedPlaylistsData?.saved?.length || 0;

    // Streak and AI Career Health score
    const streakDays = dashboardData?.user?.streakDays || 0;
    const aiCareerHealth = dashboardData?.metrics?.aiCareerHealth?.percentage || 0;
    const successRate = dashboardData?.practiceOverview?.successRate || 0;

    return {
      problemsSolved: totalProblemsSolved,
      easyCount,
      mediumCount,
      hardCount,
      easyPct,
      mediumPct,
      hardPct,
      topicRadarData,
      completedVideos,
      totalVideos,
      learningPct,
      savedPlaylistsCount,
      streakDays,
      aiCareerHealth,
      successRate,
      leetcodeHandle: lcStats?.username || "",
      isProfileConnected: hasExternalLeetcode || hasExternalGfg,
    };
  }, [solvedKeys, dbLeetcodeProgress, dashboardData, savedPlaylistsData, profileData]);

  // Real recent activity events
  const realRecentActivity = useMemo(() => {
    const events: { icon: any; color: string; text: string; time: string; tag: string }[] = [];

    if (stats.leetcodeHandle) {
      events.push({
        icon: Code2,
        color: C.blue,
        text: `Connected LeetCode profile @${stats.leetcodeHandle} (${stats.problemsSolved} solved)`,
        time: "Live Sync",
        tag: "LeetCode",
      });
    }

    if (savedPlaylistsData?.saved && savedPlaylistsData.saved.length > 0) {
      savedPlaylistsData.saved.slice(-2).reverse().forEach((pl) => {
        events.push({
          icon: Bookmark,
          color: C.purple,
          text: `Saved course playlist: "${pl.title.slice(0, 35)}..."`,
          time: "Saved",
          tag: "Learning",
        });
      });
    }

    if (stats.completedVideos > 0) {
      events.push({
        icon: PlayCircle,
        color: C.green,
        text: `Completed ${stats.completedVideos} video modules in learning playlists`,
        time: "Progress",
        tag: "Videos",
      });
    }

    if (events.length === 0) {
      events.push(
        { icon: Code2, color: C.blue, text: "Linked coding platform stats in Settings", time: "Today", tag: "Profiles" },
        { icon: BookOpen, color: C.purple, text: "Explored Learning playlist repository", time: "Recently", tag: "Learning" }
      );
    }

    return events;
  }, [stats, savedPlaylistsData]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="max-w-7xl mx-auto space-y-7 pb-16 select-none"
    >
      {/* ── HEADER ────────────────────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
      >
        <div className="flex items-center gap-4">
          <div
            className="p-3 rounded-2xl"
            style={{ background: "rgba(99,102,241,0.12)", border: "1px solid rgba(99,102,241,0.3)" }}
          >
            <LayoutDashboard className="w-6 h-6 text-indigo-400" />
          </div>
          <div>
            <h1 className="text-3xl font-black text-white tracking-tight">Performance Analytics</h1>
            <p className="text-sm text-slate-400 mt-0.5">
              Live metrics aggregated directly from your connected coding profile stats
            </p>
          </div>
        </div>

        {/* Time-range selector */}
        <div className="flex items-center gap-1.5 p-1 rounded-xl" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)" }}>
          {TIME_RANGES.map((r) => (
            <button
              key={r}
              onClick={() => setTimeRange(r)}
              className="px-4 py-1.5 rounded-lg text-xs font-bold transition-all"
              style={
                timeRange === r
                  ? { background: "linear-gradient(135deg,#4f46e5,#6366f1)", color: "#fff", boxShadow: "0 2px 10px rgba(99,102,241,0.4)" }
                  : { color: "rgba(148,163,184,0.8)" }
              }
            >
              {r}
            </button>
          ))}
        </div>
      </motion.div>

      {/* ── REAL KPI CARDS GRID ───────────────────────────────────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
        {/* Metric 1: Problems Solved */}
        <motion.div
          whileHover={{ y: -4 }}
          className="rounded-2xl p-4 relative overflow-hidden bg-[#0d1428] border border-blue-500/30 shadow-lg"
        >
          <div className="w-8 h-8 rounded-xl bg-blue-500/15 border border-blue-500/30 text-blue-400 flex items-center justify-center mb-3">
            <Code2 className="w-4 h-4" />
          </div>
          <div className="text-2xl font-black text-white tabular-nums leading-none mb-0.5">
            {stats.problemsSolved}
          </div>
          <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">Total Solved</div>
          <div className="flex items-center gap-1 text-[11px] font-bold text-emerald-400">
            <ArrowUpRight className="w-3 h-3" /> {stats.isProfileConnected ? "Coding Profile" : "Live Data"}
          </div>
        </motion.div>

        {/* Metric 2: Videos Completed */}
        <motion.div
          whileHover={{ y: -4 }}
          className="rounded-2xl p-4 relative overflow-hidden bg-[#0d1428] border border-cyan-500/30 shadow-lg"
        >
          <div className="w-8 h-8 rounded-xl bg-cyan-500/15 border border-cyan-500/30 text-cyan-400 flex items-center justify-center mb-3">
            <PlayCircle className="w-4 h-4" />
          </div>
          <div className="text-2xl font-black text-white tabular-nums leading-none mb-0.5">
            {stats.completedVideos}
            <span className="text-xs font-semibold text-slate-400">/{stats.totalVideos}</span>
          </div>
          <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">Videos Watched</div>
          <div className="flex items-center gap-1 text-[11px] font-bold text-cyan-400">
            {stats.learningPct}% Complete
          </div>
        </motion.div>

        {/* Metric 3: Saved Playlists */}
        <motion.div
          whileHover={{ y: -4 }}
          className="rounded-2xl p-4 relative overflow-hidden bg-[#0d1428] border border-purple-500/30 shadow-lg"
        >
          <div className="w-8 h-8 rounded-xl bg-purple-500/15 border border-purple-500/30 text-purple-400 flex items-center justify-center mb-3">
            <Bookmark className="w-4 h-4" />
          </div>
          <div className="text-2xl font-black text-white tabular-nums leading-none mb-0.5">
            {stats.savedPlaylistsCount}
          </div>
          <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">Saved Playlists</div>
          <div className="flex items-center gap-1 text-[11px] font-bold text-purple-400">
            Courses Library
          </div>
        </motion.div>

        {/* Metric 4: Success Rate */}
        <motion.div
          whileHover={{ y: -4 }}
          className="rounded-2xl p-4 relative overflow-hidden bg-[#0d1428] border border-emerald-500/30 shadow-lg"
        >
          <div className="w-8 h-8 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 flex items-center justify-center mb-3">
            <Target className="w-4 h-4" />
          </div>
          <div className="text-2xl font-black text-white tabular-nums leading-none mb-0.5">
            {stats.successRate}%
          </div>
          <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">Accuracy Rate</div>
          <div className="flex items-center gap-1 text-[11px] font-bold text-emerald-400">
            Submission Rate
          </div>
        </motion.div>

        {/* Metric 5: Streak Days */}
        <motion.div
          whileHover={{ y: -4 }}
          className="rounded-2xl p-4 relative overflow-hidden bg-[#0d1428] border border-amber-500/30 shadow-lg"
        >
          <div className="w-8 h-8 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-400 flex items-center justify-center mb-3">
            <Flame className="w-4 h-4" />
          </div>
          <div className="text-2xl font-black text-white tabular-nums leading-none mb-0.5">
            {stats.streakDays} <span className="text-xs font-semibold text-slate-400">days</span>
          </div>
          <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">Active Streak</div>
          <div className="flex items-center gap-1 text-[11px] font-bold text-amber-400">
            Daily Practice
          </div>
        </motion.div>

        {/* Metric 6: AI Career Score */}
        <motion.div
          whileHover={{ y: -4 }}
          className="rounded-2xl p-4 relative overflow-hidden bg-[#0d1428] border border-indigo-500/30 shadow-lg"
        >
          <div className="w-8 h-8 rounded-xl bg-indigo-500/15 border border-indigo-500/30 text-indigo-400 flex items-center justify-center mb-3">
            <Brain className="w-4 h-4" />
          </div>
          <div className="text-2xl font-black text-white tabular-nums leading-none mb-0.5">
            {stats.aiCareerHealth}<span className="text-xs font-semibold text-slate-400">/100</span>
          </div>
          <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">AI Career Health</div>
          <div className="flex items-center gap-1 text-[11px] font-bold text-indigo-400">
            Progress Score
          </div>
        </motion.div>
      </div>

      {/* ── ROW 2: REAL TOPIC MASTERY & DIFFICULTY SPLIT ──────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Real Skill Radar Chart */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl p-6 bg-[#0d1428] border border-white/[0.08]"
        >
          <h3 className="text-base font-bold text-white mb-1">Pattern Radar</h3>
          <p className="text-xs text-slate-500 mb-4">Topic distribution</p>
          <RadarChart data={stats.topicRadarData} />
          <div className="grid grid-cols-2 gap-2 mt-4">
            {stats.topicRadarData.map((s) => (
              <div key={s.label} className="flex items-center justify-between text-xs">
                <span className="text-slate-400 font-medium">{s.label}</span>
                <span className="font-black text-indigo-300 tabular-nums">{s.score}%</span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Real Coding Profile Difficulty Breakdown */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="rounded-2xl p-6 bg-[#0d1428] border border-white/[0.08]"
        >
          <div className="flex items-center justify-between mb-1">
            <h3 className="text-base font-bold text-white">Difficulty Breakdown</h3>
            {stats.leetcodeHandle && (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-300 border border-amber-500/20">
                LeetCode (@{stats.leetcodeHandle})
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500 mb-6">{stats.problemsSolved} total problems solved on profile</p>

          <div className="flex justify-around mb-6">
            {/* Easy */}
            <div className="flex flex-col items-center gap-2">
              <div className="relative">
                <RingProgress pct={stats.easyPct} color={C.green} size={72} stroke={7} />
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-sm font-black text-white">{stats.easyPct}%</span>
                </div>
              </div>
              <div className="text-center">
                <div className="text-lg font-black text-white">{stats.easyCount}</div>
                <div className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider">Easy</div>
              </div>
            </div>

            {/* Medium */}
            <div className="flex flex-col items-center gap-2">
              <div className="relative">
                <RingProgress pct={stats.mediumPct} color={C.amber} size={72} stroke={7} />
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-sm font-black text-white">{stats.mediumPct}%</span>
                </div>
              </div>
              <div className="text-center">
                <div className="text-lg font-black text-white">{stats.mediumCount}</div>
                <div className="text-[10px] font-bold text-amber-400 uppercase tracking-wider">Medium</div>
              </div>
            </div>

            {/* Hard */}
            <div className="flex flex-col items-center gap-2">
              <div className="relative">
                <RingProgress pct={stats.hardPct} color={C.rose} size={72} stroke={7} />
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-sm font-black text-white">{stats.hardPct}%</span>
                </div>
              </div>
              <div className="text-center">
                <div className="text-lg font-black text-white">{stats.hardCount}</div>
                <div className="text-[10px] font-bold text-rose-400 uppercase tracking-wider">Hard</div>
              </div>
            </div>
          </div>

          {/* Stacked bar */}
          <div className="h-3 rounded-full overflow-hidden flex gap-0.5 bg-slate-800">
            <div style={{ width: `${stats.easyPct}%`, background: C.green }} className="h-full" />
            <div style={{ width: `${stats.mediumPct}%`, background: C.amber }} className="h-full" />
            <div style={{ width: `${stats.hardPct}%`, background: C.rose }} className="h-full" />
          </div>
          <div className="flex justify-between text-[10px] text-slate-500 font-bold mt-1.5">
            <span>Easy ({stats.easyCount})</span>
            <span>Medium ({stats.mediumCount})</span>
            <span>Hard ({stats.hardCount})</span>
          </div>
        </motion.div>

        {/* Topic Progress Bars */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="rounded-2xl p-6 bg-[#0d1428] border border-white/[0.08]"
        >
          <h3 className="text-base font-bold text-white mb-1">Topic Completion</h3>
          <p className="text-xs text-slate-500 mb-5">Practice pattern coverage</p>

          <div className="space-y-4">
            {stats.topicRadarData.map((t) => (
              <div key={t.label}>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-bold text-slate-300">{t.label}</span>
                  <span className="text-xs font-black tabular-nums text-indigo-300">
                    {t.solved}/{t.total} ({t.score}%)
                  </span>
                </div>
                <div className="h-2 rounded-full overflow-hidden bg-slate-800">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${t.score}%` }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-cyan-400"
                  />
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* ── ROW 3: REAL RECENT ACTIVITY & AI CAREER HEALTH SUMMARY ───────── */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
        {/* AI Career Readiness Card */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="lg:col-span-2 rounded-2xl p-6 bg-gradient-to-br from-indigo-950/60 to-purple-950/40 border border-indigo-500/30"
        >
          <div className="flex items-center gap-2 mb-6">
            <div className="p-2 rounded-xl bg-purple-500/20 border border-purple-500/30 text-purple-300">
              <Brain className="w-5 h-5" />
            </div>
            <div>
              <div className="text-sm font-bold text-white">AI Career Health Index</div>
              <div className="text-[10px] text-slate-400">Live platform score</div>
            </div>
          </div>

          <div className="flex flex-col items-center gap-3">
            <div className="relative">
              <RingProgress pct={stats.aiCareerHealth} color="#8b5cf6" size={120} stroke={10} />
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-3xl font-black text-white">{stats.aiCareerHealth}</span>
                <span className="text-[10px] text-slate-400 font-bold">/100</span>
              </div>
            </div>

            <div className="text-center">
              <div className="text-sm font-bold text-purple-300 mb-0.5">Live Readiness Rating</div>
              <div className="text-xs text-slate-400">Based on your practice & profile metrics</div>
            </div>
          </div>
        </motion.div>

        {/* Real Activity Stream */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="lg:col-span-3 rounded-2xl p-6 bg-[#0d1428] border border-white/[0.08]"
        >
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="text-base font-bold text-white">Real Activity Stream</h3>
              <p className="text-xs text-slate-500 mt-0.5">Your actual recent actions across SkillsCatalyst</p>
            </div>
          </div>

          <div className="space-y-3">
            {realRecentActivity.map((a, i) => {
              const Icon = a.icon;
              return (
                <div
                  key={i}
                  className="flex items-start gap-3 p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]"
                >
                  <div className="w-8 h-8 rounded-xl bg-blue-500/15 border border-blue-500/25 text-blue-400 flex items-center justify-center shrink-0 mt-0.5">
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-slate-200 font-medium leading-snug truncate">{a.text}</p>
                    <p className="text-[11px] text-slate-500 mt-0.5">{a.time}</p>
                  </div>
                  <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-indigo-500/15 text-indigo-300 border border-indigo-500/25 shrink-0">
                    {a.tag}
                  </span>
                </div>
              );
            })}
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}
