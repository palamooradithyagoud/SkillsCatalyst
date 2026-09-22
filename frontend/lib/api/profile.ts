import { supabase } from "@/lib/supabase";
import { API_BASE, apiFetch, getAuthHeaders } from "./client";

// ── Legacy & Compatibility Interfaces ─────────────────────────────────────────

export interface AcademicProfile {
  user_id?: string;
  full_name: string;
  college: string;
  department: string;
  academic_year: string;
  target_role: string;
}

export interface CodingProfilesInput {
  user_id?: string;
  leetcode?: string;
  github?: string;
  hackerrank?: string;
  codechef?: string;
  geeksforgeeks?: string;
  codeforces?: string;
}

export interface PlatformStat {
  configured: boolean;
  username?: string;
  url?: string;
  badge?: string;
  summary?: string;
  [key: string]: any;
}

// ── Relational Career Profile Canonical Interfaces (Matches SQL Schema Exactly) ─

export interface UserProfile {
  id?: string;
  email?: string;
  full_name: string;
  headline?: string;
  country?: string;
  state?: string;
  city?: string;
  phone?: string;
  gender?: string;
  about?: string;
  avatar_url?: string;
  created_at?: string;
  updated_at?: string;
}

export interface UserSkill {
  id?: string;
  user_id?: string;
  skill_name: string;
  category: string; // "Technical", "Frameworks", "Languages", "Tools", "Soft Skills"
  proficiency: "Beginner" | "Intermediate" | "Advanced" | "Expert";
  created_at?: string;
  updated_at?: string;
}

export interface UserExperience {
  id?: string;
  user_id?: string;
  company_name: string;
  role: string;
  location?: string;
  work_type: "Full-time" | "Part-time" | "Internship" | "Contract" | "Freelance";
  employment_type: "Onsite" | "Hybrid" | "Remote";
  start_date: string; // ISO format: YYYY-MM-DD
  end_date?: string | null; // ISO format: YYYY-MM-DD or null if currently working
  currently_working: boolean;
  description?: string;
  created_at?: string;
  updated_at?: string;
}

export interface UserEducation {
  id?: string;
  user_id?: string;
  college: string;
  degree_type?: string;
  field_of_study?: string;
  gpa?: string;
  start_date?: string | null;
  end_date?: string | null;
  currently_studying: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface UserProject {
  id?: string;
  user_id?: string;
  project_name: string;
  description?: string;
  technologies: string[];
  start_date?: string | null;
  end_date?: string | null;
  github_url?: string;
  live_demo_url?: string;
  currently_working?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface UserCertification {
  id?: string;
  user_id?: string;
  certification_name: string;
  issuing_organization: string;
  issue_date?: string | null;
  expiration_date?: string | null;
  credential_id?: string;
  credential_url?: string;
  created_at?: string;
  updated_at?: string;
}

export interface UserAchievement {
  id?: string;
  user_id?: string;
  achievement_name: string;
  organization?: string;
  achievement_date?: string | null;
  description?: string;
  created_at?: string;
  updated_at?: string;
}

export interface UserCareerPreferences {
  user_id?: string;
  target_roles: string[];
  preferred_industries: string[];
  target_companies: string[];
  preferred_locations: string[];
  work_arrangements: string[];
  updated_at?: string;
}

export interface ResumeInfo {
  filename?: string;
  updated_at?: string;
  overall_score?: number;
  ats_score?: number;
  summary?: string;
}

export interface CompleteProfileData {
  personal: UserProfile | null;
  academic: AcademicProfile | null;
  career_preferences: UserCareerPreferences | null;
  skills: UserSkill[];
  experiences: UserExperience[];
  education: UserEducation[];
  projects: UserProject[];
  certifications: UserCertification[];
  achievements: UserAchievement[];
  resume: ResumeInfo | null;
  progress: any | null;
  coding_inputs: CodingProfilesInput | null;
  coding_stats: Record<string, PlatformStat> | null;
}

// ── Date & UUID Helpers ───────────────────────────────────────────────────────

export function isValidUUID(id?: string | null): boolean {
  if (!id) return false;
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
}

/**
 * Normalizes input date strings (e.g. "2024-05", "2024", "May 2024") to valid Postgres ISO DATE "YYYY-MM-DD".
 * Returns null for empty, undefined, or invalid date values.
 */
export function normalizeDateToISO(val?: string | null): string | null {
  if (!val || typeof val !== "string" || !val.trim()) return null;
  const trimmed = val.trim();

  // Already standard YYYY-MM-DD
  if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) return trimmed;

  // Month-level string YYYY-MM (from input type="month")
  if (/^\d{4}-\d{2}$/.test(trimmed)) return `${trimmed}-01`;

  // Year-only string YYYY
  if (/^\d{4}$/.test(trimmed)) return `${trimmed}-01-01`;

  // Try standard Date parsing for human inputs like "Jan 2024" or "January 15, 2024"
  const parsed = new Date(trimmed);
  if (!isNaN(parsed.getTime())) {
    const y = parsed.getFullYear();
    const m = String(parsed.getMonth() + 1).padStart(2, "0");
    const d = String(parsed.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
  }

  return null;
}

/**
 * Validates that end_date does not precede start_date.
 */
export function validateDateRange(startDate?: string | null, endDate?: string | null): { valid: boolean; error?: string } {
  const normStart = normalizeDateToISO(startDate);
  const normEnd = normalizeDateToISO(endDate);

  if (normStart && normEnd) {
    if (new Date(normEnd).getTime() < new Date(normStart).getTime()) {
      return { valid: false, error: "End date cannot precede start date." };
    }
  }
  return { valid: true };
}

// ── Profile Completion Formula ────────────────────────────────────────────────

export interface ProfileSectionCompletion {
  completed: boolean;
  score: number;
  maxScore: number;
  label: string;
  details: string;
}

export interface ProfileCompletionReport {
  totalPercent: number;
  sections: {
    personal: ProfileSectionCompletion;
    skills: ProfileSectionCompletion;
    resume: ProfileSectionCompletion;
    experience: ProfileSectionCompletion;
    education: ProfileSectionCompletion;
    projects: ProfileSectionCompletion;
    certifications: ProfileSectionCompletion;
    careerPreferences: ProfileSectionCompletion;
    codingProfiles: ProfileSectionCompletion;
  };
}

export function calculateProfileCompletion(data: CompleteProfileData): ProfileCompletionReport {
  // 1. Personal (15 pts)
  let personalScore = 0;
  if (data.personal?.full_name?.trim()) personalScore += 5;
  if (data.personal?.headline?.trim()) personalScore += 4;
  if (data.personal?.city?.trim() || data.personal?.country?.trim()) personalScore += 3;
  if (data.personal?.about?.trim()) personalScore += 3;

  // 2. Skills (15 pts)
  let skillsScore = 0;
  const skillCount = data.skills?.length || 0;
  if (skillCount >= 1) skillsScore += 8;
  if (skillCount >= 3) skillsScore += 7;

  // 3. Resume (20 pts)
  let resumeScore = 0;
  if (data.resume?.filename || (data.resume?.ats_score && data.resume.ats_score > 0)) {
    resumeScore = 20;
  }

  // 4. Experience (10 pts)
  let experienceScore = (data.experiences?.length || 0) > 0 ? 10 : 0;

  // 5. Education (10 pts)
  let educationScore = 0;
  if ((data.education?.length || 0) > 0 || data.academic?.college?.trim()) {
    educationScore = 10;
  }

  // 6. Projects (15 pts)
  let projectsScore = 0;
  const projectCount = data.projects?.length || 0;
  if (projectCount >= 1) projectsScore += 10;
  if (projectCount >= 2) projectsScore += 5;

  // 7. Certifications & Achievements (5 pts)
  let certsScore = 0;
  if ((data.certifications?.length || 0) > 0 || (data.achievements?.length || 0) > 0) {
    certsScore = 5;
  }

  // 8. Career Preferences (5 pts)
  let careerScore = 0;
  if (
    (data.career_preferences?.target_roles && data.career_preferences.target_roles.length > 0) ||
    data.academic?.target_role?.trim() ||
    (data.career_preferences?.target_companies && data.career_preferences.target_companies.length > 0)
  ) {
    careerScore = 5;
  }

  // 9. Coding Profiles (5 pts)
  let codingScore = 0;
  const c = data.coding_inputs;
  if (c?.leetcode?.trim() || c?.github?.trim() || c?.codeforces?.trim() || c?.codechef?.trim() || c?.hackerrank?.trim() || c?.geeksforgeeks?.trim()) {
    codingScore = 5;
  }

  const total = personalScore + skillsScore + resumeScore + experienceScore + educationScore + projectsScore + certsScore + careerScore + codingScore;

  return {
    totalPercent: Math.min(100, Math.round(total)),
    sections: {
      personal: {
        completed: personalScore >= 12,
        score: personalScore,
        maxScore: 15,
        label: "Personal Details",
        details: personalScore >= 12 ? "Complete" : "Add headline, location, and bio",
      },
      skills: {
        completed: skillsScore >= 15,
        score: skillsScore,
        maxScore: 15,
        label: "Skills Hub",
        details: skillCount >= 3 ? `${skillCount} skills added` : "Add at least 3 skills",
      },
      resume: {
        completed: resumeScore === 20,
        score: resumeScore,
        maxScore: 20,
        label: "Resume Central",
        details: resumeScore === 20 ? "ATS resume analyzed" : "Upload resume for ATS score",
      },
      experience: {
        completed: experienceScore === 10,
        score: experienceScore,
        maxScore: 10,
        label: "Experience",
        details: experienceScore === 10 ? `${data.experiences.length} experience(s)` : "Add internships or roles",
      },
      education: {
        completed: educationScore === 10,
        score: educationScore,
        maxScore: 10,
        label: "Education",
        details: educationScore === 10 ? "Degree details provided" : "Add college & degree",
      },
      projects: {
        completed: projectsScore >= 15,
        score: projectsScore,
        maxScore: 15,
        label: "Projects",
        details: projectCount >= 2 ? `${projectCount} projects added` : "Add at least 2 portfolio projects",
      },
      certifications: {
        completed: certsScore === 5,
        score: certsScore,
        maxScore: 5,
        label: "Certifications & Honors",
        details: certsScore === 5 ? "Credentials added" : "Add certs or achievements",
      },
      careerPreferences: {
        completed: careerScore === 5,
        score: careerScore,
        maxScore: 5,
        label: "Career Preferences",
        details: careerScore === 5 ? "Target roles configured" : "Add desired roles & companies",
      },
      codingProfiles: {
        completed: codingScore === 5,
        score: codingScore,
        maxScore: 5,
        label: "Coding Profiles",
        details: codingScore === 5 ? "Platform linked" : "Connect LeetCode or GitHub",
      },
    },
  };
}

/**
 * Ensures an active, unexpired session for mutations and queries.
 * Proactively refreshes the token if expired or expiring within 60 seconds,
 * preventing PostgreSQL RLS WITH CHECK violations caused by stale JWTs.
 */
export async function ensureFreshSession(): Promise<{ userId: string | null; token: string | null }> {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user?.id || !isValidUUID(session.user.id)) {
      return { userId: null, token: null };
    }

    const isExpiringSoon = session.expires_at ? (session.expires_at * 1000) < Date.now() + 60000 : false;
    if (isExpiringSoon) {
      const { data: refreshed, error } = await supabase.auth.refreshSession();
      if (!error && refreshed.session?.user?.id && isValidUUID(refreshed.session.user.id)) {
        return {
          userId: refreshed.session.user.id,
          token: refreshed.session.access_token,
        };
      }
    }

    return {
      userId: session.user.id,
      token: session.access_token,
    };
  } catch (err) {
    console.warn("Session freshness check error:", err);
    return { userId: null, token: null };
  }
}

