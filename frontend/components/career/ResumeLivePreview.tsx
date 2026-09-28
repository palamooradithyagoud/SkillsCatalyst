"use client";

import React, { useState } from "react";
import {
  Printer,
  Copy,
  Check,
  Download,
  Code2,
  ExternalLink,
  Sparkles,
  FileText,
  Mail,
  Phone,
  MapPin,
  Globe,
  Link as LinkIcon,
  Award,
  Terminal,
  Code,
  Trophy,
  Languages,
} from "lucide-react";
import { ResumeTemplateId } from "./TemplateSelectModal";
import { ResumeData, generateSB2NovLaTeX, hasAnySkill } from "@/lib/career/latexExportHelper";

interface ResumeLivePreviewProps {
  data: ResumeData;
  templateId: ResumeTemplateId;
  onTemplateChange?: (newTemplate: ResumeTemplateId) => void;
}

const normalizeUrl = (url?: string): string => {
  if (!url) return "#";
  const trimmed = url.trim();
  if (/^https?:\/\//i.test(trimmed)) {
    return trimmed;
  }
  return `https://${trimmed}`;
};

export default function ResumeLivePreview({
  data,
  templateId,
  onTemplateChange,
}: ResumeLivePreviewProps) {
  const [copiedLatex, setCopiedLatex] = useState(false);
  const [showLatexModal, setShowLatexModal] = useState(false);

  const handlePrint = () => {
    window.print();
  };

  const handleCopyLatex = () => {
    const latex = generateSB2NovLaTeX(data);
    navigator.clipboard.writeText(latex);
    setCopiedLatex(true);
    setTimeout(() => setCopiedLatex(false), 2500);
  };

  // Filter out any items that only contain empty or whitespace strings
  const validEducation = (data.education || []).filter(
    (edu) => Boolean(edu.institution?.trim()) || Boolean(edu.degree?.trim()) || Boolean(edu.fieldOfStudy?.trim())
  );

  const validExperience = (data.experience || []).filter(
    (exp) =>
      Boolean(exp.company?.trim()) ||
      Boolean(exp.role?.trim()) ||
      Boolean(exp.location?.trim()) ||
      (exp.bullets && exp.bullets.some((b) => b?.trim().length > 0))
  );

  const validProjects = (data.projects || []).filter(
    (proj) =>
      Boolean(proj.name?.trim()) ||
      Boolean(proj.tech?.trim()) ||
      Boolean(proj.link?.trim()) ||
      Boolean(proj.githubUrl?.trim()) ||
      (proj.bullets && proj.bullets.some((b) => b?.trim().length > 0))
  );

  const validCertifications = (data.certifications || []).filter(
    (c) => Boolean(c.name?.trim()) || Boolean(c.issuer?.trim())
  );

  const validAchievements = (data.achievements || []).filter(
    (a) => Boolean(a.title?.trim()) || Boolean(a.description?.trim())
  );

  const validSpokenLanguages = (data.spokenLanguages || []).filter(
    (l) => Boolean(l.name?.trim())
  );

  // Helper for rendering skills lines
  const renderSkillRows = (textClass = "text-slate-800") => {
    const s = data.skills;
    if (!s || !hasAnySkill(s)) return null;

    const rows: { label: string; value: string }[] = [];
    if (s.languages?.trim()) rows.push({ label: "Languages", value: s.languages.trim() });
    if (s.frameworks?.trim()) rows.push({ label: "Frameworks & Libraries", value: s.frameworks.trim() });
    if (s.databases?.trim()) rows.push({ label: "Databases", value: s.databases.trim() });
    if (s.tools?.trim()) rows.push({ label: "Developer Tools", value: s.tools.trim() });
    if (s.cloudDevOps?.trim()) rows.push({ label: "Cloud & DevOps", value: s.cloudDevOps.trim() });
    if (s.softSkills?.trim()) rows.push({ label: "Core Competencies", value: s.softSkills.trim() });
    if (s.custom?.trim()) rows.push({ label: "Other / Custom", value: s.custom.trim() });
    if (s.libraries?.trim()) rows.push({ label: "Libraries", value: s.libraries.trim() });

    // Fallback only if no categorized row exists but legacy 'all' is provided
    if (rows.length === 0 && s.all?.trim()) {
      return (
        <div>
          <span className="font-bold">Technical Skills: </span>
          <span className={textClass}>{s.all.trim()}</span>
        </div>
      );
    }

    return (
      <div className="space-y-0.5">
        {rows.map((row, idx) => (
          <div key={idx}>
            <span className="font-bold">{row.label}: </span>
            <span className={textClass}>{row.value}</span>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-3">
      {/* Print stylesheet to guarantee only the resume document is printed/saved as PDF */}
      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden !important;
          }
          #resume-printable-document,
          #resume-printable-document * {
            visibility: visible !important;
          }
          #resume-printable-document {
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
            max-width: 100% !important;
            min-height: auto !important;
            margin: 0 !important;
            padding: 12mm !important;
            border: none !important;
            box-shadow: none !important;
            background: #ffffff !important;
          }
          @page {
            size: A4;
            margin: 0;
          }
        }
      `}</style>

      {/* ──────────────────────────────────────────────────────────
          DOCUMENT PREVIEW CANVAS
          (Standard A4 / Letter simulation with real typography)
      ────────────────────────────────────────────────────────── */}
      <div className="bg-slate-100 p-2 sm:p-5 rounded-2xl border border-slate-200 shadow-inner overflow-x-auto print:bg-white print:p-0 print:border-0 print:shadow-none">
        <div
          id="resume-printable-document"
          className="bg-white mx-auto shadow-xl print:shadow-none border border-slate-200 print:border-0 p-6 sm:p-10 text-slate-900 transition-all max-w-[800px] min-h-[1050px] w-full"
          style={{ boxSizing: "border-box" }}
        >
          {/* =========================================================
              TEMPLATE 1: SIMPLE AND CLASSIC
          ========================================================= */}
          {templateId === "simple-classic" && (
            <div className="font-serif text-[12.5px] leading-relaxed space-y-4 text-slate-800">
              {/* Header */}
              <div className="text-center pb-2.5 border-b-2 border-slate-800 space-y-1">
                <h1 className="text-2xl font-bold tracking-wider text-slate-900 uppercase">
                  {data.fullName || "YOUR NAME"}
                </h1>
                {data.role && (
                  <p className="text-xs font-sans font-bold text-slate-600 tracking-wide">
                    {data.role}
                  </p>
                )}
                <div className="text-[11px] font-sans text-slate-600 flex flex-wrap items-center justify-center gap-x-2 gap-y-0.5 pt-0.5">
                  {data.email && (
                    <a href={`mailto:${data.email}`} className="text-slate-800 hover:text-pink-600 underline">
                      {data.email}
                    </a>
                  )}
                  {data.phone && <span>· {data.phone}</span>}
                  {data.location && <span>· {data.location}</span>}
                  {data.linkedin && (
                    <span>
                      · <a href={normalizeUrl(data.linkedin)} target="_blank" rel="noopener noreferrer" className="text-slate-800 underline hover:text-pink-600 font-medium">LinkedIn</a>
                    </span>
                  )}
                  {data.github && (
                    <span>
                      · <a href={normalizeUrl(data.github)} target="_blank" rel="noopener noreferrer" className="text-slate-800 underline hover:text-pink-600 font-medium">GitHub</a>
                    </span>
                  )}
                  {data.leetcode && (
                    <span>
                      · <a href={normalizeUrl(data.leetcode)} target="_blank" rel="noopener noreferrer" className="text-slate-800 underline hover:text-pink-600 font-medium">LeetCode</a>
                    </span>
                  )}
                  {data.codechef && (
                    <span>
                      · <a href={normalizeUrl(data.codechef)} target="_blank" rel="noopener noreferrer" className="text-slate-800 underline hover:text-pink-600 font-medium">CodeChef</a>
                    </span>
                  )}
                  {data.hackerrank && (
                    <span>
                      · <a href={normalizeUrl(data.hackerrank)} target="_blank" rel="noopener noreferrer" className="text-slate-800 underline hover:text-pink-600 font-medium">HackerRank</a>
                    </span>
                  )}
                  {data.portfolio && (
                    <span>
                      · <a href={normalizeUrl(data.portfolio)} target="_blank" rel="noopener noreferrer" className="text-slate-800 underline hover:text-pink-600 font-medium">Portfolio</a>
                    </span>
                  )}
                </div>
              </div>

              {/* Summary */}
              {data.summary && (
                <div className="space-y-1">
                  <h2 className="text-xs font-sans font-black tracking-widest text-slate-900 uppercase border-b border-slate-300 pb-0.5">
                    Professional Summary
                  </h2>
                  <p className="text-xs text-slate-700 leading-normal pt-0.5">
                    {data.summary}
                  </p>
                </div>
              )}

              {/* Education */}
              {validEducation.length > 0 && (
                <div className="space-y-1.5">
                  <h2 className="text-xs font-sans font-black tracking-widest text-slate-900 uppercase border-b border-slate-300 pb-0.5">
                    Education
                  </h2>
                  <div className="space-y-2">
                    {validEducation.map((edu, idx) => {
                      const displayDates = edu.dates || (edu.startDate ? `${edu.startDate} — ${edu.endDate || "Present"}` : "");
                      const degreeLine = edu.fieldOfStudy ? `${edu.degree} in ${edu.fieldOfStudy}` : edu.degree;
                      return (
                        <div key={idx} className="space-y-0.5">
                          <div className="flex justify-between items-baseline">
                            <div>
                              <div className="font-bold text-slate-900">{edu.institution}</div>
                              <div className="italic text-xs text-slate-700">
                                {degreeLine}
                                {edu.gpa && ` · ${edu.gpaType || "GPA"}: ${edu.gpa}`}
                              </div>
                            </div>
                            <div className="text-right text-xs font-sans text-slate-600 shrink-0">
                              <div>{displayDates}</div>
                              {edu.location && <div className="italic">{edu.location}</div>}
                            </div>
                          </div>
                          {edu.activities && (
                            <div className="text-[11px] text-slate-600 italic">
                              Activities: {edu.activities}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Experience */}
              {validExperience.length > 0 && (
                <div className="space-y-2">
                  <h2 className="text-xs font-sans font-black tracking-widest text-slate-900 uppercase border-b border-slate-300 pb-0.5">
                    Work Experience
                  </h2>
                  <div className="space-y-2.5">
                    {validExperience.map((exp, idx) => {
                      const displayDates = exp.dates || (exp.startDate ? `${exp.startDate} — ${exp.currentlyWorking ? "Present" : exp.endDate || "Present"}` : "");
                      const validBullets = (exp.bullets || []).filter((b) => b?.trim().length > 0);
                      return (
                        <div key={idx} className="space-y-0.5">
                          <div className="flex justify-between items-baseline">
                            <div>
                              <span className="font-bold text-slate-900">{exp.role}</span>
                              {exp.company && (
                                <span className="text-slate-600">{exp.role ? ` — ${exp.company}` : exp.company}</span>
                              )}
                            </div>
                            <div className="text-right text-xs font-sans text-slate-600 shrink-0">
                              <span>{displayDates}</span>
                              {exp.location && <span> | {exp.location}</span>}
                            </div>
                          </div>
                          {validBullets.length > 0 && (
                            <ul className="list-disc list-outside pl-4 text-xs text-slate-700 space-y-0.5">
                              {validBullets.map((bullet, bIdx) => (
                                <li key={bIdx} className="leading-snug">
                                  {bullet}
                                </li>
                              ))}
                            </ul>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Projects */}
              {validProjects.length > 0 && (
                <div className="space-y-2">
                  <h2 className="text-xs font-sans font-black tracking-widest text-slate-900 uppercase border-b border-slate-300 pb-0.5">
                    Projects
                  </h2>
                  <div className="space-y-2.5">
                    {validProjects.map((proj, idx) => {
                      const validBullets = (proj.bullets || []).filter((b) => b?.trim().length > 0);
                      return (
                        <div key={idx} className="space-y-0.5">
                          <div className="flex justify-between items-baseline">
                            <div>
                              <span className="font-bold text-slate-900">{proj.name}</span>
                              {proj.tech && (
                                <span className="italic text-xs text-slate-600">
                                  {proj.name ? ` | ${proj.tech}` : proj.tech}
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-2 text-xs font-sans text-slate-500">
                              {proj.link && (
                                <a href={normalizeUrl(proj.link)} target="_blank" rel="noopener noreferrer" className="text-slate-600 hover:text-pink-600 underline">
                                  Live Demo ↗
                                </a>
                              )}
                              {proj.githubUrl && (
                                <a href={normalizeUrl(proj.githubUrl)} target="_blank" rel="noopener noreferrer" className="text-slate-600 hover:text-pink-600 underline">
                                  GitHub ↗
                                </a>
                              )}
                            </div>
                          </div>
                          {validBullets.length > 0 && (
                            <ul className="list-disc list-outside pl-4 text-xs text-slate-700 space-y-0.5">
                              {validBullets.map((b, bIdx) => (
                                <li key={bIdx} className="leading-snug">
                                  {b}
                                </li>
                              ))}
                            </ul>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Technical Skills */}
              {hasAnySkill(data.skills) && (
                <div className="space-y-1">
                  <h2 className="text-xs font-sans font-black tracking-widest text-slate-900 uppercase border-b border-slate-300 pb-0.5">
                    Skills &amp; Competencies
                  </h2>
                  <div className="text-xs pt-0.5">
                    {renderSkillRows()}
                  </div>
                </div>
              )}

              {/* Certifications */}
              {validCertifications.length > 0 && (
                <div className="space-y-1.5">
                  <h2 className="text-xs font-sans font-black tracking-widest text-slate-900 uppercase border-b border-slate-300 pb-0.5">
                    Certifications
                  </h2>
                  <div className="space-y-1 text-xs">
                    {validCertifications.map((c, idx) => (
                      <div key={idx} className="flex justify-between items-baseline">
                        <div>
                          <span className="font-bold text-slate-900">{c.name}</span>
                          {c.issuer && (
                            <span className="text-slate-600">{c.name ? ` — ${c.issuer}` : c.issuer}</span>
                          )}
                          {c.credentialUrl && (
                            <a
                              href={normalizeUrl(c.credentialUrl)}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-slate-500 hover:text-pink-600 underline font-sans text-[11px] ml-1.5"
                            >
                              Verify Credential ↗
                            </a>
                          )}
                        </div>
                        {c.date && <span className="text-slate-500 font-sans text-[11px] shrink-0">{c.date}</span>}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Achievements */}
              {validAchievements.length > 0 && (
                <div className="space-y-1.5">
                  <h2 className="text-xs font-sans font-black tracking-widest text-slate-900 uppercase border-b border-slate-300 pb-0.5">
                    Achievements &amp; Honors
                  </h2>
                  <div className="space-y-1.5 text-xs">
                    {validAchievements.map((ach, idx) => (
                      <div key={idx} className="space-y-0.5">
                        <div className="flex justify-between items-baseline">
                          <span className="font-bold text-slate-900">{ach.title}</span>
                          {ach.date && (
                            <span className="text-slate-500 font-sans text-[11px] shrink-0">{ach.date}</span>
                          )}
                        </div>
                        {ach.description && (
                          <div className="text-slate-700 pl-2 border-l border-slate-300 text-[11.5px]">
                            {ach.description}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Spoken Languages */}
              {validSpokenLanguages.length > 0 && (
                <div className="space-y-1">
                  <h2 className="text-xs font-sans font-black tracking-widest text-slate-900 uppercase border-b border-slate-300 pb-0.5">
                    Languages
                  </h2>
                  <div className="text-xs text-slate-700 flex flex-wrap gap-2 pt-0.5">
                    {validSpokenLanguages.map((l, idx) => (
                      <span key={idx}>
                        <span className="font-semibold text-slate-900">{l.name}</span> ({l.proficiency})
                        {idx < validSpokenLanguages.length - 1 && " ·"}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Empty state hint if no section content exists yet */}
              {validEducation.length === 0 &&
                validExperience.length === 0 &&
                validProjects.length === 0 &&
                !hasAnySkill(data.skills) &&
                validCertifications.length === 0 &&
                validAchievements.length === 0 &&
                validSpokenLanguages.length === 0 &&
                !data.summary && (
                  <div className="py-12 px-6 text-center border-2 border-dashed border-slate-200 rounded-xl my-6 bg-slate-50/50">
                    <FileText className="w-8 h-8 mx-auto text-slate-300 mb-2" />
                    <p className="text-xs font-bold text-slate-700">Resume Preview Ready</p>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Fill out your contact, experience, education, or skills on the left to see your resume build live.
                    </p>
                  </div>
                )}
            </div>
          )}

          {/* =========================================================
              TEMPLATE 2: MODERN CV
          ========================================================= */}
          {templateId === "modern-cv" && (
            <div className="font-sans text-[12.5px] leading-relaxed space-y-4 text-slate-800">
              {/* Modern Accent Header */}
              <div className="pb-3 border-b-2 border-purple-600 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                    {data.fullName || "Your Name"}
                  </h1>
                  {data.role && <p className="text-sm font-bold text-purple-600 mt-0.5">{data.role}</p>}
                </div>
                <div className="text-[11px] text-slate-600 space-y-0.5 text-left sm:text-right shrink-0">
                  {data.email && (
                    <div className="flex items-center sm:justify-end gap-1.5">
                      <Mail className="w-3 h-3 text-purple-600 shrink-0" />
                      <a href={`mailto:${data.email}`} className="text-slate-700 hover:text-purple-600 hover:underline">
                        {data.email}
                      </a>
                    </div>
                  )}
                  {data.phone && (
                    <div className="flex items-center sm:justify-end gap-1.5">
                      <Phone className="w-3 h-3 text-purple-600 shrink-0" />
                      <span>{data.phone}</span>
                    </div>
                  )}
                  {data.location && (
                    <div className="flex items-center sm:justify-end gap-1.5">
                      <MapPin className="w-3 h-3 text-purple-600 shrink-0" />
                      <span>{data.location}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Links row (Platform names as clean clickable badges) */}
              {(data.linkedin || data.github || data.leetcode || data.codechef || data.hackerrank || data.portfolio) && (
                <div className="flex flex-wrap items-center gap-1.5 pt-0.5 text-[11px]">
                  {data.linkedin && (
                    <a
                      href={normalizeUrl(data.linkedin)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 px-2 py-0.5 rounded font-semibold flex items-center gap-1 transition-colors"
                    >
                      <LinkIcon className="w-2.5 h-2.5" />
                      LinkedIn
                    </a>
                  )}
                  {data.github && (
                    <a
                      href={normalizeUrl(data.github)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-200 px-2 py-0.5 rounded font-semibold flex items-center gap-1 transition-colors"
                    >
                      <Globe className="w-2.5 h-2.5" />
                      GitHub
                    </a>
                  )}
                  {data.leetcode && (
                    <a
                      href={normalizeUrl(data.leetcode)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 px-2 py-0.5 rounded font-semibold flex items-center gap-1 transition-colors"
                    >
                      <Code className="w-2.5 h-2.5" />
                      LeetCode
                    </a>
                  )}
                  {data.codechef && (
                    <a
                      href={normalizeUrl(data.codechef)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 px-2 py-0.5 rounded font-semibold flex items-center gap-1 transition-colors"
                    >
                      <Terminal className="w-2.5 h-2.5" />
                      CodeChef
                    </a>
                  )}
                  {data.hackerrank && (
                    <a
                      href={normalizeUrl(data.hackerrank)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 px-2 py-0.5 rounded font-semibold flex items-center gap-1 transition-colors"
                    >
                      <Award className="w-2.5 h-2.5" />
                      HackerRank
                    </a>
                  )}
                  {data.portfolio && (
                    <a
                      href={normalizeUrl(data.portfolio)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-blue-50 hover:bg-blue-100 text-blue-800 border border-blue-200 px-2 py-0.5 rounded font-semibold flex items-center gap-1 transition-colors"
                    >
                      <ExternalLink className="w-2.5 h-2.5" />
                      Portfolio
                    </a>
                  )}
                </div>
              )}

              {/* Professional Summary */}
              {data.summary && (
                <div className="p-2.5 bg-purple-50/50 rounded-xl border border-purple-100 text-xs text-slate-700 leading-normal">
                  <span className="font-bold text-purple-900 block mb-0.5">
                    Profile Summary
                  </span>
                  {data.summary}
                </div>
              )}

              {/* Skills Tag Cloud */}
              {hasAnySkill(data.skills) && (
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-purple-600" />
                    <h2 className="text-xs font-black uppercase tracking-wider text-slate-900">
                      Core Technical Skills
                    </h2>
                  </div>
                  <div className="text-xs bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                    {renderSkillRows()}
                  </div>
                </div>
              )}

              {/* Experience */}
              {validExperience.length > 0 && (
                <div className="space-y-2.5">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-purple-600" />
                    <h2 className="text-xs font-black uppercase tracking-wider text-slate-900">
                      Work Experience
                    </h2>
                  </div>
                  <div className="space-y-2.5">
                    {validExperience.map((exp, idx) => {
                      const displayDates = exp.dates || (exp.startDate ? `${exp.startDate} — ${exp.currentlyWorking ? "Present" : exp.endDate || "Present"}` : "");
                      const validBullets = (exp.bullets || []).filter((b) => b?.trim().length > 0);
                      return (
                        <div
                          key={idx}
                          className="pl-3 border-l-2 border-purple-300 space-y-1 relative"
                        >
                          <div className="flex justify-between items-baseline flex-wrap gap-1">
                            <div>
                              <span className="font-black text-slate-900 text-xs">
                                {exp.role}
                              </span>
                              {exp.company && (
                                <span className="text-purple-700 font-bold">
                                  {exp.role ? ` · ${exp.company}` : exp.company}
                                </span>
                              )}
                              {exp.location && (
                                <span className="text-slate-500 text-[11px]"> ({exp.location})</span>
                              )}
                            </div>
                            <span className="text-[11px] font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
                              {displayDates}
                            </span>
                          </div>
                          {validBullets.length > 0 && (
                            <ul className="list-disc list-outside pl-4 text-xs text-slate-700 space-y-0.5 pt-0.5">
                              {validBullets.map((b, bIdx) => (
                                <li key={bIdx} className="leading-snug">
                                  {b}
                                </li>
                              ))}
                            </ul>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Projects */}
              {validProjects.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-purple-600" />
                    <h2 className="text-xs font-black uppercase tracking-wider text-slate-900">
                      Featured Projects
                    </h2>
                  </div>
                  <div className="grid grid-cols-1 gap-2">
                    {validProjects.map((proj, idx) => {
                      const validBullets = (proj.bullets || []).filter((b) => b?.trim().length > 0);
                      return (
                        <div
                          key={idx}
                          className="p-2.5 rounded-xl border border-slate-200 bg-slate-50/50 space-y-1"
                        >
                          <div className="flex justify-between items-baseline">
                            <span className="font-bold text-slate-900 text-xs">
                              {proj.name}
                            </span>
                            <div className="flex items-center gap-2">
                              {proj.tech && (
                                <span className="text-[11px] font-semibold text-purple-600">
                                  {proj.tech}
                                </span>
                              )}
                              {proj.link && (
                                <a href={normalizeUrl(proj.link)} target="_blank" rel="noopener noreferrer" className="text-purple-600 hover:text-purple-800 text-[11px] font-semibold underline">
                                  Live Demo ↗
                                </a>
                              )}
                              {proj.githubUrl && (
                                <a href={normalizeUrl(proj.githubUrl)} target="_blank" rel="noopener noreferrer" className="text-slate-600 hover:text-slate-900 text-[11px] font-semibold underline">
                                  GitHub ↗
                                </a>
                              )}
                            </div>
                          </div>
                          {validBullets.length > 0 && (
                            <ul className="list-disc list-outside pl-4 text-xs text-slate-700 space-y-0.5">
                              {validBullets.map((b, bIdx) => (
                                <li key={bIdx} className="leading-snug">
                                  {b}
                                </li>
                              ))}
                            </ul>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Education */}
              {validEducation.length > 0 && (
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-purple-600" />
                    <h2 className="text-xs font-black uppercase tracking-wider text-slate-900">
                      Education
                    </h2>
                  </div>
                  <div className="space-y-2">
                    {validEducation.map((edu, idx) => {
                      const displayDates = edu.dates || (edu.startDate ? `${edu.startDate} — ${edu.endDate || "Present"}` : "");
                      const degreeLine = edu.fieldOfStudy ? `${edu.degree} in ${edu.fieldOfStudy}` : edu.degree;
                      return (
                        <div
                          key={idx}
                          className="flex justify-between items-baseline text-xs"
                        >
                          <div>
                            <div className="font-bold text-slate-900">{edu.institution}</div>
                            <div className="text-slate-600">
                              {degreeLine} {edu.gpa && `· ${edu.gpaType || "GPA"}: ${edu.gpa}`}
                            </div>
                            {edu.activities && (
                              <div className="text-[11px] text-slate-500 italic">
                                Activities: {edu.activities}
                              </div>
                            )}
                          </div>
                          <div className="text-right text-slate-500 font-semibold shrink-0">
                            <div>{displayDates}</div>
                            <div className="text-[10px]">{edu.location}</div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Certifications & Achievements in 2-col layout */}
              {(validCertifications.length > 0 || validAchievements.length > 0) && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  {validCertifications.length > 0 && (
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2">
                        <Award className="w-3.5 h-3.5 text-purple-600" />
                        <h2 className="text-xs font-black uppercase tracking-wider text-slate-900">
                          Certifications
                        </h2>
                      </div>
                      <div className="space-y-1.5 text-xs bg-purple-50/30 p-2.5 rounded-xl border border-purple-100">
                        {validCertifications.map((c, idx) => (
                          <div key={idx} className="flex justify-between items-baseline">
                            <div>
                              <div className="font-bold text-slate-900 text-[11.5px]">{c.name}</div>
                              <div className="text-[10.5px] text-slate-600">
                                {c.issuer}
                                {c.credentialUrl && (
                                  <a href={normalizeUrl(c.credentialUrl)} target="_blank" rel="noopener noreferrer" className="text-purple-600 hover:underline ml-1.5">
                                    Verify ↗
                                  </a>
                                )}
                              </div>
                            </div>
                            {c.date && <span className="text-[10px] text-slate-500 shrink-0">{c.date}</span>}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {validAchievements.length > 0 && (
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2">
                        <Trophy className="w-3.5 h-3.5 text-amber-500" />
                        <h2 className="text-xs font-black uppercase tracking-wider text-slate-900">
                          Achievements
                        </h2>
                      </div>
                      <div className="space-y-1.5 text-xs bg-amber-50/30 p-2.5 rounded-xl border border-amber-100">
                        {validAchievements.map((ach, idx) => (
                          <div key={idx} className="space-y-0.5">
                            <div className="flex justify-between items-baseline">
                              <span className="font-bold text-slate-900 text-[11.5px]">{ach.title}</span>
                              {ach.date && (
                                <span className="text-[10px] text-slate-500 shrink-0">{ach.date}</span>
                              )}
                            </div>
                            {ach.description && (
                              <p className="text-[10.5px] text-slate-600">{ach.description}</p>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Spoken Languages */}
              {validSpokenLanguages.length > 0 && (
                <div className="flex items-center gap-2 text-xs pt-1 text-slate-700">
                  <Languages className="w-3.5 h-3.5 text-purple-600 shrink-0" />
                  <span className="font-bold text-slate-900">Languages:</span>
                  <div className="flex flex-wrap gap-1.5">
                    {validSpokenLanguages.map((l, idx) => (
                      <span key={idx} className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded text-[11px] font-medium">
                        {l.name} ({l.proficiency})
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Empty state hint if no section content exists yet */}
              {validEducation.length === 0 &&
                validExperience.length === 0 &&
                validProjects.length === 0 &&
                !hasAnySkill(data.skills) &&
                validCertifications.length === 0 &&
                validAchievements.length === 0 &&
                validSpokenLanguages.length === 0 &&
                !data.summary && (
                  <div className="py-12 px-6 text-center border-2 border-dashed border-slate-200 rounded-xl my-6 bg-slate-50/50">
                    <FileText className="w-8 h-8 mx-auto text-slate-300 mb-2" />
                    <p className="text-xs font-bold text-slate-700">Resume Preview Ready</p>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Fill out your contact, experience, education, or skills on the left to see your resume build live.
                    </p>
                  </div>
                )}
            </div>
          )}

          {/* =========================================================
              TEMPLATE 3: SB2NOV (Faithful Overleaf LaTeX SWE Layout)
          ========================================================= */}
          {templateId === "sb2nov" && (
            <div className="font-serif text-[11.5px] leading-[1.32] space-y-3 text-slate-900">
              {/* LaTeX sb2nov Heading: Centered Huge Scshape Name */}
              <div className="text-center space-y-0.5 pb-0.5">
                <h1 className="text-2xl font-bold tracking-tight text-slate-900 uppercase">
                  {data.fullName || "YOUR NAME"}
                </h1>
                <div className="text-[10.5px] font-sans text-slate-700 flex flex-wrap items-center justify-center gap-x-1.5">
                  {data.phone && <span>{data.phone}</span>}
                  {data.phone && (data.email || data.linkedin || data.github) && (
                    <span className="text-slate-400">|</span>
                  )}
                  {data.email && (
                    <a href={`mailto:${data.email}`} className="text-slate-800 hover:underline">
                      {data.email}
                    </a>
                  )}
                  {data.linkedin && (
                    <>
                      <span className="text-slate-400">|</span>
                      <a href={normalizeUrl(data.linkedin)} target="_blank" rel="noopener noreferrer" className="text-slate-800 hover:underline font-medium">
                        LinkedIn
                      </a>
                    </>
                  )}
                  {data.github && (
                    <>
                      <span className="text-slate-400">|</span>
                      <a href={normalizeUrl(data.github)} target="_blank" rel="noopener noreferrer" className="text-slate-800 hover:underline font-medium">
                        GitHub
                      </a>
                    </>
                  )}
                  {data.leetcode && (
                    <>
                      <span className="text-slate-400">|</span>
                      <a href={normalizeUrl(data.leetcode)} target="_blank" rel="noopener noreferrer" className="text-slate-800 hover:underline font-medium">
                        LeetCode
                      </a>
                    </>
                  )}
                  {data.codechef && (
                    <>
                      <span className="text-slate-400">|</span>
                      <a href={normalizeUrl(data.codechef)} target="_blank" rel="noopener noreferrer" className="text-slate-800 hover:underline font-medium">
                        CodeChef
                      </a>
                    </>
                  )}
                  {data.hackerrank && (
                    <>
                      <span className="text-slate-400">|</span>
                      <a href={normalizeUrl(data.hackerrank)} target="_blank" rel="noopener noreferrer" className="text-slate-800 hover:underline font-medium">
                        HackerRank
                      </a>
                    </>
                  )}
                  {data.portfolio && (
                    <>
                      <span className="text-slate-400">|</span>
                      <a href={normalizeUrl(data.portfolio)} target="_blank" rel="noopener noreferrer" className="text-slate-800 hover:underline font-medium">
                        Portfolio
                      </a>
                    </>
                  )}
                  {data.location && (
                    <>
                      <span className="text-slate-400">|</span>
                      <span>{data.location}</span>
                    </>
                  )}
                </div>
              </div>

              {/* Summary (if present) */}
              {data.summary && (
                <div className="space-y-0.5">
                  <div className="font-bold text-[11.5px] tracking-wider uppercase border-b border-slate-900 pb-0.5">
                    Summary
                  </div>
                  <p className="text-[11px] text-slate-800 leading-snug pt-0.5">
                    {data.summary}
                  </p>
                </div>
              )}

              {/* Education */}
              {validEducation.length > 0 && (
                <div className="space-y-0.5">
                  <div className="font-bold text-[11.5px] tracking-wider uppercase border-b border-slate-900 pb-0.5">
                    Education
                  </div>
                  <div className="space-y-1 pt-0.5">
                    {validEducation.map((edu, idx) => {
                      const displayDates = edu.dates || (edu.startDate ? `${edu.startDate} — ${edu.endDate || "Present"}` : "");
                      const degreeLine = edu.fieldOfStudy ? `${edu.degree} in ${edu.fieldOfStudy}` : edu.degree;
                      return (
                        <div key={idx} className="space-y-0.5">
                          <div className="flex justify-between items-baseline font-bold text-[11px]">
                            <span>{edu.institution}</span>
                            <span className="font-normal text-slate-700">{edu.location}</span>
                          </div>
                          <div className="flex justify-between items-baseline italic text-[11px] text-slate-700">
                            <span>
                              {degreeLine}
                              {edu.gpa && `; ${edu.gpaType || "GPA"}: ${edu.gpa}`}
                            </span>
                            <span className="not-italic text-slate-600">{displayDates}</span>
                          </div>
                          {edu.activities && (
                            <div className="text-[10px] text-slate-600">
                              Activities: {edu.activities}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Experience */}
              {validExperience.length > 0 && (
                <div className="space-y-1">
                  <div className="font-bold text-[11.5px] tracking-wider uppercase border-b border-slate-900 pb-0.5">
                    Experience
                  </div>
                  <div className="space-y-1.5 pt-0.5">
                    {validExperience.map((exp, idx) => {
                      const displayDates = exp.dates || (exp.startDate ? `${exp.startDate} — ${exp.currentlyWorking ? "Present" : exp.endDate || "Present"}` : "");
                      const validBullets = (exp.bullets || []).filter((b) => b?.trim().length > 0);
                      return (
                        <div key={idx} className="space-y-0.5">
                          <div className="flex justify-between items-baseline font-bold text-[11px]">
                            <span>{exp.role}</span>
                            <span className="font-normal text-slate-700">{displayDates}</span>
                          </div>
                          <div className="flex justify-between items-baseline italic text-[11px] text-slate-700">
                            <span>{exp.company}</span>
                            <span className="not-italic text-slate-600">{exp.location}</span>
                          </div>
                          {validBullets.length > 0 && (
                            <ul className="list-disc list-outside pl-4 text-[10.5px] text-slate-800 space-y-0.5 pt-0.5">
                              {validBullets.map((b, bIdx) => (
                                <li key={bIdx} className="leading-snug">
                                  {b}
                                </li>
                              ))}
                            </ul>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Projects */}
              {validProjects.length > 0 && (
                <div className="space-y-1">
                  <div className="font-bold text-[11.5px] tracking-wider uppercase border-b border-slate-900 pb-0.5">
                    Projects
                  </div>
                  <div className="space-y-1.5 pt-0.5">
                    {validProjects.map((proj, idx) => {
                      const validBullets = (proj.bullets || []).filter((b) => b?.trim().length > 0);
                      return (
                        <div key={idx} className="space-y-0.5">
                          <div className="flex justify-between items-baseline text-[11px]">
                            <div>
                              <span className="font-bold text-slate-900">{proj.name}</span>
                              {proj.tech && (
                                <span className="text-slate-700 italic">
                                  {proj.name ? ` | ${proj.tech}` : proj.tech}
                                </span>
                              )}
                            </div>
                            <div className="text-slate-600 font-sans text-[10px] space-x-2">
                              {proj.link && (
                                <a href={normalizeUrl(proj.link)} target="_blank" rel="noopener noreferrer" className="text-slate-700 hover:underline">
                                  Live Demo ↗
                                </a>
                              )}
                              {proj.githubUrl && (
                                <a href={normalizeUrl(proj.githubUrl)} target="_blank" rel="noopener noreferrer" className="text-slate-700 hover:underline">
                                  GitHub ↗
                                </a>
                              )}
                            </div>
                          </div>
                          {validBullets.length > 0 && (
                            <ul className="list-disc list-outside pl-4 text-[10.5px] text-slate-800 space-y-0.5 pt-0.5">
                              {validBullets.map((b, bIdx) => (
                                <li key={bIdx} className="leading-snug">
                                  {b}
                                </li>
                              ))}
                            </ul>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Technical Skills */}
              {hasAnySkill(data.skills) && (
                <div className="space-y-0.5">
                  <div className="font-bold text-[11.5px] tracking-wider uppercase border-b border-slate-900 pb-0.5">
                    Technical Skills
                  </div>
                  <div className="text-[10.5px] text-slate-800 pt-0.5 font-sans">
                    {renderSkillRows()}
                  </div>
                </div>
              )}

              {/* Certifications */}
              {validCertifications.length > 0 && (
                <div className="space-y-0.5">
                  <div className="font-bold text-[11.5px] tracking-wider uppercase border-b border-slate-900 pb-0.5">
                    Certifications
                  </div>
                  <div className="space-y-1 pt-0.5 text-[10.5px]">
                    {validCertifications.map((c, idx) => (
                      <div key={idx} className="flex justify-between items-baseline">
                        <div>
                          <span className="font-bold text-slate-900">{c.name}</span>
                          {c.issuer && (
                            <span className="text-slate-700 italic">{c.name ? ` — ${c.issuer}` : c.issuer}</span>
                          )}
                          {c.credentialUrl && (
                            <a href={normalizeUrl(c.credentialUrl)} target="_blank" rel="noopener noreferrer" className="text-slate-600 hover:underline ml-1">
                              (Verify ↗)
                            </a>
                          )}
                        </div>
                        {c.date && <span className="text-slate-600">{c.date}</span>}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Achievements */}
              {validAchievements.length > 0 && (
                <div className="space-y-0.5">
                  <div className="font-bold text-[11.5px] tracking-wider uppercase border-b border-slate-900 pb-0.5">
                    Achievements &amp; Honors
                  </div>
                  <div className="space-y-1 pt-0.5 text-[10.5px]">
                    {validAchievements.map((ach, idx) => (
                      <div key={idx} className="space-y-0.5">
                        <div className="flex justify-between items-baseline font-bold">
                          <span>{ach.title}</span>
                          {ach.date && <span className="font-normal text-slate-600">{ach.date}</span>}
                        </div>
                        {ach.description && (
                          <div className="text-slate-700 pl-3 border-l border-slate-400">
                            {ach.description}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Spoken Languages */}
              {validSpokenLanguages.length > 0 && (
                <div className="space-y-0.5">
                  <div className="font-bold text-[11.5px] tracking-wider uppercase border-b border-slate-900 pb-0.5">
                    Languages
                  </div>
                  <div className="text-[10.5px] text-slate-800 pt-0.5">
                    <span className="font-bold">Spoken Languages: </span>
                    {validSpokenLanguages.map((l) => `${l.name} (${l.proficiency})`).join(", ")}
                  </div>
                </div>
              )}

              {/* Empty state hint if no section content exists yet */}
              {validEducation.length === 0 &&
                validExperience.length === 0 &&
                validProjects.length === 0 &&
                !hasAnySkill(data.skills) &&
                validCertifications.length === 0 &&
                validAchievements.length === 0 &&
                validSpokenLanguages.length === 0 &&
                !data.summary && (
                  <div className="py-12 px-6 text-center border-2 border-dashed border-slate-200 rounded-xl my-6 bg-slate-50/50">
                    <FileText className="w-8 h-8 mx-auto text-slate-300 mb-2" />
                    <p className="text-xs font-bold text-slate-700">Resume Preview Ready</p>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Fill out your contact, experience, education, or skills on the left to see your resume build live.
                    </p>
                  </div>
                )}
            </div>
          )}

          {/* =========================================================
              TEMPLATE 4: ULTRA MINIMAL
          ========================================================= */}
          {templateId === "ultra-minimal" && (
            <div className="font-sans text-[12px] leading-snug space-y-3.5 text-slate-900">
              {/* Header */}
              <div className="pb-2 border-b border-slate-200 flex flex-col sm:flex-row sm:items-baseline justify-between gap-1">
                <div>
                  <h1 className="text-2xl font-black tracking-tight text-slate-900">
                    {data.fullName || "Your Name"}
                  </h1>
                  {data.role && <p className="text-xs font-semibold text-slate-600">{data.role}</p>}
                </div>
                <div className="text-[10px] text-slate-500 flex flex-wrap gap-x-2 gap-y-0.5">
                  {data.location && <span>{data.location}</span>}
                  {data.email && (
                    <span>
                      · <a href={`mailto:${data.email}`} className="text-slate-700 hover:underline">{data.email}</a>
                    </span>
                  )}
                  {data.phone && <span>· {data.phone}</span>}
                  {data.linkedin && (
                    <span>
                      · <a href={normalizeUrl(data.linkedin)} target="_blank" rel="noopener noreferrer" className="text-slate-700 hover:underline font-medium">LinkedIn</a>
                    </span>
                  )}
                  {data.github && (
                    <span>
                      · <a href={normalizeUrl(data.github)} target="_blank" rel="noopener noreferrer" className="text-slate-700 hover:underline font-medium">GitHub</a>
                    </span>
                  )}
                  {data.leetcode && (
                    <span>
                      · <a href={normalizeUrl(data.leetcode)} target="_blank" rel="noopener noreferrer" className="text-slate-700 hover:underline font-medium">LeetCode</a>
                    </span>
                  )}
                  {data.codechef && (
                    <span>
                      · <a href={normalizeUrl(data.codechef)} target="_blank" rel="noopener noreferrer" className="text-slate-700 hover:underline font-medium">CodeChef</a>
                    </span>
                  )}
                  {data.hackerrank && (
                    <span>
                      · <a href={normalizeUrl(data.hackerrank)} target="_blank" rel="noopener noreferrer" className="text-slate-700 hover:underline font-medium">HackerRank</a>
                    </span>
                  )}
                  {data.portfolio && (
                    <span>
                      · <a href={normalizeUrl(data.portfolio)} target="_blank" rel="noopener noreferrer" className="text-slate-700 hover:underline font-medium">Portfolio</a>
                    </span>
                  )}
                </div>
              </div>

              {/* Skills */}
              {hasAnySkill(data.skills) && (
                <div className="space-y-1">
                  <div className="text-[10.5px] font-extrabold uppercase tracking-widest text-slate-400">
                    Technical Skills
                  </div>
                  <div className="text-[11px] text-slate-800 leading-normal">
                    {renderSkillRows()}
                  </div>
                </div>
              )}

              {/* Experience */}
              {validExperience.length > 0 && (
                <div className="space-y-1.5">
                  <div className="text-[10.5px] font-extrabold uppercase tracking-widest text-slate-400">
                    Experience
                  </div>
                  <div className="space-y-2">
                    {validExperience.map((exp, idx) => {
                      const displayDates = exp.dates || (exp.startDate ? `${exp.startDate} — ${exp.currentlyWorking ? "Present" : exp.endDate || "Present"}` : "");
                      const validBullets = (exp.bullets || []).filter((b) => b?.trim().length > 0);
                      return (
                        <div key={idx} className="space-y-0.5">
                          <div className="flex justify-between items-baseline text-xs">
                            <div>
                              <span className="font-bold text-slate-900">{exp.role}</span>
                              {exp.company && (
                                <span className="text-slate-500">{exp.role ? ` — ${exp.company}` : exp.company}</span>
                              )}
                            </div>
                            <span className="text-[10px] text-slate-400 font-medium">{displayDates}</span>
                          </div>
                          {validBullets.length > 0 && (
                            <ul className="list-disc list-outside pl-3 text-[11px] text-slate-700 space-y-0.5">
                              {validBullets.map((b, bIdx) => (
                                <li key={bIdx}>{b}</li>
                              ))}
                            </ul>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Projects */}
              {validProjects.length > 0 && (
                <div className="space-y-1.5">
                  <div className="text-[10.5px] font-extrabold uppercase tracking-widest text-slate-400">
                    Projects
                  </div>
                  <div className="space-y-2">
                    {validProjects.map((proj, idx) => {
                      const validBullets = (proj.bullets || []).filter((b) => b?.trim().length > 0);
                      return (
                        <div key={idx} className="space-y-0.5">
                          <div className="flex justify-between items-baseline text-xs">
                            <div>
                              <span className="font-bold text-slate-900">{proj.name}</span>
                              {proj.tech && (
                                <span className="text-slate-500">
                                  {proj.name ? ` | ${proj.tech}` : proj.tech}
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-2">
                              {proj.link && (
                                <a href={normalizeUrl(proj.link)} target="_blank" rel="noopener noreferrer" className="text-[10px] text-slate-500 hover:underline">
                                  Live Demo ↗
                                </a>
                              )}
                              {proj.githubUrl && (
                                <a href={normalizeUrl(proj.githubUrl)} target="_blank" rel="noopener noreferrer" className="text-[10px] text-slate-500 hover:underline">
                                  GitHub ↗
                                </a>
                              )}
                            </div>
                          </div>
                          {validBullets.length > 0 && (
                            <ul className="list-disc list-outside pl-3 text-[11px] text-slate-700 space-y-0.5">
                              {validBullets.map((b, bIdx) => (
                                <li key={bIdx}>{b}</li>
                              ))}
                            </ul>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Education */}
              {validEducation.length > 0 && (
                <div className="space-y-1">
                  <div className="text-[10.5px] font-extrabold uppercase tracking-widest text-slate-400">
                    Education
                  </div>
                  <div className="space-y-1">
                    {validEducation.map((edu, idx) => {
                      const displayDates = edu.dates || (edu.startDate ? `${edu.startDate} — ${edu.endDate || "Present"}` : "");
                      const degreeLine = edu.fieldOfStudy ? `${edu.degree} in ${edu.fieldOfStudy}` : edu.degree;
                      return (
                        <div key={idx} className="flex justify-between items-baseline text-[11px]">
                          <div>
                            <span className="font-bold text-slate-900">{edu.institution}</span>
                            <span className="text-slate-600"> — {degreeLine}</span>
                            {edu.gpa && <span className="text-slate-500"> ({edu.gpaType || "GPA"}: {edu.gpa})</span>}
                          </div>
                          <span className="text-[10px] text-slate-400">{displayDates}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Certifications & Achievements */}
              {(validCertifications.length > 0 || validAchievements.length > 0) && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  {validCertifications.length > 0 && (
                    <div>
                      <div className="text-[10.5px] font-extrabold uppercase tracking-widest text-slate-400 mb-1">
                        Certifications
                      </div>
                      <div className="text-[11px] space-y-0.5">
                        {validCertifications.map((c, idx) => (
                          <div key={idx} className="flex justify-between">
                            <span>
                              {c.name} {c.issuer && `(${c.issuer})`}
                              {c.credentialUrl && (
                                <a href={normalizeUrl(c.credentialUrl)} target="_blank" rel="noopener noreferrer" className="text-slate-500 hover:underline ml-1">
                                  Verify ↗
                                </a>
                              )}
                            </span>
                            {c.date && <span className="text-slate-400 text-[10px]">{c.date}</span>}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {validAchievements.length > 0 && (
                    <div>
                      <div className="text-[10.5px] font-extrabold uppercase tracking-widest text-slate-400 mb-1">
                        Achievements
                      </div>
                      <div className="text-[11px] space-y-0.5">
                        {validAchievements.map((ach, idx) => (
                          <div key={idx} className="flex justify-between">
                            <span className="font-medium">{ach.title}</span>
                            {ach.date && <span className="text-slate-400 text-[10px]">{ach.date}</span>}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Empty state hint if no section content exists yet */}
              {validEducation.length === 0 &&
                validExperience.length === 0 &&
                validProjects.length === 0 &&
                !hasAnySkill(data.skills) &&
                validCertifications.length === 0 &&
                validAchievements.length === 0 &&
                validSpokenLanguages.length === 0 &&
                !data.summary && (
                  <div className="py-12 px-6 text-center border-2 border-dashed border-slate-200 rounded-xl my-6 bg-slate-50/50">
                    <FileText className="w-8 h-8 mx-auto text-slate-300 mb-2" />
                    <p className="text-xs font-bold text-slate-700">Resume Preview Ready</p>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Fill out your contact, experience, education, or skills on the left to see your resume build live.
                    </p>
                  </div>
                )}
            </div>
          )}
        </div>
      </div>

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
                {generateSB2NovLaTeX(data)}
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
