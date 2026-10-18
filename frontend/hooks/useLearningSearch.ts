"use client";

import { useState, useEffect, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { searchSkill, SearchResult } from "@/lib/api";
import {
  Lang,
  DEFAULT_LANGUAGE,
  STORAGE_KEY_LANGUAGE,
  isValidLanguage,
  getStoredLanguage,
  setStoredLanguage,
  validateClientSkillQuery,
} from "@/lib/learning/searchValidation";

export function useLearningSearch() {
  const [query, setQuery] = useState("");
  const [language, setLanguageState] = useState<Lang>(() => {
    if (typeof window !== "undefined") {
      return getStoredLanguage();
    }
    return DEFAULT_LANGUAGE;
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [hasSearched, setHasSearched] = useState(false);
  const [queryError, setQueryError] = useState<string | null>(null);

  // ── Auto-search from URL query param & restore / sync persistent language
  useEffect(() => {
    if (typeof window !== "undefined") {
      // 1. Sync stored language preference if different from initial state
      const saved = getStoredLanguage();
      setLanguageState((prev) => (prev !== saved ? saved : prev));

      // 2. Parse URL search parameter
      const params = new URLSearchParams(window.location.search);
      const qParam = params.get("query") || params.get("topic") || params.get("q");
      if (qParam && qParam.trim()) {
        const cleanQ = qParam.trim();
        setQuery(cleanQ);
        setSearchTerm(cleanQ);
        setHasSearched(true);
      }

      // 3. Cross-tab synchronization via storage event
      const handleStorage = (e: StorageEvent) => {
        if (e.key === STORAGE_KEY_LANGUAGE) {
          const current = getStoredLanguage();
          setLanguageState(current);
        }
      };

      // 4. In-tab synchronization via custom event
      const handleCustomChange = (e: Event) => {
        const ce = e as CustomEvent<Lang>;
        if (ce.detail && isValidLanguage(ce.detail)) {
          setLanguageState(ce.detail);
        }
      };

      window.addEventListener("storage", handleStorage);
      window.addEventListener("sc_language_change", handleCustomChange);

      return () => {
        window.removeEventListener("storage", handleStorage);
        window.removeEventListener("sc_language_change", handleCustomChange);
      };
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

  const setLanguage = useCallback((newLang: Lang) => {
    if (isValidLanguage(newLang)) {
      setLanguageState(newLang);
      setStoredLanguage(newLang);
      if (typeof window !== "undefined") {
        try {
          window.dispatchEvent(new CustomEvent("sc_language_change", { detail: newLang }));
        } catch {}
      }
    }
  }, []);

  const handleSearch = (overrideQuery?: string) => {
    const raw = typeof overrideQuery === "string" ? overrideQuery : query;
    const trimmed = raw.trim();
    if (!trimmed) return;

    const validation = validateClientSkillQuery(trimmed);
    if (!validation.isValid) {
      setQueryError(validation.error || "Please enter a valid skill query.");
      return;
    }

    setQuery(trimmed);
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
