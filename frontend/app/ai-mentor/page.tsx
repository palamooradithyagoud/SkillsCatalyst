"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import {
  MessageSquare,
  Plus,
  Trash2,
  Send,
  Sparkles,
  Bot,
  User,
  AlertCircle,
  RefreshCw,
  ArrowRight,
  Code2,
  Briefcase,
  Compass,
  FileText,
} from "lucide-react";
import { useAuth } from "@/lib/auth";
import {
  MentorConversation,
  MentorMessage,
  fetchMentorConversations,
  createMentorConversation,
  fetchMentorConversationDetail,
  deleteMentorConversation,
  sendMentorMessage,
} from "@/lib/api/career";

const STARTER_PROMPTS = [
  {
    icon: Code2,
    title: "DSA & Algorithms",
    prompt: "I want to master Dynamic Programming and Graphs for product company interviews. Where should I begin?",
  },
  {
    icon: Compass,
    title: "System Design",
    prompt: "How should I structure my preparation for High-Level System Design (HLD) interviews?",
  },
  {
    icon: FileText,
    title: "Resume & Projects",
    prompt: "What full-stack projects stand out most to top tech recruiters in 2026?",
  },
  {
    icon: Briefcase,
    title: "Career Roadmap",
    prompt: "Help me create a 6-month timeline to transition into a High-Growth Backend Software Engineer role.",
  },
];

