"use client";

import Link from "next/link";
import {
  ShoppingBag,
  Upload,
  Sparkles,
  Download,
  Zap,
  Check,
  ArrowRight,
  Image as ImageIcon,
  TrendingUp,
  Star,
} from "lucide-react";

// ─── Data ─────────────────────────────────────────────────────────────────────

const PACKAGES = [
  {
    name: "Starter Pack",
    tokens: 30,
    price: 69000,
    pricePerToken: 2300,
    url: "https://bayurespati.com/co-ep-token-sp-30t",
    highlight: false,
    badge: null,
  },
  {
    name: "Pro Pack",
    tokens: 100,
    price: 97000,
    pricePerToken: 970,
    url: "https://bayurespati.com/co-ep-token-pp-100t",
    highlight: true,
    badge: "Terpopuler",
  },
  {
    name: "Ultimate Pack",
    tokens: 210,
    price: 199000,
    pricePerToken: 948,
    url: "https://bayurespati.com/co-ep-token-up-210t",
    highlight: false,
    badge: "Terbaik",
  },
];

const HOW_IT_WORKS = [
  {
    step: "01",
    icon: Upload,
    title: "Upload Foto Produk",
    desc: "Upload 1-2 foto produkmu yang masih mentah. Tidak perlu studio, background polos pun oke.",
  },
  {
    step: "02",
    icon: Sparkles,
    title: "Pilih Gaya Visual",
    desc: "Pilih dari 30+ preset gaya foto: clean catalog, dark luxury, lifestyle, fashion editorial, dan banyak lagi.",
  },
  {
    step: "03",
    icon: Download,
    title: "Download & Pakai",
    desc: "Generate dalam hitungan detik. Download gambar siap pakai untuk Shopee, Tokopedia, Instagram, dan TikTok.",
  },
];

