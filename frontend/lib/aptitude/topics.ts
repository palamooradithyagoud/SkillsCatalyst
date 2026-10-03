import { supabase } from "@/lib/supabase";
import { Topic } from "@/types/aptitude";
import { aptitudeCache } from "@/lib/cache/aptitudeCache";

export async function getTopics(categorySlug?: string): Promise<Topic[]> {
  const cacheKey = `aptitude_topics_${categorySlug || "all"}`;
  const cached = aptitudeCache.get<Topic[]>(cacheKey);
  if (cached) return cached;

  let query = supabase
    .from("topics")
    .select(`
      id,
      category_id,
      slug,
      name,
      description,
      display_order,
      is_active,
      created_at,
      updated_at,
      categories!inner(slug)
    `)
    .eq("is_active", true)
    .order("display_order", { ascending: true });

  if (categorySlug) {
    query = query.eq("categories.slug", categorySlug);
  }

  const { data, error } = await query;
  if (error) {
    console.error("Error fetching topics:", error);
    return [];
  }

  const result = (data as unknown as Topic[]) || [];
  aptitudeCache.set(cacheKey, result);
  return result;
}

export async function getAllTopicsMap(): Promise<Record<string, Topic>> {
  const cacheKey = "aptitude_topics_map";
  const cached = aptitudeCache.get<Record<string, Topic>>(cacheKey);
  if (cached) return cached;

  const topics = await getTopics();
  const map: Record<string, Topic> = {};
  for (const t of topics) {
    map[t.name] = t;
    map[t.slug] = t;
    map[t.id] = t;
  }
  aptitudeCache.set(cacheKey, map);
  return map;
}
