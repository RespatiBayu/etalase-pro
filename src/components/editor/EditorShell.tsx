"use client";

import { useRef, useState, useCallback, useEffect } from "react";
import {
  Upload, Trash2, Loader2, Wand2, Palette, Type,
  Download, RotateCcw, Zap, Check, Image as ImageIcon,
  AlertCircle, ChevronDown, ChevronRight, AlignLeft,
  AlignCenter, AlignRight, Bold, Italic, X, Plus,
  Layers, Tag, Save, FolderOpen, Clock, Pencil,
} from "lucide-react";
// Regular import is safe — FabricCanvas has "use client" and no top-level
// fabric imports (fabric is lazy-loaded inside useEffect/handlers only).
// Using next/dynamic breaks forwardRef so fabricRef.current stays null.
import FabricCanvas from "./FabricCanvas";
import type { FabricHandle, TextStyle, LogoPosition } from "./FabricCanvas";

// ─── Config ───────────────────────────────────────────────────────────────────

const CANVAS_BY_RATIO: Record<string, { w: number; h: number }> = {
  "1:1":  { w: 480, h: 480 },
  "9:16": { w: 270, h: 480 },
  "2:1":  { w: 480, h: 240 },
};

const RATIOS = [
  { id: "1:1",  label: "1:1",   sub: "Square" },
  { id: "9:16", label: "9:16",  sub: "Story" },
  { id: "2:1",  label: "2:1",   sub: "Landscape" },
];

const BG_COLORS = [
  "#FFFFFF", "#1A1A1A", "#F0F0F0", "#FFF8F0",
  "#1E3A5F", "#DBEAFE", "#DCFCE7", "#FEF9C3",
  "#FCE7F3", "#EDE9FE",
];

const LATAR_AI_STYLES = [
  { id: "suasana",     name: "Suasana",           emoji: "🌅", prompt: "Beautiful atmospheric lifestyle environment, warm ambient lighting, bokeh background, professional product photography setting." },
  { id: "meja_dapur",  name: "Meja Dapur",         emoji: "🍽️", prompt: "Clean kitchen countertop, natural wood textures, soft morning light, cooking lifestyle aesthetic, neutral tones." },
  { id: "interior",    name: "Interior",           emoji: "🛋️", prompt: "Modern interior design background, cozy home setting, natural daylight, elegant furniture context, warm neutral palette." },
  { id: "tekstur",     name: "Tekstur",            emoji: "🪨", prompt: "Premium textured background, stone marble or concrete surface, sophisticated minimalist material, studio lighting." },
  { id: "event",       name: "Event",              emoji: "🎉", prompt: "Festive event atmosphere, bokeh party lights, celebratory backdrop, elegant decoration, warm glowing ambiance." },
  { id: "ornamen",     name: "Aksesoris/Ornamen",  emoji: "✨", prompt: "Elegant decorative ornaments and accessories as background props, luxury arrangement, gold or silver accents, premium showcase." },
];

const FONT_OPTIONS = [
  "Inter", "Poppins", "Montserrat", "Roboto",
  "Playfair Display", "Arial", "Georgia", "Verdana",
];

const MARKETPLACE_OPTIONS = ["Shopee", "Tokopedia", "TikTok Shop", "Lazada", "Blibli"];
const SOSMED_OPTIONS      = ["Instagram", "TikTok", "Facebook", "YouTube", "Twitter/X"];

// ─── Badge Generator (offscreen canvas) ──────────────────────────────────────

function generateBadgePng(
  topLabel: string,
  bottomText: string,
  bgColor: string,
  textColor = "#FFFFFF"
): string {
  const c = document.createElement("canvas");
  c.width = 280; c.height = 80;
  const ctx = c.getContext("2d")!;
  // rounded rect
  const r = 16;
  ctx.beginPath();
  ctx.moveTo(r, 0); ctx.lineTo(c.width - r, 0);
  ctx.quadraticCurveTo(c.width, 0, c.width, r);
  ctx.lineTo(c.width, c.height - r);
  ctx.quadraticCurveTo(c.width, c.height, c.width - r, c.height);
  ctx.lineTo(r, c.height); ctx.quadraticCurveTo(0, c.height, 0, c.height - r);
  ctx.lineTo(0, r); ctx.quadraticCurveTo(0, 0, r, 0);
  ctx.closePath();
  ctx.fillStyle = bgColor;
  ctx.fill();
  // text
  ctx.fillStyle = textColor;
  ctx.textAlign = "center";
  ctx.font = "bold 13px Inter, Arial, sans-serif";
  ctx.fillText(topLabel.toUpperCase(), 140, 24);
  ctx.font = "bold 22px Inter, Arial, sans-serif";
  ctx.fillText(bottomText, 140, 58);
  return c.toDataURL("image/png");
}

// ─── Section accordion wrapper ────────────────────────────────────────────────

function Section({
  title, icon, defaultOpen = false,
  children,
}: {
  title: string;
  icon: React.ReactNode;
  defaultOpen?: boolean;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border-b border-orange-50 last:border-0">
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between px-4 py-3 hover:bg-orange-50/50 transition-all"
      >
        <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-orange-700">
          <span className="text-orange-400">{icon}</span>
          {title}
        </div>
        {open
          ? <ChevronDown size={13} className="text-orange-300" />
          : <ChevronRight size={13} className="text-orange-300" />
        }
      </button>
      {open && <div className="px-4 pb-4 space-y-3">{children}</div>}
    </div>
  );
}

// ─── Saved-state types ────────────────────────────────────────────────────────

interface EditorSavedState {
  version: 1;
  ratio: string;
  uploadedDataUrl: string | null;
  processedDataUrl: string | null;
  bgColor: string;
  bgImageUrl: string | null;
  headlineText: string;
  headlineStyle: TextStyle;
  taglineText: string;
  taglineStyle: TextStyle;
  logoDataUrl: string | null;
  logoPosition: LogoPosition;
  fiturList: string[];
  siapkanType: string;
  siapkanPlatform: string;
  siapkanText: string;
  diskonPct: string;
}

