"use client";

import React, { useState } from "react";
import {
  Code2,
  Mail,
  Lock,
  User,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Sparkles,
  Zap,
  BarChart3,
  Target,
  Eye,
  EyeOff,
  Check,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/lib/supabase";

export default function LoginPage() {
  const { isLoading, unverifiedEmail, setUnverifiedEmail, clearUnverifiedEmail } = useAuth();

  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [resendSent, setResendSent] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);

  // Clear messages on mode switch
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
        }
      }
    } catch (err: any) {
      setErrorMessage(err?.message || "An unexpected error occurred during sign in.");
    } finally {
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

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#060a15] text-white">
        <div className="w-10 h-10 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-sm text-slate-400 font-mono animate-pulse">Loading SkillsCatalyst...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-[#060a15] text-white flex flex-col lg:flex-row -m-6 md:-m-8 lg:-m-10 select-none overflow-x-hidden relative">
      {/* Background Ambient Glow & Grid Pattern */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[600px] h-[600px] bg-blue-600/15 blur-[140px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] bg-indigo-600/15 blur-[140px] rounded-full" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)]" />
      </div>

      {/* LEFT COLUMN: Marketing & Value Proposition Showcase */}
      <div className="w-full lg:w-[55%] p-8 sm:p-12 lg:p-16 flex flex-col justify-between relative z-10 space-y-8">
        <div>
          {/* Logo Header */}
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-cyan-400 flex items-center justify-center text-white shadow-lg shadow-blue-500/30">
              <Code2 className="w-6 h-6 stroke-[2.5]" />
            </div>
            <span className="text-2xl font-extrabold tracking-tight text-white">SkillsCatalyst</span>
          </div>

          {/* Category Pill Badge */}
          <div className="inline-block px-3.5 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 text-[11px] font-extrabold uppercase tracking-wider mb-6">
            ENTERPRISE AI CAREER ACCELERATOR
          </div>

          {/* Hero Headline */}
          <h1 className="text-4xl sm:text-5xl lg:text-[52px] font-black tracking-tight leading-[1.1] text-white mb-4">
            Master Tech Interviews.<br />
            <span className="bg-gradient-to-r from-blue-400 via-indigo-400 to-cyan-400 bg-clip-text text-transparent">
              Accelerate Your Career.
            </span>
          </h1>

          {/* Description */}
          <p className="text-slate-400 text-sm sm:text-base max-w-xl leading-relaxed mb-8 font-medium">
            The all-in-one AI platform for top-tier technology roles. Prepare with structured roadmaps, practice company-wise DSA problems, and master your technical interviews.
          </p>

          {/* 3 Stats Grid */}
          <div className="grid grid-cols-3 gap-3 sm:gap-4 mb-8">
            <div className="bg-[#0b1222]/80 border border-white/[0.08] rounded-2xl p-4 text-center backdrop-blur-md">
              <div className="text-xl sm:text-2xl font-black text-white">500+</div>
              <div className="text-[10px] sm:text-[11px] font-extrabold text-slate-400 uppercase tracking-wider mt-0.5">LEETCODE QUESTIONS</div>
            </div>
            <div className="bg-[#0b1222]/80 border border-white/[0.08] rounded-2xl p-4 text-center backdrop-blur-md">
              <div className="text-xl sm:text-2xl font-black text-white">100+</div>
              <div className="text-[10px] sm:text-[11px] font-extrabold text-slate-400 uppercase tracking-wider mt-0.5">TECH COMPANIES</div>
            </div>
            <div className="bg-[#0b1222]/80 border border-white/[0.08] rounded-2xl p-4 text-center backdrop-blur-md">
              <div className="text-xl sm:text-2xl font-black text-white">98%</div>
              <div className="text-[10px] sm:text-[11px] font-extrabold text-slate-400 uppercase tracking-wider mt-0.5">ATS PRECISION</div>
            </div>
          </div>

          {/* 3 Feature Banner Cards Stacked Vertically */}
          <div className="space-y-3.5">
            {/* Feature 1 */}
            <div className="bg-[#0b1222]/60 hover:bg-[#0b1222] border border-white/[0.08] hover:border-indigo-500/30 rounded-2xl p-4 flex items-start gap-4 transition-all duration-200 group">
              <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 shrink-0 group-hover:scale-105 transition-transform">
                <Zap className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white mb-0.5">Roadmap & Resources</h3>
                <p className="text-xs text-slate-400 leading-snug">
                  Personalized 5-tier learning pathways, YouTube playlists & certifications for any skill.
                </p>
              </div>
            </div>

            {/* Feature 2 */}
            <div className="bg-[#0b1222]/60 hover:bg-[#0b1222] border border-white/[0.08] hover:border-indigo-500/30 rounded-2xl p-4 flex items-start gap-4 transition-all duration-200 group">
              <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 shrink-0 group-hover:scale-105 transition-transform">
                <BarChart3 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white mb-0.5">Topic-wise & Company-wise DSA Questions</h3>
                <p className="text-xs text-slate-400 leading-snug">
                  500+ frequency-ranked LeetCode problems for Google, Meta, Amazon, Microsoft & Apple.
                </p>
              </div>
            </div>

            {/* Feature 3 */}
            <div className="bg-[#0b1222]/60 hover:bg-[#0b1222] border border-white/[0.08] hover:border-indigo-500/30 rounded-2xl p-4 flex items-start gap-4 transition-all duration-200 group">
              <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 shrink-0 group-hover:scale-105 transition-transform">
                <Target className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white mb-0.5">Interview Prep + Resume Review</h3>
                <p className="text-xs text-slate-400 leading-snug">
                  Multi-stage ATS resume scoring, recruiter simulation & real-time AI mock interviews.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer info */}
        <div className="pt-6 text-xs text-slate-500 flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>Secured by Supabase Identity & SSL Encryption</span>
        </div>
      </div>

      {/* RIGHT COLUMN: Floating Glassmorphic Authentication Box */}
      <div className="w-full lg:w-[45%] p-6 sm:p-10 lg:p-12 flex items-center justify-center relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="w-full max-w-[460px] bg-[#090e1a]/90 border border-white/[0.1] rounded-3xl p-7 sm:p-9 shadow-2xl backdrop-blur-xl space-y-6 relative overflow-hidden"
        >
          {/* Subtle Ambient top glow inside card */}
          <div className="absolute -top-20 left-1/2 -translate-x-1/2 w-64 h-32 bg-blue-600/20 blur-3xl rounded-full pointer-events-none" />

          {/* Welcome Header */}
          <div className="text-center space-y-1 relative z-10">
            <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              {unverifiedEmail ? "Verify Email" : "Welcome Back"}
            </h2>
            <p className="text-xs text-slate-400 font-medium">
              {unverifiedEmail ? "Action required to access your account" : "Sign in to your workspace to continue"}
            </p>
          </div>

          {/* Unverified Email State Handling */}
          {unverifiedEmail ? (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4 relative z-10"
            >
              <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-200 text-center space-y-2">
                <div className="w-10 h-10 rounded-full bg-amber-500/20 flex items-center justify-center mx-auto text-amber-400">
                  <Mail className="w-5 h-5" />
                </div>
                <h3 className="text-xs font-bold text-amber-300">Email Verification Required</h3>
                <p className="text-[11px] text-slate-300 leading-relaxed">
                  We sent a verification link to <span className="font-bold text-white">{unverifiedEmail}</span>.
                  Please check your inbox and click the link to verify your account.
                </p>
              </div>

              {resendSent && (
                <div className="p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-semibold flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Verification email resent! Please check your spam folder.</span>
                </div>
              )}

              {errorMessage && (
                <div className="p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs font-semibold flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              <button
                type="button"
                onClick={handleResendVerification}
                disabled={resendLoading}
                className="w-full py-3 px-4 rounded-xl bg-indigo-600/30 hover:bg-indigo-600/40 border border-indigo-500/40 text-indigo-200 font-bold text-xs transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <RefreshCw className={`w-4 h-4 ${resendLoading ? "animate-spin" : ""}`} />
                <span>{resendLoading ? "Resending Email..." : "Resend Verification Email"}</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  clearUnverifiedEmail();
                  switchMode("signin");
                }}
                className="w-full text-center text-xs text-slate-400 hover:text-white font-medium transition-colors cursor-pointer pt-1"
              >
                ← Back to Sign In
              </button>
            </motion.div>
          ) : (
            <>
              {/* Tab Switcher (Login | Sign Up) with 120fps Animated Pill */}
              <div className="flex rounded-xl bg-[#060a15] p-1 border border-white/[0.08] relative z-10 overflow-hidden">
                <button
                  type="button"
                  onClick={() => switchMode("signin")}
                  className={`flex-1 py-2.5 text-xs font-bold rounded-lg transition-colors duration-200 cursor-pointer relative z-10 ${
                    mode === "signin" ? "text-white" : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  {mode === "signin" && (
                    <motion.div
                      layoutId="activeAuthTabPill"
                      className="absolute inset-0 bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-500 rounded-lg shadow-md shadow-indigo-600/30 -z-10"
                      transition={{ type: "spring", stiffness: 500, damping: 32 }}
                    />
                  )}
                  Login
                </button>
                <button
                  type="button"
                  onClick={() => switchMode("signup")}
                  className={`flex-1 py-2.5 text-xs font-bold rounded-lg transition-colors duration-200 cursor-pointer relative z-10 ${
                    mode === "signup" ? "text-white" : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  {mode === "signup" && (
                    <motion.div
                      layoutId="activeAuthTabPill"
                      className="absolute inset-0 bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-500 rounded-lg shadow-md shadow-indigo-600/30 -z-10"
                      transition={{ type: "spring", stiffness: 500, damping: 32 }}
                    />
                  )}
                  Sign Up
                </button>
              </div>

              {/* Error and Success Banner Messages */}
              <AnimatePresence>
                {errorMessage && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs font-semibold flex items-center gap-2"
                  >
                    <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                    <span>{errorMessage}</span>
                  </motion.div>
                )}

                {successMessage && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-semibold flex items-center gap-2"
                  >
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>{successMessage}</span>
                  </motion.div>
                )}
              </AnimatePresence>
            {/* 3D Perspective Form Transition Container */}
            <div style={{ perspective: "1000px" }} className="relative z-10">
              <AnimatePresence mode="wait" initial={false}>
                {mode === "signin" ? (
                  <motion.form
                    key="signin"
                    initial={{ rotateY: -70, opacity: 0, scale: 0.94 }}
                    animate={{ rotateY: 0, opacity: 1, scale: 1 }}
                    exit={{ rotateY: 70, opacity: 0, scale: 0.94 }}
                    transition={{
                      duration: 0.32,
                      ease: [0.22, 1, 0.36, 1],
                    }}
                    onSubmit={handleSignIn}
                    className="space-y-4 origin-center"
                  >
                    <div>
                      <label className="text-[10px] font-bold text-slate-400 tracking-wider uppercase block mb-1.5">
                        EMAIL ADDRESS
                      </label>
                      <div className="relative">
                        <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                        <input
                          id="login-email"
                          type="email"
                          required
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="you@example.com"
                          className="bg-slate-900/60 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-xs font-semibold text-white focus:border-indigo-500 outline-none w-full transition-all placeholder-slate-500"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-[10px] font-bold text-slate-400 tracking-wider uppercase block mb-1.5">
                        PASSWORD
                      </label>
                      <div className="relative">
                        <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                        <input
                          id="login-password"
                          type={showPassword ? "text" : "password"}
                          required
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder="••••••••"
                          className="bg-slate-900/60 border border-white/10 rounded-xl py-3 pl-10 pr-10 text-xs font-semibold text-white focus:border-indigo-500 outline-none w-full transition-all placeholder-slate-500"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 transition-colors"
                        >
                          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    {/* Remember Me & Forgot Password Row */}
                    <div className="flex items-center justify-between text-[11px] pt-1">
                      <label className="flex items-center gap-2 font-bold text-slate-400 cursor-pointer select-none group">
                        <div
                          onClick={() => setRememberMe(!rememberMe)}
                          className={`w-4 h-4 rounded border transition-all flex items-center justify-center ${
                            rememberMe
                              ? "bg-gradient-to-r from-blue-600 to-indigo-600 border-indigo-500 text-white shadow-sm shadow-indigo-500/50"
                              : "bg-slate-900/90 border-white/20 group-hover:border-white/40 text-transparent"
                          }`}
                        >
                          <Check className="w-3 h-3 stroke-[3]" />
                        </div>
                        <span className="text-[11px] font-bold tracking-wider text-slate-400 group-hover:text-slate-200 transition-colors">
                          REMEMBER ME
                        </span>
                      </label>
                      <a
                        href="#"
                        onClick={(e) => {
                          e.preventDefault();
                          setErrorMessage("Password reset link will be sent if account exists.");
                        }}
                        className="font-semibold text-indigo-400 hover:text-indigo-300 transition-colors"
                      >
                        Forgot password?
                      </a>
                    </div>

                    <button
                      id="login-submit"
                      type="submit"
                      disabled={loading}
                      className="w-full py-3.5 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-500 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs shadow-lg shadow-indigo-600/30 transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50 mt-2"
                    >
                      {loading ? (
                        <span>Authenticating...</span>
                      ) : (
                        <>
                          <span>Sign In</span>
                          <ArrowRight className="w-4 h-4" />
                        </>
                      )}
                    </button>
                  </motion.form>
                ) : (
                  <motion.form
                    key="signup"
                    initial={{ rotateY: 70, opacity: 0, scale: 0.94 }}
                    animate={{ rotateY: 0, opacity: 1, scale: 1 }}
                    exit={{ rotateY: -70, opacity: 0, scale: 0.94 }}
                    transition={{
                      duration: 0.32,
                      ease: [0.22, 1, 0.36, 1],
                    }}
                    onSubmit={handleSignUp}
                    className="space-y-3.5 origin-center"
                  >
                    <div>
                      <label className="text-[10px] font-bold text-slate-400 tracking-wider uppercase block mb-1">
                        FULL NAME
                      </label>
                      <div className="relative">
                        <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                        <input
                          id="signup-name"
                          type="text"
                          required
                          value={fullName}
                          onChange={(e) => setFullName(e.target.value)}
                          placeholder="Alex Mercer"
                          className="bg-slate-900/60 border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-xs font-semibold text-white focus:border-indigo-500 outline-none w-full transition-all placeholder-slate-500"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-[10px] font-bold text-slate-400 tracking-wider uppercase block mb-1">
                        EMAIL ADDRESS
                      </label>
                      <div className="relative">
                        <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                        <input
                          id="signup-email"
                          type="email"
                          required
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="alex@example.com"
                          className="bg-slate-900/60 border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-xs font-semibold text-white focus:border-indigo-500 outline-none w-full transition-all placeholder-slate-500"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-[10px] font-bold text-slate-400 tracking-wider uppercase block mb-1">
                        PASSWORD
                      </label>
                      <div className="relative">
                        <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                        <input
                          id="signup-password"
                          type={showPassword ? "text" : "password"}
                          required
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder="At least 6 characters"
                          className="bg-slate-900/60 border border-white/10 rounded-xl py-2.5 pl-10 pr-10 text-xs font-semibold text-white focus:border-indigo-500 outline-none w-full transition-all placeholder-slate-500"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 transition-colors"
                        >
                          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="text-[10px] font-bold text-slate-400 tracking-wider uppercase block mb-1">
                        CONFIRM PASSWORD
                      </label>
                      <div className="relative">
                        <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                        <input
                          id="signup-confirm-password"
                          type={showPassword ? "text" : "password"}
                          required
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          placeholder="Repeat password"
                          className="bg-slate-900/60 border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-xs font-semibold text-white focus:border-indigo-500 outline-none w-full transition-all placeholder-slate-500"
                        />
                      </div>
                    </div>

                    <button
                      id="signup-submit"
                      type="submit"
                      disabled={loading}
                      className="w-full py-3.5 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-500 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs shadow-lg shadow-indigo-600/30 transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50 mt-2"
                    >
                      {loading ? (
                        <span>Creating Account...</span>
                      ) : (
                        <>
                          <span>Create Account & Verify</span>
                          <ArrowRight className="w-4 h-4" />
                        </>
                      )}
                    </button>
                  </motion.form>
                )}
              </AnimatePresence>
            </div>

              {/* Divider */}
              <div className="relative flex items-center justify-center my-2 relative z-10">
                <div className="w-full border-t border-white/[0.08]" />
                <span className="absolute px-3 bg-[#090e1a] text-[10px] font-extrabold text-slate-500 uppercase tracking-widest">
                  OR CONTINUE WITH
                </span>
              </div>

              {/* Google OAuth Button */}
              <div className="relative z-10">
                <button
                  id="login-google"
                  type="button"
                  onClick={handleGoogleSignIn}
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-3 py-3 px-4 rounded-xl bg-white/[0.05] hover:bg-white/[0.09] border border-white/[0.1] text-xs font-bold text-slate-200 transition-all cursor-pointer shadow-lg disabled:opacity-50"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24">
                    <path
                      fill="#EA4335"
                      d="M12 5c1.6 0 3 .6 4.1 1.6l3.1-3.1C17.3 1.7 14.8 1 12 1 7.5 1 3.7 3.6 1.9 7.3l3.7 2.9C6.5 7.3 9 5 12 5z"
                    />
                    <path
                      fill="#4285F4"
                      d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.5h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5 3.7-8.8z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.6 14.8c-.2-.7-.4-1.5-.4-2.3s.2-1.6.4-2.3L1.9 7.3C.7 9.7 0 12.3 0 15s.7 5.3 1.9 7.7l3.7-2.9c-.8-.9-1.3-2.1-1.3-3.6z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3 0-5.5-2.3-6.4-5.2L1.9 16C3.7 19.7 7.5 23 12 23z"
                    />
                  </svg>
                  <span>Continue with Google</span>
                </button>
              </div>
            </>
          )}
        </motion.div>
      </div>
    </div>
  );
}
