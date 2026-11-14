import { API_BASE, apiFetch, getAuthHeaders } from "./client";
import {
  ResumeReviewResponse,
  ResumeHistoryResponse,
  ResumeHistoryItem,
  ResumeAnalysisDetail,
  ResumeAnalyzeResponse,
  ResumeSeriesItem,
  ResumeSeriesDetail,
  ResumeComparisonResponse,
  ResumeProgressResponse,
  ResumeBuilderDocument,
  ResumeBuilderVersion,
  JobOptimizationSession,
  AIImproveBulletResponse,
  AIWritingFeedbackResponse,
} from "@/types/career";
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

export async function extractResume(file: File): Promise<{
  success: boolean;
  text?: string;
  filename?: string;
  char_count?: number;
  file_type?: string;
  is_scanned?: boolean;
  detected_columns?: number;
  page_count?: number;
  extraction_quality?: number;
  warnings?: string[];
  message?: string;
}> {
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
      file_type: data.file_type,
      is_scanned: data.is_scanned,
      detected_columns: data.detected_columns,
      page_count: data.page_count,
      extraction_quality: data.extraction_quality,
      warnings: data.warnings,
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
  jobDescription: string = "",
  filename?: string,
  detectedColumns?: number,
  extractionQuality?: number
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
        filename: filename || undefined,
        detected_columns: detectedColumns || 1,
        extraction_quality: extractionQuality !== undefined ? extractionQuality : 100.0,
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
  } else if (typeof data?.review === "string") {
    const match = data.review.match(/(?:Final\s*Score|Overall\s*Score|ATS\s*Score):\s*(\d{1,3})\/100/i);
    if (match && match[1]) {
      const parsed = parseInt(match[1], 10);
      if (parsed >= 0 && parsed <= 100) {
        overallScore = parsed;
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
    ats_compatibility_score: data?.ats_compatibility_score ?? null,
    skills_match_score: data?.skills_match_score ?? null,
    experience_score: data?.experience_score ?? null,
    structure_score: data?.structure_score ?? null,
    content_quality_score: data?.content_quality_score ?? null,
    score_status: data?.score_status ?? (overallScore !== null ? "completed" : "failed"),
    filename: data?.filename ?? filename ?? null,
    persisted: Boolean(data?.persisted),
    career_stage: data?.career_stage ?? null,
    ats_analysis: data?.ats_analysis ?? null,
    keyword_analysis: data?.keyword_analysis ?? null,
    ai_evaluation: data?.ai_evaluation ?? null,
    score_breakdown: data?.score_breakdown ?? null,
    extraction: data?.extraction ?? null,
  };
}

// ---------------------------------------------------------------------------
// Phase 3 Cloud Storage & History Client API
// ---------------------------------------------------------------------------

/**
 * Phase 3: Upload original resume to Supabase Storage, run Phase 2 analysis, and persist to history.
 */
export async function analyzeResumeFile(
  file: File,
  options?: {
    jobDescription?: string;
    targetRole?: string;
    yearsExperience?: string;
    companyType?: string;
  }
): Promise<ResumeAnalyzeResponse> {
  const authHeaders = await getAuthHeaders();
  const formData = new FormData();
  formData.append("file", file);
  if (options?.jobDescription) formData.append("job_description", options.jobDescription);
  if (options?.targetRole) formData.append("target_role", options.targetRole);
  if (options?.yearsExperience) formData.append("years_experience", options.yearsExperience);
  if (options?.companyType) formData.append("company_type", options.companyType);

  let res: Response;
  try {
    res = await apiFetch(`${API_BASE}/api/resume/analyze`, {
      method: "POST",
      headers: { ...authHeaders },
      body: formData,
    });
  } catch (err: any) {
    const netErr: any = new Error("Unable to connect to SkillsCatalyst server. Please check your network connection.");
    netErr.status = 0;
    netErr.code = "NETWORK_ERROR";
    throw netErr;
  }

  if (!res.ok) {
    let errorMsg = `Upload and analysis failed (HTTP ${res.status})`;
    try {
      const errData = await res.json();
      if (errData?.detail) {
        if (typeof errData.detail === "string") errorMsg = errData.detail;
        else if (errData.detail.message) errorMsg = errData.detail.message;
      } else if (errData?.message) {
        errorMsg = errData.message;
      }
    } catch {}
    const err: any = new Error(errorMsg);
    err.status = res.status;
    throw err;
  }

  return await res.json();
}

/**
 * Phase 3: Get lightweight paginated history of resume analyses for authenticated user.
 */
export async function getResumeHistory(params?: {
  page?: number;
  pageSize?: number;
  sortBy?: string;
  order?: string;
}): Promise<ResumeHistoryResponse> {
  const authHeaders = await getAuthHeaders();
  const page = params?.page ?? 1;
  const pageSize = params?.pageSize ?? 10;
  const sortBy = params?.sortBy ?? "created_at";
  const order = params?.order ?? "desc";

  const url = `${API_BASE}/api/resume/history?page=${page}&page_size=${pageSize}&sort_by=${sortBy}&order=${order}`;

  const res = await apiFetch(url, {
    method: "GET",
    headers: { ...authHeaders },
  });

  if (!res.ok) {
    let msg = `Failed to fetch history (HTTP ${res.status})`;
    try {
      const data = await res.json();
      if (data?.detail) msg = typeof data.detail === "string" ? data.detail : data.detail.message;
    } catch {}
    throw new Error(msg);
  }

  return await res.json();
}

/**
 * Phase 3: Get single historical analysis detail including complete evaluation JSONB artifact.
 */
export async function getResumeAnalysisById(analysisId: string): Promise<ResumeAnalysisDetail> {
  const authHeaders = await getAuthHeaders();
  const res = await apiFetch(`${API_BASE}/api/resume/history/${analysisId}`, {
    method: "GET",
    headers: { ...authHeaders },
  });

  if (!res.ok) {
    let msg = `Analysis not found (HTTP ${res.status})`;
    try {
      const data = await res.json();
      if (data?.detail) msg = typeof data.detail === "string" ? data.detail : data.detail.message;
    } catch {}
    throw new Error(msg);
  }

  const json = await res.json();
  return json.data;
}

/**
 * Phase 3: Download original resume file via short-lived signed URL.
 */
export async function downloadResumeFile(analysisId: string): Promise<{ signed_url: string; filename: string; expires_in: number }> {
  const authHeaders = await getAuthHeaders();
  const res = await apiFetch(`${API_BASE}/api/resume/history/${analysisId}/download`, {
    method: "GET",
    headers: { ...authHeaders },
  });

  if (!res.ok) {
    let msg = `Download failed (HTTP ${res.status})`;
    try {
      const data = await res.json();
      if (data?.detail) msg = typeof data.detail === "string" ? data.detail : data.detail.message;
    } catch {}
    throw new Error(msg);
  }

  return await res.json();
}

/**
 * Phase 3: Delete analysis record and its corresponding Supabase Storage file.
 */
export async function deleteResumeAnalysis(analysisId: string): Promise<boolean> {
  const authHeaders = await getAuthHeaders();
  const res = await apiFetch(`${API_BASE}/api/resume/history/${analysisId}`, {
    method: "DELETE",
    headers: { ...authHeaders },
  });

  if (!res.ok) {
    let msg = `Deletion failed (HTTP ${res.status})`;
    try {
      const data = await res.json();
      if (data?.detail) msg = typeof data.detail === "string" ? data.detail : data.detail.message;
    } catch {}
    throw new Error(msg);
  }

  return true;
}

// ---------------------------------------------------------------------------
// Phase 4: Resume Series, Versions, Comparison, Growth & PDF Reports
// ---------------------------------------------------------------------------

/**
 * Phase 4: Fetch all resume series for the authenticated user.
 */
export async function listResumeSeries(): Promise<ResumeSeriesItem[]> {
  const authHeaders = await getAuthHeaders();
  const res = await apiFetch(`${API_BASE}/api/resume/series`, {
    method: "GET",
    headers: { ...authHeaders },
  });

  if (!res.ok) {
    let msg = `Failed to fetch resume series (HTTP ${res.status})`;
    try {
      const data = await res.json();
      if (data?.detail) msg = typeof data.detail === "string" ? data.detail : data.detail.message;
    } catch {}
    throw new Error(msg);
  }

  const json = await res.json();
  return json.items || [];
}

/**
 * Phase 4: Create a new resume series.
 */
export async function createResumeSeries(payload: {
  title: string;
  target_role?: string;
  description?: string;
}): Promise<ResumeSeriesItem> {
  const authHeaders = await getAuthHeaders();
  const res = await apiFetch(`${API_BASE}/api/resume/series`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...authHeaders,
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    let msg = `Failed to create resume series (HTTP ${res.status})`;
    try {
      const data = await res.json();
      if (data?.detail) msg = typeof data.detail === "string" ? data.detail : data.detail.message;
    } catch {}
    throw new Error(msg);
  }

  const json = await res.json();
  return json.data;
}

/**
 * Phase 4: Get resume series detail with all version records.
 */
export async function getResumeSeriesDetail(seriesId: string): Promise<ResumeSeriesDetail> {
  const authHeaders = await getAuthHeaders();
  const res = await apiFetch(`${API_BASE}/api/resume/series/${seriesId}`, {
    method: "GET",
    headers: { ...authHeaders },
  });

  if (!res.ok) {
    let msg = `Failed to fetch series details (HTTP ${res.status})`;
    try {
      const data = await res.json();
      if (data?.detail) msg = typeof data.detail === "string" ? data.detail : data.detail.message;
    } catch {}
    throw new Error(msg);
  }

  const json = await res.json();
  return json.data;
}

/**
 * Phase 4: Update an existing resume series.
 */
export async function updateResumeSeries(
  seriesId: string,
  payload: { title?: string; target_role?: string; description?: string }
): Promise<ResumeSeriesItem> {
  const authHeaders = await getAuthHeaders();
  const res = await apiFetch(`${API_BASE}/api/resume/series/${seriesId}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      ...authHeaders,
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    let msg = `Failed to update series (HTTP ${res.status})`;
    try {
      const data = await res.json();
      if (data?.detail) msg = typeof data.detail === "string" ? data.detail : data.detail.message;
    } catch {}
    throw new Error(msg);
  }

  const json = await res.json();
  return json.data;
}

/**
 * Phase 4: Delete a resume series and all its version analyses & storage files.
 */
export async function deleteResumeSeries(seriesId: string): Promise<boolean> {
  const authHeaders = await getAuthHeaders();
  const res = await apiFetch(`${API_BASE}/api/resume/series/${seriesId}`, {
    method: "DELETE",
    headers: { ...authHeaders },
  });

  if (!res.ok) {
    let msg = `Failed to delete series (HTTP ${res.status})`;
    try {
      const data = await res.json();
      if (data?.detail) msg = typeof data.detail === "string" ? data.detail : data.detail.message;
    } catch {}
    throw new Error(msg);
  }

  return true;
}

/**
 * Phase 4: Upload a new version to a specific resume series.
 */
export async function uploadSeriesVersion(
  seriesId: string,
  file: File,
  jobDescription?: string,
  targetRole?: string
): Promise<ResumeAnalyzeResponse> {
  const authHeaders = await getAuthHeaders();
  const formData = new FormData();
  formData.append("file", file);
  if (jobDescription && jobDescription.trim()) {
    formData.append("job_description", jobDescription.trim());
  }
  if (targetRole && targetRole.trim()) {
    formData.append("target_role", targetRole.trim());
  }

  const res = await apiFetch(`${API_BASE}/api/resume/series/${seriesId}/versions`, {
    method: "POST",
    headers: {
      ...authHeaders,
    },
    body: formData,
  });

  if (!res.ok) {
    let msg = `Failed to upload version (HTTP ${res.status})`;
    try {
      const data = await res.json();
      if (data?.detail) msg = typeof data.detail === "string" ? data.detail : data.detail.message;
    } catch {}
    throw new Error(msg);
  }

  return await res.json();
}

/**
 * Phase 4: Compare two resume analysis versions.
 */
export async function compareResumeVersions(
  olderId: string,
  newerId: string
): Promise<ResumeComparisonResponse> {
  const authHeaders = await getAuthHeaders();
  const res = await apiFetch(
    `${API_BASE}/api/resume/compare?older_id=${encodeURIComponent(olderId)}&newer_id=${encodeURIComponent(newerId)}`,
    {
      method: "GET",
      headers: { ...authHeaders },
    }
  );

  if (!res.ok) {
    let msg = `Failed to compare versions (HTTP ${res.status})`;
    try {
      const data = await res.json();
      if (data?.detail) msg = typeof data.detail === "string" ? data.detail : data.detail.message;
    } catch {}
    throw new Error(msg);
  }

  return await res.json();
}

/**
 * Phase 4: Get progress metrics, score trajectory, milestones, and weakness trends for a series.
 */
export async function getResumeSeriesProgress(seriesId: string): Promise<ResumeProgressResponse> {
  const authHeaders = await getAuthHeaders();
  const res = await apiFetch(`${API_BASE}/api/resume/series/${seriesId}/progress`, {
    method: "GET",
    headers: { ...authHeaders },
  });

  if (!res.ok) {
    let msg = `Failed to fetch series progress (HTTP ${res.status})`;
    try {
      const data = await res.json();
      if (data?.detail) msg = typeof data.detail === "string" ? data.detail : data.detail.message;
    } catch {}
    throw new Error(msg);
  }

  return await res.json();
}

/**
 * Phase 4: Download comprehensive 5-page PDF Diagnostic Report.
 */
export async function downloadAnalysisPdfReport(analysisId: string, filename?: string): Promise<void> {
  const authHeaders = await getAuthHeaders();
  const res = await apiFetch(`${API_BASE}/api/resume/history/${analysisId}/report`, {
    method: "GET",
    headers: { ...authHeaders },
  });

  if (!res.ok) {
    let msg = `Failed to generate PDF report (HTTP ${res.status})`;
    try {
      const data = await res.json();
      if (data?.detail) msg = typeof data.detail === "string" ? data.detail : data.detail.message;
    } catch {}
    throw new Error(msg);
  }

  const blob = await res.blob();
  const downloadUrl = window.URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = downloadUrl;
  a.download = filename || `SkillsCatalyst_Resume_Audit_${analysisId.slice(0, 8)}.pdf`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  window.URL.revokeObjectURL(downloadUrl);
}

// ---------------------------------------------------------------------------
// Phase 5: AI Resume Builder, Optimization & Export API Methods
// ---------------------------------------------------------------------------

/**
 * Phase 5: Create a new resume builder draft document.
 */
export async function createBuilderDocument(payload: {
  title?: string;
  selected_template?: string;
  structured_resume_data?: Record<string, any>;
  target_role?: string;
  resume_series_id?: string;
}): Promise<ResumeBuilderDocument> {
  const authHeaders = await getAuthHeaders();
  const res = await apiFetch(`${API_BASE}/api/resume/builder/documents`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...authHeaders },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    let msg = `Failed to create builder document (HTTP ${res.status})`;
    try {
      const data = await res.json();
      if (data?.detail) msg = typeof data.detail === "string" ? data.detail : data.detail.message;
    } catch {}
    throw new Error(msg);
  }

  const json = await res.json();
  return json.data;
}

/**
 * Phase 5: List all resume builder drafts for the current user.
 */
export async function listBuilderDocuments(): Promise<ResumeBuilderDocument[]> {
  const authHeaders = await getAuthHeaders();
  const res = await apiFetch(`${API_BASE}/api/resume/builder/documents`, {
    method: "GET",
    headers: { ...authHeaders },
  });

  if (!res.ok) {
    let msg = `Failed to list builder documents (HTTP ${res.status})`;
    try {
      const data = await res.json();
      if (data?.detail) msg = typeof data.detail === "string" ? data.detail : data.detail.message;
    } catch {}
    throw new Error(msg);
  }

  const json = await res.json();
  return json.items || [];
}

/**
 * Phase 5: Get a single resume builder draft by ID.
 */
export async function getBuilderDocument(documentId: string): Promise<ResumeBuilderDocument> {
  const authHeaders = await getAuthHeaders();
  const res = await apiFetch(`${API_BASE}/api/resume/builder/documents/${documentId}`, {
    method: "GET",
    headers: { ...authHeaders },
  });

  if (!res.ok) {
    let msg = `Failed to fetch builder document (HTTP ${res.status})`;
    try {
      const data = await res.json();
      if (data?.detail) msg = typeof data.detail === "string" ? data.detail : data.detail.message;
    } catch {}
    throw new Error(msg);
  }

  const json = await res.json();
  return json.data;
}

/**
 * Phase 5: Update a resume builder draft document.
 */
export async function updateBuilderDocument(
  documentId: string,
  payload: {
    title?: string;
    selected_template?: string;
    structured_resume_data?: Record<string, any>;
    target_role?: string;
    resume_series_id?: string;
  }
): Promise<ResumeBuilderDocument> {
  const authHeaders = await getAuthHeaders();
  const res = await apiFetch(`${API_BASE}/api/resume/builder/documents/${documentId}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json", ...authHeaders },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    let msg = `Failed to update builder document (HTTP ${res.status})`;
    try {
      const data = await res.json();
      if (data?.detail) msg = typeof data.detail === "string" ? data.detail : data.detail.message;
    } catch {}
    throw new Error(msg);
  }

  const json = await res.json();
  return json.data;
}

/**
 * Phase 5: Delete a resume builder draft document.
 */
export async function deleteBuilderDocument(documentId: string): Promise<boolean> {
  const authHeaders = await getAuthHeaders();
  const res = await apiFetch(`${API_BASE}/api/resume/builder/documents/${documentId}`, {
    method: "DELETE",
    headers: { ...authHeaders },
  });

  if (!res.ok) {
    let msg = `Failed to delete builder document (HTTP ${res.status})`;
    try {
      const data = await res.json();
      if (data?.detail) msg = typeof data.detail === "string" ? data.detail : data.detail.message;
    } catch {}
    throw new Error(msg);
  }

  return true;
}

/**
 * Phase 5: Import an existing historical analysis into a structured builder document.
 */
export async function importResumeFromAnalysis(
  analysisId: string,
  selectedTemplate: string = "sb2nov"
): Promise<ResumeBuilderDocument> {
  const authHeaders = await getAuthHeaders();
  const res = await apiFetch(`${API_BASE}/api/resume/builder/import/${analysisId}`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...authHeaders },
    body: JSON.stringify({ selected_template: selectedTemplate }),
  });

  if (!res.ok) {
    let msg = `Failed to import resume analysis (HTTP ${res.status})`;
    try {
      const data = await res.json();
      if (data?.detail) msg = typeof data.detail === "string" ? data.detail : data.detail.message;
    } catch {}
    throw new Error(msg);
  }

  const json = await res.json();
  return json.data;
}

