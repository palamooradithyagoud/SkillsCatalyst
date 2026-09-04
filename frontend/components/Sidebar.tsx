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
  LifeBuoy,
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
    transition: { delay: 0.04 + i * 0.04, duration: 0.35, ease: "easeOut" as const },
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

  const isSupportActive = pathname === "/support";

  return (
    <motion.aside
      variants={sidebarVariants}
      initial="hidden"
      animate="visible"
      className="w-18 lg:w-20 hidden md:flex flex-col items-center justify-between h-screen sticky top-0 py-3.5 px-1.5 select-none z-30 shrink-0 bg-white/80 backdrop-blur-2xl border-r border-slate-200/80 shadow-[4px_0_24px_rgba(0,0,0,0.03)] overflow-visible"
    >
      <div className="flex flex-col items-center gap-2.5 w-full">
        {/* ── Brand Logo ── */}
        <motion.div
          className="flex items-center justify-center pt-0.5"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15, duration: 0.4 }}
        >
          <Link
            href="/dashboard"
            title="SkillsCatalyst Home"
            className="p-1.5 rounded-2xl bg-slate-50 border border-slate-200/80 hover:bg-slate-100 transition-all shadow-xs"
          >
            <SkillsCatalystLogo size="sm" animated />
          </Link>
        </motion.div>

        {/* ── Core Navigation Items with 3D Glass Icons ── */}
        <nav className="flex flex-col items-center gap-1.5 lg:gap-2 w-full mt-1 overflow-visible">
          {navItems.map((item, i) => {
            const isActive =
              pathname === item.href ||
              (pathname === "/" && item.href === "/dashboard");
            const isLearning = item.name === "Learning";
            const isProfile = item.name === "Profile";
            const isExplore = item.name === "Explore";
            const IconComponent = item.icon;

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
                  className="relative bg-transparent outline-none border-none cursor-pointer w-10 h-10 lg:w-11 lg:h-11 text-[13px] lg:text-[14px] [perspective:24em] [transform-style:preserve-3d] [-webkit-tap-highlight-color:transparent] group flex items-center justify-center"
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
                        ? "rotate-[20deg] scale-105 opacity-100 group-hover:[transform:rotate(26deg)_translate3d(-0.35em,-0.35em,0.35em)] border-[#234B3B]/40"
                        : "bg-slate-100 border-slate-200/80 rotate-[14deg] opacity-70 group-hover:opacity-100 group-hover:bg-slate-200/70 group-hover:border-slate-300/80 group-hover:[transform:rotate(24deg)_translate3d(-0.35em,-0.35em,0.35em)]"
                    }`}
                    style={{
                      ...(isActive ? { background: "linear-gradient(135deg, #234B3B, #1b3b2e)" } : {}),
                      boxShadow: isActive
                        ? "0.35em -0.35em 0.9em rgba(35, 75, 59, 0.35), 0 0 12px rgba(35, 75, 59, 0.2)"
                        : "0.35em -0.35em 0.7em rgba(0,0,0,0.05)",
                    }}
                  />

                  {/* 3D Front Glass Layer */}
                  <span
                    className={`absolute top-0 left-0 w-full h-full rounded-[1.1em] transition-[opacity,transform,background-color,border-color] duration-300 ease-[cubic-bezier(0.83,0,0.17,1)] origin-[80%_50%] flex backdrop-blur-xl [-webkit-backdrop-filter:blur(0.75em)] [-moz-backdrop-filter:blur(0.75em)] [will-change:transform] transform ${
                      isActive
                        ? "bg-white/95 border border-white [transform:translate3d(0,0,0.75em)] group-hover:[transform:translate3d(0,0,1.8em)]"
                        : "bg-white/75 border border-white/80 group-hover:[transform:translate3d(0,0,1.8em)] group-hover:bg-white/95"
                    }`}
                    style={{
                      boxShadow: isActive
                        ? "0 0 0 0.1em rgba(255, 255, 255, 0.9) inset, 0 5px 14px rgba(16, 185, 129, 0.15)"
                        : "0 0 0 0.08em rgba(255, 255, 255, 0.9) inset, 0 3px 10px rgba(0,0,0,0.03)",
                    }}
                  >
                    <span className="m-auto w-[1.4em] h-[1.4em] flex items-center justify-center drop-shadow-xs" aria-hidden="true">
                      {isLearning ? (
                        <BookIcon
                          ref={learningIconRef}
                          size={18}
                          className={`w-4.5 h-4.5 transition-colors ${isActive ? "text-[#234B3B] font-bold" : "text-slate-500 group-hover:text-slate-900"}`}
                        />
                      ) : isProfile ? (
                        <UserIcon
                          ref={profileIconRef}
                          size={18}
                          className={`w-4.5 h-4.5 transition-colors ${isActive ? "text-[#234B3B] font-bold" : "text-slate-500 group-hover:text-slate-900"}`}
                        />
                      ) : isExplore ? (
                        <ExploreIcon size={18} className={`w-4.5 h-4.5 transition-colors ${isActive ? "text-[#234B3B] font-bold" : "text-slate-500 group-hover:text-slate-900"}`} />
                      ) : (
                        <IconComponent className={`w-4.5 h-4.5 transition-colors ${isActive ? "text-[#234B3B] font-bold" : "text-slate-500 group-hover:text-slate-900"}`} />
                      )}
                    </span>
                  </span>

                  {/* Sidebar Tooltip Label on Hover */}
                  <span className="absolute left-full ml-3.5 top-1/2 -translate-y-1/2 px-3 py-1.5 rounded-xl bg-slate-900 text-white text-xs font-semibold whitespace-nowrap opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-300 pointer-events-none shadow-xl border border-slate-800 backdrop-blur-xl z-50 flex items-center gap-1.5">
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

      {/* ── Bottom Section: Support System (KEPT AT LAST!) ── */}
      <div className="flex flex-col items-center w-full pt-2 pb-0.5 border-t border-slate-200/70">
        <Link
          href="/support"
          aria-label="Customer Support & Grievance Desk"
          className="relative bg-transparent outline-none border-none cursor-pointer w-10 h-10 lg:w-11 lg:h-11 text-[13px] lg:text-[14px] [perspective:24em] [transform-style:preserve-3d] [-webkit-tap-highlight-color:transparent] group flex items-center justify-center"
        >
          {/* 3D Back Layer */}
          <span
            className={`absolute top-0 left-0 w-full h-full rounded-[1.1em] block border transition-[opacity,transform,background-color,border-color] duration-300 ease-[cubic-bezier(0.83,0,0.17,1)] origin-[100%_100%] [will-change:transform] ${
              isSupportActive
                ? "rotate-[20deg] scale-105 opacity-100 group-hover:[transform:rotate(26deg)_translate3d(-0.35em,-0.35em,0.35em)] border-[#234B3B]/40"
                : "bg-slate-100 border-slate-200/80 rotate-[14deg] opacity-70 group-hover:opacity-100 group-hover:bg-slate-200/70 group-hover:border-slate-300/80 group-hover:[transform:rotate(24deg)_translate3d(-0.35em,-0.35em,0.35em)]"
            }`}
            style={{
              ...(isSupportActive ? { background: "linear-gradient(135deg, #234B3B, #1b3b2e)" } : {}),
              boxShadow: isSupportActive
                ? "0.35em -0.35em 0.9em rgba(35, 75, 59, 0.35), 0 0 12px rgba(35, 75, 59, 0.2)"
                : "0.35em -0.35em 0.7em rgba(0,0,0,0.05)",
            }}
          />

          {/* 3D Front Glass Layer */}
          <span
            className={`absolute top-0 left-0 w-full h-full rounded-[1.1em] transition-[opacity,transform,background-color,border-color] duration-300 ease-[cubic-bezier(0.83,0,0.17,1)] origin-[80%_50%] flex backdrop-blur-xl [-webkit-backdrop-filter:blur(0.75em)] [-moz-backdrop-filter:blur(0.75em)] [will-change:transform] transform ${
              isSupportActive
                ? "bg-white/95 border border-white [transform:translate3d(0,0,0.75em)] group-hover:[transform:translate3d(0,0,1.8em)]"
                : "bg-white/75 border border-white/80 group-hover:[transform:translate3d(0,0,1.8em)] group-hover:bg-white/95"
            }`}
            style={{
              boxShadow: isSupportActive
                ? "0 0 0 0.1em rgba(255, 255, 255, 0.9) inset, 0 5px 14px rgba(16, 185, 129, 0.15)"
                : "0 0 0 0.08em rgba(255, 255, 255, 0.9) inset, 0 3px 10px rgba(0,0,0,0.03)",
            }}
          >
            <span className="m-auto w-[1.4em] h-[1.4em] flex items-center justify-center drop-shadow-xs" aria-hidden="true">
              <LifeBuoy
                className={`w-4.5 h-4.5 transition-colors ${
                  isSupportActive
                    ? "text-[#234B3B] font-bold"
                    : "text-slate-500 group-hover:text-emerald-700"
                }`}
              />
            </span>
          </span>

          {/* Support Tooltip */}
          <span className="absolute left-full ml-3.5 top-1/2 -translate-y-1/2 px-3 py-1.5 rounded-xl bg-slate-900 text-white text-xs font-semibold whitespace-nowrap opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-300 pointer-events-none shadow-xl border border-slate-800 backdrop-blur-xl z-50 flex items-center gap-1.5">
            Support & Help
            {isSupportActive && (
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            )}
          </span>
        </Link>
      </div>
    </motion.aside>
  );
}
