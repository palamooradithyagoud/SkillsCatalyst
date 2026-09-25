"use client";

import React from "react";
import type { TableBlockContent } from "@/types/lesson-content";

interface StudentTableBlockProps {
  content: TableBlockContent;
}

export function StudentTableBlock({ content }: StudentTableBlockProps) {
  const headers = content.headers || [];
  const rows = content.rows || [];

  if (headers.length === 0 && rows.length === 0) {
    return null;
  }

  return (
    <div className="my-6 w-full overflow-x-auto rounded-2xl border border-white/10 bg-slate-900/40 shadow-md">
      <table className="w-full text-left border-collapse text-sm text-slate-300">
        {headers.length > 0 && (
          <thead className="bg-slate-900/90 border-b border-white/10 text-xs uppercase tracking-wider font-semibold text-slate-200">
            <tr>
              {headers.map((header, idx) => (
                <th key={idx} scope="col" className="px-4 py-3 font-bold border-r last:border-r-0 border-white/5 whitespace-nowrap">
                  {header}
                </th>
              ))}
            </tr>
          </thead>
        )}
        <tbody className="divide-y divide-white/5">
          {rows.map((row, rowIdx) => (
            <tr
              key={rowIdx}
              className="hover:bg-white/[0.02] transition-colors"
            >
              {row.map((cell, cellIdx) => (
                <td key={cellIdx} className="px-4 py-3 border-r last:border-r-0 border-white/5 align-top whitespace-pre-wrap">
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
