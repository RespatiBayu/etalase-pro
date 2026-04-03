"use client";

import { ShoppingBag, RotateCcw, ChevronLeft, ChevronRight, LogOut } from "lucide-react";
import { StepIndicator } from "@/components/ui/StepIndicator";
import { WarningModal } from "@/components/ui/WarningModal";
import { Step1Upload } from "@/components/steps/Step1Upload";
import { Step2Style } from "@/components/steps/Step2Style";
import { Step3Settings } from "@/components/steps/Step3Settings";
import { Step4Preview } from "@/components/steps/Step4Preview";
import { Step5Results } from "@/components/steps/Step5Results";
import { useProject } from "@/context/ProjectContext";
import { createClient } from "@/lib/supabase/client";

export function WizardShell() {
  const supabase = createClient();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = "/login";
  };

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
    <div className="min-h-screen bg-[#FFF8F0] text-slate-800 font-sans p-2 md:p-8">
      <WarningModal
        modal={warningModal}
        onConfirm={handleWarningConfirm}
        onCancel={() => setWarningModal({ show: false, mode: "" })}
      />

      <div className="max-w-6xl mx-auto bg-white rounded-[2rem] md:rounded-[2.5rem] shadow-2xl shadow-orange-100/50 overflow-hidden min-h-[90vh] md:min-h-[850px] flex flex-col border border-orange-100 relative">
        {/* Header */}
        <div className="p-4 md:p-6 border-b border-orange-100/50 bg-white sticky top-0 z-20">
          <div className="flex justify-between items-center mb-4 md:mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-orange-400 to-amber-300 rounded-xl flex items-center justify-center shadow-md shadow-orange-200 transform transition-transform hover:rotate-3">
                <ShoppingBag className="text-white" size={20} />
              </div>
              <div className="flex flex-col">
                <h1 className="text-xl font-black italic tracking-tighter uppercase leading-none text-orange-900">
                  Etalase Pro 2.0
                </h1>
                <p className="text-[9px] font-bold text-orange-300 uppercase tracking-widest mt-0.5 italic">
                  Foto Rapi, Konversi Happy
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1 md:gap-2">
              <button
                onClick={handleNewProjectClick}
                className="text-[10px] md:text-sm font-bold flex items-center gap-1 md:gap-2 px-3 md:py-2 rounded-full transition-all text-orange-400 hover:text-rose-500 hover:bg-rose-50"
              >
                <RotateCcw size={14} />
                <span className="hidden xs:inline">Mulai Ulang</span>
              </button>
              <button
                onClick={handleLogout}
                title="Keluar"
                className="text-[10px] md:text-sm font-bold flex items-center gap-1 px-3 md:py-2 rounded-full transition-all text-slate-400 hover:text-rose-500 hover:bg-rose-50"
              >
                <LogOut size={14} />
              </button>
            </div>
          </div>
          <StepIndicator currentStep={step} />
        </div>

        {/* Step content */}
        <div className="flex-1 p-4 md:p-10 overflow-y-auto no-scrollbar">
          {step === 1 && <Step1Upload />}
          {step === 2 && <Step2Style />}
          {step === 3 && <Step3Settings />}
          {step === 4 && <Step4Preview />}
          {step === 5 && <Step5Results />}
        </div>

        {/* Footer nav */}
        {step < 5 && !isGenerating && (
          <div className="p-4 md:p-6 border-t border-orange-100 bg-white flex justify-between items-center gap-3 md:gap-4 text-slate-900">
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