/**
 * Phase 5: Save an immutable version snapshot from a builder document and run ATS re-evaluation.
 */
export async function saveBuilderVersion(
  documentId: string,
  payload: {
    change_summary?: string;
    run_ats_eval?: boolean;
    job_description?: string;
  }
): Promise<ResumeBuilderVersion> {
  const authHeaders = await getAuthHeaders();
  const res = await apiFetch(`${API_BASE}/api/resume/builder/documents/${documentId}/save-version`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...authHeaders },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    let msg = `Failed to save resume version (HTTP ${res.status})`;
    try {
      const data = await res.json();
      if (data?.detail) msg = typeof data.detail === "string" ? data.detail : data.detail.message;
    } catch {}
    throw new Error(msg);
  }

  const json = await res.json();
  return json.data;
}

/**
 * Phase 5: List saved version snapshots for a builder document.
 */
export async function listBuilderVersions(documentId: string): Promise<ResumeBuilderVersion[]> {
  const authHeaders = await getAuthHeaders();
  const res = await apiFetch(`${API_BASE}/api/resume/builder/documents/${documentId}/versions`, {
    method: "GET",
    headers: { ...authHeaders },
  });

  if (!res.ok) {
    let msg = `Failed to list versions (HTTP ${res.status})`;
    try {
      const data = await res.json();
      if (data?.detail) msg = typeof data.detail === "string" ? data.detail : data.detail.message;
    } catch {}
    throw new Error(msg);
  }

  const json = await res.json();
  return json.items || [];
}

