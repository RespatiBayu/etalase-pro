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

// Use the smaller medium model for faster cold-start on serverless.
// Options: "small" (~40MB, fastest), "medium" (~80MB, balanced), "large" (~180MB, best).
const IMGLY_CONFIG: Config = {
  model: "medium",
  output: {
    format: "image/png",
    quality: 0.95,
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
