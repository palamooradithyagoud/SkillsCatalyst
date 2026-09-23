"use client";

import React, { useEffect } from "react";
import { X, Check, Sparkles, FileText, Zap, Code2, ArrowRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export type ResumeTemplateId = "simple-classic" | "modern-cv" | "sb2nov" | "ultra-minimal";

export interface TemplateDefinition {
  id: ResumeTemplateId;
  name: string;
  tagline: string;
  badge: string;
  badgeColor: string;
  atsScore: number;
  bestFor: string;
  features: string[];
  latexAvailable?: boolean;
}

export const RESUME_TEMPLATES: TemplateDefinition[] = [
  {
    id: "simple-classic",
    name: "Simple and Classic",
    tagline: "Timeless, clean, and universally accepted by corporate & finance recruiters",
    badge: "Recruiter Classic",
    badgeColor: "bg-blue-100 text-blue-700 border-blue-200",
    atsScore: 98,
    bestFor: "Enterprise, Finance, Core Engineering & Traditional Tech",
    features: [
      "Single-column high readability layout",
      "Standard hierarchical section headers",
      "Traditional serif or clean sans typography",
      "100% compatible with legacy ATS scanners",
    ],
  },
  {
    id: "modern-cv",
    name: "Modern CV",
    tagline: "Sleek typographic hierarchy with structured skill chips & accent styling",
    badge: "Tech & Startups",
    badgeColor: "bg-purple-100 text-purple-700 border-purple-200",
    atsScore: 96,
    bestFor: "Full-Stack Devs, Tech Startups, Product & Creative Tech",
    features: [
      "Modern header with contact badge pills",
      "Visual technical skill categories & tags",
      "Contemporary typography & clean spacing",
      "Balanced whitespace for fast recruiter scanning",
    ],
  },
  {
    id: "sb2nov",
    name: "SB2Nov",
    tagline: "The gold-standard Overleaf/LaTeX template for FAANG & SWE positions",
    badge: "FAANG / LaTeX Standard",
    badgeColor: "bg-emerald-100 text-emerald-800 border-emerald-200",
    atsScore: 100,
    bestFor: "FAANG, Top Tier Software Engineers, CS Students & Researchers",
    features: [
      "Faithful Overleaf LaTeX sb2nov styling",
      "Compact maximum information density",
      "Bold headings with full-width horizontal rules",
      "Instant exportable LaTeX (.tex) code included",
    ],
    latexAvailable: true,
  },
  {
    id: "ultra-minimal",
    name: "Ultra Minimal",
    tagline: "High density single page impact with sleek sans-serif typography",
    badge: "One Page Impact",
    badgeColor: "bg-pink-100 text-pink-800 border-pink-200",
    atsScore: 99,
    bestFor: "Frontend, Designers, Modern Tech & Fast Recruiters",
    features: [
      "Ultra-clean high density sans-serif layout",
      "Streamlined single-page hierarchy",
      "Pristine visual balance & readable line lengths",
      "Direct recruiter scanning speed",
    ],
  },
];

interface TemplateSelectModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedTemplate: ResumeTemplateId;
  onSelectTemplate: (templateId: ResumeTemplateId) => void;
}

