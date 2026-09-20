"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { useRouter, usePathname } from "next/navigation";
import { supabase } from "@/lib/supabase";
import type { AuthChangeEvent, Session } from "@supabase/supabase-js";
import { useQueryClient } from "@tanstack/react-query";
import { sendWelcomeEmail, syncDailyLoginStreak } from "@/lib/api";

const SESSION_KEY = "skillscatalyst_user_session";

export type UserRole = "owner" | "student";
export type AppMode = "student" | "admin";

export interface UserSession {
  email?: string;
  user_id: string;
  name?: string;
  loggedInAt: string;
  emailConfirmed?: boolean;
  role: UserRole;
}

interface AuthContextValue {
  session: UserSession | null;
  isLoading: boolean;
  unverifiedEmail: string | null;
  role: UserRole;
  isOwner: boolean;
  appMode: AppMode;
  setAppMode: (mode: AppMode) => void;
  login: (email: string, userId: string, name?: string, role?: UserRole) => void;
  logout: () => void;
  clearUnverifiedEmail: () => void;
  setUnverifiedEmail: (email: string | null) => void;
}

const AuthContext = createContext<AuthContextValue>({
  session: null,
  isLoading: true,
  unverifiedEmail: null,
  role: "student",
  isOwner: false,
  appMode: "student",
  setAppMode: () => {},
  login: () => {},
  logout: () => {},
  clearUnverifiedEmail: () => {},
  setUnverifiedEmail: () => {},
});

// In-memory set to prevent duplicate dispatches caused by React re-renders in the same session
const _welcomeEmailDispatched = new Set<string>();

// Helper function to sync authenticated user to Supabase user_academic_profile & user_progress
// Triggers one-time welcome email dispatch; backend database enforces single-dispatch idempotency
async function syncUserToSupabase(
  userId: string,
  email: string,
  name?: string,
  createdAt?: string,
  lastSignInAt?: string,
  forceSignup: boolean = false
) {
  const fullName = name || email.split("@")[0] || "Learner";

  // Identify whether this is the user's initial onboarding session
  let isSignupSession = forceSignup;
  if (!isSignupSession && createdAt && lastSignInAt) {
    try {
      const createdMs = new Date(createdAt).getTime();
      const lastSignInMs = new Date(lastSignInAt).getTime();
      // On genuine first-time signup/OAuth, created_at and last_sign_in_at are virtually simultaneous
      if (Math.abs(lastSignInMs - createdMs) < 15000) {
        isSignupSession = true;
      }
    } catch {}
  }

  // Trigger one-time welcome email (backend enforces database idempotency & unique constraint)
  if (!_welcomeEmailDispatched.has(userId) && email && email.includes("@")) {
    _welcomeEmailDispatched.add(userId);
    sendWelcomeEmail({
      is_signup: isSignupSession,
      full_name: fullName,
      user_id: userId,
      email: email.trim(),
    }).catch((err) => console.warn("Welcome email notice:", err));
  }

  // Only attempt direct client upsert if active authenticated Supabase session is verified
  try {
    const { data: sessionData } = await supabase.auth.getSession();
    if (sessionData?.session?.user?.id === userId) {
      await supabase.from("user_academic_profile").upsert(
        {
          user_id: userId,
          full_name: fullName,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "user_id", ignoreDuplicates: true }
      );
    }
  } catch (err) {
    console.warn("Failed to sync user_academic_profile:", err);
  }

  try {
    await syncDailyLoginStreak(userId);
  } catch (err) {
    console.warn("Failed to sync daily login streak:", err);
  }

  try {
    const { data: sessionData } = await supabase.auth.getSession();
    if (sessionData?.session?.user?.id === userId) {
      await supabase.from("user_coding_profiles").upsert(
        {
          user_id: userId,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "user_id", ignoreDuplicates: true }
      );
    }
  } catch (err) {
    console.warn("Failed to sync user_coding_profiles:", err);
  }
}


