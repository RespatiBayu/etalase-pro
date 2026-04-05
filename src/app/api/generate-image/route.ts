import { NextRequest, NextResponse } from "next/server";
import { generateImage } from "@/lib/gemini";
import { buildAiPrompt } from "@/lib/prompt-builder";

// Vercel Hobby allows up to 60s; Pro allows up to 300s.
// Gemini image generation typically takes 20-60s.
export const maxDuration = 60;
import { createClient } from "@/lib/supabase/server";
import { createClient as createAdminClient } from "@supabase/supabase-js";
import type { GenerateImagePayload } from "@/types";

const rawUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_URL =
  rawUrl && rawUrl.startsWith("http") ? rawUrl : "https://placeholder.supabase.co";
const SUPABASE_SERVICE_KEY =
  process.env.SUPABASE_SERVICE_ROLE_KEY ?? "placeholder_key";

const supabaseAdmin = createAdminClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

export async function POST(req: NextRequest) {
  // Auth check + token deduction
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Check token balance
  const { data: profile } = await supabaseAdmin
    .from("profiles")
    .select("tokens")
    .eq("id", user.id)
    .single();

  const currentTokens = profile?.tokens ?? 0;
  if (currentTokens < 1) {
    return NextResponse.json(
      { error: "TOKEN_INSUFFICIENT", message: "Token tidak cukup. Silakan beli token terlebih dahulu." },
      { status: 402 }
    );
  }

  try {
    const body: GenerateImagePayload = await req.json();
    const {
      base64Image,
      base64Image2,
      referenceBase64,
      settings,
      category,
      styleConfig,
    } = body;

    if (!base64Image) {
      return NextResponse.json(
        { error: "base64Image is required" },
        { status: 400 }
      );
    }

    const hasImage2 = Boolean(base64Image2);
    const hasReference =
      styleConfig.generateTab === "Custom" && Boolean(referenceBase64);

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

    const { imageBase64 } = await generateImage(
      prompt,
      base64Image,
      base64Image2,
      hasReference ? referenceBase64 : undefined
    );

    // Deduct 1 token after successful generation
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
    const status = message.includes("429") ? 429 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
