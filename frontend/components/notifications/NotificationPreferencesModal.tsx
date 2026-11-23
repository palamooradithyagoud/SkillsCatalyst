"use client";

import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import {
  X,
  Flame,
  Calendar,
  GraduationCap,
  Bell,
  Check,
  Send,
  Loader2,
  ShieldCheck,
  Info,
} from "lucide-react";
import { useNotifications } from "@/contexts/NotificationContext";
import { sendTestPushNotification } from "@/lib/api/notifications";

interface NotificationPreferencesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function NotificationPreferencesModal({
  isOpen,
  onClose,
}: NotificationPreferencesModalProps) {
  const {
    preferences,
    updatePreferences,
    isPushSupported,
    isPushSubscribed,
    requestPushPermission,
    unsubscribePush,
  } = useNotifications();

  const [mounted, setMounted] = useState<boolean>(false);
  const [savingKey, setSavingKey] = useState<string | null>(null);
  const [isTestingPush, setIsTestingPush] = useState<boolean>(false);
  const [testResult, setTestResult] = useState<string | null>(null);
  const [pushStatusMessage, setPushStatusMessage] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Prevent background body scroll when modal is open
  useEffect(() => {
    if (!isOpen) return;
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, [isOpen]);

  if (!isOpen || !mounted) return null;

  const handleToggle = async (key: "streak_enabled" | "events_enabled" | "scholarships_enabled") => {
    setSavingKey(key);
    try {
      await updatePreferences({ [key]: !preferences[key] });
    } finally {
      setSavingKey(null);
    }
  };

  const handlePushToggle = async () => {
    setPushStatusMessage(null);
    if (isPushSubscribed) {
      await unsubscribePush();
    } else {
      try {
        const ok = await requestPushPermission();
        if (!ok) {
          const isBrave = typeof (navigator as any).brave?.isBrave === "function";
          if (isBrave) {
            setPushStatusMessage(
              "In Brave: Open brave://settings/privacy, toggle ON 'Use Google services for push messaging', and restart Brave."
            );
          } else {
            setPushStatusMessage(
              "Push service connection failed. Please ensure notifications are allowed in your browser settings."
            );
          }
        }
      } catch (err: any) {
        setPushStatusMessage(err?.message || "Could not register push service with browser.");
      }
    }
  };

  const handleTestPush = async () => {
    setIsTestingPush(true);
    setTestResult(null);
    try {
      const ok = await sendTestPushNotification();
      if (ok) {
        setTestResult("Test push sent! Check your notification tray.");
      } else {
        setTestResult("Push failed. Please ensure notifications are enabled in your browser.");
      }
    } catch {
      setTestResult("Error dispatching test notification.");
    } finally {
      setIsTestingPush(false);
      setTimeout(() => setTestResult(null), 5000);
    }
  };

  const modalContent = (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
      {/* Backdrop (Solid dark - Zero Glass Back) */}
      <div
        className="fixed inset-0 bg-black/80 dark:bg-black/90 transition-opacity animate-in fade-in duration-150"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal Card (Solid high-contrast Black - Zero Glass Back) */}
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="notif-pref-title"
        className="relative z-10 w-full max-w-md my-auto bg-[#121318] border border-white/10 rounded-2xl shadow-2xl p-5 sm:p-6 flex flex-col gap-4.5 max-h-[90vh] overflow-y-auto animate-in zoom-in-95 fade-in duration-150 text-white"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-3.5">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#18191E] border border-white/10 text-white flex items-center justify-center shrink-0">
              <Bell className="w-4 h-4" />
            </div>
            <div>
              <h3 id="notif-pref-title" className="text-base font-bold text-white leading-tight">
                Notification Preferences
              </h3>
              <p className="text-[11px] text-neutral-400 mt-0.5">
                Manage alerts, triggers, and browser Web Push
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-neutral-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors cursor-pointer"
            aria-label="Close dialog"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Toggles */}
        <div className="flex flex-col gap-2.5">
          {/* 1. Streak */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-[#18191E] border border-white/10 transition-colors">
            <div className="flex items-center gap-3 pr-2">
              <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-500 flex items-center justify-center shrink-0 border border-amber-500/20">
                <Flame className="w-4 h-4" />
              </div>
              <div>
                <p className="text-sm font-semibold text-white leading-snug">Daily Streak Reminders</p>
                <p className="text-xs text-neutral-400">At-risk streak alerts and milestone badges (max 1/day)</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => handleToggle("streak_enabled")}
              disabled={savingKey === "streak_enabled"}
              className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer shrink-0 ${
                preferences.streak_enabled ? "bg-[#D5FF38]" : "bg-neutral-800"
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full ${preferences.streak_enabled ? "bg-black" : "bg-white"} shadow-md transform transition-transform absolute top-0.5 left-0.5 ${
                  preferences.streak_enabled ? "translate-x-5" : "translate-x-0"
                }`}
              />
            </button>
          </div>

          {/* 2. Events */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-[#18191E] border border-white/10 transition-colors">
            <div className="flex items-center gap-3 pr-2">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-500 flex items-center justify-center shrink-0 border border-emerald-500/20">
                <Calendar className="w-4 h-4" />
              </div>
              <div>
                <p className="text-sm font-semibold text-white leading-snug">New Events & Hackathons</p>
                <p className="text-xs text-neutral-400">Alerts when new competitions and workshops are published</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => handleToggle("events_enabled")}
              disabled={savingKey === "events_enabled"}
              className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer shrink-0 ${
                preferences.events_enabled ? "bg-[#D5FF38]" : "bg-neutral-800"
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full ${preferences.events_enabled ? "bg-black" : "bg-white"} shadow-md transform transition-transform absolute top-0.5 left-0.5 ${
                  preferences.events_enabled ? "translate-x-5" : "translate-x-0"
                }`}
              />
            </button>
          </div>

          {/* 3. Scholarships */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-[#18191E] border border-white/10 transition-colors">
            <div className="flex items-center gap-3 pr-2">
              <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-500 flex items-center justify-center shrink-0 border border-amber-500/20">
                <GraduationCap className="w-4 h-4" />
              </div>
              <div>
                <p className="text-sm font-semibold text-white leading-snug">New Scholarships</p>
                <p className="text-xs text-neutral-400">Targeted eligibility updates and financial aid grants</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => handleToggle("scholarships_enabled")}
              disabled={savingKey === "scholarships_enabled"}
              className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer shrink-0 ${
                preferences.scholarships_enabled ? "bg-[#D5FF38]" : "bg-neutral-800"
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full ${preferences.scholarships_enabled ? "bg-black" : "bg-white"} shadow-md transform transition-transform absolute top-0.5 left-0.5 ${
                  preferences.scholarships_enabled ? "translate-x-5" : "translate-x-0"
                }`}
              />
            </button>
          </div>
        </div>

        {/* Web Push Subscription Status & Controls */}
        <div className="pt-3 border-t border-white/10 flex flex-col gap-2.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
              <span className="text-xs font-semibold text-neutral-300">
                Browser Web Push
              </span>
            </div>
            <span
              className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                isPushSubscribed
                  ? "bg-emerald-500/15 text-emerald-400"
                  : "bg-[#18191E] text-neutral-400"
              }`}
            >
              {isPushSubscribed ? "Active" : "Not Active"}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {isPushSupported && (
              <button
                type="button"
                onClick={handlePushToggle}
                className="flex-1 py-2 text-xs font-semibold rounded-xl border border-white/10 hover:bg-[#18191E] text-slate-200 transition-colors cursor-pointer"
              >
                {isPushSubscribed ? "Disable Push for this Device" : "Enable Web Push"}
              </button>
            )}

            {isPushSubscribed && (
              <button
                type="button"
                onClick={handleTestPush}
                disabled={isTestingPush}
                className="px-3 py-2 text-xs font-bold text-black bg-[#D5FF38] hover:bg-[#c6f432] rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50 shadow-xs"
                title="Send a sample notification to your device"
              >
                {isTestingPush ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Send className="w-3.5 h-3.5" />
                )}
                <span>Test</span>
              </button>
            )}
          </div>

          {pushStatusMessage && (
            <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/25 text-amber-700 dark:text-amber-300 text-xs leading-relaxed flex items-start gap-2 animate-in fade-in">
              <Info className="w-4 h-4 shrink-0 mt-0.5 text-amber-500" />
              <span>{pushStatusMessage}</span>
            </div>
          )}

          {testResult && (
            <p className="text-xs text-center font-bold text-[#D5FF38] animate-in fade-in">
              {testResult}
            </p>
          )}
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}