// ── Complete Profile Fetcher ──────────────────────────────────────────────────

export async function fetchFullProfileData(): Promise<CompleteProfileData | null> {
  try {
    const { userId } = await ensureFreshSession();
    if (!userId) return null;

    // Concurrently fetch all normalized tables with accurate ordering columns
    const [
      profileRes,
      academicRes,
      codingRes,
      skillsRes,
      experiencesRes,
      educationRes,
      projectsRes,
      certsRes,
      achieveRes,
      prefsRes,
      resumeRes,
      progressRes,
    ] = await Promise.allSettled([
      supabase.from("profiles").select("*").eq("id", userId).maybeSingle(),
      supabase.from("user_academic_profile").select("*").eq("user_id", userId).maybeSingle(),
      supabase.from("user_coding_profiles").select("*").eq("user_id", userId).maybeSingle(),
      supabase.from("user_skills").select("*").eq("user_id", userId).order("created_at", { ascending: true }),
      supabase.from("experiences").select("*").eq("user_id", userId).order("start_date", { ascending: false }),
      supabase.from("education").select("*").eq("user_id", userId).order("end_date", { ascending: false }),
      supabase.from("projects").select("*").eq("user_id", userId).order("created_at", { ascending: false }),
      supabase.from("certifications").select("*").eq("user_id", userId).order("issue_date", { ascending: false }),
      supabase.from("achievements").select("*").eq("user_id", userId).order("achievement_date", { ascending: false }),
      supabase.from("career_preferences").select("*").eq("user_id", userId).maybeSingle(),
      supabase.from("resume_scores").select("*").eq("user_id", userId).order("created_at", { ascending: false }).limit(1),
      supabase.from("user_progress").select("*").eq("user_id", userId).maybeSingle(),
    ]);

    // Parse Personal Profile
    let personal: UserProfile | null = null;
    if (profileRes.status === "fulfilled" && profileRes.value.data) {
      const p = profileRes.value.data;
      personal = {
        id: p.id,
        email: p.email || "",
        full_name: p.full_name || "",
        headline: p.headline || "",
        country: p.country || "",
        state: p.state || "",
        city: p.city || "",
        phone: p.phone || "",
        gender: p.gender || "",
        about: p.about || "",
        avatar_url: p.avatar_url || "",
        created_at: p.created_at || "",
        updated_at: p.updated_at || "",
      };
      // Cache personal profile on confirmed success
      try { localStorage.setItem(`sc_personal_profile_${userId}`, JSON.stringify(personal)); } catch {}
    } else if (profileRes.status === "rejected") {
      // Offline fallback
      try {
        const cached = localStorage.getItem(`sc_personal_profile_${userId}`);
        if (cached) personal = JSON.parse(cached);
      } catch {}
    }

    // Parse Academic Profile (Backward Compatibility)
    let academic: AcademicProfile | null = null;
    if (academicRes.status === "fulfilled" && academicRes.value.data) {
      academic = academicRes.value.data;
      if (!personal?.full_name && academic?.full_name) {
        personal = {
          ...(personal || { full_name: "" }),
          full_name: academic.full_name,
        };
      }
    }

    // Parse Coding Profiles
    let codingInputs: CodingProfilesInput | null = null;
    let codingStats: Record<string, PlatformStat> | null = null;
    if (codingRes.status === "fulfilled" && codingRes.value.data) {
      const c = codingRes.value.data;
      codingInputs = {
        leetcode: c.leetcode_url || "",
        github: c.github_url || "",
        hackerrank: c.hackerrank_url || "",
        codechef: c.codechef_url || "",
        geeksforgeeks: c.geeksforgeeks_url || "",
        codeforces: c.codeforces_url || "",
      };
      codingStats = c.stats_json || {};
      try {
        localStorage.setItem(`sc_coding_profiles_${userId}`, JSON.stringify(codingInputs));
        localStorage.setItem(`sc_coding_stats_${userId}`, JSON.stringify(codingStats));
      } catch {}
    }

    // Parse Skills: Database is authoritative
    let skills: UserSkill[] = [];
    if (skillsRes.status === "fulfilled") {
      if (Array.isArray(skillsRes.value.data)) {
        skills = skillsRes.value.data.map((s: any) => ({
          id: s.id,
          user_id: s.user_id,
          skill_name: s.skill_name,
          category: s.category || "Technical",
          proficiency: s.proficiency || "Intermediate",
          created_at: s.created_at,
          updated_at: s.updated_at,
        }));
        try { localStorage.setItem(`sc_user_skills_${userId}`, JSON.stringify(skills)); } catch {}
      }
    } else {
      // Query threw network error: fallback to cache
      try {
        const cached = localStorage.getItem(`sc_user_skills_${userId}`);
        if (cached) skills = JSON.parse(cached);
      } catch {}
    }

    // Parse Experiences: Database is authoritative
    let experiences: UserExperience[] = [];
    if (experiencesRes.status === "fulfilled") {
      if (Array.isArray(experiencesRes.value.data)) {
        experiences = experiencesRes.value.data.map((e: any) => ({
          id: e.id,
          user_id: e.user_id,
          company_name: e.company_name,
          role: e.role,
          location: e.location || "",
          work_type: e.work_type || "Full-time",
          employment_type: e.employment_type || "Onsite",
          start_date: e.start_date,
          end_date: e.end_date || null,
          currently_working: !!e.currently_working,
          description: e.description || "",
          created_at: e.created_at,
          updated_at: e.updated_at,
        }));
        try { localStorage.setItem(`sc_experiences_${userId}`, JSON.stringify(experiences)); } catch {}
      }
    } else {
      try {
        const cached = localStorage.getItem(`sc_experiences_${userId}`);
        if (cached) experiences = JSON.parse(cached);
      } catch {}
    }

    // Parse Education: Database is authoritative
    let education: UserEducation[] = [];
    if (educationRes.status === "fulfilled") {
      if (Array.isArray(educationRes.value.data)) {
        education = educationRes.value.data.map((ed: any) => ({
          id: ed.id,
          user_id: ed.user_id,
          college: ed.college,
          degree_type: ed.degree_type || "",
          field_of_study: ed.field_of_study || "",
          gpa: ed.gpa || "",
          start_date: ed.start_date || null,
          end_date: ed.end_date || null,
          currently_studying: !!ed.currently_studying,
          created_at: ed.created_at,
          updated_at: ed.updated_at,
        }));
        try { localStorage.setItem(`sc_education_${userId}`, JSON.stringify(education)); } catch {}
      }
    } else {
      try {
        const cached = localStorage.getItem(`sc_education_${userId}`);
        if (cached) education = JSON.parse(cached);
      } catch {}
    }
    // Backward-compatible fallback for legacy academic record
    if (education.length === 0 && academic?.college) {
      education = [
        {
          id: undefined,
          college: academic.college,
          degree_type: "Bachelor of Technology",
          field_of_study: academic.department || "Computer Science",
          end_date: normalizeDateToISO(academic.academic_year) || null,
          currently_studying: true,
        },
      ];
    }

    // Parse Projects: Database is authoritative
    let projects: UserProject[] = [];
    if (projectsRes.status === "fulfilled") {
      if (Array.isArray(projectsRes.value.data)) {
        projects = projectsRes.value.data.map((p: any) => ({
          id: p.id,
          user_id: p.user_id,
          project_name: p.project_name,
          description: p.description || "",
          technologies: Array.isArray(p.technologies) ? p.technologies : [],
          start_date: p.start_date || null,
          end_date: p.end_date || null,
          github_url: p.github_url || "",
          live_demo_url: p.live_demo_url || "",
          currently_working: !!p.currently_working,
          created_at: p.created_at,
          updated_at: p.updated_at,
        }));
        try { localStorage.setItem(`sc_projects_${userId}`, JSON.stringify(projects)); } catch {}
      }
    } else {
      try {
        const cached = localStorage.getItem(`sc_projects_${userId}`);
        if (cached) projects = JSON.parse(cached);
      } catch {}
    }

    // Parse Certifications: Database is authoritative
    let certifications: UserCertification[] = [];
    if (certsRes.status === "fulfilled") {
      if (Array.isArray(certsRes.value.data)) {
        certifications = certsRes.value.data.map((c: any) => ({
          id: c.id,
          user_id: c.user_id,
          certification_name: c.certification_name,
          issuing_organization: c.issuing_organization,
          issue_date: c.issue_date || null,
          expiration_date: c.expiration_date || null,
          credential_id: c.credential_id || "",
          credential_url: c.credential_url || "",
          created_at: c.created_at,
          updated_at: c.updated_at,
        }));
        try { localStorage.setItem(`sc_certifications_${userId}`, JSON.stringify(certifications)); } catch {}
      }
    } else {
      try {
        const cached = localStorage.getItem(`sc_certifications_${userId}`);
        if (cached) certifications = JSON.parse(cached);
      } catch {}
    }

    // Parse Achievements: Database is authoritative
    let achievements: UserAchievement[] = [];
    if (achieveRes.status === "fulfilled") {
      if (Array.isArray(achieveRes.value.data)) {
        achievements = achieveRes.value.data.map((a: any) => ({
          id: a.id,
          user_id: a.user_id,
          achievement_name: a.achievement_name,
          organization: a.organization || "",
          achievement_date: a.achievement_date || null,
          description: a.description || "",
          created_at: a.created_at,
          updated_at: a.updated_at,
        }));
        try { localStorage.setItem(`sc_achievements_${userId}`, JSON.stringify(achievements)); } catch {}
      }
    } else {
      try {
        const cached = localStorage.getItem(`sc_achievements_${userId}`);
        if (cached) achievements = JSON.parse(cached);
      } catch {}
    }

    // Parse Career Preferences: Database is authoritative
    let career_preferences: UserCareerPreferences | null = null;
    if (prefsRes.status === "fulfilled" && prefsRes.value.data) {
      const cp = prefsRes.value.data;
      career_preferences = {
        user_id: cp.user_id,
        target_roles: cp.target_roles || (cp.target_role ? [cp.target_role] : []),
        preferred_industries: cp.preferred_industries || (cp.target_industry ? [cp.target_industry] : []),
        target_companies: cp.target_companies || [],
        preferred_locations: cp.preferred_locations || (cp.preferred_work_location ? [cp.preferred_work_location] : []),
        work_arrangements: cp.work_arrangements || (cp.preferred_work_type ? [cp.preferred_work_type] : []),
        updated_at: cp.updated_at,
      };
      try { localStorage.setItem(`sc_career_preferences_${userId}`, JSON.stringify(career_preferences)); } catch {}
    } else if (prefsRes.status === "rejected") {
      try {
        const cached = localStorage.getItem(`sc_career_preferences_${userId}`);
        if (cached) career_preferences = JSON.parse(cached);
      } catch {}
    }
    if (!career_preferences && academic?.target_role) {
      career_preferences = {
        target_roles: [academic.target_role],
        preferred_industries: [],
        target_companies: [],
        preferred_locations: [],
        work_arrangements: ["Hybrid", "Remote"],
      };
    }

    // Parse Resume
    let resume: ResumeInfo | null = null;
    if (resumeRes.status === "fulfilled" && resumeRes.value.data && resumeRes.value.data.length > 0) {
      const r = resumeRes.value.data[0];
      const sc = r.overall_score || r.ats_compatibility_score || 0;
      resume = {
        filename: r.filename || "Uploaded_Resume.pdf",
        updated_at: r.created_at || "",
        overall_score: sc,
        ats_score: sc,
        summary: r.target_role ? `Evaluated for ${r.target_role}` : "Resume analyzed by SkillsCatalyst AI",
      };
    }

    const progress = progressRes.status === "fulfilled" ? progressRes.value.data : null;

    return {
      personal,
      academic,
      career_preferences,
      skills,
      experiences,
      education,
      projects,
      certifications,
      achievements,
      resume,
      progress,
      coding_inputs: codingInputs,
      coding_stats: codingStats,
    };
  } catch (err) {
    console.warn("Error in fetchFullProfileData:", err);
    return null;
  }
}

