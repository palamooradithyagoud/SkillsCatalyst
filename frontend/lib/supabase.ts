import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://zzjxprhapptjoziwdcro.supabase.co";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp6anhwcmhhcHB0am96aXdkY3JvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODUzMDgzODgsImV4cCI6MjEwMDg4NDM4OH0.-bweaY3kcKetY7PrW2FY78krtvMs34GSBWNaEWarXFo";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
