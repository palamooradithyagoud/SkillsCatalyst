"use client";

import React, { useState, useEffect } from "react";
import { Bell, X, Sparkles, CheckCircle2 } from "lucide-react";
import { useNotifications } from "@/contexts/NotificationContext";

export default function NotificationPermissionBanner() {
  const {
    isPushSupported,
    isPushSubscribed,
    pushPermission,
    requestPushPermission,
  } = useNotifications();

  const [isDismissed, setIsDismissed] = useState<boolean>(true);
  const [isSubscribing, setIsSubscribing] = useState<boolean>(false);
  const [justSubscribed, setJustSubscribed] = useState<boolean>(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    // Check if dismissed recently (cooldown: 7 days)
    const dismissedTime = localStorage.getItem("skillscatalyst_notif_banner_dismissed");
    if (dismissedTime) {
      const diff = Date.now() - parseInt(dismissedTime, 10);
      if (diff < 7 * 24 * 60 * 60 * 1000) {
        setIsDismissed(true);
        return;
      }
    }

    // Only show if push is supported, user has not subscribed, and permission is default
    if (isPushSupported && !isPushSubscribed && pushPermission === "default") {
      setIsDismissed(false);
    } else {
      setIsDismissed(true);
    }
  }, [isPushSupported, isPushSubscribed, pushPermission]);

  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleDismiss = () => {
    setIsDismissed(true);
    try {
      localStorage.setItem("skillscatalyst_notif_banner_dismissed", Date.now().toString());
    } catch {}
  };

  const handleEnable = async () => {
    setIsSubscribing(true);
    setErrorMessage(null);
    try {
      const success = await requestPushPermission();
      if (success) {
        setJustSubscribed(true);
        setTimeout(() => {
          setIsDismissed(true);
        }, 2500);
      } else {
        setErrorMessage("Registration failed: push service error. Check browser settings or extensions.");
      }
    } catch (e: any) {
      setErrorMessage(e?.message || "Push service error. Check browser settings.");
    } finally {
      setIsSubscribing(false);
    }
  };

  if (isDismissed || !isPushSupported || isPushSubscribed) {
    return null;
  }

  if (justSubscribed) {
    return (
      <div className="fixed bottom-20 md:bottom-6 right-4 sm:right-6 z-50 max-w-sm w-[calc(100vw-2rem)] bg-emerald-950/90 dark:bg-emerald-950/95 border border-emerald-500/40 backdrop-blur-md rounded-2xl p-4 shadow-2xl shadow-emerald-950/30 flex items-center gap-3 animate-in fade-in slide-in-from-bottom-4 duration-200">
        <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center shrink-0 text-emerald-400">
          <CheckCircle2 className="w-5 h-5" />
        </div>
        <div>
          <p className="text-sm font-semibold text-white">Notifications Enabled!</p>
          <p className="text-xs text-emerald-200/80">You will receive streak alerts and new updates.</p>
        </div>
      </div>
    );
  }

  return (
    <div
      role="region"
      aria-label="Notification Permission"
      className="fixed bottom-20 md:bottom-6 right-4 sm:right-6 z-50 max-w-md w-[calc(100vw-2rem)] bg-white/95 dark:bg-slate-900/95 border border-slate-200/80 dark:border-slate-800/90 backdrop-blur-xl rounded-2xl p-4 sm:p-5 shadow-2xl shadow-slate-950/20 flex flex-col gap-3 animate-in fade-in slide-in-from-bottom-4 duration-200"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#5227FF] to-indigo-500 flex items-center justify-center text-white shadow-md shadow-[#5227FF]/20 shrink-0">
            <Bell className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
              <span>🔔 Stay updated</span>
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            </h4>
            <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5 leading-relaxed">
              Get notifications about streaks, new events and scholarships.
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={handleDismiss}
          className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          aria-label="Dismiss banner"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {errorMessage && (
        <div className="p-2.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-[11px] leading-relaxed animate-in fade-in">
          {errorMessage}
        </div>
      )}

      <div className="flex items-center justify-end gap-2 pt-1">
        <button
          type="button"
          onClick={handleDismiss}
          className="px-3 py-1.5 text-xs font-medium text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 transition-colors rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800/60"
        >
          Not now
        </button>
        <button
          type="button"
          onClick={handleEnable}
          disabled={isSubscribing}
          className="px-4 py-1.5 text-xs font-semibold text-white bg-gradient-to-r from-[#5227FF] to-indigo-600 hover:from-[#431ce0] hover:to-indigo-700 rounded-xl shadow-md shadow-[#5227FF]/25 hover:shadow-lg transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
        >
          {isSubscribing ? (
            <>
              <div className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
              <span>Enabling...</span>
            </>
          ) : (
            <span>Enable Notifications</span>
          )}
        </button>
      </div>
    </div>
  );
}