// ── Personal Profile Mutation ─────────────────────────────────────────────────

export async function savePersonalProfile(data: Partial<UserProfile>): Promise<{ success: boolean; error?: string }> {
  try {
    const { userId } = await ensureFreshSession();
    if (!userId) return { success: false, error: "Not authenticated. Please log in again." };

    const payload = {
      id: userId,
      full_name: data.full_name?.trim() || "",
      headline: data.headline?.trim() || "",
      country: data.country?.trim() || "",
      state: data.state?.trim() || "",
      city: data.city?.trim() || "",
      phone: data.phone?.trim() || "",
      gender: data.gender?.trim() || "",
      about: data.about?.trim() || "",
      avatar_url: data.avatar_url || "",
      updated_at: new Date().toISOString(),
    };

    // 1. Save to Supabase profiles table
    const { error: profileError } = await supabase.from("profiles").upsert(payload, { onConflict: "id" });
    if (profileError) {
      console.error("Supabase profiles upsert error:", profileError);
      return { success: false, error: profileError.message || "Failed to update profile." };
    }

    // 2. CRITICAL: Sync full_name to user_academic_profile so dashboard.py greeting never breaks
    if (payload.full_name) {
      await supabase.from("user_academic_profile").upsert({
        user_id: userId,
        full_name: payload.full_name,
        updated_at: new Date().toISOString(),
      }, { onConflict: "user_id" });
    }

    // 3. Update localStorage cache ONLY on confirmed success
    try {
      localStorage.setItem(`sc_personal_profile_${userId}`, JSON.stringify(payload));
    } catch {}

    // 4. Async sync to FastAPI backend
    try {
      const authHeaders = await getAuthHeaders();
      if (authHeaders.Authorization) {
        apiFetch(`${API_BASE}/api/profile/personal`, {
          method: "POST",
          headers: { "Content-Type": "application/json", ...authHeaders },
          body: JSON.stringify(payload),
        }).catch(() => {});
      }
    } catch {}

    return { success: true };
  } catch (err: any) {
    console.error("Failed to save personal profile:", err);
    return { success: false, error: err?.message || String(err) };
  }
}

