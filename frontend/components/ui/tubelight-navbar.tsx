"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LucideIcon, Home, Clapperboard, Bot, Target } from "lucide-react";
import { cn } from "@/lib/utils";

export interface NavItem {
  name: string;
  url: string;
  icon: LucideIcon;
  badge?: string | number;
}

export interface NavBarProps {
  items: NavItem[];
  userInitial?: string;
  className?: string;
}

export function NavBar({ items, userInitial = "AD", className }: NavBarProps) {
  const pathname = usePathname();
  const [activeTab, setActiveTab] = useState(items[0]?.name || "");

  // Synchronize active tab with current route on navigation
  useEffect(() => {
    if (!pathname) return;
    const current = items.find((item) => {
      if (item.url === "/dashboard") return pathname === "/dashboard" || pathname === "/";
      if (item.url === "/profile" || item.url === "/settings") return pathname.startsWith("/settings") || pathname.startsWith("/profile");
      if (item.url === "/practice") return pathname.startsWith("/practice") || pathname.startsWith("/learning");
      return pathname.startsWith(item.url);
    });
    if (current) {
      setActiveTab(current.name);
    }
  }, [pathname, items]);

  const isTabActive = (item: NavItem) => {
    if (!pathname) return activeTab === item.name;
    if (item.url === "/dashboard") return pathname === "/dashboard" || pathname === "/";
    if (item.url === "/profile" || item.url === "/settings") return pathname.startsWith("/settings") || pathname.startsWith("/profile");
    if (item.url === "/practice") return pathname.startsWith("/practice") || pathname.startsWith("/learning");
    return pathname.startsWith(item.url);
  };

  return (
    <nav
      aria-label="Mobile Navigation"
      className={cn(
        "fixed bottom-0 inset-x-0 z-40 w-full",
        "bg-white/15 dark:bg-black/25 backdrop-blur-xl backdrop-saturate-160",
        "border-t border-white/30 dark:border-white/10",
        "shadow-[inset_0_1px_1px_rgba(255,255,255,0.4),0_-4px_24px_rgba(0,0,0,0.03)] dark:shadow-[inset_0_1px_1px_rgba(255,255,255,0.1),0_-4px_24px_rgba(0,0,0,0.3)]",
        "pb-[env(safe-area-inset-bottom,0px)]",
        className
      )}
    >
      <div className="flex items-center justify-around w-full max-w-lg mx-auto h-14 sm:h-16 px-1">
        {items.map((item) => {
          const Icon = item.icon;
          const isActive = isTabActive(item);
          const isProfile = item.name.toLowerCase() === "profile" || item.url === "/profile" || item.url === "/settings";

          return (
            <Link
              key={item.name}
              href={item.url}
              onClick={() => setActiveTab(item.name)}
              aria-label={item.name}
              aria-current={isActive ? "page" : undefined}
              className={cn(
                "relative flex-1 h-full flex flex-col items-center justify-center",
                "cursor-pointer select-none py-1",
                "transition-transform duration-150 active:scale-90"
              )}
            >
              {isProfile ? (
                // ── 5th Tab: User Profile Avatar (Instagram-style circular ring) ──
                <div
                  className={cn(
                    "w-7 h-7 rounded-full flex items-center justify-center text-[10.5px] font-black transition-all",
                    isActive
                      ? "ring-2 ring-purple-600 dark:ring-purple-400 ring-offset-2 ring-offset-white dark:ring-offset-[#07090e] bg-purple-600 text-white shadow-xs shadow-purple-600/40"
                      : "bg-purple-100 dark:bg-purple-950/80 text-purple-700 dark:text-purple-300 border border-purple-200/90 dark:border-purple-800/80 hover:border-purple-400"
                  )}
                >
                  <span>{userInitial}</span>
                </div>
              ) : (
                // ── Standard Icon Tab (Home, SkillBits, AI Mentor, Practice) ──
                <div className="relative flex items-center justify-center w-7 h-7">
                  <Icon
                    size={24}
                    strokeWidth={isActive ? 2.5 : 1.9}
                    className={cn(
                      "transition-all duration-200",
                      isActive
                        ? item.url === "/dashboard"
                          ? "fill-purple-600 dark:fill-purple-400 text-purple-600 dark:text-purple-400"
                          : "text-purple-600 dark:text-purple-400 drop-shadow-[0_0_8px_rgba(168,85,247,0.35)]"
                        : "text-slate-600 dark:text-slate-400 hover:text-purple-600 dark:hover:text-purple-300"
                    )}
                  />

                  {/* Optional notification / activity badge */}
                  {item.badge && (
                    <span className="absolute -top-1 -right-1 min-w-[15px] h-[15px] px-1 rounded-full bg-purple-600 text-white text-[9px] font-black flex items-center justify-center ring-2 ring-white dark:ring-[#07090e] shadow-xs">
                      {item.badge}
                    </span>
                  )}
                </div>
              )}

              {/* ── Active Gliding Indicator Dot (Lilac Glow) ── */}
              {isActive && (
                <motion.div
                  layoutId="instagramActiveDot"
                  className="absolute bottom-1.5 w-1 h-1 rounded-full bg-purple-600 dark:bg-purple-400 shadow-[0_0_6px_rgba(168,85,247,0.7)]"
                  transition={{
                    type: "spring",
                    stiffness: 450,
                    damping: 32,
                  }}
                />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

export default NavBar;
