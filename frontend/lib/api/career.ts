import { supabase } from "@/lib/supabase";
import { API_BASE, apiFetch, getAuthHeaders } from "./client";

export async function sendMentorMessage(prompt: string) {
  try {
    const authHeaders = await getAuthHeaders();
    const res = await apiFetch(`${API_BASE}/api/ai-mentor/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...authHeaders },
      body: JSON.stringify({ prompt }),
    });
    if (!res.ok) throw new Error("Failed to reach AI mentor");
    return await res.json();
  } catch {
    return { reply: "I am your SkillsCatalyst AI Mentor powered by Groq. Please start the FastAPI backend to interact live!" };
  }
}

export async function extractResume(file: File): Promise<{ success: boolean; text?: string; filename?: string; char_count?: number; message?: string }> {
  try {
    const formData = new FormData();
    formData.append("file", file);
    const authHeaders = await getAuthHeaders();

    const res = await apiFetch(`${API_BASE}/api/resume/extract`, {
      method: "POST",
      headers: { ...authHeaders },
      body: formData,
    });

    const data = await res.json();

    if (!res.ok || !data.success) {
      return {
        success: false,
        message: data.message || `Failed to extract resume (HTTP ${res.status})`,
      };
    }

    return {
      success: true,
      text: data.text,
      filename: data.filename,
      char_count: data.char_count,
    };
  } catch (error: any) {
    console.error("Resume extraction network error:", error);
    return {
      success: false,
      message: error?.message || "Failed to reach backend extraction service. Ensure backend is running.",
    };
  }
}

export async function reviewResume(resumeText: string, targetRole: string, yearsExperience: string, companyType: string = "Product-Based", jobDescription: string = "") {
  try {
    const authHeaders = await getAuthHeaders();
    const res = await apiFetch(`${API_BASE}/api/ai-mentor/review-resume`, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...authHeaders },
      body: JSON.stringify({
        resume_text: resumeText,
        target_role: targetRole,
        years_experience: yearsExperience,
        company_type: companyType,
        job_description: jobDescription,
      }),
    });
    if (!res.ok) throw new Error("Failed to evaluate resume");
    const data = await res.json();
    if (data?.review) {
      const match = data.review.match(/(?:Final Score:|Score:)?\s*(\d+(?:\.\d+)?)\s*\/\s*(100|10)/i) || data.review.match(/(\d+(?:\.\d+)?)\s*\/\s*(100|10)/);
      if (match) {
        let val = parseFloat(match[1]);
        if (match[2] === "10" || val <= 10) val = val * 10;
        const scoreVal = Math.round(val);
        if (typeof window !== "undefined") {
          localStorage.setItem("skillscatalyst_latest_resume_score", String(scoreVal));
        }

        // Direct Supabase DB insert for guaranteed persistence across sessions
        try {
          const { data: { session } } = await supabase.auth.getSession();
          if (session?.user?.id) {
            await supabase.from("resume_scores").insert({
              user_id: session.user.id,
              filename: "resume.pdf",
              target_role: targetRole,
              company_type: companyType,
              overall_score: scoreVal,
              ats_compatibility_score: scoreVal,
              skills_match_score: scoreVal,
              experience_score: scoreVal,
              full_review_json: { review: data.review },
            });
            await supabase.from("user_progress").upsert({
              user_id: session.user.id,
              resume_readiness_score: scoreVal,
              updated_at: new Date().toISOString(),
            }, { onConflict: "user_id" });
          }
        } catch (dbErr) {
          console.warn("Direct Supabase resume_scores insert warning:", dbErr);
        }
      }
    }
  } catch (error: any) {
    console.error("Resume review error:", error);
    return { review: "Error: Unable to connect to Groq AI Resume Evaluator. Please ensure the backend is running." };
  }
}
