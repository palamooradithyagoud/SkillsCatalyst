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

      {/* ── Native Smartphone Quick Action Chips (Mobile < md only) ── */}
      <div className="md:hidden">
        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 px-1">
          Quick Actions
        </div>
        <div className="mobile-chip-scroll flex items-center gap-2.5 overflow-x-auto pb-1">
          <Link
            href="/practice"
            className="mobile-chip-item flex items-center gap-2 px-3.5 py-2.5 rounded-2xl glass hover:bg-blue-500/20 text-xs font-bold text-blue-300 border border-blue-500/30 whitespace-nowrap min-h-[44px] shadow-sm"
          >
            <Target className="w-4 h-4 text-blue-400" />
            <span>Practice Problems</span>
          </Link>

          <Link
            href="/career"
            className="mobile-chip-item flex items-center gap-2 px-3.5 py-2.5 rounded-2xl glass hover:bg-purple-500/20 text-xs font-bold text-purple-300 border border-purple-500/30 whitespace-nowrap min-h-[44px] shadow-sm"
          >
            <FileText className="w-4 h-4 text-purple-400" />
            <span>Resume Review</span>
          </Link>

          <Link
            href="/roadmaps"
            className="mobile-chip-item flex items-center gap-2 px-3.5 py-2.5 rounded-2xl glass hover:bg-emerald-500/20 text-xs font-bold text-emerald-300 border border-emerald-500/30 whitespace-nowrap min-h-[44px] shadow-sm"
          >
            <Map className="w-4 h-4 text-emerald-400" />
            <span>Explore Roadmaps</span>
          </Link>

          <Link
            href="/explore"
            className="mobile-chip-item flex items-center gap-2 px-3.5 py-2.5 rounded-2xl glass hover:bg-cyan-500/20 text-xs font-bold text-cyan-300 border border-cyan-500/30 whitespace-nowrap min-h-[44px] shadow-sm"
          >
            <Sparkles className="w-4 h-4 text-cyan-400" />
            <span>AI Mentor Chat</span>
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
