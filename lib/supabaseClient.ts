import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://rdavddkuuwwylqcbbpnd.supabase.co";
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "sb_publishable_0FcHs5Ckldg_3xeaz87FZw_XAWy8tTT";

export const supabase = createClient(supabaseUrl, supabaseKey);
