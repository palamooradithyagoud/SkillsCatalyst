"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { useRouter, usePathname } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { useQueryClient } from "@tanstack/react-query";
import { sendWelcomeEmail, syncDailyLoginStreak } from "@/lib/api";

const SESSION_KEY = "skillscatalyst_user_session";

export interface UserSession {
  email?: string;
  user_id: string;
  name?: string;
  loggedInAt: string;
  emailConfirmed?: boolean;
}

interface AuthContextValue {
  session: UserSession | null;
  isLoading: boolean;
  unverifiedEmail: string | null;
  login: (email: string, userId: string, name?: string) => void;
  logout: () => void;
  clearUnverifiedEmail: () => void;
  setUnverifiedEmail: (email: string | null) => void;
}

const AuthContext = createContext<AuthContextValue>({
  session: null,
  isLoading: true,
  unverifiedEmail: null,
  login: () => {},
  logout: () => {},
  clearUnverifiedEmail: () => {},
  setUnverifiedEmail: () => {},
});

// Helper function to sync authenticated user to Supabase user_academic_profile & user_progress
// Sends welcome email ONLY to brand-new users (new Google OAuth logins or new registrations)
async function syncUserToSupabase(
  userId: string,
  email: string,
  name?: string,
  createdAt?: string
) {
  const fullName = name || email.split("@")[0] || "Learner";

  // Check if this user already exists in the database
  let isBrandNewUser = false;
  try {
    const { data: existingProfile, error } = await supabase
      .from("user_academic_profile")
      .select("user_id")
      .eq("user_id", userId)
      .maybeSingle();

    // If no profile exists yet, this is their very first session
    if (!error && !existingProfile) {
      if (createdAt) {
        const createdMs = new Date(createdAt).getTime();
        const diffMs = Date.now() - createdMs;
        // User account was created within the last 15 minutes
        if (diffMs < 15 * 60 * 1000 && diffMs > -60000) {
          isBrandNewUser = true;
        }
      } else {
        isBrandNewUser = true;
      }
    }
  } catch (err) {
    console.warn("Check for new user profile failed:", err);
  }

  // Client-side guard so we never trigger twice in the same browser session
  const welcomeKey = `sc_welcome_sent_${userId}`;
  const alreadySentLocal =
    typeof window !== "undefined" && localStorage.getItem(welcomeKey) === "1";

  if (isBrandNewUser && !alreadySentLocal && email && email.includes("@")) {
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem(welcomeKey, "1");
      } catch {}
    }
    // Asynchronously dispatch welcome email via Resend
    sendWelcomeEmail({
      email: email.trim(),
      full_name: fullName,
      user_id: userId,
    }).catch((err) => console.warn("Welcome email notice:", err));
  }

  try {
    await supabase.from("user_academic_profile").upsert(
      {
        user_id: userId,
        full_name: fullName,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "user_id", ignoreDuplicates: true }
    );
  } catch (err) {
    console.warn("Failed to sync user_academic_profile:", err);
  }

  try {
    await syncDailyLoginStreak(userId);
  } catch (err) {
    console.warn("Failed to sync daily login streak:", err);
  }

  try {
    await supabase.from("user_coding_profiles").upsert(
      {
        user_id: userId,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "user_id", ignoreDuplicates: true }
    );
  } catch (err) {
    console.warn("Failed to sync user_coding_profiles:", err);
  }
}


