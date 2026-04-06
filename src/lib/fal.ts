// Server-side only — never import this from client components

import { fal } from "@fal-ai/client";

// Configure once — FAL_KEY is set server-side only
fal.config({ credentials: process.env.FAL_KEY ?? "" });

// Model name — configurable via env var so future model swaps need no code deploy
// Check available models: https://fal.ai/models
const FAL_IMAGE_MODEL =
  process.env.FAL_IMAGE_MODEL ?? "fal-ai/nano-banana/edit";

// ─── Types ────────────────────────────────────────────────────────────────────

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
  description?: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Upload a base64-encoded PNG to fal.ai storage.
 * Returns a public URL the fal model can access.
 */
export async function uploadToFal(base64: string): Promise<string> {
  const buffer = Buffer.from(base64, "base64");
  const blob = new Blob([buffer], { type: "image/png" });
  return fal.storage.upload(blob as File);
}

/**
 * Upload multiple base64 images to fal.ai storage in parallel.
 */
export async function uploadManyToFal(
  images: (string | null | undefined)[]
): Promise<string[]> {
  const promises = images
    .filter((img): img is string => Boolean(img))
    .map((img) => uploadToFal(img));
  return Promise.all(promises);
}

/**
 * Call fal-ai/nano-banana/edit (or override model) with a prompt and image URLs.
 * Returns the result as a base64-encoded PNG string (without data: prefix).
 */
export async function generateWithFal(
  prompt: string,
  imageUrls: string[]
): Promise<string> {
  const result = await fal.subscribe(FAL_IMAGE_MODEL, {
    input: {
      prompt,
      image_urls: imageUrls,
      output_format: "png",
    },
  });

  const output = result.data as NanoBananaOutput;
  const resultImageUrl = output.images?.[0]?.url;

  if (!resultImageUrl) {
    throw new Error("No image returned from fal.ai");
  }

  // Fetch result image from fal CDN and convert to base64
  const imgRes = await fetch(resultImageUrl);
  if (!imgRes.ok) {
    throw new Error(`Failed to fetch result image from fal.ai: ${imgRes.status}`);
  }
  const imgBuffer = await imgRes.arrayBuffer();
  return Buffer.from(imgBuffer).toString("base64");
}
