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
  { name: "Profile", href: "/settings", icon: UserIcon, desc: "Account & settings" },
];

const bottomBarItems = [
  { name: "Home", href: "/dashboard", icon: LayoutGrid },
  { name: "Learn", href: "/learning", icon: BookIcon },
  { name: "Explore", href: "/explore", icon: ExploreIcon },
  { name: "Practice", href: "/practice", icon: Target },
  { name: "Profile", href: "/settings", icon: UserIcon },
];

function MobileNavContent() {
  const pathname = usePathname();
  const router = useRouter();
  const { session, isLoading } = useAuth();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [isPracticeSubView, setIsPracticeSubView] = useState(false);
  const [isLearningPlayer, setIsLearningPlayer] = useState(false);

  useEffect(() => {
    const checkAttributes = () => {
      if (typeof document !== "undefined") {
        setIsPracticeSubView(document.body.hasAttribute("data-practice-subview"));
        setIsLearningPlayer(document.body.hasAttribute("data-learning-player"));
      }
    };
    checkAttributes();
    const interval = setInterval(checkAttributes, 200);
    return () => clearInterval(interval);
  }, [pathname]);

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

      {/* ── Mobile Floating 3D Squircle Bottom Navigation Bar (Hidden only inside active video player or practice subviews) ── */}
      {!isHideBottomBar && (
        <nav aria-label="Mobile Navigation" className="md:hidden fixed bottom-3 inset-x-3 max-w-md mx-auto z-40 rounded-3xl border border-slate-200/90 bg-white/90 backdrop-blur-2xl shadow-[0_12px_36px_rgba(0,0,0,0.12)] px-3 py-2 flex items-center justify-around">
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