/**
 * Phase 5: Improve a resume bullet point using AI with anti-hallucination verification.
 */
export async function improveBulletWithAI(
  bullet: string,
  action: "improve" | "concise" | "strong_verbs" | "technical_clarity" = "improve",
  roleContext?: string
): Promise<AIImproveBulletResponse> {
  const authHeaders = await getAuthHeaders();
  const res = await apiFetch(`${API_BASE}/api/resume/builder/ai/improve-bullet`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...authHeaders },
    body: JSON.stringify({ bullet, action, role_context: roleContext }),
  });

  if (!res.ok) {
    let msg = `AI bullet improvement failed (HTTP ${res.status})`;
    try {
      const data = await res.json();
      if (data?.detail) msg = typeof data.detail === "string" ? data.detail : data.detail.message;
    } catch {}
    throw new Error(msg);
  }

  const json = await res.json();
  return json.data;
}

/**
 * Phase 5: Improve a professional summary using AI.
 */
export async function improveSummaryWithAI(
  summary: string,
  targetRole?: string,
  experienceLevel?: string
): Promise<{ original_text: string; suggestions: string[]; improvement_reason: string }> {
  const authHeaders = await getAuthHeaders();
  const res = await apiFetch(`${API_BASE}/api/resume/builder/ai/improve-summary`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...authHeaders },
    body: JSON.stringify({ summary, target_role: targetRole, experience_level: experienceLevel }),
  });

  if (!res.ok) {
    let msg = `AI summary improvement failed (HTTP ${res.status})`;
    try {
      const data = await res.json();
      if (data?.detail) msg = typeof data.detail === "string" ? data.detail : data.detail.message;
    } catch {}
    throw new Error(msg);
  }

  const json = await res.json();
  return json.data;
}