export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<UserSession | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [unverifiedEmail, setUnverifiedEmailState] = useState<string | null>(null);
  const [appMode, setAppModeState] = useState<AppMode>("student");
  const router = useRouter();
  const pathname = usePathname();

  const setAndStoreSession = useCallback(
    async (
      email: string,
      userId: string,
      name?: string,
      confirmed: boolean = true,
      createdAt?: string,
      lastSignInAt?: string,
      forceSignup: boolean = false,
      role: UserRole = "student"
    ) => {
      const newSession: UserSession = {
        email,
        user_id: userId,
        name: name || email.split("@")[0],
        loggedInAt: new Date().toISOString(),
        emailConfirmed: confirmed,
        role,
      };

      setSession(newSession);
      setUnverifiedEmailState(null);

      if (role === "owner") {
        const savedMode = typeof window !== "undefined" ? localStorage.getItem("sc_owner_mode") : null;
        if (savedMode === "admin" || (typeof window !== "undefined" && window.location.pathname.startsWith("/admin"))) {
          setAppModeState("admin");
        } else {
          setAppModeState("student");
        }
      } else {
        setAppModeState("student");
      }

      // Async database storage & new-user welcome email dispatch
      syncUserToSupabase(userId, email, name, createdAt, lastSignInAt, forceSignup);
    },
    []
  );

  const clearSessionLocal = useCallback(() => {
    setSession(null);
    setAppModeState("student");
    try {
      localStorage.removeItem(SESSION_KEY);
      localStorage.removeItem("sc_owner_mode");
      for (let i = localStorage.length - 1; i >= 0; i--) {
        const key = localStorage.key(i);
        if (key && (key.startsWith("skillscatalyst_") || key.startsWith("sc_") || key.startsWith("sb-"))) {
          localStorage.removeItem(key);
        }
      }
    } catch {}
  }, []);

  // Initialize auth state on mount
  useEffect(() => {
    let mounted = true;

    // Proactively purge any legacy Supabase tokens from localStorage (migrating to SSR cookies)
    try {
      if (typeof window !== "undefined") {
        for (let i = localStorage.length - 1; i >= 0; i--) {
          const key = localStorage.key(i);
          if (key && key.startsWith("sb-")) {
            localStorage.removeItem(key);
          }
        }
      }
    } catch {}

    async function initAuth() {
      try {
        const { data, error } = await supabase.auth.getUser();
        if (error || !data.user) {
          if (mounted) {
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

          // Extract authoritative role from Supabase Auth app_metadata
          const rawRole = (supaUser.app_metadata?.role || "").toString().toLowerCase();
          const role: UserRole = rawRole === "owner" ? "owner" : "student";

          await setAndStoreSession(
            userEmail,
            userId,
            userName,
            true,
            supaUser.created_at,
            supaUser.last_sign_in_at,
            false,
            role
          );
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
    } = supabase.auth.onAuthStateChange(async (_event: AuthChangeEvent, supaSession: Session | null) => {
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

        // Extract authoritative role from Supabase Auth app_metadata
        const rawRole = (supaUser.app_metadata?.role || "").toString().toLowerCase();
        const role: UserRole = rawRole === "owner" ? "owner" : "student";

        await setAndStoreSession(
          userEmail,
          userId,
          userName,
          true,
          supaUser.created_at,
          supaUser.last_sign_in_at,
          false,
          role
        );
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
    const isLandingPage = pathname === "/";
    const isAdminPage = pathname === "/admin" || pathname.startsWith("/admin/");
    const isPublicPage = isLoginPage || isLandingPage;

    if (!session && !isPublicPage) {
      router.replace("/login");
    } else if (session && isLoginPage) {
      router.replace(session.role === "owner" && appMode === "admin" ? "/admin" : "/dashboard");
    } else if (session && isAdminPage && session.role !== "owner") {
      // Normal students can NEVER access admin routes
      router.replace("/dashboard");
    }
  }, [session, isLoading, pathname, router, appMode]);

  const setAppMode = useCallback(
    (newMode: AppMode) => {
      // Authorization safeguard: only authenticated platform owner can toggle Admin Mode
      if (session?.role !== "owner") {
        setAppModeState("student");
        return;
      }
      setAppModeState(newMode);
      try {
        localStorage.setItem("sc_owner_mode", newMode);
      } catch {}
      if (newMode === "admin" && !pathname.startsWith("/admin")) {
        router.push("/admin");
      } else if (newMode === "student" && pathname.startsWith("/admin")) {
        router.push("/dashboard");
      }
    },
    [session?.role, pathname, router]
  );

  const login = useCallback(
    (email: string, userId: string, name?: string, role: UserRole = "student") => {
      setAndStoreSession(email, userId, name, true, undefined, undefined, false, role);
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
    setAppModeState("student");
    setUnverifiedEmailState(null);
    router.replace("/login");
  }, [router, queryClient, clearSessionLocal]);

  const clearUnverifiedEmail = useCallback(() => {
    setUnverifiedEmailState(null);
  }, []);

  const setUnverifiedEmail = useCallback((email: string | null) => {
    setUnverifiedEmailState(email);
  }, []);

  const isOwner = session?.role === "owner";

  const contextValue: AuthContextValue = {
    session,
    isLoading,
    unverifiedEmail,
    role: session?.role || "student",
    isOwner,
    appMode,
    setAppMode,
    login,
    logout,
    clearUnverifiedEmail,
    setUnverifiedEmail,
  };

  // On /login and / landing page: ALWAYS render children immediately without showing full-screen loading screen
  if (pathname === "/login" || pathname === "/") {
    return (
      <AuthContext.Provider value={contextValue}>
        {children}
      </AuthContext.Provider>
    );
  }

  // On protected pages: if loading or unauthenticated, render provider tree while router handles redirect
  if (isLoading || !session) {
    return (
      <AuthContext.Provider value={contextValue}>
        {children}
      </AuthContext.Provider>
    );
  }

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}

