import { NextRequest, NextResponse } from "next/server";
import { generateText } from "@/lib/gemini";
import type { GenerateCaptionPayload, GenerateCaptionResult } from "@/types";

function buildCaptionPrompt(payload: GenerateCaptionPayload): string {
  const d = payload.details;
  const detailsText = `
Product Name/Headline: ${d.headline || "Produk ini"}
Tagline: ${d.tagline}
Key Features: ${d.feature1}, ${d.feature2}, ${d.feature3}
Price: ${d.price ? `Rp ${d.price}` : ""}
Promo: ${d.promoPrice ? `Rp ${d.promoPrice}` : ""}
`;

  return `
Act as an expert copywriter for Indonesian marketplaces (Shopee/Tokopedia).
Analyze this product image and the provided details below.

Product Details:
${detailsText}

Write a persuasive and SEO-friendly product description in Indonesian (Bahasa Indonesia).
Structure:
1. **Judul Produk yang Menarik & SEO** (Max 100 chars)
2. **Kalimat Pembuka/Hook** (Emotional benefit)
3. **Keunggulan Utama** (Bullet points, use emojis)
4. **Spesifikasi Produk** (Estimate materials/size from image if not provided)
5. **Kenapa Harus Beli Sekarang?** (FOMO/Urgency)
6. **Hashtags** (Relevan & Trending)

Style: Professional, exciting, and persuasive. Use standard Indonesian marketplace formatting.
`;
}

export async function POST(req: NextRequest) {
  try {
    const body: GenerateCaptionPayload = await req.json();
    const { base64Image } = body;

    if (!base64Image) {
      return NextResponse.json(
        { error: "base64Image is required" },
        { status: 400 }
      );
    }

    const prompt = buildCaptionPrompt(body);
    const { text } = await generateText(prompt, base64Image);

    const result: GenerateCaptionResult = { caption: text };
    return NextResponse.json(result);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
