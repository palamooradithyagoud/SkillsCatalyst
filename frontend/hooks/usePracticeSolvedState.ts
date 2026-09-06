"use client";

import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase";

export function usePracticeSolvedState(userId?: string) {
  const [solvedState, setSolvedState] = useState<Record<string, boolean>>({});
  const [drawerSolved, setDrawerSolved] = useState<Record<number, boolean>>({});

  // Load solved state from localStorage & Hydrate live from Supabase DB on mount
  useEffect(() => {
    if (!userId) {
      setSolvedState({});
      setDrawerSolved({});
      return;
    }

    try {
      const savedSolved = localStorage.getItem(`skillscatalyst_solved_questions_${userId}`);
      if (savedSolved) {
        setSolvedState(JSON.parse(savedSolved));
      }
      const savedDrawer = localStorage.getItem(`skillscatalyst_drawer_solved_${userId}`);
      if (savedDrawer) {
        setDrawerSolved(JSON.parse(savedDrawer));
      }
    } catch (e) {
      console.warn("Failed to read solved state from localStorage", e);
    }

    async function syncFromSupabase() {
      try {
        const { data: sessionData } = await supabase.auth.getSession();
        if (sessionData?.session?.user?.id !== userId) return;

        const { data: leetcodeData } = await supabase
          .from("leetcode_progress")
          .select("*")
          .eq("user_id", userId);

        const { data: roadmapData } = await supabase
          .from("roadmap_progress")
          .select("*")
          .eq("user_id", userId);

        const fetchedSolvedState: Record<string, boolean> = {};
        const fetchedDrawerState: Record<number, boolean> = {};

        if (leetcodeData) {
          leetcodeData.forEach((item: any) => {
            const isSolved = item.status === "solved";
            const qIdStr = item.question_id ? item.question_id.toString() : "";

            if (qIdStr) {
              fetchedSolvedState[qIdStr] = isSolved;
              const qIdNum = Number(item.question_id);
              if (!isNaN(qIdNum)) {
                fetchedDrawerState[qIdNum] = isSolved;
              }
            }
            if (item.company_slug && item.question_id && item.question_title) {
              const key = `q_${item.company_slug}_${item.question_id}_${item.question_title}`;
              fetchedSolvedState[key] = isSolved;
            }
          });
        }

        if (roadmapData) {
          roadmapData.forEach((item: any) => {
            if (item.status === "completed" && item.node_id) {
              fetchedSolvedState[item.node_id] = true;
            }
          });
        }

        setSolvedState((prev) => ({ ...prev, ...fetchedSolvedState }));
        setDrawerSolved((prev) => ({ ...prev, ...fetchedDrawerState }));
      } catch (err) {
        console.warn("Supabase initial sync error:", err);
      }
    }

    syncFromSupabase();
  }, [userId]);

  // Toggle individual problem in Foundation drawer & sync directly to Supabase + localStorage
  const toggleDrawerProblem = useCallback(
    async (
      problemId: number,
      details?: { title: string; difficulty: string; pattern: string }
    ) => {
      if (!userId) return;
      const isCurrentlyDone = !!drawerSolved[problemId];
      const newDoneState = !isCurrentlyDone;

      // 1. Local state update
      setDrawerSolved((prev) => {
        const updated = { ...prev, [problemId]: newDoneState };
        try {
          localStorage.setItem(`skillscatalyst_drawer_solved_${userId}`, JSON.stringify(updated));
        } catch (e) {}
        return updated;
      });

      setSolvedState((prev) => {
        const updated = { ...prev, [problemId.toString()]: newDoneState };
        try {
          localStorage.setItem(`skillscatalyst_solved_questions_${userId}`, JSON.stringify(updated));
        } catch (e) {}
        return updated;
      });

      // 2. Supabase DB Persistence
      try {
        if (newDoneState) {
          await supabase.from("leetcode_progress").upsert(
            {
              user_id: userId,
              company_slug: "foundation",
              question_id: problemId,
              question_title: details?.title || `Problem ${problemId}`,
              difficulty: details?.difficulty || "Easy",
              status: "solved",
              solved_at: new Date().toISOString(),
            },
            { onConflict: "user_id,company_slug,question_id" }
          );
        } else {
          await supabase
            .from("leetcode_progress")
            .delete()
            .eq("user_id", userId)
            .eq("company_slug", "foundation")
            .eq("question_id", problemId);
        }
      } catch (err) {
        console.warn("Supabase foundation problem sync warning:", err);
      }
    },
    [userId, drawerSolved]
  );

  const toggleSolved = useCallback(
    async (
      key: string,
      qDetails?: {
        company: string;
        id: number;
        title: string;
        difficulty: string;
        acceptance?: string;
        frequency?: string;
      }
    ) => {
      const isCurrentlyDone = !!solvedState[key];
      const newDoneState = !isCurrentlyDone;

      setSolvedState((prev) => {
        const updated = { ...prev, [key]: newDoneState };
        try {
          localStorage.setItem(`skillscatalyst_solved_questions_${userId}`, JSON.stringify(updated));
        } catch (e) {
          console.warn("Failed to save solved question state", e);
        }
        return updated;
      });

      // Asynchronous background persistence into Supabase tables
      try {
        if (qDetails) {
          if (newDoneState) {
            await supabase.from("leetcode_progress").upsert(
              {
                user_id: userId,
                company_slug: qDetails.company,
                question_id: qDetails.id,
                question_title: qDetails.title,
                difficulty: qDetails.difficulty,
                acceptance: qDetails.acceptance || "",
                frequency: qDetails.frequency || "",
                status: "solved",
                solved_at: new Date().toISOString(),
              },
              { onConflict: "user_id,company_slug,question_id" }
            );
          } else {
            await supabase
              .from("leetcode_progress")
              .delete()
              .eq("user_id", userId)
              .eq("company_slug", qDetails.company)
              .eq("question_id", qDetails.id);
          }
        } else {
          if (newDoneState) {
            await supabase.from("roadmap_progress").upsert(
              {
                user_id: userId,
                roadmap_id: "dsa-beginner",
                node_id: key,
                node_title: key,
                status: "completed",
                completed_at: new Date().toISOString(),
              },
              { onConflict: "user_id,roadmap_id,node_id" }
            );
          } else {
            await supabase
              .from("roadmap_progress")
              .delete()
              .eq("user_id", userId)
              .eq("roadmap_id", "dsa-beginner")
              .eq("node_id", key);
          }
        }
      } catch (err) {
        console.warn("Supabase background sync error:", err);
      }
    },
    [userId, solvedState]
  );

  return {
    solvedState,
    drawerSolved,
    toggleSolved,
    toggleDrawerProblem,
  };
}
