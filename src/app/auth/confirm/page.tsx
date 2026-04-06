"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Loader2 } from "lucide-react";

function AuthConfirmInner() {
  const router       = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState("Memverifikasi...");

  useEffect(() => {
    const supabase = createClient();
    const next     = searchParams.get("next") ?? "/dashboard";

    async function handleAuth() {
      // ── 1. Hash-based flow (#access_token=...) — magic link implicit flow ──
      const hash = window.location.hash;
      if (hash) {
        const params        = new URLSearchParams(hash.slice(1));
        const access_token  = params.get("access_token");
        const refresh_token = params.get("refresh_token");

        if (access_token && refresh_token) {
          setStatus("Menyiapkan sesi...");
          const { error } = await supabase.auth.setSession({
            access_token,
            refresh_token,
          });
          router.replace(error ? "/login?error=auth_failed" : next);
          return;
        }
      }

      // ── 2. PKCE flow (?code=...) ────────────────────────────────────────
      const code = searchParams.get("code");
      if (code) {
        setStatus("Memverifikasi kode...");
        const { error } = await supabase.auth.exchangeCodeForSession(code);
        router.replace(error ? "/login?error=auth_failed" : next);
        return;
      }

      // ── No token ─────────────────────────────────────────────────────────
      router.replace("/login?error=auth_failed");
    }

    handleAuth();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="min-h-screen bg-[#FFF8F0] flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="w-14 h-14 bg-orange-100 rounded-2xl flex items-center justify-center">
          <Loader2 size={26} className="text-orange-400 animate-spin" />
        </div>
        <p className="text-[11px] font-black uppercase tracking-widest text-orange-300">
          {status}
        </p>
      </div>
    </div>
  );
}

export default function AuthConfirmPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#FFF8F0] flex items-center justify-center">
        <Loader2 size={26} className="text-orange-400 animate-spin" />
      </div>
    }>
      <AuthConfirmInner />
    </Suspense>
  );
}
