"use client";

import React from "react";
import {
  ListTodo,
  Calendar,
  Clock,
  PlayCircle,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { TaskView, TASK_VIEW_LABELS } from "@/types/task";

interface TaskViewTabsProps {
  activeView: TaskView;
  onSelectView: (view: TaskView) => void;
  counts: Record<TaskView, number>;
}

interface TabDef {
  id: TaskView;
  label: string;
  icon: React.ElementType;
}

const TABS: TabDef[] = [
  { id: "all", label: TASK_VIEW_LABELS.all, icon: ListTodo },
  { id: "today", label: TASK_VIEW_LABELS.today, icon: Calendar },
  { id: "completed", label: TASK_VIEW_LABELS.completed, icon: CheckCircle2 },
  { id: "upcoming", label: TASK_VIEW_LABELS.upcoming, icon: Clock },
  { id: "past_due", label: TASK_VIEW_LABELS.past_due, icon: AlertCircle },
  { id: "in_progress", label: TASK_VIEW_LABELS.in_progress, icon: PlayCircle },
];

export default function TaskViewTabs({
  activeView,
  onSelectView,
  counts,
}: TaskViewTabsProps) {
  return (
    <div
      role="tablist"
      aria-label="Task views"
      className="flex items-center gap-1.5 p-1 sm:p-1.5 bg-white/70 dark:bg-[#1A1D30]/80 backdrop-blur-md rounded-2xl border border-white/80 dark:border-white/10 shadow-xs overflow-x-auto no-scrollbar overscroll-contain"
    >
      {TABS.map((tab) => {
        const Icon = tab.icon;
        const isActive = activeView === tab.id;
        const count = counts[tab.id] || 0;

        return (
          <button
            key={tab.id}
            role="tab"
            id={`tab-${tab.id}`}
            aria-selected={isActive}
            aria-controls={`tabpanel-${tab.id}`}
            tabIndex={isActive ? 0 : -1}
            onClick={() => onSelectView(tab.id)}
            className={`flex items-center gap-1.5 sm:gap-2 px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all shrink-0 cursor-pointer ${
              isActive
                ? "bg-white dark:bg-[#252A42] text-[#15192B] dark:text-white shadow-xs border border-slate-100 dark:border-white/10 font-bold"
                : "text-[#7A82A6] dark:text-neutral-400 hover:text-[#15192B] dark:hover:text-white hover:bg-white/60 dark:hover:bg-neutral-800/40"
            }`}
          >
            <Icon
              className={`w-4 h-4 ${
                isActive
                  ? "text-[#5D64D9] dark:text-indigo-400"
                  : "text-[#8C93B3] dark:text-neutral-500"
              }`}
            />
            <span>{tab.label}</span>
            <span
              className={`text-[11px] px-2 py-0.5 rounded-full font-bold ${
                isActive
                  ? "bg-[#EEF1FE] dark:bg-[#252945] text-[#555E8D] dark:text-[#9AA5D8]"
                  : "bg-slate-200/60 dark:bg-neutral-800 text-[#8C93B3] dark:text-neutral-400"
              }`}
            >
              {count}
            </span>
          </button>
        );
      })}
    </div>
  );
}
