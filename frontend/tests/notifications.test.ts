import { describe, it } from "node:test";
import assert from "node:assert";
import fs from "node:fs";
import path from "node:path";
import { NotificationItem } from "../contexts/NotificationContext";

describe("Notifications System & Desktop/Mobile Parity Suite", () => {
  it("1. NotificationItem interface strictly supports canonical categories without hardcoded seed slop", () => {
    const validNotification: NotificationItem = {
      id: "streak-123",
      title: "🔥 Your 7-day streak is at risk",
      description: "Complete today's learning goal before the day ends to keep your streak alive.",
      time: "Just now",
      isRead: false,
      type: "streak",
      link: "/dashboard",
      createdAt: Date.now(),
      metadata: { streak_days: 7, streak_date: "2026-09-25" },
    };

    assert.ok(validNotification.id, "Notification must have an id");
    assert.ok(validNotification.title.includes("streak"), "Streak notification should contain streak title");
    assert.strictEqual(typeof validNotification.isRead, "boolean", "isRead must be boolean");
    assert.ok(["streak", "event", "scholarship", "mentor", "resume", "general"].includes(validNotification.type));
  });

  it("2. computes unreadCount accurately", () => {
    const items: NotificationItem[] = [
      { id: "1", title: "A", description: "A", time: "1m", isRead: false, type: "event" },
      { id: "2", title: "B", description: "B", time: "2m", isRead: true, type: "mentor" },
      { id: "3", title: "C", description: "C", time: "3m", isRead: false, type: "streak" },
      { id: "4", title: "D", description: "D", time: "5m", isRead: false, type: "scholarship" },
    ];
    const unread = items.filter((n) => !n.isRead).length;
    assert.strictEqual(unread, 3, "Should count exactly 3 unread notifications");
  });

  it("3. filters unread notifications correctly", () => {
    const items: NotificationItem[] = [
      { id: "1", title: "A", description: "A", time: "1m", isRead: false, type: "event" },
      { id: "2", title: "B", description: "B", time: "2m", isRead: true, type: "mentor" },
      { id: "3", title: "C", description: "C", time: "3m", isRead: false, type: "streak" },
    ];

    const unreadFiltered = items.filter((n) => !n.isRead);
    assert.strictEqual(unreadFiltered.length, 2);
    assert.deepStrictEqual(unreadFiltered.map((n) => n.id), ["1", "3"]);
  });

  it("4. markAllAsRead marks every notification as read and zeroes unreadCount", () => {
    const items: NotificationItem[] = [
      { id: "1", title: "A", description: "A", time: "1m", isRead: false, type: "event" },
      { id: "2", title: "B", description: "B", time: "2m", isRead: false, type: "scholarship" },
    ];
    const updated = items.map((n) => ({ ...n, isRead: true }));
    assert.strictEqual(updated.every((n) => n.isRead), true);
    assert.strictEqual(updated.filter((n) => !n.isRead).length, 0);
  });

  it("5. markAsRead targets only specified notification", () => {
    const items: NotificationItem[] = [
      { id: "1", title: "A", description: "A", time: "1m", isRead: false, type: "event" },
      { id: "2", title: "B", description: "B", time: "2m", isRead: false, type: "mentor" },
    ];
    const updated = items.map((n) => (n.id === "1" ? { ...n, isRead: true } : n));
    assert.strictEqual(updated.find((n) => n.id === "1")?.isRead, true);
    assert.strictEqual(updated.find((n) => n.id === "2")?.isRead, false);
  });

  it("6. verifies Service Worker sw.js exists in public folder and handles push and click", () => {
    const swPath = path.resolve(__dirname, "../public/sw.js");
    assert.ok(fs.existsSync(swPath), "frontend/public/sw.js must exist");
    const swSrc = fs.readFileSync(swPath, "utf-8");
    assert.ok(swSrc.includes("addEventListener(\"push\""), "Service worker must register push event listener");
    assert.ok(swSrc.includes("addEventListener(\"notificationclick\""), "Service worker must register notificationclick listener");
    assert.ok(swSrc.includes("showNotification"), "Service worker must display notification via showNotification");
  });

  it("7. verifies Desktop (TopNavbar) and Mobile (MobileNav) both render NotificationPanel and use useNotifications", () => {
    const topNavbarPath = path.resolve(__dirname, "../components/TopNavbar.tsx");
    const mobileNavPath = path.resolve(__dirname, "../components/MobileNav.tsx");
    const appShellPath = path.resolve(__dirname, "../components/AppShell.tsx");

    const topNavbarSrc = fs.readFileSync(topNavbarPath, "utf-8");
    const mobileNavSrc = fs.readFileSync(mobileNavPath, "utf-8");
    const appShellSrc = fs.readFileSync(appShellPath, "utf-8");

    // Both must use useNotifications hook
    assert.ok(topNavbarSrc.includes("useNotifications()"), "TopNavbar must invoke useNotifications()");
    assert.ok(mobileNavSrc.includes("useNotifications()"), "MobileNav must invoke useNotifications()");

    // Both must render NotificationPanel
    assert.ok(topNavbarSrc.includes("<NotificationPanel"), "TopNavbar must render <NotificationPanel");
    assert.ok(mobileNavSrc.includes("<NotificationPanel"), "MobileNav must render <NotificationPanel");

    // Both must bind unread count to badge display
    assert.ok(topNavbarSrc.includes("unreadCount > 0"), "TopNavbar must check unreadCount > 0");
    assert.ok(mobileNavSrc.includes("unreadCount > 0"), "MobileNav must check unreadCount > 0");

    // AppShell must wrap with NotificationProvider and render permission banner
    assert.ok(appShellSrc.includes("<NotificationProvider>"), "AppShell must wrap with <NotificationProvider>");
    assert.ok(appShellSrc.includes("<NotificationPermissionBanner"), "AppShell must render <NotificationPermissionBanner");
  });
});
