"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";

interface SubWindowProps {
  open: boolean;
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}

export function SubWindow({ open, title, onClose, children }: SubWindowProps) {
  const [visible, setVisible] = useState(false);
  const [closing, setClosing] = useState(false);

  useEffect(() => {
    if (open) {
      setVisible(true);
      setClosing(false);
    }
  }, [open]);

  const handleClose = () => {
    setClosing(true);
    setTimeout(() => {
      setVisible(false);
      setClosing(false);
      onClose();
    }, 300);
  };

  if (!visible) return null;

  return (
    <div
      className={`fixed inset-0 z-[150] flex items-center md:items-start justify-center p-2 md:p-12 bg-orange-900/10 backdrop-blur-sm transition-opacity duration-300 ${
        closing ? "opacity-0" : "opacity-100"
      }`}
    >
      <div
        className={`bg-white rounded-[2rem] md:rounded-[2.5rem] w-full max-w-3xl overflow-hidden shadow-2xl shadow-orange-100 transition-all duration-300 transform ${
          closing
            ? "translate-y-4 opacity-0"
            : "translate-y-0 opacity-100"
        }`}
      >
        <div className="p-5 md:p-8 border-b border-orange-100 flex justify-between items-center bg-orange-50/50">
          <h3 className="text-lg md:text-2xl font-black italic uppercase tracking-tighter text-orange-900">
            {title}
          </h3>
          <button
            onClick={handleClose}
            className="p-2 md:p-3 bg-white border border-orange-100 rounded-full text-orange-400 hover:text-orange-600 transition-all"
          >
            <X size={20} />
          </button>
        </div>
        <div className="p-5 md:p-8 max-h-[80vh] overflow-y-auto no-scrollbar">
          {children}
        </div>
      </div>
    </div>
  );
}
