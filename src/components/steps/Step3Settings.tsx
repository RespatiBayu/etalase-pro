"use client";

import {
  Type,
  Layout,
  Image as ImageIcon,
  Sparkles,
  Grid,
  Lightbulb,
  Check,
  Truck,
  Bike,
  Box,
  Loader2,
  Bot,
  CheckCircle2,
  XCircle,
  Upload,
  X,
} from "lucide-react";
import { ToggleCard } from "@/components/ui/ToggleCard";
import { SubWindow } from "@/components/ui/SubWindow";
import { useProject } from "@/context/ProjectContext";
import { VISUAL_EFFECT_OPTIONS, LOGO_OPTIONS } from "@/config/options";
import type { VisualDensity, VariationCount, LogoPlacement } from "@/types";
import { useCallback, useState } from "react";

// ─── Word count helper ────────────────────────────────────────────────────────

function getWordCount(str: string): number {
  if (!str || str.trim() === "") return 0;
  return str.trim().split(/\s+/).length;
}

// ─── Poster Details Form ──────────────────────────────────────────────────────

interface PosterDetailsFormProps {
  onClose: () => void;
}

function PosterDetailsForm({ onClose }: PosterDetailsFormProps) {
  const { settings, updateDetail, base64Image } = useProject();
  const [isGeneratingText, setIsGeneratingText] = useState(false);
  const d = settings.details;

  const isHeadlineValid = getWordCount(d.headline) > 0 && getWordCount(d.headline) <= 3;
  const isTaglineValid = getWordCount(d.tagline) > 0 && getWordCount(d.tagline) <= 3;
  const isFeatureValid = (f: string) => getWordCount(f) <= 3;
  const canSave =
    isHeadlineValid &&
    isTaglineValid &&
    isFeatureValid(d.feature1) &&
    isFeatureValid(d.feature2) &&
    isFeatureValid(d.feature3);

  const generateProductDetails = async () => {
    if (!base64Image) return;
    setIsGeneratingText(true);
    try {
      const res = await fetch("/api/generate-text", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ base64Image }),
      });
      if (!res.ok) throw new Error("API error");
      const data = await res.json();
      const truncate = (str: string, n: number) =>
        str ? str.split(/\s+/).slice(0, n).join(" ") : "";
      updateDetail("headline", truncate(data.headline, 3));
      updateDetail("tagline", truncate(data.tagline, 3));
      updateDetail("feature1", truncate(data.feature1, 3));
      updateDetail("feature2", truncate(data.feature2, 3));
      updateDetail("feature3", truncate(data.feature3, 3));
    } catch {
      // error handled by caller
    } finally {
      setIsGeneratingText(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Auto-generate */}
      <div className="flex justify-end">
        <button
          onClick={generateProductDetails}
          disabled={isGeneratingText}
          className="flex items-center gap-1.5 bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white px-3 py-1.5 rounded-lg shadow-sm hover:shadow-md transition-all text-[9px] font-black uppercase tracking-widest active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isGeneratingText ? <Loader2 className="animate-spin" size={12} /> : <Bot size={12} />}
          {isGeneratingText ? "Proses..." : "Isi Otomatis AI"}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
        {/* Headline */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <label className="text-[10px] font-black uppercase tracking-widest text-orange-300">HEADLINE</label>
            {d.headline.length > 0 && (
              isHeadlineValid
                ? <CheckCircle2 size={16} className="text-emerald-400" />
                : <XCircle size={16} className="text-rose-400" />
            )}
          </div>
          <input
            type="text"
            value={d.headline}
            onChange={(e) => updateDetail("headline", e.target.value)}
            placeholder="Contoh: Sepatu Lari Premium"
            className={`w-full px-4 md:px-5 py-3 md:py-4 bg-orange-50/30 border-2 rounded-xl md:rounded-2xl outline-none transition-all font-bold italic text-slate-800 ${
              !isHeadlineValid && d.headline.length > 0 ? "border-rose-200" : "border-transparent focus:border-orange-200"
            }`}
          />
          <p className={`text-[9px] font-bold italic ${!isHeadlineValid && d.headline.length > 0 ? "text-rose-400" : "text-slate-400"}`}>
            Maksimal 3 kata
          </p>
        </div>

        {/* Tagline */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <label className="text-[10px] font-black uppercase tracking-widest text-orange-300">TAGLINE</label>
            {d.tagline.length > 0 && (
              isTaglineValid
                ? <CheckCircle2 size={16} className="text-emerald-400" />
                : <XCircle size={16} className="text-rose-400" />
            )}
          </div>
          <input
            type="text"
            value={d.tagline}
            onChange={(e) => updateDetail("tagline", e.target.value)}
            placeholder="Contoh: Nyaman Setiap Langkah"
            className={`w-full px-4 md:px-5 py-3 md:py-4 bg-orange-50/30 border-2 rounded-xl md:rounded-2xl outline-none font-medium text-slate-800 ${
              !isTaglineValid && d.tagline.length > 0 ? "border-rose-200" : "border-transparent focus:border-orange-200"
            }`}
          />
          <p className={`text-[9px] font-bold italic ${!isTaglineValid && d.tagline.length > 0 ? "text-rose-400" : "text-slate-400"}`}>
            Maksimal 3 kata
          </p>
        </div>

        {/* Features */}
        <div className="space-y-2 md:col-span-2">
          <label className="text-[10px] font-black uppercase tracking-widest text-orange-300">FITUR UTAMA</label>
          <div className="space-y-3">
            {(["feature1", "feature2", "feature3"] as const).map((key, i) => {
              const val = d[key];
              const valid = isFeatureValid(val);
              return (
                <div key={key}>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-[9px] font-bold text-slate-400 italic">Fitur {i + 1}</span>
                    {val.length > 0 && (
                      valid
                        ? <CheckCircle2 size={12} className="text-emerald-400" />
                        : <XCircle size={12} className="text-rose-400" />
                    )}
                  </div>
                  <input
                    type="text"
                    value={val}
                    onChange={(e) => updateDetail(key, e.target.value)}
                    placeholder="Contoh: Bahan Premium"
                    className={`w-full px-4 py-3 bg-orange-50/30 border-2 rounded-xl outline-none transition-all font-medium text-sm text-slate-800 ${
                      !valid && val.length > 0 ? "border-rose-200" : "border-transparent focus:border-orange-200"
                    }`}
                  />
                  {!valid && val.length > 0 && (
                    <p className="text-[8px] text-rose-400 font-bold italic mt-1">Maksimal 3 kata</p>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Delivery options */}
        <div className="space-y-4 md:col-span-2 pt-4 border-t border-orange-100">
          <label className="block text-[10px] font-black uppercase tracking-widest text-orange-300 italic">
            TERSEDIA (Opsional)
          </label>
          <div className="grid grid-cols-3 gap-3">
            {[
              { key: "cod", label: "COD", icon: Truck, activeColor: "border-orange-400 bg-white shadow-xl shadow-orange-50", checkColor: "bg-orange-400 border-orange-400", iconBg: "bg-orange-100", iconActive: "text-orange-600", textColor: "text-orange-900" },
              { key: "instant", label: "INSTANT", icon: Bike, activeColor: "border-emerald-400 bg-white shadow-xl shadow-emerald-50", checkColor: "bg-emerald-400 border-emerald-400", iconBg: "bg-emerald-100", iconActive: "text-emerald-600", textColor: "text-emerald-900" },
              { key: "sameday", label: "SAMEDAY", icon: Box, activeColor: "border-blue-400 bg-white shadow-xl shadow-blue-50", checkColor: "bg-blue-400 border-blue-400", iconBg: "bg-blue-100", iconActive: "text-blue-600", textColor: "text-blue-900" },
            ].map(({ key, label, icon: Icon, activeColor, checkColor, iconBg, iconActive, textColor }) => {
              const active = d[key as keyof typeof d] as boolean;
              return (
                <button
                  key={key}
                  onClick={() => updateDetail(key, !active)}
                  className={`flex flex-col items-center p-3 rounded-2xl border-2 transition-all group ${
                    active ? activeColor : "border-orange-50 bg-white/50 text-slate-400 hover:border-orange-200"
                  }`}
                >
                  <div className={`w-10 h-10 ${iconBg} rounded-xl flex items-center justify-center mb-2 shadow-sm ${active ? iconActive : "text-slate-300"}`}>
                    <Icon size={20} />
                  </div>
                  <span className={`text-[9px] font-black uppercase ${textColor}`}>{label}</span>
                  <div className={`mt-2 w-4 h-4 rounded-md border-2 flex items-center justify-center transition-colors ${active ? checkColor : "border-slate-200 bg-white"}`}>
                    {active && <Check size={10} className="text-white" />}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <button
        onClick={onClose}
        disabled={!canSave}
        className={`w-full py-4 md:py-5 rounded-full font-black italic uppercase tracking-widest shadow-xl mt-4 md:mt-6 transition-all ${
          canSave
            ? "bg-orange-400 text-white hover:bg-orange-500 active:scale-95 shadow-orange-100"
            : "bg-slate-100 text-slate-400 cursor-not-allowed"
        }`}
      >
        Simpan Detail
      </button>
    </div>
  );
}

// ─── Logo Settings Form ───────────────────────────────────────────────────────

function LogoSettingsForm({ onClose }: { onClose: () => void }) {
  const { logoImage, setLogoImage, clearLogoImage, settings, updateSetting } = useProject();

  const handleLogoFile = (file: File) => {
    const reader = new FileReader();
    reader.onloadend = () => setLogoImage(reader.result as string);
    reader.readAsDataURL(file);
  };

  return (
    <div className="space-y-6">
      {/* Upload */}
      <div className="space-y-2">
        <label className="text-[10px] font-black uppercase tracking-widest text-orange-300">
          Upload Logo
        </label>
        <div className={`relative border-2 border-dashed rounded-2xl p-6 flex flex-col items-center justify-center cursor-pointer transition-all ${logoImage ? "border-orange-400 bg-orange-50/20" : "border-slate-200 hover:border-orange-300"}`}>
          {!logoImage ? (
            <label className="cursor-pointer w-full h-full flex flex-col items-center justify-center">
              <input type="file" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) handleLogoFile(f); }} accept="image/*" />
              <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center mb-2 text-slate-400">
                <Upload size={18} />
              </div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Klik Upload</span>
            </label>
          ) : (
            <div className="relative w-24 h-24">
              <img src={logoImage} alt="Logo" className="w-full h-full object-contain" />
              <button onClick={clearLogoImage} className="absolute -top-2 -right-2 bg-rose-500 text-white p-1 rounded-full">
                <X size={12} />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Position */}
      <div className="space-y-2">
        <label className="text-[10px] font-black uppercase tracking-widest text-orange-300">Posisi Logo</label>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
          {LOGO_OPTIONS.map((opt) => {
            const Icon = opt.icon;
            const active = settings.logoPlacement === opt.id;
            return (
              <button
                key={opt.id}
                onClick={() => {
                  updateSetting("logoPlacement", opt.id as LogoPlacement);
                  onClose();
                }}
                className={`flex flex-col items-center p-4 rounded-2xl border-2 transition-all group ${
                  active
                    ? "border-orange-400 bg-orange-50/20 shadow-xl shadow-orange-50"
                    : "border-orange-50 bg-white/50 hover:border-orange-100"
                }`}
              >
                <div className={`w-10 h-10 rounded-xl shadow-sm flex items-center justify-center mb-2 group-hover:scale-110 transition-transform ${active ? "bg-orange-400 text-white" : "bg-white text-slate-400"}`}>
                  <Icon size={20} />
                </div>
                <div className={`text-center font-black italic uppercase text-[9px] tracking-widest ${active ? "text-orange-600" : "text-slate-400"}`}>
                  {opt.desc}
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ─── Step 3 Main ──────────────────────────────────────────────────────────────

export function Step3Settings() {
  const {
    settings,
    updateSetting,
    activeSubWindow,
    openSubWindow,
    closeSubWindow,
  } = useProject();

  const togglePosterDetails = useCallback(() => {
    const next = !settings.posterDetails;
    updateSetting("posterDetails", next);
    if (next) openSubWindow("posterDetails");
  }, [settings.posterDetails, updateSetting, openSubWindow]);

  const toggleLogo = useCallback(() => {
    const next = !settings.logo;
    updateSetting("logo", next);
    if (next) openSubWindow("logo");
  }, [settings.logo, updateSetting, openSubWindow]);

  return (
    <div className="space-y-6 md:space-y-10 animate-in fade-in slide-in-from-bottom-6 duration-700 pb-6">
      <h2 className="text-3xl font-black text-center italic uppercase tracking-tighter text-orange-900">
        Setting Tampilan
      </h2>

      <div className="space-y-4 md:space-y-8 max-w-4xl mx-auto text-slate-800">
        {/* Toggle cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <ToggleCard
            label="1. Detail Produk"
            icon={Type}
            enabled={settings.posterDetails}
            onToggle={togglePosterDetails}
            actionLabel="Lengkapi Data"
            onActionClick={() => openSubWindow("posterDetails")}
          />
          <ToggleCard
            label="2. Logo Brand"
            icon={Layout}
            enabled={settings.logo}
            onToggle={toggleLogo}
            actionLabel="Ubah Posisi"
            onActionClick={() => openSubWindow("logo")}
          />
        </div>

        {/* Visual density */}
        <section className="bg-white p-4 md:p-6 rounded-[1.5rem] md:rounded-[2.5rem] border border-orange-100 shadow-sm shadow-orange-50/50">
          <label className="block font-black text-[9px] md:text-[10px] uppercase tracking-widest mb-4 md:mb-6 text-orange-300 italic">
            3. Efek Visual
          </label>
          <div className="grid grid-cols-3 gap-2 md:gap-4">
            {VISUAL_EFFECT_OPTIONS.map((opt) => {
              const active = settings.visualDensity === opt.id;
              return (
                <button
                  key={opt.id}
                  onClick={() => updateSetting("visualDensity", opt.id as VisualDensity)}
                  className={`flex flex-col items-center p-2.5 md:p-6 rounded-xl md:rounded-3xl border-2 transition-all relative ${
                    active
                      ? "border-orange-400 bg-white shadow-lg shadow-orange-50 scale-105 md:scale-110 z-10"
                      : "border-slate-50 bg-slate-50/50 text-slate-400"
                  }`}
                >
                  <div className={`w-8 h-8 md:w-12 md:h-12 rounded-lg md:rounded-2xl flex items-center justify-center mb-1.5 md:mb-3 transition-colors ${active ? "bg-orange-400 text-white shadow-md shadow-orange-100" : "bg-white text-slate-200"}`}>
                    {opt.id === "Bersih" ? <ImageIcon size={16} /> : opt.id === "Natural" ? <Sparkles size={16} /> : <Grid size={16} />}
                  </div>
                  <div className={`text-center font-black italic uppercase text-[7px] md:text-xs tracking-widest mb-0.5 md:mb-1 ${active ? "text-orange-500" : ""}`}>
                    {opt.name}
                  </div>
                  <p className="text-[6px] md:text-[9px] font-bold uppercase tracking-tighter leading-none mt-1 text-slate-400 text-center line-clamp-1">
                    {opt.desc}
                  </p>
                </button>
              );
            })}
          </div>
        </section>

        {/* Variation count */}
        <section className="bg-white p-4 md:p-6 rounded-[1.5rem] md:rounded-[2.5rem] border border-orange-100 shadow-sm shadow-orange-50/50">
          <label className="block font-black text-[9px] md:text-[10px] uppercase tracking-widest mb-3 md:mb-6 text-orange-300 italic">
            4. Jumlah Variasi
          </label>
          <div className="flex gap-2 md:gap-4 text-slate-800">
            {([1, 2, 4] as VariationCount[]).map((num) => (
              <button
                key={num}
                onClick={() => updateSetting("count", num)}
                className={`flex-1 h-10 md:h-16 rounded-xl md:rounded-[1.5rem] border-2 font-black text-xs md:text-base transition-all ${
                  settings.count === num
                    ? "bg-orange-400 text-white border-orange-400 shadow-lg shadow-orange-100 scale-105"
                    : "bg-slate-50/50 border-slate-50 text-slate-400"
                }`}
              >
                {num}
              </button>
            ))}
          </div>
        </section>

        {/* Additional ideas */}
        <section className="bg-white p-4 md:p-6 rounded-[1.5rem] md:rounded-[2.5rem] border border-orange-100 shadow-sm shadow-orange-50/50">
          <label className="flex items-center gap-2 font-black text-[9px] md:text-[10px] uppercase tracking-widest mb-3 md:mb-4 text-orange-300 italic">
            <Lightbulb size={12} className="text-amber-400" />
            5. Ide Tambahan
          </label>
          <textarea
            value={settings.additionalIdeas}
            onChange={(e) => updateSetting("additionalIdeas", e.target.value)}
            placeholder="Aksen dekorasi kayu, suasana senja hangat..."
            className="w-full min-h-[100px] md:min-h-[120px] p-3 md:p-5 bg-orange-50/30 border-2 border-transparent focus:border-orange-200 rounded-xl md:rounded-3xl outline-none transition-all text-xs md:text-sm font-medium resize-none placeholder:text-slate-300"
          />
        </section>
      </div>

      {/* SubWindows */}
      <SubWindow
        open={activeSubWindow === "posterDetails"}
        title="Detail Tampilan"
        onClose={closeSubWindow}
      >
        <PosterDetailsForm onClose={closeSubWindow} />
      </SubWindow>

      <SubWindow
        open={activeSubWindow === "logo"}
        title="Posisi Logo"
        onClose={closeSubWindow}
      >
        <LogoSettingsForm onClose={closeSubWindow} />
      </SubWindow>
    </div>
  );
}
