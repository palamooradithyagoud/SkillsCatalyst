/**
 * frontend/hooks/useStudentTechNews.ts
 * TanStack React Query hook for student tech news feed.
 * Pairs with backend Redis caching to provide instant frame-zero rendering
 * and eliminate visual flickering/reloads during page transitions.
 */

import { useQuery } from "@tanstack/react-query";
import { fetchStudentTechNews, StudentTechNewsFeedResponse } from "@/lib/api/tech_news";

export function useStudentTechNews(search?: string) {
  const searchKey = search?.trim() ?? "";

  return useQuery<StudentTechNewsFeedResponse>({
    queryKey: ["technews", "student", searchKey],
    queryFn: () => fetchStudentTechNews(search),
    staleTime: 5 * 60 * 1000, // 5 minutes fresh client cache
  });
}
