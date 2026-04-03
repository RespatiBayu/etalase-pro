// Server-side only — never import this from client components

const GEMINI_API_BASE = "https://generativelanguage.googleapis.com/v1beta/models";
const IMAGE_MODEL = "gemini-2.0-flash-exp-image-generation";
const TEXT_MODEL = "gemini-2.0-flash";

function getApiKey(): string {
  const key = process.env.GEMINI_API_KEY;
  if (!key) throw new Error("GEMINI_API_KEY is not set");
  return key;
}

// ─── Types ────────────────────────────────────────────────────────────────────

interface InlineData {
  mimeType: string;
  data: string;
}

interface Part {
  text?: string;
  inlineData?: InlineData;
}

interface GeminiImageResult {
  imageBase64: string;
}

interface GeminiTextResult {
  text: string;
}

// ─── Image generation (with retry) ───────────────────────────────────────────

export async function generateImage(
  prompt: string,
  imageData1: string,
  imageData2?: string,
  referenceData?: string,
  retryCount = 0
): Promise<GeminiImageResult> {
  const parts: Part[] = [
    { text: prompt },
    { inlineData: { mimeType: "image/png", data: imageData1 } },
  ];

  if (imageData2) {
    parts.push({ inlineData: { mimeType: "image/png", data: imageData2 } });
  }
  if (referenceData) {
    parts.push({ inlineData: { mimeType: "image/png", data: referenceData } });
  }

  try {
    const res = await fetch(
      `${GEMINI_API_BASE}/${IMAGE_MODEL}:generateContent?key=${getApiKey()}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts }],
          generationConfig: { responseModalities: ["TEXT", "IMAGE"] },
        }),
      }
    );

    if (!res.ok) {
      if (res.status === 429) throw new Error("429");
      const errText = await res.text();
      throw new Error(`API Error: ${res.status} - ${errText}`);
    }

    const result = await res.json();
    const candidate = result.candidates?.[0];
    const imagePart = candidate?.content?.parts?.find(
      (p: Part) => p.inlineData
    );
    const base64 = imagePart?.inlineData?.data;

    if (!base64) {
      const textPart = candidate?.content?.parts?.find((p: Part) => p.text);
      const reason =
        textPart?.text ||
        `No image returned. Reason: ${candidate?.finishReason ?? "Unknown"}`;
      throw new Error(reason);
    }

    return { imageBase64: base64 };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);

    // Rate limit — wait 60s then retry up to 5×
    if (message === "429" || message.includes("429")) {
      if (retryCount < 5) {
        await new Promise((r) => setTimeout(r, 60_000));
        return generateImage(
          prompt,
          imageData1,
          imageData2,
          referenceData,
          retryCount + 1
        );
      }
      throw new Error("Kuota API Habis (429). Coba lagi nanti.");
    }

    // Generic — exponential backoff, 2×
    if (retryCount < 2) {
      await new Promise((r) =>
        setTimeout(r, Math.pow(2, retryCount) * 1_000)
      );
      return generateImage(
        prompt,
        imageData1,
        imageData2,
        referenceData,
        retryCount + 1
      );
    }

    throw err;
  }
}

// ─── Text generation ──────────────────────────────────────────────────────────

export async function generateText(
  prompt: string,
  imageBase64: string
): Promise<GeminiTextResult> {
  const parts: Part[] = [
    { text: prompt },
    { inlineData: { mimeType: "image/png", data: imageBase64 } },
  ];

  const res = await fetch(
    `${GEMINI_API_BASE}/${TEXT_MODEL}:generateContent?key=${getApiKey()}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts }],
        generationConfig: { responseModalities: ["TEXT"], temperature: 0.7 },
      }),
    }
  );

  if (!res.ok) throw new Error(`API Error: ${res.status}`);

  const result = await res.json();
  const text = result.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) throw new Error("No text returned from AI");

  return { text };
}
