"use client";

import React, { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Sparkles,
  TrendingUp,
  Briefcase,
  Flame,
  Award,
  BookOpen,
  Code2,
  Building2,
  ChevronRight,
  Search,
  Zap,
  Globe,
  Star,
  Play,
  Terminal,
  Trophy,
} from "lucide-react";

// Mock data items for Netflix/Spotify style rich feed
const AI_PICKS = [
  {
    id: "fullstack-ai",
    title: "Full-Stack AI Engineer 2026",
    category: "Career Track",
    level: "Advanced",
    duration: "12 Weeks",
    gradient: "from-blue-600 via-indigo-600 to-purple-600",
    badge: "🔥 98% Match",
    href: "/roadmaps",
  },
  {
    id: "system-design",
    title: "System Design for FAANG & Scale",
    category: "Masterclass",
    level: "Intermediate",
    duration: "6 Weeks",
    gradient: "from-purple-600 via-pink-600 to-rose-600",
    badge: "⭐ Top Rated",
    href: "/learning",
  },
  {
    id: "dsa-patterns",
    title: "Top 75 LeetCode Patterns",
    category: "Placement Prep",
    level: "All Levels",
    duration: "40 Hours",
    gradient: "from-cyan-600 via-teal-600 to-emerald-600",
    badge: "🚀 Placement Hot",
    href: "/practice",
  },
];

const TRENDING_SKILLS = [
  { name: "Next.js 16 App Router", icon: Code2, count: "48 Courses", tag: "Frontend" },
  { name: "Python LLM Fine-tuning", icon: Sparkles, count: "62 Courses", tag: "AI/ML" },
  { name: "FastAPI & Async Python", icon: Terminal, count: "35 Courses", tag: "Backend" },
  { name: "PostgreSQL & Supabase RLS", icon: Globe, count: "29 Courses", tag: "Database" },
  { name: "Docker & Kubernetes DevOps", icon: Zap, count: "42 Courses", tag: "DevOps" },
];

const CAREER_TRACKS = [
  {
    title: "Frontend Developer Track",
    skills: ["React 19", "TypeScript", "Next.js", "Tailwind"],
    companyFav: "Meta, Vercel, Stripe",
    gradient: "from-blue-500/20 to-cyan-500/10",
    borderColor: "border-blue-500/30",
  },
  {
    title: "Backend Architect Track",
    skills: ["Python", "FastAPI", "PostgreSQL", "Docker"],
    companyFav: "Amazon, Uber, Netflix",
    gradient: "from-purple-500/20 to-indigo-500/10",
    borderColor: "border-purple-500/30",
  },
  {
    title: "AI & ML Specialist",
    skills: ["Python", "PyTorch", "LangChain", "Groq API"],
    companyFav: "OpenAI, Google, Anthropic",
    gradient: "from-emerald-500/20 to-teal-500/10",
    borderColor: "border-emerald-500/30",
  },
];

const POPULAR_COURSES = [
  { title: "Complete Python Mastery 2026", instructor: "Telusko", rating: "4.9", videos: "54 Videos", level: "Beginner - Advanced", color: "border-cyan-500/30" },
  { title: "Aptitude & Logical Reasoning Sprint", instructor: "SkillsCatalyst Team", rating: "4.8", videos: "41 Practice Sets", level: "Placement", color: "border-purple-500/30" },
  { title: "Data Structures & Algorithms in C++", instructor: "Striver", rating: "5.0", videos: "120 Videos", level: "Intermediate", color: "border-blue-500/30" },
];

const TOP_COMPANIES = [
  { name: "Google", role: "Software Engineer", open: "140+ Questions" },
  { name: "Microsoft", role: "Full Stack Dev", open: "110+ Questions" },
  { name: "Amazon", role: "SDE I & II", open: "195+ Questions" },
  { name: "TCS", role: "Ninja & Digital", open: "85+ Questions" },
];

const HACKATHONS = [
  { title: "Global AI Innovators 2026", prize: "₹10,00,000", status: "Live Now", tag: "AI/ML" },
  { title: "Next.js Web3 Hackathon", prize: "₹5,00,000", status: "Starts in 3 Days", tag: "FullStack" },
];