/**
 * Phase 5: Improve project descriptions using AI.
 */
export async function improveProjectWithAI(
  projectName: string,
  description: string,
  technologies: string = ""
): Promise<{ project_name: string; original_text: string; suggestions: string[]; improvement_reason: string }> {
  const authHeaders = await getAuthHeaders();
  const res = await apiFetch(`${API_BASE}/api/resume/builder/ai/improve-project`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...authHeaders },
    body: JSON.stringify({ project_name: projectName, description, technologies }),
  });

  if (!res.ok) {
    let msg = `AI project improvement failed (HTTP ${res.status})`;
    try {
      const data = await res.json();
      if (data?.detail) msg = typeof data.detail === "string" ? data.detail : data.detail.message;
    } catch {}
    throw new Error(msg);
  }

  const json = await res.json();
  return json.data;
}

/**
 * Phase 5: Get structured quality feedback for an achievement bullet.
 */
export async function getWritingFeedback(bullet: string): Promise<AIWritingFeedbackResponse> {
  const authHeaders = await getAuthHeaders();
  const res = await apiFetch(`${API_BASE}/api/resume/builder/ai/writing-feedback`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...authHeaders },
    body: JSON.stringify({ bullet }),
  });

  if (!res.ok) {
    let msg = `Writing feedback failed (HTTP ${res.status})`;
    try {
      const data = await res.json();
      if (data?.detail) msg = typeof data.detail === "string" ? data.detail : data.detail.message;
    } catch {}
    throw new Error(msg);
  }

  const json = await res.json();
  return json.data;
}

