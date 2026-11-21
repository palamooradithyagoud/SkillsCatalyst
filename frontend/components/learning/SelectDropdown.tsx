"use client";

import React from "react";
import { ChevronDown, Globe } from "lucide-react";
import { Lang } from "@/lib/learning/searchValidation";

export function SelectDropdown({
  value,
  options,
  onChange,
}: {
  value: Lang;
  options: { value: Lang; label: string }[];
  onChange: (v: Lang) => void;
}) {
  return (
    <div className="relative flex items-center">
      <Globe className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500 dark:text-neutral-400" />
      <select
        value={value}
        onChange={(e) => onChange(e.target.value as Lang)}
        suppressHydrationWarning
        aria-label="Select learning language"
        className="appearance-none pl-10 pr-9 py-3 sm:py-3.5 text-sm font-semibold rounded-2xl cursor-pointer bg-slate-50/80 dark:bg-neutral-900/90 border border-slate-200/90 dark:border-neutral-700/80 text-slate-800 dark:text-white hover:bg-slate-100/80 dark:hover:bg-neutral-800 focus:bg-white dark:focus:bg-neutral-900 focus:border-[#D5FF38] dark:focus:border-[#D5FF38] focus:ring-1 focus:ring-[#D5FF38] focus:outline-none transition-all shadow-none"
      >
        {options.map((o) => (
          <option key={o.value} value={o.value} className="bg-white dark:bg-[#18191F] text-slate-900 dark:text-white font-medium">
            {o.label}
          </option>
        ))}
      </select>
      <ChevronDown className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500 dark:text-neutral-400" />
    </div>
  );
}
