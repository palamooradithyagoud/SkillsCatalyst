"use client";

import React from "react";
import { ArrowLeft } from "lucide-react";

interface PracticeHeaderProps {
  selectedMode: "index" | "beginner" | "company" | "penguin-sheet" | "shradha-sheet" | "striver-sheet";
  onBack: () => void;
  companiesCount?: number;
}

export function PracticeHeader({
  selectedMode,
  onBack,
}: PracticeHeaderProps) {
  if (selectedMode === "index") {
    return null;
  }

  return (
    <div className="flex items-center justify-start">
      <button
        onClick={onBack}
        className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-slate-200/90 hover:bg-slate-50 text-slate-700 font-extrabold text-xs transition-all shadow-sm hover:shadow-md cursor-pointer"
      >
        <ArrowLeft className="w-4 h-4 text-slate-600" />
        <span>Back to Practice Cards</span>
      </button>
    </div>
  );
}