/**
 * Phase 5: Extract structured requirements from a job description text.
 */
export async function analyzeJobDescription(
  jobDescription: string,
  targetRole?: string,
  experienceLevel?: string
): Promise<any> {
  const authHeaders = await getAuthHeaders();
  const res = await apiFetch(`${API_BASE}/api/resume/builder/optimize/analyze-jd`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...authHeaders },
    body: JSON.stringify({ job_description: jobDescription, target_role: targetRole, experience_level: experienceLevel }),
  });

  if (!res.ok) {
    let msg = `Job description analysis failed (HTTP ${res.status})`;
    try {
      const data = await res.json();
      if (data?.detail) msg = typeof data.detail === "string" ? data.detail : data.detail.message;
    } catch {}
    throw new Error(msg);
  }

  const json = await res.json();
  return json.data;
}

/**
 * Phase 5: Create and persist a job-specific resume optimization session.
 */
export async function createOptimizationSession(payload: {
  job_description: string;
  document_id?: string;
  job_title?: string;
  company_name?: string;
  experience_level?: string;
  resume_data?: Record<string, any>;
}): Promise<JobOptimizationSession> {
  const authHeaders = await getAuthHeaders();
  const res = await apiFetch(`${API_BASE}/api/resume/builder/optimize/session`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...authHeaders },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    let msg = `Optimization session creation failed (HTTP ${res.status})`;
    try {
      const data = await res.json();
      if (data?.detail) msg = typeof data.detail === "string" ? data.detail : data.detail.message;
    } catch {}
    throw new Error(msg);
  }

  const json = await res.json();
  return json.data;
}

