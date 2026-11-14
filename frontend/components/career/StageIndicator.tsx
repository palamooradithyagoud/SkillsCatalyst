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
            ? "bg-zinc-800 border-zinc-600 text-white shadow-xs"
            : active
            ? "bg-zinc-700 border-zinc-500 text-white shadow-xs"
            : "bg-[#181920] border-zinc-800 text-zinc-500"
        }`}
      >
        {done ? "✓" : stage}
      </div>
      <span
        className={`text-xs transition-colors hidden sm:inline ${
          done
            ? "text-zinc-300 font-semibold"
            : active
            ? "text-white font-bold"
            : "text-zinc-500 font-medium"
        }`}
      >
        {label}
      </span>
    </div>
  );
}
