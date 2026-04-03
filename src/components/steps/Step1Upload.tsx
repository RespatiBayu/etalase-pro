"use client";

import { useCallback } from "react";
import { CategorySelector } from "@/components/ui/CategorySelector";
import { PrimaryUploader, SecondaryUploader } from "@/components/ui/ImageUploader";
import { useProject } from "@/context/ProjectContext";
import type { CategoryId } from "@/types";

export function Step1Upload() {
  const {
    selectedCategory,
    setSelectedCategory,
    uploadedImage,
    setImage1,
    uploadedImage2,
    setImage2,
    clearImage2,
  } = useProject();

  const handleFile = useCallback(
    (file: File, setter: (dataUrl: string) => void) => {
      const reader = new FileReader();
      reader.onloadend = () => setter(reader.result as string);
      reader.readAsDataURL(file);
    },
    []
  );

  return (
    <div className="space-y-6 md:space-y-10 animate-in fade-in slide-in-from-bottom-6 duration-700 text-center">
      {/* Category */}
      <div>
        <h2 className="text-xl md:text-3xl font-black italic uppercase tracking-tighter text-orange-900 mb-4 md:mb-6">
          Pilih Kategori Produk
        </h2>
        <CategorySelector
          selected={selectedCategory}
          onSelect={(id: CategoryId) => setSelectedCategory(id)}
        />
      </div>

      {/* Upload */}
      <div>
        <h2 className="text-xl md:text-3xl font-black italic uppercase tracking-tighter text-orange-900 mb-4 md:mb-6">
          Upload Foto Produk
        </h2>
        <div className="grid grid-cols-2 gap-3 md:gap-4">
          <PrimaryUploader
            image={uploadedImage}
            onChange={(file) => handleFile(file, setImage1)}
          />
          <SecondaryUploader
            image={uploadedImage2}
            onChange={(file) => handleFile(file, setImage2)}
            onRemove={clearImage2}
          />
        </div>
      </div>
    </div>
  );
}
