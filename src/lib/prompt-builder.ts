// Server-side only — used by API routes

import { CATEGORIES } from "@/config/categories";
import { STYLE_DESCRIPTORS, NON_FASHION_PRESETS } from "@/config/styles";
import { VISUAL_EFFECT_OPTIONS } from "@/config/options";
import type {
  CategoryId,
  FashionGender,
  FashionAge,
  FashionStyleName,
  GenerateTab,
  PresetTab,
  AppSettings,
} from "@/types";

export interface StyleConfig {
  selectedStyle: FashionStyleName | null;
  selectedPresetId: string | null;
  generateTab: GenerateTab;
  gender: FashionGender;
  age: FashionAge;
  activePresetTab: PresetTab;
}

export function buildAiPrompt(
  category: CategoryId,
  styleConfig: StyleConfig,
  settings: AppSettings,
  hasImage2: boolean,
  hasReference: boolean
): string {
  const categoryData = CATEGORIES.find((c) => c.id === category);
  const visualPrompt =
    VISUAL_EFFECT_OPTIONS.find((o) => o.id === settings.visualDensity)?.prompt ?? "";

  let prompt = `
--- DESIGN & COMPOSITION SYSTEM (CRITICAL) ---
Create the layout, visual hierarchy, typography, spacing, and composition FIRST, then generate the visual accordingly.

RULES:
1. Image and text must be designed as ONE unified system.
2. Typography is part of the composition, not a digital overlay.
3. Text must follow lighting, perspective, color harmony, and material logic of the scene.
4. Reserve intentional negative space for headline, subheadline, and CTA.
5. Ensure clear visual hierarchy and balanced alignment.
6. Text should feel printed, embedded, projected, or physically present in the scene.
7. Avoid floating, flat, or mismatched typography.
8. Avoid overcrowded visuals in text areas.

USER REQUEST:
Transform the product photo (Image 1)`;

  if (hasImage2) {
    prompt += ` and the second product photo (Image 2)`;
  }

  prompt += ` into a high-end marketing visual for ${categoryData?.name}.`;

  if (hasImage2) {
    prompt += `\nCOMPOSITION INSTRUCTION: Combine BOTH products into a single harmonious composition. They should look like they belong together in the same scene.`;
  }

  if (category === "fashion") {
    const styleDetail =
      STYLE_DESCRIPTORS[styleConfig.selectedStyle ?? ""] ??
      styleConfig.selectedStyle;
    prompt += `\nStyle Instruction: ${styleDetail}.
Target Audience: ${styleConfig.gender}, Age Group: ${styleConfig.age}.`;
  } else {
    if (styleConfig.generateTab === "Custom" && hasReference) {
      const refImageIndex = hasImage2 ? "Image 3" : "Image 2";
      prompt += `\n\nVISUAL REFERENCE INSTRUCTION: I have provided a reference image (${refImageIndex}). Please replicate the background style, composition, lighting, and mood of that reference image, but place MY PRODUCT(S) into that setting seamlessly.`;
    } else {
      // Find preset from NON_FASHION_PRESETS
      const allPresets = [
        ...NON_FASHION_PRESETS.Commercial,
        ...NON_FASHION_PRESETS.Lifestyle,
        ...NON_FASHION_PRESETS.Premium,
      ];
      const styleInfo = allPresets.find(
        (p) => p.id === styleConfig.selectedPresetId
      );

      if (styleInfo) {
        prompt += `\nOutput Style: ${styleInfo.name} (${styleInfo.desc})`;
        prompt += `\nVisual Description: ${styleInfo.prompt}`;

        const typographyInstruction =
          styleInfo.typography ??
          "Use premium high-end commercial aesthetic typography.";
        prompt += `\n- TYPOGRAPHY SPECIFICATION: ${typographyInstruction}`;
      }
    }
  }

  prompt += `\nEnvironment Detail: ${visualPrompt}

QUALITY: Ultra-high resolution, 8k, extreme sharpness, commercial high-fidelity grade.
CONSTRAINTS:
1. OBJECT ISOLATION: Isolate the main product(s) perfectly. CRITICAL: If the product is being held by a hand, REMOVE THE HAND AND FINGERS completely. Only the product should remain. Remove any original background.
2. REALISM: Product must be realistically integrated into the environment with natural lighting.
3. TYPOGRAPHY RULES: Zero typos. High-end aesthetic placement.`;

  if (
    settings.posterDetails &&
    (settings.details.headline.trim() !== "" ||
      settings.details.tagline.trim() !== "")
  ) {
    const d = settings.details;
    prompt += `\nRENDER TYPOGRAPHY:
- HEADLINE (Dominant): "${d.headline}"
- TAGLINE (Secondary): "${d.tagline}"`;

    if (d.feature1) prompt += `\n- Feature 1: "${d.feature1}"`;
    if (d.feature2) prompt += `\n- Feature 2: "${d.feature2}"`;
    if (d.feature3) prompt += `\n- Feature 3: "${d.feature3}"`;

    const delivery: string[] = [];
    if (d.cod) delivery.push("COD Available");
    if (d.instant) delivery.push("Instant Delivery");
    if (d.sameday) delivery.push("Same Day Delivery");
    if (delivery.length > 0)
      prompt += `\n- Delivery Badges/Icons: ${delivery.join(", ")}`;

    prompt += `\n- Font Style: Use premium high-end commercial aesthetic typography.
- Review as Art Director: Ensure text is not detached. Redesign composition until integrated.`;
  } else {
    prompt += `\nNEGATIVE CONSTRAINT: DO NOT add any text. Visual only output.`;
  }

  if (settings.additionalIdeas.trim() !== "") {
    prompt += `\nADDITIONAL CREATIVE IDEAS: ${settings.additionalIdeas}`;
  }

  prompt += `\nAspect ratio: ${settings.ratio}.`;

  return prompt;
}

export function getFullPromptsForPreview(
  category: CategoryId,
  styleConfig: StyleConfig,
  settings: AppSettings,
  hasImage2: boolean,
  hasReference: boolean
): string {
  let fullText = "";
  for (let i = 0; i < settings.count; i++) {
    fullText += `--- PROMPT GAMBAR ${i + 1} ---\n${buildAiPrompt(
      category,
      styleConfig,
      settings,
      hasImage2,
      hasReference
    )}\n\n`;
  }
  return fullText;
}
