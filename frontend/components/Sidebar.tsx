"use client";

import React, { useRef } from "react";
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
  Flame,
  Zap,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

import { useAuth } from "@/lib/auth";
import BookIcon from "@/components/icons/BookIcon";
import UserIcon from "@/components/icons/UserIcon";
import type { AnimatedIconHandle } from "@/components/icons/types";

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

const sidebarVariants = {
  hidden: { x: -60, opacity: 0 },
  visible: {
    x: 0,
    opacity: 1,
    transition: { duration: 0.5, ease: "easeOut" as const },
  },
};

const navItemVariants = {
  hidden: { x: -20, opacity: 0 },
  visible: (i: number) => ({
    x: 0,
    opacity: 1,
    transition: { delay: 0.1 + i * 0.06, duration: 0.4, ease: "easeOut" as const },
  }),
};

export default function Sidebar() {
  const pathname = usePathname();
  const { session, isLoading } = useAuth();
  const learningIconRef = useRef<AnimatedIconHandle>(null);
  const profileIconRef = useRef<AnimatedIconHandle>(null);

  if (pathname === "/login" || isLoading || !session) {
    return null;
  }

  return (
    <motion.aside
      variants={sidebarVariants}
      initial="hidden"
      animate="visible"
      className="glass-sidebar w-64 hidden md:flex flex-col justify-between h-screen sticky top-0 p-5 select-none z-30 shrink-0"
    >
      <div>
        {/* ── Brand Logo ── */}
        <motion.div
          className="flex items-center gap-3 mb-8 px-2"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          <div className="relative">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-cyan-400 flex items-center justify-center text-white shadow-lg shadow-blue-500/30 animate-pulse-glow">
              <Code2 className="w-5 h-5 stroke-[2.5]" />
            </div>
            <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-emerald-400 border-2 border-[#060c18] animate-pulse" />
          </div>
          <div>
            <span className="text-lg font-bold tracking-tight text-white gradient-text-blue">SkillsCatalyst</span>
            <div className="text-[10px] text-slate-400 font-medium tracking-wide">Learn Faster. Grow Smarter.</div>
          </div>
        </motion.div>

        {/* ── Nav Items ── */}
        <nav className="space-y-1">
          {navItems.map((item, i) => {
            const isActive =
              pathname === item.href ||
              (pathname === "/" && item.href === "/dashboard");
            const Icon = item.icon;
            const isLearning = item.name === "Learning";
            const isProfile = item.name === "Profile";

            return (
              <motion.div
                key={item.name}
                custom={i}
                variants={navItemVariants}
                initial="hidden"
                animate="visible"
              >
                <Link
                  href={item.href}
                  className="relative block rounded-xl group"
                  onMouseEnter={() => {
                    if (isLearning) learningIconRef.current?.startAnimation();
                    if (isProfile) profileIconRef.current?.startAnimation();
                  }}
                  onMouseLeave={() => {
                    if (isLearning) learningIconRef.current?.stopAnimation();
                    if (isProfile) profileIconRef.current?.stopAnimation();
                  }}
                >
                  {/* Active background pill */}
                  <AnimatePresence>
                    {isActive && (
                      <motion.div
                        layoutId="activePill"
                        className="absolute inset-0 nav-active-pill rounded-xl"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ type: "spring", stiffness: 400, damping: 30 }}
                      />
                    )}
                  </AnimatePresence>

                  {/* Hover glow effect */}
                  {!isActive && (
                    <div className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-white/[0.03]" />
                  )}

                  <div
                    className={`relative flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                      isActive ? "text-white" : "text-slate-400 group-hover:text-slate-200"
                    }`}
                  >
                    <motion.div
                      whileHover={{ scale: 1.1, rotate: isActive ? 0 : 5 }}
                      transition={{ type: "spring", stiffness: 400, damping: 25 }}
                    >
                      {isLearning ? (
                        <BookIcon
                          ref={learningIconRef}
                          size={18}
                          className={`w-[18px] h-[18px] shrink-0 ${isActive ? "text-white" : "text-slate-500 group-hover:text-slate-300"}`}
                        />
                      ) : isProfile ? (
                        <UserIcon
                          ref={profileIconRef}
                          size={18}
                          className={`w-[18px] h-[18px] shrink-0 ${isActive ? "text-white" : "text-slate-500 group-hover:text-slate-300"}`}
                        />
                      ) : (
                        <Icon className={`w-[18px] h-[18px] shrink-0 ${isActive ? "text-white" : "text-slate-500 group-hover:text-slate-300"}`} />
                      )}
                    </motion.div>
                    <span className="font-[500]">{item.name}</span>
                    {item.name === "AI Mentor" && (
                      <span className="ml-auto text-[9px] font-bold px-1.5 py-0.5 rounded-md bg-purple-500/20 text-purple-300 border border-purple-500/20">
                        AI
                      </span>
                    )}
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </nav>
      </div>

      {/* ── Streak Widget ── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7, duration: 0.5, ease: "easeOut" as const }}
        className="glass rounded-2xl p-4 relative overflow-hidden"
      >
        {/* Ambient glow behind widget */}
        <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 via-transparent to-transparent rounded-2xl pointer-events-none" />

        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 tracking-widest uppercase">
            <Flame className="w-3.5 h-3.5 text-orange-400 fill-orange-400/30" />
            Current Streak
          </div>
          <Zap className="w-3.5 h-3.5 text-amber-400" />
        </div>

        <div className="text-2xl font-black text-white tracking-tight mb-3">
          0 <span className="text-sm font-semibold text-slate-400">days</span>
        </div>

        <div className="w-full bg-white/5 h-1.5 rounded-full overflow-hidden">
          <motion.div
            className="streak-bar h-full"
            initial={{ width: "0%" }}
            animate={{ width: "5%" }}
            transition={{ delay: 1, duration: 0.8, ease: "easeOut" }}
          />
        </div>
        <div className="text-[10px] text-slate-500 mt-2">Complete a task to start your streak! 🚀</div>
      </motion.div>
    </motion.aside>
  );
}

