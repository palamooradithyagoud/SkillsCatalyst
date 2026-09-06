import { supabase } from "@/lib/supabase";

export function getApiBaseUrl(): string {
  let url = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000").trim().replace(/\/+$/, "");
  if (!url.startsWith("http://") && !url.startsWith("https://")) {
    url = `https://${url}`;
  }
  return url;
}

export const API_BASE = getApiBaseUrl();

export function getGuestSessionId(): string {
  if (typeof window === "undefined") return "guest_session_default";
  try {
    let sid = localStorage.getItem("skillscatalyst_guest_session_id");
    if (!sid || sid === "undefined" || sid === "null") {
      sid = "guest_" + Math.random().toString(36).substring(2, 11) + "_" + Date.now();
      localStorage.setItem("skillscatalyst_guest_session_id", sid);
    }
    return sid;
  } catch {
    return "guest_session_default";
  }
}

/**
 * Extracts raw underlying guest ID without signature for direct Supabase DB queries
 * (e.g., 'guest_abc123' from 'guest_abc123.signature').
 */
export function getRawGuestSessionId(): string {
  const sid = getGuestSessionId();
  if (sid && sid.startsWith("guest_") && sid.includes(".")) {
    return sid.split(".")[0];
  }
  return sid;
}

/**
 * Stores HMAC-signed guest session token issued by FastAPI backend.
 * Never generates a fresh client ID once a signed token exists.
 */
export function storeGuestSessionToken(token: string | null | undefined): void {
  if (typeof window === "undefined" || !token) return;
  const cleaned = token.trim();
  if (cleaned && cleaned !== "undefined" && cleaned !== "null" && cleaned !== "guest_session_default") {
    try {
      localStorage.setItem("skillscatalyst_guest_session_id", cleaned);
    } catch {}
  }
}

/**
 * Inspects response headers for 'X-Guest-Session-Token' and updates local storage if present.
 */
export function handleGuestTokenFromResponse(res: Response | XMLHttpRequest | null | undefined): void {
  if (typeof window === "undefined" || !res) return;
  try {
    let token: string | null = null;
    if ("headers" in res && res.headers && typeof res.headers.get === "function") {
      token = res.headers.get("X-Guest-Session-Token") || res.headers.get("x-guest-session-token");
    } else if ("getResponseHeader" in res && typeof (res as XMLHttpRequest).getResponseHeader === "function") {
      token = (res as XMLHttpRequest).getResponseHeader("X-Guest-Session-Token") || (res as XMLHttpRequest).getResponseHeader("x-guest-session-token");
    }
    if (token) {
      storeGuestSessionToken(token);
    }
  } catch {}
}

/**
 * Centralized fetch wrapper for FastAPI backend API calls.
 * Automatically captures X-Guest-Session-Token and handles 401 unauthenticated cleanup.
 */
export async function apiFetch(input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
  const res = await fetch(input, init);
  handleGuestTokenFromResponse(res);
  handleUnauthenticated(res);
  return res;
}

export async function getAuthHeaders(): Promise<Record<string, string>> {
  const headers: Record<string, string> = {
    "x-session-id": getGuestSessionId(),
  };
  try {
    const { data } = await supabase.auth.getSession();
    let session = data.session;

    // Auto-refresh token if expired or expiring within 30 seconds
    if (session && session.expires_at) {
      const isExpiringSoon = Date.now() / 1000 >= session.expires_at - 30;
      if (isExpiringSoon) {
        const { data: refreshed, error: refreshErr } = await supabase.auth.refreshSession();
        if (!refreshErr && refreshed.session) {
          session = refreshed.session;
        } else {
          session = null;
          await supabase.auth.signOut().catch(() => {});
        }
      }
    }

    const token = session?.access_token;
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }
  } catch {}
  return headers;
}

function handleUnauthenticated(res: Response) {
  if ((res.status === 401 || res.status === 403) && typeof window !== "undefined") {
    try {
      localStorage.removeItem("skillscatalyst_user_session");
      for (let i = localStorage.length - 1; i >= 0; i--) {
        const key = localStorage.key(i);
        if (key && (key.startsWith("skillscatalyst_") || key.startsWith("sc_") || key.startsWith("sb-"))) {
          localStorage.removeItem(key);
        }
      }
      supabase.auth.signOut().catch(() => {});
    } catch {}
  }
}
