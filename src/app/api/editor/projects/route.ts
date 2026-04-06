import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { createClient as createAdminClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";

// ─── Supabase clients ─────────────────────────────────────────────────────────

const rawUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const rawKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const SUPABASE_URL =
  rawUrl && rawUrl.startsWith("http") ? rawUrl : "https://placeholder.supabase.co";
const SUPABASE_ANON_KEY =
  rawKey && !rawKey.includes("_here") ? rawKey : "placeholder_key";
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "placeholder_key";

const supabaseAdmin = createAdminClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

interface ProjectRow {
  id: string;
  user_id: string;
  name: string;
  updated_at: string;
  created_at: string;
}

// ─── GET /api/editor/projects ─────────────────────────────────────────────────
// Returns list of user's saved editor projects, newest first.
// Each item includes a short-lived signed thumbnail URL (5 min).

export async function GET() {
  const cookieStore = cookies();
  const supabase = createServerClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    cookies: {
      getAll: () => cookieStore.getAll(),
      setAll: (toSet) =>
        toSet.forEach(({ name, value, options }) =>
          cookieStore.set(name, value, options)
        ),
    },
  });

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: rows, error } = await supabaseAdmin
    .from("editor_projects")
    .select("id, name, updated_at, created_at")
    .eq("user_id", user.id)
    .order("updated_at", { ascending: false })
    .limit(20)
    .returns<ProjectRow[]>();

  if (error) {
    return NextResponse.json({ error: "Failed to fetch projects" }, { status: 500 });
  }

  // Attach signed thumbnail URLs (60 seconds — only for display)
  const projects = await Promise.all(
    (rows ?? []).map(async (row) => {
      const thumbPath = `${user.id}/${row.id}/thumb.png`;
      const { data: signedData } = await supabaseAdmin.storage
        .from("editor-projects")
        .createSignedUrl(thumbPath, 60);

      return {
        id: row.id,
        name: row.name,
        updatedAt: row.updated_at,
        thumbnailUrl: signedData?.signedUrl ?? null,
      };
    })
  );

  return NextResponse.json({ projects });
}
