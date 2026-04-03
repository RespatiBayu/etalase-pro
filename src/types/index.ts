// ─── Wizard Steps ─────────────────────────────────────────────────────────────

export type WizardStep = 1 | 2 | 3 | 4 | 5;

// ─── Category ────────────────────────────────────────────────────────────────

export type CategoryId =
  | "fashion"
  | "accessories"
  | "home"
  | "tech"
  | "beauty"
  | "food"
  | "automotive"
  | "sports";

// ─── Fashion ─────────────────────────────────────────────────────────────────

export type FashionGender = "Pria" | "Wanita" | "Unisex";
export type FashionAge = "Dewasa" | "Remaja" | "Anak-Anak" | "Balita";
export type FashionStyleName =
  | "Creative Flatlay"
  | "Ghost 3D Fit"
  | "Pro Model Look"
  | "Boutique Hanger";

// ─── Non-Fashion ─────────────────────────────────────────────────────────────

export type PresetTab = "Commercial" | "Lifestyle" | "Premium";
export type GenerateTab = "Preset" | "Custom";

// ─── Settings ────────────────────────────────────────────────────────────────

export type VisualDensity = "Bersih" | "Natural" | "Rame";
export type LogoPlacement = "tl" | "tc" | "tr" | "bl" | "bc" | "br";
export type AspectRatio = "1:1" | "9:16" | "16:9" | "3:4";
export type VariationCount = 1 | 2 | 4;

export interface PosterDetails {
  headline: string;
  tagline: string;
  feature1: string;
  feature2: string;
  feature3: string;
  cod: boolean;
  instant: boolean;
  sameday: boolean;
  price: string;
  promoPrice: string;
  cta: string;
  fontStyle: string;
  whatsapp: string;
  instagram: string;
  website: string;
  shopee: boolean;
  tokopedia: boolean;
  tiktok: boolean;
}

export interface AppSettings {
  count: VariationCount;
  ratio: AspectRatio;
  density: VisualDensity;
  posterDetails: boolean;
  details: PosterDetails;
  logo: boolean;
  logoPlacement: LogoPlacement;
  visualDensity: VisualDensity;
  additionalIdeas: string;
}

// ─── Project State ────────────────────────────────────────────────────────────

export interface ProjectState {
  // Step 1
  selectedCategory: CategoryId | null;
  uploadedImage: string | null;
  base64Image: string | null;
  uploadedImage2: string | null;
  base64Image2: string | null;

  // Step 2 — Fashion
  selectedStyle: FashionStyleName;
  selectedGender: FashionGender;
  selectedAge: FashionAge;

  // Step 2 — Non-Fashion
  activePresetTab: PresetTab;
  selectedPresetId: string;
  generateTab: GenerateTab;
  referenceImage: string | null;
  referenceBase64: string | null;

  // Step 3
  settings: AppSettings;
  logoImage: string | null;
  logoBase64: string | null;

  // Step 5
  generatedResults: string[];
  caption: string;
}

// ─── API Payloads ─────────────────────────────────────────────────────────────

export interface GenerateImagePayload {
  base64Image: string;
  base64Image2?: string;
  referenceBase64?: string;
  settings: AppSettings;
  category: CategoryId;
  styleConfig: {
    selectedStyle: string | null;
    selectedPresetId: string | null;
    generateTab: GenerateTab;
    gender: FashionGender;
    age: FashionAge;
    activePresetTab: PresetTab;
  };
}

export interface GenerateTextPayload {
  base64Image: string;
}

export interface GenerateTextResult {
  headline: string;
  tagline: string;
  feature1: string;
  feature2: string;
  feature3: string;
}

export interface GenerateCaptionPayload {
  base64Image: string;
  details: PosterDetails;
}

export interface GenerateCaptionResult {
  caption: string;
}

// ─── Warning Modal ────────────────────────────────────────────────────────────

export type WarningModalMode = "back" | "reset";

export interface WarningModalState {
  show: boolean;
  mode: WarningModalMode | "";
}
