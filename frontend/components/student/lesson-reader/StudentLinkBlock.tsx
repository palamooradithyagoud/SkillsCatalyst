"use client";

import React from "react";
import { ExternalLink } from "lucide-react";
import type { LinkBlockContent } from "@/types/lesson-content";

interface StudentLinkBlockProps {
  content: LinkBlockContent;
}

export function StudentLinkBlock({ content }: StudentLinkBlockProps) {
  const url = content.url?.trim() || "";
  const text = content.text?.trim() || url;

  // Security guard: Only allow http and https protocols
  const isSafeUrl = url.startsWith("http://") || url.startsWith("https://");
  if (!isSafeUrl) {
    return (
      <span className="text-slate-400 italic text-sm">
        [Invalid or unsafe link destination]
      </span>
    );
  }

  return (
    <div className="my-4">
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-purple-500/10 hover:bg-purple-500/20 text-purple-300 hover:text-purple-200 border border-purple-500/20 transition-all group font-medium text-sm sm:text-base break-all"
      >
        <span className="group-hover:underline underline-offset-4">{text}</span>
        <ExternalLink className="w-4 h-4 shrink-0 text-purple-400 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
      </a>
    </div>
  );
}
