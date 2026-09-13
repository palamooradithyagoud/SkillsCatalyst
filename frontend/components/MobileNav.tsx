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
  LifeBuoy,
  ArrowLeft,
  GraduationCap,
  Newspaper,
  Calendar,
  Users,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

import { useAuth } from "@/lib/auth";
import BookIcon from "@/components/icons/BookIcon";
import UserIcon from "@/components/icons/UserIcon";
import ExploreIcon from "@/components/icons/ExploreIcon";
import SkillsCatalystLogo from "@/components/SkillsCatalystLogo";
import ThreeDSquircleTile from "@/components/ThreeDSquircleTile";

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

const bottomBarItems = [
  { name: "Home", href: "/dashboard", icon: LayoutGrid },
  { name: "Learn", href: "/learning", icon: BookIcon },
  { name: "Explore", href: "/explore", icon: ExploreIcon },
  { name: "Practice", href: "/practice", icon: Target },
  { name: "Profile", href: "/settings", icon: UserIcon },
];

const exploreBottomBarItems = [
  { id: "trending", name: "Trending", icon: Flame },
  { id: "scholarships", name: "Grants", icon: GraduationCap },
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

  // Hide bottom navigation bar inside active video player, practice subviews, or roadmaps page
  const isHideBottomBar =
    (pathname === "/learning" && isLearningPlayer) ||
    (pathname === "/practice" && isPracticeSubView) ||
    pathname.startsWith("/roadmaps");

  return (
    <>
      {/* ── Mobile Native Top App Bar ── */}
      <header className="md:hidden sticky top-0 z-30 flex items-center justify-between px-4 py-2.5 bg-white/85 border-b border-slate-200/80 backdrop-blur-2xl text-slate-900 shadow-xs">
        <div className="flex items-center gap-3">
          <Link href="/dashboard">
            <SkillsCatalystLogo size="sm" showText animated />
          </Link>
        </div>

        <div className="flex items-center gap-2">
          {/* Quick Search 3D Button */}
          <ThreeDSquircleTile
            icon={Search}
            size="sm"
            label="Search"
            onClick={() => router.push("/explore")}
          />

          {/* User Initials Squircle Avatar */}
          <ThreeDSquircleTile
            text={userInitial}
            size="sm"
            badge
            badgeColor="bg-emerald-500"
            label="Profile"
            onClick={() => router.push("/settings")}
          />

          {/* Menu Drawer Toggle Button */}
          <ThreeDSquircleTile
            icon={drawerOpen ? X : Menu}
            size="sm"
            label="Toggle Menu"
            onClick={() => setDrawerOpen(!drawerOpen)}
          />
        </div>
      </header>

      {/* ── Native Slide-Over Navigation Drawer ── */}
      <AnimatePresence>
        {drawerOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setDrawerOpen(false)}
              className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-40 md:hidden"
            />

            {/* Slide-in Panel */}
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", stiffness: 350, damping: 32 }}
              className="fixed top-0 right-0 bottom-0 w-[85%] max-w-sm bg-white/95 border-l border-slate-200 z-50 p-5 flex flex-col justify-between overflow-y-auto mobile-touch-scroll md:hidden shadow-2xl text-slate-900"
            >
              <div>
                {/* Drawer Header */}
                <div className="flex items-center justify-between pb-4 mb-5 border-b border-slate-200">
                  <div className="flex items-center gap-3">
                    <ThreeDSquircleTile
                      text={userInitial}
                      size="md"
                      isActive
                      badge
                      badgeColor="bg-emerald-500"
                    />
                    <div>
                      <div className="font-bold text-slate-900 text-sm truncate max-w-[150px]">
                        {userEmail.split("@")[0]}
                      </div>
                      <div className="text-[11px] text-slate-500 flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Active Session
                      </div>
                    </div>
                  </div>
                  <ThreeDSquircleTile
                    icon={X}
                    size="sm"
                    label="Close Menu"
                    onClick={() => setDrawerOpen(false)}
                  />
                </div>

                {/* Navigation Links with 3D Squircle Icons */}
                <nav className="space-y-2">
                  {navItems.map((item) => {
                    const isActive =
                      pathname === item.href ||
                      (pathname === "/" && item.href === "/dashboard");

                    return (
                      <div
                        key={item.name}
                        onClick={() => {
                          setDrawerOpen(false);
                          router.push(item.href);
                        }}
                        className={`group flex items-center justify-between px-3 py-2.5 rounded-2xl cursor-pointer transition-all ${
                          isActive
                            ? "bg-slate-100/90 border border-slate-200/90 shadow-sm"
                            : "hover:bg-slate-50 border border-transparent"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <ThreeDSquircleTile
                            icon={item.icon}
                            isActive={isActive}
                            size="sm"
                            onClick={() => {
                              setDrawerOpen(false);
                              router.push(item.href);
                            }}
                          />
                          <div>
                            <span className={`block font-bold text-sm leading-none ${isActive ? "text-[#234B3B]" : "text-slate-900"}`}>
                              {item.name}
                            </span>
                            <span className="text-[10px] font-medium text-[#64748b] mt-0.5 block">
                              {item.desc}
                            </span>
                          </div>
                        </div>
                        <ChevronRight
                          className={`w-4 h-4 transition-transform group-hover:translate-x-0.5 ${
                            isActive ? "text-[#234B3B]" : "text-slate-400"
                          }`}
                        />
                      </div>
                    );
                  })}
                </nav>
              </div>

              {/* Drawer Footer */}
              <div className="rounded-2xl p-4 mt-6 border border-slate-200 bg-slate-50">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                    <Flame className="w-4 h-4 text-orange-500 fill-orange-500/30" />
                    Daily Learning Streak
                  </div>
                  <Zap className="w-4 h-4 text-amber-500 animate-bounce" />
                </div>
                <div className="text-2xl font-black text-slate-900 tracking-tight">
                  0 <span className="text-xs font-semibold text-slate-500">days active</span>
                </div>
                <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden mt-2">
                  <div className="bg-[#234b3b] h-full w-[10%]" />
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ── Mobile Floating Bottom Navigation Bar ── */}
      {!isHideBottomBar && (
        pathname === "/explore" ? (
          /* ── Dedicated Explore Sub-Downbar with Back Button (Transparent Glass) ── */
          <nav
            aria-label="Mobile Explore Navigation"
            className="md:hidden fixed bottom-3 inset-x-2 max-w-lg mx-auto z-40 rounded-3xl border border-white/50 bg-white/40 backdrop-blur-2xl shadow-[0_16px_40px_rgba(15,23,42,0.1)] px-2.5 py-2 flex items-center justify-between gap-1"
          >
            {/* Back Button to leave Explore and restore standard downbar */}
            <div
              role="button"
              tabIndex={0}
              className="flex flex-col items-center justify-center cursor-pointer select-none shrink-0 border-r border-slate-300/60 pr-2 bg-transparent border-0 outline-none active:scale-90 transition-transform"
              onClick={() => router.push("/dashboard")}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") router.push("/dashboard");
              }}
              aria-label="Back to Dashboard"
            >
              <div className="pointer-events-none">
                <ThreeDSquircleTile
                  as="div"
                  icon={ArrowLeft}
                  isActive={false}
                  size="sm"
                  label="Back"
                />
              </div>
              <span className="text-[9px] tracking-tight font-black mt-1 text-slate-700">
                Back
              </span>
            </div>

            {/* 5 Explore Tabs with Butter-Smooth Sliding Indicator */}
            <div className="flex-1 flex items-center justify-around relative">
              {exploreBottomBarItems.map((item) => {
                const isActive = exploreTab === item.id;
                return (
                  <div
                    key={item.id}
                    role="button"
                    tabIndex={0}
                    className="relative flex flex-col items-center justify-center cursor-pointer select-none py-1 px-1 rounded-2xl bg-transparent border-0 outline-none active:scale-95 transition-transform"
                    onClick={() => {
                      setExploreTab(item.id);
                      if (typeof document !== "undefined") {
                        document.body.setAttribute("data-explore-tab", item.id);
                      }
                      router.replace(`/explore?tab=${item.id}`, { scroll: false });
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        setExploreTab(item.id);
                        if (typeof document !== "undefined") {
                          document.body.setAttribute("data-explore-tab", item.id);
                        }
                        router.replace(`/explore?tab=${item.id}`, { scroll: false });
                      }
                    }}
                    aria-label={item.name}
                  >
                    {/* Active Sliding Frosted Glass Pill */}
                    {isActive && (
                      <motion.div
                        layoutId="activeMobileExploreTabPill"
                        className="absolute inset-0 bg-white/75 backdrop-blur-md rounded-2xl border border-white/85 shadow-xs -z-10"
                        transition={{ type: "spring", stiffness: 500, damping: 35 }}
                      />
                    )}

                    <div
                      className={`transition-transform duration-200 pointer-events-none ${
                        isActive ? "scale-105 -translate-y-0.5" : "scale-100"
                      }`}
                    >
                      <ThreeDSquircleTile
                        as="div"
                        icon={item.icon}
                        isActive={isActive}
                        size="sm"
                        label={item.name}
                      />
                    </div>

                    <span
                      className={`text-[9px] tracking-tight font-extrabold mt-0.5 transition-colors pointer-events-none ${
                        isActive ? "text-[#234B3B]" : "text-slate-500"
                      }`}
                    >
                      {item.name}
                    </span>
                  </div>
                );
              })}
            </div>
          </nav>
        ) : (
          /* ── Standard 5-Item Mobile Navigation Bar ── */
          <nav
            aria-label="Mobile Navigation"
            className="md:hidden fixed bottom-3 inset-x-3 max-w-md mx-auto z-40 rounded-3xl border border-slate-200/90 bg-white/90 backdrop-blur-2xl shadow-[0_12px_36px_rgba(0,0,0,0.12)] px-3 py-2 flex items-center justify-around"
          >
            {bottomBarItems.map((item) => {
              const isActive =
                pathname === item.href ||
                (pathname === "/" && item.href === "/dashboard");

              return (
                <div
                  key={item.name}
                  className="flex flex-col items-center justify-center cursor-pointer select-none"
                  onClick={() => router.push(item.href)}
                >
                  <ThreeDSquircleTile
                    icon={item.icon}
                    isActive={isActive}
                    size="md"
                    label={item.name}
                    onClick={() => router.push(item.href)}
                  />
                  <span
                    className={`text-[10px] tracking-tight font-bold mt-1 transition-colors ${
                      isActive ? "text-[#234B3B]" : "text-slate-500"
                    }`}
                  >
                    {item.name}
                  </span>
                </div>
              );
            })}
          </nav>
        )
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
