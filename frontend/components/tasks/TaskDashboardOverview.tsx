"use client";

import React from "react";
import {
  Calendar,
  CheckCircle2,
  Clock,
  AlertCircle,
  ListTodo,
} from "lucide-react";
import { TaskMetrics, TaskView } from "@/types/task";

interface TaskDashboardOverviewProps {
  metrics: TaskMetrics;
  upcomingCount?: number;
  onViewChange?: (view: TaskView) => void;
  activeView?: string;
}

export default function TaskDashboardOverview({
  metrics,
  upcomingCount = 0,
  onViewChange,
  activeView = "all",
}: TaskDashboardOverviewProps) {
  const {
    dueTodayCount,
    overdueCount,
    completedCount,
    totalCount,
    completionPercentage,
  } = metrics;

  // Format number as 2 digits matching Image 2 (e.g. 15, 05, 04, 12, 00)
  const formatTwoDigit = (n: number) => {
    const val = Math.max(0, n);
    return val < 10 ? `0${val}` : `${val}`;
  };

  // 1. Today, 2. Completed, 3. Upcoming, 4. Past Due
  const cards = [
    {
      id: "today" as TaskView,
      title: "Today",
      count: dueTodayCount,
      icon: Calendar,
      isActive: activeView === "today",
      ariaLabel: `Filter by ${dueTodayCount} tasks due today`,
    },
    {
      id: "completed" as TaskView,
      title: "Completed",
      count: completedCount,
      icon: CheckCircle2,
      isActive: activeView === "completed",
      ariaLabel: `Filter by ${completedCount} completed tasks`,
    },
    {
      id: "upcoming" as TaskView,
      title: "Upcoming",
      count: upcomingCount,
      icon: Clock,
      isActive: activeView === "upcoming",
      ariaLabel: `Filter by ${upcomingCount} upcoming tasks`,
    },
    {
      id: "past_due" as TaskView,
      title: "Past Due",
      count: overdueCount,
      icon: AlertCircle,
      isActive: activeView === "past_due",
      ariaLabel: `Filter by ${overdueCount} past due tasks`,
    },
  ];

  return (
    <div className="w-full space-y-3 sm:space-y-3.5">
      {/* ── 4 Bento Metric Cards (2x2 on Mobile, 4 Columns on Desktop) ── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 sm:gap-4">
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <button
              key={card.title}
              type="button"
              onClick={() => onViewChange?.(card.id)}
              aria-label={card.ariaLabel}
              className={`relative overflow-hidden p-3 sm:p-5 rounded-[20px] sm:rounded-[28px] text-left transition-all duration-200 cursor-pointer group shadow-[0_4px_24px_rgba(93,100,217,0.06)] hover:shadow-md hover:-translate-y-0.5 ${
                card.isActive
                  ? "bg-white/95 dark:bg-[#18191F] ring-2 ring-[#5D64D9] dark:ring-[#B892FF] border border-[#5D64D9]/40 dark:border-[#B892FF]/40 shadow-[0_4px_24px_rgba(184,146,255,0.15)]"
                  : "bg-white/80 dark:bg-[#18191F] backdrop-blur-md border border-white/80 dark:border-neutral-800 hover:border-[#5D64D9]/40 dark:hover:border-[#B892FF]/40 hover:dark:shadow-[0_4px_20px_rgba(184,146,255,0.08)]"
              }`}
            >
              {/* Subtle organic wavy background watermark */}
              <div
                aria-hidden="true"
                className="absolute -right-5 -bottom-5 w-24 h-24 rounded-full bg-[#5D64D9]/5 dark:bg-[#B892FF]/10 blur-xl pointer-events-none group-hover:scale-125 transition-transform"
              />
              <svg
                aria-hidden="true"
                className="absolute right-0 bottom-0 w-24 h-20 text-[#5D64D9]/5 dark:text-[#B892FF]/10 pointer-events-none"
                viewBox="0 0 100 80"
                fill="none"
              >
                <path
                  d="M0 50 C 30 20, 70 80, 100 40 L 100 80 L 0 80 Z"
                  fill="currentColor"
                />
              </svg>

              {/* Top Row: Circular Icon Badge + Label */}
              <div className="relative z-10 flex items-center gap-2 sm:gap-2.5">
                <div className="w-7 h-7 sm:w-9 sm:h-9 rounded-full bg-white dark:bg-[#121318] shadow-xs border border-slate-100 dark:border-neutral-800 flex items-center justify-center text-[#5D64D9] dark:text-[#C4A1FF] shrink-0 group-hover:scale-105 transition-transform">
                  <Icon className="w-3.5 h-3.5 sm:w-4 sm:h-4 stroke-[2.2]" />
                </div>
                <span className="text-xs sm:text-sm font-bold text-[#1A1D2E] dark:text-white truncate">
                  {card.title}
                </span>
              </div>

              {/* Bottom Row: 2-Digit Metric Number + "Task" */}
              <div className="relative z-10 mt-3 sm:mt-5 flex items-baseline gap-1.5">
                <span className="text-2xl sm:text-3xl font-black text-[#15192B] dark:text-white tracking-tight">
                  {formatTwoDigit(card.count)}
                </span>
                <span className="text-xs sm:text-sm text-[#7D85A7] dark:text-neutral-400 font-semibold">
                  Task
                </span>
              </div>
            </button>
          );
        })}
      </div>

      {/* ── Overall Task Completion Bar ── */}
      <div className="p-3 sm:p-4 rounded-[20px] sm:rounded-[22px] bg-white/75 dark:bg-[#18191F] backdrop-blur-md border border-white/80 dark:border-neutral-800 shadow-[0_4px_20px_rgba(93,100,217,0.04)] dark:shadow-[0_4px_24px_rgba(0,0,0,0.5)] flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 sm:gap-4">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-[#5D64D9]/10 text-[#5D64D9] dark:bg-[#121318] dark:border dark:border-neutral-800 dark:text-[#C4A1FF] flex items-center justify-center shrink-0">
            <ListTodo className="w-3.5 h-3.5 sm:w-4 sm:h-4 stroke-[2.2]" />
          </div>
          <div className="min-w-0">
            <h4 className="text-xs sm:text-sm font-bold text-[#15192B] dark:text-white truncate">
              Overall Task Completion
            </h4>
            <p className="text-[10px] sm:text-xs text-[#7D85A7] dark:text-neutral-400 font-medium">
              {completedCount} of {totalCount} task{totalCount === 1 ? "" : "s"} completed
            </p>
          </div>
        </div>

        <div className="w-full sm:w-64 flex items-center gap-2.5 sm:gap-3">
          <div className="flex-1 h-2 sm:h-2.5 rounded-full bg-slate-100 dark:bg-[#121318] overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-[#5D64D9] to-emerald-500 dark:from-[#B892FF] dark:via-[#C4A1FF] dark:to-[#D8B4FE] transition-all duration-500 shadow-sm"
              style={{ width: `${Math.min(100, Math.max(0, completionPercentage))}%` }}
              role="progressbar"
              aria-valuenow={completionPercentage}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label="Overall task completion progress"
            />
          </div>
          <span className="text-xs sm:text-sm font-bold text-[#15192B] dark:text-[#E9D5FF] shrink-0 min-w-[32px] text-right">
            {completionPercentage}%
          </span>
        </div>
      </div>
    </div>
  );
}
