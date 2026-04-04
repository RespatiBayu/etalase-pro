"use client";

export const dynamic = "force-dynamic";

import { useState } from "react";
import { ShoppingBag, Lock, Eye, EyeOff, CheckCircle2, Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

export default function SetPasswordPage() {
  const supabase = createClient();
  const router = useRouter();

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  const isPasswordStrong = password.length >= 8;
  const isMatch = password === confirm && confirm.length > 0;
  const canSubmit = isPasswordStrong && isMatch && !loading;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;

    setLoading(true);
    setError("");

    const { error: updateError } = await supabase.auth.updateUser({ password });

    if (updateError) {
      setError(updateError.message);
      setLoading(false);
      return;
    }

    setDone(true);
    // Redirect to main app after short delay
    setTimeout(() => router.push("/"), 1500);
  };

  return (
    <div className="min-h-screen bg-[#FFF8F0] flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-sm space-y-6">
        {/* Logo */}
        <div className="flex flex-col items-center gap-3 mb-2">
          <div className="w-14 h-14 bg-gradient-to-br from-orange-400 to-amber-300 rounded-2xl flex items-center justify-center shadow-lg shadow-orange-200">
            <ShoppingBag className="text-white" size={26} />
          </div>
          <div className="text-center">
            <h1 className="text-2xl font-black italic tracking-tighter uppercase text-orange-900">
              Etalase Pro 2.0
            </h1>
            <p className="text-[10px] font-bold text-orange-400 uppercase tracking-widest mt-0.5">
              Foto Rapi, Konversi Happy
            </p>
          </div>
        </div>

        <div className="bg-white rounded-[2rem] shadow-xl shadow-orange-100/50 border border-orange-100 p-8">
          {done ? (
            /* Success State */
            <div className="flex flex-col items-center gap-4 py-4">
              <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center">
                <CheckCircle2 className="text-emerald-500" size={36} />
              </div>
              <div className="text-center">
                <h2 className="font-black text-lg italic uppercase tracking-tight text-emerald-900">
                  Password Berhasil!
                </h2>
                <p className="text-sm text-slate-500 mt-1">
                  Mengarahkan ke aplikasi...
                </p>
              </div>
              <Loader2 className="animate-spin text-orange-400" size={20} />
            </div>
          ) : (
            /* Form */
            <>
              <div className="mb-6">
                <h2 className="text-xl font-black italic uppercase tracking-tighter text-orange-900">
                  Buat Password
                </h2>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  Selamat datang! Buat password untuk akun kamu. Token sudah siap digunakan.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Password */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-widest text-orange-300">
                    Password
                  </label>
                  <div className="relative">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-orange-300">
                      <Lock size={16} />
                    </div>
                    <input
                      type={showPass ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Minimal 8 karakter"
                      required
                      className="w-full pl-10 pr-10 py-4 bg-orange-50/30 border-2 border-transparent focus:border-orange-200 rounded-2xl outline-none text-sm font-medium transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPass(!showPass)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-orange-400 transition-colors"
                    >
                      {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                  {password.length > 0 && !isPasswordStrong && (
                    <p className="text-[10px] text-rose-400 font-bold">
                      Password minimal 8 karakter
                    </p>
                  )}
                </div>

                {/* Confirm Password */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-widest text-orange-300">
                    Konfirmasi Password
                  </label>
                  <div className="relative">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-orange-300">
                      <Lock size={16} />
                    </div>
                    <input
                      type={showConfirm ? "text" : "password"}
                      value={confirm}
                      onChange={(e) => setConfirm(e.target.value)}
                      placeholder="Ulangi password"
                      required
                      className={`w-full pl-10 pr-10 py-4 bg-orange-50/30 border-2 rounded-2xl outline-none text-sm font-medium transition-all ${
                        confirm.length > 0 && !isMatch
                          ? "border-rose-200"
                          : "border-transparent focus:border-orange-200"
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirm(!showConfirm)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-orange-400 transition-colors"
                    >
                      {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                  {confirm.length > 0 && !isMatch && (
                    <p className="text-[10px] text-rose-400 font-bold">
                      Password tidak sama
                    </p>
                  )}
                </div>

                {error && (
                  <div className="bg-rose-50 border border-rose-100 rounded-xl p-3">
                    <p className="text-xs text-rose-600 font-medium">{error}</p>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={!canSubmit}
                  className={`w-full py-4 rounded-2xl font-black italic uppercase tracking-widest text-sm transition-all flex items-center justify-center gap-2 ${
                    canSubmit
                      ? "bg-orange-400 text-white shadow-xl shadow-orange-100 hover:bg-orange-500 hover:scale-[1.02] active:scale-95"
                      : "bg-orange-50 text-orange-200 cursor-not-allowed"
                  }`}
                >
                  {loading ? (
                    <Loader2 className="animate-spin" size={18} />
                  ) : (
                    "Simpan & Mulai"
                  )}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
