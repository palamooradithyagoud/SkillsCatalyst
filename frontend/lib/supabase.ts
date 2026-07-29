import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://zzjxprhapptjoziwdcro.supabase.co";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "REDACTED_ANON_KEY";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
