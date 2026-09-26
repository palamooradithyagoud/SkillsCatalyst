/* eslint-disable @next/next/no-img-element */
"use client";

import React, { useState } from "react";
import { ImageOff } from "lucide-react";
import type { ImageBlockContent } from "@/types/lesson-content";

interface StudentImageBlockProps {
  content: ImageBlockContent;
}

export function StudentImageBlock({ content }: StudentImageBlockProps) {
  const [hasError, setHasError] = useState(false);

  const url = content.url || "";
  const alt = content.alt || "Course illustration";
  const caption = content.caption?.trim();

  if (!url) {
    return null;
  }

  return (
    <figure className="my-6 max-w-3xl mx-auto">
      <div className="relative w-full rounded-2xl border border-slate-200/90 bg-white overflow-hidden shadow-xs">
        {hasError ? (
          <div className="flex flex-col items-center justify-center p-10 text-center text-slate-500 min-h-[220px]">
            <ImageOff className="w-10 h-10 mb-3 text-slate-400" />
            <p className="text-sm font-semibold text-slate-800">Image unavailable</p>
            <p className="text-xs text-slate-500 mt-1 max-w-sm">
              The image could not be loaded. Please check your network connection.
            </p>
          </div>
        ) : (
          <img
            src={url}
            alt={alt}
            onError={() => setHasError(true)}
            loading="lazy"
            className="w-full max-h-[520px] object-contain mx-auto"
          />
        )}
      </div>

      {caption && !hasError && (
        <figcaption className="text-center text-xs sm:text-sm text-slate-500 italic mt-2.5 px-4">
          {caption}
        </figcaption>
      )}
    </figure>
  );
}
