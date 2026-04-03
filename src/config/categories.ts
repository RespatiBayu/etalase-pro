import {
  Shirt,
  Watch,
  Home,
  Smartphone,
  Sparkle,
  Utensils,
  Car,
  Dumbbell,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

export interface Category {
  id: string;
  name: string;
  icon: LucideIcon;
  color: string;
  prompt: string;
}

export const CATEGORIES: Category[] = [
  {
    id: "fashion",
    name: "Fashion",
    icon: Shirt,
    color: "bg-rose-100 text-rose-600",
    prompt:
      "high-end fashion editorial style, luxury studio lighting, sharp focus on fabric textures",
  },
  {
    id: "accessories",
    name: "Aksesoris & Koleksi",
    icon: Watch,
    color: "bg-amber-100 text-amber-600",
    prompt:
      "luxury accessory and jewelry photography, focus on fine materials, macro details, premium studio lighting",
  },
  {
    id: "home",
    name: "Produk Rumah & Dekorasi",
    icon: Home,
    color: "bg-emerald-100 text-emerald-600",
    prompt:
      "cozy interior design, warm natural sunlight, aesthetic home arrangement, cinematic depth of field",
  },
  {
    id: "tech",
    name: "Elektronik & Gadget",
    icon: Smartphone,
    color: "bg-blue-100 text-blue-600",
    prompt:
      "sleek tech product photography, neon accents, futuristic clean background, professional product lighting",
  },
  {
    id: "beauty",
    name: "Kecantikan & Kesehatan",
    icon: Sparkle,
    color: "bg-purple-100 text-purple-600",
    prompt:
      "soft beauty lighting, clean minimalist aesthetic, high-end skincare commercial look, fresh and glowing",
  },
  {
    id: "food",
    name: "Makanan & Minuman",
    icon: Utensils,
    color: "bg-orange-100 text-orange-600",
    prompt:
      "appetizing food photography, vibrant colors, rustic or modern plating, steam or water droplets for freshness",
  },
  {
    id: "automotive",
    name: "Otomotif",
    icon: Car,
    color: "bg-zinc-100 text-zinc-600",
    prompt:
      "professional automotive product photography, showroom lighting, sleek metallic reflections, high contrast, commercial car part aesthetic",
  },
  {
    id: "sports",
    name: "Olahraga & Outdoor",
    icon: Dumbbell,
    color: "bg-teal-100 text-teal-600",
    prompt:
      "dynamic sports and outdoor equipment photography, energetic atmosphere, high shutter speed look, rugged textures, adventure vibe",
  },
];
