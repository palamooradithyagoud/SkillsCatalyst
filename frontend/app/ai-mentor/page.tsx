"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  PanelLeft,
  PanelLeftClose,
  Plus,
  ChevronDown,
  ChevronRight,
  MessageSquare,
  Trash2,
  Copy,
  Check,
  RotateCw,
  AlertCircle,
  ExternalLink,
} from "lucide-react";
import { useAuth } from "@/lib/auth";
import {
  MentorConversation,
  MentorMessage,
  fetchMentorConversations,
  fetchMentorConversationDetail,
  deleteMentorConversation,
  sendMentorMessage,
} from "@/lib/api/career";
import { VoicePoweredOrb } from "@/components/ui/voice-powered-orb";
import { PromptInput } from "@/components/ui/ai-chat-input";

// ----------------------------------------------------------------------
// Curated High-Value SkillsCatalyst Prompts (Authentic Platform Context)
// ----------------------------------------------------------------------
const PLATFORM_PROMPTS = [
  {
    icon: "✨",
    label: "Explore SkillsCatalyst",
    prompt:
      "Can you give me an overview of SkillsCatalyst? What roadmaps, SkillBits, practice tests, and career tools are available to help me grow?",
  },
  {
    icon: "🧭",
    label: "Know where you are",
    prompt:
      "Help me evaluate where I currently stand in my tech journey: assess my current skill set, strengths, and areas to improve.",
  },
  {
    icon: "🚀",
    label: "What to next",
    prompt:
      "Based on where I am right now, what concrete steps and topics should I focus on next to progress faster?",
  },
];

