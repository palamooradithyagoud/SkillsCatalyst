"use client";

import React from "react";
import { motion } from "framer-motion";
import {
  Calendar,
  GraduationCap,
  Newspaper,
  Flame,
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
  return (
    <nav
      aria-label="Explore Sections Navigation"
      className={`fixed bottom-6 left-1/2 -translate-x-1/2 md:left-[calc(50%+2.25rem)] lg:left-[calc(50%+2.5rem)] z-40 rounded-full border border-white/20 dark:border-white/15 bg-white/10 dark:bg-black/30 backdrop-blur-2xl backdrop-saturate-180 shadow-[0_16px_40px_rgba(0,0,0,0.35),inset_0_1px_1px_rgba(255,255,255,0.25)] p-1.5 flex items-center justify-center gap-1.5 w-max max-w-[calc(100vw-2rem)] transition-all ${className}`}
    >
      {EXPLORE_TABS.map((tab) => {
        const isActive = activeTab === tab.id;
        const Icon = tab.icon;

        return (
          <motion.button
            key={tab.id}
            type="button"
            whileHover={{ y: -1 }}
            whileTap={{ scale: 0.96 }}
            onClick={() => onSelectTab(tab.id)}
            className={`relative flex items-center gap-2 px-3.5 py-2 sm:px-5 sm:py-2.5 rounded-full text-xs font-bold whitespace-nowrap transition-all duration-200 cursor-pointer select-none group ${
              isActive
                ? "text-white font-black"
                : "text-neutral-300 hover:text-white hover:bg-white/[0.08]"
            }`}
          >
            {/* Active Pill Glass Spring Indicator */}
            {isActive && (
              <motion.div
                layoutId="activeExploreTabIndicator"
                className="absolute inset-0 bg-white/20 dark:bg-white/15 backdrop-blur-xl rounded-full border border-white/30 dark:border-white/25 shadow-[0_4px_16px_rgba(0,0,0,0.25),inset_0_1px_1px_rgba(255,255,255,0.35)] -z-10"
                transition={{ type: "spring", stiffness: 500, damping: 35 }}
              />
            )}

            <motion.div
              animate={{ scale: isActive ? 1.08 : 1 }}
              transition={{ type: "spring", stiffness: 400, damping: 25 }}
              className="shrink-0 flex items-center justify-center"
            >
              <Icon
                className={`w-4 h-4 transition-colors ${
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

            <span className="inline-block leading-none">
              {tab.label}
            </span>
          </motion.button>
        );
      })}
    </nav>
  );
}
