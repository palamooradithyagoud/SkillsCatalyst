import { supabase } from "@/lib/supabase";

export async function getUserTopicBookmarks(): Promise<Record<string, boolean>> {
  const { data: authData } = await supabase.auth.getUser();
  const userId = authData.user?.id;
  if (!userId) {
    try {
      const local = localStorage.getItem("skillscatalyst_bookmarked_topics");
      return local ? JSON.parse(local) : {};
    } catch {
      return {};
    }
  }

  const { data, error } = await supabase
    .from("topic_bookmarks")
    .select(`
      topic_id,
      topics(name)
    `)
    .eq("user_id", userId);

  if (error) {
    console.error("Error fetching topic bookmarks:", error);
    try {
      const local = localStorage.getItem("skillscatalyst_bookmarked_topics");
      return local ? JSON.parse(local) : {};
    } catch {
      return {};
    }
  }

  const map: Record<string, boolean> = {};
  for (const row of data || []) {
    map[row.topic_id] = true;
    const t = (row as any).topics;
    if (t?.name) map[t.name] = true;
  }

  // Backup to localStorage for instant offline access
  try {
    localStorage.setItem("skillscatalyst_bookmarked_topics", JSON.stringify(map));
  } catch {}

  return map;
}

export async function toggleTopicBookmark(topicId: string, topicName: string, isCurrentlyBookmarked: boolean): Promise<boolean> {
  const newStatus = !isCurrentlyBookmarked;

  // 1. Instant local persistence
  try {
    const local = localStorage.getItem("skillscatalyst_bookmarked_topics");
    const parsed = local ? JSON.parse(local) : {};
    parsed[topicName] = newStatus;
    parsed[topicId] = newStatus;
    localStorage.setItem("skillscatalyst_bookmarked_topics", JSON.stringify(parsed));
  } catch {}

  // 2. Sync to Supabase
  const { data: authData } = await supabase.auth.getUser();
  const userId = authData.user?.id;
  if (!userId) return newStatus;

  if (newStatus) {
    await supabase.from("topic_bookmarks").upsert({
      user_id: userId,
      topic_id: topicId,
    }, { onConflict: "user_id,topic_id" });
  } else {
    await supabase.from("topic_bookmarks")
      .delete()
      .eq("user_id", userId)
      .eq("topic_id", topicId);
  }

  return newStatus;
}
