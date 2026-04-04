import { NextRequest, NextResponse } from "next/server";
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
const SUPABASE_SERVICE_KEY =
  process.env.SUPABASE_SERVICE_ROLE_KEY ?? "placeholder_key";

const supabaseAdmin = createAdminClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

// ─── GET /api/projects/[id]/images ───────────────────────────────────────────

export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  const projectId = params.id;

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

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // ── Verify ownership ──────────────────────────────────────────────────────
  const { data: projectData, error: projectError } = await supabaseAdmin
    .from("projects")
    .select("user_id")
    .eq("id", projectId)
    .single();

  if (projectError || !projectData) {
    return NextResponse.json({ error: "Project not found" }, { status: 404 });
  }

  if ((projectData as { user_id: string }).user_id !== user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  // ── Fetch all images for project ─────────────────────────────────────────
  const { data: imageRows, error: imagesError } = await supabaseAdmin
    .from("generated_images")
    .select("id, image_url, created_at")
    .eq("project_id", projectId)
    .order("created_at", { ascending: true })
    .returns<{ id: string; image_url: string; created_at: string }[]>();

  if (imagesError) {
    console.error("[projects/[id]/images] Query error:", imagesError);
    return NextResponse.json({ error: "Query failed" }, { status: 500 });
  }

  // ── Generate signed URLs ──────────────────────────────────────────────────
  const images = await Promise.all(
    (imageRows ?? []).map(async (row) => {
      const { data: signedData } = await supabaseAdmin.storage
        .from("results")
        .createSignedUrl(row.image_url, 3600);

      return {
        id: row.id,
        signedUrl: signedData?.signedUrl ?? "",
        created_at: row.created_at,
      };
    })
  );

  return NextResponse.json({ images });
}
