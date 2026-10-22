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

  // Click outside to collapse (local container only, no overall screen dimming)
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

  // Scaled-up, prominent concentric dimensions
  const idleWidth = isMobile ? 286 : 340;
  const idleHeight = isMobile ? 42 : 44;

  return (
    <div
      ref={containerRef}
      className={cn(
        "w-full flex flex-col items-center relative select-none z-20",
        className
      )}
    >
      {/* ── Background Nearby the Searchbar (Solid Black Housing on Click) ── */}
      <motion.div
        animate={{
          backgroundColor: isExpanded ? "#0a0b0f" : "rgba(10, 11, 15, 0)",
          borderRadius: isExpanded ? 24 : 16,
          boxShadow: isExpanded
            ? "0 16px 45px -8px rgba(0,0,0,0.4), 0 4px 16px -2px rgba(0,0,0,0.2)"
            : "none",
        }}
        transition={springTransition}
        className={cn(
          "w-full max-w-2xl mx-auto flex flex-col items-center relative transition-colors",
          isExpanded ? "p-1.5 sm:p-2 border border-white/[0.08]" : "border-0"
        )}
      >
        {/* Idle Housing Structure (Top shelf + contoured tab with concave fillets) */}
        <motion.div
          animate={{
            opacity: isExpanded ? 0 : 1,
            height: isExpanded ? 0 : "auto",
          }}
          transition={springTransition}
          className={cn(
            "w-full flex flex-col items-center overflow-hidden",
            isExpanded && "pointer-events-none"
          )}
        >
          {/* Top Dark Shelf Bar */}
          <div className="w-full h-9 sm:h-10 bg-[#16171d] rounded-t-2xl border-t border-x border-white/[0.06] shadow-sm relative">
            <div className="absolute inset-x-0 top-0 h-px bg-white/[0.08]" />
          </div>

          {/* Downward Contoured Tab Housing */}
          <div className="relative -mt-1 flex items-center justify-center">
            {/* Left Inverted Concave Shoulder */}
            <div className="absolute right-full top-0 w-5 h-5 overflow-hidden pointer-events-none">
              <div className="w-10 h-10 rounded-tr-2xl bg-transparent shadow-[5px_-5px_0_5px_#16171d]" />
            </div>

            {/* Center Tab Body with Concentric Recessed Pocket */}
            <div className="w-[304px] sm:w-[358px] h-[58px] sm:h-[60px] bg-[#16171d] rounded-b-2xl border-b border-x border-white/[0.06] flex items-center justify-center shadow-lg relative p-1.5">
              {/* Sunken Recessed Pocket */}
              <div
                className="w-full h-[48px] sm:h-[52px] rounded-full bg-[#0a0b0e] shadow-[inset_0_2.5px_6px_rgba(0,0,0,0.92),inset_0_1px_2px_rgba(0,0,0,0.98)] border border-black/50 flex items-center justify-center relative cursor-pointer"
                onClick={() => {
                  if (!isExpanded) setIsExpanded(true);
                }}
                title="Click to search"
              />
            </div>

            {/* Right Inverted Concave Shoulder */}
            <div className="absolute left-full top-0 w-5 h-5 overflow-hidden pointer-events-none">
              <div className="w-10 h-10 rounded-tl-2xl bg-transparent shadow-[-5px_-5px_0_5px_#16171d]" />
            </div>
          </div>
        </motion.div>

        {/* ── Search Bar: On the Black Nearby Background in White + Blur Colour ── */}
        <motion.div
          layout
          initial={false}
          animate={{
            y: 0,
            width: isExpanded ? "100%" : idleWidth,
            height: isExpanded ? 52 : idleHeight,
            borderRadius: isExpanded ? 18 : 9999,
            backgroundColor: isExpanded
              ? "rgba(255, 255, 255, 0.88)"
              : "#dcdde2",
            boxShadow: isExpanded
              ? "0 10px 30px -4px rgba(0,0,0,0.25), 0 2px 8px -2px rgba(0,0,0,0.15)"
              : "0 1px 3px rgba(0,0,0,0.12)",
          }}
          transition={springTransition}
          onClick={() => {
            if (!isExpanded) setIsExpanded(true);
          }}
          className={cn(
            "flex items-center overflow-hidden border transition-colors",
            isExpanded
              ? "relative z-30 w-full border-white/60 backdrop-blur-2xl backdrop-saturate-180 cursor-default"
              : "absolute z-30 bottom-[8px] border-white/20 hover:brightness-105 active:scale-[0.98] cursor-pointer shadow-sm"
          )}
          style={{
            backdropFilter: isExpanded ? "blur(24px) saturate(180%)" : "none",
            WebkitBackdropFilter: isExpanded ? "blur(24px) saturate(180%)" : "none",
          }}
          role="search"
          aria-expanded={isExpanded}
        >
          {/* 1. IDLE STATE VIEW: Minimal Clean Pill with Solid Dark Circle on Right */}
          {!isExpanded ? (
            <div className="w-full h-full flex items-center justify-between pl-4.5 pr-1.5 select-none">
              <span className="text-xs sm:text-[13px] text-neutral-500 font-normal truncate max-w-[200px]">
                {query ? query : placeholder}
              </span>
              {/* Solid clean dark circle matching reference mockup */}
              <div className="size-8 sm:size-9 rounded-full bg-[#18191f] text-white flex items-center justify-center shrink-0 shadow-sm" />
            </div>
          ) : (
            /* 2. EXPANDED STATE VIEW: Frosted White + Blur Field on Black Dock */
            <form
              onSubmit={handleSubmit}
              className="w-full h-full flex items-center pl-4 pr-2 gap-2.5"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Search Icon */}
              <Search className="h-4.5 w-4.5 text-neutral-500 shrink-0" />

              {/* Text Input */}
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={placeholder}
                disabled={isLoading}
                className="flex-1 h-full bg-transparent border-0 outline-none text-sm sm:text-[14.5px] text-neutral-900 placeholder:text-neutral-400 font-normal selection:bg-purple-200 min-w-0"
              />

              {/* Clear Button (Visible if query has text) */}
              {query.length > 0 && (
                <button
                  type="button"
                  onClick={() => {
                    setQuery("");
                    inputRef.current?.focus();
                  }}
                  className="size-6 rounded-full bg-neutral-200/80 hover:bg-neutral-300 text-neutral-600 flex items-center justify-center transition-colors shrink-0 cursor-pointer"
                  title="Clear input"
                  aria-label="Clear input"
                >
                  <X className="h-3.5 w-3.5" />
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
                  "size-9 sm:size-9.5 rounded-full flex items-center justify-center transition-all duration-200 shrink-0 shadow-xs cursor-pointer",
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
                  <RotateCw className="h-4.5 w-4.5 animate-spin text-white" />
                ) : query.trim() ? (
                  <ArrowUp className="h-5 w-5 stroke-[2.5]" />
                ) : (
                  <Mic
                    className={cn(
                      "h-5 w-5 stroke-[2.2]",
                      isListening ? "text-white" : "text-neutral-200"
                    )}
                  />
                )}
              </button>
            </form>
          )}
        </motion.div>
      </motion.div>
    </div>
  );
}

export default RecessedMorphingSearch;
