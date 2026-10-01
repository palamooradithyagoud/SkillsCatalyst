"use client";

import { useState, useEffect, useCallback } from "react";

const STORAGE_KEY = "skillscatalyst_watched_tech_stories_v1";

export function useWatchedStories() {
  const [watchedIds, setWatchedIds] = useState<Set<string>>(new Set());
  const [isLoaded, setIsLoaded] = useState(false);

  // Initialize from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          setWatchedIds(new Set(parsed));
        }
      }
    } catch (err) {
      console.warn("Failed to load watched tech stories from localStorage", err);
    } finally {
      setIsLoaded(true);
    }
  }, []);

  // Listen to custom cross-component events for instant sync without reload
  useEffect(() => {
    const handleStoryWatchedEvent = (e: Event) => {
      const customEvent = e as CustomEvent<{ storyId: string }>;
      const id = customEvent.detail?.storyId;
      if (id) {
        setWatchedIds((prev) => {
          if (prev.has(id)) return prev;
          const next = new Set(prev);
          next.add(id);
          return next;
        });
      }
    };

    window.addEventListener("tech-story-watched", handleStoryWatchedEvent);
    return () => {
      window.removeEventListener("tech-story-watched", handleStoryWatchedEvent);
    };
  }, []);

  const markStoryAsWatched = useCallback((storyId: string) => {
    if (!storyId) return;

    setWatchedIds((prev) => {
      if (prev.has(storyId)) return prev;
      const next = new Set(prev);
      next.add(storyId);

      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(Array.from(next)));
      } catch (err) {
        console.warn("Failed to persist watched tech story to localStorage", err);
      }

      return next;
    });

    // Notify other components on the page
    if (typeof window !== "undefined") {
      window.dispatchEvent(
        new CustomEvent("tech-story-watched", { detail: { storyId } })
      );
    }
  }, []);

  const isStoryWatched = useCallback(
    (storyId: string) => watchedIds.has(storyId),
    [watchedIds]
  );

  return {
    watchedIds,
    isLoaded,
    markStoryAsWatched,
    isStoryWatched,
  };
}
