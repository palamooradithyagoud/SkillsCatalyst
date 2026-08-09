"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
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

// High-frequency bottom bar items for 1-thumb native smartphone navigation
const bottomBarItems = [
  { name: "Home", href: "/dashboard", icon: LayoutGrid },
  { name: "Learn", href: "/learning", icon: BookIcon },
  { name: "Explore", href: "/explore", icon: ExploreIcon },
  { name: "Practice", href: "/practice", icon: Target },
  { name: "Profile", href: "/settings", icon: UserIcon },
];

export default function MobileNav() {
  const pathname = usePathname();
  const { session, isLoading } = useAuth();
  const [drawerOpen, setDrawerOpen] = useState(false);

  if (pathname === "/login" || isLoading || !session) {
    return null;
  }

  const userEmail = session?.email || "Guest User";
  const userInitial = userEmail.charAt(0).toUpperCase();

  return (
    <>
      {/* ── Mobile Native Top App Bar (Visible on smartphone < md) ── */}
      <header className="md:hidden sticky top-0 z-30 flex items-center justify-between px-4 py-2.5 mobile-top-header bg-white/85 border-b border-slate-200/80 backdrop-blur-2xl text-slate-900 shadow-sm">
        <div className="flex items-center gap-3">
          <Link href="/dashboard">
            <SkillsCatalystLogo size="sm" showText animated />
          </Link>
        </div>

        <div className="flex items-center gap-1.5">
          <Link
            href="/explore"
            className="w-10 h-10 rounded-xl bg-slate-100/80 hover:bg-slate-200/80 border border-slate-200/80 text-slate-700 flex items-center justify-center mobile-touch-target transition-all"
            aria-label="Quick Search"
          >
            <Search className="w-4 h-4 text-slate-700" />
          </Link>

          <motion.button
            whileTap={{ scale: 0.92 }}
            onClick={() => setDrawerOpen(!drawerOpen)}
            className="w-10 h-10 rounded-xl bg-slate-100/80 hover:bg-slate-200/80 border border-slate-200/80 text-slate-800 flex items-center justify-center mobile-touch-target relative transition-all"
            aria-label="Toggle Navigation Drawer"
          >
            {drawerOpen ? (
              <X className="w-5 h-5 text-slate-900" />
            ) : (
              <Menu className="w-5 h-5 text-slate-900" />
            )}
          </motion.button>
        </div>
      </header>

      {/* ── Native Slide-Over Navigation Drawer ── */}
      <AnimatePresence>
        {drawerOpen && (
          <>
            {/* Darkened Backdrop Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setDrawerOpen(false)}
              className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-40 md:hidden"
            />

            {/* Slide-in Panel from Right */}
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
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#234b3b] to-emerald-600 flex items-center justify-center text-white font-bold text-sm shadow-md">
                      {userInitial}
                    </div>
                    <div>
                      <div className="font-bold text-slate-900 text-sm truncate max-w-[170px]">
                        {userEmail.split("@")[0]}
                      </div>
                      <div className="text-[11px] text-slate-500 flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Active Session
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => setDrawerOpen(false)}
                    className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-900 transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Navigation Links */}
                <nav className="space-y-1.5">
                  {navItems.map((item) => {
                    const isActive =
                      pathname === item.href ||
                      (pathname === "/" && item.href === "/dashboard");
                    const Icon = item.icon;
                    const isExplore = item.name === "Explore";

                    return (
                      <Link
                        key={item.name}
                        href={item.href}
                        onClick={() => setDrawerOpen(false)}
                        className={`group flex items-center justify-between px-3.5 py-3 rounded-2xl text-sm font-semibold transition-all mobile-touch-target ${
                          isActive
                            ? "bg-[#234b3b] text-white shadow-md shadow-[#234b3b]/20"
                            : "text-slate-700 hover:text-slate-900 hover:bg-slate-100 border border-transparent"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                              isActive
                                ? "bg-white/20 text-white"
                                : "bg-slate-100 text-slate-600 group-hover:text-slate-900"
                            }`}
                          >
                            {isExplore ? (
                              <ExploreIcon size={18} />
                            ) : (
                              <Icon className="w-4 h-4" />
                            )}
                          </div>
                          <div>
                            <span className={`block font-bold leading-none ${isActive ? "text-white" : "text-slate-900"}`}>
                              {item.name}
                            </span>
                            <span className={`text-[10px] font-medium mt-0.5 block ${isActive ? "text-emerald-100" : "text-slate-500"}`}>
                              {item.desc}
                            </span>
                          </div>
                        </div>
                        <ChevronRight
                          className={`w-4 h-4 ${
                            isActive ? "text-white" : "text-slate-400 group-hover:text-slate-600"
                          }`}
                        />
                      </Link>
                    );
                  })}
                </nav>
              </div>

              {/* Drawer Footer: Streak Badge */}
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

      {/* ── Mobile Native Floating Light Glass Pill Navigation Bar (Visible on smartphone < md) ── */}
      <nav aria-label="Mobile Navigation" className="md:hidden fixed bottom-3 inset-x-3 max-w-md mx-auto z-40 rounded-full border border-slate-200/90 bg-white/90 backdrop-blur-2xl shadow-[0_12px_36px_rgba(0,0,0,0.12)] px-2 py-1.5 flex items-center justify-around">
        {bottomBarItems.map((item) => {
          const isActive =
            pathname === item.href ||
            (pathname === "/" && item.href === "/dashboard");
          const Icon = item.icon;
          const isExplore = item.name === "Explore";

          return (
            <Link
              key={item.name}
              href={item.href}
              className="relative flex flex-col items-center justify-center py-1.5 px-3 min-w-[56px] min-h-[46px] rounded-full transition-all select-none"
            >
              {isActive && (
                <motion.div
                  layoutId="mobileBottomNavActive"
                  className="absolute inset-0 bg-[#234b3b] rounded-full shadow-md shadow-[#234b3b]/30"
                  transition={{ type: "spring", stiffness: 450, damping: 30 }}
                />
              )}
              <motion.div
                whileTap={{ scale: 0.86 }}
                className={`relative z-10 flex flex-col items-center justify-center transition-colors duration-200 ${
                  isActive ? "text-white" : "text-slate-500 hover:text-slate-900"
                }`}
              >
                {isExplore ? (
                  <ExploreIcon size={20} className={`relative z-10 transition-transform duration-200 ${isActive ? "scale-110 text-white" : "text-slate-500"}`} />
                ) : (
                  <Icon
                    className={`w-5 h-5 relative z-10 transition-all duration-200 ${
                      isActive ? "text-white scale-110" : "text-slate-500"
                    }`}
                  />
                )}
                <span
                  className={`text-[10px] tracking-tight font-medium mt-0.5 relative z-10 transition-all duration-200 ${
                    isActive ? "text-white font-bold opacity-100 scale-105" : "text-slate-500 opacity-90"
                  }`}
                >
                  {item.name}
                </span>
              </motion.div>
            </Link>
          );
        })}
      </nav>
    </>
  );
}
