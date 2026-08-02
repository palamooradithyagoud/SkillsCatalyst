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
      <header className="md:hidden sticky top-0 z-30 flex items-center justify-between px-4 py-2.5 mobile-top-header bg-[#060c18]/85 border-b border-white/10 backdrop-blur-2xl">
        <div className="flex items-center gap-3">
          <Link href="/dashboard" className="flex items-center gap-2.5">
            <div className="relative">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 via-blue-500 to-cyan-400 flex items-center justify-center text-white shadow-md shadow-blue-500/30">
                <Code2 className="w-5 h-5 stroke-[2.5]" />
              </div>
              <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-400 border-2 border-[#060c18] animate-pulse" />
            </div>
            <div>
              <span className="text-base font-bold tracking-tight text-white gradient-text-blue block leading-none">
                SkillsCatalyst
              </span>
              <span className="text-[10px] text-slate-400 font-medium block mt-0.5">
                Native SaaS App
              </span>
            </div>
          </Link>
        </div>

        <div className="flex items-center gap-1.5">
          <Link
            href="/explore"
            className="w-10 h-10 rounded-xl glass hover:bg-white/10 text-slate-300 flex items-center justify-center mobile-touch-target"
            aria-label="Quick Search"
          >
            <Search className="w-4 h-4 text-slate-300" />
          </Link>

          <motion.button
            whileTap={{ scale: 0.92 }}
            onClick={() => setDrawerOpen(!drawerOpen)}
            className="w-10 h-10 rounded-xl glass hover:bg-white/10 text-slate-200 flex items-center justify-center mobile-touch-target relative"
            aria-label="Toggle Navigation Drawer"
          >
            {drawerOpen ? (
              <X className="w-5 h-5 text-white" />
            ) : (
              <Menu className="w-5 h-5 text-white" />
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
              className="fixed inset-0 bg-black/75 backdrop-blur-md z-40 md:hidden"
            />

            {/* Slide-in Panel from Right */}
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", stiffness: 350, damping: 32 }}
              className="fixed top-0 right-0 bottom-0 w-[85%] max-w-sm glass-strong bg-[#091122]/95 border-l border-white/10 z-50 p-5 flex flex-col justify-between overflow-y-auto mobile-touch-scroll md:hidden"
            >
              <div>
                {/* Drawer Header */}
                <div className="flex items-center justify-between pb-4 mb-5 border-b border-white/10">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm shadow-md">
                      {userInitial}
                    </div>
                    <div>
                      <div className="font-bold text-white text-sm truncate max-w-[170px]">
                        {userEmail.split("@")[0]}
                      </div>
                      <div className="text-[11px] text-slate-400 flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" /> Active Session
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => setDrawerOpen(false)}
                    className="p-2.5 rounded-xl glass hover:bg-white/10 text-slate-400 hover:text-white mobile-touch-target"
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
                            ? "bg-gradient-to-r from-blue-600/30 to-purple-600/20 text-white border border-blue-500/40 shadow-lg shadow-blue-500/10"
                            : "text-slate-300 hover:text-white hover:bg-white/5 border border-transparent"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                              isActive
                                ? "bg-blue-500 text-white shadow-md shadow-blue-500/30"
                                : "bg-white/5 text-slate-400 group-hover:text-white"
                            }`}
                          >
                            {isExplore ? (
                              <ExploreIcon size={18} />
                            ) : (
                              <Icon className="w-4 h-4" />
                            )}
                          </div>
                          <div>
                            <span className="block font-medium leading-none text-white">
                              {item.name}
                            </span>
                            <span className="text-[10px] text-slate-400 font-normal mt-0.5 block">
                              {item.desc}
                            </span>
                          </div>
                        </div>
                        <ChevronRight
                          className={`w-4 h-4 ${
                            isActive ? "text-blue-400" : "text-slate-600 group-hover:text-slate-400"
                          }`}
                        />
                      </Link>
                    );
                  })}
                </nav>
              </div>

              {/* Drawer Footer: Streak Badge */}
              <div className="glass rounded-2xl p-4 mt-6 border border-white/10 bg-white/[0.02]">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-300 uppercase tracking-wider">
                    <Flame className="w-4 h-4 text-orange-400 fill-orange-400/30" />
                    Daily Learning Streak
                  </div>
                  <Zap className="w-4 h-4 text-amber-400 animate-bounce" />
                </div>
                <div className="text-2xl font-black text-white tracking-tight">
                  0 <span className="text-xs font-semibold text-slate-400">days active</span>
                </div>
                <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden mt-2">
                  <div className="streak-bar h-full w-[10%]" />
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ── Mobile Sticky Bottom Navigation Bar (Visible on smartphone < md) ── */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-30 mobile-bottom-nav glass-strong border-t border-white/10 px-3 py-1.5 flex items-center justify-around backdrop-blur-2xl bg-[#060c18]/92">
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
              className="relative flex flex-col items-center justify-center py-1 px-3 min-w-[60px] min-h-[52px] rounded-2xl transition-all"
            >
              {isActive && (
                <motion.div
                  layoutId="mobileBottomNavActive"
                  className="absolute inset-0 bg-gradient-to-tr from-blue-600/25 to-purple-600/20 rounded-2xl border border-blue-500/35 shadow-lg shadow-blue-500/20"
                  transition={{ type: "spring", stiffness: 450, damping: 32 }}
                />
              )}
              <motion.div
                whileTap={{ scale: 0.85 }}
                className={`relative z-10 flex flex-col items-center justify-center ${
                  isActive ? "text-blue-400" : "text-slate-400"
                }`}
              >
                {isExplore ? (
                  <ExploreIcon size={20} className="relative z-10" />
                ) : (
                  <Icon
                    className={`w-5 h-5 relative z-10 transition-transform ${
                      isActive ? "text-blue-400 scale-110" : "text-slate-400"
                    }`}
                  />
                )}
                <span
                  className={`text-[10px] tracking-tight font-medium mt-1 relative z-10 ${
                    isActive ? "text-white font-bold" : "text-slate-400"
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
