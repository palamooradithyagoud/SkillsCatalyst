"use client";

import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { searchSkill, SearchResult } from "@/lib/api";
import { Lang, validateClientSkillQuery } from "@/lib/learning/searchValidation";

export function useLearningSearch() {
  const [query, setQuery] = useState("");
  const [language, setLanguage] = useState<Lang>("english");
  const [searchTerm, setSearchTerm] = useState("");
  const [hasSearched, setHasSearched] = useState(false);
  const [queryError, setQueryError] = useState<string | null>(null);

  // ── Auto-search from URL query param (e.g. /learning?query=Python)
  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const qParam = params.get("query") || params.get("topic") || params.get("q");
      if (qParam && qParam.trim()) {
        const cleanQ = qParam.trim();
        setQuery(cleanQ);
        setSearchTerm(cleanQ);
        setHasSearched(true);
      }
    }
  }, []);

  const {
    data: searchData,
    isFetching: searching,
    refetch: doSearch,
  } = useQuery<SearchResult>({
    queryKey: ["learning-search", searchTerm, language],
    queryFn: () => searchSkill(searchTerm, "all", language),
    enabled: !!searchTerm,
    staleTime: 5 * 60 * 1000,
  });

  const handleSearch = () => {
    const trimmed = query.trim();
    if (!trimmed) return;

    const validation = validateClientSkillQuery(trimmed);
    if (!validation.isValid) {
      setQueryError(validation.error || "Please enter a valid skill query.");
      return;
    }

    setQueryError(null);
    setSearchTerm(trimmed);
    setHasSearched(true);
    doSearch();
  };

  const handleSelectSuggestion = (s: string) => {
    setQuery(s);
    setQueryError(null);
  };

  return {
    query,
    setQuery,
    language,
    setLanguage,
    searchTerm,
    hasSearched,
    queryError,
    setQueryError,
    searchData,
    searching,
    handleSearch,
    handleSelectSuggestion,
  };
}
