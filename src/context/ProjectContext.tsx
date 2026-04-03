"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  type ReactNode,
} from "react";
import { NON_FASHION_PRESETS } from "@/config/styles";
import type {
  WizardStep,
  CategoryId,
  FashionGender,
  FashionAge,
  FashionStyleName,
  PresetTab,
  GenerateTab,
  AppSettings,
  WarningModalState,
} from "@/types";

// ─── Initial State ────────────────────────────────────────────────────────────

const INITIAL_SETTINGS: AppSettings = {
  count: 1,
  ratio: "1:1",
  density: "Natural",
  posterDetails: false,
  details: {
    headline: "",
    tagline: "",
    feature1: "",
    feature2: "",
    feature3: "",
    cod: false,
    instant: false,
    sameday: false,
    price: "",
    promoPrice: "",
    cta: "Buy Now",
    fontStyle: "Default",
    whatsapp: "",
    instagram: "",
    website: "",
    shopee: false,
    tokopedia: false,
    tiktok: false,
  },
  logo: false,
  logoPlacement: "tr",
  visualDensity: "Natural",
  additionalIdeas: "",
};

// ─── Context Shape ────────────────────────────────────────────────────────────

interface ProjectContextValue {
  // Wizard
  step: WizardStep;
  setStep: (s: WizardStep) => void;
  nextStep: () => void;
  prevStep: () => void;

  // Step 1
  selectedCategory: CategoryId | null;
  setSelectedCategory: (id: CategoryId) => void;
  uploadedImage: string | null;
  base64Image: string | null;
  setImage1: (dataUrl: string) => void;
  clearImage1: () => void;
  uploadedImage2: string | null;
  base64Image2: string | null;
  setImage2: (dataUrl: string) => void;
  clearImage2: () => void;

  // Step 2 — Fashion
  selectedStyle: FashionStyleName;
  setSelectedStyle: (s: FashionStyleName) => void;
  selectedGender: FashionGender;
  setSelectedGender: (g: FashionGender) => void;
  selectedAge: FashionAge;
  setSelectedAge: (a: FashionAge) => void;

  // Step 2 — Non-Fashion
  activePresetTab: PresetTab;
  setActivePresetTab: (t: PresetTab) => void;
  selectedPresetId: string;
  setSelectedPresetId: (id: string) => void;
  generateTab: GenerateTab;
  setGenerateTab: (t: GenerateTab) => void;
  referenceImage: string | null;
  referenceBase64: string | null;
  setReferenceImage: (dataUrl: string) => void;
  clearReferenceImage: () => void;

  // Step 3
  settings: AppSettings;
  setSettings: (s: AppSettings) => void;
  updateSetting: <K extends keyof AppSettings>(key: K, value: AppSettings[K]) => void;
  updateDetail: (field: string, value: string | boolean) => void;
  logoImage: string | null;
  logoBase64: string | null;
  setLogoImage: (dataUrl: string) => void;
  clearLogoImage: () => void;

  // Step 4-5 — Generation
  isGenerating: boolean;
  progress: number;
  generateError: string | null;
  regeneratingIndices: Record<number, boolean>;
  handleGenerate: () => Promise<void>;
  handleRegenerateSingle: (index: number) => Promise<void>;
  clearGenerateError: () => void;

  // Step 5
  generatedResults: string[];
  setGeneratedResults: (r: string[]) => void;
  caption: string;
  setCaption: (c: string) => void;

  // UI state
  activeSubWindow: "posterDetails" | "logo" | null;
  openSubWindow: (key: "posterDetails" | "logo") => void;
  closeSubWindow: () => void;
  warningModal: WarningModalState;
  setWarningModal: (m: WarningModalState) => void;

  // Actions
  performReset: () => void;
  handleNewProjectClick: () => void;
}

// ─── Context ──────────────────────────────────────────────────────────────────

const ProjectContext = createContext<ProjectContextValue | null>(null);

export function useProject(): ProjectContextValue {
  const ctx = useContext(ProjectContext);
  if (!ctx) throw new Error("useProject must be used inside ProjectProvider");
  return ctx;
}

// ─── Provider ─────────────────────────────────────────────────────────────────

function fileToBase64(dataUrl: string): string {
  return dataUrl.split(",")[1];
}

