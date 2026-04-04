"use client";

import { RotateCcw, ChevronLeft, ChevronRight } from "lucide-react";
import { StepIndicator } from "@/components/ui/StepIndicator";
import { WarningModal } from "@/components/ui/WarningModal";
import { Step1Upload } from "@/components/steps/Step1Upload";
import { Step2Style } from "@/components/steps/Step2Style";
import { Step3Settings } from "@/components/steps/Step3Settings";
import { Step4Preview } from "@/components/steps/Step4Preview";
import { Step5Results } from "@/components/steps/Step5Results";
import { useProject } from "@/context/ProjectContext";

interface WizardShellProps {
  onTokensUpdated?: () => void;
}

export function WizardShell({ onTokensUpdated }: WizardShellProps) {
  const {
    step,
    nextStep,
    prevStep,
    selectedCategory,
    uploadedImage,
    handleNewProjectClick,
    warningModal,
    setWarningModal,
    setGeneratedResults,
    setStep,
    performReset,
    isGenerating,
  } = useProject();

  const canGoNext = !(step === 1 && (!selectedCategory || !uploadedImage));

  const handleWarningConfirm = () => {
    if (warningModal.mode === "reset") {
      performReset();
    } else {
      setGeneratedResults([]);
      setStep(3);
      setWarningModal({ show: false, mode: "" });
    }
  };

  return (
    <div className="p-3 md:p-8">
      <WarningModal
        modal={warningModal}
        onConfirm={handleWarningConfirm}
        onCancel={() => setWarningModal({ show: false, mode: "" })}
      />

      <div className="max-w-4xl mx-auto bg-white rounded-[2rem] md:rounded-[2.5rem] shadow-2xl shadow-orange-100/50 overflow-hidden min-h-[85vh] flex flex-col border border-orange-100">
        {/* Header */}
        <div className="p-4 md:p-6 border-b border-orange-100/50 bg-white sticky top-0 z-20">
          <div className="flex justify-between items-center mb-4 md:mb-6">
            <div>
              <h2 className="text-lg font-black italic tracking-tighter uppercase leading-none text-orange-900">
                Generator Foto
              </h2>
              <p className="text-[9px] font-bold text-orange-300 uppercase tracking-widest mt-0.5 italic">
                Foto Rapi, Konversi Happy
              </p>
            </div>
            <button
              onClick={handleNewProjectClick}
              className="text-[10px] font-bold flex items-center gap-1.5 px-3 py-2 rounded-full transition-all text-orange-400 hover:text-rose-500 hover:bg-rose-50"
            >
              <RotateCcw size={13} />
              <span>Mulai Ulang</span>
            </button>
          </div>
          <StepIndicator currentStep={step} />
        </div>

        {/* Step content */}
        <div className="flex-1 p-4 md:p-10 overflow-y-auto no-scrollbar">
          {step === 1 && <Step1Upload />}
          {step === 2 && <Step2Style />}
          {step === 3 && <Step3Settings />}
          {step === 4 && <Step4Preview />}
          {step === 5 && <Step5Results onTokensUpdated={onTokensUpdated} />}
        </div>

        {/* Footer nav */}
        {step < 5 && !isGenerating && (
          <div className="p-4 md:p-6 border-t border-orange-100 bg-white flex justify-between items-center gap-3 md:gap-4">
            <button
              onClick={prevStep}
              disabled={step === 1}
              className={`flex items-center gap-1 md:gap-2 px-6 md:px-8 py-3.5 md:py-4 rounded-full font-black italic text-[10px] md:text-sm uppercase tracking-widest transition-all ${
                step === 1
                  ? "opacity-0 pointer-events-none"
                  : "text-slate-400 hover:text-orange-500 hover:bg-orange-50"
              }`}
            >
              <ChevronLeft size={16} />
            </button>

            {step < 4 && (
              <button
                onClick={nextStep}
                disabled={!canGoNext}
                className={`px-8 md:px-12 py-3.5 md:py-4 rounded-full font-black italic text-[10px] md:text-sm uppercase tracking-widest transition-all flex items-center gap-1 md:gap-2 ${
                  !canGoNext
                    ? "bg-orange-50 text-orange-200"
                    : "bg-orange-400 text-white shadow-xl shadow-orange-100 hover:bg-orange-500 hover:scale-105 active:scale-95"
                }`}
              >
                Lanjut <ChevronRight size={16} />
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
