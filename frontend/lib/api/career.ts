import { API_BASE, apiFetch, getAuthHeaders } from "./client";
import { ResumeReviewResponse } from "@/types/career";
import { TaskActionProposal } from "@/types/ai-mentor-tasks";

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
  action_proposals?: TaskActionProposal[];
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

export class AIMentorError extends Error {
  status: number;
  code: string;
  retryAfter?: number;
  detail?: any;

  constructor(message: string, status: number, code: string, retryAfter?: number, detail?: any) {
    super(message);
    this.name = "AIMentorError";
    this.status = status;
    this.code = code;
    this.retryAfter = retryAfter;
    this.detail = detail;
  }
}

export async function sendMentorMessage(
  prompt: string,
  conversationId?: string,
  model?: string,
  effort?: string,
): Promise<{ reply: string; conversation_id?: string; message_id?: string; action_proposals?: TaskActionProposal[] }> {
  const authHeaders = await getAuthHeaders();
  const body: Record<string, any> = {
    message: prompt,
    prompt,
    client_timezone: typeof Intl !== "undefined" ? Intl.DateTimeFormat().resolvedOptions().timeZone : "UTC",
    client_now: new Date().toISOString(),
  };
  if (conversationId) {
    body.conversation_id = conversationId;
  }
  if (model) {
    body.model = model;
  }
  if (effort) {
    body.effort = effort;
  }

  let res: Response;
  try {
    res = await apiFetch(`${API_BASE}/api/ai-mentor/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...authHeaders },
      body: JSON.stringify(body),
    });
  } catch (err: any) {
    // Genuine network connection failure reaching the backend server
    throw new AIMentorError(
      "Unable to connect to SkillsCatalyst server. Please check your network connection.",
      0,
      "NETWORK_ERROR"
    );
  }

  if (!res.ok) {
    const errorBody = await res.json().catch(() => null);
    const detail = errorBody?.detail;
    const code = detail?.code || errorBody?.code || (res.status === 429 ? "RATE_LIMIT" : "SERVER_ERROR");
    const retryHeader = res.headers.get("retry-after");
    const retryAfter = retryHeader && !isNaN(Number(retryHeader)) ? Number(retryHeader) : undefined;

    let message = detail?.message || errorBody?.message;
    if (!message) {
      if (res.status === 403) {
        message = "Free plan limit reached. Upgrade to Pro for unlimited AI Mentor access.";
      } else if (res.status === 429) {
        message = retryAfter
          ? `AI service rate limit reached. Please wait ${retryAfter}s before trying again.`
          : "AI service rate limit reached. Please wait a moment before trying again.";
      } else if (res.status === 503) {
        message = "AI service quota is currently exhausted. Please try again later.";
      } else if (res.status === 504) {
        message = "AI service request timed out. Please try again.";
      } else if (res.status === 502) {
        message = "AI service configuration error or provider unavailable. Please try again later.";
      } else {
        message = `AI Mentor request failed (HTTP ${res.status}).`;
      }
    }

    throw new AIMentorError(message, res.status, code, retryAfter, detail);
  }

  return await res.json();
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

export async function reviewResume(
  resumeText: string,
  targetRole: string,
  yearsExperience: string,
  companyType: string = "Product-Based",
  jobDescription: string = ""
): Promise<ResumeReviewResponse> {
  const authHeaders = await getAuthHeaders();
  let res: Response;
  try {
    res = await apiFetch(`${API_BASE}/api/ai-mentor/review-resume`, {
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
  } catch (err: any) {
    const netErr: any = new Error("Unable to connect to SkillsCatalyst server. Please check your network connection.");
    netErr.status = 0;
    netErr.code = "NETWORK_ERROR";
    throw netErr;
  }

  if (!res.ok) {
    const errorBody = await res.json().catch(() => null);
    const detail = errorBody?.detail;
    const code = detail?.code || errorBody?.code || (res.status === 429 ? "RATE_LIMIT" : "SERVER_ERROR");
    const retryHeader = res.headers.get("retry-after");
    const retryAfter = retryHeader && !isNaN(Number(retryHeader)) ? Number(retryHeader) : undefined;

    let errorMsg = detail?.message || errorBody?.message;
    if (!errorMsg) {
      if (res.status === 403) {
        errorMsg = "Free plan limit reached. Upgrade to Premium for unlimited AI Resume Reviews.";
      } else if (res.status === 429) {
        errorMsg = retryAfter
          ? `AI service rate limit reached. Please wait ${retryAfter}s before trying again.`
          : "AI service rate limit reached. Please wait a moment before trying again.";
      } else if (res.status === 503) {
        errorMsg = "AI service quota is currently exhausted. Please try again later.";
      } else if (res.status === 504) {
        errorMsg = "AI service request timed out. Please try again.";
      } else if (res.status === 502) {
        errorMsg = "AI evaluator is temporarily unavailable. Please try again.";
      } else {
        errorMsg = `Failed to evaluate resume (HTTP ${res.status})`;
      }
    }
    const err: any = new Error(errorMsg);
    err.status = res.status;
    err.code = code;
    err.retryAfter = retryAfter;
    err.detail = detail;
    throw err;
  }

  const data = await res.json();
  let overallScore: number | null = null;

  if (typeof data?.overall_score === "number" && !isNaN(data.overall_score)) {
    if (data.overall_score >= 0 && data.overall_score <= 100) {
      overallScore = Math.round(data.overall_score);
    }
  } else if (data?.overall_score === undefined && data?.review) {
    // Backwards-compatibility fallback if an older server omitted overall_score
    const match = data.review.match(
      /(?:Final\s*Score|Overall\s*Score|ATS\s*Score|Total\s*Score|Score)\s*[:\-*]*\s*(-?\d+(?:\.\d+)?)\s*\/\s*(\d+(?:\.\d+)?)\b/i
    );
    if (match) {
      const val = parseFloat(match[1]);
      const denom = parseFloat(match[2]);
      if (denom === 10 && val >= 0 && val <= 10) {
        overallScore = Math.round(val * 10);
      } else if (denom === 100 && val >= 0 && val <= 100) {
        overallScore = Math.round(val);
      }
    }
  }

  if (typeof overallScore === "number" && typeof window !== "undefined") {
    localStorage.setItem("skillscatalyst_latest_resume_score", String(overallScore));
  }

  const scoringStatus: "scored" | "unscored" =
    overallScore !== null ? "scored" : "unscored";

  return {
    review: data?.review || "",
    overall_score: overallScore,
    scoring_status: scoringStatus,
  };
}
