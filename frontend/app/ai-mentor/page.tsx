"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import {
  MessageSquare,
  Plus,
  Trash2,
  Terminal,
  User,
  AlertCircle,
  ArrowRight,
  Code2,
  Briefcase,
  Layers,
  Copy,
  Check,
  RotateCw,
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
import { PromptInput } from "@/components/ui/ai-chat-input";

// ----------------------------------------------------------------------
// Curated Starter Prompts (Concrete, high-value technical topics)
// ----------------------------------------------------------------------
const STARTER_PROMPTS = [
  {
    icon: Layers,
    title: "System Architecture",
    prompt:
      "How do high-scale payment platforms implement distributed idempotency and transactional outbox patterns?",
  },
  {
    icon: Code2,
    title: "Algorithms & Patterns",
    prompt:
      "What mental models make graph traversals and dynamic programming state transitions intuitive under interview pressure?",
  },
  {
    icon: Terminal,
    title: "Production Engineering",
    prompt:
      "What are the most critical architectural traps engineers face when breaking monoliths into microservices?",
  },
  {
    icon: Briefcase,
    title: "Career Advancement",
    prompt:
      "What tangible technical scope and cross-functional evidence distinguish an L4 engineer from a Senior (L5) candidate?",
  },
];

// ----------------------------------------------------------------------
// Lightweight Markdown / Code Formatter (No external library dependency)
// ----------------------------------------------------------------------
function MessageContent({ content }: { content: string }) {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const handleCopy = (code: string, idx: number) => {
    navigator.clipboard.writeText(code);
    setCopiedIndex(idx);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  // Split by markdown fenced code blocks: ```lang ... ```
  const parts = content.split(/(```[\s\S]*?```)/g);

  return (
    <div className="space-y-3 leading-relaxed text-[13px]">
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
                      <Check className="h-3 w-3 text-neutral-300" />
                      <span>Copied</span>
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

        // Standard text paragraph formatting
        return (
          <div key={index} className="whitespace-pre-wrap break-words">
            {part}
          </div>
        );
      })}
    </div>
  );
}

