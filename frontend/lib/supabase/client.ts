import { createBrowserClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";

let clientInstance: SupabaseClient<any, "public", any> | null = null;

export function createClient(): SupabaseClient<any, "public", any> {
  if (clientInstance) {
    return clientInstance;
  }
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY environment variables.");
  }
  clientInstance = createBrowserClient(supabaseUrl, supabaseAnonKey);
  return clientInstance;
}

export function setClientInstance(client: SupabaseClient<any, "public", any> | null): void {
  clientInstance = client;
}

export function resetClientInstance(): void {
  clientInstance = null;
}

export const supabase = new Proxy({} as SupabaseClient<any, "public", any>, {
  get(_target, prop) {
    const client = createClient();
    const value = Reflect.get(client, prop, client);
    if (typeof value === "function") {
      return value.bind(client);
    }
    return value;
  },
});

