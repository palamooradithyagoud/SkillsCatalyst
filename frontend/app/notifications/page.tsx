"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Bell,
  Flame,
  Rocket,
  GraduationCap,
  Bot,
  FileText,
  CheckCheck,
  SlidersHorizontal,
  Trash2,
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
    <div className="min-h-screen bg-black text-white pb-28 md:pb-16 pt-1 sm:pt-2 max-w-4xl mx-auto px-3 sm:px-6">
      {/* ── Filter Row: Tabs on Left + Filter Button on Right (No Image 2 clutter) ── */}
      <div className="flex items-center justify-between gap-2 py-3 border-b border-white/10">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setFilter("all")}
            className={`px-3 py-1.5 rounded-[10px] text-xs font-bold transition-all cursor-pointer ${
              filter === "all"
                ? "bg-[#D5FF38] text-black shadow-xs"
                : "bg-[#18191E] text-neutral-400 hover:text-white border border-white/10"
            }`}
          >
            All ({notifications.length})
          </button>
          <button
            type="button"
            onClick={() => setFilter("unread")}
            className={`px-3 py-1.5 rounded-[10px] text-xs font-bold transition-all cursor-pointer ${
              filter === "unread"
                ? "bg-[#D5FF38] text-black shadow-xs"
                : "bg-[#18191E] text-neutral-400 hover:text-white border border-white/10"
            }`}
          >
            Unread ({unreadCount})
          </button>
          {unreadCount > 0 && (
            <button
              type="button"
              onClick={markAllAsRead}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-[10px] text-xs font-bold text-[#D5FF38] hover:bg-[#18191E] transition-all cursor-pointer ml-1"
              title="Mark all notifications as read"
            >
              <CheckCheck className="w-3.5 h-3.5 stroke-[2.5]" />
              <span className="text-[11px] hidden sm:inline">Mark all read</span>
            </button>
          )}
        </div>

        {/* Filter / Preferences Button (Kept as requested) */}
        <button
          type="button"
          onClick={() => setIsPreferencesOpen(true)}
          aria-label="Notification Preferences"
          title="Notification Preferences"
          className="w-9 h-9 rounded-[10px] bg-[#18191E] border border-white/10 flex items-center justify-center text-white hover:bg-[#20222A] transition-all active:scale-95 cursor-pointer shadow-xs"
        >
          <SlidersHorizontal className="w-4 h-4 stroke-[2]" />
        </button>
      </div>

      {/* ── Notifications List ── */}
      <div className="space-y-3 pt-4">
        {filteredNotifications.length === 0 ? (
          /* Empty State: Zero card container, Zero emoji */
          <div className="py-20 text-center flex flex-col items-center justify-center">
            <Bell className="w-8 h-8 text-neutral-600 mb-3 stroke-[1.5]" />
            <h3 className="text-sm font-bold text-neutral-300">
              You&apos;re all caught up
            </h3>
            <p className="text-xs text-neutral-500 mt-1 max-w-xs leading-relaxed">
              {filter === "unread"
                ? "You have zero unread notifications."
                : "No notifications to display. Keep learning and completing daily practice to maintain your streak!"}
            </p>
          </div>
        ) : (
          filteredNotifications.map((notif) => {
            let Icon = Bell;
            let iconStyles = "bg-neutral-800 text-neutral-200 border border-white/10";

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
              iconStyles = "bg-neutral-800 text-neutral-200 border border-white/10";
            }

            return (
              <div
                key={notif.id}
                className={`group relative w-full p-4 rounded-2xl border transition-all flex items-start gap-3.5 ${
                  !notif.isRead
                    ? "bg-[#121318] border-white/20 shadow-xs"
                    : "bg-[#0E0F12] border-white/5 opacity-85 hover:opacity-100"
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
                            ? "font-extrabold text-white"
                            : "font-semibold text-neutral-300"
                        }`}
                      >
                        {notif.title}
                      </p>
                      {!notif.isRead && (
                        <span className="w-2.5 h-2.5 rounded-full bg-[#D5FF38] shrink-0 shadow-xs" />
                      )}
                    </div>
                    <p className="text-xs text-neutral-400 leading-relaxed line-clamp-3">
                      {notif.description}
                    </p>
                    <p className="text-[11px] text-neutral-500 mt-2 font-medium">
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
                  className="opacity-70 group-hover:opacity-100 p-2 rounded-[8px] hover:bg-[#18191E] text-neutral-400 hover:text-red-500 transition-all cursor-pointer shrink-0"
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

      {/* Preferences Modal (Zero Purple, Zero Glass Back, Zero Blue, Pure Black) */}
      <NotificationPreferencesModal
        isOpen={isPreferencesOpen}
        onClose={() => setIsPreferencesOpen(false)}
      />
    </div>
  );
}
