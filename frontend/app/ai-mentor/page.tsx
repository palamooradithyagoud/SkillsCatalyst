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
    icon: "⚡",
    label: "System Architecture & Distributed Patterns",
    prompt:
      "How do high-scale production systems implement distributed idempotency and transactional outbox patterns?",
  },
  {
    icon: "🎯",
    label: "Senior Engineer (L5) Promotion & Career Roadmap",
    prompt:
      "What tangible technical scope, system ownership, and evidence distinguish a Mid-level engineer from a Senior (L5) candidate?",
  },
  {
    icon: "🧠",
    label: "Technical Interview & Dynamic Programming Mental Models",
    prompt:
      "What mental models make graph traversals and dynamic programming state transitions intuitive under interview pressure?",
  },
  {
    icon: "🎬",
    label: "SkillBits Insights: Microservices Migration Traps",
    prompt:
      "What are the most critical architectural pitfalls and data-consistency traps engineers face when breaking monoliths into microservices?",
  },
];

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
    <div className="space-y-3 leading-relaxed text-[13.5px]">
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

  const handleStartNewConversation = () => {
    setActiveConversationId(null);
    setMessages([]);
    setErrorMsg(null);
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
    <div className="flex h-screen w-screen bg-[#fafafa] dark:bg-[#0c0d10] text-neutral-900 dark:text-neutral-100 overflow-hidden font-sans select-text">
      {/* ── Left Sidebar: AI Catalyst ── */}
      <aside
        className={`border-r border-neutral-200/80 dark:border-neutral-800/80 bg-white dark:bg-[#101115] flex flex-col shrink-0 transition-all duration-300 ease-in-out relative z-20 overflow-x-hidden ${
          isSidebarOpen
            ? "w-64 md:w-68 opacity-100"
            : "w-0 opacity-0 -translate-x-full border-r-0 pointer-events-none overflow-hidden"
        }`}
      >
        {/* Header: Back Button + AI Catalyst Name in Solid PURPLE + Collapse Toggle */}
        <div className="h-16 px-4 border-b border-neutral-100 dark:border-neutral-850 flex items-center justify-between gap-2 min-w-[256px]">
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
        <div className="p-3.5 pb-2 min-w-[256px]">
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
        <div className="flex-1 overflow-y-auto px-3.5 py-3 space-y-4 min-w-[256px] text-xs">
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
                        onClick={() => setActiveConversationId(conv.id)}
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
                        onClick={() => setActiveConversationId(conv.id)}
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
        <div className="p-3 border-t border-neutral-100 dark:border-neutral-850 min-w-[256px]">
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
      <main className="flex-1 flex flex-col h-full min-w-0 bg-white dark:bg-[#0c0d10] relative">
        {/* Top Header when sidebar is closed */}
        {!isSidebarOpen && (
          <header className="h-14 px-4 flex items-center justify-between border-b border-neutral-100 dark:border-neutral-850 shrink-0">
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
        )}

        {/* Content Body: Empty State Hero (TOP-LEFT ALIGNED) OR Message History */}
        <div className="flex-1 overflow-y-auto px-6 md:px-12 lg:px-16 py-8 flex flex-col">
          {isLoadingHistory ? (
            <div className="flex items-center justify-center my-auto text-neutral-400 dark:text-neutral-500 text-xs gap-2">
              <RotateCw className="h-4 w-4 animate-spin text-purple-600" />
              Loading chat history...
            </div>
          ) : messages.length === 0 ? (
            /* TOP-LEFT ALIGNED GREETING + AUTHENTIC SKILLSCATALYST PROMPTS */
            <div className="w-full max-w-3xl flex flex-col items-start text-left pt-2 md:pt-6">
              {/* Luminous Glowing Orb at Top Left */}
              <div className="size-12 rounded-full overflow-hidden mb-5 bg-purple-500/10 ring-1 ring-purple-500/25 shadow-sm">
                <VoicePoweredOrb className="w-full h-full scale-125" enableVoiceControl={false} innerRadius={0.05} />
              </div>

              {/* Greeting Headline - Aligned to Top Left */}
              <p className="text-xl md:text-2xl text-neutral-500 dark:text-neutral-400 font-normal leading-tight text-left">
                Hi {displayName}
              </p>
              <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-neutral-950 dark:text-white mt-1.5 mb-7 leading-snug text-left">
                What can AI Catalyst help you with?
              </h1>

              {/* High-Value SkillsCatalyst Context Prompt Pills (Top-Left Stack) */}
              <div className="flex flex-col items-start gap-2.5 w-full">
                {PLATFORM_PROMPTS.map((item, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleSendMessage(item.prompt)}
                    className="flex items-center gap-3 px-4.5 py-2.5 rounded-full bg-neutral-100/90 hover:bg-purple-50 dark:bg-neutral-850 dark:hover:bg-purple-950/40 text-xs md:text-sm font-medium text-neutral-800 dark:text-neutral-200 hover:text-purple-700 dark:hover:text-purple-300 transition-all cursor-pointer border border-transparent hover:border-purple-300 dark:hover:border-purple-800 shadow-2xs hover:scale-[1.008] active:scale-[0.99] text-left"
                  >
                    <span className="text-base select-none">{item.icon}</span>
                    <span>{item.label}</span>
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
                    className={`flex gap-3.5 max-w-2xl ${
                      isUser ? "ml-auto justify-end" : "mr-auto justify-start"
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
                      className={`rounded-2xl px-4 py-3 leading-relaxed break-words ${
                        isUser
                          ? "bg-neutral-950 text-white dark:bg-white dark:text-neutral-950 font-normal shadow-2xs"
                          : "bg-white dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800 text-neutral-900 dark:text-neutral-100 shadow-2xs"
                      }`}
                    >
                      <MessageContent content={msg.content} />
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