/**
 * Phase 5: Download resume as Microsoft Word (.docx).
 */
export async function downloadResumeDocx(
  structuredResumeData: Record<string, any>,
  templateId: string = "sb2nov",
  filename?: string
): Promise<void> {
  const authHeaders = await getAuthHeaders();
  const res = await apiFetch(`${API_BASE}/api/resume/builder/export/docx`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...authHeaders },
    body: JSON.stringify({ structured_resume_data: structuredResumeData, template_id: templateId, filename }),
  });

  if (!res.ok) {
    let msg = `DOCX download failed (HTTP ${res.status})`;
    try {
      const data = await res.json();
      if (data?.detail) msg = typeof data.detail === "string" ? data.detail : data.detail.message;
    } catch {}
    throw new Error(msg);
  }

  const blob = await res.blob();
  const downloadUrl = window.URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = downloadUrl;
  const safeName = filename || (structuredResumeData.fullName ? `${structuredResumeData.fullName.replace(/\s+/g, '_')}_Resume` : "Resume");
  a.download = `${safeName}.docx`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  window.URL.revokeObjectURL(downloadUrl);
}

/**
 * Phase 5: Download resume as vector PDF from backend generator.
 */
export async function downloadResumePdf(
  structuredResumeData: Record<string, any>,
  templateId: string = "sb2nov",
  filename?: string
): Promise<void> {
  const authHeaders = await getAuthHeaders();
  const res = await apiFetch(`${API_BASE}/api/resume/builder/export/pdf`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...authHeaders },
    body: JSON.stringify({ structured_resume_data: structuredResumeData, template_id: templateId, filename }),
  });

  if (!res.ok) {
    let msg = `PDF download failed (HTTP ${res.status})`;
    try {
      const data = await res.json();
      if (data?.detail) msg = typeof data.detail === "string" ? data.detail : data.detail.message;
    } catch {}
    throw new Error(msg);
  }

  const blob = await res.blob();
  const downloadUrl = window.URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = downloadUrl;
  const safeName = filename || (structuredResumeData.fullName ? `${structuredResumeData.fullName.replace(/\s+/g, '_')}_Resume` : "Resume");
  a.download = `${safeName}.pdf`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  window.URL.revokeObjectURL(downloadUrl);
}
