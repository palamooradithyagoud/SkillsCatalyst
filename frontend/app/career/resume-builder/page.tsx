"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  ChevronLeft,
  Sparkles,
  Printer,
  Copy,
  Check,
  Code2,
  LayoutTemplate,
  Layers,
  ArrowRight,
  Zap,
  FileText,
  Sliders,
  RotateCcw,
  Download,
  Save,
} from "lucide-react";
import confetti from "canvas-confetti";
import ResumeLivePreview from "@/components/career/ResumeLivePreview";
import { ResumeTemplateId, RESUME_TEMPLATES } from "@/components/career/TemplateSelectModal";
import { ResumeData, generateSB2NovLaTeX } from "@/lib/career/latexExportHelper";
import { useAuth } from "@/lib/auth";

const defaultResumeData: ResumeData = {
  fullName: "Aadithya Goud",
  role: "Fullstack Software Engineer",
  email: "adithya@example.com",
  phone: "+91 98765 43210",
  location: "Hyderabad, India",
  linkedin: "linkedin.com/in/adithya",
  github: "github.com/adithya",
  summary:
    "Passionate Software Engineer skilled in modern web development, distributed architecture, and scalable full-stack applications with high ATS ranking standards.",
  education: [
    {
      institution: "Indian Institute of Information Technology",
      degree: "B.Tech in Computer Science & Engineering",
      location: "Hyderabad, India",
      dates: "2021 — 2025",
      gpa: "8.9 / 10.0",
    },
  ],
  experience: [
    {
      company: "SkillsCatalyst",
      role: "Lead Fullstack Engineer",
      location: "Remote / Hyderabad",
      dates: "Jan 2024 — Present",
      bullets: [
        "Architected real-time AI career acceleration platform serving thousands of active developers.",
        "Built resilient FastAPI microservices and optimized PostgreSQL indexing, reducing P99 latency by 45%.",
        "Engineered responsive Next.js frontend with GSAP motion and high-contrast accessibility standards.",
      ],
    },
    {
      company: "HyperTech Labs",
      role: "Software Engineering Intern",
      location: "Bangalore, India",
      dates: "May 2023 — Dec 2023",
      bullets: [
        "Designed and maintained scalable RESTful endpoints with automated OpenAPI schemas.",
        "Integrated Redis caching layer, lowering repeated database queries by 60%.",
      ],
    },
  ],
  projects: [
    {
      name: "SkillsCatalyst AI Suite",
      tech: "Next.js, FastAPI, Groq LLM, Supabase, Docker",
      link: "skillscatalyst.in",
      bullets: [
        "Developed full-featured ATS resume score analyzer and interactive career roadmaps.",
        "Integrated multi-model LLM benchmarking with structured fallback orchestration.",
      ],
    },
  ],
  skills: {
    languages: "JavaScript, TypeScript, Python, C++, SQL, HTML/CSS",
    frameworks: "React, Next.js, FastAPI, Node.js, Express, Tailwind CSS",
    tools: "Docker, Git, PostgreSQL, Supabase, Redis, Linux, Vercel",
    all: "React, Next.js, TypeScript, Python, FastAPI, Node.js, PostgreSQL, Docker, Redis, Tailwind CSS",
  },
};

interface TemplateCardDef {
  id: ResumeTemplateId;
  badgeTitle: string;
  tagline: string;
  atsScore: number;
}

const TEMPLATE_CARDS: TemplateCardDef[] = [
  {
    id: "simple-classic",
    badgeTitle: "Simple Classic",
    tagline: "Timeless, clean single-column format for enterprise & finance",
    atsScore: 98,
  },
  {
    id: "modern-cv",
    badgeTitle: "Modern CV",
    tagline: "Contemporary layout with accent tags & visual hierarchy",
    atsScore: 96,
  },
  {
    id: "sb2nov",
    badgeTitle: "SB2Nov",
    tagline: "The gold-standard Overleaf/LaTeX SWE template for FAANG",
    atsScore: 100,
  },
  {
    id: "ultra-minimal",
    badgeTitle: "Ultra Minimal",
    tagline: "Single page high-density impact layout with crisp typography",
    atsScore: 99,
  },
];

