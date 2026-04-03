"use client";

export const dynamic = "force-dynamic";

import { useState } from "react";
import { ShoppingBag, Mail, Lock, Eye, EyeOff, Loader2, Chrome } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

type AuthMode = "login" | "register";

export default function LoginPage() {
  const supabase = createClient();

  const [mode, setMode] = useState<AuthMode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);

    try {
      if (mode === "register") {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
        });
        if (error) throw error;
        setSuccess("Cek email kamu untuk konfirmasi akun.");
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        window.location.href = "/";
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Terjadi kesalahan";
      if (msg.includes("Invalid login credentials")) {
        setError("Email atau password salah.");
      } else if (msg.includes("User already registered")) {
        setError("Email sudah terdaftar. Silakan login.");
      } else if (msg.includes("Password should be at least")) {
        setError("Password minimal 6 karakter.");
      } else {
        setError(msg);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setError(null);
    setGoogleLoading(true);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
    if (error) {
      setError(error.message);
      setGoogleLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FFF8F0] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-orange-400 to-amber-300 rounded-2xl flex items-center justify-center shadow-xl shadow-orange-200 mb-4">
            <ShoppingBag className="text-white" size={30} />
          </div>
          <h1 className="text-3xl font-black italic tracking-tighter uppercase text-orange-900">
            Etalase Pro 2.0
          </h1>
          <p className="text-[10px] font-bold text-orange-300 uppercase tracking-widest mt-1 italic">
            Foto Rapi, Konversi Happy
          </p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-[2rem] shadow-2xl shadow-orange-100/50 border border-orange-100 p-8">
          {/* Tab toggle */}
          <div className="flex bg-orange-50 p-1 rounded-2xl mb-8">
            <button
              onClick={() => { setMode("login"); setError(null); setSuccess(null); }}
              className={`flex-1 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
                mode === "login"
                  ? "bg-white text-orange-500 shadow-md shadow-orange-50"
                  : "text-slate-400 hover:text-slate-600"
              }`}
            >
              Masuk
            </button>
            <button
              onClick={() => { setMode("register"); setError(null); setSuccess(null); }}
              className={`flex-1 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
                mode === "register"
                  ? "bg-white text-orange-500 shadow-md shadow-orange-50"
                  : "text-slate-400 hover:text-slate-600"
              }`}
            >
              Daftar
            </button>
          </div>

          {/* Google login */}
          <button
            onClick={handleGoogleLogin}
            disabled={googleLoading}
            className="w-full flex items-center justify-center gap-3 py-3.5 rounded-2xl border-2 border-orange-100 bg-white hover:bg-orange-50 hover:border-orange-200 transition-all font-bold text-sm text-slate-700 mb-6 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {googleLoading ? (
              <Loader2 size={18} className="animate-spin text-orange-400" />
            ) : (
              <Chrome size={18} className="text-orange-400" />
            )}
            {googleLoading ? "Mengalihkan..." : "Lanjutkan dengan Google"}
          </button>

          {/* Divider */}
          <div className="flex items-center gap-3 mb-6">
            <div className="flex-1 h-px bg-orange-100" />
            <span className="text-[10px] font-black uppercase tracking-widest text-orange-200">
              atau
            </span>
            <div className="flex-1 h-px bg-orange-100" />
          </div>

          {/* Email form */}
          <form onSubmit={handleEmailAuth} className="space-y-4">
            {/* Email */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-black uppercase tracking-widest text-orange-300">
                Email
              </label>
              <div className="relative">
                <Mail
                  size={16}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-orange-300"
                />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="email@kamu.com"
                  required
                  className="w-full pl-11 pr-4 py-3.5 bg-orange-50/50 border-2 border-transparent focus:border-orange-200 rounded-2xl outline-none transition-all text-sm font-medium text-slate-800 placeholder:text-slate-300"
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-black uppercase tracking-widest text-orange-300">
                Password
              </label>
              <div className="relative">
                <Lock
                  size={16}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-orange-300"
                />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  minLength={6}
                  className="w-full pl-11 pr-12 py-3.5 bg-orange-50/50 border-2 border-transparent focus:border-orange-200 rounded-2xl outline-none transition-all text-sm font-medium text-slate-800 placeholder:text-slate-300"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-orange-300 hover:text-orange-500 transition-colors"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {mode === "register" && (
                <p className="text-[9px] text-slate-400 font-medium italic ml-1">
                  Minimal 6 karakter
                </p>
              )}
            </div>

            {/* Error / Success */}
            {error && (
              <div className="bg-rose-50 border border-rose-100 rounded-2xl px-4 py-3">
                <p className="text-xs font-bold text-rose-600">{error}</p>
              </div>
            )}
            {success && (
              <div className="bg-emerald-50 border border-emerald-100 rounded-2xl px-4 py-3">
                <p className="text-xs font-bold text-emerald-600">{success}</p>
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 rounded-2xl bg-orange-400 text-white font-black italic uppercase tracking-widest text-sm shadow-xl shadow-orange-100 hover:bg-orange-500 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-2"
            >
              {loading ? (
                <Loader2 size={18} className="animate-spin" />
              ) : mode === "login" ? (
                "Masuk"
              ) : (
                "Buat Akun"
              )}
            </button>
          </form>
        </div>

        <p className="text-center text-[10px] text-slate-400 mt-6 font-medium">
          Dengan masuk, kamu menyetujui penggunaan layanan Etalase Pro.
        </p>
      </div>
    </div>
  );
}
