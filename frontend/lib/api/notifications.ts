/**
 * frontend/lib/api/notifications.ts
 * Frontend API client methods for In-App Notifications, Push Subscriptions, and Preferences.
 */

import { API_BASE, apiFetch, getAuthHeaders } from "./client";

export interface ApiNotificationItem {
  id: string;
  user_id: string;
  type: "streak" | "event" | "scholarship" | "mentor" | "resume" | "general";
  title: string;
  body: string;
  url?: string | null;
  metadata?: Record<string, any>;
  is_read: boolean;
  sent_at?: string | null;
  created_at: string;
}

export interface NotificationListResponse {
  total: number;
  unread_count: number;
  notifications: ApiNotificationItem[];
}

export interface NotificationPreferences {
  streak_enabled: boolean;
  events_enabled: boolean;
  scholarships_enabled: boolean;
}

export async function getVapidPublicKey(): Promise<string> {
  // First check client environment variable
  const envKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
  if (envKey && envKey.trim()) {
    return envKey.trim();
  }

  // Fallback: fetch from FastAPI backend
  try {
    const res = await apiFetch(`${API_BASE}/api/notifications/vapid-public-key`);
    if (res.ok) {
      const data = await res.json();
      if (data.vapid_public_key) {
        return data.vapid_public_key;
      }
    }
  } catch (err) {
    console.warn("Could not fetch VAPID public key from backend:", err);
  }
  return "";
}

export async function fetchNotifications(
  limit: number = 30,
  offset: number = 0,
  unreadOnly: boolean = false
): Promise<NotificationListResponse> {
  const authHeaders = await getAuthHeaders();
  if (!authHeaders.Authorization) {
    return { total: 0, unread_count: 0, notifications: [] };
  }

  const query = new URLSearchParams({
    limit: limit.toString(),
    offset: offset.toString(),
    unread_only: unreadOnly ? "true" : "false",
  });

  const res = await apiFetch(`${API_BASE}/api/notifications?${query.toString()}`, {
    headers: { ...authHeaders },
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error(`Failed to fetch notifications: HTTP ${res.status}`);
  }

  return await res.json();
}

export async function markNotificationAsRead(notificationId: string): Promise<boolean> {
  const authHeaders = await getAuthHeaders();
  if (!authHeaders.Authorization) return false;

  const res = await apiFetch(`${API_BASE}/api/notifications/${notificationId}/read`, {
    method: "PATCH",
    headers: { ...authHeaders },
  });

  return res.ok;
}

export async function markAllNotificationsAsRead(): Promise<number> {
  const authHeaders = await getAuthHeaders();
  if (!authHeaders.Authorization) return 0;

  const res = await apiFetch(`${API_BASE}/api/notifications/read-all`, {
    method: "PATCH",
    headers: { ...authHeaders },
  });

  if (res.ok) {
    const data = await res.json();
    return data.count || 0;
  }
  return 0;
}

export async function deleteNotification(notificationId: string): Promise<boolean> {
  const authHeaders = await getAuthHeaders();
  if (!authHeaders.Authorization) return false;

  const res = await apiFetch(`${API_BASE}/api/notifications/${notificationId}`, {
    method: "DELETE",
    headers: { ...authHeaders },
  });

  return res.ok;
}

export async function fetchNotificationPreferences(): Promise<NotificationPreferences> {
  const authHeaders = await getAuthHeaders();
  const defaultPrefs: NotificationPreferences = {
    streak_enabled: true,
    events_enabled: true,
    scholarships_enabled: true,
  };

  if (!authHeaders.Authorization) return defaultPrefs;

  try {
    const res = await apiFetch(`${API_BASE}/api/notifications/preferences`, {
      headers: { ...authHeaders },
      cache: "no-store",
    });

    if (res.ok) {
      return await res.json();
    }
  } catch (err) {
    console.warn("Could not fetch notification preferences:", err);
  }
  return defaultPrefs;
}

export async function updateNotificationPreferences(
  prefs: Partial<NotificationPreferences>
): Promise<NotificationPreferences> {
  const authHeaders = await getAuthHeaders();
  if (!authHeaders.Authorization) {
    throw new Error("Must be logged in to update preferences");
  }

  const res = await apiFetch(`${API_BASE}/api/notifications/preferences`, {
    method: "PATCH",
    headers: {
      ...authHeaders,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(prefs),
  });

  if (!res.ok) {
    throw new Error(`Failed to update preferences: HTTP ${res.status}`);
  }

  return await res.json();
}

export async function savePushSubscriptionToServer(subscriptionData: {
  endpoint: string;
  keys: { p256dh: string; auth: string };
  user_agent?: string;
}): Promise<boolean> {
  const authHeaders = await getAuthHeaders();
  if (!authHeaders.Authorization) return false;

  const res = await apiFetch(`${API_BASE}/api/notifications/subscribe`, {
    method: "POST",
    headers: {
      ...authHeaders,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(subscriptionData),
  });

  return res.ok;
}

export async function removePushSubscriptionFromServer(endpoint: string): Promise<boolean> {
  const authHeaders = await getAuthHeaders();
  if (!authHeaders.Authorization) return false;

  const res = await apiFetch(`${API_BASE}/api/notifications/subscribe`, {
    method: "DELETE",
    headers: {
      ...authHeaders,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ endpoint }),
  });

  return res.ok;
}

export async function sendTestPushNotification(): Promise<boolean> {
  const authHeaders = await getAuthHeaders();
  if (!authHeaders.Authorization) return false;

  const res = await apiFetch(`${API_BASE}/api/notifications/test-push`, {
    method: "POST",
    headers: { ...authHeaders },
  });

  return res.ok;
}
