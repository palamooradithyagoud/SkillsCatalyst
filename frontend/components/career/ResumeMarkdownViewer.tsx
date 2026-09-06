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
            className="my-4 overflow-x-auto rounded-xl border border-slate-800 bg-[#091124]"
          >
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-indigo-950/40 text-indigo-300 border-b border-slate-800 font-semibold">
                  {header.map((h, i) => (
                    <th key={i} className="p-3">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {body.map((r, ri) => (
                  <tr
                    key={ri}
                    className="hover:bg-slate-900/50 text-slate-300"
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
          className="text-base font-bold text-indigo-300 mt-5 mb-2 flex items-center gap-2"
        >
          <ChevronRight className="w-4 h-4 text-indigo-400" />
          {trimmed.replace("### ", "").replace(/\*\*/g, "")}
        </h4>
      );
    } else if (trimmed.startsWith("## ")) {
      elements.push(
        <h3
          key={index}
          className="text-lg font-extrabold text-white mt-6 mb-3 pb-2 border-b border-slate-800 flex items-center gap-2"
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
              ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
              : isNoHire
              ? "bg-rose-500/10 border-rose-500/30 text-rose-400"
              : "bg-amber-500/10 border-amber-500/30 text-amber-400"
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
          className="mt-3 p-3 rounded-t-xl bg-slate-900/80 border border-slate-800 text-xs text-rose-300 line-through"
        >
          {trimmed.replace("- **Before:**", "Original:").replace(/\*\*/g, "")}
        </div>
      );
    } else if (trimmed.startsWith("- **After:**")) {
      elements.push(
        <div
          key={index}
          className="mb-3 p-3 rounded-b-xl bg-emerald-950/40 border-x border-b border-emerald-500/30 text-xs text-emerald-300 font-medium flex items-start gap-2"
        >
          <Sparkles className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
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
          className="flex items-start gap-2 text-xs text-slate-300 ml-2 my-1 leading-relaxed"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 mt-1.5 shrink-0" />
          <span>
            {contentStr.split("**").map((part, i) =>
              i % 2 === 1 ? (
                <strong key={i} className="text-white font-semibold">
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
          className="text-xs text-slate-300 leading-relaxed my-1"
        >
          {trimmed.split("**").map((part, i) =>
            i % 2 === 1 ? (
              <strong key={i} className="text-white font-semibold">
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
