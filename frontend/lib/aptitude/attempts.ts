import { supabase } from "@/lib/supabase";
import { QuestionAttemptResult, QuestionAttempt } from "@/types/aptitude";

/**
 * Submit an answer attempt to Supabase
 * Validates the answer on the server, records the attempt, updates topic progress,
 * and securely returns the explanation and correctness.
 */
export async function submitQuestionAttempt(
  questionId: string,
  selectedOptionId: string,
  timeTakenSeconds: number = 0
): Promise<QuestionAttemptResult | null> {
  const { data, error } = await supabase.rpc("submit_question_attempt", {
    p_question_id: questionId,
    p_selected_option_id: selectedOptionId,
    p_time_taken_seconds: timeTakenSeconds,
  });

  if (error) {
    console.error("Error submitting question attempt:", error);
    return null;
  }

  return data as QuestionAttemptResult;
}

/**
 * Get all attempts made by the authenticated user for a specific topic
 */
export async function getUserAttemptsForTopic(topicId: string): Promise<QuestionAttempt[]> {
  const { data: authData } = await supabase.auth.getUser();
  const userId = authData.user?.id;
  if (!userId) return [];

  const { data, error } = await supabase
    .from("question_attempts")
    .select(`
      id,
      user_id,
      question_id,
      selected_option_id,
      is_correct,
      time_taken_seconds,
      attempted_at,
      questions!inner(topic_id, legacy_id)
    `)
    .eq("user_id", userId)
    .eq("questions.topic_id", topicId);

  if (error) {
    console.error("Error fetching user attempts:", error);
    return [];
  }

  return (data as unknown as QuestionAttempt[]) || [];
}

/**
 * Record an attempt from PlacementPrepModal using legacy_id (1..N) and option index (0..3)
 */
export async function recordLegacyAttempt(
  topicName: string,
  legacyId: number,
  optionIdx: number,
  _isCorrect: boolean,
  timeSpentSec: number
): Promise<QuestionAttemptResult | null> {
  try {
    const { data: authData } = await supabase.auth.getUser();
    const userId = authData.user?.id;
    if (!userId) return null;

    // Look up question by topic name and legacy_id
    const { data: qData } = await supabase
      .from("questions")
      .select("id, topic_id, topics!inner(name), question_options(id, display_order)")
      .eq("legacy_id", legacyId)
      .eq("topics.name", topicName)
      .maybeSingle();

    if (!qData) return null;

    const opt = (qData.question_options as any[])?.find((o) => o.display_order === optionIdx);
    if (!opt) return null;

    // Securely invoke server RPC
    return await submitQuestionAttempt(qData.id, opt.id, timeSpentSec);
  } catch (err) {
    console.warn("Failed to record legacy attempt to Supabase via RPC:", err);
    return null;
  }
}

/**
 * Get saved answers map { [legacy_id]: option_index } and times { [legacy_id]: seconds }
 */
export async function getLegacyTopicAttempts(topicName: string): Promise<{
  answers: Record<number, number>;
  times: Record<number, number>;
}> {
  try {
    const { data: authData } = await supabase.auth.getUser();
    const userId = authData.user?.id;
    if (!userId) return { answers: {}, times: {} };

    const { data, error } = await supabase
      .from("question_attempts")
      .select(`
        time_taken_seconds,
        questions!inner(legacy_id, topics!inner(name)),
        question_options(display_order)
      `)
      .eq("user_id", userId)
      .eq("questions.topics.name", topicName);

    if (error || !data) return { answers: {}, times: {} };

    const answers: Record<number, number> = {};
    const times: Record<number, number> = {};

    data.forEach((row: any) => {
      const legId = row.questions?.legacy_id;
      const optIdx = row.question_options?.display_order;
      if (legId !== undefined && optIdx !== undefined) {
        answers[legId] = optIdx;
        times[legId] = row.time_taken_seconds || 0;
      }
    });

    return { answers, times };
  } catch {
    return { answers: {}, times: {} };
  }
}
