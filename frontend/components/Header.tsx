"use client";

import React from "react";
import { Bell } from "lucide-react";
import { motion } from "framer-motion";

interface HeaderProps {
  userName?: string;
}

export default function Header({ userName = "Palamoor" }: HeaderProps) {
  return (
    <motion.header
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" as const }}
      className="flex flex-row items-center justify-between gap-3 sm:gap-6 mb-0 sm:mb-1 pt-0"
    >
      {/* Left: Title block with Dark Charcoal (#18191F) + Vibrant Purple/Blue (#5227FF) */}
      <div className="flex-1 min-w-0">
        <motion.h1
          className="text-base sm:text-lg md:text-xl font-extrabold tracking-tight text-[#18191F] leading-tight"
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1, duration: 0.35 }}
        >
          <span>Welcome back, </span>
          <span className="text-[#5227FF]">{userName}!</span>
        </motion.h1>
      </div>

      {/* Right: Actions (Notification Bell on Top Bar for Desktop) */}
      <motion.div
        className="hidden md:flex items-center gap-2 sm:gap-3 shrink-0 pt-0.5"
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.2, duration: 0.5 }}
      >
        {/* Notification Bell Button */}
        <motion.button
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.94 }}
          className="relative w-9 h-9 sm:w-11 sm:h-11 bg-white rounded-full border border-slate-200/80 shadow-xs flex items-center justify-center text-slate-700 hover:text-[#5227FF] hover:border-[#5227FF]/40 hover:shadow-md transition-all cursor-pointer group"
          title="Notifications"
        >
          <motion.div
            animate={{ rotate: [0, -14, 14, -8, 8, 0] }}
            transition={{ repeat: Infinity, repeatDelay: 4, duration: 1.2, ease: "easeInOut" }}
          >
            <Bell className="w-4 h-4 sm:w-5 sm:h-5 stroke-[2] group-hover:text-[#5227FF] transition-colors" />
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


