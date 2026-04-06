import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { createClient as createAdminClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";

// Large payloads (base64 images embedded in state JSON, up to ~20 MB)
export const maxDuration = 60;

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

// ─── POST /api/editor/projects/save ──────────────────────────────────────────
// Body: {
//   projectId?: string          — if provided, update existing; else create new
//   name?: string
//   stateJson: string           — JSON.stringify(EditorSavedState)
//   thumbnailBase64?: string    — PNG thumbnail (base64, no prefix)
// }
// Returns: { id: string }

export async function POST(request: NextRequest) {
  // ── Auth ──────────────────────────────────────────────────────────────────
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

  // ── Parse body ────────────────────────────────────────────────────────────
  let body: {
    projectId?: string;
    name?: string;
    stateJson: string;
    thumbnailBase64?: string;
  };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { projectId, name, stateJson, thumbnailBase64 } = body;
  if (!stateJson) {
    return NextResponse.json({ error: "stateJson is required" }, { status: 400 });
  }

  // ── Upsert DB record first (to get the id) ────────────────────────────────
  let finalId = projectId;

  if (finalId) {
    // Verify ownership before updating
    const { data: existing } = await supabaseAdmin
      .from("editor_projects")
      .select("id")
      .eq("id", finalId)
      .eq("user_id", user.id)
      .single();

    if (!existing) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    await supabaseAdmin
      .from("editor_projects")
      .update({ name: name ?? "Proyek Editor", updated_at: new Date().toISOString() })
      .eq("id", finalId);
  } else {
    const { data: newRow, error } = await supabaseAdmin
      .from("editor_projects")
      .insert({ user_id: user.id, name: name ?? "Proyek Editor" })
      .select("id")
      .single();

    if (error || !newRow) {
      return NextResponse.json({ error: "Failed to create project" }, { status: 500 });
    }
    finalId = (newRow as { id: string }).id;
  }

  // ── Upload state JSON to Storage ──────────────────────────────────────────
  const statePath = `${user.id}/${finalId}/state.json`;
  const stateBuffer = Buffer.from(stateJson, "utf-8");

  const { error: stateError } = await supabaseAdmin.storage
    .from("editor-projects")
    .upload(statePath, stateBuffer, {
      contentType: "application/json",
      upsert: true,
    });

  if (stateError) {
    console.error("[editor/projects/save] state upload error:", stateError.message);
    return NextResponse.json({ error: "Failed to save state" }, { status: 500 });
  }

  // ── Upload thumbnail if provided ──────────────────────────────────────────
  if (thumbnailBase64) {
    const thumbPath = `${user.id}/${finalId}/thumb.png`;
    const thumbBuffer = Buffer.from(thumbnailBase64, "base64");

    await supabaseAdmin.storage
      .from("editor-projects")
      .upload(thumbPath, thumbBuffer, { contentType: "image/png", upsert: true });
  }

  return NextResponse.json({ id: finalId });
}