const FEATURES_PLATFORM = [
  { icon: ShoppingBag, label: "Etalase Pro", desc: "Generator foto AI, 30+ preset gaya", available: true },
  { icon: ImageIcon, label: "Foto Editor", desc: "Background remover, teks overlay, sticker", available: false },
  { icon: TrendingUp, label: "Profit Tracker", desc: "Kalkulator HPP & analisa profit AI", available: false },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatRupiah(n: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(n);
}

// ─── Component ────────────────────────────────────────────────────────────────

export function LandingPage() {
  return (
    <div className="min-h-screen bg-[#FFF8F0] text-slate-800">
      {/* ─── Navbar ─────────────────────────────────────── */}
      <nav className="sticky top-0 z-50 bg-[#FFF8F0]/90 backdrop-blur-md border-b border-orange-100/50">
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-gradient-to-br from-orange-400 to-amber-300 rounded-xl flex items-center justify-center shadow-md shadow-orange-200">
              <ShoppingBag className="text-white" size={16} />
            </div>
            <span className="text-base font-black italic tracking-tighter uppercase text-orange-900">
              Etalase Pro
            </span>
          </div>
          <Link
            href="/login"
            className="flex items-center gap-1.5 bg-orange-400 text-white px-5 py-2 rounded-full font-black text-xs uppercase tracking-widest shadow-lg shadow-orange-200 hover:bg-orange-500 hover:scale-105 active:scale-95 transition-all"
          >
            Masuk <ArrowRight size={13} />
          </Link>
        </div>
      </nav>

      {/* ─── Hero ───────────────────────────────────────── */}
      <section className="max-w-5xl mx-auto px-4 pt-16 pb-20 text-center">
        <div className="inline-flex items-center gap-2 bg-orange-100 text-orange-600 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest mb-6">
          <Zap size={11} fill="currentColor" />
          Powered by Google Gemini AI
        </div>

        <h1 className="text-4xl md:text-6xl lg:text-7xl font-black italic uppercase tracking-tighter text-orange-900 leading-[0.9] mb-6">
          Foto Produk
          <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-amber-400">
            Profesional
          </span>
          <br />
          Dalam Detik
        </h1>

        <p className="text-base md:text-lg text-slate-500 max-w-xl mx-auto mb-10 leading-relaxed">
          Ubah foto produk biasa jadi visual marketing berkualitas tinggi dengan AI.
          Cocok untuk seller Shopee, Tokopedia, Instagram, dan TikTok.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
          <a
            href="#pricing"
            className="flex items-center gap-2 bg-orange-400 text-white px-8 py-4 rounded-full font-black text-sm uppercase tracking-widest shadow-xl shadow-orange-200 hover:bg-orange-500 hover:scale-105 active:scale-95 transition-all"
          >
            Mulai Sekarang <ArrowRight size={15} />
          </a>
          <a
            href="#how-it-works"
            className="flex items-center gap-2 bg-white text-orange-500 px-8 py-4 rounded-full font-black text-sm uppercase tracking-widest border-2 border-orange-200 hover:border-orange-400 transition-all"
          >
            Lihat Cara Kerja
          </a>
        </div>

        {/* Social proof */}
        <div className="flex items-center justify-center gap-1 mt-8">
          {[...Array(5)].map((_, i) => (
            <Star key={i} size={14} className="text-amber-400 fill-amber-400" />
          ))}
          <span className="text-sm font-bold text-slate-500 ml-2">
            Dipakai ratusan seller Indonesia
          </span>
        </div>
      </section>

      {/* ─── How it works ───────────────────────────────── */}
      <section id="how-it-works" className="bg-white py-16 md:py-20">
        <div className="max-w-5xl mx-auto px-4">
          <div className="text-center mb-12">
            <p className="text-[10px] font-black uppercase tracking-widest text-orange-400 mb-2">
              Cara Kerja
            </p>
            <h2 className="text-3xl md:text-4xl font-black italic uppercase tracking-tighter text-orange-900">
              3 Langkah Mudah
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
            {HOW_IT_WORKS.map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.step} className="text-center space-y-4">
                  <div className="relative inline-block">
                    <div className="w-16 h-16 bg-orange-100 rounded-2xl flex items-center justify-center mx-auto">
                      <Icon size={28} className="text-orange-500" />
                    </div>
                    <span className="absolute -top-2 -right-2 w-6 h-6 bg-orange-400 rounded-full flex items-center justify-center text-white text-[10px] font-black">
                      {item.step}
                    </span>
                  </div>
                  <h3 className="text-base font-black italic uppercase tracking-tight text-orange-900">
                    {item.title}
                  </h3>
                  <p className="text-sm text-slate-500 leading-relaxed">{item.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ─── Platform ───────────────────────────────────── */}
      <section className="py-16 md:py-20">
        <div className="max-w-5xl mx-auto px-4">
          <div className="text-center mb-12">
            <p className="text-[10px] font-black uppercase tracking-widest text-orange-400 mb-2">
              Platform Lengkap
            </p>
            <h2 className="text-3xl md:text-4xl font-black italic uppercase tracking-tighter text-orange-900">
              Semua yang Kamu Butuhkan
            </h2>
            <p className="text-sm text-slate-500 mt-2">
              Etalase Pro terus berkembang — fitur baru sedang dalam pengembangan.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {FEATURES_PLATFORM.map((f) => {
              const Icon = f.icon;
              return (
                <div
                  key={f.label}
                  className={`p-6 rounded-[1.5rem] border-2 transition-all ${
                    f.available
                      ? "border-orange-200 bg-white shadow-lg shadow-orange-50"
                      : "border-dashed border-slate-200 bg-slate-50/50 opacity-60"
                  }`}
                >
                  <div
                    className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-4 ${
                      f.available ? "bg-orange-100 text-orange-500" : "bg-slate-100 text-slate-400"
                    }`}
                  >
                    <Icon size={22} />
                  </div>
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="font-black italic uppercase tracking-tight text-orange-900 text-sm">
                      {f.label}
                    </h3>
                    {!f.available && (
                      <span className="text-[8px] font-black uppercase tracking-widest bg-slate-200 text-slate-500 px-2 py-0.5 rounded-full">
                        Segera
                      </span>
                    )}
                    {f.available && (
                      <span className="text-[8px] font-black uppercase tracking-widest bg-emerald-100 text-emerald-600 px-2 py-0.5 rounded-full">
                        Live
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-500">{f.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ─── Pricing ────────────────────────────────────── */}
      <section id="pricing" className="bg-white py-16 md:py-20">
        <div className="max-w-5xl mx-auto px-4">
          <div className="text-center mb-12">
            <p className="text-[10px] font-black uppercase tracking-widest text-orange-400 mb-2">
              Harga
            </p>
            <h2 className="text-3xl md:text-4xl font-black italic uppercase tracking-tighter text-orange-900">
              Pilih Paket Token
            </h2>
            <p className="text-sm text-slate-500 mt-2">
              1 token = 1 foto generate · Beli sekali, pakai kapan saja · Tidak ada langganan bulanan
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {PACKAGES.map((pkg) => (
              <div
                key={pkg.name}
                className={`relative rounded-[1.5rem] border-2 p-6 transition-all ${
                  pkg.highlight
                    ? "border-orange-400 bg-orange-50 shadow-2xl shadow-orange-100"
                    : "border-orange-100 bg-white shadow-sm hover:border-orange-200 hover:shadow-md"
                }`}
              >
                {pkg.badge && (
                  <span
                    className={`absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${
                      pkg.highlight
                        ? "bg-orange-400 text-white shadow-lg shadow-orange-200"
                        : "bg-slate-800 text-white"
                    }`}
                  >
                    {pkg.badge}
                  </span>
                )}

                <h3 className="font-black italic uppercase tracking-tight text-orange-900 text-base mb-1">
                  {pkg.name}
                </h3>

                <div className="flex items-baseline gap-1 my-3">
                  <span className="text-4xl font-black text-orange-600">{pkg.tokens}</span>
                  <span className="text-sm font-bold text-orange-400">Token</span>
                </div>

                <p className="text-2xl font-black text-slate-700 mb-1">
                  {formatRupiah(pkg.price)}
                </p>
                <p className="text-[10px] text-slate-400 font-medium mb-5">
                  ≈ {formatRupiah(pkg.pricePerToken)} per token
                </p>

                <ul className="space-y-2 mb-6">
                  {[
                    `${pkg.tokens} foto generate`,
                    "Semua gaya & preset",
                    "Download HD tanpa watermark",
                    "Akun tidak kadaluarsa",
                  ].map((f) => (
                    <li key={f} className="flex items-center gap-2 text-xs text-slate-600">
                      <Check size={13} className="text-emerald-500 flex-shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>

                <a
                  href={pkg.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`block w-full text-center py-3.5 rounded-2xl font-black text-sm uppercase tracking-widest transition-all hover:scale-[1.02] active:scale-95 ${
                    pkg.highlight
                      ? "bg-orange-400 text-white shadow-lg shadow-orange-200 hover:bg-orange-500"
                      : "bg-orange-50 text-orange-600 border border-orange-200 hover:bg-orange-100"
                  }`}
                >
                  Beli Sekarang
                </a>
              </div>
            ))}
          </div>

          <div className="mt-8 p-4 bg-orange-50 rounded-2xl border border-orange-100 flex items-start gap-3 max-w-2xl mx-auto">
            <Zap size={16} className="text-orange-400 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-slate-600 leading-relaxed">
              <span className="font-bold">Cara beli:</span> Pilih paket di atas → Bayar via Scalev →
              Akun otomatis dibuat & token langsung masuk → Cek email untuk set password → Login & mulai generate.
            </p>
          </div>
        </div>
      </section>

      {/* ─── CTA Banner ─────────────────────────────────── */}
      <section className="py-16 md:py-20">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <div className="bg-gradient-to-br from-orange-400 to-amber-400 rounded-[2rem] p-10 md:p-14 shadow-2xl shadow-orange-200 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-48 h-48 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/2" />
            <div className="relative">
              <h2 className="text-3xl md:text-4xl font-black italic uppercase tracking-tighter text-white mb-4">
                Siap Upgrade Foto Produkmu?
              </h2>
              <p className="text-white/80 text-sm mb-8 leading-relaxed">
                Bergabung dengan seller Indonesia yang sudah menggunakan Etalase Pro.
              </p>
              <a
                href="#pricing"
                className="inline-flex items-center gap-2 bg-white text-orange-600 px-8 py-4 rounded-full font-black text-sm uppercase tracking-widest shadow-xl hover:scale-105 active:scale-95 transition-all"
              >
                Mulai Sekarang <ArrowRight size={15} />
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Footer ─────────────────────────────────────── */}
      <footer className="border-t border-orange-100 py-8">
        <div className="max-w-5xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-gradient-to-br from-orange-400 to-amber-300 rounded-lg flex items-center justify-center">
              <ShoppingBag className="text-white" size={13} />
            </div>
            <span className="text-sm font-black italic tracking-tighter uppercase text-orange-900">
              Etalase Pro 2.0
            </span>
          </div>
          <p className="text-xs text-slate-400 text-center">
            © 2025 Etalase Pro · Foto Rapi, Konversi Happy
          </p>
          <Link
            href="/login"
            className="text-xs font-bold text-orange-500 hover:text-orange-600 transition-colors"
          >
            Sudah punya akun? Masuk →
          </Link>
        </div>
      </footer>
    </div>
  );
}
