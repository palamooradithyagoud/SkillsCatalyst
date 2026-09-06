import { createBrowserClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://zzjxprhapptjoziwdcro.supabase.co";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp6anhwcmhhcHB0am96aXdkY3JvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODUzMDgzODgsImV4cCI6MjEwMDg4NDM4OH0.-bweaY3kcKetY7PrW2FY78krtvMs34GSBWNaEWarXFo";

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
