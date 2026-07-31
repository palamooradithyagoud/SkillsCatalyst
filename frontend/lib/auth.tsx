"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { useRouter, usePathname } from "next/navigation";

const SESSION_KEY = "skillscatalyst_user_session";

interface UserSession {
  email?: string;
  user_id: string;
  loggedInAt: string;
}

interface AuthContextValue {
  session: UserSession | null;
  isLoading: boolean;
  login: (email: string, userId?: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue>({
  session: null,
  isLoading: true,
  login: () => {},
  logout: () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<UserSession | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  // Read session from localStorage on mount
  useEffect(() => {
    try {
      const raw = localStorage.getItem(SESSION_KEY);
      if (raw) {
        const parsed: UserSession = JSON.parse(raw);
        setSession(parsed);
      }
    } catch {
      // corrupted session — clear it
      localStorage.removeItem(SESSION_KEY);
    }
    setIsLoading(false);
  }, []);

  // Route guard: redirect unauthenticated users to /login,
  // and authenticated users away from /login
  useEffect(() => {
    if (isLoading) return; // wait until session is resolved

    const isLoginPage = pathname === "/login";

    if (!session && !isLoginPage) {
      // Not logged in → go to /login
      router.replace("/login");
    } else if (session && isLoginPage) {
      // Already logged in → skip /login → go to dashboard
      router.replace("/dashboard");
    }
  }, [session, isLoading, pathname, router]);

  const login = useCallback((email: string, userId = "default_user") => {
    const newSession: UserSession = {
      email,
      user_id: userId,
      loggedInAt: new Date().toISOString(),
    };
    try {
      localStorage.setItem(SESSION_KEY, JSON.stringify(newSession));
    } catch {}
    setSession(newSession);
    // Replace history so back button never goes back to /login
    router.replace("/dashboard");
  }, [router]);

  const logout = useCallback(() => {
    try {
      localStorage.removeItem(SESSION_KEY);
    } catch {}
    setSession(null);
    // Replace history so back button never goes back to protected pages
    router.replace("/login");
  }, [router]);

  return (
    <AuthContext.Provider value={{ session, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
