"use client";

import { Check } from "lucide-react";
import type { WizardStep } from "@/types";

interface StepIndicatorProps {
  currentStep: WizardStep;
}

const STEP_LABELS = ["Upload", "Style", "Detail", "Preview", "Result"];

export function StepIndicator({ currentStep }: StepIndicatorProps) {
  return (
    <div className="flex items-center justify-between mb-6 md:mb-8 max-w-md mx-auto px-2 md:px-4 text-slate-600">
      {([1, 2, 3, 4, 5] as WizardStep[]).map((i) => (
        <div key={i} className="flex flex-col items-center flex-1 relative">
          <div
            className={`w-6 h-6 md:w-8 md:h-8 rounded-full flex items-center justify-center border-2 z-10 transition-all duration-300 ${
              currentStep >= i
                ? "bg-orange-400 border-orange-400 text-white shadow-lg shadow-orange-100"
                : "bg-white border-slate-200 text-slate-300"
            }`}
          >
            {currentStep > i ? (
              <Check size={12} />
            ) : (
              <span className="text-[8px] md:text-[10px] font-bold">{i}</span>
            )}
          </div>
          <span
            className={`text-[6px] md:text-[8px] mt-1 font-bold uppercase tracking-wider text-center ${
              currentStep >= i ? "text-orange-500" : "text-slate-400"
            }`}
          >
            {STEP_LABELS[i - 1]}
          </span>
          {i < 5 && (
            <div
              className={`absolute top-3 md:top-4 left-1/2 w-full h-[2px] -z-0 transition-colors duration-500 ${
                currentStep > i ? "bg-orange-400" : "bg-slate-100"
              }`}
            />
          )}
        </div>
      ))}
    </div>
  );
}
