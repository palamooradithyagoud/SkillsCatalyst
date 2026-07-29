"use client";

import React from "react";
import { Briefcase, Upload, FileText, CheckCircle } from "lucide-react";

export default function CareerPage() {
  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="flex items-center gap-3">
        <div className="p-3 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-blue-400">
          <Briefcase className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-white">Career & Resume Readiness</h1>
          <p className="text-sm text-slate-400">AI-driven resume optimization and target matching</p>
        </div>
      </div>

      <div className="bg-[#131d33] border border-[#1e2c4a] rounded-2xl p-8 text-center border-dashed">
        <div className="w-16 h-16 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center mx-auto mb-4">
          <Upload className="w-8 h-8" />
        </div>
        <h3 className="text-lg font-bold text-white mb-2">Upload your resume for AI review</h3>
        <p className="text-sm text-slate-400 mb-6 max-w-md mx-auto">
          Get real-time feedback on formatting, keyword optimization, and ATS readiness score.
        </p>
        <button className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white font-semibold text-sm rounded-xl shadow-lg shadow-blue-500/20 transition-all">
          Select Resume PDF
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-[#131d33] border border-[#1e2c4a] rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <FileText className="w-5 h-5 text-cyan-400" />
            <h4 className="text-base font-bold text-white">ATS Keyword Analyzer</h4>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            Match your resume directly against job descriptions at top tech firms (Google, Meta, Amazon).
          </p>
        </div>

        <div className="bg-[#131d33] border border-[#1e2c4a] rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <CheckCircle className="w-5 h-5 text-emerald-400" />
            <h4 className="text-base font-bold text-white">Mock Interview Prep</h4>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            Practice AI-simulated technical and behavioral rounds tailored to your target role.
          </p>
        </div>
      </div>
    </div>
  );
}

