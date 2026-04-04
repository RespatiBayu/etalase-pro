"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Clock,
  Download,
  X,
  Loader2,
  ImageIcon,
  RotateCcw,
  Calendar,
  Layers,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

interface ProjectCard {
  id: string;
  category: string;
  style_config: Record<string, unknown> | null;
  settings: Record<string, unknown> | null;
  created_at: string;
  thumbnail_url: string | null;
  image_count: number;
}

interface ModalImage {
  id: string;
  signedUrl: string;
  created_at: string;
}

// ─── Category labels ──────────────────────────────────────────────────────────

const CATEGORY_LABELS: Record<string, string> = {
  fashion:     "Fashion",
  accessories: "Aksesoris",
  home:        "Produk Rumah",
  tech:        "Elektronik",
  beauty:      "Kecantikan",
  food:        "Makanan",
  automotive:  "Otomotif",
  sports:      "Olahraga",
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString("id-ID", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

async function downloadBlob(blob: Blob, filename: string) {
  const isIOS =
    /iPad|iPhone|iPod/.test(navigator.userAgent) && !("MSStream" in window);

  if (isIOS && navigator.share) {
    const file = new File([blob], `${filename}.png`, { type: "image/png" });
    if (navigator.canShare?.({ files: [file] })) {
      await navigator.share({ files: [file], title: "Hasil Etalase Pro" });
      return;
    }
  }

  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `${filename}.png`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

// ─── Component ────────────────────────────────────────────────────────────────

export function HistoryClient() {
  const [projects, setProjects]             = useState<ProjectCard[]>([]);
  const [loading, setLoading]               = useState(true);
  const [selectedProject, setSelectedProject] = useState<ProjectCard | null>(null);
  const [modalImages, setModalImages]       = useState<ModalImage[]>([]);
  const [modalLoading, setModalLoading]     = useState(false);
  const [downloading, setDownloading]       = useState<string | null>(null);

  // ── Fetch project list ─────────────────────────────────────────────────────
  const fetchProjects = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/projects");
      const data = await res.json() as { projects?: ProjectCard[] };
      setProjects(data.projects ?? []);
    } catch {
      setProjects([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  // ── Open project modal ─────────────────────────────────────────────────────
  const openModal = useCallback(async (project: ProjectCard) => {
    setSelectedProject(project);
    setModalImages([]);
    setModalLoading(true);
    try {
      const res = await fetch(`/api/projects/${project.id}/images`);
      const data = await res.json() as { images?: ModalImage[] };
      setModalImages(data.images ?? []);
    } catch {
      setModalImages([]);
    } finally {
      setModalLoading(false);
    }
  }, []);

  // ── Download image ─────────────────────────────────────────────────────────
  const handleDownload = useCallback(async (signedUrl: string, index: number, imageId: string) => {
    setDownloading(imageId);
    try {
      const res = await fetch(signedUrl);
      const blob = await res.blob();
      const filename = `etalase-pro-${selectedProject?.category ?? "hasil"}-${index + 1}`;
      await downloadBlob(blob, filename);
    } catch {
      alert("Gagal mengunduh gambar. Coba lagi.");
    } finally {
      setDownloading(null);
    }
  }, [selectedProject?.category]);

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="p-4 md:p-8 max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-black italic uppercase tracking-tighter text-orange-900">
            Riwayat
          </h1>
          <p className="text-[10px] font-bold text-orange-300 uppercase tracking-widest mt-0.5">
            Hasil generate yang tersimpan
          </p>
        </div>
        <button
          onClick={fetchProjects}
          disabled={loading}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-orange-100 bg-white text-orange-500 hover:border-orange-300 hover:bg-orange-50 transition-all text-[10px] font-black uppercase tracking-widest disabled:opacity-50"
        >
          <RotateCcw size={13} className={loading ? "animate-spin" : ""} />
          Refresh
        </button>
      </div>

      {/* Loading */}
      {loading && (
        <div className="flex flex-col items-center justify-center py-24 text-orange-300">
          <Loader2 size={32} className="animate-spin mb-3" />
          <p className="text-[10px] font-black uppercase tracking-widest">Memuat riwayat...</p>
        </div>
      )}

      {/* Empty state */}
      {!loading && projects.length === 0 && (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="w-20 h-20 bg-orange-50 rounded-[1.5rem] flex items-center justify-center mb-4 shadow-sm">
            <Clock size={32} className="text-orange-300" />
          </div>
          <h3 className="font-black italic uppercase text-orange-900 tracking-tight text-lg mb-1">
            Belum Ada Riwayat
          </h3>
          <p className="text-sm text-slate-400 max-w-xs leading-relaxed">
            Hasil generate foto akan otomatis tersimpan di sini setelah kamu membuat project baru.
          </p>
          <a
            href="/pro"
            className="mt-6 px-6 py-3 bg-orange-400 text-white rounded-full font-black text-[10px] uppercase tracking-widest shadow-lg shadow-orange-100 hover:bg-orange-500 transition-all"
          >
            Buat Project Baru
          </a>
        </div>
      )}

      {/* Project Grid */}
      {!loading && projects.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
          {projects.map((project) => (
            <button
              key={project.id}
              onClick={() => openModal(project)}
              className="group bg-white rounded-[1.5rem] border border-orange-100 shadow-sm hover:shadow-xl hover:shadow-orange-100/60 hover:border-orange-200 transition-all overflow-hidden text-left"
            >
              {/* Thumbnail */}
              <div className="aspect-square bg-slate-50 relative overflow-hidden">
                {project.thumbnail_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={project.thumbnail_url}
                    alt="Thumbnail"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <ImageIcon size={28} className="text-slate-200" />
                  </div>
                )}

                {/* Image count badge */}
                <div className="absolute top-2 right-2 bg-black/50 text-white backdrop-blur-sm px-2 py-0.5 rounded-full flex items-center gap-1">
                  <Layers size={9} />
                  <span className="text-[8px] font-black">{project.image_count}</span>
                </div>
              </div>

              {/* Info */}
              <div className="p-3 space-y-1.5">
                {/* Category */}
                <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-orange-50 text-orange-600 text-[8px] font-black uppercase tracking-widest border border-orange-100">
                  {CATEGORY_LABELS[project.category] ?? project.category}
                </span>

                {/* Date */}
                <div className="flex items-center gap-1 text-slate-400">
                  <Calendar size={9} />
                  <span className="text-[9px] font-medium">
                    {formatDate(project.created_at)}
                  </span>
                </div>
                <p className="text-[9px] text-slate-300 font-medium">
                  {formatTime(project.created_at)}
                </p>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* ── Modal ─────────────────────────────────────────────────────────── */}
      {selectedProject && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          onClick={(e) => {
            if (e.target === e.currentTarget) setSelectedProject(null);
          }}
        >
          <div className="bg-white rounded-[2rem] w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl">
            {/* Modal Header */}
            <div className="p-5 border-b border-orange-100 flex items-center justify-between flex-shrink-0">
              <div>
                <h2 className="font-black italic uppercase tracking-tighter text-orange-900 text-lg">
                  {CATEGORY_LABELS[selectedProject.category] ?? selectedProject.category}
                </h2>
                <p className="text-[9px] font-bold text-orange-300 uppercase tracking-widest mt-0.5">
                  {formatDate(selectedProject.created_at)} · {selectedProject.image_count} foto
                </p>
              </div>
              <button
                onClick={() => setSelectedProject(null)}
                className="w-9 h-9 bg-orange-50 rounded-full flex items-center justify-center text-orange-400 hover:bg-orange-100 transition-all border border-orange-100"
              >
                <X size={17} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto p-5">
              {modalLoading ? (
                <div className="flex flex-col items-center justify-center py-16 text-orange-300">
                  <Loader2 size={28} className="animate-spin mb-2" />
                  <p className="text-[10px] font-black uppercase tracking-widest">Memuat gambar...</p>
                </div>
              ) : modalImages.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-slate-400">
                  <ImageIcon size={28} className="mb-2 text-slate-200" />
                  <p className="text-sm">Tidak ada gambar untuk project ini.</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {modalImages.map((img, idx) => (
                    <div
                      key={img.id}
                      className="group relative aspect-square bg-slate-50 rounded-2xl overflow-hidden border border-orange-100"
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={img.signedUrl}
                        alt={`Hasil ${idx + 1}`}
                        className="w-full h-full object-contain"
                      />

                      {/* Download overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-orange-950/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-end p-3">
                        <button
                          onClick={() => handleDownload(img.signedUrl, idx, img.id)}
                          disabled={downloading === img.id}
                          className="w-full flex items-center justify-center gap-1.5 bg-white text-orange-600 py-2 rounded-xl font-black text-[9px] uppercase tracking-widest hover:bg-orange-50 transition-all shadow-lg disabled:opacity-70"
                        >
                          {downloading === img.id ? (
                            <><Loader2 size={11} className="animate-spin" /> Mengunduh...</>
                          ) : (
                            <><Download size={11} /> Download</>
                          )}
                        </button>
                      </div>

                      {/* Index badge */}
                      <div className="absolute top-2 left-2 bg-orange-400/90 text-white text-[8px] font-black px-1.5 py-0.5 rounded-full">
                        {idx + 1}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
