"use client";

import React from "react";
import { motion } from "framer-motion";
import {
  Flame,
  GraduationCap,
  Newspaper,
  Calendar,
  Users,
} from "lucide-react";

export type ExploreTabId = "trending" | "scholarships" | "news" | "events" | "community";

export interface ExploreTabItem {
  id: ExploreTabId;
  label: string;
  icon: React.ElementType;
}

export const EXPLORE_TABS: ExploreTabItem[] = [
  { id: "trending", label: "Trending", icon: Flame },
  { id: "scholarships", label: "Scholarships", icon: GraduationCap },
  { id: "news", label: "Tech News", icon: Newspaper },
  { id: "events", label: "Events", icon: Calendar },
  { id: "community", label: "Community", icon: Users },
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
      className={`fixed bottom-5 left-1/2 -translate-x-1/2 md:left-[calc(50%+2.25rem)] lg:left-[calc(50%+2.5rem)] z-40 rounded-full border border-white/50 bg-white/35 backdrop-blur-2xl shadow-[0_20px_50px_rgba(15,23,42,0.1),0_4px_16px_rgba(0,0,0,0.04)] p-1.5 flex items-center justify-center gap-1.5 w-max max-w-[calc(100vw-2rem)] transition-all ${className}`}
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
            className={`relative flex items-center gap-2 px-3.5 py-2 sm:px-5 sm:py-2.5 rounded-full text-xs font-black whitespace-nowrap transition-all cursor-pointer select-none ${
              isActive
                ? "text-slate-950"
                : "text-slate-600 hover:text-slate-900 hover:bg-white/40"
            }`}
          >
            {/* Active Pill Spring Indicator */}
            {isActive && (
              <motion.div
                layoutId="activeExploreTabIndicator"
                className="absolute inset-0 bg-white/80 backdrop-blur-md rounded-full border border-white/90 shadow-xs -z-10"
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
                    ? tab.id === "trending"
                      ? "text-orange-500 fill-orange-500/20"
                      : tab.id === "scholarships"
                      ? "text-indigo-600"
                      : tab.id === "news"
                      ? "text-blue-600"
                      : tab.id === "events"
                      ? "text-purple-600"
                      : "text-emerald-600"
                    : "text-slate-400"
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
