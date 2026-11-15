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
  Menu,
  X,
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
import SkillsCatalystLogo from "@/components/SkillsCatalystLogo";
import ThreeDSquircleTile from "@/components/ThreeDSquircleTile";
import { NavBar, type NavItem } from "@/components/ui/tubelight-navbar";
import { Component as SterlingGateKineticNavigation } from "@/components/ui/sterling-gate-kinetic-navigation";
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

const mobileNavItems: NavItem[] = [
  { name: "Home", url: "/dashboard", icon: Home },
  { name: "SkillBits", url: "/skillbits", icon: Clapperboard },
  { name: "Explore", url: "/explore", icon: Compass },
  { name: "AI Mentor", url: "/ai-mentor", icon: Bot },
  { name: "Practice & Learn", url: "/practice", icon: Target },
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
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const { unreadCount } = useNotifications();
  const [isPracticeSubView, setIsPracticeSubView] = useState(false);
  const [isLearningPlayer, setIsLearningPlayer] = useState(false);
  const [exploreTab, setExploreTab] = useState<string>("trending");
  const [isExplicitlyHidden, setIsExplicitlyHidden] = useState(false);

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
        setIsExplicitlyHidden(document.body.hasAttribute("data-hide-bottombar"));
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
          "data-hide-bottombar",
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

  if (pathname === "/login" || isLoading || !session) {
    return null;
  }

  const userEmail = session?.email || "Guest User";
  const userInitial = userEmail.split("@")[0].substring(0, 2).toUpperCase() || "AD";
  const avatarTheme = getPaleAvatarTheme(userInitial);

  // Hide bottom navigation bar inside active video player, practice subviews, roadmaps, edit profile page, SkillBits reels, or career page
  const isHideBottomBar =
    isExplicitlyHidden ||
    pathname.startsWith("/career") ||
    pathname.startsWith("/skillbits") ||
    (pathname === "/learning" && isLearningPlayer) ||
    (pathname === "/practice" && isPracticeSubView) ||
    pathname.startsWith("/roadmaps") ||
    pathname.startsWith("/settings/edit") ||
    pathname.startsWith("/profile/edit");

  return (
    <>
      {/* ── Mobile Native Top App Bar (Hidden on full-screen SkillBits reels) ── */}
      {!pathname.startsWith("/skillbits") && (
        <header className="md:hidden fixed top-0 inset-x-0 z-30 h-14 flex items-center justify-between px-4 bg-white/15 dark:bg-black/25 border-b border-white/30 dark:border-white/10 backdrop-blur-xl backdrop-saturate-160 text-slate-900 dark:text-white transition-all duration-200 shadow-[inset_0_-1px_1px_rgba(255,255,255,0.4),0_4px_30px_rgba(0,0,0,0.03)] dark:shadow-[inset_0_-1px_1px_rgba(255,255,255,0.1),0_4px_30px_rgba(0,0,0,0.3)]">
          <div className="flex items-center gap-2">
            <Link href="/dashboard" className="flex items-center">
              <SkillsCatalystLogo size="sm" showText={false} animated />
            </Link>
          </div>

          <div className="flex items-center gap-2">
            {/* Notification Bell Button & Dropdown */}
            <div className="relative">
              <button
                type="button"
                id="mobile-notifications-button"
                onClick={() => {
                  setIsNotificationOpen(!isNotificationOpen);
                  setDrawerOpen(false);
                }}
                aria-label="Open notifications"
                className={`relative w-9 h-9 sm:w-10 sm:h-10 rounded-2xl border backdrop-blur-xl flex items-center justify-center shadow-xs transition-all active:scale-95 cursor-pointer ${
                  isNotificationOpen
                    ? "bg-[#D5FF38]/20 text-black dark:text-[#D5FF38] border-[#D5FF38]/40"
                    : "bg-white/20 hover:bg-white/35 dark:bg-white/10 dark:hover:bg-white/15 border-white/40 dark:border-white/15 text-slate-800 dark:text-slate-100 shadow-[inset_0_1px_1px_rgba(255,255,255,0.4)]"
                }`}
              >
                <Bell size={18} strokeWidth={2.2} className="transition-transform active:rotate-12" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 flex items-center justify-center min-w-[18px] h-[18px] px-1 text-[10px] font-bold text-white bg-rose-500 rounded-full ring-2 ring-white dark:ring-slate-900 shadow-xs">
                    {unreadCount > 99 ? "99+" : unreadCount}
                  </span>
                )}
              </button>

              <NotificationPanel
                isOpen={isNotificationOpen}
                onClose={() => setIsNotificationOpen(false)}
                align="mobile"
              />
            </div>

            {/* User's Profile Avatar (Solid Pale Colored Icon: Blue, Yellow, Pink - Zero Glass, Zero Purple) */}
            <button
              type="button"
              onClick={() => router.push("/profile")}
              aria-label="User Profile"
              className={`w-9 h-9 sm:w-10 sm:h-10 rounded-2xl ${avatarTheme.bg} ${avatarTheme.text} border ${avatarTheme.border} flex items-center justify-center font-black text-xs sm:text-sm shadow-xs transition-all active:scale-95 cursor-pointer`}
            >
              <span>{userInitial}</span>
            </button>

            {/* Menu Drawer Toggle Button */}
            <button
              type="button"
              onClick={() => {
                setDrawerOpen(!drawerOpen);
                setIsNotificationOpen(false);
              }}
              aria-label="Toggle Menu"
              className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-white/20 hover:bg-white/35 dark:bg-white/10 dark:hover:bg-white/15 border border-white/40 dark:border-white/15 backdrop-blur-xl flex items-center justify-center text-slate-800 dark:text-slate-100 shadow-[inset_0_1px_1px_rgba(255,255,255,0.4)] transition-all active:scale-95 cursor-pointer"
            >
              {drawerOpen ? <X size={18} strokeWidth={2.5} /> : <Menu size={18} strokeWidth={2.5} />}
            </button>
          </div>
        </header>
      )}

      {/* ── Kinetic Mobile Navigation Drawer (Sterling Gate) ── */}
      <div className="md:hidden">
        <SterlingGateKineticNavigation
          isOpen={drawerOpen}
          onClose={() => setDrawerOpen(false)}
          showTrigger={false}
        />
      </div>


      {/* ── Mobile Instagram-Style Bottom Navigation Bar (Hidden when Drawer is Open) ── */}
      {!isHideBottomBar && !drawerOpen && (
        <NavBar
          items={mobileNavItems}
          userInitial={userInitial}
          className="md:hidden"
        />
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