export default function ExplorePage() {
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="max-w-7xl mx-auto space-y-6 pb-12"
    >
      {/* ── Top Floating Mobile Search Bar Header ── */}
      <div className="glass p-4 rounded-2xl border border-white/10 flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl sm:text-3xl font-black text-white tracking-tight">Explore</h1>
            <p className="text-slate-400 text-xs sm:text-sm mt-0.5">
              Curated roadmaps, AI picks &amp; trending skill paths
            </p>
          </div>
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 flex items-center gap-1.5 shadow-sm">
            <Flame className="w-3.5 h-3.5 text-orange-400 fill-orange-400/30" />
            <span>Trending Feed</span>
          </span>
        </div>

        {/* Floating Search Input */}
        <div className="relative mt-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search skills, companies, topics (e.g. Python, Meta, DSA)..."
            className="w-full bg-[#0d162d]/80 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-xs sm:text-sm font-medium text-white placeholder-slate-500 focus:outline-none focus:border-blue-500/50 transition-all"
          />
        </div>
      </div>

      {/* ── 1. Hero AI Picks Carousel (Netflix Poster Style) ── */}
      <div className="space-y-2">
        <div className="flex items-center justify-between px-1">
          <h2 className="text-sm font-extrabold text-white uppercase tracking-wider flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-purple-400" />
            <span>AI Recommended for You</span>
          </h2>
          <span className="text-[11px] text-slate-400 font-semibold">Swipe →</span>
        </div>

        <div className="flex gap-3 overflow-x-auto no-scrollbar mobile-touch-scroll pb-2 snap-x snap-mandatory px-0.5">
          {AI_PICKS.map((item) => (
            <Link
              key={item.id}
              href={item.href}
              className="snap-start flex-shrink-0 w-[270px] sm:w-[320px] glass rounded-2xl p-5 border border-white/10 relative overflow-hidden group hover:border-purple-500/40 transition-all shadow-xl"
            >
              {/* Vibrant background gradient overlay */}
              <div
                className={`absolute inset-0 bg-gradient-to-br ${item.gradient} opacity-20 group-hover:opacity-30 transition-opacity`}
              />

              <div className="relative z-10 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-white/10 backdrop-blur-md text-white border border-white/20">
                    {item.category}
                  </span>
                  <span className="text-[11px] font-extrabold text-amber-300">
                    {item.badge}
                  </span>
                </div>

                <div>
                  <h3 className="text-base font-extrabold text-white leading-snug group-hover:text-cyan-300 transition-colors">
                    {item.title}
                  </h3>
                  <div className="flex items-center gap-3 text-xs text-slate-400 mt-2 font-medium">
                    <span>{item.level}</span>
                    <span>•</span>
                    <span>{item.duration}</span>
                  </div>
                </div>

                <div className="pt-2 flex items-center justify-between text-xs font-bold text-cyan-400 group-hover:translate-x-1 transition-transform">
                  <span>Start Learning Now</span>
                  <ChevronRight className="w-4 h-4" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* ── 2. Trending Skill Chips Carousel ── */}
      <div className="space-y-2">
        <div className="flex items-center justify-between px-1">
          <h2 className="text-sm font-extrabold text-white uppercase tracking-wider flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-cyan-400" />
            <span>Top Tech Stack Skills</span>
          </h2>
        </div>

        <div className="flex items-center gap-2.5 overflow-x-auto no-scrollbar mobile-touch-scroll pb-1">
          {TRENDING_SKILLS.map((skill) => {
            const Icon = skill.icon;
            return (
              <Link
                key={skill.name}
                href="/learning"
                className="flex-shrink-0 flex items-center gap-2.5 px-4 py-3 rounded-2xl glass hover:bg-blue-500/20 border border-white/10 text-xs font-bold text-slate-200 hover:text-white transition-all shadow-md"
              >
                <div className="w-8 h-8 rounded-xl bg-blue-500/15 flex items-center justify-center text-blue-400">
                  <Icon className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-bold text-white text-xs whitespace-nowrap">{skill.name}</div>
                  <div className="text-[10px] text-slate-400 font-normal">{skill.count}</div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      {/* ── 3. Career Tracks Carousel ── */}
      <div className="space-y-2">
        <div className="flex items-center justify-between px-1">
          <h2 className="text-sm font-extrabold text-white uppercase tracking-wider flex items-center gap-2">
            <Briefcase className="w-4 h-4 text-emerald-400" />
            <span>Target Career Tracks</span>
          </h2>
          <Link href="/roadmaps" className="text-xs text-blue-400 font-bold hover:underline">
            All Tracks →
          </Link>
        </div>

        <div className="flex gap-3 overflow-x-auto no-scrollbar mobile-touch-scroll pb-2 snap-x snap-mandatory px-0.5">
          {CAREER_TRACKS.map((track) => (
            <div
              key={track.title}
              className={`snap-start flex-shrink-0 w-[260px] sm:w-[300px] glass rounded-2xl p-4 border ${track.borderColor} bg-gradient-to-br ${track.gradient} flex flex-col justify-between`}
            >
              <div>
                <div className="text-sm font-extrabold text-white mb-2">{track.title}</div>
                <div className="flex flex-wrap gap-1.5 mb-3">
                  {track.skills.map((s) => (
                    <span
                      key={s}
                      className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-white/10 text-slate-200 border border-white/15"
                    >
                      {s}
                    </span>
                  ))}
                </div>
              </div>
              <div className="text-[11px] text-slate-400 font-medium border-t border-white/10 pt-2 flex items-center justify-between">
                <span>Hiring: {track.companyFav}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── 4. Popular Courses & Practice Sets ── */}
      <div className="space-y-2">
        <div className="flex items-center justify-between px-1">
          <h2 className="text-sm font-extrabold text-white uppercase tracking-wider flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-purple-400" />
            <span>Popular Courses &amp; Sets</span>
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {POPULAR_COURSES.map((c) => (
            <Link
              key={c.title}
              href="/learning"
              className={`glass p-4 rounded-2xl border ${c.color} flex items-start gap-3 hover:border-blue-400/40 transition-all`}
            >
              <div className="w-10 h-10 rounded-xl bg-purple-500/20 text-purple-300 flex items-center justify-center shrink-0 mt-0.5">
                <Play className="w-4 h-4 fill-purple-400 text-purple-400" />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-xs font-extrabold text-white truncate">{c.title}</h4>
                <p className="text-[11px] text-slate-400 mt-0.5">{c.instructor} • {c.videos}</p>
                <div className="flex items-center justify-between mt-2 text-[10px] text-amber-300 font-bold">
                  <span>⭐ {c.rating}</span>
                  <span className="text-slate-400 font-normal">{c.level}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* ── 5. Company Question Banks & Hackathons ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Company Banks */}
        <div className="glass p-4 rounded-2xl border border-white/10 space-y-3">
          <div className="flex items-center justify-between border-b border-white/10 pb-2">
            <h3 className="text-xs font-extrabold text-white uppercase tracking-wider flex items-center gap-2">
              <Building2 className="w-4 h-4 text-blue-400" />
              <span>Company Question Banks</span>
            </h3>
            <Link href="/practice" className="text-[11px] text-blue-400 font-bold">
              Practice →
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {TOP_COMPANIES.map((comp) => (
              <Link
                key={comp.name}
                href="/practice"
                className="p-2.5 rounded-xl bg-white/[0.03] border border-white/5 hover:border-blue-500/30 transition-all text-left"
              >
                <div className="text-xs font-bold text-white">{comp.name}</div>
                <div className="text-[10px] text-slate-400">{comp.open}</div>
              </Link>
            ))}
          </div>
        </div>

        {/* Hackathons & Challenges */}
        <div className="glass p-4 rounded-2xl border border-white/10 space-y-3">
          <div className="flex items-center justify-between border-b border-white/10 pb-2">
            <h3 className="text-xs font-extrabold text-white uppercase tracking-wider flex items-center gap-2">
              <Trophy className="w-4 h-4 text-amber-400" />
              <span>Hackathons &amp; Challenges</span>
            </h3>
            <span className="text-[10px] text-emerald-400 font-bold">Live</span>
          </div>
          <div className="space-y-2">
            {HACKATHONS.map((h) => (
              <div
                key={h.title}
                className="p-3 rounded-xl bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/20 flex items-center justify-between"
              >
                <div>
                  <div className="text-xs font-bold text-white">{h.title}</div>
                  <div className="text-[10px] text-amber-300 font-medium">Prize Pool: {h.prize}</div>
                </div>
                <span className="px-2.5 py-1 rounded-lg bg-amber-500/20 text-amber-300 text-[10px] font-extrabold border border-amber-500/30">
                  {h.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
