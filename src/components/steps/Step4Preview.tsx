"use client";

import { useState, useEffect } from "react";
import {
  Terminal,
  Copy,
  Check,
  Bot,
  Sparkles,
  Wand2,
  ChevronRight,
  ExternalLink,
  Zap,
} from "lucide-react";
import Link from "next/link";
import { useProject } from "@/context/ProjectContext";
import { getFullPromptsForPreview } from "@/lib/prompt-builder";
import type { FashionStyleName } from "@/types";

// ─── Clipboard helpers ────────────────────────────────────────────────────────

function fallbackCopy(text: string, onSuccess: () => void) {
  const textarea = document.createElement("textarea");
  textarea.value = text;
  textarea.style.cssText = "position:fixed;left:-9999px;top:0";
  document.body.appendChild(textarea);
  textarea.focus();
  textarea.select();
  try {
    document.execCommand("copy");
    onSuccess();
  } catch {}
  document.body.removeChild(textarea);
}

function copyToClipboard(text: string, onSuccess: () => void) {
  if (navigator.clipboard?.writeText) {
    navigator.clipboard
      .writeText(text)
      .then(onSuccess)
      .catch(() => fallbackCopy(text, onSuccess));
  } else {
    fallbackCopy(text, onSuccess);
  }
}

// ─── Component ────────────────────────────────────────────────────────────────