// ----------------------------------------------------------------------
// Markdown Block & Inline Formatters
// ----------------------------------------------------------------------
function renderInlineMarkdown(text: string): React.ReactNode {
  if (!text) return null;

  // Tokenize regex matching inline code, bold, italic, and links
  const regex = /(`[^`]+`|\*\*[^*]+\*\*|\*[^*]+\*|\[[^\]]+\]\([^)]+\))/g;
  const parts = text.split(regex);

  return parts.map((part, i) => {
    if (!part) return null;
    if (part.startsWith("`") && part.endsWith("`") && part.length >= 2) {
      return (
        <code
          key={i}
          className="px-1.5 py-0.5 mx-0.5 rounded-md bg-purple-100/70 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 font-mono text-[12px] border border-purple-200/50 dark:border-purple-800/40"
        >
          {part.slice(1, -1)}
        </code>
      );
    }
    if (part.startsWith("**") && part.endsWith("**") && part.length >= 4) {
      return (
        <strong key={i} className="font-semibold text-neutral-900 dark:text-neutral-100">
          {renderInlineMarkdown(part.slice(2, -2))}
        </strong>
      );
    }
    if (part.startsWith("*") && part.endsWith("*") && part.length >= 2) {
      return (
        <em key={i} className="italic text-neutral-800 dark:text-neutral-200">
          {part.slice(1, -1)}
        </em>
      );
    }
    const linkMatch = part.match(/^\[(.*?)\]\((.*?)\)$/);
    if (linkMatch) {
      return (
        <a
          key={i}
          href={linkMatch[2]}
          target="_blank"
          rel="noopener noreferrer"
          className="text-purple-600 dark:text-purple-400 hover:underline underline-offset-2 font-medium"
        >
          {linkMatch[1]}
        </a>
      );
    }
    return part;
  });
}

function renderMarkdownBlocks(content: string): React.ReactNode {
  const lines = content.split("\n");
  const nodes: React.ReactNode[] = [];
  let i = 0;

  const isUnordered = (str: string) => /^[*-]\s+/.test(str);
  const isOrdered = (str: string) => /^\d+\.\s+/.test(str);

  while (i < lines.length) {
    const rawLine = lines[i];
    const trimmed = rawLine.trim();

    // 1. Empty lines
    if (!trimmed) {
      nodes.push(<div key={`empty-${i}`} className="h-1.5" />);
      i++;
      continue;
    }

    // 2. Horizontal divider
    if (trimmed === "---" || trimmed === "***" || trimmed === "___") {
      nodes.push(
        <hr
          key={`hr-${i}`}
          className="my-3.5 border-t border-neutral-200 dark:border-neutral-800"
        />
      );
      i++;
      continue;
    }

    // 3. Headings
    if (trimmed.startsWith("# ")) {
      nodes.push(
        <h1
          key={`h1-${i}`}
          className="text-lg md:text-xl font-bold text-neutral-950 dark:text-white mt-4 mb-2"
        >
          {renderInlineMarkdown(trimmed.slice(2).trim())}
        </h1>
      );
      i++;
      continue;
    }
    if (trimmed.startsWith("## ")) {
      nodes.push(
        <h2
          key={`h2-${i}`}
          className="text-base md:text-lg font-bold text-neutral-950 dark:text-white mt-4.5 mb-2 pb-1.5 border-b border-neutral-200 dark:border-neutral-800"
        >
          {renderInlineMarkdown(trimmed.slice(3).trim())}
        </h2>
      );
      i++;
      continue;
    }
    if (trimmed.startsWith("### ")) {
      nodes.push(
        <h3
          key={`h3-${i}`}
          className="text-sm md:text-base font-semibold text-neutral-950 dark:text-white mt-3.5 mb-1.5"
        >
          {renderInlineMarkdown(trimmed.slice(4).trim())}
        </h3>
      );
      i++;
      continue;
    }
    if (trimmed.startsWith("#### ")) {
      nodes.push(
        <h4
          key={`h4-${i}`}
          className="text-xs md:text-sm font-semibold text-neutral-900 dark:text-neutral-100 mt-2.5 mb-1"
        >
          {renderInlineMarkdown(trimmed.slice(5).trim())}
        </h4>
      );
      i++;
      continue;
    }

    // 4. Tables (consecutive lines starting with '|')
    if (trimmed.startsWith("|")) {
      const tableLines: string[] = [];
      const tableStartIndex = i;
      while (i < lines.length && lines[i].trim().startsWith("|")) {
        tableLines.push(lines[i].trim());
        i++;
      }

      const rows = tableLines.map((tl) =>
        tl
          .split("|")
          .map((c) => c.trim())
          .filter((_, idx, arr) => idx > 0 && idx < arr.length - 1)
      );

      const isDelimiter = (row: string[]) =>
        row.length > 0 && row.every((cell) => /^:?-+:?$/.test(cell.replace(/\s+/g, "")));

      let headerRow: string[] | null = null;
      let bodyRows: string[][] = [];

      if (rows.length >= 2 && isDelimiter(rows[1])) {
        headerRow = rows[0];
        bodyRows = rows.slice(2);
      } else {
        bodyRows = rows;
      }

      nodes.push(
        <div
          key={`table-${tableStartIndex}`}
          className="my-3.5 overflow-x-auto rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-900/60 shadow-2xs"
        >
          <table className="w-full text-left text-xs border-collapse">
            {headerRow && (
              <thead>
                <tr className="bg-neutral-100/90 dark:bg-neutral-800/80 text-neutral-900 dark:text-neutral-100 border-b border-neutral-200 dark:border-neutral-800 font-semibold">
                  {headerRow.map((cell, ci) => (
                    <th key={ci} className="px-3.5 py-2.5 whitespace-nowrap">
                      {renderInlineMarkdown(cell)}
                    </th>
                  ))}
                </tr>
              </thead>
            )}
            <tbody className="divide-y divide-neutral-200/70 dark:divide-neutral-800/70">
              {bodyRows.map((row, ri) => (
                <tr
                  key={ri}
                  className="hover:bg-neutral-100/60 dark:hover:bg-neutral-800/40 transition-colors"
                >
                  {row.map((cell, ci) => (
                    <td
                      key={ci}
                      className="px-3.5 py-2.5 text-neutral-800 dark:text-neutral-200 align-top leading-relaxed"
                    >
                      {renderInlineMarkdown(cell)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
      continue;
    }

    // 5. Blockquotes (lines starting with '>')
    if (trimmed.startsWith(">")) {
      const quoteLines: string[] = [];
      const quoteStartIndex = i;
      while (i < lines.length && lines[i].trim().startsWith(">")) {
        quoteLines.push(lines[i].trim().replace(/^>\s?/, ""));
        i++;
      }
      nodes.push(
        <blockquote
          key={`quote-${quoteStartIndex}`}
          className="my-2.5 pl-3.5 border-l-2 border-purple-500 bg-purple-50/40 dark:bg-purple-950/20 py-2 rounded-r-lg text-neutral-700 dark:text-neutral-300 italic text-xs leading-relaxed"
        >
          {quoteLines.map((ql, qIdx) => (
            <p key={qIdx}>{renderInlineMarkdown(ql)}</p>
          ))}
        </blockquote>
      );
      continue;
    }

    // 6. Unordered Lists (lines starting with '- ' or '* ')
    if (isUnordered(trimmed)) {
      const listItems: string[] = [];
      const listStartIndex = i;
      while (i < lines.length && isUnordered(lines[i].trim())) {
        listItems.push(lines[i].trim().replace(/^[*-]\s+/, ""));
        i++;
      }
      nodes.push(
        <ul key={`ul-${listStartIndex}`} className="my-2 space-y-1.5 pl-0.5">
          {listItems.map((item, liIdx) => (
            <li
              key={liIdx}
              className="flex items-start gap-2 text-neutral-800 dark:text-neutral-200 text-xs md:text-[13px] leading-relaxed"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-purple-500 mt-2 shrink-0" />
              <span className="flex-1 min-w-0">{renderInlineMarkdown(item)}</span>
            </li>
          ))}
        </ul>
      );
      continue;
    }

    // 7. Ordered Lists (lines starting with '1. ', '2. ', etc.)
    if (isOrdered(trimmed)) {
      const listItems: string[] = [];
      const listStartIndex = i;
      while (i < lines.length && isOrdered(lines[i].trim())) {
        listItems.push(lines[i].trim().replace(/^\d+\.\s+/, ""));
        i++;
      }
      nodes.push(
        <ol key={`ol-${listStartIndex}`} className="my-2 space-y-1.5 pl-0.5">
          {listItems.map((item, liIdx) => (
            <li
              key={liIdx}
              className="flex items-start gap-2 text-neutral-800 dark:text-neutral-200 text-xs md:text-[13px] leading-relaxed"
            >
              <span className="text-[11px] font-semibold text-purple-600 dark:text-purple-400 mt-0.5 shrink-0 min-w-4 select-none">
                {liIdx + 1}.
              </span>
              <span className="flex-1 min-w-0">{renderInlineMarkdown(item)}</span>
            </li>
          ))}
        </ol>
      );
      continue;
    }

    // 8. Regular Paragraphs
    const pLines: string[] = [];
    const pStartIndex = i;
    while (
      i < lines.length &&
      lines[i].trim() &&
      !lines[i].trim().startsWith("#") &&
      !lines[i].trim().startsWith("|") &&
      !lines[i].trim().startsWith(">") &&
      !isUnordered(lines[i].trim()) &&
      !isOrdered(lines[i].trim()) &&
      lines[i].trim() !== "---" &&
      lines[i].trim() !== "***" &&
      lines[i].trim() !== "___"
    ) {
      pLines.push(lines[i].trim());
      i++;
    }

    if (pLines.length > 0) {
      nodes.push(
        <p
          key={`p-${pStartIndex}`}
          className="text-neutral-800 dark:text-neutral-200 leading-relaxed text-xs md:text-[13.5px] my-1.5"
        >
          {pLines.map((pl, pIdx) => (
            <React.Fragment key={pIdx}>
              {renderInlineMarkdown(pl)}
              {pIdx < pLines.length - 1 ? <br /> : null}
            </React.Fragment>
          ))}
        </p>
      );
    }
  }

  return <>{nodes}</>;
}

// ----------------------------------------------------------------------
// Markdown Code Block & Message Renderer
// ----------------------------------------------------------------------
function MessageContent({ content }: { content: string }) {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const handleCopy = (code: string, idx: number) => {
    navigator.clipboard.writeText(code);
    setCopiedIndex(idx);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const parts = content.split(/(```[\s\S]*?```)/g);

  return (
    <div className="space-y-2 leading-relaxed text-[13.5px]">
      {parts.map((part, index) => {
        if (part.startsWith("```") && part.endsWith("```")) {
          const lines = part.slice(3, -3).trim().split("\n");
          const firstLine = lines[0].trim();
          const hasLang = /^[a-zA-Z0-9_-]+$/.test(firstLine);
          const language = hasLang ? firstLine : "code";
          const codeBody = hasLang ? lines.slice(1).join("\n") : lines.join("\n");

          return (
            <div
              key={index}
              className="my-3 overflow-hidden rounded-xl border border-neutral-300 dark:border-neutral-800 bg-neutral-950 text-neutral-100 shadow-xs"
            >
              <div className="flex items-center justify-between px-3 py-1.5 border-b border-neutral-800 bg-neutral-900/90 text-[11px] text-neutral-400 font-mono">
                <span>{language}</span>
                <button
                  type="button"
                  onClick={() => handleCopy(codeBody, index)}
                  className="flex items-center gap-1 hover:text-white transition-colors cursor-pointer"
                  title="Copy code"
                >
                  {copiedIndex === index ? (
                    <>
                      <Check className="h-3 w-3 text-emerald-400" />
                      <span className="text-emerald-400">Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="h-3 w-3" />
                      <span>Copy</span>
                    </>
                  )}
                </button>
              </div>
              <pre className="p-3.5 overflow-x-auto text-xs font-mono text-neutral-200 leading-normal selection:bg-neutral-800">
                <code>{codeBody}</code>
              </pre>
            </div>
          );
        }

        return <div key={index}>{renderMarkdownBlocks(part)}</div>;
      })}
    </div>
  );
}

// ----------------------------------------------------------------------
// Main Fullpage AI Catalyst Page
// ----------------------------------------------------------------------
export default function AIMentorPage() {
  const { session } = useAuth();
  const userId = session?.user_id;
  const displayName = session?.name || session?.email?.split("@")[0] || "there";

  // Sidebar state
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [pinnedOpen, setPinnedOpen] = useState(true);
  const [todayOpen, setTodayOpen] = useState(true);
  const [previousOpen, setPreviousOpen] = useState(true);

  // Chat data states
  const [conversations, setConversations] = useState<MentorConversation[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [messages, setMessages] = useState<MentorMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  const loadConversations = useCallback(async () => {
    if (!userId) {
      setConversations([]);
      return;
    }
    try {
      const res = await fetchMentorConversations(40, 0);
      setConversations(res.conversations || []);
    } catch {
      // Graceful fallback
    }
  }, [userId]);

  useEffect(() => {
    loadConversations();
  }, [loadConversations]);

  // Load message detail when active conversation changes
  useEffect(() => {
    if (!activeConversationId || !userId) {
      setMessages([]);
      return;
    }

    let isMounted = true;
    setIsLoadingHistory(true);
    setErrorMsg(null);

    fetchMentorConversationDetail(activeConversationId)
      .then((data) => {
        if (isMounted && data) {
          setMessages(data.messages || []);
        }
      })
      .catch((err) => {
        if (isMounted) {
          setErrorMsg("Failed to load conversation history.");
          console.error(err);
        }
      })
      .finally(() => {
        if (isMounted) setIsLoadingHistory(false);
      });

    return () => {
      isMounted = false;
    };
  }, [activeConversationId, userId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  // Auto-detect mobile screen width on mount
  useEffect(() => {
    if (typeof window !== "undefined" && window.innerWidth < 768) {
      setIsSidebarOpen(false);
    }
  }, []);

  const handleStartNewConversation = () => {
    setActiveConversationId(null);
    setMessages([]);
    setErrorMsg(null);
    if (typeof window !== "undefined" && window.innerWidth < 768) {
      setIsSidebarOpen(false);
    }
  };

  const handleDeleteConversation = async (e: React.MouseEvent, convId: string) => {
    e.stopPropagation();
    if (!confirm("Are you sure you want to delete this chat session?")) return;

    const ok = await deleteMentorConversation(convId);
    if (ok) {
      setConversations((prev) => prev.filter((c) => c.id !== convId));
      if (activeConversationId === convId) {
        handleStartNewConversation();
      }
    }
  };

  const handleSendMessage = async (
    textToSend: string,
    meta?: { model?: string; effort?: string; attachments?: File[] }
  ) => {
    const text = textToSend.trim();
    if (!text || isLoading) return;

    setErrorMsg(null);
    setIsLoading(true);

    let formattedText = text;
    if (meta?.attachments && meta.attachments.length > 0) {
      const fileNames = meta.attachments.map((f) => f.name).join(", ");
      formattedText = `${text}\n\n[Attached: ${fileNames}]`;
    }

    const tempUserMsg: MentorMessage = {
      id: `temp-${Date.now()}`,
      conversation_id: activeConversationId || "temp",
      user_id: userId || "guest",
      role: "user",
      content: formattedText,
      created_at: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, tempUserMsg]);

    try {
      const res = await sendMentorMessage(text, activeConversationId || undefined);

      if (res.conversation_id && !activeConversationId) {
        setActiveConversationId(res.conversation_id);
        loadConversations();
      }

      const assistantMsg: MentorMessage = {
        id: res.message_id || `asst-${Date.now()}`,
        conversation_id: res.conversation_id || activeConversationId || "temp",
        user_id: userId || "guest",
        role: "assistant",
        content: res.reply,
        created_at: new Date().toISOString(),
      };

      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err: any) {
      setErrorMsg(err?.message || "Unable to reach AI Catalyst. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };


  const isToday = (dateStr: string) => {
    const d = new Date(dateStr);
    const today = new Date();
    return d.toDateString() === today.toDateString();
  };

  const todayConversations = conversations.filter((c) => isToday(c.updated_at || c.created_at));
  const previousConversations = conversations.filter((c) => !isToday(c.updated_at || c.created_at));

  return (
    <div className="flex h-screen w-screen bg-[#fafafa] dark:bg-[#0c0d10] text-neutral-900 dark:text-neutral-100 overflow-hidden font-sans select-text relative">
      {/* Mobile Backdrop Overlay when sidebar is open */}
      {isSidebarOpen && (
        <div
          onClick={() => setIsSidebarOpen(false)}
          className="fixed inset-0 bg-black/40 z-40 md:hidden transition-opacity duration-300"
          aria-hidden="true"
        />
      )}

      {/* ── Left Sidebar: AI Catalyst (Overlaps main page on mobile, in-flow on desktop) ── */}
      <aside
        className={`border-r border-neutral-200/80 dark:border-neutral-800/80 bg-white dark:bg-[#101115] flex flex-col shrink-0 transition-all duration-300 ease-in-out z-50 md:z-20 overflow-x-hidden ${
          isSidebarOpen
            ? "fixed md:relative inset-y-0 left-0 w-[280px] max-w-[80vw] md:w-64 md:max-w-none opacity-100 translate-x-0 shadow-2xl md:shadow-none"
            : "fixed md:relative inset-y-0 left-0 -translate-x-full md:w-0 md:translate-x-0 opacity-0 pointer-events-none border-r-0 overflow-hidden"
        }`}
      >
        {/* Header: Back Button + AI Catalyst Name in Solid PURPLE + Collapse Toggle */}
        <div className="h-14 sm:h-16 px-4 border-b border-neutral-100 dark:border-neutral-850 flex items-center justify-between gap-2 min-w-[240px]">
          <div className="flex items-center gap-2.5 min-w-0">
            {/* Back to Dashboard */}
            <Link
              href="/dashboard"
              className="p-1.5 rounded-lg text-neutral-500 hover:text-purple-600 dark:hover:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-950/30 transition-colors"
              title="Back to Dashboard"
              aria-label="Back to Dashboard"
            >
              <ArrowLeft className="h-4 w-4" />
            </Link>

            {/* AI Catalyst Branding with Orb in PURPLE */}
            <div className="flex items-center gap-2 min-w-0">
              <div className="size-6 rounded-full overflow-hidden shrink-0 bg-purple-500/10 ring-1 ring-purple-500/30 flex items-center justify-center">
                <VoicePoweredOrb className="w-full h-full scale-125" enableVoiceControl={false} innerRadius={0.05} />
              </div>
              <span className="font-bold text-[17px] tracking-tight text-purple-600 dark:text-purple-400 select-none">
                AI Catalyst
              </span>
            </div>
          </div>

          {/* Close Sidebar */}
          <button
            type="button"
            onClick={() => setIsSidebarOpen(false)}
            className="p-1.5 rounded-lg text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
            title="Collapse sidebar"
            aria-label="Collapse sidebar"
          >
            <PanelLeftClose className="h-4 w-4" />
          </button>
        </div>

        {/* Start New Chat Action Button */}
        <div className="p-3.5 pb-2 min-w-[240px]">
          <button
            type="button"
            onClick={handleStartNewConversation}
            className="w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl bg-purple-50 dark:bg-purple-950/40 hover:bg-purple-100 dark:hover:bg-purple-900/50 text-xs font-semibold text-purple-700 dark:text-purple-300 transition-colors cursor-pointer shadow-2xs group border border-purple-200/50 dark:border-purple-800/40"
          >
            <Plus className="h-4 w-4 text-purple-600 dark:text-purple-400 group-hover:rotate-90 transition-transform duration-200" />
            <span>Start new chat</span>
          </button>
        </div>

        {/* Chat History Accordion Sections */}
        <div className="flex-1 overflow-y-auto px-3.5 py-3 space-y-4 min-w-[240px] text-xs">
          {/* Section: PINNED */}
          <div>
            <button
              type="button"
              onClick={() => setPinnedOpen(!pinnedOpen)}
              className="w-full flex items-center justify-between text-[10px] font-bold text-neutral-400 dark:text-neutral-500 tracking-wider uppercase mb-1.5 px-1 hover:text-neutral-600 dark:hover:text-neutral-300 transition-colors"
            >
              <span>Pinned</span>
              {pinnedOpen ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
            </button>
            {pinnedOpen && (
              <p className="px-2 py-1 text-[11px] text-neutral-400 dark:text-neutral-500 font-normal">
                No pinned chats
              </p>
            )}
          </div>

          {/* Section: TODAY */}
          <div>
            <button
              type="button"
              onClick={() => setTodayOpen(!todayOpen)}
              className="w-full flex items-center justify-between text-[10px] font-bold text-neutral-400 dark:text-neutral-500 tracking-wider uppercase mb-1.5 px-1 hover:text-neutral-600 dark:hover:text-neutral-300 transition-colors"
            >
              <span>Today</span>
              {todayOpen ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
            </button>
            {todayOpen && (
              <div className="space-y-0.5">
                {todayConversations.length === 0 ? (
                  <p className="px-2 py-1 text-[11px] text-neutral-400 dark:text-neutral-500 font-normal">
                    No sessions today
                  </p>
                ) : (
                  todayConversations.map((conv) => {
                    const isActive = conv.id === activeConversationId;
                    return (
                      <div
                        key={conv.id}
                        onClick={() => {
                          setActiveConversationId(conv.id);
                          if (typeof window !== "undefined" && window.innerWidth < 768) {
                            setIsSidebarOpen(false);
                          }
                        }}
                        className={`group flex items-center justify-between px-2.5 py-1.5 rounded-lg cursor-pointer transition-colors text-xs ${
                          isActive
                            ? "bg-purple-600 text-white font-medium shadow-xs"
                            : "text-neutral-600 dark:text-neutral-400 hover:bg-purple-50 dark:hover:bg-purple-950/30 hover:text-purple-600 dark:hover:text-purple-300"
                        }`}
                      >
                        <div className="flex items-center gap-2 overflow-hidden pr-2">
                          <MessageSquare className="h-3 w-3 shrink-0 opacity-70" />
                          <span className="truncate">{conv.title || "Career mentorship..."}</span>
                        </div>
                        <button
                          type="button"
                          onClick={(e) => handleDeleteConversation(e, conv.id)}
                          className="opacity-0 group-hover:opacity-100 p-0.5 hover:text-red-400 transition-opacity shrink-0 cursor-pointer"
                          title="Delete session"
                        >
                          <Trash2 className="h-3 w-3" />
                        </button>
                      </div>
                    );
                  })
                )}
              </div>
            )}
          </div>

          {/* Section: PREVIOUS */}
          <div>
            <button
              type="button"
              onClick={() => setPreviousOpen(!previousOpen)}
              className="w-full flex items-center justify-between text-[10px] font-bold text-neutral-400 dark:text-neutral-500 tracking-wider uppercase mb-1.5 px-1 hover:text-neutral-600 dark:hover:text-neutral-300 transition-colors"
            >
              <span>Previous</span>
              {previousOpen ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
            </button>
            {previousOpen && (
              <div className="space-y-0.5">
                {previousConversations.length === 0 ? (
                  <p className="px-2 py-1 text-[11px] text-neutral-400 dark:text-neutral-500 font-normal">
                    No older sessions
                  </p>
                ) : (
                  previousConversations.map((conv) => {
                    const isActive = conv.id === activeConversationId;
                    return (
                      <div
                        key={conv.id}
                        onClick={() => {
                          setActiveConversationId(conv.id);
                          if (typeof window !== "undefined" && window.innerWidth < 768) {
                            setIsSidebarOpen(false);
                          }
                        }}
                        className={`group flex items-center justify-between px-2.5 py-1.5 rounded-lg cursor-pointer transition-colors text-xs ${
                          isActive
                            ? "bg-purple-600 text-white font-medium shadow-xs"
                            : "text-neutral-600 dark:text-neutral-400 hover:bg-purple-50 dark:hover:bg-purple-950/30 hover:text-purple-600 dark:hover:text-purple-300"
                        }`}
                      >
                        <div className="flex items-center gap-2 overflow-hidden pr-2">
                          <MessageSquare className="h-3 w-3 shrink-0 opacity-70" />
                          <span className="truncate">{conv.title || "Technical guidance..."}</span>
                        </div>
                        <button
                          type="button"
                          onClick={(e) => handleDeleteConversation(e, conv.id)}
                          className="opacity-0 group-hover:opacity-100 p-0.5 hover:text-red-400 transition-opacity shrink-0 cursor-pointer"
                          title="Delete session"
                        >
                          <Trash2 className="h-3 w-3" />
                        </button>
                      </div>
                    );
                  })
                )}
              </div>
            )}
          </div>
        </div>

        {/* Sidebar Footer */}
        <div className="p-3 border-t border-neutral-100 dark:border-neutral-850 min-w-[240px]">
          {userId ? (
            <div className="flex items-center justify-between text-xs text-neutral-600 dark:text-neutral-400">
              <span className="truncate font-medium">{session?.email}</span>
            </div>
          ) : (
            <Link
              href="/login"
              className="text-xs text-neutral-700 dark:text-neutral-300 hover:text-purple-600 dark:hover:text-purple-400 flex items-center justify-between"
            >
              <span>Sign in to save chats</span>
              <ExternalLink className="h-3 w-3" />
            </Link>
          )}
        </div>
      </aside>

      {/* ── Main Chat Area ── */}
      <main className="flex-1 flex flex-col h-full min-w-0 bg-white dark:bg-[#0c0d10] relative w-full">
        {/* Top Header */}
        <header
          className={`h-14 px-4 flex items-center justify-between border-b border-neutral-100 dark:border-neutral-850 shrink-0 ${
            isSidebarOpen ? "hidden md:hidden" : "flex"
          }`}
        >
          <div className="flex items-center gap-2.5">
            <Link
              href="/dashboard"
              className="p-1.5 rounded-lg text-neutral-500 hover:text-purple-600 dark:hover:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-950/30 transition-colors"
              title="Back to Dashboard"
            >
              <ArrowLeft className="h-4 w-4" />
            </Link>
            <button
              type="button"
              onClick={() => setIsSidebarOpen(true)}
              className="p-1.5 rounded-lg text-neutral-500 hover:text-purple-600 dark:hover:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-950/30 transition-colors cursor-pointer mr-1"
              title="Open sidebar"
            >
              <PanelLeft className="h-4 w-4" />
            </button>
            <span className="font-bold text-base tracking-tight text-purple-600 dark:text-purple-400 select-none">
              AI Catalyst
            </span>
          </div>
          {activeConversationId && (
            <button
              type="button"
              onClick={handleStartNewConversation}
              className="text-xs font-medium px-3 py-1.5 rounded-lg border border-purple-200 dark:border-purple-800 text-purple-700 dark:text-purple-300 hover:bg-purple-50 dark:hover:bg-purple-950/30 transition-colors"
            >
              New Chat
            </button>
          )}
        </header>

        {/* Content Body: Empty State Hero (TOP-LEFT ALIGNED) OR Message History */}
        <div className="flex-1 overflow-y-auto px-4 sm:px-6 md:px-12 lg:px-16 py-4 md:py-8 flex flex-col">
          {isLoadingHistory ? (
            <div className="flex items-center justify-center my-auto text-neutral-400 dark:text-neutral-500 text-xs gap-2">
              <RotateCw className="h-4 w-4 animate-spin text-purple-600" />
              Loading chat history...
            </div>
          ) : messages.length === 0 ? (
            /* TOP-LEFT ALIGNED GREETING + AUTHENTIC SKILLSCATALYST PROMPTS */
            <div className="w-full max-w-3xl flex flex-col items-start text-left pt-1 md:pt-4">
              {/* Luminous Glowing Orb at Top Left */}
              <div className="size-9 rounded-full overflow-hidden mb-3 bg-purple-500/10 ring-1 ring-purple-500/25 shadow-xs">
                <VoicePoweredOrb className="w-full h-full scale-125" enableVoiceControl={false} innerRadius={0.05} />
              </div>

              {/* Greeting Headline - Aligned to Top Left */}
              <p className="text-xs sm:text-sm text-neutral-500 dark:text-neutral-400 font-normal leading-tight text-left">
                Hi {displayName}
              </p>
              <h1 className="text-lg sm:text-xl font-bold tracking-tight text-neutral-950 dark:text-white mt-1 mb-4 leading-snug text-left">
                What can AI Catalyst help you with?
              </h1>

              {/* High-Value SkillsCatalyst Context Prompt Pills (Top-Left Stack) */}
              <div className="flex flex-col items-start gap-2 w-full">
                {PLATFORM_PROMPTS.map((item, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleSendMessage(item.prompt)}
                    className="flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-neutral-100/90 hover:bg-purple-50 dark:bg-neutral-850 dark:hover:bg-purple-950/40 text-xs font-medium text-neutral-800 dark:text-neutral-200 hover:text-purple-700 dark:hover:text-purple-300 transition-all cursor-pointer border border-transparent hover:border-purple-300 dark:hover:border-purple-800 shadow-2xs hover:scale-[1.008] active:scale-[0.99] text-left max-w-full"
                  >
                    <span className="text-sm select-none shrink-0">{item.icon}</span>
                    <span className="truncate">{item.label}</span>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            /* Render Active Message History */
            <div className="max-w-3xl w-full mx-auto space-y-6 pb-4">
              {messages.map((msg) => {
                const isUser = msg.role === "user";
                return (
                  <div
                    key={msg.id}
                    className={`flex gap-3.5 ${
                      isUser ? "max-w-xl ml-auto justify-end" : "w-full max-w-3xl mr-auto justify-start"
                    }`}
                  >
                    {/* Assistant Avatar in Purple Ring */}
                    {!isUser && (
                      <div className="size-7 rounded-full overflow-hidden shrink-0 mt-0.5 relative flex items-center justify-center bg-purple-500/15 ring-1 ring-purple-500/30 shadow-xs">
                        <VoicePoweredOrb className="w-full h-full scale-125" enableVoiceControl={false} innerRadius={0.05} />
                      </div>
                    )}

                    {/* Bubble */}
                    <div
                      className={`px-4.5 py-3 leading-relaxed break-words shadow-2xs ${
                        isUser
                          ? "rounded-2xl rounded-tr-none bg-neutral-950 text-white dark:bg-white dark:text-neutral-950 font-normal"
                          : "flex-1 min-w-0 rounded-2xl rounded-tl-none bg-white dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800 text-neutral-900 dark:text-neutral-100"
                      }`}
                    >
                      {isUser ? (
                        <div className="whitespace-pre-wrap break-words text-white dark:text-neutral-950 text-[13.5px] leading-relaxed">
                          {msg.content}
                        </div>
                      ) : (
                        <MessageContent content={msg.content} />
                      )}
                    </div>

                    {/* User Avatar */}
                    {isUser && (
                      <div className="size-7 rounded-full bg-purple-600 text-white flex items-center justify-center shrink-0 mt-0.5 text-xs font-semibold shadow-xs">
                        {displayName.slice(0, 1).toUpperCase()}
                      </div>
                    )}
                  </div>
                );
              })}

              {/* Thinking State */}
              {isLoading && (
                <div className="flex gap-3 mr-auto justify-start">
                  <div className="size-7 rounded-full overflow-hidden shrink-0 mt-0.5 relative flex items-center justify-center bg-purple-500/15 ring-1 ring-purple-500/30 shadow-xs">
                    <VoicePoweredOrb className="w-full h-full scale-125" enableVoiceControl={false} innerRadius={0.05} />
                  </div>
                  <div className="rounded-2xl px-4 py-3 text-xs bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-neutral-500 dark:text-neutral-400 flex items-center gap-2 shadow-xs">
                    <span className="h-1.5 w-1.5 rounded-full bg-purple-500 animate-bounce" />
                    <span className="h-1.5 w-1.5 rounded-full bg-purple-500 animate-bounce [animation-delay:0.18s]" />
                    <span className="h-1.5 w-1.5 rounded-full bg-purple-500 animate-bounce [animation-delay:0.36s]" />
                    <span className="text-[11px] text-neutral-500 dark:text-neutral-400 ml-1">
                      Thinking...
                    </span>
                  </div>
                </div>
              )}

              {/* Error Message */}
              {errorMsg && (
                <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/50 text-red-700 dark:text-red-300 text-xs flex items-center gap-2.5">
                  <AlertCircle className="h-4 w-4 shrink-0 text-red-500" />
                  <span className="flex-1">{errorMsg}</span>
                  <button
                    type="button"
                    onClick={() => {
                      const lastUser = [...messages].reverse().find((m) => m.role === "user");
                      if (lastUser) handleSendMessage(lastUser.content);
                    }}
                    className="underline font-semibold cursor-pointer"
                  >
                    Retry
                  </button>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* ── Bottom Dedicated Prompt Input Bar (Smooth Morphing PromptInput) ── */}
        <div className="p-4 md:p-6 pb-6 w-full flex flex-col items-center shrink-0">
          <PromptInput
            placeholder="Ask AI Catalyst..."
            onSubmit={(value, meta) => handleSendMessage(value, meta)}
            maxWidthCollapsed={480}
            maxWidthExpanded={840}
            className="w-full"
          />
          <p className="text-[11px] text-neutral-400 dark:text-neutral-500 text-center mt-2.5 select-none">
            AI Catalyst can assist with system design, career roadmaps, code architecture, and interview preparation.
          </p>
        </div>
      </main>
    </div>
  );
}
