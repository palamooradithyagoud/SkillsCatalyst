import React from "react";
import { Briefcase } from "lucide-react";

export default function CareerHeader() {
  return (
    <div className="flex items-center justify-between gap-4 flex-wrap">
      <div className="flex items-center gap-3.5">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-600 via-teal-600 to-indigo-600 text-white flex items-center justify-center shadow-md shadow-emerald-600/30 shrink-0">
          <Briefcase className="w-6 h-6 text-white" />
        </div>
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">
              Career Acceleration
            </h1>
            <span className="px-3 py-0.5 rounded-full bg-gradient-to-r from-emerald-600 to-teal-600 text-white text-[10px] font-black tracking-wider uppercase shadow-xs">
              AI Career Suite
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 font-semibold mt-0.5">
            Placement preparation suites, curated practice modules, and career readiness.
          </p>
        </div>
      </div>
    </div>
  );
}
