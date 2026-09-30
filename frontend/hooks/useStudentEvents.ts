/**
 * frontend/hooks/useStudentEvents.ts
 * TanStack React Query hook for student events and hackathons.
 * Pairs with backend Redis caching to provide instant frame-zero rendering
 * and eliminate visual flickering/reloads during page transitions.
 */

import { useQuery } from "@tanstack/react-query";
import { fetchStudentEvents, EventFilterParams, EventListResponse } from "@/lib/api/events";

export function useStudentEvents(params?: EventFilterParams) {
  const categoryKey = params?.category ?? "all";
  const hackathonKey = params?.is_hackathon !== undefined ? String(params.is_hackathon) : "all";
  const searchKey = params?.search?.trim() ?? "";

  return useQuery<EventListResponse>({
    queryKey: ["events", "student", categoryKey, hackathonKey, searchKey],
    queryFn: () => fetchStudentEvents(params),
    staleTime: 5 * 60 * 1000, // 5 minutes fresh client cache
  });
}