export function Step4Preview() {
  const {
    selectedCategory,
    selectedStyle,
    selectedGender,
    selectedAge,
    selectedPresetId,
    generateTab,
    activePresetTab,
    base64Image2,
    referenceBase64,
    settings,
    uploadedImage,
    setStep,
    handleGenerate,
  } = useProject();

  const [isCopied, setIsCopied] = useState(false);
  const [tokenBalance, setTokenBalance] = useState<number | null>(null);

  useEffect(() => {
    fetch("/api/tokens/balance")
      .then((r) => r.json())
      .then((d: { tokens?: number }) => setTokenBalance(d.tokens ?? 0))
      .catch(() => {});
  }, []);

  if (!selectedCategory) return null;

  const promptText = getFullPromptsForPreview(
    selectedCategory,
    {
      selectedStyle: selectedStyle as FashionStyleName,
      selectedPresetId,
      generateTab,
      gender: selectedGender,
      age: selectedAge,
      activePresetTab,
    },
    settings,
    Boolean(base64Image2),
    generateTab === "Custom" && Boolean(referenceBase64)
  );

  const handleCopy = () => {
    copyToClipboard(promptText, () => {
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    });
  };

  const handleOpenExternal = (url: string) => {
    copyToClipboard(promptText, () => window.open(url, "_blank"));
  };

  const handleGenerateInApp = () => {
    setStep(5);
    handleGenerate();
  };

  return (
    <div className="space-y-6 md:space-y-8 animate-in fade-in slide-in-from-bottom-6 duration-700 flex flex-col items-center min-h-[500px] text-slate-900">
      <div className="w-full max-w-lg mx-auto space-y-6">

        {/* Prompt Preview Card */}
        <div className="bg-white rounded-[2rem] p-6 md:p-8 shadow-xl border-2 border-orange-100 text-left">
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center gap-2">
              <Terminal size={18} className="text-orange-400" />
              <h3 className="font-black text-orange-900 uppercase tracking-widest text-sm">
                AI Prompt Preview
              </h3>
            </div>
            <button
              onClick={handleCopy}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all ${
                isCopied
                  ? "bg-emerald-100 text-emerald-600"
                  : "bg-slate-100 text-slate-500 hover:bg-orange-100 hover:text-orange-600"
              }`}
            >
              {isCopied ? <Check size={12} /> : <Copy size={12} />}
              {isCopied ? "Tersalin!" : "Copy"}
            </button>
          </div>

          {/* Prompt text */}
          <div className="bg-slate-50 rounded-xl p-4 max-h-60 overflow-y-auto border border-slate-100">
            <pre className="whitespace-pre-wrap text-[10px] text-slate-600 font-mono leading-relaxed">
              {promptText}
            </pre>
          </div>

          {/* Tips */}
          <div className="bg-orange-50 rounded-2xl p-5 border border-orange-100 text-left space-y-3 mt-6">
            <h4 className="font-black text-orange-900 text-sm flex items-center gap-2">
              💡 Cara Menggunakan Prompt Ini
            </h4>
            <ol className="list-decimal list-inside text-[10px] text-slate-600 space-y-1.5 font-medium leading-relaxed ml-1">
              <li>
                Klik tombol{" "}
                <span className="font-bold text-orange-600">&quot;Copy Prompt&quot;</span>{" "}
                untuk menyalin prompt
              </li>
              <li>Buka ChatGPT atau Google Gemini menggunakan tombol di bawah</li>
              <li>Paste prompt yang sudah disalin</li>
              <li>Jangan lupa upload foto produk Anda ke ChatGPT/Gemini</li>
              {uploadedImage && (
                <li className="flex flex-col gap-2">
                  <span>Thumbnail produk Anda:</span>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={uploadedImage}
                    alt="Thumbnail Produk"
                    className="w-12 h-12 object-cover rounded-lg border-2 border-white shadow-md"
                  />
                </li>
              )}
            </ol>
            <div className="bg-white/60 p-3 rounded-xl border border-orange-100 mt-2">
              <p className="text-[9px] text-orange-800 leading-relaxed font-medium">
                <span className="font-bold">Catatan:</span> Jika fitur &quot;Generate
                Foto&quot; sedang tidak berfungsi, gunakan ChatGPT atau Google Gemini
                dengan prompt di atas.
              </p>
            </div>
          </div>
        </div>

        {/* External tools + In-app generate */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* External */}
          <div className="p-6 bg-white border border-slate-100 rounded-3xl shadow-sm flex flex-col gap-3">
            <div className="text-center mb-1">
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                EXTERNAL TOOLS
              </span>
            </div>

            <button
              onClick={() => handleOpenExternal("https://chat.openai.com/")}
              className="flex items-center justify-between w-full p-4 rounded-2xl border border-emerald-100 bg-emerald-50/50 hover:bg-emerald-100 transition-all group text-left"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white rounded-xl text-emerald-600 shadow-sm">
                  <Bot size={18} />
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] font-black text-emerald-900 uppercase tracking-tight">
                    GENERATE DI CHATGPT
                  </span>
                  <span className="text-[8px] font-bold text-emerald-500">
                    (Recommended)
                  </span>
                </div>
              </div>
              <ExternalLink
                size={16}
                className="text-emerald-400 group-hover:translate-x-1 transition-transform"
              />
            </button>

            <button
              onClick={() => handleOpenExternal("https://gemini.google.com/")}
              className="flex items-center justify-between w-full p-4 rounded-2xl border border-blue-100 bg-blue-50/50 hover:bg-blue-100 transition-all group text-left"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white rounded-xl text-blue-600 shadow-sm">
                  <Sparkles size={18} />
                </div>
                <span className="text-[10px] font-black text-blue-900 uppercase tracking-tight">
                  GENERATE DI GEMINI
                </span>
              </div>
              <ExternalLink
                size={16}
                className="text-blue-400 group-hover:translate-x-1 transition-transform"
              />
            </button>
          </div>

          {/* In-app generate */}
          <div className="p-6 bg-white border border-orange-50 rounded-3xl shadow-lg shadow-orange-100/50 flex flex-col items-center text-center justify-center space-y-4 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
              <Sparkles size={120} className="text-orange-500" />
            </div>
            <div className="p-3 bg-orange-50 rounded-full text-orange-500 mb-1 relative">
              <Wand2 size={24} />
            </div>
            <div className="space-y-1 relative">
              <h3 className="font-black italic text-orange-900 text-lg uppercase tracking-tight">
                GENERATE DI APLIKASI
              </h3>
              {tokenBalance !== null && tokenBalance === 0 ? (
                <p className="text-[9px] font-bold text-rose-500 max-w-[200px] mx-auto leading-tight">
                  Token habis — beli dulu untuk generate
                </p>
              ) : (
                <p className="text-[9px] font-bold text-rose-500 max-w-[200px] mx-auto leading-tight">
                  (Fitur dapat mengalami pembatasan sewaktu-waktu sesuai kebijakan layanan)
                </p>
              )}
            </div>

            {tokenBalance !== null && tokenBalance === 0 ? (
              <Link
                href="/dashboard"
                className="w-full py-4 rounded-xl bg-gradient-to-r from-orange-400 to-amber-400 text-white font-black italic uppercase tracking-widest shadow-xl shadow-orange-200 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2 group relative"
              >
                <Zap size={16} className="flex-shrink-0" />
                Beli Token
              </Link>
            ) : (
              <button
                onClick={handleGenerateInApp}
                disabled={tokenBalance === null}
                className="w-full py-4 rounded-xl bg-gradient-to-r from-orange-500 to-amber-400 text-white font-black italic uppercase tracking-widest shadow-xl shadow-orange-200 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2 group relative disabled:opacity-50 disabled:cursor-wait"
              >
                <Zap size={15} className="text-amber-200 flex-shrink-0" />
                GENERATE FOTO{" "}
                <ChevronRight
                  size={16}
                  className="group-hover:translate-x-1 transition-transform"
                />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
