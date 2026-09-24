"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Bell,
  CheckCheck,
  Trophy,
  Bot,
  FileText,
  Flame,
  X,
  GraduationCap,
  Rocket,
  SlidersHorizontal,
  Trash2,
} from "lucide-react";
import { useNotifications, NotificationItem } from "@/contexts/NotificationContext";
import NotificationPreferencesModal from "./NotificationPreferencesModal";

interface NotificationPanelProps {
  isOpen: boolean;
  onClose: () => void;
  align?: "right" | "mobile";
}

export default function NotificationPanel({
  isOpen,
  onClose,
  align = "right",
}: NotificationPanelProps) {
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

  if (!isOpen && !isPreferencesOpen) return null;

  const handleNotificationClick = (item: NotificationItem) => {
    markAsRead(item.id);
    onClose();
    if (item.link) {
      router.push(item.link);
    }
  };

  const containerClasses =
    align === "mobile"
      ? "fixed top-14 left-3 right-3 sm:left-auto sm:right-4 sm:w-92 max-w-[calc(100vw-1.5rem)] bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl shadow-2xl shadow-slate-900/15 z-50 overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-150"
      : "absolute right-0 top-[46px] w-80 sm:w-92 bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl shadow-xl shadow-slate-900/10 z-50 overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-100";

  return (
    <>
      {/* Backdrop for outside clicks */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/10 dark:bg-black/30 backdrop-blur-xs"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {isOpen && (
        <div
          className={containerClasses}
          role="dialog"
          aria-modal="true"
          aria-label="Notifications panel"
        >
          {/* Header */}
          <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-sm font-extrabold text-slate-900 dark:text-white">
                Notifications
              </span>
              {unreadCount > 0 ? (
                <span className="px-2 py-0.5 text-[10px] font-bold bg-[#5227FF]/10 text-[#5227FF] dark:bg-[#5227FF]/25 dark:text-purple-300 rounded-full">
                  {unreadCount} new
                </span>
              ) : (
                <span className="px-2 py-0.5 text-[10px] font-medium bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400 rounded-full">
                  Caught up
                </span>
              )}
            </div>

            <div className="flex items-center gap-1.5">
              {unreadCount > 0 && (
                <button
                  type="button"
                  onClick={markAllAsRead}
                  className="flex items-center gap-1 text-[11px] font-semibold text-[#5227FF] hover:text-[#431ce0] dark:text-purple-400 transition-colors cursor-pointer mr-1"
                  title="Mark all notifications as read"
                >
                  <CheckCheck className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Mark all read</span>
                </button>
              )}
              <button
                type="button"
                onClick={() => setIsPreferencesOpen(true)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                title="Notification preferences"
                aria-label="Notification preferences"
              >
                <SlidersHorizontal className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={onClose}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                aria-label="Close notifications"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Filter Tabs (only shown when notifications exist) */}
          {notifications.length > 0 && (
            <div className="px-3 pt-2 pb-1.5 flex items-center gap-1 bg-slate-50/70 dark:bg-slate-950/40 border-b border-slate-100 dark:border-slate-800/80">
              <button
                type="button"
                onClick={() => setFilter("all")}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  filter === "all"
                    ? "bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-2xs"
                    : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-300"
                }`}
              >
                All ({notifications.length})
              </button>
              <button
                type="button"
                onClick={() => setFilter("unread")}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  filter === "unread"
                    ? "bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-2xs"
                    : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-300"
                }`}
              >
                Unread ({unreadCount})
              </button>
            </div>
          )}

          {/* Notifications List */}
          <div className="max-h-84 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800/60">
            {filteredNotifications.length === 0 ? (
              <div className="py-10 px-6 text-center flex flex-col items-center justify-center">
                <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 mb-2.5">
                  <Bell className="w-5 h-5 text-slate-400" />
                </div>
                <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  You&apos;re all caught up 🎉
                </p>
                <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1 max-w-[220px] leading-relaxed">
                  No notifications to display. Stay active to maintain your learning streak!
                </p>
              </div>
            ) : (
              filteredNotifications.map((notif) => {
                let Icon = Bell;
                let iconColors = "bg-[#5227FF]/10 text-[#5227FF] dark:bg-[#5227FF]/20 dark:text-purple-400";

                if (notif.type === "streak") {
                  Icon = Flame;
                  iconColors = "bg-amber-500/10 text-amber-600 dark:bg-amber-500/20 dark:text-amber-400";
                } else if (notif.type === "event") {
                  Icon = Rocket;
                  iconColors = "bg-indigo-500/10 text-indigo-600 dark:bg-indigo-500/20 dark:text-indigo-400";
                } else if (notif.type === "scholarship") {
                  Icon = GraduationCap;
                  iconColors = "bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400";
                } else if (notif.type === "mentor") {
                  Icon = Bot;
                  iconColors = "bg-sky-500/10 text-sky-600 dark:bg-sky-500/20 dark:text-sky-400";
                } else if (notif.type === "resume") {
                  Icon = FileText;
                  iconColors = "bg-purple-500/10 text-purple-600 dark:bg-purple-500/20 dark:text-purple-400";
                }

                return (
                  <div
                    key={notif.id}
                    className={`group relative w-full p-3 flex items-start gap-3 transition-colors ${
                      !notif.isRead
                        ? "bg-[#5227FF]/[0.03] dark:bg-[#5227FF]/[0.06] hover:bg-slate-100/80 dark:hover:bg-slate-800/60"
                        : "hover:bg-slate-50 dark:hover:bg-slate-800/40"
                    }`}
                  >
                    <button
                      type="button"
                      onClick={() => handleNotificationClick(notif)}
                      className="flex-1 flex items-start gap-3 text-left cursor-pointer min-w-0"
                    >
                      <div
                        className={`w-8 h-8 rounded-xl shrink-0 flex items-center justify-center transition-transform group-hover:scale-105 ${iconColors}`}
                      >
                        <Icon className="w-4 h-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-1 mb-0.5">
                          <p
                            className={`text-xs truncate ${
                              !notif.isRead
                                ? "font-bold text-slate-900 dark:text-white"
                                : "font-medium text-slate-700 dark:text-slate-300"
                            }`}
                          >
                            {notif.title}
                          </p>
                          {!notif.isRead && (
                            <span className="w-2 h-2 rounded-full bg-[#5227FF] shrink-0" />
                          )}
                        </div>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                          {notif.description}
                        </p>
                        <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-1 font-medium">
                          {notif.time}
                        </p>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteNotification(notif.id);
                      }}
                      className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-400 hover:text-red-500 transition-opacity cursor-pointer shrink-0"
                      title="Delete notification"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                );
              })
            )}
          </div>

          {/* Footer */}
          <div className="p-2 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/30 flex items-center justify-between text-[11px]">
            <span className="text-slate-400 px-2 font-medium">SkillsCatalyst Alerts</span>
            <button
              type="button"
              onClick={() => setIsPreferencesOpen(true)}
              className="text-[#5227FF] hover:text-[#431ce0] dark:text-purple-400 font-semibold px-2 py-1 rounded transition-colors cursor-pointer flex items-center gap-1"
            >
              <SlidersHorizontal className="w-3 h-3" />
              <span>Preferences</span>
            </button>
          </div>
        </div>
      )}

      {/* Preferences Modal */}
      <NotificationPreferencesModal
        isOpen={isPreferencesOpen}
        onClose={() => setIsPreferencesOpen(false)}
      />
    </>
  );
}
