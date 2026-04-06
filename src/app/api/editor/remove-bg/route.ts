import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { fal } from "@fal-ai/client";

export const maxDuration = 60;

const rawUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const rawKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const SUPABASE_URL =
  rawUrl && rawUrl.startsWith("http") ? rawUrl : "https://placeholder.supabase.co";
const SUPABASE_ANON_KEY =
  rawKey && !rawKey.includes("_here") ? rawKey : "placeholder_key";

// Configure fal client with API key (server-side only)
fal.config({ credentials: process.env.FAL_KEY ?? "" });

// Output type for fal-ai/nano-banana/edit
interface FalImageFile {
  url: string;
  content_type?: string;
  file_name?: string;
  file_size?: number;
  width?: number;
  height?: number;
}

interface NanoBananaOutput {
  images: FalImageFile[];
  description: string;
}

// POST /api/editor/remove-bg
// Removes product background using fal.ai nano-banana/edit model.
// Returns transparent PNG as base64 data URI.
// No token cost — background removal is a free utility feature.
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
    // ── Upload image to fal.ai storage to get a URL ───────────────────────
    const buffer = Buffer.from(base64Image, "base64");
    const blob = new Blob([buffer], { type: "image/png" });
    const uploadedUrl = await fal.storage.upload(blob as File);

    // ── Call nano-banana/edit to remove the background ───────────────────
    const result = await fal.subscribe("fal-ai/nano-banana/edit", {
      input: {
        prompt:
          "Remove the background completely. Keep only the main product with clean edges. Make the background fully transparent.",
        image_urls: [uploadedUrl],
        output_format: "png",
      },
    });

    const output = result.data as NanoBananaOutput;
    const resultImageUrl = output.images?.[0]?.url;

    if (!resultImageUrl) {
      throw new Error("No image returned from fal.ai");
    }

    // ── Fetch result image and convert to base64 ──────────────────────────
    const imgRes = await fetch(resultImageUrl);
    if (!imgRes.ok) {
      throw new Error(`Failed to fetch result image: ${imgRes.status}`);
    }
    const imgBuffer = await imgRes.arrayBuffer();
    const base64Result = Buffer.from(imgBuffer).toString("base64");

    return NextResponse.json({
      imageUrl: `data:image/png;base64,${base64Result}`,
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Background removal failed";
    console.error("[remove-bg] Error:", msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
