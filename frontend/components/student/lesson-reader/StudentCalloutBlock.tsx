"use client";

import React from "react";
import { Info, Lightbulb, AlertTriangle, AlertCircle } from "lucide-react";
import type { CalloutBlockContent } from "@/types/lesson-content";

interface StudentCalloutBlockProps {
  content: CalloutBlockContent;
}

const CALLOUT_STYLES = {
  note: {
    container: "bg-blue-50/80 border-blue-200/90 text-blue-950 shadow-2xs",
    icon: <Info className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />,
    badge: "text-blue-800",
    titleDefault: "Note",
  },
  tip: {
    container: "bg-emerald-50/80 border-emerald-200/90 text-emerald-950 shadow-2xs",
    icon: <Lightbulb className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />,
    badge: "text-emerald-800",
    titleDefault: "Pro Tip",
  },
  warning: {
    container: "bg-amber-50/80 border-amber-200/90 text-amber-950 shadow-2xs",
    icon: <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />,
    badge: "text-amber-800",
    titleDefault: "Warning",
  },
  important: {
    container: "bg-rose-50/80 border-rose-200/90 text-rose-950 shadow-2xs",
    icon: <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />,
    badge: "text-rose-800",
    titleDefault: "Important",
  },
};

export function StudentCalloutBlock({ content }: StudentCalloutBlockProps) {
  const variant = (content.variant || "note") as keyof typeof CALLOUT_STYLES;
  const style = CALLOUT_STYLES[variant] || CALLOUT_STYLES.note;
  const title = content.title?.trim() || style.titleDefault;
  const text = content.text || "";

  return (
    <aside
      className={`my-6 rounded-2xl border p-4 sm:p-5 flex items-start gap-3.5 ${style.container}`}
      aria-label={title}
    >
      {style.icon}
      <div className="min-w-0 flex-1">
        {title && (
          <h4 className={`text-xs font-black uppercase tracking-wider mb-1.5 ${style.badge}`}>
            {title}
          </h4>
        )}
        <p className="text-sm sm:text-base leading-relaxed whitespace-pre-line font-normal text-slate-700">
          {text}
        </p>
      </div>
    </aside>
  );
}
