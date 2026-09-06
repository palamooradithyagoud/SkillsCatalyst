import { CompanyTypeItem, ExpLevelItem } from "@/types/career";

export const ALLOWED_EXTENSIONS = [".pdf", ".docx", ".txt", ".md"];
export const MAX_FILE_MB = 10;

export const COMMON_ROLES = [
  "Fullstack Software Engineer",
  "Backend Engineer",
  "Frontend Engineer",
  "Data Engineer / AI",
  "DevOps / Cloud Engineer",
  "Mobile Developer",
];

export const COMPANY_TYPES: CompanyTypeItem[] = [
  {
    id: "Product-Based",
    title: "Product-Based",
    badge: "🚀 High Scale",
    desc: "Scalable architecture, performance metrics, code quality, and core tech stack alignment.",
  },
  {
    id: "Service-Based",
    title: "Service-Based",
    badge: "💼 Client Solutions",
    desc: "Client project delivery, multi-domain versatility, framework proficiency, and execution.",
  },
  {
    id: "Startup",
    title: "Startup / Growth",
    badge: "⚡ Fast Execution",
    desc: "Speed, end-to-end full-stack ownership, adaptability, and high feature velocity.",
  },
  {
    id: "FAANG / Tier-1",
    title: "FAANG / Tier 1",
    badge: "👑 Elite Bar",
    desc: "Distributed systems at massive scale, algorithmic depth, and high business-impact metrics.",
  },
];

export const EXP_LEVELS: ExpLevelItem[] = [
  { id: "0-2 years", label: "0–2 Yrs (Junior)" },
  { id: "3-5 years", label: "3–5 Yrs (Mid)" },
  { id: "5-8 years", label: "5–8 Yrs (Senior)" },
  { id: "8+ years", label: "8+ Yrs (Staff/Lead)" },
];

export const FILE_TYPE_COLORS: Record<string, string> = {
  pdf: "text-rose-400 bg-rose-500/10 border-rose-500/20",
  docx: "text-blue-400 bg-blue-500/10 border-blue-500/20",
  doc: "text-blue-400 bg-blue-500/10 border-blue-500/20",
  txt: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
  md: "text-purple-400 bg-purple-500/10 border-purple-500/20",
};