export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<UserSession | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [unverifiedEmail, setUnverifiedEmailState] = useState<string | null>(null);
  const router = useRouter();
  const pathname = usePathname();

  const setAndStoreSession = useCallback(
    async (
      email: string,
      userId: string,
      name?: string,
      confirmed: boolean = true,
      createdAt?: string
    ) => {
      const newSession: UserSession = {
        email,
        user_id: userId,
        name: name || email.split("@")[0],
        loggedInAt: new Date().toISOString(),
        emailConfirmed: confirmed,
      };

      try {
        localStorage.setItem(SESSION_KEY, JSON.stringify(newSession));
      } catch {}

      setSession(newSession);
      setUnverifiedEmailState(null);

      // Async database storage & new-user welcome email dispatch
      syncUserToSupabase(userId, email, name, createdAt);
    },
    []
  );

  const clearSessionLocal = useCallback(() => {
    setSession(null);
    try {
      localStorage.removeItem(SESSION_KEY);
      for (let i = localStorage.length - 1; i >= 0; i--) {
        const key = localStorage.key(i);
        if (key && (key.startsWith("skillscatalyst_") || key.startsWith("sc_"))) {
          localStorage.removeItem(key);
        }
      }
    } catch {}
  }, []);

  // Initialize auth state on mount
  useEffect(() => {
    let mounted = true;

    async function initAuth() {
      try {
        const { data, error } = await supabase.auth.getUser();
        if (error || !data.user) {
          if (mounted) {
            await supabase.auth.signOut();
            clearSessionLocal();
            setIsLoading(false);
          }
          return;
        }

        const supaUser = data.user;

        if (supaUser && mounted) {
          const isEmailProvider = supaUser.app_metadata?.provider === "email";
          const isConfirmed = !!supaUser.email_confirmed_at;

          if (isEmailProvider && !isConfirmed) {
            // Unverified email account
            setUnverifiedEmailState(supaUser.email || null);
            clearSessionLocal();
            setIsLoading(false);
            return;
          }

          const userEmail = supaUser.email || "";
          const userId = supaUser.id;
          const userName =
            supaUser.user_metadata?.full_name ||
            supaUser.user_metadata?.name ||
            userEmail.split("@")[0];

          await setAndStoreSession(userEmail, userId, userName, true, supaUser.created_at);
          if (mounted) setIsLoading(false);
          return;
        }
      } catch (err) {
        console.warn("Error checking Supabase auth session:", err);
      }

      // If no valid active Supabase OAuth / email session, clear any stale state
      if (mounted) {
        clearSessionLocal();
        setIsLoading(false);
      }
    }


    initAuth();

    // Listen for auth state changes (e.g. after Google OAuth callback or email sign in)
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, supaSession) => {
      if (!mounted) return;

      if (supaSession?.user) {
        const supaUser = supaSession.user;
        const isEmailProvider = supaUser.app_metadata?.provider === "email";
        const isConfirmed = !!supaUser.email_confirmed_at;

        if (isEmailProvider && !isConfirmed) {
          setUnverifiedEmailState(supaUser.email || null);
          clearSessionLocal();
          setIsLoading(false);
          return;
        }

        const userEmail = supaUser.email || "";
        const userId = supaUser.id;
        const userName =
          supaUser.user_metadata?.full_name ||
          supaUser.user_metadata?.name ||
          userEmail.split("@")[0];

        await setAndStoreSession(userEmail, userId, userName, true, supaUser.created_at);
        setIsLoading(false);
      } else {
        clearSessionLocal();
        setIsLoading(false);
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [setAndStoreSession, clearSessionLocal]);

  // Strict route guard
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
    (email: string, userId: string, name?: string) => {
      setAndStoreSession(email, userId, name, true);
      router.replace("/dashboard");
    },
    [setAndStoreSession, router]
  );

  const queryClient = useQueryClient();

  const logout = useCallback(async () => {
    clearSessionLocal();
    try {
      queryClient.clear();
      await supabase.auth.signOut();
    } catch {}
    setSession(null);
    setUnverifiedEmailState(null);
    router.replace("/login");
  }, [router, queryClient, clearSessionLocal]);

  const clearUnverifiedEmail = useCallback(() => {
    setUnverifiedEmailState(null);
  }, []);

  const setUnverifiedEmail = useCallback((email: string | null) => {
    setUnverifiedEmailState(email);
  }, []);

  // On /login page: ALWAYS render children immediately without showing full-screen loading screen
  if (pathname === "/login") {
    return (
      <AuthContext.Provider
        value={{
          session,
          isLoading,
          unverifiedEmail,
          login,
          logout,
          clearUnverifiedEmail,
          setUnverifiedEmail,
        }}
      >
        {children}
      </AuthContext.Provider>
    );
  }

  // On protected pages: if loading or unauthenticated, render provider tree while router handles redirect
  if (isLoading || !session) {
    return (
      <AuthContext.Provider
        value={{
          session,
          isLoading,
          unverifiedEmail,
          login,
          logout,
          clearUnverifiedEmail,
          setUnverifiedEmail,
        }}
      >
        {children}
      </AuthContext.Provider>
    );
  }

  return (
    <AuthContext.Provider
      value={{
        session,
        isLoading,
        unverifiedEmail,
        login,
        logout,
        clearUnverifiedEmail,
        setUnverifiedEmail,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}

