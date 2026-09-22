"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
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
  ArrowLeft,
  GraduationCap,
  Newspaper,
  Calendar,
  Users,
  BookOpen,
  Compass,
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

const navItems = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutGrid, desc: "Overview & metrics" },
  { name: "Learning", href: "/learning", icon: BookIcon, desc: "Courses & YouTube playlists" },
  { name: "Roadmaps", href: "/roadmaps", icon: Map, desc: "Interactive career tracks" },
  { name: "Practice", href: "/practice", icon: Target, desc: "Aptitude & company questions" },
  { name: "Career", href: "/career", icon: Briefcase, desc: "AI resume analysis" },
  { name: "Explore", href: "/explore", icon: ExploreIcon, desc: "Trending skills & tools" },
  { name: "Analytics", href: "/analytics", icon: BarChart3, desc: "Detailed performance" },
  { name: "Support & Help", href: "/support", icon: LifeBuoy, desc: "Customer desk & policies" },
  { name: "Profile", href: "/settings", icon: UserIcon, desc: "Account & settings" },
];

const mobileNavItems: NavItem[] = [
  { name: "Home", url: "/dashboard", icon: LayoutGrid },
  { name: "Learn", url: "/learning", icon: BookOpen },
  { name: "Explore", url: "/explore", icon: Compass },
  { name: "Practice", url: "/practice", icon: Target },
  { name: "Profile", url: "/settings", icon: User },
];

const bottomBarItems = [
  { name: "Home", href: "/dashboard", icon: LayoutGrid },
  { name: "Learn", href: "/learning", icon: BookIcon },
  { name: "Explore", href: "/explore", icon: ExploreIcon },
  { name: "Practice", href: "/practice", icon: Target },
  { name: "Profile", href: "/settings", icon: UserIcon },
];

const exploreBottomBarItems = [
  { id: "trending", name: "Trending", icon: Flame },
  { id: "scholarships", name: "Scholarships", icon: GraduationCap },
  { id: "news", name: "News", icon: Newspaper },
  { id: "events", name: "Events", icon: Calendar },
  { id: "community", name: "Guilds", icon: Users },
];

function MobileNavContent() {
  const pathname = usePathname();
  const router = useRouter();
  const { session, isLoading } = useAuth();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [isPracticeSubView, setIsPracticeSubView] = useState(false);
  const [isLearningPlayer, setIsLearningPlayer] = useState(false);
  const [exploreTab, setExploreTab] = useState<string>("trending");
  const [isExplicitlyHidden, setIsExplicitlyHidden] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined" && window.location.pathname === "/explore") {
      const params = new URLSearchParams(window.location.search);
      const tab = params.get("tab");
      if (tab && ["trending", "scholarships", "news", "events", "community"].includes(tab)) {
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
    const interval = setInterval(checkAttributes, 150);

    const handleExploreTabChange = (e: any) => {
      if (e.detail && typeof e.detail === "string") {
        setExploreTab(e.detail);
      }
    };
    window.addEventListener("explore-tab-change", handleExploreTabChange);

    return () => {
      clearInterval(interval);
      window.removeEventListener("explore-tab-change", handleExploreTabChange);
    };
  }, [pathname, exploreTab]);

  if (pathname === "/login" || isLoading || !session) {
    return null;
  }

  const userEmail = session?.email || "Guest User";
  const userInitial = userEmail.split("@")[0].substring(0, 2).toUpperCase() || "AD";

  // Hide bottom navigation bar inside active video player, practice subviews, roadmaps, or edit profile page
  const isHideBottomBar =
    isExplicitlyHidden ||
    (pathname === "/learning" && isLearningPlayer) ||
    (pathname === "/practice" && isPracticeSubView) ||
    pathname.startsWith("/roadmaps") ||
    pathname.startsWith("/settings/edit") ||
    pathname.startsWith("/profile/edit");

  return (
    <>
      {/* ── Mobile Native Top App Bar ── */}
      <header className="md:hidden sticky top-0 z-30 flex items-center justify-between px-4 py-2.5 bg-white/40 border-b border-black/5 backdrop-blur-xl text-slate-900 shadow-xs">
        <div className="flex items-center gap-2">
          <Link href="/dashboard">
            <SkillsCatalystLogo size="sm" showText animated />
          </Link>
        </div>

        <div className="flex items-center gap-2">
          {/* Notification Bell Button */}
          <button
            type="button"
            aria-label="Notifications"
            className="relative w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-white/30 hover:bg-white/50 border border-black/10 backdrop-blur-xl flex items-center justify-center text-slate-800 shadow-xs transition-all active:scale-95 cursor-pointer"
          >
            <Bell size={18} strokeWidth={2.2} />
            <span className="absolute top-2 right-2 w-2 h-2 bg-[#EAB308] rounded-full ring-1.5 ring-white" />
          </button>

          {/* User's Profile Avatar (Transparent Background with Purple Initials) */}
          <button
            type="button"
            onClick={() => router.push("/settings")}
            aria-label="User Profile"
            className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/30 backdrop-blur-xl flex items-center justify-center text-purple-600 font-black text-xs sm:text-sm shadow-xs transition-all active:scale-95 cursor-pointer"
          >
            <span>{userInitial}</span>
          </button>

          {/* Menu Drawer Toggle Button */}
          <button
            type="button"
            onClick={() => setDrawerOpen(!drawerOpen)}
            aria-label="Toggle Menu"
            className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-white/30 hover:bg-white/50 border border-black/10 backdrop-blur-xl flex items-center justify-center text-slate-800 shadow-xs transition-all active:scale-95 cursor-pointer"
          >
            {drawerOpen ? <X size={18} strokeWidth={2.5} /> : <Menu size={18} strokeWidth={2.5} />}
          </button>
        </div>
      </header>

      {/* ── Kinetic Mobile Navigation Drawer (Sterling Gate) ── */}
      <div className="md:hidden">
        <SterlingGateKineticNavigation
          isOpen={drawerOpen}
          onClose={() => setDrawerOpen(false)}
          showTrigger={false}
        />
      </div>


      {/* ── Mobile Floating Tubelight Bottom Navigation Bar (Hidden when Drawer is Open) ── */}
      {!isHideBottomBar && !drawerOpen && (
        <NavBar
          items={mobileNavItems}
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
