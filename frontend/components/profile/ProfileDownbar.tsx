"use client";

import React, { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  CircleArrowLeft,
  User,
  UserPen,
  Settings,
} from "lucide-react";

export type ProfileTabId = "profile" | "edit" | "settings";

export interface ProfileTabItem {
  id: ProfileTabId;
  label: string;
  icon: React.ElementType;
}

export const PROFILE_TABS: ProfileTabItem[] = [
  {
    id: "profile",
    label: "My Profile",
    icon: User,
  },
  {
    id: "edit",
    label: "Edit Profile",
    icon: UserPen,
  },
  {
    id: "settings",
    label: "Settings",
    icon: Settings,
  },
];

interface ProfileDownbarProps {
  activeTab?: ProfileTabId;
  onSelectTab?: (tab: ProfileTabId) => void;
  onBack?: () => void;
  className?: string;
}

export default function ProfileDownbar({
  activeTab: propActiveTab,
  onSelectTab,
  onBack,
  className = "",
}: ProfileDownbarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Listen to profile settings drawer state
  useEffect(() => {
    const handleSettingsState = (e: any) => {
      if (e.detail && typeof e.detail.isOpen === "boolean") {
        setIsSettingsOpen(e.detail.isOpen);
      }
    };

    window.addEventListener("profile-settings-state-change", handleSettingsState);
    return () => {
      window.removeEventListener("profile-settings-state-change", handleSettingsState);
    };
  }, []);

  // Determine active tab dynamically
  const getActiveTab = (): ProfileTabId => {
    if (propActiveTab) return propActiveTab;
    if (isSettingsOpen) return "settings";
    if (pathname.startsWith("/settings/edit") || pathname.startsWith("/profile/edit")) {
      return "edit";
    }
    return "profile";
  };

  const currentActiveTab = getActiveTab();

  const handleTabClick = (tabId: ProfileTabId) => {
    if (onSelectTab) {
      onSelectTab(tabId);
    }

    if (tabId === "profile") {
      if (pathname === "/profile") {
        if (isSettingsOpen) {
          window.dispatchEvent(new CustomEvent("close-profile-settings"));
        } else {
          window.scrollTo({ top: 0, behavior: "smooth" });
        }
      } else {
        router.push("/profile");
      }
    } else if (tabId === "edit") {
      if (isSettingsOpen) {
        window.dispatchEvent(new CustomEvent("close-profile-settings"));
      }
      router.push("/settings/edit");
    } else if (tabId === "settings") {
      if (pathname === "/profile") {
        window.dispatchEvent(new CustomEvent("open-profile-settings"));
      } else {
        router.push("/profile?settings=open");
      }
    }
  };

  const handleBack = () => {
    if (onBack) {
      onBack();
      return;
    }

    if (isSettingsOpen) {
      window.dispatchEvent(new CustomEvent("close-profile-settings"));
    }

    router.push("/dashboard");
  };

  if (!mounted) {
    return null;
  }

  return (
    <nav
      aria-label="Profile Sections Navigation"
      data-bottom-nav="true"
      data-profile-downbar="true"
      suppressHydrationWarning
      className={`md:hidden fixed bottom-3 inset-x-2 sm:inset-x-3 z-50 max-w-lg mx-auto flex items-center justify-center gap-2 transition-all pb-[env(safe-area-inset-bottom,0px)] ${className}`}
    >
      {/* ── Circular Glass Back Button (Matches Image 2) ── */}
      <motion.button
        type="button"
        whileTap={{ scale: 0.92 }}
        whileHover={{ y: -1 }}
        onClick={handleBack}
        aria-label="Back to Dashboard"
        suppressHydrationWarning
        className="w-12 h-12 sm:w-13 sm:h-13 rounded-full bg-white dark:bg-[#16171B] border border-black/10 dark:border-white/15 backdrop-blur-2xl shadow-[0_10px_25px_rgba(0,0,0,0.12)] dark:shadow-[0_12px_36px_rgba(0,0,0,0.4)] flex flex-col items-center justify-center text-neutral-800 dark:text-neutral-200 hover:text-black dark:hover:text-white transition-all duration-200 cursor-pointer shrink-0 select-none group"
      >
        <CircleArrowLeft className="w-5 h-5 text-neutral-800 dark:text-neutral-200 group-hover:text-black dark:group-hover:text-white transition-colors stroke-[2]" />
        <span className="text-[8.5px] sm:text-[9.5px] font-extrabold tracking-tight text-neutral-700 dark:text-neutral-400 group-hover:text-black dark:group-hover:text-white mt-0.5 leading-none">
          Back
        </span>
      </motion.button>

      {/* ── Main Pill Dock (ONLY Back, My Profile, Edit Profile, Settings) ── */}
      <div className="flex-1 max-w-[320px] sm:max-w-[350px] rounded-full bg-white dark:bg-[#16171B] border border-black/10 dark:border-white/15 backdrop-blur-2xl shadow-[0_10px_25px_rgba(0,0,0,0.12)] dark:shadow-[0_12px_36px_rgba(0,0,0,0.4)] px-3 py-1.5 sm:px-4 sm:py-2 flex items-center justify-around gap-1.5 sm:gap-2">
        {PROFILE_TABS.map((tab) => {
          const isActive = currentActiveTab === tab.id;
          const Icon = tab.icon;

          return (
            <motion.button
              key={tab.id}
              type="button"
              whileHover={{ y: -1 }}
              whileTap={{ scale: 0.94 }}
              onClick={() => handleTabClick(tab.id)}
              suppressHydrationWarning
              aria-label={tab.label}
              className={`relative flex flex-col items-center justify-center gap-0.5 px-3 py-1 sm:px-4 sm:py-1 rounded-full text-xs whitespace-nowrap transition-all duration-200 cursor-pointer select-none group active:scale-95 ${
                isActive
                  ? "text-[#D5FF38] font-black"
                  : "text-neutral-700 dark:text-neutral-400 hover:text-black dark:hover:text-white"
              }`}
            >
              <motion.div
                animate={{ scale: isActive ? 1.08 : 1 }}
                transition={{ type: "spring", stiffness: 400, damping: 25 }}
                className="shrink-0 flex items-center justify-center"
              >
                <Icon
                  className={`w-5 h-5 transition-colors ${
                    isActive
                      ? tab.id === "profile"
                        ? "text-[#D5FF38] fill-[#D5FF38] stroke-[2]"
                        : "text-[#D5FF38] stroke-[2.2]"
                      : "text-neutral-700 dark:text-neutral-400 group-hover:text-black dark:group-hover:text-white stroke-[2]"
                  }`}
                />
              </motion.div>

              <span
                className={`text-[9.5px] sm:text-[10.5px] leading-tight transition-colors ${
                  isActive
                    ? "text-[#D5FF38] font-black"
                    : "text-neutral-700 dark:text-neutral-400 font-bold group-hover:text-black dark:group-hover:text-white"
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
