"use client";

import React, { useState, useEffect } from "react";
import {
  FileText,
  X,
  Loader2,
  Trash2,
  FolderOpen,
  Calendar,
  LayoutTemplate,
} from "lucide-react";
import { listBuilderDocuments, deleteBuilderDocument } from "@/lib/api/career";
import { ResumeBuilderDocument } from "@/types/career";

interface ResumeDraftsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectDraft: (doc: ResumeBuilderDocument) => void;
}

export default function ResumeDraftsModal({
  isOpen,
  onClose,
  onSelectDraft,
}: ResumeDraftsModalProps) {
  const [drafts, setDrafts] = useState<ResumeBuilderDocument[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    let isMounted = true;
    async function fetchDrafts() {
      setIsLoading(true);
      try {
        const docs = await listBuilderDocuments();
        if (isMounted) setDrafts(docs);
      } catch (err) {
        console.error("Failed to load drafts:", err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }
    fetchDrafts();
    return () => {
      isMounted = false;
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleDelete = async (docId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm("Are you sure you want to delete this resume draft?")) return;
    setDeletingId(docId);
    try {
      await deleteBuilderDocument(docId);
      setDrafts((prev) => prev.filter((d) => d.id !== docId));
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Failed to delete draft.");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[80vh]">
        {/* Header */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-purple-50 via-slate-50 to-indigo-50 border-b border-slate-100 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-purple-600 text-white flex items-center justify-center shadow-xs">
              <FolderOpen className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-black text-slate-900">
                Saved Resume Drafts
              </h3>
              <p className="text-xs text-slate-500">
                Continue editing your in-progress builder drafts.
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

        {/* List of drafts */}
        <div className="p-4 sm:p-5 space-y-2.5 overflow-y-auto flex-1">
          {isLoading ? (
            <div className="py-12 text-center space-y-2">
              <Loader2 className="w-6 h-6 animate-spin text-purple-600 mx-auto" />
              <p className="text-xs font-bold text-slate-700">Loading your saved drafts...</p>
            </div>
          ) : drafts.length === 0 ? (
            <div className="py-12 text-center space-y-2 text-slate-500">
              <FileText className="w-8 h-8 text-slate-300 mx-auto" />
              <p className="text-xs font-bold text-slate-700">No Saved Drafts Yet</p>
              <p className="text-[11px] text-slate-400">
                Start building your resume and click &ldquo;Save Draft&rdquo; to resume editing anytime.
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {drafts.map((d) => (
                <div
                  key={d.id}
                  onClick={() => {
                    onSelectDraft(d);
                    onClose();
                  }}
                  className="p-3.5 bg-white hover:bg-purple-50/50 border border-slate-200/90 hover:border-purple-300 rounded-2xl transition-all cursor-pointer flex items-center justify-between gap-3 group shadow-2xs"
                >
                  <div className="min-w-0">
                    <h4 className="text-xs font-bold text-slate-900 group-hover:text-purple-900 truncate">
                      {d.title}
                    </h4>
                    <div className="flex items-center gap-2.5 text-[11px] text-slate-400 mt-0.5">
                      <span>{new Date(d.updated_at).toLocaleDateString()}</span>
                      <span>· Template: {d.selected_template}</span>
                      {d.target_role && <span className="text-purple-700 font-medium">· {d.target_role}</span>}
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      type="button"
                      onClick={(e) => handleDelete(d.id, e)}
                      disabled={deletingId === d.id}
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                      title="Delete draft"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-3.5 bg-slate-50 border-t border-slate-200 flex justify-end shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 font-bold text-xs rounded-xl cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

