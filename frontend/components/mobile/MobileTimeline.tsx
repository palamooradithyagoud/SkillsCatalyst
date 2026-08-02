"use client";

import React from "react";
import { ChevronRight, CheckCircle2, Clock } from "lucide-react";
import { motion } from "framer-motion";

export interface TimelineItem {
  id: string | number;
  title: string;
  category?: string;
  timestamp?: string;
  status?: "completed" | "in-progress" | "pending";
  badge?: string;
  meta?: string;
  onClick?: () => void;
}

interface MobileTimelineProps {
  items: TimelineItem[];
  emptyMessage?: string;
}

export default function MobileTimeline({
  items,
  emptyMessage = "No items recorded yet.",
}: MobileTimelineProps) {
  if (items.length === 0) {
    return (
      <div className="p-6 text-center text-xs text-slate-400 glass rounded-2xl">
        {emptyMessage}
      </div>
    );
  }

  return (
    <div className="space-y-2.5">
      {items.map((item, idx) => {
        const isCompleted = item.status === "completed" || !item.status;

        return (
          <motion.div
            key={item.id || idx}
            whileTap={item.onClick ? { scale: 0.98 } : undefined}
            onClick={item.onClick}
            className={`p-3.5 rounded-2xl glass border border-white/10 flex items-center justify-between gap-3 ${
              item.onClick ? "cursor-pointer active:bg-white/10" : ""
            }`}
          >
            <div className="flex items-center gap-3 min-w-0">
              <div
                className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                  isCompleted
                    ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30"
                    : "bg-amber-500/15 text-amber-400 border border-amber-500/30"
                }`}
              >
                {isCompleted ? (
                  <CheckCircle2 className="w-5 h-5" />
                ) : (
                  <Clock className="w-5 h-5" />
                )}
              </div>

              <div className="min-w-0">
                <span className="block text-xs font-bold text-white truncate leading-tight">
                  {item.title}
                </span>
                <div className="flex items-center gap-2 mt-1">
                  {item.category && (
                    <span className="text-[10px] font-semibold text-slate-400 truncate">
                      {item.category}
                    </span>
                  )}
                  {item.meta && (
                    <span className="text-[10px] text-slate-500 truncate">
                      • {item.meta}
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              {item.badge && (
                <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-blue-500/15 text-blue-300 border border-blue-500/30">
                  {item.badge}
                </span>
              )}
              {item.onClick && <ChevronRight className="w-4 h-4 text-slate-500" />}
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
