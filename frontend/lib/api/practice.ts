import { API_BASE, apiFetch, getAuthHeaders } from "./client";

export interface PracticeQuestion {
  id: number;
  title: string;
  url: string;
  difficulty: "Easy" | "Medium" | "Hard" | string;
  acceptance: string;
  frequency: string;
}

export interface CompanyQuestionsResult {
  company: string;
  period: string;
  total: number;
  offset: number;
  limit: number;
  questions: PracticeQuestion[];
}

export type QuestionPeriod =
  | "all"
  | "six-months"
  | "three-months"
  | "thirty-days"
  | "more-than-six-months";

/** Fetches the sorted list of all 663 company slugs. */
export async function fetchPracticeCompanies(): Promise<string[]> {
  try {
    const authHeaders = await getAuthHeaders();
    const res = await apiFetch(`${API_BASE}/api/practice/companies`, { headers: { ...authHeaders }, cache: "no-store" });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    return data.companies ?? [];
  } catch (e) {
    console.warn("Failed to fetch practice companies:", e);
    return [];
  }
}

/** Fetches questions for a specific company with optional filters. */
export async function fetchCompanyQuestions(
  company: string,
  period: QuestionPeriod = "all",
  difficulty?: string,
  search?: string,
  limit = 100,
  offset = 0,
): Promise<CompanyQuestionsResult | null> {
  try {
    const params = new URLSearchParams({ period, limit: String(limit), offset: String(offset) });
    if (difficulty) params.set("difficulty", difficulty);
    if (search) params.set("search", search);

    const authHeaders = await getAuthHeaders();
    const res = await apiFetch(
      `${API_BASE}/api/practice/questions/${encodeURIComponent(company)}?${params}`,
      { headers: { ...authHeaders }, cache: "no-store" },
    );
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (e) {
    console.warn(`Failed to fetch questions for '${company}':`, e);
    return null;
  }
}
