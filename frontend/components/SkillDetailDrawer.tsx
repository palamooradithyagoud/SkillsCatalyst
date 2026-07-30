"use client";

import React, { useState } from "react";
import {
  X,
  BookOpen,
  Info,
  HelpCircle,
  CheckCircle2,
  Clock,
  Circle,
  ExternalLink,
  Code2,
  Sparkles,
  Zap,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export type SkillStatus = "pending" | "in_progress" | "completed";

interface SkillDetailDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  skillName: string;
  categoryName?: string;
  roadmapTitle?: string;
  status: SkillStatus;
  onStatusChange: (newStatus: SkillStatus) => void;
}

// Generate topic-specific knowledge data for any skill
function getSkillDetails(skillName: string) {
  const nameLower = skillName.toLowerCase();

  let overview = `${skillName} is a fundamental skill in modern software engineering. Mastering ${skillName} empowers developers to build scalable, maintainable, and robust enterprise applications following industry best practices.`;
  let concepts = [
    `Core syntax & architectural paradigms of ${skillName}`,
    "Design patterns & modular component practices",
    "Performance optimization, debugging & error handling",
    "Integration with cloud infrastructure & APIs",
    "Production security & code quality standards",
  ];
  let careerImpact = `Essential for technical interview rounds, domain expertise, and engineering high-throughput production applications using ${skillName}.`;

  let resources = [
    {
      title: `${skillName} Official Documentation & Guides`,
      type: "Official Docs",
      url: `https://devdocs.io/#q=${encodeURIComponent(skillName)}`,
      description: `Comprehensive reference manual, API specs, and official tutorials for ${skillName}.`,
    },
    {
      title: `Interactive ${skillName} Hands-On Exercises`,
      type: "Interactive Playground",
      url: `https://leetcode.com/problemset/all/?search=${encodeURIComponent(skillName)}`,
      description: `Practice problem sets, coding challenges, and real-world implementation exercises.`,
    },
    {
      title: `${skillName} In-Depth Video Crash Course`,
      type: "Video Tutorial",
      url: `https://www.youtube.com/results?search_query=${encodeURIComponent(skillName + " tutorial")}`,
      description: "Step-by-step visual walkthrough from fundamental principles to production deployment.",
    },
  ];

  let faqs = [
    {
      q: `What are the core best practices when implementing ${skillName}?`,
      a: `Focus on writing modular, well-tested, and type-safe code. Maintain clear separation of concerns, handle edge cases gracefully, and write comprehensive unit tests.`,
    },
    {
      q: `How does ${skillName} impact performance in production environments?`,
      a: `Proper usage prevents memory leaks, minimizes unnecessary thread blocking, optimizes I/O bounds, and reduces response latency under high concurrent workloads.`,
    },
    {
      q: `What questions do top tech companies ask about ${skillName} in interviews?`,
      a: `Interviewers evaluate architectural trade-offs, internal implementation details, time/space complexity analysis, and real-world debugging scenarios.`,
    },
  ];

  // Topic specific custom overrides
  if (nameLower.includes("variable") || nameLower.includes("type") || nameLower.includes("dict") || nameLower.includes("list")) {
    overview = "Python Variables & Types form the foundation of Python memory allocation, dynamic typing, and data structure manipulation in high-performance applications.";
    concepts = [
      "Dynamic typing & memory references in Python",
      "Mutable vs Immutable object behavior (Lists, Tuples, Dicts, Sets)",
      "Type hinting & static analysis with mypy",
      "Memory management, reference counting & Garbage Collection",
      "Python 3.12+ type parameter syntax & TypeVar generics",
    ];
    faqs = [
      {
        q: "What is the difference between mutable and immutable data types in Python?",
        a: "Mutable objects (like lists, dicts, and sets) can be modified in-place without changing their memory address (id()). Immutable objects (like integers, floats, strings, and tuples) cannot be altered after creation; any modification creates a new object in memory.",
      },
      {
        q: "How does Python handle memory management for variables?",
        a: "Python uses reference counting combined with a generational Garbage Collector for cycle detection. Every variable is a pointer to an PyObject in memory.",
      },
      {
        q: "What is the difference between 'is' and '==' in Python?",
        a: "'==' checks for value equality (invoking __eq__), whereas 'is' checks for identity equality (verifying if both variables point to the exact same memory address).",
      },
    ];
  } else if (nameLower.includes("fastapi") || nameLower.includes("django") || nameLower.includes("rest") || nameLower.includes("microservice")) {
    overview = "Backend Web Frameworks enable developers to craft lightning-fast asynchronous REST APIs, microservices, and web applications with automated schema validation and database integration.";
    concepts = [
      "Async request handling with ASGI & uvicorn event loop",
      "Pydantic data modeling & automatic OpenAPI documentation",
      "Dependency Injection systems for database sessions & auth",
      "ORM integrations with SQLAlchemy and asyncpg",
      "API Rate limiting, CORS security & JWT authentication",
    ];
    faqs = [
      {
        q: "Why is FastAPI significantly faster than traditional WSGI frameworks like Flask?",
        a: "FastAPI is built on Starlette and Pydantic utilizing Python's native async/await event loop (ASGI), enabling asynchronous non-blocking I/O handling thousands of concurrent requests per second.",
      },
      {
        q: "How do you handle database connection pooling in high-concurrency microservices?",
        a: "Use async ORM engines (like SQLAlchemy async_engine or Tortoise-ORM) configured with connection pools (e.g. pool_size=20, max_overflow=10) to prevent session exhaustion under heavy traffic.",
      },
    ];
  } else if (nameLower.includes("docker") || nameLower.includes("kubernetes") || nameLower.includes("ci/cd")) {
    overview = "Containerization and Infrastructure Ops streamline reliable software delivery by isolating application dependencies and automating continuous deployment pipelines across cloud environments.";
    concepts = [
      "Multi-stage Dockerfile builds for minimal image size",
      "Container networking, volume mounts & environment secrets",
      "Docker Compose multi-service container orchestration",
      "CI/CD pipeline triggers with GitHub Actions & automated testing",
      "Kubernetes pod deployments, ingress routing & horizontal scaling",
    ];
  }

  return { overview, concepts, careerImpact, resources, faqs };
}

