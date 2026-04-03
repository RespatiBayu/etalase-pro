"use client";

import type { LucideIcon } from "lucide-react";

interface StyleCardProps {
  id: string;
  name: string;
  desc: string;
  icon: LucideIcon;
  selected: boolean;
  onClick: () => void;
}

export function StyleCard({
  name,
  desc,
  icon: Icon,
  selected,
  onClick,
}: StyleCardProps) {
  return (
    <button
      onClick={onClick}
      className={`flex flex-col items-center p-3 md:p-4 rounded-2xl md:rounded-3xl border-2 transition-all duration-300 ${
        selected
          ? "border-orange-400 bg-white shadow-xl shadow-orange-100 scale-105"
          : "border-orange-50 bg-white text-slate-400 hover:border-orange-200"
      }`}
    >
      <div
        className={`p-2.5 md:p-3 rounded-xl md:rounded-2xl mb-2 md:mb-3 ${
          selected ? "bg-orange-100 text-orange-600" : "bg-slate-50 text-slate-300"
        }`}
      >
        <Icon size={24} className="md:size-7" />
      </div>
      <div className="text-center">
        <h4
          className={`text-[9px] md:text-[10px] font-black uppercase tracking-widest italic leading-tight ${
            selected ? "text-orange-600" : ""
          }`}
        >
          {name}
        </h4>
        <p className="text-[7px] md:text-[8px] font-medium text-slate-400 leading-tight mt-1 line-clamp-2 px-1">
          {desc}
        </p>
      </div>
    </button>
  );
}
