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
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  const handleBack = () => {
    if (typeof window !== "undefined" && window.history.length > 1) {
      router.back();
    } else {
      router.push("/dashboard");
    }
  };

  if (!mounted) {
    return null;
  }

  return (
    <nav
      aria-label="Explore Sections Navigation"
      data-bottom-nav="true"
      suppressHydrationWarning
      className={`md:hidden fixed bottom-3 inset-x-3 z-40 max-w-lg mx-auto flex items-center justify-center gap-2 transition-all pb-[env(safe-area-inset-bottom,0px)] ${className}`}
    >
      {/* ── Circular Glass Back Button (Matches Image 2) ── */}
      <motion.button
        type="button"
        whileTap={{ scale: 0.92 }}
        whileHover={{ y: -1 }}
        onClick={handleBack}
        aria-label="Back to Dashboard"
        suppressHydrationWarning
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
              suppressHydrationWarning
              className={`relative flex flex-col sm:flex-row items-center justify-center gap-0.5 sm:gap-2 px-2.5 py-1.5 sm:px-4 sm:py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all duration-200 cursor-pointer select-none group ${
                isActive
                  ? "text-white font-black"
                  : "text-neutral-400 hover:text-white hover:bg-white/[0.06]"
              }`}
            >
              {/* Active Tab without background bubble - clean icon highlight */}

              <motion.div
                animate={{ scale: isActive ? 1.08 : 1 }}
                transition={{ type: "spring", stiffness: 400, damping: 25 }}
                className="shrink-0 flex items-center justify-center"
              >
                <Icon
                  className={`w-4 h-4 sm:w-4.5 sm:h-4.5 transition-colors ${
                    isActive
                      ? "text-[#D5FF38]"
                      : "text-neutral-400 group-hover:text-white group-active:text-[#D5FF38]"
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
