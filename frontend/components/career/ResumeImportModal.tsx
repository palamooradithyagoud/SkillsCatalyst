"use client";

import React, { useState, useEffect } from "react";
import {
  FileText,
  X,
  Loader2,
  Calendar,
  Sparkles,
  ArrowRight,
  HardDrive,
  Check,
} from "lucide-react";
import { getResumeHistory, importResumeFromAnalysis } from "@/lib/api/career";
import { ResumeHistoryItem, ResumeBuilderDocument } from "@/types/career";

interface ResumeImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedTemplate: string;
  onImportSuccess: (importedDoc: ResumeBuilderDocument) => void;
}

export default function ResumeImportModal({
  isOpen,
  onClose,
  selectedTemplate,
  onImportSuccess,
}: ResumeImportModalProps) {
  const [items, setItems] = useState<ResumeHistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isImporting, setIsImporting] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    let isMounted = true;
    async function loadHistory() {
      setIsLoading(true);
      try {
        const res = await getResumeHistory({ page: 1, pageSize: 20 });
        if (isMounted) setItems(res.items || []);
      } catch (err) {
        console.error("Failed to load history for import:", err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }
    loadHistory();
    return () => {
      isMounted = false;
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleImport = async () => {
    if (!selectedId) return;
    setIsImporting(true);
    try {
      const doc = await importResumeFromAnalysis(selectedId, selectedTemplate);
      onImportSuccess(doc);
      onClose();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Failed to import resume.");
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-xl w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="p-5 bg-gradient-to-r from-purple-50 via-slate-50 to-indigo-50 border-b border-slate-100 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-purple-600 text-white flex items-center justify-center shadow-xs">
              <HardDrive className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-black text-slate-900">
                Import Existing Resume
              </h3>
              <p className="text-xs text-slate-500">
                Select a previously analyzed resume to populate builder sections.
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

        {/* List of Previous Resumes */}
        <div className="p-5 space-y-3 overflow-y-auto flex-1">
          {isLoading ? (
            <div className="py-12 text-center space-y-2">
              <Loader2 className="w-6 h-6 animate-spin text-purple-600 mx-auto" />
              <p className="text-xs font-bold text-slate-700">Loading your resume history...</p>
            </div>
          ) : items.length === 0 ? (
            <div className="py-12 text-center space-y-2 text-slate-500">
              <FileText className="w-8 h-8 text-slate-300 mx-auto" />
              <p className="text-xs font-bold text-slate-700">No Previous Analyses Found</p>
              <p className="text-[11px] text-slate-400">
                Upload a resume in the Workspace to analyze it first, or build your resume from scratch.
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {items.map((item) => {
                const isSelected = selectedId === item.id;
                return (
                  <div
                    key={item.id}
                    onClick={() => setSelectedId(item.id)}
                    className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                      isSelected
                        ? "bg-purple-50/80 border-purple-300 ring-2 ring-purple-100"
                        : "bg-white border-slate-200/90 hover:border-slate-300"
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-8 h-8 rounded-xl bg-slate-100 text-slate-600 flex items-center justify-center shrink-0">
                        <FileText className="w-4 h-4 text-purple-600" />
                      </div>
                      <div className="min-w-0">
                        <h4 className="text-xs font-bold text-slate-900 truncate">
                          {item.original_filename}
                        </h4>
                        <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-0.5">
                          <span>{new Date(item.created_at).toLocaleDateString()}</span>
                          {item.overall_score !== null && item.overall_score !== undefined && (
                            <span className="font-semibold text-emerald-700">
                              · Score: {Math.round(item.overall_score)}/100
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="shrink-0">
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

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-end gap-2 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 font-bold text-xs rounded-xl cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={!selectedId || isImporting}
            onClick={handleImport}
            className="px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
          >
            {isImporting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <ArrowRight className="w-3.5 h-3.5" />}
            <span>Import and Edit</span>
          </button>
        </div>
      </div>
    </div>
  );
}

