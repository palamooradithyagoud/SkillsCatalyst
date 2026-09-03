"use client";

import React, { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  Mail,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/lib/supabase";
import { useQueryClient } from "@tanstack/react-query";
import { fetchDashboardData, sendWelcomeEmail } from "@/lib/api";
import { useTransition } from "@/providers/TransitionProvider";
import SkillsCatalystLogo from "@/components/SkillsCatalystLogo";
import PenguinMountainCanvas from "@/components/PenguinMountainCanvas";

export default function LoginPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { startLogoTransition } = useTransition();
  const { isLoading, unverifiedEmail, setUnverifiedEmail, clearUnverifiedEmail } = useAuth();

  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [resendSent, setResendSent] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);

  const switchMode = (newMode: "signin" | "signup") => {
    setMode(newMode);
    setErrorMessage("");
    setSuccessMessage("");
    clearUnverifiedEmail();
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setErrorMessage("Please enter both email and password.");
      return;
    }
    setLoading(true);
    setErrorMessage("");
    setSuccessMessage("");

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password: password,
      });

      if (error) {
        if (error.message.toLowerCase().includes("email not confirmed")) {
          setUnverifiedEmail(email.trim());
          setErrorMessage("Your email is not verified yet. Please verify your email before logging in.");
        } else {
          setErrorMessage(error.message);
        }
        setLoading(false);
        return;
      }

      if (data.user) {
        const isConfirmed = !!data.user.email_confirmed_at;
        if (!isConfirmed) {
          setUnverifiedEmail(data.user.email || email.trim());
          setErrorMessage("Please verify your email address to continue to the dashboard.");
          await supabase.auth.signOut();
          setLoading(false);
          return;
        }

        // 1. Trigger transition
        startLogoTransition();

        // 2. Prefetch dashboard data
        queryClient.prefetchQuery({
          queryKey: ["dashboard", data.user.id],
          queryFn: () => fetchDashboardData(),
        });

        // 3. Navigate to dashboard
        router.replace("/dashboard");
      }
    } catch (err: any) {
      setErrorMessage(err?.message || "An unexpected error occurred during sign in.");
      setLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password || !fullName) {
      setErrorMessage("Please fill in all required fields.");
      return;
    }
    if (password.length < 6) {
      setErrorMessage("Password must be at least 6 characters long.");
      return;
    }
    if (password !== confirmPassword) {
      setErrorMessage("Passwords do not match.");
      return;
    }

    setLoading(true);
    setErrorMessage("");
    setSuccessMessage("");

    try {
      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password: password,
        options: {
          data: {
            full_name: fullName.trim(),
          },
          emailRedirectTo: `${window.location.origin}/dashboard`,
        },
      });

      if (error) {
        setErrorMessage(error.message);
        setLoading(false);
        return;
      }

      if (data.user) {
        // Asynchronously dispatch welcome email via Resend
        sendWelcomeEmail({
          email: email.trim(),
          full_name: fullName.trim(),
          user_id: data.user.id,
        }).catch((err) => console.warn("Welcome email notice:", err));

        if (data.user.email_confirmed_at) {
          setSuccessMessage("Account created successfully! Redirecting...");
        } else {
          setUnverifiedEmail(email.trim());
          setSuccessMessage("Account created! A verification link has been sent to your email.");
        }
      }
    } catch (err: any) {
      setErrorMessage(err?.message || "An error occurred during registration.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setErrorMessage("");
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/dashboard`,
        },
      });
      if (error) {
        setErrorMessage(error.message);
        setLoading(false);
      }
    } catch (err: any) {
      setErrorMessage(err?.message || "Failed to initiate Google sign in.");
      setLoading(false);
    }
  };

  const handleResendVerification = async () => {
    const targetEmail = unverifiedEmail || email;
    if (!targetEmail) return;

    setResendLoading(true);
    setResendSent(false);
    try {
      const { error } = await supabase.auth.resend({
        type: "signup",
        email: targetEmail,
        options: {
          emailRedirectTo: `${window.location.origin}/dashboard`,
        },
      });
      if (error) {
        setErrorMessage(error.message);
      } else {
        setResendSent(true);
        setSuccessMessage("Verification email resent successfully. Please check your inbox.");
      }
    } catch (err: any) {
      setErrorMessage(err?.message || "Failed to resend verification email.");
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <div className="w-full min-h-screen min-h-[100dvh] bg-white text-[#18191F] flex flex-col lg:flex-row m-0 p-0 font-sans select-none overflow-x-hidden">
      {/* ── LEFT / TOP HEADER: Realistic Animated Mountain Canvas with Penguin in Pure Code ── */}
      <div className="w-full min-w-full lg:min-w-0 h-[250px] sm:h-[300px] lg:h-full lg:w-1/2 lg:min-h-screen shrink-0 relative overflow-hidden bg-[#1F1B2C]">
        <PenguinMountainCanvas className="absolute inset-0 w-full h-full" />
      </div>

      {/* ── RIGHT / BOTTOM CARD: Crisp White Auth Container (Seamless Alignment) ── */}
      <div className="w-full lg:w-1/2 flex-1 min-h-[calc(100vh-230px)] lg:min-h-screen bg-white rounded-t-[28px] lg:rounded-none -mt-4 lg:mt-0 flex flex-col justify-between p-6 sm:p-10 lg:p-16 shadow-2xl relative z-10 overflow-hidden">
        {/* ── Low-Opacity Background Watermark Logo Emblem ── */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none z-0">
          <div className="relative w-[340px] h-[340px] sm:w-[460px] sm:h-[460px] lg:w-[540px] lg:h-[540px] opacity-[0.045] mix-blend-multiply">
            <Image
              src="/logo.png"
              alt="SkillsCatalyst Watermark"
              fill
              className="object-contain"
              priority
            />
          </div>
        </div>

        <div className="w-full max-w-[380px] mx-auto my-auto space-y-5 pt-1 pb-6 relative z-10">
          {/* SkillsCatalyst Official Brand Header */}
          <div className="flex justify-center mb-1">
            <SkillsCatalystLogo size="md" showText={false} />
          </div>

          {/* Heading & Subtitle */}
          <div className="text-center space-y-1">
            <h1 className="text-2xl sm:text-[30px] font-black text-[#18191F] tracking-tight">
              {unverifiedEmail
                ? "Verify your email"
                : mode === "signin"
                ? "Welcome back!"
                : "Create an account"}
            </h1>
            <p className="text-xs sm:text-[13px] text-zinc-500 font-normal">
              {unverifiedEmail
                ? "Check your inbox to verify your account"
                : "Please enter your details"}
            </p>
          </div>

          {/* Unverified Email Handling */}
          {unverifiedEmail ? (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4 pt-2"
            >
              <div className="p-5 rounded-2xl bg-zinc-50 border border-zinc-200 text-center space-y-2">
                <div className="w-10 h-10 rounded-full bg-zinc-200 text-zinc-800 flex items-center justify-center mx-auto">
                  <Mail className="w-5 h-5" />
                </div>
                <h3 className="text-xs font-bold text-zinc-900">Verification Link Sent</h3>
                <p className="text-xs text-zinc-600 leading-relaxed">
                  We sent a confirmation link to <span className="font-bold text-black">{unverifiedEmail}</span>.
                </p>
              </div>

              {resendSent && (
                <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Verification link resent! Please check your inbox.</span>
                </div>
              )}

              {errorMessage && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              <button
                type="button"
                onClick={handleResendVerification}
                disabled={resendLoading}
                className="w-full py-3.5 px-4 rounded-full bg-[#18191F] hover:bg-[#2C2D35] text-white font-bold text-xs transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${resendLoading ? "animate-spin" : ""}`} />
                <span>{resendLoading ? "Resending..." : "Resend Verification Email"}</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  clearUnverifiedEmail();
                  switchMode("signin");
                }}
                className="w-full text-center text-xs text-zinc-500 hover:text-black font-semibold transition-colors cursor-pointer"
              >
                ← Back to Log In
              </button>
            </motion.div>
          ) : (
            <div className="space-y-5 pt-1">
              {/* Error and Success Banners */}
              <AnimatePresence>
                {errorMessage && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-medium flex items-center gap-2"
                  >
                    <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                    <span>{errorMessage}</span>
                  </motion.div>
                )}

                {successMessage && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-medium flex items-center gap-2"
                  >
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>{successMessage}</span>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Minimalist Underline Input Form */}
              <form
                onSubmit={mode === "signin" ? handleSignIn : handleSignUp}
                className="space-y-4"
              >
                {mode === "signup" && (
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-zinc-800 block">
                      Full Name
                    </label>
                    <input
                      id="signup-name"
                      type="text"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="Alex Mercer"
                      className="w-full bg-transparent border-b border-zinc-300 focus:border-[#18191F] py-2 text-sm text-zinc-900 outline-none transition-colors placeholder:text-zinc-400"
                    />
                  </div>
                )}

                {/* Email Field */}
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-zinc-800 block">
                    Email
                  </label>
                  <input
                    id="auth-email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    style={{ colorScheme: "light" }}
                    className="w-full bg-white border-b border-zinc-300 focus:border-[#18191F] py-2 text-sm text-zinc-900 outline-none transition-colors placeholder:text-zinc-400"
                  />
                </div>

                {/* Password Field */}
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-zinc-800 block">
                    Password
                  </label>
                  <div className="relative">
                    <input
                      id="auth-password"
                      type={showPassword ? "text" : "password"}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      style={{ colorScheme: "light" }}
                      className="w-full bg-white border-b border-zinc-300 focus:border-[#18191F] py-2 pr-8 text-sm text-zinc-900 outline-none transition-colors placeholder:text-zinc-400"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-1 top-1/2 -translate-y-1/2 text-zinc-700 hover:text-black transition-colors"
                      aria-label={showPassword ? "Hide password" : "Show password"}
                    >
                      {showPassword ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>

                {mode === "signup" && (
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-zinc-800 block">
                      Confirm Password
                    </label>
                    <input
                      id="signup-confirm-password"
                      type={showPassword ? "text" : "password"}
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Repeat your password"
                      className="w-full bg-transparent border-b border-zinc-300 focus:border-[#18191F] py-2 text-sm text-zinc-900 outline-none transition-colors placeholder:text-zinc-400"
                    />
                  </div>
                )}

                {/* Remember Me & Forgot Password Row */}
                {mode === "signin" && (
                  <div className="flex items-center justify-between text-xs pt-1">
                    <label className="flex items-center gap-2 text-zinc-600 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={rememberMe}
                        onChange={(e) => setRememberMe(e.target.checked)}
                        className="w-3.5 h-3.5 rounded border-zinc-300 text-[#18191F] focus:ring-0 cursor-pointer accent-[#18191F]"
                      />
                      <span className="font-medium">Remember for 30 days</span>
                    </label>
                    <a
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        setErrorMessage("Password reset link will be sent if account exists.");
                      }}
                      className="text-zinc-500 hover:text-black font-medium transition-colors"
                    >
                      Forgot password?
                    </a>
                  </div>
                )}

                {/* Primary Submit Button: Solid Charcoal Pill */}
                <div className="pt-2">
                  <button
                    id="auth-submit"
                    type="submit"
                    disabled={loading}
                    className="w-full py-3.5 rounded-full bg-[#18191F] hover:bg-[#2C2D35] text-white font-bold text-sm tracking-wide shadow-xs transition-all active:scale-[0.99] cursor-pointer disabled:opacity-50"
                  >
                    {loading ? (
                      <span className="flex items-center justify-center gap-2">
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>Processing...</span>
                      </span>
                    ) : mode === "signin" ? (
                      "Log In"
                    ) : (
                      "Create Account"
                    )}
                  </button>
                </div>
              </form>

              {/* Google OAuth Button: Solid Light Pill */}
              <div>
                <button
                  id="auth-google"
                  type="button"
                  onClick={handleGoogleSignIn}
                  disabled={loading}
                  className="w-full py-3.5 rounded-full bg-[#F3F4F6] hover:bg-[#E5E7EB] text-[#1F2937] font-semibold text-sm flex items-center justify-center gap-2.5 transition-all active:scale-[0.99] cursor-pointer disabled:opacity-50"
                >
                  <svg className="w-4.5 h-4.5 shrink-0" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.5h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5 3.7-8.8z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3 0-5.5-2.3-6.4-5.2L1.9 16C3.7 19.7 7.5 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.6 14.8c-.2-.7-.4-1.5-.4-2.3s.2-1.6.4-2.3L1.9 7.3C.7 9.7 0 12.3 0 15s.7 5.3 1.9 7.7l3.7-2.9c-.8-.9-1.3-2.1-1.3-3.6z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5c1.6 0 3 .6 4.1 1.6l3.1-3.1C17.3 1.7 14.8 1 12 1 7.5 1 3.7 3.6 1.9 7.3l3.7 2.9C6.5 7.3 9 5 12 5z"
                    />
                  </svg>
                  <span>Log in with Google</span>
                </button>
              </div>
            </div>
          )}

          {/* Bottom Switcher: Don't have an account? Sign Up */}
          <div className="text-center text-xs text-zinc-500 font-medium pt-2">
            {mode === "signin" ? (
              <>
                Don&apos;t have an account?{" "}
                <button
                  type="button"
                  onClick={() => switchMode("signup")}
                  className="font-bold text-[#18191F] hover:underline cursor-pointer ml-1"
                >
                  Sign Up
                </button>
              </>
            ) : (
              <>
                Already have an account?{" "}
                <button
                  type="button"
                  onClick={() => switchMode("signin")}
                  className="font-bold text-[#18191F] hover:underline cursor-pointer ml-1"
                >
                  Log In
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
