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
const SUPABASE_SERVICE_KEY =
  process.env.SUPABASE_SERVICE_ROLE_KEY ?? "placeholder_key";

const supabaseAdmin = createAdminClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

// ─── Type ─────────────────────────────────────────────────────────────────────

interface GeneratedImageRow {
  image_url: string;
}

interface ProjectRow {
  id: string;
  category: string;
  style_config: Record<string, unknown> | null;
  settings: Record<string, unknown> | null;
  created_at: string;
  generated_images: GeneratedImageRow[];
}

// ─── GET /api/projects ────────────────────────────────────────────────────────

export async function GET() {
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

  // ── Fetch projects with first image ──────────────────────────────────────
  const { data: rows, error } = await supabaseAdmin
    .from("projects")
    .select("id, category, style_config, settings, created_at, generated_images(image_url)")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .returns<ProjectRow[]>();

  if (error) {
    console.error("[projects/GET] Query error:", error);
    return NextResponse.json({ error: "Query failed" }, { status: 500 });
  }

  // ── Build response with thumbnail signed URLs ─────────────────────────────
  const projects = await Promise.all(
    (rows ?? []).map(async (row) => {
      const firstImage = row.generated_images?.[0];
      let thumbnailUrl: string | null = null;
      const imageCount = row.generated_images?.length ?? 0;

      if (firstImage?.image_url) {
        const { data: signedData } = await supabaseAdmin.storage
          .from("results")
          .createSignedUrl(firstImage.image_url, 3600);
        thumbnailUrl = signedData?.signedUrl ?? null;
      }

      return {
        id: row.id,
        category: row.category,
        style_config: row.style_config,
        settings: row.settings,
        created_at: row.created_at,
        thumbnail_url: thumbnailUrl,
        image_count: imageCount,
      };
    })
  );

  return NextResponse.json({ projects });
}