function ResumeBuilderInner() {
  const { session } = useAuth();
  const userName = session?.name || "Aadithya Goud";
  const searchParams = useSearchParams();
  const templateQuery = searchParams.get("template") as ResumeTemplateId | null;

  // View mode: "gallery" (select template) or "editor" (active builder)
  const [viewMode, setViewMode] = useState<"gallery" | "editor">(
    templateQuery ? "editor" : "gallery"
  );
  const [selectedTemplate, setSelectedTemplate] = useState<ResumeTemplateId>(
    templateQuery || "sb2nov"
  );

  // Editor section subtab
  const [activeEditorSection, setActiveEditorSection] = useState<
    "contact" | "experience" | "education" | "projects" | "skills"
  >("contact");

  // Mobile toggle between form and live preview
  const [mobileBuilderTab, setMobileBuilderTab] = useState<"editor" | "preview">("editor");

  // Resume builder data
  const [resumeData, setResumeData] = useState<ResumeData>({
    ...defaultResumeData,
    fullName: userName,
  });

  const [savedSuccess, setSavedSuccess] = useState(false);
  const [showLatexModal, setShowLatexModal] = useState(false);
  const [copiedLatex, setCopiedLatex] = useState(false);

  const handleSelectTemplate = (templateId: ResumeTemplateId) => {
    setSelectedTemplate(templateId);
    setViewMode("editor");
    setMobileBuilderTab("editor");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDownloadResume = () => {
    const originalTitle = document.title;
    const cleanFileName = `${(resumeData.fullName || "My").trim().replace(/\s+/g, "_")}_Resume`;
    document.title = cleanFileName;
    window.print();
    setTimeout(() => {
      document.title = originalTitle;
    }, 1500);
  };

  const handleCopyLatex = () => {
    const latex = generateSB2NovLaTeX(resumeData);
    navigator.clipboard.writeText(latex);
    setCopiedLatex(true);
    setTimeout(() => setCopiedLatex(false), 2500);
  };

  const handleSaveResume = () => {
    try {
      const stored = localStorage.getItem("skillscatalyst_resumes");
      const list = stored ? JSON.parse(stored) : [];
      const newItem = {
        id: `resume-${Date.now()}`,
        title: `${resumeData.fullName} — ${resumeData.role}`,
        role: resumeData.role,
        date: "Just now",
        atsScore: selectedTemplate === "sb2nov" ? 100 : selectedTemplate === "ultra-minimal" ? 99 : 98,
        starred: false,
        templateId: selectedTemplate,
        resumeData: { ...resumeData },
      };
      const nextList = [newItem, ...list];
      localStorage.setItem("skillscatalyst_resumes", JSON.stringify(nextList));
    } catch (e) {
      console.error(e);
    }

    setSavedSuccess(true);
    try {
      confetti({ particleCount: 75, spread: 70, origin: { y: 0.65 } });
    } catch {}
    setTimeout(() => setSavedSuccess(false), 4500);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-5 pb-20 select-none text-slate-900">
      {/* ── Top In-Page Bar ── */}
      <div className="flex items-center justify-between gap-3 pt-1">
        <Link
          href="/career/resume-review"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-slate-600 hover:text-slate-900 bg-white hover:bg-slate-50 border border-slate-200 shadow-2xs transition-all"
        >
          <ChevronLeft className="w-4 h-4 text-slate-500" />
          <span>Back to Workspace</span>
        </Link>

        {viewMode === "editor" ? (
          <button
            type="button"
            onClick={() => setViewMode("gallery")}
            className="px-3 py-1.5 rounded-xl border border-slate-200 hover:border-pink-300 text-slate-700 hover:text-pink-700 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer bg-white shadow-2xs"
          >
            <LayoutTemplate className="w-3.5 h-3.5 text-pink-600" />
            <span>Change Template</span>
          </button>
        ) : (
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-pink-500 animate-pulse" />
            <span className="text-xs font-semibold text-slate-500 hidden sm:inline">
              Choose a layout to start
            </span>
          </div>
        )}
      </div>

      {/* ──────────────────────────────────────────────────────────
          VIEW 1: TEMPLATE SELECTION GALLERY (Matches Image 2)
      ────────────────────────────────────────────────────────── */}
      {viewMode === "gallery" && (
        <div className="space-y-6 animate-in fade-in duration-300">
          {/* Header / Intro */}
          <div className="text-center max-w-2xl mx-auto space-y-1.5">
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Select Your Resume Template
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 font-medium">
              Choose the foundation that best matches your target industry and career goals.
            </p>
          </div>

          {/* Template Cards Grid (Small, clean, portrait cards matching Image 2 with PINK button) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 max-w-5xl mx-auto pt-1">
            {TEMPLATE_CARDS.map((tmpl) => (
              <div
                key={tmpl.id}
                className="bg-white rounded-2xl border border-slate-200/90 hover:border-pink-400 p-2.5 sm:p-3 shadow-2xs hover:shadow-lg transition-all duration-200 flex flex-col justify-between group"
              >
                {/* Miniature A4 Document Container */}
                <div className="aspect-[1/1.32] w-full bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden relative p-3 text-[6.5px] leading-tight select-none flex flex-col justify-between group-hover:scale-[1.01] transition-transform">
                  {/* Top Floating Badge Pill (Inside paper, matching Image 2) */}
                  <div className="absolute top-2 left-2 z-10">
                    <span className="bg-[#24292e] text-white text-[10px] font-bold px-2.5 py-0.5 rounded shadow-xs tracking-tight">
                      {tmpl.badgeTitle}
                    </span>
                  </div>

                    {/* Realistic Miniature Layout per template */}
                    {tmpl.id === "simple-classic" && (
                      <div className="pt-7 font-serif space-y-2 text-slate-800">
                        <div className="text-center pb-1 border-b border-slate-400">
                          <div className="font-bold text-[9px] text-slate-900 tracking-wider">
                            JOHN DOE
                          </div>
                          <div className="text-[5.5px] text-slate-500">
                            john@example.com · +1 (555) 019-2831 · New York, NY
                          </div>
                        </div>
                        <div>
                          <div className="font-bold text-[6.5px] uppercase border-b border-slate-200 pb-0.5 text-slate-900">
                            EDUCATION
                          </div>
                          <div className="flex justify-between text-[5.5px] pt-0.5 font-semibold">
                            <span>Stanford University</span>
                            <span className="text-slate-400">2020 – 2024</span>
                          </div>
                          <div className="text-[5px] text-slate-500 italic">B.S. in Computer Science</div>
                        </div>
                        <div>
                          <div className="font-bold text-[6.5px] uppercase border-b border-slate-200 pb-0.5 text-slate-900">
                            EXPERIENCE
                          </div>
                          <div className="flex justify-between text-[5.5px] pt-0.5 font-semibold">
                            <span>Software Engineer — TechCorp</span>
                            <span className="text-slate-400">2024 – Present</span>
                          </div>
                          <div className="text-[5px] text-slate-500 pl-1.5">• Engineered high-throughput microservices</div>
                          <div className="text-[5px] text-slate-500 pl-1.5">• Reduced database response latency by 35%</div>
                        </div>
                        <div>
                          <div className="font-bold text-[6.5px] uppercase border-b border-slate-200 pb-0.5 text-slate-900">
                            SKILLS
                          </div>
                          <div className="text-[5px] text-slate-600 pt-0.5">
                            TypeScript, Python, FastAPI, React, PostgreSQL, Docker, AWS
                          </div>
                        </div>
                      </div>
                    )}

                    {tmpl.id === "modern-cv" && (
                      <div className="pt-7 font-sans space-y-2 text-slate-800">
                        <div className="pb-1 border-b-2 border-pink-500 flex justify-between items-baseline">
                          <div>
                            <div className="font-black text-[9px] text-slate-900">John Doe</div>
                            <div className="text-[5.5px] text-pink-600 font-bold">Fullstack Engineer</div>
                          </div>
                          <div className="text-[5px] text-slate-400">github.com/johndoe</div>
                        </div>
                        <div className="flex flex-wrap gap-1">
                          <span className="bg-pink-100 text-pink-800 text-[5px] font-bold px-1 rounded">React</span>
                          <span className="bg-purple-100 text-purple-800 text-[5px] font-bold px-1 rounded">Next.js</span>
                          <span className="bg-slate-100 text-slate-700 text-[5px] font-bold px-1 rounded">Python</span>
                          <span className="bg-emerald-100 text-emerald-800 text-[5px] font-bold px-1 rounded">FastAPI</span>
                        </div>
                        <div className="space-y-1">
                          <div className="font-bold text-[6.5px] uppercase text-pink-700 flex items-center gap-1">
                            <span className="w-1 h-1 rounded-full bg-pink-500" />
                            Experience
                          </div>
                          <div className="pl-1.5 border-l border-pink-200 text-[5px] space-y-0.5">
                            <div className="font-bold text-slate-800">Senior Lead Developer · CloudFlow</div>
                            <div className="text-slate-500">• Led frontend architecture for 150k active users</div>
                          </div>
                        </div>
                        <div className="space-y-1">
                          <div className="font-bold text-[6.5px] uppercase text-pink-700 flex items-center gap-1">
                            <span className="w-1 h-1 rounded-full bg-pink-500" />
                            Projects
                          </div>
                          <div className="pl-1.5 border-l border-pink-200 text-[5px]">
                            <div className="font-bold text-slate-800">AI Career Platform</div>
                            <div className="text-slate-500">• Real-time ATS scorer and resume formatter</div>
                          </div>
                        </div>
                      </div>
                    )}

                    {tmpl.id === "sb2nov" && (
                      <div className="pt-7 font-serif space-y-1.5 text-slate-900">
                        {/* Overleaf LaTeX Heading */}
                        <div className="text-center pb-0.5">
                          <div className="font-black text-[9px] text-slate-900 tracking-tight uppercase">
                            JOHN DOE
                          </div>
                          <div className="text-[5px] text-slate-600 font-sans">
                            john@cs.edu | +1-234-567-8900 | linkedin/in/johndoe | github/johndoe
                          </div>
                        </div>

                        <div>
                          <div className="font-bold text-[6.5px] tracking-wider uppercase border-b border-slate-900 pb-0.2">
                            EDUCATION
                          </div>
                          <div className="flex justify-between text-[5.5px] font-bold pt-0.5">
                            <span>Stanford University</span>
                            <span className="font-normal text-slate-600">2020 – 2024</span>
                          </div>
                          <div className="italic text-[5px] text-slate-600">Bachelor of Science in Computer Science; GPA: 3.9/4.0</div>
                        </div>

                        <div>
                          <div className="font-bold text-[6.5px] tracking-wider uppercase border-b border-slate-900 pb-0.2">
                            EXPERIENCE
                          </div>
                          <div className="flex justify-between text-[5.5px] font-bold pt-0.5">
                            <span>Google — Software Engineer Intern</span>
                            <span className="font-normal text-slate-600">May 2023 – Aug 2023</span>
                          </div>
                          <div className="text-[5px] text-slate-700 pl-1.5">
                            • Optimized distributed cache hit rate by 34% via LRU partitioning
                          </div>
                          <div className="text-[5px] text-slate-700 pl-1.5">
                            • Architected asynchronous message worker processing 2M events/day
                          </div>
                        </div>

                        <div>
                          <div className="font-bold text-[6.5px] tracking-wider uppercase border-b border-slate-900 pb-0.2">
                            TECHNICAL SKILLS
                          </div>
                          <div className="text-[5px] text-slate-700 font-sans pt-0.5">
                            <span className="font-bold">Languages:</span> C++, Python, TypeScript, SQL
                          </div>
                        </div>
                      </div>
                    )}

                    {tmpl.id === "ultra-minimal" && (
                      <div className="pt-7 font-sans space-y-2 text-slate-800">
                        <div className="pb-1 border-b border-slate-200">
                          <div className="font-black text-[9px] text-slate-900 tracking-tight">JOHN DOE</div>
                          <div className="text-[5px] text-slate-500">New York, NY · john@example.com · +1 555-0192</div>
                        </div>
                        <div>
                          <div className="font-extrabold text-[6px] tracking-widest text-slate-400 uppercase">
                            Technical Skills
                          </div>
                          <div className="text-[5px] text-slate-700 pt-0.5 leading-normal">
                            Next.js, React, TypeScript, Python, FastAPI, PostgreSQL, Docker, Tailwind CSS
                          </div>
                        </div>
                        <div>
                          <div className="font-extrabold text-[6px] tracking-widest text-slate-400 uppercase">
                            Experience
                          </div>
                          <div className="flex justify-between text-[5.5px] font-bold pt-0.5">
                            <span>Senior Fullstack Engineer</span>
                            <span className="text-slate-400 font-normal">2022 – Present</span>
                          </div>
                          <div className="text-[5px] text-slate-500 pl-1.5">• Shipped customer-facing web architecture</div>
                        </div>
                        <div>
                          <div className="font-extrabold text-[6px] tracking-widest text-slate-400 uppercase">
                            Education
                          </div>
                          <div className="flex justify-between text-[5.5px] pt-0.5 font-bold">
                            <span>B.S. Computer Engineering</span>
                            <span className="text-slate-400 font-normal">2018 – 2022</span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* BOTTOM BUTTON: SOLID PINK (Per user instruction: "insted of black keep pink") */}
                  <button
                    type="button"
                    onClick={() => handleSelectTemplate(tmpl.id)}
                    className="w-full mt-2.5 bg-pink-600 hover:bg-pink-700 active:scale-95 text-white font-bold py-2 px-3 rounded-lg text-xs sm:text-sm tracking-wide shadow-xs shadow-pink-500/20 text-center transition-all cursor-pointer"
                  >
                    Use Template
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ========================================================
            VIEW 2: FULL RESUME BUILDER STUDIO WITH LIVE PREVIEW
        ======================================================== */}
        {viewMode === "editor" && (
          <div className="space-y-5 animate-in fade-in duration-300">
            {/* Top Toolbar */}
            <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2.5 flex-wrap">
                <button
                  type="button"
                  onClick={() => setViewMode("gallery")}
                  className="p-1.5 rounded-lg text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors flex items-center gap-1 text-xs font-bold cursor-pointer"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>Templates</span>
                </button>
                <div className="h-4 w-px bg-slate-200" />

                {/* Template Switcher Tabs */}
                <div className="flex items-center bg-slate-100 p-0.5 rounded-xl border border-slate-200 text-xs">
                  {TEMPLATE_CARDS.map((tc) => (
                    <button
                      key={tc.id}
                      type="button"
                      onClick={() => setSelectedTemplate(tc.id)}
                      className={`px-3 py-1.5 rounded-lg font-bold text-xs transition-all cursor-pointer ${
                        selectedTemplate === tc.id
                          ? "bg-pink-600 text-white shadow-xs"
                          : "text-slate-600 hover:text-slate-900"
                      }`}
                    >
                      {tc.badgeTitle}
                    </button>
                  ))}
                </div>
              </div>

              {/* Action buttons (Mobile switcher, Download, Save, LaTeX) */}
              <div className="flex items-center gap-2 w-full sm:w-auto justify-end flex-wrap">
                <div className="lg:hidden flex items-center bg-slate-100 p-0.5 rounded-xl border border-slate-200 text-xs font-bold">
                  <button
                    type="button"
                    onClick={() => setMobileBuilderTab("editor")}
                    className={`px-3 py-1.5 rounded-lg transition-all ${
                      mobileBuilderTab === "editor"
                        ? "bg-white text-pink-700 shadow-xs"
                        : "text-slate-500"
                    }`}
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => setMobileBuilderTab("preview")}
                    className={`px-3 py-1.5 rounded-lg transition-all ${
                      mobileBuilderTab === "preview"
                        ? "bg-white text-pink-700 shadow-xs"
                        : "text-slate-500"
                    }`}
                  >
                    Preview
                  </button>
                </div>

                {/* Optional LaTeX Code Button for SB2Nov */}
                {selectedTemplate === "sb2nov" && (
                  <button
                    type="button"
                    onClick={() => setShowLatexModal(true)}
                    className="bg-slate-900 hover:bg-slate-800 text-emerald-400 border border-slate-800 font-bold text-xs px-3.5 py-2.5 rounded-xl shadow-xs transition-all cursor-pointer flex items-center justify-center gap-1.5 active:scale-95"
                  >
                    <Code2 className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">LaTeX (.tex)</span>
                  </button>
                )}

                {/* Download Resume Button */}
                <button
                  type="button"
                  onClick={handleDownloadResume}
                  className="bg-white hover:bg-slate-50 text-slate-800 hover:text-slate-900 border border-slate-200 hover:border-slate-300 font-bold text-xs px-4 py-2.5 rounded-xl shadow-2xs transition-all cursor-pointer flex items-center justify-center gap-1.5 active:scale-95"
                >
                  <Download className="w-3.5 h-3.5 text-pink-600" />
                  <span>Download Resume</span>
                </button>

                {/* Save Resume Button */}
                <button
                  type="button"
                  onClick={handleSaveResume}
                  className="bg-pink-600 hover:bg-pink-700 active:scale-95 text-white font-bold text-xs px-5 py-2.5 rounded-xl shadow-md shadow-pink-500/25 transition-all cursor-pointer flex items-center justify-center gap-1.5"
                >
                  {savedSuccess ? (
                    <>
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                      <span>Saved!</span>
                    </>
                  ) : (
                    <>
                      <Save className="w-3.5 h-3.5" />
                      <span>Save Resume</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Saved Notification Banner */}
            {savedSuccess && (
              <div className="bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-2xl p-3 sm:p-3.5 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs shadow-xs animate-in fade-in slide-in-from-top-1">
                <div className="flex items-center gap-2.5 font-medium">
                  <div className="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center shrink-0">
                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                  </div>
                  <span>
                    Resume saved successfully! You can access it anytime under <strong className="font-bold">Your Resumes</strong>.
                  </span>
                </div>
                <div className="flex items-center gap-2 self-end sm:self-auto">
                  <Link
                    href="/career/resume-review"
                    className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-3 py-1.5 rounded-xl shadow-xs transition-colors shrink-0 text-xs"
                  >
                    View in Workspace
                  </Link>
                </div>
              </div>
            )}

            {/* Studio Workspace: Form on Left, Document Preview on Right */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* ── Left Column: Form Editor (lg: 5 cols) ── */}
              <div
                className={`lg:col-span-5 bg-white border border-slate-200/90 rounded-2xl p-4 sm:p-5 shadow-sm space-y-4 ${
                  mobileBuilderTab === "preview" ? "hidden lg:block" : "block"
                }`}
              >
                {/* Editor Section Switcher Tabs */}
                <div className="flex items-center gap-1 overflow-x-auto pb-1 border-b border-slate-100 text-xs">
                  {(
                    [
                      { id: "contact", label: "Contact" },
                      { id: "experience", label: "Experience" },
                      { id: "education", label: "Education" },
                      { id: "projects", label: "Projects" },
                      { id: "skills", label: "Skills" },
                    ] as const
                  ).map((tab) => (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => setActiveEditorSection(tab.id)}
                      className={`px-3 py-1.5 font-bold rounded-lg whitespace-nowrap transition-colors cursor-pointer ${
                        activeEditorSection === tab.id
                          ? "bg-pink-600 text-white shadow-xs"
                          : "text-slate-600 hover:bg-slate-100"
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>

                {/* Section 1: Contact */}
                {activeEditorSection === "contact" && (
                  <div className="space-y-3.5 text-xs">
                    <div>
                      <label className="font-bold text-slate-800 block mb-1">Full Name</label>
                      <input
                        type="text"
                        value={resumeData.fullName}
                        onChange={(e) =>
                          setResumeData({ ...resumeData, fullName: e.target.value })
                        }
                        className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-pink-600 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="font-bold text-slate-800 block mb-1">Target Role / Headline</label>
                      <input
                        type="text"
                        value={resumeData.role}
                        onChange={(e) =>
                          setResumeData({ ...resumeData, role: e.target.value })
                        }
                        className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-pink-600 focus:outline-none"
                      />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      <div>
                        <label className="font-bold text-slate-800 block mb-1">Email</label>
                        <input
                          type="email"
                          value={resumeData.email}
                          onChange={(e) =>
                            setResumeData({ ...resumeData, email: e.target.value })
                          }
                          className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-pink-600 focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="font-bold text-slate-800 block mb-1">Phone</label>
                        <input
                          type="text"
                          value={resumeData.phone}
                          onChange={(e) =>
                            setResumeData({ ...resumeData, phone: e.target.value })
                          }
                          className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-pink-600 focus:outline-none"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      <div>
                        <label className="font-bold text-slate-800 block mb-1">Location</label>
                        <input
                          type="text"
                          value={resumeData.location}
                          onChange={(e) =>
                            setResumeData({ ...resumeData, location: e.target.value })
                          }
                          className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-pink-600 focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="font-bold text-slate-800 block mb-1">LinkedIn Profile</label>
                        <input
                          type="text"
                          value={resumeData.linkedin}
                          onChange={(e) =>
                            setResumeData({ ...resumeData, linkedin: e.target.value })
                          }
                          className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-pink-600 focus:outline-none"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="font-bold text-slate-800 block mb-1">GitHub / Portfolio</label>
                      <input
                        type="text"
                        value={resumeData.github}
                        onChange={(e) =>
                          setResumeData({ ...resumeData, github: e.target.value })
                        }
                        className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-pink-600 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="font-bold text-slate-800 block mb-1">Professional Summary</label>
                      <textarea
                        rows={3}
                        value={resumeData.summary}
                        onChange={(e) =>
                          setResumeData({ ...resumeData, summary: e.target.value })
                        }
                        className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-pink-600 focus:outline-none resize-none"
                      />
                    </div>
                  </div>
                )}

                {/* Section 2: Experience */}
                {activeEditorSection === "experience" && (
                  <div className="space-y-4 text-xs">
                    {resumeData.experience.map((exp, expIdx) => (
                      <div
                        key={expIdx}
                        className="p-3.5 bg-slate-50/70 rounded-2xl border border-slate-200/80 space-y-2.5 relative"
                      >
                        <div className="flex items-center justify-between pb-1 border-b border-slate-200">
                          <span className="font-extrabold text-slate-800 text-[11px]">
                            Position #{expIdx + 1}
                          </span>
                          {resumeData.experience.length > 1 && (
                            <button
                              type="button"
                              onClick={() => {
                                const updated = resumeData.experience.filter((_, i) => i !== expIdx);
                                setResumeData({ ...resumeData, experience: updated });
                              }}
                              className="text-rose-600 hover:text-rose-700 text-[11px] font-bold cursor-pointer"
                            >
                              Remove
                            </button>
                          )}
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="font-bold text-slate-700 block mb-0.5">Role Title</label>
                            <input
                              type="text"
                              value={exp.role}
                              onChange={(e) => {
                                const updated = [...resumeData.experience];
                                updated[expIdx].role = e.target.value;
                                setResumeData({ ...resumeData, experience: updated });
                              }}
                              className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs"
                            />
                          </div>
                          <div>
                            <label className="font-bold text-slate-700 block mb-0.5">Company</label>
                            <input
                              type="text"
                              value={exp.company}
                              onChange={(e) => {
                                const updated = [...resumeData.experience];
                                updated[expIdx].company = e.target.value;
                                setResumeData({ ...resumeData, experience: updated });
                              }}
                              className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="font-bold text-slate-700 block mb-0.5">Dates / Period</label>
                            <input
                              type="text"
                              value={exp.dates}
                              onChange={(e) => {
                                const updated = [...resumeData.experience];
                                updated[expIdx].dates = e.target.value;
                                setResumeData({ ...resumeData, experience: updated });
                              }}
                              className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs"
                            />
                          </div>
                          <div>
                            <label className="font-bold text-slate-700 block mb-0.5">Location</label>
                            <input
                              type="text"
                              value={exp.location}
                              onChange={(e) => {
                                const updated = [...resumeData.experience];
                                updated[expIdx].location = e.target.value;
                                setResumeData({ ...resumeData, experience: updated });
                              }}
                              className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs"
                            />
                          </div>
                        </div>

                        <div>
                          <div className="flex items-center justify-between mb-1">
                            <label className="font-bold text-slate-700">Achievement Bullets</label>
                            <button
                              type="button"
                              onClick={() => {
                                const updated = [...resumeData.experience];
                                updated[expIdx].bullets.push("Achieved measurable impact using modern tooling.");
                                setResumeData({ ...resumeData, experience: updated });
                              }}
                              className="text-pink-600 hover:text-pink-700 font-bold text-[10px] cursor-pointer"
                            >
                              + Add Bullet
                            </button>
                          </div>
                          <div className="space-y-1.5">
                            {exp.bullets.map((bullet, bIdx) => (
                              <div key={bIdx} className="flex items-center gap-1.5">
                                <input
                                  type="text"
                                  value={bullet}
                                  onChange={(e) => {
                                    const updated = [...resumeData.experience];
                                    updated[expIdx].bullets[bIdx] = e.target.value;
                                    setResumeData({ ...resumeData, experience: updated });
                                  }}
                                  className="flex-1 px-2.5 py-1 bg-white border border-slate-200 rounded-lg text-xs"
                                />
                                {exp.bullets.length > 1 && (
                                  <button
                                    type="button"
                                    onClick={() => {
                                      const updated = [...resumeData.experience];
                                      updated[expIdx].bullets = updated[expIdx].bullets.filter(
                                        (_, i) => i !== bIdx
                                      );
                                      setResumeData({ ...resumeData, experience: updated });
                                    }}
                                    className="text-slate-400 hover:text-rose-600 p-1"
                                  >
                                    ×
                                  </button>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    ))}

                    <button
                      type="button"
                      onClick={() => {
                        setResumeData({
                          ...resumeData,
                          experience: [
                            ...resumeData.experience,
                            {
                              company: "Company Name",
                              role: "Software Engineer",
                              location: "City, Country",
                              dates: "2023 — Present",
                              bullets: ["Spearheaded new engineering workflows and improved metrics."],
                            },
                          ],
                        });
                      }}
                      className="w-full py-2 bg-pink-50 hover:bg-pink-100 text-pink-700 border border-pink-200 rounded-xl font-bold transition-colors cursor-pointer text-center"
                    >
                      + Add Work Experience
                    </button>
                  </div>
                )}

                {/* Section 3: Education */}
                {activeEditorSection === "education" && (
                  <div className="space-y-4 text-xs">
                    {resumeData.education.map((edu, eduIdx) => (
                      <div
                        key={eduIdx}
                        className="p-3.5 bg-slate-50/70 rounded-2xl border border-slate-200/80 space-y-2.5"
                      >
                        <div className="flex items-center justify-between pb-1 border-b border-slate-200">
                          <span className="font-extrabold text-slate-800 text-[11px]">
                            Education #{eduIdx + 1}
                          </span>
                          {resumeData.education.length > 1 && (
                            <button
                              type="button"
                              onClick={() => {
                                const updated = resumeData.education.filter((_, i) => i !== eduIdx);
                                setResumeData({ ...resumeData, education: updated });
                              }}
                              className="text-rose-600 hover:text-rose-700 text-[11px] font-bold cursor-pointer"
                            >
                              Remove
                            </button>
                          )}
                        </div>

                        <div>
                          <label className="font-bold text-slate-700 block mb-0.5">Institution / University</label>
                          <input
                            type="text"
                            value={edu.institution}
                            onChange={(e) => {
                              const updated = [...resumeData.education];
                              updated[eduIdx].institution = e.target.value;
                              setResumeData({ ...resumeData, education: updated });
                            }}
                            className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs"
                          />
                        </div>

                        <div>
                          <label className="font-bold text-slate-700 block mb-0.5">Degree &amp; Major</label>
                          <input
                            type="text"
                            value={edu.degree}
                            onChange={(e) => {
                              const updated = [...resumeData.education];
                              updated[eduIdx].degree = e.target.value;
                              setResumeData({ ...resumeData, education: updated });
                            }}
                            className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs"
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="font-bold text-slate-700 block mb-0.5">Dates / Grad Year</label>
                            <input
                              type="text"
                              value={edu.dates}
                              onChange={(e) => {
                                const updated = [...resumeData.education];
                                updated[eduIdx].dates = e.target.value;
                                setResumeData({ ...resumeData, education: updated });
                              }}
                              className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs"
                            />
                          </div>
                          <div>
                            <label className="font-bold text-slate-700 block mb-0.5">GPA (optional)</label>
                            <input
                              type="text"
                              value={edu.gpa || ""}
                              onChange={(e) => {
                                const updated = [...resumeData.education];
                                updated[eduIdx].gpa = e.target.value;
                                setResumeData({ ...resumeData, education: updated });
                              }}
                              className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs"
                            />
                          </div>
                        </div>
                      </div>
                    ))}

                    <button
                      type="button"
                      onClick={() => {
                        setResumeData({
                          ...resumeData,
                          education: [
                            ...resumeData.education,
                            {
                              institution: "University Name",
                              degree: "Degree Title",
                              location: "City, Country",
                              dates: "2020 — 2024",
                            },
                          ],
                        });
                      }}
                      className="w-full py-2 bg-pink-50 hover:bg-pink-100 text-pink-700 border border-pink-200 rounded-xl font-bold transition-colors cursor-pointer text-center"
                    >
                      + Add Education
                    </button>
                  </div>
                )}

                {/* Section 4: Projects */}
                {activeEditorSection === "projects" && (
                  <div className="space-y-4 text-xs">
                    {resumeData.projects.map((proj, projIdx) => (
                      <div
                        key={projIdx}
                        className="p-3.5 bg-slate-50/70 rounded-2xl border border-slate-200/80 space-y-2.5"
                      >
                        <div className="flex items-center justify-between pb-1 border-b border-slate-200">
                          <span className="font-extrabold text-slate-800 text-[11px]">
                            Project #{projIdx + 1}
                          </span>
                          {resumeData.projects.length > 1 && (
                            <button
                              type="button"
                              onClick={() => {
                                const updated = resumeData.projects.filter((_, i) => i !== projIdx);
                                setResumeData({ ...resumeData, projects: updated });
                              }}
                              className="text-rose-600 hover:text-rose-700 text-[11px] font-bold cursor-pointer"
                            >
                              Remove
                            </button>
                          )}
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="font-bold text-slate-700 block mb-0.5">Project Name</label>
                            <input
                              type="text"
                              value={proj.name}
                              onChange={(e) => {
                                const updated = [...resumeData.projects];
                                updated[projIdx].name = e.target.value;
                                setResumeData({ ...resumeData, projects: updated });
                              }}
                              className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs"
                            />
                          </div>
                          <div>
                            <label className="font-bold text-slate-700 block mb-0.5">Tech Stack</label>
                            <input
                              type="text"
                              value={proj.tech}
                              onChange={(e) => {
                                const updated = [...resumeData.projects];
                                updated[projIdx].tech = e.target.value;
                                setResumeData({ ...resumeData, projects: updated });
                              }}
                              className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="font-bold text-slate-700 block mb-0.5">Link / Repository</label>
                          <input
                            type="text"
                            value={proj.link || ""}
                            onChange={(e) => {
                              const updated = [...resumeData.projects];
                              updated[projIdx].link = e.target.value;
                              setResumeData({ ...resumeData, projects: updated });
                            }}
                            className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs"
                          />
                        </div>

                        <div>
                          <label className="font-bold text-slate-700 block mb-1">Description / Bullet</label>
                          <input
                            type="text"
                            value={proj.bullets[0] || ""}
                            onChange={(e) => {
                              const updated = [...resumeData.projects];
                              updated[projIdx].bullets = [e.target.value];
                              setResumeData({ ...resumeData, projects: updated });
                            }}
                            className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs"
                          />
                        </div>
                      </div>
                    ))}

                    <button
                      type="button"
                      onClick={() => {
                        setResumeData({
                          ...resumeData,
                          projects: [
                            ...resumeData.projects,
                            {
                              name: "New Project",
                              tech: "React, Next.js, Node.js",
                              link: "github.com/project",
                              bullets: ["Developed full-stack application with automated testing."],
                            },
                          ],
                        });
                      }}
                      className="w-full py-2 bg-pink-50 hover:bg-pink-100 text-pink-700 border border-pink-200 rounded-xl font-bold transition-colors cursor-pointer text-center"
                    >
                      + Add Project
                    </button>
                  </div>
                )}

                {/* Section 5: Skills */}
                {activeEditorSection === "skills" && (
                  <div className="space-y-3 text-xs">
                    <div>
                      <label className="font-bold text-slate-800 block mb-1">Languages</label>
                      <input
                        type="text"
                        value={resumeData.skills?.languages || ""}
                        onChange={(e) =>
                          setResumeData({
                            ...resumeData,
                            skills: { ...resumeData.skills, languages: e.target.value },
                          })
                        }
                        placeholder="JavaScript, TypeScript, Python, C++, SQL..."
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-pink-600 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="font-bold text-slate-800 block mb-1">Frameworks &amp; Platforms</label>
                      <input
                        type="text"
                        value={resumeData.skills?.frameworks || ""}
                        onChange={(e) =>
                          setResumeData({
                            ...resumeData,
                            skills: { ...resumeData.skills, frameworks: e.target.value },
                          })
                        }
                        placeholder="React, Next.js, FastAPI, Node.js, Tailwind CSS..."
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-pink-600 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="font-bold text-slate-800 block mb-1">Developer Tools &amp; Cloud</label>
                      <input
                        type="text"
                        value={resumeData.skills?.tools || ""}
                        onChange={(e) =>
                          setResumeData({
                            ...resumeData,
                            skills: { ...resumeData.skills, tools: e.target.value },
                          })
                        }
                        placeholder="Git, Docker, PostgreSQL, Supabase, Linux, Vercel..."
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-pink-600 focus:outline-none"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* ── Right Column: Document Preview (lg: 7 cols) ── */}
              <div
                className={`lg:col-span-7 ${
                  mobileBuilderTab === "editor" ? "hidden lg:block" : "block"
                }`}
              >
                <ResumeLivePreview
                  data={resumeData}
                  templateId={selectedTemplate}
                  onTemplateChange={(tmpl) => setSelectedTemplate(tmpl)}
                />
              </div>
            </div>
          </div>
        )}

      {/* LaTeX Code Modal (for SB2Nov) */}
      {showLatexModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in">
          <div className="bg-slate-900 text-slate-100 rounded-2xl border border-slate-800 max-w-2xl w-full p-5 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Code2 className="w-5 h-5 text-emerald-400" />
                <h3 className="font-black text-sm text-white">
                  SB2Nov LaTeX Source Code (.tex)
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowLatexModal(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 text-xs"
              >
                Close
              </button>
            </div>

            <p className="text-xs text-slate-400">
              Copy this code and paste directly into{" "}
              <span className="text-emerald-400 font-bold">Overleaf</span> or compile with{" "}
              <code className="text-slate-200 bg-slate-800 px-1 py-0.5 rounded">pdflatex</code>.
            </p>

            <div className="relative">
              <pre className="bg-slate-950 text-slate-300 p-4 rounded-xl text-[11px] font-mono max-h-80 overflow-y-auto border border-slate-800 whitespace-pre">
                {generateSB2NovLaTeX(resumeData)}
              </pre>

              <button
                type="button"
                onClick={handleCopyLatex}
                className="absolute top-3 right-3 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold px-3 py-1.5 rounded-lg flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
              >
                {copiedLatex ? (
                  <>
                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                    <span>Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy LaTeX</span>
                  </>
                )}
              </button>
            </div>

            <div className="flex justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={() => setShowLatexModal(false)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold rounded-xl"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function ResumeBuilderPage() {
  return (
    <React.Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center text-slate-500 font-bold text-sm">
          Loading Resume Studio...
        </div>
      }
    >
      <ResumeBuilderInner />
    </React.Suspense>
  );
}
