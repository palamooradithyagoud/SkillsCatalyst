/**
 * frontend/components/admin/lesson-editor/preview/CalloutBlockPreview.tsx
 * Preview renderer for Callout blocks.
 */

import React from "react";
import { Info, Lightbulb, AlertTriangle, AlertCircle } from "lucide-react";
import type { CalloutBlockContent, CalloutVariant } from "@/types/lesson-content";

const VARIANT_CONFIG: Record<
  CalloutVariant,
  {
    icon: React.ComponentType<{ className?: string }>;
    containerClass: string;
    iconClass: string;
    titleClass: string;
  }
> = {
  info: {
    icon: Info,
    containerClass: "bg-sky-950/30 border-l-4 border-sky-500 border-y border-r border-sky-900/40",
    iconClass: "text-sky-400",
    titleClass: "text-sky-300 font-semibold",
  },
  tip: {
    icon: Lightbulb,
    containerClass: "bg-emerald-950/30 border-l-4 border-emerald-500 border-y border-r border-emerald-900/40",
    iconClass: "text-emerald-400",
    titleClass: "text-emerald-300 font-semibold",
  },
  warning: {
    icon: AlertTriangle,
    containerClass: "bg-amber-950/30 border-l-4 border-amber-500 border-y border-r border-amber-900/40",
    iconClass: "text-amber-400",
    titleClass: "text-amber-300 font-semibold",
  },
  important: {
    icon: AlertCircle,
    containerClass: "bg-rose-950/30 border-l-4 border-rose-500 border-y border-r border-rose-900/40",
    iconClass: "text-rose-400",
    titleClass: "text-rose-300 font-semibold",
  },
};

export const CalloutBlockPreview: React.FC<{ content: CalloutBlockContent }> = ({ content }) => {
  const config = VARIANT_CONFIG[content.variant || "info"] || VARIANT_CONFIG.info;
  const Icon = config.icon;

  return (
    <aside className={`my-4 p-4 rounded-r-xl ${config.containerClass} flex items-start gap-3.5`}>
      <Icon className={`w-5 h-5 ${config.iconClass} shrink-0 mt-0.5`} />
      <div className="flex-1 space-y-1">
        {content.title && <h5 className={`text-sm ${config.titleClass}`}>{content.title}</h5>}
        <p className="text-xs sm:text-sm text-slate-300 leading-relaxed whitespace-pre-line">
          {content.text}
        </p>
      </div>
    </aside>
  );
};
