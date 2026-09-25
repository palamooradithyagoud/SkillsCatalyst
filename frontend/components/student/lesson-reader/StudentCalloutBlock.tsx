"use client";

import React from "react";
import { Info, Lightbulb, AlertTriangle, AlertCircle } from "lucide-react";
import type { CalloutBlockContent } from "@/types/lesson-content";

interface StudentCalloutBlockProps {
  content: CalloutBlockContent;
}

const CALLOUT_STYLES = {
  note: {
    container: "bg-blue-950/20 border-blue-500/30 text-blue-200",
    icon: <Info className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />,
    badge: "text-blue-300",
    titleDefault: "Note",
  },
  tip: {
    container: "bg-emerald-950/20 border-emerald-500/30 text-emerald-200",
    icon: <Lightbulb className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />,
    badge: "text-emerald-300",
    titleDefault: "Pro Tip",
  },
  warning: {
    container: "bg-amber-950/20 border-amber-500/30 text-amber-200",
    icon: <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />,
    badge: "text-amber-300",
    titleDefault: "Warning",
  },
  important: {
    container: "bg-rose-950/20 border-rose-500/30 text-rose-200",
    icon: <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />,
    badge: "text-rose-300",
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
      className={`my-6 rounded-2xl border p-4 sm:p-5 flex items-start gap-3.5 shadow-md ${style.container}`}
      aria-label={title}
    >
      {style.icon}
      <div className="min-w-0 flex-1">
        {title && (
          <h4 className={`text-sm font-bold uppercase tracking-wider mb-1.5 ${style.badge}`}>
            {title}
          </h4>
        )}
        <p className="text-sm sm:text-base leading-relaxed whitespace-pre-line font-normal text-slate-200">
          {text}
        </p>
      </div>
    </aside>
  );
}
