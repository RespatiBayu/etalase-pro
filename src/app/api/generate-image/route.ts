import { NextRequest, NextResponse } from "next/server";
import { generateImage } from "@/lib/gemini";
import { buildAiPrompt } from "@/lib/prompt-builder";
import type { GenerateImagePayload } from "@/types";

export async function POST(req: NextRequest) {
  try {
    const body: GenerateImagePayload = await req.json();
    const {
      base64Image,
      base64Image2,
      referenceBase64,
      settings,
      category,
      styleConfig,
    } = body;

    if (!base64Image) {
      return NextResponse.json(
        { error: "base64Image is required" },
        { status: 400 }
      );
    }

    const hasImage2 = Boolean(base64Image2);
    const hasReference =
      styleConfig.generateTab === "Custom" && Boolean(referenceBase64);

    const prompt = buildAiPrompt(
      category,
      {
        selectedStyle: styleConfig.selectedStyle as
          | import("@/types").FashionStyleName
          | null,
        selectedPresetId: styleConfig.selectedPresetId,
        generateTab: styleConfig.generateTab,
        gender: styleConfig.gender,
        age: styleConfig.age,
        activePresetTab: styleConfig.activePresetTab,
      },
      settings,
      hasImage2,
      hasReference
    );

    const { imageBase64 } = await generateImage(
      prompt,
      base64Image,
      base64Image2,
      hasReference ? referenceBase64 : undefined
    );

    return NextResponse.json({
      imageBase64,
      dataUrl: `data:image/png;base64,${imageBase64}`,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Internal server error";
    const status = message.includes("429") ? 429 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
