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
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

import { useAuth } from "@/lib/auth";
import BookIcon from "@/components/icons/BookIcon";
import UserIcon from "@/components/icons/UserIcon";

const navItems = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutGrid },
  { name: "Learning", href: "/learning", icon: BookIcon },
  { name: "Roadmaps", href: "/roadmaps", icon: Map },
  { name: "Practice", href: "/practice", icon: Target },
  { name: "Career", href: "/career", icon: Briefcase },
  { name: "AI Mentor", href: "/ai-mentor", icon: Sparkles },
  { name: "Analytics", href: "/analytics", icon: BarChart3 },
  { name: "Profile", href: "/settings", icon: UserIcon },
];

// High-frequency bottom bar items for quick 1-thumb smartphone navigation
const bottomBarItems = [
  { name: "Home", href: "/dashboard", icon: LayoutGrid },
  { name: "Learn", href: "/learning", icon: BookIcon },
  { name: "AI Mentor", href: "/ai-mentor", icon: Sparkles },
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

  return (
    <>
      {/* ── Mobile Top Header Bar (Mobile only: < md) ── */}
      <header className="md:hidden sticky top-0 z-30 flex items-center justify-between px-4 py-3 glass-strong border-b border-white/10 backdrop-blur-xl">
        <div className="flex items-center gap-2.5">
          <div className="relative">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-blue-600 to-cyan-400 flex items-center justify-center text-white shadow-md shadow-blue-500/30">
              <Code2 className="w-4 h-4 stroke-[2.5]" />
            </div>
            <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-400 border-2 border-[#060c18] animate-pulse" />
          </div>
          <div>
            <span className="text-base font-bold tracking-tight text-white gradient-text-blue block leading-tight">
              SkillsCatalyst
            </span>
            <span className="text-[9px] text-slate-400 font-medium block">
              Learn & Grow
            </span>
          </div>
        </div>

        <button
          onClick={() => setDrawerOpen(!drawerOpen)}
          className="p-2.5 rounded-xl glass hover:bg-white/10 text-slate-200 focus:outline-none min-h-[44px] min-w-[44px] flex items-center justify-center"
          aria-label="Toggle Menu"
        >
          {drawerOpen ? <X className="w-5 h-5 text-white" /> : <Menu className="w-5 h-5 text-white" />}
        </button>
      </header>

      {/* ── Mobile Slide-out Menu Drawer ── */}
      <AnimatePresence>
        {drawerOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setDrawerOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden"
            />

            {/* Slide-out Panel */}
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", stiffness: 350, damping: 30 }}
              className="fixed top-0 right-0 bottom-0 w-[80%] max-w-xs glass-strong border-l border-white/10 z-50 p-5 flex flex-col justify-between overflow-y-auto md:hidden"
            >
              <div>
                <div className="flex items-center justify-between pb-4 mb-4 border-b border-white/10">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-blue-600 to-cyan-400 flex items-center justify-center text-white">
                      <Code2 className="w-4 h-4" />
                    </div>
                    <span className="font-bold text-white text-base">Navigation</span>
                  </div>
                  <button
                    onClick={() => setDrawerOpen(false)}
                    className="p-2 rounded-lg text-slate-400 hover:text-white"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <nav className="space-y-1">
                  {navItems.map((item) => {
                    const isActive =
                      pathname === item.href ||
                      (pathname === "/" && item.href === "/dashboard");
                    const Icon = item.icon;

                    return (
                      <Link
                        key={item.name}
                        href={item.href}
                        onClick={() => setDrawerOpen(false)}
                        className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all min-h-[44px] ${
                          isActive
                            ? "bg-blue-600/20 text-white border border-blue-500/30"
                            : "text-slate-400 hover:text-white hover:bg-white/5"
                        }`}
                      >
                        <Icon className={`w-4 h-4 shrink-0 ${isActive ? "text-blue-400" : "text-slate-400"}`} />
                        <span>{item.name}</span>
                        {item.name === "AI Mentor" && (
                          <span className="ml-auto text-[9px] font-bold px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/20">
                            AI
                          </span>
                        )}
                      </Link>
                    );
                  })}
                </nav>
              </div>

              {/* Streak Widget on Mobile */}
              <div className="glass rounded-xl p-3.5 mt-6 border border-white/10">
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    <Flame className="w-3.5 h-3.5 text-orange-400 fill-orange-400/30" />
                    Current Streak
                  </div>
                  <Zap className="w-3.5 h-3.5 text-amber-400" />
                </div>
                <div className="text-xl font-black text-white">
                  0 <span className="text-xs font-semibold text-slate-400">days</span>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ── Mobile Sticky Bottom Navigation Bar (Mobile only: < md) ── */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-30 glass-strong border-t border-white/10 px-2 py-1.5 flex items-center justify-around backdrop-blur-2xl bg-[#060c18]/90">
        {bottomBarItems.map((item) => {
          const isActive =
            pathname === item.href ||
            (pathname === "/" && item.href === "/dashboard");
          const Icon = item.icon;

          return (
            <Link
              key={item.name}
              href={item.href}
              className={`relative flex flex-col items-center justify-center py-1 px-2 min-w-[56px] min-h-[48px] rounded-xl transition-all ${
                isActive ? "text-blue-400 font-semibold" : "text-slate-400 hover:text-slate-200"
              }`}
            >
              {isActive && (
                <motion.div
                  layoutId="bottomNavActive"
                  className="absolute inset-0 bg-blue-500/15 rounded-xl border border-blue-500/25"
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                />
              )}
              <Icon className={`w-5 h-5 relative z-10 ${isActive ? "text-blue-400 scale-110" : "text-slate-400"}`} />
              <span className="text-[10px] tracking-tight mt-0.5 relative z-10">{item.name}</span>
            </Link>
          );
        })}
      </nav>
    </>
  );
}
