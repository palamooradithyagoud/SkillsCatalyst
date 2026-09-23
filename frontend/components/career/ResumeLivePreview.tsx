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
} from "lucide-react";
import { ResumeTemplateId } from "./TemplateSelectModal";
import { ResumeData, generateSB2NovLaTeX } from "@/lib/career/latexExportHelper";

interface ResumeLivePreviewProps {
  data: ResumeData;
  templateId: ResumeTemplateId;
  onTemplateChange?: (newTemplate: ResumeTemplateId) => void;
}

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
            padding: 14mm !important;
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
            <div className="font-serif text-[13px] leading-relaxed space-y-5 text-slate-800">
              {/* Header */}
              <div className="text-center pb-3 border-b-2 border-slate-800 space-y-1">
                <h1 className="text-2xl font-bold tracking-wider text-slate-900 uppercase">
                  {data.fullName}
                </h1>
                <p className="text-xs font-sans font-bold text-slate-600 tracking-wide">
                  {data.role}
                </p>
                <div className="text-[11px] font-sans text-slate-600 flex flex-wrap items-center justify-center gap-x-2 gap-y-0.5 pt-0.5">
                  {data.email && <span>{data.email}</span>}
                  {data.phone && <span>· {data.phone}</span>}
                  {data.location && <span>· {data.location}</span>}
                  {data.linkedin && <span>· {data.linkedin}</span>}
                  {data.github && <span>· {data.github}</span>}
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
              {data.education && data.education.length > 0 && (
                <div className="space-y-2">
                  <h2 className="text-xs font-sans font-black tracking-widest text-slate-900 uppercase border-b border-slate-300 pb-0.5">
                    Education
                  </h2>
                  <div className="space-y-2">
                    {data.education.map((edu, idx) => (
                      <div key={idx} className="flex justify-between items-baseline">
                        <div>
                          <div className="font-bold text-slate-900">{edu.institution}</div>
                          <div className="italic text-xs text-slate-700">
                            {edu.degree}
                            {edu.gpa && ` · GPA: ${edu.gpa}`}
                          </div>
                        </div>
                        <div className="text-right text-xs font-sans text-slate-600 shrink-0">
                          <div>{edu.dates}</div>
                          <div className="italic">{edu.location}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Experience */}
              {data.experience && data.experience.length > 0 && (
                <div className="space-y-2.5">
                  <h2 className="text-xs font-sans font-black tracking-widest text-slate-900 uppercase border-b border-slate-300 pb-0.5">
                    Experience
                  </h2>
                  <div className="space-y-3">
                    {data.experience.map((exp, idx) => (
                      <div key={idx} className="space-y-1">
                        <div className="flex justify-between items-baseline">
                          <div>
                            <span className="font-bold text-slate-900">{exp.role}</span>
                            <span className="text-slate-600"> — {exp.company}</span>
                          </div>
                          <div className="text-right text-xs font-sans text-slate-600 shrink-0">
                            <span>{exp.dates}</span>
                            {exp.location && <span> | {exp.location}</span>}
                          </div>
                        </div>
                        <ul className="list-disc list-outside pl-4 text-xs text-slate-700 space-y-0.5">
                          {exp.bullets.map((bullet, bIdx) => (
                            <li key={bIdx} className="leading-snug">
                              {bullet}
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Projects */}
              {data.projects && data.projects.length > 0 && (
                <div className="space-y-2.5">
                  <h2 className="text-xs font-sans font-black tracking-widest text-slate-900 uppercase border-b border-slate-300 pb-0.5">
                    Projects
                  </h2>
                  <div className="space-y-2.5">
                    {data.projects.map((proj, idx) => (
                      <div key={idx} className="space-y-0.5">
                        <div className="flex justify-between items-baseline">
                          <div>
                            <span className="font-bold text-slate-900">{proj.name}</span>
                            <span className="italic text-xs text-slate-600">
                              {" "}
                              | {proj.tech}
                            </span>
                          </div>
                          {proj.link && (
                            <span className="text-xs font-sans text-slate-500">
                              {proj.link}
                            </span>
                          )}
                        </div>
                        <ul className="list-disc list-outside pl-4 text-xs text-slate-700 space-y-0.5">
                          {proj.bullets.map((b, bIdx) => (
                            <li key={bIdx} className="leading-snug">
                              {b}
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Technical Skills */}
              <div className="space-y-1">
                <h2 className="text-xs font-sans font-black tracking-widest text-slate-900 uppercase border-b border-slate-300 pb-0.5">
                  Skills &amp; Competencies
                </h2>
                <div className="text-xs space-y-1 pt-0.5">
                  {data.skills?.languages && (
                    <div>
                      <span className="font-bold">Languages: </span>
                      <span className="text-slate-700">{data.skills.languages}</span>
                    </div>
                  )}
                  {data.skills?.frameworks && (
                    <div>
                      <span className="font-bold">Frameworks &amp; Systems: </span>
                      <span className="text-slate-700">{data.skills.frameworks}</span>
                    </div>
                  )}
                  {data.skills?.tools && (
                    <div>
                      <span className="font-bold">Tools &amp; Infrastructure: </span>
                      <span className="text-slate-700">{data.skills.tools}</span>
                    </div>
                  )}
                  {data.skills?.all && (
                    <div>
                      <span className="font-bold">Technical Skills: </span>
                      <span className="text-slate-700">{data.skills.all}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* =========================================================
              TEMPLATE 2: MODERN CV
          ========================================================= */}
          {templateId === "modern-cv" && (
            <div className="font-sans text-[13px] leading-relaxed space-y-5 text-slate-800">
              {/* Modern Accent Header */}
              <div className="pb-3 border-b-2 border-purple-600 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                    {data.fullName}
                  </h1>
                  <p className="text-sm font-bold text-purple-600 mt-0.5">{data.role}</p>
                </div>
                <div className="text-[11px] text-slate-600 space-y-1 text-left sm:text-right shrink-0">
                  {data.email && (
                    <div className="flex items-center sm:justify-end gap-1.5">
                      <Mail className="w-3 h-3 text-purple-600 shrink-0" />
                      <span>{data.email}</span>
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

              {/* Links row */}
              {(data.linkedin || data.github) && (
                <div className="flex flex-wrap items-center gap-2 pt-0.5 text-xs">
                  {data.linkedin && (
                    <span className="bg-purple-50 text-purple-700 border border-purple-200 px-2 py-0.5 rounded-md font-semibold flex items-center gap-1">
                      <LinkIcon className="w-3 h-3" />
                      {data.linkedin}
                    </span>
                  )}
                  {data.github && (
                    <span className="bg-slate-100 text-slate-800 border border-slate-200 px-2 py-0.5 rounded-md font-semibold flex items-center gap-1">
                      <Globe className="w-3 h-3" />
                      {data.github}
                    </span>
                  )}
                </div>
              )}

              {/* Professional Summary */}
              {data.summary && (
                <div className="p-3 bg-purple-50/50 rounded-xl border border-purple-100 text-xs text-slate-700 leading-normal">
                  <span className="font-bold text-purple-900 block mb-0.5">
                    Profile Summary
                  </span>
                  {data.summary}
                </div>
              )}

              {/* Skills Tag Cloud */}
              <div className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-purple-600" />
                  <h2 className="text-xs font-black uppercase tracking-wider text-slate-900">
                    Core Technical Skills
                  </h2>
                </div>
                <div className="flex flex-wrap gap-1.5 pt-0.5">
                  {(
                    (data.skills?.all ||
                      `${data.skills?.languages || ""}, ${data.skills?.frameworks || ""}, ${data.skills?.tools || ""}`)
                      .split(",")
                      .map((s) => s.trim())
                      .filter(Boolean)
                  ).map((skill, idx) => (
                    <span
                      key={idx}
                      className="bg-slate-100 hover:bg-purple-100 text-slate-800 hover:text-purple-800 text-[11px] font-bold px-2 py-0.5 rounded-md border border-slate-200 transition-colors"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              {/* Experience */}
              {data.experience && data.experience.length > 0 && (
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-purple-600" />
                    <h2 className="text-xs font-black uppercase tracking-wider text-slate-900">
                      Work Experience
                    </h2>
                  </div>
                  <div className="space-y-3">
                    {data.experience.map((exp, idx) => (
                      <div
                        key={idx}
                        className="pl-3 border-l-2 border-purple-200 space-y-1 relative"
                      >
                        <div className="flex justify-between items-baseline flex-wrap gap-1">
                          <div>
                            <span className="font-black text-slate-900 text-sm">
                              {exp.role}
                            </span>
                            <span className="text-purple-700 font-bold">
                              {" "}
                              · {exp.company}
                            </span>
                          </div>
                          <span className="text-xs font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                            {exp.dates}
                          </span>
                        </div>
                        <ul className="list-disc list-outside pl-4 text-xs text-slate-700 space-y-0.5 pt-0.5">
                          {exp.bullets.map((b, bIdx) => (
                            <li key={bIdx} className="leading-snug">
                              {b}
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Projects */}
              {data.projects && data.projects.length > 0 && (
                <div className="space-y-2.5">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-purple-600" />
                    <h2 className="text-xs font-black uppercase tracking-wider text-slate-900">
                      Featured Projects
                    </h2>
                  </div>
                  <div className="grid grid-cols-1 gap-2.5">
                    {data.projects.map((proj, idx) => (
                      <div
                        key={idx}
                        className="p-3 rounded-xl border border-slate-200 bg-slate-50/50 space-y-1"
                      >
                        <div className="flex justify-between items-baseline">
                          <span className="font-bold text-slate-900 text-xs">
                            {proj.name}
                          </span>
                          <span className="text-[11px] font-semibold text-purple-600">
                            {proj.tech}
                          </span>
                        </div>
                        <ul className="list-disc list-outside pl-4 text-xs text-slate-700 space-y-0.5">
                          {proj.bullets.map((b, bIdx) => (
                            <li key={bIdx} className="leading-snug">
                              {b}
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Education */}
              {data.education && data.education.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-purple-600" />
                    <h2 className="text-xs font-black uppercase tracking-wider text-slate-900">
                      Education
                    </h2>
                  </div>
                  <div className="space-y-2">
                    {data.education.map((edu, idx) => (
                      <div
                        key={idx}
                        className="flex justify-between items-baseline text-xs"
                      >
                        <div>
                          <div className="font-bold text-slate-900">{edu.institution}</div>
                          <div className="text-slate-600">
                            {edu.degree} {edu.gpa && `· GPA: ${edu.gpa}`}
                          </div>
                        </div>
                        <div className="text-right text-slate-500 font-semibold">
                          <div>{edu.dates}</div>
                          <div className="text-[10px]">{edu.location}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* =========================================================
              TEMPLATE 3: SB2NOV (Faithful Overleaf LaTeX SWE Layout)
          ========================================================= */}
          {templateId === "sb2nov" && (
            <div className="font-serif text-[12px] leading-[1.35] space-y-3.5 text-slate-900">
              {/* LaTeX sb2nov Heading: Centered Huge Scshape Name */}
              <div className="text-center space-y-0.5 pb-0.5">
                <h1 className="text-2xl font-bold tracking-tight text-slate-900 uppercase">
                  {data.fullName}
                </h1>
                <div className="text-[11px] font-sans text-slate-700 flex flex-wrap items-center justify-center gap-x-1.5">
                  {data.phone && <span>{data.phone}</span>}
                  {data.phone && (data.email || data.linkedin || data.github) && (
                    <span className="text-slate-400">|</span>
                  )}
                  {data.email && (
                    <a
                      href={`mailto:${data.email}`}
                      className="text-slate-800 hover:underline"
                    >
                      {data.email}
                    </a>
                  )}
                  {data.email && (data.linkedin || data.github) && (
                    <span className="text-slate-400">|</span>
                  )}
                  {data.linkedin && (
                    <span className="text-slate-800">{data.linkedin}</span>
                  )}
                  {data.linkedin && data.github && (
                    <span className="text-slate-400">|</span>
                  )}
                  {data.github && <span className="text-slate-800">{data.github}</span>}
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
                  <div className="font-bold text-[12px] tracking-wider uppercase border-b border-slate-900 pb-0.5">
                    Summary
                  </div>
                  <p className="text-[11px] text-slate-800 leading-snug pt-0.5">
                    {data.summary}
                  </p>
                </div>
              )}

              {/* Education */}
              {data.education && data.education.length > 0 && (
                <div className="space-y-1">
                  <div className="font-bold text-[12px] tracking-wider uppercase border-b border-slate-900 pb-0.5">
                    Education
                  </div>
                  <div className="space-y-1.5 pt-0.5">
                    {data.education.map((edu, idx) => (
                      <div key={idx} className="space-y-0.5">
                        <div className="flex justify-between items-baseline font-bold text-[11px]">
                          <span>{edu.institution}</span>
                          <span className="font-normal text-slate-700">{edu.location}</span>
                        </div>
                        <div className="flex justify-between items-baseline italic text-[11px] text-slate-700">
                          <span>
                            {edu.degree}
                            {edu.gpa && `; GPA: ${edu.gpa}`}
                          </span>
                          <span className="not-italic text-slate-600">{edu.dates}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Experience */}
              {data.experience && data.experience.length > 0 && (
                <div className="space-y-1.5">
                  <div className="font-bold text-[12px] tracking-wider uppercase border-b border-slate-900 pb-0.5">
                    Experience
                  </div>
                  <div className="space-y-2 pt-0.5">
                    {data.experience.map((exp, idx) => (
                      <div key={idx} className="space-y-0.5">
                        <div className="flex justify-between items-baseline font-bold text-[11px]">
                          <span>{exp.role}</span>
                          <span className="font-normal text-slate-700">{exp.dates}</span>
                        </div>
                        <div className="flex justify-between items-baseline italic text-[11px] text-slate-700">
                          <span>{exp.company}</span>
                          <span className="not-italic text-slate-600">{exp.location}</span>
                        </div>
                        <ul className="list-disc list-outside pl-4 text-[11px] text-slate-800 space-y-0.5 pt-0.5">
                          {exp.bullets.map((b, bIdx) => (
                            <li key={bIdx} className="leading-snug">
                              {b}
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Projects */}
              {data.projects && data.projects.length > 0 && (
                <div className="space-y-1.5">
                  <div className="font-bold text-[12px] tracking-wider uppercase border-b border-slate-900 pb-0.5">
                    Projects
                  </div>
                  <div className="space-y-2 pt-0.5">
                    {data.projects.map((proj, idx) => (
                      <div key={idx} className="space-y-0.5">
                        <div className="flex justify-between items-baseline text-[11px]">
                          <div>
                            <span className="font-bold text-slate-900">{proj.name}</span>
                            <span className="text-slate-700 italic"> | {proj.tech}</span>
                          </div>
                          {proj.link && (
                            <span className="text-slate-500 font-sans text-[10px]">
                              {proj.link}
                            </span>
                          )}
                        </div>
                        <ul className="list-disc list-outside pl-4 text-[11px] text-slate-800 space-y-0.5 pt-0.5">
                          {proj.bullets.map((b, bIdx) => (
                            <li key={bIdx} className="leading-snug">
                              {b}
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Technical Skills */}
              <div className="space-y-1">
                <div className="font-bold text-[12px] tracking-wider uppercase border-b border-slate-900 pb-0.5">
                  Technical Skills
                </div>
                <div className="text-[11px] text-slate-800 space-y-0.5 pt-0.5 font-sans">
                  {data.skills?.languages && (
                    <div>
                      <span className="font-bold">Languages: </span>
                      <span>{data.skills.languages}</span>
                    </div>
                  )}
                  {data.skills?.frameworks && (
                    <div>
                      <span className="font-bold">Frameworks: </span>
                      <span>{data.skills.frameworks}</span>
                    </div>
                  )}
                  {data.skills?.tools && (
                    <div>
                      <span className="font-bold">Developer Tools: </span>
                      <span>{data.skills.tools}</span>
                    </div>
                  )}
                  {data.skills?.libraries && (
                    <div>
                      <span className="font-bold">Libraries: </span>
                      <span>{data.skills.libraries}</span>
                    </div>
                  )}
                  {data.skills?.all && (
                    <div>
                      <span className="font-bold">Technical Skills: </span>
                      <span>{data.skills.all}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* =========================================================
              TEMPLATE 4: ULTRA MINIMAL
          ========================================================= */}
          {templateId === "ultra-minimal" && (
            <div className="font-sans text-[12px] leading-snug space-y-4 text-slate-900">
              {/* Header */}
              <div className="pb-2 border-b border-slate-200 flex flex-col sm:flex-row sm:items-baseline justify-between gap-1">
                <div>
                  <h1 className="text-2xl font-black tracking-tight text-slate-900">
                    {data.fullName}
                  </h1>
                  <p className="text-xs font-semibold text-slate-600">{data.role}</p>
                </div>
                <div className="text-[10px] text-slate-500 flex flex-wrap gap-x-2 gap-y-0.5">
                  {data.location && <span>{data.location}</span>}
                  {data.email && <span>· {data.email}</span>}
                  {data.phone && <span>· {data.phone}</span>}
                  {data.github && <span>· {data.github}</span>}
                </div>
              </div>

              {/* Skills */}
              <div className="space-y-1">
                <div className="text-[11px] font-extrabold uppercase tracking-widest text-slate-400">
                  Skills
                </div>
                <div className="text-[11px] text-slate-800 leading-normal">
                  {data.skills?.all || `${data.skills?.languages || ""}, ${data.skills?.frameworks || ""}, ${data.skills?.tools || ""}`}
                </div>
              </div>

              {/* Experience */}
              {data.experience && data.experience.length > 0 && (
                <div className="space-y-2">
                  <div className="text-[11px] font-extrabold uppercase tracking-widest text-slate-400">
                    Experience
                  </div>
                  <div className="space-y-2.5">
                    {data.experience.map((exp, idx) => (
                      <div key={idx} className="space-y-0.5">
                        <div className="flex justify-between items-baseline text-xs">
                          <div>
                            <span className="font-bold text-slate-900">{exp.role}</span>
                            <span className="text-slate-500"> — {exp.company}</span>
                          </div>
                          <span className="text-[10px] text-slate-400 font-medium">{exp.dates}</span>
                        </div>
                        <ul className="list-disc list-outside pl-3 text-[11px] text-slate-700 space-y-0.5">
                          {exp.bullets.map((b, bIdx) => (
                            <li key={bIdx}>{b}</li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Education */}
              {data.education && data.education.length > 0 && (
                <div className="space-y-1.5">
                  <div className="text-[11px] font-extrabold uppercase tracking-widest text-slate-400">
                    Education
                  </div>
                  <div className="space-y-1">
                    {data.education.map((edu, idx) => (
                      <div key={idx} className="flex justify-between items-baseline text-[11px]">
                        <div>
                          <span className="font-bold text-slate-900">{edu.institution}</span>
                          <span className="text-slate-600"> — {edu.degree}</span>
                        </div>
                        <span className="text-[10px] text-slate-400">{edu.dates}</span>
                      </div>
                    ))}
                  </div>
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
