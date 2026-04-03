import { NextRequest, NextResponse } from "next/server";
import { generateText } from "@/lib/gemini";
import type { GenerateTextPayload, GenerateTextResult } from "@/types";

const PROMPT = `
Analyze this product image and identify what it is.
Based on the image, generate short and catchy marketing text in INDONESIAN language (Bahasa Indonesia).

CRITICAL RULES:
- Headline: MAXIMUM 3 WORDS.
- Tagline: MAXIMUM 3 WORDS.
- Features: MAXIMUM 3 WORDS EACH.

Return ONLY a JSON object with this exact structure:
{
  "headline": "A short catchy headline (max 3 words)",
  "tagline": "A persuasive tagline (max 3 words)",
  "feature1": "Key feature 1 (max 3 words)",
  "feature2": "Key feature 2 (max 3 words)",
  "feature3": "Key feature 3 (max 3 words)"
}

Do not include markdown code blocks or any other text. Just the JSON string.
`;

function truncateToWords(str: string, count: number): string {
  if (!str) return "";
  return str
    .split(/\s+/)
    .slice(0, count)
    .join(" ");
}

export async function POST(req: NextRequest) {
  try {
    const body: GenerateTextPayload = await req.json();
    const { base64Image } = body;

    if (!base64Image) {
      return NextResponse.json(
        { error: "base64Image is required" },
        { status: 400 }
      );
    }

    const { text } = await generateText(PROMPT, base64Image);

    const cleanJson = text
      .replace(/```json/g, "")
      .replace(/```/g, "")
      .trim();
    const parsed = JSON.parse(cleanJson);

    const result: GenerateTextResult = {
      headline: truncateToWords(parsed.headline ?? "", 3),
      tagline: truncateToWords(parsed.tagline ?? "", 3),
      feature1: truncateToWords(parsed.feature1 ?? "", 3),
      feature2: truncateToWords(parsed.feature2 ?? "", 3),
      feature3: truncateToWords(parsed.feature3 ?? "", 3),
    };

    return NextResponse.json(result);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
