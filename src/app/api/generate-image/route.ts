import { NextRequest, NextResponse } from "next/server";
import { uploadManyToFal, generateWithFal } from "@/lib/fal";
import { buildAiPrompt } from "@/lib/prompt-builder";
import { createClient } from "@/lib/supabase/server";
import { createClient as createAdminClient } from "@supabase/supabase-js";
import type { GenerateImagePayload } from "@/types";

// fal.ai calls can take up to 120s for complex generations
export const maxDuration = 120;

const rawUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_URL =
  rawUrl && rawUrl.startsWith("http") ? rawUrl : "https://placeholder.supabase.co";
const SUPABASE_SERVICE_KEY =
  process.env.SUPABASE_SERVICE_ROLE_KEY ?? "placeholder_key";

const supabaseAdmin = createAdminClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

export async function POST(req: NextRequest) {
  // ── Auth check ────────────────────────────────────────────────────────────
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // ── Token check ───────────────────────────────────────────────────────────
  const { data: profile } = await supabaseAdmin
    .from("profiles")
    .select("tokens")
    .eq("id", user.id)
    .single();

  const currentTokens = (profile as { tokens: number } | null)?.tokens ?? 0;
  if (currentTokens < 1) {
    return NextResponse.json(
      {
        error: "TOKEN_INSUFFICIENT",
        message: "Token tidak cukup. Silakan beli token terlebih dahulu.",
      },
      { status: 402 }
    );
  }

  // ── Parse body ────────────────────────────────────────────────────────────
  let body: GenerateImagePayload;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { base64Image, base64Image2, referenceBase64, settings, category, styleConfig } =
    body;

  if (!base64Image) {
    return NextResponse.json({ error: "base64Image is required" }, { status: 400 });
  }

  const hasImage2 = Boolean(base64Image2);
  const hasReference =
    styleConfig.generateTab === "Custom" && Boolean(referenceBase64);

  // ── Build prompt ──────────────────────────────────────────────────────────
  const prompt = buildAiPrompt(
    category,
    {
      selectedStyle: styleConfig.selectedStyle as
        | import("@/types").FashionStyleName
        | null,
      selectedPresetId: styleConfig.selectedPresetId,
      generateTab: styleConfig.generateTab,
      gender: styleConfig.gender,
      age: styleConfig.age,
      activePresetTab: styleConfig.activePresetTab,
    },
    settings,
    hasImage2,
    hasReference
  );

  // ── Upload images to fal.ai storage ───────────────────────────────────────
  try {
    const imagesToUpload: (string | null | undefined)[] = [
      base64Image,
      hasImage2 ? base64Image2 : null,
      hasReference ? referenceBase64 : null,
    ];

    const imageUrls = await uploadManyToFal(imagesToUpload);

    // ── Generate image via fal.ai ─────────────────────────────────────────
    const imageBase64 = await generateWithFal(prompt, imageUrls);

    // ── Deduct 1 token after successful generation ─────────────────────────
    await supabaseAdmin
      .from("profiles")
      .update({ tokens: currentTokens - 1 })
      .eq("id", user.id);

    await supabaseAdmin.from("token_transactions").insert({
      user_id: user.id,
      type: "usage",
      amount: -1,
      description: "Generate 1 gambar produk",
    });

    return NextResponse.json({
      imageBase64,
      dataUrl: `data:image/png;base64,${imageBase64}`,
      tokensRemaining: currentTokens - 1,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Internal server error";
    console.error("[generate-image] Error:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
