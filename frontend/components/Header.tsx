"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Bell, ChevronDown, Search, HelpCircle } from "lucide-react";
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
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" as const }}
      className="flex flex-row items-center justify-between gap-3 sm:gap-6 mb-0 sm:mb-1 pt-0"
    >
      {/* Left: Title block */}
      <div className="flex-1 min-w-0">
        <motion.h1
          className="text-base sm:text-lg md:text-xl font-extrabold tracking-tight text-slate-900 leading-tight"
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1, duration: 0.35 }}
        >
          Welcome back,{" "}
          <span className="text-[#234B3B]">{userName}!</span>
        </motion.h1>
      </div>

      {/* Right: Actions (Support + Notifications) */}
      <motion.div
        className="flex items-center gap-2 sm:gap-3 shrink-0 pt-0.5"
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.2, duration: 0.5 }}
      >
        {/* Customer Support & Help Desk Button */}
        <Link href="/support" title="Customer Service & Support Desk">
          <motion.div
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.94 }}
            className="relative w-9 h-9 sm:w-11 sm:h-11 bg-white rounded-full border border-slate-200/80 shadow-xs flex items-center justify-center text-slate-700 hover:text-[#234B3B] hover:border-slate-300 hover:shadow-md transition-all cursor-pointer group"
          >
            <HelpCircle className="w-4 h-4 sm:w-5 sm:h-5 stroke-[2] group-hover:text-[#234B3B] transition-colors" />
          </motion.div>
        </Link>

        {/* Notification Bell Button */}
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


