/**
 * frontend/hooks/useStudentEvents.ts
 * TanStack React Query hook for student events and hackathons.
 * Pairs with backend Redis caching to provide instant frame-zero rendering
 * and eliminate visual flickering/reloads during page transitions.
 */

import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { fetchStudentEvents, EventFilterParams, EventListResponse } from "@/lib/api/events";

export function useStudentEvents(params?: EventFilterParams) {
  const categoryKey = params?.category ?? "all";
  const hackathonKey = params?.is_hackathon !== undefined ? String(params.is_hackathon) : "all";
  const searchKey = params?.search?.trim() ?? "";

  return useQuery<EventListResponse, Error, EventListResponse>({
    queryKey: ["events", "student", categoryKey, hackathonKey, searchKey],
    queryFn: (): Promise<EventListResponse> => fetchStudentEvents(params),
    staleTime: 10 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
    retry: 1,
    placeholderData: keepPreviousData,
  });
}
