import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { generateImage } from "@/lib/gemini";

export const maxDuration = 60;

const rawUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const rawKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const SUPABASE_URL =
  rawUrl && rawUrl.startsWith("http") ? rawUrl : "https://placeholder.supabase.co";
const SUPABASE_ANON_KEY =
  rawKey && !rawKey.includes("_here") ? rawKey : "placeholder_key";

// POST /api/editor/remove-bg
// Isolates the product on a pure chroma-green (#00FF00) background using Gemini.
// The client then removes the green via canvas chroma-key to get transparency.
// No token cost — background removal is a free utility feature.
export async function POST(request: NextRequest) {
  // Auth check
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

  // Parse body
  let body: { base64Image?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { base64Image } = body;
  if (!base64Image) {
    return NextResponse.json({ error: "base64Image is required" }, { status: 400 });
  }

  // Gemini prompt: isolate product on pure bright green chroma-key background.
  // Client-side canvas will then remove R<80 G>170 B<80 pixels → transparent.
  const prompt = `
You are a professional product image editor.

TASK: Extract and isolate the main product from this photo.

OUTPUT RULES (CRITICAL — follow exactly):
1. Place the product on a FLAT, SOLID, PURE BRIGHT GREEN background.
   The background color must be exactly #00FF00 (Red=0, Green=255, Blue=0).
   It must be a completely uniform, flat solid color — NO gradients, NO shadows, NO textures.
2. Keep the product 100% photorealistic, sharp, and color-accurate.
3. Remove ALL original backgrounds, props, hands, tables, and surroundings.
4. The product edges should be clean and precise.
5. Center the product in the frame with appropriate padding.
6. Do NOT add any text, watermarks, or decorations.
7. Maintain the original product colors exactly.
`.trim();

  try {
    const { imageBase64 } = await generateImage(prompt, base64Image);
    return NextResponse.json({
      imageUrl: `data:image/png;base64,${imageBase64}`,
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Generation failed";
    console.error("[remove-bg] Error:", msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
