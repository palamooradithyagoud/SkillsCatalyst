"use client";

import React, { useState } from "react";
import Link from "next/link";
import MetricCards from "@/components/MetricCards";
import QuickHubNav from "@/components/QuickHubNav";
import UpcomingList from "@/components/UpcomingList";
import PracticeOverview from "@/components/PracticeOverview";
import PricingModal from "@/components/PricingModal";
import EventHeroCard from "@/components/EventHeroCard";
import { TechNewsStories } from "@/components/tech-news/TechNewsStories";
import { useQuery } from "@tanstack/react-query";
import { fetchDashboardData } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { useSubscription } from "@/hooks/useSubscription";
import { usePricingModal } from "@/contexts/PricingModalContext";
import { motion, AnimatePresence } from "framer-motion";
import { Target, FileText, Map, Sparkles, CheckCircle2, Zap, X } from "lucide-react";

export default function DashboardPage() {
  const { session } = useAuth();
  const userId = session?.user_id;
  const { openPricingModal } = usePricingModal();
  const [showPaymentBanner, setShowPaymentBanner] = useState(false);
  const { isPremium, plan: subPlan, refetch: refetchSubscription } = useSubscription();

  React.useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      if (params.get("payment") === "complete") {
        setShowPaymentBanner(true);
        refetchSubscription();
      }
    }
  }, [refetchSubscription]);

  const { data, isLoading } = useQuery({
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
      className="max-w-[1060px] xl:max-w-[1100px] mx-auto space-y-4 sm:space-y-5 pb-16 sm:pb-24"
    >
      {/* ── Payment Confirmation Celebration Banner ── */}
      {showPaymentBanner && (
        <motion.div
          initial={{ opacity: 0, y: -10, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          className="p-3.5 sm:p-4 rounded-2xl bg-emerald-500/20 border border-emerald-400/40 text-emerald-200 text-xs sm:text-sm font-semibold flex items-center justify-between gap-3 shadow-lg shadow-emerald-950/30"
        >
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            <span>🎉 Payment Confirmed! Your Premium access is active across all questions, prep, and roadmaps.</span>
          </div>
          <button
            onClick={() => setShowPaymentBanner(false)}
            className="p-1 rounded-lg hover:bg-white/10 text-emerald-300 hover:text-white transition-colors cursor-pointer"
            aria-label="Dismiss banner"
          >
            <X className="w-4 h-4" />
          </button>
        </motion.div>
      )}

      {/* ── Main Content Grid: Compact side-by-side without empty gap ── */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_1fr] xl:grid-cols-[510px_1fr] gap-5 sm:gap-6 items-start">
        {/* Left Main Area: Event Hero Banner + Tech Stories Icons + Quick Hub + Metric Cards */}
        <motion.div
          variants={itemVariants}
          className="w-full max-w-[540px] space-y-3.5 sm:space-y-4"
        >
          <EventHeroCard onOpenPricing={openPricingModal} />
          {/* 48-Hour Tech News Stories (Compact icon strip below Event Hero Card) */}
          <TechNewsStories />
          <QuickHubNav />
          <MetricCards metrics={data?.metrics} hideEventCard={true} showOnly="metrics" />
        </motion.div>

        {/* Right / Middle Area: Learning Progress & Trending Skills + Tasks */}
        <motion.div
          variants={rightPanelVariants}
          className="w-full max-w-[540px] space-y-4 sm:space-y-5 sticky top-6"
        >
          <MetricCards metrics={data?.metrics} hideEventCard={true} showOnly="learning-and-skills" />
          <UpcomingList items={upcomingItems} />
        </motion.div>
      </div>
    </motion.div>
  );
}
