/**
 * frontend/components/admin/lesson-editor/editors/YouTubeBlockEditor.tsx
 * Editor interface for YouTube video embeds with live preview and canonical ID extraction.
 */

import React, { useMemo } from "react";
import { Video, ExternalLink, CheckCircle2, AlertCircle } from "lucide-react";
import type { YouTubeBlockContent } from "@/types/lesson-content";
import { extractYouTubeVideoId, toCanonicalYouTubeUrl, toSafeEmbedUrl } from "../utils/youtube";

interface Props {
  content: YouTubeBlockContent;
  onChange: (content: YouTubeBlockContent) => void;
  disabled?: boolean;
}

export const YouTubeBlockEditor: React.FC<Props> = ({ content, onChange, disabled }) => {
  const currentInput = content.url || content.video_id || "";

  const detectedVideoId = useMemo(() => {
    return extractYouTubeVideoId(currentInput);
  }, [currentInput]);

  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    const parsedId = extractYouTubeVideoId(val);
    if (parsedId) {
      onChange({
        ...content,
        video_id: parsedId,
        url: toCanonicalYouTubeUrl(parsedId),
      });
    } else {
      onChange({
        ...content,
        url: val,
        video_id: val.trim().length === 11 ? val.trim() : "",
      });
    }
  };

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange({ ...content, title: e.target.value || null });
  };

  return (
    <div className="space-y-3">
      {/* URL Input */}
      <div>
        <label htmlFor="youtube-url-input" className="block text-xs font-medium text-slate-300 mb-1">
          YouTube URL or 11-character Video ID <span className="text-rose-400">*</span>
        </label>
        <div className="relative">
          <input
            id="youtube-url-input"
            type="text"
            disabled={disabled}
            value={currentInput}
            onChange={handleUrlChange}
            placeholder="https://www.youtube.com/watch?v=dQw4w9WgXcQ or dQw4w9WgXcQ"
            className="w-full pl-9 pr-24 py-2.5 rounded-lg bg-slate-900/90 border border-slate-700/80 text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 font-mono text-xs disabled:opacity-50 min-h-[44px]"
          />
          <Video className="w-4 h-4 text-red-500 absolute left-3 top-3.5" />
          <div className="absolute right-3 top-3">
            {detectedVideoId ? (
              <span className="inline-flex items-center gap-1 text-[11px] text-emerald-400 font-medium">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Valid ID</span>
              </span>
            ) : currentInput.trim() ? (
              <span className="inline-flex items-center gap-1 text-[11px] text-amber-400 font-medium">
                <AlertCircle className="w-3.5 h-3.5" />
                <span>Invalid</span>
              </span>
            ) : null}
          </div>
        </div>
        <p className="text-[11px] text-slate-500 mt-1">
          Supports: <code className="text-slate-400">youtube.com/watch?v=...</code>, <code className="text-slate-400">youtu.be/...</code>, shorts, and raw IDs.
        </p>
      </div>

      {/* Optional Title */}
      <div>
        <div className="flex items-center justify-between mb-1">
          <label htmlFor="youtube-title-input" className="text-xs font-medium text-slate-300">
            Video Title <span className="text-slate-500 font-normal">(Optional description)</span>
          </label>
          <span className="text-[11px] text-slate-500">{(content.title || "").length}/300</span>
        </div>
        <input
          id="youtube-title-input"
          type="text"
          disabled={disabled}
          value={content.title || ""}
          onChange={handleTitleChange}
          maxLength={300}
          placeholder="e.g. Complete Guide to Async/Await in Python"
          className="w-full px-3.5 py-2.5 rounded-lg bg-slate-900/90 border border-slate-700/80 text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 disabled:opacity-50 min-h-[44px]"
        />
      </div>

      {/* Live Video Embed Preview */}
      {detectedVideoId && (
        <div className="pt-2 border-t border-slate-800">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-slate-400">Live Video Preview (ID: {detectedVideoId})</span>
            <a
              href={toCanonicalYouTubeUrl(detectedVideoId)}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-sky-400 hover:text-sky-300 flex items-center gap-1"
            >
              <span>Watch on YouTube</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
          <div className="relative aspect-video rounded-lg overflow-hidden border border-slate-800 bg-black max-w-xl mx-auto shadow-md">
            <iframe
              src={toSafeEmbedUrl(detectedVideoId)}
              title={content.title || "YouTube video preview"}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="w-full h-full border-0"
            />
          </div>
        </div>
      )}
    </div>
  );
};
