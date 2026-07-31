"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  TrendingUp,
  Award,
  Swords,
  Globe,
  Code2,
  ExternalLink,
  Plus,
  GitBranch,
  Sparkles,
  CheckCircle2,
} from "lucide-react";
import { fetchProfileData, PlatformStat } from "@/lib/api";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/lib/auth";

interface PracticeOverviewProps {
  problemsSolved?: number;
  successRate?: number;
  contests?: number;
}

const chartData = [
  { day: "Mon", height: 0 },
  { day: "Tue", height: 0 },
  { day: "Wed", height: 0 },
  { day: "Thu", height: 0 },
  { day: "Fri", height: 0 },
  { day: "Sat", height: 0 },
  { day: "Sun", height: 0 },
];

interface StatCardProps {
  value: string;
  label: string;
  icon: React.ReactNode;
  color: string;
  delay: number;
}

function StatCard({ value, label, icon, color, delay }: StatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay, duration: 0.4, ease: "easeOut" as const }}
      className="relative overflow-hidden rounded-xl p-4 flex-1"
      style={{ background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.06)" }}
    >
      <div className="flex items-start justify-between">
        <div>
          <div className="text-2xl sm:text-3xl font-black text-white tracking-tight tabular-nums">{value}</div>
          <div className="text-[10px] font-extrabold text-slate-400 tracking-wider uppercase mt-1">{label}</div>
        </div>
        <div
          className="p-2 rounded-lg shrink-0"
          style={{ background: `${color}18`, border: `1px solid ${color}30` }}
        >
          {icon}
        </div>
      </div>
      <div
        className="absolute bottom-0 left-0 right-0 h-[2px] rounded-b-xl"
        style={{ background: `linear-gradient(90deg, transparent, ${color}, transparent)`, opacity: 0.4 }}
      />
    </motion.div>
  );
}

