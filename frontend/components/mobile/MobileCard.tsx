"use client";

import React from "react";
import { motion } from "framer-motion";

interface MobileCardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  badge?: string;
  badgeColor?: string;
}

export default function MobileCard({
  children,
  className = "",
  onClick,
  badge,
  badgeColor = "bg-blue-500/20 text-blue-300 border-blue-500/30",
}: MobileCardProps) {
  return (
    <motion.div
      whileTap={onClick ? { scale: 0.98 } : undefined}
      onClick={onClick}
      className={`glass rounded-[20px] p-4 border border-white/10 bg-[#0d162d]/70 shadow-lg relative overflow-hidden transition-all ${
        onClick ? "cursor-pointer active:border-blue-500/40" : ""
      } ${className}`}
    >
      {badge && (
        <div className="absolute top-3 right-3 z-10">
          <span
            className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border tracking-wide uppercase ${badgeColor}`}
          >
            {badge}
          </span>
        </div>
      )}
      {children}
    </motion.div>
  );
}
