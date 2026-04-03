"use client";

interface ProgressOverlayProps {
  progress: number;
  waitingForQuota: boolean;
  uploadedImage: string | null;
}

function getProgressMessage(progress: number, waitingForQuota: boolean): string {
  if (waitingForQuota) return "Menunggu kuota API... (Sabar ya)";
  if (progress <= 16) return "nyari angel paling cakep";
  if (progress <= 33) return "ngasih lighting ala studio";
  if (progress <= 50) return "nambahin ornament estetik";
  if (progress <= 66) return "dikit lagi beres nih";
  if (progress <= 82) return "nyari finishing touch biar makin ok";
  return "sipp udah mau jadi";
}

export function ProgressOverlay({
  progress,
  waitingForQuota,
  uploadedImage,
}: ProgressOverlayProps) {
  return (
    <div className="w-full max-w-sm md:max-w-md space-y-8 md:space-y-12 py-10 mx-auto">
      {/* Scanning animation */}
      <div className="relative w-64 h-64 md:w-80 md:h-80 mx-auto bg-orange-100/50 rounded-[2.5rem] md:rounded-[3rem] overflow-hidden border-4 md:border-8 border-white shadow-2xl shadow-orange-100">
        {uploadedImage && (
          <img
            src={uploadedImage}
            alt="Scanning"
            className="w-full h-full object-cover opacity-40 grayscale blur-[1px]"
          />
        )}
        <div className="absolute inset-x-0 h-1 bg-orange-400 shadow-[0_0_30px_4px_rgba(251,146,60,0.6)] z-20 animate-scan" />
      </div>

      {/* Progress info */}
      <div className="space-y-4 md:space-y-6">
        <div className="flex justify-between text-[8px] md:text-[10px] font-black uppercase tracking-widest text-orange-300 px-2 md:px-4">
          <span>{getProgressMessage(progress, waitingForQuota)}</span>
          <span>{Math.round(progress)}%</span>
        </div>
        <div className="h-2 md:h-4 w-full bg-slate-100 rounded-full overflow-hidden p-0.5 md:p-1 shadow-inner">
          <div
            className="h-full bg-gradient-to-r from-orange-400 to-amber-300 rounded-full transition-all duration-700 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
        <p className="text-[9px] md:text-[11px] font-bold uppercase tracking-tight text-rose-400 animate-blink px-4 text-center">
          Device tetap menyala dan tidak keluar dari aplikasi saat proses generate
        </p>
      </div>
    </div>
  );
}
