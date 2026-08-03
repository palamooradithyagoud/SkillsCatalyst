"use client";

import React from "react";
import Link from "next/link";
import Header from "@/components/Header";
import MetricCards from "@/components/MetricCards";
import UpcomingList from "@/components/UpcomingList";
import PracticeOverview from "@/components/PracticeOverview";
import { useQuery } from "@tanstack/react-query";
import { fetchDashboardData } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { motion } from "framer-motion";
import { Target, FileText, Map, Sparkles } from "lucide-react";

export default function DashboardPage() {
  const { session } = useAuth();
  const userId = session?.user_id;

  const { data } = useQuery({
    queryKey: ["dashboard", userId],
    queryFn: () => fetchDashboardData(),
    enabled: !!session?.user_id,
  });

  const displayName = session?.name || data?.user?.name || session?.email?.split("@")[0] || "Learner";

  // Filter out any legacy mock items if backend deployment is pending
  const upcomingItems = (data?.upcoming ?? []).filter(
    (item: any) =>
      item.title !== "Mock Interview" &&
      item.title !== "System Design" &&
      item.title !== "DSA Practice"
  );

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="max-w-7xl mx-auto space-y-4 sm:space-y-6"
    >
      <Header userName={displayName} />

      {/* ── Native Smartphone Quick Action Shortcuts (2-row iOS-style Grid < md) ── */}
      <div className="md:hidden">
        <div className="flex items-center justify-between px-1 mb-2">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">
            Quick Actions
          </span>
          <span className="text-[10px] text-slate-500 font-medium">Shortcuts</span>
        </div>
        <div className="grid grid-cols-4 gap-3 bg-white/[0.02] border border-white/10 rounded-2xl p-3.5 backdrop-blur-xl">
          <Link
            href="/practice"
            className="flex flex-col items-center justify-center gap-1.5 group select-none"
          >
            <div className="w-13 h-13 rounded-full bg-gradient-to-br from-blue-500/25 to-indigo-600/20 border border-blue-400/30 flex items-center justify-center text-blue-400 shadow-md shadow-blue-500/10 group-active:scale-90 transition-transform">
              <Target className="w-5 h-5" />
            </div>
            <span className="text-[11px] font-semibold text-slate-300 group-hover:text-white text-center tracking-tight">
              Practice
            </span>
          </Link>

          <Link
            href="/career"
            className="flex flex-col items-center justify-center gap-1.5 group select-none"
          >
            <div className="w-13 h-13 rounded-full bg-gradient-to-br from-purple-500/25 to-pink-600/20 border border-purple-400/30 flex items-center justify-center text-purple-400 shadow-md shadow-purple-500/10 group-active:scale-90 transition-transform">
              <FileText className="w-5 h-5" />
            </div>
            <span className="text-[11px] font-semibold text-slate-300 group-hover:text-white text-center tracking-tight">
              Resume
            </span>
          </Link>

          <Link
            href="/roadmaps"
            className="flex flex-col items-center justify-center gap-1.5 group select-none"
          >
            <div className="w-13 h-13 rounded-full bg-gradient-to-br from-emerald-500/25 to-teal-600/20 border border-emerald-400/30 flex items-center justify-center text-emerald-400 shadow-md shadow-emerald-500/10 group-active:scale-90 transition-transform">
              <Map className="w-5 h-5" />
            </div>
            <span className="text-[11px] font-semibold text-slate-300 group-hover:text-white text-center tracking-tight">
              Roadmaps
            </span>
          </Link>

          <Link
            href="/ai-mentor"
            className="flex flex-col items-center justify-center gap-1.5 group select-none"
          >
            <div className="w-13 h-13 rounded-full bg-gradient-to-br from-cyan-500/25 to-blue-600/20 border border-cyan-400/30 flex items-center justify-center text-cyan-400 shadow-md shadow-cyan-500/10 group-active:scale-90 transition-transform">
              <Sparkles className="w-5 h-5" />
            </div>
            <span className="text-[11px] font-semibold text-slate-300 group-hover:text-white text-center tracking-tight">
              AI Mentor
            </span>
          </Link>
        </div>
      </div>

      <MetricCards metrics={data?.metrics} />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
        <div className="lg:col-span-5">
          <UpcomingList items={upcomingItems} />
        </div>
        <div className="lg:col-span-7">
          <PracticeOverview
            problemsSolved={data?.practiceOverview?.problemsSolved}
            successRate={data?.practiceOverview?.successRate}
            contests={data?.practiceOverview?.contests}
          />
        </div>
      </div>
    </motion.div>
  );
}