// ── Skills Hub Mutations (Matches SQL Contract: skill_name, category, proficiency) ─

export async function saveSkill(skill: {
  id?: string;
  skill_name: string;
  category?: string;
  proficiency?: "Beginner" | "Intermediate" | "Advanced" | "Expert";
}): Promise<{ success: boolean; skill?: UserSkill; error?: string }> {
  try {
    const { userId } = await ensureFreshSession();
    if (!userId) return { success: false, error: "Not authenticated. Please log in again." };

    const cleanName = skill.skill_name.trim();
    if (!cleanName) return { success: false, error: "Skill name cannot be empty." };

    const payload: any = {
      user_id: userId,
      skill_name: cleanName,
      category: skill.category || "Technical",
      proficiency: skill.proficiency || "Intermediate",
      updated_at: new Date().toISOString(),
    };

    // If updating an existing item with valid UUID, include id; otherwise let PostgreSQL gen_random_uuid()
    if (isValidUUID(skill.id)) {
      payload.id = skill.id;
    }

    const { data, error } = await supabase
      .from("user_skills")
      .upsert(payload, { onConflict: isValidUUID(skill.id) ? "id" : "user_id, skill_name" })
      .select()
      .single();

    if (error) {
      console.error("Supabase user_skills save error:", error);
      return { success: false, error: error.message || "Failed to save skill." };
    }

    const savedSkill: UserSkill = {
      id: data.id,
      user_id: data.user_id,
      skill_name: data.skill_name,
      category: data.category,
      proficiency: data.proficiency,
      created_at: data.created_at,
      updated_at: data.updated_at,
    };

    // Update localStorage cache ONLY on confirmed DB success
    try {
      const key = `sc_user_skills_${userId}`;
      const existing: UserSkill[] = JSON.parse(localStorage.getItem(key) || "[]");
      const filtered = existing.filter((s) => s.id !== savedSkill.id && s.skill_name.toLowerCase() !== savedSkill.skill_name.toLowerCase());
      filtered.push(savedSkill);
      localStorage.setItem(key, JSON.stringify(filtered));
    } catch {}

    return { success: true, skill: savedSkill };
  } catch (err: any) {
    return { success: false, error: err?.message || String(err) };
  }
}

export async function deleteSkill(skillId: string): Promise<{ success: boolean; error?: string }> {
  try {
    const { userId } = await ensureFreshSession();
    if (!userId) return { success: false, error: "Not authenticated. Please log in again." };

    const query = isValidUUID(skillId)
      ? supabase.from("user_skills").delete().eq("user_id", userId).eq("id", skillId)
      : supabase.from("user_skills").delete().eq("user_id", userId).eq("skill_name", skillId);

    const { error } = await query;
    if (error) {
      console.error("Supabase delete skill error:", error);
      return { success: false, error: error.message };
    }

    try {
      const key = `sc_user_skills_${userId}`;
      const existing: UserSkill[] = JSON.parse(localStorage.getItem(key) || "[]");
      const filtered = existing.filter((s) => s.id !== skillId && s.skill_name !== skillId);
      localStorage.setItem(key, JSON.stringify(filtered));
    } catch {}

    return { success: true };
  } catch (err: any) {
    return { success: false, error: err?.message || String(err) };
  }
}

// ── Experience Mutations (Matches SQL Contract: company_name, role, start_date, end_date, currently_working) ─

export async function saveExperience(exp: {
  id?: string;
  company_name: string;
  role: string;
  location?: string;
  work_type?: "Full-time" | "Part-time" | "Internship" | "Contract" | "Freelance";
  employment_type?: "Onsite" | "Hybrid" | "Remote";
  start_date: string;
  end_date?: string | null;
  currently_working?: boolean;
  description?: string;
}): Promise<{ success: boolean; experience?: UserExperience; error?: string }> {
  try {
    const { userId } = await ensureFreshSession();
    if (!userId) return { success: false, error: "Not authenticated. Please log in again." };

    const cleanCompany = exp.company_name?.trim();
    const cleanRole = exp.role?.trim();

    if (!cleanCompany || !cleanRole) {
      return { success: false, error: "Company name and role are required." };
    }

    const isoStart = normalizeDateToISO(exp.start_date);
    if (!isoStart) {
      return { success: false, error: "Please enter a valid start date." };
    }

    const isCurrent = !!exp.currently_working;
    const isoEnd = isCurrent ? null : normalizeDateToISO(exp.end_date);

    const rangeCheck = validateDateRange(isoStart, isoEnd);
    if (!rangeCheck.valid) {
      return { success: false, error: rangeCheck.error };
    }

    const payload: any = {
      user_id: userId,
      company_name: cleanCompany,
      role: cleanRole,
      location: exp.location?.trim() || "",
      work_type: exp.work_type || "Full-time",
      employment_type: exp.employment_type || "Onsite",
      start_date: isoStart,
      end_date: isoEnd,
      currently_working: isCurrent,
      description: exp.description?.trim() || "",
      updated_at: new Date().toISOString(),
    };

    if (isValidUUID(exp.id)) {
      payload.id = exp.id;
    }

    const { data, error } = await supabase
      .from("experiences")
      .upsert(payload, { onConflict: "id" })
      .select()
      .single();

    if (error) {
      console.error("Supabase save experience error:", error);
      return { success: false, error: error.message || "Failed to save experience." };
    }

    const savedExp: UserExperience = {
      id: data.id,
      user_id: data.user_id,
      company_name: data.company_name,
      role: data.role,
      location: data.location,
      work_type: data.work_type,
      employment_type: data.employment_type,
      start_date: data.start_date,
      end_date: data.end_date,
      currently_working: data.currently_working,
      description: data.description,
      created_at: data.created_at,
      updated_at: data.updated_at,
    };

    try {
      const key = `sc_experiences_${userId}`;
      const existing: UserExperience[] = JSON.parse(localStorage.getItem(key) || "[]");
      const idx = existing.findIndex((e) => e.id === savedExp.id);
      if (idx >= 0) existing[idx] = savedExp;
      else existing.unshift(savedExp);
      localStorage.setItem(key, JSON.stringify(existing));
    } catch {}

    return { success: true, experience: savedExp };
  } catch (err: any) {
    return { success: false, error: err?.message || String(err) };
  }
}

