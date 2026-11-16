"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  Map,
  BookOpen,
  Target,
  Briefcase,
  BarChart3,
  ArrowLeft,
} from "lucide-react";

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
    icon: Map,
    activeColor: "text-[#D5FF38]",
  },
  {
    id: "learn",
    label: "Learn",
    href: "/learning",
    icon: BookOpen,
    activeColor: "text-[#D5FF38]",
  },
  {
    id: "practice",
    label: "Practice",
    href: "/practice",
    icon: Target,
    activeColor: "text-[#D5FF38]",
  },
  {
    id: "placement",
    label: "Placement",
    href: "/career",
    icon: Briefcase,
    activeColor: "text-[#D5FF38]",
  },
  {
    id: "analytics",
    label: "Analytics",
    href: "/analytics",
    icon: BarChart3,
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
      suppressHydrationWarning
      className={`md:hidden fixed bottom-3 inset-x-2 sm:inset-x-3 z-40 max-w-lg mx-auto flex items-center justify-center gap-1.5 sm:gap-2 transition-all pb-[env(safe-area-inset-bottom,0px)] ${className}`}
    >
      {/* ── Circular Glass Back Button (Matches Explore Downbar) ── */}
      <motion.button
        type="button"
        whileTap={{ scale: 0.92 }}
        whileHover={{ y: -1 }}
        onClick={handleBack}
        aria-label="Back to Dashboard"
        suppressHydrationWarning
        className="w-11 h-11 sm:w-13 sm:h-13 rounded-full border border-white/20 dark:border-white/15 bg-white/10 dark:bg-black/35 backdrop-blur-2xl backdrop-saturate-180 shadow-[0_12px_36px_rgba(0,0,0,0.35),inset_0_1px_1px_rgba(255,255,255,0.25)] flex flex-col items-center justify-center text-neutral-300 hover:text-white transition-all duration-200 cursor-pointer shrink-0 select-none group"
      >
        <ArrowLeft className="w-4 h-4 sm:w-4.5 sm:h-4.5 text-neutral-300 group-hover:text-white transition-colors" />
        <span className="text-[8px] sm:text-[9.5px] font-extrabold tracking-tight text-neutral-400 group-hover:text-white mt-0.5 leading-none">
          Back
        </span>
      </motion.button>

      {/* ── Main Glass Dock with Tabs: Roadmaps, Learn, Practice, Placement, Analytics ── */}
      <div className="flex-1 sm:flex-initial rounded-full border border-white/20 dark:border-white/15 bg-white/10 dark:bg-black/35 backdrop-blur-2xl backdrop-saturate-180 shadow-[0_12px_36px_rgba(0,0,0,0.35),inset_0_1px_1px_rgba(255,255,255,0.25)] p-1 sm:p-1.5 flex items-center justify-around sm:justify-center sm:gap-1.5 w-auto">
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
              className={`relative flex flex-col items-center justify-center gap-0.5 px-2 py-1 sm:px-3 sm:py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all duration-200 cursor-pointer select-none group active:scale-95 ${
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
                    isActive ? "text-[#D5FF38]" : "text-neutral-400 group-hover:text-white group-active:text-[#D5FF38]"
                  }`}
                />
              </motion.div>

              <span className={`text-[8px] sm:text-[10px] leading-tight transition-colors ${
                isActive ? "text-white font-black" : "text-neutral-400 font-bold group-hover:text-white"
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
