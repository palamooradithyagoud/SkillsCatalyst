/**
 * frontend/components/admin/lesson-editor/editors/ImageBlockEditor.tsx
 * Editor interface for Image blocks.
 * Note: Storage upload deferred to Phase 3; Phase 2B utilizes validated URLs.
 */

import React, { useState } from "react";
import { Image as ImageIcon, Info, ExternalLink } from "lucide-react";
import type { ImageBlockContent } from "@/types/lesson-content";
import { isValidHttpUrl } from "../utils/validation";

interface Props {
  content: ImageBlockContent;
  onChange: (content: ImageBlockContent) => void;
  disabled?: boolean;
}

export const ImageBlockEditor: React.FC<Props> = ({ content, onChange, disabled }) => {
  const [imageLoadError, setImageLoadError] = useState(false);

  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setImageLoadError(false);
    onChange({ ...content, url: e.target.value });
  };

  const handleAltChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange({ ...content, alt: e.target.value });
  };

  const handleCaptionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange({ ...content, caption: e.target.value || null });
  };

  const hasValidUrl = isValidHttpUrl(content.url || "");

  return (
    <div className="space-y-4">
      {/* Notice about Phase 3 media infrastructure */}
      <div className="flex items-start gap-2.5 p-3 rounded-lg bg-sky-950/40 border border-sky-900/60 text-xs text-sky-200">
        <Info className="w-4 h-4 text-sky-400 shrink-0 mt-0.5" />
        <p className="leading-relaxed">
          <strong className="text-sky-300 font-semibold">Phase 2B Content Mode:</strong> Provide a direct HTTP/HTTPS image URL. Direct file upload and cloud storage bucket management will be available in Phase 3.
        </p>
      </div>

      <div className="space-y-3">
        <div>
          <label htmlFor="image-url-input" className="block text-xs font-medium text-slate-300 mb-1">
            Image Web Address (URL) <span className="text-rose-400">*</span>
          </label>
          <div className="relative">
            <input
              id="image-url-input"
              type="url"
              disabled={disabled}
              value={content.url || ""}
              onChange={handleUrlChange}
              placeholder="https://example.com/diagram.png"
              className="w-full pl-9 pr-3.5 py-2.5 rounded-lg bg-slate-900/90 border border-slate-700/80 text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 font-mono text-xs disabled:opacity-50 min-h-[44px]"
            />
            <ImageIcon className="w-4 h-4 text-slate-500 absolute left-3 top-3.5" />
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-1">
            <label htmlFor="image-alt-input" className="text-xs font-medium text-slate-300">
              Accessibility Alt Text <span className="text-rose-400">*</span>
            </label>
            <span className="text-[11px] text-slate-500">{(content.alt || "").length}/500</span>
          </div>
          <input
            id="image-alt-input"
            type="text"
            disabled={disabled}
            value={content.alt || ""}
            onChange={handleAltChange}
            maxLength={500}
            placeholder="Descriptive explanation for screen readers and accessibility..."
            className="w-full px-3.5 py-2.5 rounded-lg bg-slate-900/90 border border-slate-700/80 text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 disabled:opacity-50 min-h-[44px]"
          />
        </div>

        <div>
          <div className="flex items-center justify-between mb-1">
            <label htmlFor="image-caption-input" className="text-xs font-medium text-slate-300">
              Caption <span className="text-slate-500 font-normal">(Optional)</span>
            </label>
            <span className="text-[11px] text-slate-500">{(content.caption || "").length}/500</span>
          </div>
          <input
            id="image-caption-input"
            type="text"
            disabled={disabled}
            value={content.caption || ""}
            onChange={handleCaptionChange}
            maxLength={500}
            placeholder="Figure 1: Architectural diagram of the pipeline..."
            className="w-full px-3.5 py-2.5 rounded-lg bg-slate-900/90 border border-slate-700/80 text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 disabled:opacity-50 min-h-[44px]"
          />
        </div>
      </div>

      {/* Live Preview Thumbnail */}
      {hasValidUrl && (
        <div className="pt-2 border-t border-slate-800">
          <span className="text-xs font-medium text-slate-400 block mb-2">Image Preview</span>
          <div className="relative rounded-lg overflow-hidden bg-slate-950 border border-slate-800 p-2 max-w-md">
            {!imageLoadError ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={content.url}
                alt={content.alt || "Preview"}
                onError={() => setImageLoadError(true)}
                className="max-h-48 rounded object-contain mx-auto"
              />
            ) : (
              <div className="p-4 text-center text-xs text-amber-400 flex items-center justify-center gap-1.5">
                <Info className="w-4 h-4 shrink-0" />
                <span>Could not load image from this URL. Please verify the link.</span>
              </div>
            )}
            {content.caption && (
              <p className="text-[11px] text-slate-400 italic text-center mt-2">{content.caption}</p>
            )}
            <a
              href={content.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-[11px] text-sky-400 hover:text-sky-300 mt-2 ml-1"
            >
              <span>Open in new tab</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>
      )}
    </div>
  );
};
