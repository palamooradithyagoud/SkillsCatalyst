"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Home,
  Clapperboard,
  LayoutGrid,
  Map,
  Target,
  Briefcase,
  Sparkles,
  BarChart3,
  Code2,
  Flame,
  Zap,
  ChevronRight,
  User,
  Search,
  Bell,
  LifeBuoy,
  GraduationCap,
  Newspaper,
  Calendar,
  BookOpen,
  Compass,
  Film,
  Bot,
  ListTodo,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

import { useAuth } from "@/lib/auth";
import BookIcon from "@/components/icons/BookIcon";
import UserIcon from "@/components/icons/UserIcon";
import ExploreIcon from "@/components/icons/ExploreIcon";
import Home3DIcon from "@/components/icons/Home3DIcon";
import SkillsCatalystLogo from "@/components/SkillsCatalystLogo";
import ThreeDSquircleTile from "@/components/ThreeDSquircleTile";
import CareerDownbar from "@/components/career/CareerDownbar";
import ProfileDownbar from "@/components/profile/ProfileDownbar";
import DashboardMobileDock from "@/components/dashboard/DashboardMobileDock";
import { useNotifications } from "@/contexts/NotificationContext";
import NotificationPanel from "@/components/notifications/NotificationPanel";

const navItems = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutGrid, desc: "Overview & metrics" },
  { name: "To-Do List", href: "/tasks", icon: ListTodo, desc: "Personal study & task checklist" },
  { name: "SkillBits", href: "/skillbits", icon: Film, desc: "Bite-sized video reels" },
  { name: "Learning", href: "/learning", icon: BookIcon, desc: "Playlists & learning tracks" },
  { name: "Roadmaps", href: "/roadmaps", icon: Map, desc: "Interactive career tracks" },
  { name: "Practice", href: "/practice", icon: Target, desc: "Aptitude & company questions" },
  { name: "Career", href: "/career", icon: Briefcase, desc: "AI resume analysis" },
  { name: "Explore", href: "/explore", icon: ExploreIcon, desc: "Trending skills & tools" },
  { name: "Analytics", href: "/analytics", icon: BarChart3, desc: "Detailed performance" },
  { name: "Support & Help", href: "/support", icon: LifeBuoy, desc: "Customer desk & policies" },
  { name: "Profile", href: "/profile", icon: UserIcon, desc: "Account & settings" },
];

const bottomBarItems = [
  { name: "Home", href: "/dashboard", icon: LayoutGrid },
  { name: "SkillBits", href: "/skillbits", icon: Film },
  { name: "Learn", href: "/learning", icon: BookIcon },
  { name: "AI Mentor", href: "/ai-mentor", icon: Bot },
  { name: "Practice", href: "/practice", icon: Target },
  { name: "Explore", href: "/explore", icon: ExploreIcon },
];

const exploreBottomBarItems = [
  { id: "events", name: "Events", icon: Calendar },
  { id: "scholarships", name: "Scholarships", icon: GraduationCap },
  { id: "news", name: "News", icon: Newspaper },
  { id: "trending", name: "Trending", icon: Flame },
];

// Pale light pastel palette (Blue, Yellow, Pink) — zero glass, zero purple
function getPaleAvatarTheme(initial: string) {
  const code = (initial || "U").split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const palettes = [
    {
      bg: "bg-[#FEF9C3] hover:bg-[#FEF08A]",
      text: "text-[#854D0E]",
      border: "border-[#FDE047]/80",
    }, // Pale Yellow
    {
      bg: "bg-[#E0F2FE] hover:bg-[#BAE6FD]",
      text: "text-[#0369A1]",
      border: "border-[#BAE6FD]",
    }, // Pale Blue
    {
      bg: "bg-[#FCE7F3] hover:bg-[#FBCFE8]",
      text: "text-[#9D174D]",
      border: "border-[#FBCFE8]",
    }, // Pale Pink
  ];
  return palettes[code % palettes.length];
}

