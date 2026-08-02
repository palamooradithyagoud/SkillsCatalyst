"use client";

import React from "react";
import { motion } from "framer-motion";
import ExploreButton from "@/components/ExploreButton";

export default function ExplorePage() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="max-w-6xl mx-auto space-y-6"
    >
      {/* ── Header with Explore Button ── */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 glass p-6 rounded-2xl">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">Explore</h1>
          <p className="text-slate-400 text-sm mt-1">Discover new skills, resources, and career pathways.</p>
        </div>
        <ExploreButton />
      </div>

      {/* ── Clean Empty Container (No data pre-filled) ── */}
      <div className="glass rounded-2xl p-12 flex flex-col items-center justify-center text-center min-h-[400px] border border-dashed border-slate-700/50">
        <ExploreButton text="Explore Now" className="mb-4" />
        <h2 className="text-lg font-semibold text-slate-200">Nothing to display yet</h2>
        <p className="text-sm text-slate-400 max-w-md mt-1">
          This section is clean and ready for your custom data.
        </p>
      </div>
    </motion.div>
  );
}