export function ProjectProvider({ children }: { children: ReactNode }) {
  const [step, setStep] = useState<WizardStep>(1);

  // Step 1
  const [selectedCategory, setSelectedCategoryState] = useState<CategoryId | null>(null);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [base64Image, setBase64Image] = useState<string | null>(null);
  const [uploadedImage2, setUploadedImage2] = useState<string | null>(null);
  const [base64Image2, setBase64Image2] = useState<string | null>(null);

  // Step 2 — Fashion
  const [selectedStyle, setSelectedStyle] = useState<FashionStyleName>("Ghost 3D Fit");
  const [selectedGender, setSelectedGender] = useState<FashionGender>("Wanita");
  const [selectedAge, setSelectedAge] = useState<FashionAge>("Dewasa");

  // Step 2 — Non-Fashion
  const [activePresetTab, setActivePresetTab] = useState<PresetTab>("Commercial");
  const [selectedPresetId, setSelectedPresetId] = useState<string>(
    NON_FASHION_PRESETS["Commercial"][0].id
  );
  const [generateTab, setGenerateTab] = useState<GenerateTab>("Preset");
  const [referenceImage, setReferenceImageState] = useState<string | null>(null);
  const [referenceBase64, setReferenceBase64] = useState<string | null>(null);

  // Step 3
  const [settings, setSettings] = useState<AppSettings>(INITIAL_SETTINGS);
  const [logoImage, setLogoImageState] = useState<string | null>(null);
  const [logoBase64, setLogoBase64] = useState<string | null>(null);

  // Step 4-5 — Generation
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [generateError, setGenerateError] = useState<string | null>(null);
  const [regeneratingIndices, setRegeneratingIndices] = useState<Record<number, boolean>>({});

  // Step 5
  const [generatedResults, setGeneratedResults] = useState<string[]>([]);
  const [caption, setCaption] = useState<string>("");

  // UI
  const [activeSubWindow, setActiveSubWindow] = useState<"posterDetails" | "logo" | null>(null);
  const [warningModal, setWarningModal] = useState<WarningModalState>({ show: false, mode: "" });

  // ── Image helpers ──
  const setImage1 = useCallback((dataUrl: string) => {
    setUploadedImage(dataUrl);
    setBase64Image(fileToBase64(dataUrl));
  }, []);
  const clearImage1 = useCallback(() => {
    setUploadedImage(null);
    setBase64Image(null);
  }, []);
  const setImage2 = useCallback((dataUrl: string) => {
    setUploadedImage2(dataUrl);
    setBase64Image2(fileToBase64(dataUrl));
  }, []);
  const clearImage2 = useCallback(() => {
    setUploadedImage2(null);
    setBase64Image2(null);
  }, []);
  const setReferenceImage = useCallback((dataUrl: string) => {
    setReferenceImageState(dataUrl);
    setReferenceBase64(fileToBase64(dataUrl));
  }, []);
  const clearReferenceImage = useCallback(() => {
    setReferenceImageState(null);
    setReferenceBase64(null);
  }, []);
  const setLogoImage = useCallback((dataUrl: string) => {
    setLogoImageState(dataUrl);
    setLogoBase64(fileToBase64(dataUrl));
  }, []);
  const clearLogoImage = useCallback(() => {
    setLogoImageState(null);
    setLogoBase64(null);
  }, []);

  // ── Category selection — reset step 2 state ──
  const setSelectedCategory = useCallback((id: CategoryId) => {
    setSelectedCategoryState(id);
    if (id === "fashion") {
      setSelectedStyle("Ghost 3D Fit");
    } else {
      setActivePresetTab("Commercial");
      setSelectedPresetId(NON_FASHION_PRESETS["Commercial"][0].id);
      setGenerateTab("Preset");
    }
  }, []);

  // ── Settings helpers ──
  const updateSetting = useCallback(
    <K extends keyof AppSettings>(key: K, value: AppSettings[K]) => {
      setSettings((prev) => ({ ...prev, [key]: value }));
    },
    []
  );

  const updateDetail = useCallback((field: string, value: string | boolean) => {
    let finalValue = value;
    if ((field === "price" || field === "promoPrice") && typeof value === "string") {
      finalValue = value.replace(/\D/g, "").replace(/\B(?=(\d{3})+(?!\d))/g, ".");
    }
    setSettings((prev) => ({
      ...prev,
      details: { ...prev.details, [field]: finalValue },
    }));
  }, []);

  // ── Generation ──
  const clearGenerateError = useCallback(() => setGenerateError(null), []);

  const buildPayload = useCallback(
    () => ({
      base64Image: base64Image ?? "",
      base64Image2: base64Image2 ?? undefined,
      referenceBase64:
        generateTab === "Custom" && referenceBase64 ? referenceBase64 : undefined,
      settings,
      category: selectedCategory!,
      styleConfig: {
        selectedStyle,
        selectedPresetId,
        generateTab,
        gender: selectedGender,
        age: selectedAge,
        activePresetTab,
      },
    }),
    [
      base64Image,
      base64Image2,
      generateTab,
      referenceBase64,
      settings,
      selectedCategory,
      selectedStyle,
      selectedPresetId,
      selectedGender,
      selectedAge,
      activePresetTab,
    ]
  );

  const handleGenerate = useCallback(async () => {
    if (!selectedCategory || !base64Image) return;

    setIsGenerating(true);
    setGenerateError(null);
    setProgress(0);
    setGeneratedResults([]);

    try {
      const results: string[] = [];
      for (let i = 0; i < settings.count; i++) {
        if (i > 0) {
          await new Promise((r) => setTimeout(r, 20_000));
        }

        setProgress((i / settings.count) * 100 + 5);

        const res = await fetch("/api/generate-image", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(buildPayload()),
        });

        if (!res.ok) {
          const err = await res.json().catch(() => ({ error: `Error ${res.status}` }));
          if (err.error === "TOKEN_INSUFFICIENT") {
            throw new Error("TOKEN_INSUFFICIENT");
          }
          throw new Error(err.message ?? err.error ?? `Error ${res.status}`);
        }

        const data = await res.json();
        results.push(data.dataUrl);
        setGeneratedResults([...results]);
        setProgress(((i + 1) / settings.count) * 100);
      }

      setProgress(100);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Terjadi kesalahan tidak terduga";
      setGenerateError(message);
    } finally {
      setIsGenerating(false);
    }
  }, [selectedCategory, base64Image, settings.count, buildPayload]);

  const handleRegenerateSingle = useCallback(
    async (index: number) => {
      if (!selectedCategory || !base64Image) return;
      if (regeneratingIndices[index]) return;

      setRegeneratingIndices((prev) => ({ ...prev, [index]: true }));

      try {
        const res = await fetch("/api/generate-image", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(buildPayload()),
        });

        if (!res.ok) {
          const err = await res.json().catch(() => ({ error: `Error ${res.status}` }));
          throw new Error(err.error ?? `Error ${res.status}`);
        }

        const data = await res.json();
        setGeneratedResults((prev) => {
          const next = [...prev];
          next[index] = data.dataUrl;
          return next;
        });
      } catch (err) {
        console.error("Regenerate error:", err);
      } finally {
        setRegeneratingIndices((prev) => {
          const next = { ...prev };
          delete next[index];
          return next;
        });
      }
    },
    [selectedCategory, base64Image, regeneratingIndices, buildPayload]
  );

  // ── SubWindow ──
  const openSubWindow = useCallback((key: "posterDetails" | "logo") => {
    setActiveSubWindow(key);
  }, []);
  const closeSubWindow = useCallback(() => {
    setActiveSubWindow(null);
  }, []);

  // ── Navigation ──
  const nextStep = useCallback(() => {
    setStep((prev) => Math.min(prev + 1, 5) as WizardStep);
  }, []);

  const prevStep = useCallback(() => {
    if (step === 5 && generatedResults.length > 0) {
      setWarningModal({ show: true, mode: "back" });
    } else {
      setStep((prev) => Math.max(prev - 1, 1) as WizardStep);
    }
  }, [step, generatedResults.length]);

  // ── Reset ──
  const performReset = useCallback(() => {
    setStep(1);
    setSelectedCategoryState(null);
    setUploadedImage(null);
    setBase64Image(null);
    setUploadedImage2(null);
    setBase64Image2(null);
    setReferenceImageState(null);
    setReferenceBase64(null);
    setLogoImageState(null);
    setLogoBase64(null);
    setSelectedStyle("Ghost 3D Fit");
    setSelectedGender("Wanita");
    setSelectedAge("Dewasa");
    setActivePresetTab("Commercial");
    setSelectedPresetId(NON_FASHION_PRESETS["Commercial"][0].id);
    setGenerateTab("Preset");
    setSettings(INITIAL_SETTINGS);
    setGeneratedResults([]);
    setCaption("");
    setIsGenerating(false);
    setProgress(0);
    setGenerateError(null);
    setRegeneratingIndices({});
    setWarningModal({ show: false, mode: "" });
    setActiveSubWindow(null);
  }, []);

  const handleNewProjectClick = useCallback(() => {
    if (generatedResults.length > 0 || uploadedImage) {
      setWarningModal({ show: true, mode: "reset" });
    } else {
      performReset();
    }
  }, [generatedResults.length, uploadedImage, performReset]);

  const value: ProjectContextValue = {
    step, setStep, nextStep, prevStep,
    selectedCategory, setSelectedCategory,
    uploadedImage, base64Image, setImage1, clearImage1,
    uploadedImage2, base64Image2, setImage2, clearImage2,
    selectedStyle, setSelectedStyle,
    selectedGender, setSelectedGender,
    selectedAge, setSelectedAge,
    activePresetTab, setActivePresetTab,
    selectedPresetId, setSelectedPresetId,
    generateTab, setGenerateTab,
    referenceImage, referenceBase64, setReferenceImage, clearReferenceImage,
    settings, setSettings, updateSetting, updateDetail,
    logoImage, logoBase64, setLogoImage, clearLogoImage,
    isGenerating, progress, generateError, regeneratingIndices,
    handleGenerate, handleRegenerateSingle, clearGenerateError,
    generatedResults, setGeneratedResults,
    caption, setCaption,
    activeSubWindow, openSubWindow, closeSubWindow,
    warningModal, setWarningModal,
    performReset, handleNewProjectClick,
  };

  return <ProjectContext.Provider value={value}>{children}</ProjectContext.Provider>;
}

export { INITIAL_SETTINGS };
