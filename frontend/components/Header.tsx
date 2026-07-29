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
      className="flex flex-col md:flex-row md:items-start justify-between gap-6 mb-8"
    >
      {/* Left: Title block */}
      <div>
        <div className="flex items-center gap-3 flex-wrap">
          <motion.h1
            className="text-3xl md:text-4xl font-black tracking-tight text-white"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1, duration: 0.5 }}
          >
            Welcome back,{" "}
            <span className="gradient-text">{userName}!</span>
          </motion.h1>

          {/* Active badge */}
          <motion.span
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3, type: "spring", stiffness: 400 }}
            className="status-active inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold tracking-wider uppercase"
          >
            <span className="relative flex w-2 h-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400" />
            </span>
            Active
          </motion.span>
        </div>

        <motion.p
          className="text-slate-500 text-sm mt-2 font-medium"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.4 }}
        >
          Track your progress and get personalized recommendations.
        </motion.p>
      </div>

      {/* Right: Controls */}
      <motion.div
        className="flex items-center gap-3"
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.2, duration: 0.5 }}
      >
        {/* Timeframe dropdown */}
        <div className="relative">
          <button
            id="timeframe-dropdown"
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center gap-2 px-4 py-2.5 glass rounded-xl text-sm font-semibold text-slate-200 hover:text-white transition-all hover:border-blue-500/30 min-w-[130px]"
          >
            <span>{timeframe}</span>
            <motion.div animate={{ rotate: dropdownOpen ? 180 : 0 }} transition={{ duration: 0.2 }}>
              <ChevronDown className="w-4 h-4 text-slate-400" />
            </motion.div>
          </button>

          <AnimatePresence>
            {dropdownOpen && (
              <motion.div
                initial={{ opacity: 0, y: -8, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -8, scale: 0.95 }}
                transition={{ duration: 0.15, ease: "easeOut" }}
                className="absolute right-0 mt-2 w-44 glass-strong rounded-xl shadow-2xl shadow-black/40 py-1.5 z-50"
              >
                {options.map((option) => (
                  <button
                    key={option}
                    onClick={() => {
                      setTimeframe(option);
                      setDropdownOpen(false);
                    }}
                    className={`w-full text-left px-4 py-2.5 text-sm font-medium transition-all rounded-lg mx-1 ${
                      timeframe === option
                        ? "text-blue-400 bg-blue-500/10"
                        : "text-slate-300 hover:text-white hover:bg-white/5"
                    }`}
                  >
                    {option}
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Notification bell */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="relative p-2.5 glass rounded-xl text-slate-300 hover:text-white transition-colors"
        >
          <Bell className="w-5 h-5" />
          <motion.span
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ repeat: Infinity, duration: 2, delay: 1 }}
            className="absolute top-2 right-2 w-2 h-2 bg-amber-400 rounded-full ring-2 ring-[#060c18]"
          />
        </motion.button>
      </motion.div>
    </motion.header>
  );
}

