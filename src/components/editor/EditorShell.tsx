"use client";

import { useRef, useState, useEffect, useCallback } from "react";
import dynamic from "next/dynamic";
import {
  Upload, Trash2, Loader2, Wand2, Palette, Type,
  Download, RotateCcw, Zap, Check, Image as ImageIcon,
  AlertCircle, ChevronRight,
} from "lucide-react";
import type { FabricHandle } from "./FabricCanvas";

// ── Lazy-load fabric canvas (no SSR) ────────────────────────────────────────
const FabricCanvas = dynamic(() => import("./FabricCanvas"), { ssr: false });

// ─── Config ───────────────────────────────────────────────────────────────────

const CANVAS_BY_RATIO: Record<string, { w: number; h: number }> = {
  "1:1":  { w: 480, h: 480 },
  "3:4":  { w: 360, h: 480 },
  "9:16": { w: 270, h: 480 },
  "4:3":  { w: 480, h: 360 },
};

const RATIOS = [
  { id: "1:1",  label: "1:1",   sub: "Square" },
  { id: "3:4",  label: "3:4",   sub: "Portrait" },
  { id: "9:16", label: "9:16",  sub: "Story" },
  { id: "4:3",  label: "4:3",   sub: "Landscape" },
];

const BG_COLORS = [
  { label: "Putih",    value: "#FFFFFF" },
  { label: "Hitam",    value: "#1A1A1A" },
  { label: "Abu",      value: "#F0F0F0" },
  { label: "Krem",     value: "#FFF8F0" },
  { label: "Navy",     value: "#1E3A5F" },
  { label: "Biru",     value: "#DBEAFE" },
  { label: "Hijau",    value: "#DCFCE7" },
  { label: "Kuning",   value: "#FEF9C3" },
  { label: "Pink",     value: "#FCE7F3" },
  { label: "Ungu",     value: "#EDE9FE" },
];

const LATAR_AI_STYLES = [
  { id: "minimal_white",  name: "Clean Studio",    emoji: "⬜", prompt: "Pure white minimalist studio background, soft even diffused lighting, premium product photography, professional clean aesthetic." },
  { id: "dark_luxury",    name: "Dark Luxury",     emoji: "🖤", prompt: "Deep dark black background, subtle rim lighting, dramatic shadows, exclusive luxury editorial feel, high-end commercial product shot." },
  { id: "nature_fresh",   name: "Alam Segar",      emoji: "🌿", prompt: "Natural fresh outdoor background, soft sunlight filtering through leaves, organic textures, fresh and lively atmosphere." },
  { id: "warm_cozy",      name: "Cozy Warm",       emoji: "🍂", prompt: "Warm cozy home interior, soft warm lighting, wood textures and earth tones, inviting and comfortable lifestyle vibe." },
  { id: "gradient_soft",  name: "Soft Gradient",   emoji: "🌈", prompt: "Smooth pastel color gradient background, modern clean digital aesthetic, soft color transition, contemporary commercial look." },
  { id: "concrete_urban", name: "Urban Modern",    emoji: "🏙️", prompt: "Urban concrete texture background, moody industrial lighting, modern edgy aesthetic, street-style commercial photography." },
];

type TabId = "product" | "background" | "text" | "export";

// ─── Component ────────────────────────────────────────────────────────────────

