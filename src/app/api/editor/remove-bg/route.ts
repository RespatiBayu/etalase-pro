import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export const maxDuration = 60;

const rawUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const rawKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const SUPABASE_URL =
  rawUrl && rawUrl.startsWith("http") ? rawUrl : "https://placeholder.supabase.co";
const SUPABASE_ANON_KEY =
  rawKey && !rawKey.includes("_here") ? rawKey : "placeholder_key";

// Hugging Face Inference API — free tier, no credit card required.
// briaai/RMBG-1.4 is SOTA background removal (non-commercial license).
// To swap to a permissive model later, change HF_REMOVE_BG_MODEL env var.
const HF_API_TOKEN = process.env.HF_API_TOKEN ?? "";
const HF_REMOVE_BG_MODEL = process.env.HF_REMOVE_BG_MODEL ?? "briaai/RMBG-1.4";
const HF_API_URL = `https://api-inference.huggingface.co/models/${HF_REMOVE_BG_MODEL}`;

// HF cold-start retry: model may need to load on first call (returns 503).
const MAX_RETRIES = 3;
const RETRY_BASE_DELAY_MS = 4000;

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

async function callHfRemoveBg(imageBlob: Blob): Promise<Buffer> {
  for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
    const res = await fetch(HF_API_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${HF_API_TOKEN}`,
        "Content-Type": "application/octet-stream",
        Accept: "image/png",
      },
      body: imageBlob,
    });

    // 503 = model is loading (cold start). Wait and retry.
    if (res.status === 503) {
      let estimatedTime = RETRY_BASE_DELAY_MS / 1000;
      try {
        const errJson = (await res.json()) as { estimated_time?: number };
        if (typeof errJson.estimated_time === "number") {
          estimatedTime = errJson.estimated_time;
        }
      } catch {
        // ignore parse error, fall back to default delay
      }
      const waitMs = Math.min(Math.ceil(estimatedTime * 1000) + 500, 20000);
      console.log(
        `[remove-bg] HF model loading, retry ${attempt + 1}/${MAX_RETRIES} in ${waitMs}ms`
      );
      await sleep(waitMs);
      continue;
    }

    if (!res.ok) {
      const errText = await res.text().catch(() => "");
      throw new Error(`HF API error ${res.status}: ${errText.slice(0, 200)}`);
    }

    const arrayBuffer = await res.arrayBuffer();
    return Buffer.from(arrayBuffer);
  }

  throw new Error("Model masih loading setelah beberapa percobaan. Coba lagi sebentar.");
}

// POST /api/editor/remove-bg
// Removes product background using Hugging Face Inference API (free tier).
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

  if (!HF_API_TOKEN) {
    console.error("[remove-bg] HF_API_TOKEN is not set");
    return NextResponse.json(
      { error: "Server belum dikonfigurasi (HF_API_TOKEN). Hubungi admin." },
      { status: 500 }
    );
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
    const imageBytes = Buffer.from(base64Image, "base64");
    const imageBlob = new Blob([new Uint8Array(imageBytes)], { type: "application/octet-stream" });
    const resultBuffer = await callHfRemoveBg(imageBlob);
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
