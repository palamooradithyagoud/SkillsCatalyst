"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Film,
  BookOpen,
  Map,
  Target,
  Compass,
  Briefcase,
  Sparkles,
  BarChart3,
  User,
  Headset,
  LogOut,
  Search,
  Command,
  X,
} from "lucide-react";
import { useAuth } from "@/lib/auth";

export type NavItemData = {
  id: string;
  title: string;
  href: string;
  icon: React.ElementType;
  badge?: string;
  onClick?: () => void;
};

export type NavGroupData = {
  heading?: string;
  items: NavItemData[];
};

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { session, isLoading, logout } = useAuth();

  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Keyboard shortcut listener for Command + K (Search) and Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setIsSearchOpen((prev) => !prev);
      } else if (e.key === "Escape") {
        setIsSearchOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  if (pathname === "/login" || isLoading) {
    return null;
  }

  // ── Core Everyday SkillsCatalyst Features ─────────────────────────────────
  const mainItems: NavItemData[] = [
    {
      id: "dashboard",
      title: "Dashboard",
      href: "/dashboard",
      icon: LayoutDashboard,
    },
    {
      id: "skillbits",
      title: "SkillBits",
      href: "/skillbits",
      icon: Film,
      badge: "New",
    },
    {
      id: "learning",
      title: "Learning",
      href: "/learning",
      icon: BookOpen,
    },
    {
      id: "roadmaps",
      title: "Roadmaps",
      href: "/roadmaps",
      icon: Map,
    },
    {
      id: "practice",
      title: "Practice",
      href: "/practice",
      icon: Target,
    },
    {
      id: "explore",
      title: "Explore",
      href: "/explore",
      icon: Compass,
    },
  ];

  // ── Career, Intelligence & Assessment Features ───────────────────────────
  const careerItems: NavItemData[] = [
    {
      id: "career",
      title: "Career Goals",
      href: "/career",
      icon: Briefcase,
    },
    {
      id: "ai-mentor",
      title: "AI Mentor",
      href: "/ai-mentor",
      icon: Sparkles,
      badge: "AI",
    },
    {
      id: "analytics",
      title: "Analytics",
      href: "/analytics",
      icon: BarChart3,
    },
  ];

  // ── Account & Support Features ───────────────────────────────────────────
  const accountItems: NavItemData[] = [
    {
      id: "profile",
      title: "My Profile",
      href: "/settings",
      icon: User,
    },
    {
      id: "support",
      title: "Support Desk",
      href: "/support",
      icon: Headset,
    },
    {
      id: "sign-out",
      title: "Sign Out",
      href: "#",
      icon: LogOut,
      onClick: () => {
        logout();
        router.push("/login");
      },
    },
  ];

  // ── Active item detection logic for actual SkillsCatalyst routes ───────────
  const isItemActive = (item: NavItemData) => {
    if (item.id === "dashboard") {
      return pathname === "/dashboard" || pathname === "/";
    }
    if (item.id === "skillbits") {
      return pathname.startsWith("/skillbits");
    }
    if (item.id === "learning") {
      return pathname.startsWith("/learning");
    }
    if (item.id === "roadmaps") {
      return pathname.startsWith("/roadmaps");
    }
    if (item.id === "practice") {
      return pathname.startsWith("/practice");
    }
    if (item.id === "explore") {
      return pathname.startsWith("/explore");
    }
    if (item.id === "career") {
      return pathname.startsWith("/career");
    }
    if (item.id === "ai-mentor") {
      return pathname.startsWith("/ai-mentor");
    }
    if (item.id === "analytics") {
      return pathname.startsWith("/analytics");
    }
    if (item.id === "profile") {
      return pathname.startsWith("/settings") || pathname.startsWith("/profile");
    }
    if (item.id === "support") {
      return pathname.startsWith("/support");
    }
    return pathname === item.href;
  };

  const renderNavItem = (item: NavItemData) => {
    const isActive = isItemActive(item);
    const IconComponent = item.icon;

    return (
      <Link
        key={item.id}
        href={item.href}
        onClick={(e) => {
          if (item.onClick) {
            e.preventDefault();
            item.onClick();
          }
        }}
        className={`group relative flex items-center justify-between px-4 py-2.5 text-[14px] transition-colors select-none ${
          isActive
            ? "bg-[#ECEEF2] dark:bg-slate-800 text-slate-900 dark:text-white font-bold"
            : "text-slate-700 dark:text-slate-300 font-medium hover:bg-slate-50 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-white"
        }`}
      >
        <div className="flex items-center gap-3.5 min-w-0">
          {/* PURPLE active stripe indicator on left edge (no pink) */}
          {isActive && (
            <span className="absolute left-0 top-0 bottom-0 w-[4.5px] bg-[#7E22CE] dark:bg-purple-500" />
          )}

          <IconComponent
            className={`w-[18px] h-[18px] shrink-0 transition-colors ${
              isActive
                ? "text-slate-900 dark:text-white"
                : "text-slate-800 dark:text-slate-300 group-hover:text-slate-900 dark:group-hover:text-white"
            }`}
            strokeWidth={isActive ? 2 : 1.8}
          />

          <span className="truncate tracking-[-0.01em]">{item.title}</span>
        </div>

        {item.badge && (
          <span
            className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md shrink-0 uppercase tracking-wider ${
              item.badge === "AI"
                ? "bg-purple-100 dark:bg-purple-900/60 text-purple-700 dark:text-purple-300"
                : "bg-slate-200/80 dark:bg-slate-700 text-slate-700 dark:text-slate-300"
            }`}
          >
            {item.badge}
          </span>
        )}
      </Link>
    );
  };

  return (
    <>
      <aside
        className="hidden md:flex flex-col h-[calc(100vh-3.5rem)] sticky top-14 z-30 shrink-0 w-[240px] bg-white dark:bg-slate-900 border-r border-slate-200/90 dark:border-slate-800 select-none"
      >

        {/* ── Scrollable Navigation Items List (no scrollbars visible) ── */}
        <div className="flex-1 overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] py-1 flex flex-col">
          {/* Main Top Items: Dashboard, SkillBits, Learning, Roadmaps, Practice, Explore */}
          <div className="flex flex-col">
            {mainItems.map((item) => renderNavItem(item))}
          </div>

          {/* Divider Line */}
          <div className="my-2 mx-4 border-b border-slate-200 dark:border-slate-800" />

          {/* CAREER & TOOLS Section Header */}
          <div className="px-4 pt-2 pb-1 text-[11px] font-black tracking-wider text-slate-900 dark:text-slate-200 uppercase">
            CAREER & INTELLIGENCE
          </div>

          {/* Career Items: Career Goals, AI Mentor, Analytics */}
          <div className="flex flex-col">
            {careerItems.map((item) => renderNavItem(item))}
          </div>

          {/* Divider Line */}
          <div className="my-2 mx-4 border-b border-slate-200 dark:border-slate-800" />

          {/* ACCOUNT Section Header */}
          <div className="px-4 pt-2 pb-1 text-[11px] font-black tracking-wider text-slate-900 dark:text-slate-200 uppercase">
            ACCOUNT
          </div>

          {/* Account Items: My Profile, Support Desk, Sign Out */}
          <div className="flex flex-col pb-3">
            {accountItems.map((item) => renderNavItem(item))}
          </div>
        </div>
      </aside>

      {/* ── Quick Search Modal (Command + K) ── */}
      {isSearchOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-[14vh] bg-slate-900/40 backdrop-blur-xs px-4">
          <div className="fixed inset-0" onClick={() => setIsSearchOpen(false)} />
          <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden z-10 flex flex-col animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center px-4 py-3.5 border-b border-slate-200 dark:border-slate-800 gap-3">
              <Search className="w-5 h-5 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search SkillsCatalyst roadmaps, practice, resume builder..."
                autoFocus
                className="flex-1 bg-transparent text-sm text-slate-900 dark:text-white placeholder:text-slate-400 outline-none"
              />
              <button
                onClick={() => setIsSearchOpen(false)}
                className="p-1 rounded-md text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="max-h-72 overflow-y-auto p-2 space-y-1">
              {[...mainItems, ...careerItems, ...accountItems]
                .filter((item) =>
                  item.title.toLowerCase().includes(searchQuery.toLowerCase())
                )
                .map((item) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        setIsSearchOpen(false);
                        if (item.onClick) {
                          item.onClick();
                        } else {
                          router.push(item.href);
                        }
                      }}
                      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-purple-50 dark:hover:bg-purple-950/40 hover:text-purple-700 dark:hover:text-purple-300 text-left text-sm font-medium text-slate-700 dark:text-slate-300 transition-colors"
                    >
                      <Icon className="w-4 h-4 text-slate-500" />
                      <span>{item.title}</span>
                    </button>
                  );
                })}
            </div>

            <div className="px-4 py-2 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-200 dark:border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
              <span>Use ESC or click outside to dismiss</span>
              <span className="flex items-center gap-1 font-mono">
                <Command className="w-3 h-3" /> K Navigator
              </span>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
