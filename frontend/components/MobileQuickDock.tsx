"use client";

import React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutGrid,
  Map,
  Target,
  Briefcase,
  BarChart3,
  Code2,
  Telescope,
} from "lucide-react";
import { motion } from "framer-motion";

import ThreeDSquircleTile from "@/components/ThreeDSquircleTile";
import BookIcon from "@/components/icons/BookIcon";
import UserIcon from "@/components/icons/UserIcon";
import ExploreIcon from "@/components/icons/ExploreIcon";
import { useAuth } from "@/lib/auth";

export default function MobileQuickDock() {
  const pathname = usePathname();
  const router = useRouter();
  const { session } = useAuth();

  const userEmail = session?.email || "Guest";
  const userInitial = userEmail.split("@")[0].substring(0, 2).toUpperCase() || "AD";

  const dockItems = [
    {
      id: "code",
      name: "Code",
      href: "/practice",
      text: "</>",
      filled: true,
      badge: true,
      desc: "Practice",
    },
    {
      id: "dashboard",
      name: "Dashboard",
      href: "/dashboard",
      icon: LayoutGrid,
      desc: "Overview",
    },
    {
      id: "learning",
      name: "Learning",
      href: "/learning",
      icon: BookIcon,
      desc: "Courses",
    },
    {
      id: "roadmaps",
      name: "Roadmaps",
      href: "/roadmaps",
      icon: Map,
      desc: "Tracks",
    },
    {
      id: "practice",
      name: "Practice",
      href: "/practice",
      icon: Target,
      desc: "Coding",
    },
    {
      id: "career",
      name: "Career",
      href: "/career",
      icon: Briefcase,
      desc: "Resume",
    },
    {
      id: "explore",
      name: "Mentor",
      href: "/ai-mentor",
      icon: Telescope,
      desc: "AI Assistant",
    },
    {
      id: "analytics",
      name: "Analytics",
      href: "/analytics",
      icon: BarChart3,
      desc: "Metrics",
    },
    {
      id: "profile",
      name: "Profile",
      href: "/settings",
      icon: UserIcon,
      desc: "Account",
    },
    {
      id: "avatar",
      name: "User",
      href: "/settings",
      text: userInitial,
      desc: "Settings",
    },
  ];

  return (
    <div className="md:hidden w-full mb-6">
      <div className="flex items-center justify-between px-1 mb-2.5">
        <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          Quick Navigation
        </h2>
        <span className="text-[11px] font-semibold text-slate-400">Swipe →</span>
      </div>

      {/* Horizontal Scrollable 3D Tile Dock Container */}
      <div className="overflow-x-auto no-scrollbar py-2 px-1 -mx-1 flex items-center gap-4 scroll-smooth">
        {dockItems.map((item, index) => {
          const isActive =
            pathname === item.href ||
            (pathname === "/" && item.href === "/dashboard");

          return (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.04, duration: 0.3 }}
              className="flex flex-col items-center gap-1.5 shrink-0"
            >
              <ThreeDSquircleTile
                icon={item.icon}
                text={item.text}
                isActive={isActive}
                filled={item.filled}
                badge={item.badge}
                size="md"
                label={item.name}
                onClick={() => router.push(item.href)}
              />
              <span
                className={`text-[10px] font-bold tracking-tight text-center leading-none ${
                  isActive ? "text-[#234B3B]" : "text-slate-600"
                }`}
              >
                {item.name}
              </span>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
