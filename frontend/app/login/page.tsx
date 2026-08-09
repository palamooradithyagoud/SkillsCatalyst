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
  Star,
  Award,
  Globe,
  TrendingUp,
  Building2,
  Cpu,
  CheckCircle,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/lib/supabase";

import SkillsCatalystLogo from "@/components/SkillsCatalystLogo";

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
      <div className="fixed inset-0 z-[99999] flex flex-col items-center justify-center bg-[#040711] text-white">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
          className="w-12 h-12 border-3 border-indigo-500 border-t-transparent rounded-full mb-4 shadow-xl shadow-indigo-500/40"
        />
        <p className="text-xs font-bold text-slate-300 tracking-widest uppercase animate-pulse">
          Initializing SkillsCatalyst Workspace...
        </p>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[9999] w-screen h-screen min-h-screen overflow-y-auto overflow-x-hidden bg-[#040711] text-white flex flex-col-reverse lg:flex-row m-0 p-0 select-none">
      {/* ── Dynamic Ambient Floating Background Mesh & Grid ── */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <motion.div
          animate={{
            y: [0, -30, 0],
            scale: [1, 1.1, 1],
            opacity: [0.25, 0.45, 0.25],
          }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-[-15%] left-[-10%] w-[700px] h-[700px] bg-gradient-to-br from-blue-600/35 via-indigo-600/20 to-cyan-500/10 blur-[170px] rounded-full"
        />
        <motion.div
          animate={{
            y: [0, 30, 0],
            scale: [1, 1.12, 1],
            opacity: [0.2, 0.4, 0.2],
          }}
          transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
          className="absolute bottom-[-15%] right-[-10%] w-[750px] h-[750px] bg-gradient-to-br from-indigo-600/35 via-purple-600/20 to-blue-600/10 blur-[180px] rounded-full"
        />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff07_1px,transparent_1px),linear-gradient(to_bottom,#ffffff07_1px,transparent_1px)] bg-[size:3.5rem_3.5rem] [mask-image:radial-gradient(ellipse_70%_60%_at_50%_50%,#000_75%,transparent_100%)]" />
      </div>

      {/* ── LEFT COLUMN: Marketing & Showcase Banner (Desktop Left, Mobile Bottom) ── */}
      <div className="w-full lg:w-[58%] p-5 sm:p-10 lg:p-16 flex flex-col justify-between relative z-10 min-h-0 lg:min-h-screen">
        <div className="space-y-6 sm:space-y-8 max-w-2xl mx-auto lg:mx-0">
          {/* Logo & Live Status Badge Header (Desktop only, Mobile header inside Auth Card) */}
          <div className="hidden lg:flex items-center justify-between">
            <SkillsCatalystLogo size="md" showText animated />

            <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-[11px] font-extrabold shadow-sm">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <span>AI Engine Active</span>
            </div>
          </div>

          {/* Category Pill Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 sm:px-4 py-1.5 rounded-full bg-gradient-to-r from-blue-500/20 via-indigo-500/20 to-purple-500/20 border border-indigo-500/40 text-indigo-300 text-[10px] sm:text-[11px] font-black uppercase tracking-widest shadow-md">
            <Cpu className="w-3.5 h-3.5 text-indigo-400" />
            <span>ENTERPRISE AI CAREER ACCELERATOR</span>
          </div>

          {/* Hero Headline */}
          <h1 className="text-3xl sm:text-5xl lg:text-[56px] font-black tracking-tight leading-[1.08] text-white">
            Master Tech Interviews.<br />
            <span className="bg-gradient-to-r from-blue-400 via-indigo-300 to-cyan-300 bg-clip-text text-transparent">
              Accelerate Your Career.
            </span>
          </h1>

          {/* Description */}
          <p className="text-slate-300 text-xs sm:text-base leading-relaxed font-medium">
            The all-in-one platform for software engineers. Practice company-specific DSA problems, master system design with 5-tier roadmaps, and land top-tier offer packages.
          </p>

          {/* 3 Stats Grid */}
          <div className="grid grid-cols-3 gap-2.5 sm:gap-4">
            <motion.div
              whileHover={{ y: -4, scale: 1.02 }}
              className="bg-[#080e1d]/85 border border-white/15 hover:border-blue-500/50 rounded-2xl p-3 sm:p-4 text-center backdrop-blur-xl shadow-xl shadow-black/40 transition-all group"
            >
              <div className="text-xl sm:text-3xl font-black text-white group-hover:text-blue-400 transition-colors">
                500+
              </div>
              <div className="text-[9px] sm:text-[11px] font-extrabold text-slate-400 uppercase tracking-wider mt-1">
                DSA QUESTIONS
              </div>
            </motion.div>

            <motion.div
              whileHover={{ y: -4, scale: 1.02 }}
              className="bg-[#080e1d]/85 border border-white/15 hover:border-indigo-500/50 rounded-2xl p-3 sm:p-4 text-center backdrop-blur-xl shadow-xl shadow-black/40 transition-all group"
            >
              <div className="text-xl sm:text-3xl font-black text-white group-hover:text-indigo-400 transition-colors">
                100+
              </div>
              <div className="text-[9px] sm:text-[11px] font-extrabold text-slate-400 uppercase tracking-wider mt-1">
                TECH COMPANIES
              </div>
            </motion.div>

            <motion.div
              whileHover={{ y: -4, scale: 1.02 }}
              className="bg-[#080e1d]/85 border border-white/15 hover:border-cyan-500/50 rounded-2xl p-3 sm:p-4 text-center backdrop-blur-xl shadow-xl shadow-black/40 transition-all group"
            >
              <div className="text-xl sm:text-3xl font-black text-white group-hover:text-cyan-400 transition-colors">
                98%
              </div>
              <div className="text-[9px] sm:text-[11px] font-extrabold text-slate-400 uppercase tracking-wider mt-1">
                ATS PRECISION
              </div>
            </motion.div>
          </div>

          {/* Company Hiring Ribbon Badges */}
          <div>
            <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest block mb-2.5">
              PREPARE FOR RECRUITERS AT TOP COMPANIES
            </span>
            <div className="flex flex-wrap gap-1.5 sm:gap-2">
              {["Google", "Meta", "Amazon", "Microsoft", "Apple", "Netflix", "Uber"].map((company) => (
                <span
                  key={company}
                  className="px-2.5 py-1 rounded-xl bg-slate-900/80 border border-white/10 hover:border-indigo-500/40 text-xs font-bold text-slate-200 hover:text-white transition-all backdrop-blur-md shadow-sm"
                >
                  {company}
                </span>
              ))}
            </div>
          </div>

          {/* 3 Feature Banner Cards Stacked Vertically */}
          <div className="space-y-3">
            <div className="bg-[#080e1d]/75 hover:bg-[#0b152d] border border-white/15 hover:border-indigo-500/40 rounded-2xl p-3.5 sm:p-4 flex items-start gap-3.5 transition-all duration-200 group shadow-md">
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-indigo-500/20 border border-indigo-500/35 flex items-center justify-center text-indigo-300 shrink-0 group-hover:scale-110 transition-transform">
                <Zap className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
              <div>
                <h3 className="text-xs sm:text-sm font-extrabold text-white mb-0.5 group-hover:text-indigo-300 transition-colors">
                  Interactive Learning & Pathways
                </h3>
                <p className="text-[11px] sm:text-xs text-slate-400 leading-snug font-medium">
                  Curated 5-tier skill pathways with embedded video lectures, quiz checks & progress tracking.
                </p>
              </div>
            </div>

            <div className="bg-[#080e1d]/75 hover:bg-[#0b152d] border border-white/15 hover:border-blue-500/40 rounded-2xl p-3.5 sm:p-4 flex items-start gap-3.5 transition-all duration-200 group shadow-md">
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-blue-500/20 border border-blue-500/35 flex items-center justify-center text-blue-300 shrink-0 group-hover:scale-110 transition-transform">
                <BarChart3 className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
              <div>
                <h3 className="text-xs sm:text-sm font-extrabold text-white mb-0.5 group-hover:text-blue-300 transition-colors">
                  Topic & Company-Wise Practice Sandbox
                </h3>
                <p className="text-[11px] sm:text-xs text-slate-400 leading-snug font-medium">
                  500+ frequency-ranked questions for Google, Meta, Amazon, Microsoft & Apple with live execution.
                </p>
              </div>
            </div>

            <div className="bg-[#080e1d]/75 hover:bg-[#0b152d] border border-white/15 hover:border-cyan-500/40 rounded-2xl p-3.5 sm:p-4 flex items-start gap-3.5 transition-all duration-200 group shadow-md">
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-cyan-500/20 border border-cyan-500/35 flex items-center justify-center text-cyan-300 shrink-0 group-hover:scale-110 transition-transform">
                <Target className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
              <div>
                <h3 className="text-xs sm:text-sm font-extrabold text-white mb-0.5 group-hover:text-cyan-300 transition-colors">
                  AI Resume Analyzer & Mock Interviewer
                </h3>
                <p className="text-[11px] sm:text-xs text-slate-400 leading-snug font-medium">
                  Multi-stage ATS score breakdowns, keyphrase gap analysis & real-time conversational AI coaching.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Security Badge */}
        <div className="pt-6 text-[11px] sm:text-xs text-slate-500 flex items-center gap-2 border-t border-white/10 max-w-2xl mx-auto lg:mx-0 mt-6 lg:mt-0">
          <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>Secured with Supabase Identity, JWT Auth & SSL 256-Bit Standard Encryption</span>
        </div>
      </div>

      {/* ── RIGHT COLUMN: Floating Glassmorphic 3D Interactive Auth Box (Mobile Top) ── */}
      <div className="w-full lg:w-[42%] p-4 sm:p-10 lg:p-12 flex items-center justify-center relative z-10 pt-6 lg:pt-12">
        <motion.div
          initial={{ opacity: 0, y: 25, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="w-full max-w-[480px] bg-[#070b16]/95 border border-white/20 rounded-[28px] sm:rounded-[32px] p-5 sm:p-9 shadow-2xl shadow-indigo-950/70 backdrop-blur-3xl space-y-5 sm:space-y-6 relative overflow-hidden my-auto"
        >
          {/* Mobile-only Top Brand Header */}
          <div className="lg:hidden flex items-center justify-between border-b border-white/10 pb-3.5 mb-2">
            <SkillsCatalystLogo size="sm" showText animated />
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-[10px] font-black">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
              <span>AI Engine Active</span>
            </div>
          </div>

          {/* Ambient Top Glow Inside Card */}
          <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-80 h-40 bg-gradient-to-r from-blue-600/35 to-indigo-600/35 blur-3xl rounded-full pointer-events-none" />

          {/* Card Header Title */}
          <div className="text-center space-y-1 relative z-10">
            <h2 className="text-xl sm:text-3xl font-black text-white tracking-tight">
              {unverifiedEmail ? "Verify Email" : mode === "signin" ? "Welcome Back" : "Create Account"}
            </h2>
            <p className="text-[11px] sm:text-xs text-slate-400 font-medium">
              {unverifiedEmail
                ? "Action required to access your workspace"
                : mode === "signin"
                ? "Sign in to your workspace to continue learning"
                : "Join SkillsCatalyst to start your career acceleration"}
            </p>
          </div>

          {/* Unverified Email Handling */}
          {unverifiedEmail ? (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4 relative z-10"
            >
              <div className="p-5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-200 text-center space-y-2">
                <div className="w-12 h-12 rounded-full bg-amber-500/20 flex items-center justify-center mx-auto text-amber-400 shadow-md">
                  <Mail className="w-6 h-6" />
                </div>
                <h3 className="text-xs font-extrabold text-amber-300">Email Verification Required</h3>
                <p className="text-[11px] text-slate-300 leading-relaxed">
                  We sent a verification link to <span className="font-bold text-white">{unverifiedEmail}</span>.
                  Please check your inbox and click the link to verify your account.
                </p>
              </div>

              {resendSent && (
                <div className="p-3.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-semibold flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Verification email resent! Please check your inbox or spam folder.</span>
                </div>
              )}

              {errorMessage && (
                <div className="p-3.5 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs font-semibold flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              <button
                type="button"
                onClick={handleResendVerification}
                disabled={resendLoading}
                className="w-full py-3.5 px-4 rounded-xl bg-indigo-600/30 hover:bg-indigo-600/40 border border-indigo-500/40 text-indigo-200 font-bold text-xs transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
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
                className="w-full text-center text-xs text-slate-400 hover:text-white font-semibold transition-colors cursor-pointer pt-1"
              >
                ← Back to Sign In
              </button>
            </motion.div>
          ) : (
            <>
              {/* Animated Mode Switcher Pill */}
              <div className="flex rounded-xl bg-[#03060d] p-1 border border-white/15 relative z-10 overflow-hidden shadow-inner">
                <button
                  type="button"
                  onClick={() => switchMode("signin")}
                  className={`flex-1 py-3 text-xs font-extrabold rounded-lg transition-colors duration-200 cursor-pointer relative z-10 ${
                    mode === "signin" ? "text-white" : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  {mode === "signin" && (
                    <motion.div
                      layoutId="activeAuthTabPill"
                      className="absolute inset-0 bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-600 rounded-lg shadow-md shadow-indigo-600/50 -z-10"
                      transition={{ type: "spring", stiffness: 450, damping: 30 }}
                    />
                  )}
                  Login
                </button>
                <button
                  type="button"
                  onClick={() => switchMode("signup")}
                  className={`flex-1 py-3 text-xs font-extrabold rounded-lg transition-colors duration-200 cursor-pointer relative z-10 ${
                    mode === "signup" ? "text-white" : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  {mode === "signup" && (
                    <motion.div
                      layoutId="activeAuthTabPill"
                      className="absolute inset-0 bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-600 rounded-lg shadow-md shadow-indigo-600/50 -z-10"
                      transition={{ type: "spring", stiffness: 450, damping: 30 }}
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
                    className="p-3.5 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs font-semibold flex items-center gap-2"
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
                    className="p-3.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-semibold flex items-center gap-2"
                  >
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>{successMessage}</span>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* 3D Form Card Flip Container */}
              <div style={{ perspective: "1000px" }} className="relative z-10">
                <AnimatePresence mode="wait" initial={false}>
                  {mode === "signin" ? (
                    <motion.form
                      key="signin"
                      initial={{ rotateY: -60, opacity: 0, scale: 0.95 }}
                      animate={{ rotateY: 0, opacity: 1, scale: 1 }}
                      exit={{ rotateY: 60, opacity: 0, scale: 0.95 }}
                      transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                      onSubmit={handleSignIn}
                      className="space-y-4.5 origin-center"
                    >
                      <div>
                        <label className="text-[10px] font-black text-slate-400 tracking-wider uppercase block mb-1.5">
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
                            className="bg-[#0c1224] border border-white/20 rounded-xl py-3 pl-10 pr-4 text-xs font-semibold text-white focus:border-indigo-400 focus:ring-4 focus:ring-indigo-500/25 outline-none w-full transition-all placeholder-slate-500 shadow-inner"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="text-[10px] font-black text-slate-400 tracking-wider uppercase block mb-1.5">
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
                            className="bg-[#0c1224] border border-white/20 rounded-xl py-3 pl-10 pr-10 text-xs font-semibold text-white focus:border-indigo-400 focus:ring-4 focus:ring-indigo-500/25 outline-none w-full transition-all placeholder-slate-500 shadow-inner"
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
                            className={`w-4.5 h-4.5 rounded border transition-all flex items-center justify-center ${
                              rememberMe
                                ? "bg-gradient-to-r from-blue-600 to-indigo-600 border-indigo-400 text-white shadow-sm shadow-indigo-500/50"
                                : "bg-slate-900 border-white/20 group-hover:border-white/40 text-transparent"
                            }`}
                          >
                            <Check className="w-3 h-3 stroke-[3]" />
                          </div>
                          <span className="text-[11px] font-extrabold tracking-wider text-slate-400 group-hover:text-slate-200 transition-colors">
                            REMEMBER ME
                          </span>
                        </label>
                        <a
                          href="#"
                          onClick={(e) => {
                            e.preventDefault();
                            setErrorMessage("Password reset link will be sent if account exists.");
                          }}
                          className="font-extrabold text-indigo-400 hover:text-indigo-300 transition-colors"
                        >
                          Forgot password?
                        </a>
                      </div>

                      <button
                        id="login-submit"
                        type="submit"
                        disabled={loading}
                        className="w-full py-4 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-600 hover:from-blue-500 hover:to-indigo-500 text-white font-extrabold text-xs shadow-xl shadow-indigo-600/40 hover:shadow-indigo-600/60 active:scale-[0.99] transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50 mt-2"
                      >
                        {loading ? (
                          <div className="flex items-center gap-2">
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            <span>Authenticating...</span>
                          </div>
                        ) : (
                          <>
                            <span>Sign In to Dashboard</span>
                            <ArrowRight className="w-4 h-4" />
                          </>
                        )}
                      </button>
                    </motion.form>
                  ) : (
                    <motion.form
                      key="signup"
                      initial={{ rotateY: 60, opacity: 0, scale: 0.95 }}
                      animate={{ rotateY: 0, opacity: 1, scale: 1 }}
                      exit={{ rotateY: -60, opacity: 0, scale: 0.95 }}
                      transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                      onSubmit={handleSignUp}
                      className="space-y-3.5 origin-center"
                    >
                      <div>
                        <label className="text-[10px] font-black text-slate-400 tracking-wider uppercase block mb-1">
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
                            className="bg-[#0c1224] border border-white/20 rounded-xl py-3 pl-10 pr-4 text-xs font-semibold text-white focus:border-indigo-400 focus:ring-4 focus:ring-indigo-500/25 outline-none w-full transition-all placeholder-slate-500 shadow-inner"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="text-[10px] font-black text-slate-400 tracking-wider uppercase block mb-1">
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
                            className="bg-[#0c1224] border border-white/20 rounded-xl py-3 pl-10 pr-4 text-xs font-semibold text-white focus:border-indigo-400 focus:ring-4 focus:ring-indigo-500/25 outline-none w-full transition-all placeholder-slate-500 shadow-inner"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="text-[10px] font-black text-slate-400 tracking-wider uppercase block mb-1">
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
                            className="bg-[#0c1224] border border-white/20 rounded-xl py-3 pl-10 pr-10 text-xs font-semibold text-white focus:border-indigo-400 focus:ring-4 focus:ring-indigo-500/25 outline-none w-full transition-all placeholder-slate-500 shadow-inner"
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
                        <label className="text-[10px] font-black text-slate-400 tracking-wider uppercase block mb-1">
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
                            className="bg-[#0c1224] border border-white/20 rounded-xl py-3 pl-10 pr-4 text-xs font-semibold text-white focus:border-indigo-400 focus:ring-4 focus:ring-indigo-500/25 outline-none w-full transition-all placeholder-slate-500 shadow-inner"
                          />
                        </div>
                      </div>

                      <button
                        id="signup-submit"
                        type="submit"
                        disabled={loading}
                        className="w-full py-4 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-600 hover:from-blue-500 hover:to-indigo-500 text-white font-extrabold text-xs shadow-xl shadow-indigo-600/40 hover:shadow-indigo-600/60 active:scale-[0.99] transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50 mt-2"
                      >
                        {loading ? (
                          <div className="flex items-center gap-2">
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            <span>Creating Account...</span>
                          </div>
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
              <div className="relative flex items-center justify-center my-3 relative z-10">
                <div className="w-full border-t border-white/15" />
                <span className="absolute px-3 bg-[#070b16] text-[10px] font-black text-slate-400 uppercase tracking-widest">
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
                  className="w-full flex items-center justify-center gap-3 py-3.5 px-4 rounded-xl bg-white/[0.07] hover:bg-white/[0.12] border border-white/20 text-xs font-extrabold text-slate-200 hover:text-white transition-all cursor-pointer shadow-md disabled:opacity-50"
                >
                  <svg className="w-4.5 h-4.5 shrink-0" viewBox="0 0 24 24">
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

