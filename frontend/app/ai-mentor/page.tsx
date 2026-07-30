"use client";

import React, { useState, useRef, useEffect } from "react";
import { Sparkles, Send, Bot, User, Loader2, Zap } from "lucide-react";
import { sendMentorMessage } from "@/lib/api";
import { motion, AnimatePresence } from "framer-motion";

interface Message {
  sender: "user" | "ai";
  text: string;
}

const suggestedQuestions = [
  "How do I prepare for a FAANG interview?",
  "Explain Dynamic Programming in simple terms",
  "What's a good system design architecture?",
  "Review my DSA approach for Two Sum",
];

export default function AIMentorPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      sender: "ai",
      text: "Hello! I'm your SkillPath AI Mentor powered by Groq LLM. I can help you with DSA, System Design, Interview Prep, Career Roadmaps, and more. What would you like to work on today? 🚀",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async (prompt: string) => {
    const text = prompt || input.trim();
    if (!text || loading) return;
    setInput("");
    setMessages((prev) => [...prev, { sender: "user", text }]);
    setLoading(true);
    const res = await sendMentorMessage(text);
    setMessages((prev) => [...prev, { sender: "ai", text: res.reply }]);
    setLoading(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="max-w-4xl mx-auto flex flex-col h-[calc(100vh-6rem)] gap-4"
    >
      {/* Header */}
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
        <div className="px-3 py-1.5 glass rounded-full text-xs font-semibold text-emerald-400 border border-emerald-500/20 flex items-center gap-1.5">
          <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
          Online
        </div>
      </motion.div>

      {/* Chat Messages */}
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
                className={`max-w-[75%] px-4 py-3 rounded-2xl text-sm leading-relaxed ${
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

      {/* Suggested questions */}
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

      {/* Input row */}
      <motion.form
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25, duration: 0.4 }}
        onSubmit={(e) => { e.preventDefault(); handleSend(input); }}
        className="flex gap-3"
      >
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask anything about DSA, System Design, or your Career path..."
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