function MobileNavContent() {
  const pathname = usePathname();
  const router = useRouter();
  const { session, isLoading } = useAuth();
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const { unreadCount } = useNotifications();
  const [isPracticeSubView, setIsPracticeSubView] = useState(false);
  const [isLearningPlayer, setIsLearningPlayer] = useState(false);
  const [isRoadmapDetail, setIsRoadmapDetail] = useState(false);
  const [isResumeActive, setIsResumeActive] = useState(false);
  const [exploreTab, setExploreTab] = useState<string>("trending");
  const [isExplicitlyHidden, setIsExplicitlyHidden] = useState(false);
  const [isHideAppBars, setIsHideAppBars] = useState(false);

  useEffect(() => {
    setIsNotificationOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (typeof window !== "undefined" && window.location.pathname === "/explore") {
      const params = new URLSearchParams(window.location.search);
      const tab = params.get("tab");
      if (tab && ["events", "scholarships", "news", "trending"].includes(tab)) {
        setExploreTab(tab);
      }
    }
  }, [pathname]);

  useEffect(() => {
    const checkAttributes = () => {
      if (typeof document !== "undefined") {
        setIsPracticeSubView(document.body.hasAttribute("data-practice-subview"));
        setIsLearningPlayer(document.body.hasAttribute("data-learning-player"));
        setIsRoadmapDetail(
          document.body.hasAttribute("data-roadmap-detail") ||
          document.body.hasAttribute("data-roadmap-active")
        );
        setIsResumeActive(
          document.body.hasAttribute("data-resume-active") ||
          document.body.hasAttribute("data-resume-workspace")
        );
        setIsExplicitlyHidden(document.body.hasAttribute("data-hide-bottombar"));
        setIsHideAppBars(document.body.hasAttribute("data-hide-appbars"));
        const tabAttr = document.body.getAttribute("data-explore-tab");
        if (tabAttr && tabAttr !== exploreTab) {
          setExploreTab(tabAttr);
        }
      }
    };
    checkAttributes();

    // Use zero-polling MutationObserver instead of a continuous 150ms setInterval
    let observer: MutationObserver | null = null;
    if (typeof MutationObserver !== "undefined" && typeof document !== "undefined") {
      observer = new MutationObserver(checkAttributes);
      observer.observe(document.body, {
        attributes: true,
        attributeFilter: [
          "data-practice-subview",
          "data-learning-player",
          "data-roadmap-detail",
          "data-roadmap-active",
          "data-resume-active",
          "data-resume-workspace",
          "data-hide-bottombar",
          "data-hide-appbars",
          "data-explore-tab",
        ],
      });
    }

    const handleExploreTabChange = (e: any) => {
      if (e.detail && typeof e.detail === "string") {
        setExploreTab(e.detail);
      }
    };
    window.addEventListener("explore-tab-change", handleExploreTabChange);

    return () => {
      if (observer) observer.disconnect();
      window.removeEventListener("explore-tab-change", handleExploreTabChange);
    };
  }, [pathname, exploreTab]);

  if (pathname === "/login") {
    return null;
  }

  const userEmail = session?.email || "Guest User";
  const userInitial = session?.name
    ? session.name.split(" ").map((n: string) => n[0]).join("").slice(0, 2).toUpperCase()
    : userEmail.split("@")[0].substring(0, 2).toUpperCase() || "PA";
  const avatarTheme = getPaleAvatarTheme(userInitial);

  const isDashboard = pathname === "/dashboard" || pathname === "/";

  const isProfile = pathname === "/profile";

  const isCareerGroup =
    pathname.startsWith("/career") ||
    pathname.startsWith("/roadmaps") ||
    pathname.startsWith("/learning") ||
    pathname.startsWith("/practice") ||
    pathname.startsWith("/analytics");

  const isProfileGroup =
    pathname.startsWith("/profile") ||
    pathname.startsWith("/settings");

  // Hide standard bottom navigation bar inside explore (which has dedicated explore dock),
  // career group (which has dedicated CareerDownbar dock), profile suite (which has dedicated ProfileDownbar),
  // active video player, practice subviews, roadmap detail view, resume active scan/workspace, SkillBits reels
  const isHideBottomBar =
    isExplicitlyHidden ||
    isRoadmapDetail ||
    isResumeActive ||
    pathname.startsWith("/explore") ||
    isCareerGroup ||
    isProfileGroup ||
    pathname.startsWith("/skillbits") ||
    (pathname === "/learning" && isLearningPlayer) ||
    (pathname === "/practice" && isPracticeSubView) ||
    pathname.startsWith("/settings/edit") ||
    pathname.startsWith("/profile/edit");

  return (
    <>
      {/* ── Mobile Native Top App Bar (Hidden on full-screen SkillBits reels or when explicitly hidden) ── */}
      {!pathname.startsWith("/skillbits") && !isHideAppBars && (
        <header className="md:hidden fixed top-0 inset-x-0 z-30 h-14 flex items-center justify-between px-4 bg-white/15 dark:bg-black/25 border-b border-white/30 dark:border-white/10 backdrop-blur-xl backdrop-saturate-160 text-slate-900 dark:text-white transition-all duration-200 shadow-[inset_0_-1px_1px_rgba(255,255,255,0.4),0_4px_30px_rgba(0,0,0,0.03)] dark:shadow-[inset_0_-1px_1px_rgba(255,255,255,0.1),0_4px_30px_rgba(0,0,0,0.3)]">
          <div className="flex items-center gap-2">
            <Link href="/dashboard" className="flex items-center">
              <SkillsCatalystLogo size="sm" showText={false} animated />
            </Link>
          </div>

          <div className="flex items-center gap-3 sm:gap-4">
            {/* Notification Bell Button & Dropdown */}
            <div className="relative mr-1.5 sm:mr-2">
              <button
                type="button"
                id="mobile-notifications-button"
                onClick={() => {
                  router.push("/notifications");
                }}
                aria-label="Open notifications"
                className="relative w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center transition-all active:scale-90 cursor-pointer text-slate-600 hover:text-slate-900 dark:text-neutral-300 dark:hover:text-white"
              >
                <Bell size={21} strokeWidth={2} className="transition-transform active:rotate-12" />
                {unreadCount > 0 && (
                  <span className="absolute top-0.5 right-0.5 flex items-center justify-center min-w-[16px] h-[16px] px-1 text-[9px] font-bold text-white bg-rose-500 rounded-full ring-1.5 ring-white dark:ring-black shadow-xs">
                    {unreadCount > 99 ? "99+" : unreadCount}
                  </span>
                )}
              </button>

              <NotificationPanel
                isOpen={false}
                onClose={() => {}}
                align="mobile"
              />
            </div>

            {/* User's Profile Avatar (Solid Pale Colored Icon: Blue, Yellow, Pink - Zero Glass, Zero Purple) */}
            <button
              type="button"
              onClick={() => router.push("/profile")}
              aria-label="User Profile"
              className={`w-9 h-9 sm:w-10 sm:h-10 rounded-[10px] ${avatarTheme.bg} ${avatarTheme.text} border ${avatarTheme.border} flex items-center justify-center font-black text-xs sm:text-sm shadow-xs transition-all active:scale-95 cursor-pointer`}
            >
              <span>{userInitial}</span>
            </button>
          </div>
        </header>
      )}

      {/* ── Career & Placement Suite Downbar Dock (Roadmaps, Learn, Practice, Resume Prep, Interview) ── */}
      {isCareerGroup &&
        !isLearningPlayer &&
        !isPracticeSubView &&
        !isRoadmapDetail &&
        !isResumeActive &&
        !isExplicitlyHidden && (
          <CareerDownbar className="md:hidden" />
        )}

      {/* ── Profile Suite Downbar Dock (Matches Image 2: Back, My Profile, Edit Profile, Settings) ── */}
      {isProfileGroup && !isResumeActive && !isExplicitlyHidden && (
        <ProfileDownbar className="md:hidden" />
      )}

      {/* ── Mobile Floating Pill Dock (Universal Modern Dock: Replaces old navbar completely) ── */}
      {!isHideBottomBar && !isCareerGroup && !isProfileGroup && (
        <DashboardMobileDock className="md:hidden" />
      )}
    </>
  );
}

export default function MobileNav() {
  return (
    <Suspense fallback={null}>
      <MobileNavContent />
    </Suspense>
  );
}
