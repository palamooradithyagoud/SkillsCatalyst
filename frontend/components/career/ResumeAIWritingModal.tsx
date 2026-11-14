"use client";

import React, { useState, useEffect } from "react";
import {
  Sparkles,
  X,
  Check,
  Loader2,
  AlertCircle,
  Lightbulb,
  CheckCircle2,
  Zap,
  ArrowRight,
  ShieldCheck,
  RotateCcw,
} from "lucide-react";
import {
  improveBulletWithAI,
  improveSummaryWithAI,
  improveProjectWithAI,
  getWritingFeedback,
} from "@/lib/api/career";
import { AIWritingFeedbackResponse } from "@/types/career";

interface ResumeAIWritingModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialText: string;
  contextType: "bullet" | "summary" | "project";
  roleContext?: string;
  projectName?: string;
  technologies?: string;
  onApply: (improvedText: string) => void;
}

export default function ResumeAIWritingModal({
  isOpen,
  onClose,
  initialText,
  contextType,
  roleContext = "Software Engineer",
  projectName,
  technologies,
  onApply,
}: ResumeAIWritingModalProps) {
  const [activeTab, setActiveTab] = useState<"improve" | "concise" | "strong_verbs" | "technical_clarity" | "audit">("improve");
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [reason, setReason] = useState<string>("");
  const [feedback, setFeedback] = useState<AIWritingFeedbackResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedSuggestionIdx, setSelectedSuggestionIdx] = useState<number>(0);
  const [customText, setCustomText] = useState(initialText);

  useEffect(() => {
    setCustomText(initialText);
    setSelectedSuggestionIdx(0);
  }, [initialText]);

  // Load suggestions when modal opens or tab changes
  useEffect(() => {
    if (!isOpen || !initialText.trim()) return;

    let isMounted = true;
    async function fetchAI() {
      setIsLoading(true);
      try {
        if (activeTab === "audit") {
          const fb = await getWritingFeedback(initialText);
          if (isMounted) setFeedback(fb);
        } else if (contextType === "summary") {
          const res = await improveSummaryWithAI(initialText, roleContext);
          if (isMounted) {
            setSuggestions(res.suggestions || []);
            setReason(res.improvement_reason || "");
          }
        } else if (contextType === "project" && projectName) {
          const res = await improveProjectWithAI(projectName, initialText, technologies || "");
          if (isMounted) {
            setSuggestions(res.suggestions || []);
            setReason(res.improvement_reason || "");
          }
        } else {
          // Bullet improvement
          const res = await improveBulletWithAI(initialText, activeTab, roleContext);
          if (isMounted) {
            setSuggestions(res.suggestions || []);
            setReason(res.improvement_reason || "");
          }
        }
      } catch (err) {
        console.error("AI Writing Assistant error:", err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }
    fetchAI();
    return () => {
      isMounted = false;
    };
  }, [isOpen, activeTab, initialText, contextType, roleContext, projectName, technologies]);

  if (!isOpen) return null;

  const handleApplySelected = () => {
    const textToApply = suggestions[selectedSuggestionIdx] || customText;
    if (textToApply) {
      onApply(textToApply);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl border border-slate-200 overflow-hidden my-auto flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-purple-50 via-slate-50 to-indigo-50 border-b border-slate-100 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-purple-600 text-white flex items-center justify-center shadow-sm">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-black text-slate-900">
                AI Resume Writing Assistant
              </h3>
              <p className="text-[11px] text-slate-500">
                Factual, achievement-oriented refinement without invented claims.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-white rounded-xl transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Action Tabs (Only for bullets) */}
        {contextType === "bullet" && (
          <div className="flex items-center gap-1 p-2 bg-slate-50 border-b border-slate-200/80 overflow-x-auto text-xs shrink-0">
            <button
              type="button"
              onClick={() => setActiveTab("improve")}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all whitespace-nowrap cursor-pointer ${
                activeTab === "improve"
                  ? "bg-purple-600 text-white shadow-xs"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/50"
              }`}
            >
              Professional Rewrite
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("strong_verbs")}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all whitespace-nowrap cursor-pointer ${
                activeTab === "strong_verbs"
                  ? "bg-purple-600 text-white shadow-xs"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/50"
              }`}
            >
              Strong Action Verbs
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("concise")}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all whitespace-nowrap cursor-pointer ${
                activeTab === "concise"
                  ? "bg-purple-600 text-white shadow-xs"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/50"
              }`}
            >
              Make Concise
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("technical_clarity")}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all whitespace-nowrap cursor-pointer ${
                activeTab === "technical_clarity"
                  ? "bg-purple-600 text-white shadow-xs"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/50"
              }`}
            >
              Technical Clarity
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("audit")}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all whitespace-nowrap cursor-pointer ${
                activeTab === "audit"
                  ? "bg-indigo-600 text-white shadow-xs"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/50"
              }`}
            >
              Quality Audit
            </button>
          </div>
        )}

        {/* Body Content */}
        <div className="p-4 sm:p-5 space-y-4 overflow-y-auto flex-1 text-slate-800 text-xs">
          {/* Original Text Reference */}
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
              Original Content
            </span>
            <p className="text-slate-700 italic">&ldquo;{initialText}&rdquo;</p>
          </div>

          {isLoading ? (
            <div className="py-12 text-center space-y-2">
              <Loader2 className="w-6 h-6 animate-spin text-purple-600 mx-auto" />
              <p className="text-xs font-bold text-slate-700">Refining text with anti-hallucination checks...</p>
            </div>
          ) : activeTab === "audit" && feedback ? (
            /* Writing Feedback Audit View */
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-slate-50 border border-slate-200 rounded-xl">
                <span className="font-bold text-slate-700">Quality Rating:</span>
                <span className={`px-2 py-0.5 rounded-full font-black text-[11px] ${
                  feedback.quality_rating === "Strong"
                    ? "bg-emerald-100 text-emerald-800"
                    : "bg-amber-100 text-amber-800"
                }`}>
                  {feedback.quality_rating}
                </span>
              </div>

              {feedback.strengths.length > 0 && (
                <div className="p-3 bg-emerald-50/70 border border-emerald-200 rounded-xl space-y-1">
                  <span className="font-bold text-emerald-900 block">Identified Strengths:</span>
                  <ul className="list-disc ml-4 space-y-0.5 text-emerald-800">
                    {feedback.strengths.map((s, idx) => (
                      <li key={idx}>{s}</li>
                    ))}
                  </ul>
                </div>
              )}

              {feedback.weak_points.length > 0 && (
                <div className="p-3 bg-rose-50/70 border border-rose-200 rounded-xl space-y-1">
                  <span className="font-bold text-rose-900 block">Weak Points Flagged:</span>
                  <ul className="list-disc ml-4 space-y-0.5 text-rose-800">
                    {feedback.weak_points.map((w, idx) => (
                      <li key={idx}>{w}</li>
                    ))}
                  </ul>
                </div>
              )}

              {feedback.actionable_opportunities.length > 0 && (
                <div className="p-3 bg-purple-50/70 border border-purple-200 rounded-xl space-y-1">
                  <span className="font-bold text-purple-900 block">Recommendations:</span>
                  <ul className="list-disc ml-4 space-y-0.5 text-purple-800">
                    {feedback.actionable_opportunities.map((o, idx) => (
                      <li key={idx}>{o}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ) : (
            /* AI Suggestions List */
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                  <Lightbulb className="w-3.5 h-3.5 text-amber-500" />
                  Suggested Variations ({suggestions.length})
                </span>
                {reason && (
                  <span className="text-[10px] text-purple-700 font-semibold truncate max-w-xs">
                    {reason}
                  </span>
                )}
              </div>

              {suggestions.length === 0 ? (
                <p className="text-slate-400 italic">No alternative suggestions available.</p>
              ) : (
                <div className="space-y-2">
                  {suggestions.map((sug, idx) => {
                    const isSelected = selectedSuggestionIdx === idx;
                    return (
                      <div
                        key={idx}
                        onClick={() => setSelectedSuggestionIdx(idx)}
                        className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-start justify-between gap-3 ${
                          isSelected
                            ? "bg-purple-50 border-purple-300 ring-2 ring-purple-100"
                            : "bg-white border-slate-200 hover:border-slate-300"
                        }`}
                      >
                        <div className="flex items-start gap-2.5">
                          <span className="w-5 h-5 rounded-full bg-slate-100 text-slate-700 font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5">
                            {idx + 1}
                          </span>
                          <p className="text-slate-800 leading-relaxed font-medium">{sug}</p>
                        </div>

                        <div className="shrink-0 mt-0.5">
                          {isSelected ? (
                            <div className="w-5 h-5 rounded-full bg-purple-600 text-white flex items-center justify-center">
                              <Check className="w-3 h-3 stroke-[3]" />
                            </div>
                          ) : (
                            <div className="w-5 h-5 rounded-full border border-slate-300" />
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-1.5 text-[11px] text-slate-500 font-medium">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span className="hidden sm:inline">Zero hallucinated metrics guaranteed</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-2 bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 font-bold text-xs rounded-xl transition-colors cursor-pointer"
            >
              Cancel
            </button>
            {activeTab !== "audit" && suggestions.length > 0 && (
              <button
                type="button"
                onClick={handleApplySelected}
                className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs rounded-xl shadow-xs transition-all flex items-center gap-1.5 cursor-pointer active:scale-95"
              >
                <Check className="w-3.5 h-3.5 stroke-[3]" />
                <span>Apply to Resume</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

