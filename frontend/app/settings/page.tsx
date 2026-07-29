"use client";

import React, { useState } from "react";
import { Settings, User, Key, Bell, Shield } from "lucide-react";

export default function SettingsPage() {
  const [userName, setUserName] = useState("Palamoor");

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="flex items-center gap-3">
        <div className="p-3 rounded-2xl bg-slate-500/10 border border-slate-500/20 text-slate-300">
          <Settings className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-white">Account Settings</h1>
          <p className="text-sm text-slate-400">Manage profile preferences and integrations</p>
        </div>
      </div>

      <div className="bg-[#131d33] border border-[#1e2c4a] rounded-2xl p-6 space-y-6">
        <h3 className="text-lg font-bold text-white flex items-center gap-2">
          <User className="w-5 h-5 text-blue-400" /> Profile Information
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-semibold text-slate-400 block mb-2">Display Name</label>
            <input
              type="text"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              className="w-full px-4 py-2.5 bg-[#0b1222] border border-[#1a2845] rounded-xl text-sm text-white focus:outline-none focus:border-blue-500"
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-400 block mb-2">Target Career Role</label>
            <input
              type="text"
              defaultValue="Software Engineer / SDE-1"
              className="w-full px-4 py-2.5 bg-[#0b1222] border border-[#1a2845] rounded-xl text-sm text-white focus:outline-none focus:border-blue-500"
            />
          </div>
        </div>
      </div>

      <div className="bg-[#131d33] border border-[#1e2c4a] rounded-2xl p-6 space-y-4">
        <h3 className="text-lg font-bold text-white flex items-center gap-2">
          <Key className="w-5 h-5 text-purple-400" /> API Keys & Integrations
        </h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 bg-[#0b1222] border border-[#1a2845] rounded-xl text-sm">
            <span className="text-slate-300 font-medium">Supabase Database</span>
            <span className="text-xs font-bold text-emerald-400">Connected</span>
          </div>
          <div className="flex items-center justify-between p-3 bg-[#0b1222] border border-[#1a2845] rounded-xl text-sm">
            <span className="text-slate-300 font-medium">Groq AI Service</span>
            <span className="text-xs font-bold text-emerald-400">Active</span>
          </div>
          <div className="flex items-center justify-between p-3 bg-[#0b1222] border border-[#1a2845] rounded-xl text-sm">
            <span className="text-slate-300 font-medium">YouTube Data API v3</span>
            <span className="text-xs font-bold text-emerald-400">Active</span>
          </div>
        </div>
      </div>
    </div>
  );
}

