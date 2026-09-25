/**
 * frontend/components/admin/lesson-editor/preview/TableBlockPreview.tsx
 * Preview renderer for Table blocks.
 */

import React from "react";
import type { TableBlockContent } from "@/types/lesson-content";

export const TableBlockPreview: React.FC<{ content: TableBlockContent }> = ({ content }) => {
  const headers = content.headers || [];
  const rows = content.rows || [];

  if (headers.length === 0) return null;

  return (
    <div className="my-5 overflow-x-auto rounded-xl border border-slate-800 bg-slate-950 shadow-md">
      <table className="w-full border-collapse text-left text-xs sm:text-sm">
        <thead>
          <tr className="bg-slate-900 border-b border-slate-800">
            {headers.map((header, idx) => (
              <th
                key={idx}
                className="p-3 sm:p-3.5 font-semibold text-white tracking-wide text-xs uppercase"
              >
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, rowIdx) => (
            <tr
              key={rowIdx}
              className="border-b border-slate-800/60 hover:bg-slate-900/40 transition-colors last:border-b-0"
            >
              {headers.map((_, colIdx) => (
                <td key={colIdx} className="p-3 sm:p-3.5 text-slate-300">
                  {row[colIdx] || ""}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
