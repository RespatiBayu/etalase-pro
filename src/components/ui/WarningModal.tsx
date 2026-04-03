"use client";

import { AlertCircle } from "lucide-react";
import type { WarningModalState } from "@/types";

interface WarningModalProps {
  modal: WarningModalState;
  onConfirm: () => void;
  onCancel: () => void;
}

export function WarningModal({ modal, onConfirm, onCancel }: WarningModalProps) {
  if (!modal.show) return null;

  const actionLabel =
    modal.mode === "reset" ? "memulai project baru" : "kembali";

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-orange-900/10 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-white rounded-[2rem] p-6 md:p-8 w-full max-w-xs md:max-w-sm shadow-2xl animate-in zoom-in-95 duration-300 text-slate-800">
        <div className="w-12 h-12 md:w-16 md:h-16 bg-rose-50 rounded-2xl flex items-center justify-center mb-6 mx-auto">
          <AlertCircle size={28} className="text-rose-500" />
        </div>
        <h3 className="text-lg md:text-xl font-black italic text-center uppercase mb-2">
          Hapus Hasil?
        </h3>
        <p className="text-slate-500 text-center text-xs md:text-sm mb-6 md:mb-8 leading-relaxed">
          Seluruh data dan gambar akan dihapus jika Anda {actionLabel}.
        </p>
        <div className="flex flex-col gap-3">
          <button
            onClick={onConfirm}
            className="w-full bg-rose-500 text-white py-3 md:py-4 rounded-full font-black italic uppercase tracking-widest shadow-lg active:scale-95 transition-all text-xs md:text-sm"
          >
            Ya, Hapus
          </button>
          <button
            onClick={onCancel}
            className="w-full bg-slate-100 text-slate-500 py-3 md:py-4 rounded-full font-black italic uppercase tracking-widest text-xs md:text-sm"
          >
            Batal
          </button>
        </div>
      </div>
    </div>
  );
}