export default function SkillDetailDrawer({
  isOpen,
  onClose,
  skillName,
  categoryName = "SOFTWARE ENGINEERING CORE",
  roadmapTitle = "SkillPath Curriculum",
  status,
  onStatusChange,
}: SkillDetailDrawerProps) {
  const [activeTab, setActiveTab] = useState<"about" | "resources" | "faqs">("about");
  const [expandedFaq, setExpandedFaq] = useState<number | null>(0);

  if (!isOpen) return null;

  const details = getSkillDetails(skillName);

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 overflow-hidden flex justify-end select-none">
        {/* Backdrop overlay */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/70 backdrop-blur-md transition-opacity"
        />

        {/* Slide-over Drawer Panel */}
        <motion.div
          initial={{ x: "100%" }}
          animate={{ x: 0 }}
          exit={{ x: "100%" }}
          transition={{ type: "spring", damping: 28, stiffness: 300 }}
          className="relative w-full max-w-2xl bg-[#0f172a] border-l border-white/[0.1] text-white shadow-2xl h-full flex flex-col z-50 overflow-hidden"
        >
          {/* Header Bar */}
          <div className="p-6 pb-4 border-b border-white/[0.08] bg-[#131b2e]/90 flex items-start justify-between gap-4 shrink-0">
            <div className="flex items-start gap-3">
              <div className="p-3 rounded-2xl bg-purple-500/15 border border-purple-500/30 text-purple-400 shrink-0">
                <Code2 className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-[10px] font-black tracking-widest text-purple-400 bg-purple-500/10 border border-purple-500/20 px-2.5 py-0.5 rounded-md uppercase">
                    {categoryName}
                  </span>
                  <span className="text-xs text-slate-400 font-normal">• {roadmapTitle}</span>
                </div>
                <h2 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
                  {skillName}
                </h2>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors shrink-0"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Status Selection Pill Buttons */}
          <div className="px-6 py-3 bg-slate-900/60 border-b border-white/[0.05] flex items-center justify-between gap-3 overflow-x-auto shrink-0">
            <span className="text-xs font-semibold text-slate-400 shrink-0">Skill Status:</span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => onStatusChange("pending")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  status === "pending"
                    ? "bg-slate-700 text-white border border-slate-500 shadow-md"
                    : "bg-white/[0.03] text-slate-400 border border-white/[0.06] hover:text-slate-200"
                }`}
              >
                <Circle className="w-3.5 h-3.5" />
                Pending
              </button>

              <button
                onClick={() => onStatusChange("in_progress")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  status === "in_progress"
                    ? "bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-md shadow-amber-500/10"
                    : "bg-white/[0.03] text-slate-400 border border-white/[0.06] hover:text-slate-200"
                }`}
              >
                <Clock className="w-3.5 h-3.5 text-amber-400" />
                In Progress
              </button>

              <button
                onClick={() => onStatusChange("completed")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  status === "completed"
                    ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-md shadow-emerald-500/10"
                    : "bg-white/[0.03] text-slate-400 border border-white/[0.06] hover:text-slate-200"
                }`}
              >
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                Completed
              </button>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex items-center gap-1 px-6 pt-3 border-b border-white/[0.08] bg-[#0f172a] shrink-0">
            <button
              onClick={() => setActiveTab("about")}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-t-xl text-xs font-bold border-b-2 transition-all ${
                activeTab === "about"
                  ? "text-purple-400 border-purple-500 bg-purple-500/10"
                  : "text-slate-400 border-transparent hover:text-slate-200"
              }`}
            >
              <Info className="w-4 h-4" />
              About
            </button>

            <button
              onClick={() => setActiveTab("resources")}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-t-xl text-xs font-bold border-b-2 transition-all ${
                activeTab === "resources"
                  ? "text-purple-400 border-purple-500 bg-purple-500/10"
                  : "text-slate-400 border-transparent hover:text-slate-200"
              }`}
            >
              <BookOpen className="w-4 h-4" />
              Resources
            </button>

            <button
              onClick={() => setActiveTab("faqs")}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-t-xl text-xs font-bold border-b-2 transition-all ${
                activeTab === "faqs"
                  ? "text-purple-400 border-purple-500 bg-purple-500/10"
                  : "text-slate-400 border-transparent hover:text-slate-200"
              }`}
            >
              <HelpCircle className="w-4 h-4" />
              Most Asked Questions
            </button>
          </div>

          {/* Drawer Body Content */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {/* ── TAB 1: ABOUT */}
            {activeTab === "about" && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                {/* Overview */}
                <div className="space-y-2">
                  <h3 className="text-xs font-black tracking-widest uppercase text-slate-400">
                    OVERVIEW
                  </h3>
                  <p className="text-sm md:text-base text-slate-200 leading-relaxed">
                    {details.overview}
                  </p>
                </div>

                {/* Key Concepts Box */}
                <div className="glass rounded-2xl p-5 border border-white/[0.08] bg-slate-900/60 space-y-3">
                  <div className="flex items-center gap-2 text-xs font-black tracking-widest text-cyan-400 uppercase">
                    <CheckCircle2 className="w-4 h-4 text-cyan-400" />
                    KEY CONCEPTS TO MASTER
                  </div>
                  <ul className="space-y-2.5 text-xs md:text-sm text-slate-300">
                    {details.concepts.map((concept, idx) => (
                      <li key={idx} className="flex items-start gap-2.5">
                        <span className="text-cyan-400 font-bold">•</span>
                        <span>{concept}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Why It Matters For Your Career Box */}
                <div className="rounded-2xl p-5 border border-purple-500/30 bg-purple-950/30 space-y-2">
                  <div className="flex items-center gap-2 text-xs font-black tracking-widest text-purple-300 uppercase">
                    <Sparkles className="w-4 h-4 text-purple-400" />
                    WHY IT MATTERS FOR YOUR CAREER
                  </div>
                  <p className="text-xs md:text-sm text-purple-100/90 leading-relaxed font-normal">
                    {details.careerImpact}
                  </p>
                </div>
              </motion.div>
            )}

            {/* ── TAB 2: RESOURCES */}
            {activeTab === "resources" && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-4"
              >
                <div className="text-xs font-black tracking-widest uppercase text-slate-400 mb-2">
                  CURATED LEARNING RESOURCES
                </div>

                {details.resources.map((res, idx) => (
                  <a
                    key={idx}
                    href={res.url}
                    target="_blank"
                    rel="noreferrer"
                    className="block glass p-4 rounded-2xl border border-white/[0.08] hover:border-purple-500/40 hover:bg-slate-800/60 transition-all group"
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30 uppercase">
                        {res.type}
                      </span>
                      <ExternalLink className="w-4 h-4 text-slate-400 group-hover:text-purple-300 transition-colors" />
                    </div>
                    <h4 className="text-sm font-bold text-white group-hover:text-purple-300 transition-colors">
                      {res.title}
                    </h4>
                    <p className="text-xs text-slate-400 mt-1">{res.description}</p>
                  </a>
                ))}
              </motion.div>
            )}

            {/* ── TAB 3: MOST ASKED QUESTIONS */}
            {activeTab === "faqs" && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-4"
              >
                <div className="text-xs font-black tracking-widest uppercase text-slate-400 mb-2">
                  TECHNICAL INTERVIEW QUESTIONS
                </div>

                {details.faqs.map((faq, idx) => {
                  const isExpanded = expandedFaq === idx;
                  return (
                    <div
                      key={idx}
                      className="glass rounded-2xl border border-white/[0.08] overflow-hidden"
                    >
                      <button
                        onClick={() => setExpandedFaq(isExpanded ? null : idx)}
                        className="w-full p-4 text-left flex items-center justify-between gap-3 font-semibold text-sm text-white hover:bg-white/[0.03]"
                      >
                        <span className="flex items-center gap-2">
                          <span className="text-purple-400 font-bold">Q{idx + 1}.</span>
                          {faq.q}
                        </span>
                        {isExpanded ? (
                          <ChevronUp className="w-4 h-4 text-purple-400 shrink-0" />
                        ) : (
                          <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
                        )}
                      </button>

                      {isExpanded && (
                        <div className="px-4 pb-4 pt-1 text-xs md:text-sm text-slate-300 border-t border-white/[0.05] bg-slate-900/40 leading-relaxed">
                          {faq.a}
                        </div>
                      )}
                    </div>
                  );
                })}
              </motion.div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
