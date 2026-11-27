"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  LayoutDashboard,
  Calendar,
  GraduationCap,
  Newspaper,
  Flame,
  Bot,
  User,
  Headset,
  LogOut,
  Search,
  Command,
  X,
  ListTodo,
  FileText,
  Calculator,
  BrainCircuit,
  Languages,
  Video,
} from "lucide-react";
import { useAuth } from "@/lib/auth";
import { SidebarProvider } from "@/components/ui/sidebar";
import AnalyticsIcon from "@/components/icons/AnalyticsIcon";
import LearnIcon from "@/components/icons/LearnIcon";
import SkillBitsIcon from "@/components/icons/SkillBitsIcon";
import RoadmapsIcon from "@/components/icons/RoadmapsIcon";
import PracticeIcon from "@/components/icons/PracticeIcon";

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

  const [open, setOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentExploreTab, setCurrentExploreTab] = useState<string>("events");
  const [currentCareerPrep, setCurrentCareerPrep] = useState<string>("");

  useEffect(() => {
    if (typeof window !== "undefined") {
      if (pathname === "/explore") {
        const params = new URLSearchParams(window.location.search);
        setCurrentExploreTab(params.get("tab") || "events");
      }
      if (pathname === "/career") {
        const params = new URLSearchParams(window.location.search);
        setCurrentCareerPrep(params.get("prep") || params.get("category") || "");
      } else {
        setCurrentCareerPrep("");
      }
    }
  }, [pathname]);

  useEffect(() => {
    const handleExploreTabChange = (e: any) => {
      if (e.detail && typeof e.detail === "string") {
        setCurrentExploreTab(e.detail);
      }
    };
    const handleCareerPrepChange = (e: any) => {
      if (e.detail && typeof e.detail === "string") {
        setCurrentCareerPrep(e.detail);
      }
    };
    window.addEventListener("explore-tab-change", handleExploreTabChange);
    window.addEventListener("career-prep-change", handleCareerPrepChange);
    return () => {
      window.removeEventListener("explore-tab-change", handleExploreTabChange);
      window.removeEventListener("career-prep-change", handleCareerPrepChange);
    };
  }, []);

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

  // ── Block 1: Main Everyday Features ───────────────────────────────────────
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
      icon: SkillBitsIcon,
    },
    {
      id: "events",
      title: "Events",
      href: "/explore?tab=events",
      icon: Calendar,
    },
    {
      id: "scholarships",
      title: "Scholarships",
      href: "/explore?tab=scholarships",
      icon: GraduationCap,
    },
    {
      id: "news",
      title: "Tech News",
      href: "/explore?tab=news",
      icon: Newspaper,
    },
    {
      id: "trending",
      title: "Trending",
      href: "/explore?tab=trending",
      icon: Flame,
    },
    {
      id: "ai-mentor",
      title: "AI Mentor",
      href: "/ai-mentor",
      icon: Bot,
    },
    {
      id: "tasks",
      title: "To-Do List",
      href: "/tasks",
      icon: ListTodo,
    },
    {
      id: "analytics",
      title: "Analytics",
      href: "/analytics",
      icon: AnalyticsIcon,
    },
  ];

  // ── Block 2: Career, Learning & Assessment Features ───────────────────────
  const careerItems: NavItemData[] = [
    {
      id: "learning",
      title: "Learn",
      href: "/learning",
      icon: LearnIcon,
    },
    {
      id: "roadmaps",
      title: "Roadmaps",
      href: "/roadmaps",
      icon: RoadmapsIcon,
    },
    {
      id: "practice",
      title: "Practice",
      href: "/practice",
      icon: PracticeIcon,
    },
    {
      id: "resume-prep",
      title: "Resume Prep",
      href: "/career/resume-review",
      icon: FileText,
    },
    {
      id: "aptitude",
      title: "Aptitude",
      href: "/career?prep=aptitude",
      icon: Calculator,
    },
    {
      id: "reasoning",
      title: "Reasoning",
      href: "/career?prep=reasoning",
      icon: BrainCircuit,
    },
    {
      id: "verbal-ability",
      title: "Verbal Ability",
      href: "/career?prep=verbal",
      icon: Languages,
    },
    {
      id: "ai-interviews",
      title: "AI Interviews",
      href: "/career?prep=interviews",
      icon: Video,
    },
  ];

  // ── Account & Support Features ───────────────────────────────────────────
  const accountItems: NavItemData[] = [
    {
      id: "profile",
      title: "My Profile",
      href: "/profile",
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
    if (item.id === "events") {
      return pathname === "/explore" && (currentExploreTab === "events" || !currentExploreTab);
    }
    if (item.id === "scholarships") {
      return pathname === "/explore" && currentExploreTab === "scholarships";
    }
    if (item.id === "news") {
      return pathname === "/explore" && currentExploreTab === "news";
    }
    if (item.id === "trending") {
      return pathname === "/explore" && currentExploreTab === "trending";
    }
    if (item.id === "ai-mentor") {
      return pathname.startsWith("/ai-mentor");
    }
    if (item.id === "tasks") {
      return pathname.startsWith("/tasks");
    }
    if (item.id === "analytics") {
      return pathname.startsWith("/analytics");
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
    if (item.id === "resume-prep") {
      return pathname.startsWith("/career/resume");
    }
    if (item.id === "aptitude") {
      return pathname === "/career" && currentCareerPrep.toLowerCase().includes("aptitude");
    }
    if (item.id === "reasoning") {
      return pathname === "/career" && currentCareerPrep.toLowerCase().includes("reason");
    }
    if (item.id === "verbal-ability") {
      return pathname === "/career" && currentCareerPrep.toLowerCase().includes("verbal");
    }
    if (item.id === "ai-interviews") {
      return pathname === "/career" && currentCareerPrep.toLowerCase().includes("interview");
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
        title={!open ? item.title : undefined}
        onClick={(e) => {
          if (item.onClick) {
            e.preventDefault();
            item.onClick();
          } else if (item.href.startsWith("/explore")) {
            const tab = item.id;
            setCurrentExploreTab(tab);
            if (typeof window !== "undefined") {
              window.dispatchEvent(
                new CustomEvent("explore-tab-change", { detail: tab })
              );
            }
          } else if (item.href.includes("prep=")) {
            const prep = item.href.split("prep=")[1] || "";
            setCurrentCareerPrep(prep);
            if (typeof window !== "undefined") {
              window.dispatchEvent(
                new CustomEvent("career-prep-change", { detail: prep })
              );
            }
          }
        }}
        className={`group relative flex items-center justify-between px-5 py-2 text-[13.5px] transition-colors select-none ${
          isActive
            ? "bg-[#ECEEF2] dark:bg-neutral-900 text-slate-900 dark:text-white font-bold"
            : "text-slate-700 dark:text-neutral-400 font-medium hover:bg-[#D5FF38] dark:hover:bg-[#D5FF38] hover:text-black dark:hover:text-black active:bg-[#D5FF38]/20 dark:active:bg-[#D5FF38]/20"
        }`}
      >
        <div className="flex items-center gap-3 min-w-0">
          {/* ACID LIME active stripe indicator on left edge */}
          {isActive && (
            <span className="absolute left-0 top-0 bottom-0 w-[4px] bg-[#D5FF38] dark:bg-[#D5FF38]" />
          )}

          <IconComponent
            className={`w-[17px] h-[17px] shrink-0 transition-colors ${
              isActive
                ? "text-slate-900 dark:text-white"
                : "text-slate-800 dark:text-neutral-400 group-hover:text-black dark:group-hover:text-black"
            }`}
            strokeWidth={isActive ? 2 : 1.8}
          />

          <motion.span
            animate={{
              display: open ? "inline-block" : "none",
              opacity: open ? 1 : 0,
            }}
            transition={{ duration: 0.15 }}
            className="truncate tracking-[-0.01em] whitespace-nowrap"
          >
            {item.title}
          </motion.span>
        </div>

        {item.badge && (
          <motion.span
            animate={{
              display: open ? "inline-block" : "none",
              opacity: open ? 1 : 0,
            }}
            transition={{ duration: 0.15 }}
            className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md shrink-0 uppercase tracking-wider transition-colors ${
              item.badge === "AI"
                ? "bg-[#D5FF38]/20 text-[#D5FF38] border border-[#D5FF38]/40"
                : "bg-slate-200/80 dark:bg-neutral-800 text-slate-700 dark:text-neutral-300 group-hover:bg-black/10 group-hover:text-black dark:group-hover:bg-black/20 dark:group-hover:text-black"
            }`}
          >
            {item.badge}
          </motion.span>
        )}
      </Link>
    );
  };

  return (
    <SidebarProvider open={open} setOpen={setOpen} animate={true}>
      <motion.aside
        className="hidden md:flex flex-col h-[calc(100vh-3.5rem)] sticky top-14 z-30 shrink-0 bg-white dark:bg-black border-r border-slate-200/90 dark:border-neutral-800 select-none overflow-x-hidden"
        animate={{
          width: open ? "240px" : "60px",
        }}
        transition={{
          duration: 0.25,
          ease: [0.22, 1, 0.36, 1],
        }}
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
      >
        {/* ── Scrollable Navigation Items List (no scrollbars visible) ── */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] py-1 flex flex-col">
          {/* Main Top Items: Dashboard, To-Do List, SkillBits, Learning, Roadmaps, Practice, Explore */}
          <div className="flex flex-col">
            {mainItems.map((item) => renderNavItem(item))}
          </div>

          {/* Divider Line */}
          <div className="my-1.5 mx-3 border-b border-slate-200/80 dark:border-neutral-800" />

          {/* CAREER Section Header */}
          <motion.div
            animate={{
              display: open ? "block" : "none",
              opacity: open ? 1 : 0,
            }}
            transition={{ duration: 0.15 }}
            className="px-5 pt-2 pb-0.5 text-[10.5px] font-black tracking-wider text-slate-400 dark:text-neutral-500 uppercase whitespace-nowrap"
          >
            CAREER
          </motion.div>

          {/* Career Items */}
          <div className="flex flex-col">
            {careerItems.map((item) => renderNavItem(item))}
          </div>

          {/* Divider Line */}
          <div className="my-1.5 mx-3 border-b border-slate-200/80 dark:border-neutral-800" />

          {/* ACCOUNT Section Header */}
          <motion.div
            animate={{
              display: open ? "block" : "none",
              opacity: open ? 1 : 0,
            }}
            transition={{ duration: 0.15 }}
            className="px-5 pt-2 pb-0.5 text-[10.5px] font-black tracking-wider text-slate-400 dark:text-neutral-500 uppercase whitespace-nowrap"
          >
            ACCOUNT
          </motion.div>

          {/* Account Items: My Profile, Support Desk, Sign Out */}
          <div className="flex flex-col pb-3">
            {accountItems.map((item) => renderNavItem(item))}
          </div>
        </div>
      </motion.aside>

      {/* ── Quick Search Modal (Command + K) ── */}
      {isSearchOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-[14vh] bg-slate-900/60 dark:bg-black/80 backdrop-blur-xs px-4">
          <div className="fixed inset-0" onClick={() => setIsSearchOpen(false)} aria-hidden="true" />
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Quick Search"
            className="relative w-full max-w-lg bg-white dark:bg-black rounded-2xl shadow-2xl border border-slate-200 dark:border-neutral-800 overflow-hidden z-10 flex flex-col animate-in fade-in zoom-in-95 duration-150"
          >
            <div className="flex items-center px-4 py-3.5 border-b border-slate-200 dark:border-neutral-800 gap-3">
              <Search className="w-5 h-5 text-slate-400" />
              <input
                id="sidebar-quick-search-input"
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search SkillsCatalyst roadmaps, practice, resume builder..."
                aria-label="Search SkillsCatalyst roadmaps, practice, resume builder"
                autoFocus
                className="flex-1 bg-transparent text-sm text-slate-900 dark:text-white placeholder:text-slate-400 outline-none"
              />
              <button
                onClick={() => setIsSearchOpen(false)}
                aria-label="Close search"
                className="p-1 rounded-md text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
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
                      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-[#D5FF38]/15 dark:hover:bg-[#D5FF38]/15 hover:text-black dark:hover:text-[#D5FF38] text-left text-sm font-medium text-slate-700 dark:text-neutral-300 transition-colors"
                    >
                      <Icon className="w-4 h-4 text-slate-500" />
                      <span>{item.title}</span>
                    </button>
                  );
                })}
            </div>

            <div className="px-4 py-2 bg-slate-50 dark:bg-neutral-950 border-t border-slate-200 dark:border-neutral-800 text-[11px] text-slate-400 flex items-center justify-between">
              <span>Use ESC or click outside to dismiss</span>
              <span className="flex items-center gap-1 font-mono">
                <Command className="w-3 h-3" /> K Navigator
              </span>
            </div>
          </div>
        </div>
      )}
    </SidebarProvider>
  );
}