export async function deleteExperience(id: string): Promise<{ success: boolean; error?: string }> {
  try {
    const { userId } = await ensureFreshSession();
    if (!userId) return { success: false, error: "Not authenticated. Please log in again." };
    const { error } = await supabase.from("experiences").delete().eq("user_id", userId).eq("id", id);
    if (error) {
      console.error("Supabase delete experience error:", error);
      return { success: false, error: error.message };
    }

    try {
      const key = `sc_experiences_${userId}`;
      const existing: UserExperience[] = JSON.parse(localStorage.getItem(key) || "[]");
      localStorage.setItem(key, JSON.stringify(existing.filter((e) => e.id !== id)));
    } catch {}

    return { success: true };
  } catch (err: any) {
    return { success: false, error: err?.message || String(err) };
  }
}

// ── Education Mutations (Matches SQL Contract: college, degree_type, field_of_study, gpa, start_date, end_date, currently_studying) ─

export async function saveEducation(edu: {
  id?: string;
  college: string;
  degree_type?: string;
  field_of_study?: string;
  gpa?: string;
  start_date?: string | null;
  end_date?: string | null;
  currently_studying?: boolean;
}): Promise<{ success: boolean; education?: UserEducation; error?: string }> {
  try {
    const { userId } = await ensureFreshSession();
    if (!userId) return { success: false, error: "Not authenticated. Please log in again." };

    const cleanCollege = edu.college?.trim();
    if (!cleanCollege) {
      return { success: false, error: "College / University name is required." };
    }

    const isoStart = normalizeDateToISO(edu.start_date);
    const isCurrent = !!edu.currently_studying;
    const isoEnd = isCurrent ? null : normalizeDateToISO(edu.end_date);

    const rangeCheck = validateDateRange(isoStart, isoEnd);
    if (!rangeCheck.valid) {
      return { success: false, error: rangeCheck.error };
    }

    const payload: any = {
      user_id: userId,
      college: cleanCollege,
      degree_type: edu.degree_type?.trim() || "",
      field_of_study: edu.field_of_study?.trim() || "",
      gpa: edu.gpa?.trim() || "",
      start_date: isoStart,
      end_date: isoEnd,
      currently_studying: isCurrent,
      updated_at: new Date().toISOString(),
    };

    if (isValidUUID(edu.id)) {
      payload.id = edu.id;
    }

    const { data, error } = await supabase
      .from("education")
      .upsert(payload, { onConflict: "id" })
      .select()
      .single();

    if (error) {
      console.error("Supabase save education error:", error);
      return { success: false, error: error.message || "Failed to save education." };
    }

    const savedEdu: UserEducation = {
      id: data.id,
      user_id: data.user_id,
      college: data.college,
      degree_type: data.degree_type,
      field_of_study: data.field_of_study,
      gpa: data.gpa,
      start_date: data.start_date,
      end_date: data.end_date,
      currently_studying: data.currently_studying,
      created_at: data.created_at,
      updated_at: data.updated_at,
    };

    // Mirror to user_academic_profile for backward compatibility
    try {
      await supabase.from("user_academic_profile").upsert({
        user_id: userId,
        college: savedEdu.college,
        department: savedEdu.field_of_study,
        academic_year: savedEdu.end_date ? savedEdu.end_date.split("-")[0] : "",
        updated_at: new Date().toISOString(),
      }, { onConflict: "user_id" });
    } catch {}

    try {
      const key = `sc_education_${userId}`;
      const existing: UserEducation[] = JSON.parse(localStorage.getItem(key) || "[]");
      const idx = existing.findIndex((e) => e.id === savedEdu.id);
      if (idx >= 0) existing[idx] = savedEdu;
      else existing.unshift(savedEdu);
      localStorage.setItem(key, JSON.stringify(existing));
    } catch {}

    return { success: true, education: savedEdu };
  } catch (err: any) {
    return { success: false, error: err?.message || String(err) };
  }
}

export async function deleteEducation(id: string): Promise<{ success: boolean; error?: string }> {
  try {
    const { userId } = await ensureFreshSession();
    if (!userId) return { success: false, error: "Not authenticated. Please log in again." };
    const { error } = await supabase.from("education").delete().eq("user_id", userId).eq("id", id);
    if (error) {
      console.error("Supabase delete education error:", error);
      return { success: false, error: error.message };
    }

    try {
      const key = `sc_education_${userId}`;
      const existing: UserEducation[] = JSON.parse(localStorage.getItem(key) || "[]");
      localStorage.setItem(key, JSON.stringify(existing.filter((e) => e.id !== id)));
    } catch {}

    return { success: true };
  } catch (err: any) {
    return { success: false, error: err?.message || String(err) };
  }
}

// ── Project Mutations (Matches SQL Contract: project_name, description, technologies, github_url, live_demo_url) ─

export async function saveProject(proj: {
  id?: string;
  project_name: string;
  description?: string;
  technologies?: string[];
  start_date?: string | null;
  end_date?: string | null;
  github_url?: string;
  live_demo_url?: string;
  currently_working?: boolean;
}): Promise<{ success: boolean; project?: UserProject; error?: string }> {
  try {
    const { userId } = await ensureFreshSession();
    if (!userId) return { success: false, error: "Not authenticated. Please log in again." };

    const cleanTitle = proj.project_name?.trim();
    if (!cleanTitle) {
      return { success: false, error: "Project title is required." };
    }

    const payload: any = {
      user_id: userId,
      project_name: cleanTitle,
      description: proj.description?.trim() || "",
      technologies: Array.isArray(proj.technologies) ? proj.technologies : [],
      start_date: normalizeDateToISO(proj.start_date),
      end_date: proj.currently_working ? null : normalizeDateToISO(proj.end_date),
      github_url: proj.github_url?.trim() || "",
      live_demo_url: proj.live_demo_url?.trim() || "",
      currently_working: !!proj.currently_working,
      updated_at: new Date().toISOString(),
    };

    if (isValidUUID(proj.id)) {
      payload.id = proj.id;
    }

    const { data, error } = await supabase
      .from("projects")
      .upsert(payload, { onConflict: "id" })
      .select()
      .single();

    if (error) {
      console.error("Supabase save project error:", error);
      return { success: false, error: error.message || "Failed to save project." };
    }

    const savedProj: UserProject = {
      id: data.id,
      user_id: data.user_id,
      project_name: data.project_name,
      description: data.description,
      technologies: data.technologies,
      start_date: data.start_date,
      end_date: data.end_date,
      github_url: data.github_url,
      live_demo_url: data.live_demo_url,
      currently_working: data.currently_working,
      created_at: data.created_at,
      updated_at: data.updated_at,
    };

    try {
      const key = `sc_projects_${userId}`;
      const existing: UserProject[] = JSON.parse(localStorage.getItem(key) || "[]");
      const idx = existing.findIndex((p) => p.id === savedProj.id);
      if (idx >= 0) existing[idx] = savedProj;
      else existing.unshift(savedProj);
      localStorage.setItem(key, JSON.stringify(existing));
    } catch {}

    return { success: true, project: savedProj };
  } catch (err: any) {
    return { success: false, error: err?.message || String(err) };
  }
}

