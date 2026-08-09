"use client";

import React, { useState } from "react";
import { Bell, ChevronDown, Search } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface HeaderProps {
  userName?: string;
}

export default function Header({ userName = "Palamoor" }: HeaderProps) {
  const [timeframe, setTimeframe] = useState("This Week");
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const options = ["Today", "This Week", "This Month", "All Time"];

  return (
    <motion.header
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" as const }}
      className="flex flex-row items-start justify-between gap-3 sm:gap-6 mb-4 sm:mb-8"
    >
      {/* Left: Title block */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
          <motion.h1
            className="text-xl sm:text-3xl md:text-4xl font-black tracking-tight text-slate-900 leading-tight"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1, duration: 0.5 }}
          >
            Welcome back,{" "}
            <span className="text-[#234B3B]">{userName}!</span>
          </motion.h1>

          {/* Active badge */}
          <motion.span
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3, type: "spring", stiffness: 400 }}
            className="inline-flex items-center gap-1 px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-full text-[10px] sm:text-xs font-bold tracking-wider uppercase bg-emerald-100 text-emerald-800 shrink-0"
          >
            <span className="relative flex w-2 h-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-600" />
            </span>
            Active
          </motion.span>
        </div>

        <motion.p
          className="text-slate-500 text-xs sm:text-sm mt-1 font-medium leading-normal"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.4 }}
        >
          Track your progress and get personalized recommendations.
        </motion.p>
      </div>

      {/* Right: Notification Bell Button */}
      <motion.div
        className="flex items-center gap-2 shrink-0 pt-0.5"
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.2, duration: 0.5 }}
      >
        <motion.button
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.94 }}
          className="relative w-9 h-9 sm:w-11 sm:h-11 bg-white rounded-full border border-slate-200/80 shadow-xs flex items-center justify-center text-slate-700 hover:text-[#234B3B] hover:border-slate-300 hover:shadow-md transition-all cursor-pointer group"
          title="Notifications"
        >
          <motion.div
            animate={{ rotate: [0, -14, 14, -8, 8, 0] }}
            transition={{ repeat: Infinity, repeatDelay: 4, duration: 1.2, ease: "easeInOut" }}
          >
            <Bell className="w-4 h-4 sm:w-5 sm:h-5 stroke-[2] group-hover:text-[#234B3B] transition-colors" />
          </motion.div>
          <motion.span
            animate={{ scale: [1, 1.25, 1] }}
            transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
            className="absolute top-2 sm:top-2.5 right-2 sm:right-2.5 w-2 h-2 sm:w-2.5 sm:h-2.5 bg-[#EAB308] rounded-full ring-2 ring-white shadow-xs"
          />
        </motion.button>
      </motion.div>
    </motion.header>
  );
}

