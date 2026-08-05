"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { useRouter, usePathname } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { useQueryClient } from "@tanstack/react-query";

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
async function syncUserToSupabase(userId: string, email: string, name?: string) {
  const fullName = name || email.split("@")[0] || "Learner";

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
    await supabase.from("user_progress").upsert(
      {
        user_id: userId,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "user_id", ignoreDuplicates: true }
    );
  } catch (err) {
    console.warn("Failed to sync user_progress:", err);
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
    async (email: string, userId: string, name?: string, confirmed: boolean = true) => {
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

      // Async database storage
      syncUserToSupabase(userId, email, name);
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

          await setAndStoreSession(userEmail, userId, userName, true);
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

        await setAndStoreSession(userEmail, userId, userName, true);
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

  // On protected pages: if loading or unauthenticated, show dark transition screen while redirecting
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
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#060a15] text-white">
          <div className="w-10 h-10 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mb-4" />
          <p className="text-xs text-slate-400 font-mono tracking-wider animate-pulse">
            LOADING SKILLSCATALYST...
          </p>
        </div>
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