export async function deleteProject(id: string): Promise<{ success: boolean; error?: string }> {
  try {
    const { userId } = await ensureFreshSession();
    if (!userId) return { success: false, error: "Not authenticated. Please log in again." };
    const { error } = await supabase.from("projects").delete().eq("user_id", userId).eq("id", id);
    if (error) {
      console.error("Supabase delete project error:", error);
      return { success: false, error: error.message };
    }

    try {
      const key = `sc_projects_${userId}`;
      const existing: UserProject[] = JSON.parse(localStorage.getItem(key) || "[]");
      localStorage.setItem(key, JSON.stringify(existing.filter((p) => p.id !== id)));
    } catch {}

    return { success: true };
  } catch (err: any) {
    return { success: false, error: err?.message || String(err) };
  }
}

// ── Certification Mutations (Matches SQL Contract: certification_name, issuing_organization, issue_date, expiration_date) ─

export async function saveCertification(cert: {
  id?: string;
  certification_name: string;
  issuing_organization: string;
  issue_date?: string | null;
  expiration_date?: string | null;
  credential_id?: string;
  credential_url?: string;
}): Promise<{ success: boolean; certification?: UserCertification; error?: string }> {
  try {
    const { userId } = await ensureFreshSession();
    if (!userId) return { success: false, error: "Not authenticated. Please log in again." };
    const cleanName = cert.certification_name?.trim();
    const cleanOrg = cert.issuing_organization?.trim();

    if (!cleanName || !cleanOrg) {
      return { success: false, error: "Certification name and organization are required." };
    }

    const payload: any = {
      user_id: userId,
      certification_name: cleanName,
      issuing_organization: cleanOrg,
      issue_date: normalizeDateToISO(cert.issue_date),
      expiration_date: normalizeDateToISO(cert.expiration_date),
      credential_id: cert.credential_id?.trim() || "",
      credential_url: cert.credential_url?.trim() || "",
      updated_at: new Date().toISOString(),
    };

    if (isValidUUID(cert.id)) {
      payload.id = cert.id;
    }

    const { data, error } = await supabase
      .from("certifications")
      .upsert(payload, { onConflict: "id" })
      .select()
      .single();

    if (error) {
      console.error("Supabase save cert error:", error);
      return { success: false, error: error.message || "Failed to save certification." };
    }

    const savedCert: UserCertification = {
      id: data.id,
      user_id: data.user_id,
      certification_name: data.certification_name,
      issuing_organization: data.issuing_organization,
      issue_date: data.issue_date,
      expiration_date: data.expiration_date,
      credential_id: data.credential_id,
      credential_url: data.credential_url,
      created_at: data.created_at,
      updated_at: data.updated_at,
    };

    try {
      const key = `sc_certifications_${userId}`;
      const existing: UserCertification[] = JSON.parse(localStorage.getItem(key) || "[]");
      const idx = existing.findIndex((c) => c.id === savedCert.id);
      if (idx >= 0) existing[idx] = savedCert;
      else existing.unshift(savedCert);
      localStorage.setItem(key, JSON.stringify(existing));
    } catch {}

    return { success: true, certification: savedCert };
  } catch (err: any) {
    return { success: false, error: err?.message || String(err) };
  }
}

export async function deleteCertification(id: string): Promise<{ success: boolean; error?: string }> {
  try {
    const { userId } = await ensureFreshSession();
    if (!userId) return { success: false, error: "Not authenticated. Please log in again." };
    const { error } = await supabase.from("certifications").delete().eq("user_id", userId).eq("id", id);
    if (error) {
      console.error("Supabase delete cert error:", error);
      return { success: false, error: error.message };
    }

    try {
      const key = `sc_certifications_${userId}`;
      const existing: UserCertification[] = JSON.parse(localStorage.getItem(key) || "[]");
      localStorage.setItem(key, JSON.stringify(existing.filter((c) => c.id !== id)));
    } catch {}

    return { success: true };
  } catch (err: any) {
    return { success: false, error: err?.message || String(err) };
  }
}

// ── Achievement Mutations (Matches SQL Contract: achievement_name, organization, achievement_date) ─

export async function saveAchievement(ach: {
  id?: string;
  achievement_name: string;
  organization?: string;
  achievement_date?: string | null;
  description?: string;
}): Promise<{ success: boolean; achievement?: UserAchievement; error?: string }> {
  try {
    const { userId } = await ensureFreshSession();
    if (!userId) return { success: false, error: "Not authenticated. Please log in again." };
    const cleanTitle = ach.achievement_name?.trim();
    if (!cleanTitle) {
      return { success: false, error: "Honor / Award title is required." };
    }

    const payload: any = {
      user_id: userId,
      achievement_name: cleanTitle,
      organization: ach.organization?.trim() || "",
      achievement_date: normalizeDateToISO(ach.achievement_date),
      description: ach.description?.trim() || "",
      updated_at: new Date().toISOString(),
    };

    if (isValidUUID(ach.id)) {
      payload.id = ach.id;
    }

    const { data, error } = await supabase
      .from("achievements")
      .upsert(payload, { onConflict: "id" })
      .select()
      .single();

    if (error) {
      console.error("Supabase save achievement error:", error);
      return { success: false, error: error.message || "Failed to save achievement." };
    }

    const savedAch: UserAchievement = {
      id: data.id,
      user_id: data.user_id,
      achievement_name: data.achievement_name,
      organization: data.organization,
      achievement_date: data.achievement_date,
      description: data.description,
      created_at: data.created_at,
      updated_at: data.updated_at,
    };

    try {
      const key = `sc_achievements_${userId}`;
      const existing: UserAchievement[] = JSON.parse(localStorage.getItem(key) || "[]");
      const idx = existing.findIndex((a) => a.id === savedAch.id);
      if (idx >= 0) existing[idx] = savedAch;
      else existing.unshift(savedAch);
      localStorage.setItem(key, JSON.stringify(existing));
    } catch {}

    return { success: true, achievement: savedAch };
  } catch (err: any) {
    return { success: false, error: err?.message || String(err) };
  }
}

export async function deleteAchievement(id: string): Promise<{ success: boolean; error?: string }> {
  try {
    const { userId } = await ensureFreshSession();
    if (!userId) return { success: false, error: "Not authenticated. Please log in again." };
    const { error } = await supabase.from("achievements").delete().eq("user_id", userId).eq("id", id);
    if (error) {
      console.error("Supabase delete achievement error:", error);
      return { success: false, error: error.message };
    }

    try {
      const key = `sc_achievements_${userId}`;
      const existing: UserAchievement[] = JSON.parse(localStorage.getItem(key) || "[]");
      localStorage.setItem(key, JSON.stringify(existing.filter((a) => a.id !== id)));
    } catch {}

    return { success: true };
  } catch (err: any) {
    return { success: false, error: err?.message || String(err) };
  }
}

// ── Career Preferences Mutation (Matches SQL Contract: target_roles[], preferred_industries[], target_companies[], etc.) ─

