"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Bell,
  Flame,
  Rocket,
  GraduationCap,
  Bot,
  FileText,
  CheckCheck,
  SlidersHorizontal,
  Trash2,
  CheckCircle2,
} from "lucide-react";
import { useNotifications, NotificationItem } from "@/contexts/NotificationContext";
import NotificationPreferencesModal from "@/components/notifications/NotificationPreferencesModal";

export default function NotificationsPage() {
  const router = useRouter();
  const {
    notifications,
    unreadCount,
    filter,
    setFilter,
    filteredNotifications,
    markAllAsRead,
    markAsRead,
    deleteNotification,
  } = useNotifications();

  const [isPreferencesOpen, setIsPreferencesOpen] = useState(false);

  const handleNotificationClick = async (item: NotificationItem) => {
    await markAsRead(item.id);
    if (item.link) {
      router.push(item.link);
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-black text-slate-900 dark:text-white pb-28 md:pb-16 pt-2 sm:pt-4 max-w-4xl mx-auto px-4 sm:px-6">
      {/* ── Top Header Bar ── */}
      <div className="flex items-center justify-between gap-3 pb-5 border-b border-slate-200 dark:border-white/10">
        <div className="flex items-center gap-3">
          {/* Back Button */}
          <button
            type="button"
            onClick={() => {
              if (window.history.length > 1) {
                router.back();
              } else {
                router.push("/dashboard");
              }
            }}
            aria-label="Go back"
            className="w-10 h-10 rounded-[10px] bg-slate-100 dark:bg-[#18191E] border border-slate-200 dark:border-white/10 flex items-center justify-center text-slate-700 dark:text-white hover:bg-slate-200 dark:hover:bg-white/10 transition-all active:scale-95 cursor-pointer shadow-xs"
          >
            <ArrowLeft className="w-5 h-5 stroke-[2.2]" />
          </button>

          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 dark:text-white">
                Notifications
              </h1>
              {unreadCount > 0 ? (
                <span className="px-2.5 py-0.5 text-xs font-black bg-[#D5FF38] text-black rounded-full shadow-xs">
                  {unreadCount} unread
                </span>
              ) : (
                <span className="px-2.5 py-0.5 text-xs font-semibold bg-slate-100 dark:bg-[#18191E] text-slate-500 dark:text-neutral-400 border border-slate-200 dark:border-white/10 rounded-full">
                  Caught up
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 dark:text-neutral-400 mt-0.5">
              Updates on streaks, hackathons, scholarships, and progress
            </p>
          </div>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-2">
          {unreadCount > 0 && (
            <button
              type="button"
              onClick={markAllAsRead}
              className="flex items-center gap-1.5 px-3 py-2 rounded-[10px] text-xs font-bold bg-[#D5FF38] text-black hover:bg-[#c6f432] active:scale-95 transition-all shadow-xs cursor-pointer"
              title="Mark all notifications as read"
            >
              <CheckCheck className="w-4 h-4 stroke-[2.5]" />
              <span className="hidden sm:inline">Mark all read</span>
            </button>
          )}

          {/* Preferences Button */}
          <button
            type="button"
            onClick={() => setIsPreferencesOpen(true)}
            aria-label="Notification Preferences"
            title="Notification Preferences"
            className="w-10 h-10 rounded-[10px] bg-slate-100 dark:bg-[#18191E] border border-slate-200 dark:border-white/10 flex items-center justify-center text-slate-700 dark:text-white hover:bg-slate-200 dark:hover:bg-white/10 transition-all active:scale-95 cursor-pointer shadow-xs"
          >
            <SlidersHorizontal className="w-4 h-4 stroke-[2]" />
          </button>
        </div>
      </div>

      {/* ── Filter Tabs ── */}
      <div className="flex items-center gap-2 py-4">
        <button
          type="button"
          onClick={() => setFilter("all")}
          className={`px-3.5 py-1.5 rounded-[10px] text-xs font-bold transition-all cursor-pointer ${
            filter === "all"
              ? "bg-[#D5FF38] text-black shadow-xs"
              : "bg-slate-100 dark:bg-[#18191E] text-slate-600 dark:text-neutral-400 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-white/10"
          }`}
        >
          All ({notifications.length})
        </button>
        <button
          type="button"
          onClick={() => setFilter("unread")}
          className={`px-3.5 py-1.5 rounded-[10px] text-xs font-bold transition-all cursor-pointer ${
            filter === "unread"
              ? "bg-[#D5FF38] text-black shadow-xs"
              : "bg-slate-100 dark:bg-[#18191E] text-slate-600 dark:text-neutral-400 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-white/10"
          }`}
        >
          Unread ({unreadCount})
        </button>
      </div>

      {/* ── Notifications List ── */}
      <div className="space-y-3">
        {filteredNotifications.length === 0 ? (
          <div className="py-16 px-6 text-center flex flex-col items-center justify-center rounded-2xl bg-slate-50 dark:bg-[#121318] border border-slate-200 dark:border-white/10 my-4">
            <div className="w-14 h-14 rounded-2xl bg-slate-200 dark:bg-[#18191E] border border-slate-300 dark:border-white/10 flex items-center justify-center text-slate-500 dark:text-neutral-400 mb-3 shadow-xs">
              <Bell className="w-7 h-7" />
            </div>
            <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
              You&apos;re all caught up 🎉
            </h3>
            <p className="text-xs text-slate-500 dark:text-neutral-400 mt-1 max-w-sm leading-relaxed">
              {filter === "unread"
                ? "You have zero unread notifications. Check the 'All' tab to review previous updates."
                : "No notifications to display. Keep learning and completing daily practice to maintain your streak!"}
            </p>
          </div>
        ) : (
          filteredNotifications.map((notif) => {
            let Icon = Bell;
            let iconStyles = "bg-slate-200 text-slate-800 dark:bg-neutral-800 dark:text-neutral-200 border border-slate-300 dark:border-white/10";

            if (notif.type === "streak") {
              Icon = Flame;
              iconStyles = "bg-amber-500/10 text-amber-500 border border-amber-500/25";
            } else if (notif.type === "event") {
              Icon = Rocket;
              iconStyles = "bg-emerald-500/10 text-emerald-500 border border-emerald-500/25";
            } else if (notif.type === "scholarship") {
              Icon = GraduationCap;
              iconStyles = "bg-amber-500/10 text-amber-500 border border-amber-500/25";
            } else if (notif.type === "mentor") {
              Icon = Bot;
              iconStyles = "bg-[#D5FF38]/15 text-[#D5FF38] border border-[#D5FF38]/30";
            } else if (notif.type === "resume") {
              Icon = FileText;
              iconStyles = "bg-slate-200 text-slate-800 dark:bg-neutral-800 dark:text-neutral-200 border border-slate-300 dark:border-white/10";
            }

            return (
              <div
                key={notif.id}
                className={`group relative w-full p-4 rounded-2xl border transition-all flex items-start gap-3.5 ${
                  !notif.isRead
                    ? "bg-slate-50 dark:bg-[#121318] border-slate-300 dark:border-white/20 shadow-xs"
                    : "bg-white dark:bg-[#0E0F12] border-slate-200 dark:border-white/5 opacity-85 hover:opacity-100"
                }`}
              >
                {/* Clickable Area */}
                <button
                  type="button"
                  onClick={() => handleNotificationClick(notif)}
                  className="flex-1 flex items-start gap-3.5 text-left cursor-pointer min-w-0"
                >
                  <div
                    className={`w-10 h-10 rounded-xl shrink-0 flex items-center justify-center transition-transform group-hover:scale-105 shadow-2xs ${iconStyles}`}
                  >
                    <Icon className="w-5 h-5 stroke-[2]" />
                  </div>

                  <div className="flex-1 min-w-0 pr-2">
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <p
                        className={`text-sm tracking-tight truncate ${
                          !notif.isRead
                            ? "font-extrabold text-slate-900 dark:text-white"
                            : "font-semibold text-slate-700 dark:text-neutral-300"
                        }`}
                      >
                        {notif.title}
                      </p>
                      {!notif.isRead && (
                        <span className="w-2.5 h-2.5 rounded-full bg-[#D5FF38] shrink-0 shadow-xs" />
                      )}
                    </div>
                    <p className="text-xs text-slate-600 dark:text-neutral-400 leading-relaxed line-clamp-3">
                      {notif.description}
                    </p>
                    <p className="text-[11px] text-slate-400 dark:text-neutral-500 mt-2 font-medium">
                      {notif.time}
                    </p>
                  </div>
                </button>

                {/* Delete Button */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteNotification(notif.id);
                  }}
                  className="opacity-70 group-hover:opacity-100 p-2 rounded-[8px] hover:bg-slate-100 dark:hover:bg-[#18191E] text-slate-400 hover:text-red-500 transition-all cursor-pointer shrink-0"
                  title="Delete notification"
                  aria-label="Delete notification"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            );
          })
        )}
      </div>

      {/* Preferences Modal (Zero Purple, Zero Glass Back, Zero Blue) */}
      <NotificationPreferencesModal
        isOpen={isPreferencesOpen}
        onClose={() => setIsPreferencesOpen(false)}
      />
    </div>
  );
}
