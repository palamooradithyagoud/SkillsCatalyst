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
    <div className="my-6 w-full overflow-x-auto rounded-2xl border border-slate-200/90 bg-white shadow-xs">
      <table className="w-full text-left border-collapse text-sm text-slate-700">
        {headers.length > 0 && (
          <thead className="bg-slate-50 border-b border-slate-200 text-xs uppercase tracking-wider font-bold text-slate-700">
            <tr>
              {headers.map((header, idx) => (
                <th key={idx} scope="col" className="px-4 py-3 font-bold border-r last:border-r-0 border-slate-100 whitespace-nowrap">
                  {header}
                </th>
              ))}
            </tr>
          </thead>
        )}
        <tbody className="divide-y divide-slate-100">
          {rows.map((row, rowIdx) => (
            <tr
              key={rowIdx}
              className="hover:bg-slate-50/70 transition-colors"
            >
              {row.map((cell, cellIdx) => (
                <td key={cellIdx} className="px-4 py-3 border-r last:border-r-0 border-slate-100 align-top whitespace-pre-wrap">
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
