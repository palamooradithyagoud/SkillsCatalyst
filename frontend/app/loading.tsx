import React from "react";
import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div
      className="w-full min-h-screen bg-[#10110E] p-4 sm:p-6 md:p-8 flex flex-col gap-6"
      role="status"
      aria-label="Loading page..."
    >
      {/* Top Header Placeholder */}
      <div className="w-full max-w-7xl mx-auto flex items-center justify-between py-2 border-b border-[#24271F]">
        <div className="flex items-center gap-3">
          <Skeleton className="w-9 h-9 rounded-xl" />
          <Skeleton className="w-28 h-6 rounded-md" />
        </div>
        <div className="hidden md:flex items-center gap-2">
          <Skeleton className="w-20 h-8 rounded-full" />
          <Skeleton className="w-24 h-8 rounded-full" />
          <Skeleton className="w-24 h-8 rounded-full" />
          <Skeleton className="w-20 h-8 rounded-full" />
        </div>
        <div className="flex items-center gap-3">
          <Skeleton className="w-16 h-8 rounded-full" />
          <Skeleton className="w-20 h-8 rounded-full bg-[#d5ff38]/15 border-[#d5ff38]/30" />
        </div>
      </div>

      {/* Main Hero Card Placeholder */}
      <div className="w-full max-w-5xl mx-auto my-auto flex flex-col items-center text-center gap-5 py-12 px-4 sm:px-8 rounded-3xl border border-[#24271F] bg-[#121318]/40">
        <Skeleton className="w-36 h-7 rounded-full" />
        <Skeleton className="w-full max-w-md h-12 sm:h-14 rounded-2xl" />
        <Skeleton className="w-3/4 max-w-sm h-12 sm:h-14 rounded-2xl" />
        <Skeleton className="w-2/3 max-w-xs h-5 rounded-md mt-1" />

        <div className="flex flex-col sm:flex-row items-center gap-3 mt-4">
          <Skeleton className="w-44 h-12 rounded-xl bg-[#d5ff38]/20 border-[#d5ff38]/30" />
          <Skeleton className="w-44 h-12 rounded-xl" />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full mt-6 pt-6 border-t border-[#24271F]">
          <Skeleton className="h-28 rounded-2xl" />
          <Skeleton className="h-28 rounded-2xl" />
          <Skeleton className="h-28 rounded-2xl" />
        </div>
      </div>
    </div>
  );
}
