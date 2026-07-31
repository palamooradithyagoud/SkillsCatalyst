"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { useRouter, usePathname } from "next/navigation";
import { supabase } from "@/lib/supabase";

const SESSION_KEY = "skillscatalyst_user_session";

interface UserSession {
  email?: string;
  user_id: string;
  name?: string;
  loggedInAt: string;
}

interface AuthContextValue {
  session: UserSession | null;
  isLoading: boolean;
  login: (email: string, userId?: string, name?: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue>({
  session: null,
  isLoading: true,
  login: () => {},
  logout: () => {},
});

// Helper function to automatically store/upsert new users into user_academic_profile & user_progress
async function syncUserToSupabase(userId: string, email: string, name?: string) {
  try {
    const fullName = name || email.split("@")[0] || "Learner";

    // 1. Upsert academic profile with user_id, full_name, and updated_at
    await supabase.from("user_academic_profile").upsert(
      {
        user_id: userId,
        full_name: fullName,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "user_id" }
    );

    // 2. Ensure initial row in user_progress
    await supabase.from("user_progress").upsert(
      {
        user_id: userId,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "user_id" }
    );

    // 3. Ensure coding profile row exists
    await supabase.from("user_coding_profiles").upsert(
      {
        user_id: userId,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "user_id" }
    );
  } catch (err) {
    console.warn("Failed to sync user to Supabase tables:", err);
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<UserSession | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  // Helper to construct and store user session locally and in database
  const setAndStoreSession = useCallback(
    async (email: string, userId: string, name?: string) => {
      const newSession: UserSession = {
        email,
        user_id: userId,
        name: name || email.split("@")[0],
        loggedInAt: new Date().toISOString(),
      };

      try {
        localStorage.setItem(SESSION_KEY, JSON.stringify(newSession));
      } catch {}

      setSession(newSession);

      // Async database storage
      syncUserToSupabase(userId, email, name);
    },
    []
  );

  // Read session from Supabase auth & localStorage on mount
  useEffect(() => {
    let mounted = true;

    async function initAuth() {
      try {
        // Check current active Supabase session (e.g. after Google OAuth redirect)
        const { data } = await supabase.auth.getSession();
        const supaUser = data.session?.user;

        if (supaUser && mounted) {
          const isConfirmed = !!supaUser.email_confirmed_at || supaUser.app_metadata?.provider !== "email";
          if (!isConfirmed) {
            await supabase.auth.signOut();
            setIsLoading(false);
            return;
          }

          const userEmail = supaUser.email || "";
          const userId = supaUser.id;
          const userName =
            supaUser.user_metadata?.full_name ||
            supaUser.user_metadata?.name ||
            userEmail.split("@")[0];

          await setAndStoreSession(userEmail, userId, userName);
          setIsLoading(false);
          return;
        }
      } catch (err) {
        console.warn("Error checking Supabase auth session:", err);
      }

      // Fallback to local session if no active Supabase OAuth session
      try {
        const raw = localStorage.getItem(SESSION_KEY);
        if (raw && mounted) {
          const parsed: UserSession = JSON.parse(raw);
          setSession(parsed);
          // ensure user exists in DB
          if (parsed.user_id && parsed.email) {
            syncUserToSupabase(parsed.user_id, parsed.email, parsed.name);
          }
        }
      } catch {
        localStorage.removeItem(SESSION_KEY);
      }

      if (mounted) setIsLoading(false);
    }

    initAuth();

    // Listen for auth changes (e.g., Google OAuth sign in callback)
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, supaSession) => {
      if (supaSession?.user && mounted) {
        const supaUser = supaSession.user;
        const isConfirmed = !!supaUser.email_confirmed_at || supaUser.app_metadata?.provider !== "email";
        if (!isConfirmed) {
          await supabase.auth.signOut();
          setIsLoading(false);
          return;
        }

        const userEmail = supaUser.email || "";
        const userId = supaUser.id;
        const userName =
          supaUser.user_metadata?.full_name ||
          supaUser.user_metadata?.name ||
          userEmail.split("@")[0];

        await setAndStoreSession(userEmail, userId, userName);
        setIsLoading(false);
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [setAndStoreSession]);

  // Route guard: redirect unauthenticated users to /login
  useEffect(() => {
    if (isLoading) return;

    const isLoginPage = pathname === "/login";

    if (!session && !isLoginPage) {
      router.replace("/login");
    } else if (session && isLoginPage) {
      router.replace("/dashboard");
    }
  }, [session, isLoading, pathname, router]);

  const login = useCallback(
    (email: string, userId = "default_user", name?: string) => {
      setAndStoreSession(email, userId, name);
      router.replace("/dashboard");
    },
    [setAndStoreSession, router]
  );

  const logout = useCallback(async () => {
    try {
      localStorage.removeItem(SESSION_KEY);
      // Clear all user-specific cached state keys from localStorage
      for (let i = localStorage.length - 1; i >= 0; i--) {
        const key = localStorage.key(i);
        if (key && (key.startsWith("skillscatalyst_") || key.startsWith("sc_"))) {
          localStorage.removeItem(key);
        }
      }
      await supabase.auth.signOut();
    } catch {}
    setSession(null);
    router.replace("/login");
  }, [router]);

  if (pathname !== "/login") {
    if (isLoading || !session) {
      return (
        <AuthContext.Provider value={{ session, isLoading, login, logout }}>
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#060a15] text-white">
            <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
          </div>
        </AuthContext.Provider>
      );
    }
  }

  return (
    <AuthContext.Provider value={{ session, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