interface EditorProjectSummary {
  id: string;
  name: string;
  updatedAt: string;
  thumbnailUrl: string | null;
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function EditorShell() {
  const fabricRef = useRef<FabricHandle>(null);
  const [canvasReady, setCanvasReady] = useState(false);

  // ── Product state ──────────────────────────────────────────────────────────
  const [uploadedDataUrl, setUploadedDataUrl]     = useState<string | null>(null);
  const [processedDataUrl, setProcessedDataUrl]   = useState<string | null>(null);
  const [isRemoving, setIsRemoving]               = useState(false);
  const [removeStatus, setRemoveStatus]           = useState("");

  // ── Mode: satuan | batch ───────────────────────────────────────────────────
  const [mode, setMode] = useState<"satuan" | "batch">("satuan");

  // ── Batch state ────────────────────────────────────────────────────────────
  const [batchFiles, setBatchFiles]               = useState<{ orig: string; processed: string | null; name: string }[]>([]);
  const [batchProcessing, setBatchProcessing]     = useState(false);
  const [batchBgColor, setBatchBgColor]           = useState("#FFFFFF");
  const [batchBgTab, setBatchBgTab]               = useState<"hapus" | "warna">("hapus");

  // ── Background state ───────────────────────────────────────────────────────
  const [bgSubTab, setBgSubTab]   = useState<"ai" | "template" | "warna" | "upload">("warna");
  const [bgColor, setBgColor]     = useState("#FFFFFF");
  const [bgImageUrl, setBgImageUrl] = useState<string | null>(null);
  const [selectedAiStyle, setSelectedAiStyle]     = useState(LATAR_AI_STYLES[0].id);
  const [isGeneratingAI, setIsGeneratingAI]       = useState(false);
  const [aiError, setAiError]                     = useState("");
  const [tokenBalance, setTokenBalance]           = useState<number | null>(null);

  // ── Teks state ─────────────────────────────────────────────────────────────
  const [headlineText, setHeadlineText]     = useState("");
  const [headlineStyle, setHeadlineStyle]   = useState<TextStyle>({
    fontSize: 40, fontFamily: "Poppins", fontWeight: "bold",
    fontStyle: "normal", textAlign: "center", fill: "#FFFFFF",
    topFrac: 0.78,
  });
  const [taglineText, setTaglineText]       = useState("");
  const [taglineStyle, setTaglineStyle]     = useState<TextStyle>({
    fontSize: 22, fontFamily: "Poppins", fontWeight: "normal",
    fontStyle: "normal", textAlign: "center", fill: "#FFFFFF",
    topFrac: 0.88,
  });

  // ── Overlay / Logo state ───────────────────────────────────────────────────
  const [logoDataUrl, setLogoDataUrl]       = useState<string | null>(null);
  const [logoPosition, setLogoPosition]     = useState<LogoPosition>("br");

  // ── Siapkan state ──────────────────────────────────────────────────────────
  const [siapkanType, setSiapkanType]       = useState<"marketplace" | "sosmed" | "wa" | "promo" | "diskon">("marketplace");
  const [siapkanPlatform, setSiapkanPlatform] = useState(MARKETPLACE_OPTIONS[0]);
  const [siapkanText, setSiapkanText]       = useState("");
  const [diskonPct, setDiskonPct]           = useState("50");

  // ── Input / Fitur state ────────────────────────────────────────────────────
  const [fiturList, setFiturList]           = useState<string[]>(["", "", ""]);

  // ── Ratio ─────────────────────────────────────────────────────────────────
  const [ratio, setRatio]                   = useState("1:1");
  const { w, h } = CANVAS_BY_RATIO[ratio] ?? CANVAS_BY_RATIO["1:1"];

  // ── Project save/load ─────────────────────────────────────────────────────
  const [currentProjectId, setCurrentProjectId] = useState<string | null>(null);
  const [projectName, setProjectName]           = useState("Proyek Editor");
  const [saveStatus, setSaveStatus]             = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [showProjectsModal, setShowProjectsModal] = useState(false);
  const [savedProjects, setSavedProjects]       = useState<EditorProjectSummary[]>([]);
  const [loadingProjectId, setLoadingProjectId] = useState<string | null>(null);
  const [projectsLoading, setProjectsLoading]   = useState(false);
  // Ref used by restore effect — avoids stale-closure issues
  const restoreStateRef = useRef<EditorSavedState | null>(null);
  const [restoreSignal, setRestoreSignal]       = useState(0);

  // ── Fetch token balance ────────────────────────────────────────────────────
  useEffect(() => {
    fetch("/api/tokens/balance")
      .then((r) => r.json())
      .then((d: { tokens?: number }) => setTokenBalance(d.tokens ?? 0))
      .catch(() => {});
  }, []);

  // ── Canvas lifecycle ────────────────────────────────────────────────────────
  const activeDataUrl = processedDataUrl ?? uploadedDataUrl;

  // Called by FabricCanvas once fabric is fully initialised (also on re-init)
  const handleCanvasReady = useCallback(() => {
    setCanvasReady(true);
  }, []);

  // Single source of truth: whenever canvas is ready AND we have an image, load it.
  // Also fires after ratio change because handleRatioChange resets canvasReady→false
  // then the new canvas sets it back to true via onReady.
  useEffect(() => {
    if (!canvasReady) return;
    if (!activeDataUrl) {
      fabricRef.current?.setBackground(bgColor);
      return;
    }
    fabricRef.current?.loadProduct(activeDataUrl);
    if (bgImageUrl) fabricRef.current?.setBackgroundImage(bgImageUrl);
    else fabricRef.current?.setBackground(bgColor);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [canvasReady, activeDataUrl]);

  // ── Ratio change ───────────────────────────────────────────────────────────
  // Reset canvasReady so the effect above waits for the new canvas to be ready
  const handleRatioChange = useCallback((newRatio: string) => {
    setCanvasReady(false);   // effect won't run until new canvas calls onReady
    setRatio(newRatio);
  }, []);

  // ── Upload product ─────────────────────────────────────────────────────────
  const handleProductUpload = useCallback((file: File) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const dataUrl = reader.result as string;
      // Clear overlays from previous session
      fabricRef.current?.removeById("headline");
      fabricRef.current?.removeById("tagline");
      fabricRef.current?.removeById("logo");
      fabricRef.current?.removeById("siapkan");
      fabricRef.current?.removeById("fitur");
      fabricRef.current?.clearBackgroundImage("#FFFFFF");
      // Update state — useEffect([canvasReady, activeDataUrl]) will load product
      setBgColor("#FFFFFF");
      setBgImageUrl(null);
      setHeadlineText("");
      setTaglineText("");
      setProcessedDataUrl(null);
      setUploadedDataUrl(dataUrl);   // ← this changes activeDataUrl → triggers effect
    };
    reader.readAsDataURL(file);
  }, []);

  // ── AI Background Removal via fal.ai nano-banana/edit ───────────────────────
  // Flow:
  //   1. POST /api/editor/remove-bg  → uploads image to fal.ai storage, calls
  //      fal-ai/nano-banana/edit with a remove-background prompt
  //   2. Returns a proper transparent PNG (alpha channel) — no chroma-key needed

  /** Calls fal.ai nano-banana/edit to remove background → returns transparent PNG data URL */
  const runAiRemoval = useCallback(async (sourceDataUrl: string): Promise<string> => {
    // Extract raw base64 (strip data:…;base64, prefix)
    const base64Image = sourceDataUrl.split(",")[1] ?? sourceDataUrl;

    const res = await fetch("/api/editor/remove-bg", {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify({ base64Image }),
    });

    if (!res.ok) {
      const body = await res.json().catch(() => ({})) as { error?: string };
      throw new Error(body.error ?? `Server error ${res.status}`);
    }

    const { imageUrl } = await res.json() as { imageUrl: string };
    // fal.ai returns a proper transparent PNG — use directly
    return imageUrl;
  }, []);

  const handleRemoveBg = useCallback(async () => {
    if (!uploadedDataUrl) return;
    setIsRemoving(true);
    setRemoveStatus("AI memproses gambar...");
    try {
      const result = await runAiRemoval(uploadedDataUrl);
      setProcessedDataUrl(result);
      setRemoveStatus("Selesai!");
    } catch (err) {
      console.error("[remove-bg]", err);
      setRemoveStatus(err instanceof Error ? err.message : "Gagal. Coba lagi.");
    } finally {
      setIsRemoving(false);
      setTimeout(() => setRemoveStatus(""), 4000);
    }
  }, [uploadedDataUrl, runAiRemoval]);

  // ── Background ─────────────────────────────────────────────────────────────
  const applyBgColor = useCallback((color: string) => {
    setBgColor(color);
    setBgImageUrl(null);
    fabricRef.current?.clearBackgroundImage(color);
  }, []);

