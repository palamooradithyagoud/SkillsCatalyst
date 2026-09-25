/**
 * frontend/components/admin/lesson-editor/editors/TableBlockEditor.tsx
 * Responsive table editor maintaining strict column-row dimension synchronization.
 */

import React from "react";
import { Plus, Trash2, Columns, Rows } from "lucide-react";
import type { TableBlockContent } from "@/types/lesson-content";

interface Props {
  content: TableBlockContent;
  onChange: (content: TableBlockContent) => void;
  disabled?: boolean;
}

export const TableBlockEditor: React.FC<Props> = ({ content, onChange, disabled }) => {
  const headers = content.headers && content.headers.length > 0 ? content.headers : ["Column 1", "Column 2"];
  const rows =
    content.rows && content.rows.length > 0
      ? content.rows
      : [["", ""]];

  // Helper to ensure all rows match headers length
  const updateTable = (newHeaders: string[], newRows: string[][]) => {
    const colCount = newHeaders.length;
    const syncedRows = newRows.map((row) => {
      if (row.length === colCount) return row;
      if (row.length < colCount) {
        return [...row, ...Array(colCount - row.length).fill("")];
      }
      return row.slice(0, colCount);
    });
    onChange({ headers: newHeaders, rows: syncedRows });
  };

  const handleHeaderChange = (colIdx: number, val: string) => {
    const nextHeaders = [...headers];
    nextHeaders[colIdx] = val;
    updateTable(nextHeaders, rows);
  };

  const handleCellChange = (rowIdx: number, colIdx: number, val: string) => {
    const nextRows = rows.map((r, rI) => {
      if (rI !== rowIdx) return r;
      const nextR = [...r];
      nextR[colIdx] = val;
      return nextR;
    });
    updateTable(headers, nextRows);
  };

  const handleAddColumn = () => {
    if (headers.length >= 20) return;
    const newHeaders = [...headers, `Column ${headers.length + 1}`];
    const newRows = rows.map((r) => [...r, ""]);
    updateTable(newHeaders, newRows);
  };

  const handleRemoveColumn = (colIdx: number) => {
    if (headers.length <= 1) return;
    const newHeaders = headers.filter((_, idx) => idx !== colIdx);
    const newRows = rows.map((r) => r.filter((_, idx) => idx !== colIdx));
    updateTable(newHeaders, newRows);
  };

  const handleAddRow = () => {
    if (rows.length >= 200) return;
    const newRow = Array(headers.length).fill("");
    updateTable(headers, [...rows, newRow]);
  };

  const handleRemoveRow = (rowIdx: number) => {
    if (rows.length <= 1) return;
    const newRows = rows.filter((_, idx) => idx !== rowIdx);
    updateTable(headers, newRows);
  };

  return (
    <div className="space-y-4">
      {/* Controls Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 p-2.5 rounded-lg bg-slate-900/60 border border-slate-800">
        <div className="flex items-center gap-3 text-xs text-slate-400">
          <span className="flex items-center gap-1">
            <Columns className="w-3.5 h-3.5 text-sky-400" />
            <span>{headers.length}/20 Columns</span>
          </span>
          <span className="text-slate-600">&bull;</span>
          <span className="flex items-center gap-1">
            <Rows className="w-3.5 h-3.5 text-purple-400" />
            <span>{rows.length}/200 Rows</span>
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            disabled={disabled || headers.length >= 20}
            onClick={handleAddColumn}
            className="px-2.5 py-1.5 rounded-md bg-slate-800 hover:bg-slate-700 text-sky-300 text-xs font-semibold flex items-center gap-1 cursor-pointer disabled:opacity-30 min-h-[36px]"
          >
            <Plus className="w-3 h-3" />
            <span>Add Column</span>
          </button>
          <button
            type="button"
            disabled={disabled || rows.length >= 200}
            onClick={handleAddRow}
            className="px-2.5 py-1.5 rounded-md bg-slate-800 hover:bg-slate-700 text-purple-300 text-xs font-semibold flex items-center gap-1 cursor-pointer disabled:opacity-30 min-h-[36px]"
          >
            <Plus className="w-3 h-3" />
            <span>Add Row</span>
          </button>
        </div>
      </div>

      {/* Responsive Table Scroll Container */}
      <div className="overflow-x-auto rounded-lg border border-slate-800 bg-slate-950 pb-2">
        <table className="w-full min-w-[500px] border-collapse text-left text-xs">
          <thead>
            <tr className="bg-slate-900 border-b border-slate-800">
              <th className="p-2 w-10 text-center text-slate-500 font-mono text-[10px]">#</th>
              {headers.map((header, colIdx) => (
                <th key={colIdx} className="p-2 min-w-[140px]">
                  <div className="flex items-center gap-1">
                    <input
                      type="text"
                      disabled={disabled}
                      value={header}
                      onChange={(e) => handleHeaderChange(colIdx, e.target.value)}
                      placeholder={`Column ${colIdx + 1}`}
                      className="w-full px-2 py-1 rounded bg-slate-800/90 border border-slate-700 text-white font-semibold text-xs focus:outline-none focus:ring-1 focus:ring-sky-500 min-h-[36px]"
                    />
                    {headers.length > 1 && (
                      <button
                        type="button"
                        disabled={disabled}
                        onClick={() => handleRemoveColumn(colIdx)}
                        title="Remove column"
                        className="p-1.5 rounded hover:bg-rose-950/60 text-slate-500 hover:text-rose-400 cursor-pointer min-w-[28px] min-h-[28px] flex items-center justify-center"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                </th>
              ))}
              <th className="p-2 w-10 text-center text-slate-500"></th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, rowIdx) => (
              <tr key={rowIdx} className="border-b border-slate-800/60 hover:bg-slate-900/30">
                <td className="p-2 text-center text-slate-500 font-mono text-[10px]">{rowIdx + 1}</td>
                {headers.map((_, colIdx) => (
                  <td key={colIdx} className="p-2">
                    <input
                      type="text"
                      disabled={disabled}
                      value={row[colIdx] || ""}
                      onChange={(e) => handleCellChange(rowIdx, colIdx, e.target.value)}
                      placeholder={`R${rowIdx + 1} C${colIdx + 1}`}
                      className="w-full px-2.5 py-1.5 rounded bg-slate-900/90 border border-slate-700/60 text-slate-200 text-xs focus:outline-none focus:ring-1 focus:ring-sky-500 min-h-[36px]"
                    />
                  </td>
                ))}
                <td className="p-2 text-center">
                  {rows.length > 1 && (
                    <button
                      type="button"
                      disabled={disabled}
                      onClick={() => handleRemoveRow(rowIdx)}
                      title="Remove row"
                      className="p-1.5 rounded hover:bg-rose-950/60 text-slate-500 hover:text-rose-400 cursor-pointer min-w-[28px] min-h-[28px] flex items-center justify-center"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="text-[11px] text-slate-500">
        Table rows automatically synchronize column width. Scroll horizontally on mobile screens if needed.
      </p>
    </div>
  );
};
