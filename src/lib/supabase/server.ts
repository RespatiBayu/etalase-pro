import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import type { Database } from "@/types/database";

const rawUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const rawKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const SUPABASE_URL =
  rawUrl && rawUrl.startsWith("http") ? rawUrl : "https://placeholder.supabase.co";
const SUPABASE_ANON_KEY =
  rawKey && !rawKey.includes("_here") ? rawKey : "placeholder_key";

export function createClient() {
  const cookieStore = cookies();

  return createServerClient<Database>(
    SUPABASE_URL,
    SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // The `setAll` method is called from a Server Component.
            // This can be ignored if middleware refreshes user sessions.
          }
        },
      },
    }
  );
}
