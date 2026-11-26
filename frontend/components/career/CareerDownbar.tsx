"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import AnalyticsIcon from "@/components/icons/AnalyticsIcon";
import LearnIcon from "@/components/icons/LearnIcon";
import RoadmapsIcon from "@/components/icons/RoadmapsIcon";
import PracticeIcon from "@/components/icons/PracticeIcon";
import CareerIcon from "@/components/icons/CareerIcon";
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

export type CareerTabId = "roadmaps" | "learn" | "practice" | "placement" | "analytics";

export interface CareerTabItem {
  id: CareerTabId;
  label: string;
  href: string;
  icon: React.ElementType;
  activeColor: string;
}

export const CAREER_TABS: CareerTabItem[] = [
  {
    id: "roadmaps",
    label: "Roadmaps",
    href: "/roadmaps",
    icon: RoadmapsIcon,
    activeColor: "text-[#D5FF38]",
  },
  {
    id: "learn",
    label: "Learn",
    href: "/learning",
    icon: LearnIcon,
    activeColor: "text-[#D5FF38]",
  },
  {
    id: "practice",
    label: "Practice",
    href: "/practice",
    icon: PracticeIcon,
    activeColor: "text-[#D5FF38]",
  },
  {
    id: "placement",
    label: "Placement",
    href: "/career",
    icon: CareerIcon,
    activeColor: "text-[#D5FF38]",
  },
  {
    id: "analytics",
    label: "Analytics",
    href: "/analytics",
    icon: AnalyticsIcon,
    activeColor: "text-[#D5FF38]",
  },
];

interface CareerDownbarProps {
  activeTab?: CareerTabId;
  onSelectTab?: (tab: CareerTabId) => void;
  className?: string;
}

export default function CareerDownbar({
  activeTab: propActiveTab,
  onSelectTab,
  className = "",
}: CareerDownbarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Determine active tab dynamically and reactively from the current route
  const getActiveTab = (): CareerTabId => {
    if (propActiveTab) return propActiveTab;

    if (pathname.startsWith("/roadmaps")) {
      return "roadmaps";
    }
    if (pathname.startsWith("/learning")) {
      return "learn";
    }
    if (pathname.startsWith("/practice")) {
      return "practice";
    }
    if (pathname.startsWith("/career")) {
      return "placement";
    }
    if (pathname.startsWith("/analytics")) {
      return "analytics";
    }
    return "placement";
  };

  const routeTab = getActiveTab();
  const [clickedTab, setClickedTab] = useState<CareerTabId | null>(null);

  useEffect(() => {
    setClickedTab(null);
  }, [pathname]);

  const currentActiveTab = clickedTab || routeTab;

  const handleBack = () => {
    if (pathname.startsWith("/career/resume-review") || pathname.startsWith("/career/resume-builder")) {
      router.push("/career");
    } else {
      router.push("/dashboard");
    }
  };

  if (!mounted) {
    return null;
  }

  return (
    <nav
      aria-label="Career & Learning Navigation"
      data-bottom-nav="true"
      suppressHydrationWarning
      className={`md:hidden ${DOWNBAR_NAV_CLASS} z-40 ${className}`}
    >
      {/* ── Circular Glass Back Button (Matches Explore & Dashboard Downbar Scale) ── */}
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

      {/* ── Main Glass Dock with Tabs: Roadmaps, Learn, Practice, Placement, Analytics ── */}
      <div className={`${DOWNBAR_PILL_BASE_CLASS} border border-white/20 dark:border-white/15 bg-white/10 dark:bg-black/35 backdrop-blur-2xl backdrop-saturate-180 shadow-[0_12px_36px_rgba(0,0,0,0.35),inset_0_1px_1px_rgba(255,255,255,0.25)]`}>
        {CAREER_TABS.map((tab) => {
          const isActive = currentActiveTab === tab.id;
          const Icon = tab.icon;

          return (
            <Link
              key={tab.id}
              href={tab.href}
              onClick={() => {
                setClickedTab(tab.id);
                if (onSelectTab) {
                  onSelectTab(tab.id);
                }
              }}
              aria-label={tab.label}
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
                {tab.id === "analytics" ? (
                  <AnalyticsIcon
                    active={isActive}
                    className={`${DOWNBAR_ICON_SIZE_CLASS} transition-colors ${
                      isActive ? "text-[#D5FF38]" : "text-neutral-400 group-hover:text-white group-active:text-[#D5FF38]"
                    }`}
                  />
                ) : tab.id === "learn" ? (
                  <LearnIcon
                    active={isActive}
                    className={`${DOWNBAR_ICON_SIZE_CLASS} transition-colors ${
                      isActive ? "text-[#D5FF38]" : "text-neutral-400 group-hover:text-white group-active:text-[#D5FF38]"
                    }`}
                  />
                ) : tab.id === "roadmaps" ? (
                  <RoadmapsIcon
                    active={isActive}
                    className={`${DOWNBAR_ICON_SIZE_CLASS} transition-colors ${
                      isActive ? "text-[#D5FF38]" : "text-neutral-400 group-hover:text-white group-active:text-[#D5FF38]"
                    }`}
                  />
                ) : tab.id === "practice" ? (
                  <PracticeIcon
                    active={isActive}
                    className={`${DOWNBAR_ICON_SIZE_CLASS} transition-colors ${
                      isActive ? "text-[#D5FF38]" : "text-neutral-400 group-hover:text-white group-active:text-[#D5FF38]"
                    }`}
                  />
                ) : tab.id === "placement" ? (
                  <CareerIcon
                    active={isActive}
                    className={`${DOWNBAR_ICON_SIZE_CLASS} transition-colors ${
                      isActive ? "text-[#D5FF38]" : "text-neutral-400 group-hover:text-white group-active:text-[#D5FF38]"
                    }`}
                  />
                ) : (
                  <Icon
                    className={`${DOWNBAR_ICON_SIZE_CLASS} transition-colors ${
                      isActive ? "text-[#D5FF38]" : "text-neutral-400 group-hover:text-white group-active:text-[#D5FF38]"
                    }`}
                  />
                )}
              </motion.div>

              <span className={`${DOWNBAR_LABEL_CLASS} transition-colors ${
                isActive ? "text-white font-black" : "text-neutral-400 font-semibold group-hover:text-white"
              }`}>
                {tab.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