// ----------------------------------------------------------------------
// Main AI Mentor Page
// ----------------------------------------------------------------------
export default function AIMentorPage() {
  const { session } = useAuth();
  const userId = session?.user_id;

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

  // Load user conversations on mount or session change
  const loadConversations = useCallback(async () => {
    if (!userId) {
      setConversations([]);
      return;
    }
    try {
      const res = await fetchMentorConversations(30, 0);
      setConversations(res.conversations || []);
    } catch {
      // Graceful fallback
    }
  }, [userId]);

  useEffect(() => {
    loadConversations();
  }, [loadConversations]);

  // Load messages when active conversation changes
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

  const handleStartNewConversation = () => {
    setActiveConversationId(null);
    setMessages([]);
    setErrorMsg(null);
  };

  const handleDeleteConversation = async (e: React.MouseEvent, convId: string) => {
    e.stopPropagation();
    if (!confirm("Are you sure you want to delete this session?")) return;

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

    // If attachments were added, summarize in prompt context
    let formattedText = text;
    if (meta?.attachments && meta.attachments.length > 0) {
      const fileNames = meta.attachments.map((f) => f.name).join(", ");
      formattedText = `${text}\n\n[Attached: ${fileNames}]`;
    }

    // Optimistic user message in UI
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
      const res = await sendMentorMessage(formattedText, activeConversationId || undefined);

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
      setErrorMsg(err?.message || "Unable to reach mentor server. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const activeConversation = conversations.find((c) => c.id === activeConversationId);

  return (
    <div className="flex h-[calc(100vh-4rem)] bg-white dark:bg-[#0a0a0c] text-neutral-900 dark:text-neutral-100 overflow-hidden transition-colors">
      {/* ── Left Sidebar: Conversations ── */}
      <aside className="w-72 lg:w-80 border-r border-neutral-200 dark:border-neutral-800/80 bg-neutral-50/70 dark:bg-[#0d0d10] flex flex-col shrink-0 transition-colors">
        {/* Sidebar Header */}
        <div className="p-4 border-b border-neutral-200 dark:border-neutral-800/80 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="size-8 rounded-lg bg-neutral-900 text-white dark:bg-white dark:text-neutral-950 flex items-center justify-center font-bold text-xs select-none shadow-xs">
              <Terminal className="h-4 w-4" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-neutral-950 dark:text-white leading-none">
                AI Mentor
              </h2>
              <span className="text-[11px] text-neutral-500 dark:text-neutral-400">
                Technical Guidance
              </span>
            </div>
          </div>
          <button
            onClick={handleStartNewConversation}
            className="p-1.5 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 text-neutral-700 dark:text-neutral-300 hover:text-neutral-950 dark:hover:text-white hover:border-neutral-400 dark:hover:border-neutral-600 transition-colors shadow-xs cursor-pointer"
            title="Start new conversation"
          >
            <Plus className="h-4 w-4" />
          </button>
        </div>

        {/* Conversation List */}
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {conversations.length === 0 ? (
            <div className="p-6 text-center text-xs text-neutral-400 dark:text-neutral-500">
              {userId ? "No conversation history yet." : "Sign in to access saved conversations."}
            </div>
          ) : (
            conversations.map((conv) => {
              const isActive = conv.id === activeConversationId;
              return (
                <div
                  key={conv.id}
                  onClick={() => setActiveConversationId(conv.id)}
                  className={`group relative flex items-center justify-between p-2.5 rounded-lg text-xs cursor-pointer transition-colors ${
                    isActive
                      ? "bg-neutral-900 text-white dark:bg-white dark:text-neutral-950 font-medium shadow-xs"
                      : "text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200/60 dark:hover:bg-neutral-800/60 hover:text-neutral-950 dark:hover:text-neutral-100"
                  }`}
                >
                  <div className="flex items-center gap-2.5 overflow-hidden pr-6">
                    <MessageSquare className="h-3.5 w-3.5 shrink-0 opacity-70" />
                    <span className="truncate">{conv.title || "Untitled Session"}</span>
                  </div>
                  <button
                    onClick={(e) => handleDeleteConversation(e, conv.id)}
                    className="opacity-0 group-hover:opacity-100 hover:text-red-500 dark:hover:text-red-400 p-1 rounded-sm transition-opacity shrink-0"
                    title="Delete session"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              );
            })
          )}
        </div>

        {/* Guest Footer */}
        {!userId && (
          <div className="p-3.5 border-t border-neutral-200 dark:border-neutral-800/80 bg-white/70 dark:bg-neutral-950/60 text-xs text-neutral-500 dark:text-neutral-400">
            <p className="mb-2">Sign in to save your conversation history across devices.</p>
            <Link
              href="/login"
              className="inline-flex items-center gap-1.5 text-xs text-neutral-950 dark:text-white font-medium hover:underline underline-offset-4"
            >
              Sign in <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
        )}
      </aside>

      {/* ── Main Chat Area ── */}
      <main className="flex-1 flex flex-col bg-white dark:bg-[#0a0a0c] min-w-0 transition-colors">
        {/* Chat Header */}
        <header className="h-14 border-b border-neutral-200 dark:border-neutral-800/80 px-6 flex items-center justify-between shrink-0 bg-white/80 dark:bg-[#0a0a0c]/80 backdrop-blur-md">
          <div className="flex items-center gap-3 min-w-0">
            <h1 className="text-sm font-semibold text-neutral-900 dark:text-white truncate max-w-md">
              {activeConversation?.title || "New Session"}
            </h1>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-medium border border-neutral-200 dark:border-neutral-800 bg-neutral-100 dark:bg-neutral-900 text-neutral-600 dark:text-neutral-400 select-none">
              <span className="h-1.5 w-1.5 rounded-full bg-neutral-500 dark:bg-neutral-400" />
              Live
            </span>
          </div>

          {activeConversationId && (
            <button
              onClick={handleStartNewConversation}
              className="text-xs font-medium text-neutral-700 dark:text-neutral-300 hover:text-neutral-950 dark:hover:text-white flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 hover:border-neutral-400 dark:hover:border-neutral-600 transition-colors shadow-xs cursor-pointer"
            >
              <Plus className="h-3.5 w-3.5" /> New Session
            </button>
          )}
        </header>

        {/* Message Thread */}
        <div className="flex-1 overflow-y-auto px-4 md:px-8 py-6 space-y-6">
          {isLoadingHistory ? (
            <div className="flex items-center justify-center h-48 text-neutral-400 dark:text-neutral-500 text-xs gap-2">
              <RotateCw className="h-4 w-4 animate-spin text-neutral-500" />
              Loading session history...
            </div>
          ) : messages.length === 0 ? (
            /* Starter Prompts Empty State (Strictly Clean & Human Copy) */
            <div className="max-w-2xl mx-auto py-10">
              <div className="text-center mb-8">
                <div className="size-11 rounded-xl bg-neutral-950 text-white dark:bg-white dark:text-neutral-950 flex items-center justify-center mx-auto mb-3 shadow-xs">
                  <Terminal className="h-5 w-5" />
                </div>
                <h3 className="text-xl font-semibold tracking-tight text-neutral-950 dark:text-white mb-1.5">
                  Technical & Career Mentorship
                </h3>
                <p className="text-xs text-neutral-500 dark:text-neutral-400 max-w-md mx-auto leading-relaxed">
                  Direct guidance on system design, data structures, code architecture, and hiring expectations.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {STARTER_PROMPTS.map((item, idx) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={idx}
                      onClick={() => handleSendMessage(item.prompt)}
                      className="p-4 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900/50 hover:border-neutral-900 dark:hover:border-neutral-400 hover:shadow-xs transition-all text-left group cursor-pointer"
                    >
                      <div className="flex items-center gap-2 mb-1.5 text-neutral-900 dark:text-neutral-100">
                        <Icon className="h-4 w-4 text-neutral-600 dark:text-neutral-400 group-hover:text-neutral-950 dark:group-hover:text-white transition-colors" />
                        <span className="text-xs font-semibold">{item.title}</span>
                      </div>
                      <p className="text-[11px] text-neutral-500 dark:text-neutral-400 leading-relaxed line-clamp-2">
                        {item.prompt}
                      </p>
                    </button>
                  );
                })}
              </div>
            </div>
          ) : (
            /* Render Message History */
            messages.map((msg) => {
              const isUser = msg.role === "user";
              return (
                <div
                  key={msg.id}
                  className={`flex gap-3 max-w-3xl ${
                    isUser ? "ml-auto justify-end" : "mr-auto justify-start"
                  }`}
                >
                  {/* Assistant Avatar */}
                  {!isUser && (
                    <div className="size-7 rounded-lg bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 flex items-center justify-center shrink-0 text-neutral-900 dark:text-neutral-100 mt-0.5 shadow-xs">
                      <Terminal className="h-3.5 w-3.5" />
                    </div>
                  )}

                  {/* Message Bubble: Monochrome Black/White */}
                  <div
                    className={`rounded-2xl px-4.5 py-3 text-[13px] leading-relaxed max-w-2xl break-words ${
                      isUser
                        ? "bg-neutral-950 text-white rounded-tr-xs shadow-xs dark:bg-white dark:text-neutral-950 font-normal"
                        : "bg-white border border-neutral-200 dark:bg-neutral-900/80 dark:border-neutral-800 text-neutral-900 dark:text-neutral-100 rounded-tl-xs shadow-xs"
                    }`}
                  >
                    <MessageContent content={msg.content} />
                  </div>

                  {/* User Avatar */}
                  {isUser && (
                    <div className="size-7 rounded-lg bg-neutral-200 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 flex items-center justify-center shrink-0 mt-0.5">
                      <User className="h-3.5 w-3.5" />
                    </div>
                  )}
                </div>
              );
            })
          )}

          {/* Thinking / Streaming Indicator */}
          {isLoading && (
            <div className="flex gap-3 max-w-3xl mr-auto justify-start">
              <div className="size-7 rounded-lg bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 flex items-center justify-center shrink-0 text-neutral-900 dark:text-neutral-100 mt-0.5 shadow-xs">
                <Terminal className="h-3.5 w-3.5" />
              </div>
              <div className="rounded-2xl px-4 py-3 text-xs bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-neutral-500 dark:text-neutral-400 flex items-center gap-2.5 shadow-xs">
                <span className="h-1.5 w-1.5 rounded-full bg-neutral-500 dark:bg-neutral-400 animate-bounce" />
                <span className="h-1.5 w-1.5 rounded-full bg-neutral-500 dark:bg-neutral-400 animate-bounce [animation-delay:0.18s]" />
                <span className="h-1.5 w-1.5 rounded-full bg-neutral-500 dark:bg-neutral-400 animate-bounce [animation-delay:0.36s]" />
                <span className="text-[11px] text-neutral-500 dark:text-neutral-400 ml-1">
                  Thinking...
                </span>
              </div>
            </div>
          )}

          {/* Error Banner */}
          {errorMsg && (
            <div className="max-w-md mx-auto p-3 rounded-xl bg-neutral-100 dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 text-neutral-800 dark:text-neutral-200 text-xs flex items-center gap-2.5 shadow-xs">
              <AlertCircle className="h-4 w-4 shrink-0 text-neutral-600 dark:text-neutral-400" />
              <span className="flex-1">{errorMsg}</span>
              <button
                onClick={() => {
                  const lastUserMsg = [...messages].reverse().find((m) => m.role === "user");
                  if (lastUserMsg) handleSendMessage(lastUserMsg.content);
                }}
                className="text-xs font-semibold underline hover:text-black dark:hover:text-white cursor-pointer"
              >
                Retry
              </button>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* ── Bottom Prompt Input Section ── */}
        <div className="p-4 md:p-6 border-t border-neutral-200 dark:border-neutral-800/80 bg-white dark:bg-[#0a0a0c] shrink-0 transition-colors">
          <div className="w-full max-w-3xl mx-auto flex flex-col items-center">
            <PromptInput
              placeholder="Ask anything about system design, code, or interview preparation..."
              onSubmit={(value, meta) => handleSendMessage(value, meta)}
              maxWidthCollapsed={420}
              maxWidthExpanded="100%"
            />
            <p className="text-[11px] text-neutral-400 dark:text-neutral-500 text-center mt-2 select-none">
              Enter to send · Shift + Enter for new line
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
