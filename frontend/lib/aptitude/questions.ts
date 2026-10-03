import { supabase } from "@/lib/supabase";
import { QuestionDTO, LegacyPlacementQuestion } from "@/types/aptitude";
import { aptitudeCache } from "@/lib/cache/aptitudeCache";
import { getAllTopicsMap } from "./topics";

/**
 * Fetch questions for a topic securely from Supabase
 * Uses the security-definer RPC `get_topic_questions` which omits `is_correct` from options.
 */
export async function getQuestionsByTopicId(topicId: string): Promise<QuestionDTO[]> {
  const cacheKey = `aptitude_questions_${topicId}`;
  const cached = aptitudeCache.get<QuestionDTO[]>(cacheKey);
  if (cached) return cached;

  const { data, error } = await supabase.rpc("get_topic_questions", {
    p_topic_id: topicId,
  });

  if (error) {
    console.error(`Error fetching questions for topic ${topicId}:`, error);
    return [];
  }

  const result = (data as QuestionDTO[]) || [];
  aptitudeCache.set(cacheKey, result);
  return result;
}

/**
 * Fetch questions by topic name (e.g. "Problems on Trains")
 */
export async function getQuestionsByTopicName(topicName: string): Promise<QuestionDTO[]> {
  const topicMap = await getAllTopicsMap();
  const topic = topicMap[topicName];
  if (!topic) return [];
  return getQuestionsByTopicId(topic.id);
}

/**
 * Converts Supabase QuestionDTOs into LegacyPlacementQuestion format
 * for zero-regression compatibility with PlacementPrepModal.
 */
export function toLegacyQuestions(questions: QuestionDTO[]): LegacyPlacementQuestion[] {
  return questions.map((q) => {
    const formattedOptions = (q.options || []).map((o) => {
      const prefix = `${o.key.toLowerCase()}) `;
      return o.text.startsWith(prefix) ? o.text : `${prefix}${o.text}`;
    });

    return {
      id: q.legacy_id,
      dbId: q.id,
      question: `${q.legacy_id}. ${q.question_text}`,
      options: formattedOptions,
      dbOptions: q.options,
    };
  });
}
