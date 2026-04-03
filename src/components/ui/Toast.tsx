"use client";

import { useEffect, useState } from "react";
import { CheckCircle2, XCircle, AlertCircle, X } from "lucide-react";

export type ToastType = "success" | "error" | "warning";

export interface ToastMessage {
  id: string;
  type: ToastType;
  message: string;
}

interface ToastItemProps {
  toast: ToastMessage;
  onDismiss: (id: string) => void;
}

function ToastItem({ toast, onDismiss }: ToastItemProps) {
  useEffect(() => {
    const timer = setTimeout(() => onDismiss(toast.id), 4000);
    return () => clearTimeout(timer);
  }, [toast.id, onDismiss]);

  const styles: Record<ToastType, string> = {
    success: "bg-emerald-50 border-emerald-200 text-emerald-800",
    error: "bg-rose-50 border-rose-200 text-rose-800",
    warning: "bg-amber-50 border-amber-200 text-amber-800",
  };

  const Icon =
    toast.type === "success"
      ? CheckCircle2
      : toast.type === "error"
        ? XCircle
        : AlertCircle;

  const iconColor =
    toast.type === "success"
      ? "text-emerald-500"
      : toast.type === "error"
        ? "text-rose-500"
        : "text-amber-500";

  return (
    <div
      className={`flex items-start gap-3 p-4 rounded-2xl border shadow-lg max-w-sm w-full animate-in slide-in-from-right-4 duration-300 ${styles[toast.type]}`}
    >
      <Icon size={18} className={`mt-0.5 shrink-0 ${iconColor}`} />
      <p className="text-sm font-medium flex-1 leading-relaxed">{toast.message}</p>
      <button
        onClick={() => onDismiss(toast.id)}
        className="shrink-0 opacity-50 hover:opacity-100 transition-opacity"
      >
        <X size={14} />
      </button>
    </div>
  );
}

interface ToastContainerProps {
  toasts: ToastMessage[];
  onDismiss: (id: string) => void;
}

export function ToastContainer({ toasts, onDismiss }: ToastContainerProps) {
  if (toasts.length === 0) return null;
  return (
    <div className="fixed bottom-6 right-4 z-[300] flex flex-col gap-2 items-end">
      {toasts.map((t) => (
        <ToastItem key={t.id} toast={t} onDismiss={onDismiss} />
      ))}
    </div>
  );
}

// Hook
export function useToast() {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const addToast = (message: string, type: ToastType = "error") => {
    const id = Math.random().toString(36).slice(2);
    setToasts((prev) => [...prev, { id, type, message }]);
  };

  const dismiss = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  return { toasts, addToast, dismiss };
}
