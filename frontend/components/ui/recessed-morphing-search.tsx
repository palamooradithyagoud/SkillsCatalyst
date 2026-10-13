"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import { motion, useReducedMotion, type Transition } from "framer-motion";
import { Search, X, ArrowUp, Mic, RotateCw } from "lucide-react";
import { cn } from "@/lib/utils";

export interface RecessedMorphingSearchProps {
  onSendMessage: (query: string) => void;
  isLoading: boolean;
  placeholder?: string;
  className?: string;
}

export function RecessedMorphingSearch({
  onSendMessage,
  isLoading,
  placeholder = "Ask AI Catalyst...",
  className,
}: RecessedMorphingSearchProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [query, setQuery] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const recognitionRef = useRef<any>(null);

  const shouldReduceMotion = useReducedMotion();

  // Screen size detection for responsive idle dimensions
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 640);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Auto-focus input when expanded
  useEffect(() => {
    if (isExpanded) {
      const timer = setTimeout(() => {
        inputRef.current?.focus();
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [isExpanded]);

  // Click outside to collapse
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent | TouchEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setIsExpanded(false);
        if (isListening) {
          recognitionRef.current?.stop();
          setIsListening(false);
        }
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("touchstart", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
    };
  }, [isListening]);

  // Escape key to collapse
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isExpanded) {
        setIsExpanded(false);
        inputRef.current?.blur();
        if (isListening) {
          recognitionRef.current?.stop();
          setIsListening(false);
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isExpanded, isListening]);

  // Speech Recognition handler
  const toggleListening = useCallback(() => {
    if (typeof window === "undefined") return;
    const SpeechRecognition =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert("Speech recognition is not supported in this browser.");
      return;
    }

    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = "en-US";

      recognition.onstart = () => {
        setIsListening(true);
      };

      recognition.onresult = (event: any) => {
        const transcript = event.results[0]?.[0]?.transcript;
        if (transcript) {
          setQuery((prev) => (prev ? `${prev} ${transcript}` : transcript));
        }
      };

      recognition.onerror = () => {
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch {
      setIsListening(false);
    }
  }, [isListening]);

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!query.trim() || isLoading) return;
    const textToSend = query.trim();
    setQuery("");
    onSendMessage(textToSend);
  };

  // Tactile spring physics
  const springTransition: Transition = shouldReduceMotion
    ? { duration: 0.15, ease: "easeInOut" as const }
    : {
        type: "spring",
        stiffness: 420,
        damping: 32,
        mass: 0.8,
      };

  // Exact concentric dimensions matching mockup reference
  const idleWidth = isMobile ? 224 : 244;
  const idleHeight = isMobile ? 35 : 36;

  return (
    <div
      ref={containerRef}
      className={cn(
        "w-full flex flex-col items-center relative select-none z-20",
        className
      )}
    >
      {/* ── Outer Recessed Dark Housing (Fades smoothly when expanded so no black tab peeks out) ── */}
      <motion.div
        animate={{
          opacity: isExpanded ? 0 : 1,
          scale: isExpanded ? 0.96 : 1,
        }}
        transition={springTransition}
        className={cn(
          "w-full max-w-xl mx-auto flex flex-col items-center relative",
          isExpanded && "pointer-events-none"
        )}
      >
        {/* Top Dark Shelf Bar */}
        <div className="w-full h-8 sm:h-9 bg-[#16171d] rounded-t-2xl border-t border-x border-white/[0.06] shadow-sm relative">
          <div className="absolute inset-x-0 top-0 h-px bg-white/[0.08]" />
        </div>

        {/* Downward Contoured Tab Housing */}
        <div className="relative -mt-1 flex items-center justify-center">
          {/* Left Inverted Concave Shoulder */}
          <div className="absolute right-full top-0 w-4 h-4 overflow-hidden pointer-events-none">
            <div className="w-8 h-8 rounded-tr-xl bg-transparent shadow-[4px_-4px_0_4px_#16171d]" />
          </div>

          {/* Center Tab Body with Concentric Recessed Pocket */}
          <div className="w-[252px] sm:w-[264px] h-[48px] bg-[#16171d] rounded-b-2xl border-b border-x border-white/[0.06] flex items-center justify-center shadow-lg relative p-1.5">
            {/* The Sunken Recessed Pocket / Well - Exactly concentric around the pill */}
            <div
              className="w-full h-[38px] sm:h-[40px] rounded-full bg-[#0a0b0e] shadow-[inset_0_2px_5px_rgba(0,0,0,0.92),inset_0_1px_2px_rgba(0,0,0,0.98)] border border-black/50 flex items-center justify-center relative cursor-pointer"
              onClick={() => {
                if (!isExpanded) setIsExpanded(true);
              }}
              title="Click to search"
            />
          </div>

          {/* Right Inverted Concave Shoulder */}
          <div className="absolute left-full top-0 w-4 h-4 overflow-hidden pointer-events-none">
            <div className="w-8 h-8 rounded-tl-xl bg-transparent shadow-[-4px_-4px_0_4px_#16171d]" />
          </div>
        </div>
      </motion.div>

      {/* ── Morphing Search Control (Pill -> Expanded Rectangular Search Bar) ── */}
      <motion.div
        layout
        initial={false}
        animate={{
          y: isExpanded ? 0 : 0,
          width: isExpanded ? "100%" : idleWidth,
          height: isExpanded ? 50 : idleHeight,
          borderRadius: isExpanded ? 16 : 9999,
          backgroundColor: isExpanded ? "#ffffff" : "#dcdde2",
          boxShadow: isExpanded
            ? "0 20px 48px -8px rgba(0,0,0,0.22), 0 4px 16px -2px rgba(0,0,0,0.08)"
            : "0 1px 3px rgba(0,0,0,0.12)",
        }}
        transition={springTransition}
        onClick={() => {
          if (!isExpanded) setIsExpanded(true);
        }}
        className={cn(
          "absolute z-30 flex items-center overflow-hidden border transition-colors",
          isExpanded
            ? "bottom-0 max-w-xl mx-auto border-black/[0.06] cursor-default"
            : "bottom-[6px] border-white/20 hover:brightness-105 active:scale-[0.98] cursor-pointer shadow-sm"
        )}
        role="search"
        aria-expanded={isExpanded}
      >
        {/* 1. IDLE STATE VIEW: Minimal Clean Pill with Solid Dark Circle on Right */}
        {!isExpanded ? (
          <div className="w-full h-full flex items-center justify-between pl-4 pr-1 select-none">
            <span className="text-[11.5px] sm:text-xs text-neutral-500 font-normal truncate max-w-[140px]">
              {query ? query : placeholder}
            </span>
            {/* Solid clean dark circle matching reference mockup */}
            <div className="size-7 sm:size-7.5 rounded-full bg-[#18191f] text-white flex items-center justify-center shrink-0 mr-0.5 shadow-sm" />
          </div>
        ) : (
          /* 2. EXPANDED STATE VIEW: Tactile Rectangular Search Field */
          <form
            onSubmit={handleSubmit}
            className="w-full h-full flex items-center pl-3.5 pr-1.5 gap-2"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Search Icon */}
            <Search className="h-4 w-4 text-neutral-400 shrink-0" />

            {/* Text Input */}
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={placeholder}
              disabled={isLoading}
              className="flex-1 h-full bg-transparent border-0 outline-none text-sm text-neutral-900 placeholder:text-neutral-400 font-normal selection:bg-purple-200 min-w-0"
            />

            {/* Clear Button (Visible if query has text) */}
            {query.length > 0 && (
              <button
                type="button"
                onClick={() => {
                  setQuery("");
                  inputRef.current?.focus();
                }}
                className="size-5.5 rounded-full bg-neutral-200 hover:bg-neutral-300 text-neutral-600 flex items-center justify-center transition-colors shrink-0 cursor-pointer"
                title="Clear input"
                aria-label="Clear input"
              >
                <X className="h-3 w-3" />
              </button>
            )}

            {/* Action Circle Button (Send / Voice / Spinner) */}
            <button
              type={query.trim() ? "submit" : "button"}
              onClick={() => {
                if (!query.trim() && !isLoading) {
                  toggleListening();
                }
              }}
              disabled={isLoading}
              className={cn(
                "size-8.5 sm:size-9 rounded-full flex items-center justify-center transition-all duration-200 shrink-0 shadow-xs cursor-pointer",
                isLoading
                  ? "bg-neutral-800 text-white cursor-wait opacity-80"
                  : query.trim()
                  ? "bg-neutral-950 hover:bg-black text-white hover:scale-105 active:scale-95"
                  : isListening
                  ? "bg-purple-600 text-white animate-pulse"
                  : "bg-neutral-950 hover:bg-black text-white hover:scale-105 active:scale-95"
              )}
              aria-label={
                query.trim()
                  ? "Send prompt"
                  : isListening
                  ? "Stop listening"
                  : "Voice input"
              }
              title={
                query.trim()
                  ? "Send prompt"
                  : isListening
                  ? "Listening..."
                  : "Voice input"
              }
            >
              {isLoading ? (
                <RotateCw className="h-4 w-4 animate-spin text-white" />
              ) : query.trim() ? (
                <ArrowUp className="h-4.5 w-4.5 stroke-[2.5]" />
              ) : (
                <Mic
                  className={cn(
                    "h-4 w-4 stroke-[2.2]",
                    isListening ? "text-white" : "text-neutral-200"
                  )}
                />
              )}
            </button>
          </form>
        )}
      </motion.div>
    </div>
  );
}

export default RecessedMorphingSearch;
