"use client";

import { useState, useEffect, useCallback } from "react";
import { Zap, TrendingDown, TrendingUp, Clock, ShoppingCart, AlertCircle, Gift, Loader2, CheckCircle2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Transaction {
  id: string;
  type: "purchase" | "usage" | "refund" | "bonus";
  amount: number;
  description: string;
  scalev_order_id: string | null;
  created_at: string;
}

interface TokenPackage {
  id: string;
  name: string;
  tokens: number;
  price: number;
  scalev_url: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatRupiah(n: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(n);
}

const TYPE_CONFIG = {
  purchase: { label: "Pembelian", color: "text-emerald-600 bg-emerald-50", icon: TrendingUp },
  usage: { label: "Digunakan", color: "text-orange-600 bg-orange-50", icon: TrendingDown },
  refund: { label: "Refund", color: "text-blue-600 bg-blue-50", icon: TrendingUp },
  bonus: { label: "Bonus", color: "text-purple-600 bg-purple-50", icon: Zap },
} as const;

// ─── Claim Banner Types ───────────────────────────────────────────────────────

interface ClaimCheckResult {
  totalPending: number;
}

interface ClaimResult {
  claimed: number;
  newBalance: number;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function DashboardClient() {
  const supabase = createClient();

  const [balance, setBalance] = useState<number | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [packages, setPackages] = useState<TokenPackage[]>([]);
  const [userEmail, setUserEmail] = useState("");
  const [joinDate, setJoinDate] = useState("");
  const [loading, setLoading] = useState(true);

  // Claim banner state
  const [pendingTokens, setPendingTokens] = useState(0);
  const [isClaiming, setIsClaiming] = useState(false);
  const [claimSuccess, setClaimSuccess] = useState(false);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      // User info
      const { data: { user } } = await supabase.auth.getUser();
      if (user?.email) setUserEmail(user.email);
      if (user?.created_at) {
        setJoinDate(
          new Date(user.created_at).toLocaleDateString("id-ID", {
            day: "numeric",
            month: "long",
            year: "numeric",
          })
        );
      }

      // Token balance
      const balRes = await fetch("/api/tokens/balance");
      const balData = await balRes.json() as { tokens?: number };
      setBalance(balData.tokens ?? 0);

      // Transactions from DB directly (user's own via RLS)
      const { data: txData } = await supabase
        .from("token_transactions")
        .select("id, type, amount, description, scalev_order_id, created_at")
        .order("created_at", { ascending: false })
        .limit(50)
        .returns<Transaction[]>();

      setTransactions(txData ?? []);

      // Packages
      const pkgRes = await fetch("/api/tokens/packages");
      const pkgData = await pkgRes.json() as { packages?: TokenPackage[] };
      setPackages(pkgData.packages ?? []);

      // Check for pending token claims
      const claimRes = await fetch("/api/tokens/claim");
      if (claimRes.ok) {
        const claimData = await claimRes.json() as ClaimCheckResult;
        setPendingTokens(claimData.totalPending ?? 0);
      }
    } finally {
      setLoading(false);
    }
  }, [supabase]);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  const handleClaim = async () => {
    setIsClaiming(true);
    try {
      const res = await fetch("/api/tokens/claim", { method: "POST" });
      if (!res.ok) return;
      const data = await res.json() as ClaimResult;
      if (data.claimed > 0) {
        setBalance(data.newBalance);
        setPendingTokens(0);
        setClaimSuccess(true);
        // Refresh transaction list
        const { data: txData } = await supabase
          .from("token_transactions")
          .select("id, type, amount, description, scalev_order_id, created_at")
          .order("created_at", { ascending: false })
          .limit(50)
          .returns<Transaction[]>();
        setTransactions(txData ?? []);
        // Auto-hide success state after 4 seconds
        setTimeout(() => setClaimSuccess(false), 4000);
      }
    } finally {
      setIsClaiming(false);
    }
  };

  // Stats
  const totalBought = transactions
    .filter((t) => t.type === "purchase" || t.type === "bonus" || t.type === "refund")
    .reduce((sum, t) => sum + t.amount, 0);
  const totalUsed = transactions
    .filter((t) => t.type === "usage")
    .reduce((sum, t) => sum + Math.abs(t.amount), 0);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-orange-200 border-t-orange-400 rounded-full animate-spin" />
          <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 max-w-4xl mx-auto space-y-6">
      {/* Page title */}
      <div>
        <h1 className="text-2xl md:text-3xl font-black italic uppercase tracking-tighter text-orange-900">
          Dashboard
        </h1>
        <p className="text-[10px] font-bold text-orange-300 uppercase tracking-widest mt-0.5">
          {userEmail} · Bergabung {joinDate}
        </p>
      </div>

      {/* Claim banner */}
      {(pendingTokens > 0 || claimSuccess) && (
        <div
          className={`rounded-2xl p-5 shadow-lg transition-all duration-500 ${
            claimSuccess
              ? "bg-gradient-to-r from-emerald-400 to-teal-400"
              : "bg-gradient-to-r from-orange-400 to-amber-400"
          }`}
        >
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0">
                {claimSuccess ? (
                  <CheckCircle2 size={22} className="text-white" />
                ) : (
                  <Gift size={22} className="text-white" />
                )}
              </div>
              <div>
                {claimSuccess ? (
                  <>
                    <p className="text-white font-black text-sm uppercase tracking-tight">
                      Token Berhasil Diklaim!
                    </p>
                    <p className="text-white/80 text-[11px] font-medium mt-0.5">
                      Saldo token kamu sudah diperbarui.
                    </p>
                  </>
                ) : (
                  <>
                    <p className="text-white font-black text-sm uppercase tracking-tight">
                      Kamu punya {pendingTokens} token yang belum diklaim!
                    </p>
                    <p className="text-white/80 text-[11px] font-medium mt-0.5">
                      Klaim sekarang untuk menambahkan ke saldo kamu.
                    </p>
                  </>
                )}
              </div>
            </div>
            {!claimSuccess && (
              <button
                onClick={handleClaim}
                disabled={isClaiming}
                className="flex-shrink-0 bg-white text-orange-500 font-black text-[11px] uppercase tracking-widest px-5 py-2.5 rounded-full shadow-md hover:shadow-lg hover:scale-105 active:scale-95 transition-all disabled:opacity-60 disabled:cursor-not-allowed flex items-center gap-1.5"
              >
                {isClaiming ? (
                  <>
                    <Loader2 size={13} className="animate-spin" />
                    Proses...
                  </>
                ) : (
                  <>
                    <Zap size={13} />
                    Klaim Sekarang
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      )}

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-3 md:gap-4">
        {/* Balance */}
        <div className="bg-white rounded-[1.5rem] border border-orange-100 p-4 md:p-5 shadow-sm shadow-orange-50/50 col-span-3 md:col-span-1">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 bg-orange-100 rounded-xl flex items-center justify-center">
              <Zap size={15} className="text-orange-500" />
            </div>
            <span className="text-[9px] font-black uppercase tracking-widest text-orange-400">
              Token Sisa
            </span>
          </div>
          <p className="text-4xl font-black text-orange-600">{balance}</p>
          <p className="text-[9px] text-slate-400 font-medium mt-1">token tersedia</p>
        </div>

        <div className="bg-white rounded-[1.5rem] border border-orange-100 p-4 md:p-5 shadow-sm shadow-orange-50/50 col-span-3 md:col-span-1">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 bg-emerald-100 rounded-xl flex items-center justify-center">
              <ShoppingCart size={15} className="text-emerald-500" />
            </div>
            <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">
              Total Dibeli
            </span>
          </div>
          <p className="text-4xl font-black text-slate-700">{totalBought}</p>
          <p className="text-[9px] text-slate-400 font-medium mt-1">token all-time</p>
        </div>

        <div className="bg-white rounded-[1.5rem] border border-orange-100 p-4 md:p-5 shadow-sm shadow-orange-50/50 col-span-3 md:col-span-1">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 bg-orange-100 rounded-xl flex items-center justify-center">
              <TrendingDown size={15} className="text-orange-500" />
            </div>
            <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">
              Total Dipakai
            </span>
          </div>
          <p className="text-4xl font-black text-slate-700">{totalUsed}</p>
          <p className="text-[9px] text-slate-400 font-medium mt-1">token digunakan</p>
        </div>
      </div>

      {/* Buy tokens */}
      <div className="bg-white rounded-[1.5rem] border border-orange-100 p-5 md:p-6 shadow-sm shadow-orange-50/50">
        <p className="text-[10px] font-black uppercase tracking-widest text-orange-300 mb-4">
          Isi Token
        </p>

        {/* Persistent claim section — stays visible until claimed */}
        {(pendingTokens > 0 || claimSuccess) && (
          <div className={`rounded-2xl p-4 mb-5 border-2 transition-all duration-500 ${
            claimSuccess
              ? "bg-emerald-50 border-emerald-200"
              : "bg-amber-50 border-amber-200"
          }`}>
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                  claimSuccess ? "bg-emerald-100" : "bg-amber-100"
                }`}>
                  {claimSuccess
                    ? <CheckCircle2 size={20} className="text-emerald-600" />
                    : <Gift size={20} className="text-amber-600" />
                  }
                </div>
                <div>
                  {claimSuccess ? (
                    <>
                      <p className="text-emerald-800 font-black text-sm uppercase tracking-tight">Token Berhasil Diklaim!</p>
                      <p className="text-emerald-600 text-[10px] font-medium mt-0.5">Saldo kamu sudah diperbarui.</p>
                    </>
                  ) : (
                    <>
                      <p className="text-amber-800 font-black text-sm uppercase tracking-tight">
                        {pendingTokens} Token Menunggu Diklaim
                      </p>
                      <p className="text-amber-600 text-[10px] font-medium mt-0.5">
                        Dari pembelian yang sudah kamu lakukan.
                      </p>
                    </>
                  )}
                </div>
              </div>
              {!claimSuccess && (
                <button
                  onClick={handleClaim}
                  disabled={isClaiming}
                  className="flex-shrink-0 bg-amber-400 hover:bg-amber-500 text-white font-black text-[10px] uppercase tracking-widest px-4 py-2.5 rounded-full shadow-md hover:scale-105 active:scale-95 transition-all disabled:opacity-60 disabled:cursor-not-allowed flex items-center gap-1.5"
                >
                  {isClaiming ? (
                    <><Loader2 size={12} className="animate-spin" /> Proses...</>
                  ) : (
                    <><Zap size={12} /> Klaim Token</>
                  )}
                </button>
              )}
            </div>
          </div>
        )}

        {packages.length === 0 ? (
          <div className="flex items-center gap-2 text-slate-400 text-sm">
            <AlertCircle size={16} />
            <span>Paket tidak tersedia</span>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {packages.map((pkg, idx) => (
              <a
                key={pkg.id}
                href={pkg.scalev_url}
                target="_blank"
                rel="noopener noreferrer"
                className={`block p-4 rounded-2xl border-2 transition-all hover:scale-[1.02] active:scale-95 group ${
                  idx === 1
                    ? "border-orange-400 bg-orange-50 shadow-lg shadow-orange-100"
                    : "border-orange-100 bg-white hover:border-orange-300"
                }`}
              >
                {idx === 1 && (
                  <span className="text-[8px] font-black uppercase tracking-widest bg-orange-400 text-white px-2 py-0.5 rounded-full mb-2 inline-block">
                    Terpopuler
                  </span>
                )}
                <p className="font-black text-sm text-orange-900 mt-1">{pkg.name}</p>
                <p className="text-2xl font-black text-orange-600 mt-1">
                  {pkg.tokens}
                  <span className="text-sm font-bold text-orange-400 ml-1">token</span>
                </p>
                <p className="text-xs font-bold text-slate-500 mt-1">
                  {formatRupiah(pkg.price)}
                </p>
                <p className="text-[9px] text-slate-400 mt-0.5">
                  ≈ {formatRupiah(Math.round(pkg.price / pkg.tokens))}/token
                </p>
                <div className="mt-3 w-full py-2 rounded-xl bg-orange-400 text-white text-[10px] font-black uppercase tracking-widest text-center group-hover:bg-orange-500 transition-colors">
                  Beli Sekarang
                </div>
              </a>
            ))}
          </div>
        )}
        <p className="text-[9px] text-slate-400 mt-3 text-center">
          Pembayaran melalui Scalev · Token otomatis ditambahkan setelah pembayaran berhasil
        </p>
      </div>

      {/* Transaction history */}
      <div className="bg-white rounded-[1.5rem] border border-orange-100 shadow-sm shadow-orange-50/50 overflow-hidden">
        <div className="p-5 border-b border-orange-50">
          <p className="text-[10px] font-black uppercase tracking-widest text-orange-300">
            Riwayat Transaksi
          </p>
        </div>

        {transactions.length === 0 ? (
          <div className="p-8 text-center">
            <Clock size={32} className="text-orange-200 mx-auto mb-3" />
            <p className="text-sm font-bold text-slate-400">Belum ada transaksi</p>
          </div>
        ) : (
          <div className="divide-y divide-orange-50">
            {transactions.map((tx) => {
              const cfg = TYPE_CONFIG[tx.type] ?? TYPE_CONFIG.usage;
              const Icon = cfg.icon;
              const isCredit = tx.amount > 0;

              return (
                <div key={tx.id} className="flex items-center gap-3 p-4 hover:bg-orange-50/30 transition-colors">
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${cfg.color}`}>
                    <Icon size={15} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-slate-700 truncate">{tx.description}</p>
                    <p className="text-[10px] text-slate-400 font-medium flex items-center gap-1">
                      <Clock size={9} />
                      {formatDate(tx.created_at)}
                    </p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className={`text-sm font-black ${isCredit ? "text-emerald-600" : "text-orange-500"}`}>
                      {isCredit ? "+" : ""}{tx.amount}
                    </p>
                    <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">
                      {cfg.label}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
