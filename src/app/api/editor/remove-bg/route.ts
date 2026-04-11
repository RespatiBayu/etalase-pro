import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { removeBackground, type Config } from "@imgly/background-removal-node";

// Server-side bg removal via @imgly/background-removal-node.
// Runs ONNX model in onnxruntime-node — no external API, no API key, free.
// First call downloads ~85MB model into OS tmp dir, subsequent calls instant
// (within same Vercel function instance lifetime).

export const runtime = "nodejs";
export const maxDuration = 60;

const rawUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const rawKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const SUPABASE_URL =
  rawUrl && rawUrl.startsWith("http") ? rawUrl : "https://placeholder.supabase.co";
const SUPABASE_ANON_KEY =
  rawKey && !rawKey.includes("_here") ? rawKey : "placeholder_key";

// Fetch model files from imgly CDN at runtime instead of bundling them
// (saves ~127MB from the serverless function bundle, well under Vercel's
// 250MB limit). Files are cached in /tmp after first download.
// Pin to installed package version (1.4.5) so paths match.
const IMGLY_CONFIG: Config = {
  model: "small", // ~40MB, fastest cold start
  publicPath:
    "https://staticimgly.com/@imgly/background-removal-data/1.4.5/dist/",
  output: {
    format: "image/png",
    quality: 0.9,
  },
  debug: false,
};

// POST /api/editor/remove-bg
// Body: { base64Image: string } — raw base64 (no data: prefix)
// Returns: { imageUrl: "data:image/png;base64,..." }
export async function POST(request: NextRequest) {
  // ── Auth check ────────────────────────────────────────────────────────────
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

  try {
    // Convert base64 → Blob (input format @imgly accepts directly)
    const buffer = Buffer.from(base64Image, "base64");
    const inputBlob = new Blob([new Uint8Array(buffer)], { type: "image/png" });

    // Run ONNX inference. First call downloads model (~80MB) to /tmp.
    const resultBlob = await removeBackground(inputBlob, IMGLY_CONFIG);

    // Convert result Blob → base64 data URI
    const resultBuffer = Buffer.from(await resultBlob.arrayBuffer());
    const base64Result = resultBuffer.toString("base64");

    return NextResponse.json({
      imageUrl: `data:image/png;base64,${base64Result}`,
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Background removal failed";
    console.error("[remove-bg] Error:", msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
