/**
 * Pure helper functions for the Practice module:
 * Company name normalization, LeetCode URL generation, solved calculations, and filtering.
 */

import { SPECIAL_COMPANY_MAP, PracticeStatus } from "@/data/practice/constants";
import { NODE_PROBLEM_IDS } from "@/data/practice/dsaTreeData";

// Helper for formatting company slug into clean display name
export function formatCompanyName(slug: string): string {
  if (!slug) return "";
  const lower = slug.toLowerCase().trim();
  if (SPECIAL_COMPANY_MAP[lower]) {
    return SPECIAL_COMPANY_MAP[lower];
  }
  return lower
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

// Generate canonical LeetCode problem URL from question object
export function getLeetCodeUrl(q: { url?: string; title: string }): string {
  if (q.url && q.url.startsWith("http")) return q.url;
  const slug = q.title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return `https://leetcode.com/problems/${slug}`;
}

// Compute per-node solve percentage from individual problem IDs for DSA tree
export function calculateNodeProgress(
  nodeId: string,
  drawerSolved: Record<number, boolean>
): { solved: number; total: number; pct: number } {
  const ids = NODE_PROBLEM_IDS[nodeId] ?? [];
  if (!ids.length) return { solved: 0, total: 0, pct: 0 };
  const solved = ids.filter((id) => !!drawerSolved[id]).length;
  return {
    solved,
    total: ids.length,
    pct: Math.round((solved / ids.length) * 100),
  };
}

// Calculate count of solved questions in a loaded list for a company
export function calculateCompanySolvedCount(
  questions: Array<{ id: number; title: string }>,
  solvedState: Record<string, boolean>,
  company: string
): number {
  return questions.reduce((acc, q) => {
    const key = `q_${company}_${q.id}_${q.title}`;
    const isDone = !!solvedState[key] || !!solvedState[q.id.toString()];
    return isDone ? acc + 1 : acc;
  }, 0);
}

// Calculate percentage of solved questions
export function calculateCompanyProgressPercent(
  solvedCount: number,
  totalCount: number
): number {
  return totalCount > 0 ? Math.round((solvedCount / totalCount) * 100) : 0;
}

// Filter questions by Status (All vs Unsolved vs Completed)
export function filterQuestionsByStatus<T extends { id: number; title: string }>(
  questions: T[],
  selectedStatus: PracticeStatus,
  solvedState: Record<string, boolean>,
  company: string
): T[] {
  if (selectedStatus === "All") return questions;
  return questions.filter((q) => {
    const key = `q_${company}_${q.id}_${q.title}`;
    const isDone = !!solvedState[key] || !!solvedState[q.id.toString()];
    return selectedStatus === "Completed" ? isDone : !isDone;
  });
}

// Filter company list by user search input
export function filterCompaniesList(
  companiesList: string[],
  companySearchInput: string
): string[] {
  if (!companySearchInput) return companiesList;
  const term = companySearchInput.toLowerCase().trim();
  return companiesList.filter(
    (c) => c.toLowerCase().includes(term) || formatCompanyName(c).toLowerCase().includes(term)
  );
}
