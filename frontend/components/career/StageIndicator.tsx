import React from "react";

interface StageIndicatorProps {
  stage: number;
  currentStage: number;
  label: string;
}

export default function StageIndicator({
  stage,
  currentStage,
  label,
}: StageIndicatorProps) {
  const done = currentStage > stage;
  const active = currentStage === stage;
  return (
    <div className="flex items-center gap-2">
      <div
        className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold border transition-all ${
          done
            ? "bg-purple-600 border-purple-600 text-white shadow-xs"
            : active
            ? "bg-purple-600 border-purple-500 text-white shadow-md shadow-purple-600/30 ring-2 ring-purple-100"
            : "bg-slate-100 border-slate-200 text-slate-400"
        }`}
      >
        {done ? "✓" : stage}
      </div>
      <span
        className={`text-xs transition-colors hidden sm:inline ${
          done
            ? "text-purple-700 font-semibold"
            : active
            ? "text-purple-900 font-extrabold"
            : "text-slate-400 font-medium"
        }`}
      >
        {label}
      </span>
    </div>
  );
}
