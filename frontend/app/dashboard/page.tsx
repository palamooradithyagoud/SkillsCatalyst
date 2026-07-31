"use client";

import React from "react";
import Header from "@/components/Header";
import MetricCards from "@/components/MetricCards";
import UpcomingList from "@/components/UpcomingList";
import PracticeOverview from "@/components/PracticeOverview";
import { useQuery } from "@tanstack/react-query";
import { fetchDashboardData } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { motion } from "framer-motion";

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
      className="max-w-7xl mx-auto space-y-6"
    >
      <Header userName={displayName} />
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

