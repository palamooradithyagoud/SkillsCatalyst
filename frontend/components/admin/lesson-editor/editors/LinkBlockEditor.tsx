/**
 * frontend/components/admin/lesson-editor/editors/LinkBlockEditor.tsx
 * Editor interface for External Link blocks.
 */

import React from "react";
import { Link2, ExternalLink } from "lucide-react";
import type { LinkBlockContent } from "@/types/lesson-content";
import { isValidHttpUrl } from "../utils/validation";

interface Props {
  content: LinkBlockContent;
  onChange: (content: LinkBlockContent) => void;
  disabled?: boolean;
}

export const LinkBlockEditor: React.FC<Props> = ({ content, onChange, disabled }) => {
  const handleTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange({ ...content, text: e.target.value });
  };

  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange({ ...content, url: e.target.value });
  };

  const hasValidUrl = isValidHttpUrl(content.url || "");

  return (
    <div className="space-y-3">
      <div>
        <div className="flex items-center justify-between mb-1">
          <label htmlFor="link-text-input" className="text-xs font-medium text-slate-300">
            Link Display Text <span className="text-rose-400">*</span>
          </label>
          <span className="text-[11px] text-slate-500">{(content.text || "").length}/300</span>
        </div>
        <input
          id="link-text-input"
          type="text"
          disabled={disabled}
          value={content.text || ""}
          onChange={handleTextChange}
          maxLength={300}
          placeholder="e.g. Official Python Documentation on Coroutines"
          className="w-full px-3.5 py-2.5 rounded-lg bg-slate-900/90 border border-slate-700/80 text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 disabled:opacity-50 min-h-[44px]"
        />
      </div>

      <div>
        <label htmlFor="link-url-input" className="block text-xs font-medium text-slate-300 mb-1">
          Destination Web Address (URL) <span className="text-rose-400">*</span>
        </label>
        <div className="relative">
          <input
            id="link-url-input"
            type="url"
            disabled={disabled}
            value={content.url || ""}
            onChange={handleUrlChange}
            placeholder="https://docs.python.org/3/library/asyncio.html"
            className="w-full pl-9 pr-20 py-2.5 rounded-lg bg-slate-900/90 border border-slate-700/80 text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 font-mono text-xs disabled:opacity-50 min-h-[44px]"
          />
          <Link2 className="w-4 h-4 text-slate-500 absolute left-3 top-3.5" />
          {hasValidUrl && (
            <a
              href={content.url}
              target="_blank"
              rel="noopener noreferrer"
              className="absolute right-2.5 top-2.5 px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-sky-400 text-xs font-medium inline-flex items-center gap-1 cursor-pointer"
            >
              <span>Test</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          )}
        </div>
      </div>
    </div>
  );
};
