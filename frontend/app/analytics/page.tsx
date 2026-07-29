"use client";

import React from "react";
import { BarChart3, TrendingUp, Zap, Clock, Award, Target } from "lucide-react";
import { motion } from "framer-motion";

const stats = [
  {
    label: "Weekly Study Hours",
    value: "18.5 hrs",
    icon: Clock,
    color: "#06b6d4",
    sub: "+12% from last week",
    subIcon: TrendingUp,
  },
  {
    label: "Submission Speed",
    value: "14 mins",
    icon: Zap,
    color: "#f59e0b",
    sub: "Faster than 84% users",
    subIcon: Award,
  },
  {
    label: "AI Career Health",
    value: "23%",
    icon: BarChart3,
    color: "#8b5cf6",
    sub: "Progressing well",
    subIcon: Target,
  },
];

export default function AnalyticsPage() {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-6xl mx-auto space-y-8">
      <motion.div
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex items-center gap-3"
      >
        <div className="p-3 rounded-2xl bg-purple-500/10 border border-purple-500/20 text-purple-400">
          <BarChart3 className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-white">Performance Analytics</h1>
          <p className="text-sm text-slate-400 mt-0.5">Deep insights into your study metrics & accuracy</p>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {stats.map((s, i) => {
          const Icon = s.icon;
          const SubIcon = s.subIcon;
          return (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ delay: 0.1 + i * 0.1, duration: 0.5, ease: "easeOut" as const }}
              whileHover={{ y: -5, transition: { duration: 0.2 } }}
              className="glass shimmer-card gradient-border rounded-2xl p-6 relative overflow-hidden"
            >
              <div className="flex items-start justify-between mb-4">
                <div
                  className="p-3 rounded-xl"
                  style={{ background: `${s.color}18`, border: `1px solid ${s.color}30` }}
                >
                  <Icon className="w-5 h-5" style={{ color: s.color }} />
                </div>
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                  {s.label}
                </span>
              </div>
              <div className="text-4xl font-black text-white tracking-tight mb-3" style={{ fontFeatureSettings: '"tnum"' }}>
                {s.value}
              </div>
              <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-400">
                <SubIcon className="w-3.5 h-3.5" />
                {s.sub}
              </div>
              {/* Bottom glow strip */}
              <div
                className="absolute bottom-0 left-0 right-0 h-[2px]"
                style={{ background: `linear-gradient(90deg, transparent, ${s.color}, transparent)`, opacity: 0.5 }}
              />
              {/* Ambient radial */}
              <div
                className="absolute inset-0 pointer-events-none rounded-2xl"
                style={{ background: `radial-gradient(ellipse at 80% 120%, ${s.color}12 0%, transparent 60%)` }}
              />
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}

