import React from "react";
import { ChevronRight, Sparkles } from "lucide-react";

interface ResumeMarkdownViewerProps {
  content: string;
}

export default function ResumeMarkdownViewer({ content }: ResumeMarkdownViewerProps) {
  const lines = content.split("\n");
  let inTable = false;
  let tableRows: string[][] = [];
  const elements: React.ReactNode[] = [];

  lines.forEach((line, index) => {
    const trimmed = line.trim();

    if (trimmed.startsWith("|")) {
      inTable = true;
      const cols = trimmed
        .split("|")
        .map((c) => c.trim())
        .filter((_, idx, arr) => idx > 0 && idx < arr.length - 1);
      if (!trimmed.includes("---")) tableRows.push(cols);
      return;
    } else if (inTable) {
      inTable = false;
      const rowsToRender = [...tableRows];
      tableRows = [];
      if (rowsToRender.length > 0) {
        const header = rowsToRender[0];
        const body = rowsToRender.slice(1);
        elements.push(
          <div
            key={`table-${index}`}
            className="my-4 overflow-x-auto rounded-xl border border-purple-100 bg-white shadow-2xs"
          >
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-purple-50 text-purple-950 border-b border-purple-200 font-bold">
                  {header.map((h, i) => (
                    <th key={i} className="p-3">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-purple-100">
                {body.map((r, ri) => (
                  <tr
                    key={ri}
                    className="hover:bg-purple-50/50 text-slate-700"
                  >
                    {r.map((cell, ci) => (
                      <td key={ci} className="p-3 leading-relaxed">
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
    }

    if (!trimmed) {
      elements.push(<div key={index} className="h-2" />);
      return;
    }

    if (trimmed.startsWith("### ")) {
      elements.push(
        <h4
          key={index}
          className="text-base font-bold text-purple-900 mt-5 mb-2 flex items-center gap-2"
        >
          <ChevronRight className="w-4 h-4 text-purple-600" />
          {trimmed.replace("### ", "").replace(/\*\*/g, "")}
        </h4>
      );
    } else if (trimmed.startsWith("## ")) {
      elements.push(
        <h3
          key={index}
          className="text-lg font-extrabold text-slate-900 mt-6 mb-3 pb-2 border-b border-purple-100 flex items-center gap-2"
        >
          {trimmed.replace("## ", "").replace(/\*\*/g, "")}
        </h3>
      );
    } else if (
      trimmed.toLowerCase().includes("verdict: hire") ||
      trimmed.toLowerCase().includes("verdict: no hire") ||
      trimmed.toLowerCase().includes("verdict: borderline")
    ) {
      const isHire = trimmed.toLowerCase().includes("verdict: hire");
      const isNoHire = trimmed.toLowerCase().includes("verdict: no hire");
      elements.push(
        <div
          key={index}
          className={`p-3 rounded-xl border my-2 flex items-center gap-2 text-xs font-bold ${
            isHire
              ? "bg-emerald-50 border-emerald-200 text-emerald-800"
              : isNoHire
              ? "bg-rose-50 border-rose-200 text-rose-800"
              : "bg-amber-50 border-amber-200 text-amber-800"
          }`}
        >
          <Sparkles className="w-4 h-4 shrink-0" />
          <span>{trimmed.replace(/\*\*/g, "")}</span>
        </div>
      );
    } else if (trimmed.startsWith("- **Before:**")) {
      elements.push(
        <div
          key={index}
          className="mt-3 p-3 rounded-t-xl bg-rose-50/70 border border-rose-200 text-xs text-rose-700 line-through"
        >
          {trimmed.replace("- **Before:**", "Original:").replace(/\*\*/g, "")}
        </div>
      );
    } else if (trimmed.startsWith("- **After:**")) {
      elements.push(
        <div
          key={index}
          className="mb-3 p-3 rounded-b-xl bg-purple-50 border-x border-b border-purple-200 text-xs text-purple-900 font-semibold flex items-start gap-2"
        >
          <Sparkles className="w-4 h-4 text-purple-600 shrink-0 mt-0.5" />
          <span>
            {trimmed.replace("- **After:**", "AI Rewritten:").replace(/\*\*/g, "")}
          </span>
        </div>
      );
    } else if (trimmed.startsWith("- ") || trimmed.startsWith("* ")) {
      const contentStr = trimmed.substring(2);
      elements.push(
        <div
          key={index}
          className="flex items-start gap-2 text-xs text-slate-700 ml-2 my-1 leading-relaxed"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-purple-500 mt-1.5 shrink-0" />
          <span>
            {contentStr.split("**").map((part, i) =>
              i % 2 === 1 ? (
                <strong key={i} className="text-slate-900 font-bold">
                  {part}
                </strong>
              ) : (
                part
              )
            )}
          </span>
        </div>
      );
    } else {
      elements.push(
        <p
          key={index}
          className="text-xs text-slate-700 leading-relaxed my-1"
        >
          {trimmed.split("**").map((part, i) =>
            i % 2 === 1 ? (
              <strong key={i} className="text-slate-900 font-bold">
                {part}
              </strong>
            ) : (
              part
            )
          )}
        </p>
      );
    }
  });

  return <>{elements}</>;
}
