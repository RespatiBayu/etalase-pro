"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import {
  ShoppingBag,
  Image as ImageIcon,
  TrendingUp,
  LayoutDashboard,
  Zap,
  LogOut,
  ChevronRight,
  Clock,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { TokenModal } from "@/components/ui/TokenModal";

// ─── Nav Config ───────────────────────────────────────────────────────────────

const NAV_MAIN = [
  {
    href: "/pro",
    label: "Etalase Pro",
    icon: ShoppingBag,
    available: true,
  },
  {
    href: "/editor",
    label: "Foto Editor",
    icon: ImageIcon,
    available: true,
  },
  {
    href: "/history",
    label: "Riwayat",
    icon: Clock,
    available: true,
  },
  {
    href: "/tracker",
    label: "Profit Tracker",
    icon: TrendingUp,
    available: false,
    badge: "Segera",
  },
];

// ─── Component ────────────────────────────────────────────────────────────────

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const supabase = createClient();

  const [tokenBalance, setTokenBalance] = useState<number | null>(null);
  const [userEmail, setUserEmail] = useState("");
  const [showTokenModal, setShowTokenModal] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user?.email) setUserEmail(user.email);
    });
    refreshTokenBalance();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const refreshTokenBalance = () => {
    fetch("/api/tokens/balance")
      .then((r) => r.json())
      .then((d: { tokens?: number }) => setTokenBalance(d.tokens ?? 0))
      .catch(() => {});
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = "/login";
  };

  const allBottomNav = [
    ...NAV_MAIN,
    { href: "/dashboard", label: "Akun", icon: LayoutDashboard, available: true },
  ];

  return (
    <div className="min-h-screen bg-[#FFF8F0]">
      {/* Token Modal */}
      {showTokenModal && (
        <TokenModal
          userEmail={userEmail}
          onClose={() => {
            setShowTokenModal(false);
            refreshTokenBalance();
          }}
        />
      )}

      {/* ─── Desktop Sidebar ──────────────────────────────── */}
      <aside className="hidden md:flex fixed left-0 top-0 h-full w-56 bg-white border-r border-orange-100/80 flex-col z-30 shadow-xl shadow-orange-100/20">
        {/* Logo */}
        <div className="p-4 border-b border-orange-50">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 bg-gradient-to-br from-orange-400 to-amber-300 rounded-xl flex items-center justify-center shadow-md shadow-orange-200 flex-shrink-0">
              <ShoppingBag className="text-white" size={17} />
            </div>
            <div>
              <p className="text-sm font-black italic tracking-tighter uppercase leading-none text-orange-900">
                Etalase Pro
              </p>
              <p className="text-[8px] font-bold text-orange-300 uppercase tracking-widest">
                2.0
              </p>
            </div>
          </div>
        </div>

        {/* Nav Links */}
        <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
          {NAV_MAIN.map((item) => {
            const Icon = item.icon;
            const isActive = pathname.startsWith(item.href);

            if (!item.available) {
              return (
                <div
                  key={item.href}
                  className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl opacity-40 cursor-not-allowed select-none"
                >
                  <Icon size={17} className="text-slate-400 flex-shrink-0" />
                  <span className="text-[13px] font-bold text-slate-400 flex-1 truncate">
                    {item.label}
                  </span>
                  <span className="text-[7px] font-black uppercase tracking-widest bg-slate-100 text-slate-400 px-1.5 py-0.5 rounded-full flex-shrink-0">
                    {item.badge}
                  </span>
                </div>
              );
            }

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl transition-all ${
                  isActive
                    ? "bg-orange-50 text-orange-600 border border-orange-100 shadow-sm"
                    : "text-slate-500 hover:bg-orange-50/60 hover:text-orange-500"
                }`}
              >
                <Icon size={17} className="flex-shrink-0" />
                <span className="text-[13px] font-bold flex-1 truncate">{item.label}</span>
                {isActive && <ChevronRight size={13} className="text-orange-300 flex-shrink-0" />}
              </Link>
            );
          })}

          {/* Divider */}
          <div className="h-px bg-orange-50 !my-2" />

          {/* Dashboard */}
          <Link
            href="/dashboard"
            className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl transition-all ${
              pathname === "/dashboard"
                ? "bg-orange-50 text-orange-600 border border-orange-100 shadow-sm"
                : "text-slate-500 hover:bg-orange-50/60 hover:text-orange-500"
            }`}
          >
            <LayoutDashboard size={17} className="flex-shrink-0" />
            <span className="text-[13px] font-bold flex-1">Dashboard</span>
            {pathname === "/dashboard" && (
              <ChevronRight size={13} className="text-orange-300 flex-shrink-0" />
            )}
          </Link>
        </nav>

        {/* Bottom: Token + Email + Logout */}
        <div className="p-3 border-t border-orange-50 space-y-1.5">
          {/* Token balance */}
          <button
            onClick={() => setShowTokenModal(true)}
            className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl bg-orange-50 hover:bg-orange-100 transition-all border border-orange-100 group"
          >
            <Zap size={17} className="text-orange-400 flex-shrink-0" />
            <div className="flex-1 text-left min-w-0">
              <p className="text-[9px] font-black uppercase tracking-widest text-orange-400 leading-none">
                Token Sisa
              </p>
              <p className="text-sm font-black text-orange-600 leading-tight">
                {tokenBalance === null ? "..." : tokenBalance}
              </p>
            </div>
            <span className="text-[9px] font-black text-orange-500 bg-white border border-orange-200 px-2 py-1 rounded-lg group-hover:bg-orange-400 group-hover:text-white group-hover:border-orange-400 transition-all flex-shrink-0">
              Beli
            </span>
          </button>

          {/* User email */}
          {userEmail && (
            <p className="text-[9px] text-slate-400 font-medium truncate px-1">
              {userEmail}
            </p>
          )}

          {/* Logout */}
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-slate-400 hover:bg-rose-50 hover:text-rose-500 transition-all"
          >
            <LogOut size={17} className="flex-shrink-0" />
            <span className="text-[13px] font-bold">Keluar</span>
          </button>
        </div>
      </aside>

      {/* ─── Main Content ─────────────────────────────────── */}
      <main className="md:ml-56 pb-20 md:pb-0 min-h-screen">
        {children}
      </main>

      {/* ─── Mobile Bottom Nav ────────────────────────────── */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-white border-t border-orange-100 z-30 flex items-center px-1 shadow-lg shadow-orange-100/30">
        {allBottomNav.map((item) => {
          const Icon = item.icon;
          const isActive = pathname.startsWith(item.href);

          if (!item.available) {
            return (
              <div
                key={item.href}
                className="flex-1 flex flex-col items-center justify-center gap-0.5 opacity-30 cursor-not-allowed py-2"
              >
                <Icon size={19} className="text-slate-400" />
                <span className="text-[8px] font-bold text-slate-400">{item.label}</span>
              </div>
            );
          }

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex-1 flex flex-col items-center justify-center gap-0.5 py-2 transition-all ${
                isActive ? "text-orange-500" : "text-slate-400 hover:text-orange-400"
              }`}
            >
              <Icon size={19} />
              <span className="text-[8px] font-bold">{item.label}</span>
            </Link>
          );
        })}

        {/* Token button */}
        <button
          onClick={() => setShowTokenModal(true)}
          className="flex-1 flex flex-col items-center justify-center gap-0.5 py-2 text-orange-400 hover:text-orange-500 transition-all"
        >
          <Zap size={19} />
          <span className="text-[8px] font-bold">
            {tokenBalance === null ? "..." : tokenBalance}
          </span>
        </button>
      </nav>
    </div>
  );
}
