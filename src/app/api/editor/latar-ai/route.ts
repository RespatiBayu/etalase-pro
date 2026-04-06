import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { createClient as createAdminClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import { uploadToFal, generateWithFal } from "@/lib/fal";

// fal.ai calls can take up to 120s
export const maxDuration = 120;

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

// ─── POST /api/editor/latar-ai ────────────────────────────────────────────────

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

  // ── Check token balance ───────────────────────────────────────────────────
  const { data: profile } = await supabaseAdmin
    .from("profiles")
    .select("tokens")
    .eq("id", user.id)
    .returns<{ tokens: number }[]>()
    .single();

  const currentTokens = (profile as { tokens: number } | null)?.tokens ?? 0;
  if (currentTokens < 1) {
    return NextResponse.json({ error: "TOKEN_INSUFFICIENT" }, { status: 402 });
  }

  // ── Parse request ─────────────────────────────────────────────────────────
  let body: { base64Image?: string; stylePrompt?: string; ratio?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { base64Image, stylePrompt, ratio = "1:1" } = body;

  if (!base64Image) {
    return NextResponse.json({ error: "base64Image is required" }, { status: 400 });
  }

  // ── Build prompt ──────────────────────────────────────────────────────────
  // Auto-mode (no stylePrompt): AI analyzes product and picks best background
  const autoModeInstruction = `
First, analyze what product is shown in the image (category, color palette, style/tone, target market).
Then, select the most fitting background environment that would make this product look premium and appealing for Indonesian e-commerce.
Choose a background style that naturally complements the product's aesthetics, color, and target audience.
`.trim();

  const styleInstruction = stylePrompt
    ? `STYLE: ${stylePrompt}`
    : `STYLE INSTRUCTION (Auto Mode):\n${autoModeInstruction}`;

  const prompt = `
You are a professional e-commerce product photographer.

TASK: Transform the product photo into a high-end marketing visual.

${styleInstruction}

RULES:
1. Keep the product as the clear hero of the image.
2. Background and environment should complement the product.
3. Remove any hands holding the product — show only the product itself.
4. Commercial quality: sharp, well-lit, realistic.
5. DO NOT add any text or typography overlays.
6. Aspect ratio: ${ratio}.
7. Ultra-high resolution, 8k, extreme sharpness.
`.trim();

  // ── Upload image to fal.ai storage, then generate ─────────────────────────
  try {
    const imageUrl = await uploadToFal(base64Image);
    const imageBase64 = await generateWithFal(prompt, [imageUrl]);

    // ── Deduct 1 token ────────────────────────────────────────────────────
    await supabaseAdmin
      .from("profiles")
      .update({ tokens: currentTokens - 1 })
      .eq("id", user.id);

    await supabaseAdmin.from("token_transactions").insert({
      user_id: user.id,
      type: "usage",
      amount: -1,
      description: "Latar AI — Editor foto",
    });

    return NextResponse.json({
      imageUrl: `data:image/png;base64,${imageBase64}`,
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Generation failed";
    console.error("[latar-ai] Error:", msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
