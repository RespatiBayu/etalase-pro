import {
  ArrowUpLeft,
  ArrowUp,
  ArrowUpRight,
  ArrowDownLeft,
  ArrowDown,
  ArrowDownRight,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

// ─── Font Options ────────────────────────────────────────────────────────────

export interface FontOption {
  id: string;
  name: string;
  desc: string;
}

export const FONT_OPTIONS: FontOption[] = [
  { id: "Default", name: "Default High-End", desc: "Gaya estetis komersial standar" },
  { id: "Zen Type", name: "Zen Type", desc: "Minimalis, huruf sederhana, jarak lega, tenang & elegan" },
  { id: "Brush Vibes", name: "Brush Vibes", desc: "Efek sapuan kuas, dinamis, tekstur organik, ekspresif" },
  { id: "Velocity Wave", name: "Velocity Wave", desc: "Efek gelombang cepat, garis mengalir, energi modern" },
  { id: "Chunk Style", name: "Chunk Style", desc: "Huruf tebal & besar, bentuk solid, kuat & berani" },
  { id: "Flow Script", name: "Flow Script", desc: "Tulisan tangan mengalir, lekukan halus, elegan & personal" },
  { id: "Power Block", name: "Power Block", desc: "Bentuk blok tegas, kontras tinggi, kokoh & profesional" },
  { id: "Rhythm Groove", name: "Rhythm Groove", desc: "Ritme visual dinamis, variasi bentuk, fun & musikal" },
  { id: "Bounce Letters", name: "Bounce Letters", desc: "Huruf melompat playful, ceria & energik" },
  { id: "Sketch Notes", name: "Sketch Notes", desc: "Gaya coretan sketsa, kasual, spontan & kreatif" },
  { id: "Luxe Serif", name: "Luxe Serif", desc: "Font serif mewah, detail elegan, premium & klasik" },
  { id: "Curve Flow", name: "Curve Flow", desc: "Alur lengkung halus, komposisi fleksibel, modern & smooth" },
  { id: "Cinematic Glow Text", name: "Cinematic Glow Text", desc: "Efek cahaya sinematik, glow lembut, dramatis & premium" },
  { id: "Pastel 3D Puff", name: "Pastel 3D Puff", desc: "3D lembut warna pastel, efek empuk, playful" },
  { id: "Digital Glitch Title", name: "Digital Glitch Title", desc: "Efek glitch digital, distorsi halus, futuristik & edgy" },
];

// ─── Visual Effect Options ───────────────────────────────────────────────────

export interface VisualEffectOption {
  id: string;
  name: string;
  desc: string;
  prompt: string;
}

export const VISUAL_EFFECT_OPTIONS: VisualEffectOption[] = [
  {
    id: "Bersih",
    name: "Bersih",
    desc: "Fokus Produk aja, Polos",
    prompt:
      "Minimalist, plain studio background, maximum product focus, zero distractions, professional product shot.",
  },
  {
    id: "Natural",
    name: "Natural",
    desc: "Ada Sedikit Hiasan, Pas",
    prompt:
      "Subtle natural ornaments, aesthetic background details, balanced props, soft environment.",
  },
  {
    id: "Rame",
    name: "Rame",
    desc: "Full Dekorasi, Meriah",
    prompt:
      "Rich and dense decorations, full ornamental details, festive and vibrant background composition, high energy.",
  },
];

// ─── CTA Options ─────────────────────────────────────────────────────────────

export const CTA_OPTIONS: string[] = [
  "Buy Now",
  "Get Now",
  "Order Now",
  "Spesial Price",
  "Limited Stock",
];

// ─── Logo Position Options ────────────────────────────────────────────────────

export interface LogoOption {
  id: string;
  name: string;
  icon: LucideIcon;
  desc: string;
  positionClass: string;
}

export const LOGO_OPTIONS: LogoOption[] = [
  { id: "tl", name: "Top Left", icon: ArrowUpLeft, desc: "Kiri Atas", positionClass: "top-3 left-3 md:top-4 md:left-4" },
  { id: "tc", name: "Top Center", icon: ArrowUp, desc: "Tengah Atas", positionClass: "top-3 left-1/2 -translate-x-1/2 md:top-4" },
  { id: "tr", name: "Top Right", icon: ArrowUpRight, desc: "Kanan Atas", positionClass: "top-3 right-3 md:top-4 md:right-4" },
  { id: "bl", name: "Bottom Left", icon: ArrowDownLeft, desc: "Kiri Bawah", positionClass: "bottom-3 left-3 md:bottom-4 md:left-4" },
  { id: "bc", name: "Bottom Center", icon: ArrowDown, desc: "Tengah Bawah", positionClass: "bottom-3 left-1/2 -translate-x-1/2 md:bottom-4" },
  { id: "br", name: "Bottom Right", icon: ArrowDownRight, desc: "Kanan Bawah", positionClass: "bottom-3 right-3 md:bottom-4 md:right-4" },
];

// ─── Aspect Ratio Options ─────────────────────────────────────────────────────

export interface RatioOption {
  id: string;
  name: string;
  aspectClass: string;
}

export const RATIOS: RatioOption[] = [
  { id: "1:1", name: "1:1 Square", aspectClass: "aspect-square" },
  { id: "9:16", name: "9:16 Portrait", aspectClass: "aspect-[9/16]" },
  { id: "16:9", name: "16:9 Landscape", aspectClass: "aspect-video" },
  { id: "3:4", name: "3:4 Portrait", aspectClass: "aspect-[3/4]" },
];
