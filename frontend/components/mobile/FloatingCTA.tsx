"use client";

import React from "react";
import { motion } from "framer-motion";

interface FloatingCTAProps {
  onClick: () => void;
  icon: React.ReactNode;
  label?: string;
  className?: string;
}

export default function FloatingCTA({
  onClick,
  icon,
  label,
  className = "",
}: FloatingCTAProps) {
  return (
    <div className="fixed bottom-20 right-4 z-40 md:hidden pb-[env(safe-area-inset-bottom)]">
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.92 }}
        onClick={onClick}
        className={`flex items-center gap-2.5 px-4 py-3.5 rounded-full bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white font-bold text-xs shadow-xl shadow-blue-500/30 border border-white/20 backdrop-blur-xl ${className}`}
      >
        <div className="w-5 h-5 flex items-center justify-center shrink-0">
          {icon}
        </div>
        {label && <span className="tracking-wide pr-1">{label}</span>}
      </motion.button>
    </div>
  );
}
