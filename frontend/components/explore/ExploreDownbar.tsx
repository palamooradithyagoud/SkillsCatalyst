"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  Calendar,
  GraduationCap,
  Newspaper,
  Flame,
  ArrowLeft,
} from "lucide-react";

export type ExploreTabId = "events" | "scholarships" | "news" | "trending";

export interface ExploreTabItem {
  id: ExploreTabId;
  label: string;
  icon: React.ElementType;
}

export const EXPLORE_TABS: ExploreTabItem[] = [
  { id: "events", label: "Events", icon: Calendar },
  { id: "scholarships", label: "Scholarships", icon: GraduationCap },
  { id: "news", label: "Tech News", icon: Newspaper },
  { id: "trending", label: "Trending", icon: Flame },
];

interface ExploreDownbarProps {
  activeTab: ExploreTabId;
  onSelectTab: (tab: ExploreTabId) => void;
  className?: string;
}

export default function ExploreDownbar({
  activeTab,
  onSelectTab,
  className = "",
}: ExploreDownbarProps) {
  const router = useRouter();

  const handleBack = () => {
    if (typeof window !== "undefined" && window.history.length > 1) {
      router.back();
    } else {
      router.push("/dashboard");
    }
  };

  return (
    <nav
      aria-label="Explore Sections Navigation"
      className={`fixed bottom-3 sm:bottom-6 inset-x-3 sm:inset-x-auto sm:left-1/2 sm:-translate-x-1/2 md:left-[calc(50%+2.25rem)] lg:left-[calc(50%+2.5rem)] z-40 max-w-lg sm:max-w-none mx-auto flex items-center justify-center gap-2 sm:gap-2.5 transition-all pb-[env(safe-area-inset-bottom,0px)] ${className}`}
    >
      {/* ── Circular Glass Back Button (Matches Image 2) ── */}
      <motion.button
        type="button"
        whileTap={{ scale: 0.92 }}
        whileHover={{ y: -1 }}
        onClick={handleBack}
        aria-label="Back to Dashboard"
        className="w-12 h-12 sm:w-13 sm:h-13 rounded-full border border-white/20 dark:border-white/15 bg-white/10 dark:bg-black/35 backdrop-blur-2xl backdrop-saturate-180 shadow-[0_12px_36px_rgba(0,0,0,0.35),inset_0_1px_1px_rgba(255,255,255,0.25)] flex flex-col items-center justify-center text-neutral-300 hover:text-white transition-all duration-200 cursor-pointer shrink-0 select-none group"
      >
        <ArrowLeft className="w-4 h-4 sm:w-4.5 sm:h-4.5 text-neutral-300 group-hover:text-white transition-colors" />
        <span className="text-[8.5px] sm:text-[9.5px] font-extrabold tracking-tight text-neutral-400 group-hover:text-white mt-0.5 leading-none">
          Back
        </span>
      </motion.button>

      {/* ── Main Glass Dock with Explore Tabs ── */}
      <div className="flex-1 sm:flex-initial rounded-full border border-white/20 dark:border-white/15 bg-white/10 dark:bg-black/35 backdrop-blur-2xl backdrop-saturate-180 shadow-[0_12px_36px_rgba(0,0,0,0.35),inset_0_1px_1px_rgba(255,255,255,0.25)] p-1.5 flex items-center justify-around sm:justify-center sm:gap-1.5 w-auto">
        {EXPLORE_TABS.map((tab) => {
          const isActive = activeTab === tab.id;
          const Icon = tab.icon;

          return (
            <motion.button
              key={tab.id}
              type="button"
              whileHover={{ y: -1 }}
              whileTap={{ scale: 0.94 }}
              onClick={() => onSelectTab(tab.id)}
              className={`relative flex flex-col sm:flex-row items-center justify-center gap-0.5 sm:gap-2 px-2.5 py-1.5 sm:px-4 sm:py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all duration-200 cursor-pointer select-none group ${
                isActive
                  ? "text-white font-black"
                  : "text-neutral-400 hover:text-white hover:bg-white/[0.06]"
              }`}
            >
              {/* Active Pill Glass Spring Indicator */}
              {isActive && (
                <motion.div
                  layoutId="activeExploreTabIndicator"
                  className="absolute inset-0 bg-white/20 dark:bg-white/15 backdrop-blur-xl rounded-full border border-white/30 dark:border-white/25 shadow-[0_2px_12px_rgba(0,0,0,0.25),inset_0_1px_1px_rgba(255,255,255,0.35)] -z-10"
                  transition={{ type: "spring", stiffness: 500, damping: 35 }}
                />
              )}

              <motion.div
                animate={{ scale: isActive ? 1.08 : 1 }}
                transition={{ type: "spring", stiffness: 400, damping: 25 }}
                className="shrink-0 flex items-center justify-center"
              >
                <Icon
                  className={`w-4 h-4 sm:w-4.5 sm:h-4.5 transition-colors ${
                    isActive
                      ? tab.id === "events"
                        ? "text-purple-400"
                        : tab.id === "scholarships"
                        ? "text-indigo-400"
                        : tab.id === "news"
                        ? "text-blue-400"
                        : "text-amber-400 fill-amber-400/20"
                      : "text-neutral-400 group-hover:text-white"
                  }`}
                />
              </motion.div>

              <span className="text-[9.5px] sm:text-xs font-bold sm:font-extrabold leading-tight">
                {tab.label}
              </span>
            </motion.button>
          );
        })}
      </div>
    </nav>
  );
}
