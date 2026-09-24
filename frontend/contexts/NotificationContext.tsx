"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useMemo,
  useCallback,
} from "react";
import { supabase } from "@/lib/supabase";
import {
  fetchNotifications,
  markNotificationAsRead as apiMarkRead,
  markAllNotificationsAsRead as apiMarkAllRead,
  deleteNotification as apiDeleteNotification,
  fetchNotificationPreferences,
  updateNotificationPreferences as apiUpdatePreferences,
  savePushSubscriptionToServer,
  removePushSubscriptionFromServer,
  getVapidPublicKey,
  NotificationPreferences,
  ApiNotificationItem,
} from "@/lib/api/notifications";
import {
  isPushSupported,
  subscribeToPush,
  unsubscribeFromPush,
  getExistingPushSubscription,
  registerServiceWorker,
} from "@/lib/pushNotifications";

export interface NotificationItem {
  id: string;
  title: string;
  description: string;
  time: string;
  isRead: boolean;
  type: "streak" | "event" | "scholarship" | "mentor" | "resume" | "general";
  link?: string;
  createdAt?: number;
  metadata?: Record<string, any>;
}

interface NotificationContextType {
  notifications: NotificationItem[];
  unreadCount: number;
  isLoading: boolean;
  filter: "all" | "unread";
  setFilter: (f: "all" | "unread") => void;
  filteredNotifications: NotificationItem[];
  markAllAsRead: () => Promise<void>;
  markAsRead: (id: string) => Promise<void>;
  deleteNotification: (id: string) => Promise<void>;
  refreshNotifications: () => Promise<void>;
  clearAll: () => Promise<void>;

  // Push notification state & controls
  isPushSupported: boolean;
  isPushSubscribed: boolean;
  pushPermission: NotificationPermission | "unsupported";
  requestPushPermission: () => Promise<boolean>;
  unsubscribePush: () => Promise<boolean>;

  // User preferences
  preferences: NotificationPreferences;
  updatePreferences: (prefs: Partial<NotificationPreferences>) => Promise<void>;
}

function formatRelativeTime(isoString?: string | null): string {
  if (!isoString) return "Just now";
  try {
    const timestamp = new Date(isoString).getTime();
    if (isNaN(timestamp)) return "Just now";
    const diffMs = Date.now() - timestamp;
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHours = Math.floor(diffMin / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMin < 1) return "Just now";
    if (diffMin < 60) return `${diffMin}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays}d ago`;
    return new Date(isoString).toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
    });
  } catch {
    return "Just now";
  }
}

