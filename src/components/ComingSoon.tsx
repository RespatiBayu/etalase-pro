"use client";

import { Clock, Check } from "lucide-react";

interface ComingSoonProps {
  title: string;
  description: string;
  eta: string;
  features: string[];
}

export function ComingSoon({ title, description, eta, features }: ComingSoonProps) {
  return (
    <div className="min-h-screen flex items-center justify-center p-6 md:p-12">
      <div className="max-w-lg w-full text-center space-y-8">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 bg-orange-100 text-orange-600 px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest">
          <Clock size={13} />
          Segera Hadir — {eta}
        </div>

        {/* Title */}
        <div className="space-y-3">
          <h1 className="text-4xl md:text-5xl font-black italic uppercase tracking-tighter text-orange-900">
            {title}
          </h1>
          <p className="text-slate-500 text-sm md:text-base leading-relaxed max-w-sm mx-auto">
            {description}
          </p>
        </div>

        {/* Feature list */}
        <div className="bg-white border border-orange-100 rounded-[1.5rem] p-6 shadow-sm shadow-orange-50/50 text-left space-y-3">
          <p className="text-[9px] font-black uppercase tracking-widest text-orange-300 mb-4">
            Yang akan hadir
          </p>
          {features.map((f) => (
            <div key={f} className="flex items-center gap-3">
              <div className="w-5 h-5 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0">
                <Check size={11} className="text-orange-500" />
              </div>
              <span className="text-sm font-medium text-slate-600">{f}</span>
            </div>
          ))}
        </div>

        {/* Illustration */}
        <div className="w-24 h-24 bg-gradient-to-br from-orange-100 to-amber-50 rounded-[2rem] flex items-center justify-center mx-auto border border-orange-100">
          <div className="text-4xl">🚧</div>
        </div>

        <p className="text-[10px] text-slate-400 font-medium">
          Kami sedang membangunnya. Stay tuned!
        </p>
      </div>
    </div>
  );
}
