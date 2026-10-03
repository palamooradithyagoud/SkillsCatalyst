import { supabase } from "@/lib/supabase";
import { UserTopicProgress } from "@/types/aptitude";

export async function getUserTopicProgress(): Promise<Record<string, UserTopicProgress>> {
  const { data: authData } = await supabase.auth.getUser();
  const userId = authData.user?.id;
  if (!userId) return {};

  const { data, error } = await supabase
    .from("user_topic_progress")
    .select(`
      id,
      user_id,
      topic_id,
      total_questions,
      attempted_count,
      solved_count,
      total_time_seconds,
      last_practiced_at,
      topics(name, slug)
    `)
    .eq("user_id", userId);

  if (error) {
    console.error("Error fetching user topic progress:", error);
    return {};
  }

  const map: Record<string, UserTopicProgress> = {};
  for (const row of data || []) {
    map[row.topic_id] = row as unknown as UserTopicProgress;
    const t = (row as any).topics;
    if (t?.name) map[t.name] = row as unknown as UserTopicProgress;
  }

  return map;
}