export default function PracticeOverview({
  problemsSolved = 0,
  successRate = 0,
  contests = 0,
}: PracticeOverviewProps) {
  const { session } = useAuth();
  const userId = session?.user_id;

  const [barsVisible, setBarsVisible] = useState(false);
  const [codingStats, setCodingStats] = useState<Record<string, PlatformStat>>({});
  const [csvSolvedCount, setCsvSolvedCount] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const timer = setTimeout(() => setBarsVisible(true), 400);
    return () => clearTimeout(timer);
  }, []);

  // Fetch coding profile stats from API & Supabase DB
  useEffect(() => {
    async function loadData() {
      if (!userId || userId === "default_user") {
        setCodingStats({});
        setCsvSolvedCount(0);
        setLoading(false);
        return;
      }
      setLoading(true);
      // 1. Fetch extracted coding profiles
      const profData = await fetchProfileData(userId);
      if (profData && profData.coding_stats) {
        setCodingStats(profData.coding_stats);
      }

      // 2. Fetch solved LeetCode CSV questions from Supabase
      try {
        const { count } = await supabase
          .from("leetcode_progress")
          .select("*", { count: "exact", head: true })
          .eq("user_id", userId)
          .eq("status", "solved");

        if (count && count > 0) {
          setCsvSolvedCount(count);
        } else {
          // Check localStorage as fallback
          const saved = localStorage.getItem(`skillscatalyst_solved_questions_${userId}`);
          if (saved) {
            const parsed = JSON.parse(saved);
            const keys = Object.keys(parsed).filter((k) => parsed[k] && k.startsWith("q_"));
            setCsvSolvedCount(keys.length);
          } else {
            setCsvSolvedCount(0);
          }
        }
      } catch (e) {
        console.warn("Supabase count check error:", e);
      }
      setLoading(false);
    }
    loadData();
  }, [userId]);

  // Calculate Aggregated Problems Solved
  const leetcodeSolved = codingStats.leetcode?.total_solved || 0;
  const gfgSolved = codingStats.geeksforgeeks?.total_solved || 0;
  const totalExtractedSolved = leetcodeSolved + gfgSolved + csvSolvedCount;
  const displayTotalSolved = totalExtractedSolved > 0 ? totalExtractedSolved : problemsSolved;

  // Connected Platform Badges Count
  const connectedPlatformsCount = Object.values(codingStats).filter((s) => s && s.configured).length;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2, duration: 0.5, ease: "easeOut" as const }}
      className="glass rounded-2xl p-6 h-full flex flex-col justify-between space-y-6 shadow-2xl"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-extrabold text-white tracking-tight flex items-center gap-2">
            <span>Practice & Developer Overview</span>
            {connectedPlatformsCount > 0 && (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30">
                {connectedPlatformsCount} Connected
              </span>
            )}
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Real-time readiness stats aggregated across your developer & coding profiles.
          </p>
        </div>

        <Link
          href="/settings"
          className="text-xs font-semibold px-3 py-1.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 text-emerald-400 transition-all flex items-center gap-1.5"
        >
          <TrendingUp className="w-3.5 h-3.5" />
          <span>Sync Profiles</span>
        </Link>
      </div>

      {/* Top Stat Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <StatCard
          value={String(displayTotalSolved)}
          label="Total Problems Solved"
          icon={<Award className="w-4 h-4 text-blue-400" />}
          color="#3b82f6"
          delay={0.3}
        />
        <StatCard
          value={`${connectedPlatformsCount}/6`}
          label="Profiles Connected"
          icon={<Globe className="w-4 h-4 text-emerald-400" />}
          color="#10b981"
          delay={0.35}
        />
        <StatCard
          value={codingStats.codeforces?.rating ? `${codingStats.codeforces.rating}` : `${successRate}%`}
          label={codingStats.codeforces?.rating ? "Codeforces Rating" : "Success Rate"}
          icon={<Swords className="w-4 h-4 text-purple-400" />}
          color="#8b5cf6"
          delay={0.4}
        />
      </div>

      {/* ── Extracted Coding Profiles Live Stats Grid ── */}
      <div className="space-y-3">
        <div className="flex items-center justify-between text-xs font-bold text-slate-400 border-b border-white/[0.06] pb-2">
          <span className="flex items-center gap-1.5">
            <Code2 className="w-4 h-4 text-indigo-400" />
            <span>Connected Developer Profiles Live Stats</span>
          </span>
          <Link href="/settings" className="text-indigo-400 hover:text-indigo-300 transition-colors">
            Manage Links →
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {/* LeetCode */}
          <PlatformStatItem
            title="LeetCode"
            url={codingStats.leetcode?.url || "https://leetcode.com"}
            dotColor="bg-amber-400"
            stat={codingStats.leetcode}
          />

          {/* GitHub */}
          <PlatformStatItem
            title="GitHub"
            url={codingStats.github?.url || "https://github.com"}
            dotColor="bg-slate-200"
            stat={codingStats.github}
          />

          {/* Codeforces */}
          <PlatformStatItem
            title="Codeforces"
            url={codingStats.codeforces?.url || "https://codeforces.com"}
            dotColor="bg-blue-400"
            stat={codingStats.codeforces}
          />

          {/* CodeChef */}
          <PlatformStatItem
            title="CodeChef"
            url={codingStats.codechef?.url || "https://codechef.com"}
            dotColor="bg-amber-600"
            stat={codingStats.codechef}
          />

          {/* GeeksforGeeks */}
          <PlatformStatItem
            title="GeeksforGeeks"
            url={codingStats.geeksforgeeks?.url || "https://geeksforgeeks.org"}
            dotColor="bg-emerald-500"
            stat={codingStats.geeksforgeeks}
          />

          {/* HackerRank */}
          <PlatformStatItem
            title="HackerRank"
            url={codingStats.hackerrank?.url || "https://hackerrank.com"}
            dotColor="bg-emerald-400"
            stat={codingStats.hackerrank}
          />
        </div>
      </div>

      {/* Activity Chart Bar */}
      <div className="pt-2">
        <div className="flex items-center justify-between text-[11px] font-bold text-slate-400 mb-2">
          <span>Weekly Activity & Problem Solves</span>
          <span className="text-slate-400">{displayTotalSolved > 0 ? "Active practice" : "No solves recorded"}</span>
        </div>

        <div className="flex items-end justify-between gap-2 h-20 pb-0">
          {chartData.map((bar, i) => (
            <div key={bar.day} className="flex-1 flex flex-col items-center gap-1.5">
              <motion.div
                className="chart-bar w-full"
                style={{ height: barsVisible ? `${bar.height}%` : "0%" }}
                initial={{ height: "0%" }}
                animate={{ height: barsVisible ? `${bar.height}%` : "0%" }}
                transition={{ delay: 0.5 + i * 0.05, duration: 0.4, ease: "easeOut" }}
              />
            </div>
          ))}
        </div>
        <div className="h-[1px] w-full bg-gradient-to-r from-transparent via-blue-500/40 to-transparent mb-1.5" />
        <div className="flex justify-between px-0.5">
          {chartData.map((bar) => (
            <div key={bar.day} className="flex-1 text-center text-[10px] font-semibold text-slate-500">
              {bar.day}
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}

// Subcomponent for individual platform live summary card
interface PlatformStatItemProps {
  title: string;
  url: string;
  dotColor: string;
  stat?: PlatformStat;
}

function PlatformStatItem({ title, url, dotColor, stat }: PlatformStatItemProps) {
  const isConfigured = !!(stat && stat.configured);

  return (
    <div className="p-3 rounded-xl bg-[#0b1222]/80 border border-white/[0.06] hover:border-indigo-500/30 transition-all flex flex-col justify-between space-y-1.5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className={`w-2 h-2 rounded-full ${dotColor}`} />
          <span className="text-xs font-bold text-white">{title}</span>
        </div>

        {isConfigured ? (
          <a
            href={stat.url || url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[10px] font-extrabold px-2 py-0.5 rounded-md bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 flex items-center gap-1 hover:bg-emerald-500/25 transition-colors"
          >
            <span>{stat.badge || "Connected"}</span>
            <ExternalLink className="w-2.5 h-2.5" />
          </a>
        ) : (
          <Link
            href="/settings"
            className="text-[10px] font-semibold text-slate-500 hover:text-indigo-300 transition-colors flex items-center gap-1"
          >
            <Plus className="w-2.5 h-2.5" />
            <span>Connect</span>
          </Link>
        )}
      </div>

      <div className="text-[11px] font-medium text-slate-300 truncate">
        {isConfigured && stat.summary ? (
          <span className="text-indigo-300 font-semibold">{stat.summary}</span>
        ) : (
          <span className="text-slate-500 italic text-[10px]">Not linked yet</span>
        )}
      </div>
    </div>
  );
}