export async function saveCareerPreferences(data: {
  target_roles?: string[];
  preferred_industries?: string[];
  target_companies?: string[];
  preferred_locations?: string[];
  work_arrangements?: string[];
}): Promise<{ success: boolean; error?: string }> {
  try {
    const { userId } = await ensureFreshSession();
    if (!userId) return { success: false, error: "Not authenticated. Please log in again." };
    const payload = {
      user_id: userId,
      target_roles: Array.isArray(data.target_roles) ? data.target_roles : [],
      preferred_industries: Array.isArray(data.preferred_industries) ? data.preferred_industries : [],
      target_companies: Array.isArray(data.target_companies) ? data.target_companies : [],
      preferred_locations: Array.isArray(data.preferred_locations) ? data.preferred_locations : [],
      work_arrangements: Array.isArray(data.work_arrangements) ? data.work_arrangements : [],
      updated_at: new Date().toISOString(),
    };

    const { error } = await supabase.from("career_preferences").upsert(payload, { onConflict: "user_id" });
    if (error) {
      console.error("Supabase career preferences upsert error:", error);
      return { success: false, error: error.message || "Failed to save career preferences." };
    }

    // Sync primary target role to user_academic_profile for backward compatibility
    if (payload.target_roles.length > 0 && payload.target_roles[0].trim()) {
      try {
        await supabase.from("user_academic_profile").upsert({
          user_id: userId,
          target_role: payload.target_roles[0].trim(),
          updated_at: new Date().toISOString(),
        }, { onConflict: "user_id" });
      } catch {}
    }

    try {
      localStorage.setItem(`sc_career_preferences_${userId}`, JSON.stringify(payload));
    } catch {}

    try {
      const authHeaders = await getAuthHeaders();
      if (authHeaders.Authorization) {
        apiFetch(`${API_BASE}/api/profile/career-preferences`, {
          method: "POST",
          headers: { "Content-Type": "application/json", ...authHeaders },
          body: JSON.stringify(payload),
        }).catch(() => {});
      }
    } catch {}

    return { success: true };
  } catch (err: any) {
    return { success: false, error: err?.message || String(err) };
  }
}

// ── Existing Profile API Methods Preserved ────────────────────────────────────

export async function fetchProfileData() {
  try {
    const full = await fetchFullProfileData();
    if (!full) return null;
    return {
      academic: full.academic,
      coding_inputs: full.coding_inputs,
      coding_stats: full.coding_stats,
    };
  } catch (e) {
    console.warn("Failed to fetch profile data:", e);
    return null;
  }
}

export async function saveAcademicProfile(data: AcademicProfile) {
  try {
    const { userId } = await ensureFreshSession();
    if (!userId) return null;

    const payload = {
      user_id: userId,
      full_name: data.full_name || "",
      college: data.college || "",
      department: data.department || "",
      academic_year: data.academic_year || "",
      target_role: data.target_role || "",
      updated_at: new Date().toISOString(),
    };

    const { error } = await supabase
      .from("user_academic_profile")
      .upsert(payload, { onConflict: "user_id" });

    if (error) throw error;

    const authHeaders = await getAuthHeaders();
    if (authHeaders.Authorization) {
      apiFetch(`${API_BASE}/api/profile/academic`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...authHeaders },
        body: JSON.stringify(data),
      }).catch(() => {});
    }

    return { success: true };
  } catch (e) {
    console.warn("Failed to save academic profile:", e);
    return null;
  }
}

export async function saveCodingProfiles(data: CodingProfilesInput) {
  try {
    const { userId } = await ensureFreshSession();
    if (!userId) return null;

    const payload = {
      user_id: userId,
      leetcode_url: data.leetcode || "",
      github_url: data.github || "",
      hackerrank_url: data.hackerrank || "",
      codechef_url: data.codechef || "",
      geeksforgeeks_url: data.geeksforgeeks || "",
      codeforces_url: data.codeforces || "",
      updated_at: new Date().toISOString(),
    };

    const { error } = await supabase
      .from("user_coding_profiles")
      .upsert(payload, { onConflict: "user_id" });

    if (error) throw error;

    let extractedStats = {};
    const authHeaders = await getAuthHeaders();
    if (authHeaders.Authorization) {
      try {
        const res = await apiFetch(`${API_BASE}/api/profile/coding`, {
          method: "POST",
          headers: { "Content-Type": "application/json", ...authHeaders },
          body: JSON.stringify(data),
        });
        if (res.ok) {
          const json = await res.json();
          if (json.stats) extractedStats = json.stats;
        }
      } catch {}
    }

    return { success: true, stats: extractedStats };
  } catch (e) {
    console.warn("Failed to save coding profiles:", e);
    return null;
  }
}

export async function sendWelcomeEmail(payload: {
  is_signup?: boolean;
  full_name?: string;
  email?: string;
  user_id?: string;
} = {}): Promise<{ success: boolean; status?: string; message?: string; error?: string }> {
  try {
    const { token } = await ensureFreshSession();
    if (!token) {
      return { success: false, error: "No active session token" };
    }

    const res = await fetch(`${API_BASE}/api/auth/welcome-email`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
      body: JSON.stringify({
        is_signup: payload.is_signup ?? false,
        full_name: payload.full_name,
      }),
    });
    if (!res.ok) {
      return { success: false, error: `HTTP ${res.status}` };
    }
    return await res.json();
  } catch (err: any) {
    console.warn("Welcome email dispatch warning:", err);
    return { success: false, error: err?.message || String(err) };
  }
}

// ── Daily Login Streak & Dynamic Level Engine ────────────────────────────────

