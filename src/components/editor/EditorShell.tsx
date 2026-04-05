"use client";

import { useRef, useState, useCallback, useEffect } from "react";
import dynamic from "next/dynamic";
import {
  Upload, Trash2, Loader2, Wand2, Palette, Type,
  Download, RotateCcw, Zap, Check, Image as ImageIcon,
  AlertCircle, ChevronDown, ChevronRight, AlignLeft,
  AlignCenter, AlignRight, Bold, Italic, X, Plus,
  Layers, Tag,
} from "lucide-react";
import type { FabricHandle, TextStyle, LogoPosition } from "./FabricCanvas";

const FabricCanvas = dynamic(() => import("./FabricCanvas"), { ssr: false });

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

  // ── Fetch token balance ────────────────────────────────────────────────────
  useEffect(() => {
    fetch("/api/tokens/balance")
      .then((r) => r.json())
      .then((d: { tokens?: number }) => setTokenBalance(d.tokens ?? 0))
      .catch(() => {});
  }, []);

  // ── When canvas is ready, load pending product ─────────────────────────────
  const activeDataUrl = processedDataUrl ?? uploadedDataUrl;
  const handleCanvasReady = useCallback(() => {
    setCanvasReady(true);
  }, []);

  // Re-load product whenever canvas becomes ready OR the active image changes
  useEffect(() => {
    if (!canvasReady || !activeDataUrl) return;
    fabricRef.current?.loadProduct(activeDataUrl);
    if (bgImageUrl) fabricRef.current?.setBackgroundImage(bgImageUrl);
    else fabricRef.current?.setBackground(bgColor);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [canvasReady, activeDataUrl]);

  // ── Re-load product when ratio changes ────────────────────────────────────
  useEffect(() => {
    if (!canvasReady || !activeDataUrl) return;
    const t = setTimeout(() => {
      fabricRef.current?.loadProduct(activeDataUrl);
      if (bgImageUrl) fabricRef.current?.setBackgroundImage(bgImageUrl);
      else fabricRef.current?.setBackground(bgColor);
    }, 150);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ratio]);

  // ── Upload product ─────────────────────────────────────────────────────────
  const handleProductUpload = useCallback((file: File) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const dataUrl = reader.result as string;
      setUploadedDataUrl(dataUrl);
      setProcessedDataUrl(null);
      // Clear previous headline/tagline from canvas
      fabricRef.current?.removeById("headline");
      fabricRef.current?.removeById("tagline");
      fabricRef.current?.removeById("logo");
      fabricRef.current?.setBackground("#FFFFFF");
      fabricRef.current?.clearBackgroundImage("#FFFFFF");
      fabricRef.current?.loadProduct(dataUrl);
      setBgColor("#FFFFFF");
      setBgImageUrl(null);
    };
    reader.readAsDataURL(file);
  }, []);

  // ── BFS flood-fill background removal ─────────────────────────────────────
  const runBFSRemoval = useCallback(
    (sourceDataUrl: string): Promise<string> => {
      return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => {
          try {
            const canvas  = document.createElement("canvas");
            canvas.width  = img.naturalWidth;
            canvas.height = img.naturalHeight;
            const ctx = canvas.getContext("2d")!;
            ctx.drawImage(img, 0, 0);

            const { width, height } = canvas;
            const imageData = ctx.getImageData(0, 0, width, height);
            const data      = imageData.data;

            // Sample bg colour from 4 corners
            const corners = [[0,0],[width-1,0],[0,height-1],[width-1,height-1]];
            let rS = 0, gS = 0, bS = 0;
            for (const [cx, cy] of corners) {
              const i = (cy * width + cx) * 4;
              rS += data[i]; gS += data[i+1]; bS += data[i+2];
            }
            const bgR = rS / 4, bgG = gS / 4, bgB = bS / 4;

            const TOLERANCE = 40;
            const visited   = new Uint8Array(width * height);
            const queue: number[] = [];

            const dist = (i: number) => {
              const dr = data[i]   - bgR;
              const dg = data[i+1] - bgG;
              const db = data[i+2] - bgB;
              return Math.sqrt(dr*dr + dg*dg + db*db);
            };

            const enqueue = (px: number, py: number) => {
              const idx = py * width + px;
              if (visited[idx]) return;
              visited[idx] = 1;
              if (dist(idx * 4) <= TOLERANCE) queue.push(idx);
            };

            for (let x = 0; x < width; x++) { enqueue(x, 0); enqueue(x, height-1); }
            for (let y = 1; y < height-1; y++) { enqueue(0, y); enqueue(width-1, y); }

            const dx = [1,-1,0,0], dy = [0,0,1,-1];
            while (queue.length > 0) {
              const idx = queue.pop()!;
              data[idx * 4 + 3] = 0;
              const px = idx % width, py = Math.floor(idx / width);
              for (let d = 0; d < 4; d++) {
                const nx = px + dx[d], ny = py + dy[d];
                if (nx < 0 || ny < 0 || nx >= width || ny >= height) continue;
                enqueue(nx, ny);
              }
            }

            ctx.putImageData(imageData, 0, 0);
            resolve(canvas.toDataURL("image/png"));
          } catch (e) { reject(e); }
        };
        img.onerror = reject;
        img.src = sourceDataUrl;
      });
    }, []
  );

  const handleRemoveBg = useCallback(async () => {
    if (!uploadedDataUrl) return;
    setIsRemoving(true);
    setRemoveStatus("Menghapus background...");
    try {
      const result = await runBFSRemoval(uploadedDataUrl);
      setProcessedDataUrl(result);
      setRemoveStatus("Selesai!");
      fabricRef.current?.clearProduct();
      fabricRef.current?.loadProduct(result);
    } catch {
      setRemoveStatus("Gagal. Coba lagi.");
    } finally {
      setIsRemoving(false);
      setTimeout(() => setRemoveStatus(""), 2000);
    }
  }, [uploadedDataUrl, runBFSRemoval]);

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

  const handleLatarAI = useCallback(async () => {
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
      const style = LATAR_AI_STYLES.find((s) => s.id === selectedAiStyle)!;
      const response = await fetch("/api/editor/latar-ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ base64Image: base64, stylePrompt: style.prompt, ratio }),
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
  }, [processedDataUrl, uploadedDataUrl, selectedAiStyle, ratio]);

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
    const results = await Promise.all(
      batchFiles.map(async (item) => {
        if (batchBgTab === "hapus") {
          try {
            const processed = await runBFSRemoval(item.orig);
            return { ...item, processed };
          } catch {
            return item;
          }
        } else {
          // apply color bg — just keep original with tint overlay removed
          return { ...item, processed: item.orig };
        }
      })
    );
    setBatchFiles(results);
    setBatchProcessing(false);
  }, [batchFiles, batchBgTab, runBFSRemoval]);

  const downloadBatchItem = useCallback((dataUrl: string, name: string) => {
    const a = document.createElement("a");
    a.href = dataUrl;
    a.download = `ep-${name}`;
    a.click();
  }, []);

  // ── Reset ──────────────────────────────────────────────────────────────────
  const handleReset = useCallback(() => {
    setUploadedDataUrl(null);
    setProcessedDataUrl(null);
    setBgColor("#FFFFFF");
    setBgImageUrl(null);
    setHeadlineText("");
    setTaglineText("");
    setLogoDataUrl(null);
    setFiturList(["", "", ""]);
    setAiError("");
    fabricRef.current?.clearBackgroundImage("#FFFFFF");
    fabricRef.current?.clearProduct();
    fabricRef.current?.removeById("headline");
    fabricRef.current?.removeById("tagline");
    fabricRef.current?.removeById("logo");
    fabricRef.current?.removeById("siapkan");
    fabricRef.current?.removeById("fitur");
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

      {/* ── Left Panel ────────────────────────────────────────────────────── */}
      <div className="w-full md:w-72 flex-shrink-0 bg-white border-r border-orange-100 flex flex-col overflow-hidden">

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
                <p className="text-[8px] text-slate-400 text-center">
                  Cocok untuk background polos/solid. Gratis.
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

                {/* AI */}
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
                    <button onClick={handleLatarAI} disabled={isGeneratingAI || !uploadedDataUrl}
                      className={`w-full flex items-center justify-center gap-1.5 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all ${
                        isGeneratingAI || !uploadedDataUrl
                          ? "bg-orange-100 text-orange-300 cursor-not-allowed"
                          : "bg-orange-400 text-white shadow-lg shadow-orange-100 hover:bg-orange-500 active:scale-95"
                      }`}>
                      {isGeneratingAI
                        ? <><Loader2 size={11} className="animate-spin" /> Generating...</>
                        : <><Wand2 size={11} /> Generate Latar AI</>
                      }
                    </button>
                  </div>
                )}

                {/* Template */}
                {bgSubTab === "template" && (
                  <div className="space-y-2">
                    <p className="text-[8px] text-slate-400">Pilih gaya latar template:</p>
                    <div className="grid grid-cols-2 gap-1.5">
                      {[
                        { name: "Studio Putih", bg: "linear-gradient(135deg,#f8f8f8,#e8e8e8)", hex: "#F0F0F0" },
                        { name: "Dark Elegant", bg: "linear-gradient(135deg,#1a1a1a,#2d2d2d)", hex: "#1A1A1A" },
                        { name: "Pastel Pink",  bg: "linear-gradient(135deg,#fce7f3,#f9a8d4)", hex: "#FCE7F3" },
                        { name: "Ocean Blue",  bg: "linear-gradient(135deg,#dbeafe,#93c5fd)", hex: "#DBEAFE" },
                        { name: "Nature Green",bg: "linear-gradient(135deg,#dcfce7,#86efac)", hex: "#DCFCE7" },
                        { name: "Warm Gold",   bg: "linear-gradient(135deg,#fef9c3,#fde68a)", hex: "#FEF9C3" },
                      ].map((t) => (
                        <button key={t.name} onClick={() => applyBgColor(t.hex)}
                          className="p-2 rounded-xl border-2 border-orange-100 hover:border-orange-300 transition-all text-center overflow-hidden">
                          <div className="aspect-video rounded-lg mb-1" style={{ background: t.bg }} />
                          <p className="text-[8px] font-bold text-slate-600 truncate">{t.name}</p>
                        </button>
                      ))}
                    </div>
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
                    <button key={r.id} onClick={() => setRatio(r.id)}
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