function mapApiToItem(apiItem: ApiNotificationItem): NotificationItem {
  return {
    id: apiItem.id,
    title: apiItem.title,
    description: apiItem.body,
    time: formatRelativeTime(apiItem.created_at || apiItem.sent_at),
    isRead: apiItem.is_read,
    type: (apiItem.type as any) || "general",
    link: apiItem.url || undefined,
    createdAt: apiItem.created_at ? new Date(apiItem.created_at).getTime() : Date.now(),
    metadata: apiItem.metadata,
  };
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [filter, setFilter] = useState<"all" | "unread">("all");
  const [userId, setUserId] = useState<string | null>(null);

  // Push notification state
  const [pushSupported, setPushSupported] = useState<boolean>(false);
  const [isPushSubscribed, setIsPushSubscribed] = useState<boolean>(false);
  const [pushPermission, setPushPermission] = useState<NotificationPermission | "unsupported">("default");

  // User preferences
  const [preferences, setPreferences] = useState<NotificationPreferences>({
    streak_enabled: true,
    events_enabled: true,
    scholarships_enabled: true,
  });

  // Check push support and existing subscription on mount
  useEffect(() => {
    if (typeof window === "undefined") return;

    const supported = isPushSupported();
    setPushSupported(supported);

    if (!supported) {
      setPushPermission("unsupported");
      return;
    }

    setPushPermission(Notification.permission);

    // Register service worker in background
    registerServiceWorker().catch(() => {});

    // Check if browser already has an active push subscription
    getExistingPushSubscription()
      .then((sub) => {
        setIsPushSubscribed(Boolean(sub));
      })
      .catch(() => {});
  }, []);

  // Fetch notifications from FastAPI backend
  const loadUserData = useCallback(async () => {
    try {
      setIsLoading(true);
      const [notifsData, prefsData] = await Promise.allSettled([
        fetchNotifications(40, 0, false),
        fetchNotificationPreferences(),
      ]);

      if (notifsData.status === "fulfilled" && notifsData.value.notifications) {
        setNotifications(notifsData.value.notifications.map(mapApiToItem));
      }

      if (prefsData.status === "fulfilled" && prefsData.value) {
        setPreferences(prefsData.value);
      }
    } catch (err) {
      console.warn("Could not load notifications from server:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Monitor Supabase auth state
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setUserId(session.user.id);
        loadUserData();
      } else {
        setUserId(null);
        setNotifications([]);
        setIsLoading(false);
      }
    });

    const { data: authListener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        if (session?.user) {
          setUserId(session.user.id);
          loadUserData();
        } else {
          setUserId(null);
          setNotifications([]);
        }
      }
    );

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [loadUserData]);

  // Periodic background refresh if user is active
  useEffect(() => {
    if (!userId) return;
    const interval = setInterval(() => {
      loadUserData();
    }, 60000); // 60 seconds

    return () => clearInterval(interval);
  }, [userId, loadUserData]);

  const markAllAsRead = useCallback(async () => {
    // Optimistic UI update
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    try {
      await apiMarkAllRead();
    } catch (e) {
      console.error("Failed to mark all notifications as read:", e);
    }
  }, []);

  const markAsRead = useCallback(async (id: string) => {
    // Optimistic UI update
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
    );
    try {
      await apiMarkRead(id);
    } catch (e) {
      console.error(`Failed to mark notification ${id} as read:`, e);
    }
  }, []);

  const deleteItem = useCallback(async (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
    try {
      await apiDeleteNotification(id);
    } catch (e) {
      console.error(`Failed to delete notification ${id}:`, e);
    }
  }, []);

  const clearAll = useCallback(async () => {
    await markAllAsRead();
  }, [markAllAsRead]);

  const requestPushPermission = useCallback(async (): Promise<boolean> => {
    if (!isPushSupported()) {
      return false;
    }

    try {
      const vapidKey = await getVapidPublicKey();
      if (!vapidKey) {
        console.error("VAPID public key not available.");
        return false;
      }

      const subscription = await subscribeToPush(vapidKey);
      if (!subscription) {
        return false;
      }

      // Persist subscription in backend push_subscriptions table
      const saved = await savePushSubscriptionToServer(subscription);
      if (saved) {
        setIsPushSubscribed(true);
        setPushPermission(Notification.permission);
        return true;
      }
    } catch (err) {
      console.warn("Notice requesting push notification permission:", err);
      setPushPermission(Notification.permission);
    }
    return false;
  }, []);

  const unsubscribePushHandler = useCallback(async (): Promise<boolean> => {
    try {
      const endpoint = await unsubscribeFromPush();
      if (endpoint) {
        await removePushSubscriptionFromServer(endpoint);
      }
      setIsPushSubscribed(false);
      return true;
    } catch (err) {
      console.error("Error unsubscribing push:", err);
      return false;
    }
  }, []);

  const updatePreferencesHandler = useCallback(
    async (newPrefs: Partial<NotificationPreferences>) => {
      // Optimistic update
      setPreferences((prev) => ({ ...prev, ...newPrefs }));
      try {
        const updated = await apiUpdatePreferences(newPrefs);
        setPreferences(updated);
      } catch (err) {
        console.error("Failed to update notification preferences:", err);
        // Rollback to fresh server state
        fetchNotificationPreferences().then(setPreferences).catch(() => {});
      }
    },
    []
  );

  const unreadCount = useMemo(() => {
    return notifications.filter((n) => !n.isRead).length;
  }, [notifications]);

  const filteredNotifications = useMemo(() => {
    if (filter === "unread") {
      return notifications.filter((n) => !n.isRead);
    }
    return notifications;
  }, [notifications, filter]);

  const value = useMemo(
    () => ({
      notifications,
      unreadCount,
      isLoading,
      filter,
      setFilter,
      filteredNotifications,
      markAllAsRead,
      markAsRead,
      deleteNotification: deleteItem,
      refreshNotifications: loadUserData,
      clearAll,
      isPushSupported: pushSupported,
      isPushSubscribed,
      pushPermission,
      requestPushPermission,
      unsubscribePush: unsubscribePushHandler,
      preferences,
      updatePreferences: updatePreferencesHandler,
    }),
    [
      notifications,
      unreadCount,
      isLoading,
      filter,
      filteredNotifications,
      markAllAsRead,
      markAsRead,
      deleteItem,
      loadUserData,
      clearAll,
      pushSupported,
      isPushSubscribed,
      pushPermission,
      requestPushPermission,
      unsubscribePushHandler,
      preferences,
      updatePreferencesHandler,
    ]
  );

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error("useNotifications must be used within a NotificationProvider");
  }
  return context;
}