export default function AIMentorPage() {
  const { session } = useAuth();
  const userId = session?.user_id;

  const [conversations, setConversations] = useState<MentorConversation[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [messages, setMessages] = useState<MentorMessage[]>([]);
  const [inputText, setInputText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

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
      // Non-blocking
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

  const handleStartNewConversation = async () => {
    setActiveConversationId(null);
    setMessages([]);
    setInputText("");
    setErrorMsg(null);
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  };

  const handleDeleteConversation = async (e: React.MouseEvent, convId: string) => {
    e.stopPropagation();
    if (!confirm("Are you sure you want to delete this conversation?")) return;

    const ok = await deleteMentorConversation(convId);
    if (ok) {
      setConversations((prev) => prev.filter((c) => c.id !== convId));
      if (activeConversationId === convId) {
        handleStartNewConversation();
      }
    }
  };

  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || inputText).trim();
    if (!text || isLoading) return;

    setErrorMsg(null);
    setIsLoading(true);

    // Optimistic user message in UI
    const tempUserMsg: MentorMessage = {
      id: `temp-${Date.now()}`,
      conversation_id: activeConversationId || "temp",
      user_id: userId || "guest",
      role: "user",
      content: text,
      created_at: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, tempUserMsg]);
    setInputText("");

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
      setErrorMsg(err?.message || "Failed to receive mentor reply. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const activeConversation = conversations.find((c) => c.id === activeConversationId);

  return (
    <div className="flex h-[calc(100vh-4rem)] bg-zinc-950 text-zinc-100 overflow-hidden">
      {/* ── Left Sidebar: Conversations List ── */}
      <aside className="w-80 border-r border-zinc-800/80 bg-zinc-900/50 flex flex-col shrink-0">
        <div className="p-4 border-b border-zinc-800/80 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <Sparkles className="h-4 w-4" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-zinc-100 leading-none">AI Mentor</h2>
              <span className="text-[11px] text-zinc-400">Context Memory Active</span>
            </div>
          </div>
          <button
            onClick={handleStartNewConversation}
            className="p-1.5 rounded-md bg-zinc-800 hover:bg-zinc-700 text-zinc-200 transition-colors"
            title="Start New Conversation"
          >
            <Plus className="h-4 w-4" />
          </button>
        </div>

        {/* Conversation List */}
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {conversations.length === 0 ? (
            <div className="p-4 text-center text-xs text-zinc-500">
              {userId ? "No conversations yet. Start a session!" : "Log in to view saved conversations."}
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
                      ? "bg-zinc-800 text-zinc-100 font-medium"
                      : "text-zinc-400 hover:bg-zinc-800/50 hover:text-zinc-200"
                  }`}
                >
                  <div className="flex items-center gap-2 overflow-hidden pr-6">
                    <MessageSquare className="h-3.5 w-3.5 shrink-0 opacity-60" />
                    <span className="truncate">{conv.title || "Untitled Session"}</span>
                  </div>
                  <button
                    onClick={(e) => handleDeleteConversation(e, conv.id)}
                    className="opacity-0 group-hover:opacity-100 hover:text-rose-400 p-1 rounded transition-opacity shrink-0"
                    title="Delete Conversation"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              );
            })
          )}
        </div>

        {/* Guest prompt footer */}
        {!userId && (
          <div className="p-3 border-t border-zinc-800 bg-zinc-950/60 text-xs text-zinc-400">
            <p className="mb-2">Log in to save multiple persistent conversations across devices.</p>
            <Link
              href="/auth"
              className="inline-flex items-center gap-1.5 text-xs text-emerald-400 hover:text-emerald-300 font-medium"
            >
              Log in / Sign up <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
        )}
      </aside>

      {/* ── Main Chat Area ── */}
      <main className="flex-1 flex flex-col bg-zinc-950 min-w-0">
        {/* Chat Header */}
        <header className="h-14 border-b border-zinc-800/80 px-6 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <h1 className="text-sm font-semibold text-zinc-100 truncate max-w-md">
              {activeConversation?.title || "New Mentorship Session"}
            </h1>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Online
            </span>
          </div>
          {activeConversationId && (
            <button
              onClick={handleStartNewConversation}
              className="text-xs text-zinc-400 hover:text-zinc-200 flex items-center gap-1.5 px-2.5 py-1 rounded bg-zinc-900 border border-zinc-800 transition-colors"
            >
              <Plus className="h-3.5 w-3.5" /> New Session
            </button>
          )}
        </header>

        {/* Message Thread */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {isLoadingHistory ? (
            <div className="flex items-center justify-center h-48 text-zinc-500 text-xs gap-2">
              <RefreshCw className="h-4 w-4 animate-spin text-emerald-400" />
              Loading persistent conversation memory...
            </div>
          ) : messages.length === 0 ? (
            /* Starter Prompts Empty State */
            <div className="max-w-2xl mx-auto py-8">
              <div className="text-center mb-8">
                <div className="h-12 w-12 rounded-2xl bg-gradient-to-tr from-emerald-500/20 to-teal-500/20 border border-emerald-500/30 flex items-center justify-center mx-auto mb-3 text-emerald-400 shadow-lg shadow-emerald-950/20">
                  <Bot className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-semibold text-zinc-100 mb-1">
                  SkillsCatalyst AI Career & Tech Mentor
                </h3>
                <p className="text-xs text-zinc-400 max-w-md mx-auto">
                  Powered by multi-turn persistent conversation memory and aggregated academic & coding background.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {STARTER_PROMPTS.map((item, idx) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={idx}
                      onClick={() => handleSendMessage(item.prompt)}
                      className="p-3.5 rounded-xl border border-zinc-800/80 bg-zinc-900/40 hover:bg-zinc-900 hover:border-zinc-700 text-left transition-all group"
                    >
                      <div className="flex items-center gap-2.5 mb-1.5 text-zinc-300 group-hover:text-emerald-400">
                        <Icon className="h-4 w-4 text-emerald-500/80" />
                        <span className="text-xs font-semibold">{item.title}</span>
                      </div>
                      <p className="text-[11px] text-zinc-400 leading-relaxed line-clamp-2">
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
                  className={`flex gap-3 max-w-3xl ${isUser ? "ml-auto justify-end" : "mr-auto justify-start"}`}
                >
                  {!isUser && (
                    <div className="h-7 w-7 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shrink-0 text-emerald-400 mt-0.5">
                      <Bot className="h-4 w-4" />
                    </div>
                  )}

                  <div
                    className={`rounded-2xl px-4 py-3 text-xs leading-relaxed max-w-xl break-words ${
                      isUser
                        ? "bg-emerald-600/90 text-white shadow-md shadow-emerald-950/20 rounded-br-sm"
                        : "bg-zinc-900/90 border border-zinc-800/80 text-zinc-200 shadow-sm rounded-bl-sm"
                    }`}
                  >
                    <div className="whitespace-pre-wrap">{msg.content}</div>
                  </div>

                  {isUser && (
                    <div className="h-7 w-7 rounded-lg bg-zinc-800 border border-zinc-700 flex items-center justify-center shrink-0 text-zinc-300 mt-0.5">
                      <User className="h-4 w-4" />
                    </div>
                  )}
                </div>
              );
            })
          )}

          {/* Typing Loading Indicator */}
          {isLoading && (
            <div className="flex gap-3 max-w-3xl mr-auto justify-start">
              <div className="h-7 w-7 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shrink-0 text-emerald-400 mt-0.5">
                <Bot className="h-4 w-4" />
              </div>
              <div className="rounded-2xl px-4 py-3 text-xs bg-zinc-900 border border-zinc-800 text-zinc-400 flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-bounce" />
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-bounce [animation-delay:0.2s]" />
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-bounce [animation-delay:0.4s]" />
                <span className="text-[11px] text-zinc-500 ml-1">Analyzing student context...</span>
              </div>
            </div>
          )}

          {/* Error Banner */}
          {errorMsg && (
            <div className="max-w-md mx-auto p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-center gap-2.5">
              <AlertCircle className="h-4 w-4 shrink-0 text-rose-400" />
              <span className="flex-1">{errorMsg}</span>
              <button
                onClick={() => handleSendMessage()}
                className="text-xs font-semibold underline hover:text-rose-200"
              >
                Retry
              </button>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar */}
        <div className="p-4 border-t border-zinc-800/80 bg-zinc-950 shrink-0">
          <div className="max-w-3xl mx-auto relative rounded-2xl border border-zinc-800 bg-zinc-900/60 focus-within:border-emerald-500/50 focus-within:ring-1 focus-within:ring-emerald-500/30 transition-all">
            <textarea
              ref={textareaRef}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask about DSA, system design, resume review, career roadmaps... (Enter to send, Shift+Enter for newline)"
              rows={2}
              maxLength={3000}
              disabled={isLoading}
              className="w-full resize-none bg-transparent px-4 py-3 text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none"
            />
            <div className="flex items-center justify-between px-3 pb-2 text-[10px] text-zinc-500">
              <span>{inputText.length} / 3000</span>
              <button
                onClick={() => handleSendMessage()}
                disabled={isLoading || inputText.trim().length < 3}
                className="p-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 disabled:opacity-30 disabled:hover:bg-emerald-600 text-white transition-all shadow-sm"
                title="Send Message"
              >
                <Send className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
          <p className="text-[10px] text-zinc-500 text-center mt-2">
            SkillsCatalyst AI Mentor utilizes persistent multi-turn memory & student background context. Strictly focused on tech skills & careers.
          </p>
        </div>
      </main>
    </div>
  );
}
