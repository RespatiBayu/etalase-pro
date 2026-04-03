import {
  Layers,
  Ghost,
  Crown,
  Scissors,
  Box,
  Sun,
  Zap,
  Activity,
  Layout,
  Monitor,
  Camera,
  RotateCcw,
  FileText,
  Coffee,
  Film,
  Hand,
  Home,
  Trees,
  Armchair,
  BookOpen,
  Calendar,
  Bookmark,
  Moon,
  PenTool,
  Feather,
  Landmark,
  Circle,
  Award,
  AlertCircle,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

// ─── Fashion ────────────────────────────────────────────────────────────────

export interface FashionStyleDetail {
  icon: LucideIcon;
  desc: string;
}

export const FASHION_STYLES: string[] = [
  "Creative Flatlay",
  "Ghost 3D Fit",
  "Pro Model Look",
  "Boutique Hanger",
];

export const FASHION_STYLE_DETAILS: Record<string, FashionStyleDetail> = {
  "Creative Flatlay": { icon: Layers, desc: "Tatanan Artistik" },
  "Ghost 3D Fit": { icon: Ghost, desc: "Efek Invisible 3D" },
  "Pro Model Look": { icon: Crown, desc: "Pose Model Pro" },
  "Boutique Hanger": { icon: Scissors, desc: "Display Butik" },
};

export const STYLE_DESCRIPTORS: Record<string, string> = {
  "Creative Flatlay":
    "Fashion flat lay photography taken from directly above (overhead), neat and organized composition, clean minimalist background, soft and even diffused lighting, extreme focus on product shape and fabric textures.",
  "Ghost 3D Fit":
    "Fashion garment worn on a headless, full body **crystal-clear transparent glass mannequin**. The mannequin must be completely see-through, showcasing the 3D fit of the clothes. The mannequin is **posing dynamically like a professional fashion model** in a high-end photoshoot. **Styled with perfectly matching outfit pieces** (shoes, bottoms, accessories) to create an ideal look. Commercial fashion photography, studio lighting.",
  "Pro Model Look":
    "Fashion apparel worn on a **realistic high-end studio mannequin**. The mannequin is **striking a professional model pose**, simulating a real fashion photoshoot. **Paired with the most ideal and matching outfit elements** (shoes, pants, accessories) to complement the main product. Professional studio lighting, sharp details, premium catalog style.",
  "Boutique Hanger":
    "Fashion garment hanging realistically on a boutique hanger against a solid studio wall or clothing rack. Natural fabric draping affected by gravity, clearly attached to support (not floating), soft natural studio lighting with realistic shadows.",
};

// ─── Non-Fashion Presets ─────────────────────────────────────────────────────

export interface NonFashionPreset {
  id: string;
  name: string;
  icon: LucideIcon;
  desc: string;
  prompt: string;
  typography?: string;
}

export type PresetTab = "Commercial" | "Lifestyle" | "Premium";

export const NON_FASHION_PRESETS: Record<PresetTab, NonFashionPreset[]> = {
  Commercial: [
    {
      id: "std_catalog",
      name: "Produk Katalog",
      icon: Box,
      desc: "Background Putih Polos",
      prompt:
        "Studio product catalog photography, completely pure white background (#FFFFFF), perfectly isolated product, soft and even studio lighting, high fidelity, standard e-commerce marketplace ready.",
      typography:
        "Modern Sans-Serif, Black or Dark Grey color, Medium weight, Clean and legible. No effects.",
    },
    {
      id: "clean_white",
      name: "Clean White Hero",
      icon: Box,
      desc: "Profesional, Aman, Trusted",
      prompt:
        "Product on pure white background, soft even lighting, very subtle shadow, super sharp details, professional marketplace catalog style.",
      typography:
        "Minimalist Sans-Serif, Dark Blue or Charcoal, Bold Headline, clean layout, corporate feel.",
    },
    {
      id: "high_key",
      name: "High-Key Bright",
      icon: Sun,
      desc: "Modern, Bersih, Fresh",
      prompt:
        "High-key photography, bright layered lighting, minimal shadows, vibrant and fresh product colors, white or very light grey background.",
      typography:
        "Thin Modern Sans-Serif, Bright colors (Cyan or Orange) or Black, Spacious kerning, Fresh and airy.",
    },
    {
      id: "premium_spotlight",
      name: "Premium Spotlight",
      icon: Zap,
      desc: "Eksklusif, Mahal, Fokus",
      prompt:
        "Single spotlight source on product, dark or neutral background, high contrast, dramatic shadows, exclusive luxury feel.",
      typography:
        "Elegant Serif (Bodoni/Didot), White or Gold, Centered alignment, High contrast.",
    },
    {
      id: "flat_lay",
      name: "Flat Lay Commercial",
      icon: Layers,
      desc: "Informatif, Estetik",
      prompt:
        "Top-down view (flat lay), neat composition, minimal props, soft lighting, clean and aesthetic arrangement.",
      typography:
        "Geometric Sans-Serif, Pastel or Neutral colors, Small font size, Grid-based layout.",
    },
    {
      id: "sharp_shadow",
      name: "Sharp Shadow",
      icon: Activity,
      desc: "Bold, Kuat Secara Visual",
      prompt:
        "Hard lighting creating sharp and defined shadows, bold and confident visual style, solid color background.",
      typography:
        "Bold/Black weight Sans-Serif, High contrast color (White on color or Black on color), Impactful.",
    },
    {
      id: "gradient_bg",
      name: "Gradient Ads",
      icon: Layout,
      desc: "Modern, Digital Friendly",
      prompt:
        "Soft color gradient background, smooth lighting on product, modern digital advertisement aesthetic.",
      typography:
        "Rounded Sans-Serif, White or complementary gradient color, Modern app-style typography.",
    },
    {
      id: "reflective",
      name: "Reflective Surface",
      icon: Monitor,
      desc: "Premium, Futuristik",
      prompt:
        "Product placed on a glossy reflective surface, elegant reflections, clean studio lighting, premium look.",
      typography:
        "Sleek Thin Sans-Serif, Metallic Silver or White, Futuristic spacing.",
    },
    {
      id: "macro_detail",
      name: "Macro Detail",
      icon: Camera,
      desc: "Quality, Craftsmanship",
      prompt:
        "Close-up macro photography focus on texture and material details, shallow depth of field, high quality craftsmanship feel.",
      typography:
        "Small, unobtrusive Sans-Serif, White with shadow, placed in corner to not hide details.",
    },
    {
      id: "dynamic_angle",
      name: "Dynamic Angle",
      icon: RotateCcw,
      desc: "Aktif, Energik",
      prompt:
        "Tilted or dynamic camera angle, dramatic perspective, sense of motion and energy, eye-catching sales shot.",
      typography:
        "Italicized Bold Sans-Serif, Slanted orientation matching the product angle, Energetic colors (Red/Yellow).",
    },
    {
      id: "shadowless",
      name: "Shadowless Catalog",
      icon: FileText,
      desc: "Netral, Jelas, Spesifikasi",
      prompt:
        "Super even lighting, absolutely no shadows, neutral look, pure focus on product specifications and clarity.",
      typography: "Standard Roboto/Arial style, Black, Very organized list style.",
    },
  ],
  Lifestyle: [
    {
      id: "natural_life",
      name: "Natural Lifestyle",
      icon: Coffee,
      desc: "Real, Dekat, Relatable",
      prompt:
        "Product in a natural home environment (table, kitchen, or living room), soft natural daylight, authentic lifestyle vibe.",
    },
    {
      id: "cinematic_mood",
      name: "Cinematic Moody",
      icon: Film,
      desc: "Emosional, Story-driven",
      prompt:
        "Cinematic film still look, moody dark tones, soft contrast, emotional storytelling atmosphere.",
    },
    {
      id: "human_touch",
      name: "Human Interaction",
      icon: Hand,
      desc: "Hidup, Autentik",
      prompt:
        "Lifestyle shot featuring a human hand holding or interacting with the product naturally, blurred background.",
    },
    {
      id: "morning_light",
      name: "Morning Light",
      icon: Sun,
      desc: "Fresh, Calm, Positif",
      prompt:
        "Soft morning sunlight streaming through a window, warm highlights, long soft shadows, fresh and calm mood.",
    },
    {
      id: "everyday_use",
      name: "Everyday Use",
      icon: Home,
      desc: 'Fungsional, "Butuh Ini"',
      prompt:
        "Product shown in active use in a daily life context, realistic setting, demonstrating functionality.",
    },
    {
      id: "outdoor_light",
      name: "Outdoor Natural",
      icon: Trees,
      desc: "Fresh, Bebas, Natural",
      prompt:
        "Product photographed outdoors, bright natural sunlight, nature background (park, sky, or garden), fresh air feel.",
    },
    {
      id: "cozy_warm",
      name: "Cozy Warm",
      icon: Armchair,
      desc: "Nyaman, Homey",
      prompt:
        "Warm indoor lighting, cozy textures (blankets, wood), inviting and comfortable home atmosphere.",
    },
    {
      id: "editorial_mag",
      name: "Editorial Mag",
      icon: BookOpen,
      desc: "Stylish, Aspirational",
      prompt:
        "Fashion magazine editorial style, artistic composition, trendy props, aspirational visual storytelling.",
    },
    {
      id: "seasonal",
      name: "Seasonal Theme",
      icon: Calendar,
      desc: "Relevan, Timely",
      prompt:
        "Seasonal atmosphere (e.g., festive, summer, or rainy mood), relevant props and lighting tone.",
    },
    {
      id: "brand_story",
      name: "Brand Story",
      icon: Bookmark,
      desc: "Naratif, Kuat",
      prompt:
        "Visual storytelling composition, props that tell the brand's origin or values, meaningful arrangement.",
    },
  ],
  Premium: [
    {
      id: "dark_luxury",
      name: "Dark Luxury",
      icon: Moon,
      desc: "Mahal, Eksklusif",
      prompt:
        "Deep black background, subtle rim lighting (sculpting light), product emerging from shadows, elegant and expensive look.",
    },
    {
      id: "artistic",
      name: "Artistic Concept",
      icon: PenTool,
      desc: "Berkelas, Simbolik",
      prompt:
        "Abstract and artistic composition, minimalist props, focus on mood and concept rather than literal context.",
    },
    {
      id: "sculpting",
      name: "Sculpting Light",
      icon: Zap,
      desc: "Powerful, Iconic",
      prompt:
        "High contrast lighting that sculpts the volume of the product, dramatic interplay of light and shadow, statuesque look.",
    },
    {
      id: "editorial_fash",
      name: "Editorial Fashion",
      icon: Camera,
      desc: "Trendy, Premium",
      prompt:
        "High-end fashion shoot lighting, sophisticated and edgy look, sharp and clean.",
    },
    {
      id: "minimal_zen",
      name: "Minimal Luxury",
      icon: Feather,
      desc: "Calm, Expensive Silence",
      prompt:
        "Ultra minimalist composition, lots of negative space, soft neutral colors, zen and peaceful luxury.",
    },
    {
      id: "glass_art",
      name: "Glass Art",
      icon: Layers,
      desc: "Futuristik, High-Class",
      prompt:
        "Product placed on or behind glass/acrylic elements, artistic reflections and refractions, modern high-class vibe.",
    },
    {
      id: "gold_accent",
      name: "Gold Accent",
      icon: AlertCircle,
      desc: "Royal, Prestige",
      prompt:
        "Warm lighting with golden accents in the background or props, rich and prestigious atmosphere.",
    },
    {
      id: "museum",
      name: "Museum Display",
      icon: Landmark,
      desc: "Bernilai, Timeless",
      prompt:
        "Product displayed like a museum artifact, spotlight on pedestal, neutral elegant background, timeless value.",
    },
    {
      id: "monochrome",
      name: "Monochrome Lux",
      icon: Circle,
      desc: "Elegan, Sophisticated",
      prompt:
        "Monochromatic color palette (shades of one color), strong texture details, sophisticated and unified look.",
    },
    {
      id: "iconic_hero",
      name: "Iconic Hero",
      icon: Award,
      desc: "Legendary, Top-Tier",
      prompt:
        "Epic hero shot, low angle, imposing presence, perfect lighting, representing the brand's top-tier status.",
    },
  ],
};
