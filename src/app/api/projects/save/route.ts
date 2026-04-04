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

// ─── POST /api/projects/save ──────────────────────────────────────────────────

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

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // ── Parse body ────────────────────────────────────────────────────────────
  let body: {
    category?: string;
    styleConfig?: Record<string, unknown>;
    settings?: Record<string, unknown>;
    images?: string[];
  };

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { category, styleConfig, settings, images } = body;

  if (!category || !Array.isArray(images) || images.length === 0) {
    return NextResponse.json({ error: "category and images are required" }, { status: 400 });
  }

  // ── Create project record ─────────────────────────────────────────────────
  const { data: project, error: projectError } = await supabaseAdmin
    .from("projects")
    .insert({
      user_id: user.id,
      category,
      style_config: styleConfig ?? null,
      settings: settings ?? null,
    })
    .select("id")
    .single();

  if (projectError || !project) {
    console.error("[projects/save] Insert project error:", projectError);
    return NextResponse.json({ error: "Failed to create project" }, { status: 500 });
  }

  const projectId = project.id as string;

  // ── Upload images to Storage ──────────────────────────────────────────────
  const imageUrls: string[] = [];
  const generatedImageRows: { project_id: string; image_url: string }[] = [];

  for (let i = 0; i < images.length; i++) {
    const imgStr = images[i];
    // Strip data URL prefix if present
    const base64Str = imgStr.includes(",") ? imgStr.split(",")[1] : imgStr;
    const buffer = Buffer.from(base64Str, "base64");
    const storagePath = `${user.id}/${projectId}/${i}.png`;

    const { error: uploadError } = await supabaseAdmin.storage
      .from("results")
      .upload(storagePath, buffer, {
        contentType: "image/png",
        upsert: true,
      });

    if (uploadError) {
      console.error(`[projects/save] Upload error for image ${i}:`, uploadError);
      // Continue with other images even if one fails
      continue;
    }

    generatedImageRows.push({ project_id: projectId, image_url: storagePath });

    // Generate signed URL (1 hour)
    const { data: signedData } = await supabaseAdmin.storage
      .from("results")
      .createSignedUrl(storagePath, 3600);

    imageUrls.push(signedData?.signedUrl ?? "");
  }

  // ── Insert generated_images records ──────────────────────────────────────
  if (generatedImageRows.length > 0) {
    const { error: insertError } = await supabaseAdmin
      .from("generated_images")
      .insert(generatedImageRows);

    if (insertError) {
      console.error("[projects/save] Insert generated_images error:", insertError);
    }
  }

  return NextResponse.json({ projectId, imageUrls });
}
