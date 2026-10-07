import { supabase } from "@/lib/supabase";
import { API_BASE, apiFetch, getAuthHeaders } from "./client";

export interface MentorConversation {
  id: string;
  user_id: string;
  title: string;
  created_at: string;
  updated_at: string;
  last_message_at: string;
}

export interface MentorMessage {
  id: string;
  conversation_id: string;
  user_id: string;
  role: "user" | "assistant";
  content: string;
  created_at: string;
}

export async function fetchMentorConversations(
  limit: number = 20,
  offset: number = 0,
): Promise<{ conversations: MentorConversation[]; total: number }> {
  try {
    const authHeaders = await getAuthHeaders();
    const res = await apiFetch(`${API_BASE}/api/ai-mentor/conversations?limit=${limit}&offset=${offset}`, {
      headers: { ...authHeaders },
    });
    if (!res.ok) throw new Error("Failed to load conversations");
    return await res.json();
  } catch (err) {
    console.warn("fetchMentorConversations error:", err);
    return { conversations: [], total: 0 };
  }
}

export async function createMentorConversation(title?: string): Promise<MentorConversation | null> {
  try {
    const authHeaders = await getAuthHeaders();
    const res = await apiFetch(`${API_BASE}/api/ai-mentor/conversations`, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...authHeaders },
      body: JSON.stringify(title ? { title } : {}),
    });
    if (!res.ok) throw new Error("Failed to create conversation");
    return await res.json();
  } catch (err) {
    console.error("createMentorConversation error:", err);
    return null;
  }
}

export async function fetchMentorConversationDetail(
  conversationId: string,
): Promise<{ conversation: MentorConversation; messages: MentorMessage[] } | null> {
  try {
    const authHeaders = await getAuthHeaders();
    const res = await apiFetch(`${API_BASE}/api/ai-mentor/conversations/${conversationId}`, {
      headers: { ...authHeaders },
    });
    if (!res.ok) throw new Error("Failed to load conversation");
    return await res.json();
  } catch (err) {
    console.error("fetchMentorConversationDetail error:", err);
    return null;
  }
}

export async function deleteMentorConversation(conversationId: string): Promise<boolean> {
  try {
    const authHeaders = await getAuthHeaders();
    const res = await apiFetch(`${API_BASE}/api/ai-mentor/conversations/${conversationId}`, {
      method: "DELETE",
      headers: { ...authHeaders },
    });
    return res.ok;
  } catch (err) {
    console.error("deleteMentorConversation error:", err);
    return false;
  }
}

export async function sendMentorMessage(
  prompt: string,
  conversationId?: string,
): Promise<{ reply: string; conversation_id?: string; message_id?: string }> {
  try {
    const authHeaders = await getAuthHeaders();
    const body: Record<string, any> = { message: prompt, prompt };
    if (conversationId) {
      body.conversation_id = conversationId;
    }
    const res = await apiFetch(`${API_BASE}/api/ai-mentor/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...authHeaders },
      body: JSON.stringify(body),
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
    if (!res.ok) {
      if (res.status === 403) {
        const errorBody = await res.json().catch(() => null);
        const detail = errorBody?.detail;
        const err: any = new Error(
          detail?.message || "Free plan limit reached. Upgrade to Premium for unlimited AI Resume Reviews."
        );
        err.status = 403;
        err.code = detail?.code || "LIMIT_REACHED";
        err.detail = detail;
        throw err;
      }
      throw new Error("Failed to evaluate resume");
    }
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
    return data;
  } catch (error: any) {
    if (error?.status === 403 || error?.code === "LIMIT_REACHED") {
      throw error;
    }
    console.error("Resume review error:", error);
    return { review: "Error: Unable to connect to Groq AI Resume Evaluator. Please ensure the backend is running." };
  }
}
