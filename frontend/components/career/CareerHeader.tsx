import React from "react";
import { Briefcase } from "lucide-react";

export default function CareerHeader() {
  return (
    <div className="flex items-center justify-between gap-4 flex-wrap">
      <div className="flex items-center gap-3.5">
        <div className="w-12 h-12 rounded-2xl bg-[#EDE9FE] border border-violet-200/60 text-[#4F46E5] flex items-center justify-center shadow-xs shrink-0">
          <Briefcase className="w-6 h-6 text-[#4F46E5]" />
        </div>
        <div>
          <div className="flex items-center gap-2.5 flex-wrap">
            <h1 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">
              Career Acceleration
            </h1>
            <span className="px-3 py-0.5 rounded-full bg-[#EEF2FF] border border-indigo-100 text-[#4F46E5] text-[10px] font-black tracking-wider uppercase shadow-2xs">
              AI CAREER SUITE
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 font-medium mt-0.5">
            Placement preparation suites, curated practice modules, and career readiness.
          </p>
        </div>
      </div>
    </div>
  );
}
