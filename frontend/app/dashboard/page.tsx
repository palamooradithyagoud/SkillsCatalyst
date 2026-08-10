"use client";

import React, { useState } from "react";
import Link from "next/link";
import Header from "@/components/Header";
import MetricCards from "@/components/MetricCards";
import UpcomingList from "@/components/UpcomingList";
import PracticeOverview from "@/components/PracticeOverview";
import { useQuery } from "@tanstack/react-query";
import { fetchDashboardData } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { motion, AnimatePresence } from "framer-motion";
import { Target, FileText, Map, Sparkles, CheckCircle2, Zap, X } from "lucide-react";

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

  // Framer Motion Animation Variants for smooth entrance
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.05,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 22, scale: 0.98 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        type: "spring" as const,
        stiffness: 320,
        damping: 25,
      },
    },
  };

  const rightPanelVariants = {
    hidden: { opacity: 0, x: 28 },
    visible: {
      opacity: 1,
      x: 0,
      transition: {
        type: "spring" as const,
        stiffness: 300,
        damping: 26,
        delay: 0.25,
      },
    },
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="max-w-7xl mx-auto space-y-4 sm:space-y-6"
    >
      {/* ── Main Header Section ── */}
      <motion.div variants={itemVariants}>
        <Header userName={displayName} />
      </motion.div>

      {/* ── Main Content Grid ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Main Area: Hero Banner, 3 Metric Cards, Active Courses Grid */}
        <motion.div variants={itemVariants} className="lg:col-span-8 xl:col-span-8 space-y-6">
          <MetricCards metrics={data?.metrics} />
        </motion.div>

        {/* Right Panel: Calendar, Date Strip, New Event Button, Homework Progress */}
        <motion.div variants={rightPanelVariants} className="lg:col-span-4 xl:col-span-4 sticky top-6">
          <UpcomingList items={upcomingItems} />
        </motion.div>
      </div>
    </motion.div>
  );
}
