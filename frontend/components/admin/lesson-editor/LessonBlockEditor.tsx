/**
 * frontend/components/admin/lesson-editor/LessonBlockEditor.tsx
 * Production-quality Admin Visual Lesson Block Editor (Phase 2B).
 * Consumes the Phase 2A structured block API and enforces strict editorial design conventions.
 */

"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  ChevronLeft,
  Save,
  Eye,
  Edit3,
  Plus,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  AlertTriangle,
  RotateCcw,
  Sparkles,
} from "lucide-react";
import type {
  LessonBlock,
  BlockType,
  HeadingBlockContent,
  ParagraphBlockContent,
  ImageBlockContent,
  CodeBlockContent,
  OutputBlockContent,
  ListBlockContent,
  TableBlockContent,
  CalloutBlockContent,
  QuoteBlockContent,
  YouTubeBlockContent,
  LinkBlockContent,
  KeyTakeawaysBlockContent,
} from "@/types/lesson-content";
import { fetchAdminLessonContent, saveAdminLessonContent } from "@/lib/api/courses";
import type { SaveStatus, LessonEditorHierarchy } from "./types";
import { validateAllBlocks } from "./utils/validation";
import { BlockCard } from "./BlockCard";
import { BlockPickerModal } from "./BlockPickerModal";
import { LessonBlockPreview } from "./preview/LessonBlockPreview";

interface Props extends LessonEditorHierarchy {
  onBack: () => void;
}

export function generateUniqueBlockId(): string {
  return "blk_" + Math.random().toString(36).substring(2, 9) + "_" + Date.now().toString(36);
}

export function createDefaultBlockContent(type: BlockType): LessonBlock["content"] {
  switch (type) {
    case "heading":
      return { level: 2, text: "" } as HeadingBlockContent;
    case "paragraph":
      return { text: "" } as ParagraphBlockContent;
    case "image":
      return { url: "", alt: "", caption: null } as ImageBlockContent;
    case "code":
      return { language: "python", code: "" } as CodeBlockContent;
    case "output":
      return { text: "" } as OutputBlockContent;
    case "list":
      return { ordered: false, items: [""] } as ListBlockContent;
    case "table":
      return {
        headers: ["Column 1", "Column 2"],
        rows: [["", ""]],
      } as TableBlockContent;
    case "callout":
      return { variant: "info", title: null, text: "" } as CalloutBlockContent;
    case "quote":
      return { text: "", author: null } as QuoteBlockContent;
    case "youtube":
      return { video_id: "", url: "", title: null } as YouTubeBlockContent;
    case "link":
      return { text: "", url: "" } as LinkBlockContent;
    case "key_takeaways":
      return { items: [""] } as KeyTakeawaysBlockContent;
    default:
      return { text: "" };
  }
}

