"use client";

import { CATEGORIES } from "@/config/categories";
import type { CategoryId } from "@/types";

interface CategorySelectorProps {
  selected: CategoryId | null;
  onSelect: (id: CategoryId) => void;
}

export function CategorySelector({ selected, onSelect }: CategorySelectorProps) {
  return (
    <div className="grid grid-cols-2 xs:grid-cols-3 lg:grid-cols-6 gap-3 md:gap-4">
      {CATEGORIES.map((cat) => {
        const IconComp = cat.icon;
        const isSelected = selected === cat.id;
        return (
          <button
            key={cat.id}
            onClick={() => onSelect(cat.id as CategoryId)}
            className={`flex flex-col items-center p-3 md:p-5 rounded-2xl md:rounded-3xl border-2 transition-all duration-300 ${
              isSelected
                ? "border-orange-400 bg-white shadow-xl shadow-orange-100 scale-105"
                : "border-orange-50 bg-white text-slate-400 hover:border-orange-200"
            }`}
          >
            <div
              className={`p-2 md:p-3 rounded-xl md:rounded-2xl mb-2 md:mb-3 ${
                isSelected ? cat.color : "bg-slate-50"
              }`}
            >
              <IconComp size={20} className="md:size-7" />
            </div>
            <span
              className={`text-[8px] md:text-[10px] font-black uppercase tracking-widest italic text-center leading-tight ${
                isSelected ? "text-orange-600" : ""
              }`}
            >
              {cat.name}
            </span>
          </button>
        );
      })}
    </div>
  );
}
