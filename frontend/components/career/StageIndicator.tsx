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
            ? "bg-emerald-500 border-emerald-400 text-white"
            : active
            ? "bg-indigo-600 border-indigo-400 text-white"
            : "bg-slate-900 border-slate-700 text-slate-500"
        }`}
      >
        {done ? "✓" : stage}
      </div>
      <span
        className={`text-xs font-medium ${
          done
            ? "text-emerald-400"
            : active
            ? "text-white"
            : "text-slate-500"
        }`}
      >
        {label}
      </span>
    </div>
  );
}
