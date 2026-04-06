import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { createClient as createAdminClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";

export const maxDuration = 30;

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

// ─── GET /api/editor/projects/[id] ───────────────────────────────────────────
// Returns the full serialised EditorSavedState for one project.

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

  const { id } = params;

  // Verify ownership
  const { data: row } = await supabaseAdmin
    .from("editor_projects")
    .select("id, name, updated_at")
    .eq("id", id)
    .eq("user_id", user.id)
    .single();

  if (!row) return NextResponse.json({ error: "Not found" }, { status: 404 });

  // Download state JSON from Storage
  const statePath = `${user.id}/${id}/state.json`;
  const { data: fileData, error: downloadError } = await supabaseAdmin.storage
    .from("editor-projects")
    .download(statePath);

  if (downloadError || !fileData) {
    return NextResponse.json({ error: "State file not found" }, { status: 404 });
  }

  const stateJson = await fileData.text();

  const projectRow = row as { id: string; name: string; updated_at: string };
  return NextResponse.json({
    id: projectRow.id,
    name: projectRow.name,
    updatedAt: projectRow.updated_at,
    stateJson,
  });
}

// ─── DELETE /api/editor/projects/[id] ────────────────────────────────────────

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

  const { id } = params;

  // Verify ownership
  const { data: row } = await supabaseAdmin
    .from("editor_projects")
    .select("id")
    .eq("id", id)
    .eq("user_id", user.id)
    .single();

  if (!row) return NextResponse.json({ error: "Not found" }, { status: 404 });

  // Remove Storage files (ignore errors — DB delete is authoritative)
  await supabaseAdmin.storage
    .from("editor-projects")
    .remove([`${user.id}/${id}/state.json`, `${user.id}/${id}/thumb.png`]);

  // Delete DB record
  await supabaseAdmin.from("editor_projects").delete().eq("id", id);

  return NextResponse.json({ ok: true });
}
