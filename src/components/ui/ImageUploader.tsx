"use client";

import { Upload, Plus, Trash2 } from "lucide-react";

interface PrimaryUploaderProps {
  image: string | null;
  onChange: (file: File) => void;
  label?: string;
}

export function PrimaryUploader({
  image,
  onChange,
  label = "Produk Utama",
}: PrimaryUploaderProps) {
  return (
    <label
      className={`relative border-2 border-dashed rounded-[1.5rem] md:rounded-[2rem] p-4 md:p-12 flex flex-col items-center justify-center cursor-pointer transition-all duration-500 h-48 md:h-80 ${
        image
          ? "border-orange-400 bg-orange-50/20"
          : "border-slate-200 bg-white hover:border-orange-300"
      }`}
    >
      <input
        type="file"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) onChange(file);
        }}
        accept="image/*"
      />
      {image ? (
        <img
          src={image}
          alt="Preview"
          className="w-full h-full object-contain rounded-2xl md:rounded-3xl shadow-lg"
        />
      ) : (
        <div className="text-center group">
          <div className="w-10 h-10 md:w-16 md:h-16 bg-white rounded-xl md:rounded-2xl shadow-sm flex items-center justify-center mx-auto mb-3 md:mb-4 group-hover:scale-110 transition-transform">
            <Upload className="text-orange-400" size={20} />
          </div>
          <p className="font-black italic uppercase tracking-widest text-[8px] md:text-sm text-orange-400">
            {label}
          </p>
        </div>
      )}
    </label>
  );
}

interface SecondaryUploaderProps {
  image: string | null;
  onChange: (file: File) => void;
  onRemove: () => void;
}

export function SecondaryUploader({
  image,
  onChange,
  onRemove,
}: SecondaryUploaderProps) {
  return (
    <div
      className={`relative border-2 border-dashed rounded-[1.5rem] md:rounded-[2rem] p-4 md:p-12 flex flex-col items-center justify-center cursor-pointer transition-all duration-500 h-48 md:h-80 ${
        image
          ? "border-orange-400 bg-orange-50/20"
          : "border-slate-200 bg-slate-50/50 hover:bg-slate-50"
      }`}
    >
      {!image ? (
        <label className="cursor-pointer w-full h-full flex flex-col items-center justify-center group">
          <input
            type="file"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) onChange(file);
            }}
            accept="image/*"
          />
          <div className="w-10 h-10 md:w-16 md:h-16 bg-slate-100 rounded-xl md:rounded-2xl flex items-center justify-center mb-3 md:mb-4 shadow-sm text-slate-400 group-hover:scale-110 transition-transform">
            <Plus size={20} />
          </div>
          <p className="font-black italic uppercase tracking-widest text-[8px] md:text-sm text-slate-400">
            Produk Kedua (Opsional)
          </p>
        </label>
      ) : (
        <div className="relative w-full h-full group">
          <img
            src={image}
            alt="Product 2"
            className="w-full h-full object-contain rounded-2xl md:rounded-3xl shadow-lg"
          />
          <button
            onClick={onRemove}
            className="absolute top-2 right-2 bg-rose-500 text-white p-2 rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <Trash2 size={16} />
          </button>
          <p className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/50 text-white px-2 py-1 md:px-3 md:py-1 rounded-full text-[6px] md:text-[8px] font-bold uppercase tracking-widest backdrop-blur-sm">
            Produk Kedua
          </p>
        </div>
      )}
    </div>
  );
}

interface LogoUploaderProps {
  image: string | null;
  onChange: (file: File) => void;
  onRemove: () => void;
}

export function LogoUploader({ image, onChange, onRemove }: LogoUploaderProps) {
  return (
    <div
      className={`relative border-2 border-dashed rounded-2xl p-6 flex flex-col items-center justify-center cursor-pointer transition-all ${
        image ? "border-orange-400 bg-orange-50/20" : "border-slate-200 hover:border-orange-300"
      }`}
    >
      {!image ? (
        <label className="cursor-pointer w-full h-full flex flex-col items-center justify-center">
          <input
            type="file"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) onChange(file);
            }}
            accept="image/*"
          />
          <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center mb-2 text-slate-400">
            <Upload size={18} />
          </div>
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
            Klik Upload
          </span>
        </label>
      ) : (
        <div className="relative w-24 h-24">
          <img src={image} alt="Logo" className="w-full h-full object-contain" />
          <button
            onClick={onRemove}
            className="absolute -top-2 -right-2 bg-rose-500 text-white p-1 rounded-full"
          >
            <Upload size={12} />
          </button>
        </div>
      )}
    </div>
  );
}
