"use client";

import { useState, useCallback } from "react";
import {
  AlertTriangle,
  RotateCcw,
  Settings,
  Download,
  Loader2,
  FileText,
  Copy,
  Check,
  Bot,
  Zap,
} from "lucide-react";
import { useProject } from "@/context/ProjectContext";
import { ProgressOverlay } from "@/components/ui/ProgressOverlay";
import { ToastContainer, useToast } from "@/components/ui/Toast";
import { RATIOS } from "@/config/options";
import { NON_FASHION_PRESETS } from "@/config/styles";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

async function downloadBlob(blob: Blob, filename: string) {
  const isIOS =
    /iPad|iPhone|iPod/.test(navigator.userAgent) && !("MSStream" in window);

  if (isIOS && navigator.share) {
    const file = new File([blob], `${filename}.png`, { type: "image/png" });
    if (navigator.canShare?.({ files: [file] })) {
      await navigator.share({ files: [file], title: "Hasil Etalase Pro" });
      return;
    }
  }

  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `${filename}.png`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

// ─── Component ────────────────────────────────────────────────────────────────

interface Step5ResultsProps {
  onTokensUpdated?: () => void;
}

export function Step5Results({ onTokensUpdated }: Step5ResultsProps) {
  const {
    isGenerating,
    progress,
    generateError,
    clearGenerateError,
    generatedResults,
    regeneratingIndices,
    handleGenerate,
    handleRegenerateSingle,
    settings,
    logoImage,
    selectedCategory,
    selectedStyle,
    selectedPresetId,
    generateTab,
    base64Image,
    caption,
    setCaption,
    setStep,
    handleNewProjectClick,
  } = useProject();

  const { toasts, addToast, dismiss } = useToast();
  const [isCaptionLoading, setIsCaptionLoading] = useState(false);
  const [isCaptionCopied, setIsCaptionCopied] = useState(false);

  // ── Download with optional canvas logo merge ──
  const handleDownload = useCallback(
    async (dataUrl: string, filename: string) => {
      try {
        const res = await fetch(dataUrl);
        const blob = await res.blob();

        if (!settings.logo || !logoImage) {
          await downloadBlob(blob, filename);
          return;
        }

        // Canvas merge
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        if (!ctx) throw new Error("Canvas not supported");

        const img = await loadImage(dataUrl);
        const logo = await loadImage(logoImage);

        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);

        const logoWidth = canvas.width * 0.15;
        const logoHeight = logoWidth / (logo.width / logo.height);
        const padding = canvas.width * 0.05;
        const pos = settings.logoPlacement;

        const x = pos.includes("l")
          ? padding
          : pos.includes("r")
            ? canvas.width - logoWidth - padding
            : (canvas.width - logoWidth) / 2;
        const y = pos.includes("t")
          ? padding
          : canvas.height - logoHeight - padding;

        ctx.globalAlpha = 0.4;
        ctx.drawImage(logo, x, y, logoWidth, logoHeight);
        ctx.globalAlpha = 1.0;

        canvas.toBlob(async (mergedBlob) => {
          if (mergedBlob) await downloadBlob(mergedBlob, filename);
        }, "image/png");
      } catch {
        addToast("Gagal memproses gambar. Coba tekan lama pada gambar.", "error");
      }
    },
    [settings.logo, settings.logoPlacement, logoImage, addToast]
  );

  // ── Caption generation ──
  const handleGenerateCaption = async () => {
    if (!base64Image) return;
    setIsCaptionLoading(true);
    setCaption("");
    try {
      const res = await fetch("/api/generate-caption", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ base64Image, details: settings.details }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error ?? `Error ${res.status}`);
      }
      const data = await res.json();
      setCaption(data.caption);
    } catch {
      addToast("Gagal membuat deskripsi otomatis. Silakan coba lagi.", "error");
    } finally {
      setIsCaptionLoading(false);
    }
  };

  const handleCopyCaption = () => {
    if (!caption) return;
    navigator.clipboard
      .writeText(caption)
      .then(() => {
        setIsCaptionCopied(true);
        setTimeout(() => setIsCaptionCopied(false), 2000);
      })
      .catch(() => {
        const ta = document.createElement("textarea");
        ta.value = caption;
        ta.style.cssText = "position:fixed;left:-9999px;top:0";
        document.body.appendChild(ta);
        ta.focus();
        ta.select();
        try {
          document.execCommand("copy");
          setIsCaptionCopied(true);
          setTimeout(() => setIsCaptionCopied(false), 2000);
        } catch {}
        document.body.removeChild(ta);
      });
  };

  // ── Derived ──
  const ratioClass =
    RATIOS.find((r) => r.id === settings.ratio)?.aspectClass ?? "aspect-square";

  const gridClass =
    settings.count === 1
      ? "grid-cols-1 max-w-sm md:max-w-xl mx-auto"
      : settings.count === 2
        ? "grid-cols-1 md:grid-cols-2 max-w-lg md:max-w-4xl mx-auto"
        : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4";

  const activeStyleName =
    selectedCategory === "fashion"
      ? selectedStyle
      : generateTab === "Custom"
        ? "Custom Ref"
        : (
            [
              ...NON_FASHION_PRESETS.Commercial,
              ...NON_FASHION_PRESETS.Lifestyle,
              ...NON_FASHION_PRESETS.Premium,
            ].find((p) => p.id === selectedPresetId)?.name ?? "Custom"
          );

  const downloadName = `${activeStyleName}-${settings.details.headline || "Etalase-Pro"}`.replace(
    /\s+/g,
    "-"
  );

  // ── Render ──
  return (
    <div className="space-y-6 md:space-y-8 animate-in fade-in slide-in-from-bottom-6 duration-700 flex flex-col items-center justify-center min-h-[500px] text-slate-900">
      <ToastContainer toasts={toasts} onDismiss={dismiss} />

      {/* ── Loading ── */}
      {isGenerating && (
        <ProgressOverlay
          progress={progress}
          waitingForQuota={false}
          uploadedImage={null}
        />
      )}

      {/* ── Error ── */}
      {!isGenerating && generateError && (
        <div className="w-full max-w-md mx-auto py-10 px-6 text-center animate-in fade-in zoom-in-95 duration-300">
          {generateError === "TOKEN_INSUFFICIENT" ? (
            <>
              <div className="w-20 h-20 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl shadow-orange-100">
                <Zap className="text-orange-500" size={40} />
              </div>
              <h3 className="text-xl font-black text-orange-900 mb-2 uppercase tracking-tight">
                Token Habis
              </h3>
              <p className="text-slate-500 text-sm mb-8 leading-relaxed px-4">
                Token kamu tidak cukup untuk generate gambar. Beli token terlebih dahulu.
              </p>
              <div className="flex gap-3 justify-center">
                <button
                  onClick={() => {
                    clearGenerateError();
                    setStep(4);
                  }}
                  className="px-6 py-3.5 rounded-xl bg-slate-100 text-slate-600 font-black text-xs uppercase tracking-widest hover:bg-slate-200 transition-colors"
                >
                  Kembali
                </button>
                <button
                  onClick={() => {
                    clearGenerateError();
                    onTokensUpdated?.();
                  }}
                  className="px-8 py-3.5 rounded-xl bg-gradient-to-r from-orange-400 to-amber-400 text-white font-black text-xs uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-lg shadow-orange-200 flex items-center gap-2"
                >
                  <Zap size={14} /> Beli Token
                </button>
              </div>
            </>
          ) : (
            <>
              <div className="w-20 h-20 bg-rose-100 rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl shadow-rose-100 animate-bounce">
                <AlertTriangle className="text-rose-500" size={40} />
              </div>
              <h3 className="text-xl font-black text-rose-900 mb-2 uppercase tracking-tight">
                Terjadi Kesalahan
              </h3>
              <p className="text-slate-500 text-sm mb-8 leading-relaxed px-4">
                {generateError}
              </p>
              <div className="flex gap-3 justify-center">
                <button
                  onClick={() => {
                    clearGenerateError();
                    setStep(3);
                  }}
                  className="px-6 py-3.5 rounded-xl bg-slate-100 text-slate-600 font-black text-xs uppercase tracking-widest hover:bg-slate-200 transition-colors flex items-center gap-2"
                >
                  <Settings size={14} /> Cek Settings
                </button>
                <button
                  onClick={() => {
                    clearGenerateError();
                    handleGenerate();
                  }}
                  className="px-8 py-3.5 rounded-xl bg-gradient-to-r from-rose-500 to-orange-500 text-white font-black text-xs uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-lg shadow-rose-200 flex items-center gap-2"
                >
                  <RotateCcw size={14} /> Coba Lagi
                </button>
              </div>
            </>
          )}
        </div>
      )}

      {/* ── Success ── */}
      {!isGenerating && !generateError && generatedResults.length > 0 && (
        <div className="w-full space-y-8 md:space-y-10 animate-in zoom-in-95 duration-700">
          {/* Image grid */}
          <div className={`grid gap-4 md:gap-6 ${gridClass}`}>
            {generatedResults.map((dataUrl, i) => (
              <div
                key={`result-${i}`}
                className={`group relative bg-white ${ratioClass} rounded-[1rem] md:rounded-[1.5rem] overflow-hidden shadow-xl border-2 md:border-4 border-white flex items-center justify-center`}
              >
                {/* Regenerating overlay */}
                {regeneratingIndices[i] && (
                  <div className="absolute inset-0 z-50 bg-orange-900/10 backdrop-blur-sm flex items-center justify-center animate-in fade-in duration-300">
                    <Loader2 className="animate-spin text-orange-500 w-8 h-8" />
                  </div>
                )}

                {/* Main image */}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={dataUrl}
                  alt={`Result ${i + 1}`}
                  className="w-full h-full object-contain image-render-sharp"
                />

                {/* Logo overlay preview */}
                {settings.logo && logoImage && (
                  <div
                    className={`absolute w-[15%] opacity-40 pointer-events-none z-10 ${
                      settings.logoPlacement === "tl"
                        ? "top-4 left-4"
                        : settings.logoPlacement === "tc"
                          ? "top-4 left-1/2 -translate-x-1/2"
                          : settings.logoPlacement === "tr"
                            ? "top-4 right-4"
                            : settings.logoPlacement === "bl"
                              ? "bottom-4 left-4"
                              : settings.logoPlacement === "bc"
                                ? "bottom-4 left-1/2 -translate-x-1/2"
                                : "bottom-4 right-4"
                    }`}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={logoImage}
                      alt="Logo"
                      className="w-full h-auto object-contain"
                    />
                  </div>
                )}

                {/* Hover actions */}
                <div className="absolute inset-0 bg-gradient-to-t from-orange-950/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500 flex flex-col justify-end p-3 md:p-4 pointer-events-none z-20">
                  <div className="flex gap-2 translate-y-4 group-hover:translate-y-0 transition-transform duration-500 pointer-events-auto">
                    <button
                      onClick={() => handleDownload(dataUrl, downloadName)}
                      className="flex-1 bg-white text-orange-600 py-2 md:py-3 rounded-lg md:rounded-xl font-black italic text-[8px] md:text-[10px] flex items-center justify-center gap-1 shadow-2xl hover:bg-orange-50 transition-colors"
                    >
                      <Download size={14} /> Simpan
                    </button>
                    <button
                      onClick={() => handleRegenerateSingle(i)}
                      className="bg-white/20 backdrop-blur-xl text-white p-2 md:p-3 rounded-lg md:rounded-xl border border-white/30 hover:bg-white/40 shadow-xl"
                    >
                      <RotateCcw size={14} />
                    </button>
                  </div>
                </div>

                {/* Style badge */}
                <div className="absolute top-2 left-2 md:top-3 md:left-3 z-20">
                  <div className="bg-orange-400/90 backdrop-blur-md text-white px-1.5 md:px-2 py-0.5 md:py-1 rounded-full text-[6px] md:text-[8px] font-black uppercase tracking-widest border border-white/20 shadow-xl">
                    {activeStyleName}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Marketplace caption */}
          <div className="bg-white p-6 md:p-8 rounded-[2rem] shadow-sm border border-slate-100 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-black text-orange-900 text-sm flex items-center gap-2">
                <FileText size={18} className="text-orange-500" />
                Deskripsi Produk Untuk Marketplace
              </h3>
              {caption && (
                <button
                  onClick={handleCopyCaption}
                  className={`text-[10px] font-bold flex items-center gap-1 transition-colors ${
                    isCaptionCopied
                      ? "text-emerald-500"
                      : "text-slate-400 hover:text-orange-500"
                  }`}
                >
                  {isCaptionCopied ? <Check size={12} /> : <Copy size={12} />}
                  {isCaptionCopied ? "Tersalin" : "Salin"}
                </button>
              )}
            </div>

            {isCaptionLoading ? (
              <div className="flex flex-col items-center justify-center py-8 gap-3 text-slate-400">
                <Loader2 className="animate-spin text-orange-400" size={24} />
                <span className="text-xs font-medium animate-pulse">
                  Sedang menulis deskripsi...
                </span>
              </div>
            ) : caption ? (
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 max-h-60 overflow-y-auto">
                <pre className="whitespace-pre-wrap text-xs text-slate-600 font-sans leading-relaxed">
                  {caption}
                </pre>
              </div>
            ) : (
              <div className="text-center py-6">
                <p className="text-xs text-slate-400 mb-4">
                  Belum ada deskripsi. Buat deskripsi otomatis untuk marketplace Anda.
                </p>
                <button
                  onClick={handleGenerateCaption}
                  className="px-6 py-3 rounded-xl bg-orange-50 text-orange-600 font-black text-xs uppercase tracking-widest hover:bg-orange-100 transition-colors flex items-center gap-2 mx-auto"
                >
                  <Bot size={16} /> Buat Deskripsi
                </button>
              </div>
            )}
          </div>

          {/* Footer actions */}
          <div className="flex gap-2 md:gap-4 justify-center pt-6 md:pt-10 border-t border-orange-100 flex-wrap">
            <button
              onClick={() => setStep(4)}
              className="flex-1 md:flex-none bg-slate-100 text-slate-500 px-6 md:px-8 py-3.5 md:py-5 rounded-full font-black italic uppercase tracking-widest text-[9px] md:text-xs hover:bg-slate-200 transition-all"
            >
              Kembali
            </button>
            <button
              onClick={handleNewProjectClick}
              className="flex-1 md:flex-none bg-white border-2 border-orange-100 text-orange-300 px-6 md:px-8 py-3.5 md:py-5 rounded-full font-black italic uppercase tracking-widest text-[9px] md:text-xs hover:border-orange-400 hover:text-orange-500 transition-all"
            >
              Baru
            </button>
            <button
              onClick={handleGenerate}
              className="w-full md:w-auto bg-orange-400 text-white px-10 md:px-12 py-3.5 md:py-5 rounded-full font-black italic shadow-2xl shadow-orange-100 hover:bg-orange-500 hover:scale-105 active:scale-95 transition-all text-sm uppercase tracking-widest"
            >
              Generate Ulang
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
