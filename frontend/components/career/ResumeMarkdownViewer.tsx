import React from "react";

interface ResumeMarkdownViewerProps {
  content: string;
}

// Complete Unicode regex to strip all emojis & pictographs
function stripEmojis(text: string): string {
  if (!text) return "";
  return text
    .replace(/\p{Extended_Pictographic}/gu, "")
    .replace(/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}\u{1F600}-\u{1F64F}\u{1F680}-\u{1F6FF}]/gu, "")
    .replace(/^\s+/, "")
    .trim();
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
            className="my-4 overflow-x-auto rounded-xl border border-zinc-800 bg-[#181920] shadow-sm"
          >
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-[#141519] text-white border-b border-zinc-800 font-bold">
                  {header.map((h, i) => (
                    <th key={i} className="p-3">
                      {stripEmojis(h)}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800">
                {body.map((r, ri) => (
                  <tr
                    key={ri}
                    className="hover:bg-zinc-800/40 text-zinc-300 transition-colors"
                  >
                    {r.map((cell, ci) => (
                      <td key={ci} className="p-3 leading-relaxed">
                        {stripEmojis(cell)}
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

    const isBeforeBullet =
      trimmed.startsWith("- **Before:**") ||
      trimmed.startsWith("- **Original:**") ||
      trimmed.startsWith("**Original:**") ||
      trimmed.startsWith("Original:");

    const isAfterBullet =
      trimmed.startsWith("- **After:**") ||
      trimmed.startsWith("- **Improved:**") ||
      trimmed.startsWith("- **AI Rewritten:**") ||
      trimmed.startsWith("**AI Rewritten:**") ||
      trimmed.startsWith("AI Rewritten:");

    if (trimmed.startsWith("### ")) {
      const heading = stripEmojis(trimmed.replace("### ", "").replace(/\*\*/g, ""));
      elements.push(
        <h4
          key={index}
          className="text-sm font-bold text-white mt-5 mb-2 pb-1 border-b border-zinc-800/80"
        >
          {heading}
        </h4>
      );
    } else if (trimmed.startsWith("## ")) {
      const heading = stripEmojis(trimmed.replace("## ", "").replace(/\*\*/g, ""));
      elements.push(
        <h3
          key={index}
          className="text-base font-bold text-white mt-6 mb-3 pb-2 border-b border-zinc-800"
        >
          {heading}
        </h3>
      );
    } else if (
      trimmed.toLowerCase().includes("verdict: hire") ||
      trimmed.toLowerCase().includes("verdict: no hire") ||
      trimmed.toLowerCase().includes("verdict: borderline")
    ) {
      elements.push(
        <div
          key={index}
          className="p-3.5 rounded-xl border border-zinc-800 bg-[#181920] my-2 text-xs font-bold text-white flex items-center justify-between"
        >
          <span>{stripEmojis(trimmed.replace(/\*\*/g, ""))}</span>
        </div>
      );
    } else if (isBeforeBullet) {
      const rawText = trimmed
        .replace(/^- \*\*Before:\*\*/i, "")
        .replace(/^- \*\*Original:\*\*/i, "")
        .replace(/^\*\*Original:\*\*/i, "")
        .replace(/^Original:/i, "")
        .replace(/~~/g, "")
        .trim();
      elements.push(
        <div
          key={index}
          className="mt-3 p-3.5 rounded-t-xl bg-[#141519] border border-zinc-800 space-y-1"
        >
          <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider block">
            Original Bullet
          </span>
          <p className="text-xs text-zinc-400 font-mono leading-relaxed">
            {rawText}
          </p>
        </div>
      );
    } else if (isAfterBullet) {
      const rawText = trimmed
        .replace(/^- \*\*After:\*\*/i, "")
        .replace(/^- \*\*Improved:\*\*/i, "")
        .replace(/^- \*\*AI Rewritten:\*\*/i, "")
        .replace(/^\*\*AI Rewritten:\*\*/i, "")
        .replace(/^AI Rewritten:/i, "")
        .trim();
      elements.push(
        <div
          key={index}
          className="mb-3 p-3.5 rounded-b-xl bg-[#181920] border-x border-b border-zinc-750 space-y-1"
        >
          <span className="text-[10px] font-bold text-zinc-300 uppercase tracking-wider block">
            Improved Version (STAR / Metric-Driven)
          </span>
          <p className="text-xs text-white font-medium leading-relaxed">
            {rawText}
          </p>
        </div>
      );
    } else if (trimmed.startsWith("*") && trimmed.endsWith("*") && !trimmed.startsWith("**")) {
      elements.push(
        <p key={index} className="text-[11px] text-zinc-400 italic mb-2 px-1">
          {stripEmojis(trimmed.replace(/^\*|\*$/g, ""))}
        </p>
      );
    } else if (trimmed.startsWith("- ") || trimmed.startsWith("* ")) {
      const contentStr = stripEmojis(trimmed.substring(2));
      elements.push(
        <div
          key={index}
          className="flex items-start gap-2.5 text-xs text-zinc-300 ml-1 my-1.5 leading-relaxed min-w-0"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-zinc-500 mt-1.5 shrink-0" />
          <span className="break-words min-w-0">
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
      const contentStr = stripEmojis(trimmed);
      elements.push(
        <p
          key={index}
          className="text-xs text-zinc-300 leading-relaxed my-1.5 break-words"
        >
          {contentStr.split("**").map((part, i) =>
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
