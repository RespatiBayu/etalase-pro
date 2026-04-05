import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * POST /api/editor/remove-bg
 *
 * Body (JSON):
 *   { base64Image: string }   — base64-encoded image (no data: prefix needed)
 *
 * Returns:
 *   { imageUrl: string }      — data:image/png base64 with transparent background
 *
 * Uses @imgly/background-removal-node (AI/ONNX model, server-side only).
 * No token cost — background removal is free for authenticated users.
 */
export async function POST(req: NextRequest) {
  // ── Auth check ──────────────────────────────────────────────────────────────
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json() as { base64Image?: string };
    const { base64Image } = body;
    if (!base64Image) {
      return NextResponse.json({ error: "base64Image is required" }, { status: 400 });
    }

    // Convert base64 → Buffer
    const inputBuffer = Buffer.from(base64Image, "base64");
    const inputBlob   = new Blob([inputBuffer]);

    // Dynamic import — keeps it server-side only, avoids any edge runtime issues
    const { removeBackground } = await import("@imgly/background-removal-node");

    const resultBlob   = await removeBackground(inputBlob);
    const resultBuffer = Buffer.from(await resultBlob.arrayBuffer());
    const resultBase64 = resultBuffer.toString("base64");

    return NextResponse.json({
      imageUrl: `data:image/png;base64,${resultBase64}`,
    });
  } catch (err) {
    console.error("[remove-bg] Error:", err);
    return NextResponse.json(
      { error: "Gagal menghapus background. Coba lagi." },
      { status: 500 }
    );
  }
}