  const handleBgImageUpload = useCallback((file: File) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const dataUrl = reader.result as string;
      setBgImageUrl(dataUrl);
      fabricRef.current?.setBackgroundImage(dataUrl);
    };
    reader.readAsDataURL(file);
  }, []);

  // stylePrompt = undefined → AI auto-analyze mode; string → template mode
  const handleLatarAI = useCallback(async (stylePrompt?: string) => {
    const imageDataUrl = processedDataUrl ?? uploadedDataUrl;
    if (!imageDataUrl) return;
    setIsGeneratingAI(true);
    setAiError("");
    try {
      const res  = await fetch(imageDataUrl);
      const blob = await res.blob();
      const base64 = await new Promise<string>((resolve) => {
        const r = new FileReader();
        r.onloadend = () => resolve((r.result as string).split(",")[1]);
        r.readAsDataURL(blob);
      });
      const response = await fetch("/api/editor/latar-ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        // stylePrompt omitted when undefined → server uses auto-analyze mode
        body: JSON.stringify({ base64Image: base64, stylePrompt, ratio }),
      });
      if (response.status === 402) {
        setAiError("Token tidak cukup. Beli token untuk menggunakan Latar AI.");
        return;
      }
      if (!response.ok) {
        const d = await response.json() as { error?: string };
        setAiError(d.error ?? "Gagal generate.");
        return;
      }
      const data = await response.json() as { imageUrl?: string };
      if (data.imageUrl) {
        setBgImageUrl(data.imageUrl);
        fabricRef.current?.setBackgroundImage(data.imageUrl);
        fetch("/api/tokens/balance")
          .then((r) => r.json())
          .then((d: { tokens?: number }) => setTokenBalance(d.tokens ?? 0))
          .catch(() => {});
      }
    } catch {
      setAiError("Terjadi kesalahan. Coba lagi.");
    } finally {
      setIsGeneratingAI(false);
    }
  }, [processedDataUrl, uploadedDataUrl, ratio]);

  // ── Teks ───────────────────────────────────────────────────────────────────
  const applyHeadline = useCallback((text: string, style: TextStyle) => {
    if (!text.trim()) {
      fabricRef.current?.removeById("headline");
    } else {
      fabricRef.current?.setTextById("headline", { ...style, text, topFrac: 0.75 });
    }
  }, []);

  const applyTagline = useCallback((text: string, style: TextStyle) => {
    if (!text.trim()) {
      fabricRef.current?.removeById("tagline");
    } else {
      fabricRef.current?.setTextById("tagline", {
        ...style,
        text,
        fontSize: Math.round((style.fontSize ?? 22)),
        topFrac: 0.87,
      });
    }
  }, []);

  // ── Logo overlay ───────────────────────────────────────────────────────────
  const handleLogoUpload = useCallback((file: File) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const dataUrl = reader.result as string;
      setLogoDataUrl(dataUrl);
      fabricRef.current?.setImageById("logo", dataUrl, { position: logoPosition, widthFrac: 0.22 });
    };
    reader.readAsDataURL(file);
  }, [logoPosition]);

  const applyLogoPosition = useCallback((pos: LogoPosition) => {
    setLogoPosition(pos);
    if (logoDataUrl) {
      fabricRef.current?.setImageById("logo", logoDataUrl, { position: pos, widthFrac: 0.22 });
    }
  }, [logoDataUrl]);

  // ── Siapkan badge ──────────────────────────────────────────────────────────
  const applySiapkan = useCallback(() => {
    let badge = "";
    if (siapkanType === "marketplace") {
      const colors: Record<string, string> = {
        "Shopee": "#EE4D2D", "Tokopedia": "#00AA5B",
        "TikTok Shop": "#000000", "Lazada": "#0F146D", "Blibli": "#0095DA",
      };
      badge = generateBadgePng(siapkanPlatform, siapkanText || "Nama Toko", colors[siapkanPlatform] ?? "#EE4D2D");
    } else if (siapkanType === "sosmed") {
      const colors: Record<string, string> = {
        "Instagram": "#E1306C", "TikTok": "#000000",
        "Facebook": "#1877F2", "YouTube": "#FF0000", "Twitter/X": "#1DA1F2",
      };
      badge = generateBadgePng(siapkanPlatform, `@${siapkanText || "handle"}`, colors[siapkanPlatform] ?? "#E1306C");
    } else if (siapkanType === "wa") {
      badge = generateBadgePng("WhatsApp", siapkanText || "08xxxxxxxxxx", "#25D366");
    } else if (siapkanType === "promo") {
      badge = generateBadgePng("🏷️", "PROMO", "#F59E0B");
    } else if (siapkanType === "diskon") {
      badge = generateBadgePng("DISKON", `${diskonPct}%`, "#EF4444");
    }
    if (badge) {
      fabricRef.current?.setImageById("siapkan", badge, { position: "tl", widthFrac: 0.32 });
    }
  }, [siapkanType, siapkanPlatform, siapkanText, diskonPct]);

  // ── Fitur & Benefit ────────────────────────────────────────────────────────
  const applyFitur = useCallback(() => {
    const lines = fiturList.filter((f) => f.trim());
    if (lines.length === 0) {
      fabricRef.current?.removeById("fitur");
      return;
    }
    const combined = lines.map((f) => `✦ ${f}`).join("\n");
    fabricRef.current?.setTextById("fitur", {
      text: combined,
      fontSize: 18,
      fontFamily: "Inter",
      fontWeight: "bold",
      fill: "#FFFFFF",
      textAlign: "left",
      topFrac: 0.12,
      leftFrac: 0.06,
      originX: "left",
      originY: "top",
      shadow: "1px 1px 4px rgba(0,0,0,0.6)",
    });
  }, [fiturList]);

  // ── Batch processing ───────────────────────────────────────────────────────
  const handleBatchUpload = useCallback((files: FileList) => {
    const arr = Array.from(files).slice(0, 10);
    const readers = arr.map(
      (file) =>
        new Promise<{ orig: string; processed: null; name: string }>((resolve) => {
          const r = new FileReader();
          r.onloadend = () =>
            resolve({ orig: r.result as string, processed: null, name: file.name });
          r.readAsDataURL(file);
        })
    );
    Promise.all(readers).then((items) => setBatchFiles(items));
  }, []);

  const handleBatchProcess = useCallback(async () => {
    if (batchFiles.length === 0) return;
    setBatchProcessing(true);
    // Process sequentially — WASM model runs in-browser, one at a time
    const results: typeof batchFiles = [];
    for (const item of batchFiles) {
      if (batchBgTab === "hapus") {
        try {
          const processed = await runAiRemoval(item.orig);
          results.push({ ...item, processed });
        } catch {
          results.push(item); // keep original on error
        }
      } else {
        results.push({ ...item, processed: item.orig });
      }
    }
    setBatchFiles(results);
    setBatchProcessing(false);
  }, [batchFiles, batchBgTab, runAiRemoval]);

  const downloadBatchItem = useCallback((dataUrl: string, name: string) => {
    const a = document.createElement("a");
    a.href = dataUrl;
    a.download = `ep-${name}`;
    a.click();
  }, []);

  // ── Project: build save state ──────────────────────────────────────────────
  const buildSaveState = useCallback((): EditorSavedState => ({
    version: 1,
    ratio,
    uploadedDataUrl,
    processedDataUrl,
    bgColor,
    bgImageUrl,
    headlineText,
    headlineStyle,
    taglineText,
    taglineStyle,
    logoDataUrl,
    logoPosition,
    fiturList,
    siapkanType,
    siapkanPlatform,
    siapkanText,
    diskonPct,
  }), [
    ratio, uploadedDataUrl, processedDataUrl, bgColor, bgImageUrl,
    headlineText, headlineStyle, taglineText, taglineStyle,
    logoDataUrl, logoPosition, fiturList, siapkanType,
    siapkanPlatform, siapkanText, diskonPct,
  ]);

  // ── Project: save ──────────────────────────────────────────────────────────
  const handleSaveProject = useCallback(async () => {
    setSaveStatus("saving");
    try {
      const state = buildSaveState();
      const stateJson = JSON.stringify(state);

      // Generate thumbnail from canvas
      const pngDataUrl = fabricRef.current?.exportPNG() ?? null;
      const thumbnailBase64 = pngDataUrl ? pngDataUrl.split(",")[1] : undefined;

      const res = await fetch("/api/editor/projects/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectId: currentProjectId ?? undefined,
          name: projectName,
          stateJson,
          thumbnailBase64,
        }),
      });

      if (!res.ok) throw new Error("Save failed");
      const { id } = await res.json() as { id: string };
      setCurrentProjectId(id);
      setSaveStatus("saved");
      setTimeout(() => setSaveStatus("idle"), 3000);
    } catch {
      setSaveStatus("error");
      setTimeout(() => setSaveStatus("idle"), 3000);
    }
  }, [buildSaveState, currentProjectId, projectName]);

  // ── Project: list ──────────────────────────────────────────────────────────
  const handleOpenProjects = useCallback(async () => {
    setShowProjectsModal(true);
    setProjectsLoading(true);
    try {
      const res = await fetch("/api/editor/projects");
      const data = await res.json() as { projects?: EditorProjectSummary[] };
      setSavedProjects(data.projects ?? []);
    } catch {
      setSavedProjects([]);
    } finally {
      setProjectsLoading(false);
    }
  }, []);

  // ── Project: load ──────────────────────────────────────────────────────────
  const handleLoadProject = useCallback(async (id: string) => {
    setLoadingProjectId(id);
    try {
      const res = await fetch(`/api/editor/projects/${id}`);
      if (!res.ok) throw new Error("Load failed");
      const { name, stateJson } = await res.json() as { name: string; stateJson: string };

      const s: EditorSavedState = JSON.parse(stateJson);

      // Store full state in ref before signalling the effect
      restoreStateRef.current = s;

      // Reset canvas overlays first
      fabricRef.current?.removeById("headline");
      fabricRef.current?.removeById("tagline");
      fabricRef.current?.removeById("logo");
      fabricRef.current?.removeById("siapkan");
      fabricRef.current?.removeById("fitur");

      // Batch-set all React state
      setCurrentProjectId(id);
      setProjectName(name);
      setRatio(s.ratio);
      setUploadedDataUrl(s.uploadedDataUrl);
      setProcessedDataUrl(s.processedDataUrl);
      setBgColor(s.bgColor);
      setBgImageUrl(s.bgImageUrl);
      setHeadlineText(s.headlineText);
      setHeadlineStyle(s.headlineStyle);
      setTaglineText(s.taglineText);
      setTaglineStyle(s.taglineStyle);
      setLogoDataUrl(s.logoDataUrl);
      setLogoPosition(s.logoPosition);
      setFiturList(s.fiturList);
      setSiapkanType(s.siapkanType as typeof siapkanType);
      setSiapkanPlatform(s.siapkanPlatform);
      setSiapkanText(s.siapkanText);
      setDiskonPct(s.diskonPct);

      // canvasReady might need resetting if ratio changed
      setCanvasReady(false);
      // Signal the restore effect (fires after canvas is ready again)
      setRestoreSignal((n) => n + 1);
      setShowProjectsModal(false);
    } catch {
      // noop — keep current state
    } finally {
      setLoadingProjectId(null);
    }
  }, []);

  // ── Project: delete ────────────────────────────────────────────────────────
  const handleDeleteProject = useCallback(async (id: string) => {
    await fetch(`/api/editor/projects/${id}`, { method: "DELETE" });
    setSavedProjects((prev) => prev.filter((p) => p.id !== id));
    if (currentProjectId === id) {
      setCurrentProjectId(null);
    }
  }, [currentProjectId]);

  // ── Restore effect: re-applies canvas overlays after project load ──────────
  // Runs when canvasReady becomes true AND restoreSignal was incremented.
  // We read from restoreStateRef (not stale React state closures).
  useEffect(() => {
    if (!restoreSignal || !canvasReady) return;
    const s = restoreStateRef.current;
    if (!s) return;
    restoreStateRef.current = null;

    // Background (product re-load is handled by the existing canvasReady effect)
    if (s.bgImageUrl) {
      fabricRef.current?.setBackgroundImage(s.bgImageUrl);
    } else {
      fabricRef.current?.setBackground(s.bgColor);
    }

    // Headline
    if (s.headlineText.trim()) {
      fabricRef.current?.setTextById("headline", { ...s.headlineStyle, text: s.headlineText, topFrac: 0.75 });
    }
    // Tagline
    if (s.taglineText.trim()) {
      fabricRef.current?.setTextById("tagline", { ...s.taglineStyle, text: s.taglineText, topFrac: 0.87 });
    }
    // Logo
    if (s.logoDataUrl) {
      fabricRef.current?.setImageById("logo", s.logoDataUrl, { position: s.logoPosition, widthFrac: 0.22 });
    }
    // Fitur list
    const lines = s.fiturList.filter((f) => f.trim());
    if (lines.length > 0) {
      fabricRef.current?.setTextById("fitur", {
        text: lines.map((f) => `✦ ${f}`).join("\n"),
        fontSize: 18, fontFamily: "Inter", fontWeight: "bold",
        fill: "#FFFFFF", textAlign: "left",
        topFrac: 0.12, leftFrac: 0.06,
        originX: "left", originY: "top",
        shadow: "1px 1px 4px rgba(0,0,0,0.6)",
      });
    }
    // Siapkan badge
    if (s.siapkanType && s.siapkanPlatform) {
      const colorMap: Record<string, string> = {
        "Shopee": "#EE4D2D", "Tokopedia": "#00AA5B", "TikTok Shop": "#000000",
        "Lazada": "#0F146D", "Blibli": "#0095DA",
        "Instagram": "#E1306C", "TikTok": "#000000",
        "Facebook": "#1877F2", "YouTube": "#FF0000", "Twitter/X": "#1DA1F2",
      };
      let badge = "";
      if (s.siapkanType === "marketplace") {
        badge = generateBadgePng(s.siapkanPlatform, s.siapkanText || "Nama Toko", colorMap[s.siapkanPlatform] ?? "#EE4D2D");
      } else if (s.siapkanType === "sosmed") {
        badge = generateBadgePng(s.siapkanPlatform, `@${s.siapkanText || "handle"}`, colorMap[s.siapkanPlatform] ?? "#E1306C");
      } else if (s.siapkanType === "wa") {
        badge = generateBadgePng("WhatsApp", s.siapkanText || "08xxxxxxxxxx", "#25D366");
      } else if (s.siapkanType === "promo") {
        badge = generateBadgePng("🏷️", "PROMO", "#F59E0B");
      } else if (s.siapkanType === "diskon") {
        badge = generateBadgePng("DISKON", `${s.diskonPct}%`, "#EF4444");
      }
      if (badge) {
        fabricRef.current?.setImageById("siapkan", badge, { position: "tl", widthFrac: 0.32 });
      }
    }
  // restoreSignal and canvasReady are the only deps we need — the ref carries the data
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [restoreSignal, canvasReady]);

  // ── Reset ──────────────────────────────────────────────────────────────────
  const handleReset = useCallback(() => {
    // Canvas operations first
    fabricRef.current?.clearProduct();
    fabricRef.current?.clearBackgroundImage("#FFFFFF");
    fabricRef.current?.removeById("headline");
    fabricRef.current?.removeById("tagline");
    fabricRef.current?.removeById("logo");
    fabricRef.current?.removeById("siapkan");
    fabricRef.current?.removeById("fitur");
    // Then reset state
    setUploadedDataUrl(null);
    setProcessedDataUrl(null);
    setBgColor("#FFFFFF");
    setBgImageUrl(null);
    setHeadlineText("");
    setTaglineText("");
    setLogoDataUrl(null);
    setFiturList(["", "", ""]);
    setAiError("");
    setCurrentProjectId(null);
    setProjectName("Proyek Editor");
    setSaveStatus("idle");
  }, []);

  // ── Download ───────────────────────────────────────────────────────────────
  const handleDownload = useCallback(() => {
    const dataUrl = fabricRef.current?.exportPNG();
    if (!dataUrl) return;
    const a = document.createElement("a");
    a.href = dataUrl;
    a.download = "etalase-pro-editor.png";
    a.click();
  }, []);

  // ─── Render ────────────────────────────────────────────────────────────────

  const LOGO_POSITIONS: { id: LogoPosition; label: string }[] = [
    { id: "tl", label: "↖" }, { id: "tc", label: "↑" }, { id: "tr", label: "↗" },
    { id: "bl", label: "↙" }, { id: "bc", label: "↓" }, { id: "br", label: "↘" },
  ];

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-[#FFF8F0]">

      {/* ── Projects Modal ────────────────────────────────────────────────── */}
      {showProjectsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-orange-900/20 backdrop-blur-sm p-4">
          <div className="bg-white rounded-[2rem] w-full max-w-md shadow-2xl shadow-orange-100 flex flex-col overflow-hidden max-h-[80vh]">
            {/* Header */}
            <div className="flex items-center justify-between p-5 border-b border-orange-100">
              <div className="flex items-center gap-2">
                <FolderOpen size={16} className="text-orange-400" />
                <h2 className="font-black text-orange-900 uppercase tracking-tight text-sm">Proyek Tersimpan</h2>
              </div>
              <button onClick={() => setShowProjectsModal(false)}
                className="w-8 h-8 flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-full transition-all">
                <X size={16} />
              </button>
            </div>
            {/* List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3" style={{ scrollbarWidth: "none" }}>
              {projectsLoading ? (
                <div className="flex items-center justify-center py-10 gap-2 text-orange-400">
                  <Loader2 size={18} className="animate-spin" />
                  <span className="text-[10px] font-bold uppercase tracking-widest">Memuat...</span>
                </div>
              ) : savedProjects.length === 0 ? (
                <div className="text-center py-10">
                  <FolderOpen size={32} className="text-orange-200 mx-auto mb-2" />
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Belum ada proyek tersimpan</p>
                </div>
              ) : (
                savedProjects.map((proj) => (
                  <div key={proj.id}
                    className="flex items-center gap-3 bg-orange-50/50 rounded-2xl p-3 border border-orange-100 hover:border-orange-300 transition-all">
                    {/* Thumbnail */}
                    <div className="w-14 h-14 rounded-xl overflow-hidden bg-slate-100 flex-shrink-0 border border-orange-100">
                      {proj.thumbnailUrl
                        // eslint-disable-next-line @next/next/no-img-element
                        ? <img src={proj.thumbnailUrl} alt={proj.name} className="w-full h-full object-cover" />
                        : <div className="w-full h-full flex items-center justify-center"><ImageIcon size={18} className="text-orange-200" /></div>
                      }
                    </div>
                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <p className="text-[11px] font-black text-orange-900 truncate">{proj.name}</p>
                      <p className="text-[9px] text-slate-400 flex items-center gap-1 mt-0.5">
                        <Clock size={9} />
                        {new Date(proj.updatedAt).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })}
                      </p>
                    </div>
                    {/* Actions */}
                    <div className="flex items-center gap-1.5 flex-shrink-0">
                      <button
                        onClick={() => handleLoadProject(proj.id)}
                        disabled={loadingProjectId === proj.id}
                        className="px-3 py-1.5 bg-orange-400 text-white rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-orange-500 transition-all active:scale-95 disabled:opacity-50 flex items-center gap-1">
                        {loadingProjectId === proj.id
                          ? <Loader2 size={10} className="animate-spin" />
                          : "Buka"
                        }
                      </button>
                      <button
                        onClick={() => handleDeleteProject(proj.id)}
                        className="w-7 h-7 flex items-center justify-center text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-all">
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── Left Panel ────────────────────────────────────────────────────── */}
      <div className="w-full md:w-72 flex-shrink-0 bg-white border-r border-orange-100 flex flex-col overflow-hidden">

        {/* ── Project save bar ──────────────────────────────────────────── */}
        <div className="p-3 border-b border-orange-100 bg-orange-50/30 space-y-2">
          {/* Project name row */}
          <div className="flex items-center gap-1.5">
            <Pencil size={10} className="text-orange-300 flex-shrink-0" />
            <input
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              className="flex-1 bg-transparent text-[10px] font-black text-orange-900 uppercase tracking-widest outline-none min-w-0 placeholder:text-orange-200"
              placeholder="Nama proyek..."
              maxLength={40}
            />
            {currentProjectId && (
              <span className="text-[7px] font-bold text-emerald-500 bg-emerald-50 px-1.5 py-0.5 rounded-full border border-emerald-100 flex-shrink-0">
                Tersimpan
              </span>
            )}
          </div>
          {/* Buttons row */}
          <div className="flex gap-1.5">
            <button onClick={handleSaveProject} disabled={saveStatus === "saving" || !uploadedDataUrl}
              className={`flex-1 flex items-center justify-center gap-1 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${
                saveStatus === "saved"
                  ? "bg-emerald-400 text-white"
                  : saveStatus === "error"
                  ? "bg-rose-400 text-white"
                  : saveStatus === "saving" || !uploadedDataUrl
                  ? "bg-orange-100 text-orange-300 cursor-not-allowed"
                  : "bg-orange-400 text-white hover:bg-orange-500 active:scale-95"
              }`}>
              {saveStatus === "saving"
                ? <><Loader2 size={10} className="animate-spin" /> Menyimpan...</>
                : saveStatus === "saved"
                ? <><Check size={10} /> Tersimpan!</>
                : saveStatus === "error"
                ? "Gagal"
                : <><Save size={10} /> Simpan</>
              }
            </button>
            <button onClick={handleOpenProjects}
              className="flex items-center justify-center gap-1 px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest bg-white border border-orange-200 text-orange-500 hover:bg-orange-50 hover:border-orange-400 active:scale-95 transition-all">
              <FolderOpen size={10} /> Buka
            </button>
          </div>
        </div>

        {/* Mode tabs */}
        <div className="flex border-b border-orange-100">
          {(["satuan", "batch"] as const).map((m) => (
            <button key={m} onClick={() => setMode(m)}
              className={`flex-1 py-3 text-[10px] font-black uppercase tracking-widest transition-all ${
                mode === m
                  ? "text-orange-600 border-b-2 border-orange-400 bg-orange-50/50"
                  : "text-slate-400 hover:text-orange-400"
              }`}
            >
              {m === "satuan" ? "Edit Satuan" : "Edit Batch"}
            </button>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto" style={{ scrollbarWidth: "none" }}>

          {/* ── EDIT SATUAN ────────────────────────────────────────────── */}
          {mode === "satuan" && (
            <>
              {/* Upload zone */}
              <div className="p-4 border-b border-orange-50">
                {!uploadedDataUrl ? (
                  <label className="block w-full aspect-video border-2 border-dashed border-orange-200 rounded-2xl flex flex-col items-center justify-center cursor-pointer hover:border-orange-400 hover:bg-orange-50/30 transition-all group">
                    <input type="file" accept="image/*" className="hidden"
                      onChange={(e) => { const f = e.target.files?.[0]; if (f) handleProductUpload(f); }} />
                    <div className="w-12 h-12 bg-orange-100 rounded-2xl flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                      <Upload size={20} className="text-orange-400" />
                    </div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-orange-400">Upload Foto Produk</p>
                    <p className="text-[9px] text-slate-400 mt-0.5">JPG / PNG / WEBP</p>
                  </label>
                ) : (
                  <div className="flex items-center gap-2">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={processedDataUrl ?? uploadedDataUrl} alt="Product"
                      className="w-14 h-14 object-contain rounded-xl border border-orange-100 bg-slate-50 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      {processedDataUrl && (
                        <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-600 text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full border border-emerald-100 mb-1">
                          <Check size={8} /> BG Dihapus
                        </span>
                      )}
                      <label className="block text-[9px] text-orange-500 font-bold cursor-pointer hover:text-orange-600 truncate">
                        <input type="file" accept="image/*" className="hidden"
                          onChange={(e) => { const f = e.target.files?.[0]; if (f) handleProductUpload(f); }} />
                        ↺ Ganti foto
                      </label>
                    </div>
                    <button onClick={handleReset}
                      className="w-8 h-8 flex items-center justify-center text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-all flex-shrink-0">
                      <Trash2 size={14} />
                    </button>
                  </div>
                )}
              </div>

              {/* 1. Hapus Latar */}
              <Section title="Hapus Latar" icon={<Wand2 size={13} />} defaultOpen={true}>
                <button onClick={handleRemoveBg} disabled={!uploadedDataUrl || isRemoving}
                  className={`w-full py-2.5 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all flex items-center justify-center gap-1.5 ${
                    !uploadedDataUrl || isRemoving
                      ? "bg-orange-50 text-orange-300 cursor-not-allowed"
                      : processedDataUrl
                      ? "bg-emerald-50 text-emerald-600 border border-emerald-200 hover:bg-emerald-100"
                      : "bg-orange-400 text-white shadow-lg shadow-orange-100 hover:bg-orange-500 active:scale-95"
                  }`}>
                  {isRemoving
                    ? <><Loader2 size={11} className="animate-spin" /> {removeStatus || "Memproses..."}</>
                    : processedDataUrl
                    ? <><Check size={11} /> Background Dihapus</>
                    : <><Wand2 size={11} /> Hapus Background</>
                  }
                </button>
                {/* Error/status message */}
                {!isRemoving && removeStatus && (
                  <p className={`text-[8px] text-center font-bold px-2 py-1 rounded-lg ${
                    removeStatus.startsWith("Selesai") ? "text-emerald-600 bg-emerald-50" : "text-rose-500 bg-rose-50"
                  }`}>{removeStatus}</p>
                )}
                <p className="text-[8px] text-slate-400 text-center">
                  Diproses oleh fal.ai. Cocok untuk semua jenis background.
                </p>
              </Section>

              {/* 2. Ubah Latar */}
              <Section title="Ubah Latar" icon={<Palette size={13} />}>
                {/* Sub-tabs */}
                <div className="flex bg-orange-50 p-0.5 rounded-xl gap-0.5 mb-2">
                  {(["warna", "ai", "template", "upload"] as const).map((t) => (
                    <button key={t} onClick={() => setBgSubTab(t)}
                      className={`flex-1 py-1 rounded-lg text-[8px] font-black uppercase tracking-widest transition-all ${
                        bgSubTab === t
                          ? "bg-white text-orange-600 shadow-sm border border-orange-100"
                          : "text-slate-400 hover:text-orange-400"
                      }`}>
                      {t === "warna" ? "Warna" : t === "ai" ? "AI✦" : t === "template" ? "Template" : "Upload"}
                    </button>
                  ))}
                </div>

                {/* Warna */}
                {bgSubTab === "warna" && (
                  <div className="space-y-2">
                    <div className="grid grid-cols-5 gap-1.5">
                      {BG_COLORS.map((c) => (
                        <button key={c} onClick={() => applyBgColor(c)} title={c}
                          className={`aspect-square rounded-lg border-2 transition-all hover:scale-110 ${
                            bgColor === c && !bgImageUrl
                              ? "border-orange-400 scale-110 shadow-md"
                              : "border-transparent"
                          }`}
                          style={{ backgroundColor: c, boxShadow: c === "#FFFFFF" ? "inset 0 0 0 1px #e5e7eb" : undefined }}
                        />
                      ))}
                    </div>
                    <div className="flex items-center gap-2">
                      <input type="color" value={bgColor}
                        onChange={(e) => applyBgColor(e.target.value)}
                        className="w-8 h-8 rounded-lg border border-orange-200 cursor-pointer p-0.5 bg-white" />
                      <span className="text-[9px] font-bold text-slate-500 flex-1">Warna custom</span>
                      <span className="text-[9px] text-slate-400">{bgColor}</span>
                    </div>
                  </div>
                )}

                {/* AI — auto-analyze & generate */}
                {bgSubTab === "ai" && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between bg-orange-50 rounded-lg px-2.5 py-1.5 border border-orange-100">
                      <span className="text-[9px] font-black text-orange-600 uppercase tracking-widest flex items-center gap-1">
                        <Zap size={10} className="text-orange-400" /> Latar AI
                      </span>
                      <span className="text-[9px] text-orange-400 font-bold">
                        1 token / generate {tokenBalance !== null ? `· sisa ${tokenBalance}` : ""}
                      </span>
                    </div>
                    {/* Description */}
                    <div className="bg-orange-50/60 border border-orange-100 rounded-xl p-3 space-y-1">
                      <p className="text-[9px] font-black text-orange-800 leading-tight">✦ AI Analisa Otomatis</p>
                      <p className="text-[8px] text-slate-500 leading-relaxed">
                        AI akan menganalisa produkmu secara otomatis dan memilih latar yang paling cocok tanpa perlu pilih gaya manual.
                      </p>
                    </div>
                    {aiError && (
                      <div className="flex items-start gap-1.5 bg-rose-50 border border-rose-100 rounded-xl p-2">
                        <AlertCircle size={11} className="text-rose-500 mt-0.5 flex-shrink-0" />
                        <p className="text-[8px] text-rose-600 font-bold leading-tight">{aiError}</p>
                      </div>
                    )}
                    {aiError.includes("Token") && (
                      <a href="/dashboard"
                        className="flex items-center justify-center gap-1 w-full py-2 rounded-xl bg-orange-400 text-white text-[9px] font-black uppercase tracking-widest hover:bg-orange-500 transition-all">
                        <Zap size={10} /> Beli Token
                      </a>
                    )}
                    {/* Auto-generate: no stylePrompt passed → server auto-analyzes */}
                    <button onClick={() => handleLatarAI()} disabled={isGeneratingAI || !uploadedDataUrl}
                      className={`w-full flex items-center justify-center gap-1.5 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all ${
                        isGeneratingAI || !uploadedDataUrl
                          ? "bg-orange-100 text-orange-300 cursor-not-allowed"
                          : "bg-orange-400 text-white shadow-lg shadow-orange-100 hover:bg-orange-500 active:scale-95"
                      }`}>
                      {isGeneratingAI
                        ? <><Loader2 size={11} className="animate-spin" /> Menganalisa...</>
                        : <><Wand2 size={11} /> Generate Otomatis</>
                      }
                    </button>
                  </div>
                )}

                {/* Template — 6 style cards (Suasana, Meja Dapur, dll.) */}
                {bgSubTab === "template" && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between bg-orange-50 rounded-lg px-2.5 py-1.5 border border-orange-100">
                      <span className="text-[9px] font-black text-orange-600 uppercase tracking-widest flex items-center gap-1">
                        <Layers size={10} className="text-orange-400" /> Pilih Gaya
                      </span>
                      <span className="text-[9px] text-orange-400 font-bold">
                        1 token / generate {tokenBalance !== null ? `· sisa ${tokenBalance}` : ""}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-1.5">
                      {LATAR_AI_STYLES.map((s) => (
                        <button key={s.id} onClick={() => setSelectedAiStyle(s.id)}
                          className={`p-2 rounded-xl border-2 text-left transition-all ${
                            selectedAiStyle === s.id
                              ? "border-orange-400 bg-orange-50 shadow-md shadow-orange-100"
                              : "border-orange-100 bg-white hover:border-orange-200"
                          }`}>
                          <span className="text-base block">{s.emoji}</span>
                          <p className="text-[8px] font-black text-orange-900 leading-tight mt-0.5">{s.name}</p>
                        </button>
                      ))}
                    </div>
                    {aiError && (
                      <div className="flex items-start gap-1.5 bg-rose-50 border border-rose-100 rounded-xl p-2">
                        <AlertCircle size={11} className="text-rose-500 mt-0.5 flex-shrink-0" />
                        <p className="text-[8px] text-rose-600 font-bold leading-tight">{aiError}</p>
                      </div>
                    )}
                    {aiError.includes("Token") && (
                      <a href="/dashboard"
                        className="flex items-center justify-center gap-1 w-full py-2 rounded-xl bg-orange-400 text-white text-[9px] font-black uppercase tracking-widest hover:bg-orange-500 transition-all">
                        <Zap size={10} /> Beli Token
                      </a>
                    )}
                    {/* Template mode: pass selected style's prompt */}
                    <button
                      onClick={() => {
                        const style = LATAR_AI_STYLES.find((s) => s.id === selectedAiStyle);
                        if (style) handleLatarAI(style.prompt);
                      }}
                      disabled={isGeneratingAI || !uploadedDataUrl}
                      className={`w-full flex items-center justify-center gap-1.5 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all ${
                        isGeneratingAI || !uploadedDataUrl
                          ? "bg-orange-100 text-orange-300 cursor-not-allowed"
                          : "bg-orange-400 text-white shadow-lg shadow-orange-100 hover:bg-orange-500 active:scale-95"
                      }`}>
                      {isGeneratingAI
                        ? <><Loader2 size={11} className="animate-spin" /> Generating...</>
                        : <><Wand2 size={11} /> Generate Template</>
                      }
                    </button>
                  </div>
                )}

                {/* Upload */}
                {bgSubTab === "upload" && (
                  <div className="space-y-2">
                    <label className="block w-full aspect-video border-2 border-dashed border-orange-200 rounded-2xl flex flex-col items-center justify-center cursor-pointer hover:border-orange-400 hover:bg-orange-50/30 transition-all overflow-hidden group">
                      <input type="file" accept="image/*" className="hidden"
                        onChange={(e) => { const f = e.target.files?.[0]; if (f) handleBgImageUpload(f); }} />
                      {bgImageUrl && bgSubTab === "upload"
                        ? <img src={bgImageUrl} alt="bg" className="w-full h-full object-cover" /> // eslint-disable-line
                        : <>
                            <ImageIcon size={20} className="text-orange-300 mb-1" />
                            <p className="text-[9px] font-black uppercase tracking-widest text-orange-400">Upload Latar</p>
                          </>
                      }
                    </label>
                    {bgImageUrl && (
                      <button onClick={() => { setBgImageUrl(null); applyBgColor(bgColor); }}
                        className="w-full flex items-center justify-center gap-1 py-1.5 text-rose-500 text-[9px] font-bold hover:bg-rose-50 rounded-xl transition-all">
                        <Trash2 size={11} /> Hapus Background
                      </button>
                    )}
                  </div>
                )}
              </Section>

              {/* 3. Masukan Teks */}
              <Section title="Masukan Teks" icon={<Type size={13} />}>
                {/* Headline */}
                <div className="space-y-2">
                  <p className="text-[9px] font-black text-orange-300 uppercase tracking-widest">Headline</p>
                  <input value={headlineText} onChange={(e) => setHeadlineText(e.target.value)}
                    placeholder="Teks headline..."
                    className="w-full px-3 py-2 bg-orange-50/40 border-2 border-transparent focus:border-orange-200 rounded-xl outline-none text-sm text-slate-700 placeholder:text-slate-300" />
                  <div className="grid grid-cols-2 gap-1.5">
                    <select value={headlineStyle.fontFamily}
                      onChange={(e) => setHeadlineStyle((s) => ({ ...s, fontFamily: e.target.value }))}
                      className="px-2 py-1.5 bg-orange-50/40 border border-orange-100 rounded-lg text-[9px] font-bold text-slate-700 outline-none">
                      {FONT_OPTIONS.map((f) => <option key={f} value={f}>{f}</option>)}
                    </select>
                    <div className="flex items-center gap-1 bg-orange-50/40 border border-orange-100 rounded-lg px-2">
                      <input type="number" min={10} max={120} value={headlineStyle.fontSize}
                        onChange={(e) => setHeadlineStyle((s) => ({ ...s, fontSize: +e.target.value }))}
                        className="w-full bg-transparent outline-none text-[9px] font-bold text-slate-700" />
                      <span className="text-[8px] text-slate-400">px</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5">
                    {/* Bold */}
                    <button onClick={() => setHeadlineStyle((s) => ({ ...s, fontWeight: s.fontWeight === "bold" ? "normal" : "bold" }))}
                      className={`w-7 h-7 rounded-lg flex items-center justify-center border transition-all text-[10px] ${headlineStyle.fontWeight === "bold" ? "border-orange-400 bg-orange-50 text-orange-600" : "border-orange-100 text-slate-400"}`}>
                      <Bold size={11} />
                    </button>
                    {/* Italic */}
                    <button onClick={() => setHeadlineStyle((s) => ({ ...s, fontStyle: s.fontStyle === "italic" ? "normal" : "italic" }))}
                      className={`w-7 h-7 rounded-lg flex items-center justify-center border transition-all ${headlineStyle.fontStyle === "italic" ? "border-orange-400 bg-orange-50 text-orange-600" : "border-orange-100 text-slate-400"}`}>
                      <Italic size={11} />
                    </button>
                    {/* Align */}
                    {(["left","center","right"] as const).map((a) => {
                      const Icon = a === "left" ? AlignLeft : a === "center" ? AlignCenter : AlignRight;
                      return (
                        <button key={a} onClick={() => setHeadlineStyle((s) => ({ ...s, textAlign: a }))}
                          className={`w-7 h-7 rounded-lg flex items-center justify-center border transition-all ${headlineStyle.textAlign === a ? "border-orange-400 bg-orange-50 text-orange-600" : "border-orange-100 text-slate-400"}`}>
                          <Icon size={11} />
                        </button>
                      );
                    })}
                    {/* Color */}
                    <input type="color" value={headlineStyle.fill as string}
                      onChange={(e) => setHeadlineStyle((s) => ({ ...s, fill: e.target.value }))}
                      className="w-7 h-7 rounded-lg border border-orange-200 cursor-pointer p-0.5 bg-white" />
                  </div>
                  <button onClick={() => applyHeadline(headlineText, headlineStyle)}
                    disabled={!uploadedDataUrl}
                    className="w-full py-2 bg-orange-400 text-white rounded-xl font-black text-[9px] uppercase tracking-widest hover:bg-orange-500 active:scale-95 transition-all disabled:opacity-40 disabled:cursor-not-allowed">
                    Terapkan Headline
                  </button>
                </div>

                {/* Tagline */}
                <div className="space-y-2 pt-2 border-t border-orange-50">
                  <p className="text-[9px] font-black text-orange-300 uppercase tracking-widest">Tagline <span className="normal-case font-normal text-slate-400">(mengikuti gaya headline, lebih kecil)</span></p>
                  <input value={taglineText} onChange={(e) => setTaglineText(e.target.value)}
                    placeholder="Teks tagline..."
                    className="w-full px-3 py-2 bg-orange-50/40 border-2 border-transparent focus:border-orange-200 rounded-xl outline-none text-sm text-slate-700 placeholder:text-slate-300" />
                  <div className="flex items-center gap-1.5">
                    <input type="color" value={taglineStyle.fill as string}
                      onChange={(e) => setTaglineStyle((s) => ({ ...s, fill: e.target.value }))}
                      className="w-7 h-7 rounded-lg border border-orange-200 cursor-pointer p-0.5 bg-white" />
                    <span className="text-[9px] text-slate-400">Warna tagline</span>
                    <input type="number" min={8} max={80} value={taglineStyle.fontSize}
                      onChange={(e) => setTaglineStyle((s) => ({ ...s, fontSize: +e.target.value }))}
                      className="w-14 px-2 py-1.5 bg-orange-50/40 border border-orange-100 rounded-lg text-[9px] font-bold text-slate-700 outline-none ml-auto" />
                    <span className="text-[8px] text-slate-400">px</span>
                  </div>
                  <button onClick={() => applyTagline(taglineText, { ...headlineStyle, ...taglineStyle })}
                    disabled={!uploadedDataUrl}
                    className="w-full py-2 bg-orange-100 text-orange-600 rounded-xl font-black text-[9px] uppercase tracking-widest hover:bg-orange-200 active:scale-95 transition-all disabled:opacity-40 disabled:cursor-not-allowed">
                    Terapkan Tagline
                  </button>
                </div>
              </Section>

              {/* 4. Overlay */}
              <Section title="Overlay" icon={<Layers size={13} />}>
                {/* Logo */}
                <div className="space-y-2">
                  <p className="text-[9px] font-black text-orange-300 uppercase tracking-widest">Logo Brand</p>
                  {!logoDataUrl ? (
                    <label className="block w-full py-3 border-2 border-dashed border-orange-200 rounded-xl flex items-center justify-center gap-2 cursor-pointer hover:border-orange-400 hover:bg-orange-50/30 transition-all">
                      <input type="file" accept="image/*" className="hidden"
                        onChange={(e) => { const f = e.target.files?.[0]; if (f) handleLogoUpload(f); }} />
                      <Upload size={14} className="text-orange-400" />
                      <span className="text-[9px] font-black text-orange-400 uppercase tracking-widest">Upload Logo</span>
                    </label>
                  ) : (
                    <div className="flex items-center gap-2">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={logoDataUrl} alt="logo" className="w-12 h-12 object-contain rounded-lg border border-orange-100" />
                      <label className="flex-1 text-[9px] text-orange-500 font-bold cursor-pointer hover:text-orange-600">
                        <input type="file" accept="image/*" className="hidden"
                          onChange={(e) => { const f = e.target.files?.[0]; if (f) handleLogoUpload(f); }} />
                        ↺ Ganti
                      </label>
                      <button onClick={() => { setLogoDataUrl(null); fabricRef.current?.removeById("logo"); }}
                        className="w-7 h-7 flex items-center justify-center text-rose-400 hover:bg-rose-50 rounded-lg transition-all">
                        <X size={12} />
                      </button>
                    </div>
                  )}
                  {/* Position grid */}
                  <div className="grid grid-cols-3 gap-1">
                    {LOGO_POSITIONS.map((p) => (
                      <button key={p.id} onClick={() => applyLogoPosition(p.id)}
                        className={`py-1.5 rounded-lg text-sm font-bold border-2 transition-all ${
                          logoPosition === p.id
                            ? "border-orange-400 bg-orange-50 text-orange-600"
                            : "border-orange-100 text-slate-400 hover:border-orange-200"
                        }`}>
                        {p.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Siapkan */}
                <div className="space-y-2 pt-2 border-t border-orange-50">
                  <p className="text-[9px] font-black text-orange-300 uppercase tracking-widest">Siapkan</p>
                  {/* Type */}
                  <div className="flex flex-wrap gap-1">
                    {(["marketplace","sosmed","wa","promo","diskon"] as const).map((t) => (
                      <button key={t} onClick={() => setSiapkanType(t)}
                        className={`px-2 py-1 rounded-lg text-[8px] font-black uppercase tracking-widest transition-all border ${
                          siapkanType === t
                            ? "border-orange-400 bg-orange-50 text-orange-600"
                            : "border-orange-100 text-slate-400 hover:border-orange-200"
                        }`}>
                        {t === "marketplace" ? "🛍 Marketplace"
                          : t === "sosmed" ? "📱 Sosmed"
                          : t === "wa" ? "💬 WA"
                          : t === "promo" ? "🏷 Promo"
                          : "🔴 Diskon"}
                      </button>
                    ))}
                  </div>
                  {/* Platform dropdown */}
                  {(siapkanType === "marketplace" || siapkanType === "sosmed") && (
                    <select value={siapkanPlatform}
                      onChange={(e) => setSiapkanPlatform(e.target.value)}
                      className="w-full px-2 py-1.5 bg-orange-50/40 border border-orange-100 rounded-lg text-[9px] font-bold text-slate-700 outline-none">
                      {(siapkanType === "marketplace" ? MARKETPLACE_OPTIONS : SOSMED_OPTIONS)
                        .map((o) => <option key={o} value={o}>{o}</option>)}
                    </select>
                  )}
                  {/* Text input */}
                  {siapkanType !== "promo" && (
                    <input
                      value={siapkanType === "diskon" ? diskonPct : siapkanText}
                      onChange={(e) => siapkanType === "diskon" ? setDiskonPct(e.target.value) : setSiapkanText(e.target.value)}
                      placeholder={
                        siapkanType === "marketplace" ? "Nama toko..."
                        : siapkanType === "sosmed" ? "Nama handle..."
                        : siapkanType === "wa" ? "No. WA / Nama..."
                        : "Persen diskon..."
                      }
                      className="w-full px-3 py-1.5 bg-orange-50/40 border-2 border-transparent focus:border-orange-200 rounded-xl outline-none text-sm text-slate-700 placeholder:text-slate-300" />
                  )}
                  <button onClick={applySiapkan} disabled={!uploadedDataUrl}
                    className="w-full py-2 bg-orange-400 text-white rounded-xl font-black text-[9px] uppercase tracking-widest hover:bg-orange-500 active:scale-95 transition-all disabled:opacity-40 disabled:cursor-not-allowed">
                    Tambahkan ke Canvas
                  </button>
                  <button onClick={() => fabricRef.current?.removeById("siapkan")}
                    className="w-full py-1.5 text-slate-400 text-[9px] font-bold hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all">
                    Hapus Badge
                  </button>
                </div>
              </Section>

              {/* 5. Input Fitur & Benefit */}
              <Section title="Input Fitur & Benefit" icon={<Tag size={13} />}>
                <div className="space-y-2">
                  {fiturList.map((f, i) => (
                    <div key={i} className="flex gap-1.5 items-center">
                      <span className="text-[9px] font-black text-orange-300 w-4">✦</span>
                      <input value={f}
                        onChange={(e) => {
                          const next = [...fiturList];
                          next[i] = e.target.value;
                          setFiturList(next);
                        }}
                        placeholder={`Fitur ${i + 1}...`}
                        className="flex-1 px-2.5 py-1.5 bg-orange-50/40 border-2 border-transparent focus:border-orange-200 rounded-xl outline-none text-sm text-slate-700 placeholder:text-slate-300" />
                    </div>
                  ))}
                  <div className="flex gap-1.5">
                    {fiturList.length < 5 && (
                      <button onClick={() => setFiturList([...fiturList, ""])}
                        className="flex-1 py-1.5 border border-orange-200 text-orange-500 rounded-xl text-[9px] font-bold hover:bg-orange-50 transition-all flex items-center justify-center gap-1">
                        <Plus size={11} /> Tambah
                      </button>
                    )}
                    <button onClick={applyFitur} disabled={!uploadedDataUrl}
                      className="flex-1 py-1.5 bg-orange-400 text-white rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-orange-500 active:scale-95 transition-all disabled:opacity-40">
                      Terapkan
                    </button>
                  </div>
                  <button onClick={() => { setFiturList(["", "", ""]); fabricRef.current?.removeById("fitur"); }}
                    className="w-full py-1.5 text-slate-400 text-[9px] font-bold hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all">
                    Hapus dari Canvas
                  </button>
                </div>
              </Section>

              {/* 6. Rasio */}
              <Section title="Rasio" icon={<Download size={13} />} defaultOpen={true}>
                <div className="grid grid-cols-3 gap-1.5">
                  {RATIOS.map((r) => (
                    <button key={r.id} onClick={() => handleRatioChange(r.id)}
                      className={`py-2.5 rounded-xl border-2 transition-all text-center ${
                        ratio === r.id
                          ? "border-orange-400 bg-orange-50 shadow-md shadow-orange-100"
                          : "border-orange-100 bg-white hover:border-orange-200"
                      }`}>
                      <p className="text-xs font-black text-orange-900">{r.label}</p>
                      <p className="text-[7px] text-slate-400 font-bold">{r.sub}</p>
                    </button>
                  ))}
                </div>
                <button onClick={handleDownload} disabled={!uploadedDataUrl}
                  className={`w-full flex items-center justify-center gap-2 py-3 rounded-2xl font-black text-sm uppercase tracking-widest transition-all ${
                    !uploadedDataUrl
                      ? "bg-orange-50 text-orange-200 cursor-not-allowed"
                      : "bg-orange-400 text-white shadow-xl shadow-orange-100 hover:bg-orange-500 hover:scale-[1.02] active:scale-95"
                  }`}>
                  <Download size={15} /> Download PNG
                </button>
                <p className="text-[8px] text-slate-400 text-center">Export resolusi 2× (HD)</p>
                <button onClick={handleReset}
                  className="w-full flex items-center justify-center gap-1 py-2 text-slate-400 text-[9px] font-bold hover:bg-rose-50 hover:text-rose-500 rounded-xl transition-all">
                  <RotateCcw size={11} /> Reset Semua
                </button>
              </Section>
            </>
          )}

          {/* ── EDIT BATCH ─────────────────────────────────────────────── */}
          {mode === "batch" && (
            <div className="p-4 space-y-4">
              <p className="text-[9px] font-black uppercase tracking-widest text-orange-300">
                Upload hingga 10 foto produk
              </p>

              {/* Batch upload */}
              <label className="block w-full py-4 border-2 border-dashed border-orange-200 rounded-2xl flex flex-col items-center justify-center cursor-pointer hover:border-orange-400 hover:bg-orange-50/30 transition-all">
                <input type="file" accept="image/*" multiple className="hidden"
                  onChange={(e) => { if (e.target.files) handleBatchUpload(e.target.files); }} />
                <Upload size={20} className="text-orange-400 mb-1" />
                <p className="text-[9px] font-black uppercase tracking-widest text-orange-400">
                  Upload Foto (Maks 10)
                </p>
              </label>

              {/* Batch operation */}
              <div className="flex bg-orange-50 p-0.5 rounded-xl gap-0.5">
                {(["hapus","warna"] as const).map((t) => (
                  <button key={t} onClick={() => setBatchBgTab(t)}
                    className={`flex-1 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${
                      batchBgTab === t
                        ? "bg-white text-orange-600 shadow-sm border border-orange-100"
                        : "text-slate-400"
                    }`}>
                    {t === "hapus" ? "Hapus BG" : "Ganti Warna"}
                  </button>
                ))}
              </div>

              {batchBgTab === "warna" && (
                <div className="flex items-center gap-2">
                  <input type="color" value={batchBgColor}
                    onChange={(e) => setBatchBgColor(e.target.value)}
                    className="w-9 h-9 rounded-lg border border-orange-200 cursor-pointer p-0.5 bg-white" />
                  <span className="text-[9px] text-slate-500 font-bold">Warna latar baru</span>
                </div>
              )}

              {batchFiles.length > 0 && (
                <button onClick={handleBatchProcess} disabled={batchProcessing}
                  className="w-full py-2.5 bg-orange-400 text-white rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-orange-500 active:scale-95 transition-all disabled:opacity-50 flex items-center justify-center gap-1.5">
                  {batchProcessing
                    ? <><Loader2 size={12} className="animate-spin" /> Memproses...</>
                    : <><Wand2 size={12} /> Proses {batchFiles.length} Foto</>
                  }
                </button>
              )}

              {/* Batch file list */}
              <div className="space-y-2">
                {batchFiles.map((item, i) => (
                  <div key={i} className="flex items-center gap-2 bg-white rounded-xl border border-orange-100 p-2">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={item.processed ?? item.orig} alt={item.name}
                      className="w-10 h-10 object-contain rounded-lg border border-orange-50 flex-shrink-0" />
                    <p className="flex-1 text-[9px] text-slate-600 font-bold truncate">{item.name}</p>
                    {item.processed ? (
                      <button onClick={() => downloadBatchItem(item.processed!, item.name)}
                        className="flex items-center gap-1 px-2 py-1 bg-orange-400 text-white rounded-lg text-[8px] font-black uppercase tracking-widest hover:bg-orange-500 transition-all flex-shrink-0">
                        <Download size={9} /> Save
                      </button>
                    ) : (
                      <span className="text-[8px] text-slate-300 font-bold flex-shrink-0">Belum diproses</span>
                    )}
                  </div>
                ))}
              </div>

              {batchFiles.length === 0 && (
                <p className="text-[9px] text-slate-400 text-center py-4">
                  Upload foto untuk mulai batch edit
                </p>
              )}
            </div>
          )}

        </div>
      </div>

      {/* ── Canvas Area ───────────────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col items-center justify-start gap-4 p-4 md:p-6">
        {/* Header */}
        <div className="w-full flex items-center justify-between">
          <div>
            <h1 className="text-xl font-black italic uppercase tracking-tighter text-orange-900">
              Foto Editor
            </h1>
            <p className="text-[9px] font-bold text-orange-300 uppercase tracking-widest">
              Hapus Latar · Teks · Logo · Latar AI
            </p>
          </div>
          {tokenBalance !== null && (
            <a href="/dashboard"
              className="flex items-center gap-1.5 px-3 py-1.5 bg-white rounded-full border border-orange-100 hover:border-orange-300 transition-all">
              <Zap size={12} className="text-orange-400" />
              <span className="text-[10px] font-black text-orange-600">{tokenBalance} token</span>
            </a>
          )}
        </div>

        {/* Canvas container */}
        <div className="bg-white rounded-2xl shadow-xl shadow-orange-100/60 border border-orange-100 overflow-hidden relative flex-shrink-0"
          style={{ width: w, height: h }}>
          <FabricCanvas ref={fabricRef} width={w} height={h} onReady={handleCanvasReady} />

          {/* Empty state overlay */}
          {!uploadedDataUrl && (
            <label className="absolute inset-0 flex flex-col items-center justify-center cursor-pointer bg-slate-50 hover:bg-orange-50/30 transition-all group">
              <input type="file" accept="image/*" className="hidden"
                onChange={(e) => { const f = e.target.files?.[0]; if (f) handleProductUpload(f); }} />
              <div className="w-16 h-16 bg-orange-100 rounded-2xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                <Upload size={24} className="text-orange-400" />
              </div>
              <p className="font-black italic uppercase tracking-widest text-orange-400 text-sm">
                Upload Foto Produk
              </p>
              <p className="text-[10px] text-slate-400 mt-1">Klik di sini untuk mulai</p>
            </label>
          )}
        </div>

        {/* Canvas info */}
        {uploadedDataUrl && (
          <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">
            Canvas {w}×{h}px · Export {w*2}×{h*2}px · PNG
          </p>
        )}
      </div>
    </div>
  );
}
