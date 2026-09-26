"use client";

import React from "react";
import type { ListBlockContent } from "@/types/lesson-content";

interface StudentListBlockProps {
  content: ListBlockContent;
}

export function StudentListBlock({ content }: StudentListBlockProps) {
  const isNumbered = Boolean(content.ordered);
  const items = content.items || [];

  if (items.length === 0) {
    return null;
  }

  if (isNumbered) {
    return (
      <ol className="my-5 list-decimal pl-6 space-y-2.5 text-slate-700 text-base sm:text-[17px] leading-relaxed">
        {items.map((item, idx) => (
          <li key={idx} className="pl-1 text-slate-800">
            {item}
          </li>
        ))}
      </ol>
    );
  }

  return (
    <ul className="my-5 list-disc pl-6 space-y-2.5 text-slate-700 text-base sm:text-[17px] leading-relaxed">
      {items.map((item, idx) => (
        <li key={idx} className="pl-1 text-slate-800 marker:text-purple-600">
          {item}
        </li>
      ))}
    </ul>
  );
}