export function EditorShell() {
  const fabricRef = useRef<FabricHandle>(null);

  // ── State ──────────────────────────────────────────────────────────────────
  const [activeTab, setActiveTab]             = useState<TabId>("product");
  const [uploadedDataUrl, setUploadedDataUrl] = useState<string | null>(null);
  const [processedDataUrl, setProcessedDataUrl] = useState<string | null>(null);
  const [isRemoving, setIsRemoving]           = useState(false);
  const [removeStatus, setRemoveStatus]       = useState("");

  const [bgType, setBgType]       = useState<"color" | "image" | "ai">("color");
  const [bgColor, setBgColor]     = useState("#FFFFFF");
  const [bgImageUrl, setBgImageUrl] = useState<string | null>(null);

  const [selectedAiStyle, setSelectedAiStyle] = useState(LATAR_AI_STYLES[0].id);
  const [isGeneratingAI, setIsGeneratingAI]   = useState(false);
  const [aiError, setAiError]                 = useState("");
  const [tokenBalance, setTokenBalance]       = useState<number | null>(null);

  const [textInput, setTextInput] = useState("");
  const [ratio, setRatio]         = useState("1:1");

  const { w, h } = CANVAS_BY_RATIO[ratio] ?? CANVAS_BY_RATIO["1:1"];

  // ── Fetch token balance ────────────────────────────────────────────────────
  useEffect(() => {
    fetch("/api/tokens/balance")
      .then((r) => r.json())
      .then((d: { tokens?: number }) => setTokenBalance(d.tokens ?? 0))
      .catch(() => {});
  }, []);

  // ── Re-add product when canvas dimensions change ───────────────────────────
  const activeDataUrl = processedDataUrl ?? uploadedDataUrl;
  useEffect(() => {
    if (!activeDataUrl) return;
    // Short delay lets fabric re-init the canvas first
    const t = setTimeout(() => {
      fabricRef.current?.loadProduct(activeDataUrl);
      if (bgType === "color") fabricRef.current?.setBackground(bgColor);
      else if (bgType === "image" && bgImageUrl) fabricRef.current?.setBackgroundImage(bgImageUrl);
    }, 120);
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
      fabricRef.current?.clearProduct();
      fabricRef.current?.setBackground("#FFFFFF");
      fabricRef.current?.loadProduct(dataUrl);
      setActiveTab("background");
    };
    reader.readAsDataURL(file);
  }, []);

  // ── Remove background (canvas BFS flood-fill) ─────────────────────────────
  const handleRemoveBg = useCallback(async () => {
    if (!uploadedDataUrl) return;
    setIsRemoving(true);
    setRemoveStatus("Menghapus background...");

    try {
      await new Promise<void>((resolve, reject) => {
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
            const data      = imageData.data; // RGBA flat array

            // ── Sample bg color from 4 corners (average) ──────────────
            const corners = [
              [0, 0],
              [width - 1, 0],
              [0, height - 1],
              [width - 1, height - 1],
            ];
            let rSum = 0, gSum = 0, bSum = 0;
            for (const [cx, cy] of corners) {
              const idx = (cy * width + cx) * 4;
              rSum += data[idx];
              gSum += data[idx + 1];
              bSum += data[idx + 2];
            }
            const bgR = rSum / 4;
            const bgG = gSum / 4;
            const bgB = bSum / 4;

            // ── BFS from all edge pixels ──────────────────────────────
            const TOLERANCE = 40;
            const visited   = new Uint8Array(width * height); // 0 = unvisited
            const queue: number[] = [];

            const colorDist = (i: number) => {
              const dr = data[i]     - bgR;
              const dg = data[i + 1] - bgG;
              const db = data[i + 2] - bgB;
              return Math.sqrt(dr * dr + dg * dg + db * db);
            };

            const enqueue = (px: number, py: number) => {
              const idx = py * width + px;
              if (visited[idx]) return;
              visited[idx] = 1;
              if (colorDist(idx * 4) <= TOLERANCE) queue.push(idx);
            };

            // seed all edge pixels
            for (let x = 0; x < width; x++)  { enqueue(x, 0); enqueue(x, height - 1); }
            for (let y = 1; y < height - 1; y++) { enqueue(0, y); enqueue(width - 1, y); }

            const dx = [1, -1, 0, 0];
            const dy = [0, 0, 1, -1];

            while (queue.length > 0) {
              const idx = queue.pop()!;
              const px  = idx % width;
              const py  = Math.floor(idx / width);

              // make transparent
              data[idx * 4 + 3] = 0;

              for (let d = 0; d < 4; d++) {
                const nx = px + dx[d];
                const ny = py + dy[d];
                if (nx < 0 || ny < 0 || nx >= width || ny >= height) continue;
                enqueue(nx, ny);
              }
            }

            ctx.putImageData(imageData, 0, 0);
            const resultDataUrl = canvas.toDataURL("image/png");

            setProcessedDataUrl(resultDataUrl);
            setRemoveStatus("Selesai!");

            // Place on canvas with current background
            fabricRef.current?.clearProduct();
            if (bgType === "color") fabricRef.current?.setBackground(bgColor);
            fabricRef.current?.loadProduct(resultDataUrl);
            resolve();
          } catch (e) {
            reject(e);
          }
        };
        img.onerror = reject;
        img.src = uploadedDataUrl;
      });
    } catch (err) {
      console.error("BG removal error:", err);
      setRemoveStatus("Gagal. Coba lagi.");
    } finally {
      setIsRemoving(false);
      setTimeout(() => setRemoveStatus(""), 2000);
    }
  }, [uploadedDataUrl, bgType, bgColor]);

  // ── Set solid background ───────────────────────────────────────────────────
  const applyBgColor = useCallback((color: string) => {
    setBgColor(color);
    setBgType("color");
    fabricRef.current?.clearBackgroundImage(color);
  }, []);

  // ── Upload custom background image ─────────────────────────────────────────
  const handleBgImageUpload = useCallback((file: File) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const dataUrl = reader.result as string;
      setBgImageUrl(dataUrl);
      setBgType("image");
      fabricRef.current?.setBackgroundImage(dataUrl);
    };
    reader.readAsDataURL(file);
  }, []);

  // ── Latar AI ───────────────────────────────────────────────────────────────
  const handleLatarAI = useCallback(async () => {
    const imageDataUrl = processedDataUrl ?? uploadedDataUrl;
    if (!imageDataUrl) return;

    setIsGeneratingAI(true);
    setAiError("");

    try {
      // Convert dataUrl to base64 string
      const res    = await fetch(imageDataUrl);
      const blob   = await res.blob();
      const base64 = await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve((reader.result as string).split(",")[1]);
        reader.readAsDataURL(blob);
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
        setAiError(d.error ?? "Gagal generate. Coba lagi.");
        return;
      }

      const data = await response.json() as { imageUrl?: string };
      if (data.imageUrl) {
        setBgType("ai");
        fabricRef.current?.setBackgroundImage(data.imageUrl);
        // Refresh token balance
        fetch("/api/tokens/balance")
          .then((r) => r.json())
          .then((d: { tokens?: number }) => setTokenBalance(d.tokens ?? 0))
          .catch(() => {});
      }
    } catch (err) {
      console.error("Latar AI error:", err);
      setAiError("Terjadi kesalahan. Coba lagi.");
    } finally {
      setIsGeneratingAI(false);
    }
  }, [processedDataUrl, uploadedDataUrl, selectedAiStyle, ratio]);

  // ── Add text ───────────────────────────────────────────────────────────────
  const handleAddText = useCallback(() => {
    fabricRef.current?.addText(textInput || "Teks Produk");
    setTextInput("");
  }, [textInput]);

  // ── Reset ──────────────────────────────────────────────────────────────────
  const handleReset = useCallback(() => {
    setUploadedDataUrl(null);
    setProcessedDataUrl(null);
    setBgType("color");
    setBgColor("#FFFFFF");
    setBgImageUrl(null);
    setAiError("");
    setActiveTab("product");
    fabricRef.current?.clearBackgroundImage("#FFFFFF");
    fabricRef.current?.clearProduct();
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
  const TABS: { id: TabId; label: string; icon: React.ReactNode }[] = [
    { id: "product",    label: "Produk",     icon: <Upload size={15} /> },
    { id: "background", label: "Background", icon: <Palette size={15} /> },
    { id: "text",       label: "Teks",       icon: <Type size={15} /> },
    { id: "export",     label: "Ekspor",     icon: <Download size={15} /> },
  ];

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-[#FFF8F0] p-3 md:p-6 gap-4">

      {/* ── Left Panel ──────────────────────────────────────────── */}
      <div className="w-full md:w-72 flex-shrink-0 bg-white rounded-[1.5rem] border border-orange-100 shadow-sm shadow-orange-50/50 overflow-hidden flex flex-col">

        {/* Tabs */}
        <div className="flex border-b border-orange-100 overflow-x-auto no-scrollbar">
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              className={`flex-1 flex flex-col items-center gap-1 py-3 px-1 text-[8px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${
                activeTab === t.id
                  ? "text-orange-600 border-b-2 border-orange-400 bg-orange-50/50"
                  : "text-slate-400 hover:text-orange-400"
              }`}
            >
              {t.icon}
              {t.label}
            </button>
          ))}
        </div>

        {/* Panel content */}
        <div className="flex-1 p-4 overflow-y-auto no-scrollbar space-y-4">

          {/* ── Produk ──────────────────────────────────────────── */}
          {activeTab === "product" && (
            <div className="space-y-4">
              <p className="text-[9px] font-black uppercase tracking-widest text-orange-300">
                Upload Foto Produk
              </p>

              {/* Upload zone */}
              {!uploadedDataUrl ? (
                <label className="block w-full aspect-square border-2 border-dashed border-orange-200 rounded-2xl flex flex-col items-center justify-center cursor-pointer hover:border-orange-400 hover:bg-orange-50/30 transition-all group">
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const f = e.target.files?.[0];
                      if (f) handleProductUpload(f);
                    }}
                  />
                  <div className="w-14 h-14 bg-orange-100 rounded-2xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                    <Upload size={22} className="text-orange-400" />
                  </div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-orange-400">
                    Klik Upload
                  </p>
                  <p className="text-[9px] text-slate-400 mt-1">JPG / PNG / WEBP</p>
                </label>
              ) : (
                <div className="space-y-3">
                  {/* Thumbnail */}
                  <div className="relative aspect-square bg-slate-50 rounded-2xl overflow-hidden border border-orange-100">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={processedDataUrl ?? uploadedDataUrl}
                      alt="Product"
                      className="w-full h-full object-contain"
                    />
                    {processedDataUrl && (
                      <div className="absolute top-2 left-2 bg-emerald-500 text-white text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full flex items-center gap-1">
                        <Check size={9} /> BG Dihapus
                      </div>
                    )}
                  </div>

                  {/* Ganti foto */}
                  <label className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border border-orange-200 text-orange-500 text-[10px] font-black uppercase tracking-widest cursor-pointer hover:bg-orange-50 transition-all">
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const f = e.target.files?.[0];
                        if (f) handleProductUpload(f);
                      }}
                    />
                    <RotateCcw size={12} /> Ganti Foto
                  </label>

                  {/* Remove BG button */}
                  <button
                    onClick={handleRemoveBg}
                    disabled={isRemoving}
                    className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all ${
                      isRemoving
                        ? "bg-orange-100 text-orange-400 cursor-not-allowed"
                        : processedDataUrl
                        ? "bg-emerald-50 text-emerald-600 border border-emerald-200 hover:bg-emerald-100"
                        : "bg-orange-400 text-white shadow-lg shadow-orange-100 hover:bg-orange-500 active:scale-95"
                    }`}
                  >
                    {isRemoving ? (
                      <>
                        <Loader2 size={12} className="animate-spin" />
                        {removeStatus || "Memproses..."}
                      </>
                    ) : processedDataUrl ? (
                      <><Check size={12} /> Background Dihapus</>
                    ) : (
                      <><Wand2 size={12} /> Hapus Background</>
                    )}
                  </button>

                  <p className="text-[8px] text-slate-400 text-center leading-relaxed">
                    Penghapusan background berjalan 100% di browser, tanpa upload ke server.
                    Cocok untuk background polos/solid.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* ── Background ──────────────────────────────────────── */}
          {activeTab === "background" && (
            <div className="space-y-5">
              {/* Sub-tabs */}
              <div className="flex bg-orange-50 p-1 rounded-xl gap-1">
                {(["color", "image", "ai"] as const).map((t) => (
                  <button
                    key={t}
                    onClick={() => setBgType(t)}
                    className={`flex-1 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${
                      bgType === t
                        ? "bg-white text-orange-600 shadow-sm border border-orange-100"
                        : "text-slate-400 hover:text-orange-400"
                    }`}
                  >
                    {t === "color" ? "Warna" : t === "image" ? "Foto" : "AI ✦"}
                  </button>
                ))}
              </div>

              {/* Warna */}
              {bgType === "color" && (
                <div className="space-y-3">
                  <p className="text-[9px] font-black uppercase tracking-widest text-orange-300">
                    Pilih Warna
                  </p>
                  <div className="grid grid-cols-5 gap-2">
                    {BG_COLORS.map((c) => (
                      <button
                        key={c.value}
                        onClick={() => applyBgColor(c.value)}
                        title={c.label}
                        className={`aspect-square rounded-xl border-2 transition-all hover:scale-110 ${
                          bgColor === c.value
                            ? "border-orange-400 scale-110 shadow-md shadow-orange-100"
                            : "border-transparent"
                        }`}
                        style={{ backgroundColor: c.value, boxShadow: c.value === "#FFFFFF" ? "inset 0 0 0 1px #e5e7eb" : undefined }}
                      />
                    ))}
                  </div>
                  {/* Custom color */}
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={bgColor}
                      onChange={(e) => applyBgColor(e.target.value)}
                      className="w-9 h-9 rounded-lg border border-orange-200 cursor-pointer p-0.5 bg-white"
                    />
                    <span className="text-[10px] font-bold text-slate-500">Warna custom</span>
                    <span className="text-[9px] text-slate-400 ml-auto">{bgColor}</span>
                  </div>
                </div>
              )}

              {/* Foto */}
              {bgType === "image" && (
                <div className="space-y-3">
                  <p className="text-[9px] font-black uppercase tracking-widest text-orange-300">
                    Upload Background
                  </p>
                  <label className="block w-full aspect-video border-2 border-dashed border-orange-200 rounded-2xl flex flex-col items-center justify-center cursor-pointer hover:border-orange-400 hover:bg-orange-50/30 transition-all group overflow-hidden">
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const f = e.target.files?.[0];
                        if (f) handleBgImageUpload(f);
                      }}
                    />
                    {bgImageUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={bgImageUrl} alt="bg" className="w-full h-full object-cover" />
                    ) : (
                      <>
                        <ImageIcon size={22} className="text-orange-300 mb-2" />
                        <p className="text-[10px] font-black uppercase tracking-widest text-orange-400">
                          Upload Foto BG
                        </p>
                      </>
                    )}
                  </label>
                  {bgImageUrl && (
                    <button
                      onClick={() => {
                        setBgImageUrl(null);
                        applyBgColor(bgColor);
                      }}
                      className="w-full flex items-center justify-center gap-1.5 py-2 text-rose-500 text-[10px] font-bold hover:bg-rose-50 rounded-xl transition-all"
                    >
                      <Trash2 size={12} /> Hapus Background
                    </button>
                  )}
                </div>
              )}

              {/* AI */}
              {bgType === "ai" && (
                <div className="space-y-3">
                  {/* Token info */}
                  <div className="flex items-center justify-between bg-orange-50 rounded-xl px-3 py-2 border border-orange-100">
                    <div className="flex items-center gap-1.5">
                      <Zap size={12} className="text-orange-400" />
                      <span className="text-[9px] font-black text-orange-600 uppercase tracking-widest">
                        Latar AI
                      </span>
                    </div>
                    <span className="text-[9px] font-bold text-orange-400">
                      1 token / generate
                    </span>
                  </div>

                  {tokenBalance !== null && (
                    <p className="text-[9px] text-slate-500 text-center">
                      Sisa token: <span className="font-black text-orange-600">{tokenBalance}</span>
                    </p>
                  )}

                  <p className="text-[9px] font-black uppercase tracking-widest text-orange-300">
                    Pilih Gaya
                  </p>
                  <div className="grid grid-cols-2 gap-2">
                    {LATAR_AI_STYLES.map((s) => (
                      <button
                        key={s.id}
                        onClick={() => setSelectedAiStyle(s.id)}
                        className={`p-2.5 rounded-xl border-2 text-left transition-all ${
                          selectedAiStyle === s.id
                            ? "border-orange-400 bg-orange-50 shadow-md shadow-orange-100"
                            : "border-orange-100 bg-white hover:border-orange-200"
                        }`}
                      >
                        <span className="text-lg block mb-1">{s.emoji}</span>
                        <p className="text-[9px] font-black text-orange-900 leading-tight">{s.name}</p>
                      </button>
                    ))}
                  </div>

                  {aiError && (
                    <div className="flex items-start gap-2 bg-rose-50 border border-rose-100 rounded-xl p-3">
                      <AlertCircle size={12} className="text-rose-500 mt-0.5 flex-shrink-0" />
                      <p className="text-[9px] text-rose-600 font-bold leading-tight">{aiError}</p>
                    </div>
                  )}

                  {aiError.includes("Token") && (
                    <a
                      href="/dashboard"
                      className="flex items-center justify-center gap-1.5 w-full py-2.5 rounded-xl bg-orange-400 text-white text-[10px] font-black uppercase tracking-widest hover:bg-orange-500 transition-all"
                    >
                      <Zap size={11} /> Beli Token <ChevronRight size={11} />
                    </a>
                  )}

                  <button
                    onClick={handleLatarAI}
                    disabled={isGeneratingAI || !uploadedDataUrl}
                    className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all ${
                      isGeneratingAI || !uploadedDataUrl
                        ? "bg-orange-100 text-orange-300 cursor-not-allowed"
                        : "bg-orange-400 text-white shadow-lg shadow-orange-100 hover:bg-orange-500 active:scale-95"
                    }`}
                  >
                    {isGeneratingAI ? (
                      <><Loader2 size={12} className="animate-spin" /> Generating...</>
                    ) : (
                      <><Wand2 size={12} /> Generate Latar AI</>
                    )}
                  </button>

                  {!uploadedDataUrl && (
                    <p className="text-[8px] text-slate-400 text-center">
                      Upload foto produk dulu di tab Produk
                    </p>
                  )}
                </div>
              )}
            </div>
          )}

          {/* ── Teks ────────────────────────────────────────────── */}
          {activeTab === "text" && (
            <div className="space-y-4">
              <p className="text-[9px] font-black uppercase tracking-widest text-orange-300">
                Tambah Teks
              </p>
              <textarea
                value={textInput}
                onChange={(e) => setTextInput(e.target.value)}
                placeholder="Contoh: Promo 50% Off!"
                rows={3}
                className="w-full px-3 py-2.5 bg-orange-50/40 border-2 border-transparent focus:border-orange-200 rounded-xl outline-none text-sm text-slate-700 resize-none placeholder:text-slate-300"
              />
              <button
                onClick={handleAddText}
                className="w-full py-3 bg-orange-400 text-white rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-orange-500 active:scale-95 transition-all flex items-center justify-center gap-2"
              >
                <Type size={12} /> Tambah ke Canvas
              </button>
              <div className="bg-orange-50 rounded-xl p-3 border border-orange-100 space-y-1.5">
                <p className="text-[9px] font-black text-orange-600 uppercase tracking-widest">Tips</p>
                <ul className="space-y-1">
                  {[
                    "Klik ganda teks di canvas untuk edit",
                    "Drag untuk pindahkan posisi",
                    "Sudut biru untuk resize/rotate",
                    "Tekan Delete untuk hapus",
                  ].map((tip) => (
                    <li key={tip} className="flex items-start gap-1.5 text-[8px] text-slate-500">
                      <Check size={9} className="text-orange-400 mt-0.5 flex-shrink-0" />
                      {tip}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {/* ── Ekspor ──────────────────────────────────────────── */}
          {activeTab === "export" && (
            <div className="space-y-5">
              <div className="space-y-2">
                <p className="text-[9px] font-black uppercase tracking-widest text-orange-300">
                  Rasio Gambar
                </p>
                <div className="grid grid-cols-2 gap-2">
                  {RATIOS.map((r) => (
                    <button
                      key={r.id}
                      onClick={() => setRatio(r.id)}
                      className={`p-3 rounded-xl border-2 transition-all text-center ${
                        ratio === r.id
                          ? "border-orange-400 bg-orange-50 shadow-md shadow-orange-100"
                          : "border-orange-100 bg-white hover:border-orange-200"
                      }`}
                    >
                      <p className="text-sm font-black text-orange-900">{r.label}</p>
                      <p className="text-[8px] text-slate-400 font-bold">{r.sub}</p>
                    </button>
                  ))}
                </div>
              </div>

              <button
                onClick={handleDownload}
                disabled={!uploadedDataUrl}
                className={`w-full flex items-center justify-center gap-2 py-4 rounded-2xl font-black text-sm uppercase tracking-widest transition-all ${
                  !uploadedDataUrl
                    ? "bg-orange-50 text-orange-200 cursor-not-allowed"
                    : "bg-orange-400 text-white shadow-xl shadow-orange-100 hover:bg-orange-500 hover:scale-[1.02] active:scale-95"
                }`}
              >
                <Download size={16} /> Download PNG
              </button>

              <p className="text-[8px] text-slate-400 text-center">
                Export resolusi 2× (HD). Siap pakai untuk marketplace.
              </p>

              <button
                onClick={handleReset}
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-slate-400 text-[10px] font-bold hover:bg-rose-50 hover:text-rose-500 transition-all border border-transparent hover:border-rose-100"
              >
                <RotateCcw size={12} /> Reset Semua
              </button>
            </div>
          )}

        </div>
      </div>

      {/* ── Canvas Area ─────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col items-center justify-center gap-4">
        {/* Canvas header */}
        <div className="w-full flex items-center justify-between px-1">
          <div>
            <h1 className="text-xl font-black italic uppercase tracking-tighter text-orange-900">
              Foto Editor
            </h1>
            <p className="text-[9px] font-bold text-orange-300 uppercase tracking-widest">
              Background Remover · Teks · Latar AI
            </p>
          </div>
          <div className="flex items-center gap-2">
            {tokenBalance !== null && (
              <a href="/dashboard" className="flex items-center gap-1.5 px-3 py-1.5 bg-white rounded-full border border-orange-100 hover:border-orange-300 transition-all">
                <Zap size={12} className="text-orange-400" />
                <span className="text-[10px] font-black text-orange-600">{tokenBalance}</span>
              </a>
            )}
          </div>
        </div>

        {/* Canvas container */}
        <div
          className="bg-white rounded-2xl shadow-xl shadow-orange-100/60 border border-orange-100 overflow-hidden relative"
          style={{ width: w, height: h }}
        >
          <FabricCanvas ref={fabricRef} width={w} height={h} />

          {/* Empty state overlay */}
          {!uploadedDataUrl && (
            <label className="absolute inset-0 flex flex-col items-center justify-center cursor-pointer bg-slate-50 hover:bg-orange-50/30 transition-all group">
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) handleProductUpload(f);
                }}
              />
              <div className="w-16 h-16 bg-orange-100 rounded-2xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                <Upload size={24} className="text-orange-400" />
              </div>
              <p className="font-black italic uppercase tracking-widest text-orange-400 text-sm">
                Upload Foto Produk
              </p>
              <p className="text-[10px] text-slate-400 mt-1">Drag & drop atau klik di sini</p>
            </label>
          )}
        </div>

        {/* Canvas sub-actions */}
        {uploadedDataUrl && (
          <div className="flex items-center gap-2 text-[9px] font-bold text-slate-400 uppercase tracking-widest">
            <span>Canvas {w}×{h}px</span>
            <span>·</span>
            <span>Export {w * 2}×{h * 2}px</span>
            <span>·</span>
            <span>Format PNG</span>
          </div>
        )}
      </div>
    </div>
  );
}
