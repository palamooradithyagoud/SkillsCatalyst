"use client";

import React from "react";
import {
  ListTodo,
  Calendar,
  Clock,
  PlayCircle,
  CheckCircle2,
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
  { id: "upcoming", label: TASK_VIEW_LABELS.upcoming, icon: Clock },
  { id: "in_progress", label: TASK_VIEW_LABELS.in_progress, icon: PlayCircle },
  { id: "completed", label: TASK_VIEW_LABELS.completed, icon: CheckCircle2 },
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
      className="flex items-center gap-1.5 p-1 bg-slate-100/80 dark:bg-neutral-900 rounded-2xl border border-slate-200/80 dark:border-neutral-800 overflow-x-auto no-scrollbar"
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
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all shrink-0 cursor-pointer ${
              isActive
                ? "bg-white dark:bg-neutral-800 text-slate-900 dark:text-white shadow-sm border border-slate-200/60 dark:border-neutral-700"
                : "text-slate-600 dark:text-neutral-400 hover:text-slate-900 dark:hover:text-white hover:bg-white/50 dark:hover:bg-neutral-800/50"
            }`}
          >
            <Icon
              className={`w-4 h-4 ${
                isActive
                  ? "text-[#635BFF] dark:text-indigo-400"
                  : "text-slate-400 dark:text-neutral-500"
              }`}
            />
            <span>{tab.label}</span>
            <span
              className={`text-[11px] px-1.5 py-0.5 rounded-full font-bold ${
                isActive
                  ? "bg-indigo-50 dark:bg-indigo-950/60 text-[#635BFF] dark:text-indigo-400"
                  : "bg-slate-200/60 dark:bg-neutral-800 text-slate-600 dark:text-neutral-400"
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
