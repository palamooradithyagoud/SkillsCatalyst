"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Film,
  Briefcase,
  Compass,
  Plus,
  Bot,
  ListTodo,
  Target,
  BookOpen,
  X,
} from "lucide-react";
import Home3DIcon from "@/components/icons/Home3DIcon";

interface DockItem {
  id: string;
  name: string;
  url: string;
  icon: React.ElementType;
}

const DOCK_ITEMS: DockItem[] = [
  { id: "home", name: "Home", url: "/dashboard", icon: Home3DIcon },
  { id: "skillbits", name: "SkillBits", url: "/skillbits", icon: Film },
  { id: "career", name: "Career", url: "/career", icon: Briefcase },
  { id: "explore", name: "Explore", url: "/explore", icon: Compass },
];

const QUICK_ACTIONS = [
  {
    title: "Ask AI Mentor",
    desc: "Instant code & career assistance",
    url: "/ai-mentor",
    icon: Bot,
  },
  {
    title: "To-Do Checklist",
    desc: "Personal study & tasks",
    url: "/tasks",
    icon: ListTodo,
  },
  {
    title: "Daily Practice",
    desc: "Company questions & aptitude tests",
    url: "/practice",
    icon: Target,
  },
  {
    title: "Learning Tracks",
    desc: "Structured video tracks & playlists",
    url: "/learning",
    icon: BookOpen,
  },
];

export default function DashboardMobileDock({ className = "" }: { className?: string }) {
  const pathname = usePathname();
  const router = useRouter();
  const [isActionsOpen, setIsActionsOpen] = useState(false);

  const isCurrentActive = (item: DockItem) => {
    if (item.url === "/dashboard") {
      return pathname === "/dashboard" || pathname === "/";
    }
    if (item.id === "career") {
      return pathname.startsWith("/career") || pathname.startsWith("/roadmaps");
    }
    return pathname.startsWith(item.url);
  };

  return (
    <>
      {/* ── Quick Action Bottom Sheet Backdrop ── */}
      <AnimatePresence>
        {isActionsOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsActionsOpen(false)}
              className="md:hidden fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
            />

            {/* Quick Action Sheet floating right above dock */}
            <motion.div
              initial={{ opacity: 0, y: 30, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.95 }}
              transition={{ type: "spring", damping: 25, stiffness: 350 }}
              className="md:hidden fixed bottom-24 inset-x-4 z-50 max-w-sm mx-auto p-4 rounded-3xl bg-white/95 dark:bg-[#16161a]/95 border border-black/10 dark:border-white/10 shadow-2xl backdrop-blur-2xl"
            >
              {/* Header without flower icon */}
              <div className="flex items-center justify-between pb-3 mb-2 border-b border-black/5 dark:border-white/10">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-neutral-300">
                  Quick Actions
                </span>
                <button
                  type="button"
                  onClick={() => setIsActionsOpen(false)}
                  className="p-1 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors cursor-pointer"
                >
                  <X size={16} />
                </button>
              </div>

              {/* Action rows with solid neutral icons, zero glass, zero colored background */}
              <div className="grid grid-cols-1 gap-2">
                {QUICK_ACTIONS.map((action) => {
                  const Icon = action.icon;
                  return (
                    <button
                      key={action.title}
                      type="button"
                      onClick={() => {
                        setIsActionsOpen(false);
                        router.push(action.url);
                      }}
                      className="w-full flex items-center gap-3 p-2.5 rounded-2xl hover:bg-black/5 dark:hover:bg-white/5 transition-all text-left group active:scale-98 cursor-pointer"
                    >
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 bg-neutral-100 dark:bg-neutral-800/80 border border-neutral-200 dark:border-neutral-700/60 text-neutral-800 dark:text-neutral-200 group-hover:text-black dark:group-hover:text-white transition-colors">
                        <Icon size={18} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-slate-900 dark:text-white truncate">
                          {action.title}
                        </p>
                        <p className="text-[11px] text-slate-500 dark:text-neutral-400 truncate">
                          {action.desc}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ── Floating Capsule Dock & FAB ── */}
      <nav
        aria-label="Dashboard Mobile Navigation"
        data-bottom-nav="true"
        className={`md:hidden fixed bottom-5 inset-x-0 z-40 flex items-center justify-center gap-3 px-4 pointer-events-none select-none pb-[env(safe-area-inset-bottom,0px)] ${className}`}
      >
        {/* Elongated Capsule Pill with Glassmorphism Transparent Blur */}
        <div className="pointer-events-auto flex-1 max-w-[320px] h-[62px] rounded-full bg-black/45 dark:bg-black/55 backdrop-blur-2xl backdrop-saturate-180 border border-white/25 dark:border-white/15 shadow-[inset_0_1px_1px_rgba(255,255,255,0.25),0_12px_36px_rgba(0,0,0,0.5)] flex items-center justify-around px-2 py-1 transition-all">
          {DOCK_ITEMS.map((item) => {
            const Icon = item.icon;
            const active = isCurrentActive(item);

            return (
              <Link
                key={item.id}
                href={item.url}
                aria-label={item.name}
                className={`group flex flex-col items-center justify-center flex-1 py-1 transition-transform active:scale-95 ${
                  active
                    ? "text-[#D5FF38]"
                    : "text-white/70 hover:text-white dark:text-neutral-300 dark:hover:text-white"
                }`}
              >
                {item.id === "home" ? (
                  <Icon
                    size={21}
                    active={active}
                    className={`transition-colors ${
                      active
                        ? "stroke-[#D5FF38] text-[#D5FF38]"
                        : "stroke-[2.1] stroke-current fill-none text-white/70 hover:text-white dark:text-neutral-300 dark:hover:text-white"
                    }`}
                  />
                ) : (
                  <Icon
                    size={21}
                    className={`transition-colors ${
                      active
                        ? "stroke-[#D5FF38] stroke-[2.4]"
                        : "stroke-[2.1] stroke-current fill-none"
                    }`}
                  />
                )}
                <span
                  className={`text-[10.5px] tracking-tight leading-tight mt-0.5 select-none transition-colors ${
                    active
                      ? "font-extrabold text-[#D5FF38]"
                      : "font-semibold text-white/70 group-hover:text-white dark:text-neutral-300 dark:group-hover:text-white"
                  }`}
                >
                  {item.name}
                </span>
              </Link>
            );
          })}
        </div>

        {/* Acid Lime Action Button '+' without any glow effect */}
        <button
          type="button"
          onClick={() => setIsActionsOpen(!isActionsOpen)}
          aria-label="Quick Actions"
          aria-expanded={isActionsOpen}
          className="pointer-events-auto w-14 h-14 rounded-full bg-[#D5FF38] hover:bg-[#c8f526] text-black flex items-center justify-center shadow-md border border-black/10 dark:border-white/10 active:scale-95 transition-all shrink-0 cursor-pointer"
        >
          <motion.div
            animate={{ rotate: isActionsOpen ? 45 : 0 }}
            transition={{ type: "spring", damping: 15, stiffness: 250 }}
          >
            <Plus size={26} strokeWidth={2.8} />
          </motion.div>
        </button>
      </nav>
    </>
  );
}
