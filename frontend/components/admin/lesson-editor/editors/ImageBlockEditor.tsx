/**
 * frontend/components/admin/lesson-editor/editors/ImageBlockEditor.tsx
 * Production-ready Editor interface for Image blocks (Phase 3B).
 * Supports direct file uploads to Supabase Storage ("course-lesson-media"),
 * drag-and-drop, existing media selection, alt text accessibility enforcement,
 * image replacement, and external image URL fallback.
 */

import React, { useState, useRef, useId } from "react";
import {
  UploadCloud,
  Image as ImageIcon,
  Link as LinkIcon,
  AlertCircle,
  RefreshCw,
  Trash2,
  ExternalLink,
  CheckCircle2,
  FolderOpen,
  X,
  FileImage,
} from "lucide-react";
import type { ImageBlockContent } from "@/types/lesson-content";
import type { CourseLessonMediaItem } from "@/types/course-media";
import { isValidHttpUrl } from "../utils/validation";
import { uploadAdminLessonMedia, fetchAdminLessonMedia } from "@/lib/api/courses";

interface Props {
  content: ImageBlockContent;
  onChange: (content: ImageBlockContent) => void;
  disabled?: boolean;
  courseId?: string;
  moduleId?: string;
  lessonId?: string;
}

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB
const ALLOWED_MIME_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];
const ALLOWED_EXTENSIONS = [".jpg", ".jpeg", ".png", ".webp", ".gif"];

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function validateImageFileClient(file: File): string | null {
  if (!file || file.size === 0) {
    return "Uploaded file is empty (0 bytes).";
  }
  if (file.size > MAX_FILE_SIZE) {
    return "Image is larger than 10 MB limit.";
  }
  const lowerName = (file.name || "").toLowerCase();
  if (lowerName.endsWith(".svg") || lowerName.endsWith(".svgz") || file.type === "image/svg+xml") {
    return "SVG files are not supported for security (XSS/XXE prevention). Please upload JPEG, PNG, WebP, or GIF.";
  }
  const hasAllowedExt = ALLOWED_EXTENSIONS.some((ext) => lowerName.endsWith(ext));
  if (!hasAllowedExt || (file.type && !ALLOWED_MIME_TYPES.includes(file.type))) {
    return "Unsupported image format. Allowed formats: JPEG, PNG, WebP, and GIF.";
  }
  return null;
}

