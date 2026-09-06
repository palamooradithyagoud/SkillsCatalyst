"use client";

import React from "react";
import { ChevronDown } from "lucide-react";
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
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value as Lang)}
        className="appearance-none pr-9 pl-4 py-3 text-sm font-semibold rounded-2xl cursor-pointer bg-slate-50 border border-slate-200/90 text-slate-800 hover:bg-slate-100/80 focus:bg-white focus:border-emerald-600 focus:outline-none transition-all shadow-xs"
      >
        {options.map((o) => (
          <option key={o.value} value={o.value} className="bg-white text-slate-900 font-medium">
            {o.label}
          </option>
        ))}
      </select>
      <ChevronDown className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500" />
    </div>
  );
}
