"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export interface NavItem {
  name: string;
  url: string;
  icon: LucideIcon | React.ComponentType<any>;
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
      if (item.name === "Career" || item.url === "/career" || item.url === "/roadmaps") {
        return (
          pathname.startsWith("/career") ||
          pathname.startsWith("/roadmaps") ||
          pathname.startsWith("/learning") ||
          pathname.startsWith("/practice") ||
          pathname.startsWith("/analytics")
        );
      }
      if (item.url === "/explore") return pathname.startsWith("/explore");
      if (item.url === "/skillbits") return pathname.startsWith("/skillbits");
      if (item.url === "/ai-mentor") return pathname.startsWith("/ai-mentor");
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
    if (item.name === "Career" || item.url === "/career" || item.url === "/roadmaps") {
      return (
        pathname.startsWith("/career") ||
        pathname.startsWith("/roadmaps") ||
        pathname.startsWith("/learning") ||
        pathname.startsWith("/practice") ||
        pathname.startsWith("/analytics")
      );
    }
    if (item.url === "/explore") return pathname.startsWith("/explore");
    if (item.url === "/skillbits") return pathname.startsWith("/skillbits");
    if (item.url === "/ai-mentor") return pathname.startsWith("/ai-mentor");
    if (item.url === "/practice") return pathname.startsWith("/practice") || pathname.startsWith("/learning");
    return pathname.startsWith(item.url);
  };

  return (
    <nav
      aria-label="Mobile Navigation"
      data-bottom-nav="true"
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
              <div className="relative flex items-center justify-center w-7 h-7">
                {item.name === "Home" ? (
                  <Icon
                    size={22}
                    strokeWidth={isActive ? 2.5 : 1.9}
                    active={isActive}
                    className={cn(
                      "transition-all duration-200",
                      isActive
                        ? "text-[#D5FF38] fill-transparent"
                        : "text-slate-600 dark:text-slate-400 hover:text-white fill-transparent"
                    )}
                  />
                ) : (
                  <Icon
                    size={22}
                    strokeWidth={isActive ? 2.5 : 1.9}
                    className={cn(
                      "transition-all duration-200",
                      isActive
                        ? "text-[#D5FF38] fill-transparent"
                        : "text-slate-600 dark:text-slate-400 hover:text-white fill-transparent"
                    )}
                  />
                )}

                {/* Optional notification / activity badge */}
                {item.badge && (
                  <span className="absolute -top-1 -right-1 min-w-[15px] h-[15px] px-1 rounded-full bg-[#D5FF38] text-black text-[9px] font-black flex items-center justify-center ring-2 ring-white dark:ring-[#10110E] shadow-xs">
                    {item.badge}
                  </span>
                )}
              </div>

              {/* ── Active Gliding Indicator Dot (Acid Lime, No Glow) ── */}
              {isActive && (
                <motion.div
                  layoutId="instagramActiveDot"
                  className="absolute bottom-1.5 w-1 h-1 rounded-full bg-[#D5FF38]"
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