export const ImageBlockEditor: React.FC<Props> = ({
  content,
  onChange,
  disabled,
  courseId,
  moduleId,
  lessonId,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const replaceInputRef = useRef<HTMLInputElement>(null);
  const uniqueId = useId();

  // Mode: "upload" vs "url"
  const isExternalUrlInitial =
    Boolean(content.url) &&
    !content.media_id &&
    !content.url.includes("course-lesson-media");

  const [mode, setMode] = useState<"upload" | "url">(isExternalUrlInitial ? "url" : "upload");
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [imageLoadError, setImageLoadError] = useState(false);

  // Existing Lesson Media Picker Modal
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const [existingMedia, setExistingMedia] = useState<CourseLessonMediaItem[]>([]);
  const [isLoadingMedia, setIsLoadingMedia] = useState(false);
  const [mediaPickerError, setMediaPickerError] = useState<string | null>(null);

  // Optional local metadata for display badge
  const [mediaBadge, setMediaBadge] = useState<{ filename?: string; size?: string } | null>(null);

  const hasImage = Boolean(content.url && isValidHttpUrl(content.url));

  // Adjust load error state if URL changed
  const [prevUrl, setPrevUrl] = useState(content.url);
  if (content.url !== prevUrl) {
    setPrevUrl(content.url);
    setImageLoadError(false);
  }

  const handleOpenPicker = () => {
    setIsPickerOpen(true);
    if (courseId && moduleId && lessonId) {
      setIsLoadingMedia(true);
      setMediaPickerError(null);
      fetchAdminLessonMedia(courseId, moduleId, lessonId)
        .then((res) => {
          setExistingMedia(res.items || []);
        })
        .catch((err) => {
          setMediaPickerError(err?.message || "Failed to load lesson media library.");
        })
        .finally(() => {
          setIsLoadingMedia(false);
        });
    }
  };


  // Handle file upload
  const processUpload = async (file: File) => {
    setUploadError(null);

    const clientError = validateImageFileClient(file);
    if (clientError) {
      setUploadError(clientError);
      return;
    }

    if (!courseId || !moduleId || !lessonId) {
      setUploadError("Missing lesson hierarchy context. Cannot upload image.");
      return;
    }

    setIsUploading(true);
    try {
      const mediaItem = await uploadAdminLessonMedia(courseId, moduleId, lessonId, file);
      onChange({
        ...content,
        url: mediaItem.public_url,
        media_id: mediaItem.id,
      });
      setMediaBadge({
        filename: mediaItem.original_filename,
        size: formatFileSize(mediaItem.size_bytes),
      });
      setImageLoadError(false);
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error ? err.message : "Upload failed. Please try again.";
      setUploadError(errorMessage);
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processUpload(file);
    }
    // Reset file input value so re-selecting same file triggers change
    if (e.target) e.target.value = "";
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!disabled && !isUploading) {
      setIsDragging(true);
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (disabled || isUploading) return;
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processUpload(file);
    }
  };

  const handleRemoveImage = () => {
    // Delete safety: clears working reference from block state without destroying storage asset
    onChange({
      ...content,
      url: "",
      media_id: null,
    });
    setMediaBadge(null);
    setUploadError(null);
  };

  const handleSelectExistingMedia = (item: CourseLessonMediaItem) => {
    onChange({
      ...content,
      url: item.public_url,
      media_id: item.id,
    });
    setMediaBadge({
      filename: item.original_filename,
      size: formatFileSize(item.size_bytes),
    });
    setIsPickerOpen(false);
    setUploadError(null);
  };

  return (
    <div className="space-y-4">
      {/* Hidden File Inputs */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/jpeg,image/png,image/webp,image/gif"
        className="hidden"
        data-testid="lesson-image-file-input"
        disabled={disabled || isUploading}
      />
      <input
        type="file"
        ref={replaceInputRef}
        onChange={handleFileChange}
        accept="image/jpeg,image/png,image/webp,image/gif"
        className="hidden"
        data-testid="lesson-image-replace-input"
        disabled={disabled || isUploading}
      />

      {/* Mode Selector Tabs (Upload vs External URL) */}
      <div className="flex items-center justify-between pb-2 border-b border-slate-800">
        <div className="inline-flex rounded-lg bg-slate-950 p-1 border border-slate-800/80">
          <button
            type="button"
            onClick={() => setMode("upload")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all min-h-[36px] ${
              mode === "upload"
                ? "bg-sky-600 text-white shadow-sm"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <UploadCloud className="w-3.5 h-3.5" />
            <span>Upload Image</span>
          </button>
          <button
            type="button"
            onClick={() => setMode("url")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all min-h-[36px] ${
              mode === "url"
                ? "bg-sky-600 text-white shadow-sm"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <LinkIcon className="w-3.5 h-3.5" />
            <span>External Image URL</span>
          </button>
        </div>

        {courseId && moduleId && lessonId && (
          <button
            type="button"
            onClick={handleOpenPicker}
            disabled={disabled || isUploading}
            className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-sky-400 transition-colors px-2.5 py-1.5 rounded-lg border border-slate-800 hover:border-sky-500/50 min-h-[36px]"
          >
            <FolderOpen className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Choose Existing Media</span>
            <span className="sm:hidden">Existing</span>
          </button>
        )}
      </div>

      {/* Upload Error Banner */}
      {uploadError && (
        <div
          role="alert"
          className="flex items-start gap-2.5 p-3 rounded-lg bg-rose-950/40 border border-rose-900/60 text-xs text-rose-200 animate-fadeIn"
        >
          <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="font-medium text-rose-300">Upload Issue</p>
            <p className="text-rose-200/90 leading-relaxed mt-0.5">{uploadError}</p>
          </div>
          <button
            type="button"
            onClick={() => setUploadError(null)}
            className="text-rose-400 hover:text-rose-200 p-0.5"
            aria-label="Dismiss error"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Main Mode View */}
      {mode === "upload" ? (
        <div className="space-y-4">
          {!hasImage ? (
            /* Upload Dropzone */
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={`relative border-2 border-dashed rounded-xl p-6 text-center transition-all ${
                isDragging
                  ? "border-sky-500 bg-sky-950/30 scale-[1.01]"
                  : "border-slate-800 hover:border-slate-700 bg-slate-950/40"
              }`}
            >
              <div className="flex flex-col items-center justify-center max-w-sm mx-auto">
                <div className="w-12 h-12 rounded-full bg-sky-950/60 border border-sky-800/80 flex items-center justify-center text-sky-400 mb-3 shadow-inner">
                  {isUploading ? (
                    <RefreshCw className="w-6 h-6 animate-spin text-sky-400" />
                  ) : (
                    <UploadCloud className="w-6 h-6" />
                  )}
                </div>

                <h4 className="text-sm font-semibold text-slate-200 mb-1">
                  {isUploading ? "Uploading to Storage..." : "Upload Lesson Image"}
                </h4>
                <p className="text-xs text-slate-400 mb-4 leading-relaxed">
                  Drag and drop your image here, or tap below to browse from your device.
                </p>

                <div className="flex flex-wrap items-center justify-center gap-2">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={disabled || isUploading}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold shadow-md transition-all disabled:opacity-50 min-h-[44px]"
                  >
                    {isUploading ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        <span>Uploading...</span>
                      </>
                    ) : (
                      <>
                        <ImageIcon className="w-4 h-4" />
                        <span>Browse Image</span>
                      </>
                    )}
                  </button>

                  {courseId && moduleId && lessonId && (
                    <button
                      type="button"
                      onClick={handleOpenPicker}
                      disabled={disabled || isUploading}
                      className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-lg bg-slate-800/80 hover:bg-slate-750 text-slate-300 text-xs font-medium border border-slate-700/80 transition-all min-h-[44px]"
                    >
                      <FolderOpen className="w-4 h-4 text-slate-400" />
                      <span>Pick Existing</span>
                    </button>
                  )}
                </div>

                {/* Honest Indeterminate Progress */}
                {isUploading && (
                  <div className="w-full mt-4 space-y-1.5 animate-fadeIn">
                    <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                      <div className="h-full bg-sky-500 rounded-full animate-indeterminate" />
                    </div>
                    <p className="text-[11px] text-sky-300/80">
                      Uploading to secure course media storage...
                    </p>
                  </div>
                )}

                <div className="mt-4 pt-3 border-t border-slate-800/60 text-[11px] text-slate-500 flex flex-wrap items-center justify-center gap-x-3 gap-y-1">
                  <span>JPEG, PNG, WebP, GIF</span>
                  <span>&bull;</span>
                  <span>Max 10 MB</span>
                  <span>&bull;</span>
                  <span className="text-slate-400">SVG blocked for security</span>
                </div>
              </div>
            </div>
          ) : (
            /* Uploaded Image Card */
            <div className="space-y-3">
              <div className="relative rounded-xl overflow-hidden bg-slate-950 border border-slate-800 p-3 sm:p-4">
                <div className="flex flex-col sm:flex-row items-center gap-4">
                  {/* Thumbnail / Image Preview */}
                  <div className="relative w-full sm:w-44 h-36 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center overflow-hidden shrink-0">
                    {!imageLoadError ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={content.url}
                        alt={content.alt || "Uploaded lesson image"}
                        onError={() => setImageLoadError(true)}
                        className="w-full h-full object-contain p-1"
                        loading="lazy"
                      />
                    ) : (
                      <div className="p-3 text-center text-xs text-amber-400 flex flex-col items-center justify-center gap-1">
                        <AlertCircle className="w-5 h-5 text-amber-400 shrink-0" />
                        <span className="text-[11px]">Image could not be loaded</span>
                      </div>
                    )}
                  </div>

                  {/* Metadata and Actions */}
                  <div className="flex-1 min-w-0 space-y-2 w-full text-left">
                    <div className="flex items-center gap-2">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-950/70 text-emerald-400 border border-emerald-800/60">
                        <CheckCircle2 className="w-3 h-3" />
                        <span>Uploaded to Storage</span>
                      </span>
                      {content.media_id && (
                        <span className="text-[10px] text-slate-500 font-mono truncate max-w-[140px]">
                          ID: {content.media_id.slice(0, 8)}...
                        </span>
                      )}
                    </div>

                    {mediaBadge && (
                      <div className="text-xs text-slate-300 font-medium truncate">
                        {mediaBadge.filename && <span>{mediaBadge.filename}</span>}
                        {mediaBadge.size && (
                          <span className="text-slate-500 ml-2">({mediaBadge.size})</span>
                        )}
                      </div>
                    )}

                    <div className="flex items-center gap-2 text-xs text-slate-400">
                      <a
                        href={content.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-sky-400 hover:text-sky-300 underline underline-offset-2"
                      >
                        <span>View asset</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>

                    {/* Action buttons (Replace / Remove) */}
                    <div className="flex items-center gap-2 pt-2">
                      <button
                        type="button"
                        onClick={() => replaceInputRef.current?.click()}
                        disabled={disabled || isUploading}
                        className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-750 text-slate-200 text-xs font-medium border border-slate-700 transition-colors disabled:opacity-50 min-h-[44px]"
                      >
                        {isUploading ? (
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <RefreshCw className="w-3.5 h-3.5 text-slate-400" />
                        )}
                        <span>Replace Image</span>
                      </button>

                      <button
                        type="button"
                        onClick={handleRemoveImage}
                        disabled={disabled || isUploading}
                        className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-rose-950/30 hover:bg-rose-900/40 text-rose-300 text-xs font-medium border border-rose-900/50 transition-colors disabled:opacity-50 min-h-[44px]"
                      >
                        <Trash2 className="w-3.5 h-3.5 text-rose-400" />
                        <span>Remove</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      ) : (
        /* External URL Mode View */
        <div className="space-y-3">
          <div>
            <label
              htmlFor={`image-url-${uniqueId}`}
              className="block text-xs font-medium text-slate-300 mb-1"
            >
              Image Web Address (URL) <span className="text-rose-400">*</span>
            </label>
            <div className="relative">
              <input
                id={`image-url-${uniqueId}`}
                type="url"
                disabled={disabled}
                value={content.url || ""}
                onChange={(e) => {
                  setImageLoadError(false);
                  onChange({ ...content, url: e.target.value, media_id: null });
                }}
                placeholder="https://example.com/diagram.png"
                className="w-full pl-9 pr-3.5 py-2.5 rounded-lg bg-slate-900/90 border border-slate-700/80 text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 font-mono text-xs disabled:opacity-50 min-h-[44px]"
              />
              <ImageIcon className="w-4 h-4 text-slate-500 absolute left-3 top-3.5" />
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              Provide a direct, publicly accessible HTTPS image link.
            </p>
          </div>

          {/* External Image Preview Card */}
          {hasImage && (
            <div className="relative rounded-xl overflow-hidden bg-slate-950 border border-slate-800 p-3 sm:p-4">
              <div className="flex flex-col sm:flex-row items-center gap-4">
                <div className="relative w-full sm:w-44 h-36 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center overflow-hidden shrink-0">
                  {!imageLoadError ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={content.url}
                      alt={content.alt || "External image"}
                      onError={() => setImageLoadError(true)}
                      className="w-full h-full object-contain p-1"
                      loading="lazy"
                    />
                  ) : (
                    <div className="p-3 text-center text-xs text-amber-400 flex flex-col items-center justify-center gap-1">
                      <AlertCircle className="w-5 h-5 text-amber-400 shrink-0" />
                      <span className="text-[11px]">Could not load external image</span>
                    </div>
                  )}
                </div>

                <div className="flex-1 min-w-0 space-y-2 text-left">
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-slate-800 text-slate-300 border border-slate-700">
                    <LinkIcon className="w-3 h-3 text-sky-400" />
                    <span>External URL Image</span>
                  </span>
                  <p className="text-xs text-slate-400 font-mono truncate">{content.url}</p>
                  <div>
                    <button
                      type="button"
                      onClick={handleRemoveImage}
                      disabled={disabled}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-950/30 hover:bg-rose-900/40 text-rose-300 text-xs font-medium border border-rose-900/50 transition-colors min-h-[44px]"
                    >
                      <Trash2 className="w-3.5 h-3.5 text-rose-400" />
                      <span>Clear URL</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Alt Text (Required) & Caption (Optional) Fields */}
      <div className="space-y-3 pt-2 border-t border-slate-800/80">
        <div>
          <div className="flex items-center justify-between mb-1">
            <label
              htmlFor={`image-alt-${uniqueId}`}
              className="text-xs font-medium text-slate-300 flex items-center gap-1"
            >
              <span>Accessibility Alt Text</span>
              <span className="text-rose-400">*</span>
            </label>
            <span className="text-[11px] text-slate-500">{(content.alt || "").length}/500</span>
          </div>
          <input
            id={`image-alt-${uniqueId}`}
            type="text"
            disabled={disabled}
            value={content.alt || ""}
            onChange={(e) => onChange({ ...content, alt: e.target.value })}
            maxLength={500}
            placeholder="Describe the image content and purpose for screen readers and accessibility..."
            className="w-full px-3.5 py-2.5 rounded-lg bg-slate-900/90 border border-slate-700/80 text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 disabled:opacity-50 min-h-[44px]"
          />
          <p className="text-[11px] text-slate-500 mt-1">
            Required for accessibility. Explain what is visual in the diagram or screenshot.
          </p>
        </div>

        <div>
          <div className="flex items-center justify-between mb-1">
            <label
              htmlFor={`image-caption-${uniqueId}`}
              className="text-xs font-medium text-slate-300"
            >
              Caption <span className="text-slate-500 font-normal">(Optional)</span>
            </label>
            <span className="text-[11px] text-slate-500">{(content.caption || "").length}/500</span>
          </div>
          <input
            id={`image-caption-${uniqueId}`}
            type="text"
            disabled={disabled}
            value={content.caption || ""}
            onChange={(e) => onChange({ ...content, caption: e.target.value || null })}
            maxLength={500}
            placeholder="Figure 1: Architectural diagram of the pipeline..."
            className="w-full px-3.5 py-2.5 rounded-lg bg-slate-900/90 border border-slate-700/80 text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 disabled:opacity-50 min-h-[44px]"
          />
        </div>
      </div>

      {/* Existing Lesson Media Picker Modal */}
      {isPickerOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby={`picker-title-${uniqueId}`}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fadeIn"
        >
          <div className="w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <FolderOpen className="w-5 h-5 text-sky-400" />
                <h3
                  id={`picker-title-${uniqueId}`}
                  className="text-base font-semibold text-white"
                >
                  Lesson Media Library
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsPickerOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                aria-label="Close media library"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 overflow-y-auto flex-1 space-y-4">
              <p className="text-xs text-slate-400">
                Select an image previously uploaded to this lesson to avoid duplicate storage
                uploads.
              </p>

              {mediaPickerError && (
                <div className="p-3 rounded-lg bg-rose-950/40 border border-rose-900 text-xs text-rose-300">
                  {mediaPickerError}
                </div>
              )}

              {isLoadingMedia ? (
                <div className="py-12 flex flex-col items-center justify-center gap-2 text-slate-400">
                  <RefreshCw className="w-6 h-6 animate-spin text-sky-400" />
                  <span className="text-xs">Loading lesson media...</span>
                </div>
              ) : existingMedia.length === 0 ? (
                <div className="py-12 text-center rounded-xl bg-slate-950/60 border border-dashed border-slate-800 p-6">
                  <FileImage className="w-8 h-8 text-slate-600 mx-auto mb-2" />
                  <p className="text-sm text-slate-300 font-medium">No media uploaded yet</p>
                  <p className="text-xs text-slate-500 mt-1">
                    Upload an image directly using the editor to start building this lesson&apos;s
                    media assets.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {existingMedia.map((media) => (
                    <button
                      key={media.id}
                      type="button"
                      onClick={() => handleSelectExistingMedia(media)}
                      className="group relative rounded-xl overflow-hidden border border-slate-800 hover:border-sky-500 bg-slate-950 p-2 text-left transition-all hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-sky-500 min-h-[44px]"
                    >
                      <div className="aspect-video w-full rounded bg-slate-900 overflow-hidden flex items-center justify-center mb-2">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={media.public_url}
                          alt={media.original_filename}
                          className="w-full h-full object-contain p-1 group-hover:scale-105 transition-transform"
                          loading="lazy"
                        />
                      </div>
                      <p className="text-xs font-medium text-slate-200 truncate">
                        {media.original_filename}
                      </p>
                      <div className="flex items-center justify-between text-[10px] text-slate-500 mt-1">
                        <span>{media.mime_type.replace("image/", "").toUpperCase()}</span>
                        <span>{formatFileSize(media.size_bytes)}</span>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="px-5 py-3 border-t border-slate-800 flex justify-end">
              <button
                type="button"
                onClick={() => setIsPickerOpen(false)}
                className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-750 text-slate-300 text-xs font-medium min-h-[44px]"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
