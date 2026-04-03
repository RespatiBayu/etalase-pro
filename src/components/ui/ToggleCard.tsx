"use client";

import type { LucideIcon } from "lucide-react";

interface ToggleCardProps {
  label: string;
  icon: LucideIcon;
  enabled: boolean;
  onToggle: () => void;
  actionLabel?: string;
  onActionClick?: () => void;
}

export function ToggleCard({
  label,
  icon: Icon,
  enabled,
  onToggle,
  actionLabel,
  onActionClick,
}: ToggleCardProps) {
  return (
    <div
      className={`p-4 md:p-6 rounded-[1.5rem] md:rounded-[2.5rem] border-2 transition-all flex flex-col justify-between ${
        enabled
          ? "border-orange-400 bg-white shadow-xl shadow-orange-50"
          : "border-orange-100 bg-white/50"
      }`}
    >
      <div className="flex justify-between items-center mb-4 md:mb-6">
        <div
          className={`p-2 md:p-3 rounded-xl md:rounded-2xl transition-colors ${
            enabled
              ? "bg-orange-400 text-white shadow-md shadow-orange-100"
              : "bg-slate-50 text-slate-300"
          }`}
        >
          <Icon size={18} />
        </div>
        <button
          onClick={onToggle}
          className={`w-12 md:w-14 h-6 md:h-7 rounded-full relative transition-colors shadow-inner ${
            enabled ? "bg-orange-400" : "bg-slate-200"
          }`}
        >
          <div
            className={`absolute top-1 w-4 h-4 md:w-5 md:h-5 bg-white rounded-full transition-all shadow-md ${
              enabled ? "right-1" : "left-1"
            }`}
          />
        </button>
      </div>
      <div>
        <div className="font-black text-[10px] md:text-xs uppercase italic text-orange-900">
          {label}
        </div>
      </div>
      {enabled && actionLabel && onActionClick && (
        <button
          onClick={onActionClick}
          className="mt-4 md:mt-6 py-2.5 md:py-3 bg-orange-50/50 hover:bg-orange-400 hover:text-white rounded-xl text-[8px] md:text-[9px] font-black uppercase tracking-widest border border-orange-200 transition-all text-orange-600"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
}
