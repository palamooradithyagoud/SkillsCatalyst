import { createBrowserClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://zzjxprhapptjoziwdcro.supabase.co";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "REDACTED_ANON_KEY";

let clientInstance: SupabaseClient<any, "public", any> | null = null;

export function createClient(): SupabaseClient<any, "public", any> {
  if (typeof window === "undefined") {
    return createBrowserClient(supabaseUrl, supabaseAnonKey);
  }
  if (!clientInstance) {
    clientInstance = createBrowserClient(supabaseUrl, supabaseAnonKey);
  }
  return clientInstance;
}

export const supabase = createClient();
