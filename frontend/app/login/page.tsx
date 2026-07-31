"use client";

import React, { useState } from "react";
import {
  Code2,
  Mail,
  Lock,
  ArrowRight,
  Zap,
  BarChart3,
  Target,
  Eye,
  EyeOff,
  User,
} from "lucide-react";
import { motion } from "framer-motion";
import { useAuth } from "@/lib/auth";

export default function LoginPage() {
  const { login, isLoading } = useAuth();
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  if (isLoading) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#060a14]">
        <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password || (mode === "signup" && !name)) {
      setErrorMessage("Please fill in all required fields.");
      return;
    }
    setLoading(true);
    setErrorMessage("");

    setTimeout(() => {
      setLoading(false);
      login(email, name || email.split("@")[0]);
    }, 600);
  };

  const handleOAuth = (provider: string) => {
    setLoading(true);
    setTimeout(() => {
      login(`${provider}_user@skillscatalyst.app`, `${provider}_user`);
    }, 400);
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#060a15] text-slate-100 flex items-center justify-center p-4 sm:p-6 lg:p-10 overflow-y-auto select-none">
      {/* Subtle tech background grid pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b18_1px,transparent_1px),linear-gradient(to_bottom,#1e293b18_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none" />

      {/* Ambient glowing background blur lights */}
      <div className="absolute top-1/3 left-1/4 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[550px] bg-blue-600/10 rounded-full blur-[150px] pointer-events-none" />
      <div className="absolute bottom-1/3 right-1/4 w-[500px] h-[500px] bg-indigo-600/10 rounded-full blur-[150px] pointer-events-none" />

      <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-center relative z-10 my-auto py-4">
        
        {/* ── LEFT COLUMN: BRANDING & FEATURES ── */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="lg:col-span-7 space-y-4 sm:space-y-5"
        >
          {/* Brand Logo */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-cyan-400 flex items-center justify-center text-white shadow-lg shadow-blue-500/25">
              <Code2 className="w-4 h-4 stroke-[2.5]" />
            </div>
            <span className="text-xl sm:text-2xl font-black tracking-tight text-white">SkillsCatalyst</span>
          </div>

          {/* Pill Badge */}
          <div>
            <span className="inline-flex items-center px-3 py-1 rounded-full bg-[#131b2e] border border-indigo-500/25 text-[10px] font-extrabold tracking-widest text-indigo-400 uppercase">
              ENTERPRISE AI CAREER ACCELERATOR
            </span>
          </div>

          {/* Main Headline */}
          <div className="space-y-1">
            <h1 className="text-3xl sm:text-4xl lg:text-[40px] font-black tracking-tight text-white leading-tight">
              Master Tech Interviews.
            </h1>
            <h2 className="text-3xl sm:text-4xl lg:text-[40px] font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-300 to-cyan-400 leading-tight">
              Accelerate Your Career.
            </h2>
          </div>

          {/* Subtitle Paragraph */}
          <p className="text-slate-400 text-xs sm:text-sm leading-relaxed max-w-xl">
            The all-in-one AI platform for top-tier technology roles. Prepare with structured roadmaps, practice company-wise DSA problems, and master your technical interviews.
          </p>

          {/* Metrics Row */}
          <div className="grid grid-cols-3 gap-3 max-w-md pt-0.5">
            <div className="bg-[#0b101d]/80 border border-slate-800/80 rounded-xl p-3 text-center backdrop-blur-md">
              <div className="text-lg sm:text-xl font-black text-blue-400">500+</div>
              <div className="text-[9px] sm:text-[10px] font-extrabold text-slate-400 tracking-wider uppercase mt-0.5">LEETCODE QUESTIONS</div>
            </div>
            <div className="bg-[#0b101d]/80 border border-slate-800/80 rounded-xl p-3 text-center backdrop-blur-md">
              <div className="text-lg sm:text-xl font-black text-indigo-400">100+</div>
              <div className="text-[9px] sm:text-[10px] font-extrabold text-slate-400 tracking-wider uppercase mt-0.5">TECH COMPANIES</div>
            </div>
            <div className="bg-[#0b101d]/80 border border-slate-800/80 rounded-xl p-3 text-center backdrop-blur-md">
              <div className="text-lg sm:text-xl font-black text-cyan-400">98%</div>
              <div className="text-[9px] sm:text-[10px] font-extrabold text-slate-400 tracking-wider uppercase mt-0.5">ATS PRECISION</div>
            </div>
          </div>

          {/* Feature List */}
          <div className="space-y-2.5 pt-1 max-w-xl">
            {/* Feature 1 */}
            <div className="flex items-start gap-3.5 p-3 rounded-xl bg-[#0b101d]/60 border border-slate-800/70 hover:border-slate-700/80 transition-all">
              <div className="w-8 h-8 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 shrink-0 mt-0.5">
                <Zap className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-xs font-bold text-white">Roadmap & Resources</h3>
                <p className="text-[11px] text-slate-400 leading-snug mt-0.5">
                  Personalized 5-tier learning pathways, YouTube playlists & certifications for any skill.
                </p>
              </div>
            </div>

            {/* Feature 2 */}
            <div className="flex items-start gap-3.5 p-3 rounded-xl bg-[#0b101d]/60 border border-slate-800/70 hover:border-slate-700/80 transition-all">
              <div className="w-8 h-8 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 shrink-0 mt-0.5">
                <BarChart3 className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-xs font-bold text-white">Topic-wise & Company-wise DSA Questions</h3>
                <p className="text-[11px] text-slate-400 leading-snug mt-0.5">
                  500+ frequency-ranked LeetCode problems for Google, Meta, Amazon, Microsoft & Apple.
                </p>
              </div>
            </div>

            {/* Feature 3 */}
            <div className="flex items-start gap-3.5 p-3 rounded-xl bg-[#0b101d]/60 border border-slate-800/70 hover:border-slate-700/80 transition-all">
              <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 shrink-0 mt-0.5">
                <Target className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-xs font-bold text-white">Interview Prep + Resume Review</h3>
                <p className="text-[11px] text-slate-400 leading-snug mt-0.5">
                  Multi-stage ATS resume scoring, recruiter simulation & real-time AI mock interviews.
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* ── RIGHT COLUMN: AUTH CARD ── */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: "easeOut", delay: 0.1 }}
          className="lg:col-span-5"
        >
          <div className="bg-[#0b101d]/95 backdrop-blur-xl border border-slate-800/90 rounded-2xl p-5 sm:p-7 shadow-2xl shadow-black/80 max-w-[420px] mx-auto lg:ml-auto">
            
            {/* Header */}
            <div className="text-center mb-5">
              <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                {mode === "login" ? "Welcome Back" : "Create Account"}
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                {mode === "login"
                  ? "Sign in to your workspace to continue"
                  : "Join thousands of developers accelerating their tech careers"}
              </p>
            </div>

            {/* Toggle Switch */}
            <div className="grid grid-cols-2 p-1 bg-[#131b2e] rounded-xl border border-slate-800/80 mb-5">
              <button
                type="button"
                onClick={() => { setMode("login"); setErrorMessage(""); }}
                className={`py-1.5 text-xs font-bold rounded-lg transition-all ${
                  mode === "login"
                    ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/40"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                Login
              </button>
              <button
                type="button"
                onClick={() => { setMode("signup"); setErrorMessage(""); }}
                className={`py-1.5 text-xs font-bold rounded-lg transition-all ${
                  mode === "signup"
                    ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/40"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                Sign Up
              </button>
            </div>

            {/* Error banner */}
            {errorMessage && (
              <div className="mb-4 p-2.5 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-bold text-center">
                {errorMessage}
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-3.5">
              {mode === "signup" && (
                <div>
                  <label className="text-[10px] font-extrabold text-slate-400 tracking-wider uppercase block mb-1">
                    FULL NAME
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Alex Mercer"
                      className="w-full pl-9 pr-3.5 py-2.5 text-xs font-semibold text-white bg-[#131b2e] border border-slate-800 rounded-xl focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all placeholder:text-slate-600"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="text-[10px] font-extrabold text-slate-400 tracking-wider uppercase block mb-1">
                  EMAIL ADDRESS
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="w-full pl-9 pr-3.5 py-2.5 text-xs font-semibold text-white bg-[#131b2e] border border-slate-800 rounded-xl focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all placeholder:text-slate-600"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-extrabold text-slate-400 tracking-wider uppercase block mb-1">
                  PASSWORD
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-9 pr-9 py-2.5 text-xs font-semibold text-white bg-[#131b2e] border border-slate-800 rounded-xl focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all placeholder:text-slate-600"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                  >
                    {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              {/* Options row */}
              <div className="flex items-center justify-between text-xs pt-0.5">
                <label className="flex items-center gap-2 cursor-pointer text-slate-400 hover:text-slate-200">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-3.5 h-3.5 rounded border-slate-700 bg-[#131b2e] text-indigo-600 focus:ring-indigo-500 focus:ring-offset-0"
                  />
                  <span className="text-[10px] font-bold tracking-wider uppercase">REMEMBER ME</span>
                </label>
                {mode === "login" && (
                  <button
                    type="button"
                    onClick={() => alert("Password reset link will be sent to your email.")}
                    className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 transition-colors"
                  >
                    Forgot password?
                  </button>
                )}
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 px-5 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-indigo-500 hover:from-blue-500 hover:to-indigo-400 text-white font-black text-xs tracking-wide transition-all shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 mt-1"
              >
                {loading ? (
                  <span>Processing...</span>
                ) : (
                  <>
                    <span>{mode === "login" ? "Sign In" : "Create Account"}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </>
                )}
              </button>
            </form>

            {/* Divider */}
            <div className="relative flex items-center justify-center my-5">
              <div className="w-full border-t border-slate-800/80" />
              <span className="absolute px-2.5 bg-[#0b101d] text-[9px] font-extrabold text-slate-500 uppercase tracking-widest">
                OR CONTINUE WITH
              </span>
            </div>

            {/* Google OAuth Button */}
            <button
              type="button"
              onClick={() => handleOAuth("google")}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-[#131b2e] hover:bg-[#18233c] border border-slate-800 text-xs font-bold text-slate-200 transition-all cursor-pointer shadow-sm"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span>Continue with Google</span>
            </button>
          </div>
        </motion.div>

      </div>
    </div>
  );
}
