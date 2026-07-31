"use client";

import React, { useState, useRef, useEffect } from "react";
import { Sparkles, Send, Bot, User, Loader2, Zap, ShieldCheck, AlertTriangle, X } from "lucide-react";
import { sendMentorMessage } from "@/lib/api";
import { motion, AnimatePresence } from "framer-motion";

interface Message {
  sender: "user" | "ai";
  text: string;
}

// ── Client-side off-topic soft-check ─────────────────────────────────────────
// Same spirit as the backend regex; lightweight version for instant UX feedback.
const OFFTOPIC_WORDS = [
  "movie", "movies", "film", "films", "netflix", "disney", "hotstar",
  "song", "songs", "music", "album", "singer", "celebrity", "bollywood", "hollywood",
  "cricket", "ipl", "football", "soccer", "nfl", "nba", "sports", "match",
  "recipe", "food", "cooking", "restaurant",
  "girlfriend", "boyfriend", "relationship", "marriage", "wedding", "love", "dating",
  "joke", "jokes", "meme", "memes", "funny",
  "politics", "election", "president", "prime minister", "government",
  "astrology", "horoscope", "zodiac",
  "weather", "forecast", "news", "headline",
];

const SKILL_WORDS = [
  "python", "java", "javascript", "react", "vue", "angular", "node", "django",
  "machine learning", "deep learning", "ai", "ml", "data science", "nlp", "llm",
  "dsa", "algorithm", "data structure", "leetcode", "system design",
  "cloud", "aws", "azure", "gcp", "devops", "docker", "kubernetes",
  "sql", "database", "mongodb", "postgres", "api", "rest", "graphql",
  "html", "css", "frontend", "backend", "fullstack",
  "git", "github", "linux", "bash", "c++", "golang", "rust", "kotlin", "swift",
  "interview", "resume", "career", "job", "internship", "salary", "roadmap",
  "tech", "software", "engineer", "developer", "programmer", "coding", "programming",
];

function isLikelyOffTopic(text: string): boolean {
  const lower = text.toLowerCase();
  const hasOffTopic = OFFTOPIC_WORDS.some((w) => lower.includes(w));
  if (!hasOffTopic) return false;
  const hasSkill = SKILL_WORDS.some((w) => lower.includes(w));
  return !hasSkill;
}

// ── Suggested questions — 100% skill/career focused ──────────────────────────
const suggestedQuestions = [
  "How do I crack FAANG interviews?",
  "Give me a Python learning roadmap",
  "Explain Big O notation with examples",
  "Best projects to add to a CS resume",
];

