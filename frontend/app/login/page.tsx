"use client";

import React, { useEffect, useState } from "react";
import {
  Code2,
  Mail,
  Lock,
  ArrowRight,
  ShieldCheck,
  GitBranch,
  Globe,
} from "lucide-react";
import { motion } from "framer-motion";
import { useAuth } from "@/lib/auth";

export default function LoginPage() {
  const { login, session, isLoading } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // If already logged in the AuthProvider will auto-redirect,
  // but render nothing while loading to avoid flash
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setErrorMessage("Please enter both email and password.");
      return;
    }
    setLoading(true);
    setErrorMessage("");

    // Simulate auth delay then call login() — which also does router.replace("/dashboard")
    setTimeout(() => {
      setLoading(false);
      login(email, "default_user");
    }, 600);
  };

  const handleOAuth = (provider: string) => {
    setLoading(true);
    setTimeout(() => {
      login(`${provider}_user@skillpath.app`, `${provider}_user`);
    }, 400);
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center py-10 px-4 select-none">
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="w-full max-w-md glass rounded-3xl p-8 border border-white/[0.1] shadow-2xl space-y-7 relative overflow-hidden"
      >
        {/* Ambient glow */}
        <div className="absolute -top-16 left-1/2 -translate-x-1/2 w-64 h-32 bg-indigo-500/20 blur-3xl rounded-full pointer-events-none" />

        {/* Brand Header */}
        <div className="text-center space-y-3 relative z-10">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-cyan-400 text-white shadow-xl shadow-indigo-500/30 animate-pulse-glow mb-1">
            <Code2 className="w-7 h-7 stroke-[2.5]" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-white tracking-tight">
              Welcome to SkillPath
            </h1>
            <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto leading-relaxed">
              Sign in to access AI mentor guidance, company-wise LeetCode question banks & career analytics.
            </p>
          </div>
        </div>

        {/* Login Form */}
        <form onSubmit={handleLogin} className="space-y-4 relative z-10">
          {errorMessage && (
            <div className="p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs font-bold text-center">
              {errorMessage}
            </div>
          )}

          <div>
            <label className="text-[11px] font-extrabold text-slate-400 tracking-wider uppercase block mb-1.5">
              Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                id="login-email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@company.com"
                className="input-glass w-full pl-10 pr-4 py-3 text-xs font-semibold text-white rounded-xl focus:border-indigo-500 outline-none"
              />
            </div>
          </div>

          <div>
            <label className="text-[11px] font-extrabold text-slate-400 tracking-wider uppercase block mb-1.5">
              Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                id="login-password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="input-glass w-full pl-10 pr-4 py-3 text-xs font-semibold text-white rounded-xl focus:border-indigo-500 outline-none"
              />
            </div>
          </div>

          <div className="flex items-center justify-between text-xs pt-1">
            <label className="flex items-center gap-2 cursor-pointer text-slate-400 hover:text-slate-200">
              <input
                id="login-remember"
                type="checkbox"
                defaultChecked
                className="rounded border-slate-700 text-indigo-600 focus:ring-indigo-500 bg-[#0b1222]"
              />
              <span className="font-medium">Remember me</span>
            </label>
            <button
              type="button"
              onClick={() => alert("Password reset coming soon.")}
              className="font-bold text-indigo-400 hover:text-indigo-300 transition-colors"
            >
              Forgot password?
            </button>
          </div>

          <button
            id="login-submit"
            type="submit"
            disabled={loading}
            className="w-full py-3.5 px-6 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white font-extrabold text-xs tracking-wide transition-all shadow-xl shadow-indigo-600/30 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 mt-2"
          >
            {loading ? (
              <span>Signing In...</span>
            ) : (
              <>
                <span>Sign In to Platform</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Divider */}
        <div className="relative flex items-center justify-center my-2">
          <div className="w-full border-t border-white/[0.08]" />
          <span className="absolute px-3 bg-[#0d1424] text-[10px] font-extrabold text-slate-500 uppercase tracking-widest">
            OR CONTINUE WITH
          </span>
        </div>

        {/* OAuth Buttons */}
        <div className="grid grid-cols-2 gap-3 relative z-10">
          <button
            id="login-google"
            type="button"
            onClick={() => handleOAuth("google")}
            className="flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-white/[0.03] hover:bg-white/[0.08] border border-white/[0.08] text-xs font-bold text-slate-200 transition-all cursor-pointer"
          >
            <Globe className="w-4 h-4 text-rose-400" />
            <span>Google</span>
          </button>

          <button
            id="login-github"
            type="button"
            onClick={() => handleOAuth("github")}
            className="flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-white/[0.03] hover:bg-white/[0.08] border border-white/[0.08] text-xs font-bold text-slate-200 transition-all cursor-pointer"
          >
            <GitBranch className="w-4 h-4 text-slate-300" />
            <span>GitHub</span>
          </button>
        </div>

        {/* Footer */}
        <div className="pt-2 text-center text-[11px] text-slate-500 flex items-center justify-center gap-1.5 font-medium">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          <span>Protected by Enterprise SSL Encryption</span>
        </div>
      </motion.div>
    </div>
  );
}