export default function TemplateSelectModal({
  isOpen,
  onClose,
  selectedTemplate,
  onSelectTemplate,
}: TemplateSelectModalProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    if (isOpen) {
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 overflow-y-auto bg-slate-950/60 backdrop-blur-md animate-in fade-in duration-200">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 12 }}
          transition={{ duration: 0.25, ease: "easeOut" }}
          className="relative w-full max-w-5xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-auto max-h-[92vh] flex flex-col"
        >
          {/* Header */}
          <div className="px-6 sm:px-8 pt-6 sm:pt-7 pb-4 border-b border-slate-100 flex items-center justify-between shrink-0 bg-gradient-to-r from-purple-50/50 via-white to-slate-50">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-purple-600 bg-purple-100/70 px-2.5 py-0.5 rounded-full border border-purple-200">
                  Step 1 · Choose Layout
                </span>
                <span className="text-[10px] font-bold text-slate-400">
                  All templates are ATS Calibrated
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight mt-1">
                Select Your Resume Template
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 font-medium mt-0.5">
                Choose the foundation that best matches your target industry and career goals.
              </p>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-2xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Cards Grid */}
          <div className="p-4 sm:p-6 md:p-8 overflow-y-auto flex-1 grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
            {RESUME_TEMPLATES.map((tmpl) => {
              const isSelected = selectedTemplate === tmpl.id;

              return (
                <div
                  key={tmpl.id}
                  onClick={() => onSelectTemplate(tmpl.id)}
                  className={`group relative rounded-2xl border-2 transition-all duration-200 flex flex-col p-4 sm:p-5 cursor-pointer text-left ${
                    isSelected
                      ? "border-purple-600 bg-purple-50/40 shadow-lg shadow-purple-600/10 ring-4 ring-purple-600/10"
                      : "border-slate-200 hover:border-purple-300 bg-white hover:shadow-md"
                  }`}
                >
                  {/* Selected Indicator Badge */}
                  {isSelected && (
                    <div className="absolute -top-3 right-4 bg-purple-600 text-white text-[10px] font-black tracking-wider uppercase px-2.5 py-0.5 rounded-full shadow-sm flex items-center gap-1">
                      <Check className="w-3 h-3 stroke-[3]" />
                      <span>Selected</span>
                    </div>
                  )}

                  {/* Visual Skeleton Thumbnail (Faithful representation of the layout) */}
                  <div className="w-full h-36 sm:h-40 rounded-xl bg-slate-50 border border-slate-200 p-3 mb-4 overflow-hidden flex flex-col justify-between group-hover:scale-[1.01] transition-transform">
                    {/* Template 1: Simple & Classic Preview */}
                    {tmpl.id === "simple-classic" && (
                      <div className="w-full h-full flex flex-col space-y-1.5 select-none font-serif text-[7px] text-slate-700 opacity-90">
                        {/* Header centered */}
                        <div className="text-center pb-1 border-b border-slate-300">
                          <div className="font-bold text-[9px] text-slate-900 tracking-wider">
                            JOHN DOE
                          </div>
                          <div className="text-[6px] text-slate-500">
                            john@example.com · +1 (555) 019-2831 · New York, NY
                          </div>
                        </div>
                        {/* Section 1 */}
                        <div>
                          <div className="font-bold text-[7px] text-slate-900 border-b border-slate-200 pb-0.5 uppercase tracking-wide">
                            Education
                          </div>
                          <div className="flex justify-between text-[6px] font-semibold pt-0.5">
                            <span>BS in Computer Science</span>
                            <span className="text-slate-400">2020 – 2024</span>
                          </div>
                        </div>
                        {/* Section 2 */}
                        <div className="space-y-0.5">
                          <div className="font-bold text-[7px] text-slate-900 border-b border-slate-200 pb-0.5 uppercase tracking-wide">
                            Experience
                          </div>
                          <div className="flex justify-between text-[6px] font-semibold">
                            <span>Software Engineer</span>
                            <span className="text-slate-400">2024 – Present</span>
                          </div>
                          <div className="text-[6px] text-slate-500 pl-2 border-l border-slate-300">
                            • Designed resilient microservices &amp; database schemas
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Template 2: Modern CV Preview */}
                    {tmpl.id === "modern-cv" && (
                      <div className="w-full h-full flex flex-col space-y-1.5 select-none text-[7px] text-slate-700">
                        {/* Header with modern left accent bar */}
                        <div className="flex items-center justify-between pb-1 border-b border-purple-100">
                          <div>
                            <div className="font-black text-[9px] text-purple-950">
                              John Doe
                            </div>
                            <div className="text-[6px] text-purple-600 font-semibold">
                              Fullstack Engineer
                            </div>
                          </div>
                          <div className="flex gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-purple-500" />
                            <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                          </div>
                        </div>
                        {/* Skill pills */}
                        <div className="flex flex-wrap gap-1 py-0.5">
                          <span className="bg-purple-100 text-purple-800 text-[6px] font-bold px-1 rounded">
                            React
                          </span>
                          <span className="bg-indigo-100 text-indigo-800 text-[6px] font-bold px-1 rounded">
                            TypeScript
                          </span>
                          <span className="bg-slate-100 text-slate-700 text-[6px] font-bold px-1 rounded">
                            Python
                          </span>
                          <span className="bg-emerald-100 text-emerald-800 text-[6px] font-bold px-1 rounded">
                            FastAPI
                          </span>
                        </div>
                        {/* Experience */}
                        <div className="space-y-0.5">
                          <div className="text-[7px] font-black text-slate-900 flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-xs bg-purple-600 inline-block" />
                            Experience
                          </div>
                          <div className="bg-white p-1 rounded border border-slate-200 text-[6px]">
                            <div className="font-bold text-slate-800">Senior Frontend Lead</div>
                            <div className="text-slate-400">TechCorp · Built distributed UI systems</div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Template 3: SB2Nov Preview */}
                    {tmpl.id === "sb2nov" && (
                      <div className="w-full h-full flex flex-col space-y-1 select-none font-mono text-[7px] text-slate-800">
                        {/* Centered Overleaf LaTeX Header */}
                        <div className="text-center pb-0.5">
                          <div className="font-black text-[10px] text-slate-900 tracking-tight">
                            JOHN DOE
                          </div>
                          <div className="text-[5.5px] text-slate-600">
                            john@cs.edu | +1-234-567-8900 | linkedin/in/johndoe | github/johndoe
                          </div>
                        </div>

                        {/* Education with full-width hr */}
                        <div>
                          <div className="font-bold text-[7px] text-slate-900 uppercase tracking-widest border-b border-slate-800 pb-0.2">
                            EDUCATION
                          </div>
                          <div className="flex justify-between text-[6px] font-bold pt-0.5">
                            <span>Stanford University</span>
                            <span className="font-normal text-slate-500">2020 – 2024</span>
                          </div>
                        </div>

                        {/* Experience with full-width hr */}
                        <div>
                          <div className="font-bold text-[7px] text-slate-900 uppercase tracking-widest border-b border-slate-800 pb-0.2">
                            EXPERIENCE
                          </div>
                          <div className="flex justify-between text-[6px] font-bold pt-0.5">
                            <span>Google — Software Engineer Intern</span>
                            <span className="font-normal text-slate-500">May 2023 – Aug 2023</span>
                          </div>
                          <div className="text-[5.5px] text-slate-600 pl-1.5">
                            • Optimized distributed cache hit rate by 34% via LRU partitioning
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Badges & ATS Rating */}
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span
                      className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border ${tmpl.badgeColor}`}
                    >
                      {tmpl.badge}
                    </span>
                    <div className="flex items-center gap-1 text-[10px] font-extrabold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                      <Zap className="w-3 h-3 text-emerald-600 fill-emerald-600" />
                      <span>{tmpl.atsScore}% ATS</span>
                    </div>
                  </div>

                  {/* Title & Tagline */}
                  <h3 className="text-base font-black text-slate-900 group-hover:text-purple-600 transition-colors">
                    {tmpl.name}
                  </h3>
                  <p className="text-xs text-slate-500 font-medium leading-relaxed mt-1">
                    {tmpl.tagline}
                  </p>

                  {/* Best For */}
                  <div className="my-3 pt-2 border-t border-slate-100 text-[11px]">
                    <span className="font-bold text-slate-700">Best for: </span>
                    <span className="text-slate-500">{tmpl.bestFor}</span>
                  </div>

                  {/* Feature Bullets */}
                  <ul className="space-y-1.5 text-xs text-slate-600 flex-1 mb-4">
                    {tmpl.features.map((feat, idx) => (
                      <li key={idx} className="flex items-start gap-1.5 text-[11px] leading-tight">
                        <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5 stroke-[2.5]" />
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>

                  {/* Card Select Button */}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectTemplate(tmpl.id);
                    }}
                    className={`w-full py-2.5 px-4 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                      isSelected
                        ? "bg-purple-600 text-white shadow-md shadow-purple-600/25"
                        : "bg-slate-100 hover:bg-purple-50 text-slate-700 hover:text-purple-700"
                    }`}
                  >
                    <span>{isSelected ? "Template Selected" : "Use This Template"}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              );
            })}
          </div>

          {/* Modal Footer */}
          <div className="px-6 sm:px-8 py-4 bg-slate-50 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
            <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
              <Sparkles className="w-4 h-4 text-purple-600 shrink-0" />
              <span>
                You can switch between templates anytime while editing without losing your content.
              </span>
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto">
              <button
                type="button"
                onClick={onClose}
                className="w-full sm:w-auto px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-200/60 rounded-xl transition-colors cursor-pointer text-center"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => onSelectTemplate(selectedTemplate)}
                className="w-full sm:w-auto px-6 py-2.5 text-xs font-bold text-white bg-purple-600 hover:bg-purple-700 rounded-xl shadow-md shadow-purple-600/20 transition-all cursor-pointer text-center flex items-center justify-center gap-2"
              >
                <span>Continue to Builder</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
