import { supabase } from "@/lib/supabase";
import { Category } from "@/types/aptitude";
import { aptitudeCache } from "@/lib/cache/aptitudeCache";

export async function getCategories(): Promise<Category[]> {
  const cacheKey = "aptitude_categories";
  const cached = aptitudeCache.get<Category[]>(cacheKey);
  if (cached) return cached;

  const { data, error } = await supabase
    .from("categories")
    .select("*")
    .eq("is_active", true)
    .order("display_order", { ascending: true });

  if (error) {
    console.error("Error fetching aptitude categories:", error);
    return [];
  }

  const result = (data as Category[]) || [];
  aptitudeCache.set(cacheKey, result);
  return result;
}
