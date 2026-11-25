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
import {
  DOWNBAR_NAV_CLASS,
  DOWNBAR_CIRCLE_SIZE_CLASS,
  DOWNBAR_PILL_BASE_CLASS,
  DOWNBAR_TAB_CLASS,
  DOWNBAR_ICON_SIZE_CLASS,
  DOWNBAR_LABEL_CLASS,
  DOWNBAR_BACK_ICON_CLASS,
  DOWNBAR_BACK_LABEL_CLASS,
} from "@/components/mobile/downbarStyles";

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
      className={`md:hidden ${DOWNBAR_NAV_CLASS} z-40 ${className}`}
    >
      {/* ── Circular Glass Back Button (Matches Dashboard & Career Downbar Scale) ── */}
      <motion.button
        type="button"
        whileTap={{ scale: 0.92 }}
        whileHover={{ y: -1 }}
        onClick={handleBack}
        aria-label="Back to Dashboard"
        suppressHydrationWarning
        className={`${DOWNBAR_CIRCLE_SIZE_CLASS} border border-white/20 dark:border-white/15 bg-white/10 dark:bg-black/35 backdrop-blur-2xl backdrop-saturate-180 shadow-[0_12px_36px_rgba(0,0,0,0.35),inset_0_1px_1px_rgba(255,255,255,0.25)] flex flex-col items-center justify-center text-neutral-300 hover:text-white transition-all duration-200 cursor-pointer select-none group`}
      >
        <ArrowLeft className={`${DOWNBAR_BACK_ICON_CLASS} text-neutral-300 group-hover:text-white transition-colors`} />
        <span className={`${DOWNBAR_BACK_LABEL_CLASS} text-neutral-400 group-hover:text-white`}>
          Back
        </span>
      </motion.button>

      {/* ── Main Glass Dock with Explore Tabs ── */}
      <div className={`${DOWNBAR_PILL_BASE_CLASS} border border-white/20 dark:border-white/15 bg-white/10 dark:bg-black/35 backdrop-blur-2xl backdrop-saturate-180 shadow-[0_12px_36px_rgba(0,0,0,0.35),inset_0_1px_1px_rgba(255,255,255,0.25)]`}>
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
              className={`${DOWNBAR_TAB_CLASS} flex-col ${
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
                  className={`${DOWNBAR_ICON_SIZE_CLASS} transition-colors ${
                    isActive
                      ? "text-[#D5FF38]"
                      : "text-neutral-400 group-hover:text-white group-active:text-[#D5FF38]"
                  }`}
                />
              </motion.div>

              <span
                className={`${DOWNBAR_LABEL_CLASS} transition-colors ${
                  isActive ? "text-white font-black" : "text-neutral-400 font-semibold group-hover:text-white"
                }`}
              >
                {tab.label}
              </span>
            </motion.button>
          );
        })}
      </div>
    </nav>
  );
}
