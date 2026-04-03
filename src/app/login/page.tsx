"use client";

export const dynamic = "force-dynamic";

import { useState, useEffect } from "react";
import {
  ShoppingBag,
  Mail,
  Lock,
  Eye,
  EyeOff,
  Loader2,
  Chrome,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const supabase = createClient();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Show error from URL params (e.g. after Google OAuth rejection)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const err = params.get("error");
    if (err === "not_approved") {
      setError("Akun belum terdaftar atau belum disetujui. Hubungi administrator.");
    } else if (err === "auth_failed") {
      setError("Login gagal. Silakan coba lagi.");
    }
  }, []);

  // ── Check if user is approved in profiles table ──
  const checkApproval = async (userId: string): Promise<boolean> => {
    const { data } = await supabase
      .from("profiles")
      .select("is_approved")
      .eq("id", userId)
      .returns<{ is_approved: boolean }[]>()
      .single();
    return (data as { is_approved: boolean } | null)?.is_approved === true;
  };

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) throw signInError;
      if (!data.user) throw new Error("Login gagal");

      const approved = await checkApproval(data.user.id);
      if (!approved) {
        await supabase.auth.signOut();
        setError("Akun belum terdaftar atau belum disetujui. Hubungi administrator.");
        return;
      }

      window.location.href = "/";
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Terjadi kesalahan";
      if (msg.includes("Invalid login credentials")) {
        setError("Email atau password salah.");
      } else if (msg.includes("Email not confirmed")) {
        setError("Email belum dikonfirmasi. Cek inbox kamu.");
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
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    if (error) {
      setError(error.message);
      setGoogleLoading(false);
    }
    // Approval check for Google happens in /auth/callback
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
          <h2 className="text-xl font-black italic uppercase tracking-tighter text-orange-900 mb-8 text-center">
            Masuk ke Akun
          </h2>

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
          <form onSubmit={handleEmailLogin} className="space-y-4">
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
            </div>

            {/* Error */}
            {error && (
              <div className="bg-rose-50 border border-rose-100 rounded-2xl px-4 py-3">
                <p className="text-xs font-bold text-rose-600">{error}</p>
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 rounded-2xl bg-orange-400 text-white font-black italic uppercase tracking-widest text-sm shadow-xl shadow-orange-100 hover:bg-orange-500 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-2 mt-2"
            >
              {loading ? <Loader2 size={18} className="animate-spin" /> : "Masuk"}
            </button>
          </form>
        </div>

        <p className="text-center text-[10px] text-slate-400 mt-6 font-medium">
          Akses hanya untuk pengguna terdaftar.
        </p>
      </div>
    </div>
  );
}