export function getLocalCalendarDateStr(d: Date = new Date()): string {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export async function syncDailyLoginStreak(userId: string): Promise<number> {
  if (!userId) return 0;

  const todayStr = getLocalCalendarDateStr(new Date());
  const yesterdayDate = new Date();
  yesterdayDate.setDate(yesterdayDate.getDate() - 1);
  const yesterdayStr = getLocalCalendarDateStr(yesterdayDate);

  const LS_STREAK = `sc_daily_streak_${userId}`;
  const LS_LAST_LOGIN = `sc_last_login_date_${userId}`;

  let currentStreak = 0;
  let lastLoginDate: string | null = null;

  try {
    const cachedStreak = localStorage.getItem(LS_STREAK);
    const cachedDate = localStorage.getItem(LS_LAST_LOGIN);
    if (cachedStreak) currentStreak = parseInt(cachedStreak, 10) || 0;
    if (cachedDate) lastLoginDate = cachedDate;
  } catch {}

  try {
    const { data: sessionData } = await supabase.auth.getSession();
    const hasAuthSession = sessionData?.session?.user?.id === userId;

    if (hasAuthSession) {
      const { data, error } = await supabase
        .from("user_progress")
        .select("streak_days, last_login_date")
        .eq("user_id", userId)
        .maybeSingle();

      if (!error && data) {
        if (typeof data.streak_days === "number") currentStreak = data.streak_days;
        if (data.last_login_date) lastLoginDate = data.last_login_date;
      }
    }

    let nextStreak = currentStreak;

    if (lastLoginDate === todayStr) {
      nextStreak = Math.max(1, currentStreak);
    } else if (lastLoginDate === yesterdayStr) {
      nextStreak = (currentStreak > 0 ? currentStreak : 0) + 1;
    } else {
      nextStreak = 1;
    }

    if (hasAuthSession) {
      await supabase.from("user_progress").upsert(
        {
          user_id: userId,
          streak_days: nextStreak,
          last_login_date: todayStr,
          last_active_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        { onConflict: "user_id" }
      );
    }

    try {
      localStorage.setItem(LS_STREAK, String(nextStreak));
      localStorage.setItem(LS_LAST_LOGIN, todayStr);
    } catch {}

    return nextStreak;
  } catch (err) {
    console.warn("Error syncing daily login streak:", err);
    return Math.max(0, currentStreak);
  }
}

export interface BadgeItem {
  id: string;
  name: string;
  desc: string;
  icon: string;
  unlocked: boolean;
  category: "practice" | "learning" | "streak" | "level";
  progressText?: string;
}

export interface UserProgressStats {
  streakDays: number;
  badgesCount: number;
  questionsSolved: number;
  completedVideos: number;
  completedRoadmaps: number;
  totalXP: number;
  level: number;
  currentLevelXP: number;
  nextLevelXP: number;
  xpPercent: number;
  badges: BadgeItem[];
}

export async function fetchUserProgressStats(
  userId: string,
  hasConnectedProfile: boolean = false
): Promise<UserProgressStats> {
  const defaultStats: UserProgressStats = {
    streakDays: 0,
    badgesCount: 0,
    questionsSolved: 0,
    completedVideos: 0,
    completedRoadmaps: 0,
    totalXP: 0,
    level: 0,
    currentLevelXP: 0,
    nextLevelXP: 100,
    xpPercent: 0,
    badges: [],
  };

  if (!userId) return defaultStats;

  let dbSolved = 0;
  try {
    const { count } = await supabase
      .from("leetcode_progress")
      .select("*", { count: "exact", head: true })
      .eq("user_id", userId)
      .eq("status", "solved");
    if (typeof count === "number") dbSolved = count;
  } catch (err) {
    console.warn("Failed to fetch leetcode_progress count:", err);
  }

  let localSolved = 0;
  try {
    const savedSolved = localStorage.getItem(`skillscatalyst_solved_questions_${userId}`);
    if (savedSolved) {
      const parsed = JSON.parse(savedSolved);
      localSolved = Object.keys(parsed).filter((k) => !!parsed[k]).length;
    }
  } catch {}

  const questionsSolved = Math.max(dbSolved, localSolved);

  let dbVideos = 0;
  try {
    const { count } = await supabase
      .from("video_progress")
      .select("*", { count: "exact", head: true })
      .eq("user_id", userId)
      .eq("watched", true);
    if (typeof count === "number") dbVideos = count;
  } catch (err) {
    console.warn("Failed to fetch video_progress count:", err);
  }

  let localVideos = 0;
  try {
    const savedVideos = localStorage.getItem(`skillscatalyst_video_progress_${userId}`);
    if (savedVideos) {
      const parsed = JSON.parse(savedVideos);
      localVideos = Object.keys(parsed).filter((k) => !!parsed[k]?.watched).length;
    }
  } catch {}

  const completedVideos = Math.max(dbVideos, localVideos);

  let dbRoadmaps = 0;
  try {
    const { count } = await supabase
      .from("roadmap_progress")
      .select("*", { count: "exact", head: true })
      .eq("user_id", userId)
      .eq("status", "completed")
      .neq("node_id", "_roadmap_started");
    if (typeof count === "number") dbRoadmaps = count;
  } catch (err) {
    console.warn("Failed to fetch roadmap_progress count:", err);
  }

  let localRoadmaps = 0;
  try {
    const savedNodes = localStorage.getItem("skillscatalyst_completed_roadmap_nodes");
    if (savedNodes) {
      const parsed = JSON.parse(savedNodes);
      if (Array.isArray(parsed)) localRoadmaps = parsed.length;
    }
  } catch {}

  const completedRoadmaps = Math.max(dbRoadmaps, localRoadmaps);

  const streakDays = await syncDailyLoginStreak(userId);

  const totalXP = (completedVideos * 25) + (questionsSolved * 50) + (completedRoadmaps * 50);
  const XP_PER_LEVEL = 100;
  const level = Math.floor(totalXP / XP_PER_LEVEL);
  const currentLevelXP = totalXP % XP_PER_LEVEL;
  const nextLevelXP = XP_PER_LEVEL;
  const xpPercent = Math.min(100, Math.round((currentLevelXP / nextLevelXP) * 100));

  try {
    await supabase.from("user_progress").upsert(
      {
        user_id: userId,
        problems_solved: questionsSolved,
        total_xp: totalXP,
        level: level,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "user_id" }
    );
  } catch {}

  const badges: BadgeItem[] = [
    {
      id: "first_problem",
      name: "Code Starter",
      desc: "Solve your first practice question",
      icon: "💻",
      unlocked: questionsSolved >= 1,
      category: "practice",
      progressText: `${Math.min(questionsSolved, 1)}/1 solved`,
    },
    {
      id: "five_problems",
      name: "Problem Solver",
      desc: "Solve 5 practice questions",
      icon: "⚡",
      unlocked: questionsSolved >= 5,
      category: "practice",
      progressText: `${Math.min(questionsSolved, 5)}/5 solved`,
    },
    {
      id: "fifteen_problems",
      name: "Algo Apprentice",
      desc: "Solve 15 practice questions",
      icon: "🧠",
      unlocked: questionsSolved >= 15,
      category: "practice",
      progressText: `${Math.min(questionsSolved, 15)}/15 solved`,
    },
    {
      id: "thirty_problems",
      name: "DSA Master",
      desc: "Solve 30 practice questions",
      icon: "👑",
      unlocked: questionsSolved >= 30,
      category: "practice",
      progressText: `${Math.min(questionsSolved, 30)}/30 solved`,
    },
    {
      id: "first_video",
      name: "Curious Mind",
      desc: "Complete your first saved video",
      icon: "🎬",
      unlocked: completedVideos >= 1,
      category: "learning",
      progressText: `${Math.min(completedVideos, 1)}/1 watched`,
    },
    {
      id: "five_videos",
      name: "Video Scholar",
      desc: "Complete 5 saved videos",
      icon: "📺",
      unlocked: completedVideos >= 5,
      category: "learning",
      progressText: `${Math.min(completedVideos, 5)}/5 watched`,
    },
    {
      id: "first_roadmap",
      name: "Pathfinder",
      desc: "Complete your first roadmap topic",
      icon: "🗺️",
      unlocked: completedRoadmaps >= 1,
      category: "learning",
      progressText: `${Math.min(completedRoadmaps, 1)}/1 topic`,
    },
    {
      id: "five_roadmaps",
      name: "Trailblazer",
      desc: "Complete 5 roadmap topics",
      icon: "🚀",
      unlocked: completedRoadmaps >= 5,
      category: "learning",
      progressText: `${Math.min(completedRoadmaps, 5)}/5 topics`,
    },
    {
      id: "streak_3",
      name: "Habit Builder",
      desc: "Maintain a 3-day daily login streak",
      icon: "🔥",
      unlocked: streakDays >= 3,
      category: "streak",
      progressText: `${Math.min(streakDays, 3)}/3 days`,
    },
    {
      id: "streak_7",
      name: "Weekly Champion",
      desc: "Maintain a 7-day daily login streak",
      icon: "🌟",
      unlocked: streakDays >= 7,
      category: "streak",
      progressText: `${Math.min(streakDays, 7)}/7 days`,
    },
    {
      id: "streak_14",
      name: "Unstoppable",
      desc: "Maintain a 14-day daily login streak",
      icon: "🛡️",
      unlocked: streakDays >= 14,
      category: "streak",
      progressText: `${Math.min(streakDays, 14)}/14 days`,
    },
    {
      id: "level_1",
      name: "Level 1 Achiever",
      desc: "Reach Level 1 (Earn 100 XP)",
      icon: "✨",
      unlocked: level >= 1,
      category: "level",
      progressText: `${Math.min(totalXP, 100)}/100 XP`,
    },
    {
      id: "level_5",
      name: "Veteran Learner",
      desc: "Reach Level 5 (Earn 500 XP)",
      icon: "🏅",
      unlocked: level >= 5,
      category: "level",
      progressText: `${Math.min(totalXP, 500)}/500 XP`,
    },
    {
      id: "profile_linked",
      name: "Profile Connected",
      desc: "Connect at least 1 coding profile",
      icon: "🔗",
      unlocked: hasConnectedProfile,
      category: "practice",
      progressText: hasConnectedProfile ? "Connected" : "0/1 linked",
    },
  ];

  const badgesCount = badges.filter((b) => b.unlocked).length;

  return {
    streakDays,
    badgesCount,
    questionsSolved,
    completedVideos,
    completedRoadmaps,
    totalXP,
    level,
    currentLevelXP,
    nextLevelXP,
    xpPercent,
    badges,
  };
}
