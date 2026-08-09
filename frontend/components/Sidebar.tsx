"use client";

import React, { useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutGrid,
  Map,
  Target,
  Briefcase,
  BarChart3,
} from "lucide-react";
import { motion } from "framer-motion";

import { useAuth } from "@/lib/auth";
import BookIcon from "@/components/icons/BookIcon";
import UserIcon from "@/components/icons/UserIcon";
import ExploreIcon from "@/components/icons/ExploreIcon";
import type { AnimatedIconHandle } from "@/components/icons/types";

import SkillsCatalystLogo from "@/components/SkillsCatalystLogo";

const navItems = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutGrid },
  { name: "Learning", href: "/learning", icon: BookIcon },
  { name: "Roadmaps", href: "/roadmaps", icon: Map },
  { name: "Practice", href: "/practice", icon: Target },
  { name: "Career", href: "/career", icon: Briefcase },
  { name: "Explore", href: "/explore", icon: ExploreIcon },
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
    transition: { delay: 0.05 + i * 0.05, duration: 0.4, ease: "easeOut" as const },
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
      className="w-20 lg:w-24 hidden md:flex flex-col items-center justify-between h-screen sticky top-0 py-6 px-2 select-none z-30 shrink-0 bg-white/70 backdrop-blur-2xl border-r border-slate-200/80 shadow-[4px_0_24px_rgba(0,0,0,0.03)] overflow-visible"
    >
      <div className="flex flex-col items-center gap-6 w-full">
        {/* ── Brand Logo ── */}
        <motion.div
          className="flex items-center justify-center pt-1"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          <Link href="/dashboard" title="SkillsCatalyst Home" className="p-2.5 rounded-2xl bg-slate-50 border border-slate-200/80 hover:bg-slate-100 transition-all shadow-sm">
            <SkillsCatalystLogo size="sm" animated />
          </Link>
        </motion.div>

        {/* ── Nav Items with 3D Glass Icons ── */}
        <nav className="flex flex-col items-center gap-5 w-full mt-2 overflow-visible">
          {navItems.map((item, i) => {
            const isActive =
              pathname === item.href ||
              (pathname === "/" && item.href === "/dashboard");
            const isLearning = item.name === "Learning";
            const isProfile = item.name === "Profile";
            const isExplore = item.name === "Explore";

            return (
              <motion.div
                key={item.name}
                custom={i}
                variants={navItemVariants}
                initial="hidden"
                animate="visible"
                className="w-full flex justify-center"
              >
                <Link
                  href={item.href}
                  aria-label={item.name}
                  className="relative bg-transparent outline-none border-none cursor-pointer w-12 h-12 text-[15px] [perspective:24em] [transform-style:preserve-3d] [-webkit-tap-highlight-color:transparent] group flex items-center justify-center"
                  onMouseEnter={() => {
                    if (isLearning) learningIconRef.current?.startAnimation();
                    if (isProfile) profileIconRef.current?.startAnimation();
                  }}
                  onMouseLeave={() => {
                    if (isLearning) learningIconRef.current?.stopAnimation();
                    if (isProfile) profileIconRef.current?.stopAnimation();
                  }}
                >
                  {/* 3D Back Layer */}
                  <span
                    className={`absolute top-0 left-0 w-full h-full rounded-[1.1em] block border transition-[opacity,transform,background-color,border-color] duration-300 ease-[cubic-bezier(0.83,0,0.17,1)] origin-[100%_100%] [will-change:transform] ${
                      isActive
                        ? "rotate-[20deg] scale-105 opacity-100 group-hover:[transform:rotate(28deg)_translate3d(-0.4em,-0.4em,0.4em)] border-[#234B3B]/40"
                        : "bg-slate-100 border-slate-200/80 rotate-[15deg] opacity-70 group-hover:opacity-100 group-hover:bg-slate-200/70 group-hover:border-slate-300/80 group-hover:[transform:rotate(25deg)_translate3d(-0.4em,-0.4em,0.4em)]"
                    }`}
                    style={{
                      ...(isActive ? { background: 'linear-gradient(135deg, #234B3B, #1b3b2e)' } : {}),
                      boxShadow: isActive
                        ? "0.4em -0.4em 1em rgba(35, 75, 59, 0.35), 0 0 15px rgba(35, 75, 59, 0.2)"
                        : "0.4em -0.4em 0.75em rgba(0,0,0,0.06)",
                    }}
                  />

                  {/* 3D Front Glass Layer */}
                  <span
                    className={`absolute top-0 left-0 w-full h-full rounded-[1.1em] transition-[opacity,transform,background-color,border-color] duration-300 ease-[cubic-bezier(0.83,0,0.17,1)] origin-[80%_50%] flex backdrop-blur-xl [-webkit-backdrop-filter:blur(0.75em)] [-moz-backdrop-filter:blur(0.75em)] [will-change:transform] transform ${
                      isActive
                        ? "bg-white/90 border border-white [transform:translate3d(0,0,0.8em)] group-hover:[transform:translate3d(0,0,2em)]"
                        : "bg-white/70 border border-white/80 group-hover:[transform:translate3d(0,0,2em)] group-hover:bg-white/90"
                    }`}
                    style={{
                      boxShadow: isActive
                        ? "0 0 0 0.12em rgba(255, 255, 255, 0.9) inset, 0 6px 16px rgba(16, 185, 129, 0.15)"
                        : "0 0 0 0.1em rgba(255, 255, 255, 0.9) inset, 0 4px 12px rgba(0,0,0,0.04)",
                    }}
                  >
                    <span className="m-auto w-[1.5em] h-[1.5em] flex items-center justify-center drop-shadow-sm" aria-hidden="true">
                      {isLearning ? (
                        <BookIcon
                          ref={learningIconRef}
                          size={20}
                          className={`w-5 h-5 transition-colors ${isActive ? "text-emerald-700 font-bold" : "text-slate-500 group-hover:text-slate-900"}`}
                        />
                      ) : isProfile ? (
                        <UserIcon
                          ref={profileIconRef}
                          size={20}
                          className={`w-5 h-5 transition-colors ${isActive ? "text-emerald-700 font-bold" : "text-slate-500 group-hover:text-slate-900"}`}
                        />
                      ) : isExplore ? (
                        <ExploreIcon size={20} className={`w-5 h-5 transition-colors ${isActive ? "text-emerald-700 font-bold" : "text-slate-500 group-hover:text-slate-900"}`} />
                      ) : (
                        <item.icon className={`w-5 h-5 transition-colors ${isActive ? "text-emerald-700 font-bold" : "text-slate-500 group-hover:text-slate-900"}`} />
                      )}
                    </span>
                  </span>

                  {/* Sidebar Tooltip Label on Hover */}
                  <span className="absolute left-full ml-4 top-1/2 -translate-y-1/2 px-3 py-1.5 rounded-xl bg-slate-900 text-white text-xs font-semibold whitespace-nowrap opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-300 pointer-events-none shadow-xl border border-slate-800 backdrop-blur-xl z-50 flex items-center gap-1.5">
                    {item.name}
                    {isActive && (
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    )}
                  </span>
                </Link>
              </motion.div>
            );
          })}
        </nav>
      </div>

      {/* ── Profile Avatar at Bottom ── */}
      <div className="flex flex-col items-center gap-3 w-full">
        <Link
          href="/settings"
          aria-label="Profile Settings"
          className="relative bg-transparent outline-none border-none cursor-pointer w-11 h-11 text-[15px] [perspective:24em] [transform-style:preserve-3d] [-webkit-tap-highlight-color:transparent] group flex items-center justify-center"
        >
          <span
            className="absolute top-0 left-0 w-full h-full rounded-[1.1em] block border border-slate-200/80 bg-slate-100 transition-[opacity,transform,background-color] duration-300 ease-[cubic-bezier(0.83,0,0.17,1)] origin-[100%_100%] rotate-[15deg] opacity-70 group-hover:opacity-100 group-hover:bg-slate-200/80 group-hover:[transform:rotate(25deg)_translate3d(-0.4em,-0.4em,0.4em)]"
            style={{
              boxShadow: '0.4em -0.4em 0.75em rgba(0,0,0,0.06)'
            }}
          />
          <span
            className="absolute top-0 left-0 w-full h-full rounded-[1.1em] bg-white/80 border border-white transition-[opacity,transform,background-color] duration-300 ease-[cubic-bezier(0.83,0,0.17,1)] origin-[80%_50%] flex backdrop-blur-xl [will-change:transform] transform group-hover:bg-white group-hover:[transform:translate3d(0,0,2em)]"
            style={{
              boxShadow: '0 0 0 0.1em rgba(255, 255, 255, 0.9) inset, 0 4px 12px rgba(0,0,0,0.04)'
            }}
          >
            <span className="m-auto text-slate-700 group-hover:text-slate-900 font-bold text-xs tracking-wider">
              AD
            </span>
          </span>
          <span className="absolute left-full ml-4 top-1/2 -translate-y-1/2 px-3 py-1.5 rounded-xl bg-slate-900 text-white text-xs font-semibold whitespace-nowrap opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-300 pointer-events-none shadow-xl border border-slate-800 backdrop-blur-xl z-50">
            Settings & Profile
          </span>
        </Link>
      </div>
    </motion.aside>
  );
}





