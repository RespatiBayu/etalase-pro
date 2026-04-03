import { createBrowserClient } from "@supabase/ssr";
import type { Database } from "@/types/database";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const SUPABASE_URL =
  url && url.startsWith("http") ? url : "https://placeholder.supabase.co";
const SUPABASE_ANON_KEY = key && !key.includes("_here") ? key : "placeholder_key";

export function createClient() {
  return createBrowserClient<Database>(SUPABASE_URL, SUPABASE_ANON_KEY);
}
