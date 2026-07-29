"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { TrendingUp, Award, Swords } from "lucide-react";

interface PracticeOverviewProps {
  problemsSolved?: number;
  successRate?: number;
  contests?: number;
}

const chartData = [
  { day: "Mon", height: 40 },
  { day: "Tue", height: 65 },
  { day: "Wed", height: 50 },
  { day: "Thu", height: 90 },
  { day: "Fri", height: 75 },
  { day: "Sat", height: 100 },
  { day: "Sun", height: 80 },
];

interface StatCardProps {
  value: string;
  label: string;
  icon: React.ReactNode;
  color: string;
  delay: number;
}

function StatCard({ value, label, icon, color, delay }: StatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay, duration: 0.4, ease: "easeOut" as const }}
      className="relative overflow-hidden rounded-xl p-4"
      style={{ background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.06)" }}
    >
      <div className="flex items-start justify-between">
        <div>
          <div className="text-3xl font-black text-white tracking-tight tabular-nums">{value}</div>
          <div className="text-[11px] font-bold text-slate-400 tracking-widest uppercase mt-1">{label}</div>
        </div>
        <div
          className="p-2 rounded-lg"
          style={{ background: `${color}18`, border: `1px solid ${color}30` }}
        >
          {icon}
        </div>
      </div>
      {/* Subtle bottom glow */}
      <div
        className="absolute bottom-0 left-0 right-0 h-[2px] rounded-b-xl"
        style={{ background: `linear-gradient(90deg, transparent, ${color}, transparent)`, opacity: 0.4 }}
      />
    </motion.div>
  );
}

export default function PracticeOverview({
  problemsSolved = 117,
  successRate = 91,
  contests = 0,
}: PracticeOverviewProps) {
  const [barsVisible, setBarsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setBarsVisible(true), 600);
    return () => clearTimeout(timer);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.55, duration: 0.5, ease: "easeOut" as const }}
      className="glass rounded-2xl p-6 h-full flex flex-col"
    >
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-bold text-white">Practice Overview</h2>
        <span className="text-xs font-semibold px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
          <TrendingUp className="w-3 h-3 inline mr-1" />
          Active
        </span>
      </div>

      {/* Stat blocks */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <StatCard
          value={String(problemsSolved)}
          label="Problems Solved"
          icon={<Award className="w-4 h-4 text-blue-400" />}
          color="#3b82f6"
          delay={0.6}
        />
        <StatCard
          value={`${successRate}%`}
          label="Success Rate"
          icon={<TrendingUp className="w-4 h-4 text-emerald-400" />}
          color="#10b981"
          delay={0.65}
        />
        <StatCard
          value={String(contests)}
          label="Contests"
          icon={<Swords className="w-4 h-4 text-purple-400" />}
          color="#8b5cf6"
          delay={0.7}
        />
      </div>

      {/* Chart */}
      <div className="flex-1 flex flex-col justify-end">
        <div className="flex items-end justify-between gap-2 h-28 pb-0">
          {chartData.map((bar, i) => (
            <div key={bar.day} className="flex-1 flex flex-col items-center gap-1.5">
              <motion.div
                className="chart-bar w-full"
                style={{ height: barsVisible ? `${bar.height}%` : "0%" }}
                initial={{ height: "0%" }}
                animate={{ height: barsVisible ? `${bar.height}%` : "0%" }}
                transition={{ delay: 0.75 + i * 0.07, duration: 0.5, ease: "easeOut" }}
              />
            </div>
          ))}
        </div>
        {/* Bottom border */}
        <div className="h-[1px] w-full bg-gradient-to-r from-transparent via-blue-500/40 to-transparent mb-2" />
        <div className="flex justify-between px-0.5">
          {chartData.map((bar) => (
            <div key={bar.day} className="flex-1 text-center text-[10px] font-semibold text-slate-500">
              {bar.day}
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}

