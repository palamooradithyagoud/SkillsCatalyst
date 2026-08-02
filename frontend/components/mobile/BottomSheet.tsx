"use client";

import React, { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";

interface BottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  maxHeight?: string;
}

export default function BottomSheet({
  isOpen,
  onClose,
  title,
  children,
  maxHeight = "max-h-[85vh]",
}: BottomSheetProps) {
  // Prevent body scrolling when sheet is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex flex-col justify-end">
          {/* Backdrop Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/80 backdrop-blur-md"
          />

          {/* Slide-Up Sheet Container */}
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", stiffness: 400, damping: 35 }}
            className={`relative z-10 w-full glass-strong bg-[#091122]/98 border-t border-white/15 rounded-t-[28px] p-5 flex flex-col ${maxHeight} overflow-hidden shadow-2xl shadow-black mobile-touch-scroll pb-[max(env(safe-area-inset-bottom),20px)]`}
          >
            {/* Native Drag Handle */}
            <div className="w-full flex justify-center pb-3 pt-1">
              <div className="w-12 h-1.5 rounded-full bg-white/20" />
            </div>

            {/* Sheet Header */}
            {title && (
              <div className="flex items-center justify-between pb-3 mb-3 border-b border-white/10">
                <h3 className="text-base font-bold text-white truncate pr-2">
                  {title}
                </h3>
                <button
                  onClick={onClose}
                  className="w-9 h-9 rounded-full glass hover:bg-white/10 text-slate-400 hover:text-white flex items-center justify-center mobile-touch-target"
                  aria-label="Close sheet"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* Sheet Body */}
            <div className="flex-1 overflow-y-auto mobile-touch-scroll pr-1">
              {children}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
