"use client";

import { useCallback } from "react";
import {
  User,
  Users,
  Scissors,
  ShoppingBag,
  Home,
  Sparkles,
  Wand2,
  RotateCcw,
  Wallpaper,
} from "lucide-react";
import { StyleCard } from "@/components/ui/StyleCard";
import { useProject } from "@/context/ProjectContext";
import {
  FASHION_STYLES,
  FASHION_STYLE_DETAILS,
  NON_FASHION_PRESETS,
} from "@/config/styles";
import type {
  FashionGender,
  FashionAge,
  FashionStyleName,
  PresetTab,
} from "@/types";

const GENDERS: FashionGender[] = ["Pria", "Wanita", "Unisex"];
const AGES: FashionAge[] = ["Dewasa", "Remaja", "Anak-Anak", "Balita"];
const PRESET_TABS: PresetTab[] = ["Commercial", "Lifestyle", "Premium"];

export function Step2Style() {
  const {
    selectedCategory,
    selectedStyle,
    setSelectedStyle,
    selectedGender,
    setSelectedGender,
    selectedAge,
    setSelectedAge,
    activePresetTab,
    setActivePresetTab,
    selectedPresetId,
    setSelectedPresetId,
    generateTab,
    setGenerateTab,
    referenceImage,
    setReferenceImage,
  } = useProject();

  const handleReferenceFile = useCallback(
    (file: File) => {
      const reader = new FileReader();
      reader.onloadend = () => setReferenceImage(reader.result as string);
      reader.readAsDataURL(file);
    },
    [setReferenceImage]
  );

  if (selectedCategory === "fashion") {
    return (
      <div className="space-y-6 md:space-y-8 animate-in fade-in slide-in-from-bottom-6 duration-700">
        <h2 className="text-xl md:text-3xl font-black text-center italic uppercase tracking-tighter text-orange-900">
          Pilih Gaya Visual
        </h2>

        {/* Gender + Age */}
        <div className="bg-orange-50/50 p-4 md:p-6 rounded-[1.5rem] md:rounded-[2.5rem] border border-orange-100 max-w-2xl mx-auto space-y-4 md:space-y-6">
          <div className="flex flex-col md:flex-row gap-4 md:gap-8">
            {/* Gender */}
            <div className="flex-1 space-y-2 md:space-y-3">
              <label className="flex items-center gap-2 text-[9px] md:text-[10px] font-black uppercase tracking-widest text-orange-300 italic">
                <User size={14} /> Gender
              </label>
              <div className="flex bg-white p-1 rounded-xl md:rounded-2xl border border-orange-100 shadow-sm">
                {GENDERS.map((g) => (
                  <button
                    key={g}
                    onClick={() => setSelectedGender(g)}
                    className={`flex-1 py-2 md:py-3 px-1 rounded-lg md:rounded-xl text-[8px] md:text-[10px] font-black uppercase transition-all ${
                      selectedGender === g
                        ? "bg-orange-400 text-white shadow-md shadow-orange-100"
                        : "text-slate-400 hover:text-orange-400"
                    }`}
                  >
                    {g}
                  </button>
                ))}
              </div>
            </div>

            {/* Age */}
            <div className="flex-1 space-y-2 md:space-y-3">
              <label className="flex items-center gap-2 text-[9px] md:text-[10px] font-black uppercase tracking-widest text-orange-300 italic">
                <Users size={14} /> Usia
              </label>
              <div className="flex bg-white p-1 rounded-xl md:rounded-2xl border border-orange-100 shadow-sm">
                {AGES.map((a) => (
                  <button
                    key={a}
                    onClick={() => setSelectedAge(a)}
                    className={`flex-1 py-2 md:py-3 px-1 rounded-lg md:rounded-xl text-[8px] md:text-[10px] font-black uppercase transition-all ${
                      selectedAge === a
                        ? "bg-orange-400 text-white shadow-md shadow-orange-100"
                        : "text-slate-400 hover:text-orange-400"
                    }`}
                  >
                    {a}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Tab */}
        <div className="flex justify-center bg-slate-100/50 p-1 rounded-full overflow-x-auto no-scrollbar max-w-2xl mx-auto gap-1">
          <button className="flex-1 py-2.5 md:py-3 px-4 md:px-6 rounded-full text-[8px] md:text-[10px] font-black uppercase transition-all whitespace-nowrap flex items-center justify-center gap-1 md:gap-2 bg-white text-orange-500 shadow-md shadow-orange-50 border border-orange-50">
            <Scissors size={12} /> Fashion Layout
          </button>
        </div>

        {/* Style grid */}
        <div className="grid gap-3 md:gap-4 overflow-y-auto no-scrollbar scroll-smooth grid-cols-2 xs:grid-cols-4 h-[350px] md:h-[420px]">
          {FASHION_STYLES.map((style) => {
            const info = FASHION_STYLE_DETAILS[style];
            return (
              <StyleCard
                key={style}
                id={style}
                name={style}
                desc={info.desc}
                icon={info.icon}
                selected={selectedStyle === style}
                onClick={() => setSelectedStyle(style as FashionStyleName)}
              />
            );
          })}
        </div>
      </div>
    );
  }

  // Non-fashion
  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="space-y-4 pt-4 border-t border-orange-100">
        <h2 className="text-xl md:text-3xl font-black text-center italic uppercase tracking-tighter text-orange-900">
          Pilih Gaya Foto
        </h2>

        {/* Tabs */}
        <div className="flex justify-center mb-6">
          <div className="flex bg-orange-100/50 p-1 rounded-full w-full max-w-md overflow-x-auto no-scrollbar">
            {PRESET_TABS.map((tab) => (
              <button
                key={tab}
                onClick={() => {
                  setActivePresetTab(tab);
                  setGenerateTab("Preset");
                }}
                className={`flex-1 py-3 px-4 rounded-full text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap flex items-center justify-center gap-1.5 ${
                  activePresetTab === tab && generateTab === "Preset"
                    ? "bg-white text-orange-500 shadow-md shadow-orange-50 border border-orange-50"
                    : "text-slate-400 hover:text-slate-600"
                }`}
              >
                {tab === "Commercial" && <ShoppingBag size={12} />}
                {tab === "Lifestyle" && <Home size={12} />}
                {tab === "Premium" && <Sparkles size={12} />}
                {tab}
              </button>
            ))}
            <button
              onClick={() => setGenerateTab("Custom")}
              className={`flex-1 py-3 px-4 rounded-full text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap flex items-center justify-center gap-1.5 ${
                generateTab === "Custom"
                  ? "bg-white text-orange-500 shadow-md shadow-orange-50 border border-orange-50"
                  : "text-slate-400 hover:text-slate-600"
              }`}
            >
              <Wand2 size={12} /> Custom
            </button>
          </div>
        </div>

        {/* Preset grid */}
        {generateTab === "Preset" ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 md:gap-4 animate-in fade-in slide-in-from-left-4 duration-300 h-[380px] overflow-y-auto no-scrollbar">
            {NON_FASHION_PRESETS[activePresetTab].map((preset) => (
              <StyleCard
                key={preset.id}
                id={preset.id}
                name={preset.name}
                desc={preset.desc}
                icon={preset.icon}
                selected={selectedPresetId === preset.id}
                onClick={() => setSelectedPresetId(preset.id)}
              />
            ))}
          </div>
        ) : (
          /* Custom reference upload */
          <div className="animate-in fade-in slide-in-from-right-4 duration-300 h-[380px] flex items-center justify-center">
            <div className="bg-white/50 p-6 md:p-8 rounded-[2rem] border-2 border-dashed border-orange-200 text-center w-full max-w-md">
              <div className="space-y-6">
                <div className="space-y-2">
                  <h3 className="font-black text-orange-900 uppercase tracking-widest text-sm">
                    Upload Referensi Background
                  </h3>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    Upload gambar dengan suasana, pencahayaan, atau komposisi yang
                    ingin Anda tiru. AI akan menggabungkan produk Anda ke dalam gaya
                    referensi tersebut.
                  </p>
                </div>

                <label
                  className={`relative block w-full aspect-[16/9] md:aspect-[2/1] rounded-2xl overflow-hidden cursor-pointer transition-all group ${
                    referenceImage
                      ? "border-0 ring-4 ring-orange-100"
                      : "border-2 border-orange-100 bg-orange-50/50 hover:bg-orange-50"
                  }`}
                >
                  <input
                    type="file"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleReferenceFile(file);
                    }}
                    accept="image/*"
                  />
                  {referenceImage ? (
                    <>
                      <img
                        src={referenceImage}
                        alt="Reference"
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <div className="bg-white/20 backdrop-blur-md p-3 rounded-full mb-2">
                          <RotateCcw className="text-white" size={24} />
                        </div>
                        <span className="text-white font-bold text-xs uppercase tracking-widest">
                          Ganti Gambar
                        </span>
                      </div>
                    </>
                  ) : (
                    <div className="flex flex-col items-center justify-center h-full gap-3">
                      <div className="w-16 h-16 bg-white rounded-2xl shadow-sm flex items-center justify-center group-hover:scale-110 transition-transform">
                        <Wallpaper className="text-orange-300" size={32} />
                      </div>
                      <span className="font-black text-orange-300 text-xs uppercase tracking-widest">
                        Klik untuk Upload
                      </span>
                    </div>
                  )}
                </label>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