export const LessonBlockEditor: React.FC<Props> = ({
  courseId,
  courseTitle,
  moduleId,
  moduleTitle,
  lessonId,
  lessonTitle,
  onBack,
}) => {
  // ── Content State ──────────────────────────────────────────────────────────
  const [blocks, setBlocks] = useState<LessonBlock[]>([]);
  const [initialBlocksJson, setInitialBlocksJson] = useState<string>("[]");
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  // ── Save & Validation State ────────────────────────────────────────────────
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("saved");
  const [saveErrorMsg, setSaveErrorMsg] = useState<string | null>(null);
  const [savedTimestamp, setSavedTimestamp] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<Record<string, string[]>>({});

  // ── View & Modal State ─────────────────────────────────────────────────────
  const [isPreviewMode, setIsPreviewMode] = useState<boolean>(false);
  const [isBlockPickerOpen, setIsBlockPickerOpen] = useState<boolean>(false);
  const [pickerInsertIndex, setPickerInsertIndex] = useState<number | null>(null);
  const [leaveConfirmOpen, setLeaveConfirmOpen] = useState<boolean>(false);
  const [deleteConfirm, setDeleteConfirm] = useState<{
    blockId: string;
    index: number;
    type: string;
  } | null>(null);

  // ── Unsaved Changes Calculation ────────────────────────────────────────────
  const hasUnsavedChanges = useMemo(() => {
    return JSON.stringify(blocks) !== initialBlocksJson;
  }, [blocks, initialBlocksJson]);

  // Derived effective status
  const currentDisplayStatus: SaveStatus = useMemo(() => {
    if (saveStatus === "saving" || saveStatus === "error") return saveStatus;
    return hasUnsavedChanges ? "unsaved" : "saved";
  }, [saveStatus, hasUnsavedChanges]);

  // ── Browser Navigation Guard (beforeunload) ─────────────────────────────────
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue = "";
      }
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [hasUnsavedChanges]);

  // ── Load Lesson Content (Phase 2A GET API) ──────────────────────────────────
  const [reloadToken, setReloadToken] = useState(0);

  useEffect(() => {
    let isMounted = true;

    async function fetchData() {
      try {
        const response = await fetchAdminLessonContent(courseId, moduleId, lessonId);
        if (!isMounted) return;
        const incomingBlocks = Array.isArray(response.blocks) ? response.blocks : [];
        const normalized = incomingBlocks.map((b, idx) => ({ ...b, order: idx }));
        setBlocks(normalized);
        setInitialBlocksJson(JSON.stringify(normalized));
        setSaveStatus("saved");
        setLoadError(null);
        if (response.updated_at) {
          try {
            setSavedTimestamp(new Date(response.updated_at).toLocaleTimeString());
          } catch {
            setSavedTimestamp(null);
          }
        }
      } catch (err: unknown) {
        if (!isMounted) return;
        const msg = err instanceof Error ? err.message : "Failed to load lesson content.";
        setLoadError(msg);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    fetchData();

    return () => {
      isMounted = false;
    };
  }, [courseId, moduleId, lessonId, reloadToken]);

  const handleRetryLoad = () => {
    setIsLoading(true);
    setLoadError(null);
    setReloadToken((prev) => prev + 1);
  };

  // ── Save Handler (Phase 2A PUT/PATCH API) ───────────────────────────────────
  const handleSave = async () => {
    if (saveStatus === "saving") return;

    // 1. Client-side validation against backend constraints
    const validation = validateAllBlocks(blocks);
    setValidationErrors(validation.errors);

    if (!validation.isValid) {
      setSaveStatus("error");
      setSaveErrorMsg("Please fix validation errors highlighted below before saving.");
      // Scroll to first invalid block
      const firstInvalidId = Object.keys(validation.errors)[0];
      if (firstInvalidId) {
        const el = document.getElementById(`block-${firstInvalidId}`);
        if (el) {
          el.scrollIntoView({ behavior: "smooth", block: "center" });
        }
      }
      return;
    }

    // 2. Normalize block order
    const normalizedPayloadBlocks = blocks.map((b, idx) => ({
      ...b,
      order: idx,
    }));

    setSaveStatus("saving");
    setSaveErrorMsg(null);

    try {
      // 3. Send payload to backend
      const response = await saveAdminLessonContent(courseId, moduleId, lessonId, {
        blocks: normalizedPayloadBlocks,
      });

      // 4. Update local state with normalized server response
      const serverBlocks = Array.isArray(response.blocks) ? response.blocks : [];
      const syncedBlocks = serverBlocks.map((b, idx) => ({ ...b, order: idx }));
      setBlocks(syncedBlocks);
      setInitialBlocksJson(JSON.stringify(syncedBlocks));

      // 5. Mark editor as saved
      setSaveStatus("saved");
      setSavedTimestamp(new Date().toLocaleTimeString());
      setValidationErrors({});
    } catch (err: unknown) {
      // 6. On failure: keep edits, show clear error, allow retry
      setSaveStatus("error");
      const msg = err instanceof Error ? err.message : "Network error while saving lesson content.";
      setSaveErrorMsg(msg);
    }
  };

  // ── Block Mutations ────────────────────────────────────────────────────────
  const handleAddBlock = (type: BlockType, insertAfterIndex?: number | null) => {
    const newBlock: LessonBlock = {
      id: generateUniqueBlockId(),
      type,
      order: 0,
      content: createDefaultBlockContent(type),
    } as LessonBlock;

    let nextBlocks: LessonBlock[];
    if (insertAfterIndex !== null && insertAfterIndex !== undefined && insertAfterIndex >= 0) {
      nextBlocks = [
        ...blocks.slice(0, insertAfterIndex + 1),
        newBlock,
        ...blocks.slice(insertAfterIndex + 1),
      ];
    } else {
      nextBlocks = [...blocks, newBlock];
    }

    // Normalize order
    const normalized = nextBlocks.map((b, idx) => ({ ...b, order: idx }));
    setBlocks(normalized);
  };

  const handleUpdateBlockContent = (index: number, newContent: LessonBlock["content"]) => {
    setBlocks((prev) => {
      const next = [...prev];
      if (next[index]) {
        next[index] = { ...next[index], content: newContent } as LessonBlock;
      }
      return next;
    });

    // Clear validation error on edit
    const blockId = blocks[index]?.id;
    if (blockId && validationErrors[blockId]) {
      setValidationErrors((prev) => {
        const next = { ...prev };
        delete next[blockId];
        return next;
      });
    }
  };

  const handleMoveBlock = (index: number, direction: "up" | "down") => {
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= blocks.length) return;

    const next = [...blocks];
    const temp = next[index];
    next[index] = next[targetIndex];
    next[targetIndex] = temp;

    // Normalize order
    const normalized = next.map((b, idx) => ({ ...b, order: idx }));
    setBlocks(normalized);
  };

  const handleDuplicateBlock = (index: number) => {
    const original = blocks[index];
    if (!original) return;

    // Deep copy content and generate new unique block ID
    const duplicated: LessonBlock = {
      id: generateUniqueBlockId(),
      type: original.type,
      order: index + 1,
      content: JSON.parse(JSON.stringify(original.content)),
    } as LessonBlock;

    const next = [
      ...blocks.slice(0, index + 1),
      duplicated,
      ...blocks.slice(index + 1),
    ];

    const normalized = next.map((b, idx) => ({ ...b, order: idx }));
    setBlocks(normalized);
  };

  const handleDeleteBlock = (index: number) => {
    const next = blocks.filter((_, i) => i !== index);
    const normalized = next.map((b, idx) => ({ ...b, order: idx }));
    setBlocks(normalized);
    setDeleteConfirm(null);
  };

  // ── Back Navigation with Guard ─────────────────────────────────────────────
  const handleAttemptBack = () => {
    if (hasUnsavedChanges) {
      setLeaveConfirmOpen(true);
    } else {
      onBack();
    }
  };

  // ── Loading & Error States ─────────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12 text-center">
        <div className="inline-flex items-center justify-center p-3 rounded-xl bg-slate-900 border border-slate-800 mb-4 animate-pulse">
          <RefreshCw className="w-6 h-6 text-sky-400 animate-spin" />
        </div>
        <h3 className="text-base font-semibold text-white">Loading Lesson Content</h3>
        <p className="text-xs text-slate-400 mt-1">Retrieving structured blocks from course system...</p>
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="max-w-xl mx-auto px-4 py-12">
        <div className="p-6 rounded-2xl bg-rose-950/40 border border-rose-800/80 text-center space-y-4">
          <div className="w-12 h-12 rounded-full bg-rose-900/60 text-rose-400 flex items-center justify-center mx-auto">
            <AlertCircle className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">Failed to Load Lesson Content</h3>
            <p className="text-xs text-rose-200/90 mt-1">{loadError}</p>
          </div>
          <div className="flex items-center justify-center gap-3 pt-2">
            <button
              type="button"
              onClick={onBack}
              className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold cursor-pointer min-h-[44px]"
            >
              Back to Course
            </button>
            <button
              type="button"
              onClick={handleRetryLoad}
              className="px-4 py-2 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold flex items-center gap-1.5 cursor-pointer min-h-[44px]"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Retry</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 pb-20">
      {/* ── Top Header & Breadcrumbs Bar ── */}
      <header className="sticky top-0 z-40 bg-slate-950/95 backdrop-blur-md border-b border-slate-800 px-4 sm:px-6 py-3.5 shadow-sm">
        <div className="max-w-4xl mx-auto flex flex-col gap-3">
          {/* Breadcrumbs Row */}
          <div className="flex items-center gap-1.5 text-xs text-slate-400 overflow-x-auto whitespace-nowrap scrollbar-none">
            <button
              type="button"
              onClick={handleAttemptBack}
              className="hover:text-white transition-colors cursor-pointer"
            >
              Courses
            </button>
            <span className="text-slate-600">/</span>
            <span className="text-slate-300 font-medium truncate max-w-[150px] sm:max-w-none">
              {courseTitle}
            </span>
            <span className="text-slate-600">/</span>
            <span className="text-slate-300 font-medium truncate max-w-[150px] sm:max-w-none">
              {moduleTitle}
            </span>
            <span className="text-slate-600">/</span>
            <span className="text-sky-400 font-semibold truncate max-w-[150px] sm:max-w-none">
              {lessonTitle}
            </span>
          </div>

          {/* Action Row */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={handleAttemptBack}
                aria-label="Back to lesson list"
                className="p-2 rounded-lg bg-slate-900 border border-slate-800 hover:bg-slate-800 hover:text-white text-slate-300 transition-colors cursor-pointer min-w-[40px] min-h-[40px] flex items-center justify-center"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <div>
                <h1 className="text-base sm:text-lg font-bold text-white tracking-tight line-clamp-1">
                  {lessonTitle}
                </h1>
                <div className="flex items-center gap-2 text-xs">
                  {/* Save Status Indicators */}
                  {currentDisplayStatus === "saving" && (
                    <span className="inline-flex items-center gap-1.5 text-sky-400 font-medium">
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Saving...</span>
                    </span>
                  )}
                  {currentDisplayStatus === "saved" && (
                    <span className="inline-flex items-center gap-1 text-emerald-400 font-medium">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Saved{savedTimestamp ? ` at ${savedTimestamp}` : ""}</span>
                    </span>
                  )}
                  {currentDisplayStatus === "unsaved" && (
                    <span className="inline-flex items-center gap-1.5 text-amber-400 font-medium">
                      <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                      <span>Unsaved changes</span>
                    </span>
                  )}
                  {currentDisplayStatus === "error" && (
                    <span className="inline-flex items-center gap-1 text-rose-400 font-medium">
                      <AlertCircle className="w-3.5 h-3.5" />
                      <span>Save failed</span>
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Header Right Actions */}
            <div className="flex items-center gap-2 self-end sm:self-auto">
              <button
                type="button"
                onClick={() => setIsPreviewMode(!isPreviewMode)}
                className={`px-3 py-2 rounded-lg border text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer min-h-[44px] ${
                  isPreviewMode
                    ? "bg-slate-800 text-sky-300 border-sky-500/50 shadow-sm"
                    : "bg-slate-900 border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800"
                }`}
              >
                {isPreviewMode ? (
                  <>
                    <Edit3 className="w-4 h-4 text-sky-400" />
                    <span>Back to Editor</span>
                  </>
                ) : (
                  <>
                    <Eye className="w-4 h-4 text-slate-400" />
                    <span>Preview</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={handleSave}
                disabled={saveStatus === "saving"}
                className="px-4 py-2 rounded-lg bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer shadow-sm disabled:opacity-50 min-h-[44px]"
              >
                {saveStatus === "saving" ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <Save className="w-3.5 h-3.5" />
                    <span>Save Changes</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* ── Save Error Banner ── */}
      {saveErrorMsg && (
        <div className="max-w-4xl mx-auto px-4 sm:px-6 pt-4">
          <div className="p-3.5 rounded-xl bg-rose-950/60 border border-rose-800 text-rose-200 text-xs flex items-start justify-between gap-3 shadow-sm">
            <div className="flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <div>
                <strong className="font-semibold text-rose-300">Save Error: </strong>
                <span>{saveErrorMsg}</span>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setSaveErrorMsg(null)}
              className="text-rose-400 hover:text-rose-200 font-bold px-1.5 py-0.5"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* ── Main View (Preview or Editor) ── */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 pt-6">
        {isPreviewMode ? (
          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 backdrop-blur-xs p-2 sm:p-6 shadow-xl">
            <LessonBlockPreview blocks={blocks} lessonTitle={lessonTitle} />
          </div>
        ) : (
          <div className="space-y-4">
            {/* Top Add Block Button if blocks exist */}
            {blocks.length > 0 && (
              <div className="flex justify-between items-center text-xs text-slate-400 pb-2 border-b border-slate-800">
                <span className="font-medium text-slate-300">
                  {blocks.length} Content Block{blocks.length === 1 ? "" : "s"}
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setPickerInsertIndex(null);
                    setIsBlockPickerOpen(true);
                  }}
                  className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700/80 text-sky-400 hover:text-sky-300 text-xs font-semibold flex items-center gap-1.5 cursor-pointer min-h-[36px]"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>+ Add Block</span>
                </button>
              </div>
            )}

            {/* Block Cards List */}
            {blocks.length === 0 ? (
              <div className="py-16 px-6 text-center rounded-2xl bg-slate-900/40 border border-dashed border-slate-800 space-y-4">
                <div className="w-12 h-12 rounded-full bg-slate-800/80 text-sky-400 flex items-center justify-center mx-auto">
                  <Sparkles className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">No content blocks yet</h3>
                  <p className="text-xs text-slate-400 max-w-md mx-auto mt-1">
                    Build your lesson curriculum by adding structured content blocks such as headings, paragraphs, code snippets, interactive tables, and videos.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setPickerInsertIndex(null);
                    setIsBlockPickerOpen(true);
                  }}
                  className="px-4 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold inline-flex items-center gap-2 cursor-pointer shadow-md min-h-[44px]"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add First Content Block</span>
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {blocks.map((block, idx) => (
                  <React.Fragment key={block.id}>
                    <BlockCard
                      block={block}
                      index={idx}
                      totalBlocks={blocks.length}
                      errors={validationErrors[block.id]}
                      disabled={saveStatus === "saving"}
                      onUpdateContent={(content) => handleUpdateBlockContent(idx, content)}
                      onMoveUp={() => handleMoveBlock(idx, "up")}
                      onMoveDown={() => handleMoveBlock(idx, "down")}
                      onDuplicate={() => handleDuplicateBlock(idx)}
                      onDelete={() =>
                        setDeleteConfirm({
                          blockId: block.id,
                          index: idx,
                          type: block.type,
                        })
                      }
                      onInsertAfter={() => {
                        setPickerInsertIndex(idx);
                        setIsBlockPickerOpen(true);
                      }}
                    />

                    {/* Subtle divider insertion target */}
                    {idx < blocks.length - 1 && (
                      <div className="flex items-center justify-center py-0.5 group">
                        <button
                          type="button"
                          onClick={() => {
                            setPickerInsertIndex(idx);
                            setIsBlockPickerOpen(true);
                          }}
                          title="Insert block here"
                          className="opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity px-2.5 py-1 rounded-full bg-slate-800 hover:bg-sky-900 border border-slate-700 text-[11px] text-slate-300 hover:text-sky-300 flex items-center gap-1 cursor-pointer"
                        >
                          <Plus className="w-3 h-3" />
                          <span>Insert block</span>
                        </button>
                      </div>
                    )}
                  </React.Fragment>
                ))}

                {/* Bottom Add Block Control */}
                <div className="pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setPickerInsertIndex(null);
                      setIsBlockPickerOpen(true);
                    }}
                    className="w-full py-3.5 rounded-xl border border-dashed border-slate-700 hover:border-sky-500/80 bg-slate-900/50 hover:bg-sky-950/20 text-sky-400 hover:text-sky-300 text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer min-h-[48px]"
                  >
                    <Plus className="w-4 h-4" />
                    <span>+ Add Content Block</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      {/* ── Block Picker Modal / Bottom Sheet ── */}
      <BlockPickerModal
        isOpen={isBlockPickerOpen}
        onClose={() => setIsBlockPickerOpen(false)}
        insertIndex={pickerInsertIndex}
        onSelectBlockType={(type) => handleAddBlock(type, pickerInsertIndex)}
      />

      {/* ── Delete Confirmation Modal ── */}
      {deleteConfirm && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="delete-confirm-title"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in duration-150"
        >
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-2xl space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-rose-950 text-rose-400 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 id="delete-confirm-title" className="text-base font-bold text-white">
                  Delete Content Block
                </h3>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                  Are you sure you want to remove this <span className="text-white font-semibold">#{deleteConfirm.index + 1} {deleteConfirm.type}</span> block? This action can be undone by discarding changes before saving.
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setDeleteConfirm(null)}
                className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold cursor-pointer min-h-[44px]"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleDeleteBlock(deleteConfirm.index)}
                className="px-4 py-2 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold cursor-pointer min-h-[44px]"
              >
                Delete Block
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Leave with Unsaved Changes Modal ── */}
      {leaveConfirmOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="leave-confirm-title"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in duration-150"
        >
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-2xl space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-950 text-amber-400 flex items-center justify-center shrink-0">
                <RotateCcw className="w-5 h-5" />
              </div>
              <div>
                <h3 id="leave-confirm-title" className="text-base font-bold text-white">
                  Discard Unsaved Edits?
                </h3>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                  You have unsaved changes in this lesson. Navigating away now will lose your current edits. Are you sure you want to leave?
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setLeaveConfirmOpen(false)}
                className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold cursor-pointer min-h-[44px]"
              >
                Stay in Editor
              </button>
              <button
                type="button"
                onClick={() => {
                  setLeaveConfirmOpen(false);
                  onBack();
                }}
                className="px-4 py-2 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold cursor-pointer min-h-[44px]"
              >
                Leave Without Saving
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
