"use client";

import { useState, useEffect } from "react";
import { X, Zap, ExternalLink, Loader2 } from "lucide-react";

interface TokenPackage {
  id: string;
  name: string;
  tokens: number;
  price: number;
  scalev_url: string;
}

interface TokenModalProps {
  onClose: () => void;
  userEmail: string;
}

export function TokenModal({ onClose, userEmail }: TokenModalProps) {
  const [packages, setPackages] = useState<TokenPackage[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/tokens/packages")
      .then((r) => r.json())
      .then((data) => setPackages(data.packages ?? []))
      .finally(() => setLoading(false));
  }, []);

  const handleBuy = (pkg: TokenPackage) => {
    window.open(pkg.scalev_url, "_blank");
  };

  const formatPrice = (price: number) =>
    new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(price);

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-orange-900/10 backdrop-blur-sm">
      <div className="bg-white rounded-[2rem] w-full max-w-md shadow-2xl shadow-orange-100 overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-orange-100 flex justify-between items-center bg-orange-50/50">
          <div>
            <h3 className="text-lg font-black italic uppercase tracking-tighter text-orange-900">
              Beli Token
            </h3>
            <p className="text-[10px] font-bold text-orange-400 mt-0.5">
              1 token = 1 gambar yang di-generate
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 bg-white border border-orange-100 rounded-full text-orange-400 hover:text-orange-600 transition-all"
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4">
          {/* Info email */}
          <div className="bg-orange-50 rounded-2xl p-4 border border-orange-100">
            <p className="text-[10px] font-black uppercase tracking-widest text-orange-400 mb-1">
              Penting
            </p>
            <p className="text-xs text-slate-600 leading-relaxed">
              Gunakan email{" "}
              <span className="font-bold text-orange-600">{userEmail}</span>{" "}
              saat checkout agar token otomatis masuk ke akun kamu.
            </p>
          </div>

          {/* Packages */}
          {loading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="animate-spin text-orange-400" size={24} />
            </div>
          ) : (
            <div className="space-y-3">
              {packages.map((pkg, i) => {
                const isPopular = i === 1;
                return (
                  <button
                    key={pkg.id}
                    onClick={() => handleBuy(pkg)}
                    className={`w-full flex items-center justify-between p-4 rounded-2xl border-2 transition-all hover:scale-[1.02] active:scale-95 ${
                      isPopular
                        ? "border-orange-400 bg-orange-50 shadow-lg shadow-orange-100"
                        : "border-orange-100 bg-white hover:border-orange-200"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                          isPopular
                            ? "bg-orange-400 text-white"
                            : "bg-orange-50 text-orange-400"
                        }`}
                      >
                        <Zap size={18} />
                      </div>
                      <div className="text-left">
                        <div className="flex items-center gap-2">
                          <span className="font-black text-sm text-orange-900">
                            {pkg.name}
                          </span>
                          {isPopular && (
                            <span className="text-[8px] font-black uppercase bg-orange-400 text-white px-2 py-0.5 rounded-full">
                              Populer
                            </span>
                          )}
                        </div>
                        <span className="text-[10px] font-bold text-slate-500">
                          {pkg.tokens} token
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-black text-orange-600 text-sm">
                        {formatPrice(pkg.price)}
                      </span>
                      <ExternalLink size={14} className="text-orange-300" />
                    </div>
                  </button>
                );
              })}
            </div>
          )}

          <p className="text-[9px] text-slate-400 text-center leading-relaxed">
            Token akan masuk otomatis setelah pembayaran dikonfirmasi (max 1
            menit). Hubungi admin jika token tidak masuk dalam 5 menit.
          </p>
        </div>
      </div>
    </div>
  );
}
