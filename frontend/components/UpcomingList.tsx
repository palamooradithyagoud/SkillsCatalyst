"use client";

import React from "react";
import { Calendar, Monitor, Code2 } from "lucide-react";
import { motion } from "framer-motion";

interface UpcomingItem {
  id: string;
  title: string;
  subtitle: string;
  date: string;
  type: "calendar" | "system" | "code";
}

const defaultItems: UpcomingItem[] = [
  { id: "1", title: "Mock Interview", subtitle: "Behavioral Round", date: "May 24, 5:00 PM", type: "calendar" },
  { id: "2", title: "System Design", subtitle: "Rate Limiter Design", date: "May 26, 7:00 PM", type: "system" },
  { id: "3", title: "DSA Practice", subtitle: "Arrays & Hashing", date: "May 26, 6:00 PM", type: "code" },
];

const typeConfig = {
  calendar: {
    icon: Calendar,
    bg: "bg-blue-500/10 border border-blue-500/20",
    iconColor: "text-blue-400",
    glow: "rgba(59,130,246,0.15)",
    dot: "bg-blue-400",
  },
  system: {
    icon: Monitor,
    bg: "bg-indigo-500/10 border border-indigo-500/20",
    iconColor: "text-indigo-400",
    glow: "rgba(99,102,241,0.15)",
    dot: "bg-indigo-400",
  },
  code: {
    icon: Code2,
    bg: "bg-emerald-500/10 border border-emerald-500/20",
    iconColor: "text-emerald-400",
    glow: "rgba(16,185,129,0.15)",
    dot: "bg-emerald-400",
  },
};

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.3 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, x: -20 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.4, ease: "easeOut" as const } },
};

export default function UpcomingList({ items = defaultItems }: { items?: UpcomingItem[] }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5, duration: 0.5, ease: "easeOut" as const }}
      className="glass rounded-2xl p-6 h-full flex flex-col"
    >
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-bold text-white">Upcoming</h2>
        <span className="text-xs font-semibold px-2.5 py-1 glass rounded-full text-slate-400">
          {items.length} events
        </span>
      </div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="space-y-3 flex-1"
      >
        {items.map((item) => {
          const config = typeConfig[item.type];
          const Icon = config.icon;

          return (
            <motion.div
              key={item.id}
              variants={itemVariants}
              whileHover={{ x: 4, transition: { duration: 0.2 } }}
              className="upcoming-item flex items-center gap-4 p-4 cursor-pointer"
            >
              <div className={`p-2.5 rounded-xl ${config.bg} shrink-0`}>
                <Icon className={`w-5 h-5 ${config.iconColor}`} />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-bold text-white truncate">{item.title}</h4>
                <p className="text-xs text-slate-400 mt-0.5 truncate">{item.subtitle}</p>
              </div>
              <div className="text-right shrink-0">
                <div className={`w-2 h-2 rounded-full ${config.dot} mx-auto mb-1.5 animate-pulse`} />
                <p className="text-[10px] font-semibold text-slate-500 whitespace-nowrap">{item.date}</p>
              </div>
            </motion.div>
          );
        })}
      </motion.div>
    </motion.div>
  );
}