export default function AIMentorPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      sender: "ai",
      text: "Hello! I'm your **SkillsCatalyst AI Mentor** 🎯 — powered by Groq LLM.\n\nI specialise exclusively in:\n• **Programming & DSA** (Python, Java, C++, Algorithms)\n• **System Design** (architecture, scalability, databases)\n• **Interview Prep** (FAANG, coding rounds, HR tips)\n• **Career Guidance** (roadmaps, resume, job hunting)\n• **Tech Tools & Frameworks** (React, Node, Docker, AWS)\n\nWhat skill or career question can I help with today? 🚀",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [offTopicWarning, setOffTopicWarning] = useState(false);
  const [pendingPrompt, setPendingPrompt] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Clear warning when user edits their message
  useEffect(() => {
    if (offTopicWarning) setOffTopicWarning(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [input]);

  const sendMessage = async (prompt: string) => {
    setOffTopicWarning(false);
    setPendingPrompt(null);
    setInput("");
    setMessages((prev) => [...prev, { sender: "user", text: prompt }]);
    setLoading(true);
    const res = await sendMentorMessage(prompt);
    setMessages((prev) => [...prev, { sender: "ai", text: res.reply }]);
    setLoading(false);
  };

  const handleSend = async (prompt?: string) => {
    const text = (prompt ?? input).trim();
    if (!text || loading) return;

    // Client-side soft off-topic check
    if (!prompt && isLikelyOffTopic(text)) {
      setOffTopicWarning(true);
      setPendingPrompt(text);
      return;
    }

    await sendMessage(text);
  };

  const handleSendAnyway = async () => {
    if (pendingPrompt) await sendMessage(pendingPrompt);
  };

  const handleCancelWarning = () => {
    setOffTopicWarning(false);
    setPendingPrompt(null);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="max-w-4xl mx-auto flex flex-col h-[calc(100vh-6rem)] gap-4"
    >
      {/* ── Header ──────────────────────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" as const }}
        className="flex items-center justify-between"
      >
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-purple-500/10 border border-purple-500/20 text-purple-400 animate-pulse-glow">
            <Sparkles className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">AI Career Mentor</h1>
            <div className="flex items-center gap-1.5 text-xs text-slate-400 font-medium mt-0.5">
              <Zap className="w-3 h-3 text-amber-400" />
              Powered by Groq · llama-3.3-70b
            </div>
          </div>
        </div>

        {/* Status badges */}
        <div className="flex items-center gap-2">
          {/* Skills Only badge */}
          <div className="px-3 py-1.5 glass rounded-full text-xs font-semibold text-indigo-300 border border-indigo-500/25 flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-indigo-400" />
            Skills Only 🎯
          </div>
          {/* Online badge */}
          <div className="px-3 py-1.5 glass rounded-full text-xs font-semibold text-emerald-400 border border-emerald-500/20 flex items-center gap-1.5">
            <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
            Online
          </div>
        </div>
      </motion.div>

      {/* ── Chat Messages ────────────────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15, duration: 0.5 }}
        className="flex-1 glass rounded-2xl p-5 overflow-y-auto space-y-4"
      >
        <AnimatePresence initial={false}>
          {messages.map((msg, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 12, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.3, ease: "easeOut" as const }}
              className={`flex items-end gap-3 ${msg.sender === "user" ? "flex-row-reverse" : ""}`}
            >
              {/* Avatar */}
              <div
                className={`p-2 rounded-xl shrink-0 ${
                  msg.sender === "user"
                    ? "bg-blue-600 shadow-lg shadow-blue-500/20"
                    : "bg-purple-600/20 border border-purple-500/25"
                }`}
              >
                {msg.sender === "user"
                  ? <User className="w-4 h-4 text-white" />
                  : <Bot className="w-4 h-4 text-purple-300" />
                }
              </div>

              {/* Bubble */}
              <div
                className={`max-w-[75%] px-4 py-3 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap ${
                  msg.sender === "user"
                    ? "bg-blue-600 text-white rounded-br-md shadow-lg shadow-blue-500/15"
                    : "glass text-slate-200 rounded-bl-md"
                }`}
              >
                {msg.text}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Typing indicator */}
        <AnimatePresence>
          {loading && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="flex items-center gap-3"
            >
              <div className="p-2 rounded-xl bg-purple-600/20 border border-purple-500/25">
                <Bot className="w-4 h-4 text-purple-300" />
              </div>
              <div className="glass px-4 py-3 rounded-2xl rounded-bl-md flex items-center gap-2">
                <div className="flex gap-1">
                  {[0, 1, 2].map((i) => (
                    <motion.div
                      key={i}
                      className="w-2 h-2 bg-purple-400 rounded-full"
                      animate={{ y: [0, -6, 0] }}
                      transition={{ repeat: Infinity, duration: 0.8, delay: i * 0.15 }}
                    />
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        <div ref={bottomRef} />
      </motion.div>

      {/* ── Off-topic warning chip ────────────────────────────────────────────── */}
      <AnimatePresence>
        {offTopicWarning && (
          <motion.div
            initial={{ opacity: 0, y: 6, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 4, scale: 0.97 }}
            transition={{ duration: 0.22 }}
            className="flex items-center gap-3 px-4 py-3 rounded-2xl border text-sm"
            style={{
              background: "rgba(217,119,6,0.12)",
              border: "1px solid rgba(245,158,11,0.35)",
            }}
          >
            <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
            <span className="flex-1 text-amber-200 font-medium">
              ⚠️ This looks like a non-skill question. I&apos;m built for <strong>skills, DSA, interviews &amp; career</strong> topics only.
            </span>
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={handleSendAnyway}
                className="text-xs font-bold text-amber-400 hover:text-amber-300 px-3 py-1.5 rounded-lg border border-amber-500/30 hover:border-amber-400/50 transition-colors"
              >
                Send Anyway
              </button>
              <button
                onClick={handleCancelWarning}
                className="text-xs font-bold text-slate-400 hover:text-white px-3 py-1.5 rounded-lg border border-slate-600/50 hover:border-slate-400/50 transition-colors flex items-center gap-1"
              >
                <X className="w-3 h-3" /> Cancel
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Suggested questions ───────────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="flex flex-wrap gap-2"
      >
        {suggestedQuestions.map((q) => (
          <button
            key={q}
            onClick={() => handleSend(q)}
            suppressHydrationWarning
            className="text-xs font-medium px-3 py-1.5 glass rounded-full text-slate-300 hover:text-white hover:border-blue-500/30 transition-all"
          >
            {q}
          </button>
        ))}
      </motion.div>

      {/* ── Input row ────────────────────────────────────────────────────────── */}
      <motion.form
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25, duration: 0.4 }}
        onSubmit={(e) => { e.preventDefault(); handleSend(); }}
        className="flex gap-3"
      >
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask about DSA, system design, interview prep, or career guidance (skills & tech only)..."
          className="input-glass flex-1 px-4 py-3 text-sm"
          suppressHydrationWarning
        />
        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          type="submit"
          disabled={loading}
          suppressHydrationWarning
          className="btn-primary px-6 py-3 rounded-xl text-white font-semibold text-sm flex items-center gap-2 disabled:opacity-50"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          <span>Send</span>
        </motion.button>
      </motion.form>
    </motion.div>
  );
}
