"use client";

import { useState } from "react";
import { UserPlus, Zap, LogIn, Copy, Check, AlertCircle, Loader2, KeyRound } from "lucide-react";

export default function AdminPage() {
  const [secret, setSecret]       = useState("");
  const [email, setEmail]         = useState("");
  const [amount, setAmount]       = useState(30);
  const [orderId, setOrderId]     = useState("");
  const [loading, setLoading]     = useState(false);
  const [result, setResult]       = useState<{
    ok: boolean;
    email?: string;
    tokens_pending?: number;
    magic_link?: string | null;
    is_new_user?: boolean;
    error?: string;
  } | null>(null);
  const [copied, setCopied]       = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setResult(null);

    try {
      const res = await fetch("/api/dev/seed-claim", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-dev-secret": secret,
        },
        body: JSON.stringify({
          email,
          amount,
          ...(orderId ? { order_id: orderId } : {}),
        }),
      });

      const data = await res.json() as typeof result;
      setResult(data);
    } catch {
      setResult({ ok: false, error: "Network error. Coba lagi." });
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (!result?.magic_link) return;
    navigator.clipboard.writeText(result.magic_link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-[#FFF8F0] flex items-center justify-center p-4">
      <div className="w-full max-w-md">

        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-14 h-14 bg-orange-400 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-orange-200">
            <KeyRound size={26} className="text-white" />
          </div>
          <h1 className="text-2xl font-black italic uppercase tracking-tighter text-orange-900">
            Admin — Test User
          </h1>
          <p className="text-[10px] font-bold text-orange-300 uppercase tracking-widest mt-1">
            Buat akun test + token pending tanpa Scalev
          </p>
        </div>

        {/* Form */}
        <div className="bg-white rounded-[2rem] border border-orange-100 shadow-xl shadow-orange-50 p-6 space-y-4">

          <div className="space-y-1.5">
            <label className="text-[10px] font-black uppercase tracking-widest text-orange-300">
              Admin Secret
            </label>
            <input
              type="password"
              value={secret}
              onChange={e => setSecret(e.target.value)}
              placeholder="Isi SCALEV_SIGNING_SECRET kamu"
              className="w-full px-4 py-3 bg-orange-50/40 border-2 border-transparent focus:border-orange-200 rounded-xl outline-none text-sm font-medium text-slate-700 placeholder:text-slate-300"
              required
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-black uppercase tracking-widest text-orange-300">
              Email User
            </label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="contoh@gmail.com"
              className="w-full px-4 py-3 bg-orange-50/40 border-2 border-transparent focus:border-orange-200 rounded-xl outline-none text-sm font-medium text-slate-700 placeholder:text-slate-300"
              required
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-black uppercase tracking-widest text-orange-300">
              Jumlah Token
            </label>
            <div className="flex gap-2">
              {[30, 100, 210].map(n => (
                <button
                  key={n}
                  type="button"
                  onClick={() => setAmount(n)}
                  className={`flex-1 py-3 rounded-xl font-black text-sm transition-all border-2 ${
                    amount === n
                      ? "bg-orange-400 text-white border-orange-400 shadow-md shadow-orange-100"
                      : "bg-white text-slate-400 border-orange-100 hover:border-orange-300"
                  }`}
                >
                  {n}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-black uppercase tracking-widest text-orange-300">
              Order ID <span className="text-slate-300 font-medium normal-case tracking-normal">(opsional — auto jika kosong)</span>
            </label>
            <input
              type="text"
              value={orderId}
              onChange={e => setOrderId(e.target.value)}
              placeholder="TEST-001"
              className="w-full px-4 py-3 bg-orange-50/40 border-2 border-transparent focus:border-orange-200 rounded-xl outline-none text-sm font-medium text-slate-700 placeholder:text-slate-300"
            />
          </div>

          <button
            type="submit"
            onClick={handleSubmit}
            disabled={loading || !email || !secret}
            className="w-full py-4 rounded-full bg-orange-400 text-white font-black italic uppercase tracking-widest shadow-lg shadow-orange-100 hover:bg-orange-500 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100 flex items-center justify-center gap-2"
          >
            {loading ? (
              <><Loader2 size={16} className="animate-spin" /> Memproses...</>
            ) : (
              <><UserPlus size={16} /> Buat User Test</>
            )}
          </button>
        </div>

        {/* Result */}
        {result && (
          <div className={`mt-4 rounded-[1.5rem] border p-5 space-y-4 ${
            result.ok
              ? "bg-white border-emerald-100"
              : "bg-white border-rose-100"
          }`}>
            {result.ok ? (
              <>
                {/* Success info */}
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 bg-emerald-100 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Zap size={16} className="text-emerald-600" />
                  </div>
                  <div>
                    <p className="font-black text-emerald-800 text-sm">
                      {result.is_new_user ? "User baru dibuat!" : "Token ditambahkan ke user lama!"}
                    </p>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      <span className="font-bold">{result.email}</span> — {result.tokens_pending} token pending
                    </p>
                  </div>
                </div>

                {/* Magic link */}
                {result.magic_link ? (
                  <div className="space-y-2">
                    <p className="text-[10px] font-black uppercase tracking-widest text-orange-300">
                      Login Link (berlaku 1 jam)
                    </p>
                    <div className="bg-orange-50 rounded-xl p-3 flex items-center gap-2">
                      <p className="text-[10px] text-slate-500 font-mono flex-1 truncate">
                        {result.magic_link.slice(0, 60)}...
                      </p>
                      <button
                        onClick={handleCopy}
                        className="flex-shrink-0 text-orange-400 hover:text-orange-600"
                      >
                        {copied ? <Check size={14} /> : <Copy size={14} />}
                      </button>
                    </div>
                    <a
                      href={result.magic_link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full py-3 rounded-full bg-emerald-500 hover:bg-emerald-600 text-white font-black text-[11px] uppercase tracking-widest flex items-center justify-center gap-2 transition-all hover:scale-[1.02] active:scale-95"
                    >
                      <LogIn size={14} />
                      Login sebagai {result.email}
                    </a>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 text-slate-400 text-xs">
                    <AlertCircle size={14} />
                    <span>Magic link tidak tersedia. Login manual via /login.</span>
                  </div>
                )}
              </>
            ) : (
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 bg-rose-100 rounded-xl flex items-center justify-center flex-shrink-0">
                  <AlertCircle size={16} className="text-rose-500" />
                </div>
                <div>
                  <p className="font-black text-rose-700 text-sm">Gagal</p>
                  <p className="text-[11px] text-slate-500 mt-0.5">{result.error}</p>
                </div>
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
}
