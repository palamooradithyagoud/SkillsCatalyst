"use client";

import React, { useEffect, useRef } from "react";
import { AlertTriangle, Loader2 } from "lucide-react";

interface DeleteConfirmDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  onConfirm: () => Promise<void>;
  onCancel: () => void;
  isDeleting?: boolean;
}

export default function DeleteConfirmDialog({
  isOpen,
  title,
  message,
  onConfirm,
  onCancel,
  isDeleting = false,
}: DeleteConfirmDialogProps) {
  const cancelButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        cancelButtonRef.current?.focus();
      }, 50);

      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === "Escape" && !isDeleting) {
          onCancel();
        }
      };
      window.addEventListener("keydown", handleKeyDown);
      return () => window.removeEventListener("keydown", handleKeyDown);
    }
  }, [isOpen, isDeleting, onCancel]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs"
      role="alertdialog"
      aria-modal="true"
      aria-labelledby="delete-dialog-title"
      aria-describedby="delete-dialog-description"
    >
      <div className="w-full max-w-sm bg-white dark:bg-neutral-900 rounded-3xl border border-slate-200/80 dark:border-neutral-800 p-5 sm:p-6 shadow-2xl space-y-4 animate-in zoom-in-95 duration-150">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <h3
              id="delete-dialog-title"
              className="text-base font-black text-slate-900 dark:text-white"
            >
              {title}
            </h3>
            <p className="text-xs text-slate-500 dark:text-neutral-400">
              Please confirm your action
            </p>
          </div>
        </div>

        <p
          id="delete-dialog-description"
          className="text-xs sm:text-sm text-slate-600 dark:text-neutral-300 leading-relaxed"
        >
          {message}
        </p>

        <div className="flex items-center justify-end gap-2.5 pt-2">
          <button
            ref={cancelButtonRef}
            type="button"
            onClick={onCancel}
            disabled={isDeleting}
            className="px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold text-slate-600 dark:text-neutral-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isDeleting}
            className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold text-white bg-rose-600 hover:bg-rose-700 shadow-sm transition-colors cursor-pointer disabled:opacity-60"
          >
            {isDeleting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
            <span>Delete</span>
          </button>
        </div>
      </div>
    </div>
  );
}
