"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[Global Root Error caught]:", error);
  }, [error]);

  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-[#070D18] text-slate-100 flex items-center justify-center p-6 antialiased font-sans">
        <div className="max-w-md w-full rounded-2xl border border-red-500/20 bg-[#0F172A] p-8 text-center shadow-2xl">
          <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-red-500/20 border border-red-500/30 text-red-400">
            <AlertTriangle className="h-8 w-8 text-red-400" />
          </div>

          <h1 className="text-2xl font-bold text-white tracking-tight">
            Application Error
          </h1>
          <p className="mt-2.5 text-sm leading-relaxed text-slate-400">
            SkillsCatalyst encountered an unexpected root-level error.
            Please refresh the page or return to the platform home.
          </p>

          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <button
              type="button"
              onClick={() => reset()}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-blue-500/20 transition-all hover:bg-blue-500"
            >
              <RefreshCw className="h-4 w-4" />
              Reload Page
            </button>

            <Link
              href="/"
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-700 bg-slate-800 px-5 py-2.5 text-sm font-semibold text-slate-200 transition-all hover:bg-slate-700 hover:text-white"
            >
              <Home className="h-4 w-4" />
              Home
            </Link>
          </div>
        </div>
      </body>
    </html>
  );
}
